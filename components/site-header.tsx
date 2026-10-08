"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Curso gratis", href: "#primeros-pasos" },
  { label: "Dólares digitales", href: "#dolares-digitales" },
  { label: "P2P seguro", href: "#p2p-seguro" },
  { label: "Wallets", href: "#wallets" },
  { label: "Anti-estafas", href: "#anti-estafas" },
  { label: "Comunidad", href: "#comunidad" },
  { label: "Sobre nosotros", href: "#sobre-nosotros" },
]

const sectionIds = navItems.map((item) => item.href.slice(1))

/**
 * Fixed header with one deterministic height (--header-h) at every size, so
 * the page offset, anchor scroll padding and focus scroll padding all agree.
 * Full navigation from xl (1280px); 1024-1279 uses the compact menu because
 * eight Spanish labels plus the CTA do not fit without clipping.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("inicio")

  // Scroll-spy: the section crossing the upper-middle band of the viewport.
  // The footer is not a menu item on purpose; "Sobre nosotros" stays active there.
  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // The compact menu closes on Escape and never stays open across a resize to desktop.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const mq = window.matchMedia("(min-width: 1280px)")
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    mq.addEventListener("change", onChange)
    return () => {
      window.removeEventListener("keydown", onKey)
      mq.removeEventListener("change", onChange)
    }
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-gold/15 bg-surface-deep/85 backdrop-blur-xl">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-full max-w-[var(--container)] items-center justify-between gap-4 px-[var(--gutter)]"
      >
        <a href="#inicio" className="flex shrink-0 items-center py-1 transition-opacity hover:opacity-90">
          <img
            src="/images/ruta-logo.png"
            alt="RUTA Cripto Segura"
            className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(230,197,116,0.25)]"
          />
        </a>

        <ul className="hidden items-center gap-4 xl:flex 2xl:gap-5">
          {navItems.map((item) => {
            const isActive = active === item.href.slice(1)
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative inline-flex min-h-10 items-center whitespace-nowrap text-[13px] font-medium tracking-wide transition-colors duration-200 2xl:text-sm ${
                    isActive ? "text-gold-text" : "text-text-primary hover:text-gold-text"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_rgba(230,197,116,0.9)] transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </a>
              </li>
            )
          })}
        </ul>

        <div className="hidden shrink-0 xl:block">
          <a href="#primeros-pasos" className="cta-base cta-primary group/cta min-h-10 px-5 text-[13px] 2xl:text-sm">
            Empezar la ruta
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line-gold)] text-text-primary xl:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div
          id="site-menu"
          className="max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-gold/10 bg-surface-deep/95 px-[var(--gutter)] pb-6 pt-2 backdrop-blur-xl xl:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = active === item.href.slice(1)
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-surface-raised text-gold-text"
                        : "text-text-primary hover:bg-surface-raised hover:text-gold-text"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <a
            href="#primeros-pasos"
            onClick={() => setOpen(false)}
            className="cta-base cta-primary group/cta mt-4 w-full"
          >
            Empezar la ruta
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      )}
    </header>
  )
}
