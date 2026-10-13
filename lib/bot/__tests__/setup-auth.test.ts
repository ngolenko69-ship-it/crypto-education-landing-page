import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createLogger } from "../log"
import { authorizeSetup, SETUP_FAIL_WINDOW_SECONDS, SETUP_FAILS_IN_TOTAL, SETUP_FAILS_PER_VISITOR, SETUP_LOCAL_PER_MINUTE, SETUP_TRIES_PER_VISITOR, SETUP_TRY_WINDOW_SECONDS, visitorAddress } from "../setup-auth"
import { createMemoryStore, type Store } from "../store"

const KEY = "setup-key-0123456789-abcdefghijkl"
const WRONG = "setup-key-0123456789-abcdefghijkX"

function rig(expected = KEY) {
  const clock = { ms: Date.UTC(2026, 9, 13, 12, 0, 0) }
  const store = createMemoryStore(() => clock.ms)
  // Each test gets its own instance counters, so tests do not count against one another.
  const local = createMemoryStore(() => clock.ms)
  const lines: string[] = []
  const log = createLogger([expected], { log: (line) => lines.push(line), warn: (line) => lines.push(line), error: (line) => lines.push(line) })
  const attempt = (provided: string, address = "203.0.113.7", via: Store | null = store) => authorizeSetup({ provided, expected, address, store: via, log, local })
  return { clock, store, local, lines, attempt, advance: (seconds: number) => (clock.ms += seconds * 1000) }
}

describe("the setup key", () => {
  it("lets the right key in and turns a wrong one away", async () => {
    const { attempt } = rig()
    assert.deepEqual(await attempt(KEY), { ok: true })
    assert.deepEqual(await attempt(WRONG), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(""), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(KEY.slice(0, -1)), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(`${KEY}x`), { ok: false, reason: "bad_key" })
  })

  it("stops a visitor after five wrong keys — even when the sixth is the right one", async () => {
    const { attempt } = rig()
    for (let i = 0; i < SETUP_FAILS_PER_VISITOR; i++) assert.deepEqual(await attempt(WRONG), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(KEY), { ok: false, reason: "rate_limited" })
    assert.deepEqual(await attempt(WRONG), { ok: false, reason: "rate_limited" })
    // Somebody else is not affected by it.
    assert.deepEqual(await attempt(KEY, "198.51.100.20"), { ok: true })
  })

  it("lets the visitor back in when the window has passed", async () => {
    const { attempt, advance } = rig()
    for (let i = 0; i < SETUP_FAILS_PER_VISITOR; i++) await attempt(WRONG)
    assert.equal((await attempt(KEY)).ok, false)
    advance(SETUP_FAIL_WINDOW_SECONDS - 1)
    assert.equal((await attempt(KEY)).ok, false)
    advance(2)
    assert.deepEqual(await attempt(KEY), { ok: true })
  })

  it("stops everybody once too many wrong keys came from anywhere (a spread-out guessing run)", async () => {
    const { attempt } = rig()
    for (let i = 0; i < SETUP_FAILS_IN_TOTAL; i++) assert.deepEqual(await attempt(WRONG, `192.0.2.${i + 1}`), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(KEY, "198.51.100.99"), { ok: false, reason: "rate_limited" })
  })

  it("caps the number of requests per visitor, right or wrong", async () => {
    const { attempt, advance } = rig()
    for (let i = 0; i < SETUP_TRIES_PER_VISITOR; i++) assert.deepEqual(await attempt(KEY), { ok: true })
    assert.deepEqual(await attempt(KEY), { ok: false, reason: "rate_limited" })
    advance(SETUP_TRY_WINDOW_SECONDS + 1)
    assert.deepEqual(await attempt(KEY), { ok: true })
  })

  it("turns a flood away before Redis is touched at all", async () => {
    const { attempt, store } = rig()
    let commands = 0
    const counting = new Proxy(store, { get: (target, name) => (typeof (target as never)[name] === "function" ? (...args: unknown[]) => { commands++; return ((target as never)[name] as (...a: unknown[]) => unknown)(...args) } : (target as never)[name]) }) as Store
    for (let i = 0; i < SETUP_LOCAL_PER_MINUTE; i++) await attempt(WRONG, "203.0.113.9", counting)
    const spent = commands
    assert.ok(spent > 0)
    for (let i = 0; i < 200; i++) assert.deepEqual(await attempt(KEY, "203.0.113.9", counting), { ok: false, reason: "rate_limited" })
    assert.equal(commands, spent, "no further Redis command was spent on the flood")
  })

  it("lets the same visitor back after a minute (the instance cap is short)", async () => {
    const { attempt, advance } = rig()
    for (let i = 0; i < SETUP_LOCAL_PER_MINUTE; i++) await attempt(KEY, "203.0.113.11")
    assert.deepEqual(await attempt(KEY, "203.0.113.11"), { ok: false, reason: "rate_limited" })
    advance(61)
    // The Redis limit for tries (30 per 10 minutes) is what now applies: still over it.
    assert.deepEqual(await attempt(KEY, "203.0.113.11"), { ok: false, reason: "rate_limited" })
    advance(SETUP_TRY_WINDOW_SECONDS)
    assert.deepEqual(await attempt(KEY, "203.0.113.11"), { ok: true })
  })

  it("forgives typos: a right key clears the visitor's wrong-key count", async () => {
    const { attempt } = rig()
    for (let i = 0; i < SETUP_FAILS_PER_VISITOR - 1; i++) await attempt(WRONG)
    assert.deepEqual(await attempt(KEY), { ok: true })
    for (let i = 0; i < SETUP_FAILS_PER_VISITOR - 1; i++) assert.deepEqual(await attempt(WRONG), { ok: false, reason: "bad_key" })
    assert.deepEqual(await attempt(KEY), { ok: true })
  })

  it("never stores an address, a key or a guess", async () => {
    const { attempt, store } = rig()
    await attempt(WRONG, "203.0.113.7")
    await attempt(KEY, "203.0.113.7")
    const dump = JSON.stringify(store.dump())
    assert.ok(Object.keys(store.dump()).every((name) => name.startsWith("su:")), dump)
    for (const secret of ["203.0.113.7", KEY, WRONG, "203", "113"]) assert.ok(!dump.includes(secret), secret)
  })
})

