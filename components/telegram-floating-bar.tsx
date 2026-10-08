"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Send, X } from "lucide-react"
import { TELEGRAM_URL } from "@/lib/telegram"

const SEEN_KEY = "ruta_telegram_launcher_seen"

/**
 * Compact community launcher. Closed by default: a small labelled pill in the
 * bottom-right corner (inside the safe area). The panel opens only on the
 * user's action, closes with its button or Escape (focus returns to the pill),
 * and never re-opens by itself on scroll or section change. Once the visitor
 * has opened or closed it, the pill's soft attention dot stays off for the
 * rest of the session. While the Comunidad step is on screen the launcher
 * steps aside so the page's own "Unirme a la comunidad" button has priority.
 */
export function TelegramLauncher() {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(true)
  const [yielding, setYielding] = useState(false)
  const pillRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()

  // Browser-only session state, read once mounted (never during SSR).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeen(sessionStorage.getItem(SEEN_KEY) === "1")
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

  const markSeen = useCallback(() => {
    setSeen(true)
    try {
      sessionStorage.setItem(SEEN_KEY, "1")
    } catch {
      /* storage can be unavailable (private mode); the launcher still works */
    }
  }, [])

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false)
      markSeen()
      if (returnFocus) pillRef.current?.focus()
    },
    [markSeen],
  )

  const toggle = () => {
    if (open) {
      close()
    } else {
      setOpen(true)
      markSeen()
    }
  }

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

  const hidden = yielding

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
          tabIndex={-1}
          className="surface-card relative w-[min(22rem,calc(100vw-2rem))] max-h-[calc(100dvh-7rem)] overflow-y-auto p-5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
        >
          <button
            type="button"
            onClick={() => close()}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-gold)] text-text-secondary transition-colors hover:border-gold/50 hover:text-gold-text"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
              <Send className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="type-eyebrow text-[11px] tracking-[0.16em] text-gold-text">Comunidad</p>
              <h3 id={titleId} className="mt-1 font-serif text-lg leading-tight text-text-primary">
                Únete a nuestra comunidad
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                Te ayudamos a entender crypto con más seguridad, sin señales ni
                promesas.
              </p>
            </div>
          </div>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-base cta-primary mt-4 w-full"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Ir al Telegram
          </a>
        </div>
      )}

      <button
        ref={pillRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Cerrar panel de la comunidad" : "Abrir panel de la comunidad"}
        tabIndex={hidden ? -1 : 0}
        className="cta-base cta-secondary relative min-h-12 gap-2.5 px-4 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)] sm:px-5"
      >
        <Send className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
        <span className="text-[14px] font-semibold">Comunidad</span>
        {!seen && !open && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_10px_rgba(230,197,116,0.9)] motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  )
}
