import { TELEGRAM_CHANNEL_URL } from "./links"

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

/** "https://t.me/rutacriptosegura" -> "@rutacriptosegura" (from the channel address in ./links). */
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

// The store's REST address and its read-write token, as a pair. KV_REST_API_URL / KV_REST_API_TOKEN are the
// names Vercel's Upstash integration creates, so they come first; UPSTASH_REDIS_REST_URL / _TOKEN are the names
// upstash.com itself uses. A pair counts only when both halves are set, and the two pairs are never mixed.
// KV_REST_API_READ_ONLY_TOKEN, KV_URL and REDIS_URL are deliberately not read: the bot writes, and a
// read-only token would only fail later, on the first write.
const REDIS_VARIABLES = [
  { url: "KV_REST_API_URL", token: "KV_REST_API_TOKEN" },
  { url: "UPSTASH_REDIS_REST_URL", token: "UPSTASH_REDIS_REST_TOKEN" },
] as const

function readRedisPair(env: Env): { url: string; token: string; urlName: string } | null {
  for (const names of REDIS_VARIABLES) {
    const url = clean(env[names.url])
    const token = clean(env[names.token])
    if (url && token) return { url, token, urlName: names.url }
  }
  return null
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
  const redis = readRedisPair(env)
  if (clean(env.TELEGRAM_BOT_STORE) === "memory" && !production) {
    // Only for local development and tests: a serverless instance forgets everything, so the
    // production environment never accepts it.
    store = { kind: "memory" }
  } else if (redis) {
    if (/^https:\/\//.test(redis.url) || isLocalHttp(redis.url)) store = { kind: "upstash", url: redis.url.replace(/\/+$/, ""), token: redis.token }
    else invalid.push(redis.urlName)
  } else {
    // No complete pair: name the KV_ pair, because that is the one to set on Vercel.
    if (!clean(env.KV_REST_API_URL)) missing.push("KV_REST_API_URL")
    if (!clean(env.KV_REST_API_TOKEN)) missing.push("KV_REST_API_TOKEN")
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
