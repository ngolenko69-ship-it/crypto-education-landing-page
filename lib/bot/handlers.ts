import type { BotConfig } from "./config"
import { loadGuide, MAIN_GUIDE, saveGuide } from "./guide"
import {
  ALERT_THROTTLE_SECONDS,
  DAY_SECONDS,
  DELIVER_LOCK_SECONDS,
  DELIVER_PER_DAY,
  DELIVERY_RECORD_SECONDS,
  FLOOD_PER_MINUTE,
  MAX_DOCUMENT_BYTES,
  VERIFY_MIN_INTERVAL_SECONDS,
  VERIFY_PER_HOUR,
} from "./limits"
import { describeError, type Logger } from "./log"
import { adminTexts, CALLBACK_VERIFY, keyboards, texts, toasts } from "./messages"
import { pseudonym } from "./security"
import { bump, readStats } from "./stats"
import type { Store } from "./store"
import { checkSubscription } from "./subscription"
import { TelegramApiError, type TelegramApi } from "./telegram-api"
import type { InlineKeyboard, TgCallbackQuery, TgDocument, TgMessage, TgUpdate } from "./types"

export type BotDeps = {
  config: BotConfig
  api: TelegramApi
  store: Store
  log: Logger
  now?: () => Date
}

export async function handleUpdate(update: TgUpdate, ctx: BotDeps): Promise<void> {
  // Telegram user ids are integers; anything else is not a real update and is ignored.
  const senderId = update.callback_query?.from?.id ?? update.message?.from?.id
  if (senderId !== undefined && !Number.isSafeInteger(senderId)) return

  if (update.callback_query) return onCallback(update.callback_query, ctx)
  if (update.message) return onMessage(update.message, ctx)
}

// ───────────────────────────── helpers ─────────────────────────────

const pid = (ctx: BotDeps, userId: number) => pseudonym(ctx.config.webhookSecret, userId)
const isAdmin = (ctx: BotDeps, userId: number) => ctx.config.adminUserIds.has(userId)
const nowIso = (ctx: BotDeps) => (ctx.now ? ctx.now() : new Date()).toISOString()

/** Sends a message to a person. False when they can no longer be reached (blocked the bot). */
async function say(ctx: BotDeps, userId: number, text: string, keyboard?: InlineKeyboard): Promise<boolean> {
  try {
    await ctx.api.sendMessage(userId, text, keyboard)
    return true
  } catch (error) {
    if (error instanceof TelegramApiError && error.unreachable) {
      ctx.log.info("user_unreachable", { uid: pid(ctx, userId).slice(0, 8) })
      return false
    }
    throw error
  }
}

function parseCommand(text: string | undefined): { name: string; args: string } | null {
  const match = /^\/([A-Za-z0-9_]{1,32})(?:@[A-Za-z0-9_]+)?(?:\s+([\s\S]*))?$/.exec((text ?? "").trim())
  return match ? { name: match[1].toLowerCase(), args: (match[2] ?? "").trim() } : null
}

/** Tells the administrators about a technical problem, at most once per kind per hour. Never throws. */
async function alertAdmins(ctx: BotDeps, kind: string, text: string): Promise<void> {
  try {
    if (ctx.config.adminUserIds.size === 0) {
      ctx.log.warn("alert_without_admins", { kind })
      return
    }
    if (!(await ctx.store.setIfAbsent(`al:${kind}`, "1", ALERT_THROTTLE_SECONDS))) return
    for (const adminId of ctx.config.adminUserIds) {
      try {
        await ctx.api.sendMessage(adminId, text)
      } catch (error) {
        ctx.log.info("alert_not_delivered", describeError(error))
      }
    }
  } catch (error) {
    ctx.log.warn("alert_failed", describeError(error))
  }
}

async function withinFloodLimit(ctx: BotDeps, userId: number): Promise<boolean> {
  const count = await ctx.store.incr(`fl:${pid(ctx, userId)}`, 60)
  if (count > FLOOD_PER_MINUTE) {
    ctx.log.info("flood_ignored", { uid: pid(ctx, userId).slice(0, 8) })
    return false
  }
  return true
}

