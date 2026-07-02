import { BenefitsBar } from "@/components/benefits-bar"
import { HeroContent } from "@/components/hero-content"
import { RoadmapBackdrop, RoadmapMobile } from "@/components/roadmap-visual"
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
          className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-5 pb-12 pt-2 sm:px-8 md:px-10 lg:px-14 lg:pt-2"
        >
          <section className="relative flex flex-1 flex-col justify-center py-2 md:py-4 lg:min-h-[calc(100vh-9rem)]">
            {/* Desktop: cinematic roadmap image blended into the background */}
            <RoadmapBackdrop />

            {/* Left text content, floating above the blended scene */}
            <div className="relative z-10 w-full max-w-xl lg:max-w-[38rem]">
              <HeroContent />
            </div>

            {/* Mobile / tablet: image stacked below the text as its own section */}
            <div className="relative z-10 mt-10 lg:hidden">
              <RoadmapMobile />
            </div>
          </section>

          <div className="relative z-10 mt-8 lg:mt-4">
            <BenefitsBar />
          </div>
        </main>
      </div>
    </div>
  )
}
