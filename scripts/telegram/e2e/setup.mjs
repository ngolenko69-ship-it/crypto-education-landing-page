// Сквозная проверка страницы /telegram-setup и маршрута /api/telegram/setup на НАСТОЯЩЕЙ сборке (next start)
// без интернета и без ваших секретов: вместо Telegram и Upstash — локальные двойники, а все токены и ключи ниже выдуманы.
//
//   pnpm build && node scripts/telegram/e2e/setup.mjs        (или: pnpm build && pnpm run test:bot:e2e)
//
// Занимает порты 3102–3106 (сайт в пяти конфигурациях), 4012 (фальшивый Telegram), 4013 (фальшивый Redis).
// End-to-end: the real production build in five configurations + fake Telegram Bot API + fake Upstash Redis.
import { spawn } from "node:child_process"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { startFakeTelegram } from "./fake-telegram.mjs"
import { startFakeUpstash } from "./fake-upstash.mjs"

const REPO = fileURLToPath(new URL("../../../", import.meta.url)).replace(/\/$/, "")
const TOKEN = "987654321:FAKE-e2e-setup-token-0000000000"
const WEBHOOK_SECRET = "e2e-setup-webhook-secret-0123456789abcdef"
const REDIS_TOKEN = "e2e-setup-redis-rest-token-0123456789"
const KEY = "E2e-Setup-Key_0123456789abcdefGHIJ"
const WRONG = "E2e-Setup-Key_0123456789abcdefGHIX"
const SECRETS = [TOKEN, TOKEN.split(":")[1], WEBHOOK_SECRET, REDIS_TOKEN, KEY, WRONG]
const PRODUCTION_WEBHOOK = "https://crypto-education-landing-page.vercel.app/api/telegram/webhook"
const PRODUCTION_ORIGIN = "https://crypto-education-landing-page.vercel.app"

const tg = await startFakeTelegram({ token: TOKEN, port: 4012 })
const up = await startFakeUpstash({ token: REDIS_TOKEN, port: 4013 })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const healthy = { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_WEBHOOK_SECRET: WEBHOOK_SECRET, KV_REST_API_URL: "http://127.0.0.1:4013", KV_REST_API_TOKEN: REDIS_TOKEN, UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "", TELEGRAM_API_BASE: "http://127.0.0.1:4012", TELEGRAM_ADMIN_USER_IDS: "", TELEGRAM_SETUP_ENABLED: "true", TELEGRAM_SETUP_SECRET: KEY, VERCEL_ENV: "" }

const servers = []
async function start(port, overrides) {
  let log = ""
  const child = spawn(`${REPO}/node_modules/.bin/next`, ["start", "-p", String(port)], { cwd: REPO, env: { ...process.env, ...healthy, ...overrides } })
  child.stdout.on("data", (d) => (log += d)); child.stderr.on("data", (d) => (log += d))
  for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/`); if (r.ok) break } catch {} await sleep(500) }
  const server = { port, child, url: (path) => `http://127.0.0.1:${port}${path}`, get log() { return log } }
  servers.push(server)
  return server
}

let pass = 0, fail = 0; const failures = []
const ok = (name, cond, detail = "") => { cond ? pass++ : (fail++, failures.push(`${name} ${detail}`)); console.log(`${cond ? "✓" : "✗"} ${name}${!cond && detail ? "  → " + detail : ""}`) }
const leaked = (text) => SECRETS.filter((secret) => String(text).includes(secret))

