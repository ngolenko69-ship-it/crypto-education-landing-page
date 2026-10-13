"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "@/hooks/use-scroll-reveal"
import { BLANK_PIXEL, SCENE_FILTER, sceneSources } from "@/components/scene/scene-config"

const IMAGE_ALT =
  "Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje — 1. Primeros pasos, 2. Dólares digitales, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"

const HERO = sceneSources("hero-shield-skyline-background")
// The framed phone/tablet picture also offers a 2500px rendition: 3x phones draw the artwork
// about 2200-2500 device pixels wide, and without it they had to download the 3351px master
// (1.2 MB). The desktop backdrop keeps the two original files.
const HERO_FRAMED = sceneSources("hero-shield-skyline-background", [2500])

/**
 * Desktop (xl+) hero environment. The artwork is sized to its own 21:9 ratio
 * and pinned to the right edge, so the shield and all six checkpoints are
 * always fully visible; a blurred ambient copy fills whatever the fitted
 * artwork does not reach on ultra-wide screens. Decor only, no pointer events.
 * The dense protection under the copy is the TextShield in the hero column.
 */
export function RoadmapBackdrop() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-px z-0 hidden overflow-clip xl:block" aria-hidden="true">
      {/* Layer 0 — base surface, the same tone every section starts from */}
      <div className="absolute inset-0 bg-surface-deep" />

      {/* Layer 0.5 — blurred ambient fill for ultra-wide gaps */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HERO.src})`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          filter: "blur(70px) saturate(1.05) brightness(0.72)",
          transform: "scale(1.2)",
        }}
      />

      {/* Layer 1 — the fitted scene (LCP image: eager, high priority) */}
      <div
        className="absolute inset-0"
        style={
          reduced
            ? undefined
            : { opacity: mounted ? 1 : 0, transition: "opacity 1500ms cubic-bezier(0.22,1,0.36,1)" }
        }
      >
        <div
          className="absolute right-0 top-px"
          style={{
            height: "calc(100% - 2px)",
            aspectRatio: "3351 / 1437",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 9%, black 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 9%, black 100%)",
          }}
        >
          <picture>
            {/* below xl this layer is display:none — resolve it to a blank pixel so nothing downloads */}
            <source media="(max-width: 1279px)" srcSet={BLANK_PIXEL} />
            <img
              src={HERO.src}
              srcSet={HERO.srcSet}
              sizes="233vh"
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
              style={{ filter: SCENE_FILTER }}
            />
          </picture>

          {/* golden route anchor: the artwork's own "1. Primeros pasos" checkpoint */}
          <span
            id="route-exit-hero"
            aria-hidden="true"
            className="absolute h-px w-px"
            style={{ left: "82.6%", top: "76.6%" }}
          />

          {/* warm light on the shield, the route's destination */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 54% at 70% 41%, rgba(230,197,116,0.26) 0%, transparent 74%)",
            }}
          />

          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute rounded-full"
              style={{
                right: "17%",
                top: "79%",
                width: 6,
                height: 6,
                marginRight: -3,
                background: "#fff3cf",
                boxShadow: "0 0 8px rgba(255,236,180,0.9), 0 0 22px rgba(230,197,116,0.65)",
                animation: "heroRouteParticle 15s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>

      {/* Layer 2 — light left wash (the shield itself stays bright) */}
      <div
        className="absolute inset-y-0 left-0 w-[50%]"
        style={{
          background:
            "linear-gradient(to right, rgba(7,19,15,0.5) 0%, rgba(7,19,15,0.22) 55%, transparent 100%)",
        }}
      />

      {/* Layer 3 — short seam into the next scene */}
      <div className="scene-seam-bottom absolute inset-x-0 bottom-0 h-[8%]" />
    </div>
  )
}

/**
 * Tablet / phone: the same artwork as a framed picture in the reading flow, right after the copy.
 * The shield, its pedestal and the six checkpoints with their labels all sit on the right of the
 * panorama, so the frame is pinned to its right edge (object-position 100%). A square frame on
 * phones is the tightest crop that keeps the whole shield and every label in view without
 * stretching anything; tablets get wider frames. It is the LCP image there, so it loads eagerly
 * with high priority. `sizes` is the width the artwork really draws at inside each frame (the
 * frame's height sets the scale), so every screen picks the file it needs.
 */
export function RoadmapMobile() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[18px] border border-[var(--line-gold)] bg-surface xl:hidden"
      role="img"
      aria-label={IMAGE_ALT}
    >
      <picture>
        {/* from xl this frame is display:none — resolve it to a blank pixel so nothing downloads */}
        <source media="(min-width: 1280px)" srcSet={BLANK_PIXEL} />
        <img
          src={HERO_FRAMED.src}
          srcSet={HERO_FRAMED.srcSet}
          sizes="(max-width: 639px) calc((100vw - 2.5rem) * 2.333), (max-width: 767px) calc((100vw - 2.9rem) * 1.312), calc(94vw * 1.111)"
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="block aspect-square w-full object-cover sm:aspect-[16/9] md:aspect-[21/10]"
          style={{ objectPosition: "100% 50%", filter: SCENE_FILTER }}
        />
      </picture>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%]"
        style={{ background: "linear-gradient(to top, rgba(7,19,15,0.45), transparent)" }}
        aria-hidden="true"
      />
      {/* golden route anchor: the artwork's own "1. Primeros pasos" checkpoint (its circle sits at 83.3% x,
          78.8% y of the panorama); the x position follows each frame's crop: square, 16:9, 21:10 */}
      <span
        id="route-exit-hero-mobile"
        aria-hidden="true"
        className="absolute left-[61%] top-[78.8%] h-px w-px sm:left-[78.1%] md:left-[81.4%]"
      />
    </div>
  )
}
