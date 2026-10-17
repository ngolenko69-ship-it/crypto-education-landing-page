import assert from "node:assert/strict"
import vm from "node:vm"
import { beforeEach, describe, it } from "node:test"
import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_SCRIPT_SRC,
  TELEGRAM_EVENT_NAMES,
  buildGoogleAdsInitScript,
  buildTelegramClickCalls,
  classifyTelegramHref,
  cleanConversionLabel,
  clearGoogleAdsCookies,
  createConsentReconciler,
  googleConsentSignals,
  isAdsExcludedPath,
  sendTelegramClick,
} from "../ads"
import { CONSENT_KEY, saveConsent, subscribeConsent } from "../consent"
import { TELEGRAM_BOT_URL, TELEGRAM_CHANNEL_URL, TELEGRAM_COURSE_URL, TELEGRAM_MANAGER_URL } from "../telegram"

const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" }

describe("Google Consent Mode v2 signals", () => {
  it("maps the two optional choices onto Google's four signals", () => {
    assert.deepEqual(googleConsentSignals({ analytics: false, advertising: false }), DENIED)
    assert.deepEqual(googleConsentSignals({ analytics: true, advertising: true }), {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    })
  })

  it("never grants an advertising signal because of analytics alone", () => {
    const s = googleConsentSignals({ analytics: true, advertising: false })
    assert.equal(s.analytics_storage, "granted")
    assert.equal(s.ad_storage, "denied")
    assert.equal(s.ad_user_data, "denied")
    assert.equal(s.ad_personalization, "denied")
  })

  it("never grants analytics_storage because of advertising alone", () => {
    const s = googleConsentSignals({ analytics: false, advertising: true })
    assert.equal(s.analytics_storage, "denied")
    assert.equal(s.ad_storage, "granted")
    assert.equal(s.ad_user_data, "granted")
    assert.equal(s.ad_personalization, "granted")
  })
})

