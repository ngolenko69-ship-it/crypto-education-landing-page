import { SITE_URL, TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_HANDLE, TELEGRAM_MANAGER_URL } from "./links"
import type { InlineButton, InlineKeyboard } from "./types"

// Everything the bot says, in Spanish. Every address comes from ./links, so one is changed in one place only.
//
// The free product is the "Curso introductorio gratuito de criptomonedas": a PDF course that a person gets for
// subscribing to the channel for free. The messages call it "curso". Only the wording changed: the commands keep
// their names (/guia, /subir_guia) and the code, storage keys and administrator messages still say "guide".

export const BOT_HANDLE = "@RutaCriptoSeguraBot"
export const CALLBACK_VERIFY = "verify"

const subscribeButton: InlineButton = { text: "📢 Suscribirme al canal", url: TELEGRAM_CHANNEL_URL }
const verifyButton: InlineButton = { text: "✅ Verificar suscripción", callback_data: CALLBACK_VERIFY }
const contactButton: InlineButton = { text: "💬 Contactar con el equipo", url: TELEGRAM_MANAGER_URL }
const openChannelButton: InlineButton = { text: "📢 Abrir el canal", url: TELEGRAM_CHANNEL_URL }

export const keyboards = {
  /** Welcome and "not subscribed yet": subscribe, then verify. */
  subscribe: { inline_keyboard: [[subscribeButton], [verifyButton]] } satisfies InlineKeyboard,
  /** After the guide, and whenever a person may need us. */
  contact: { inline_keyboard: [[contactButton]] } satisfies InlineKeyboard,
  /** After a technical problem: try again, or write to the team. */
  retry: { inline_keyboard: [[verifyButton], [contactButton]] } satisfies InlineKeyboard,
  channel: { inline_keyboard: [[openChannelButton]] } satisfies InlineKeyboard,
  help: { inline_keyboard: [[openChannelButton], [contactButton]] } satisfies InlineKeyboard,
}

