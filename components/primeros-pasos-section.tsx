"use client"

import { ArrowRight, BookOpen, Play, Rocket, ShieldAlert, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-scroll-reveal"

const learnCards = [
  {
    icon: BookOpen,
    title: "Fundamentos claros",
    description:
      "Qué es una wallet, una stablecoin y cómo se mueve el dinero digital, explicado sin jerga.",
  },
  {
    icon: ShieldAlert,
    title: "Reconocer riesgos",
    description:
      "Señales de fraude y errores comunes antes de confiar en una plataforma, grupo o promesa.",
  },
  {
    icon: Users,
    title: "P2P: qué revisar",
    description:
      "Qué comprobar antes de aceptar una operación entre personas y cómo evitar sorpresas.",
  },
]

export function PrimerosPasosSection() {
  const { ref, inView } = useInView()

  return (
    <section
      id="curso"
      aria-labelledby="primeros-pasos-title"
      className="relative w-full scroll-mt-24 px-5 pb-24 pt-4 sm:px-8 md:px-10 lg:px-14 lg:pb-32"
    >
      {/* thin glowing route line entering from above, stopping at the badge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-16 w-px -translate-x-1/2 sm:h-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.82 0.12 84 / 0.9))",
          boxShadow: "0 0 12px oklch(0.8 0.11 84 / 0.45)",
        }}
      />

      <div
        ref={ref}
        className="mx-auto flex max-w-3xl flex-col items-center text-center transition-all duration-1000 ease-out will-change-transform"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
        }}
      >
        {/* checkpoint badge — the same node from the hero roadmap, expanded */}
        <div className="relative flex items-center gap-3 rounded-full border border-primary/40 bg-card/40 py-2 pl-2 pr-5 backdrop-blur-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/60 bg-[oklch(0.13_0.018_158)] text-primary shadow-[0_0_18px_-4px_oklch(0.8_0.11_84/0.6)]">
            <Rocket className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-[oklch(0.92_0.03_88)]">
            <span className="text-primary">1.</span> Primeros pasos
          </span>
        </div>

        <h1
          id="primeros-pasos-title"
          className="mt-8 font-serif text-[2.1rem] font-medium leading-[1.08] tracking-[-0.015em] text-balance text-[oklch(0.97_0.015_88)] sm:text-5xl lg:text-[3.4rem]"
        >
          El primer paso es entender,{" "}
          <span className="bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text text-transparent">
            no arriesgar.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Crypto ya está presente en pagos, transferencias, dólares digitales,
          wallets y nuevas formas de mover dinero. No necesitas saberlo todo
          desde el primer día: necesitas una ruta clara para empezar sin caer en
          errores comunes.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            size="lg"
            nativeButton={false}
            render={<a href="#que-aprenderas" />}
            className="h-14 rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-9 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.55)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_10px_38px_-6px_oklch(0.8_0.11_84/0.65)]"
          >
            Obtener curso gratis
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<a href="#que-aprenderas" />}
            className="h-14 rounded-full border-primary/45 bg-card/40 px-8 text-[15px] font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/70 hover:bg-card/60 hover:text-foreground"
          >
            <Play className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
            Ver qué aprenderás
          </Button>
        </div>
      </div>

      {/* glass cards: what you'll learn */}
      <ul
        id="que-aprenderas"
        className="mx-auto mt-16 grid max-w-5xl scroll-mt-24 grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6"
      >
        {learnCards.map(({ icon: Icon, title, description }, i) => (
          <li
            key={title}
            className="rounded-2xl border border-primary/15 bg-card/40 p-6 backdrop-blur-sm transition-all duration-700 ease-out hover:border-primary/35 hover:bg-card/55"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transitionDelay: `${180 + i * 130}ms`,
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
