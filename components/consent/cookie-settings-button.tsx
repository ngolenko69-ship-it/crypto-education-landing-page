"use client"

import { FOOTER_LINK_CLASS, FooterLinkUnderline } from "@/components/site/footer-links"
import { openCookieSettings } from "@/lib/consent"

/**
 * Opens the cookie preferences dialog, so the visitor can change or withdraw their choice at
 * any time. "footer" looks like the footer links; "panel" is a regular secondary button.
 */
export function CookieSettingsButton({ variant }: { variant: "footer" | "panel" }) {
  if (variant === "panel") {
    return (
      <button type="button" onClick={openCookieSettings} className="cta-base cta-secondary cursor-pointer">
        Configurar preferencias
      </button>
    )
  }
  return (
    <button type="button" onClick={openCookieSettings} className={FOOTER_LINK_CLASS}>
      Preferencias de cookies
      <FooterLinkUnderline />
    </button>
  )
}
