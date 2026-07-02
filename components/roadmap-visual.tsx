import Image from "next/image"

export function RoadmapVisual() {
  return (
    <div
      className="relative w-full"
      role="img"
      aria-label="Ruta de aprendizaje en seis etapas: 1. Primeros pasos, 2. Dólares digitales, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"
    >
      {/* soft green/gold glow so the visual feels embedded in the hero */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(58% 50% at 60% 40%, oklch(0.66 0.1 84 / 0.18) 0%, transparent 70%), radial-gradient(72% 72% at 55% 55%, oklch(0.3 0.05 155 / 0.3) 0%, transparent 74%)",
          filter: "blur(8px)",
        }}
      />

      {/* MOBILE: framed premium block with rounded corners + shadow */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 shadow-[0_20px_60px_-20px_oklch(0_0_0/0.8)] lg:hidden">
        <Image
          src="/images/hero-roadmap-visual.png"
          alt="Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje"
          width={1128}
          height={1456}
          priority
          className="h-auto w-full object-cover"
        />
        {/* gentle top + bottom fade into the page */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.11 0.015 158 / 0.4) 0%, transparent 18%, transparent 82%, oklch(0.11 0.015 158 / 0.55) 100%)",
          }}
        />
      </div>

      {/* DESKTOP: large blended scene with faded edges (no visible frame) */}
      <div className="relative hidden max-h-[82vh] aspect-[1128/1456] w-full lg:block">
        <Image
          src="/images/hero-roadmap-visual.png"
          alt="Ruta cripto segura: escudo con Bitcoin y las seis etapas del aprendizaje"
          fill
          priority
          sizes="60vw"
          className="object-contain object-right"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 16%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 16%, black 95%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 7%, black 90%, transparent 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
        {/* subtle right-edge vignette + left dark blend to protect text contrast */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(80% 90% at 78% 45%, transparent 55%, oklch(0.06 0.008 158 / 0.5) 100%), linear-gradient(to right, oklch(0.11 0.015 158 / 0.4) 0%, transparent 22%)",
          }}
        />
      </div>
    </div>
  )
}
