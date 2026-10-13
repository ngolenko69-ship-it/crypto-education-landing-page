import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { adminTexts, keyboards, texts, toasts } from "../messages"
import { processUpdate } from "../process-update"
import { ADMIN, buttonLabels, buttonUrls, createHarness, GUIDE_FILE_ID, OTHER_USER, REDIS_TOKEN, SECRET, TOKEN, USER } from "./helpers"

const CHANNEL = "https://t.me/rutacriptosegura"
const MANAGER = "https://t.me/RutaCriptoSeguraAdmin"

describe("/start", () => {
  it("shows the welcome text with the subscribe and verify buttons", async () => {
    const h = createHarness()
    assert.equal(await processUpdate(h.message(USER, "/start"), h.deps), "processed")

    const [sent] = h.fake.of("sendMessage")
    assert.equal(sent.args[0], USER)
    assert.equal(sent.args[1], texts.welcome)
    assert.deepEqual(buttonLabels(sent.args[2]), ["📢 Suscribirme al canal", "✅ Verificar suscripción"])
    assert.deepEqual(buttonUrls(sent.args[2]), [CHANNEL, ""])
    assert.deepEqual(keyboards.subscribe.inline_keyboard[1][0].callback_data, "verify")
  })

  it("accepts the deep link from the website and the @botname form", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "/start web"), h.deps)
    await processUpdate(h.message(OTHER_USER, "/start@RutaCriptoSeguraBot"), h.deps)
    assert.deepEqual(h.fake.texts(), [texts.welcome, texts.welcome])
    const stats = h.store.dump()
    assert.equal(stats["st:total:start"], "2")
    assert.equal(stats["st:total:start_web"], "1")
  })
})

describe("subscription check", () => {
  it("never delivers just because the button was pressed", async () => {
    const h = createHarness()
    await h.withGuide()
    // not subscribed: Telegram answers "left"
    await processUpdate(h.callback(USER), h.deps)

    assert.equal(h.fake.of("sendDocument").length, 0)
    assert.deepEqual(h.fake.of("getChatMember")[0].args, ["@rutacriptosegura", USER])
    assert.equal(h.fake.of("answerCallbackQuery").length, 1)
    assert.equal(h.fake.of("answerCallbackQuery")[0].args[1], toasts.notSubscribed)
    const [message] = h.fake.of("sendMessage")
    assert.equal(message.args[1], texts.notSubscribed)
    assert.deepEqual(buttonLabels(message.args[2]), ["📢 Suscribirme al canal", "✅ Verificar suscripción"])
  })

  it("asks Telegram about the user id in the update, not about anyone else", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(OTHER_USER) // somebody else is subscribed, not this user
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 0)
  })

  for (const status of ["member", "administrator", "creator"] as const) {
    it(`treats "${status}" as subscribed`, async () => {
      const h = createHarness()
      await h.withGuide()
      h.fake.subscribe(USER, { status })
      await processUpdate(h.callback(USER), h.deps)
      assert.equal(h.fake.of("sendDocument").length, 1)
    })
  }

  it("treats restricted as subscribed only while is_member is true", async () => {
    const stillIn = createHarness()
    await stillIn.withGuide()
    stillIn.fake.subscribe(USER, { status: "restricted", is_member: true })
    await processUpdate(stillIn.callback(USER), stillIn.deps)
    assert.equal(stillIn.fake.of("sendDocument").length, 1)

    const gone = createHarness()
    await gone.withGuide()
    gone.fake.subscribe(USER, { status: "restricted", is_member: false })
    await processUpdate(gone.callback(USER), gone.deps)
    assert.equal(gone.fake.of("sendDocument").length, 0)
  })

  for (const status of ["left", "kicked"] as const) {
    it(`treats "${status}" as not subscribed`, async () => {
      const h = createHarness()
      await h.withGuide()
      h.fake.subscribe(USER, { status })
      await processUpdate(h.callback(USER), h.deps)
      assert.equal(h.fake.of("sendDocument").length, 0)
    })
  }

  it('treats Telegram\'s "user not found" as not subscribed', async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.failNext("getChatMember", "bad_request", "Bad Request: user not found")
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.texts()[0], texts.notSubscribed)
  })

  it("shows a friendly retry message when Telegram is unreachable, and still answers the button once", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.failNext("getChatMember", "network", "network error", 0)
    await processUpdate(h.callback(USER), h.deps)

    assert.equal(h.fake.of("answerCallbackQuery").length, 1)
    assert.equal(h.fake.of("answerCallbackQuery")[0].args[1], toasts.error)
    const [message] = h.fake.of("sendMessage")
    assert.equal(message.args[1], texts.verifyError)
    assert.deepEqual(buttonLabels(message.args[2]), ["✅ Verificar suscripción", "💬 Contactar con el equipo"])
    assert.equal(h.fake.of("sendDocument").length, 0)
  })

  it("alerts the administrators once an hour when the bot cannot read the channel", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.failNext("getChatMember", "chat_not_found", "Bad Request: chat not found")
    h.fake.failNext("getChatMember", "chat_not_found", "Bad Request: chat not found")
    await processUpdate(h.callback(USER), h.deps)
    h.advance(3)
    await processUpdate(h.callback(USER), h.deps)

    const toAdmin = h.fake.of("sendMessage").filter((call) => call.args[0] === ADMIN)
    assert.equal(toAdmin.length, 1)
    assert.equal(toAdmin[0].args[1], adminTexts.channelAccess)
  })

  it("always answers a pressed button, even when handling fails", async () => {
    const h = createHarness()
    h.fake.failNext("getChatMember", "server", "Bad Gateway", 502)
    h.fake.failNext("getChatMember", "server", "Bad Gateway", 502)
    h.fake.failNext("sendMessage", "server", "Bad Gateway", 502)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("answerCallbackQuery").length, 1)
  })
})

