"use client"

import Script from "next/script"
import { GOOGLE_ADS_SCRIPT_SRC, buildGoogleAdsInitScript } from "@/lib/ads"

/**
 * The two scripts that start the Google Ads tag. Rendered only by ConsentGatedGoogleAds, and only
 * after the visitor accepted "Publicidad y medición"; this file itself is loaded on demand, so
 * visitors who did not accept never even download it. next/script runs each script once per
 * page load (it de-duplicates by id), so the tag cannot be loaded twice.
 */
export default function GoogleAdsTag({ analytics }: { analytics: boolean }) {
  return (
    <>
      <Script id="google-ads-init" strategy="afterInteractive">
        {buildGoogleAdsInitScript({ analytics, advertising: true })}
      </Script>
      <Script id="google-ads-tag" src={GOOGLE_ADS_SCRIPT_SRC} strategy="afterInteractive" />
    </>
  )
}
