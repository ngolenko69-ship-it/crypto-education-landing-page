import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_URL } from "../links"
import { adminTexts, keyboards, texts, toasts } from "../messages"
import { buttonLabels, buttonUrls } from "./helpers"

// The greeting is the owner's approved text, character for character (blank lines included). The other messages
// carry the approved name of the free product: "Curso introductorio gratuito de criptomonedas".
const lines = (text: string) => text.split("\n").filter((line) => line.trim() !== "")

describe("the owner's texts", () => {
  it("welcome is the approved text, exactly", () => {
    assert.equal(
      texts.welcome,
      [
        "🎁 ¡Obtén tu curso introductorio gratuito de criptomonedas!",
        "Aprende los fundamentos de Bitcoin, stablecoins, P2P, wallets y seguridad digital con nuestro curso en PDF.",
        "Para recibirlo, solo tienes que:",
        "",
        "1. Suscribirte gratis a nuestro canal educativo.",
        "2. Pulsar «Verificar suscripción».",
        "3. Recibir tu curso directamente aquí.",
        "",
        "🛡️ ¡Aprende antes de arriesgar!",
      ].join("\n"),
    )
  })

  it("not subscribed names the channel and what the subscription gives", () => {
    assert.deepEqual(lines(texts.notSubscribed), [
      "❌ Todavía no encontramos tu suscripción a @rutacriptosegura.",
      "Suscríbete gratis a nuestro canal educativo y vuelve a pulsar «Verificar suscripción» para recibir tu curso introductorio gratuito de criptomonedas.",
    ])
  })

  it("subscription confirmed", () => {
    assert.deepEqual(lines(texts.confirmed), [
      "✅ ¡Suscripción confirmada!",
      "🎉 ¡Gracias por suscribirte a @rutacriptosegura!",
      "Aquí tienes tu curso introductorio gratuito de criptomonedas en PDF.",
    ])
  })

  it("course ready", () => {
    assert.deepEqual(lines(texts.ready), [
      "📚 ¡Tu curso introductorio gratuito de criptomonedas está listo!",
      "En él aprenderás sobre Bitcoin, stablecoins, P2P, wallets, seguridad digital y prevención de estafas.",
      "Síguenos en nuestro canal para recibir más contenido educativo.",
      "💚 Ruta Cripto Segura — Aprende antes de arriesgar.",
    ])
  })
})

describe("the free product is the «curso introductorio gratuito de criptomonedas»", () => {
  const NAME = "curso introductorio gratuito de criptomonedas"

  it("is named wherever a person is told what the subscription gives", () => {
    for (const key of ["welcome", "notSubscribed", "confirmed", "ready", "help"] as const) assert.ok(texts[key].includes(NAME), key)
    for (const key of ["unknown", "noFilesPlease"] as const) assert.ok(texts[key].includes("curso introductorio gratuito"), key)
  })

  it("no message to a person still calls it a «guía»", () => {
    for (const [key, text] of Object.entries(texts)) assert.doesNotMatch(text, /guía/i, key)
    for (const [key, text] of Object.entries(toasts)) assert.doesNotMatch(text, /guía/i, key)
  })

  it("the subscription messages name the channel that is checked", () => {
    assert.equal(TELEGRAM_CHANNEL_URL, `https://t.me/${TELEGRAM_CHANNEL_HANDLE.slice(1)}`)
    assert.ok(texts.notSubscribed.includes(TELEGRAM_CHANNEL_HANDLE))
    assert.ok(texts.confirmed.includes(TELEGRAM_CHANNEL_HANDLE))
  })

  it("the commands keep their names", () => {
    for (const text of [texts.help, texts.unknown, texts.noFilesPlease]) assert.ok(text.includes("/guia"))
    assert.ok(adminTexts.uploadHint.includes("/subir_guia"))
    assert.ok(adminTexts.guideMissing.includes("/subir_guia"))
  })
})

describe("buttons", () => {
  it("point at the official channel and manager", () => {
    assert.equal(TELEGRAM_CHANNEL_URL, "https://t.me/rutacriptosegura")
    assert.equal(TELEGRAM_MANAGER_URL, "https://t.me/RutaCriptoSeguraAdmin")
    assert.deepEqual(buttonLabels(keyboards.subscribe), ["📢 Suscribirme al canal", "✅ Verificar suscripción"])
    assert.deepEqual(buttonUrls(keyboards.subscribe), ["https://t.me/rutacriptosegura", ""])
    assert.deepEqual(buttonLabels(keyboards.contact), ["💬 Contactar con el equipo"])
    assert.deepEqual(buttonUrls(keyboards.contact), ["https://t.me/RutaCriptoSeguraAdmin"])
  })

  it("keep callback data short and Telegram-safe", () => {
    const callbacks = [keyboards.subscribe, keyboards.retry].flatMap((k) => k.inline_keyboard.flat()).map((b) => b.callback_data).filter(Boolean)
    assert.deepEqual(callbacks, ["verify", "verify"])
  })
})

describe("limits Telegram enforces", () => {
  it("texts fit a message and pop-ups fit 200 characters", () => {
    for (const text of Object.values(texts)) assert.ok(text.length <= 4096)
    for (const toast of Object.values(toasts)) assert.ok(toast.length <= 200)
  })
})
