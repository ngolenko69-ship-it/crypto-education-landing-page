"use client"

import { useEffect, useRef } from "react"
import { Rocket } from "lucide-react"

/**
 * Cinematic connective zone between the hero roadmap and the "Primeros pasos"
 * section. As the user scrolls, a comet with a fading tail flies down a
 * golden S-curve that draws itself, the first checkpoint pushes into focus
 * with a bright flash as it arrives, and the background darkens — so the
 * roadmap appears to "open" into the first step instead of hard-cutting to
 * a new page.
 *
 * Motion is driven by a single rAF loop that writes transforms directly to the
 * DOM (no per-frame React re-renders) and is disabled for reduced-motion users.
 */

// Trailing offsets behind the comet's head, as a fraction of the path's
// total length — decreasing radius/opacity from index 0 (closest) outward.
const TAIL_OFFSETS = [0.02, 0.045, 0.08, 0.12, 0.17, 0.23]

export function ScrollTransition() {
  const zoneRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const cometRef = useRef<SVGGElement>(null)
  const tailRefs = useRef<(SVGCircleElement | null)[]>([])
  const flashRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const darkenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
    let raf = 0

    // prime the drawn path so it can be revealed via stroke-dashoffset
    const path = pathRef.current
    const pathLen = path ? path.getTotalLength() : 0
    if (path) {
      path.style.strokeDasharray = String(pathLen)
      path.style.strokeDashoffset = reduced ? "0" : String(pathLen)
    }
    const pointAt = (frac: number) =>
      path ? path.getPointAtLength(pathLen * clamp(frac)) : { x: 0, y: 0 }

    const apply = () => {
      raf = 0
      const rect = zone.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      // 0 as the zone enters from the bottom, 1 as it exits the top
      const p = clamp((vh - rect.top) / (rect.height + vh))

      const lineP = reduced ? 1 : clamp(p / 0.72)
      const nodeP = reduced ? 1 : clamp((p - 0.58) / 0.3)
      const flashP = reduced ? 0 : nodeP * clamp(1 - (p - 0.58) / 0.34)
      const labelP = reduced ? 1 : clamp((p - 0.82) / 0.18)

      if (path) path.style.strokeDashoffset = String(pathLen * (1 - lineP))

      // comet with a fading tail flying down the route as it draws
      const cometOpacity = reduced
        ? 0
        : Math.min(clamp(lineP / 0.04), clamp((1 - lineP) / 0.1))
      if (cometRef.current) {
        const head = pointAt(lineP)
        cometRef.current.setAttribute("transform", `translate(${head.x} ${head.y})`)
        cometRef.current.style.opacity = String(cometOpacity)
      }
      TAIL_OFFSETS.forEach((offset, i) => {
        const dot = tailRefs.current[i]
        if (!dot) return
        const pt = pointAt(lineP - offset)
        dot.setAttribute("cx", String(pt.x))
        dot.setAttribute("cy", String(pt.y))
        dot.style.opacity = String(cometOpacity * (1 - i / TAIL_OFFSETS.length) * 0.75)
      })

      // the checkpoint pushes into focus — camera push + flash + focus pull
      // — as the comet arrives
      if (flashRef.current) flashRef.current.style.opacity = String(flashP * 0.85)
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.1 + nodeP * 0.8)
        glowRef.current.style.transform = `translate(-50%, -68%) scale(${0.5 + nodeP * 0.85})`
      }
      if (nodeRef.current) {
        nodeRef.current.style.opacity = String(0.15 + nodeP * 0.85)
        nodeRef.current.style.transform = `scale(${0.4 + nodeP * 0.85})`
        nodeRef.current.style.filter = `blur(${(1 - nodeP) * 8}px)`
      }
      if (labelRef.current) {
        labelRef.current.style.opacity = String(labelP)
        labelRef.current.style.transform = `translateY(${(1 - labelP) * 14}px)`
      }
      if (darkenRef.current) {
        darkenRef.current.style.opacity = String(reduced ? 0.3 : 0.12 + p * 0.4)
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
      className="pointer-events-none relative flex w-full flex-col items-center overflow-hidden px-6 pb-8 pt-5 sm:pb-11 lg:pb-14 lg:pt-8"
    >
      {/* progressive darkening / vignette that deepens on scroll */}
      <div
        ref={darkenRef}
        className="absolute inset-0"
        style={{
          opacity: 0.12,
          background:
            "radial-gradient(80% 60% at 50% 62%, oklch(0.05 0.01 158 / 0.75) 0%, transparent 70%), linear-gradient(to bottom, transparent 0%, oklch(0.09 0.012 158 / 0.6) 100%)",
        }}
      />

      {/* growing golden route line — a gentle S-curve drawn on scroll */}
      <div className="relative h-[22vh] w-[180px] sm:h-[25vh] sm:w-[210px] lg:h-[30vh] lg:w-[240px]">
        <svg
          viewBox="0 0 200 600"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="scroll-route-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.12 84 / 0.12)" />
              <stop offset="45%" stopColor="oklch(0.82 0.12 84 / 0.85)" />
              <stop offset="100%" stopColor="oklch(0.85 0.12 84)" />
            </linearGradient>
          </defs>
          {/* faint guide so the curve reads before it is drawn */}
          <path
            d="M100 0 C 52 108, 52 196, 100 300 C 148 404, 148 492, 100 600"
            fill="none"
            stroke="oklch(0.82 0.12 84 / 0.1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* animated drawn path */}
          <path
            ref={pathRef}
            d="M100 0 C 52 108, 52 196, 100 300 C 148 404, 148 492, 100 600"
            fill="none"
            stroke="url(#scroll-route-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 8px oklch(0.8 0.11 84 / 0.6))",
              transition: "stroke-dashoffset 0.12s linear",
            }}
          />

          {/* comet tail — a handful of shrinking, fading dots trailing the head */}
          {TAIL_OFFSETS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                tailRefs.current[i] = el
              }}
              r={4.5 - i * 0.55}
              fill="oklch(0.85 0.12 85)"
              style={{ opacity: 0 }}
            />
          ))}

          {/* comet head — the brightest point, flying along the route */}
          <g ref={cometRef} style={{ opacity: 0 }}>
            <circle r="18" fill="oklch(0.85 0.12 85 / 0.45)" style={{ filter: "blur(7px)" }} />
            <circle r="7" fill="oklch(0.94 0.09 88)" style={{ filter: "blur(1px)" }} />
            <circle
              r="6"
              fill="oklch(0.97 0.06 90)"
              style={{ filter: "drop-shadow(0 0 14px oklch(0.85 0.12 84))" }}
            />
          </g>
        </svg>
      </div>

      {/* glowing first checkpoint node — the camera pushes into it with a
          bright flash as the comet arrives */}
      <div className="relative -mt-1 flex flex-col items-center">
        <div
          ref={flashRef}
          className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-80 sm:w-80"
          style={{
            opacity: 0,
            background:
              "radial-gradient(closest-side, oklch(0.88 0.1 86 / 0.55) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full"
          style={{
            opacity: 0.1,
            transform: "translate(-50%, -68%) scale(0.5)",
            background:
              "radial-gradient(closest-side, oklch(0.8 0.11 84 / 0.55) 0%, transparent 72%)",
            filter: "blur(8px)",
          }}
        />
        <div
          ref={nodeRef}
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/60 bg-[oklch(0.13_0.018_158)] shadow-[0_0_36px_-4px_oklch(0.8_0.11_84/0.65),inset_0_0_18px_-6px_oklch(0.8_0.11_84/0.7)]"
          style={{ opacity: 0.15, transform: "scale(0.4)" }}
        >
          <span className="route-dot absolute inset-0 rounded-full ring-1 ring-primary/40" />
          <Rocket className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <div
          ref={labelRef}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-[oklch(0.07_0.014_158)]/70 px-3.5 py-1.5 backdrop-blur-sm"
          style={{ opacity: 0, transform: "translateY(14px)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.03_88)]">
            Etapa 1 · Primeros pasos
          </span>
        </div>
      </div>

      {/* fade into the section below so there is no hard cut */}
      <div
        className="absolute inset-x-0 bottom-0 h-28"
        style={{
          background:
            "linear-gradient(to bottom, transparent, oklch(0.1 0.014 158))",
        }}
      />
    </div>
  )
}
