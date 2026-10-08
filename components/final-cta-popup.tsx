"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Send, X } from "lucide-react"
import { TELEGRAM_URL } from "@/lib/telegram"

const SEEN_KEY = "ruta_final_popup_seen"

export function FinalCtaPopup() {
  const [open, setOpen] = useState(false)
  const seenRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  // Show once per session when the final section is significantly visible.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(SEEN_KEY) === "1") {
      seenRef.current = true
      return
    }

    const target = document.getElementById("sobre-nosotros")
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (
          entry?.isIntersecting &&
          entry.intersectionRatio >= 0.4 &&
          !seenRef.current
        ) {
          seenRef.current = true
          sessionStorage.setItem(SEEN_KEY, "1")
          setOpen(true)
          observer.disconnect()
        }
      },
      { threshold: [0.4, 0.5, 0.6] },
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

  const handleSecondary = () => {
    close()
    const target = document.getElementById("primeros-pasos")
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
      <div className="relative w-full max-w-md overflow-hidden rounded-[18px] border border-gold/35 bg-surface p-7 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300 sm:p-9">
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
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-gold)] text-text-secondary transition-colors hover:border-gold/50 hover:text-gold-text"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="relative">
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

          <div className="mt-7 flex flex-col gap-3">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-base cta-primary w-full"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Unirme al Telegram
            </a>
            <button
              type="button"
              onClick={handleSecondary}
              className="cta-base cta-secondary w-full"
            >
              Ver la ruta desde el inicio
            </button>
          </div>

          <p className="type-legal mt-5 tracking-wide">
            Contenido educativo. Sin señales. Sin promesas de ganancias.
          </p>
        </div>
      </div>
    </div>
  )
}