/** Answers a pressed button exactly once; failures (an expired button) never matter. */
type Responder = { answer(text?: string): Promise<void>; finish(): Promise<void> }

/** Commands have no button to answer. */
const commandResponder: Responder = { answer: async () => undefined, finish: async () => undefined }

function buttonResponder(ctx: BotDeps, queryId: string): Responder {
  let answered = false
  const answer = async (text?: string) => {
    if (answered) return
    answered = true
    try {
      await ctx.api.answerCallbackQuery(queryId, text)
    } catch (error) {
      ctx.log.info("answer_callback_failed", describeError(error))
    }
  }
  return { answer, finish: () => answer() }
}

// ───────────────────────────── messages ─────────────────────────────

async function onMessage(message: TgMessage, ctx: BotDeps): Promise<void> {
  const from = message.from
  // Only people talking to the bot privately: groups, channels and other bots are ignored.
  if (!from || from.is_bot || message.chat?.type !== "private") return
  const userId = from.id

  if (!(await withinFloodLimit(ctx, userId))) return
  if (message.document) return onDocument(ctx, userId, message.document, message.caption)

  const command = parseCommand(message.text)
  if (!command) {
    await say(ctx, userId, texts.unknown)
    return
  }

  switch (command.name) {
    case "start":
      await bump(ctx.store, "start")
      if (command.args === "web") await bump(ctx.store, "start_web")
      await say(ctx, userId, texts.welcome, keyboards.subscribe)
      return
    case "guia":
      await verifyAndDeliver(ctx, userId, commandResponder)
      return
    case "ayuda":
      await say(ctx, userId, texts.help, keyboards.help)
      return
    case "canal":
      await say(ctx, userId, texts.channel, keyboards.channel)
      return
    case "id":
      // Lets the owner find the number to put in TELEGRAM_ADMIN_USER_IDS; it only ever shows the sender's own id.
      await say(ctx, userId, `Tu ID de Telegram es ${userId}.`)
      return
    case "estado":
      if (isAdmin(ctx, userId)) await sendStatus(ctx, userId)
      else await say(ctx, userId, texts.unknown)
      return
    case "subir_guia":
      await say(ctx, userId, isAdmin(ctx, userId) ? adminTexts.uploadHint : texts.unknown)
      return
    default:
      await say(ctx, userId, texts.unknown)
  }
}

async function onCallback(query: TgCallbackQuery, ctx: BotDeps): Promise<void> {
  const responder = buttonResponder(ctx, query.id)
  try {
    if (query.from.is_bot || query.data !== CALLBACK_VERIFY) return
    if (!(await withinFloodLimit(ctx, query.from.id))) return
    await verifyAndDeliver(ctx, query.from.id, responder)
  } finally {
    // Whatever happened, the button must stop spinning.
    await responder.finish()
  }
}

// ───────────────────────────── subscription + delivery ─────────────────────────────

async function verifyGate(ctx: BotDeps, userId: number): Promise<"ok" | "too_fast" | "limit"> {
  const id = pid(ctx, userId)
  if (!(await ctx.store.setIfAbsent(`vg:${id}`, "1", VERIFY_MIN_INTERVAL_SECONDS))) return "too_fast"
  const perHour = await ctx.store.incr(`vh:${id}`, 3600)
  return perHour > VERIFY_PER_HOUR ? "limit" : "ok"
}

