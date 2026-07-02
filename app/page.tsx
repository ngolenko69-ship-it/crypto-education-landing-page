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

      {/* atmospheric light points */}
      <div
        className="bg-particles pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />

        <main
          id="inicio"
          className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-5 pb-12 pt-2 sm:px-8 md:px-10 lg:px-14 lg:pt-2"
        >
          <section className="grid flex-1 items-center gap-10 py-2 md:py-4 lg:grid-cols-[0.4fr_0.6fr] lg:items-start lg:gap-10 lg:py-2 xl:gap-14">
            <div className="relative z-10 lg:pt-10 xl:pt-16">
              <HeroContent />
            </div>
            <div className="relative z-0 order-last flex w-full items-start justify-center lg:order-none lg:-mt-2 lg:justify-end">
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
