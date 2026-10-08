"use client"

import { Newspaper, UserCheck, Users } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"
import { TELEGRAM_URL } from "@/lib/telegram"

const cards = [
  {
    icon: Newspaper,
    title: "Noticias cripto",
    description: "Novedades explicadas de forma simple.",
  },
  {
    icon: UserCheck,
    title: "Ayuda de admins",
    description: "Orientación educativa para tus dudas.",
  },
  {
    icon: Users,
    title: "Comunidad segura",
    description: "Aprende sin presión ni promesas.",
  },
]

// community composition (ring shield + member plaques) at 66-92% / 22-85%
const scene: SceneConfig = {
  image: "comunidad-cripto-segura-background",
  signLeft: 0.496,
  focalWide: "75% 50%",
  focalFrame: "78% 50%",
  shield: 0.9,
  glow: "radial-gradient(55% 56% at 74% 50%, rgba(230,197,116,0.14) 0%, transparent 72%)",
}

export function ComunidadCriptoSeguraSection() {
  return (
    <StepSection
      id="comunidad"
      titleId="comunidad-cripto-segura-title"
      dotId="route-dot-comunidad"
      badge="Paso 6 · Comunidad cripto segura"
      title={
        <>
          La ruta no termina aquí.{" "}
          <span className="text-gold-phrase">Sigue aprendiendo con nosotros.</span>
        </>
      }
      lead="Después de conocer los pasos básicos, puedes unirte a nuestra comunidad educativa: compartimos noticias cripto, explicamos riesgos y ayudamos a resolver dudas sin presión ni promesas."
      cta={{ href: TELEGRAM_URL, label: "Unirme a la comunidad", external: true }}
      helper="Admins y comunidad para aprender con más seguridad."
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={cards}
      scene={scene}
    />
  )
}
