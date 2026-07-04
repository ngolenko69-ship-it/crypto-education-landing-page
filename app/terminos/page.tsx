import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Términos y condiciones | Ruta Cripto Segura",
  description:
    "Términos y condiciones de uso del contenido educativo de Ruta Cripto Segura.",
}

export default function TerminosPage() {
  return (
    <LegalPageShell title="Términos y condiciones">
      <p>
        Esta página está en preparación. Aquí encontrarás las condiciones de uso
        del sitio y del contenido educativo de Ruta Cripto Segura.
      </p>
      <p>
        El contenido tiene una finalidad exclusivamente educativa y no constituye
        asesoramiento financiero, señales de trading ni promesas de ganancias.
      </p>
    </LegalPageShell>
  )
}
