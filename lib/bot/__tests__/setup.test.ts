import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { loadConfig } from "../config"
import {
  checkSetup,
  connectTelegram,
  describeWebhook,
  isSetupEnabled,
  knownSecrets,
  loadSetupConfig,
  reportWithoutConfig,
  scrub,
  SETUP_ALLOWED_UPDATES,
  SETUP_COMMANDS,
  SETUP_WEBHOOK_URL,
} from "../setup"
import type { SetupReport } from "../setup-types"
import type { Store } from "../store"
import { REDIS_TOKEN, SECRET, TOKEN, createHarness } from "./helpers"

const KEY = "setup-key-0123456789-abcdefghijkl"
const TOKEN_SECRET_PART = TOKEN.split(":")[1]
const WEBHOOK_OFF = { url: "", pending_update_count: 0 }
const everySecret = [TOKEN, TOKEN_SECRET_PART, SECRET, REDIS_TOKEN, KEY]
const leaks = (value: unknown) => everySecret.filter((secret) => JSON.stringify(value).includes(secret))
const item = (report: SetupReport, id: string) => report.items.find((entry) => entry.id === id)

/** A store whose given methods fail, like a Redis that is down or that only accepts reads. */
function breakStore(store: Store, ...methods: Array<keyof Store>): Store {
  const broken = { ...store } as Record<string, unknown>
  for (const method of methods) broken[method] = async () => { throw new Error("store down") }
  return broken as unknown as Store
}

describe("the switch and the key", () => {
  it("is off unless TELEGRAM_SETUP_ENABLED is exactly true — even when a good key exists", () => {
    for (const value of [undefined, "", "false", "0", "1", "yes", "on", "enabled", "tru", "true!"]) {
      assert.deepEqual(loadSetupConfig({ TELEGRAM_SETUP_ENABLED: value, TELEGRAM_SETUP_SECRET: KEY }), { state: "disabled" }, `value ${value}`)
    }
    assert.equal(isSetupEnabled({ TELEGRAM_SETUP_ENABLED: "true" }), true)
    assert.equal(isSetupEnabled({ TELEGRAM_SETUP_ENABLED: " TRUE " }), true)
  })

  it("needs a key of 24-128 visible characters, otherwise it stays unusable", () => {
    const enabled = { TELEGRAM_SETUP_ENABLED: "true" }
    assert.deepEqual(loadSetupConfig({ ...enabled }), { state: "misconfigured" })
    assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: "x".repeat(23) }), { state: "misconfigured" })
    assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: `${"x".repeat(12)} ${"y".repeat(12)}` }), { state: "misconfigured" })
    assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: "x".repeat(129) }), { state: "misconfigured" })
    assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: "x".repeat(24) }), { state: "ready", key: "x".repeat(24) })
    assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: `  ${KEY}\n` }), { state: "ready", key: KEY })
  })

  it("accepts the 43-character key the page generates in the browser (32 random bytes, base64url)", () => {
    const enabled = { TELEGRAM_SETUP_ENABLED: "true" }
    for (let i = 0; i < 50; i++) {
      const key = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
      assert.equal(key.length, 43)
      assert.deepEqual(loadSetupConfig({ ...enabled, TELEGRAM_SETUP_SECRET: key }), { state: "ready", key })
    }
  })

  it("refuses a key that is also the bot token, the webhook secret or a Redis token", () => {
    const enabled = { TELEGRAM_SETUP_ENABLED: "true" }
    const others = { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_WEBHOOK_SECRET: SECRET, KV_REST_API_TOKEN: REDIS_TOKEN, KV_REST_API_READ_ONLY_TOKEN: "read-only-token-0123456789abc" }
    for (const reused of [SECRET, REDIS_TOKEN, "read-only-token-0123456789abc"]) {
      assert.deepEqual(loadSetupConfig({ ...enabled, ...others, TELEGRAM_SETUP_SECRET: reused }), { state: "misconfigured" })
    }
    assert.deepEqual(loadSetupConfig({ ...enabled, ...others, TELEGRAM_SETUP_SECRET: KEY }), { state: "ready", key: KEY })
  })

  it("collects every secret the process holds, including the secret half of the bot token", () => {
    const secrets = knownSecrets({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_WEBHOOK_SECRET: SECRET, KV_REST_API_TOKEN: REDIS_TOKEN, TELEGRAM_SETUP_SECRET: KEY, TELEGRAM_ADMIN_USER_IDS: "1,2" })
    for (const secret of everySecret) assert.ok(secrets.includes(secret), `missing ${secret.slice(0, 6)}…`)
    assert.equal(secrets.includes("1,2"), false)
    assert.deepEqual(knownSecrets({}), [])
  })

  it("scrubs known secrets out of any text", () => {
    assert.equal(scrub(`a ${SECRET} b ${TOKEN} c`, [SECRET, TOKEN]), "a [скрыто] b [скрыто] c")
  })
})

