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
      className="pointer-events-none absolute inset-0 hidden items-center justify-end overflow-hidden lg:flex"
      aria-hidden="true"
    >
      {/* deep dark-green base behind everything — the exact tone every other
          section starts from, so the hero's own canvas matches theirs
          instead of showing the page-wide ambient gradient through it */}
      <div className="absolute inset-0 bg-[oklch(0.09_0.012_158)]" />

      <div className="relative flex h-full items-center justify-end">
        {/* soft green-gold aura behind the scene for a seamless blend */}
        <div
          className="absolute right-0 top-1/2 h-[90%] w-[90%] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.34 0.05 150 / 0.4) 0%, oklch(0.66 0.1 84 / 0.14) 45%, transparent 78%)",
            filter: "blur(24px)",
          }}
        />

        {/* full scene, sized to its own aspect ratio so nothing is cropped,
            filling the section top-to-bottom with every edge feathered into
            the base tone above */}
        <div className="relative inline-block h-full">
          <img
            src="/images/hero-roadmap-visual.png"
            alt=""
            className="relative h-full w-auto max-w-none object-contain"
            style={{
              WebkitMaskImage:
                "radial-gradient(130% 128% at 62% 48%, black 58%, transparent 98%), linear-gradient(to right, transparent 0%, black 18%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 93%, transparent 100%)",
              maskImage:
                "radial-gradient(130% 128% at 62% 48%, black 58%, transparent 98%), linear-gradient(to right, transparent 0%, black 18%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 93%, transparent 100%)",
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
        </div>
      </div>

      {/* soft gold glow lifting the shield / route focal point, same recipe
          every other section uses on its own focal point */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "54%",
          background:
            "radial-gradient(60% 58% at 68% 46%, oklch(0.66 0.1 84 / 0.16) 0%, transparent 74%)",
        }}
      />

      {/* left dark wash, spanning the full slide so the artwork reads as the
          section's own background instead of a picture in a box — opaque
          behind the text column, fully clear by the artwork */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.9) 28%, oklch(0.09 0.012 158 / 0.44) 44%, transparent 60%)",
        }}
      />

      {/* bottom fade into whatever follows */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "16%",
          background:
            "linear-gradient(to top, oklch(0.09 0.012 158) 0%, oklch(0.09 0.012 158 / 0.55) 55%, transparent 100%)",
        }}
      />

      {/* right edge vignette so it never reads as a flat cut-off */}
      <div
        className="absolute inset-y-0 right-0"
        style={{
          width: "10%",
          background: "linear-gradient(to left, oklch(0.07 0.01 158 / 0.55), transparent)",
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
