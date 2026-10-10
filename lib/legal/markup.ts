import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  SITE_URL,
  TELEGRAM_ADMIN_URL,
  TELEGRAM_COMMUNITY_URL,
} from "../contact"
import { LEGAL_OWNER } from "./config"

export const link = (label: string, href: string) => `[${label}](${href})`

export const EMAIL = link(CONTACT_EMAIL, CONTACT_EMAIL_HREF)
export const TG_ADMIN = link(TELEGRAM_ADMIN_URL, TELEGRAM_ADMIN_URL)
export const TG_COMMUNITY = link(TELEGRAM_COMMUNITY_URL, TELEGRAM_COMMUNITY_URL)
export const SITE = link(SITE_URL, SITE_URL)
export const OWNER = LEGAL_OWNER

export const COOKIES_LINK = link("Política de Cookies", "/politica-de-cookies")
export const PRIVACY_LINK = link("Política de Privacidad", "/politica-de-privacidad")
