"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const TUBES_OPTIONS = {
  // The renderer's bloom pass composites through a node graph that forces
  // the canvas fully opaque, hiding everything behind it once this is a
  // full-page layer rather than something an opaque image always covered.
  // The glow here comes from CSS drop-shadow instead (see the canvas below),
  // which works off the canvas's real alpha channel and needs bloom off.
  bloom: false as const,
  tubes: {
    minRadius: 0.004,
    maxRadius: 0.034,
    minTubularSegments: 26,
    maxTubularSegments: 95,
    material: { metalness: 1, roughness: 0.12 },
    colors: ["#8a6a1f", "#d4af37", "#f4e4bc", "#fff8e1"],
    lights: {
      intensity: 280,
      colors: ["#ffd700", "#f5c542", "#d4af37", "#fff4c2"],
    },
  },
}

const DESKTOP_QUERY = "(min-width: 1024px)"

/**
 * Ambient, mouse-reactive gold tubes woven behind the whole page — fixed to
 * the viewport so they follow the cursor no matter which section is in view.
 * Only mounted at desktop widths and never under prefers-reduced-motion —
 * both checked live so the WebGL context is created (and disposed) only
 * when the effect will actually be visible.
 */
export function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const active = isDesktop && !reducedMotion

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    let handle: { dispose: () => void } | null = null
    let cancelled = false

    import("threejs-components/build/cursors/tubes1.min.js")
      .then(({ default: createTubesCursor }) => {
        if (cancelled) return
        handle = createTubesCursor(canvas, TUBES_OPTIONS)
      })
      .catch(() => {
        // WebGL unavailable or the asset failed to load — the page reads
        // fine without the ambient effect.
      })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [active])

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[4]" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          filter:
            "drop-shadow(0 0 3px rgba(255, 244, 194, 0.9)) drop-shadow(0 0 16px rgba(212, 175, 55, 0.75)) drop-shadow(0 0 34px rgba(184, 134, 11, 0.5))",
        }}
      />
    </div>
  )
}
