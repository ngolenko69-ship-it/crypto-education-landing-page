// Shapes shared by the server (lib/bot/setup.ts and the setup route) and the browser page.
// Plain data and constants only, no imports, so the page can use this file without pulling any
// server code into the browser. Everything the server puts into these shapes is built from fixed
// texts, numbers and public names — never from a token, a secret or a user.

export const SETUP_API_PATH = "/api/telegram/setup"
/** Public address of the bot, shown on the page after a successful connection. */
export const SETUP_BOT_CHAT_URL = "https://t.me/RutaCriptoSeguraBot"

export type SetupAction = "check" | "connect"

export type ItemState = "ok" | "fail" | "warn" | "info" | "skipped"

export type SetupItemId = "env" | "bot" | "channel" | "redis" | "webhook" | "guide" | "admins"

export type SetupItem = {
  id: SetupItemId
  title: string
  state: ItemState
  /** One short sentence for the owner. */
  summary: string
  /** Extra lines: variable names with their state, webhook facts. Never a value. */
  details?: string[]
}

export type SetupReport = {
  /** Every blocking check passed, so the connect button may be used. */
  canConnect: boolean
  /** The webhook is already connected exactly as intended. */
  connected: boolean
  items: SetupItem[]
  checkedAt: string
}

export type SetupStep = { id: "commands" | "webhook"; title: string; ok: boolean }

export type SetupErrorCode =
  | "unauthorized"
  | "rate_limited"
  | "not_configured"
  | "invalid_request"
  | "cross_site"
  | "checks_failed"
  | "telegram_error"
  | "server_error"

export type SetupResponse =
  | { ok: true; action: "check"; report: SetupReport }
  | { ok: true; action: "connect"; report: SetupReport; steps: SetupStep[] }
  | { ok: false; error: SetupErrorCode; message: string; report?: SetupReport; steps?: SetupStep[] }
