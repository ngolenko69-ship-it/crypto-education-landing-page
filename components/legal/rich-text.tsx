import Link from "next/link"
import type { ReactNode } from "react"
import { PENDING_MARKER } from "@/lib/legal/config"

// [label](href) links, or the literal "data pending" marker.
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\[DATOS REALES PENDIENTES DE CONFIRMACIÓN\]/g

const linkClass =
  "font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors duration-200 hover:text-gold hover:decoration-gold [overflow-wrap:anywhere]"

function InlineLink({ label, href }: { label: string; href: string }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass}>
        {label}
      </Link>
    )
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={linkClass}>
        {label}
      </a>
    )
  }
  // Anything else leaves the site: new tab, never hand the opener over.
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {label}
    </a>
  )
}

/** Renders text with inline links and the visible "pending data" chip. */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    if (match[1] && match[2]) {
      nodes.push(<InlineLink key={key++} label={match[1]} href={match[2]} />)
    } else {
      nodes.push(
        <span
          key={key++}
          className="rounded-md border border-dashed border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[0.92em] font-semibold text-gold-text"
        >
          {PENDING_MARKER}
        </span>,
      )
    }
    last = start + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
