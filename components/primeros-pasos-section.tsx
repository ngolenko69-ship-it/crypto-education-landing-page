"use client"

import { AlertTriangle, ArrowRight, BookOpen, Rocket, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-scroll-reveal"

const learnCards = [
  {
    icon: BookOpen,
    title: "Entender la base",
    description: "Crypto, dólares digitales y wallets sin jerga.",
  },
  {
    icon: AlertTriangle,
    title: "Evitar errores",
    description: "Qué revisar antes de confiar o enviar dinero.",
  },
  {
    icon: ShieldAlert,
    title: "Reconocer estafas",
    description: "Señales simples para no caer en falsas promesas.",
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
          className="h-full w-full object-cover object-[96%_center] lg:object-[70%_center]"
        />

        {/* dark green overlay to unify the image with the site background */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.09 0.014 158 / 0.5)" }}
        />

        {/* left text-protection wash */}
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: "72%",
            background:
              "linear-gradient(to right, #040907 0%, rgba(4,9,7,0.94) 26%, rgba(4,9,7,0.6) 55%, transparent 100%)",
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
            width: "22%",
            background: "linear-gradient(to left, rgba(2,4,3,0.6), transparent)",
          }}
        />
      </div>

      {/* thin glowing route line entering from above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-0 z-[1] h-20 w-px sm:left-14 lg:left-[calc((100vw-1500px)/2+3.5rem)]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.82 0.12 84 / 0.85))",
          boxShadow: "0 0 12px oklch(0.8 0.11 84 / 0.4)",
        }}
      />

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 md:px-10 lg:px-14 lg:py-32">
        <div
          ref={ref}
          className="flex max-w-xl flex-col items-start text-left transition-all duration-1000 ease-out will-change-transform lg:max-w-2xl"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
          }}
        >
          {/* checkpoint badge — expanded first node from the roadmap */}
          <div className="flex items-center gap-3 rounded-full border border-primary/40 bg-[oklch(0.07_0.014_158)]/70 py-2 pl-2 pr-5 backdrop-blur-sm">
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

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Crypto ya está en pagos, transferencias, dólares digitales y wallets.
            No es tan complicado: solo necesitas una ruta clara para empezar con
            seguridad y evitar errores comunes.
          </p>

          {/* single primary CTA */}
          <div className="mt-9 flex flex-col items-start gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<a href="#que-aprenderas" />}
              className="h-14 rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-9 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.55)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_10px_38px_-6px_oklch(0.8_0.11_84/0.65)]"
            >
              Obtener curso gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* secondary text link — not a competing button */}
            <a
              href="#que-aprenderas"
              className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Ver qué aprenderás
            </a>
          </div>

          {/* trust line */}
          <p className="mt-6 text-[13px] tracking-wide text-[oklch(0.72_0.02_88)]">
            Contenido educativo. Sin señales. Sin promesas de ganancias.
          </p>
        </div>

        {/* compact glass benefit cards */}
        <ul
          id="que-aprenderas"
          className="mt-16 grid max-w-4xl scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {learnCards.map(({ icon: Icon, title, description }, i) => (
            <li
              key={title}
              className="rounded-2xl border border-[oklch(0.8_0.11_84)]/20 bg-[oklch(0.07_0.014_158)]/62 p-5 shadow-[0_0_30px_-18px_oklch(0.8_0.11_84/0.5)] backdrop-blur-md transition-all duration-700 ease-out hover:border-[oklch(0.8_0.11_84)]/40 hover:bg-[oklch(0.08_0.015_158)]/75"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${180 + i * 130}ms`,
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
