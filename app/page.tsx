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
import { TextShield } from "@/components/scene/text-shield"
import { SobreNosotrosSection } from "@/components/sobre-nosotros-section"
import { WalletsYClavesSection } from "@/components/wallets-y-claves-section"
import { SiteHeader } from "@/components/site-header"
import { TelegramLauncher } from "@/components/telegram-floating-bar"
import { FinalCtaPopup } from "@/components/final-cta-popup"

export default function Home() {
  return (
    <div className="bg-cinematic relative min-h-screen overflow-x-clip">
      {/* subtle map/grid texture */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* atmospheric light points */}
      <div className="bg-particles pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative flex min-h-screen flex-col pt-[var(--header-h)]">
        <SiteHeader />

        <main className="relative flex flex-1 flex-col">
          {/* ---------- Hero ---------- */}
          <section
            id="inicio"
            aria-label="Inicio"
            className="relative w-full overflow-clip xl:flex xl:min-h-[calc(100vh-var(--header-h))] xl:items-center xl:bg-surface-deep"
          >
            <RoadmapBackdrop />

            <div className="relative z-10 mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] py-8 sm:py-12 xl:py-16">
              {/* one protected column: copy, CTAs, trust line and benefits
                  share a single left edge; the shield covers all of it on
                  desktop and ends well before the shield artwork */}
              <div className="relative xl:max-w-[min(40rem,38vw)] xl:[--shield-feather:8rem]">
                <TextShield strength={0.86} feather="var(--shield-feather)" padY="4rem" />

                <div className="relative z-10">
                  <HeroContent />

                  {/* tablet / phone: the artwork in the reading flow */}
                  <div className="mt-10 xl:hidden">
                    <RoadmapMobile />
                  </div>

                  <div className="mt-10 w-full max-w-2xl xl:mt-12 xl:max-w-none">
                    <BenefitsBar />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <PrimerosPasosSection />
          <DolaresDigitalesSection />
          <P2pQueRevisarSection />
          <WalletsYClavesSection />
          <AntiEstafasSection />
          <ComunidadCriptoSeguraSection />
          <SobreNosotrosSection />
        </main>

        <LegalTrustFooterSection />
      </div>

      {/* a small gold comet mark that follows the cursor across the page */}
      <CometCursor />

      {/* the golden route: one continuous comet motif linking every step */}
      <GoldenRoute />

      {/* conversion overlays: compact community launcher + final invitation popup */}
      <TelegramLauncher />
      <FinalCtaPopup />
    </div>
  )
}
