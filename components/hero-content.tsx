"use client"

import { ArrowRight, BellOff, LineChart, Lock, ShieldCheck } from "lucide-react"
import { Cta } from "@/components/ui/cta"
import { useReveal } from "@/hooks/use-scroll-reveal"

const trustItems = [
  { icon: BellOff, label: "Sin señales." },
  { icon: LineChart, label: "Sin promesas de ganancias." },
  { icon: Lock, label: "Sin presión para comprar." },
]

export function HeroContent() {
  const { ref, reveal } = useReveal()

  return (
    <div ref={ref} className="flex max-w-2xl flex-col items-start xl:max-w-none">
      <h1 className="type-h1 heading-shadow" style={reveal({ delay: 180, y: 16, duration: 620 })}>
        Antes de mover tu dinero,{" "}
        <span className="text-gold-phrase block pb-1">aprende a protegerlo.</span>
      </h1>

      <p className="type-lead mt-6 max-w-[34rem]" style={reveal({ delay: 280, y: 14, duration: 560 })}>
        Aprende stablecoins, P2P, wallets, plataformas cripto y anti-estafas
        antes de entrar en crypto. Evita errores costosos y reconoce fraudes
        antes de confiar en una plataforma, grupo o promesa.
      </p>

      <div
        className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
        style={reveal({ delay: 350, y: 14, duration: 560 })}
      >
        <Cta href="#primeros-pasos" className="w-full sm:w-auto">
          Empezar la ruta
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5"
            aria-hidden="true"
          />
        </Cta>
        <Cta href="#anti-estafas" variant="secondary" className="w-full sm:w-auto">
          <ShieldCheck className="h-[18px] w-[18px] text-gold" aria-hidden="true" />
          Aprender a protegerme de estafas
        </Cta>
      </div>

      <ul
        className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-3"
        style={reveal({ delay: 450, y: 12, duration: 560 })}
      >
        {trustItems.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="h-[18px] w-[18px] shrink-0 text-gold" aria-hidden="true" />
            <span className="type-small font-medium text-text-primary">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
