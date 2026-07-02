import { BenefitsBar } from "@/components/benefits-bar"
import { HeroContent } from "@/components/hero-content"
import { RoadmapVisual } from "@/components/roadmap-visual"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <div className="bg-cinematic relative min-h-screen overflow-hidden">
      {/* subtle map/grid texture */}
      <div
        className="bg-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* faint mountain / landscape silhouette on the right */}
      <svg
        className="pointer-events-none absolute -right-10 top-0 h-[70vh] w-[70%] opacity-[0.22] lg:w-[55%]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.5 0.06 155)" />
            <stop offset="100%" stopColor="oklch(0.12 0.02 158)" />
          </linearGradient>
        </defs>
        <path
          d="M0 470 L120 350 L210 430 L320 250 L430 400 L520 300 L640 440 L740 320 L800 400 L800 600 L0 600 Z"
          fill="url(#ridge)"
        />
        <path
          d="M300 520 L420 380 L520 470 L640 340 L760 460 L800 420 L800 600 L280 600 Z"
          fill="oklch(0.18 0.024 158)"
          fillOpacity="0.85"
        />
      </svg>

      {/* atmospheric light points */}
      <div
        className="bg-particles pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />

        <main
          id="inicio"
          className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-5 pb-12 pt-6 sm:px-8 md:px-10 lg:px-14 lg:pt-10"
        >
          <section className="grid flex-1 items-center gap-12 py-10 md:py-14 lg:grid-cols-[0.43fr_0.57fr] lg:gap-16 lg:py-16 xl:gap-20">
            <div className="relative z-10">
              <HeroContent />
            </div>
            <div className="relative z-0 order-last flex w-full items-center justify-center lg:order-none lg:justify-end">
              <RoadmapVisual />
            </div>
          </section>

          <div className="mt-8 lg:mt-4">
            <BenefitsBar />
          </div>
        </main>
      </div>
    </div>
  )
}
