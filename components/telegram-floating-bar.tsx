"use client"

import { useEffect, useState } from "react"
import { Send, X } from "lucide-react"
import { TELEGRAM_URL } from "@/lib/telegram"

const DISMISS_KEY = "ruta_telegram_bar_dismissed"

export function TelegramFloatingBar() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true)
      return
    }

    const dolares = document.getElementById("dolares-digitales")

    const onScroll = () => {
      const pastTwoViewports = window.scrollY > window.innerHeight * 2
      const pastDolares = dolares
        ? dolares.getBoundingClientRect().top < window.innerHeight * 0.5
        : false

      if (pastTwoViewports || pastDolares) {
        setVisible(true)
      }
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setDismissed(true)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1")
    }
  }

  if (dismissed) return null

  return (
    <div
      role="complementary"
      aria-label="Invitación a la comunidad de Telegram"
      className={`fixed z-40 transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      } inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-[oklch(0.1_0.014_158)]/90 p-5 shadow-[0_18px_50px_-12px_oklch(0_0_0/0.7),0_0_40px_-18px_oklch(0.8_0.11_84/0.6)] backdrop-blur-xl">
        {/* soft gold glow accent */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.66 0.1 84 / 0.22) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-gold"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <div className="relative flex items-start gap-3.5">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Send className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0 pr-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.82_0.05_88)]">
              Comunidad
            </p>
            <h3 className="mt-1 font-serif text-lg leading-tight text-[oklch(0.97_0.015_88)]">
              Únete a nuestra comunidad
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Te ayudamos a entender crypto con más seguridad, sin señales ni
              promesas.
            </p>
          </div>
        </div>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_oklch(0.8_0.11_84/0.55)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)]"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Ir al Telegram
        </a>
      </div>
    </div>
  )
}