async function post(server, body, { ip = "203.0.113.10", headers = {}, raw, query = "", type = "application/json" } = {}) {
  const res = await fetch(server.url(`/api/telegram/setup${query}`), { method: "POST", headers: { "content-type": type, "x-forwarded-for": ip, ...headers }, body: raw ?? JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, text, json, headers: res.headers }
}
const reset = () => { tg.state.calls.length = 0; tg.state.botStatus = "administrator"; tg.state.username = "RutaCriptoSeguraBot"; tg.state.failures = {}; tg.state.webhook = { url: "", pending_update_count: 0, allowed_updates: [] }; tg.state.commands = []; up.stats.down = false; up.stats.readOnly = false; up.kv.clear() }
const methods = () => tg.state.calls.map((c) => c.method)
const calls = (method) => tg.state.calls.filter((c) => c.method === method)
const item = (report, id) => report?.items?.find((entry) => entry.id === id)
const READ_ONLY_CALLS = ["getMe", "getChatMember", "getWebhookInfo"]

const on = await start(3102, {})
const off = await start(3103, { TELEGRAM_SETUP_ENABLED: "false" })
const incomplete = await start(3104, { KV_REST_API_URL: "", KV_REST_API_TOKEN: "" })
const weakKey = await start(3105, { TELEGRAM_SETUP_SECRET: "too-short-key" })
const production = await start(3106, { VERCEL_ENV: "production" })

try {
  console.log("\n— 1. Switched off: the page and the route do not exist —")
  reset()
  let res = await fetch(off.url("/telegram-setup")); let html = await res.text()
  ok("page → 404", res.status === 404, String(res.status))
  ok("page does not show the form", !html.includes("Ключ настройки") && !html.includes("Подключить Telegram"))
  for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    res = await fetch(off.url("/api/telegram/setup"), { method }); await res.text()
    ok(`route ${method} → 404`, res.status === 404, String(res.status))
  }
  let r = await post(off, { action: "connect", key: KEY })
  ok("route POST with the right key → 404, nothing done", r.status === 404 && tg.state.calls.length === 0, `${r.status} ${methods()}`)
  ok("a 404 answer says nothing about the setup", !/setup|ключ|telegram/i.test(r.text.replace(/not found/i, "")), r.text.slice(0, 80))

  console.log("\n— 2. The page, switched on —")
  res = await fetch(on.url("/telegram-setup")); html = await res.text()
  ok("page → 200", res.status === 200)
  ok("meta robots noindex, nofollow", /<meta name="robots" content="noindex, nofollow[^"]*"/.test(html), (html.match(/<meta name="robots"[^>]*>/) ?? [""])[0])
  ok("never cached", /no-store|no-cache/.test(res.headers.get("cache-control") ?? ""), res.headers.get("cache-control") ?? "")
  ok("referrer is not sent", /<meta name="referrer" content="no-referrer"/.test(html))
  ok("the form is there", html.includes("Ключ настройки") && html.includes("Проверить подключение") && html.includes("Подключить Telegram"))
  ok("no secret in the page HTML", leaked(html).length === 0)
  const assets = []
  const walk = (dir) => { for (const name of readdirSync(dir)) { const p = join(dir, name); if (statSync(p).isDirectory()) walk(p); else if (/\.(js|css|html|json|txt|map)$/.test(name)) assets.push(p) } }
  walk(join(REPO, ".next", "static"))
  ok("browser files were scanned", assets.length > 5, `${assets.length} files`)
  ok("no secret in any browser JavaScript, CSS or manifest", assets.every((file) => leaked(readFileSync(file, "utf8")).length === 0))
  ok("the site itself still answers", (await fetch(on.url("/"))).status === 200 && (await fetch(on.url("/contacto"))).status === 200)
  let status = (await fetch(on.url("/api/telegram/webhook"), { method: "POST", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": WEBHOOK_SECRET }, body: JSON.stringify({ update_id: 1 }) })).status
  ok("the existing webhook route is unchanged (valid secret → 200)", status === 200, String(status))
  status = (await fetch(on.url("/api/telegram/webhook"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ update_id: 2 }) })).status
  ok("the existing webhook route still refuses a request without the secret", status === 401, String(status))
  reset()

  console.log("\n— 3. The route refuses what it should —")
  res = await fetch(on.url("/api/telegram/setup")); await res.text()
  ok("GET → 405 with Allow: POST", res.status === 405 && res.headers.get("allow") === "POST", `${res.status} ${res.headers.get("allow")}`)
  res = await fetch(on.url("/api/telegram/setup"), { method: "OPTIONS", headers: { origin: "https://evil.example", "access-control-request-method": "POST" } }); await res.text()
  ok("a cross-site preflight gets no CORS permission", res.status === 405 && !res.headers.get("access-control-allow-origin"))
  r = await post(on, { action: "check", key: KEY }, { query: `?key=${KEY}` })
  ok("a query string is refused (400) and not echoed", r.status === 400 && leaked(r.text).length === 0, `${r.status}`)
  r = await post(on, null, { raw: `action=check&key=${KEY}`, type: "application/x-www-form-urlencoded" })
  ok("a form post is refused (400)", r.status === 400)
  r = await post(on, null, { raw: "{not json" }); ok("broken JSON → 400", r.status === 400)
  r = await post(on, { action: "delete", key: KEY }); ok("unknown action → 400 (nothing else can be asked for)", r.status === 400)
  r = await post(on, { action: "check" }); ok("missing key → 400", r.status === 400)
  r = await post(on, { action: "check", key: "x".repeat(300) }); ok("oversized key → 400", r.status === 400)
  r = await post(on, null, { raw: JSON.stringify({ action: "check", key: KEY, pad: "x".repeat(4000) }) }); ok("oversized body → 413", r.status === 413, String(r.status))
  ok("Telegram was not contacted by any of these", tg.state.calls.length === 0, methods().join(","))
  ok("every answer carries noindex, no-store and no-frame headers", [await post(on, { action: "check", key: WRONG })].every((x) => /noindex/.test(x.headers.get("x-robots-tag") ?? "") && /no-store/.test(x.headers.get("cache-control") ?? "") && x.headers.get("x-frame-options") === "DENY"))
  reset()

  console.log("\n— 4. The key —")
  r = await post(on, { action: "check", key: WRONG })
  ok("a wrong key → 401 with a plain message", r.status === 401 && r.json?.error === "unauthorized" && r.json?.message === "Неверный ключ настройки.", `${r.status} ${r.text.slice(0, 100)}`)
  ok("the answer echoes neither key", leaked(r.text).length === 0)
  ok("Telegram untouched after a wrong key", tg.state.calls.length === 0)
  r = await post(on, { action: "check", key: `  ${KEY}  ` })
  ok("the right key (spaces around it are ignored) → 200", r.status === 200 && r.json?.ok === true && r.json?.action === "check", `${r.status}`)
  ok("the check is ready to connect", r.json?.report?.canConnect === true && r.json?.report?.connected === false)
  ok("seven items in a fixed order", JSON.stringify(r.json?.report?.items?.map((x) => x.id)) === JSON.stringify(["env", "bot", "channel", "redis", "webhook", "guide", "admins"]))
  ok("a missing PDF and missing administrators are information, not errors", item(r.json?.report, "guide")?.state === "info" && item(r.json?.report, "admins")?.state === "info")
  ok("the report holds no secret", leaked(r.text).length === 0)
  ok("a check only reads from Telegram", tg.state.calls.length > 0 && methods().every((m) => READ_ONLY_CALLS.includes(m)), methods().join(","))
  ok("the check leaves no probe key behind", Object.keys(Object.fromEntries([...up.kv.entries()])).every((k) => !k.startsWith("setup:probe")))
  reset()

  console.log("\n— 5. Limits on trying keys —")
  const bad = []; for (let i = 0; i < 5; i++) bad.push((await post(on, { action: "check", key: WRONG }, { ip: "198.51.100.1" })).status)
  ok("five wrong keys from one visitor → 401 each", bad.every((s) => s === 401), bad.join(","))
  r = await post(on, { action: "check", key: KEY }, { ip: "198.51.100.1" })
  ok("the sixth try is refused (429) even with the right key", r.status === 429 && r.json?.error === "rate_limited" && r.headers.get("retry-after") === "900", `${r.status} ${r.headers.get("retry-after")}`)
  ok("Telegram untouched while refused", tg.state.calls.length === 0)
  r = await post(on, { action: "check", key: KEY }, { ip: "198.51.100.2" })
  ok("another visitor is not affected", r.status === 200)
  const dump = JSON.stringify([...up.kv.entries()])
  ok("Redis holds counters under hashed names only (no address, no key)", [...up.kv.keys()].some((k) => k.startsWith("su:")) && !dump.includes("198.51.100") && leaked(dump).length === 0)
  reset()
  let statuses = []; for (let i = 0; i < 40; i++) statuses.push((await post(on, { action: "check", key: WRONG }, { ip: `198.51.100.${i + 100}` })).status)
  ok("forty wrong keys from forty visitors → 401 each", statuses.every((s) => s === 401))
  r = await post(on, { action: "check", key: KEY }, { ip: "203.0.113.200" })
  ok("then everybody is refused for a while (429), the right key included", r.status === 429, String(r.status))
  reset()
  r = await post(on, { action: "check", key: KEY }, { ip: "203.0.113.200" })
  ok("once the counters expire the right key works again", r.status === 200)
  reset()

  console.log("\n— 6. A check that fails blocks the connection —")
  tg.state.botStatus = "member"
  r = await post(on, { action: "check", key: KEY })
  ok("bot is only a member → check says so, canConnect false", item(r.json?.report, "channel")?.state === "fail" && r.json?.report?.canConnect === false)
  tg.state.calls.length = 0
  r = await post(on, { action: "connect", key: KEY })
  ok("connect → 409 checks_failed, with the report", r.status === 409 && r.json?.error === "checks_failed" && r.json?.report?.canConnect === false, `${r.status}`)
  ok("nothing was changed in Telegram", !methods().includes("setWebhook") && !methods().includes("setMyCommands") && tg.state.webhook.url === "", methods().join(","))
  reset(); tg.state.username = "SomeOtherBot"
  r = await post(on, { action: "connect", key: KEY })
  ok("a token of another bot is refused, by name", r.status === 409 && /SomeOtherBot/.test(item(r.json?.report, "bot")?.summary ?? "") && !methods().includes("setWebhook"))
  reset(); tg.state.failures.getMe = [{ status: 401, body: { ok: false, error_code: 401, description: "Unauthorized" } }]
  r = await post(on, { action: "check", key: KEY })
  ok("a revoked token → bot fails, the rest is skipped", item(r.json?.report, "bot")?.state === "fail" && item(r.json?.report, "channel")?.state === "skipped" && r.json?.report?.canConnect === false)
  reset(); up.stats.down = true
  r = await post(on, { action: "check", key: KEY })
  ok("Redis down → the page still answers and says so", r.status === 200 && item(r.json?.report, "redis")?.state === "fail" && r.json?.report?.canConnect === false)
  ok("…and connect is blocked", (await post(on, { action: "connect", key: KEY })).status === 409 && !methods().includes("setWebhook"))
  reset(); up.stats.readOnly = true
  r = await post(on, { action: "check", key: KEY })
  ok("a read-only Redis token is recognised (write test fails)", item(r.json?.report, "redis")?.state === "fail" && /только для чтения/.test(item(r.json?.report, "redis")?.summary ?? ""))
  reset()
  r = await post(incomplete, { action: "check", key: KEY })
  ok("missing Redis variables → named, nothing contacted", r.status === 200 && item(r.json?.report, "env")?.state === "fail" && /KV_REST_API_URL — нет/.test((item(r.json?.report, "env")?.details ?? []).join("|")) && tg.state.calls.length === 0)
  ok("…and no value appears in that report", leaked(r.text).length === 0)
  r = await post(incomplete, { action: "connect", key: KEY })
  ok("…and connect is blocked there too", r.status === 409 && tg.state.calls.length === 0)
  r = await post(weakKey, { action: "check", key: KEY })
  ok("a weak setup key → 503 not_configured, nothing contacted", r.status === 503 && r.json?.error === "not_configured" && tg.state.calls.length === 0, `${r.status}`)
  res = await fetch(weakKey.url("/telegram-setup")); html = await res.text()
  ok("…and the page explains it and offers no way in", res.status === 200 && html.includes("TELEGRAM_SETUP_SECRET") && leaked(html).length === 0)

  console.log("\n— 7. Connecting —")
  reset()
  r = await post(on, { action: "connect", key: KEY, url: "https://evil.example/hook", secret_token: "attacker-chosen", allowed_updates: ["inline_query"], drop_pending_updates: true })
  ok("connect → 200 connected", r.status === 200 && r.json?.ok === true && r.json?.action === "connect" && r.json?.report?.connected === true, `${r.status} ${r.text.slice(0, 120)}`)
  ok("both steps reported as done", JSON.stringify(r.json?.steps?.map((s) => [s.id, s.ok])) === JSON.stringify([["commands", true], ["webhook", true]]))
  const hook = calls("setWebhook"); const cmds = calls("setMyCommands")
  ok("exactly one setWebhook and one setMyCommands", hook.length === 1 && cmds.length === 1)
  ok("the menu was set BEFORE the webhook", methods().indexOf("setMyCommands") < methods().indexOf("setWebhook"), methods().join(","))
  ok("webhook address is the fixed production one — the extra field in the request changed nothing", hook[0]?.params.url === PRODUCTION_WEBHOOK, hook[0]?.params.url)
  ok("secret_token is the existing TELEGRAM_WEBHOOK_SECRET", hook[0]?.params.secret_token === WEBHOOK_SECRET)
  ok("allowed events are exactly message + callback_query", JSON.stringify(hook[0]?.params.allowed_updates) === JSON.stringify(["message", "callback_query"]))
  ok("pending updates are kept (not dropped)", hook[0]?.params.drop_pending_updates === false && hook[0]?.params.max_connections === 10)
  ok("the four commands were set", JSON.stringify(cmds[0]?.params.commands.map((c) => c.command)) === JSON.stringify(["start", "guia", "ayuda", "canal"]))
  ok("the answer shows the result without any secret", item(r.json?.report, "webhook")?.state === "ok" && leaked(r.text).length === 0 && !r.text.includes("evil.example"))
  r = await post(on, { action: "check", key: KEY })
  ok("a later check reads it back as connected", r.json?.report?.connected === true && item(r.json?.report, "webhook")?.state === "ok")
  tg.state.calls.length = 0
  r = await post(on, { action: "connect", key: KEY })
  ok("pressing connect again is harmless", r.status === 200 && r.json?.report?.connected === true && tg.state.webhook.url === PRODUCTION_WEBHOOK)
  reset(); tg.state.failures.setWebhook = [{ status: 400, body: { ok: false, error_code: 400, description: "Bad Request: bad webhook: HTTPS url must be provided for webhook" } }]
  r = await post(on, { action: "connect", key: KEY })
  ok("a refused webhook → 502 with Telegram's own sentence", r.status === 502 && r.json?.error === "telegram_error" && /bad webhook/.test(r.json?.message ?? "") && leaked(r.text).length === 0, `${r.status} ${r.json?.message}`)
  ok("…the failing step is marked and the webhook stays off", r.json?.steps?.at(-1)?.ok === false && tg.state.webhook.url === "")
  reset(); tg.state.failures.setMyCommands = [{ status: 400, body: { ok: false, error_code: 400, description: "Bad Request: command description is too long" } }]
  r = await post(on, { action: "connect", key: KEY })
  ok("a refused command menu stops before the webhook", r.status === 502 && !methods().includes("setWebhook") && tg.state.webhook.url === "")

  console.log("\n— 8. In production the page is used from the production address only —")
  reset()
  r = await post(production, { action: "check", key: KEY }, { headers: { origin: "https://evil.example" } })
  ok("a request from another site → 403 before anything else", r.status === 403 && r.json?.error === "cross_site" && tg.state.calls.length === 0, `${r.status}`)
  r = await post(production, { action: "check", key: KEY }, { headers: { origin: PRODUCTION_ORIGIN, "sec-fetch-site": "cross-site" } })
  ok("Sec-Fetch-Site: cross-site → 403", r.status === 403)
  r = await post(production, { action: "check", key: WRONG }, { headers: { origin: PRODUCTION_ORIGIN, "sec-fetch-site": "same-origin" } })
  ok("the production origin passes the origin check (then the key decides: 401)", r.status === 401, String(r.status))
  res = await fetch(production.url("/telegram-setup")); html = await res.text()
  ok("the production page tells the browser which address to use", res.status === 200 && html.includes(PRODUCTION_ORIGIN) && leaked(html).length === 0)

  console.log("\n— 9. What the servers logged —")
  for (const [name, server] of [["main", on], ["incomplete", incomplete], ["production", production]]) {
    ok(`${name}: no secret in the log`, leaked(server.log).length === 0)
    // The startup banner prints this machine's own address ("Network: …"); only the visitors' addresses matter here.
    const addressLine = server.log.split("\n").find((line) => !/^\s*- (Local|Network):/.test(line) && /\b(203\.0\.113|198\.51\.100)\./.test(line))
    ok(`${name}: no visitor address in the log`, !addressLine, (addressLine ?? "").slice(0, 200))
  }
  const events = [...on.log.matchAll(/"evt":"(setup_[a-z_]+)"/g)].map((m) => m[1])
  ok("setup events are logged by name", ["setup_denied", "setup_check", "setup_connect"].every((e) => events.includes(e)), [...new Set(events)].join(","))
  ok("the log never holds a request body or a Telegram description of ours", !on.log.includes("evil.example"))
} finally {
  console.log(`\n=== ${pass} passed, ${fail} failed ===`)
  if (fail) console.log("FAILED:\n - " + failures.join("\n - "))
  for (const server of servers) server.child.kill("SIGKILL")
  await tg.close(); await up.close()
  process.exit(fail ? 1 : 0)
}
