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
  { step: 1, label: "Conceptos básicos", icon: BookOpen, x: 22, y: 92 },
  { step: 2, label: "Stablecoins y riesgos", icon: Coins, x: 33, y: 76 },
  { step: 3, label: "P2P: qué revisar", icon: Users, x: 29, y: 59 },
  { step: 4, label: "Wallets y claves", icon: Wallet, x: 43, y: 45 },
  { step: 5, label: "Anti-estafas", icon: ShieldCheck, x: 55, y: 31 },
  { step: 6, label: "Criterio cripto", icon: Trophy, x: 61, y: 16 },
]

const routePath =
  "M22 92 C 30 86, 33 82, 33 76 C 33 68, 25 66, 29 59 C 32 53, 41 52, 43 45 C 45 39, 51 37, 55 31 C 59 26, 59 21, 61 16"

export function RoadmapVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden px-2 lg:max-w-none lg:overflow-visible lg:px-0"
      aria-label="Ruta de aprendizaje con seis etapas"
    >
      {/* ambient glows for depth */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/25 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-6 top-1/3 h-56 w-56 rounded-full bg-[oklch(0.4_0.07_150/0.28)] blur-[80px]"
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
            <stop offset="0%" stopColor="oklch(0.6 0.08 82)" stopOpacity="0.3" />
            <stop offset="45%" stopColor="oklch(0.84 0.12 84)" stopOpacity="1" />
            <stop offset="100%" stopColor="oklch(0.94 0.09 88)" />
          </linearGradient>
          <filter id="routeGlowXWide" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.6" />
          </filter>
          <filter id="routeGlowWide" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
          <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* widest soft aura */}
        <path
          d={routePath}
          fill="none"
          stroke="oklch(0.8 0.11 84)"
          strokeOpacity="0.28"
          strokeWidth="4.4"
          strokeLinecap="round"
          filter="url(#routeGlowXWide)"
        />
        {/* mid underglow */}
        <path
          d={routePath}
          fill="none"
          stroke="oklch(0.82 0.12 84)"
          strokeOpacity="0.5"
          strokeWidth="2.4"
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
          stroke="oklch(0.97 0.05 90)"
          strokeWidth="0.32"
          strokeLinecap="round"
          strokeDasharray="0.4 3"
          strokeOpacity="0.95"
        />
      </svg>

      {/* pulsing waypoint glows sitting under each node */}
      {checkpoints.map(({ step, x, y }) => (
        <span
          key={`glow-${step}`}
          className="route-dot pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/45 blur-md"
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-hidden="true"
        />
      ))}

      {/* large premium shield with laurel wreath + reflective podium */}
      <div className="absolute right-[3%] top-[0%] flex flex-col items-center">
        <div className="relative">
          {/* laurel wreath framing the shield */}
          <svg
            className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-[54%] text-primary/70 sm:h-64 sm:w-64"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
          >
            <g
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M60 168 C 24 140, 22 92, 46 54" />
              <path d="M140 168 C 176 140, 178 92, 154 54" />
            </g>
            <g fill="currentColor" opacity="0.85">
              <ellipse cx="41" cy="70" rx="4.5" ry="8" transform="rotate(-32 41 70)" />
              <ellipse cx="34" cy="92" rx="4.5" ry="8" transform="rotate(-20 34 92)" />
              <ellipse cx="32" cy="116" rx="4.5" ry="8" transform="rotate(-8 32 116)" />
              <ellipse cx="36" cy="140" rx="4.5" ry="8" transform="rotate(8 36 140)" />
              <ellipse cx="159" cy="70" rx="4.5" ry="8" transform="rotate(32 159 70)" />
              <ellipse cx="166" cy="92" rx="4.5" ry="8" transform="rotate(20 166 92)" />
              <ellipse cx="168" cy="116" rx="4.5" ry="8" transform="rotate(8 168 116)" />
              <ellipse cx="164" cy="140" rx="4.5" ry="8" transform="rotate(-8 164 140)" />
            </g>
          </svg>

          {/* outer bevel */}
          <div className="relative flex h-32 w-28 items-center justify-center rounded-[2rem] rounded-b-[2.6rem] border border-primary/50 bg-gradient-to-b from-[oklch(0.3_0.032_155)] via-card to-[oklch(0.12_0.016_158)] p-[3px] shadow-[0_0_80px_-8px_oklch(0.8_0.11_84/0.65),inset_0_1px_0_0_oklch(0.92_0.09_88/0.45)] sm:h-48 sm:w-44">
            {/* inner shield face */}
            <div className="flex h-full w-full items-center justify-center rounded-[1.9rem] rounded-b-[2.6rem] border border-primary/30 bg-gradient-to-b from-[oklch(0.25_0.03_156)] to-[oklch(0.15_0.02_158)]">
              <span className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-primary/50 bg-primary/10 shadow-[inset_0_0_22px_-4px_oklch(0.8_0.11_84/0.75)] sm:h-24 sm:w-24">
                <ShieldCheck
                  className="h-11 w-11 text-primary drop-shadow-[0_0_10px_oklch(0.8_0.11_84/0.8)] sm:h-13 sm:w-13"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
          {/* reflective podium base */}
          <div className="mx-auto mt-3 h-2.5 w-28 rounded-full bg-primary/35 blur-[3px] sm:w-32" aria-hidden="true" />
          <div className="mx-auto mt-1 h-1.5 w-20 rounded-full bg-primary/25 blur-[2px] sm:w-24" aria-hidden="true" />
          <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-primary/15 blur-[1px] sm:w-16" aria-hidden="true" />
        </div>
      </div>

      {/* checkpoints */}
      {checkpoints.map(({ step, label, icon: Icon, x, y }) => (
        <div
          key={step}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-gradient-to-b from-[oklch(0.26_0.03_156)] to-card text-primary shadow-[0_0_30px_-6px_oklch(0.8_0.11_84/1),inset_0_1px_0_0_oklch(0.9_0.09_88/0.4)]">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap rounded-xl border border-primary/25 bg-[oklch(0.16_0.02_158/0.82)] px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_30px_-12px_oklch(0_0_0/0.9)] backdrop-blur-md">
            <span className="font-semibold text-primary">{step}.</span> {label}
          </span>
        </div>
      ))}
    </div>
  )
}
