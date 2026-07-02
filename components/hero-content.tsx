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
      <h1 className="font-serif text-[3rem] font-medium leading-[0.96] tracking-[-0.015em] text-balance sm:text-6xl lg:text-[5.5rem]">
        <span className="block text-[oklch(0.97_0.015_88)] drop-shadow-[0_1px_18px_oklch(0_0_0/0.55)]">
          Antes de mover
        </span>
        <span className="block text-[oklch(0.97_0.015_88)] drop-shadow-[0_1px_18px_oklch(0_0_0/0.55)]">
          tu dinero,
        </span>
        <span className="block bg-gradient-to-b from-[oklch(0.9_0.1_88)] to-[oklch(0.72_0.13_82)] bg-clip-text pb-2 leading-[1.05] text-transparent drop-shadow-[0_2px_26px_oklch(0.8_0.11_84/0.32)]">
          aprende a protegerlo.
        </span>
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
