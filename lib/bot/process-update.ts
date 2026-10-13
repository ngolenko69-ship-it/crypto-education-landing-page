import { handleUpdate, type BotDeps } from "./handlers"
import { UPDATE_CLAIM_SECONDS, UPDATE_DONE_SECONDS, UPDATE_MAX_ATTEMPTS } from "./limits"
import { describeError } from "./log"
import type { TelegramApi } from "./telegram-api"
import type { TgUpdate } from "./types"

export type ProcessOutcome =
  /** Handled; answer Telegram 200. */
  | "processed"
  /** The same update_id was already handled or is being handled; answer 200 and do nothing. */
  | "duplicate"
  /** Not an update this bot reads, or one that keeps failing and was given up on; answer 200. */
  | "ignored"
  /** Failed before doing anything visible; answer 5xx so Telegram delivers it again. */
  | "retry"

/** Counts what the person could already see, so a failure after that is never retried into a duplicate. */
function trackEffects(api: TelegramApi, effects: { sent: number }): TelegramApi {
  return {
    ...api,
    async sendMessage(...args: Parameters<TelegramApi["sendMessage"]>) {
      await api.sendMessage(...args)
      effects.sent += 1
    },
    async sendDocument(...args: Parameters<TelegramApi["sendDocument"]>) {
      await api.sendDocument(...args)
      effects.sent += 1
    },
  }
}

/**
 * Runs one Telegram update exactly once, however many times Telegram delivers it.
 *
 * - The update_id is claimed in the store first: a re-delivery (or a parallel one) finds the claim and stops.
 * - If handling fails before anything reached the person, the claim is released and the caller answers 5xx,
 *   so Telegram retries. If it fails after something was sent, the update counts as done: retrying would
 *   send the same message or file twice.
 * - An update that fails three times is given up on instead of being retried forever.
 */
export async function processUpdate(update: TgUpdate, deps: BotDeps): Promise<ProcessOutcome> {
  if (!update.message && !update.callback_query) return "ignored"

  const claimKey = `upd:${update.update_id}`
  // A store failure here propagates before anything was done, so Telegram may safely retry.
  if (!(await deps.store.setIfAbsent(claimKey, "p", UPDATE_CLAIM_SECONDS))) {
    deps.log.info("duplicate_update", { update: update.update_id })
    return "duplicate"
  }

  const effects = { sent: 0 }
  try {
    const attempts = await deps.store.incr(`try:${update.update_id}`, 3600)
    if (attempts > UPDATE_MAX_ATTEMPTS) {
      deps.log.error("update_given_up", { update: update.update_id, attempts })
      await deps.store.set(claimKey, "d", UPDATE_DONE_SECONDS).catch(() => undefined)
      return "ignored"
    }

    await handleUpdate(update, { ...deps, api: trackEffects(deps.api, effects) })
    await deps.store.set(claimKey, "d", UPDATE_DONE_SECONDS).catch(() => undefined)
    return "processed"
  } catch (error) {
    deps.log.error("update_failed", { update: update.update_id, sent: effects.sent, ...describeError(error) })
    if (effects.sent === 0) {
      await deps.store.del(claimKey).catch(() => undefined)
      return "retry"
    }
    await deps.store.set(claimKey, "d", UPDATE_DONE_SECONDS).catch(() => undefined)
    return "processed"
  }
}
