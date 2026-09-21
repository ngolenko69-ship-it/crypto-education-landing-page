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
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-screen -translate-x-1/2 overflow-hidden lg:block"
      aria-hidden="true"
    >
      {/* Layer 0 — base atmosphere: the exact tone every other section
          starts from, so the hero's canvas matches theirs */}
      <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

      {/* Layer 1 — the scene itself, sized to its own true aspect ratio and
          pinned to the right edge (ml-auto) rather than force-cropped to
          the viewport's aspect ratio. This guarantees the shield and every
          checkpoint stay fully visible on any screen — the trade-off is a
          calm dark margin on the left on very wide screens, which is
          exactly where the text sits anyway. Fades in once on load, then
          breathes with an imperceptibly slow zoom. */}
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
        <div
          className="absolute inset-y-0 right-0 h-full"
          style={{
            aspectRatio: "1672 / 941",
            animation: reduced ? "none" : "heroSlowZoom 19s ease-in-out infinite alternate",
          }}
        >
          <img
            src="/images/hero-shield-skyline-background.webp"
            alt=""
            className="h-full w-full object-cover"
          />

          {/* golden route anchor: where the artwork's own "1. Primeros pasos"
              checkpoint sits, so the route SVG can depart from this exact spot */}
          <span
            id="route-exit-hero"
            aria-hidden="true"
            className="absolute h-px w-px"
            style={{ left: "70%", top: "86%" }}
          />

          {/* Layer 3 — warm gold light breathing from the shield, the
              route's own destination point. Positioned inside the same
              precisely-fitted image box as the anchor above, so it tracks
              the shield's real position instead of drifting with viewport
              aspect ratio. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(46% 54% at 63% 46%, oklch(0.7 0.1 84 / 0.3) 0%, transparent 74%)",
              animation: reduced ? "none" : "heroGlowBreathe 7s ease-in-out infinite",
            }}
          />

          {/* a single mote of light climbing the checkpoint stack's
              connector, very slowly — a quiet trajectory, not a loop that
              draws the eye */}
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
        </div>
      </div>

      {/* Layer 2 — premium dark gradient, but reaching transparent well
          before the shield so only the text column sits in shadow; the
          shield, skyline and checkpoint stack stay at full, vivid brightness
          exactly like the source scene */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.055 0.01 158 / 0.95) 0%, oklch(0.07 0.012 158 / 0.8) 26%, oklch(0.08 0.013 158 / 0.4) 44%, oklch(0.08 0.013 158 / 0.1) 58%, transparent 68%)",
        }}
      />

      {/* Layer 4 — a light touch of vignette, just enough to meet the header
          and hand off to the next section without a hard edge; kept subtle
          so it never reads as a second layer of darkness on top of Layer 2 */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "8%",
          background:
            "linear-gradient(to bottom, oklch(0.09 0.012 158 / 0.85) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "18%",
          background:
            "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158) 35%, transparent 100%)",
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
