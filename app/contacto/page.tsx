import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Contacto | Ruta Cripto Segura",
  description:
    "Ponte en contacto con el equipo educativo de Ruta Cripto Segura.",
}

export default function ContactoPage() {
  return (
    <LegalPageShell title="Contacto">
      <p>
        Esta página está en preparación. Pronto podrás comunicarte con el equipo
        educativo de Ruta Cripto Segura para resolver dudas sobre seguridad
        cripto y buenas prácticas.
      </p>
      <p>
        Mientras tanto, puedes acompañarnos en nuestra comunidad educativa para
        aprender con más seguridad, sin señales ni promesas.
      </p>
    </LegalPageShell>
  )
}
