import assert from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"
import {
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  CONSENT_VERSION,
  getConsentSnapshot,
  hasAdvertisingConsent,
  hasAnalyticsConsent,
  parseConsentRecord,
  saveConsent,
  subscribeConsent,
} from "../consent"

const NOW = Date.UTC(2026, 9, 17, 12, 0, 0)
const DAY = 24 * 60 * 60 * 1000

describe("parseConsentRecord", () => {
  it("reads a version 2 record as it was saved, in every combination", () => {
    for (const analytics of [true, false]) {
      for (const advertising of [true, false]) {
        assert.deepEqual(parseConsentRecord({ v: 2, analytics, advertising, ts: NOW - DAY }, NOW), { analytics, advertising })
      }
    }
  })

  it("keeps an old version 1 choice for analytics and never reads it as advertising consent", () => {
    assert.deepEqual(parseConsentRecord({ v: 1, analytics: true, ts: NOW - DAY }, NOW), { analytics: true, advertising: false })
    assert.deepEqual(parseConsentRecord({ v: 1, analytics: false, ts: NOW - DAY }, NOW), { analytics: false, advertising: false })
  })

  it("ignores an advertising flag smuggled into a version 1 record", () => {
    assert.deepEqual(parseConsentRecord({ v: 1, analytics: true, advertising: true, ts: NOW - DAY }, NOW), {
      analytics: true,
      advertising: false,
    })
  })

  it("treats anything malformed as 'not decided'", () => {
    const bad: unknown[] = [
      null,
      undefined,
      "x",
      42,
      [],
      {},
      { v: 2, analytics: true, ts: NOW },
      { v: 2, advertising: true, ts: NOW },
      { v: 2, analytics: "true", advertising: false, ts: NOW },
      { v: 2, analytics: true, advertising: 1, ts: NOW },
      { v: 1, analytics: "yes", ts: NOW },
      { v: 3, analytics: true, advertising: true, ts: NOW },
      { v: 0, analytics: true, advertising: true, ts: NOW },
      { analytics: true, advertising: true, ts: NOW },
      { v: 2, analytics: true, advertising: true },
      { v: 2, analytics: true, advertising: true, ts: "now" },
      { v: 2, analytics: true, advertising: true, ts: Number.NaN },
      { v: 2, analytics: true, advertising: true, ts: Number.POSITIVE_INFINITY },
    ]
    for (const record of bad) assert.equal(parseConsentRecord(record, NOW), null, JSON.stringify(record))
  })

  it("expires after 12 months and rejects a date far in the future", () => {
    const at = (ts: number, v = 2) => parseConsentRecord({ v, analytics: true, advertising: true, ts }, NOW)
    assert.notEqual(at(NOW - CONSENT_MAX_AGE_MS), null)
    assert.equal(at(NOW - CONSENT_MAX_AGE_MS - 1), null)
    assert.equal(parseConsentRecord({ v: 1, analytics: true, ts: NOW - CONSENT_MAX_AGE_MS - 1 }, NOW), null)
    assert.notEqual(at(NOW + DAY - 1), null) // small clock skew is fine
    assert.equal(at(NOW + 2 * DAY), null)
  })
})

/** A minimal browser: a localStorage that can be made to fail, and the "storage" event channel. */
function installBrowser() {
  const data = new Map<string, string>()
  const state = { blocked: false }
  const handlers = new Map<string, Set<(e: unknown) => void>>()
  const localStorage = {
    getItem(key: string) {
      if (state.blocked) throw new Error("blocked")
      return data.get(key) ?? null
    },
    setItem(key: string, value: string) {
      if (state.blocked) throw new Error("blocked")
      data.set(key, value)
    },
  }
  const fakeWindow = {
    localStorage,
    addEventListener(type: string, fn: (e: unknown) => void) {
      if (!handlers.has(type)) handlers.set(type, new Set())
      handlers.get(type)!.add(fn)
    },
    removeEventListener(type: string, fn: (e: unknown) => void) {
      handlers.get(type)?.delete(fn)
    },
    dispatchEvent() {
      return true
    },
  }
  ;(globalThis as unknown as { window: unknown }).window = fakeWindow
  return {
    data,
    state,
    /** Another tab (or a manual edit) changed the stored record. */
    otherTabWrote(raw: string | null) {
      if (raw === null) data.delete(CONSENT_KEY)
      else data.set(CONSENT_KEY, raw)
      handlers.get("storage")?.forEach((fn) => fn({ key: CONSENT_KEY }))
    },
  }
}

