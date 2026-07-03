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
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[70%] items-center justify-end overflow-hidden xl:w-[66%] lg:flex"
      aria-hidden="true"
    >
      <div className="relative flex h-full items-center justify-end">
        {/* soft green-gold aura behind the scene for a seamless blend */}
        <div
          className="absolute right-0 top-1/2 h-[85%] w-[85%] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.34 0.05 150 / 0.4) 0%, oklch(0.66 0.1 84 / 0.14) 45%, transparent 78%)",
            filter: "blur(24px)",
          }}
        />

        {/* full scene, sized to its own aspect ratio so nothing is cropped,
            with every edge feathered into the background */}
        <img
          src="/images/hero-roadmap-visual.png"
          alt=""
          className="relative h-[94%] w-auto max-w-none object-contain"
          style={{
            WebkitMaskImage:
              "radial-gradient(120% 118% at 62% 48%, black 55%, transparent 96%), linear-gradient(to right, transparent 0%, black 20%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 91%, transparent 100%)",
            maskImage:
              "radial-gradient(120% 118% at 62% 48%, black 55%, transparent 96%), linear-gradient(to right, transparent 0%, black 20%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 91%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      </div>

      {/* left dark wash so the headline always keeps strong contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, oklch(0.11 0.015 158) 0%, oklch(0.11 0.015 158 / 0.6) 12%, transparent 34%)",
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
