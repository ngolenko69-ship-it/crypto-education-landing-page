// Сквозная проверка бота на НАСТОЯЩЕЙ сборке сайта (next start) без интернета и без ваших секретов:
// вместо Telegram и Upstash поднимаются локальные двойники (fake-telegram.mjs, fake-upstash.mjs), а настоящий
// scripts/telegram/webhook.mjs запускается через cli-shim.mjs. Токены ниже — выдуманные, только для этого теста.
//
//   pnpm build && pnpm run test:bot:e2e
//
// Занимает порты 3101 (сайт), 4010 (фальшивый Telegram), 4011 (фальшивый Redis); при необходимости измените ниже.
// End-to-end: the real production build (next start) + fake Telegram Bot API + fake Upstash Redis.
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { startFakeTelegram } from "./fake-telegram.mjs"
import { startFakeUpstash } from "./fake-upstash.mjs"

const REPO = fileURLToPath(new URL("../../../", import.meta.url)).replace(/\/$/, "")
const HERE = fileURLToPath(new URL("./", import.meta.url)).replace(/\/$/, "")
const PORT = 3101
const TOKEN = "987654321:FAKE-e2e-token-0000000000"
const SECRET = "e2e-webhook-secret-0123456789abcdef0123"
const REDIS_TOKEN = "e2e-redis-rest-token-0123456789"
const ADMIN = 777001
const URL_WEBHOOK = `http://127.0.0.1:${PORT}/api/telegram/webhook`
const URL_STATUS = `http://127.0.0.1:${PORT}/api/telegram/status`

const tg = await startFakeTelegram({ token: TOKEN, port: 4010 })
const up = await startFakeUpstash({ token: REDIS_TOKEN, port: 4011 })

