"use client"

import { AlertTriangle, BookOpen, ShieldAlert } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"
import { TELEGRAM_COURSE_URL } from "@/lib/telegram"

const learnCards = [
  {
    icon: BookOpen,
    title: "Entender la base",
    description: "Crypto y wallets sin jerga.",
  },
  {
    icon: AlertTriangle,
    title: "Evitar errores",
    description: "Qué revisar antes de enviar dinero.",
  },
  {
    icon: ShieldAlert,
    title: "Reconocer estafas",
    description: "Señales simples antes de confiar.",
  },
]

// compass at the bottom centre-right, sign at 60-70%, door + shield at 78-100%:
// the full-bleed layer keeps the right edge; the frame centres on the door/shield
const scene: SceneConfig = {
  image: "primeros-pasos-background",
  signLeft: 0.65,
  focalWide: "100% 50%",
  focalFrame: "84% 45%",
  shield: 0.88,
  glow: "radial-gradient(55% 55% at 72% 50%, rgba(230,197,116,0.14) 0%, transparent 72%)",
}

export function PrimerosPasosSection() {
  return (
    <StepSection
      id="primeros-pasos"
      titleId="primeros-pasos-title"
      dotId="route-dot-primeros-pasos"
      badge="Paso 1 · Primeros pasos"
      title={
        <>
          El primer paso es entender,{" "}
          <span className="text-gold-phrase">no arriesgar.</span>
        </>
      }
      lead="Crypto ya forma parte de pagos, transferencias, dólares digitales y wallets. No necesitas saberlo todo desde el primer día: solo una ruta clara para empezar con seguridad y evitar errores comunes."
      cta={{ href: TELEGRAM_COURSE_URL, label: "Obtener curso gratis", external: true }}
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={learnCards}
      cardsId="que-aprenderas"
      scene={scene}
    />
  )
}
