import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, SITE_URL } from "../contact"
import { TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_URL } from "../telegram"
import { LEGAL_OWNER } from "./config"

export const link = (label: string, href: string) => `[${label}](${href})`

export const EMAIL = link(CONTACT_EMAIL, CONTACT_EMAIL_HREF)
/** Official manager on Telegram (questions, help, collaboration). */
export const TG_MANAGER = link(TELEGRAM_MANAGER_URL, TELEGRAM_MANAGER_URL)
/** Official free channel on Telegram. */
export const TG_CHANNEL = link(TELEGRAM_CHANNEL_URL, TELEGRAM_CHANNEL_URL)
export const SITE = link(SITE_URL, SITE_URL)
export const OWNER = LEGAL_OWNER

export const COOKIES_LINK = link("Política de Cookies", "/politica-de-cookies")
export const PRIVACY_LINK = link("Política de Privacidad", "/politica-de-privacidad")
