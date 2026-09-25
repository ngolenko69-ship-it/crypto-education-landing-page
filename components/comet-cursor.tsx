"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const DESKTOP_QUERY = "(min-width: 1024px)"

// How many animation frames back each trailing dot sits — short and tight,
// tapering to nothing, not a long streak.
const TRAIL_FRAME_OFFSETS = [3, 7, 12, 18]
// How fast the visible mark chases the real cursor position (0-1 per frame).
const CHASE_EASE = 0.22

function dotStyle(
  size: number,
  background: string,
  extra?: CSSProperties,
): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: "9999px",
    background,
    willChange: "transform",
    ...extra,
  }
}

/**
 * A simple gold comet mark that follows the cursor — one bright core, a soft
 * halo, and a short trail of fading dots. No 3D, no library: a handful of
 * absolutely-positioned circles nudged toward the pointer every frame with
 * a little chase-lag for a natural, unhurried feel.
 */
export function CometCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<Array<HTMLDivElement | null>>([])
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
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const current = { x: target.x, y: target.y }
    const history: { x: number; y: number }[] = []
    const maxOffset = Math.max(...TRAIL_FRAME_OFFSETS)
    let visible = false
    let raf = 0
    let running = false

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!visible) {
        visible = true
        current.x = target.x
        current.y = target.y
        wrapper.style.opacity = "1"
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    const onLeave = () => {
      visible = false
      wrapper.style.opacity = "0"
    }

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)

    const place = (el: HTMLDivElement | null, x: number, y: number) => {
      if (!el) return
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    const tick = () => {
      current.x += (target.x - current.x) * CHASE_EASE
      current.y += (target.y - current.y) * CHASE_EASE

      history.push({ x: current.x, y: current.y })
      if (history.length > maxOffset + 1) history.shift()

      place(haloRef.current, current.x, current.y)
      place(glowRef.current, current.x, current.y)
      place(coreRef.current, current.x, current.y)

      TRAIL_FRAME_OFFSETS.forEach((offset, i) => {
        const idx = history.length - 1 - offset
        const pt = history[idx]
        const el = trailRefs.current[i]
        if (!el) return
        if (!pt) {
          el.style.opacity = "0"
          return
        }
        place(el, pt.x, pt.y)
        el.style.opacity = String(0.45 * (1 - i / TRAIL_FRAME_OFFSETS.length))
      })

      // Settled on the pointer — stop polling every frame until it moves
      // again instead of redrawing identical positions forever.
      const dx = target.x - current.x
      const dy = target.y - current.y
      if (dx * dx + dy * dy < 0.01) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    running = true

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed inset-0 z-[4] opacity-0 transition-opacity duration-300 ease-out"
      aria-hidden="true"
    >
      <div
        ref={haloRef}
        style={dotStyle(30, "radial-gradient(circle, oklch(0.72 0.1 88 / 0.5) 0%, transparent 72%)", {
          filter: "blur(5px)",
        })}
      />
      {TRAIL_FRAME_OFFSETS.map((offset, i) => (
        <div
          key={offset}
          ref={(el) => {
            trailRefs.current[i] = el
          }}
          style={dotStyle(Math.max(1.5, 4 - i), "oklch(0.85 0.1 87)")}
        />
      ))}
      <div
        ref={glowRef}
        style={dotStyle(12, "radial-gradient(circle, oklch(0.93 0.08 88 / 0.9) 0%, transparent 75%)", {
          filter: "blur(1px)",
        })}
      />
      <div
        ref={coreRef}
        style={dotStyle(5, "oklch(0.98 0.04 92)", {
          boxShadow: "0 0 6px oklch(0.95 0.06 90 / 0.9), 0 0 16px oklch(0.8 0.11 84 / 0.6)",
        })}
      />
    </div>
  )
}
