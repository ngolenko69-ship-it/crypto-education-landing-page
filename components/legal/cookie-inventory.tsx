import { COOKIE_INVENTORY, INVENTORY_LABELS } from "@/lib/legal/cookie-inventory"

const ORDER = ["provider", "purpose", "category", "duration", "consent"] as const

/** One card per technology: readable on a phone and on a desktop without a cramped table. */
export function CookieInventory() {
  return (
    <ul role="list" className="space-y-3">
      {COOKIE_INVENTORY.map((item) => (
        <li key={item.name} className="surface-card p-5 sm:p-6">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
            <dt className="text-sm font-semibold text-text-primary">{INVENTORY_LABELS.name}:</dt>
            <dd className="font-mono text-[0.95rem] font-semibold text-gold-text [overflow-wrap:anywhere]">
              {item.name}
            </dd>
            {ORDER.map((key) => (
              <div key={key} className="contents">
                <dt className="text-sm font-semibold text-text-primary">{INVENTORY_LABELS[key]}:</dt>
                <dd className="text-[15px] leading-relaxed text-text-secondary">{item[key]}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  )
}
