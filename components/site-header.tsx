"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("inicio")

  // Scroll-spy: highlight the nav link for the section currently in view.
  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible section currently intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      {
        // account for the fixed navbar height; trigger around the upper third
        rootMargin: "-45% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/15 bg-[oklch(0.08_0.012_158)]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[oklch(0.08_0.012_158)]/65">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:gap-4 lg:px-10 xl:gap-6"
      >
        <a
          href="#inicio"
          className="flex shrink-0 items-center py-0.5 transition-opacity hover:opacity-90"
        >
          <img
            src="/images/ruta-logo.png"
            alt="RUTA Cripto Segura"
            className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_oklch(0.8_0.11_84/0.25)] lg:h-10"
          />
        </a>

        <ul className="hidden items-center gap-3.5 lg:flex xl:gap-5">
          {navItems.map((item) => {
            const isActive = active === item.href.slice(1)
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative whitespace-nowrap text-[13px] font-medium tracking-wide transition-colors duration-200 xl:text-sm ${
                    isActive
                      ? "text-gold"
                      : "text-[oklch(0.9_0.02_88)] hover:text-gold"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_8px_oklch(0.8_0.11_84/0.9)] transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </a>
              </li>
            )
          })}
        </ul>

        <div className="hidden shrink-0 lg:block">
          <Button
            nativeButton={false}
            render={<a href="#primeros-pasos" />}
            className="rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-5 py-3.5 text-[13px] font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_oklch(0.8_0.11_84/0.5)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.6)] xl:text-sm"
          >
            Empezar la ruta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-primary/10 bg-[oklch(0.07_0.012_158)]/95 px-5 pb-6 pt-2 backdrop-blur-xl lg:hidden">
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
                        ? "bg-accent text-gold"
                        : "text-[oklch(0.9_0.03_88)] hover:bg-accent hover:text-gold"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <Button
            nativeButton={false}
            render={<a href="#primeros-pasos" />}
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] py-5 font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_oklch(0.8_0.11_84/0.5)]"
          >
            Empezar la ruta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </header>
  )
}
