"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"
import { TELEGRAM_CHANNEL_URL, TELEGRAM_MANAGER_URL } from "@/lib/telegram"

const SEEN_KEY = "ruta_final_popup_seen"

export function FinalCtaPopup() {
  const [open, setOpen] = useState(false)
  const seenRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  // Show once per session when the final section is significantly visible: 40% of the section,
  // capped at 90% of the screen. On short screens (small phones, landscape) 40% of that section
  // is taller than the screen and could never be visible at once, so the plain
  // 40%-of-the-section rule would never open the invitation there; the cap keeps it reachable
  // and leaves every screen where the plain rule worked exactly as it was.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") {
        seenRef.current = true
        return
      }
    } catch {
      /* storage can be unavailable (private mode); the popup still shows once per page load */
    }

    const target = document.getElementById("sobre-nosotros")
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || seenRef.current) return
        const screenHeight = entry.rootBounds?.height ?? window.innerHeight
        const needed = Math.min(entry.boundingClientRect.height * 0.4, screenHeight * 0.9)
        if (entry.intersectionRect.height < needed) return

        seenRef.current = true
        try {
          sessionStorage.setItem(SEEN_KEY, "1")
        } catch {
          /* see above */
        }
        setOpen(true)
        observer.disconnect()
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  // Escape to close + focus management.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-popup-title"
      aria-describedby="final-popup-desc"
    >
      {/* overlay */}
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-default bg-[oklch(0.04_0.008_158)]/75 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
      />

      {/* modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[18px] border border-gold/35 bg-surface text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
        {/* soft gold glow accent */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.66 0.1 84 / 0.24) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-gold)] bg-surface-raised text-text-primary shadow-[0_6px_16px_-8px_rgba(0,0,0,0.8)] transition-colors hover:border-gold/60 hover:text-gold-text"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* The copy scrolls inside the card on short screens; the close button above stays put. */}
        <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-7 sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.82_0.05_88)]">
            Ruta completa
          </p>
          <h2
            id="final-popup-title"
            className="mt-3 font-serif text-2xl leading-tight text-balance text-[oklch(0.97_0.015_88)] sm:text-[1.7rem]"
          >
            ¿Quieres recorrer este camino con nosotros?
          </h2>
          <p
            id="final-popup-desc"
            className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-text-secondary"
          >
            Te ayudamos a entender crypto paso a paso, resolver dudas y aprender
            con más seguridad dentro de nuestra comunidad educativa.
          </p>

          <div className="mt-7 flex flex-col gap-6">
            <div>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby="final-popup-channel-desc"
                className="cta-base cta-primary w-full"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Suscribirme al canal gratuito
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
              <p
                id="final-popup-channel-desc"
                className="mx-auto mt-3 max-w-xs text-pretty text-sm leading-snug text-text-secondary"
              >
                Noticias, educación cripto y recursos gratuitos para aprender con mayor seguridad.
              </p>
            </div>

            <div>
              <a
                href={TELEGRAM_MANAGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-describedby="final-popup-manager-desc"
                className="cta-base cta-secondary w-full"
              >
                <MessageCircle className="h-4 w-4 text-gold" aria-hidden="true" />
                Hablar con un administrador
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
              <p
                id="final-popup-manager-desc"
                className="mx-auto mt-3 max-w-xs text-pretty text-sm leading-snug text-text-secondary"
              >
                ¿Tienes alguna pregunta? Contacta con nuestro equipo.
              </p>
            </div>
          </div>

          <p className="type-legal mt-5 tracking-wide">
            Contenido educativo. Sin señales. Sin promesas de ganancias.
          </p>
        </div>
      </div>
    </div>
  )
}
