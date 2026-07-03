import Image from "next/image"

const IMAGE_ALT =
  "Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje — 1. Primeros pasos, 2. Dólares digitales, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"

/**
 * Desktop-only cinematic background layer.
 * Rendered as an absolute element that bleeds across the right half of the
 * hero and dissolves into the dark-green background on every edge, so it never
 * reads as a rectangular pasted image.
 */
export function RoadmapBackdrop() {
  return (
    <div
      className="pointer-events-none absolute -right-14 bottom-0 top-0 z-0 hidden overflow-hidden lg:block"
      style={{ width: "66vw" }}
      aria-hidden="true"
    >
      {/* full-bleed cover image behaving as a background layer */}
      <img
        src="/images/hero-roadmap-visual.png"
        alt=""
        className="h-full w-full"
        style={{
          objectFit: "cover",
          objectPosition: "center right",
          transform: "scale(1.12)",
        }}
      />

      {/* dark green overlay across the whole image */}
      <div
        className="absolute inset-0"
        style={{ background: "oklch(0.11 0.015 158 / 0.4)" }}
      />

      {/* stronger left fade into the hero background */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: "62%",
          background:
            "linear-gradient(to right, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.95) 30%, oklch(0.1 0.014 158 / 0.55) 62%, transparent 100%)",
        }}
      />

      {/* stronger top fade */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "34%",
          background:
            "linear-gradient(to bottom, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.85) 40%, transparent 100%)",
        }}
      />

      {/* stronger bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "38%",
          background:
            "linear-gradient(to top, oklch(0.1 0.014 158) 0%, oklch(0.1 0.014 158 / 0.85) 40%, transparent 100%)",
        }}
      />

      {/* right edge vignette so the bleed dissolves */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "20%",
          background:
            "linear-gradient(to left, oklch(0.08 0.012 158 / 0.7), transparent)",
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
              "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      </div>
    </div>
  )
}