describe("what the page may ever set", () => {
  it("is the production webhook address, the two event types and the four commands", () => {
    assert.equal(SETUP_WEBHOOK_URL, "https://crypto-education-landing-page.vercel.app/api/telegram/webhook")
    assert.deepEqual([...SETUP_ALLOWED_UPDATES], ["message", "callback_query"])
    assert.deepEqual(
      SETUP_COMMANDS.map((command) => command.command),
      ["start", "guia", "ayuda", "canal"],
    )
  })
})

describe("webhook state", () => {
  it("tells apart: not set, set as intended, set with other events, set to another address", () => {
    assert.equal(describeWebhook(WEBHOOK_OFF).state, "not_set")
    assert.equal(describeWebhook(WEBHOOK_OFF).item.state, "info")
    const right = { url: SETUP_WEBHOOK_URL, pending_update_count: 2, allowed_updates: ["callback_query", "message"] }
    assert.equal(describeWebhook(right).state, "ok")
    assert.equal(describeWebhook(right).item.state, "ok")
    assert.equal(describeWebhook({ ...right, allowed_updates: ["message"] }).state, "needs_update")
    assert.equal(describeWebhook({ ...right, allowed_updates: undefined }).state, "needs_update")
    assert.equal(describeWebhook({ ...right, url: `${SETUP_WEBHOOK_URL}/` }).state, "different")
  })

  it("never shows another address, which could carry a secret in its query string", () => {
    const foreign = describeWebhook({ url: "https://evil.example/hook?token=abc123SECRET", pending_update_count: 0 })
    assert.equal(foreign.state, "different")
    assert.ok(!JSON.stringify(foreign.item).includes("evil.example") && !JSON.stringify(foreign.item).includes("abc123SECRET"))
  })

  it("flags a delivery error of a correct webhook as a warning and scrubs it", () => {
    const described = describeWebhook({ url: SETUP_WEBHOOK_URL, pending_update_count: 0, allowed_updates: ["message", "callback_query"], last_error_message: `Wrong response: 401 ${SECRET}`, last_error_date: 1_760_000_000 }, [SECRET])
    assert.equal(described.state, "ok")
    assert.equal(described.item.state, "warn")
    assert.ok(!JSON.stringify(described.item).includes(SECRET))
  })
})

