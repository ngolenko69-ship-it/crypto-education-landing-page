"use client"

import { FileKey2, KeyRound, ShieldAlert } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"

const cards = [
  {
    icon: KeyRound,
    title: "Claves",
    description: "Nunca compartas accesos ni códigos.",
  },
  {
    icon: FileKey2,
    title: "Frase semilla",
    description: "La frase que nunca debe salir de ti.",
  },
  {
    icon: ShieldAlert,
    title: "Errores comunes",
    description: "Apps falsas, enlaces raros y copias inseguras.",
  },
]

// vault door 73-96% / 18-65%, key 70-76% / 40-65%: the frame keeps both
const scene: SceneConfig = {
  image: "wallets-y-claves-background",
  signLeft: 0.522,
  focalWide: "85% 50%",
  focalFrame: "82% 42%",
  shield: 0.88,
  glow: "radial-gradient(55% 56% at 74% 48%, rgba(230,197,116,0.14) 0%, transparent 72%)",
}

export function WalletsYClavesSection() {
  return (
    <StepSection
      id="wallets"
      titleId="wallets-y-claves-title"
      dotId="route-dot-wallets"
      badge="Paso 4 · Wallets y claves"
      title={
        <>
          No proteges una app.{" "}
          <span className="text-gold-phrase">Proteges tu acceso.</span>
        </>
      }
      lead="Una wallet puede parecer simple, pero tus claves, códigos y frase semilla son la parte más sensible. Aprende qué proteger, qué no compartir y cómo evitar errores que pueden costarte dinero."
      cta={{ href: "#primeros-pasos", label: "Obtener guía de wallets gratis" }}
      helper="Aprende a proteger claves, accesos y frase semilla."
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={cards}
      scene={scene}
    />
  )
}
