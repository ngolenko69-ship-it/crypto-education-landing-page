"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { isAdsExcludedPath, reconcileGoogleConsent } from "@/lib/ads"
import { useConsent } from "./use-consent"

// Loaded only on demand, like the Vercel Analytics gate: until the visitor accepts "Publicidad y
// medición", neither this code nor any Google script is downloaded or run.
const GoogleAdsTag = dynamic(() => import("./google-ads-tag"), { ssr: false })

/**
 * The Google Ads tag, behind the visitor's consent to "Publicidad y medición" (see lib/ads.ts).
 *
 * Basic Consent Mode: while that category is not accepted this renders nothing, so no Google
 * script, request or cookie exists. Accepting only "Analíticas" does not load it either. Once
 * accepted, the tag starts once (next/script de-duplicates by id, so it is never loaded twice, not
 * even across page navigations or a withdraw-and-accept again).
 *
 * Later changes and withdrawals: the effect keeps Google's consent state equal to the visitor's choice
 * (reconcileGoogleConsent), the click events stop at once (they re-check the consent on every click)
 * and Google's cookies on this domain are removed.
 */
export function ConsentGatedGoogleAds() {
  const { ready, analytics, advertising } = useConsent()
  const pathname = usePathname()
  const excluded = isAdsExcludedPath(pathname)

  useEffect(() => {
    if (ready && !excluded) reconcileGoogleConsent({ analytics, advertising })
  }, [ready, excluded, analytics, advertising])

  if (!ready || !advertising || excluded) return null
  return <GoogleAdsTag analytics={analytics} />
}
