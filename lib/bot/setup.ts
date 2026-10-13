import type { ConfigResult } from "./config"
import { secretsOf } from "./config"
import { loadGuide } from "./guide"
import type { BotDeps } from "./handlers"
import { SITE_URL, TELEGRAM_CHANNEL_URL } from "./links"
import { secretsMatch } from "./security"
import type { ItemState, SetupItem, SetupItemId, SetupReport, SetupStep } from "./setup-types"
import type { Store } from "./store"
import { TelegramApiError } from "./telegram-api"
import type { BotCommand, WebhookInfo } from "./types"

// One-time connection of the bot from the browser (page /telegram-setup, route /api/telegram/setup).
// What it can do is deliberately tiny and fixed: check the deployment, then set the bot's command menu
// and its webhook. The webhook address is a constant below — nothing the browser sends can change it.
// Every text built here is made of fixed phrases, numbers and public names, never of a secret.

type Env = Record<string, string | undefined>

/** The only address this page can ever hand to Telegram: the production site's webhook route. */
export const SETUP_WEBHOOK_URL = new URL("/api/telegram/webhook", SITE_URL).href
export const SETUP_ALLOWED_UPDATES = ["message", "callback_query"] as const
export const SETUP_MAX_CONNECTIONS = 10
/** The bot this deployment is meant for. A token that belongs to another bot is refused. */
export const SETUP_BOT_USERNAME = "RutaCriptoSeguraBot"
export const SETUP_KEY_MIN_LENGTH = 24

// Kept equal to COMMANDS in scripts/telegram/webhook.mjs (the same menu, set from the terminal there).
export const SETUP_COMMANDS: readonly BotCommand[] = [
  { command: "start", description: "Iniciar el bot" },
  { command: "guia", description: "Obtener la guía gratuita" },
  { command: "ayuda", description: "Ayuda y contacto" },
  { command: "canal", description: "Abrir el canal oficial gratuito" },
]

export const SETUP_MESSAGES = {
  notConfigured:
    "Настройка включена, но ключ не задан или недопустим. Добавьте в Vercel переменную TELEGRAM_SETUP_SECRET (не короче 24 символов и не совпадающую ни с одним другим секретом), сделайте Redeploy и обновите страницу.",
  unauthorized: "Неверный ключ настройки.",
  rateLimited: "Слишком много попыток. Подождите около 15 минут и повторите.",
  invalid: "Запрос не распознан. Обновите страницу и повторите.",
  crossSite: `Откройте страницу по адресу ${new URL("/telegram-setup", SITE_URL).href} и повторите.`,
  checksFailed: "Подключение не выполнено: сначала исправьте пункты с ошибкой. Ничего не изменено.",
  serverError: "Внутренняя ошибка сервера. Повторите через минуту.",
} as const

const clean = (value: string | undefined): string => (value ?? "").trim()

// --- switch and key ------------------------------------------------------------------------------

export type SetupConfig =
  /** Switch off (the default): the page and the route do not exist. */
  | { state: "disabled" }
  /** Switch on, but the key is missing, too weak or reused: nothing can be done until it is fixed. */
  | { state: "misconfigured" }
  | { state: "ready"; key: string }

const KEY_PATTERN = /^[\x21-\x7e]{24,128}$/

export function isSetupEnabled(env: Env): boolean {
  return clean(env.TELEGRAM_SETUP_ENABLED).toLowerCase() === "true"
}

export function loadSetupConfig(env: Env = process.env): SetupConfig {
  if (!isSetupEnabled(env)) return { state: "disabled" }
  const key = clean(env.TELEGRAM_SETUP_SECRET)
  if (!KEY_PATTERN.test(key)) return { state: "misconfigured" }
  // A separate key: the one typed into a web form must not double as the bot's token or any other secret.
  const others = [env.TELEGRAM_WEBHOOK_SECRET, env.TELEGRAM_BOT_TOKEN, env.KV_REST_API_TOKEN, env.KV_REST_API_READ_ONLY_TOKEN, env.UPSTASH_REDIS_REST_TOKEN]
  if (others.some((other) => clean(other) !== "" && secretsMatch(key, clean(other)))) return { state: "misconfigured" }
  return { state: "ready", key }
}

/** Every secret this process may hold, for the logger and for the last scrub of a response. */
export function knownSecrets(env: Env): string[] {
  const token = clean(env.TELEGRAM_BOT_TOKEN)
  const list = [token, token.split(":")[1], env.TELEGRAM_WEBHOOK_SECRET, env.KV_REST_API_TOKEN, env.KV_REST_API_READ_ONLY_TOKEN, env.UPSTASH_REDIS_REST_TOKEN, env.TELEGRAM_SETUP_SECRET]
  return [...new Set(list.map(clean).filter((value) => value.length >= 8))]
}

