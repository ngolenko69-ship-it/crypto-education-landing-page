import type { Metadata } from "next"
import { LegalDocumentView } from "@/components/legal/legal-document"
import { LegalPageShell } from "@/components/legal-page-shell"
import { politicaDePrivacidad } from "@/lib/legal/politica-de-privacidad"

export const metadata: Metadata = {
  title: "Política de Privacidad | Ruta Cripto Segura",
  description:
    "Política de privacidad de Ruta Cripto Segura: datos que pueden tratarse, finalidades, servicios externos, Telegram, conservación y derechos de los usuarios.",
}

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageShell title={politicaDePrivacidad.title} current="/politica-de-privacidad">
      <LegalDocumentView sections={politicaDePrivacidad.sections} />
    </LegalPageShell>
  )
}
