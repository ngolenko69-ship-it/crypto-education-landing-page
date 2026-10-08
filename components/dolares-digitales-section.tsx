"use client"

import { ArrowLeftRight, CircleDollarSign, ShieldAlert } from "lucide-react"
import { StepSection } from "@/components/scene/step-section"
import type { SceneConfig } from "@/components/scene/scene-config"

const cards = [
  {
    icon: CircleDollarSign,
    title: "Qué son",
    description: "Dólares digitales explicados sin jerga.",
  },
  {
    icon: ArrowLeftRight,
    title: "Cómo se usan",
    description: "Pagos, transferencias y uso práctico.",
  },
  {
    icon: ShieldAlert,
    title: "Qué revisar",
    description: "Riesgos, redes y errores comunes.",
  },
]

// sign at 60-72% / 10-30%, the coin at 77-90% / 25-65%
const scene: SceneConfig = {
  image: "dolares-digitales-background",
  focalWide: "100% 50%",
  focalFrame: "80% 45%",
  shield: 0.88,
  glow: "radial-gradient(52% 54% at 72% 48%, rgba(230,197,116,0.14) 0%, transparent 72%)",
}

export function DolaresDigitalesSection() {
  return (
    <StepSection
      id="dolares-digitales"
      titleId="dolares-digitales-title"
      dotId="route-dot-dolares-digitales"
      badge="Paso 2 · Dólares digitales"
      title={
        <>
          Entender los dólares digitales es{" "}
          <span className="text-gold-phrase">más fácil de lo que parece.</span>
        </>
      }
      lead="USDT y USDC aparecen cada vez más en pagos, ahorros digitales y transferencias. Antes de usarlos, lo importante es entender qué son, cómo funcionan y qué revisar para no cometer errores."
      cta={{ href: "#primeros-pasos", label: "Obtener curso gratis" }}
      trust="Contenido educativo. Sin señales. Sin promesas de ganancias."
      cards={cards}
      scene={scene}
    />
  )
}
