"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const IMAGE_ALT =
  "Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje — 1. Primeros pasos, 2. Dólares digitales, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"

/**
 * Desktop-only cinematic background layer — the hero's own environment, not
 * a picture placed inside it. The scene fills the section edge-to-edge
 * (object-cover, no frame, no card), with the same dark base + gradient
 * recipe every other section already uses so it reads as one continuous
 * canvas rather than an inserted photo.
 */
export function RoadmapBackdrop() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      aria-hidden="true"
    >
      {/* Layer 0 — base atmosphere: the exact tone every other section
          starts from, so the hero's canvas matches theirs */}
      <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

      {/* Layer 1 — the scene itself: full-bleed cover, fading in once on
          load, then breathing with an imperceptibly slow zoom */}
      <div
        className="absolute inset-0"
        style={
          reduced
            ? undefined
            : {
                opacity: mounted ? 1 : 0,
                transition: "opacity 1500ms cubic-bezier(0.22,1,0.36,1)",
              }
        }
      >
        <img
          src="/images/hero-shield-skyline-background.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_right]"
          style={{
            transformOrigin: "68% 46%",
            animation: reduced ? "none" : "heroSlowZoom 19s ease-in-out infinite alternate",
          }}
        />

        {/* golden route anchor: where the artwork's own "1. Primeros pasos"
            checkpoint sits, so the route SVG can depart from this exact spot */}
        <span
          id="route-exit-hero"
          aria-hidden="true"
          className="absolute h-px w-px"
          style={{ left: "70%", top: "86%" }}
        />
      </div>

      {/* Layer 2 — premium dark gradient from the left so the text sits
          inside the scene's own shadow rather than a separate opaque panel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.055 0.01 158 / 0.97) 0%, oklch(0.07 0.012 158 / 0.88) 30%, oklch(0.08 0.013 158 / 0.5) 56%, oklch(0.08 0.013 158 / 0.12) 76%, transparent 92%)",
        }}
      />

      {/* Layer 3 — soft gold light breathing from the shield, the route's
          own destination point */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 48% at 64% 47%, oklch(0.66 0.1 84 / 0.24) 0%, transparent 72%)",
          animation: reduced ? "none" : "heroGlowBreathe 7s ease-in-out infinite",
        }}
      />

      {/* a single mote of light climbing the checkpoint stack's connector,
          very slowly — a quiet trajectory, not a loop that draws the eye */}
      {!reduced && (
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            right: "9.5%",
            top: "87%",
            width: 6,
            height: 6,
            marginRight: -3,
            background: "oklch(0.96 0.05 92)",
            boxShadow: "0 0 8px oklch(0.9 0.09 88 / 0.9), 0 0 22px oklch(0.8 0.11 84 / 0.65)",
            animation: "heroRouteParticle 15s ease-in-out infinite",
          }}
        />
      )}

      {/* Layer 4 — cinematic vignette: top meets the header, bottom already
          prepares the next section, right edge softens the frame */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "14%",
          background:
            "linear-gradient(to bottom, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.4) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "20%",
          background:
            "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.55) 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "5%",
          background: "linear-gradient(to left, oklch(0.07 0.01 158 / 0.4), transparent)",
        }}
      />
    </div>
  )
}

/**
 * Mobile / tablet block: the image shown as its own responsive section below
 * the text, softly faded top and bottom (no hard card frame).
 */
export function RoadmapMobile() {
  return (
    <div className="relative w-full lg:hidden" role="img" aria-label={IMAGE_ALT}>
      <div
        className="pointer-events-none absolute -inset-4 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 50% at 55% 45%, oklch(0.66 0.1 84 / 0.16) 0%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/images/hero-shield-skyline-background.webp"
          alt=""
          width={1672}
          height={941}
          priority
          className="h-auto w-full object-cover"
        />

        {/* top fade so the scene dissolves into the section above it */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[20%]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.5) 45%, transparent 100%)",
          }}
        />

        {/* bottom fade so the scene dissolves into whatever follows */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.5) 45%, transparent 100%)",
          }}
        />

        {/* golden route anchor: where the artwork's own "1. Primeros pasos"
            checkpoint sits, so the route SVG can depart from this exact spot */}
        <span
          id="route-exit-hero-mobile"
          aria-hidden="true"
          className="absolute h-px w-px"
          style={{ left: "69%", top: "89%" }}
        />
      </div>
    </div>
  )
}
