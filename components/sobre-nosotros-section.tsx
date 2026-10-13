"use client"

import { Network, Users, BookOpen, ShieldCheck } from "lucide-react"
import { useReveal } from "@/hooks/use-scroll-reveal"
import { CardGrid } from "@/components/scene/section-card"
import { SceneBackdrop } from "@/components/scene/scene-backdrop"
import { SceneFrame } from "@/components/scene/scene-frame"
import { SectionBadge } from "@/components/scene/section-badge"
import { TextShield } from "@/components/scene/text-shield"
import type { SceneConfig } from "@/components/scene/scene-config"

const cards = [
  {
    icon: Network,
    title: "Plataformas líderes",
    description: "Binance, Bybit, MEXC y otras referencias del ecosistema cripto.",
  },
  {
    icon: Users,
    title: "Equipo real",
    description: "Personas, experiencia y acompañamiento humano.",
  },
  {
    icon: BookOpen,
    title: "Enfoque educativo",
    description: "Aprender antes de arriesgar o confiar.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad primero",
    description: "Sin señales, sin promesas y sin presión para comprar.",
  },
]

// team at 50-85% / 50-95%, partner signs at 65-90% / 10-30%: the wide layer
// favours the lower part so faces and feet stay in; the frame is centred on
// the group so no face is cut on phones
const scene: SceneConfig = {
  image: "sobre-nosotros-ruta-background",
  signLeft: 0.522,
  focalWide: "100% 62%",
  focalFrame: "66% 55%",
  frameAspect: "16 / 9",
  shield: 0.9,
}

export function SobreNosotrosSection() {
  const { ref: introRef, reveal: introReveal, settle: introSettle } = useReveal()
  const { ref: detailsRef, inView: detailsInView, reveal: detailsReveal } = useReveal()

  return (
    <section
      id="sobre-nosotros"
      aria-labelledby="nosotros-title"
      className="relative w-full overflow-clip bg-surface-deep xl:[--col-w:min(36rem,32vw)] 2xl:[--col-w:min(36rem,34vw)] xl:[--shield-feather:3rem] 2xl:[--shield-feather:5rem] min-[1792px]:[--shield-feather:8rem]"
    >
      {/* ---------- scene band: compact intro over the sky/trees, team untouched ---------- */}
      <div className="relative xl:flex xl:min-h-[clamp(560px,38vw,720px)] xl:flex-col xl:justify-start">
        <SceneBackdrop scene={scene} settle={introSettle()} />

        <div className="relative z-10 mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] pt-16 sm:pt-20 xl:pt-20">
          <div className="relative xl:max-w-[var(--col-w)]">
            <TextShield strength={scene.shield} padY="3rem" />

            <div ref={introRef} className="relative z-10 flex flex-col items-start text-left">
              <SectionBadge dotId="route-dot-sobre-nosotros" style={introReveal({ delay: 0, y: 12, duration: 500 })}>
                Sobre nosotros
              </SectionBadge>

              <h2
                id="nosotros-title"
                className="type-h2 heading-shadow mt-6"
                style={introReveal({ delay: 120, y: 20, duration: 800 })}
              >
                Quién está detrás de{" "}
                <span className="text-gold-phrase">Ruta Cripto Segura</span>
              </h2>

              <p className="type-lead mt-6 max-w-2xl" style={introReveal({ delay: 260, y: 16, duration: 600 })}>
                Detrás de Ruta Cripto Segura hay un equipo enfocado en educación,
                seguridad y acompañamiento para personas que quieren entender el
                mundo cripto sin presión, sin señales y sin promesas.
              </p>
            </div>
          </div>

          <SceneFrame scene={scene} className="mt-10" />
        </div>
      </div>

      {/* ---------- calm band: details and cards in the flow, nothing over faces ---------- */}
      <div className="relative z-10 mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] pb-16 pt-10 sm:pb-20 sm:pt-12 xl:pb-24 xl:pt-14">
        <div ref={detailsRef} className="grid gap-10 lg:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="type-body max-w-2xl space-y-4" style={detailsReveal({ delay: 0, y: 14, duration: 600 })}>
            <p>
              Trabajamos con plataformas líderes del ecosistema cripto,
              incluyendo Binance, Bybit y MEXC, y desarrollamos un enfoque
              centrado en educación, seguridad y preparación práctica para
              usuarios que quieren entrar al mundo cripto con más criterio.
            </p>
            <p>
              Nuestro objetivo es simple: ayudarte a entender, verificar y tomar
              mejores decisiones antes de confiar en una plataforma, una persona
              o una promesa.
            </p>
            <p className="type-legal pt-1 tracking-wide">
              La información institucional puede estar respaldada por
              documentación, certificaciones o acuerdos correspondientes.
            </p>
          </div>

          <CardGrid items={cards} inView={detailsInView} startDelay={160} columns={2} />
        </div>
      </div>
    </section>
  )
}
