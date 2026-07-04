import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Política de privacidad | Ruta Cripto Segura",
  description:
    "Política de privacidad de Ruta Cripto Segura y tratamiento de la información de los usuarios.",
}

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageShell title="Política de privacidad">
      <p>
        Esta página está en preparación. Aquí explicaremos cómo se trata la
        información de los usuarios, qué datos se recogen y con qué finalidad,
        siempre con transparencia.
      </p>
      <p>
        Nuestro compromiso es mantener una comunicación clara y respetar la
        privacidad de quienes forman parte de la comunidad educativa.
      </p>
    </LegalPageShell>
  )
}