describe("guide delivery", () => {
  it("confirms, sends the PDF by file_id, then the closing message with the team button — in that order", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    assert.equal(await processUpdate(h.callback(USER), h.deps), "processed")

    assert.deepEqual(h.fake.calls.map((call) => call.method), ["getChatMember", "answerCallbackQuery", "sendMessage", "sendDocument", "sendMessage"])
    assert.equal(h.fake.of("answerCallbackQuery")[0].args[1], toasts.confirmed)
    const [confirmed, ready] = h.fake.of("sendMessage")
    assert.deepEqual([confirmed.args[0], confirmed.args[1]], [USER, texts.confirmed])
    assert.deepEqual(h.fake.of("sendDocument")[0].args, [USER, GUIDE_FILE_ID])
    assert.equal(ready.args[1], texts.ready)
    assert.deepEqual(buttonLabels(ready.args[2]), ["💬 Contactar con el equipo"])
    assert.deepEqual(buttonUrls(ready.args[2]), [MANAGER])
  })

  it("works the same from /guia", async () => {
    const h = createHarness()
    await h.withGuide()
    await processUpdate(h.message(USER, "/guia"), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 0)
    assert.equal(h.fake.texts()[0], texts.notSubscribed)

    h.advance(3)
    h.fake.subscribe(USER)
    await processUpdate(h.message(USER, "/guia"), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 1)
    assert.equal(h.fake.of("answerCallbackQuery").length, 0)
  })

  it("does not send the file twice when Telegram re-delivers the same update", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    const update = h.callback(USER)
    assert.equal(await processUpdate(update, h.deps), "processed")
    assert.equal(await processUpdate(update, h.deps), "duplicate")
    assert.equal(await processUpdate(structuredClone(update), h.deps), "duplicate")
    assert.equal(h.fake.of("sendDocument").length, 1)
  })

  it("handles two simultaneous deliveries of the same update only once", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    const update = h.callback(USER)
    const outcomes = await Promise.all([processUpdate(update, h.deps), processUpdate(update, h.deps), processUpdate(update, h.deps)])
    assert.deepEqual(outcomes.slice().sort(), ["duplicate", "duplicate", "processed"])
    assert.equal(h.fake.of("sendDocument").length, 1)
  })

  it("does not send the file twice for a double tap (two different updates)", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    await processUpdate(h.callback(USER), h.deps)
    await processUpdate(h.callback(USER), h.deps) // immediately again: too fast
    h.advance(3)
    await processUpdate(h.callback(USER), h.deps) // a bit later, delivery still on cooldown

    assert.equal(h.fake.of("sendDocument").length, 1)
    assert.ok(h.fake.texts().includes(texts.alreadySent))
    assert.ok(h.fake.of("answerCallbackQuery").some((call) => call.args[1] === toasts.tooFast))
  })

  it("allows a new delivery after the cooldown, up to five a day", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    for (let i = 0; i < 5; i++) {
      h.advance(31)
      await processUpdate(h.callback(USER), h.deps)
    }
    assert.equal(h.fake.of("sendDocument").length, 5)

    h.advance(31)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 5)
    assert.equal(h.fake.texts().at(-1), texts.dailyLimit)

    h.advance(24 * 3600)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 6)
  })

  it("apologises, alerts the administrators and keeps the person able to retry when the guide is missing", async () => {
    const h = createHarness()
    h.fake.subscribe(USER)
    await processUpdate(h.callback(USER), h.deps)

    assert.equal(h.fake.of("sendDocument").length, 0)
    const toUser = h.fake.of("sendMessage").filter((call) => call.args[0] === USER)
    assert.equal(toUser[0].args[1], texts.guideUnavailable)
    assert.deepEqual(buttonUrls(toUser[0].args[2]), [MANAGER])
    assert.equal(h.fake.of("sendMessage").filter((call) => call.args[0] === ADMIN)[0].args[1], adminTexts.guideMissing)

    // the owner uploads the PDF; the very next attempt works (the failed one did not lock the person out)
    await h.withGuide()
    h.advance(3)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 1)
  })

  it("uses the emergency file_id from the environment when the store has none", async () => {
    const h = createHarness({ fallbackFileId: "BQACAgIAAxkBAAIB-fallback-file-id-from-env-0000001" })
    h.fake.subscribe(USER)
    await processUpdate(h.callback(USER), h.deps)
    assert.deepEqual(h.fake.of("sendDocument")[0].args, [USER, "BQACAgIAAxkBAAIB-fallback-file-id-from-env-0000001"])
  })

  it("tells the person and the administrators when Telegram rejects the stored file, and lets them retry", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    h.fake.failNext("sendDocument", "bad_file", "Bad Request: wrong file identifier/HTTP URL specified")
    assert.equal(await processUpdate(h.callback(USER), h.deps), "processed")

    const toUser = h.fake.of("sendMessage").filter((call) => call.args[0] === USER).map((call) => call.args[1])
    assert.deepEqual(toUser, [texts.confirmed, texts.deliveryFailed])
    assert.equal(h.fake.of("sendMessage").filter((call) => call.args[0] === ADMIN)[0].args[1], adminTexts.guideRejected)

    h.advance(3)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 2) // the second attempt reached Telegram again
  })

  it("does not retry the whole update when only the file send failed transiently", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    h.fake.failNext("sendDocument", "server", "Bad Gateway", 502)
    assert.equal(await processUpdate(h.callback(USER), h.deps), "processed") // not "retry": the person already saw a message
    assert.equal(h.fake.texts().at(-1), texts.deliveryFailed)
  })

  it("stops quietly when the person blocked the bot", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    h.fake.failNext("sendMessage", "blocked", "Forbidden: bot was blocked by the user", 403)
    assert.equal(await processUpdate(h.callback(USER), h.deps), "processed")
    assert.equal(h.fake.of("sendDocument").length, 0)

    // and the failed attempt did not leave the person locked
    h.advance(3)
    await processUpdate(h.callback(USER), h.deps)
    assert.equal(h.fake.of("sendDocument").length, 1)
  })

  it("records only a pseudonym and counters — never the Telegram id", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    await processUpdate(h.callback(USER), h.deps)
    await processUpdate(h.message(USER, "/start"), h.deps)

    const dump = h.store.dump()
    const everything = JSON.stringify(dump)
    assert.ok(!everything.includes(String(USER)), "the raw user id must not appear in any key or value")
    assert.ok(Object.keys(dump).some((key) => key.startsWith("dr:")), "a delivery record exists")
    assert.equal(dump["st:total:delivered"], "1")
    assert.equal(dump["st:total:unique_users"], "1")
  })
})

