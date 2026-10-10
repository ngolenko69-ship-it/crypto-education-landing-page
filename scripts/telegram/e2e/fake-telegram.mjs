// A stand-in for api.telegram.org: records every call and answers like the real Bot API.
import http from "node:http"

export function startFakeTelegram({ token, port }) {
  const state = {
    calls: [],
    members: {}, // user_id -> { status, is_member }
    botId: 999,
    botStatus: "administrator",
    failures: {}, // method -> [ { status, body } ]  (consumed one per call)
    webhook: { url: "", pending_update_count: 0, allowed_updates: [] },
    commands: [],
    slowMs: 0,
  }
  const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)) }
  const server = http.createServer(async (req, res) => {
    let raw = ""
    for await (const chunk of req) raw += chunk
    const url = new URL(req.url, "http://x")
    if (url.pathname === "/__state") return json(res, 200, state)
    if (url.pathname === "/__reset") { state.calls.length = 0; state.members = {}; state.failures = {}; state.botStatus = "administrator"; state.slowMs = 0; return json(res, 200, { ok: true }) }
    if (url.pathname === "/__set") { Object.assign(state, JSON.parse(raw || "{}")); return json(res, 200, { ok: true }) }

    const match = /^\/bot([^/]+)\/(\w+)$/.exec(url.pathname)
    if (!match) return json(res, 404, { ok: false, error_code: 404, description: "Not Found" })
    const [, sentToken, method] = match
    if (sentToken !== token) return json(res, 401, { ok: false, error_code: 401, description: "Unauthorized" })
    const params = raw ? JSON.parse(raw) : {}
    state.calls.push({ method, params, at: Date.now() })
    if (state.slowMs) await new Promise((r) => setTimeout(r, state.slowMs))

    const queued = state.failures[method]?.shift()
    if (queued) return json(res, queued.status, queued.body)

    switch (method) {
      case "getMe": return json(res, 200, { ok: true, result: { id: state.botId, is_bot: true, first_name: "Ruta", username: "RutaCriptoSeguraBot" } })
      case "getChatMember": {
        if (params.chat_id !== "@rutacriptosegura") return json(res, 400, { ok: false, error_code: 400, description: "Bad Request: chat not found" })
        if (params.user_id === state.botId) return json(res, 200, { ok: true, result: { status: state.botStatus } })
        return json(res, 200, { ok: true, result: state.members[params.user_id] ?? { status: "left" } })
      }
      case "sendMessage": case "sendDocument": case "answerCallbackQuery": return json(res, 200, { ok: true, result: true })
      case "setWebhook": state.webhook = { url: params.url, secret_token: params.secret_token, pending_update_count: 0, allowed_updates: params.allowed_updates ?? [] }; return json(res, 200, { ok: true, result: true })
      case "deleteWebhook": state.webhook = { url: "", pending_update_count: 0, allowed_updates: [] }; return json(res, 200, { ok: true, result: true })
      case "getWebhookInfo": return json(res, 200, { ok: true, result: { url: state.webhook.url, pending_update_count: state.webhook.pending_update_count, allowed_updates: state.webhook.allowed_updates } })
      case "setMyCommands": state.commands = params.commands; return json(res, 200, { ok: true, result: true })
      case "getMyCommands": return json(res, 200, { ok: true, result: state.commands })
      default: return json(res, 404, { ok: false, error_code: 404, description: "Not Found: method not found" })
    }
  })
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ state, close: () => new Promise((r) => server.close(r)) })))
}
