import { CookieSettingsButton } from "@/components/consent/cookie-settings-button"
import type { LegalBlock, LegalSection } from "@/lib/legal/types"
import { CookieInventory } from "./cookie-inventory"
import { RichText } from "./rich-text"

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="type-body">
          <RichText text={block.text} />
        </p>
      )
    case "h3":
      return <h3 className="pt-2 text-[1.05rem] font-semibold text-gold-text">{block.text}</h3>
    case "ul":
      return (
        <ul role="list" className="space-y-2">
          {block.items.map((item) => (
            <li
              key={item}
              className="type-body relative pl-6 before:absolute before:left-1 before:top-[0.68em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold-text"
            >
              <RichText text={item} />
            </li>
          ))}
        </ul>
      )
    case "facts":
      return (
        <dl className="surface-card space-y-3 p-5 sm:p-6">
          {block.rows.map(([label, value]) => (
            <div key={label} className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
              <dt className="text-[15px] font-semibold leading-relaxed text-text-primary">{label}:</dt>
              <dd className="text-[15px] leading-relaxed text-text-secondary">
                <RichText text={value} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case "cookie-inventory":
      return <CookieInventory />
    case "cookie-settings":
      return (
        <div>
          <CookieSettingsButton variant="panel" />
        </div>
      )
  }
}

/** Numbered sections separated by thin gold rules; every section is deep-linkable by id. */
export function LegalDocumentView({ sections }: { sections: LegalSection[] }) {
  return (
    <div>
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-titulo`}
          className={`scroll-mt-6 ${
            index === 0 ? "" : "mt-10 border-t border-[var(--line-gold)] pt-8 sm:mt-12 sm:pt-10"
          }`}
        >
          <h2
            id={`${section.id}-titulo`}
            className="font-serif text-[1.35rem] font-medium leading-snug tracking-[-0.005em] text-text-primary sm:text-[1.55rem]"
          >
            {section.title}
          </h2>
          <div className="mt-4 space-y-4">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