export function scrub(text: string, secrets: readonly string[]): string {
  return secrets.reduce((acc, secret) => (secret ? acc.split(secret).join("[скрыто]") : acc), text)
}

// --- report building -----------------------------------------------------------------------------

const item = (id: SetupItemId, title: string, state: ItemState, summary: string, details?: string[]): SetupItem => ({ id, title, state, summary, ...(details ? { details } : {}) })

const channelHandle = () => `@${new URL(TELEGRAM_CHANNEL_URL).pathname.replace(/^\/+|\/+$/g, "")}`

const REQUIRED_VARIABLES = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "KV_REST_API_URL", "KV_REST_API_TOKEN"] as const

/** Which variables are fine and which are not — by name only, never a value. */
function environmentItem(result: ConfigResult): SetupItem {
  const missing = new Set(result.ok ? [] : result.missing)
  // The Redis address may also come from the upstash.com names; show the problem under the name to fix.
  const invalid = new Set((result.ok ? [] : result.invalid).map((name) => (name === "UPSTASH_REDIS_REST_URL" ? "KV_REST_API_URL" : name)))
  const stateOf = (name: string) => (invalid.has(name) ? "неверный формат" : missing.has(name) ? "нет" : "есть")

  const details: string[] = []
  const redisFine = stateOf("KV_REST_API_URL") === "есть" && stateOf("KV_REST_API_TOKEN") === "есть"
  for (const name of REQUIRED_VARIABLES) {
    if (redisFine && name.startsWith("KV_")) continue
    details.push(`${name} — ${stateOf(name)}`)
  }
  if (redisFine) details.push("KV_REST_API_URL и KV_REST_API_TOKEN (Redis) — есть")
  for (const name of invalid) if (!(REQUIRED_VARIABLES as readonly string[]).includes(name)) details.push(`${name} — неверный формат`)

  return result.ok
    ? item("env", "Переменные окружения", "ok", "Все обязательные переменные заданы и выглядят правильно.", details)
    : item("env", "Переменные окружения", "fail", "С переменными есть проблемы: исправьте их в Vercel (Settings → Environment Variables) и сделайте Redeploy.", details)
}

/** What can be said before any network call, when the bot's own configuration is incomplete. */
export function reportWithoutConfig(failure: Extract<ConfigResult, { ok: false }>, now: Date = new Date()): SetupReport {
  const skipped = (id: SetupItemId, title: string) => item(id, title, "skipped", "Пропущено: сначала исправьте переменные окружения.")
  return {
    canConnect: false,
    connected: false,
    checkedAt: now.toISOString(),
    items: [environmentItem(failure), skipped("bot", "Бот"), skipped("channel", `Канал ${channelHandle()}`), skipped("redis", "Redis (Upstash)"), skipped("webhook", "Webhook")],
  }
}

/** A Telegram failure in plain words. Only the kind is used, so no text from the request can leak into it. */
function explain(error: unknown): string {
  if (error instanceof TelegramApiError) {
    switch (error.kind) {
      case "unauthorized":
        return "Telegram не принял токен: он неверный или отозван. Проверьте TELEGRAM_BOT_TOKEN в Vercel."
      case "network":
        return "Не удалось связаться с Telegram. Повторите через минуту."
      case "rate_limited":
        return "Telegram просит подождать из-за частых запросов. Повторите через минуту."
      case "server":
        return "Telegram временно недоступен. Повторите позже."
      case "chat_not_found":
        return "Канал не найден или бот не добавлен в него."
      case "not_enough_rights":
        return "У бота нет прав видеть участников канала: сделайте его администратором."
      default:
        return "Telegram отклонил запрос."
    }
  }
  return "Неожиданная ошибка при обращении к Telegram."
}

async function attempt<T>(work: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await work() }
  } catch (error) {
    return { ok: false, error }
  }
}

/** Writes, reads and removes a throw-away key: a read-only Redis token passes PING but fails here. */
async function probeStore(store: Store): Promise<boolean> {
  const nonce = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  const key = `setup:probe:${nonce}`
  await store.set(key, nonce, 30)
  const back = await store.get(key)
  await store.del(key)
  return back === nonce
}

const sameSet = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((value) => b.includes(value))

export type WebhookState = "not_set" | "ok" | "needs_update" | "different"

