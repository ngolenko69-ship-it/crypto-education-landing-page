"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const TUBES_OPTIONS = {
  bloom: false as const,
  tubes: {
    minRadius: 0.0028,
    maxRadius: 0.026,
    minTubularSegments: 20,
    maxTubularSegments: 70,
    colors: ["#b8860b", "#d4af37", "#f4e4bc"],
    lights: {
      intensity: 200,
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
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
