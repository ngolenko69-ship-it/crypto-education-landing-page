import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_URL } from "../../telegram"
import { keyboards, texts, toasts } from "../messages"
import { buttonLabels, buttonUrls } from "./helpers"

// The wording below is the owner's, word for word; only blank lines between paragraphs were added.
const lines = (text: string) => text.split("\n").filter((line) => line.trim() !== "")

describe("the owner's texts", () => {
  it("welcome", () => {
    assert.deepEqual(lines(texts.welcome), [
      "🛡️ ¡Bienvenido a Ruta Cripto Segura!",
      "Aprende sobre criptomonedas, stablecoins, P2P y seguridad digital con mayor confianza.",
      "🎁 Tenemos una guía práctica gratuita para ti.",
      "Para recibirla, suscríbete a nuestro canal educativo y verifica tu suscripción.",
      "¡Aprende antes de arriesgar!",
    ])
  })

  it("not subscribed", () => {
    assert.deepEqual(lines(texts.notSubscribed), ["❌ Todavía no encontramos tu suscripción.", "Únete a nuestro canal gratuito y vuelve a pulsar «Verificar suscripción»."])
  })

  it("subscription confirmed", () => {
    assert.deepEqual(lines(texts.confirmed), ["✅ ¡Suscripción confirmada!", "🎉 ¡Gracias por unirte a Ruta Cripto Segura!", "Aquí tienes tu guía educativa gratuita."])
  })

  it("guide ready", () => {
    assert.deepEqual(lines(texts.ready), [
      "📚 ¡Tu guía está lista!",
      "En ella aprenderás sobre stablecoins, P2P, wallets, seguridad digital y prevención de estafas.",
      "Síguenos en nuestro canal para recibir más contenido educativo.",
      "💚 Ruta Cripto Segura — Aprende antes de arriesgar.",
    ])
  })
})

describe("buttons", () => {
  it("point at the channel and the manager the site uses", () => {
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
