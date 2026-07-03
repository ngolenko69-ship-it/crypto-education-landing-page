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
      style={{ width: "64vw" }}
      aria-hidden="true"
    >
      {/* wide cover image that bleeds past the edges like a hero background */}
      <img
        src="/images/hero-roadmap-visual.png"
        alt=""
        className="h-full w-full"
        style={{
          objectFit: "cover",
          objectPosition: "center right",
          transform: "scale(1.08)",
          opacity: 0.92,
        }}
      />

      {/* A) strong left fade into the background */}
      <div
        className="absolute inset-y-0"
        style={{
          left: "34%",
          width: "34%",
          zIndex: 1,
          background:
            "linear-gradient(to right, #040907 0%, rgba(4,9,7,0.92) 28%, rgba(4,9,7,0.58) 58%, transparent 100%)",
        }}
      />

      {/* B) text protection gradient on the left side */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: "54%",
          zIndex: 1,
          background:
            "radial-gradient(circle at 28% 42%, rgba(4,9,7,0.22), rgba(4,9,7,0.86) 72%)",
        }}
      />

      {/* C) top fade */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "210px",
          zIndex: 1,
          background:
            "linear-gradient(to bottom, #040907 0%, rgba(4,9,7,0.85) 40%, transparent 100%)",
        }}
      />

      {/* D) bottom fade (also clears the lower conflict area) */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "220px",
          zIndex: 1,
          background:
            "linear-gradient(to top, #040907 0%, rgba(4,9,7,0.78) 45%, transparent 100%)",
        }}
      />

      {/* E) right vignette */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "18vw",
          zIndex: 1,
          background: "linear-gradient(to left, rgba(2,4,3,0.55), transparent)",
        }}
      />

      {/* F) subtle global darkener so the left text always wins contrast */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: "rgba(2,4,3,0.10)" }}
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
