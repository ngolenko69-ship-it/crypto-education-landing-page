"use client"

import { useEffect, useRef } from "react"

/**
 * Cinematic "snake" route transition that continues the golden path from one
 * roadmap step into the next. An SVG S-curve draws itself as the user scrolls,
 * subtle glowing nodes light up along the way, and the next step's badge fades
 * in at the end of the path — visually guiding the user downward.
 *
 * Motion is driven by a single rAF loop writing directly to the DOM (no
 * per-frame React re-renders) and collapses to a static state for
 * reduced-motion users.
 */

const NODE_FRACTIONS = [0.28, 0.58, 0.82]

export function SnakeTransition({
  step,
  label,
}: {
  step: string
  label: string
}) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([])
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const zone = zoneRef.current
    const path = pathRef.current
    if (!zone || !path) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
    const total = path.getTotalLength()

    // set up the draw-on-scroll dash
    path.style.strokeDasharray = `${total}`
    path.style.strokeDashoffset = reduced ? "0" : `${total}`

    // position the glowing nodes precisely on the path
    NODE_FRACTIONS.forEach((f, i) => {
      const pt = path.getPointAtLength(total * f)
      const node = nodeRefs.current[i]
      if (node) {
        node.setAttribute("cx", String(pt.x))
        node.setAttribute("cy", String(pt.y))
      }
    })

    let raf = 0
    const apply = () => {
      raf = 0
      const rect = zone.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const p = clamp((vh - rect.top) / (rect.height + vh))

      const drawP = reduced ? 1 : clamp(p * 1.25)
      path.style.strokeDashoffset = `${total * (1 - drawP)}`

      NODE_FRACTIONS.forEach((f, i) => {
        const node = nodeRefs.current[i]
        if (!node) return
        const on = reduced ? 1 : clamp((drawP - f) / 0.08)
        node.style.opacity = String(0.2 + on * 0.8)
      })

      if (badgeRef.current) {
        const bp = reduced ? 1 : clamp((p - 0.55) / 0.32)
        badgeRef.current.style.opacity = String(bp)
        badgeRef.current.style.transform = `translateY(${(1 - bp) * 16}px)`
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={zoneRef}
      aria-hidden="true"
      className="pointer-events-none relative flex w-full flex-col items-center overflow-hidden px-6 pb-10 pt-8 sm:pb-14 lg:pb-20 lg:pt-14"
    >
      {/* winding golden route */}
      <div className="relative h-[42vh] w-[220px] sm:h-[46vh] lg:h-[52vh] lg:w-[280px]">
        <svg
          viewBox="0 0 200 600"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="snake-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.12 84)" stopOpacity="0.15" />
              <stop offset="30%" stopColor="oklch(0.82 0.12 84)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="oklch(0.82 0.12 84)" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* faint full path so the curve reads even before it's drawn */}
          <path
            d="M100 0 C 100 90, 28 150, 100 250 C 172 350, 28 430, 100 520 C 118 560, 100 580, 100 600"
            fill="none"
            stroke="oklch(0.82 0.12 84 / 0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* animated glowing path */}
          <path
            ref={pathRef}
            d="M100 0 C 100 90, 28 150, 100 250 C 172 350, 28 430, 100 520 C 118 560, 100 580, 100 600"
            fill="none"
            stroke="url(#snake-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 6px oklch(0.8 0.11 84 / 0.55))",
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />

          {/* glowing nodes along the route */}
          {NODE_FRACTIONS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                nodeRefs.current[i] = el
              }}
              r="4.5"
              fill="oklch(0.88 0.11 86)"
              style={{
                opacity: 0.2,
                filter: "drop-shadow(0 0 6px oklch(0.8 0.11 84 / 0.9))",
              }}
            />
          ))}
        </svg>
      </div>

      {/* next-step badge revealed at the end of the path */}
      <div
        ref={badgeRef}
        className="-mt-2 flex flex-col items-center gap-1.5"
        style={{ opacity: 0, transform: "translateY(16px)" }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">
          {step}
        </span>
        <span className="font-serif text-2xl font-medium text-[oklch(0.97_0.015_88)] sm:text-3xl">
          {label}
        </span>
      </div>
    </div>
  )
}
