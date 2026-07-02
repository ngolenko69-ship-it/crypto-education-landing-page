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
    <header className="relative z-20">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10"
      >
        <a href="#inicio" className="flex items-center">
          <img
            src="/images/ruta-logo.png"
            alt="RUTA Cripto Segura"
            className="h-10 w-auto object-contain sm:h-12 lg:h-14"
          />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button className="rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
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
        <div className="border-t border-border/60 px-5 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button className="mt-4 w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
            Empezar la ruta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </header>
  )
}
