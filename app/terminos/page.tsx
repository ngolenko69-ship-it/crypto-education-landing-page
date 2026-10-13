import type { Metadata } from "next"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { LegalPageShell } from "@/components/legal-page-shell"
import { terminos } from "@/lib/legal/terminos"

export const metadata: Metadata = {
  title: "Términos y Condiciones | Ruta Cripto Segura",
  description:
    "Términos y condiciones de uso del sitio y de los recursos educativos gratuitos de Ruta Cripto Segura: riesgos, enlaces externos, comunidad y responsabilidad.",
}

export default function TerminosPage() {
  return (
    <LegalPageShell title={terminos.title} current="/terminos">
      <LegalDocumentView sections={terminos.sections} />
    </LegalPageShell>
  )
}
