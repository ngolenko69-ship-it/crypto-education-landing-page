/**
 * Google Ads measurement, behind the visitor's consent ("Publicidad y medición").
 *
 * How it works (Google Consent Mode v2, "basic" implementation):
 *  - Until the visitor accepts "Publicidad y medición" NOTHING of Google is loaded: no gtag.js,
 *    no request, no cookie, not even a dataLayer. Accepting only analytics does not change that.
 *  - On acceptance the page first defines gtag() and sends Google's consent DEFAULT (everything
 *    "denied"), then loads gtag.js. Only when the script reports that it has loaded, and only if the
 *    visitor's CURRENT choice still includes advertising, the tag is activated: consent update ->
 *    js -> config. A visitor who changes their mind while the script is still downloading therefore
 *    never gets a measurement started on an old answer (see createGoogleAdsController).
 *  - ad_storage and ad_user_data follow "Publicidad y medición"; analytics_storage follows
 *    "Analíticas"; ad_personalization is ALWAYS "denied": RUTA runs no remarketing and no
 *    personalised advertising. Conversion measurement does not depend on it.
 *
 * Withdrawing the consent, honestly:
 *  - our side: the signals are updated to "denied" (Google's mechanism for any change of choice),
 *    every event stops at once, the Google cookies of this domain are removed, and the tag is not
 *    loaded again on later visits;
 *  - Google's side: a gtag.js that was already loaded cannot be unloaded from a page. It stays in
 *    memory until the page is closed or reloaded. Google documents the "denied" update as the way to
 *    tell it to stop using cookies and user data, but it does not promise that a loaded tag makes no
 *    further request at all, so this code does not claim that either. Nothing of ours calls it again.
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

import { getConsentSnapshot, type ConsentChoice } from "./consent"
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
 * The visitor's two optional choices as Google's four signals. "Publicidad y medición" drives
 * ad_storage and ad_user_data (the two signals conversion measurement needs); "Analíticas" drives
 * analytics_storage. ad_personalization is always "denied": no remarketing, no personalised ads.
 * Accepting analytics alone therefore never grants an advertising signal.
 */
export function googleConsentSignals(choice: ConsentChoice): GoogleConsentSignals {
  const ads: GoogleConsentValue = choice.advertising ? "granted" : "denied"
  return {
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: "denied",
    analytics_storage: choice.analytics ? "granted" : "denied",
  }
}

const ALL_DENIED = googleConsentSignals({ analytics: false, advertising: false })

/**
 * The first inline script: defines gtag() and sends Google's consent DEFAULT (everything denied)
 * before gtag.js is requested. It sends nothing else: the tag is activated later, once it has loaded
 * and the visitor's current choice has been checked (see createGoogleAdsController). Static, so nothing
 * user-controlled can end up in it.
 */
export const GOOGLE_ADS_STUB_SCRIPT = [
  "window.dataLayer = window.dataLayer || [];",
  // gtag.js only understands the real `arguments` object, not an array of them.
  "window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };",
  `gtag("consent", "default", ${JSON.stringify(ALL_DENIED)});`,
].join("\n")

export type GtagCall = unknown[]

/**
 * What activates the tag, in Google's order: personalised advertising off -> consent update (the
 * visitor's choice) -> js -> click-identifier redaction -> config. Called only after gtag.js has loaded.
 */
