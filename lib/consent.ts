/**
 * Cookie / optional-technology consent, framework-agnostic (the React hook lives in
 * components/consent/use-consent.ts).
 *
 * What is stored: one record in localStorage under CONSENT_KEY. Storing the visitor's own
 * decision is the one thing that has to be remembered to honour it, so this record is
 * strictly necessary. It expires after 12 months and is then asked for again.
 *
 * Nothing optional is ever treated as accepted by default: "no record" means "not decided"
 * and "decided with analytics = false" both load no optional technology.
 */

export const CONSENT_KEY = "ruta_cookie_consent"
export const CONSENT_VERSION = 1
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
export const OPEN_SETTINGS_EVENT = "ruta:cookie-settings"

type ConsentRecord = { v: number; analytics: boolean; ts: number }
export type ConsentState = { ready: boolean; decided: boolean; analytics: boolean }

const SERVER_STATE: ConsentState = { ready: false, decided: false, analytics: false }

// If the browser blocks storage (private mode, policy), the choice still holds for this
// page session; it just will not survive a reload.
let memoryRecord: ConsentRecord | null = null
let cache: ConsentState | null = null
const listeners = new Set<() => void>()

function isValid(r: unknown): r is ConsentRecord {
  if (!r || typeof r !== "object") return false
  const x = r as Record<string, unknown>
  const age = Date.now() - (x.ts as number)
  return (
    x.v === CONSENT_VERSION &&
    typeof x.analytics === "boolean" &&
    typeof x.ts === "number" &&
    age <= CONSENT_MAX_AGE_MS &&
    age >= -24 * 60 * 60 * 1000
  )
}

function readRecord(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return memoryRecord && isValid(memoryRecord) ? memoryRecord : null
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : null
  } catch {
    return memoryRecord && isValid(memoryRecord) ? memoryRecord : null
  }
}

function compute(): ConsentState {
  const record = readRecord()
  return { ready: true, decided: record !== null, analytics: record?.analytics === true }
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

/** Persist the visitor's decision (accept = true, reject = false) and notify every listener. */
export function saveConsent(analytics: boolean): void {
  const record: ConsentRecord = { v: CONSENT_VERSION, analytics, ts: Date.now() }
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

/** Opens the preferences dialog from anywhere (footer, cookie policy). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}
