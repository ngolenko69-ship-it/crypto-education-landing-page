import { TELEGRAM_CHANNEL_URL } from "../telegram"

// Server-side configuration of the bot, read from environment variables only.
// Nothing here is imported by a client component, and no variable starts with NEXT_PUBLIC_.

export type BotConfig = {
  /** BotFather token. Server-only secret. */
  token: string
  /** Value Telegram sends in X-Telegram-Bot-Api-Secret-Token. Server-only secret. */
  webhookSecret: string
  /** The free channel whose subscribers get the guide: "@handle" or a numeric id. */
  channelChatId: string
  /** Telegram user ids allowed to use the admin commands (upload the PDF, /estado). */
  adminUserIds: ReadonlySet<number>
  /** Optional emergency copy of the guide's file_id, used when the store has none. */
  guideFileIdFallback: string | null
  apiBase: string
  store: { kind: "upstash"; url: string; token: string } | { kind: "memory" }
}

export type ConfigResult =
  | { ok: true; config: BotConfig }
  | { ok: false; missing: string[]; invalid: string[] }

type Env = Record<string, string | undefined>

const DEFAULT_API_BASE = "https://api.telegram.org"
const SECRET_PATTERN = /^[A-Za-z0-9_-]{16,256}$/
const TOKEN_PATTERN = /^\d{5,15}:[A-Za-z0-9_-]{20,}$/

function clean(value: string | undefined): string {
  return (value ?? "").trim()
}

/** "https://t.me/rutacriptosegura" -> "@rutacriptosegura" (from the same constant the site uses). */
function defaultChannelChatId(): string {
  const handle = new URL(TELEGRAM_CHANNEL_URL).pathname.replace(/^\/+|\/+$/g, "")
  return `@${handle}`
}

export function parseAdminIds(raw: string | undefined): Set<number> {
  const ids = new Set<number>()
  for (const part of clean(raw).split(/[\s,;]+/)) {
    if (/^\d{1,15}$/.test(part)) ids.add(Number(part))
  }
  return ids
}

function isLocalHttp(url: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url)
}

export function loadConfig(env: Env = process.env): ConfigResult {
  const missing: string[] = []
  const invalid: string[] = []
  const production = env.VERCEL_ENV === "production"

  const token = clean(env.TELEGRAM_BOT_TOKEN)
  if (!token) missing.push("TELEGRAM_BOT_TOKEN")
  else if (!TOKEN_PATTERN.test(token)) invalid.push("TELEGRAM_BOT_TOKEN")

  const webhookSecret = clean(env.TELEGRAM_WEBHOOK_SECRET)
  if (!webhookSecret) missing.push("TELEGRAM_WEBHOOK_SECRET")
  else if (!SECRET_PATTERN.test(webhookSecret)) invalid.push("TELEGRAM_WEBHOOK_SECRET")

  const channelChatId = clean(env.TELEGRAM_CHANNEL_CHAT_ID) || defaultChannelChatId()
  if (!/^(@[A-Za-z][A-Za-z0-9_]{3,}|-?\d{5,20})$/.test(channelChatId)) invalid.push("TELEGRAM_CHANNEL_CHAT_ID")

  let store: BotConfig["store"] | null = null
  const redisUrl = clean(env.UPSTASH_REDIS_REST_URL) || clean(env.KV_REST_API_URL)
  const redisToken = clean(env.UPSTASH_REDIS_REST_TOKEN) || clean(env.KV_REST_API_TOKEN)
  if (clean(env.TELEGRAM_BOT_STORE) === "memory" && !production) {
    // Only for local development and tests: a serverless instance forgets everything, so the
    // production environment never accepts it.
    store = { kind: "memory" }
  } else if (redisUrl && redisToken) {
    if (/^https:\/\//.test(redisUrl) || isLocalHttp(redisUrl)) store = { kind: "upstash", url: redisUrl.replace(/\/+$/, ""), token: redisToken }
    else invalid.push("UPSTASH_REDIS_REST_URL")
  } else {
    if (!redisUrl) missing.push("UPSTASH_REDIS_REST_URL")
    if (!redisToken) missing.push("UPSTASH_REDIS_REST_TOKEN")
  }

  // A different API base exists only to point tests at a fake Telegram; production ignores it.
  const requestedBase = clean(env.TELEGRAM_API_BASE)
  const apiBase = !production && requestedBase && (/^https:\/\//.test(requestedBase) || isLocalHttp(requestedBase)) ? requestedBase.replace(/\/+$/, "") : DEFAULT_API_BASE

  if (missing.length > 0 || invalid.length > 0 || !store) return { ok: false, missing, invalid }

  return {
    ok: true,
    config: {
      token,
      webhookSecret,
      channelChatId,
      adminUserIds: parseAdminIds(env.TELEGRAM_ADMIN_USER_IDS),
      guideFileIdFallback: clean(env.TELEGRAM_GUIDE_FILE_ID) || null,
      apiBase,
      store,
    },
  }
}

/** Every secret the process holds, so the logger can strip them from anything it prints. */
export function secretsOf(config: BotConfig): string[] {
  const secrets = [config.token, config.webhookSecret]
  if (config.store.kind === "upstash") secrets.push(config.store.token)
  return secrets
}