export function googleActivationCalls(choice: ConsentChoice, now: Date = new Date()): GtagCall[] {
  return [
    // belt and braces next to ad_personalization = denied; Google: this does not disable conversion tracking
    ["set", "allow_ad_personalization_signals", false],
    ["consent", "update", googleConsentSignals(choice)],
    ["js", now],
    // if a signal is ever denied, click identifiers are redacted from requests
    ["set", "ads_data_redaction", true],
    ["config", GOOGLE_ADS_ID],
  ]
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

export type GoogleAdsDeps = {
  /** The visitor's choice RIGHT NOW (read from the store each time, never from a stale copy). */
  choice: () => ConsentChoice
  gtag: () => Gtag | undefined
  clearCookies: () => void
  now?: () => Date
}

/**
 * The life of the tag inside one page. It decides when to activate Google and what to tell it later.
 *
 *  - Nothing is activated before the script has loaded (markScriptReady) AND the visitor's current
 *    choice includes advertising. If they withdrew while the script was downloading, the tag simply
 *    never starts: Google keeps the default "denied" and receives no js/config. A script that failed
 *    to download (markScriptFailed) never starts either.
 *  - Accepted, withdrawn and accepted again while loading counts as accepted: one activation, with the
 *    final choice (including analytics).
 *  - After activation every real change (analytics toggled, advertising withdrawn, accepted again
 *    without a reload) sends exactly one consent update; config is never sent twice.
 *  - Whenever advertising is not accepted, Google's cookies on this domain are removed.
 *  - isActive() is what the click events ask: true only for an activated tag whose visitor still
 *    accepts advertising, so events stop the instant the choice is withdrawn, even in another tab.
 */
export function createGoogleAdsController(deps: GoogleAdsDeps) {
  let scriptReady = false
  let scriptFailed = false
  let activated = false
  let announced: string | null = null // the signals Google was last told after activation

  const announce = (choice: ConsentChoice): void => {
    const signals = googleConsentSignals(choice)
    const signature = JSON.stringify(signals)
    if (announced === signature) return
    announced = signature
    deps.gtag()?.("consent", "update", signals)
  }

  const sync = (): void => {
    const choice = deps.choice()
    if (!choice.advertising) {
      deps.clearCookies()
      if (activated) announce(choice)
      return
    }
    if (!scriptReady) return // activation happens when the script reports it has loaded
    const gtag = deps.gtag()
    if (!gtag) return
    if (!activated) {
      activated = true
      for (const call of googleActivationCalls(choice, deps.now?.())) gtag(...call)
      announced = JSON.stringify(googleConsentSignals(choice))
      return
    }
    announce(choice)
  }

  return {
    /**
     * gtag.js has been downloaded and has run: the script element's own "load" event, never a guess.
     * (next/script's onReady is NOT that: it also fires for a tag mounted again while the script is
     * still downloading, which would start the measurement on a half-loaded page.)
     */
    markScriptReady(): void {
      // next/script also reports "loaded" to a tag mounted again after a failed download
      if (scriptFailed) return
      scriptReady = true
      sync()
    },
    /** gtag.js could not be downloaded (extension, network): the tag does not start on this page. */
    markScriptFailed(): void {
      scriptFailed = true
      scriptReady = false
    },
    /** The choice (or the page) changed: bring Google in line. Safe to call as often as you like. */
    sync,
    isActive: (): boolean => activated && deps.choice().advertising && typeof deps.gtag() === "function",
    state: () => ({ scriptReady, scriptFailed, activated, announced }),
  }
}

export type GoogleAdsController = ReturnType<typeof createGoogleAdsController>

export const googleAds: GoogleAdsController = createGoogleAdsController({
  choice: () => {
    const { analytics, advertising } = getConsentSnapshot()
    return { analytics, advertising }
  },
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
 * Reports one click to Google. Sends nothing, and returns false, unless the tag is active: gtag.js
 * has loaded, was activated, and the visitor still accepts "Publicidad y medición" at this moment.
 * A click before that (for instance in the first instant after accepting) is simply not counted.
 */
export function sendTelegramClick(
  target: TelegramTarget,
  placement: string,
  controller: GoogleAdsController = googleAds,
  gtag: Gtag | undefined = typeof window === "undefined" ? undefined : window.gtag,
): boolean {
  if (typeof gtag !== "function" || !controller.isActive()) return false
  try {
    for (const call of buildTelegramClickCalls(target, placement)) gtag(...call)
    return true
  } catch {
    return false // measurement must never get in the way of the link
  }
}
