import { createHmac } from "node:crypto"
import type { Logger } from "./log"
import { secretsMatch } from "./security"
import { createMemoryStore, type Store } from "./store"

// Who may use the one-time setup route, and how fast they may try. The key is compared in constant
// time; wrong keys are counted per visitor and across everybody, and a visitor who is over a limit
// is turned away BEFORE the key is looked at, so guessing cannot be sped up by retrying.
// Counters live in Redis (they survive between serverless instances); if Redis cannot be reached
// the same counters are kept in this instance's memory, so the limit never silently disappears.
// A small per-instance cap sits in front of all that, so a flood of requests is turned away without
// costing a single Redis command. A visitor is stored as a keyed hash of the address, never the address itself.

/** Every request counts, right or wrong. */
export const SETUP_TRIES_PER_VISITOR = 30
export const SETUP_TRY_WINDOW_SECONDS = 10 * 60
/** Wrong keys, per visitor and in total. */
export const SETUP_FAILS_PER_VISITOR = 5
export const SETUP_FAILS_IN_TOTAL = 40
export const SETUP_FAIL_WINDOW_SECONDS = 15 * 60
/** Per serverless instance and visitor, checked before Redis is touched at all. */
export const SETUP_LOCAL_PER_MINUTE = 60

export type SetupAuth = { ok: true } | { ok: false; reason: "bad_key" | "rate_limited" }

let instanceStore: Store | null = null

/** Per-instance counters, used only while Redis is unreachable (or not configured at all). */
export function instanceCounters(): Store {
  instanceStore ??= createMemoryStore()
  return instanceStore
}

/** The visitor's address as Vercel reports it (it overwrites X-Forwarded-For, so the first entry is the real one). */
export function visitorAddress(headers: Pick<Headers, "get">): string {
  const raw = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || ""
  return /^[0-9a-fA-F:.]{3,64}$/.test(raw) ? raw : "unknown"
}

export async function authorizeSetup(input: {
  provided: string
  expected: string
  address: string
  /** Null when Redis is not configured: the instance counters then do the whole job. */
  store: Store | null
  log: Logger
  /** This instance's own counters. Only tests pass one. */
  local?: Store
}): Promise<SetupAuth> {
  const local = input.local ?? instanceCounters()
  const visitor = createHmac("sha256", input.expected).update(`visitor:v1:${input.address}`).digest("hex").slice(0, 24)
  const tries = `su:try:${visitor}`
  const wrong = `su:bad:${visitor}`
  const wrongTotal = "su:bad:all"

  // Runs the whole step on Redis, or on this instance's counters if Redis fails half way.
  async function counted<T>(work: (store: Store) => Promise<T>): Promise<T> {
    if (input.store) {
      try {
        return await work(input.store)
      } catch {
        input.log.warn("setup_limiter_fallback")
      }
    }
    return work(local)
  }

  // A flood stops here, before any Redis command is spent on it.
  if ((await local.incr(`su:local:${visitor}`, 60)) > SETUP_LOCAL_PER_MINUTE) return { ok: false, reason: "rate_limited" }

  const turnedAway = await counted(async (store) => {
    if ((await store.incr(tries, SETUP_TRY_WINDOW_SECONDS)) > SETUP_TRIES_PER_VISITOR) return true
    const [mine, everyone] = await store.mget([wrong, wrongTotal])
    return Number(mine ?? 0) >= SETUP_FAILS_PER_VISITOR || Number(everyone ?? 0) >= SETUP_FAILS_IN_TOTAL
  })
  if (turnedAway) return { ok: false, reason: "rate_limited" }

  if (secretsMatch(input.provided, input.expected)) {
    // A visitor who got it right after a typo starts clean. Best effort: a failure here changes nothing.
    await counted((store) => store.del(wrong)).catch(() => undefined)
    return { ok: true }
  }

  await counted(async (store) => {
    await store.incr(wrong, SETUP_FAIL_WINDOW_SECONDS)
    await store.incr(wrongTotal, SETUP_FAIL_WINDOW_SECONDS)
  }).catch(() => undefined)
  return { ok: false, reason: "bad_key" }
}
