import type { Metadata } from "next"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { LegalPageShell } from "@/components/legal-page-shell"
import { politicaDeCookies } from "@/lib/legal/politica-de-cookies"

export const metadata: Metadata = {
  title: "Política de Cookies | Ruta Cripto Segura",
  description:
    "Política de cookies de Ruta Cripto Segura: qué tecnologías utiliza el sitio, para qué sirven, cuáles requieren consentimiento y cómo gestionar tus preferencias.",
}

export default function PoliticaDeCookiesPage() {
  return (
    <LegalPageShell title={politicaDeCookies.title} current="/politica-de-cookies">
      <LegalDocumentView sections={politicaDeCookies.sections} />
    </LegalPageShell>
  )
}