export function describeWebhook(info: WebhookInfo, secrets: readonly string[] = []): { state: WebhookState; item: SetupItem } {
  const url = clean(info.url)
  const events = (info.allowed_updates ?? []).filter((name) => typeof name === "string")
  const wanted = `События: ${SETUP_ALLOWED_UPDATES.join(", ")}`

  let state: WebhookState
  if (!url) state = "not_set"
  else if (url !== SETUP_WEBHOOK_URL) state = "different"
  else state = sameSet(events, SETUP_ALLOWED_UPDATES) ? "ok" : "needs_update"

  if (state === "not_set") {
    return { state, item: item("webhook", "Webhook", "info", "Ещё не подключён — это нормально до нажатия «Подключить Telegram».", [`Будет подключён адрес: ${SETUP_WEBHOOK_URL}`, wanted]) }
  }
  if (state === "different") {
    // A foreign address could carry a secret in its query string, so it is never shown.
    return { state, item: item("webhook", "Webhook", "warn", "Сейчас подключён другой адрес (он скрыт). Кнопка «Подключить Telegram» заменит его адресом сайта.", [`Будет подключён адрес: ${SETUP_WEBHOOK_URL}`, wanted]) }
  }
  if (state === "needs_update") {
    return { state, item: item("webhook", "Webhook", "warn", "Адрес верный, но набор событий отличается. Кнопка «Подключить Telegram» исправит его.", [`Адрес: ${SETUP_WEBHOOK_URL}`, `События сейчас: ${events.join(", ") || "по умолчанию"}`, wanted]) }
  }

  const details = [`Адрес: ${SETUP_WEBHOOK_URL}`, wanted, `Ожидают доставки: ${Number(info.pending_update_count) || 0}`]
  if (info.last_error_message) {
    const when = info.last_error_date ? ` (${new Date(info.last_error_date * 1000).toISOString()})` : ""
    const text = scrub(info.last_error_message, secrets).replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, " ").slice(0, 200)
    details.push(`Последняя ошибка доставки${when}: ${text}`)
    return { state, item: item("webhook", "Webhook", "warn", "Подключён правильно, но Telegram сообщает об ошибке доставки (она могла остаться от прошлых попыток).", details) }
  }
  return { state, item: item("webhook", "Webhook", "ok", "Подключён правильно: адрес и набор событий совпадают.", details) }
}

// --- the checks ----------------------------------------------------------------------------------

export type SetupDeps = Pick<BotDeps, "config" | "api" | "store" | "now">

/**
 * Looks at everything the bot needs and changes nothing. A missing PDF or missing administrators
 * are reported but never block the connection; a wrong bot, a bot that is not the channel's
 * administrator, or an unusable Redis do.
 */
export async function checkSetup(deps: SetupDeps): Promise<SetupReport> {
  const { config, api, store } = deps
  const secrets = secretsOf(config)
  const items: SetupItem[] = [environmentItem({ ok: true, config })]

  // Bot: the token must be valid AND belong to the expected bot.
  let botId: number | null = null
  const me = await attempt(() => api.getMe())
  if (!me.ok) {
    items.push(item("bot", "Бот", "fail", explain(me.error)))
  } else if ((me.value.username ?? "").toLowerCase() !== SETUP_BOT_USERNAME.toLowerCase()) {
    const other = me.value.username ? ` (@${scrub(me.value.username, secrets)})` : ""
    items.push(item("bot", "Бот", "fail", `Этот токен принадлежит другому боту${other}. Нужен @${SETUP_BOT_USERNAME}: проверьте TELEGRAM_BOT_TOKEN в Vercel.`))
  } else {
    botId = me.value.id
    items.push(item("bot", "Бот", "ok", `@${me.value.username} — токен действителен.`))
  }

  // Channel: Telegram only reveals subscribers to a bot that administers the channel.
  const channelTitle = `Канал ${config.channelChatId}`
  let channelOk = false
  const id = botId
  if (id === null) {
    items.push(item("channel", channelTitle, "skipped", "Пропущено: сначала нужен действующий токен бота."))
  } else {
    const member = await attempt(() => api.getChatMember(config.channelChatId, id))
    if (!member.ok) {
      items.push(item("channel", channelTitle, "fail", explain(member.error)))
    } else if (member.value.status === "administrator" || member.value.status === "creator") {
      channelOk = true
      items.push(item("channel", channelTitle, "ok", member.value.status === "creator" ? "Бот — владелец канала." : "Бот — администратор канала."))
    } else if (member.value.status === "member") {
      items.push(item("channel", channelTitle, "fail", "Бот состоит в канале, но не администратор. Сделайте его администратором (права на публикацию не нужны)."))
    } else {
      items.push(item("channel", channelTitle, "fail", "Бот не состоит в канале. Добавьте его в канал администратором."))
    }
  }

  // Redis: a real write and read, not just a ping.
  const redis = await attempt(() => probeStore(store))
  const redisOk = redis.ok && redis.value
  items.push(
    redisOk
      ? item("redis", "Redis (Upstash)", "ok", "Доступен: запись и чтение работают.")
      : item("redis", "Redis (Upstash)", "fail", "Redis недоступен или токен только для чтения. Проверьте KV_REST_API_URL и KV_REST_API_TOKEN: нужен токен с правом записи, не READ_ONLY."),
  )

  // Webhook: what Telegram has now, compared with what this page would set.
  let connected = false
  if (id === null) {
    items.push(item("webhook", "Webhook", "skipped", "Пропущено: сначала нужен действующий токен бота."))
  } else {
    const info = await attempt(() => api.getWebhookInfo())
    if (!info.ok) {
      items.push(item("webhook", "Webhook", "warn", `Не удалось прочитать состояние webhook. ${explain(info.error)}`))
    } else {
      const described = describeWebhook(info.value, secrets)
      connected = described.state === "ok"
      items.push(described.item)
    }
  }

  // Information only — neither of these may stop the first connection.
  if (!redisOk) {
    items.push(item("guide", "PDF-гайд", "skipped", "Пропущено: Redis недоступен."))
  } else {
    const guide = await attempt(() => loadGuide(store, config))
    items.push(
      guide.ok && guide.value
        ? item("guide", "PDF-гайд", "ok", "Загружен — бот готов выдавать гайд.")
        : item("guide", "PDF-гайд", "info", "Ещё не загружен. Это не мешает подключению: PDF загружается следующим шагом."),
    )
  }
  items.push(
    config.adminUserIds.size > 0
      ? item("admins", "Администраторы бота", "ok", `Заданы: ${config.adminUserIds.size}.`)
      : item("admins", "Администраторы бота", "info", "Не заданы. Понадобятся позже для загрузки PDF (переменная TELEGRAM_ADMIN_USER_IDS)."),
  )

  return { canConnect: botId !== null && channelOk && redisOk, connected, items, checkedAt: (deps.now ? deps.now() : new Date()).toISOString() }
}