describe("consent store", () => {
  let browser: ReturnType<typeof installBrowser>
  beforeEach(() => {
    browser = installBrowser()
    // start every test from "no record, nothing cached"
    browser.otherTabWrote(null)
    subscribeConsent(() => {})
    browser.otherTabWrote(null)
  })

  it("starts undecided: nothing optional is granted", () => {
    const s = getConsentSnapshot()
    assert.deepEqual(s, { ready: true, decided: false, analytics: false, advertising: false })
    assert.equal(hasAnalyticsConsent(), false)
    assert.equal(hasAdvertisingConsent(), false)
  })

  it("reads a stored version 1 record: analytics kept, advertising never granted", () => {
    browser.otherTabWrote(JSON.stringify({ v: 1, analytics: true, ts: Date.now() - DAY }))
    assert.deepEqual(getConsentSnapshot(), { ready: true, decided: true, analytics: true, advertising: false })
    assert.equal(hasAdvertisingConsent(), false)
  })

  it("saves a version 2 record and notifies subscribers", () => {
    let notified = 0
    const unsubscribe = subscribeConsent(() => notified++)
    saveConsent({ analytics: true, advertising: false })
    assert.equal(notified, 1)
    const stored = JSON.parse(browser.data.get(CONSENT_KEY)!)
    assert.equal(stored.v, CONSENT_VERSION)
    assert.equal(stored.analytics, true)
    assert.equal(stored.advertising, false)
    assert.equal(typeof stored.ts, "number")
    assert.deepEqual(getConsentSnapshot(), { ready: true, decided: true, analytics: true, advertising: false })
    unsubscribe()
    saveConsent({ analytics: true, advertising: true })
    assert.equal(notified, 1) // unsubscribed
  })

  it("keeps the two optional categories independent in both directions", () => {
    saveConsent({ analytics: true, advertising: false })
    assert.equal(hasAnalyticsConsent(), true)
    assert.equal(hasAdvertisingConsent(), false)
    saveConsent({ analytics: false, advertising: true })
    assert.equal(hasAnalyticsConsent(), false)
    assert.equal(hasAdvertisingConsent(), true)
  })

  it("withdraws: rejecting after accepting turns everything optional off", () => {
    saveConsent({ analytics: true, advertising: true })
    assert.equal(hasAdvertisingConsent(), true)
    saveConsent({ analytics: false, advertising: false })
    assert.deepEqual(getConsentSnapshot(), { ready: true, decided: true, analytics: false, advertising: false })
  })

  it("follows a change made in another tab", () => {
    saveConsent({ analytics: true, advertising: true })
    browser.otherTabWrote(JSON.stringify({ v: 2, analytics: true, advertising: false, ts: Date.now() }))
    assert.equal(hasAdvertisingConsent(), false)
    assert.equal(hasAnalyticsConsent(), true)
  })

  it("treats a corrupt record as undecided instead of throwing", () => {
    browser.otherTabWrote("{not json")
    assert.deepEqual(getConsentSnapshot(), { ready: true, decided: false, analytics: false, advertising: false })
  })

  it("keeps the choice for the page session when storage is blocked", () => {
    browser.state.blocked = true
    saveConsent({ analytics: false, advertising: true })
    assert.equal(hasAdvertisingConsent(), true)
    assert.equal(hasAnalyticsConsent(), false)
  })
})