describe("the start-up script", () => {
  /** Runs the inline script in an empty page-like context and returns what it put in the dataLayer. */
  function run(choice: { analytics: boolean; advertising: boolean }) {
    const context = vm.createContext({ Date })
    ;(context as { window?: unknown }).window = context
    vm.runInContext(buildGoogleAdsInitScript(choice), context)
    const w = context as unknown as { dataLayer: ArrayLike<unknown>[]; gtag: unknown }
    // the script runs in its own realm: round-trip through JSON so the values compare by content (a Date becomes its ISO string)
    const layer = JSON.parse(JSON.stringify(Array.from(w.dataLayer).map((entry) => Array.from(entry)))) as unknown[][]
    return { layer, gtag: w.gtag, dataLayer: w.dataLayer }
  }

  it("sends consent default (all denied) first, then the visitor's choice, then js and config", () => {
    const { layer } = run({ analytics: true, advertising: true })
    assert.equal(layer.length, 5)
    assert.deepEqual(layer[0], ["consent", "default", DENIED])
    assert.deepEqual(layer[1], [
      "consent",
      "update",
      { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" },
    ])
    assert.equal(layer[2][0], "js")
    assert.match(String(layer[2][1]), /^\d{4}-\d{2}-\d{2}T/) // a Date
    assert.deepEqual(layer[3], ["set", "ads_data_redaction", true])
    assert.deepEqual(layer[4], ["config", GOOGLE_ADS_ID])
  })

  it("passes only the analytics choice through when advertising was accepted without analytics", () => {
    const { layer } = run({ analytics: false, advertising: true })
    assert.equal((layer[1][2] as Record<string, string>).analytics_storage, "denied")
    assert.equal((layer[1][2] as Record<string, string>).ad_storage, "granted")
  })

  it("pushes real Arguments objects, which is what gtag.js requires", () => {
    const { dataLayer } = run({ analytics: false, advertising: true })
    for (const entry of Array.from(dataLayer)) {
      assert.equal(Object.prototype.toString.call(entry), "[object Arguments]")
    }
  })

  it("does not replace an existing gtag or dataLayer (so a second run cannot split the queue)", () => {
    const context = vm.createContext({ Date })
    ;(context as { window?: unknown }).window = context
    vm.runInContext(buildGoogleAdsInitScript({ analytics: false, advertising: true }), context)
    const first = (context as unknown as { gtag: unknown; dataLayer: unknown }).gtag
    const layer = (context as unknown as { dataLayer: unknown }).dataLayer
    vm.runInContext(buildGoogleAdsInitScript({ analytics: false, advertising: true }), context)
    assert.equal((context as unknown as { gtag: unknown }).gtag, first)
    assert.equal((context as unknown as { dataLayer: unknown }).dataLayer, layer)
  })

  it("loads the tag from Google's own host with the account's tag ID, and nothing else", () => {
    assert.equal(GOOGLE_ADS_SCRIPT_SRC, `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`)
    assert.match(GOOGLE_ADS_ID, /^AW-\d+$/)
    assert.equal(GOOGLE_ADS_ID, "AW-18517392159")
  })
})

describe("classifyTelegramHref", () => {
  it("recognises the three official destinations, whatever the case or the query", () => {
    assert.equal(classifyTelegramHref(TELEGRAM_COURSE_URL), "course")
    assert.equal(classifyTelegramHref(TELEGRAM_BOT_URL), "course")
    assert.equal(classifyTelegramHref("https://t.me/rutacriptoseguraBOT?start=web"), "course")
    assert.equal(classifyTelegramHref(TELEGRAM_CHANNEL_URL), "community")
    assert.equal(classifyTelegramHref("https://t.me/RutaCriptoSegura/"), "community")
    assert.equal(classifyTelegramHref(TELEGRAM_MANAGER_URL), "manager")
    assert.equal(classifyTelegramHref("https://t.me/rutacriptoseguraadmin?x=1#y"), "manager")
  })

  it("ignores everything else: other addresses, look-alike hosts, other schemes, junk", () => {
    const other = [
      "https://t.me/SomeoneElse",
      "https://t.me/RutaCriptoSeguraBotX",
      "https://t.me/RutaCriptoSegura/extra",
      "https://t.me/",
      "http://t.me/RutaCriptoSeguraAdmin",
      "https://t.me.evil.example/RutaCriptoSeguraAdmin",
      "https://evil.example/t.me/RutaCriptoSeguraAdmin",
      "https://telegram.me/RutaCriptoSeguraAdmin",
      "https://www.t.me/RutaCriptoSeguraAdmin",
      "tg://resolve?domain=RutaCriptoSeguraAdmin",
      "mailto:rutacriptosegura@gmail.com",
      "javascript:void(0)",
      "/politica-de-cookies",
      "#comunidad",
      "",
      "not a url",
    ]
    for (const href of other) assert.equal(classifyTelegramHref(href), null, href)
  })
})

describe("Conversion Labels", () => {
  it("accepts a real-looking label and refuses anything else, so a typo can never become a fake conversion", () => {
    assert.equal(cleanConversionLabel("AbC-dEf_123456"), "AbC-dEf_123456")
    assert.equal(cleanConversionLabel("  AbCdEf123456  "), "AbCdEf123456")
    for (const bad of [undefined, null, "", "   ", "short", "has space inside", "with/slash", "AW-18517392159/AbCdEf123456", "<script>", "a".repeat(81)]) {
      assert.equal(cleanConversionLabel(bad), null, String(bad))
    }
  })
})

describe("buildTelegramClickCalls", () => {
  it("is one named event per click and no conversion without a label", () => {
    for (const target of ["course", "community", "manager"] as const) {
      const calls = buildTelegramClickCalls(target, "hero", {})
      assert.equal(calls.length, 1)
      assert.deepEqual(calls[0], [
        "event",
        TELEGRAM_EVENT_NAMES[target],
        { telegram_target: target, placement: "hero", transport_type: "beacon" },
      ])
    }
    assert.deepEqual(Object.values(TELEGRAM_EVENT_NAMES), ["ruta_course_click", "ruta_community_click", "ruta_manager_click"])
  })

  it("adds a Google Ads conversion only for the action whose label is configured", () => {
    const labels = { course: "CourseLabel123", community: null, manager: undefined }
    const course = buildTelegramClickCalls("course", "header", labels)
    assert.equal(course.length, 2)
    assert.deepEqual(course[1], ["event", "conversion", { send_to: "AW-18517392159/CourseLabel123" }])
    assert.equal(buildTelegramClickCalls("community", "comunidad", labels).length, 1)
    assert.equal(buildTelegramClickCalls("manager", "header", labels).length, 1)
  })

  it("carries no URL, no text and no identifier: two fixed words per event", () => {
    const [, , params] = buildTelegramClickCalls("manager", "final_popup", {})[0]
    assert.deepEqual(Object.keys(params).sort(), ["placement", "telegram_target", "transport_type"])
    for (const value of Object.values(params)) assert.match(value, /^[a-z0-9_]+$/)
  })
})

describe("isAdsExcludedPath", () => {
  it("keeps the tag off the owner's bot-setup console only", () => {
    assert.equal(isAdsExcludedPath("/telegram-setup"), true)
    assert.equal(isAdsExcludedPath("/telegram-setup/anything"), true)
    for (const ok of ["/", "/contacto", "/politica-de-cookies", "/telegram-setups", null, undefined]) {
      assert.equal(isAdsExcludedPath(ok), false, String(ok))
    }
  })
})

type GtagCall = unknown[]

/** A browser with working consent storage, a recordable gtag and a cookie jar. */
function installBrowser(hostname = "rutacriptosegura.com") {
  const store = new Map<string, string>()
  const gtagCalls: GtagCall[] = []
  const handlers = new Set<(e: unknown) => void>()
  const cookies = new Map<string, string>()
  const cookieWrites: string[] = []
  const fakeWindow: Record<string, unknown> = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
    addEventListener: (_t: string, fn: (e: unknown) => void) => void handlers.add(fn),
    removeEventListener: (_t: string, fn: (e: unknown) => void) => void handlers.delete(fn),
    dispatchEvent: () => true,
    location: { hostname },
  }
  const fakeDocument = {
    get cookie() {
      return [...cookies].map(([k, v]) => `${k}=${v}`).join("; ")
    },
    set cookie(line: string) {
      cookieWrites.push(line)
      const [pair] = line.split(";")
      const [name, ...rest] = pair.split("=")
      if (/expires=Thu, 01 Jan 1970/.test(line)) cookies.delete(name.trim())
      else cookies.set(name.trim(), rest.join("="))
    },
  }
  const g = globalThis as unknown as Record<string, unknown>
  g.window = fakeWindow
  g.document = fakeDocument
  store.delete(CONSENT_KEY)
  handlers.forEach((fn) => fn({ key: CONSENT_KEY }))
  subscribeConsent(() => {})
  return {
    gtagCalls,
    cookies,
    cookieWrites,
    installGtag() {
      fakeWindow.gtag = (...args: unknown[]) => void gtagCalls.push(args)
    },
    resetConsent() {
      store.delete(CONSENT_KEY)
      handlers.forEach((fn) => fn({ key: CONSENT_KEY }))
    },
  }
}

