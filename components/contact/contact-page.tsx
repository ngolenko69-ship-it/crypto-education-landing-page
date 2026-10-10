import { ArrowUpRight, Compass, Mail, ShieldAlert, UserCheck, Users, type LucideIcon } from "lucide-react"
import { PageFrame } from "@/components/site/page-frame"
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  TELEGRAM_ADMIN_HANDLE,
  TELEGRAM_ADMIN_URL,
  TELEGRAM_COMMUNITY_URL,
} from "@/lib/contact"

/** One line inside a contact card, in the order it is shown. */
type CardLine = { kind: "value" | "url" | "text"; text: string }

type ContactItem = {
  icon: LucideIcon
  title: string
  lines: CardLine[]
  href: string
  /** true for links that leave the site and open in a new tab */
  external: boolean
}

const contactItems: ContactItem[] = [
  {
    icon: Mail,
    title: "Correo electrónico",
    href: CONTACT_EMAIL_HREF,
    external: false,
    lines: [
      { kind: "value", text: CONTACT_EMAIL },
      { kind: "text", text: "Para consultas generales, privacidad y propuestas de colaboración." },
    ],
  },
  {
    icon: UserCheck,
    title: "Administrador en Telegram",
    href: TELEGRAM_ADMIN_URL,
    external: true,
    lines: [
      { kind: "value", text: TELEGRAM_ADMIN_HANDLE },
      { kind: "url", text: TELEGRAM_ADMIN_URL },
      { kind: "text", text: "Para comunicaciones relacionadas con el proyecto." },
    ],
  },
  {
    icon: Users,
    title: "Comunidad educativa gratuita",
    href: TELEGRAM_COMMUNITY_URL,
    external: true,
    lines: [
      {
        kind: "text",
        text: "Únete a nuestra comunidad para aprender sobre criptomonedas, seguridad digital y prevención de fraudes.",
      },
      { kind: "url", text: TELEGRAM_COMMUNITY_URL },
    ],
  },
]

const sectionHeading =
  "font-serif text-[1.65rem] font-medium leading-tight tracking-[-0.01em] text-text-primary sm:text-[1.9rem]"

const iconChip =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold"

/**
 * One official contact point. The whole card is the link: a real <a>, so it works with
 * keyboard, touch and screen readers, and shows the global gold focus ring.
 * Layout: icon + arrow on top and the text below on phones and desktops (three columns);
 * a single horizontal row in between, where three columns would be too narrow.
 */
function ContactCard({ icon: Icon, title, lines, href, external }: ContactItem) {
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
          {lines.map((line) => (
            <span
              key={line.text}
              className={
                line.kind === "value"
                  ? "mt-1.5 block text-base font-semibold leading-snug text-gold-text [overflow-wrap:anywhere]"
                  : line.kind === "url"
                    ? "mt-1.5 block text-[13px] leading-snug text-text-tertiary [overflow-wrap:anywhere]"
                    : "mt-1.5 block text-[15px] leading-relaxed text-text-secondary"
              }
            >
              {line.text}
            </span>
          ))}
          {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
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
 * Contacto: institutional information, mission, the three official channels and a security
 * notice. Server component, no client JS: the only motion is the hover colour of the cards.
 * It is a contact page, not a legal notice — it states no company registration, address or
 * tax data.
 */
export function ContactPage() {
  return (
    <PageFrame current="/contacto">
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
            style={{ background: "radial-gradient(circle, rgba(230,197,116,0.12) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative">
            <h3 className="text-gold-phrase inline-block font-serif text-[1.5rem] font-medium leading-tight sm:text-[1.75rem]">
              Ruta Cripto Segura
            </h3>
            <p className="type-lead mt-4 max-w-[46rem]">
              Proyecto educativo independiente especializado en criptomonedas, seguridad digital,
              activos digitales y prevención de fraudes.
            </p>
            <p className="type-body mt-3 max-w-[46rem]">
              Nuestra plataforma está dirigida principalmente a personas de Argentina, Perú y otras
              comunidades de habla hispana.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Nuestra misión (+ aviso de no custodia) ---------- */}
      <section aria-labelledby="mision" className="mt-12 sm:mt-14">
        <h2 id="mision" className={sectionHeading}>
          Nuestra misión
        </h2>

        <div className="surface-card mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
          <span className={iconChip}>
            <Compass className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="type-body max-w-[46rem]">
            Promover la educación sobre criptoactivos mediante contenidos gratuitos, guías prácticas y
            recursos de aprendizaje que permitan comprender mejor los riesgos y las herramientas del
            ecosistema digital.
          </p>
        </div>

        <p
          role="note"
          className="mt-4 rounded-[18px] border border-gold/25 bg-surface-deep/70 px-5 py-4 text-[15px] leading-relaxed text-text-secondary sm:px-6"
        >
          Ruta Cripto Segura no ofrece servicios de custodia de activos ni garantiza resultados
          financieros. Sus contenidos tienen carácter educativo e informativo.
        </p>
      </section>

      {/* ---------- Nuestros canales oficiales ---------- */}
      <section aria-labelledby="canales" className="mt-12 sm:mt-14">
        <h2 id="canales" className={sectionHeading}>
          Nuestros canales oficiales
        </h2>

        <ul role="list" className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {contactItems.map((item) => (
            <ContactCard key={item.title} {...item} />
          ))}
        </ul>
      </section>

      {/* ---------- Aviso de seguridad ---------- */}
      <section aria-labelledby="seguridad" className="mt-12 sm:mt-14">
        <h2 id="seguridad" className={sectionHeading}>
          Aviso de seguridad
        </h2>

        <div className="surface-card mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-5 sm:p-7">
          <span className={iconChip}>
            <ShieldAlert className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="type-body max-w-[46rem] space-y-3">
            <p>Nunca compartas frases semilla, claves privadas, contraseñas ni códigos de verificación.</p>
            <p>
              No necesitas enviar dinero ni criptomonedas a supuestos administradores para acceder a los
              materiales educativos gratuitos.
            </p>
            <p>
              Si recibes mensajes sospechosos, verifica su procedencia mediante nuestros canales
              oficiales.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-12 text-center font-serif text-lg italic text-gold-text sm:mt-14 sm:text-xl">
        Ruta Cripto Segura — Aprende antes de arriesgar.
      </p>
    </PageFrame>
  )
}