export const texts = {
  welcome:
    "🎁 ¡Obtén tu curso introductorio gratuito de criptomonedas!\n" +
    "Aprende los fundamentos de Bitcoin, stablecoins, P2P, wallets y seguridad digital con nuestro curso en PDF.\n" +
    "Para recibirlo, solo tienes que:\n\n" +
    "1. Suscribirte gratis a nuestro canal educativo.\n" +
    "2. Pulsar «Verificar suscripción».\n" +
    "3. Recibir tu curso directamente aquí.\n\n" +
    "🛡️ ¡Aprende antes de arriesgar!",

  notSubscribed:
    `❌ Todavía no encontramos tu suscripción a ${TELEGRAM_CHANNEL_HANDLE}.\n` +
    "Suscríbete gratis a nuestro canal educativo y vuelve a pulsar «Verificar suscripción» para recibir tu curso introductorio gratuito de criptomonedas.",

  confirmed:
    "✅ ¡Suscripción confirmada!\n" +
    `🎉 ¡Gracias por suscribirte a ${TELEGRAM_CHANNEL_HANDLE}!\n` +
    "Aquí tienes tu curso introductorio gratuito de criptomonedas en PDF.",

  ready:
    "📚 ¡Tu curso introductorio gratuito de criptomonedas está listo!\n" +
    "En él aprenderás sobre Bitcoin, stablecoins, P2P, wallets, seguridad digital y prevención de estafas.\n\n" +
    "Síguenos en nuestro canal para recibir más contenido educativo.\n" +
    "💚 Ruta Cripto Segura — Aprende antes de arriesgar.",

  /** The subscription could not be checked (Telegram or our setup had a problem). */
  verifyError:
    "⚠️ No pudimos verificar tu suscripción en este momento.\n" +
    "Inténtalo de nuevo en unos minutos.",

  /** The course was not sent (Telegram refused the file or the connection failed). */
  deliveryFailed:
    "⚠️ No pudimos enviarte tu curso en este momento.\n" +
    "Inténtalo de nuevo en unos minutos o escríbenos.",

  guideUnavailable:
    "⚠️ El curso todavía no está disponible.\n" +
    "Inténtalo de nuevo en unos minutos o escríbenos.",

  alreadySent:
    "📚 Ya te enviamos tu curso hace un momento.\n" +
    "Si no lo ves, revisa este chat o escríbenos.",

  dailyLimit:
    "Has alcanzado el límite de envíos de hoy.\n" +
    "Vuelve a intentarlo mañana o escríbenos si necesitas ayuda.",

  tooManyChecks:
    "Has hecho muchas verificaciones seguidas.\n" +
    "Espera un rato antes de volver a intentarlo o escríbenos.",

  channel:
    "📢 Nuestro canal oficial gratuito\n" +
    "Noticias, educación cripto y recursos gratuitos para aprender con mayor seguridad.",

  unknown:
    "No entendí tu mensaje.\n" +
    "Usa /guia para recibir tu curso introductorio gratuito o /ayuda para ver las opciones.",

  noFilesPlease:
    "Por seguridad, no necesitamos que nos envíes archivos ni datos personales.\n" +
    "Usa /guia para recibir tu curso introductorio gratuito o /ayuda para ver las opciones.",

  help:
    "🛡️ Ayuda de Ruta Cripto Segura\n\n" +
    "Comandos:\n" +
    "/start — iniciar el bot\n" +
    "/guia — obtener tu curso introductorio gratuito de criptomonedas (verificamos tu suscripción al canal)\n" +
    "/canal — abrir nuestro canal oficial gratuito\n" +
    "/ayuda — mostrar esta ayuda\n\n" +
    `📢 Canal oficial gratuito: ${TELEGRAM_CHANNEL_URL}\n` +
    `💬 Atención y consultas: ${TELEGRAM_MANAGER_HANDLE} (${TELEGRAM_MANAGER_URL})\n` +
    `🌐 Sitio web: ${SITE_URL}\n\n` +
    "🔒 Nunca te pediremos frases semilla, claves privadas, contraseñas, documentos ni dinero para entregarte el curso. " +
    "Si alguien lo hace en nombre de Ruta Cripto Segura, no respondas y escríbenos por los canales oficiales.\n\n" +
    "Contenido educativo e informativo. No constituye asesoramiento financiero personalizado.",
}

/** Short answers shown as a pop-up when a button is pressed (Telegram allows 200 characters). */
export const toasts = {
  confirmed: "✅ Suscripción confirmada",
  notSubscribed: "❌ Todavía no encontramos tu suscripción",
  error: "⚠️ No pudimos verificar ahora. Inténtalo de nuevo.",
  tooFast: "Un momento, estamos verificando…",
  limit: "Demasiadas verificaciones. Inténtalo más tarde.",
}

/** Messages for the administrators only. */
export const adminTexts = {
  guideMissing:
    "⚠️ Aviso técnico: alguien pidió la guía pero todavía no hay ningún PDF guardado.\n" +
    "Envíame el PDF como documento, con el texto /subir_guia en el pie.",
  guideRejected:
    "⚠️ Aviso técnico: Telegram no aceptó el archivo de la guía guardado.\n" +
    "Vuelve a subir el PDF: envíamelo como documento, con el texto /subir_guia en el pie.",
  channelAccess:
    "⚠️ Aviso técnico: no puedo comprobar las suscripciones del canal.\n" +
    "Revisa que el bot sea administrador del canal y que el canal sea el correcto.",
  badToken:
    "⚠️ Aviso técnico: Telegram rechazó el token del bot. Revisa TELEGRAM_BOT_TOKEN en la configuración del servidor.",
  uploadHint:
    "Para guardar este PDF como guía, envíalo de nuevo como documento con el texto /subir_guia en el pie.",
  notPdf: "Ese archivo no es un PDF. Envía la guía como documento PDF con el texto /subir_guia en el pie.",
  tooBig: "El PDF supera los 50 MB que permite Telegram a los bots.",
}
