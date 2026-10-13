import { STATS_DAILY_SECONDS, STATS_TOTAL_SECONDS } from "./limits"
import type { Store } from "./store"

// Aggregate counters only: how many times something happened. They hold no user identifiers.

export const STAT_EVENTS = ["start", "start_web", "verify_ok", "verify_no", "verify_error", "delivered", "delivery_failed", "unique_users"] as const
export type StatEvent = (typeof STAT_EVENTS)[number]

const day = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, "")

export async function bump(store: Store, event: StatEvent, now: Date = new Date()): Promise<void> {
  try {
    await store.incr(`st:${day(now)}:${event}`, STATS_DAILY_SECONDS)
    await store.incr(`st:total:${event}`, STATS_TOTAL_SECONDS)
  } catch {
    // Statistics must never break an answer to a user.
  }
}

export type StatsSummary = { today: Record<StatEvent, number>; week: Record<StatEvent, number>; total: Record<StatEvent, number> }

export async function readStats(store: Store, now: Date = new Date()): Promise<StatsSummary> {
  const days: string[] = []
  for (let i = 0; i < 7; i++) days.push(day(new Date(now.getTime() - i * 24 * 3600 * 1000)))

  const keys: string[] = []
  for (const event of STAT_EVENTS) {
    for (const d of days) keys.push(`st:${d}:${event}`)
    keys.push(`st:total:${event}`)
  }
  const values = await store.mget(keys)

  const empty = () => Object.fromEntries(STAT_EVENTS.map((event) => [event, 0])) as Record<StatEvent, number>
  const summary: StatsSummary = { today: empty(), week: empty(), total: empty() }
  let at = 0
  for (const event of STAT_EVENTS) {
    days.forEach((_, index) => {
      const count = Number(values[at++] ?? 0)
      if (index === 0) summary.today[event] = count
      summary.week[event] += count
    })
    summary.total[event] = Number(values[at++] ?? 0)
  }
  return summary
}
