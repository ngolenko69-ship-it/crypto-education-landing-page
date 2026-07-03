"use client"

import { AlertTriangle, ArrowRight, BookOpen, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-scroll-reveal"

const learnCards = [
  {
    icon: BookOpen,
    title: "Entender la base",
    description: "Crypto y wallets sin jerga.",
  },
  {
    icon: AlertTriangle,
    title: "Evitar errores",
    description: "Qué revisar antes de enviar dinero.",
  },
  {
    icon: ShieldAlert,
    title: "Reconocer estafas",
    description: "Señales simples antes de confiar.",
  },
]

export function PrimerosPasosSection() {
  const { ref, inView } = useInView()

  return (
    <section
      id="curso"
      aria-labelledby="primeros-pasos-title"
      className="relative w-full scroll-mt-24 overflow-hidden"
    >
      {/* ---------- cinematic background layer ---------- */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <img
          src="/images/primeros-pasos-background.webp"
          alt=""
          className="h-full w-full object-cover object-[92%_center] lg:object-[72%_center]"
        />

        {/* base dark green overlay to unify the image with the site background */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.09 0.014 158 / 0.38)" }}
        />

        {/* soft gold glow to reveal the shield / route on the right */}
        <div
          className="absolute inset-y-0 right-0 hidden lg:block"
          style={{
            width: "46%",
            background:
              "radial-gradient(60% 55% at 74% 52%, oklch(0.66 0.1 84 / 0.16) 0%, transparent 70%)",
          }}
        />

        {/* left text-protection wash — near-opaque on small screens */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[76%]"
          style={{
            background:
              "linear-gradient(to right, #040907 0%, rgba(4,9,7,0.97) 42%, rgba(4,9,7,0.7) 70%, transparent 100%)",
          }}
        />

        {/* top fade — soft connection from the previous hero */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "26%",
            background:
              "linear-gradient(to bottom, #040907 0%, rgba(4,9,7,0.7) 45%, transparent 100%)",
          }}
        />

        {/* bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "30%",
            background:
              "linear-gradient(to top, #040907 0%, rgba(4,9,7,0.72) 45%, transparent 100%)",
          }}
        />

        {/* right vignette */}
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: "20%",
            background: "linear-gradient(to left, rgba(2,4,3,0.5), transparent)",
          }}
        />
      </div>

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 md:px-10 lg:px-14 lg:py-36">
        <div
          ref={ref}
          className="flex max-w-xl flex-col items-start text-left transition-all duration-1000 ease-out will-change-transform lg:max-w-[36rem]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
          }}
        >
          {/* small, elegant checkpoint badge aligned above the H1 */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
              Paso 1 · Primeros pasos
            </span>
          </span>

          <h1
            id="primeros-pasos-title"
            className="mt-6 font-serif text-[2.3rem] font-medium leading-[1.06] tracking-[-0.02em] text-balance text-[oklch(0.97_0.015_88)] sm:text-5xl lg:text-[3.6rem]"
          >
            El primer paso es entender,{" "}
            <span className="bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text text-transparent">
              no arriesgar.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Crypto ya forma parte de pagos, transferencias, dólares digitales y
            wallets. No necesitas saberlo todo desde el primer día: solo una ruta
            clara para empezar con seguridad y evitar errores comunes.
          </p>

          {/* single primary CTA */}
          <div className="mt-9 w-full sm:w-auto">
            <Button
              size="lg"
              nativeButton={false}
              render={<a href="#que-aprenderas" />}
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

        {/* compact glass benefit cards */}
        <ul
          id="que-aprenderas"
          className="mt-14 grid max-w-3xl scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4"
        >
          {learnCards.map(({ icon: Icon, title, description }, i) => (
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
