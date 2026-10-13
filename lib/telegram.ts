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
 * The bot that will check the channel subscription and send the PDF course. It does not
 * exist yet, so this stays null — never put a guessed address here. Once the bot is
 * created, set its real link (the full t.me address of the bot, as a string): only the
 * "get the free course" buttons switch to it (see TELEGRAM_COURSE_URL); the channel and
 * manager buttons stay as they are.
 */
export const TELEGRAM_BOT_URL: string | null = null

/**
 * Destination of every "Obtener curso / guía gratis" button: the bot once it exists,
 * the free channel until then.
 */
export const TELEGRAM_COURSE_URL: string = TELEGRAM_BOT_URL ?? TELEGRAM_CHANNEL_URL
