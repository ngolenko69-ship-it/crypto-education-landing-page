import type { Metadata } from "next"
import { ContactPage } from "@/components/contact/contact-page"

export const metadata: Metadata = {
  title: "Contacto | Ruta Cripto Segura",
  description:
    "Contacto oficial de Ruta Cripto Segura: canal gratuito de Telegram, atención y consultas con el administrador y correo electrónico.",
}

export default function ContactoPage() {
  return <ContactPage />
}
