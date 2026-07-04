import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function LegalPageShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-cinematic relative min-h-screen overflow-hidden">
      <div
        className="bg-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <main className="relative mx-auto w-full max-w-3xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-[oklch(0.82_0.03_88)] transition-colors duration-200 hover:text-gold"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Volver al inicio
        </Link>

        <h1 className="mt-8 font-serif text-[2.1rem] font-medium leading-[1.1] tracking-[-0.02em] text-balance text-[oklch(0.97_0.015_88)] sm:text-[2.6rem]">
          {title}
        </h1>

        <div className="mt-6 space-y-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </div>

        <p className="mt-10 border-t border-border/50 pt-6 text-[12.5px] leading-relaxed text-[oklch(0.72_0.02_88)]">
          Ruta Cripto Segura es un proyecto educativo sobre seguridad cripto,
          prevención de estafas y buenas prácticas digitales. No somos una
          wallet, exchange ni asesor financiero. No ofrecemos señales de trading,
          recomendaciones de inversión, predicciones de mercado ni promesas de
          ganancias. Verifica siempre la información y cumple con las normas
          aplicables en tu país.
        </p>
      </main>
    </div>
  )
}
