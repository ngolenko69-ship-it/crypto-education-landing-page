import type { CSSProperties } from "react"

type Props = {
  /** 0..1 density of the dark-emerald surface under the copy */
  strength?: number
  /** vertical overshoot above/below the column */
  padY?: string
}

/**
 * Local text protection: a dense dark-emerald layer under the whole copy
 * column, feathered on the right past the text's edge and on top/bottom.
 * It is a separate layer under the content (never opacity/blur on the text
 * container) and only exists on the full-bleed desktop layout. The length of
 * the feathered tail comes from the inherited --shield-feather variable, set
 * per breakpoint on the section (the scene layer reads the same variable).
 */
export function TextShield({ strength = 0.86, padY = "3.5rem" }: Props) {
  return (
    <div
      aria-hidden="true"
      className="text-shield hidden xl:block"
      style={{ "--shield-strength": strength, "--shield-pad-y": padY } as CSSProperties}
    />
  )
}