describe("sendTelegramClick", () => {
  let browser: ReturnType<typeof installBrowser>
  beforeEach(() => {
    browser = installBrowser()
    browser.resetConsent()
  })

  it("sends nothing before the visitor decides", () => {
    browser.installGtag()
    assert.equal(sendTelegramClick("course", "hero"), false)
    assert.equal(browser.gtagCalls.length, 0)
  })

  it("sends nothing after a rejection", () => {
    browser.installGtag()
    saveConsent({ analytics: false, advertising: false })
    assert.equal(sendTelegramClick("manager", "header"), false)
    assert.equal(browser.gtagCalls.length, 0)
  })

  it("sends nothing when only analytics was accepted", () => {
    browser.installGtag()
    saveConsent({ analytics: true, advertising: false })
    assert.equal(sendTelegramClick("community", "comunidad"), false)
    assert.equal(browser.gtagCalls.length, 0)
  })

  it("sends nothing while the tag is not started, and never invents the stub itself", () => {
    saveConsent({ analytics: false, advertising: true })
    assert.equal(sendTelegramClick("course", "hero"), false)
    assert.equal((globalThis as unknown as { window: Record<string, unknown> }).window.gtag, undefined)
  })

  it("sends exactly one named event per click once advertising is accepted and the tag is started", () => {
    browser.installGtag()
    saveConsent({ analytics: false, advertising: true })
    assert.equal(sendTelegramClick("manager", "header"), true)
    assert.equal(browser.gtagCalls.length, 1)
    assert.deepEqual(browser.gtagCalls[0], [
      "event",
      "ruta_manager_click",
      { telegram_target: "manager", placement: "header", transport_type: "beacon" },
    ])
  })

  it("stops at once after the consent is withdrawn", () => {
    browser.installGtag()
    saveConsent({ analytics: true, advertising: true })
    assert.equal(sendTelegramClick("course", "hero"), true)
    saveConsent({ analytics: true, advertising: false })
    assert.equal(sendTelegramClick("course", "hero"), false)
    assert.equal(browser.gtagCalls.length, 1)
  })

  it("never lets a failing tag break the click", () => {
    ;(globalThis as unknown as { window: Record<string, unknown> }).window.gtag = () => {
      throw new Error("boom")
    }
    saveConsent({ analytics: false, advertising: true })
    assert.equal(sendTelegramClick("course", "hero"), false)
  })
})

