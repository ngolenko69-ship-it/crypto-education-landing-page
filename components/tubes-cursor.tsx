"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const TUBES_OPTIONS = {
  bloom: { threshold: 0, strength: 1.1, radius: 0.55 },
  tubes: {
    colors: ["#b8860b", "#d4af37", "#f4e4bc"],
    lights: {
      intensity: 200,
      colors: ["#ffd700", "#f5c542", "#d4af37", "#fff4c2"],
    },
  },
}

const DESKTOP_QUERY = "(min-width: 1024px)"

/**
 * Ambient, mouse-reactive gold tubes woven behind the hero artwork.
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
        // WebGL unavailable or the asset failed to load — the hero reads
        // fine without the ambient effect.
      })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [active])

  if (!active) return null

  return (
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
  )
}
