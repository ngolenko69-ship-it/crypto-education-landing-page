import { secretsOf, type BotConfig } from "./config"
import type { BotDeps } from "./handlers"
import { createLogger } from "./log"
import { createMemoryStore, createUpstashStore, type Store } from "./store"
import { createTelegramApi } from "./telegram-api"

// One in-process memory store, only ever used when TELEGRAM_BOT_STORE=memory (local development).
let developmentStore: Store | null = null

export function createStore(config: BotConfig): Store {
  if (config.store.kind === "upstash") return createUpstashStore({ url: config.store.url, token: config.store.token })
  developmentStore ??= createMemoryStore()
  return developmentStore
}

/** Wires the real Telegram client, store and logger for one request. */
export function createDeps(config: BotConfig): BotDeps {
  return {
    config,
    api: createTelegramApi({ token: config.token, apiBase: config.apiBase }),
    store: createStore(config),
    log: createLogger(secretsOf(config)),
  }
}
