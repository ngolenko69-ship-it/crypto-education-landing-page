import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { loadConfig, parseAdminIds, secretsOf } from "../config"

const good = {
  TELEGRAM_BOT_TOKEN: "123456789:FAKE-test-token-0000000000",
  TELEGRAM_WEBHOOK_SECRET: "test-webhook-secret-0123456789abcdef",
  UPSTASH_REDIS_REST_URL: "https://eu1-example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "redis-rest-token-0123456789",
}

describe("loadConfig", () => {
  it("lists what is missing, by name only", () => {
    const result = loadConfig({})
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.deepEqual(result.missing, ["TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"])
  })

  it("accepts a complete environment and defaults the channel to the one the site links to", () => {
    const result = loadConfig(good)
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.config.channelChatId, "@rutacriptosegura")
    assert.equal(result.config.apiBase, "https://api.telegram.org")
    assert.deepEqual(result.config.store, { kind: "upstash", url: "https://eu1-example.upstash.io", token: "redis-rest-token-0123456789" })
    assert.equal(result.config.adminUserIds.size, 0)
    assert.equal(result.config.guideFileIdFallback, null)
  })

  it("also reads the names Vercel's KV integration uses", () => {
    const { UPSTASH_REDIS_REST_URL: _url, UPSTASH_REDIS_REST_TOKEN: _token, ...rest } = good
    const result = loadConfig({ ...rest, KV_REST_API_URL: "https://kv.example.io/", KV_REST_API_TOKEN: "kv-token-0123456789" })
    assert.equal(result.ok, true)
    if (result.ok) assert.deepEqual(result.config.store, { kind: "upstash", url: "https://kv.example.io", token: "kv-token-0123456789" })
  })

  it("flags a malformed token, secret or channel without echoing their values", () => {
    const result = loadConfig({ ...good, TELEGRAM_BOT_TOKEN: "not a token", TELEGRAM_WEBHOOK_SECRET: "short", TELEGRAM_CHANNEL_CHAT_ID: "nope" })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.deepEqual(result.invalid.sort(), ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHANNEL_CHAT_ID", "TELEGRAM_WEBHOOK_SECRET"])
    assert.ok(!JSON.stringify(result).includes("not a token"))
  })

  it("rejects a store URL that is not https (except localhost)", () => {
    assert.equal(loadConfig({ ...good, UPSTASH_REDIS_REST_URL: "http://example.com" }).ok, false)
    assert.equal(loadConfig({ ...good, UPSTASH_REDIS_REST_URL: "http://127.0.0.1:4011" }).ok, true)
  })

  it("accepts the memory store only outside production", () => {
    const dev = { TELEGRAM_BOT_TOKEN: good.TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET: good.TELEGRAM_WEBHOOK_SECRET, TELEGRAM_BOT_STORE: "memory" }
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
    if (result.ok) assert.deepEqual(secretsOf(result.config), [good.TELEGRAM_BOT_TOKEN, good.TELEGRAM_WEBHOOK_SECRET, good.UPSTASH_REDIS_REST_TOKEN])
  })
})

describe("parseAdminIds", () => {
  it("reads numeric ids separated by commas, spaces or semicolons and skips the rest", () => {
    assert.deepEqual([...parseAdminIds(" 11, 22;33  abc 4x4 ")], [11, 22, 33])
    assert.equal(parseAdminIds(undefined).size, 0)
    assert.equal(parseAdminIds("").size, 0)
  })
})