describe("the check", () => {
  it("passes on a healthy deployment, changes nothing and leaks nothing", async () => {
    const h = createHarness({ admins: [] })
    h.fake.state.webhook = { ...WEBHOOK_OFF }
    const report = await checkSetup(h.deps)

    assert.equal(report.canConnect, true)
    assert.equal(report.connected, false)
    assert.deepEqual(report.items.map((entry) => [entry.id, entry.state]), [["env", "ok"], ["bot", "ok"], ["channel", "ok"], ["redis", "ok"], ["webhook", "info"], ["guide", "info"], ["admins", "info"]])
    assert.deepEqual(leaks(report), [])
    // Read-only towards Telegram: no webhook, no commands, no message.
    assert.deepEqual([...new Set(h.fake.calls.map((call) => call.method))].sort(), ["getChatMember", "getMe", "getWebhookInfo"])
    // The Redis probe cleans up after itself.
    assert.deepEqual(Object.keys(h.store.dump()), [])
  })

  it("does not let a missing PDF or missing administrators block the first connection", async () => {
    const h = createHarness({ admins: [] })
    const report = await checkSetup(h.deps)
    assert.equal(item(report, "guide")?.state, "info")
    assert.equal(item(report, "admins")?.state, "info")
    assert.equal(report.canConnect, true)
    await h.withGuide()
    assert.equal(item(await checkSetup(h.deps), "guide")?.state, "ok")
  })

  it("blocks when the bot is not an administrator of the channel", async () => {
    for (const status of ["member", "left", "kicked", "restricted"] as const) {
      const h = createHarness()
      h.fake.state.botStatus = status
      const report = await checkSetup(h.deps)
      assert.equal(item(report, "channel")?.state, "fail", status)
      assert.equal(report.canConnect, false, status)
    }
    const h = createHarness()
    h.fake.state.botStatus = "creator"
    assert.equal((await checkSetup(h.deps)).canConnect, true)
  })

  it("blocks and skips the rest when Telegram rejects the token", async () => {
    const h = createHarness()
    h.fake.failNext("getMe", "unauthorized", "Unauthorized", 401)
    const report = await checkSetup(h.deps)
    assert.equal(item(report, "bot")?.state, "fail")
    assert.match(item(report, "bot")?.summary ?? "", /TELEGRAM_BOT_TOKEN/)
    assert.equal(item(report, "channel")?.state, "skipped")
    assert.equal(item(report, "webhook")?.state, "skipped")
    assert.equal(report.canConnect, false)
    assert.equal(h.fake.of("getChatMember").length, 0)
  })

  it("refuses a token that belongs to a different bot", async () => {
    const h = createHarness()
    h.fake.state.botUsername = "SomeOtherBot"
    const report = await checkSetup(h.deps)
    assert.equal(item(report, "bot")?.state, "fail")
    assert.match(item(report, "bot")?.summary ?? "", /другому боту \(@SomeOtherBot\)/)
    assert.equal(report.canConnect, false)
    assert.equal(h.fake.of("getChatMember").length, 0)
    // The comparison is not case sensitive: Telegram usernames are not.
    h.fake.state.botUsername = "rutacriptosegurabot"
    assert.equal((await checkSetup(h.deps)).canConnect, true)
  })

  it("explains a channel Telegram cannot find", async () => {
    const h = createHarness()
    h.fake.failNext("getChatMember", "chat_not_found", "Bad Request: chat not found")
    const report = await checkSetup(h.deps)
    assert.equal(item(report, "channel")?.state, "fail")
    assert.match(item(report, "channel")?.summary ?? "", /Канал не найден/)
    assert.equal(report.canConnect, false)
  })

  it("blocks when Redis is down, and also when it accepts reads but not writes", async () => {
    const down = createHarness()
    down.deps.store = breakStore(down.store, "set", "get", "del", "ping")
    const downReport = await checkSetup(down.deps)
    assert.equal(item(downReport, "redis")?.state, "fail")
    assert.equal(item(downReport, "guide")?.state, "skipped")
    assert.equal(downReport.canConnect, false)

    // A read-only token passes PING; only a real write exposes it.
    const readOnly = createHarness()
    readOnly.deps.store = breakStore(readOnly.store, "set")
    assert.equal(await readOnly.deps.store.ping(), true)
    const readOnlyReport = await checkSetup(readOnly.deps)
    assert.equal(item(readOnlyReport, "redis")?.state, "fail")
    assert.match(item(readOnlyReport, "redis")?.summary ?? "", /только для чтения/)
    assert.equal(readOnlyReport.canConnect, false)
  })

  it("only warns when it cannot read the webhook state", async () => {
    const h = createHarness()
    h.fake.failNext("getWebhookInfo", "network", "network error", 0)
    const report = await checkSetup(h.deps)
    assert.equal(item(report, "webhook")?.state, "warn")
    assert.equal(report.canConnect, true)
  })

  it("reports a webhook that is already connected as connected", async () => {
    const h = createHarness()
    h.fake.state.webhook = { url: SETUP_WEBHOOK_URL, pending_update_count: 0, allowed_updates: ["message", "callback_query"] }
    const report = await checkSetup(h.deps)
    assert.equal(report.connected, true)
    assert.equal(item(report, "webhook")?.state, "ok")
  })

  it("reports missing and malformed variables by name only, and calls nobody", () => {
    const empty = loadConfig({})
    assert.equal(empty.ok, false)
    if (empty.ok) return
    const report = reportWithoutConfig(empty)
    assert.equal(item(report, "env")?.state, "fail")
    assert.deepEqual(item(report, "env")?.details, ["TELEGRAM_BOT_TOKEN — нет", "TELEGRAM_WEBHOOK_SECRET — нет", "KV_REST_API_URL — нет", "KV_REST_API_TOKEN — нет"])
    assert.deepEqual(report.items.slice(1).map((entry) => entry.state), ["skipped", "skipped", "skipped", "skipped"])
    assert.equal(report.canConnect, false)

    const bad = loadConfig({ TELEGRAM_BOT_TOKEN: "not-a-token-value", TELEGRAM_WEBHOOK_SECRET: SECRET, KV_REST_API_URL: "http://example.com", KV_REST_API_TOKEN: REDIS_TOKEN })
    assert.equal(bad.ok, false)
    if (bad.ok) return
    const badReport = reportWithoutConfig(bad)
    assert.deepEqual(item(badReport, "env")?.details, ["TELEGRAM_BOT_TOKEN — неверный формат", "TELEGRAM_WEBHOOK_SECRET — есть", "KV_REST_API_URL — неверный формат", "KV_REST_API_TOKEN — есть"])
    assert.ok(!JSON.stringify(badReport).includes("not-a-token-value") && !JSON.stringify(badReport).includes("example.com") && !JSON.stringify(badReport).includes(SECRET))
  })
})