async function verifyAndDeliver(ctx: BotDeps, userId: number, responder: Responder): Promise<void> {
  const gate = await verifyGate(ctx, userId)
  if (gate === "too_fast") {
    await responder.answer(toasts.tooFast)
    return
  }
  if (gate === "limit") {
    await responder.answer(toasts.limit)
    await say(ctx, userId, texts.tooManyChecks, keyboards.contact)
    return
  }

  const check = await checkSubscription(ctx.api, ctx.config.channelChatId, userId)

  if (check.state === "error") {
    await bump(ctx.store, "verify_error")
    ctx.log.error("subscription_check_failed", describeError(check.error))
    await responder.answer(toasts.error)
    await say(ctx, userId, texts.verifyError, keyboards.retry)
    // The person comes first; the administrators are told afterwards.
    if (check.error.kind === "chat_not_found" || check.error.kind === "not_enough_rights") await alertAdmins(ctx, "channel_access", adminTexts.channelAccess)
    if (check.error.kind === "unauthorized") await alertAdmins(ctx, "bad_token", adminTexts.badToken)
    return
  }

  if (check.state === "not_subscribed") {
    await bump(ctx.store, "verify_no")
    await responder.answer(toasts.notSubscribed)
    await say(ctx, userId, texts.notSubscribed, keyboards.subscribe)
    return
  }

  await bump(ctx.store, "verify_ok")
  await responder.answer(toasts.confirmed)
  await deliverGuide(ctx, userId)
}

async function deliverGuide(ctx: BotDeps, userId: number): Promise<void> {
  const id = pid(ctx, userId)
  const lockKey = `lock:${id}`

  // One delivery at a time per person: a double tap or a re-delivered update cannot send the file twice.
  if (!(await ctx.store.setIfAbsent(lockKey, "1", DELIVER_LOCK_SECONDS))) {
    await say(ctx, userId, texts.alreadySent)
    return
  }

  let delivered = false
  try {
    const sentToday = Number((await ctx.store.get(`cap:${id}`)) ?? 0)
    if (sentToday >= DELIVER_PER_DAY) {
      await say(ctx, userId, texts.dailyLimit)
      return
    }

    const guide = await loadGuide(ctx.store, ctx.config)
    if (!guide) {
      await say(ctx, userId, texts.guideUnavailable, keyboards.contact)
      await alertAdmins(ctx, "guide_missing", adminTexts.guideMissing)
      return
    }

    if (!(await say(ctx, userId, texts.confirmed))) return

    try {
      await ctx.api.sendDocument(userId, guide.fileId)
    } catch (error) {
      if (!(error instanceof TelegramApiError)) throw error
      await bump(ctx.store, "delivery_failed")
      ctx.log.error("guide_send_failed", describeError(error))
      if (!error.unreachable) await say(ctx, userId, texts.deliveryFailed, keyboards.retry)
      if (error.kind === "bad_file") await alertAdmins(ctx, "guide_rejected", adminTexts.guideRejected)
      return
    }
    delivered = true

    // The file is out. Nothing below may fail the request or send it again.
    try {
      await say(ctx, userId, texts.ready, keyboards.contact)
    } catch (error) {
      ctx.log.warn("ready_message_failed", describeError(error))
    }
    try {
      await ctx.store.incr(`cap:${id}`, DAY_SECONDS)
      await recordDelivery(ctx, id)
    } catch (error) {
      ctx.log.warn("delivery_record_failed", describeError(error))
    }
  } finally {
    // A failed attempt must not block the person's next try.
    if (!delivered) await ctx.store.del(lockKey).catch(() => undefined)
  }
}

/** Keeps when a person first and last received the guide — under their pseudonym — and counts it. */
async function recordDelivery(ctx: BotDeps, id: string): Promise<void> {
  const key = `dr:${id}`
  const now = nowIso(ctx)
  const previous = await ctx.store.get(key)
  let record = { first: now, last: now, n: 1 }
  if (previous) {
    try {
      const old = JSON.parse(previous) as { first?: string; n?: number }
      record = { first: old.first ?? now, last: now, n: (old.n ?? 0) + 1 }
    } catch {
      // A damaged record is simply replaced.
    }
  }
  await ctx.store.set(key, JSON.stringify(record), DELIVERY_RECORD_SECONDS)
  await bump(ctx.store, "delivered")
  if (!previous) await bump(ctx.store, "unique_users")
}

// ───────────────────────────── administrators ─────────────────────────────

