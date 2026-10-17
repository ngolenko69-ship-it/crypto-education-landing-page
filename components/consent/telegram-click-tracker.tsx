"use client"

import { useEffect } from "react"
import { classifyTelegramHref, sendTelegramClick } from "@/lib/ads"

/** The same link clicked again within this time counts once: a double tap or a double click is one intention. */
const DEDUPE_MS = 1000

// A closed vocabulary: the only things that ever leave the page about where a click happened.
const SECTION_PLACEMENT: Record<string, string> = {
  inicio: "hero",
  "primeros-pasos": "primeros_pasos",
  "dolares-digitales": "dolares_digitales",
  "p2p-seguro": "p2p_seguro",
  wallets: "wallets",
  "anti-estafas": "anti_estafas",
  comunidad: "comunidad",
  "sobre-nosotros": "sobre_nosotros",
  legal: "footer_legal",
}
const LEGAL_PAGES = ["/aviso-legal", "/politica-de-privacidad", "/politica-de-cookies", "/terminos"]

function placementOf(anchor: Element, pathname: string): string {
  if (anchor.closest('[aria-labelledby="final-popup-title"]')) return "final_popup"
  if (anchor.closest('[role="dialog"]')) return "help_launcher"
  if (anchor.closest("#site-menu")) return "header_menu"
  if (anchor.closest("header")) return "header"
  const section = anchor.closest("section[id], footer[id]")
  if (section && SECTION_PLACEMENT[section.id]) return SECTION_PLACEMENT[section.id]
  if (pathname === "/contacto") return "contact_page"
  if (LEGAL_PAGES.includes(pathname)) return "legal_page"
  return "other"
}

/**
 * The single place where clicks on the three official Telegram destinations are noticed: the
 * course bot (ruta_course_click), the free channel (ruta_community_click) and the manager
 * (ruta_manager_click). One listener on the document covers every button and link of the site,
 * present and future (header, menu, hero, steps, popup, help panel, contact and legal pages), so
 * no component needs its own tracking code and one click can never be reported twice.
 *
 * It only observes: it never cancels, delays or rewrites a click, so Telegram opens exactly as
 * before on every device. What it reports, and only with the visitor's consent to "Publicidad y
 * medición", is that a link was opened; see lib/ads.ts.
 */
export function TelegramClickTracker() {
  useEffect(() => {
    const handled = new WeakSet<Event>()
    const lastSent = new WeakMap<Element, number>() // per link: two different buttons are two different actions

    const onActivate = (event: MouseEvent) => {
      // Real person only: not a script calling .click(). Left button for "click", middle for "auxclick".
      if (!event.isTrusted) return
      if (event.button !== (event.type === "auxclick" ? 1 : 0)) return
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null
      if (!anchor) return
      const target = classifyTelegramHref(anchor.href)
      if (!target || handled.has(event)) return
      handled.add(event)

      const now = Date.now()
      const previous = lastSent.get(anchor)
      if (previous !== undefined && now - previous < DEDUPE_MS) return
      if (sendTelegramClick(target, placementOf(anchor, window.location.pathname))) lastSent.set(anchor, now)
    }

    // capture phase: seen before any other handler, even one that stops propagation
    document.addEventListener("click", onActivate, true)
    document.addEventListener("auxclick", onActivate, true)
    return () => {
      document.removeEventListener("click", onActivate, true)
      document.removeEventListener("auxclick", onActivate, true)
    }
  }, [])

  return null
}
