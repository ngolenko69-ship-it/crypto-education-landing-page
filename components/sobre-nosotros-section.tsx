"use client"

import { Network, Users, BookOpen, ShieldCheck } from "lucide-react"
import { useInView } from "@/hooks/use-scroll-reveal"

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

export function SobreNosotrosSection() {
  const { ref, inView } = useInView()

  return (
    <section
      id="sobre-nosotros"
      aria-labelledby="nosotros-title"
      className="relative flex w-full scroll-mt-20 items-center overflow-hidden md:scroll-mt-24 lg:min-h-[860px]"
    >
      {/* ---------- cinematic background image layer ---------- */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* deep dark-green base behind everything */}
        <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

        {/* the team / building / partner-logos PNG as a full-bleed cover layer */}
        <img
          src="/images/sobre-nosotros-ruta-background.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[72%_center] lg:object-[center_right]"
        />

        {/* light global dark overlay so the image stays premium and cinematic */}
        <div
          className="absolute inset-0"
          style={{ background: "oklch(0.09 0.012 158 / 0.14)" }}
        />

        {/* subtle dark-green tint to unify the gold with the site palette */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ background: "oklch(0.18 0.03 158 / 0.14)" }}
        />

        {/* left dark protection gradient — near-opaque on mobile, right-limited on desktop */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[74%]"
          style={{
            background:
              "linear-gradient(to right, oklch(0.08 0.012 158) 0%, oklch(0.08 0.012 158 / 0.96) 32%, oklch(0.08 0.012 158 / 0.62) 60%, transparent 100%)",
          }}
        />

        {/* top fade to connect with the transition above and calm the logos zone slightly */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "24%",
            background:
              "linear-gradient(to bottom, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.55) 46%, transparent 100%)",
          }}
        />

        {/* bottom fade into the section base */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "24%",
            background:
              "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.55) 46%, transparent 100%)",
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
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 py-24 sm:px-8 md:px-10 lg:px-14 lg:py-28">
        <div
          ref={ref}
          className="flex max-w-xl flex-col items-start text-left transition-all duration-1000 ease-out will-change-transform lg:max-w-[40rem]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(28px)",
          }}
        >
          {/* section badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
              Sobre nosotros
            </span>
          </span>

          <h2
            id="nosotros-title"
            className="mt-6 font-serif text-[2.2rem] font-medium leading-[1.07] tracking-[-0.02em] text-balance text-[oklch(0.97_0.015_88)] sm:text-[2.7rem] lg:text-[3.1rem]"
          >
            Quién está detrás de{" "}
            <span className="bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text text-transparent">
              Ruta Cripto Segura
            </span>
          </h2>

          <div className="mt-6 max-w-xl space-y-4 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Detrás de Ruta Cripto Segura hay un equipo enfocado en educación,
              seguridad y acompañamiento para personas que quieren entender el
              mundo cripto sin presión, sin señales y sin promesas.
            </p>
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
          </div>

          {/* small credibility note */}
          <p className="mt-5 max-w-xl text-[13px] leading-snug tracking-wide text-[oklch(0.72_0.02_88)]">
            La información institucional puede estar respaldada por
            documentación, certificaciones o acuerdos correspondientes.
          </p>

          {/* compact glass trust cards — 2x2 grid kept on the protected left zone */}
          <ul className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map(({ icon: Icon, title, description }, i) => (
              <li
                key={title}
                className="flex items-start gap-3.5 rounded-xl border border-[oklch(0.8_0.11_84)]/20 bg-[oklch(0.07_0.014_158)]/60 px-4 py-4 shadow-[0_0_30px_-20px_oklch(0.8_0.11_84/0.5)] backdrop-blur-md transition-all duration-700 ease-out hover:border-[oklch(0.8_0.11_84)]/40 hover:bg-[oklch(0.08_0.015_158)]/72"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${180 + i * 120}ms`,
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
      </div>
    </section>
  )
}
