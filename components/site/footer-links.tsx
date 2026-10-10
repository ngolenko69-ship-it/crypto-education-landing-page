import Link from "next/link"
import { LEGAL_LINKS } from "@/lib/legal/links"

/** Shared look of every footer link (and of the "cookie preferences" button next to them). */
export const FOOTER_LINK_CLASS =
  "group relative inline-flex min-h-11 cursor-pointer items-center text-[15px] font-medium tracking-wide text-text-primary transition-colors duration-200 hover:text-gold-text"

export function FooterLinkUnderline() {
  return (
    <span
      className="absolute bottom-2 left-0 h-px w-0 bg-gold-text transition-all duration-300 group-hover:w-full"
      aria-hidden="true"
    />
  )
}

/** The five legal documents, in the same order on every page. `current` marks the open one. */
export function FooterLinks({ current }: { current?: string }) {
  return (
    <>
      {LEGAL_LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          aria-current={current === href ? "page" : undefined}
          className={`${FOOTER_LINK_CLASS} ${current === href ? "text-gold-text" : ""}`}
        >
          {label}
          <FooterLinkUnderline />
        </Link>
      ))}
    </>
  )
}
