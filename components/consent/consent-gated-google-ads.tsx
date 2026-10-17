"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { googleAds, isAdsExcludedPath } from "@/lib/ads"
import { useConsent } from "./use-consent"

// Loaded only on demand, like the Vercel Analytics gate: until the visitor accepts "Publicidad y
// medición", neither this code nor any Google script is downloaded or run.
const GoogleAdsTag = dynamic(() => import("./google-ads-tag"), { ssr: false })

/**
 * The Google Ads tag, behind the visitor's consent to "Publicidad y medición" (see lib/ads.ts).
 *
 * Basic Consent Mode: while that category is not accepted this renders nothing, so no Google
 * script, request or cookie exists. Accepting only "Analíticas" does not load it either. Once
 * accepted, the tag is loaded once (next/script de-duplicates by id, so never twice, not even across
 * page navigations or a withdraw-and-accept again) and activated only after it has loaded and only
 * if the visitor's choice at that moment still includes advertising.
 *
 * Every later change or withdrawal goes through googleAds.sync(), which keeps Google's consent state
 * equal to the visitor's choice and removes Google's cookies from this domain; the click events stop
 * at once (they ask googleAds.isActive() on every click).
 */
export function ConsentGatedGoogleAds() {
  const { ready, analytics, advertising } = useConsent()
  const pathname = usePathname()
  const excluded = isAdsExcludedPath(pathname)

  useEffect(() => {
    if (ready && !excluded) googleAds.sync()
  }, [ready, excluded, analytics, advertising])

  if (!ready || !advertising || excluded) return null
  return <GoogleAdsTag />
}
