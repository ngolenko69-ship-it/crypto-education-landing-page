import { loadGuide } from "./guide"
import type { BotDeps } from "./handlers"
import { TelegramApiError } from "./telegram-api"

// A read-only health check of the deployment, used before the webhook is switched on and any time
// something looks wrong. It reports yes/no facts and error kinds — never a token, secret or user.

export type StatusReport = {
  /** True when the bot can do its job: valid token, administrator of the channel, store reachable. */
  ok: boolean
  bot: { ok: boolean; id?: number; username?: string | null; error?: string }
  channel: { chat: string; ok: boolean; botStatus?: string; error?: string }
  store: { kind: string; ok: boolean }
  guide: { configured: boolean; source?: "store" | "env"; fileName?: string | null; size?: number | null; savedAt?: string }
  admins: number
  webhook: { url: string | null; pendingUpdates?: number; lastError?: string | null; lastErrorAt?: string | null; allowedUpdates?: string[]; error?: string }
  warnings: string[]
}

const kindOf = (error: unknown) => (error instanceof TelegramApiError ? error.kind : "error")

export async function collectStatus(deps: BotDeps): Promise<StatusReport> {
  const { api, store, config } = deps
  const warnings: string[] = []

  const report: StatusReport = {
    ok: false,
    bot: { ok: false },
    channel: { chat: config.channelChatId, ok: false },
    store: { kind: store.kind, ok: false },
    guide: { configured: false },
    admins: config.adminUserIds.size,
    webhook: { url: null },
    warnings,
  }

  try {
    const me = await api.getMe()
    report.bot = { ok: true, id: me.id, username: me.username }
    try {
      const member = await api.getChatMember(config.channelChatId, me.id)
      report.channel.botStatus = member.status
      report.channel.ok = member.status === "administrator" || member.status === "creator"
      if (!report.channel.ok) warnings.push("The bot is in the channel but is not an administrator: Telegram will not tell it who is subscribed.")
    } catch (error) {
      report.channel.error = kindOf(error)
    }
  } catch (error) {
    report.bot.error = kindOf(error)
  }

  try {
    report.store.ok = await store.ping()
  } catch {
    report.store.ok = false
  }

  try {
    const guide = await loadGuide(store, config)
    if (guide) report.guide = { configured: true, source: guide.source, fileName: guide.fileName, size: guide.size, savedAt: guide.savedAt || undefined }
  } catch {
    // A store that cannot be read is already reported above.
  }

  try {
    const info = await api.getWebhookInfo()
    report.webhook = {
      url: info.url || null,
      pendingUpdates: info.pending_update_count,
      lastError: info.last_error_message ?? null,
      lastErrorAt: info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
      allowedUpdates: info.allowed_updates,
    }
    if (!info.url) warnings.push("The webhook is not set yet.")
    if (info.last_error_message) warnings.push("Telegram reports a recent webhook delivery error.")
  } catch (error) {
    report.webhook.error = kindOf(error)
  }

  if (config.adminUserIds.size === 0) warnings.push("No administrators are configured (TELEGRAM_ADMIN_USER_IDS): the PDF cannot be uploaded through the bot.")
  if (!report.guide.configured) warnings.push("No guide PDF is stored yet.")

  report.ok = report.bot.ok && report.channel.ok && report.store.ok
  return report
}
