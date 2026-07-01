import {
  BookOpen,
  Coins,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

type Checkpoint = {
  step: number
  label: string
  icon: LucideIcon
  /** position as percentage of the container */
  x: number
  y: number
}

const checkpoints: Checkpoint[] = [
  { step: 1, label: "Conceptos básicos", icon: BookOpen, x: 20, y: 90 },
  { step: 2, label: "Stablecoins y riesgos", icon: Coins, x: 32, y: 74 },
  { step: 3, label: "P2P: qué revisar", icon: Users, x: 28, y: 57 },
  { step: 4, label: "Wallets y claves", icon: Wallet, x: 42, y: 43 },
  { step: 5, label: "Anti-estafas", icon: ShieldCheck, x: 54, y: 30 },
  { step: 6, label: "Criterio cripto", icon: Trophy, x: 60, y: 15 },
]

export function RoadmapVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden px-2 lg:max-w-none lg:overflow-visible lg:px-0"
      aria-label="Ruta de aprendizaje con seis etapas"
    >
      {/* soft ambient glow behind the shield */}
      <div
        className="pointer-events-none absolute right-4 top-2 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      {/* the glowing route */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="routeGold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.7 0.09 82)" stopOpacity="0.35" />
            <stop offset="55%" stopColor="oklch(0.82 0.11 84)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.9 0.08 88)" />
          </linearGradient>
          <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M20 90 C 28 84, 32 80, 32 74 C 32 66, 24 64, 28 57 C 31 51, 40 50, 42 43 C 44 37, 50 35, 54 30 C 58 25, 58 20, 60 15"
          fill="none"
          stroke="url(#routeGold)"
          strokeWidth="0.9"
          strokeLinecap="round"
          filter="url(#routeGlow)"
        />
      </svg>

      {/* large premium shield */}
      <div className="absolute right-[6%] top-[2%] flex flex-col items-center">
        <div className="relative flex h-28 w-24 items-center justify-center rounded-[2.2rem] border border-primary/40 bg-gradient-to-b from-card to-background shadow-[0_0_40px_-8px_oklch(0.8_0.11_84/0.5)] sm:h-36 sm:w-32">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/50 bg-primary/10 sm:h-20 sm:w-20">
            <ShieldCheck
              className="h-9 w-9 text-primary sm:h-11 sm:w-11"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* checkpoints */}
      {checkpoints.map(({ step, label, icon: Icon }, i) => {
        const { x, y } = checkpoints[i]
        return (
          <div
            key={step}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-card text-primary shadow-[0_0_22px_-6px_oklch(0.8_0.11_84/0.9)]">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap rounded-xl border border-primary/25 bg-card/80 px-3.5 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
              <span className="text-primary">{step}.</span> {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
