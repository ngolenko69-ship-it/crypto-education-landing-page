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
  { step: 1, label: "Conceptos básicos", icon: BookOpen, x: 22, y: 91 },
  { step: 2, label: "Stablecoins y riesgos", icon: Coins, x: 33, y: 75 },
  { step: 3, label: "P2P: qué revisar", icon: Users, x: 29, y: 58 },
  { step: 4, label: "Wallets y claves", icon: Wallet, x: 43, y: 44 },
  { step: 5, label: "Anti-estafas", icon: ShieldCheck, x: 55, y: 30 },
  { step: 6, label: "Criterio cripto", icon: Trophy, x: 61, y: 15 },
]

const routePath =
  "M22 91 C 30 85, 33 81, 33 75 C 33 67, 25 65, 29 58 C 32 52, 41 51, 43 44 C 45 38, 51 36, 55 30 C 59 25, 59 20, 61 15"

export function RoadmapVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden px-2 lg:max-w-none lg:overflow-visible lg:px-0"
      aria-label="Ruta de aprendizaje con seis etapas"
    >
      {/* ambient glows for depth */}
      <div
        className="pointer-events-none absolute right-2 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-8 top-1/3 h-52 w-52 rounded-full bg-[oklch(0.4_0.07_150/0.25)] blur-3xl"
        aria-hidden="true"
      />

      {/* the glowing route with pulsing waypoints */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="routeGold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.62 0.08 82)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="oklch(0.84 0.12 84)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.92 0.09 88)" />
          </linearGradient>
          <filter id="routeGlowWide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
          <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* soft wide underglow */}
        <path
          d={routePath}
          fill="none"
          stroke="oklch(0.8 0.11 84)"
          strokeOpacity="0.35"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#routeGlowWide)"
        />
        {/* crisp gold core */}
        <path
          d={routePath}
          fill="none"
          stroke="url(#routeGold)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#routeGlow)"
        />
        {/* dashed light trail on top */}
        <path
          d={routePath}
          fill="none"
          stroke="oklch(0.96 0.05 90)"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeDasharray="0.4 3"
          strokeOpacity="0.9"
        />
      </svg>

      {/* pulsing waypoint glows sitting under each node */}
      {checkpoints.map(({ step, x, y }) => (
        <span
          key={`glow-${step}`}
          className="route-dot pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-md"
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-hidden="true"
        />
      ))}

      {/* large premium shield with podium + laurel trophy */}
      <div className="absolute right-[4%] top-[1%] flex flex-col items-center">
        <div className="relative">
          {/* laurel-style flourish above shield */}
          <Trophy
            className="absolute -top-6 left-1/2 h-6 w-6 -translate-x-1/2 text-primary/80"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {/* outer bevel */}
          <div className="relative flex h-32 w-28 items-center justify-center rounded-[2rem] rounded-b-[2.6rem] border border-primary/50 bg-gradient-to-b from-[oklch(0.28_0.03_155)] via-card to-[oklch(0.14_0.018_158)] p-[3px] shadow-[0_0_60px_-10px_oklch(0.8_0.11_84/0.6),inset_0_1px_0_0_oklch(0.9_0.09_88/0.4)] sm:h-40 sm:w-36">
            {/* inner shield face */}
            <div className="flex h-full w-full items-center justify-center rounded-[1.7rem] rounded-b-[2.3rem] border border-primary/30 bg-gradient-to-b from-[oklch(0.24_0.028_156)] to-[oklch(0.16_0.02_158)]">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/50 bg-primary/10 shadow-[inset_0_0_18px_-4px_oklch(0.8_0.11_84/0.7)] sm:h-20 sm:w-20">
                <ShieldCheck
                  className="h-9 w-9 text-primary drop-shadow-[0_0_8px_oklch(0.8_0.11_84/0.7)] sm:h-11 sm:w-11"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
          {/* podium base */}
          <div className="mx-auto mt-2 h-2 w-24 rounded-full bg-primary/30 blur-[2px] sm:w-28" aria-hidden="true" />
          <div className="mx-auto mt-1 h-1 w-16 rounded-full bg-primary/20 blur-[1px] sm:w-20" aria-hidden="true" />
        </div>
      </div>

      {/* checkpoints */}
      {checkpoints.map(({ step, label, icon: Icon, x, y }) => (
        <div
          key={step}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-gradient-to-b from-[oklch(0.26_0.03_156)] to-card text-primary shadow-[0_0_26px_-6px_oklch(0.8_0.11_84/1),inset_0_1px_0_0_oklch(0.9_0.09_88/0.35)]">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap rounded-xl border border-primary/30 bg-card/85 px-4 py-2 text-sm font-medium text-foreground shadow-[0_8px_24px_-10px_oklch(0_0_0/0.8)] backdrop-blur-md">
            <span className="font-semibold text-primary">{step}.</span> {label}
          </span>
        </div>
      ))}
    </div>
  )
}
