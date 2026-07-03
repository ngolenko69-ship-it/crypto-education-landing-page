"use client"

import { ArrowLeftRight, ArrowRight, CircleDollarSign, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-scroll-reveal"

const cards = [
  {
    icon: CircleDollarSign,
    title: "Qué son",
    description: "Dólares digitales explicados sin jerga.",
  },
  {
    icon: ArrowLeftRight,
    title: "Cómo se usan",
    description: "Pagos, transferencias y uso práctico.",
  },
  {
    icon: ShieldAlert,
    title: "Qué revisar",
    description: "Riesgos, redes y errores comunes.",
  },
]

export function DolaresDigitalesSection() {
  const { ref, inView } = useInView()

  return (
    <section
      id="dolares-digitales"
      aria-labelledby="dolares-digitales-title"
      className="relative w-full scroll-mt-24 overflow-hidden"
    >
      {/* ---------- cinematic background image layer ---------- */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* deep dark-green base behind everything */}
        <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

        {/* the coin / route PNG as a full-bleed cover layer on the right */}
        <img
          src="/images/dolares-digitales-background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[88%_center] opacity-90 lg:object-[center_right]"
        />

        {/* global dark overlay so the image never overpowers the text */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.09 0.012 158 / 0.42)" }}
        />

        {/* subtle dark-green tint to unify the gold with the site palette */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: "oklch(0.18 0.03 158 / 0.35)" }}
        />

        {/* left dark protection gradient — near-opaque on mobile, right-limited on desktop */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[78%]"
          style={{
            background:
              "linear-gradient(to right, oklch(0.08 0.012 158) 0%, oklch(0.08 0.012 158 / 0.96) 34%, oklch(0.08 0.012 158 / 0.66) 64%, transparent 100%)",
          }}
        />

        {/* top fade to connect with the transition above */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "26%",
            background:
              "linear-gradient(to bottom, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.6) 45%, transparent 100%)",
          }}
        />

        {/* bottom fade into the section base */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "28%",
            background:
              "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.6) 45%, transparent 100%)",
          }}
        />

        {/* right edge vignette */}
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: "16%",
            background:
              "linear-gradient(to left, oklch(0.07 0.01 158 / 0.7), transparent)",
          }}
        />
      </div>

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 md:px-10 lg:px-14 lg:py-36">
        <div
          ref={ref}
          className="flex max-w-xl flex-col items-start text-left transition-all duration-1000 ease-out will-change-transform lg:max-w-[38rem]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
          }}
        >
          {/* elegant checkpoint badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
              Paso 2 · Dólares digitales
            </span>
          </span>

          <h2
            id="dolares-digitales-title"
            className="mt-6 font-serif text-[2.3rem] font-medium leading-[1.06] tracking-[-0.02em] text-balance text-[oklch(0.97_0.015_88)] sm:text-5xl lg:text-[3.4rem]"
          >
            Entender los dólares digitales es{" "}
            <span className="bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text text-transparent">
              más fácil de lo que parece.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            USDT y USDC aparecen cada vez más en pagos, ahorros digitales y
            transferencias. Antes de usarlos, lo importante es entender qué son,
            cómo funcionan y qué revisar para no cometer errores.
          </p>

          {/* single primary CTA */}
          <div className="mt-9 w-full sm:w-auto">
            <Button
              size="lg"
              nativeButton={false}
              render={<a href="#curso" />}
              className="h-14 w-full rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-9 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.55)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_10px_38px_-6px_oklch(0.8_0.11_84/0.65)] sm:w-auto"
            >
              Obtener curso gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* trust line */}
          <p className="mt-5 text-[13px] tracking-wide text-[oklch(0.72_0.02_88)]">
            Contenido educativo. Sin señales. Sin promesas de ganancias.
          </p>
        </div>

        {/* compact glass cards */}
        <ul className="mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
          {cards.map(({ icon: Icon, title, description }, i) => (
            <li
              key={title}
              className="flex items-start gap-3.5 rounded-xl border border-[oklch(0.8_0.11_84)]/20 bg-[oklch(0.07_0.014_158)]/60 px-4 py-4 shadow-[0_0_30px_-20px_oklch(0.8_0.11_84/0.5)] backdrop-blur-md transition-all duration-700 ease-out hover:border-[oklch(0.8_0.11_84)]/40 hover:bg-[oklch(0.08_0.015_158)]/72"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${180 + i * 130}ms`,
              }}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
