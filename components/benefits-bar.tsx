import { GraduationCap, Lightbulb, ShieldAlert } from "lucide-react"

const benefits = [
  { icon: GraduationCap, title: "Educación clara" },
  { icon: Lightbulb, title: "Criterio propio" },
  { icon: ShieldAlert, title: "Riesgos visibles" },
]

/** Trust strip under the hero copy: same card surface and icon family as the step cards. */
export function BenefitsBar() {
  return (
    <ul
      aria-label="Qué ofrece la ruta"
      className="surface-card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-3 sm:px-6 xl:gap-x-5 xl:px-4 2xl:gap-x-7 2xl:px-6"
    >
      {benefits.map(({ icon: Icon, title }) => (
        <li key={title} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap text-[14px] font-semibold leading-snug text-text-primary 2xl:text-[15px]">{title}</span>
        </li>
      ))}
    </ul>
  )
}
