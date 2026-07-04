"use client"

import Link from "next/link"
import { BookOpen, BellOff, Wallet, ShieldCheck } from "lucide-react"
import { useReveal } from "@/hooks/use-scroll-reveal"

const trustCards = [
  {
    icon: BookOpen,
    title: "Contenido educativo",
    description:
      "Aprende con foco en seguridad, prevención de fraudes y buenas prácticas.",
  },
  {
    icon: BellOff,
    title: "Sin señales",
    description:
      "No ofrecemos señales de trading, predicciones de mercado ni promesas de ganancias.",
  },
  {
    icon: Wallet,
    title: "Sin custodia",
    description: "No somos una wallet, exchange ni custodiamos fondos de usuarios.",
  },
  {
    icon: ShieldCheck,
    title: "Transparencia",
    description:
      "Verifica siempre la información y cumple con las normas aplicables en tu país.",
  },
]

const legalLinks = [
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de privacidad", href: "/politica-de-privacidad" },
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Contacto", href: "/contacto" },
]

export function LegalTrustFooterSection() {
  const { ref, inView, reveal, settle } = useReveal()

  return (
    <section
      id="legal"
      aria-labelledby="legal-title"
      className="relative flex w-full scroll-mt-20 flex-col justify-center overflow-hidden md:scroll-mt-24 lg:min-h-[68vh]"
    >
      {/* ---------- cinematic background image layer ---------- */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* deep dark-green base behind everything */}
        <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

        {/* the building / shield / golden-route PNG as a full-bleed cover layer */}
        <img
          src="/images/legal-trust-footer-background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[80%_center] lg:object-[center_right]"
          style={settle()}
        />

        {/* light global dark overlay so the image stays premium and cinematic */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.09 0.012 158 / 0.16)" }}
        />

        {/* subtle dark-green tint to unify the gold with the site palette */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: "oklch(0.18 0.03 158 / 0.14)" }}
        />

        {/* left dark protection gradient — near-opaque on mobile, right-limited on desktop */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[72%]"
          style={{
            background:
              "linear-gradient(to right, oklch(0.08 0.012 158) 0%, oklch(0.08 0.012 158 / 0.96) 30%, oklch(0.08 0.012 158 / 0.6) 58%, transparent 100%)",
          }}
        />

        {/* soft gold glow along the top border to connect with the route above */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "3px",
            background:
              "linear-gradient(to right, transparent, oklch(0.82 0.12 84 / 0.55), transparent)",
          }}
        />

        {/* top fade to connect with the transition above */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "26%",
            background:
              "linear-gradient(to bottom, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.55) 46%, transparent 100%)",
          }}
        />

        {/* bottom fade into the section base */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "30%",
            background:
              "linear-gradient(to top, oklch(0.08 0.012 158) 0%, oklch(0.08 0.012 158 / 0.6) 46%, transparent 100%)",
          }}
        />

        {/* right edge vignette */}
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: "14%",
            background:
              "linear-gradient(to left, oklch(0.07 0.01 158 / 0.66), transparent)",
          }}
        />
      </div>

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-28 pt-20 sm:px-8 sm:pb-24 md:px-10 lg:px-14 lg:pb-20 lg:pt-24">
        <div ref={ref} className="flex max-w-xl flex-col items-start text-left lg:max-w-[42rem]">
          {/* section badge */}
          <span
            className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm"
            style={reveal({ delay: 0, y: 12, duration: 500 })}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
              Confianza y transparencia
            </span>
          </span>

          <h2
            id="legal-title"
            className="mt-6 font-serif text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-balance text-[oklch(0.97_0.015_88)] sm:text-[2.5rem] lg:text-[2.9rem]"
            style={reveal({ delay: 120, y: 22, duration: 800 })}
          >
            Seguridad también significa{" "}
            <span className="bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text text-transparent">
              claridad.
            </span>
          </h2>

          <p
            className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base"
            style={reveal({ delay: 260, y: 16, duration: 600 })}
          >
            Ruta Cripto Segura es un proyecto educativo sobre seguridad cripto,
            prevención de estafas y buenas prácticas digitales. Nuestro objetivo
            es ayudarte a entender, verificar y tomar mejores decisiones antes de
            confiar en una plataforma, una persona o una promesa.
          </p>

          {/* compact glass trust cards — 2x2 grid kept on the protected left zone */}
          <ul className="mt-9 grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2">
            {trustCards.map(({ icon: Icon, title, description }, i) => (
              <li
                key={title}
                className="flex items-start gap-3.5 rounded-xl border border-[oklch(0.8_0.11_84)]/20 bg-[oklch(0.07_0.014_158)]/60 px-4 py-3.5 shadow-[0_0_30px_-20px_oklch(0.8_0.11_84/0.5)] backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[oklch(0.8_0.11_84)]/40 hover:bg-[oklch(0.08_0.015_158)]/72"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${420 + i * 110}ms`,
                }}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* legal links row */}
          <nav
            aria-label="Enlaces legales"
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            style={reveal({ delay: 640, y: 12, duration: 600 })}
          >
            {legalLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="group relative text-[13px] font-medium tracking-wide text-[oklch(0.82_0.03_88)] transition-colors duration-200 hover:text-gold"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* thin gold divider */}
          <div
            className="mt-8 h-px w-full max-w-xl"
            style={{
              background:
                "linear-gradient(to right, oklch(0.8 0.11 84 / 0.35), transparent)",
            }}
          />

          {/* bottom disclaimer */}
          <p
            className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-[oklch(0.74_0.02_88)]"
            style={reveal({ delay: 720, y: 12, duration: 600 })}
          >
            Ruta Cripto Segura es un proyecto educativo sobre seguridad cripto,
            prevención de estafas y buenas prácticas digitales. No somos una
            wallet, exchange ni asesor financiero. No ofrecemos señales de
            trading, recomendaciones de inversión, predicciones de mercado ni
            promesas de ganancias. Verifica siempre la información y cumple con
            las normas aplicables en tu país.
          </p>

          {/* trademark note */}
          <p className="mt-3 text-[11.5px] leading-snug tracking-wide text-[oklch(0.62_0.015_88)]">
            Las marcas mencionadas pertenecen a sus respectivos propietarios.
          </p>
        </div>
      </div>
    </section>
  )
}
