import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { classifyTelegramError, createTelegramApi, TelegramApiError } from "../telegram-api"
import { TOKEN } from "./helpers"

type Request = { url: string; body: Record<string, unknown> }

function fakeFetch(replies: Array<{ status?: number; json?: unknown; text?: string; throws?: Error }>) {
  const requests: Request[] = []
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(url), body: JSON.parse(String(init?.body)) })
    const reply = replies.shift() ?? { json: { ok: true, result: true } }
    if (reply.throws) throw reply.throws
    return new Response(reply.text ?? JSON.stringify(reply.json), { status: reply.status ?? 200 })
  }) as typeof fetch
  return { impl, requests }
}

const make = (replies: Parameters<typeof fakeFetch>[0]) => {
  const { impl, requests } = fakeFetch(replies)
  const sleeps: number[] = []
  const api = createTelegramApi({ token: TOKEN, apiBase: "https://api.telegram.org", fetchImpl: impl, sleep: async (ms) => void sleeps.push(ms) })
  return { api, requests, sleeps }
}

describe("classifyTelegramError", () => {
  const cases: Array<[number, string, string]> = [
    [403, "Forbidden: bot was blocked by the user", "blocked"],
    [403, "Forbidden: user is deactivated", "blocked"],
    [400, "Bad Request: chat not found", "chat_not_found"],
    [400, "Bad Request: not enough rights to get chat member", "not_enough_rights"],
    [403, "Forbidden: bot is not a member of the channel chat", "not_enough_rights"],
    [400, "Bad Request: CHAT_ADMIN_REQUIRED", "not_enough_rights"],
    [400, "Bad Request: wrong file identifier/HTTP URL specified", "bad_file"],
    [400, "Bad Request: wrong remote file identifier specified", "bad_file"],
    [401, "Unauthorized", "unauthorized"],
    [429, "Too Many Requests: retry after 5", "rate_limited"],
    [502, "Bad Gateway", "server"],
    [400, "Bad Request: something else", "bad_request"],
    [418, "I'm a teapot", "other"],
  ]
  for (const [code, description, kind] of cases) {
    it(`${code} "${description}" -> ${kind}`, () => assert.equal(classifyTelegramError(code, description), kind))
  }
})

describe("Telegram client", () => {
  it("posts JSON to the method URL and returns the result", async () => {
    const { api, requests } = make([{ json: { ok: true, result: { status: "member" } } }])
    assert.deepEqual(await api.getChatMember("@rutacriptosegura", 42), { status: "member" })
    assert.equal(requests[0].url, `https://api.telegram.org/bot${TOKEN}/getChatMember`)
    assert.deepEqual(requests[0].body, { chat_id: "@rutacriptosegura", user_id: 42 })
  })

  it("sends messages without link previews and with the keyboard", async () => {
    const { api, requests } = make([{ json: { ok: true, result: {} } }])
    await api.sendMessage(42, "hola", { inline_keyboard: [[{ text: "x", url: "https://t.me/x" }]] })
    assert.deepEqual(requests[0].body, { chat_id: 42, text: "hola", link_preview_options: { is_disabled: true }, reply_markup: { inline_keyboard: [[{ text: "x", url: "https://t.me/x" }]] } })
  })

  it("sends a document by file_id only", async () => {
    const { api, requests } = make([{ json: { ok: true, result: {} } }])
    await api.sendDocument(42, "FILEID")
    assert.deepEqual(requests[0].body, { chat_id: 42, document: "FILEID" })
  })

  it("turns an error response into a typed error", async () => {
    const { api } = make([{ status: 400, json: { ok: false, error_code: 400, description: "Bad Request: chat not found" } }])
    await assert.rejects(api.getChatMember("@x", 1), (error: unknown) => error instanceof TelegramApiError && error.kind === "chat_not_found" && error.code === 400)
  })

  it("retries once after a short 429 and waits for the time Telegram asked for", async () => {
    const { api, requests, sleeps } = make([{ status: 429, json: { ok: false, error_code: 429, description: "Too Many Requests", parameters: { retry_after: 1 } } }, { json: { ok: true, result: true } }])
    await api.sendMessage(1, "x")
    assert.equal(requests.length, 2)
    assert.deepEqual(sleeps, [1250])
  })

  it("does not wait for a long 429", async () => {
    const { api, requests, sleeps } = make([{ status: 429, json: { ok: false, error_code: 429, description: "Too Many Requests", parameters: { retry_after: 30 } } }])
    await assert.rejects(api.sendMessage(1, "x"), (error: unknown) => error instanceof TelegramApiError && error.kind === "rate_limited" && error.retryAfter === 30)
    assert.equal(requests.length, 1)
    assert.deepEqual(sleeps, [])
  })

  it("retries a read after a network failure but never repeats a send", async () => {
    const read = make([{ throws: new Error("socket hang up") }, { json: { ok: true, result: { status: "left" } } }])
    assert.deepEqual(await read.api.getChatMember("@x", 1), { status: "left" })
    assert.equal(read.requests.length, 2)

    const send = make([{ throws: new Error("socket hang up") }, { json: { ok: true, result: true } }])
    await assert.rejects(send.api.sendMessage(1, "x"), (error: unknown) => error instanceof TelegramApiError && error.kind === "network")
    assert.equal(send.requests.length, 1, "a send that may have reached Telegram must not be repeated")
  })

  it("reports a non-JSON 5xx page as a server error", async () => {
    const { api } = make([{ status: 502, text: "<html>Bad Gateway</html>" }, { status: 502, text: "<html>Bad Gateway</html>" }])
    await assert.rejects(api.getMe(), (error: unknown) => error instanceof TelegramApiError && error.kind === "server")
  })

  it("never lets the token or the URL into an error message", async () => {
    const leaky = new Error(`request to https://api.telegram.org/bot${TOKEN}/sendMessage failed`)
    const { api } = make([{ throws: leaky }])
    await assert.rejects(api.sendMessage(1, "x"), (error: unknown) => {
      assert.ok(error instanceof TelegramApiError)
      assert.equal(error.message, "network error")
      assert.ok(!String(error.stack).includes(TOKEN))
      return true
    })
  })

  it("names a timeout as such", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" })
    const { api } = make([{ throws: timeout }])
    await assert.rejects(api.answerCallbackQuery("id"), (error: unknown) => error instanceof TelegramApiError && error.message === "request timed out")
  })
})
