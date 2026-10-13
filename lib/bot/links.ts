// The public addresses the bot shows in its messages and buttons.
//
// They live inside lib/bot on purpose: the bot does not read the site's own link configuration,
// so publishing the bot cannot change a single button of the website. The values are the official
// ones. When the site's central link files carry the same addresses, this file can become plain
// re-exports of them (export { ... } from "../telegram" / "../contact") — nothing else in lib/bot
// imports those files, so nothing else has to change.
// Plain strings only, no "@/" imports: the tests load this file outside Next.js, where the alias
// does not exist.

/** Official free channel: its subscribers get the free introductory course (a PDF). */
export const TELEGRAM_CHANNEL_HANDLE = "@rutacriptosegura"
export const TELEGRAM_CHANNEL_URL = "https://t.me/rutacriptosegura"

/** Official manager: questions, help with the materials, collaboration. */
export const TELEGRAM_MANAGER_HANDLE = "@RutaCriptoSeguraAdmin"
export const TELEGRAM_MANAGER_URL = "https://t.me/RutaCriptoSeguraAdmin"

/** The public website. */
export const SITE_URL = "https://crypto-education-landing-page.vercel.app/"
