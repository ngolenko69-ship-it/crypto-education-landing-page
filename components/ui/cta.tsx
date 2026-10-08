import { cn } from "@/lib/utils"

type Props = {
  href: string
  variant?: "primary" | "secondary"
  external?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

/**
 * The site's two call-to-action styles. Primary = gold with a dark label
 * (restrained glow); secondary = clear dark surface with a gold hairline.
 * Fixed height, 44px+ tap target, no geometry change on hover/active, and a
 * visible keyboard focus ring. Renders a real link.
 */
export function Cta({ href, variant = "primary", external = false, className, children, onClick }: Props) {
  const cls = cn("cta-base group/cta", variant === "primary" ? "cta-primary" : "cta-secondary", className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} className={cls} onClick={onClick}>
      {children}
    </a>
  )
}
