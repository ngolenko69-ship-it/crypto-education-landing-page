"use client"

import { useState } from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Curso gratis", href: "#curso" },
  { label: "Anti-estafas", href: "#anti-estafas" },
  { label: "P2P seguro", href: "#p2p" },
  { label: "Wallets", href: "#wallets" },
  { label: "Sobre nosotros", href: "#nosotros" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-20 border-b border-primary/10 bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/30">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:gap-6 lg:px-10 lg:py-3.5 xl:gap-8"
      >
        <a href="#inicio" className="flex shrink-0 items-center py-1 transition-opacity hover:opacity-90">
          <img
            src="/images/ruta-logo.png"
            alt="RUTA Cripto Segura"
            className="h-10 w-auto object-contain drop-shadow-[0_2px_12px_oklch(0.8_0.11_84/0.25)] sm:h-11 lg:h-12"
          />
        </a>

        <ul className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="whitespace-nowrap text-[15px] font-medium tracking-wide text-[oklch(0.92_0.02_88)] transition-all duration-200 hover:text-gold xl:text-base"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 lg:block">
          <Button className="rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-6 py-4 text-sm font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_oklch(0.8_0.11_84/0.5)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.6)]">
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
        <div className="border-t border-primary/10 px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-[oklch(0.9_0.03_88)] transition-colors hover:bg-accent hover:text-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] py-5 font-semibold text-primary-foreground shadow-[0_6px_24px_-6px_oklch(0.8_0.11_84/0.5)]">
            Empezar la ruta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </header>
  )
}
