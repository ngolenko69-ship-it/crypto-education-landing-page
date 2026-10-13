import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { loadConfig, parseAdminIds, secretsOf } from "../config"

const good = {
  TELEGRAM_BOT_TOKEN: "123456789:FAKE-test-token-0000000000",
  TELEGRAM_WEBHOOK_SECRET: "test-webhook-secret-0123456789abcdef",
  KV_REST_API_URL: "https://eu1-example.upstash.io",
  KV_REST_API_TOKEN: "redis-rest-token-0123456789",
}

const bot = { TELEGRAM_BOT_TOKEN: good.TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET: good.TELEGRAM_WEBHOOK_SECRET }

describe("loadConfig", () => {
  it("lists what is missing, by name only", () => {
    const result = loadConfig({})
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.deepEqual(result.missing, ["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "KV_REST_API_URL", "KV_REST_API_TOKEN"])
  })

  it("accepts a complete environment and defaults to the official channel", () => {
    const result = loadConfig(good)
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.config.channelChatId, "@rutacriptosegura")
    assert.equal(result.config.apiBase, "https://api.telegram.org")
    assert.deepEqual(result.config.store, { kind: "upstash", url: "https://eu1-example.upstash.io", token: "redis-rest-token-0123456789" })
    assert.equal(result.config.adminUserIds.size, 0)
    assert.equal(result.config.guideFileIdFallback, null)
  })

  it("reads KV_REST_API_URL and KV_REST_API_TOKEN, the names Vercel's Upstash integration creates", () => {
    const result = loadConfig({ ...bot, KV_REST_API_URL: "https://kv.example.io/", KV_REST_API_TOKEN: "kv-token-0123456789" })
    assert.equal(result.ok, true)
    if (result.ok) assert.deepEqual(result.config.store, { kind: "upstash", url: "https://kv.example.io", token: "kv-token-0123456789" })
  })

  it("falls back to the names upstash.com itself uses", () => {
    const result = loadConfig({ ...bot, UPSTASH_REDIS_REST_URL: "https://up.example.io", UPSTASH_REDIS_REST_TOKEN: "up-token-0123456789" })
    assert.equal(result.ok, true)
    if (result.ok) assert.deepEqual(result.config.store, { kind: "upstash", url: "https://up.example.io", token: "up-token-0123456789" })
  })

  it("prefers the KV_ pair when both pairs are set and never mixes the two", () => {
    const both = { ...bot, KV_REST_API_URL: "https://kv.example.io", KV_REST_API_TOKEN: "kv-token-0123456789", UPSTASH_REDIS_REST_URL: "https://up.example.io", UPSTASH_REDIS_REST_TOKEN: "up-token-0123456789" }
    const chosen = loadConfig(both)
    assert.equal(chosen.ok && chosen.config.store.kind === "upstash" && chosen.config.store.url, "https://kv.example.io")
    assert.equal(chosen.ok && chosen.config.store.kind === "upstash" && chosen.config.store.token, "kv-token-0123456789")

    // A KV_ address with only an UPSTASH_ token would point one database at another one's credentials.
    const mixed = loadConfig({ ...bot, KV_REST_API_URL: "https://kv.example.io", UPSTASH_REDIS_REST_TOKEN: "up-token-0123456789" })
    assert.equal(mixed.ok, false)
    if (!mixed.ok) assert.deepEqual(mixed.missing, ["KV_REST_API_TOKEN"])
  })

  it("never uses the read-only token: the bot writes", () => {
    const result = loadConfig({ ...bot, KV_REST_API_URL: "https://kv.example.io", KV_REST_API_READ_ONLY_TOKEN: "read-only-token-0123456789", KV_URL: "rediss://kv.example.io:6379", REDIS_URL: "rediss://kv.example.io:6379" })
    assert.equal(result.ok, false)
    if (!result.ok) assert.deepEqual(result.missing, ["KV_REST_API_TOKEN"])
  })

  it("flags a malformed token, secret or channel without echoing their values", () => {
    const result = loadConfig({ ...good, TELEGRAM_BOT_TOKEN: "not a token", TELEGRAM_WEBHOOK_SECRET: "short", TELEGRAM_CHANNEL_CHAT_ID: "nope" })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.deepEqual(result.invalid.sort(), ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHANNEL_CHAT_ID", "TELEGRAM_WEBHOOK_SECRET"])
    assert.ok(!JSON.stringify(result).includes("not a token"))
  })

  it("rejects a store URL that is not https (except localhost), naming the variable but not its value", () => {
    const rejected = loadConfig({ ...good, KV_REST_API_URL: "http://example.com" })
    assert.equal(rejected.ok, false)
    if (!rejected.ok) assert.deepEqual(rejected.invalid, ["KV_REST_API_URL"])
    assert.ok(!JSON.stringify(rejected).includes("example.com") && !JSON.stringify(rejected).includes(good.KV_REST_API_TOKEN))
    const fallback = loadConfig({ ...bot, UPSTASH_REDIS_REST_URL: "http://example.com", UPSTASH_REDIS_REST_TOKEN: "up-token-0123456789" })
    assert.equal(fallback.ok, false)
    if (!fallback.ok) assert.deepEqual(fallback.invalid, ["UPSTASH_REDIS_REST_URL"])
    assert.equal(loadConfig({ ...good, KV_REST_API_URL: "http://127.0.0.1:4011" }).ok, true)
  })

  it("accepts the memory store only outside production", () => {
    const dev = { ...bot, TELEGRAM_BOT_STORE: "memory" }
    assert.equal(loadConfig(dev).ok, true)
    assert.equal(loadConfig({ ...dev, VERCEL_ENV: "preview" }).ok, true)
    assert.equal(loadConfig({ ...dev, VERCEL_ENV: "production" }).ok, false)
  })

  it("uses another Telegram API address only outside production", () => {
    const test = { ...good, TELEGRAM_API_BASE: "http://127.0.0.1:4010" }
    const dev = loadConfig(test)
    assert.equal(dev.ok && dev.config.apiBase, "http://127.0.0.1:4010")
    const prod = loadConfig({ ...test, VERCEL_ENV: "production" })
    assert.equal(prod.ok && prod.config.apiBase, "https://api.telegram.org")
  })

  it("collects every secret so the logger can strip it", () => {
    const result = loadConfig(good)
    assert.ok(result.ok)
    if (result.ok) assert.deepEqual(secretsOf(result.config), [good.TELEGRAM_BOT_TOKEN, good.TELEGRAM_WEBHOOK_SECRET, good.KV_REST_API_TOKEN])
  })
})

describe("parseAdminIds", () => {
  it("reads numeric ids separated by commas, spaces or semicolons and skips the rest", () => {
    assert.deepEqual([...parseAdminIds(" 11, 22;33  abc 4x4 ")], [11, 22, 33])
    assert.equal(parseAdminIds(undefined).size, 0)
    assert.equal(parseAdminIds("").size, 0)
  })
})
