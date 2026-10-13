"use client"

import dynamic from "next/dynamic"
import { hasAnalyticsConsent } from "@/lib/consent"
import { useConsent } from "./use-consent"

// Loaded only on demand: until the visitor accepts, neither this code nor the Vercel script
// is downloaded or run.
const Analytics = dynamic(() => import("@vercel/analytics/next").then((m) => m.Analytics), {
  ssr: false,
})

/**
 * Vercel Web Analytics, behind the visitor's consent. Production only, as before.
 * `beforeSend` re-checks the consent on every event, so withdrawing it stops sending at once,
 * without needing a reload.
 */
export function ConsentGatedAnalytics() {
  const { analytics } = useConsent()
  if (process.env.NODE_ENV !== "production" || !analytics) return null
  return <Analytics beforeSend={(event) => (hasAnalyticsConsent() ? event : null)} />
}
