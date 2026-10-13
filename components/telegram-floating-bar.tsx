"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { ArrowUpRight, Gift, MessageCircle, Send, X } from "lucide-react"
import { useConsent } from "@/components/consent/use-consent"
import { FINAL_POPUP_OPEN_EVENT } from "@/lib/overlay-events"
import { TELEGRAM_CHANNEL_URL, TELEGRAM_COURSE_URL, TELEGRAM_MANAGER_URL } from "@/lib/telegram"

/**
 * Compact help launcher. Closed by default: a small labelled pill in the bottom-right corner
 * (inside the safe area; "Ayuda" on phones, "¿Necesitas ayuda?" from 640px). The panel opens
 * only on the user's action, closes with its button or Escape (focus returns to the pill), and
 * never re-opens by itself on scroll or section change.
 * It offers three routes, never a chat: the free course (the bot), a person (the manager) and
 * the free channel. Nothing on it pulses or moves on its own. While the Comunidad step is on
 * screen the launcher steps aside so the page's own "Unirme a la comunidad" button has priority.
 * Below 1024px the cookie banner covers this corner, so there the launcher waits for the
 * visitor's cookie choice instead of hiding behind the banner.
 */
export function TelegramLauncher() {
  const [open, setOpen] = useState(false)
  const [yielding, setYielding] = useState(false)
  // Starts true on purpose: the server and the first client render agree, and nothing flashes
  // under the cookie banner before the real width is known.
  const [compact, setCompact] = useState(true)
  const consent = useConsent()
  const pillRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()
  const descId = useId()

  // Below 1024px the banner spans (or nearly spans) the screen over the launcher.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const onChange = () => {
      setCompact(!mq.matches)
      if (!mq.matches) setOpen(false)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompact(!mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Hide while the Comunidad section occupies the viewport, and close an open
  // panel there so the page's own CTA is the only community call to action.
  useEffect(() => {
    const target = document.getElementById("comunidad")
    if (!target || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.25
        setYielding(inView)
        if (inView) setOpen(false)
      },
      { threshold: [0, 0.25, 0.5] },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  // The final invitation is a modal: an open help panel closes and leaves the focus to it.
  useEffect(() => {
    const onPopup = () => setOpen(false)
    window.addEventListener(FINAL_POPUP_OPEN_EVENT, onPopup)
    return () => window.removeEventListener(FINAL_POPUP_OPEN_EVENT, onPopup)
  }, [])

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) pillRef.current?.focus()
  }, [])

  // Escape closes; focus moves into the panel when it opens.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    panelRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  const waitingForCookies = compact && !(consent.ready && consent.decided)
  const hidden = yielding || waitingForCookies

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 transition-opacity duration-300 motion-reduce:transition-none sm:right-6 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      aria-hidden={hidden || undefined}
    >
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className="surface-card relative max-h-[calc(100dvh-10rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
        >
          <button
            type="button"
            onClick={() => close()}
            aria-label="Cerrar"
            className="group absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-gold-text"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-gold)] transition-colors group-hover:border-gold/50">
              <X className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>

          <div className="flex items-start gap-3.5 pr-9">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 id={titleId} className="font-serif text-lg leading-tight text-text-primary">
                ¿Cómo podemos ayudarte?
              </h3>
              <p id={descId} className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Empieza gratis, explora nuestra comunidad o contacta con nuestro equipo.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href={TELEGRAM_COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close()}
              className="cta-base cta-primary w-full"
            >
              <Gift className="h-[18px] w-[18px]" aria-hidden="true" />
              Obtener curso gratis
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a
              href={TELEGRAM_MANAGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close()}
              className="cta-base cta-secondary w-full"
            >
              <MessageCircle className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
              Hablar con un administrador
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => close()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-medium text-gold-text underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Explorar canal gratuito
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </div>
        </div>
      )}

      <button
        ref={pillRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        tabIndex={hidden ? -1 : 0}
        className="cta-base cta-secondary min-h-11 gap-2 px-3.5 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)] sm:min-h-12 sm:gap-2.5 sm:px-5"
      >
        <MessageCircle className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
        {/* phones: the short label, so the pill takes little of the corner (still a 44px target); from 640px the full question */}
        <span className="text-[14px] font-semibold sm:hidden">Ayuda</span>
        <span className="hidden text-[14px] font-semibold sm:inline">¿Necesitas ayuda?</span>
      </button>
    </div>
  )
}
