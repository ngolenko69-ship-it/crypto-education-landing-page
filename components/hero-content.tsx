import { ArrowRight, BellOff, LineChart, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const trustItems = [
  { icon: BellOff, label: "Sin señales." },
  { icon: LineChart, label: "Sin promesas de ganancias." },
  { icon: Lock, label: "Sin presión para comprar." },
]

export function HeroContent() {
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
        <span className="block text-foreground">Antes de mover</span>
        <span className="block text-foreground">tu dinero,</span>
        <span className="block text-gold">aprende a protegerlo.</span>
      </h1>

      <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
        Aprende stablecoins, P2P, wallets, plataformas cripto y anti-estafas
        antes de entrar en crypto. Te ayudamos a evitar errores que pueden
        costarte dinero y a reconocer fraudes antes de confiar en una
        plataforma, grupo o promesa.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="h-13 rounded-xl bg-primary px-7 text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Empezar la ruta
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-13 rounded-xl border-primary/40 bg-transparent px-7 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Aprender a protegerme de estafas
        </Button>
      </div>

      <ul className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7">
        {trustItems.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
