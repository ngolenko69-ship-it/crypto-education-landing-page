import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Aviso legal | Ruta Cripto Segura",
  description:
    "Aviso legal de Ruta Cripto Segura, proyecto educativo sobre seguridad cripto y prevención de estafas.",
}

export default function AvisoLegalPage() {
  return (
    <LegalPageShell title="Aviso legal">
      <p>
        Esta página está en preparación. Aquí encontrarás la información legal
        del proyecto Ruta Cripto Segura, incluyendo la titularidad del sitio y
        las condiciones de uso del contenido educativo.
      </p>
      <p>
        Mientras tanto, recuerda que todo el material publicado tiene una
        finalidad educativa sobre seguridad cripto, prevención de estafas y
        buenas prácticas digitales.
      </p>
    </LegalPageShell>
  )
}
