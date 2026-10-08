"use client"

import { BadgeCheck, ClipboardList, ShieldAlert } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"

const cards = [
  {
    icon: BadgeCheck,
    title: "Reputación",
    description: "Actividad, historial y señales de confianza.",
  },
  {
    icon: ClipboardList,
    title: "Condiciones",
    description: "Método de pago, límites y tiempos.",
  },
  {
    icon: ShieldAlert,
    title: "Señales de alerta",
    description: "Presión, cambios raros y comprobantes dudosos.",
  },
]

// identity-check composition (ring, shield, id cards) at 66-92% / 20-70%
const scene: SceneConfig = {
  image: "p2p-que-revisar-background",
  signLeft: 0.53,
  focalWide: "75% 50%",
  focalFrame: "78% 45%",
  shield: 0.88,
  glow: "radial-gradient(52% 54% at 74% 48%, rgba(230,197,116,0.13) 0%, transparent 72%)",
}

export function P2pQueRevisarSection() {
  return (
    <StepSection
      id="p2p-seguro"
      titleId="p2p-que-revisar-title"
      dotId="route-dot-p2p"
      badge="Paso 3 · P2P: qué revisar"
      title={
        <>
          Antes de enviar dinero,{" "}
          <span className="text-gold-phrase">aprende qué revisar.</span>
        </>
      }
      lead="En P2P no basta con ver un buen precio. Aprende a revisar reputación, condiciones, comprobantes y señales de riesgo antes de confiar."
      cta={{ href: "#primeros-pasos", label: "Obtener guía P2P gratis" }}
      helper="Aprende qué revisar antes de confiar en un vendedor."
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={cards}
      scene={scene}
    />
  )
}
