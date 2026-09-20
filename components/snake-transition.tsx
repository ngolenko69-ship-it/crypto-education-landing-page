"use client"

import { useEffect, useRef } from "react"
import {
  CircleDollarSign,
  KeyRound,
  Rocket,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react"

const FROM_ICONS = {
  rocket: Rocket,
  dollar: CircleDollarSign,
  "user-check": UserCheck,
  key: KeyRound,
  shield: ShieldCheck,
  users: Users,
} as const

type FromIconKey = keyof typeof FROM_ICONS

/**
 * Cinematic "snake" route transition that continues the golden path from one
 * roadmap step into the next. On scroll: the camera "zooms into" the
 * checkpoint icon for the step just finished, a comet with a fading tail
 * then flies down the S-curve that draws itself beneath it, and a small
 * badge for the next step settles in as it arrives — right where that
 * section's own circular reveal (see `useCircularReveal`) picks up and
 * "opens" into it.
 *
 * Motion is driven by a single rAF loop writing directly to the DOM (no
 * per-frame React re-renders) and collapses to a static state for
 * reduced-motion users.
 */

// Trailing offsets behind the comet's head, as a fraction of the path's
// total length — decreasing radius/opacity from index 0 (closest) outward.
const TAIL_OFFSETS = [0.02, 0.045, 0.075, 0.11, 0.15]

export function SnakeTransition({
  fromIcon,
  step,
  label,
}: {
  fromIcon: FromIconKey
  step: string
  label: string
}) {
  const FromIcon = FROM_ICONS[fromIcon]
  const zoneRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const cometRef = useRef<SVGGElement>(null)
  const tailRefs = useRef<(SVGCircleElement | null)[]>([])
  const iconGlowRef = useRef<HTMLDivElement>(null)
  const iconNodeRef = useRef<HTMLDivElement>(null)
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

    const pointAt = (frac: number) => path.getPointAtLength(total * clamp(frac))

    let raf = 0
    const apply = () => {
      raf = 0
      const rect = zone.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const p = clamp((vh - rect.top) / (rect.height + vh))

      // phase 1: the camera zooms into the checkpoint icon for the step
      // just finished — scale, glow and focus pull all ramp together.
      const zoomP = reduced ? 1 : clamp(p / 0.2)
      if (iconGlowRef.current) {
        iconGlowRef.current.style.opacity = String(0.12 + zoomP * 0.75)
        iconGlowRef.current.style.transform = `translate(-50%, -50%) scale(${0.7 + zoomP * 0.7})`
      }
      if (iconNodeRef.current) {
        iconNodeRef.current.style.opacity = String(0.25 + zoomP * 0.75)
        iconNodeRef.current.style.transform = `scale(${0.45 + zoomP * 0.85})`
        iconNodeRef.current.style.filter = `blur(${(1 - zoomP) * 6}px)`
      }

      // phase 2: a comet with a fading tail flies down the route as it draws
      const drawP = reduced ? 1 : clamp((p - 0.14) / 0.6)
      path.style.strokeDashoffset = `${total * (1 - drawP)}`

      const cometOpacity = reduced
        ? 0
        : Math.min(clamp(drawP / 0.05), clamp((1 - drawP) / 0.12))
      if (cometRef.current) {
        const head = pointAt(drawP)
        cometRef.current.setAttribute("transform", `translate(${head.x} ${head.y})`)
        cometRef.current.style.opacity = String(cometOpacity)
      }
      TAIL_OFFSETS.forEach((offset, i) => {
        const dot = tailRefs.current[i]
        if (!dot) return
        const pt = pointAt(drawP - offset)
        dot.setAttribute("cx", String(pt.x))
        dot.setAttribute("cy", String(pt.y))
        dot.style.opacity = String(cometOpacity * (1 - i / TAIL_OFFSETS.length) * 0.7)
      })

      // phase 3: the next step's badge settles in as the route arrives —
      // the section right below takes over from here with its own
      // circular-reveal "opening".
      if (badgeRef.current) {
        const bp = reduced ? 1 : clamp((p - 0.68) / 0.28)
        badgeRef.current.style.opacity = String(bp)
        badgeRef.current.style.transform = `translateY(${(1 - bp) * 12}px)`
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
      className="pointer-events-none relative flex w-full flex-col items-center overflow-hidden px-6 pb-4 pt-3 sm:pb-5 lg:pb-6 lg:pt-4"
    >
      {/* checkpoint icon for the step just finished — the camera zooms into
          it before the route below starts to draw */}
      <div className="relative mb-1 flex items-center justify-center">
        <div
          ref={iconGlowRef}
          className="absolute left-1/2 top-1/2 h-24 w-24 rounded-full"
          style={{
            opacity: 0.12,
            transform: "translate(-50%, -50%) scale(0.7)",
            background:
              "radial-gradient(closest-side, oklch(0.8 0.11 84 / 0.55) 0%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        <div
          ref={iconNodeRef}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/55 bg-[oklch(0.13_0.018_158)] shadow-[0_0_20px_-4px_oklch(0.8_0.11_84/0.55),inset_0_0_12px_-6px_oklch(0.8_0.11_84/0.7)]"
          style={{ opacity: 0.25, transform: "scale(0.45)" }}
        >
          <FromIcon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        </div>
      </div>

      {/* winding golden route */}
      <div className="relative h-[16vh] w-[160px] sm:h-[18vh] lg:h-[22vh] lg:w-[200px]">
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
            d="M100 0 C 52 108, 52 196, 100 300 C 148 404, 148 492, 100 600"
            fill="none"
            stroke="oklch(0.82 0.12 84 / 0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* animated glowing path */}
          <path
            ref={pathRef}
            d="M100 0 C 52 108, 52 196, 100 300 C 148 404, 148 492, 100 600"
            fill="none"
            stroke="url(#snake-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 6px oklch(0.8 0.11 84 / 0.55))",
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />

          {/* comet tail — a handful of shrinking, fading dots trailing the head */}
          {TAIL_OFFSETS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                tailRefs.current[i] = el
              }}
              r={3.2 - i * 0.4}
              fill="oklch(0.85 0.12 85)"
              style={{ opacity: 0 }}
            />
          ))}

          {/* comet head — the brightest point, flying along the route */}
          <g ref={cometRef} style={{ opacity: 0 }}>
            <circle
              r="9"
              fill="oklch(0.85 0.12 85 / 0.5)"
              style={{ filter: "blur(4px)" }}
            />
            <circle
              r="4"
              fill="oklch(0.94 0.09 88)"
              style={{ filter: "drop-shadow(0 0 9px oklch(0.85 0.12 84 / 0.95))" }}
            />
          </g>
        </svg>
      </div>

      {/* small breadcrumb for the next step — the section below carries the
          real headline via its own circular-reveal opening */}
      <div
        ref={badgeRef}
        className="-mt-1 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm"
        style={{ opacity: 0, transform: "translateY(12px)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
          {step} · {label}
        </span>
      </div>
    </div>
  )
}
