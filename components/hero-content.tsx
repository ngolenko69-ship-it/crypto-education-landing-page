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
      <h1 className="font-serif text-[2.75rem] font-medium leading-[1.02] tracking-[-0.015em] text-balance sm:text-6xl lg:text-[4.25rem] lg:leading-[1]">
        <span className="block whitespace-nowrap text-[oklch(0.97_0.015_88)] drop-shadow-[0_1px_18px_oklch(0_0_0/0.55)]">
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
        antes de entrar en crypto. Evita errores costosos y reconoce fraudes
        antes de confiar en una plataforma, grupo o promesa.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button
          size="lg"
          className="h-14 rounded-full bg-gradient-to-b from-[oklch(0.85_0.11_86)] to-[oklch(0.72_0.13_82)] px-9 text-[15px] font-semibold text-primary-foreground shadow-[0_8px_30px_-6px_oklch(0.8_0.11_84/0.55)] transition-all duration-200 hover:from-[oklch(0.88_0.11_86)] hover:to-[oklch(0.75_0.13_82)] hover:shadow-[0_10px_38px_-6px_oklch(0.8_0.11_84/0.65)]"
        >
          Empezar la ruta
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 rounded-full border-primary/45 bg-card/40 px-8 text-[15px] font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:border-primary/70 hover:bg-card/60 hover:text-foreground"
        >
          <ShieldCheck className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          Protegerme de estafas
        </Button>
      </div>

      <ul className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        {trustItems.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
            <span className="text-[15px] font-medium text-foreground/80">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
