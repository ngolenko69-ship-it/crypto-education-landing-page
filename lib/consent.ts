/**
 * Cookie / optional-technology consent, framework-agnostic (the React hook lives in
 * components/consent/use-consent.ts).
 *
 * Three categories:
 *  - necessary: always on, never stored here (the record below is itself one of them);
 *  - analytics: Vercel Web Analytics;
 *  - advertising: "Publicidad y medición", the Google Ads tag (lib/ads.ts).
 * The two optional categories are separate choices. Accepting one never accepts the other.
 *
 * What is stored: one record in localStorage under CONSENT_KEY. Storing the visitor's own
 * decision is the one thing that has to be remembered to honour it, so this record is
 * strictly necessary. It expires after 12 months and is then asked for again.
 *
 * Nothing optional is ever treated as accepted by default: "no record" means "not decided"
 * and "decided with everything false" both load no optional technology.
 *
 * Compatibility: version 1 records (written before the advertising category existed) hold a
 * decision about analytics only. They keep that decision for analytics and read as "advertising
 * not accepted": an old yes to analytics is never a yes to advertising.
 */

export const CONSENT_KEY = "ruta_cookie_consent"
export const CONSENT_VERSION = 2
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
export const OPEN_SETTINGS_EVENT = "ruta:cookie-settings"

/** What the visitor allows, besides the necessary technologies. */
export type ConsentChoice = { analytics: boolean; advertising: boolean }

type ConsentRecord = ConsentChoice & { v: typeof CONSENT_VERSION; ts: number }
export type ConsentState = ConsentChoice & { ready: boolean; decided: boolean }

const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000
const SERVER_STATE: ConsentState = { ready: false, decided: false, analytics: false, advertising: false }

/**
 * Reads a stored record (any supported version) and returns the visitor's choice, or null when
 * the record is missing, malformed, from an unknown version, expired or dated in the future.
 * Pure: `now` is a parameter so the rules can be tested.
 */
export function parseConsentRecord(value: unknown, now: number = Date.now()): ConsentChoice | null {
  if (!value || typeof value !== "object") return null
  const x = value as Record<string, unknown>
  if (typeof x.ts !== "number" || !Number.isFinite(x.ts)) return null
  const age = now - x.ts
  if (age > CONSENT_MAX_AGE_MS || age < -MAX_CLOCK_SKEW_MS) return null

  if (x.v === 2 && typeof x.analytics === "boolean" && typeof x.advertising === "boolean") {
    return { analytics: x.analytics, advertising: x.advertising }
  }
  // Version 1: analytics only. Advertising was never asked, so it is never granted.
  if (x.v === 1 && typeof x.analytics === "boolean") {
    return { analytics: x.analytics, advertising: false }
  }
  return null
}

// If the browser blocks storage (private mode, policy), the choice still holds for this
// page session; it just will not survive a reload.
let memoryRecord: ConsentRecord | null = null
let cache: ConsentState | null = null
const listeners = new Set<() => void>()

function readChoice(): ConsentChoice | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(CONSENT_KEY)
  } catch {
    return parseConsentRecord(memoryRecord) // storage unavailable: this page session's own choice
  }
  if (!raw) return parseConsentRecord(memoryRecord)
  try {
    return parseConsentRecord(JSON.parse(raw) as unknown)
  } catch {
    return null // a stored record that is not even JSON is not a decision
  }
}

function compute(): ConsentState {
  const choice = readChoice()
  return {
    ready: true,
    decided: choice !== null,
    analytics: choice?.analytics === true,
    advertising: choice?.advertising === true,
  }
}

export function getConsentSnapshot(): ConsentState {
  if (typeof window === "undefined") return SERVER_STATE
  if (!cache) cache = compute()
  return cache
}

export function getServerSnapshot(): ConsentState {
  return SERVER_STATE
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY || e.key === null) {
      cache = null
      onChange()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

/** Persist the visitor's decision and notify every listener (also the other tabs, via "storage"). */
export function saveConsent(choice: ConsentChoice): void {
  const record: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: choice.analytics === true,
    advertising: choice.advertising === true,
    ts: Date.now(),
  }
  memoryRecord = record
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
  } catch {
    /* storage unavailable: the in-memory record above still applies for this page session */
  }
  cache = null
  listeners.forEach((l) => l())
}

export function hasAnalyticsConsent(): boolean {
  return getConsentSnapshot().analytics
}

/** True only after the visitor accepted "Publicidad y medición" (never implied by analytics). */
export function hasAdvertisingConsent(): boolean {
  return getConsentSnapshot().advertising
}

/** Opens the preferences dialog from anywhere (footer, cookie policy). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}