describe("when Redis cannot be used for the counters", () => {
  const broken = (store: Store): Store => ({ ...store, incr: async () => { throw new Error("down") }, mget: async () => { throw new Error("down") }, del: async () => { throw new Error("down") } })

  it("keeps counting in this instance, so the limit does not disappear", async () => {
    const { attempt, store, lines } = rig("setup-key-fallback-0123456789-abcd")
    const down = broken(store)
    const key = "setup-key-fallback-0123456789-abcd"
    const address = "203.0.113.55"
    const call = (provided: string) => attempt(provided, address, down)
    // rig() bound `expected`; reuse its attempt with the matching key.
    for (let i = 0; i < SETUP_FAILS_PER_VISITOR; i++) assert.deepEqual(await call("not-the-key-0000000000000000"), { ok: false, reason: "bad_key" })
    assert.deepEqual(await call(key), { ok: false, reason: "rate_limited" })
    assert.ok(lines.some((line) => line.includes("setup_limiter_fallback")))
    assert.deepEqual(store.dump(), {}, "nothing was written to the broken store")
  })

  it("works without any Redis at all (store is null)", async () => {
    const { attempt } = rig("setup-key-no-redis-0123456789-abcde")
    const address = "203.0.113.66"
    assert.deepEqual(await attempt("setup-key-no-redis-0123456789-abcde", address, null), { ok: true })
    assert.deepEqual(await attempt("wrong-wrong-wrong-wrong-wrong", address, null), { ok: false, reason: "bad_key" })
  })
})

describe("the visitor's address", () => {
  const from = (headers: Record<string, string>) => visitorAddress(new Headers(headers))

  it("is the first entry of X-Forwarded-For, then X-Real-IP", () => {
    assert.equal(from({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }), "203.0.113.7")
    assert.equal(from({ "x-real-ip": "198.51.100.4" }), "198.51.100.4")
    assert.equal(from({ "x-forwarded-for": "2001:db8::1" }), "2001:db8::1")
  })

  it("falls back to one shared bucket for anything that is not an address", () => {
    assert.equal(from({}), "unknown")
    assert.equal(from({ "x-forwarded-for": "not an address" }), "unknown")
    assert.equal(from({ "x-forwarded-for": "1.2.3.4;DROP" }), "unknown")
    assert.equal(from({ "x-forwarded-for": "a".repeat(80) }), "unknown")
  })
})