describe("Google Ads cookies", () => {
  it("are removed from the domain and its parents, and only those", () => {
    const browser = installBrowser("www.rutacriptosegura.com")
    browser.cookies.set("_gcl_au", "1.1.2.3")
    browser.cookies.set("_gcl_aw", "GCL.1.abc")
    browser.cookies.set("_gac_UA-1", "x")
    browser.cookies.set("ruta_other", "keep")
    browser.cookies.set("_ga", "keep-too")
    clearGoogleAdsCookies()
    assert.deepEqual([...browser.cookies.keys()].sort(), ["_ga", "ruta_other"])
    const expired = browser.cookieWrites.filter((w) => w.startsWith("_gcl_aw="))
    const domains = expired.map((w) => /domain=([^;]+)/.exec(w)?.[1] ?? "(host-only)")
    assert.deepEqual(
      domains.sort(),
      ["(host-only)", ".rutacriptosegura.com", ".www.rutacriptosegura.com", "rutacriptosegura.com", "www.rutacriptosegura.com"].sort(),
    )
    assert.ok(!browser.cookieWrites.some((w) => /domain=\.?com(;|$)/.test(w)), "never the bare top-level domain")
  })

  it("are left alone (no write at all) when there are none", () => {
    const browser = installBrowser()
    browser.cookies.set("ruta_other", "keep")
    clearGoogleAdsCookies()
    assert.equal(browser.cookieWrites.length, 0)
  })
})

describe("keeping Google's consent state equal to the visitor's choice", () => {
  function setup() {
    const browser = installBrowser()
    browser.installGtag()
    const reconcile = createConsentReconciler({
      gtag: () => (globalThis as unknown as { window: { gtag?: (...a: unknown[]) => void } }).window.gtag,
      clearCookies: clearGoogleAdsCookies,
    })
    return { browser, reconcile }
  }
  const update = (ad: "granted" | "denied", analytics: "granted" | "denied") => [
    "consent",
    "update",
    { ad_storage: ad, ad_user_data: ad, ad_personalization: ad, analytics_storage: analytics },
  ]

  it("says nothing to Google for a visitor who never accepted advertising (and cleans Google cookies)", () => {
    const { browser, reconcile } = setup()
    browser.cookies.set("_gcl_aw", "GCL.1.abc")
    reconcile({ analytics: false, advertising: false })
    reconcile({ analytics: true, advertising: false })
    assert.equal(browser.gtagCalls.length, 0)
    assert.equal(browser.cookies.has("_gcl_aw"), false)
  })

  it("does not repeat what the start-up script already announced", () => {
    const { browser, reconcile } = setup()
    reconcile({ analytics: true, advertising: true })
    reconcile({ analytics: true, advertising: true })
    assert.equal(browser.gtagCalls.length, 0)
  })

  it("pushes one update when analytics is toggled later", () => {
    const { browser, reconcile } = setup()
    reconcile({ analytics: false, advertising: true }) // start
    reconcile({ analytics: true, advertising: true })
    reconcile({ analytics: true, advertising: true })
    assert.deepEqual(browser.gtagCalls, [update("granted", "granted")])
  })

  it("withdrawing pushes 'denied' for the advertising signals, keeps the analytics choice and removes the cookies", () => {
    const { browser, reconcile } = setup()
    reconcile({ analytics: true, advertising: true }) // start
    browser.cookies.set("_gcl_aw", "GCL.1.abc")
    reconcile({ analytics: true, advertising: false })
    assert.deepEqual(browser.gtagCalls, [update("denied", "granted")])
    assert.equal(browser.cookies.has("_gcl_aw"), false)
    reconcile({ analytics: true, advertising: false }) // same again: nothing new
    assert.equal(browser.gtagCalls.length, 1)
  })

  it("accepting again in the same visit pushes 'granted' once", () => {
    const { browser, reconcile } = setup()
    reconcile({ analytics: false, advertising: true })
    reconcile({ analytics: false, advertising: false })
    reconcile({ analytics: false, advertising: true })
    assert.deepEqual(browser.gtagCalls, [update("denied", "denied"), update("granted", "denied")])
  })

  it("withdrawing everything denies all four signals", () => {
    const { browser, reconcile } = setup()
    reconcile({ analytics: true, advertising: true })
    reconcile({ analytics: false, advertising: false })
    assert.deepEqual(browser.gtagCalls, [update("denied", "denied")])
  })

  it("survives a missing gtag (the tag never started on this page)", () => {
    const browser = installBrowser() // no installGtag()
    const reconcile = createConsentReconciler({
      gtag: () => (globalThis as unknown as { window: { gtag?: (...a: unknown[]) => void } }).window.gtag,
      clearCookies: clearGoogleAdsCookies,
    })
    reconcile({ analytics: true, advertising: true })
    reconcile({ analytics: true, advertising: false })
    assert.equal(browser.gtagCalls.length, 0)
  })
})
