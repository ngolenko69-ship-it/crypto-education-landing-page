import { AntiEstafasSection } from "@/components/anti-estafas-section"
import { BenefitsBar } from "@/components/benefits-bar"
import { CometCursor } from "@/components/comet-cursor"
import { ComunidadCriptoSeguraSection } from "@/components/comunidad-cripto-segura-section"
import { DolaresDigitalesSection } from "@/components/dolares-digitales-section"
import { GoldenRoute } from "@/components/golden-route"
import { HeroContent } from "@/components/hero-content"
import { LegalTrustFooterSection } from "@/components/legal-trust-footer-section"
import { P2pQueRevisarSection } from "@/components/p2p-que-revisar-section"
import { PrimerosPasosSection } from "@/components/primeros-pasos-section"
import { RoadmapBackdrop, RoadmapMobile } from "@/components/roadmap-visual"
import { SobreNosotrosSection } from "@/components/sobre-nosotros-section"
import { WalletsYClavesSection } from "@/components/wallets-y-claves-section"
import { SiteHeader } from "@/components/site-header"
import { TelegramFloatingBar } from "@/components/telegram-floating-bar"
import { FinalCtaPopup } from "@/components/final-cta-popup"

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

      <div className="relative flex min-h-screen flex-col pt-14 lg:pt-16">
        <SiteHeader />

        <main
          id="inicio"
          className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col scroll-mt-20 px-5 pt-2 sm:px-8 md:px-10 md:scroll-mt-24 lg:px-14 lg:pt-0"
        >
          <section className="relative flex flex-1 flex-col justify-center py-2 md:py-4 lg:min-h-[calc(100vh-9rem)]">
            {/* Desktop: cinematic roadmap image blended into the background */}
            <RoadmapBackdrop />

            {/* Left text content, floating above the blended scene — pulled
                closer to the true left edge now that the scene bleeds full
                viewport width, so it doesn't read as stranded in empty
                space */}
            <div className="relative z-10 w-full max-w-xl lg:-ml-8 lg:max-w-[38rem]">
              <HeroContent />
            </div>

            {/* Mobile / tablet: image stacked below the text as its own section */}
            <div className="relative z-10 mt-10 lg:hidden">
              <RoadmapMobile />
            </div>

            {/* trust bar — kept inside the hero's own cinematic frame so it
                reads as part of the first slide, not a separate boxed
                element sitting on the plain page background below it; width
                capped so it clears the checkpoint stack on the right
                instead of running underneath it */}
            <div className="relative z-10 mt-10 w-full max-w-xl lg:ml-10 lg:mt-12 lg:max-w-[45rem]">
              <BenefitsBar />
            </div>
          </section>
        </main>

        <PrimerosPasosSection />
        <DolaresDigitalesSection />
        <P2pQueRevisarSection />
        <WalletsYClavesSection />
        <AntiEstafasSection />
        <ComunidadCriptoSeguraSection />
        <SobreNosotrosSection />
        <LegalTrustFooterSection />
      </div>

      {/* a small gold comet mark that follows the cursor across the page */}
      <CometCursor />

      {/* the golden route: one continuous comet motif linking every step,
          measured against the sections' real anchors rather than drawn as
          a fixed widget between them */}
      <GoldenRoute />

      {/* conversion overlays: floating community bar + final invitation popup */}
      <TelegramFloatingBar />
      <FinalCtaPopup />
    </div>
  )
}
