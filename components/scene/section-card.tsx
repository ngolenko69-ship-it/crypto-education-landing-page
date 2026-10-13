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

/** One opaque dark-emerald info card: same surface, radius, padding and icon family everywhere. */
export function SectionCard({ icon: Icon, title, description, inView, delay }: CardProps) {
  return (
    <li
      className="surface-card flex items-start gap-3.5 p-5 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{title}</h3>
        <p className="mt-1 text-sm leading-snug text-text-secondary">{description}</p>
      </div>
    </li>
  )
}

type GridProps = {
  items: CardItem[]
  inView: boolean
  /** ms before the first card appears */
  startDelay?: number
  columns?: 2 | 3
  className?: string
  id?: string
}

export function CardGrid({ items, inView, startDelay = 560, columns = 3, className = "", id }: GridProps) {
  const cols = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
  return (
    <ul id={id} className={`grid grid-cols-1 gap-4 ${cols} ${className}`}>
      {items.map((item, i) => (
        <SectionCard key={item.title} {...item} inView={inView} delay={startDelay + i * 100} />
      ))}
    </ul>
  )
}
