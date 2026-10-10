import { PageFrame } from "@/components/site/page-frame"
import { LEGAL_UPDATED, LEGAL_UPDATED_ISO } from "@/lib/legal/config"

/** Title block of a legal document (name, brand, last update) inside the shared page frame. */
export function LegalPageShell({
  title,
  current,
  children,
}: {
  title: string
  /** path of this page, to mark it in the footer */
  current: string
  children: React.ReactNode
}) {
  return (
    <PageFrame narrow current={current}>
      <article>
        <header>
          <h1 className="type-h2">{title}</h1>
          <p className="text-gold-phrase mt-3 inline-block font-serif text-[1.35rem] leading-snug">
            Ruta Cripto Segura
          </p>
          <p className="type-legal mt-2">
            Última actualización: <time dateTime={LEGAL_UPDATED_ISO}>{LEGAL_UPDATED}</time>
          </p>
          <span
            className="mt-6 block h-0.5 w-14 rounded-full bg-gradient-to-r from-gold-text to-transparent"
            aria-hidden="true"
          />
        </header>
        <div className="mt-8 sm:mt-10">{children}</div>
      </article>
    </PageFrame>
  )
}
