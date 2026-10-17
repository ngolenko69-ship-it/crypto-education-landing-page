"use client"

import Script from "next/script"
import { GOOGLE_ADS_SCRIPT_SRC, GOOGLE_ADS_STUB_SCRIPT, googleAds } from "@/lib/ads"

/**
 * The two scripts of the Google Ads tag. Rendered only by ConsentGatedGoogleAds, and only after the
 * visitor accepted "Publicidad y medición"; this file itself is loaded on demand, so visitors who did
 * not accept never even download it.
 *
 * The first script defines gtag() and sends Google's consent default (everything "denied"); the second
 * loads gtag.js. Nothing is activated here: when gtag.js has really loaded, the controller checks the
 * visitor's CURRENT choice and only then sends consent update, js and config (lib/ads.ts). next/script
 * runs each script once per page load (it de-duplicates by id), so the tag cannot be loaded twice.
 *
 * "Really loaded" is onLoad (the script element's load event), not onReady: onReady also fires when this
 * component is mounted again while the script is still downloading, e.g. after accept, withdraw, accept
 * in quick succession, and would activate the tag before gtag.js exists.
 */
export default function GoogleAdsTag() {
  return (
    <>
      <Script id="google-ads-init" strategy="afterInteractive">
        {GOOGLE_ADS_STUB_SCRIPT}
      </Script>
      <Script
        id="google-ads-tag"
        src={GOOGLE_ADS_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => googleAds.markScriptReady()}
        onError={() => googleAds.markScriptFailed()}
      />
    </>
  )
}
