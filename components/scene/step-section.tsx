"use client"

import { ArrowRight } from "lucide-react"
import { Cta } from "@/components/ui/cta"
import { useReveal } from "@/hooks/use-scroll-reveal"
import { CardGrid, type CardItem } from "./section-card"
import { SceneBackdrop } from "./scene-backdrop"
import { SceneFrame } from "./scene-frame"
import { SectionBadge } from "./section-badge"
import { TextShield } from "./text-shield"
import type { SceneConfig } from "./scene-config"

export type StepSectionProps = {
  id: string
  titleId: string
  dotId: string
  badge: string
  title: React.ReactNode
  lead: React.ReactNode
  cta: { href: string; label: string; external?: boolean }
  helper?: string
  trust: string
  cards: CardItem[]
  cardsId?: string
  scene: SceneConfig
}

/**
 * One learning step. Desktop (xl+): the scene fills the section, the copy
 * column sits on the left over its own TextShield, the cards row stays inside
 * the protected zone so it never floats over the bright path or the object.
 * Tablet/phone: calm surface, copy, a framed crop of the scene, then cards —
 * same reading order, main object always in frame, no letters on the photo.
 */
export function StepSection({
  id,
  titleId,
  dotId,
  badge,
  title,
  lead,
  cta,
  helper,
  trust,
  cards,
  cardsId,
  scene,
}: StepSectionProps) {
  const { ref, inView, reveal, settle } = useReveal()

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="relative w-full overflow-clip bg-surface-deep"
    >
      <SceneBackdrop scene={scene} settle={settle()} />

      <div className="relative z-10 mx-auto w-full max-w-[var(--container)] px-[var(--gutter)] py-16 sm:py-20 xl:py-20">
        {/* protected zone: copy column + cards share one left edge */}
        <div className="relative xl:max-w-[min(48rem,42vw)] xl:[--shield-feather:11rem] 2xl:[--shield-feather:14rem]">
          <TextShield strength={scene.shield ?? 0.84} feather="var(--shield-feather)" />

          <div ref={ref} className="relative z-10 flex flex-col items-start text-left">
            <div className="flex max-w-2xl flex-col items-start xl:max-w-[min(var(--text-col),36vw)]">
              <SectionBadge dotId={dotId} style={reveal({ delay: 0, y: 12, duration: 500 })}>
                {badge}
              </SectionBadge>

              <h2
                id={titleId}
                className="type-h2 heading-shadow mt-6"
                style={reveal({ delay: 120, y: 20, duration: 800 })}
              >
                {title}
              </h2>

              <p className="type-lead mt-6" style={reveal({ delay: 260, y: 16, duration: 600 })}>
                {lead}
              </p>

              <div className="mt-8 w-full sm:w-auto" style={reveal({ delay: 380, y: 14, duration: 500 })}>
                <Cta href={cta.href} external={cta.external} className="w-full sm:w-auto">
                  {cta.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Cta>
              </div>

              {helper && (
                <p className="type-small mt-4" style={reveal({ delay: 460, y: 12, duration: 600 })}>
                  {helper}
                </p>
              )}

              <p className="type-legal mt-3 tracking-wide" style={reveal({ delay: 540, y: 12, duration: 600 })}>
                {trust}
              </p>
            </div>

            <SceneFrame scene={scene} className="mt-10 w-full" />

            <CardGrid id={cardsId} items={cards} inView={inView} startDelay={620} className="mt-9 w-full xl:mt-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
