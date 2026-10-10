import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PageFooter } from "./page-footer"

/**
 * Shared frame of the legal and contact pages: the site's dark-emerald canvas, the logo with a
 * way back home, a readable column and the legal footer. One look for all five pages.
 */
export function PageFrame({
  children,
  current,
  narrow = false,
}: {
  children: React.ReactNode
  /** path of the page being shown, to mark it in the footer */
  current?: string
  /** reading column for long documents */
  narrow?: boolean
}) {
  return (
    <div className="bg-cinematic relative min-h-screen overflow-x-clip">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div
        className={`relative mx-auto flex min-h-screen w-full flex-col px-[var(--gutter)] ${
          narrow ? "max-w-3xl" : "max-w-5xl"
        }`}
      >
        <header className="flex items-center justify-between gap-4 py-5 sm:py-6">
          <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90">
            <img
              src="/images/ruta-logo.png"
              alt="RUTA Cripto Segura"
              width={108}
              height={36}
              className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(230,197,116,0.25)]"
            />
          </Link>

          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2 text-[13px] font-medium tracking-wide text-text-secondary transition-colors duration-200 hover:text-gold-text"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Volver al inicio
          </Link>
        </header>

        <main className="flex-1 pb-16 pt-8 sm:pt-12 lg:pb-20">{children}</main>

        <PageFooter current={current} />
      </div>
    </div>
  )
}
