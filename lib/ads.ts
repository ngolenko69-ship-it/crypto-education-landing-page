/**
 * Google Ads measurement, behind the visitor's consent ("Publicidad y medición").
 *
 * How it works (Google Consent Mode v2, "basic" implementation):
 *  - Until the visitor accepts "Publicidad y medición" NOTHING of Google is loaded: no gtag.js,
 *    no request, no cookie, not even a dataLayer. Accepting only analytics does not change that.
 *  - On acceptance the tag is loaded once (components/consent/consent-gated-google-ads.tsx) with
 *    the four consent signals first set to "denied" and then updated to what the visitor chose.
 *  - Withdrawing the consent updates the signals to "denied", stops every event at once and
 *    removes Google's cookies from this domain. The tag is not loaded again on later visits.
 *
 * What is measured: transitions to Telegram, nothing else. A click on a Telegram link is NOT a
 * subscription, a chat or a received PDF, and the events say exactly that: ruta_course_click,
 * ruta_community_click, ruta_manager_click. They carry two fixed words each (which Telegram
 * address, which part of the page) and no URL, no text, no identifier and no personal data.
 *
 * Real Google Ads conversions need a Conversion Label per action, created in the Google Ads
 * account. They come from NEXT_PUBLIC_GOOGLE_ADS_LABEL_* (see .env.example); a missing label
 * means no conversion is sent for that action, never a made-up one.
 *
 * Plain strings and pure functions first (testable outside Next.js); browser-only parts below.
 */

import { hasAdvertisingConsent, type ConsentChoice } from "./consent"
import { TELEGRAM_BOT_URL, TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_URL } from "./telegram"

/** Google tag ID of the Google Ads account. Public by design (it is visible on every site that uses it). */
export const GOOGLE_ADS_ID = "AW-18517392159"
export const GOOGLE_ADS_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`

/** Pages that never load the tag: the owner's temporary bot-setup console. */
const ADS_EXCLUDED_PATHS = ["/telegram-setup"]

export function isAdsExcludedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return ADS_EXCLUDED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

// ---------------------------------------------------------------------------------------------
// Consent Mode v2 signals
// ---------------------------------------------------------------------------------------------

export type GoogleConsentValue = "granted" | "denied"
export type GoogleConsentSignals = {
  ad_storage: GoogleConsentValue
  ad_user_data: GoogleConsentValue
  ad_personalization: GoogleConsentValue
  analytics_storage: GoogleConsentValue
}

/**
 * The visitor's two optional choices as Google's four signals. "Publicidad y medición" drives the
 * three advertising signals together; "Analíticas" drives analytics_storage only. Accepting
 * analytics alone therefore never grants an advertising signal.
 */
export function googleConsentSignals(choice: ConsentChoice): GoogleConsentSignals {
  const ads: GoogleConsentValue = choice.advertising ? "granted" : "denied"
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
    analytics_storage: choice.analytics ? "granted" : "denied",
  }
}

/**
 * The inline script that starts the tag, run only after "Publicidad y medición" was accepted.
 * Order matters to Google: consent default (everything denied) → consent update (the visitor's
 * choice) → js → config. Built from constants and booleans only, so nothing user-controlled can
 * end up in it.
 */
export function buildGoogleAdsInitScript(choice: ConsentChoice): string {
  const denied = googleConsentSignals({ analytics: false, advertising: false })
  const chosen = googleConsentSignals(choice)
  return [
    "window.dataLayer = window.dataLayer || [];",
    // gtag.js only understands the real `arguments` object, not an array of them.
    "window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };",
    `gtag("consent", "default", ${JSON.stringify(denied)});`,
    `gtag("consent", "update", ${JSON.stringify(chosen)});`,
    'gtag("js", new Date());',
    // belt and braces: if a signal is ever denied, click identifiers are redacted from requests
    'gtag("set", "ads_data_redaction", true);',
    `gtag("config", ${JSON.stringify(GOOGLE_ADS_ID)});`,
  ].join("\n")
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// Cookies the Google tag creates on this domain: _gcl_au, _gcl_aw, _gcl_dc, _gcl_gb, _gcl_ag, _gac_<id>.
const GOOGLE_ADS_COOKIE = /^(?:_gcl_[a-z]{2}|_gac_.+)$/

/** Removes Google Ads cookies from this domain (third-party ones are not reachable from the page). */
export function clearGoogleAdsCookies(): void {
  if (typeof document === "undefined") return
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => GOOGLE_ADS_COOKIE.test(n))
  if (names.length === 0) return
  const labels = window.location.hostname.split(".")
  // host-only, then the host and each parent domain (never the bare top-level domain)
  const domains: (string | null)[] = [null]
  for (let i = 0; i < labels.length - 1; i++) {
    const d = labels.slice(i).join(".")
    domains.push(d, `.${d}`)
  }
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${
        domain ? `; domain=${domain}` : ""
      }; SameSite=Lax`
    }
  }
}