describe("processing guarantees", () => {
  it("answers 'retry' and frees the claim when nothing visible happened, then succeeds on the re-delivery", async () => {
    const h = createHarness()
    const update = h.message(USER, "/start")
    h.fake.failNext("sendMessage", "server", "Bad Gateway", 502)

    assert.equal(await processUpdate(update, h.deps), "retry")
    assert.equal(await h.store.get(`upd:${update.update_id}`), null)
    assert.equal(await processUpdate(update, h.deps), "processed")
    // the fake records the failed attempt too: one attempt that Telegram rejected, one that went through
    assert.deepEqual(h.fake.texts(), [texts.welcome, texts.welcome])
  })

  it("gives up on an update that keeps failing instead of asking Telegram to retry forever", async () => {
    const h = createHarness()
    const update = h.message(USER, "/start")
    const outcomes: string[] = []
    for (let i = 0; i < 5; i++) {
      h.fake.failNext("sendMessage", "server", "Bad Gateway", 502)
      outcomes.push(await processUpdate(update, h.deps))
    }
    assert.deepEqual(outcomes, ["retry", "retry", "retry", "ignored", "duplicate"])
  })

  it("ignores update types it does not read", async () => {
    const h = createHarness()
    assert.equal(await processUpdate({ update_id: 1 }, h.deps), "ignored")
    assert.equal(h.fake.calls.length, 0)
  })

  it("ignores groups and other bots", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "/start", { chatType: "group" }), h.deps)
    await processUpdate(h.message(OTHER_USER, "/start", { isBot: true }), h.deps)
    assert.equal(h.fake.calls.length, 0)
  })

  it("stops answering a flood from one person", async () => {
    const h = createHarness()
    for (let i = 0; i < 40; i++) await processUpdate(h.message(USER, "/ayuda"), h.deps)
    assert.equal(h.fake.of("sendMessage").length, 30)
  })

  it("limits verifications per hour", async () => {
    const h = createHarness()
    for (let i = 0; i < 45; i++) {
      h.advance(3)
      await processUpdate(h.callback(USER), h.deps)
      if (i % 20 === 19) h.advance(60) // keep the flood guard out of the way; only the hourly cap is under test
    }
    assert.ok(h.fake.texts().includes(texts.tooManyChecks))
    assert.ok(h.fake.of("getChatMember").length <= 40)
  })
})

