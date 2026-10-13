import { CookieSettingsButton } from "@/components/consent/cookie-settings-button"
import { FooterLinks } from "./footer-links"
import { FooterNotice } from "./footer-notice"

/** Footer of the legal and contact pages: same links and closing lines as the home page. */
export function PageFooter({ current }: { current?: string }) {
  return (
    <footer className="border-t border-[var(--line-gold)] pb-10 pt-6">
      <nav aria-label="Enlaces legales" className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <FooterLinks current={current} />
        <CookieSettingsButton variant="footer" />
      </nav>
      <FooterNotice className="mt-5" />
    </footer>
  )
}
