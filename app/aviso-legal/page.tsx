import type { Metadata } from "next"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { LegalPageShell } from "@/components/legal-page-shell"
import { avisoLegal } from "@/lib/legal/aviso-legal"

export const metadata: Metadata = {
  title: "Aviso Legal | Ruta Cripto Segura",
  description:
    "Aviso legal de Ruta Cripto Segura: proyecto educativo independiente, finalidad, ausencia de servicios financieros, riesgos, plataformas externas y afiliados.",
}

export default function AvisoLegalPage() {
  return (
    <LegalPageShell title={avisoLegal.title} current="/aviso-legal">
      <LegalDocumentView sections={avisoLegal.sections} />
    </LegalPageShell>
  )
}
