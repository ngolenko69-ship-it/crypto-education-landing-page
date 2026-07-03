"use client"

import { useEffect, useRef } from "react"
import { Rocket } from "lucide-react"

/**
 * Cinematic connective zone between the hero roadmap and the "Primeros pasos"
 * section. As the user scrolls, a golden route line grows downward, the first
 * checkpoint glows into focus, and the background darkens — so the roadmap
 * appears to "open" into the first step instead of hard-cutting to a new page.
 *
 * Motion is driven by a single rAF loop that writes transforms directly to the
 * DOM (no per-frame React re-renders) and is disabled for reduced-motion users.
 */
export function ScrollTransition() {
  const zoneRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
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

    const apply = () => {
      raf = 0
      const rect = zone.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      // 0 as the zone enters from the bottom, 1 as it exits the top
      const p = clamp((vh - rect.top) / (rect.height + vh))

      const lineP = reduced ? 1 : clamp(p * 1.35)
      const nodeP = reduced ? 1 : clamp((p - 0.32) / 0.42)
      const labelP = reduced ? 1 : clamp((p - 0.46) / 0.4)

      if (lineRef.current) lineRef.current.style.transform = `scaleY(${lineP})`
      if (glowRef.current) glowRef.current.style.opacity = String(0.25 + nodeP * 0.55)
      if (nodeRef.current) {
        nodeRef.current.style.opacity = String(0.35 + nodeP * 0.65)
        nodeRef.current.style.transform = `scale(${0.86 + nodeP * 0.14})`
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
      className="pointer-events-none relative flex w-full flex-col items-center overflow-hidden px-6 pb-16 pt-6 sm:pb-20 lg:pb-28 lg:pt-10"
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

      {/* growing golden route line */}
      <div className="relative h-[30vh] w-px sm:h-[34vh] lg:h-[42vh]">
        <div
          ref={lineRef}
          className="absolute inset-0 origin-top"
          style={{
            transform: "scaleY(0)",
            transition: "transform 0.12s linear",
            background:
              "linear-gradient(to bottom, transparent 0%, oklch(0.8 0.11 84 / 0.15) 12%, oklch(0.82 0.12 84 / 0.9) 100%)",
            boxShadow: "0 0 12px oklch(0.8 0.11 84 / 0.5)",
          }}
        />
      </div>

      {/* glowing first checkpoint node */}
      <div className="relative -mt-1 flex flex-col items-center">
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-[68%] rounded-full"
          style={{
            opacity: 0.25,
            background:
              "radial-gradient(closest-side, oklch(0.8 0.11 84 / 0.5) 0%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        <div
          ref={nodeRef}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/60 bg-[oklch(0.13_0.018_158)] shadow-[0_0_28px_-4px_oklch(0.8_0.11_84/0.6),inset_0_0_16px_-6px_oklch(0.8_0.11_84/0.7)]"
          style={{ opacity: 0.35, transform: "scale(0.86)" }}
        >
          <span className="route-dot absolute inset-0 rounded-full ring-1 ring-primary/40" />
          <Rocket className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>

        <div
          ref={labelRef}
          className="mt-5 flex flex-col items-center gap-1.5"
          style={{ opacity: 0, transform: "translateY(14px)" }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">
            Etapa 1
          </span>
          <span className="font-serif text-2xl font-medium text-[oklch(0.97_0.015_88)] sm:text-3xl">
            Primeros pasos
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
