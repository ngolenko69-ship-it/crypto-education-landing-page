import type { Metadata } from "next"
import { ContactPage } from "@/components/contact/contact-page"

export const metadata: Metadata = {
  title: "Contacto | Ruta Cripto Segura",
  description:
    "Contacto oficial de Ruta Cripto Segura: correo electrónico, administrador en Telegram y comunidad educativa gratuita.",
}

export default function ContactoPage() {
  return <ContactPage />
}
