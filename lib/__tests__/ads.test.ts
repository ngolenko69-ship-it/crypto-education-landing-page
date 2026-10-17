import assert from "node:assert/strict"
import vm from "node:vm"
import { beforeEach, describe, it } from "node:test"
import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_SCRIPT_SRC,
  GOOGLE_ADS_STUB_SCRIPT,
  TELEGRAM_EVENT_NAMES,
  buildTelegramClickCalls,
  classifyTelegramHref,
  cleanConversionLabel,
  clearGoogleAdsCookies,
  createGoogleAdsController,
  googleActivationCalls,
  googleConsentSignals,
  isAdsExcludedPath,
  sendTelegramClick,
  type GoogleAdsController,
} from "../ads"
import { CONSENT_KEY, subscribeConsent } from "../consent"
import { TELEGRAM_BOT_URL, TELEGRAM_CHANNEL_URL, TELEGRAM_COURSE_URL, TELEGRAM_MANAGER_URL } from "../telegram"

const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" }

describe("Google Consent Mode v2 signals", () => {
  it("maps the two optional choices onto Google's four signals", () => {
    assert.deepEqual(googleConsentSignals({ analytics: false, advertising: false }), DENIED)
    assert.deepEqual(googleConsentSignals({ analytics: true, advertising: true }), {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "denied", // RUTA runs no remarketing and no personalised ads
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
    assert.equal(s.ad_personalization, "denied")
  })

  it("keeps ad_personalization denied in every combination, while measurement keeps ad_storage and ad_user_data", () => {
    for (const analytics of [true, false]) {
      for (const advertising of [true, false]) {
        const s = googleConsentSignals({ analytics, advertising })
        assert.equal(s.ad_personalization, "denied")
        assert.equal(s.ad_storage, advertising ? "granted" : "denied")
        assert.equal(s.ad_user_data, advertising ? "granted" : "denied")
      }
    }
  })
})

describe("the start-up script", () => {
  /** Runs the inline script in an empty page-like context and returns what it put in the dataLayer. */
  function run() {
    const context = vm.createContext({ Date })
    ;(context as { window?: unknown }).window = context
    vm.runInContext(GOOGLE_ADS_STUB_SCRIPT, context)
    const w = context as unknown as { dataLayer: ArrayLike<unknown>[]; gtag: unknown }
    // the script runs in its own realm: round-trip through JSON so the values compare by content
    const layer = JSON.parse(JSON.stringify(Array.from(w.dataLayer).map((entry) => Array.from(entry)))) as unknown[][]
    return { layer, gtag: w.gtag, dataLayer: w.dataLayer, context }
  }

  it("defines gtag() and sends ONLY Google's consent default, everything denied: no update, no js, no config", () => {
    const { layer } = run()
    assert.deepEqual(layer, [["consent", "default", DENIED]])
  })

  it("pushes real Arguments objects, which is what gtag.js requires", () => {
    const { dataLayer } = run()
    for (const entry of Array.from(dataLayer)) {
      assert.equal(Object.prototype.toString.call(entry), "[object Arguments]")
    }
  })

  it("does not replace an existing gtag or dataLayer (so a second run cannot split the queue)", () => {
    const { context } = run()
    const first = (context as unknown as { gtag: unknown }).gtag
    const layer = (context as unknown as { dataLayer: unknown }).dataLayer
    vm.runInContext(GOOGLE_ADS_STUB_SCRIPT, context)
    assert.equal((context as unknown as { gtag: unknown }).gtag, first)
    assert.equal((context as unknown as { dataLayer: unknown }).dataLayer, layer)
  })

  it("loads the tag from Google's own host with the account's tag ID, and nothing else", () => {
    assert.equal(GOOGLE_ADS_SCRIPT_SRC, `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`)
    assert.match(GOOGLE_ADS_ID, /^AW-\d+$/)
    assert.equal(GOOGLE_ADS_ID, "AW-18517392159")
  })
})

describe("what activates the tag", () => {
  it("is, in Google's order: personalised ads off, consent update, js, redaction, config", () => {
    const calls = googleActivationCalls({ analytics: true, advertising: true }, new Date("2026-10-17T12:00:00Z"))
    assert.equal(calls.length, 5)
    assert.deepEqual(calls[0], ["set", "allow_ad_personalization_signals", false])
    assert.deepEqual(calls[1], [
      "consent",
      "update",
      { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied", analytics_storage: "granted" },
    ])
    assert.equal(calls[2][0], "js")
    assert.ok(calls[2][1] instanceof Date)
    assert.deepEqual(calls[3], ["set", "ads_data_redaction", true])
    assert.deepEqual(calls[4], ["config", GOOGLE_ADS_ID])
  })

  it("passes only the analytics choice through when advertising was accepted without analytics", () => {
    const update = googleActivationCalls({ analytics: false, advertising: true })[1][2] as Record<string, string>
    assert.equal(update.analytics_storage, "denied")
    assert.equal(update.ad_storage, "granted")
    assert.equal(update.ad_user_data, "granted")
    assert.equal(update.ad_personalization, "denied")
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

/** A controller on fake dependencies: the visitor's current choice, a recordable gtag, a cookie-cleanup counter. */
function lab(initial: { analytics: boolean; advertising: boolean } = { analytics: false, advertising: false }) {
  const state = { choice: { ...initial }, hasGtag: true }
  const calls: unknown[][] = []
  const gtag = (...args: unknown[]) => void calls.push(args)
  let cleared = 0
  const controller = createGoogleAdsController({
    choice: () => ({ ...state.choice }),
    gtag: () => (state.hasGtag ? gtag : undefined),
    clearCookies: () => void cleared++,
    now: () => new Date("2026-10-17T12:00:00Z"),
  })
  return { controller, state, calls, gtag, cleared: () => cleared }
}

const update = (ad: "granted" | "denied", analytics: "granted" | "denied") => [
  "consent",
  "update",
  { ad_storage: ad, ad_user_data: ad, ad_personalization: "denied", analytics_storage: analytics },
]

describe("sendTelegramClick", () => {
  it("sends nothing before the tag is active, whatever the visitor accepted", () => {
    const { controller, calls, gtag } = lab({ analytics: true, advertising: true })
    assert.equal(sendTelegramClick("course", "hero", controller, gtag), false) // script not loaded yet
    assert.equal(calls.length, 0)
    controller.markScriptReady()
    const before = calls.length
    assert.equal(sendTelegramClick("course", "hero", controller, gtag), true)
    assert.equal(calls.length, before + 1)
  })

  it("sends nothing after a rejection or with analytics only", () => {
    for (const choice of [{ analytics: false, advertising: false }, { analytics: true, advertising: false }]) {
      const { controller, calls, gtag } = lab(choice)
      controller.markScriptReady()
      assert.equal(sendTelegramClick("manager", "header", controller, gtag), false)
      assert.equal(calls.length, 0)
    }
  })

  it("sends exactly one named event per click once the tag is active", () => {
    const { controller, calls, gtag } = lab({ analytics: false, advertising: true })
    controller.markScriptReady()
    calls.length = 0
    assert.equal(sendTelegramClick("manager", "header", controller, gtag), true)
    assert.deepEqual(calls, [["event", "ruta_manager_click", { telegram_target: "manager", placement: "header", transport_type: "beacon" }]])
  })

  it("stops at once after the consent is withdrawn, even before anyone told the controller", () => {
    const { controller, state, calls, gtag } = lab({ analytics: true, advertising: true })
    controller.markScriptReady()
    calls.length = 0
    assert.equal(sendTelegramClick("course", "hero", controller, gtag), true)
    state.choice = { analytics: true, advertising: false } // another tab withdrew it; no sync() yet
    assert.equal(sendTelegramClick("course", "hero", controller, gtag), false)
    assert.equal(calls.length, 1)
  })

  it("never lets a failing tag break the click", () => {
    const { controller } = lab({ analytics: false, advertising: true })
    controller.markScriptReady()
    const broken = () => {
      throw new Error("boom")
    }
    assert.equal(sendTelegramClick("course", "hero", controller, broken), false)
  })

  it("sends nothing when gtag.js never loaded (blocked by an extension or the network)", () => {
    const { controller, calls, gtag } = lab({ analytics: true, advertising: true })
    controller.sync() // consent accepted, script never reports ready
    assert.equal(controller.isActive(), false)
    assert.equal(sendTelegramClick("course", "hero", controller, gtag), false)
    assert.equal(calls.length, 0)
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

describe("the life of the tag: a fast-changing visitor", () => {
  it("does nothing for a visitor who never accepted advertising (and cleans Google cookies)", () => {
    const { controller, calls, cleared } = lab({ analytics: true, advertising: false })
    controller.sync()
    controller.markScriptReady() // e.g. the script was started by an earlier tab
    controller.sync()
    assert.equal(calls.length, 0)
    assert.ok(cleared() >= 1)
    assert.equal(controller.isActive(), false)
  })

  it("accepted, but the script is still downloading: nothing is activated yet", () => {
    const { controller, calls } = lab({ analytics: true, advertising: true })
    controller.sync()
    assert.equal(calls.length, 0)
    assert.deepEqual(controller.state(), { scriptReady: false, scriptFailed: false, activated: false, announced: null })
  })

  it("activates when the script has loaded: personalised ads off, update (ad_personalization denied), js, redaction, config", () => {
    const { controller, calls } = lab({ analytics: true, advertising: true })
    controller.sync()
    controller.markScriptReady()
    assert.deepEqual(calls, [
      ["set", "allow_ad_personalization_signals", false],
      update("granted", "granted"),
      ["js", new Date("2026-10-17T12:00:00Z")],
      ["set", "ads_data_redaction", true],
      ["config", GOOGLE_ADS_ID],
    ])
    assert.equal(controller.isActive(), true)
  })

  it("withdrawn WHILE the script downloads: when it arrives nothing is activated, Google keeps the default 'denied'", () => {
    const { controller, state, calls, cleared } = lab({ analytics: true, advertising: true })
    controller.sync()
    state.choice = { analytics: true, advertising: false }
    controller.sync()
    controller.markScriptReady()
    assert.equal(calls.length, 0) // no update, no js, no config
    assert.ok(cleared() >= 1)
    assert.equal(controller.isActive(), false)
    assert.deepEqual(controller.state(), { scriptReady: true, scriptFailed: false, activated: false, announced: null })
  })

  it("accepted, withdrawn and accepted again while downloading: one activation with the FINAL choice", () => {
    const { controller, state, calls } = lab({ analytics: true, advertising: true })
    controller.sync()
    state.choice = { analytics: true, advertising: false }
    controller.sync()
    state.choice = { analytics: false, advertising: true } // back, and analytics switched off meanwhile
    controller.sync()
    controller.markScriptReady()
    assert.equal(calls.filter((c) => c[0] === "config").length, 1)
    assert.deepEqual(calls[1], update("granted", "denied"))
  })

  it("withdrawn after activation: exactly one 'denied' update, analytics keeps its own choice, cookies removed", () => {
    const { controller, state, calls, cleared } = lab({ analytics: true, advertising: true })
    controller.markScriptReady()
    calls.length = 0
    const before = cleared()
    state.choice = { analytics: true, advertising: false }
    controller.sync()
    controller.sync() // the same state again: nothing new
    assert.deepEqual(calls, [update("denied", "granted")])
    assert.ok(cleared() > before)
    assert.equal(controller.isActive(), false)
  })

  it("accepted again WITHOUT a reload: one 'granted' update, never a second config", () => {
    const { controller, state, calls } = lab({ analytics: false, advertising: true })
    controller.markScriptReady()
    state.choice = { analytics: false, advertising: false }
    controller.sync()
    state.choice = { analytics: false, advertising: true }
    controller.sync()
    controller.sync()
    assert.deepEqual(calls.slice(5), [update("denied", "denied"), update("granted", "denied")])
    assert.equal(calls.filter((c) => c[0] === "config").length, 1)
    assert.equal(controller.isActive(), true)
  })

  it("analytics toggled while advertising stays accepted: one update per real change", () => {
    const { controller, state, calls } = lab({ analytics: false, advertising: true })
    controller.markScriptReady()
    calls.length = 0
    state.choice = { analytics: true, advertising: true }
    controller.sync()
    controller.sync()
    state.choice = { analytics: false, advertising: true }
    controller.sync()
    assert.deepEqual(calls, [update("granted", "granted"), update("granted", "denied")])
  })

  it("withdrawing everything denies all four signals", () => {
    const { controller, state, calls } = lab({ analytics: true, advertising: true })
    controller.markScriptReady()
    calls.length = 0
    state.choice = { analytics: false, advertising: false }
    controller.sync()
    assert.deepEqual(calls, [update("denied", "denied")])
  })

  it("a late or repeated 'script loaded' (next/script can report it more than once) never activates twice", () => {
    const { controller, calls } = lab({ analytics: true, advertising: true })
    controller.markScriptReady()
    controller.markScriptReady()
    controller.markScriptReady()
    assert.equal(calls.filter((c) => c[0] === "config").length, 1)
  })

  it("a script that failed to download never activates the tag, even if it is reported as loaded for a tag mounted again", () => {
    const { controller, state, calls } = lab({ analytics: true, advertising: true })
    controller.sync()
    controller.markScriptFailed() // blocked by an extension or the network
    controller.markScriptReady() // next/script resolves the shared promise for a later mount, failed or not
    state.choice = { analytics: true, advertising: false }
    controller.sync()
    state.choice = { analytics: true, advertising: true } // accepted again, without a reload
    controller.sync()
    controller.markScriptReady()
    assert.equal(calls.length, 0)
    assert.equal(controller.isActive(), false)
    assert.deepEqual(controller.state(), { scriptReady: false, scriptFailed: true, activated: false, announced: null })
  })

  it("a failed script still gets Google's cookies removed when the visitor withdraws", () => {
    const { controller, state, cleared } = lab({ analytics: false, advertising: true })
    controller.markScriptFailed()
    state.choice = { analytics: false, advertising: false }
    const before = cleared()
    controller.sync()
    assert.ok(cleared() > before)
  })

  it("survives a missing gtag(): it activates later, when gtag() exists, and not before", () => {
    const { controller, state, calls } = lab({ analytics: true, advertising: true })
    state.hasGtag = false
    controller.markScriptReady()
    assert.equal(calls.length, 0)
    assert.equal(controller.state().activated, false)
    state.hasGtag = true
    controller.sync()
    assert.equal(calls.filter((c) => c[0] === "config").length, 1)
  })
})