describe("other commands", () => {
  it("/ayuda lists the commands, the official links and the safety promise", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "/ayuda"), h.deps)
    const [help] = h.fake.of("sendMessage")
    const text = String(help.args[1])
    for (const command of ["/start", "/guia", "/ayuda", "/canal"]) assert.ok(text.includes(command), command)
    for (const link of [CHANNEL, MANAGER, "@RutaCriptoSeguraAdmin", "https://crypto-education-landing-page.vercel.app/"]) assert.ok(text.includes(link), link)
    assert.ok(/frases semilla, claves privadas, contraseñas, documentos ni dinero/.test(text))
    assert.deepEqual(buttonUrls(help.args[2]), [CHANNEL, MANAGER])
  })

  it("/canal opens the free channel", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "/canal"), h.deps)
    const [sent] = h.fake.of("sendMessage")
    assert.equal(sent.args[1], texts.channel)
    assert.deepEqual(buttonUrls(sent.args[2]), [CHANNEL])
  })

  it("/id tells a person their own Telegram id", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "/id"), h.deps)
    assert.equal(h.fake.texts()[0], `Tu ID de Telegram es ${USER}.`)
  })

  it("answers unknown text and unknown commands with a pointer to /guia and /ayuda", async () => {
    const h = createHarness()
    await processUpdate(h.message(USER, "hola"), h.deps)
    await processUpdate(h.message(USER, "/nada"), h.deps)
    assert.deepEqual(h.fake.texts(), [texts.unknown, texts.unknown])
  })

  it("asks for nothing sensitive in any message the bot can send", () => {
    const all = [...Object.values(texts), ...Object.values(toasts)].join("\n")
    assert.ok(!/(seed|semilla|clave privada|contraseña)[^.]*(env[ií]a|comparte|dinos|escribe aqu[ií])/i.test(all.replace(/Nunca te pediremos[^.]*\./, "")))
    assert.ok(!/ganancia[s]? (garantizada|segura)|duplica|rentabilidad/i.test(all))
  })
})

