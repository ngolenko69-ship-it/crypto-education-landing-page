import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Constant-time comparison of the webhook secret. Both sides are hashed first, so the
 * comparison always works on equal-length buffers and the secret's length does not leak.
 */
export function secretsMatch(provided: string | null | undefined, expected: string): boolean {
  if (!provided || !expected) return false
  const a = createHmac("sha256", "ruta-secret-compare").update(provided).digest()
  const b = createHmac("sha256", "ruta-secret-compare").update(expected).digest()
  return timingSafeEqual(a, b)
}

/**
 * Stable pseudonym of a Telegram user id. The store and the logs only ever hold this value,
 * never the raw id, so a leaked database does not list Telegram accounts. Keyed with the
 * webhook secret: without it the ids cannot be brute-forced back out of the hashes.
 */
export function pseudonym(secret: string, userId: number): string {
  return createHmac("sha256", secret).update(`uid:v1:${userId}`).digest("hex").slice(0, 24)
}
