// Telegram links of Ruta Cripto Segura — the single source for every button and every
// contact or legal text. Change an address here and the whole site follows.
// Plain strings only, no "@/" imports: the legal texts that read these values are also
// loaded outside Next.js (tests), where the alias does not exist.

/** Official free channel: crypto news, educational material, reviews, security, free learning. */
export const TELEGRAM_CHANNEL_NAME = "Ruta Cripto Segura"
export const TELEGRAM_CHANNEL_URL = "https://t.me/rutacriptosegura"

/** Official manager: user questions, help with the materials, collaboration. */
export const TELEGRAM_MANAGER_HANDLE = "@RutaCriptoSeguraAdmin"
export const TELEGRAM_MANAGER_URL = "https://t.me/RutaCriptoSeguraAdmin"

/**
 * The free-guide bot: it checks the channel subscription and sends the PDF guide. Every "get the
 * free course / guide" button of the site goes to it (see TELEGRAM_COURSE_URL). The subscribe
 * buttons keep pointing at the channel and the contact buttons at the manager.
 */
export const TELEGRAM_BOT_URL = "https://t.me/RutaCriptoSeguraBot"

/** Destination of every "Obtener curso / guía gratis" button: the free-guide bot. */
export const TELEGRAM_COURSE_URL: string = TELEGRAM_BOT_URL
