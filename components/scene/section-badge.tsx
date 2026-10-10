import type { CSSProperties } from "react"

type Props = {
  /** id of the gold dot — the golden route's arrival anchor */
  dotId: string
  children: React.ReactNode
  style?: CSSProperties
}

export function SectionBadge({ dotId, children, style }: Props) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-surface/85 px-3.5 py-1.5"
      style={style}
    >
      <span
        id={dotId}
        className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(230,197,116,0.8)]"
      />
      <span className="type-eyebrow">{children}</span>
    </span>
  )
}
