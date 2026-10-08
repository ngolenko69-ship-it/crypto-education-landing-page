"use client"

import Link from "next/link"
import { BookOpen, BellOff, Wallet, ShieldCheck } from "lucide-react"
import { useReveal } from "@/hooks/use-scroll-reveal"
import { CardGrid } from "@/components/scene/section-card"
import { SceneBackdrop } from "@/components/scene/scene-backdrop"
import { SceneFrame } from "@/components/scene/scene-frame"
import { SectionBadge } from "@/components/scene/section-badge"
import { TextShield } from "@/components/scene/text-shield"
import type { SceneConfig } from "@/components/scene/scene-config"

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

// facade at 65-100% / 15-85%, R-shield at 80-95% / 50-95%
const scene: SceneConfig = {
  image: "legal-trust-footer-background",
  focalWide: "100% 55%",
  focalFrame: "82% 55%",
  frameAspect: "16 / 9",
  shield: 0.9,
}

export function LegalTrustFooterSection() {
  const { ref, inView, reveal, settle } = useReveal()

  return (
    <footer
      id="legal"
      aria-labelledby="legal-title"
      className="relative w-full overflow-clip bg-surface-deep"
    >
      {/* ---------- scene band: badge, headline, intro and the four trust cards ---------- */}
      <div className="relative">
        <SceneBackdrop scene={scene} settle={settle()} />

        {/* gold hairline connecting with the route above */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px]"
          style={{ background: "linear-gradient(to right, transparent, rgba(230,197,116,0.55), transparent)" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] pb-14 pt-16 sm:pt-20 xl:pb-16 xl:pt-20">
          <div className="relative xl:max-w-[min(42rem,38vw)] xl:[--shield-feather:11rem] 2xl:[--shield-feather:14rem]">
            <TextShield strength={scene.shield} feather="var(--shield-feather)" />

            <div ref={ref} className="relative z-10 flex flex-col items-start text-left">
              <SectionBadge dotId="route-dot-legal" style={reveal({ delay: 0, y: 12, duration: 500 })}>
                Confianza y transparencia
              </SectionBadge>

              <h2
                id="legal-title"
                className="type-h2 heading-shadow mt-6 max-w-2xl"
                style={reveal({ delay: 120, y: 20, duration: 800 })}
              >
                Seguridad también significa{" "}
                <span className="text-gold-phrase">claridad.</span>
              </h2>

              <p className="type-lead mt-6 max-w-2xl" style={reveal({ delay: 260, y: 16, duration: 600 })}>
                Ruta Cripto Segura es un proyecto educativo sobre seguridad cripto,
                prevención de estafas y buenas prácticas digitales. Nuestro objetivo
                es ayudarte a entender, verificar y tomar mejores decisiones antes de
                confiar en una plataforma, una persona o una promesa.
              </p>

              <SceneFrame scene={scene} className="mt-10 w-full" />

              <CardGrid items={trustCards} inView={inView} startDelay={420} columns={2} className="mt-9 w-full max-w-2xl xl:mt-10" />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- calm bottom band: links, legal paragraph, trademark ---------- */}
      <div className="relative z-10 border-t border-[var(--line-gold)] bg-surface-deep">
        <div className="mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] pb-28 pt-10 sm:pb-24 sm:pt-12">
          <nav aria-label="Enlaces legales" className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {legalLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="group relative inline-flex min-h-11 items-center text-[15px] font-medium tracking-wide text-text-primary transition-colors duration-200 hover:text-gold-text"
              >
                {label}
                <span
                  className="absolute bottom-2 left-0 h-px w-0 bg-gold-text transition-all duration-300 group-hover:w-full"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <div
            className="mt-6 h-px w-full max-w-3xl"
            style={{ background: "linear-gradient(to right, rgba(230,197,116,0.35), transparent)" }}
            aria-hidden="true"
          />

          <p className="type-legal mt-6 max-w-3xl">
            Ruta Cripto Segura es un proyecto educativo sobre seguridad cripto,
            prevención de estafas y buenas prácticas digitales. No somos una
            wallet, exchange ni asesor financiero. No ofrecemos señales de
            trading, recomendaciones de inversión, predicciones de mercado ni
            promesas de ganancias. Verifica siempre la información y cumple con
            las normas aplicables en tu país.
          </p>

          <p className="type-legal mt-3 tracking-wide">
            Las marcas mencionadas pertenecen a sus respectivos propietarios.
          </p>
        </div>
      </div>
    </footer>
  )
}
