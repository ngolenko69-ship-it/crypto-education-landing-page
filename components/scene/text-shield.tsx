import type { CSSProperties } from "react"

type Props = {
  /** 0..1 density of the dark-emerald surface under the copy */
  strength?: number
  /** how far the protection reaches past the column's right edge before it is gone */
  feather?: string
  /** vertical overshoot above/below the column */
  padY?: string
}

/**
 * Local text protection: a dense dark-emerald layer under the whole copy
 * column, feathered on the right past the text's edge and on top/bottom.
 * It is a separate layer under the content (never opacity/blur on the text
 * container) and only exists on the full-bleed desktop layout.
 */
export function TextShield({ strength = 0.86, feather = "12rem", padY = "3.5rem" }: Props) {
  return (
    <div
      aria-hidden="true"
      className="text-shield hidden xl:block"
      style={
        {
          "--shield-strength": strength,
          "--shield-feather": feather,
          "--shield-pad-y": padY,
        } as CSSProperties
      }
    />
  )
}