describe("administrators", () => {
  it("lets an administrator save the PDF by sending it with /subir_guia, and the next delivery uses it", async () => {
    const h = createHarness()
    await processUpdate(h.document(ADMIN, { file_id: "BQACAgIAAxkDAAIB-new-upload-file-id-0000000000009" }, "/subir_guia"), h.deps)

    assert.match(h.fake.texts()[0], /Guía guardada \(main\)/)
    assert.match(h.fake.texts()[0], /Ruta_Cripto_Segura\.pdf \(18\.4 MB\)/)
    const saved = JSON.parse((await h.store.get("guide:main")) ?? "{}")
    assert.equal(saved.fileId, "BQACAgIAAxkDAAIB-new-upload-file-id-0000000000009")

    h.fake.subscribe(USER)
    await processUpdate(h.callback(USER), h.deps)
    assert.deepEqual(h.fake.of("sendDocument")[0].args, [USER, "BQACAgIAAxkDAAIB-new-upload-file-id-0000000000009"])
  })

  it("never lets anyone else change the guide", async () => {
    const h = createHarness()
    await processUpdate(h.document(USER, {}, "/subir_guia"), h.deps)
    assert.equal(h.fake.texts()[0], texts.noFilesPlease)
    assert.equal(await h.store.get("guide:main"), null)
  })

  it("does not save a PDF sent without the /subir_guia caption, a non-PDF, or an oversized file", async () => {
    const h = createHarness()
    await processUpdate(h.document(ADMIN, {}), h.deps)
    await processUpdate(h.document(ADMIN, { mime_type: "image/png", file_name: "foto.png" }, "/subir_guia"), h.deps)
    await processUpdate(h.document(ADMIN, { file_size: 60 * 1024 * 1024 }, "/subir_guia"), h.deps)
    assert.deepEqual(h.fake.texts(), [adminTexts.uploadHint, adminTexts.notPdf, adminTexts.tooBig])
    assert.equal(await h.store.get("guide:main"), null)
  })

  it("shows /estado only to administrators", async () => {
    const h = createHarness()
    await h.withGuide()
    await processUpdate(h.message(ADMIN, "/estado"), h.deps)
    const report = h.fake.texts()[0]
    assert.match(report, /Estado del bot/)
    assert.match(report, /Guía: ✅ guia\.pdf/)
    assert.match(report, /es «administrator» ✅/)

    await processUpdate(h.message(USER, "/estado"), h.deps)
    assert.equal(h.fake.texts()[1], texts.unknown)
  })
})

describe("secrets", () => {
  it("never writes the bot token, the webhook secret, the store token or a user id to the logs", async () => {
    const h = createHarness()
    await h.withGuide()
    h.fake.subscribe(USER)
    h.fake.failNext("getChatMember", "network", `network error at https://api.telegram.org/bot${TOKEN}/getChatMember using ${SECRET} and ${REDIS_TOKEN}`, 0)
    h.fake.failNext("sendDocument", "bad_file", `wrong file ${TOKEN}`)
    await processUpdate(h.callback(USER), h.deps)
    h.advance(3)
    await processUpdate(h.callback(USER), h.deps)
    h.fake.failNext("sendMessage", "server", `boom ${TOKEN}`, 500)
    await processUpdate(h.message(USER, "/ayuda"), h.deps)

    const logged = h.output.join("\n")
    assert.ok(logged.length > 0, "something was logged")
    for (const secret of [TOKEN, SECRET, REDIS_TOKEN, String(USER)]) assert.ok(!logged.includes(secret), `the logs must not contain ${secret.slice(0, 6)}…`)
  })
})