/** "/subir_guia" or "/subir_guia otro_id" in the caption of a PDF. */
function parseUploadCaption(caption: string | undefined): { id: string } | null {
  const match = /^\/subir_guia(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]{1,32}))?\s*$/.exec((caption ?? "").trim())
  return match ? { id: (match[1] ?? MAIN_GUIDE).toLowerCase() } : null
}

async function onDocument(ctx: BotDeps, userId: number, document: TgDocument, caption: string | undefined): Promise<void> {
  // Nobody but an administrator can change the guide; everyone else is told the bot takes no files.
  if (!isAdmin(ctx, userId)) {
    await say(ctx, userId, texts.noFilesPlease)
    return
  }

  const upload = parseUploadCaption(caption)
  if (!upload) {
    await say(ctx, userId, adminTexts.uploadHint)
    return
  }
  if (document.mime_type !== "application/pdf" && !/\.pdf$/i.test(document.file_name ?? "")) {
    await say(ctx, userId, adminTexts.notPdf)
    return
  }
  if ((document.file_size ?? 0) > MAX_DOCUMENT_BYTES) {
    await say(ctx, userId, adminTexts.tooBig)
    return
  }

  await saveGuide(ctx.store, upload.id, {
    fileId: document.file_id,
    fileName: document.file_name ?? null,
    size: document.file_size ?? null,
    savedAt: nowIso(ctx),
  })
  const megabytes = document.file_size ? ` (${(document.file_size / 1024 / 1024).toFixed(1)} MB)` : ""
  ctx.log.info("guide_saved", { guide: upload.id })
  await say(ctx, userId, `✅ Guía guardada (${upload.id}).\nArchivo: ${document.file_name ?? "sin nombre"}${megabytes}\nPrueba el flujo completo con /guia.`)
}

async function sendStatus(ctx: BotDeps, userId: number): Promise<void> {
  const lines = ["📊 Estado del bot"]

  let storeOk = false
  try {
    storeOk = await ctx.store.ping()
  } catch {
    storeOk = false
  }
  lines.push(`Almacenamiento (${ctx.store.kind}): ${storeOk ? "✅ OK" : "❌ sin conexión"}`)

  try {
    const guide = await loadGuide(ctx.store, ctx.config)
    if (guide) {
      const size = guide.size ? ` (${(guide.size / 1024 / 1024).toFixed(1)} MB)` : ""
      lines.push(`Guía: ✅ ${guide.fileName ?? "archivo guardado"}${size} — origen: ${guide.source === "store" ? "subida por el bot" : "variable de entorno"}`)
    } else {
      lines.push("Guía: ❌ no configurada (envía el PDF con /subir_guia en el pie)")
    }
  } catch {
    lines.push("Guía: ❌ no se pudo leer")
  }

  try {
    const me = await ctx.api.getMe()
    const member = await ctx.api.getChatMember(ctx.config.channelChatId, me.id)
    lines.push(`Canal ${ctx.config.channelChatId}: el bot es «${member.status}»${member.status === "administrator" || member.status === "creator" ? " ✅" : " ⚠️ debe ser administrador"}`)
  } catch (error) {
    lines.push(`Canal ${ctx.config.channelChatId}: ❌ no se pudo comprobar (${error instanceof TelegramApiError ? error.kind : "error"})`)
  }

  try {
    const stats = await readStats(ctx.store, ctx.now ? ctx.now() : new Date())
    const row = (label: string, s: typeof stats.today) =>
      `${label}: inicios ${s.start} (web ${s.start_web}) · suscritos ${s.verify_ok} · sin suscripción ${s.verify_no} · errores ${s.verify_error} · guías enviadas ${s.delivered}`
    lines.push("", row("Hoy", stats.today), row("7 días", stats.week), `Total: personas únicas ${stats.total.unique_users} · guías enviadas ${stats.total.delivered}`)
  } catch {
    lines.push("", "Estadísticas: no disponibles")
  }

  await say(ctx, userId, lines.join("\n"))
}