type Gtag = (...args: unknown[]) => void

/**
 * Keeps Google's consent state equal to the visitor's choice for the rest of the page session.
 * Call it with the current choice whenever the choice (or the page) changes; it only acts on a real change:
 *  - the very first time with advertising accepted, the start-up script has just told Google exactly this
 *    state, so nothing is pushed (a second "update" after "config" would be noise);
 *  - later changes (analytics toggled, advertising withdrawn or accepted again) push one consent update;
 *  - when advertising is not accepted, Google's cookies on this domain are removed (idempotent), and if the
 *    tag had already started in this visit its signals are set to "denied".
 */
export function createConsentReconciler(deps: { gtag: () => Gtag | undefined; clearCookies: () => void }) {
  let announced: string | null = null // what Google was last told in this page session; null = nothing yet
  return (choice: ConsentChoice): void => {
    const signals = googleConsentSignals(choice)
    const signature = JSON.stringify(signals)
    if (!choice.advertising) deps.clearCookies()
    if (announced === null) {
      if (choice.advertising) announced = signature // announced by the start-up script
      return
    }
    if (announced === signature) return
    announced = signature
    deps.gtag()?.("consent", "update", signals)
  }
}

export const reconcileGoogleConsent = createConsentReconciler({
  gtag: () => (typeof window === "undefined" ? undefined : window.gtag),
  clearCookies: clearGoogleAdsCookies,
})

// ---------------------------------------------------------------------------------------------
// Telegram click events
// ---------------------------------------------------------------------------------------------

export type TelegramTarget = "course" | "community" | "manager"

export const TELEGRAM_EVENT_NAMES: Record<TelegramTarget, string> = {
  course: "ruta_course_click",
  community: "ruta_community_click",
  manager: "ruta_manager_click",
}

const pathOf = (url: string) => new URL(url).pathname.replace(/\/+$/, "").toLowerCase()
const TELEGRAM_PATHS: Record<TelegramTarget, string> = {
  course: pathOf(TELEGRAM_BOT_URL),
  community: pathOf(TELEGRAM_CHANNEL_URL),
  manager: pathOf(TELEGRAM_MANAGER_URL),
}

/**
 * Which of the three official Telegram destinations a link points to, or null for anything else
 * (other sites, other Telegram addresses, look-alike hosts). Telegram usernames are
 * case-insensitive; query strings such as "?start=web" are ignored.
 */
export function classifyTelegramHref(href: string): TelegramTarget | null {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "t.me") return null
  const path = url.pathname.replace(/\/+$/, "").toLowerCase()
  for (const target of Object.keys(TELEGRAM_PATHS) as TelegramTarget[]) {
    if (path === TELEGRAM_PATHS[target]) return target
  }
  return null
}

export type ConversionLabels = Partial<Record<TelegramTarget, string | null>>

/** A Conversion Label is the part after the slash of "AW-123/LABEL": letters, digits, - and _. */
export function cleanConversionLabel(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  return value && /^[A-Za-z0-9_-]{6,80}$/.test(value) ? value : null
}

// Literal property accesses on purpose: Next.js inlines NEXT_PUBLIC_* only when written this way.
// Missing or malformed = null = no conversion for that action.
export const CONVERSION_LABELS: ConversionLabels = {
  course: cleanConversionLabel(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_COURSE),
  community: cleanConversionLabel(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_COMMUNITY),
  manager: cleanConversionLabel(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_MANAGER),
}

export type GtagEventCall = ["event", string, Record<string, string>]

/**
 * The gtag calls for ONE click: the named event, plus the Google Ads conversion only when a
 * real label is configured for that action. Pure, so it can be checked without a browser.
 */
export function buildTelegramClickCalls(
  target: TelegramTarget,
  placement: string,
  labels: ConversionLabels = CONVERSION_LABELS,
  adsId: string = GOOGLE_ADS_ID,
): GtagEventCall[] {
  const calls: GtagEventCall[] = [
    ["event", TELEGRAM_EVENT_NAMES[target], { telegram_target: target, placement, transport_type: "beacon" }],
  ]
  const label = labels[target]
  if (label) calls.push(["event", "conversion", { send_to: `${adsId}/${label}` }])
  return calls
}

/**
 * Reports one click to Google. Sends nothing, and returns false, unless the visitor accepted
 * "Publicidad y medición" and the tag has been started (window.gtag exists only then: the stub is
 * created by the init script, after Google's consent default/update, never earlier).
 */
export function sendTelegramClick(target: TelegramTarget, placement: string): boolean {
  if (typeof window === "undefined" || !hasAdvertisingConsent()) return false
  const gtag = window.gtag
  if (typeof gtag !== "function") return false
  try {
    for (const call of buildTelegramClickCalls(target, placement)) gtag(...call)
    return true
  } catch {
    return false // measurement must never get in the way of the link
  }
}
