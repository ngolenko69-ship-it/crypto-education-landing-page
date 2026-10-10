import type { BotConfig } from "../config"
import { secretsOf } from "../config"
import { saveGuide } from "../guide"
import type { BotDeps } from "../handlers"
import { createLogger } from "../log"
import { createMemoryStore, type MemoryStore } from "../store"
import { TelegramApiError, type TelegramApi, type TelegramErrorKind } from "../telegram-api"
import type { InlineKeyboard, TgChatMember, TgDocument, TgUpdate } from "../types"

export const TOKEN = "123456789:FAKE-test-token-0000000000"
export const SECRET = "test-webhook-secret-0123456789abcdef"
export const REDIS_TOKEN = "redis-rest-token-0123456789"
export const ADMIN = 777001
export const USER = 424242424
export const OTHER_USER = 515151515
export const GUIDE_FILE_ID = "BQACAgIAAxkBAAIBf2Yexampleguidefileid0000000001"

export type Call = { method: string; args: unknown[] }

/** A programmable stand-in for the Telegram Bot API. */
export function createFakeTelegram() {
  const calls: Call[] = []
  const members = new Map<number, TgChatMember>()
  const failures = new Map<string, TelegramApiError[]>()
  const state = { botId: 999, botStatus: "administrator" as TgChatMember["status"] }

  const enter = (method: string, args: unknown[]) => {
    calls.push({ method, args })
    const queued = failures.get(method)?.shift()
    if (queued) throw queued
  }

  const api: TelegramApi = {
    async getMe() {
      enter("getMe", [])
      return { id: state.botId, username: "RutaCriptoSeguraBot" }
    },
    async getChatMember(chatId, userId) {
      enter("getChatMember", [chatId, userId])
      if (userId === state.botId) return { status: state.botStatus }
      return members.get(userId) ?? { status: "left" }
    },
    async sendMessage(chatId, text, keyboard) {
      enter("sendMessage", [chatId, text, keyboard])
    },
    async sendDocument(chatId, fileId) {
      enter("sendDocument", [chatId, fileId])
    },
    async answerCallbackQuery(id, text) {
      enter("answerCallbackQuery", [id, text])
    },
    async getWebhookInfo() {
      enter("getWebhookInfo", [])
      return { url: "https://example.test/api/telegram/webhook", pending_update_count: 0 }
    },
  }

  return {
    api,
    calls,
    state,
    /** Makes the next call(s) of a method fail with this error. */
    failNext(method: string, kind: TelegramErrorKind, description = "test failure", code = 400) {
      const queue = failures.get(method) ?? []
      queue.push(new TelegramApiError(kind, code, description))
      failures.set(method, queue)
    },
    subscribe(userId: number, member: TgChatMember = { status: "member" }) {
      members.set(userId, member)
    },
    of: (method: string) => calls.filter((call) => call.method === method),
    texts: (method = "sendMessage") => calls.filter((call) => call.method === method).map((call) => String(call.args[1])),
    reset() {
      calls.length = 0
    },
  }
}

export type Harness = ReturnType<typeof createHarness>

export function createHarness(options: { admins?: number[]; fallbackFileId?: string | null; withGuide?: boolean } = {}) {
  const clock = { ms: Date.UTC(2026, 9, 10, 12, 0, 0) }
  const fake = createFakeTelegram()
  const store: MemoryStore = createMemoryStore(() => clock.ms)
  const output: string[] = []
  const config: BotConfig = {
    token: TOKEN,
    webhookSecret: SECRET,
    channelChatId: "@rutacriptosegura",
    adminUserIds: new Set(options.admins ?? [ADMIN]),
    guideFileIdFallback: options.fallbackFileId ?? null,
    apiBase: "https://api.telegram.org",
    store: { kind: "memory" },
  }
  const sink = { log: (line: string) => output.push(line), warn: (line: string) => output.push(line), error: (line: string) => output.push(line) }
  const deps: BotDeps = { config, api: fake.api, store, log: createLogger([...secretsOf(config), REDIS_TOKEN], sink), now: () => new Date(clock.ms) }

  let nextUpdateId = 1000
  return {
    deps,
    fake,
    store,
    output,
    clock,
    /** Moves time forward, expiring locks and throttles. */
    advance(seconds: number) {
      clock.ms += seconds * 1000
    },
    async withGuide(fileId = GUIDE_FILE_ID) {
      await saveGuide(store, "main", { fileId, fileName: "guia.pdf", size: 19255939, savedAt: new Date(clock.ms).toISOString() })
    },
    message(userId: number, text: string, extra: { chatType?: "private" | "group"; isBot?: boolean } = {}): TgUpdate {
      return {
        update_id: nextUpdateId++,
        message: { message_id: nextUpdateId, chat: { id: userId, type: extra.chatType ?? "private" }, from: { id: userId, is_bot: extra.isBot ?? false }, text },
      }
    },
    document(userId: number, document: Partial<TgDocument>, caption?: string): TgUpdate {
      return {
        update_id: nextUpdateId++,
        message: {
          message_id: nextUpdateId,
          chat: { id: userId, type: "private" },
          from: { id: userId },
          caption,
          document: { file_id: "BQACAgIAAxkDAAIB-uploaded-document-file-id-0001", file_name: "Ruta_Cripto_Segura.pdf", mime_type: "application/pdf", file_size: 19255939, ...document },
        },
      }
    },
    callback(userId: number, data = "verify"): TgUpdate {
      return { update_id: nextUpdateId++, callback_query: { id: `cb-${nextUpdateId}`, from: { id: userId }, data } }
    },
  }
}

export const buttonLabels = (keyboard: unknown): string[] => ((keyboard as InlineKeyboard | undefined)?.inline_keyboard ?? []).flat().map((button) => button.text)
export const buttonUrls = (keyboard: unknown): string[] => ((keyboard as InlineKeyboard | undefined)?.inline_keyboard ?? []).flat().map((button) => button.url ?? "")
