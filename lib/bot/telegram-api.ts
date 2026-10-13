import type { InlineKeyboard, TgChatMember, WebhookInfo } from "./types"

// A small Telegram Bot API client on plain fetch: timeouts, one careful retry, and errors that
// never carry the request URL (the URL contains the bot token).

export type TelegramErrorKind =
  | "blocked" // the user blocked the bot or deleted the account
  | "chat_not_found"
  | "not_enough_rights"
  | "rate_limited"
  | "bad_file" // the stored file_id is not accepted by Telegram
  | "unauthorized" // wrong or revoked token
  | "network"
  | "server"
  | "bad_request"
  | "other"

export class TelegramApiError extends Error {
  readonly kind: TelegramErrorKind
  readonly code: number
  readonly retryAfter: number | null

  constructor(kind: TelegramErrorKind, code: number, message: string, retryAfter: number | null = null) {
    super(message)
    this.name = "TelegramApiError"
    this.kind = kind
    this.code = code
    this.retryAfter = retryAfter
  }

  /** A failure that may well succeed on a later attempt. */
  get transient(): boolean {
    return this.kind === "network" || this.kind === "server" || this.kind === "rate_limited"
  }

  /** The user cannot be reached any more; there is nothing to retry or apologise for. */
  get unreachable(): boolean {
    return this.kind === "blocked" || this.kind === "chat_not_found"
  }
}

export function classifyTelegramError(code: number, description: string): TelegramErrorKind {
  const text = description.toLowerCase()
  if (code === 401) return "unauthorized"
  if (code === 429) return "rate_limited"
  if (code >= 500) return "server"
  if (code === 403 && (text.includes("blocked by the user") || text.includes("user is deactivated") || text.includes("can't initiate conversation"))) return "blocked"
  if (text.includes("chat not found")) return "chat_not_found"
  if (
    text.includes("not enough rights") ||
    text.includes("administrator rights") ||
    text.includes("chat_admin_required") ||
    text.includes("member list is inaccessible") ||
    text.includes("not a member of the channel") ||
    text.includes("bot is not a member")
  ) {
    return "not_enough_rights"
  }
  if (text.includes("wrong file identifier") || text.includes("wrong remote file identifier") || text.includes("file reference")) return "bad_file"
  if (code === 400) return "bad_request"
  return "other"
}

export interface TelegramApi {
  getMe(): Promise<{ id: number; username: string | null }>
  getChatMember(chatId: string | number, userId: number): Promise<TgChatMember>
  sendMessage(chatId: number, text: string, replyMarkup?: InlineKeyboard): Promise<void>
  /** Sends an already uploaded file by its file_id. */
  sendDocument(chatId: number, fileId: string): Promise<void>
  answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void>
  getWebhookInfo(): Promise<WebhookInfo>
}

type TelegramEnvelope = {
  ok?: boolean
  result?: unknown
  error_code?: number
  description?: string
  parameters?: { retry_after?: number }
}

type CallOptions = {
  timeoutMs?: number
  /** Retry once after a network failure or a 5xx. Only for calls that are safe to repeat. */
  retryTransient?: boolean
}

export function createTelegramApi(options: {
  token: string
  apiBase: string
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
}): TelegramApi {
  const doFetch = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))

  async function once<T>(method: string, params: Record<string, unknown>, timeoutMs: number): Promise<T> {
    let response: Response
    try {
      response = await doFetch(`${options.apiBase}/bot${options.token}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      })
    } catch (error) {
      // The original error is dropped on purpose: its message or cause can contain the URL, and the URL holds the token.
      const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
      throw new TelegramApiError("network", 0, timedOut ? "request timed out" : "network error")
    }

    let body: TelegramEnvelope | null = null
    try {
      body = (await response.json()) as TelegramEnvelope
    } catch {
      body = null
    }
    if (response.ok && body?.ok === true) return body.result as T

    const code = body?.error_code ?? response.status
    const description = body?.description ?? `HTTP ${response.status}`
    throw new TelegramApiError(classifyTelegramError(code, description), code, description, body?.parameters?.retry_after ?? null)
  }

  async function call<T>(method: string, params: Record<string, unknown>, opts: CallOptions = {}): Promise<T> {
    const timeoutMs = opts.timeoutMs ?? 8000
    for (let attempt = 0; ; attempt++) {
      try {
        return await once<T>(method, params, timeoutMs)
      } catch (error) {
        if (!(error instanceof TelegramApiError) || attempt >= 1) throw error
        // A throttled request was rejected, not processed, so repeating it is always safe.
        if (error.kind === "rate_limited" && (error.retryAfter ?? 1) <= 3) {
          await sleep(((error.retryAfter ?? 1) + 0.25) * 1000)
          continue
        }
        if (opts.retryTransient && (error.kind === "network" || error.kind === "server")) {
          await sleep(300)
          continue
        }
        throw error
      }
    }
  }

  return {
    async getMe() {
      const me = await call<{ id: number; username?: string }>("getMe", {}, { retryTransient: true })
      return { id: me.id, username: me.username ?? null }
    },
    getChatMember: (chatId, userId) => call<TgChatMember>("getChatMember", { chat_id: chatId, user_id: userId }, { retryTransient: true }),
    async sendMessage(chatId, text, replyMarkup) {
      await call("sendMessage", {
        chat_id: chatId,
        text,
        link_preview_options: { is_disabled: true },
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      })
    },
    async sendDocument(chatId, fileId) {
      await call("sendDocument", { chat_id: chatId, document: fileId }, { timeoutMs: 20000 })
    },
    async answerCallbackQuery(callbackQueryId, text) {
      await call("answerCallbackQuery", { callback_query_id: callbackQueryId, ...(text ? { text } : {}) })
    },
    getWebhookInfo: () => call<WebhookInfo>("getWebhookInfo", {}, { retryTransient: true }),
  }
}
