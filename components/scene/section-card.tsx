import type { LucideIcon } from "lucide-react"

export type CardItem = {
  icon: LucideIcon
  title: string
  description: string
}

type CardProps = CardItem & {
  inView: boolean
  delay: number
}

/**
 * One info card: same icon family, title and text everywhere. From 1280px it is its own opaque
 * dark-emerald surface (`surface-card`: radius, padding, border). Below 1280px it is one row of
 * its group's single compact container (`.card-group` in globals.css, which switches the card's
 * own surface off): icon left, title and text right, split from the next row by a hairline.
 * Mobile sizes are the plain utilities, the `xl:` ones restore the desktop card exactly.
 */
export function SectionCard({ icon: Icon, title, description, inView, delay }: CardProps) {
  return (
    <li
      className="card-row surface-card flex items-start gap-3 px-3.5 py-2.5 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none xl:gap-3.5 xl:p-5"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] border border-gold/35 bg-gold/10 text-gold xl:mt-0.5 xl:h-10 xl:w-10 xl:rounded-xl">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{title}</h3>
        <p className="mt-0.5 text-sm leading-snug text-text-secondary xl:mt-1">{description}</p>
      </div>
    </li>
  )
}

type GridProps = {
  items: CardItem[]
  inView: boolean
  /** ms before the first card appears */
  startDelay?: number
  /** columns of the desktop grid (from 1280px); below that the group is one column of rows */
  columns?: 2 | 3
  className?: string
  id?: string
}

/**
 * A group of info cards. Below 1280px: one compact container, one row per card. From 1280px: the
 * original grid of separate cards. Every learning step and both four-card groups (Sobre nosotros,
 * Confianza y transparencia) use this component, so the layout lives here and nowhere else.
 */
export function CardGrid({ items, inView, startDelay = 560, columns = 3, className = "", id }: GridProps) {
  const cols = columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2"
  return (
    <ul id={id} data-in-view={inView} className={`card-group grid grid-cols-1 xl:gap-4 ${cols} ${className}`}>
      {items.map((item, i) => (
        <SectionCard key={item.title} {...item} inView={inView} delay={startDelay + i * 100} />
      ))}
    </ul>
  )
}
