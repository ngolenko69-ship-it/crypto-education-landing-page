import { GraduationCap, Lightbulb, ShieldAlert } from "lucide-react"

const benefits = [
  { icon: GraduationCap, title: "Educación clara" },
  { icon: Lightbulb, title: "Criterio propio" },
  { icon: ShieldAlert, title: "Riesgos visibles" },
]

export function BenefitsBar() {
  return (
    <ul className="grid grid-cols-1 gap-4 rounded-2xl border border-primary/15 bg-card/40 px-6 py-5 backdrop-blur-sm sm:grid-cols-3 sm:gap-6">
      {benefits.map(({ icon: Icon, title }) => (
        <li key={title} className="flex items-center justify-center gap-3 sm:justify-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </li>
      ))}
    </ul>
  )
}
