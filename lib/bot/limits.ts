// Every limit and lifetime of the bot in one place. Seconds unless the name says otherwise.

/** An update being processed is claimed for this long; a crashed attempt frees it afterwards. */
export const UPDATE_CLAIM_SECONDS = 45
/** Telegram re-sends an update only for a short while; remembering it for two days is plenty. */
export const UPDATE_DONE_SECONDS = 2 * 24 * 3600
/** A poison update that keeps failing is given up on after this many attempts. */
export const UPDATE_MAX_ATTEMPTS = 3

/** More than this many messages from one user in a minute are ignored. */
export const FLOOD_PER_MINUTE = 30

/** Minimum gap between two subscription checks of the same user. */
export const VERIFY_MIN_INTERVAL_SECONDS = 2
export const VERIFY_PER_HOUR = 40

/** After a delivery starts, the same user cannot start another one for this long (double taps). */
export const DELIVER_LOCK_SECONDS = 30
export const DELIVER_PER_DAY = 5

/** The same technical alert reaches the administrators at most this often. */
export const ALERT_THROTTLE_SECONDS = 3600

/** The delivery record (when, how many times) is kept this long after the last delivery. */
export const DELIVERY_RECORD_SECONDS = 365 * 24 * 3600

export const STATS_DAILY_SECONDS = 100 * 24 * 3600
export const STATS_TOTAL_SECONDS = 10 * 365 * 24 * 3600

/** Telegram lets a bot send files up to 50 MB. */
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024

export const DAY_SECONDS = 24 * 3600
