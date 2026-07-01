import { GraduationCap, Lightbulb, ShieldAlert } from "lucide-react"

const benefits = [
  {
    icon: GraduationCap,
    title: "Educación clara y práctica",
    description: "Explicaciones sencillas, sin jerga y con ejemplos reales.",
  },
  {
    icon: Lightbulb,
    title: "Decisiones informadas",
    description: "Entiende cada paso antes de confiar en una plataforma.",
  },
  {
    icon: ShieldAlert,
    title: "Reconocer riesgos reales",
    description: "Identifica señales de fraude y protege tu dinero.",
  },
]

export function BenefitsBar() {
  return (
    <ul className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-sm sm:grid-cols-3 sm:gap-6 sm:p-6">
      {benefits.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
