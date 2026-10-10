// The bot's only state: small keys with lifetimes. Production uses Upstash Redis through its
// REST API (plain fetch, no SDK); tests and local development use the in-memory twin.
// Vercel's file system is temporary, so nothing is ever written to disk.

export interface Store {
  readonly kind: "upstash" | "memory"
  get(key: string): Promise<string | null>
  mget(keys: string[]): Promise<Array<string | null>>
  /** Sets the key; without a lifetime it lives until deleted. */
  set(key: string, value: string, ttlSeconds?: number): Promise<void>
  /** Creates the key only if it does not exist. Returns whether this call created it. */
  setIfAbsent(key: string, value: string, ttlSeconds: number): Promise<boolean>
  del(key: string): Promise<void>
  /** Adds 1 to a counter that lives ttlSeconds from its first increment. Returns the new count. */
  incr(key: string, ttlSeconds: number): Promise<number>
  ping(): Promise<boolean>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StoreError"
  }
}

type Arg = string | number

export function createUpstashStore(options: {
  url: string
  token: string
  fetchImpl?: typeof fetch
  timeoutMs?: number
}): Store {
  const doFetch = options.fetchImpl ?? fetch
  const timeoutMs = options.timeoutMs ?? 4000

  async function post(path: string, body: unknown): Promise<unknown> {
    let response: Response
    try {
      response = await doFetch(`${options.url}${path}`, {
        method: "POST",
        headers: { authorization: `Bearer ${options.token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      })
    } catch {
      throw new StoreError("store request failed")
    }
    let parsed: unknown = null
    try {
      parsed = await response.json()
    } catch {
      parsed = null
    }
    if (!response.ok) throw new StoreError(`store error (HTTP ${response.status})`)
    return parsed
  }

  async function command(args: Arg[]): Promise<unknown> {
    const reply = (await post("", args.map(String))) as { result?: unknown; error?: string } | null
    if (!reply || reply.error !== undefined) throw new StoreError("store command failed")
    return reply.result ?? null
  }

  async function pipeline(commands: Arg[][]): Promise<unknown[]> {
    const replies = (await post("/pipeline", commands.map((args) => args.map(String)))) as Array<{ result?: unknown; error?: string }> | null
    if (!Array.isArray(replies) || replies.length !== commands.length) throw new StoreError("store pipeline failed")
    return replies.map((reply) => {
      if (reply.error !== undefined) throw new StoreError("store command failed")
      return reply.result ?? null
    })
  }

  return {
    kind: "upstash",
    async get(key) {
      const result = await command(["GET", key])
      return typeof result === "string" ? result : null
    },
    async mget(keys) {
      if (keys.length === 0) return []
      const result = await command(["MGET", ...keys])
      return Array.isArray(result) ? result.map((value) => (typeof value === "string" ? value : null)) : keys.map(() => null)
    },
    async set(key, value, ttlSeconds) {
      await command(ttlSeconds ? ["SET", key, value, "EX", Math.ceil(ttlSeconds)] : ["SET", key, value])
    },
    async setIfAbsent(key, value, ttlSeconds) {
      return (await command(["SET", key, value, "EX", Math.ceil(ttlSeconds), "NX"])) === "OK"
    },
    async del(key) {
      await command(["DEL", key])
    },
    async incr(key, ttlSeconds) {
      // SET ... NX creates the counter together with its lifetime; INCR then keeps that lifetime.
      const [, count] = await pipeline([
        ["SET", key, "0", "EX", Math.ceil(ttlSeconds), "NX"],
        ["INCR", key],
      ])
      return Number(count)
    },
    async ping() {
      return (await command(["PING"])) === "PONG"
    },
  }
}

export type MemoryStore = Store & {
  /** For tests: every live key with its value. */
  dump(): Record<string, string>
}

export function createMemoryStore(now: () => number = Date.now): MemoryStore {
  const data = new Map<string, { value: string; expiresAt: number | null }>()

  const live = (key: string) => {
    const entry = data.get(key)
    if (!entry) return undefined
    if (entry.expiresAt !== null && entry.expiresAt <= now()) {
      data.delete(key)
      return undefined
    }
    return entry
  }
  const expiry = (ttlSeconds?: number) => (ttlSeconds ? now() + ttlSeconds * 1000 : null)

  return {
    kind: "memory",
    async get(key) {
      return live(key)?.value ?? null
    },
    async mget(keys) {
      return keys.map((key) => live(key)?.value ?? null)
    },
    async set(key, value, ttlSeconds) {
      data.set(key, { value, expiresAt: expiry(ttlSeconds) })
    },
    async setIfAbsent(key, value, ttlSeconds) {
      if (live(key)) return false
      data.set(key, { value, expiresAt: expiry(ttlSeconds) })
      return true
    },
    async del(key) {
      data.delete(key)
    },
    async incr(key, ttlSeconds) {
      const entry = live(key)
      if (!entry) {
        data.set(key, { value: "1", expiresAt: expiry(ttlSeconds) })
        return 1
      }
      entry.value = String(Number(entry.value) + 1)
      return Number(entry.value)
    },
    async ping() {
      return true
    },
    dump() {
      const out: Record<string, string> = {}
      for (const key of [...data.keys()]) {
        const entry = live(key)
        if (entry) out[key] = entry.value
      }
      return out
    },
  }
}
