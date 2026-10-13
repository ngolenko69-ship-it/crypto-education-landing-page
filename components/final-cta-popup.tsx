"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Gift, Send, X } from "lucide-react"
import { FINAL_POPUP_OPEN_EVENT } from "@/lib/overlay-events"
import { TELEGRAM_CHANNEL_URL, TELEGRAM_COURSE_URL } from "@/lib/telegram"

const SEEN_KEY = "ruta_final_popup_seen"
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"])

/**
 * The closing invitation. One purpose: the free introductory course (the bot), with the free
 * channel as the quiet second route. Opens once per session when the final section is on screen,
 * never on a timer or on exit intent; closes with its button, Escape or the overlay.
 */
export function FinalCtaPopup() {
  const [open, setOpen] = useState(false)
  const seenRef = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

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

  // Escape closes, Tab stays inside the card, focus starts on the close button.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        return
      }
      if (e.key !== "Tab") {
        // Keys that would scroll the page behind. Inside the card the copy may need them (short screens).
        if (SCROLL_KEYS.has(e.key) && !(e.key === " " && (e.target as HTMLElement | null)?.closest("button"))) {
          const scroller = scrollerRef.current
          if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) e.preventDefault()
        }
        return
      }
      const card = cardRef.current
      if (!card) return
      const items = Array.from(card.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!card.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, close])

  // Tell the other floating pieces (the help panel) to step aside: the invitation owns the screen.
  useEffect(() => {
    if (open) window.dispatchEvent(new Event(FINAL_POPUP_OPEN_EVENT))
  }, [open])

  // The page behind does not scroll while the invitation is open (wheel, touch and the scroll keys).
  // The scroll is held back instead of hiding the page's scrollbar: hiding it would widen the page
  // by the scrollbar's width and make the header and the content jump sideways. The card's own
  // text still scrolls when a short screen needs it.
  useEffect(() => {
    if (!open) return
    const overlay = overlayRef.current
    const scroller = scrollerRef.current
    if (!overlay || !scroller) return
    const canScroll = (dy: number) =>
      scroller.scrollHeight > scroller.clientHeight + 1 &&
      (dy < 0 ? scroller.scrollTop > 0 : scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1)
    const onWheel = (e: WheelEvent) => {
      if (scroller.contains(e.target as Node) && canScroll(e.deltaY)) return
      e.preventDefault()
    }
    let lastY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastY
      const dy = lastY - y
      lastY = y
      if (scroller.contains(e.target as Node) && canScroll(dy)) return
      e.preventDefault()
    }
    overlay.addEventListener("wheel", onWheel, { passive: false })
    overlay.addEventListener("touchstart", onTouchStart, { passive: true })
    overlay.addEventListener("touchmove", onTouchMove, { passive: false })
    return () => {
      overlay.removeEventListener("wheel", onWheel)
      overlay.removeEventListener("touchstart", onTouchStart)
      overlay.removeEventListener("touchmove", onTouchMove)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
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
      <div
        ref={cardRef}
        className="relative w-full max-w-md overflow-hidden rounded-[18px] border border-gold/35 bg-surface text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300"
      >
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
        <div ref={scrollerRef} className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-7 sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.82_0.05_88)]">
            Tu primer paso
          </p>
          <h2
            id="final-popup-title"
            className="mt-3 font-serif text-2xl leading-tight text-balance text-[oklch(0.97_0.015_88)] sm:text-[1.7rem]"
          >
            ¡Empieza tu camino cripto con seguridad!
          </h2>
          <p
            id="final-popup-desc"
            className="mx-auto mt-4 max-w-sm text-pretty text-[15px] leading-relaxed text-text-secondary"
          >
            Recibe nuestro curso introductorio gratuito de criptomonedas en PDF. Suscríbete gratis a
            nuestro canal, verifica tu suscripción en el bot y obtén tu curso.
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <a
              href={TELEGRAM_COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-base cta-primary w-full"
            >
              <Gift className="h-[18px] w-[18px]" aria-hidden="true" />
              Obtener mi curso gratis
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-base cta-secondary w-full"
            >
              <Send className="h-4 w-4 text-gold" aria-hidden="true" />
              Explorar el canal gratuito
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </div>

          <p className="type-legal mt-5 tracking-wide">
            Contenido educativo · Gratis · Sin promesas de ganancias
          </p>
        </div>
      </div>
    </div>
  )
}
