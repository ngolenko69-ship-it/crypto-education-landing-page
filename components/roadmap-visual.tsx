"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"

const IMAGE_ALT =
  "Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje — 1. Primeros pasos, 2. Dólares digitales, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"

/**
 * Desktop-only cinematic background layer — the hero's own environment, not
 * a picture placed inside it. The artwork is scaled slightly past the
 * section's own height (clipped top/bottom by the wrapper) so its left edge
 * genuinely bleeds into the text column instead of stopping short of it;
 * everything below is one dark-green canvas the image, glows and text all
 * share, matching the base/overlay recipe every other section already uses.
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
      className="pointer-events-none absolute inset-0 hidden items-center justify-end overflow-hidden lg:flex"
      aria-hidden="true"
    >
      {/* Layer 1 — base atmosphere: the exact tone every other section
          starts from, so the hero's canvas matches theirs instead of
          showing the page-wide ambient gradient through it */}
      <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

      {/* wide ambient color echo behind the whole scene, reinforcing
          continuity even past where the photo itself can reach */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 75% at 74% 44%, oklch(0.34 0.05 150 / 0.32) 0%, transparent 64%)",
        }}
      />

      {/* Layer 2 — hero image, entering with a slow settle rather than
          snapping in with the rest of the page */}
      <div
        className="relative flex h-full items-center justify-end"
        style={
          reduced
            ? undefined
            : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.985)",
                transition:
                  "opacity 600ms cubic-bezier(0.22,1,0.36,1) 100ms, transform 900ms cubic-bezier(0.22,1,0.36,1) 100ms",
              }
        }
      >
        {/* soft green-gold aura behind the scene for a seamless blend */}
        <div
          className="absolute right-0 top-1/2 h-[95%] w-[95%] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.34 0.05 150 / 0.4) 0%, oklch(0.66 0.1 84 / 0.14) 45%, transparent 78%)",
            filter: "blur(24px)",
          }}
        />

        {/* full scene, scaled a little past the section's own height so its
            edges — top, bottom, and crucially the left — genuinely bleed
            into the surrounding canvas instead of stopping in mid-air */}
        <div className="relative inline-block h-full xl:h-[112%]">
          <img
            src="/images/hero-roadmap-visual.png"
            alt=""
            className="relative h-full w-auto max-w-none object-contain"
            style={{
              WebkitMaskImage:
                "radial-gradient(145% 140% at 60% 48%, black 48%, transparent 96%), linear-gradient(to right, transparent 0%, black 26%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
              maskImage:
                "radial-gradient(145% 140% at 60% 48%, black 48%, transparent 96%), linear-gradient(to right, transparent 0%, black 26%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 93%, transparent 100%)",
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          />
          {/* golden route anchor: where the artwork's own "1. Primeros pasos"
              checkpoint sits, so the route SVG can depart from this exact spot */}
          <span
            id="route-exit-hero"
            aria-hidden="true"
            className="absolute h-px w-px"
            style={{ left: "28%", top: "89%" }}
          />

          {/* a single restrained pulse of gold at the route's start as the
              hero settles in — the path quietly waking up, not an endless
              animation. Scroll then hands motion off to the Golden Route. */}
          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                left: "28%",
                top: "89%",
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                background: "oklch(0.95 0.06 90)",
                boxShadow: "0 0 10px oklch(0.9 0.09 88 / 0.9), 0 0 26px oklch(0.8 0.11 84 / 0.6)",
                opacity: 0,
                animation: mounted ? "routeAwaken 1400ms cubic-bezier(0.22,1,0.36,1) 650ms forwards" : "none",
              }}
            />
          )}
        </div>
      </div>

      {/* soft gold glow lifting the shield / route focal point, same recipe
          every other section uses on its own focal point */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "58%",
          background:
            "radial-gradient(62% 60% at 66% 46%, oklch(0.66 0.1 84 / 0.16) 0%, transparent 74%)",
        }}
      />

      {/* Layer 3 — left dark wash, long and gradual so the text sits inside
          the scene's own shadow rather than a separate opaque panel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.92) 24%, oklch(0.09 0.012 158 / 0.6) 38%, oklch(0.09 0.012 158 / 0.22) 52%, transparent 66%)",
        }}
      />

      {/* top fade so the scene meets the header without a hard line */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "16%",
          background:
            "linear-gradient(to bottom, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.45) 60%, transparent 100%)",
        }}
      />

      {/* bottom fade already preparing the next section — no hard edge, the
          Golden Route continues the eye downward from here */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "20%",
          background:
            "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.6) 50%, transparent 100%)",
        }}
      />

      {/* right edge vignette so it never reads as a flat cut-off */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "8%",
          background: "linear-gradient(to left, oklch(0.07 0.01 158 / 0.5), transparent)",
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
      <div className="relative overflow-hidden">
        <Image
          src="/images/hero-roadmap-visual.png"
          alt=""
          width={1128}
          height={1456}
          priority
          className="h-auto w-full object-contain"
          style={{
            WebkitMaskImage:
              "radial-gradient(85% 78% at 50% 46%, black 45%, transparent 92%), linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%), linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)",
            maskImage:
              "radial-gradient(85% 78% at 50% 46%, black 45%, transparent 92%), linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%), linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />

        {/* top fade so the scene dissolves into the section above it */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.55) 45%, transparent 100%)",
          }}
        />

        {/* bottom fade so the scene dissolves into whatever follows */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.55) 45%, transparent 100%)",
          }}
        />

        {/* golden route anchor: where the artwork's own "1. Primeros pasos"
            checkpoint sits, so the route SVG can depart from this exact spot */}
        <span
          id="route-exit-hero-mobile"
          aria-hidden="true"
          className="absolute h-px w-px"
          style={{ left: "28%", top: "89%" }}
        />
      </div>
    </div>
  )
}
