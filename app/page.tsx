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

      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />

        <main
          id="inicio"
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-10 lg:pt-10"
        >
          <section className="grid flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <HeroContent />
            <div className="order-last lg:order-none">
              <RoadmapVisual />
            </div>
          </section>

          <div className="mt-12 lg:mt-8">
            <BenefitsBar />
          </div>
        </main>
      </div>
    </div>
  )
}
