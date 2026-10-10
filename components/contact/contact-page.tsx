import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  Mail,
  ShieldAlert,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  TELEGRAM_ADMIN_HANDLE,
  TELEGRAM_ADMIN_URL,
  TELEGRAM_COMMUNITY_URL,
} from "@/lib/contact"

type ContactItem = {
  icon: LucideIcon
  title: string
  /** the line that names where the link goes (an address, a handle, a short invitation) */
  value: string
  href: string
  /** true for links that leave the site and open in a new tab */
  external: boolean
  /** identifiers (address, handle) read as gold links; the invitation reads as plain text */
  identifier: boolean
}

const contactItems: ContactItem[] = [
  {
    icon: Mail,
    title: "Correo electrónico",
    value: CONTACT_EMAIL,
    href: CONTACT_EMAIL_HREF,
    external: false,
    identifier: true,
  },
  {
    icon: UserCheck,
    title: "Administrador en Telegram",
    value: TELEGRAM_ADMIN_HANDLE,
    href: TELEGRAM_ADMIN_URL,
    external: true,
    identifier: true,
  },
  {
    icon: Users,
    title: "Comunidad educativa gratuita",
    value: "Únete a nuestra comunidad para seguir aprendiendo.",
    href: TELEGRAM_COMMUNITY_URL,
    external: true,
    identifier: false,
  },
]

const sectionHeading =
  "font-serif text-[1.65rem] font-medium leading-tight tracking-[-0.01em] text-text-primary sm:text-[1.9rem]"

const iconChip =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold"

/**
 * One official contact point. The whole card is the link: a real <a>, so it works
 * with keyboard, touch and screen readers, and it shows the global gold focus ring.
 * Layout: icon + arrow on top and text below on phones and desktops (three columns);
 * a single horizontal row in between, where three columns would be too narrow for
 * the address.
 */
function ContactCard({ icon: Icon, title, value, href, external, identifier }: ContactItem) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="surface-card group grid h-full grid-cols-[auto_1fr_auto] content-start items-start gap-x-4 gap-y-4 p-5 sm:content-center sm:items-center sm:gap-y-0 sm:p-6 lg:content-start lg:items-start lg:gap-y-5"
      >
        <span className={`${iconChip} col-start-1 row-start-1`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <span className="col-span-3 col-start-1 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1 lg:col-span-3 lg:col-start-1 lg:row-start-2">
          <h3 className="text-[15px] font-semibold leading-snug text-text-primary">{title}</h3>
          <span
            className={
              identifier
                ? "mt-1.5 block text-base font-semibold leading-snug text-gold-text [overflow-wrap:anywhere]"
                : "mt-1.5 block text-[15px] leading-relaxed text-text-secondary"
            }
          >
            {value}
            {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
          </span>
        </span>

        <ArrowUpRight
          className="col-start-3 row-start-1 h-5 w-5 justify-self-end text-gold/70 transition-colors duration-200 group-hover:text-gold"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </a>
    </li>
  )
}

/**
 * Contacto: institutional information, the three official contact points, the
 * mission and the closing notice. Server component, no client JS: the only
 * motion is the hover color of the cards. It is a contact page, not a legal
 * notice — it states no company registration, address or tax data.
 */
export function ContactPage() {
  return (
    <div className="bg-cinematic relative min-h-screen overflow-x-clip">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-[var(--gutter)]">
        <header className="flex items-center justify-between gap-4 py-5 sm:py-6">
          <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90">
            <img
              src="/images/ruta-logo.png"
              alt="RUTA Cripto Segura"
              width={108}
              height={36}
              className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(230,197,116,0.25)]"
            />
          </Link>

          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2 text-[13px] font-medium tracking-wide text-text-secondary transition-colors duration-200 hover:text-gold-text"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Volver al inicio
          </Link>
        </header>

        <main className="flex-1 pb-20 pt-8 sm:pt-12 lg:pb-28">
          <h1 className="type-h2">Contacto</h1>
          <span
            className="mt-5 block h-0.5 w-14 rounded-full bg-gradient-to-r from-gold-text to-transparent"
            aria-hidden="true"
          />

          {/* ---------- Información institucional ---------- */}
          <section aria-labelledby="institucional" className="mt-10 sm:mt-14">
            <h2 id="institucional" className={sectionHeading}>
              Información institucional
            </h2>

            <div className="surface-card relative mt-5 overflow-hidden p-6 sm:p-8">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(230,197,116,0.12) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <h3 className="text-gold-phrase inline-block font-serif text-[1.5rem] font-medium leading-tight sm:text-[1.75rem]">
                  Ruta Cripto Segura
                </h3>
                <p className="type-lead mt-4 max-w-[46rem]">
                  Proyecto educativo independiente especializado en criptomonedas,
                  seguridad digital, activos digitales y prevención de fraudes.
                </p>
                <p className="type-body mt-3 max-w-[46rem]">
                  Nuestra plataforma está dirigida principalmente a personas de
                  Argentina, Perú y otras comunidades de habla hispana.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Contacto oficial ---------- */}
          <section aria-labelledby="contacto-oficial" className="mt-12 sm:mt-14">
            <h2 id="contacto-oficial" className={sectionHeading}>
              Contacto oficial
            </h2>

            <ul role="list" className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {contactItems.map((item) => (
                <ContactCard key={item.title} {...item} />
              ))}
            </ul>
          </section>

          {/* ---------- Nuestra misión ---------- */}
          <section aria-labelledby="mision" className="mt-12 sm:mt-14">
            <h2 id="mision" className={sectionHeading}>
              Nuestra misión
            </h2>

            <div className="surface-card mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
              <span className={iconChip}>
                <Compass className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="type-body max-w-[46rem]">
                Promover la educación sobre criptoactivos mediante contenidos
                gratuitos, guías prácticas y recursos de aprendizaje que permitan
                comprender mejor los riesgos y las herramientas del ecosistema
                digital.
              </p>
            </div>
          </section>

          {/* ---------- Aviso ---------- */}
          <div
            role="note"
            className="mt-12 flex flex-col gap-4 rounded-[18px] border border-gold/25 bg-surface-deep/70 p-5 sm:mt-14 sm:flex-row sm:items-start sm:gap-5 sm:p-6"
          >
            <span className={iconChip}>
              <ShieldAlert className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="max-w-[46rem] text-[15px] leading-relaxed text-text-secondary">
              Ruta Cripto Segura no ofrece servicios de custodia de activos ni
              garantiza resultados financieros. Sus contenidos tienen carácter
              educativo e informativo.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
