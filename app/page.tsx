import { AntiEstafasSection } from "@/components/anti-estafas-section"
import { BenefitsBar } from "@/components/benefits-bar"
import { DolaresDigitalesSection } from "@/components/dolares-digitales-section"
import { HeroContent } from "@/components/hero-content"
import { P2pQueRevisarSection } from "@/components/p2p-que-revisar-section"
import { PrimerosPasosSection } from "@/components/primeros-pasos-section"
import { RoadmapBackdrop, RoadmapMobile } from "@/components/roadmap-visual"
import { ScrollTransition } from "@/components/scroll-transition"
import { SnakeTransition } from "@/components/snake-transition"
import { WalletsYClavesSection } from "@/components/wallets-y-claves-section"
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

        {/* cinematic scroll continuation from the hero roadmap into step 1 */}
        <ScrollTransition />
        <PrimerosPasosSection />

        {/* snake route transition guiding from step 1 into step 2 */}
        <SnakeTransition step="Etapa 2" label="Dólares digitales" />
        <DolaresDigitalesSection />

        {/* snake route transition guiding from step 2 into step 3 */}
        <SnakeTransition step="Etapa 3" label="P2P: qué revisar" />
        <P2pQueRevisarSection />

        {/* snake route transition guiding from step 3 into step 4 */}
        <SnakeTransition step="Etapa 4" label="Wallets y claves" />
        <WalletsYClavesSection />

        {/* snake route transition guiding from step 4 into step 5 */}
        <SnakeTransition step="Etapa 5" label="Anti-estafas" />
        <AntiEstafasSection />
      </div>
    </div>
  )
}
