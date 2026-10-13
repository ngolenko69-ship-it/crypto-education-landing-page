"use client"

import { AlarmClock, MailWarning, ShieldCheck } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"
import { TELEGRAM_COURSE_URL } from "@/lib/telegram"

const cards = [
  {
    icon: AlarmClock,
    title: "Urgencia",
    description: "Presión para decidir rápido.",
  },
  {
    icon: MailWarning,
    title: "Mensajes sospechosos",
    description: "Links, perfiles y soportes falsos.",
  },
  {
    icon: ShieldCheck,
    title: "Verificación",
    description: "Revisar antes de enviar o compartir.",
  },
]

// shield 66-78% / 30-75% plus the four threat icons 80-92% / 22-75%
const scene: SceneConfig = {
  image: "anti-estafas-background",
  signLeft: 0.473,
  focalWide: "75% 50%",
  focalFrame: "80% 48%",
  shield: 0.88,
  glow: "radial-gradient(55% 56% at 74% 50%, rgba(230,197,116,0.13) 0%, transparent 72%)",
}

export function AntiEstafasSection() {
  return (
    <StepSection
      id="anti-estafas"
      titleId="anti-estafas-title"
      dotId="route-dot-anti-estafas"
      badge="Paso 5 · Anti-estafas"
      title={
        <>
          No confíes rápido.{" "}
          <span className="text-gold-phrase">Aprende a verificar.</span>
        </>
      }
      lead="Las estafas suelen empezar con urgencia, promesas fáciles o mensajes que parecen confiables. Aprende a reconocer señales antes de entregar datos, dinero o acceso."
      cta={{ href: TELEGRAM_COURSE_URL, label: "Obtener guía anti-estafas gratis", external: true }}
      helper="Aprende a detectar señales de fraude antes de confiar."
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={cards}
      scene={scene}
    />
  )
}