// --- the connection ------------------------------------------------------------------------------

export type ConnectResult =
  /** Checks passed, both Telegram calls succeeded and the webhook now reads back as intended. */
  | { status: "connected"; report: SetupReport; steps: SetupStep[] }
  /** A check failed, so nothing was changed in Telegram. */
  | { status: "blocked"; report: SetupReport }
  /** A Telegram call failed or the final state is not what was set. */
  | { status: "failed"; report: SetupReport; steps: SetupStep[]; message: string }

/**
 * Checks everything first; only if all is well sets the command menu and then the webhook, with the
 * existing TELEGRAM_WEBHOOK_SECRET as Telegram's secret_token, and finally reads the webhook back.
 */
export async function connectTelegram(deps: SetupDeps): Promise<ConnectResult> {
  const before = await checkSetup(deps)
  if (!before.canConnect) return { status: "blocked", report: before }

  const secrets = secretsOf(deps.config)
  const steps: SetupStep[] = []
  const failure = (title: string, id: SetupStep["id"], error: unknown): ConnectResult => {
    steps.push({ id, title, ok: false })
    // For a rejected request Telegram's own sentence ("bad webhook: …") is what explains it; it never holds our secrets.
    const detail = error instanceof TelegramApiError && (error.kind === "bad_request" || error.kind === "other") ? ` (Telegram: ${scrub(error.message, secrets).replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, " ").slice(0, 160)})` : ""
    return { status: "failed", report: before, steps, message: `${title}: не удалось. ${explain(error)}${detail}` }
  }

  const commands = await attempt(() => deps.api.setMyCommands(SETUP_COMMANDS))
  if (!commands.ok) return failure("Меню команд бота", "commands", commands.error)
  steps.push({ id: "commands", title: "Меню команд бота задано", ok: true })

  const webhook = await attempt(() =>
    deps.api.setWebhook({ url: SETUP_WEBHOOK_URL, secretToken: deps.config.webhookSecret, allowedUpdates: SETUP_ALLOWED_UPDATES, maxConnections: SETUP_MAX_CONNECTIONS }),
  )
  if (!webhook.ok) return failure("Подключение webhook", "webhook", webhook.error)
  steps.push({ id: "webhook", title: "Webhook подключён", ok: true })

  const after = await checkSetup(deps)
  if (!after.connected) {
    return { status: "failed", report: after, steps, message: "Telegram принял команды, но состояние webhook отличается от ожидаемого. Нажмите «Проверить подключение» и посмотрите пункт Webhook." }
  }
  return { status: "connected", report: after, steps }
}
