export function RoadmapVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[560px] sm:max-w-[680px] lg:mx-0 lg:max-w-[900px]"
      role="img"
      aria-label="Ruta de aprendizaje en seis etapas: 1. Conceptos básicos, 2. Stablecoins y riesgos, 3. P2P: qué revisar, 4. Wallets y claves, 5. Anti-estafas, 6. Criterio cripto"
    >
      {/* soft radial backdrop + gold glow so the visual feels embedded in the hero */}
      <div
        className="pointer-events-none absolute -inset-x-10 -inset-y-6 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 55% at 62% 42%, oklch(0.66 0.1 84 / 0.2) 0%, transparent 68%), radial-gradient(70% 70% at 55% 55%, oklch(0.3 0.05 155 / 0.35) 0%, transparent 72%)",
          filter: "blur(6px)",
        }}
      />

      {/* Premium shield + glowing route graphic cropped from the reference scene.
          The crop isolates the right-hand region (shield, podium, route, checkpoints)
          and fades on the left/bottom edges to blend into the page background. */}
      <div
        className="aspect-[745/700] w-full bg-no-repeat"
        style={{
          backgroundImage: "url(/images/hero-scene.png)",
          backgroundSize: "210.5% auto",
          backgroundPosition: "96% 58.5%",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 15%, black 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 84%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />
    </div>
  )
}
