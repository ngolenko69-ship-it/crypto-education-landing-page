import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createMemoryStore, createUpstashStore, StoreError } from "../store"

describe("memory store", () => {
  it("expires keys with the clock and counts atomically per window", async () => {
    let now = 1_000_000
    const store = createMemoryStore(() => now)

    assert.equal(await store.setIfAbsent("a", "1", 10), true)
    assert.equal(await store.setIfAbsent("a", "2", 10), false)
    assert.equal(await store.get("a"), "1")
    now += 11_000
    assert.equal(await store.get("a"), null)
    assert.equal(await store.setIfAbsent("a", "3", 10), true)

    assert.equal(await store.incr("c", 60), 1)
    assert.equal(await store.incr("c", 60), 2)
    now += 61_000
    assert.equal(await store.incr("c", 60), 1)

    await store.set("p", "x")
    now += 10 * 365 * 24 * 3600 * 1000
    assert.equal(await store.get("p"), "x", "a key without a lifetime stays")
    assert.deepEqual(await store.mget(["p", "missing"]), ["x", null])
    await store.del("p")
    assert.equal(await store.get("p"), null)
  })
})

type Seen = { url: string; authorization: string | null; body: unknown }

function fakeFetch(reply: (seen: Seen) => { status?: number; json?: unknown; throws?: boolean }) {
  const seen: Seen[] = []
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    const entry = { url: String(url), authorization: new Headers(init?.headers).get("authorization"), body: JSON.parse(String(init?.body)) }
    seen.push(entry)
    const out = reply(entry)
    if (out.throws) throw new Error(`fetch failed for ${String(url)} with ${entry.authorization}`)
    return new Response(JSON.stringify(out.json ?? {}), { status: out.status ?? 200 })
  }) as typeof fetch
  return { impl, seen }
}

describe("Upstash REST store", () => {
  const options = { url: "https://eu1-example.upstash.io", token: "redis-rest-token-0123456789" }

  it("sends each command as a JSON array with the bearer token", async () => {
    const { impl, seen } = fakeFetch((s) => ({ json: { result: (s.body as string[])[0] === "GET" ? "value" : "OK" } }))
    const store = createUpstashStore({ ...options, fetchImpl: impl })

    assert.equal(await store.get("k"), "value")
    await store.set("k", "v", 60)
    await store.set("k2", "v2")
    await store.del("k")

    assert.deepEqual(seen.map((s) => s.body), [["GET", "k"], ["SET", "k", "v", "EX", "60"], ["SET", "k2", "v2"], ["DEL", "k"]])
    assert.ok(seen.every((s) => s.url === "https://eu1-example.upstash.io" && s.authorization === "Bearer redis-rest-token-0123456789"))
  })

  it("creates a key only if absent with SET NX EX", async () => {
    const answers = [{ result: "OK" }, { result: null }]
    const { impl, seen } = fakeFetch(() => ({ json: answers.shift() }))
    const store = createUpstashStore({ ...options, fetchImpl: impl })
    assert.equal(await store.setIfAbsent("lock", "1", 30), true)
    assert.equal(await store.setIfAbsent("lock", "1", 30), false)
    assert.deepEqual(seen[0].body, ["SET", "lock", "1", "EX", "30", "NX"])
  })

  it("counts with one pipeline: create-with-lifetime, then INCR", async () => {
    const { impl, seen } = fakeFetch(() => ({ json: [{ result: null }, { result: 7 }] }))
    const store = createUpstashStore({ ...options, fetchImpl: impl })
    assert.equal(await store.incr("cnt", 3600), 7)
    assert.equal(seen[0].url, "https://eu1-example.upstash.io/pipeline")
    assert.deepEqual(seen[0].body, [["SET", "cnt", "0", "EX", "3600", "NX"], ["INCR", "cnt"]])
  })

  it("reads many keys at once and answers ping", async () => {
    const { impl } = fakeFetch((s) => ({ json: { result: (s.body as string[])[0] === "PING" ? "PONG" : ["1", null, "3"] } }))
    const store = createUpstashStore({ ...options, fetchImpl: impl })
    assert.deepEqual(await store.mget(["a", "b", "c"]), ["1", null, "3"])
    assert.equal(await store.ping(), true)
  })

  it("fails with an error that carries neither the URL nor the token", async () => {
    for (const reply of [{ throws: true }, { status: 500, json: { error: "boom" } }, { status: 200, json: { error: "ERR wrong number of arguments" } }]) {
      const { impl } = fakeFetch(() => reply)
      const store = createUpstashStore({ ...options, fetchImpl: impl })
      await assert.rejects(store.get("k"), (error: unknown) => {
        assert.ok(error instanceof StoreError)
        assert.ok(!error.message.includes("upstash.io"))
        assert.ok(!error.message.includes("redis-rest-token"))
        return true
      })
    }
  })
})