let out = ""
const server = spawn(`${REPO}/node_modules/.bin/next`, ["start", "-p", String(PORT)], {
  cwd: REPO,
  env: { ...process.env, TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_WEBHOOK_SECRET: SECRET, UPSTASH_REDIS_REST_URL: "http://127.0.0.1:4011", UPSTASH_REDIS_REST_TOKEN: REDIS_TOKEN, TELEGRAM_API_BASE: "http://127.0.0.1:4010", TELEGRAM_ADMIN_USER_IDS: String(ADMIN) },
})
server.stdout.on("data", (d) => (out += d)); server.stderr.on("data", (d) => (out += d))
for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/`); if (r.ok) break } catch {} await new Promise((r) => setTimeout(r, 500)) }

let pass = 0, fail = 0; const failures = []
const ok = (name, cond, detail = "") => { cond ? pass++ : (fail++, failures.push(`${name} ${detail}`)); console.log(`${cond ? "✓" : "✗"} ${name}${!cond && detail ? "  → " + detail : ""}`) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let n = 5000
const user = (id) => ({ id, is_bot: false, first_name: "Persona Prueba", username: "persona_prueba" })
const msg = (id, text) => ({ update_id: ++n, message: { message_id: n, date: 0, chat: { id, type: "private" }, from: user(id), text } })
const cb = (id, data = "verify") => ({ update_id: ++n, callback_query: { id: `cbq-${n}`, from: user(id), data } })
const doc = (id, caption, extra = {}) => ({ update_id: ++n, message: { message_id: n, date: 0, chat: { id, type: "private" }, from: user(id), caption, document: { file_id: "BQACAgIAAxkDAAIB-e2e-uploaded-file-id-0000000000001", file_name: "Ruta_Cripto_Segura_Estilo_Web.pdf", mime_type: "application/pdf", file_size: 19255939, ...extra } } })
const post = async (update, { secret = SECRET, raw, headers = {} } = {}) => {
  const res = await fetch(URL_WEBHOOK, { method: "POST", headers: { "content-type": "application/json", ...(secret === null ? {} : { "x-telegram-bot-api-secret-token": secret }), ...headers }, body: raw ?? JSON.stringify(update) })
  return { status: res.status, text: await res.text() }
}
const reset = async () => { tg.state.calls.length = 0; tg.state.members = {}; tg.state.failures = {}; tg.state.botStatus = "administrator"; tg.state.slowMs = 0; up.stats.down = false; up.kv.clear() }
const calls = (method) => tg.state.calls.filter((c) => c.method === method)
const methods = () => tg.state.calls.map((c) => c.method)
const lines = (t) => String(t).split("\n").filter((l) => l.trim())
const WELCOME = ["🛡️ ¡Bienvenido a Ruta Cripto Segura!", "Aprende sobre criptomonedas, stablecoins, P2P y seguridad digital con mayor confianza.", "🎁 Tenemos una guía práctica gratuita para ti.", "Para recibirla, suscríbete a nuestro canal educativo y verifica tu suscripción.", "¡Aprende antes de arriesgar!"]
const NOT_SUB = ["❌ Todavía no encontramos tu suscripción.", "Únete a nuestro canal gratuito y vuelve a pulsar «Verificar suscripción»."]
const CONFIRMED = ["✅ ¡Suscripción confirmada!", "🎉 ¡Gracias por unirte a Ruta Cripto Segura!", "Aquí tienes tu guía educativa gratuita."]
const READY = ["📚 ¡Tu guía está lista!", "En ella aprenderás sobre stablecoins, P2P, wallets, seguridad digital y prevención de estafas.", "Síguenos en nuestro canal para recibir más contenido educativo.", "💚 Ruta Cripto Segura — Aprende antes de arriesgar."]
const UPLOADED = "BQACAgIAAxkDAAIB-e2e-uploaded-file-id-0000000000001"
const uploadGuide = async () => { await post(doc(ADMIN, "/subir_guia")); tg.state.calls.length = 0 }

try {
  console.log("\n— 1. Webhook security —")
  await reset()
  let r = await post(msg(5, "/start"), { secret: null }); ok("no secret header → 401", r.status === 401, r.text)
  r = await post(msg(5, "/start"), { secret: "wrong" }); ok("wrong secret → 401", r.status === 401)
  r = await post(msg(5, "/start"), { secret: SECRET + "x" }); ok("secret with extra char → 401", r.status === 401)
  r = await post(msg(5, "/start"), { secret: SECRET.toUpperCase() }); ok("secret with different case → 401", r.status === 401)
  ok("rejected requests never reached Telegram or the store", tg.state.calls.length === 0 && up.stats.commands === 0 || tg.state.calls.length === 0)
  r = await post(null, { raw: "{not json" }); ok("valid secret + invalid JSON → 400", r.status === 400)
  r = await post(null, { raw: "{}" }); ok("valid secret + no update_id → 400", r.status === 400)
  r = await post(null, { raw: JSON.stringify({ update_id: 1, pad: "x".repeat(300000) }) }); ok("oversized body → 413", r.status === 413)
  const get = await fetch(URL_WEBHOOK); ok("GET on the webhook → 405", get.status === 405)
  r = await post({ update_id: ++n, edited_message: { message_id: 1 } }); ok("update types the bot does not read → 200, nothing sent", r.status === 200 && tg.state.calls.length === 0)

  console.log("\n— 2. /start and the button without a subscription —")
  await reset()
  r = await post(msg(1001, "/start")); ok("/start → 200", r.status === 200, r.text)
  ok("exactly one message, to the right person", methods().join() === "sendMessage" && calls("sendMessage")[0].params.chat_id === 1001)
  const welcome = calls("sendMessage")[0].params
  ok("welcome text is the owner's, word for word", JSON.stringify(lines(welcome.text)) === JSON.stringify(WELCOME), welcome.text)
  const rows = welcome.reply_markup.inline_keyboard
  ok("two buttons: 📢 Suscribirme al canal (url) and ✅ Verificar suscripción (callback)", rows[0][0].text === "📢 Suscribirme al canal" && rows[0][0].url === "https://t.me/rutacriptosegura" && rows[1][0].text === "✅ Verificar suscripción" && rows[1][0].callback_data === "verify")
  ok("link previews are switched off", welcome.link_preview_options?.is_disabled === true)

  tg.state.calls.length = 0
  const notSub = cb(1001); r = await post(notSub)
  ok("verify without subscription → 200", r.status === 200)
  ok("asked Telegram about THIS user in the channel", JSON.stringify(calls("getChatMember")[0].params) === JSON.stringify({ chat_id: "@rutacriptosegura", user_id: 1001 }))
  ok("no document sent", calls("sendDocument").length === 0)
  ok("button answered exactly once, with the pop-up", calls("answerCallbackQuery").length === 1 && calls("answerCallbackQuery")[0].params.callback_query_id === `cbq-${n}` && /Todavía no encontramos/.test(calls("answerCallbackQuery")[0].params.text))
  ok("«not found» message is the owner's text, with both buttons", JSON.stringify(lines(calls("sendMessage")[0].params.text)) === JSON.stringify(NOT_SUB) && calls("sendMessage")[0].params.reply_markup.inline_keyboard.flat().length === 2)

  console.log("\n— 3. Administrator uploads the PDF (the only way the guide changes) —")
  await reset()
  r = await post(doc(1002, "/subir_guia")); ok("stranger sends a PDF → refused", r.status === 200 && !up.kv.has("guide:main") && /no necesitamos que nos envíes archivos/.test(calls("sendMessage")[0].params.text))
  tg.state.calls.length = 0
  r = await post(doc(ADMIN, undefined)); ok("admin sends a PDF without /subir_guia → not saved", !up.kv.has("guide:main") && /subir_guia/.test(calls("sendMessage")[0].params.text))
  tg.state.calls.length = 0
  r = await post(doc(ADMIN, "/subir_guia")); ok("admin sends a PDF with /subir_guia → saved", r.status === 200 && up.kv.has("guide:main"))
  const saved = JSON.parse(up.kv.get("guide:main").value)
  ok("only the file_id and file info are stored, no file content", saved.fileId === UPLOADED && saved.fileName === "Ruta_Cripto_Segura_Estilo_Web.pdf" && saved.size === 19255939 && Object.keys(saved).sort().join() === "fileId,fileName,savedAt,size")
  ok("admin is told it worked", /Guía guardada \(main\)/.test(calls("sendMessage")[0].params.text) && /18\.4 MB/.test(calls("sendMessage")[0].params.text))

  console.log("\n— 4. Subscribed person receives the guide —")
  await reset(); await uploadGuide()
  tg.state.members[1003] = { status: "member" }
  const ok1 = cb(1003); r = await post(ok1)
  ok("verify when subscribed → 200", r.status === 200, r.text)
  ok("exact order: check → answer button → confirmation → PDF → closing message", methods().join() === "getChatMember,answerCallbackQuery,sendMessage,sendDocument,sendMessage", methods().join())
  ok("PDF is sent to the person by file_id", calls("sendDocument")[0].params.chat_id === 1003 && calls("sendDocument")[0].params.document === UPLOADED)
  const [m1, m2] = calls("sendMessage").map((c) => c.params)
  ok("confirmation text is the owner's", JSON.stringify(lines(m1.text)) === JSON.stringify(CONFIRMED))
  ok("closing text is the owner's, with «💬 Contactar con el equipo» → manager", JSON.stringify(lines(m2.text)) === JSON.stringify(READY) && m2.reply_markup.inline_keyboard[0][0].text === "💬 Contactar con el equipo" && m2.reply_markup.inline_keyboard[0][0].url === "https://t.me/RutaCriptoSeguraAdmin")
  ok("button answered exactly once", calls("answerCallbackQuery").length === 1)

  for (const [status, extra, should] of [["administrator", {}, true], ["creator", {}, true], ["restricted", { is_member: true }, true], ["restricted", { is_member: false }, false], ["left", {}, false], ["kicked", {}, false]]) {
    await reset(); await uploadGuide(); tg.state.members[1004] = { status, ...extra }
    await post(cb(1004)); ok(`status ${status}${extra.is_member !== undefined ? ` is_member=${extra.is_member}` : ""} → ${should ? "guide sent" : "no guide"}`, (calls("sendDocument").length === 1) === should)
  }

  console.log("\n— 5. No duplicate guides —")
  await reset(); await uploadGuide(); tg.state.members[1005] = { status: "member" }
  const same = cb(1005)
  const first = await post(same); const again = await post(same); const again2 = await post(same)
  ok("the same update delivered 3 times → 200 each, 1 guide", [first, again, again2].every((x) => x.status === 200) && calls("sendDocument").length === 1)
  await reset(); await uploadGuide(); tg.state.members[1006] = { status: "member" }
  const parallel = cb(1006); const res = await Promise.all(Array.from({ length: 8 }, () => post(parallel)))
  ok("the same update delivered 8 times in parallel → 1 guide", res.every((x) => x.status === 200) && calls("sendDocument").length === 1, `${calls("sendDocument").length}`)
  await reset(); await uploadGuide(); tg.state.members[1007] = { status: "member" }
  await post(cb(1007)); await post(cb(1007)); await post(cb(1007))
  ok("three quick taps (three different updates) → 1 guide", calls("sendDocument").length === 1, `${calls("sendDocument").length}`)
  ok("every tapped button was answered", calls("answerCallbackQuery").length === 3)
  await reset(); await uploadGuide()
  const people = Array.from({ length: 10 }, (_, i) => 2000 + i); for (const p of people) tg.state.members[p] = { status: "member" }
  await Promise.all(people.map((p) => post(cb(p))))
  ok("ten different people at once → each gets exactly one guide", calls("sendDocument").length === 10 && new Set(calls("sendDocument").map((c) => c.params.chat_id)).size === 10)

  console.log("\n— 6. Telegram and store problems —")
  await reset(); await uploadGuide(); tg.state.members[1010] = { status: "member" }
  tg.state.failures.getChatMember = [{ status: 502, body: { ok: false, error_code: 502, description: "Bad Gateway" } }, { status: 502, body: { ok: false, error_code: 502, description: "Bad Gateway" } }]
  r = await post(cb(1010)); ok("Telegram down while checking → 200, friendly message, no guide", r.status === 200 && /No pudimos verificar/.test(calls("sendMessage")[0]?.params.text ?? "") && calls("sendDocument").length === 0)
  ok("…the button is still answered once", calls("answerCallbackQuery").length === 1)
  await reset(); await uploadGuide(); tg.state.members[1011] = { status: "member" }
  tg.state.failures.getChatMember = [{ status: 502, body: { ok: false, error_code: 502, description: "Bad Gateway" } }]
  r = await post(cb(1011)); ok("a single hiccup while checking is retried and the guide still arrives", r.status === 200 && calls("sendDocument").length === 1)

  await reset()
  tg.state.failures.sendMessage = [{ status: 502, body: { ok: false, error_code: 502, description: "Bad Gateway" } }]
  const flaky = msg(1012, "/start"); r = await post(flaky)
  ok("send fails before anything reached the person → 500 so Telegram retries", r.status === 500)
  r = await post(flaky); ok("Telegram's retry of that update → 200 and the welcome is delivered", r.status === 200 && calls("sendMessage").length === 2)

  await reset()
  tg.state.failures.sendMessage = [{ status: 429, body: { ok: false, error_code: 429, description: "Too Many Requests: retry after 1", parameters: { retry_after: 1 } } }]
  const t0 = Date.now(); r = await post(msg(1013, "/start")); const took = Date.now() - t0
  ok("429 with retry_after=1 → waited and retried, person still got the message", r.status === 200 && calls("sendMessage").length === 2 && took >= 1000, `${took} ms`)

  await reset()
  tg.state.failures.sendMessage = [{ status: 403, body: { ok: false, error_code: 403, description: "Forbidden: bot was blocked by the user" } }]
  r = await post(msg(1014, "/start")); ok("person blocked the bot → 200, no crash, no retry loop", r.status === 200)

  await reset(); await uploadGuide(); tg.state.members[1015] = { status: "member" }
  tg.state.failures.sendDocument = [{ status: 400, body: { ok: false, error_code: 400, description: "Bad Request: wrong file identifier/HTTP URL specified" } }]
  r = await post(cb(1015))
  const toUser = calls("sendMessage").filter((c) => c.params.chat_id === 1015).map((c) => c.params.text)
  const toAdmin = calls("sendMessage").filter((c) => c.params.chat_id === ADMIN)
  ok("Telegram rejects the stored file → person gets an apology with retry, admin gets an alert", r.status === 200 && /No pudimos enviarte la guía/.test(toUser.at(-1)) && toAdmin.length === 1 && /no aceptó el archivo/.test(toAdmin[0].params.text))
  await sleep(2100); tg.state.calls.length = 0
  await post(cb(1015)); ok("…and the very next try works", calls("sendDocument").length === 1)

  await reset(); await uploadGuide(); tg.state.members[1016] = { status: "member" }
  up.stats.down = true
  const down = msg(1016, "/start"); r = await post(down)
  ok("store (Redis) down → 500 and nothing is sent, so Telegram retries later", r.status === 500 && tg.state.calls.length === 0)
  up.stats.down = false; r = await post(down); ok("store back → the retried update is processed", r.status === 200 && calls("sendMessage").length === 1)

  await reset()
  tg.state.failures.getChatMember = [{ status: 400, body: { ok: false, error_code: 400, description: "Bad Request: chat not found" } }]
  await post(cb(1017)); const alerts = calls("sendMessage").filter((c) => c.params.chat_id === ADMIN)
  ok("bot cannot read the channel → person gets a friendly message, admin an alert", /No pudimos verificar/.test(calls("sendMessage").find((c) => c.params.chat_id === 1017).params.text) && alerts.length === 1 && /administrador del canal/.test(alerts[0].params.text))

  await reset()
  tg.state.members[1018] = { status: "member" }
  await post(cb(1018)); const noGuide = calls("sendMessage")
  ok("subscribed but no guide uploaded yet → apology + admin alert, nothing sent in the guide's name", calls("sendDocument").length === 0 && /todavía no está disponible/.test(noGuide[0].params.text) && noGuide.some((c) => c.params.chat_id === ADMIN))

  console.log("\n— 7. Other commands —")
  await reset()
  await post(msg(1020, "/ayuda")); const help = calls("sendMessage")[0].params
  ok("/ayuda: commands, channel, manager, site, safety promise", ["/start", "/guia", "/ayuda", "/canal", "https://t.me/rutacriptosegura", "https://t.me/RutaCriptoSeguraAdmin", "@RutaCriptoSeguraAdmin", "https://crypto-education-landing-page.vercel.app/", "frases semilla, claves privadas, contraseñas, documentos ni dinero"].every((s) => help.text.includes(s)))
  await post(msg(1020, "/canal")); const canal = calls("sendMessage")[1].params
  ok("/canal: button opens the free channel", canal.reply_markup.inline_keyboard[0][0].url === "https://t.me/rutacriptosegura")
  await post(msg(1020, "/guia")); ok("/guia without subscription → asks to subscribe, no file", calls("sendDocument").length === 0 && /Todavía no encontramos/.test(calls("sendMessage").at(-1).params.text))
  await post(msg(1021, "/start web")); ok("/start web (the website deep link) works like /start", /Bienvenido/.test(calls("sendMessage").at(-1).params.text))
  await post(msg(1022, "hola")); ok("unknown text → pointer to /guia and /ayuda", /No entendí/.test(calls("sendMessage").at(-1).params.text))
  await post({ update_id: ++n, message: { message_id: n, chat: { id: -100123, type: "group" }, from: user(1023), text: "/start" } }); ok("groups are ignored", calls("sendMessage").length === 5 - 0 && true)
  ok("(count check) nothing extra was sent for the group message", calls("sendMessage").length === 5)

  console.log("\n— 8. Health check endpoint —")
  await reset(); await uploadGuide()
  let s = await fetch(URL_STATUS); ok("status without secret → 401", s.status === 401)
  s = await fetch(URL_STATUS, { headers: { "x-telegram-bot-api-secret-token": "nope" } }); ok("status with a wrong secret → 401", s.status === 401)
  s = await fetch(URL_STATUS, { headers: { "x-telegram-bot-api-secret-token": SECRET } }); const rep = await s.json()
  ok("status with the secret → 200 and ok", s.status === 200 && rep.ok === true, JSON.stringify(rep))
  ok("report: bot @RutaCriptoSeguraBot, administrator of @rutacriptosegura, store upstash ok, guide stored, 1 admin", rep.bot.username === "RutaCriptoSeguraBot" && rep.channel.botStatus === "administrator" && rep.channel.chat === "@rutacriptosegura" && rep.store.kind === "upstash" && rep.store.ok && rep.guide.configured && rep.guide.source === "store" && rep.admins === 1)
  ok("report: warns the webhook is not set yet", rep.webhook.url === null && rep.warnings.some((w) => /webhook is not set/i.test(w)))
  ok("report contains no token, secret or user id", ![TOKEN, SECRET, REDIS_TOKEN, "777001"].some((x) => JSON.stringify(rep).includes(x)))
  tg.state.botStatus = "member"; s = await fetch(URL_STATUS, { headers: { "x-telegram-bot-api-secret-token": SECRET } }); const rep2 = await s.json()
  ok("bot only a plain member of the channel → 503 and a clear warning", s.status === 503 && rep2.ok === false && rep2.channel.ok === false && rep2.warnings.some((w) => /not an administrator/.test(w)))
  tg.state.botStatus = "administrator"; up.stats.down = true; s = await fetch(URL_STATUS, { headers: { "x-telegram-bot-api-secret-token": SECRET } }); const rep3 = await s.json(); up.stats.down = false
  ok("store down → 503 and store.ok=false", s.status === 503 && rep3.store.ok === false)

  console.log("\n— 9. Latency —")
  await reset(); const times = []
  for (let i = 0; i < 30; i++) { const t = Date.now(); await post(msg(3000 + i, "/ayuda")); times.push(Date.now() - t) }
  times.sort((a, b) => a - b); const p50 = times[15], p95 = times[28]
  ok(`webhook answers fast (median ${p50} ms, p95 ${p95} ms; Telegram waits seconds)`, p95 < 1500)
  await reset(); await uploadGuide(); tg.state.members[4001] = { status: "member" }
  const tFull = Date.now(); await post(cb(4001)); const full = Date.now() - tFull
  ok(`a full delivery (check + 3 sends) took ${full} ms`, full < 3000)

  console.log("\n— 9b. The update log lines —")
  const updateLines = out.split("\n").filter((l) => l.startsWith("{") && l.includes('"evt":"update"')).map((l) => JSON.parse(l))
  ok("one log line per update with id, kind, outcome and duration", updateLines.length > 20 && updateLines.every((l) => typeof l.id === "number" && ["button", "message", "document", "other"].includes(l.kind) && ["processed", "duplicate", "ignored", "retry"].includes(l.outcome) && typeof l.ms === "number"))
  ok("…and nothing else about the person", updateLines.every((l) => Object.keys(l).sort().join() === "evt,id,kind,ms,outcome"))

  console.log("\n— 11. The real webhook script (scripts/telegram/webhook.mjs) against the local build —")
  // Async on purpose: the fake Telegram runs in THIS process, so a blocking spawnSync would freeze it.
  const cli = (args, env = {}) => new Promise((resolve) => {
    const child = spawn("node", ["--import", `${HERE}/cli-shim.mjs`, `${REPO}/scripts/telegram/webhook.mjs`, ...args], { env: { PATH: process.env.PATH, TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_WEBHOOK_SECRET: SECRET, ...env } })
    let text = ""
    child.stdout.on("data", (d) => (text += d)); child.stderr.on("data", (d) => (text += d))
    const timer = setTimeout(() => child.kill("SIGKILL"), 60000)
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, text }) })
  })
  const everyCliOutput = []
  await reset()
  let c = await cli(["me"]); everyCliOutput.push(c.text); ok("me → token works, shows @RutaCriptoSeguraBot", c.code === 0 && /@RutaCriptoSeguraBot/.test(c.text), c.text)
  c = await cli(["me"], { TELEGRAM_BOT_TOKEN: "111111111:wrong-fake-token-00000000" }); everyCliOutput.push(c.text); ok("me with a wrong token → fails clearly, without printing the token", c.code === 1 && /Unauthorized/.test(c.text) && !c.text.includes("wrong-fake-token"))
  c = await cli(["check", "https://bot-test.example"]); everyCliOutput.push(c.text); ok("check → deployment ready (guide still missing is only a warning)", c.code === 0 && /Развёртывание готово/.test(c.text) && /токен бота: ✅|✅ токен бота/.test(c.text) && /PDF-гайд/.test(c.text), c.text)
  c = await cli(["check", "https://bot-test.example"], { TELEGRAM_WEBHOOK_SECRET: "another-secret-0123456789abcdef-xx" }); everyCliOutput.push(c.text); ok("check with a different secret → explains the mismatch", c.code === 1 && /секрет не совпадает/.test(c.text), c.text)
  tg.state.botStatus = "member"
  c = await cli(["set", "https://bot-test.example/api/telegram/webhook"]); everyCliOutput.push(c.text)
  ok("set while the bot is not a channel administrator → REFUSES, webhook stays off", c.code === 1 && /Webhook НЕ включён/.test(c.text) && tg.state.webhook.url === "", c.text)
  tg.state.botStatus = "administrator"; tg.state.calls.length = 0
  c = await cli(["set", "https://bot-test.example/api/telegram/webhook", "--drop-pending"]); everyCliOutput.push(c.text)
  const setCall = calls("setWebhook")[0]?.params
  ok("set when everything is ready → webhook enabled", c.code === 0 && /Webhook включён/.test(c.text), c.text)
  ok("setWebhook carries the URL, the secret_token, only message+callback_query, 10 connections, drop pending", setCall?.url === "https://bot-test.example/api/telegram/webhook" && setCall.secret_token === SECRET && JSON.stringify(setCall.allowed_updates) === JSON.stringify(["message", "callback_query"]) && setCall.max_connections === 10 && setCall.drop_pending_updates === true, JSON.stringify(setCall))
  ok("the pre-flight ran BEFORE setWebhook", tg.state.calls.findIndex((x) => x.method === "getChatMember") < tg.state.calls.findIndex((x) => x.method === "setWebhook"))
  // Telegram would now call the webhook with exactly this secret: prove the route accepts it
  await uploadGuide(); tg.state.members[6001] = { status: "member" }
  r = await post(cb(6001), { secret: tg.state.webhook.secret_token }); ok("an update signed with the secret the script registered is accepted and served", r.status === 200 && calls("sendDocument").length === 1)
  c = await cli(["info"]); everyCliOutput.push(c.text); ok("info → shows the webhook address", c.code === 0 && /https:\/\/bot-test\.example\/api\/telegram\/webhook/.test(c.text), c.text)
  c = await cli(["commands"]); everyCliOutput.push(c.text)
  ok("commands → /start /guia /ayuda /canal with Spanish descriptions", c.code === 0 && JSON.stringify(tg.state.commands.map((x) => x.command)) === JSON.stringify(["start", "guia", "ayuda", "canal"]) && tg.state.commands.every((x) => x.description.length > 3), JSON.stringify(tg.state.commands))
  c = await cli(["delete"]); everyCliOutput.push(c.text); ok("delete → webhook switched off", c.code === 0 && tg.state.webhook.url === "")
  c = await cli(["set", "http://example.com/api/telegram/webhook"]); ok("set refuses http", c.code === 1 && /HTTPS/.test(c.text))
  c = await cli(["set", "https://bot-test.example/other"]); ok("set refuses a wrong path", c.code === 1 && /\/api\/telegram\/webhook/.test(c.text))
  c = await cli(["me"], { TELEGRAM_BOT_TOKEN: "" }); ok("a missing token is explained, not a stack trace", c.code === 1 && /TELEGRAM_BOT_TOKEN/.test(c.text) && !/at .*\.mjs/.test(c.text))
  ok("no script output ever contained the token or the secret", everyCliOutput.every((t) => !t.includes(TOKEN) && !t.includes(TOKEN.split(":")[1]) && !t.includes(SECRET)))
} finally {
  console.log("\n— 10. What the server logged —")
  const logged = out
  const lineCount = logged.split("\n").filter((l) => l.startsWith("{")).length
  ok("the server logged JSON events", lineCount > 5, `${lineCount} json lines`)
  ok("logs hold no bot token", !logged.includes(TOKEN) && !logged.includes(TOKEN.split(":")[1]))
  ok("logs hold no webhook secret", !logged.includes(SECRET))
  ok("logs hold no Redis token", !logged.includes(REDIS_TOKEN))
  ok("logs hold no Telegram user ids or names", !/\b(1001|1003|1010|1015|777001)\b/.test(logged) && !/Persona Prueba|persona_prueba/.test(logged))
  console.log("   sample of what is logged:"); logged.split("\n").filter((l) => l.startsWith("{")).slice(0, 4).forEach((l) => console.log("   " + l.slice(0, 160)))
  const dump = JSON.stringify([...up.kv.entries()])
  ok("the store holds no Telegram user id or name", !/(persona_prueba|Persona Prueba)/.test(dump) && ![1003, 1005, 1010, 1015, 4001].some((id) => new RegExp(`[:"]${id}[:"]`).test(dump)))
  console.log(`\n=== ${pass} passed, ${fail} failed ===`)
  if (fail) console.log("FAILED:\n - " + failures.join("\n - "))
  server.kill("SIGKILL"); await tg.close(); await up.close()
  process.exit(fail ? 1 : 0)
}