describe("the connection", () => {
  it("sets the commands, then the webhook with the existing secret, and reads the result back", async () => {
    const h = createHarness()
    h.fake.state.webhook = { ...WEBHOOK_OFF }
    const result = await connectTelegram(h.deps)

    assert.equal(result.status, "connected")
    if (result.status !== "connected") return
    assert.deepEqual(result.steps, [{ id: "commands", title: "Меню команд бота задано", ok: true }, { id: "webhook", title: "Webhook подключён", ok: true }])
    assert.equal(result.report.connected, true)
    assert.equal(item(result.report, "webhook")?.state, "ok")

    const methods = h.fake.calls.map((call) => call.method)
    assert.ok(methods.indexOf("setMyCommands") !== -1 && methods.indexOf("setMyCommands") < methods.indexOf("setWebhook"), methods.join(","))
    assert.equal(h.fake.of("setWebhook").length, 1)
    assert.deepEqual(h.fake.of("setMyCommands")[0].args[0], SETUP_COMMANDS)
    assert.deepEqual(h.fake.of("setWebhook")[0].args[0], {
      url: "https://crypto-education-landing-page.vercel.app/api/telegram/webhook",
      secretToken: SECRET,
      allowedUpdates: ["message", "callback_query"],
      maxConnections: 10,
    })
    assert.deepEqual(leaks(result), [])
  })

  it("changes nothing when a check fails", async () => {
    const wrongRole = createHarness()
    wrongRole.fake.state.botStatus = "member"
    const blocked = await connectTelegram(wrongRole.deps)
    assert.equal(blocked.status, "blocked")
    assert.equal(wrongRole.fake.of("setWebhook").length + wrongRole.fake.of("setMyCommands").length, 0)

    const redisDown = createHarness()
    redisDown.deps.store = breakStore(redisDown.store, "set")
    assert.equal((await connectTelegram(redisDown.deps)).status, "blocked")
    assert.equal(redisDown.fake.of("setWebhook").length, 0)

    const wrongBot = createHarness()
    wrongBot.fake.state.botUsername = "SomeOtherBot"
    assert.equal((await connectTelegram(wrongBot.deps)).status, "blocked")
    assert.equal(wrongBot.fake.of("setWebhook").length + wrongBot.fake.of("setMyCommands").length, 0)
  })

  it("stops before the webhook if the command menu is refused", async () => {
    const h = createHarness()
    h.fake.failNext("setMyCommands", "bad_request", "Bad Request: command description is too long")
    const result = await connectTelegram(h.deps)
    assert.equal(result.status, "failed")
    if (result.status !== "failed") return
    assert.deepEqual(result.steps, [{ id: "commands", title: "Меню команд бота", ok: false }])
    assert.equal(h.fake.of("setWebhook").length, 0)
    assert.match(result.message, /Меню команд бота: не удалось/)
    assert.match(result.message, /command description is too long/)
  })

  it("reports a refused webhook in plain words, without secrets", async () => {
    const h = createHarness()
    h.fake.failNext("setWebhook", "bad_request", `Bad Request: bad webhook: HTTPS url must be provided for webhook ${SECRET}`)
    const result = await connectTelegram(h.deps)
    assert.equal(result.status, "failed")
    if (result.status !== "failed") return
    assert.equal(result.steps.at(-1)?.ok, false)
    assert.match(result.message, /bad webhook/)
    assert.deepEqual(leaks(result), [])

    const flaky = createHarness()
    flaky.fake.failNext("setWebhook", "network", "network error", 0)
    const network = await connectTelegram(flaky.deps)
    assert.equal(network.status, "failed")
    if (network.status === "failed") assert.match(network.message, /Не удалось связаться с Telegram/)
  })

  it("can be pressed again: the result is the same", async () => {
    const h = createHarness()
    h.fake.state.webhook = { ...WEBHOOK_OFF }
    assert.equal((await connectTelegram(h.deps)).status, "connected")
    assert.equal((await connectTelegram(h.deps)).status, "connected")
    assert.equal(h.fake.state.webhook.url, SETUP_WEBHOOK_URL)
  })

  it("replaces a foreign webhook with the production address", async () => {
    const h = createHarness()
    h.fake.state.webhook = { url: "https://old.example/hook?key=zzz", pending_update_count: 3, allowed_updates: ["message"] }
    const before = await checkSetup(h.deps)
    assert.equal(item(before, "webhook")?.state, "warn")
    assert.equal((await connectTelegram(h.deps)).status, "connected")
    assert.equal(h.fake.state.webhook.url, SETUP_WEBHOOK_URL)
  })
})
