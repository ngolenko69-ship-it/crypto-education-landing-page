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
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] xl:w-[64%] lg:block"
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        <Image
          src="/images/hero-roadmap-visual.png"
          alt=""
          fill
          priority
          sizes="65vw"
          className="object-cover object-right-top"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 30%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 30%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />

        {/* multi-overlay blend: left dark wash + right vignette + overall tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.11 0.015 158) 0%, oklch(0.11 0.015 158 / 0.75) 14%, transparent 42%), radial-gradient(75% 80% at 72% 42%, transparent 52%, oklch(0.07 0.01 158 / 0.55) 100%), linear-gradient(to bottom, oklch(0.11 0.015 158 / 0.5) 0%, transparent 20%, transparent 78%, oklch(0.1 0.014 158 / 0.7) 100%)",
          }}
        />
        {/* subtle overall darkening so gold text/headline always wins contrast */}
        <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]/25" />
      </div>
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
