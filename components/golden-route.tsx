"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Golden Route Comet — the site-wide motion motif tying every learning step
 * into one continuous path. A single full-document SVG overlay measures the
 * real anchor points already present in the page (the artwork's own
 * checkpoint in the hero, and the small gold dot inside every section's
 * "Paso N · Label" badge) and draws one large, calm arc between each pair.
 *
 * As the user scrolls, a small concentrated point of light — never a comet
 * icon, never a rocket — eases along that arc with inertia (it chases a
 * scroll-derived target, it never jumps 1:1 with the wheel), leaving a short
 * fading trail. The route itself stays almost invisible except for a bright
 * window immediately around the light. On arrival it merges into the next
 * section's real badge dot with one soft pulse — no explosion, no shockwave.
 *
 * Geometry is computed once on mount/resize from real DOM rects (not
 * hardcoded per breakpoint), so the path is naturally more vertical on
 * mobile, where the left/right composition collapses into one column.
 */

type ExitSpec =
  | { type: "point"; ids: string[] }
  | { type: "section"; id: string }

interface TransitionSpec {
  exit: ExitSpec
  arrivalDotId: string
  arrivalSectionId: string
}

const TRANSITIONS: TransitionSpec[] = [
  { exit: { type: "point", ids: ["route-exit-hero", "route-exit-hero-mobile"] }, arrivalDotId: "route-dot-primeros-pasos", arrivalSectionId: "primeros-pasos" },
  { exit: { type: "section", id: "primeros-pasos" }, arrivalDotId: "route-dot-dolares-digitales", arrivalSectionId: "dolares-digitales" },
  { exit: { type: "section", id: "dolares-digitales" }, arrivalDotId: "route-dot-p2p", arrivalSectionId: "p2p-seguro" },
  { exit: { type: "section", id: "p2p-seguro" }, arrivalDotId: "route-dot-wallets", arrivalSectionId: "wallets" },
  { exit: { type: "section", id: "wallets" }, arrivalDotId: "route-dot-anti-estafas", arrivalSectionId: "anti-estafas" },
  { exit: { type: "section", id: "anti-estafas" }, arrivalDotId: "route-dot-comunidad", arrivalSectionId: "comunidad" },
  { exit: { type: "section", id: "comunidad" }, arrivalDotId: "route-dot-sobre-nosotros", arrivalSectionId: "sobre-nosotros" },
  { exit: { type: "section", id: "sobre-nosotros" }, arrivalDotId: "route-dot-legal", arrivalSectionId: "legal" },
]

// Trailing offsets behind the comet's head, in pixels along the path —
// tighter and denser near the head, per the "80-180px tail" spec.
const TAIL_OFFSETS_DESKTOP = [8, 20, 38, 62, 92, 130]
const TAIL_OFFSETS_MOBILE = [6, 14, 26, 42, 62]

/** Smootherstep — slow in, fast through the middle, slow out. */
function travelEase(t: number) {
  const c = Math.min(1, Math.max(0, t))
  return c * c * c * (c * (c * 6 - 15) + 10)
}

export function GoldenRoute() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [docSize, setDocSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobile = () => window.matchMedia("(max-width: 1023px)").matches
    const clampPct = (n: number) => Math.min(100, Math.max(0, n))

    const scrollY = () => window.scrollY || document.documentElement.scrollTop

    const isVisible = (el: Element | null): el is HTMLElement =>
      !!el && (el as HTMLElement).offsetParent !== null

    const centerOf = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 + scrollY() }
    }

    const sectionExitPoint = (id: string) => {
      const el = document.getElementById(id)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width * 0.82, y: r.bottom - r.height * 0.05 + scrollY() }
    }

    const pointAnchor = (ids: string[]) => {
      for (const id of ids) {
        const el = document.getElementById(id)
        if (isVisible(el)) return centerOf(el)
      }
      return null
    }

    const exitAnchorFor = (spec: ExitSpec) => () =>
      spec.type === "point" ? pointAnchor(spec.ids) : sectionExitPoint(spec.id)

    const arrivalAnchorFor = (dotId: string) => () => {
      const el = document.getElementById(dotId)
      return el ? centerOf(el) : null
    }

    // Build the 8 <path>/<circle> groups once.
    const groups = TRANSITIONS.map((spec) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g")

      const guide = document.createElementNS("http://www.w3.org/2000/svg", "path")
      guide.setAttribute("fill", "none")
      guide.setAttribute("stroke", "oklch(0.8 0.11 84 / 0.09)")
      guide.setAttribute("stroke-width", "1.5")
      guide.setAttribute("stroke-linecap", "round")

      const windowPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
      windowPath.setAttribute("fill", "none")
      windowPath.setAttribute("stroke", "oklch(0.82 0.12 84 / 0.6)")
      windowPath.setAttribute("stroke-width", "2")
      windowPath.setAttribute("stroke-linecap", "round")
      windowPath.style.filter = "drop-shadow(0 0 5px oklch(0.8 0.11 84 / 0.5))"

      const cometHalo = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      cometHalo.setAttribute("r", "0")
      cometHalo.setAttribute("fill", "oklch(0.7 0.1 130 / 0.35)")
      cometHalo.style.filter = "blur(9px)"

      const cometGlow = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      cometGlow.setAttribute("r", "0")
      cometGlow.setAttribute("fill", "oklch(0.88 0.1 86 / 0.75)")
      cometGlow.style.filter = "blur(3px)"

      const cometCore = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      cometCore.setAttribute("r", "0")
      cometCore.setAttribute("fill", "oklch(0.98 0.05 92)")

      const tailEls = (isMobile() ? TAIL_OFFSETS_MOBILE : TAIL_OFFSETS_DESKTOP).map(() => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        c.setAttribute("r", "0")
        c.setAttribute("fill", "oklch(0.82 0.1 88)")
        g.appendChild(c)
        return c
      })

      g.appendChild(guide)
      g.appendChild(windowPath)
      g.appendChild(cometHalo)
      g.appendChild(cometGlow)
      g.appendChild(cometCore)
      svg.appendChild(g)

      return {
        spec,
        guide,
        windowPath,
        cometHalo,
        cometGlow,
        cometCore,
        tailEls,
        arrivalDot: null as HTMLElement | null,
        arrivalSection: null as HTMLElement | null,
        exitSection: (spec.exit.type === "section" ? document.getElementById(spec.exit.id) : null) as HTMLElement | null,
        arrivalOriginPct: { x: 50, y: 0 },
        exitOriginPct: { x: 82, y: 100 },
        exitAnchor: exitAnchorFor(spec.exit),
        arrivalAnchor: arrivalAnchorFor(spec.arrivalDotId),
        total: 0,
        target: 0,
        current: 0,
        pulsed: false,
      }
    })

    const buildCurve = (
      e: { x: number; y: number },
      a: { x: number; y: number },
    ) => {
      const dx = a.x - e.x
      const dy = a.y - e.y
      const c1 = { x: e.x + dx * 0.16, y: e.y + dy * 0.55 }
      const c2 = { x: e.x + dx * 0.86, y: e.y + dy * 0.4 }
      return `M ${e.x} ${e.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${a.x} ${a.y}`
    }

    const recompute = () => {
      const h = document.documentElement.scrollHeight
      const w = document.documentElement.clientWidth
      setDocSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))

      for (const gr of groups) {
        const e = gr.exitAnchor()
        const a = gr.arrivalAnchor()
        if (!e || !a) continue
        const d = buildCurve(e, a)
        gr.guide.setAttribute("d", d)
        gr.windowPath.setAttribute("d", d)
        gr.total = gr.guide.getTotalLength()
        gr.arrivalDot = document.getElementById(gr.spec.arrivalDotId)
        gr.arrivalSection = document.getElementById(gr.spec.arrivalSectionId)

        // where the arrival point sits inside its own section, so the
        // "camera settling" zoom can be anchored at the exact spot the
        // comet lands rather than a generic corner
        if (gr.arrivalSection) {
          const sr = gr.arrivalSection.getBoundingClientRect()
          if (sr.width && sr.height) {
            gr.arrivalOriginPct = {
              x: clampPct(((a.x - sr.left) / sr.width) * 100),
              y: clampPct(((a.y - scrollY() - sr.top) / sr.height) * 100),
            }
          }
        }
        if (gr.exitSection) {
          const sr = gr.exitSection.getBoundingClientRect()
          if (sr.width && sr.height) {
            gr.exitOriginPct = {
              x: clampPct(((e.x - sr.left) / sr.width) * 100),
              y: clampPct(((e.y - scrollY() - sr.top) / sr.height) * 100),
            }
          }
        }
      }
    }

    recompute()
    // Re-measure shortly after mount too: web fonts / the priority hero
    // image can still reflow the layout a beat after first paint.
    const settleTimers = [100, 500, 1500].map((t) => window.setTimeout(recompute, t))

    const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n))
    const tailOffsets = isMobile() ? TAIL_OFFSETS_MOBILE : TAIL_OFFSETS_DESKTOP
    const windowLen = isMobile() ? 110 : 200
    const sizes = isMobile()
      ? { halo: 20, glow: 11, core: 4 }
      : { halo: 30, glow: 15, core: 6 }

    const pulseDot = (dot: HTMLElement) => {
      dot.style.transition = "transform 340ms cubic-bezier(0.22,1,0.36,1)"
      dot.style.transform = "scale(1.2)"
      window.setTimeout(() => {
        dot.style.transform = "scale(1)"
      }, 170)
    }

    let raf = 0
    const tick = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight
      const sy = scrollY()

      for (const gr of groups) {
        if (!gr.total) continue

        // Target progress: 0 as the exit anchor approaches the bottom of the
        // viewport, 1 once the arrival anchor has settled near a
        // comfortable reading position.
        const e = gr.exitAnchor()
        const a = gr.arrivalAnchor()
        if (!e || !a) continue
        const span = Math.max(1, a.y - e.y + vh * 0.35)
        gr.target = reduced ? 1 : clamp((sy + vh - e.y) / span)

        // Ease current progress toward target with inertia rather than
        // snapping straight to it.
        gr.current += (gr.target - gr.current) * (reduced ? 1 : 0.14)
        if (Math.abs(gr.target - gr.current) < 0.0008) gr.current = gr.target

        const eased = travelEase(gr.current)
        const dist = eased * gr.total

        if (reduced) {
          gr.cometHalo.setAttribute("r", "0")
          gr.cometGlow.setAttribute("r", "0")
          gr.cometCore.setAttribute("r", "0")
          gr.tailEls.forEach((t) => t.setAttribute("r", "0"))
          gr.windowPath.style.opacity = "0"
          if (gr.arrivalSection) gr.arrivalSection.style.transform = ""
          if (gr.exitSection) gr.exitSection.style.transform = ""
          continue
        }

        // the camera settles as we fly into the next section: it starts
        // slightly zoomed in from the exact point the comet lands, and
        // eases to rest right as the comet arrives — "we flew in with it"
        if (gr.arrivalSection) {
          const settleT = clamp((gr.current - 0.55) / 0.45)
          const scale = 1.055 - travelEase(settleT) * 0.055
          gr.arrivalSection.style.transformOrigin = `${gr.arrivalOriginPct.x}% ${gr.arrivalOriginPct.y}%`
          gr.arrivalSection.style.transform = `scale(${scale})`
          gr.arrivalSection.style.willChange = settleT < 1 ? "transform" : "auto"
        }

        // moving bright window trailing the comet
        gr.windowPath.setAttribute("stroke-dasharray", `${windowLen} ${gr.total + 1}`)
        gr.windowPath.setAttribute("stroke-dashoffset", String(windowLen - dist))
        const activeOpacity =
          Math.min(clamp(gr.current / 0.03), clamp((1 - gr.current) / 0.05)) *
          (gr.current > 0.001 && gr.current < 0.999 ? 1 : 0)
        gr.windowPath.style.opacity = String(activeOpacity)

        const head = gr.guide.getPointAtLength(dist)
        const cometOpacity = Math.min(clamp(gr.current / 0.04), clamp((1 - gr.current) / 0.06))

        // right before arrival the light gathers into a brief, concentrated
        // bloom — the "diving into it" moment — before it hands off to the
        // section's own camera-settle and the badge-dot pulse
        const bloom = clamp((gr.current - 0.83) / 0.14) * clamp((0.985 - gr.current) / 0.03)
        const boost = 1 + bloom * 1.6

        gr.cometHalo.setAttribute("cx", String(head.x))
        gr.cometHalo.setAttribute("cy", String(head.y))
        gr.cometHalo.setAttribute("r", String(sizes.halo * boost))
        gr.cometHalo.style.opacity = String(cometOpacity * 0.6)

        gr.cometGlow.setAttribute("cx", String(head.x))
        gr.cometGlow.setAttribute("cy", String(head.y))
        gr.cometGlow.setAttribute("r", String(sizes.glow * boost))
        gr.cometGlow.style.opacity = String(cometOpacity * 0.85)

        gr.cometCore.setAttribute("cx", String(head.x))
        gr.cometCore.setAttribute("cy", String(head.y))
        gr.cometCore.setAttribute("r", String(sizes.core * (1 + bloom * 0.5)))
        gr.cometCore.style.opacity = String(cometOpacity)

        tailOffsets.forEach((offset, i) => {
          const t = gr.tailEls[i]
          if (!t) return
          const pt = gr.guide.getPointAtLength(clamp((dist - offset) / gr.total) * gr.total)
          t.setAttribute("cx", String(pt.x))
          t.setAttribute("cy", String(pt.y))
          t.setAttribute("r", String(Math.max(0, sizes.core * 0.62 - i * (sizes.core * 0.09))))
          t.style.opacity = String(cometOpacity * (1 - i / tailOffsets.length) * 0.55)
        })

        if (gr.current >= 0.985 && !gr.pulsed && gr.arrivalDot) {
          gr.pulsed = true
          pulseDot(gr.arrivalDot)
        } else if (gr.current < 0.9 && gr.pulsed) {
          gr.pulsed = false
        }
      }

      raf = requestAnimationFrame(tick)
    }

    const onResize = () => recompute()
    window.addEventListener("resize", onResize)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("resize", onResize)
      settleTimers.forEach((t) => window.clearTimeout(t))
      if (raf) cancelAnimationFrame(raf)
      groups.forEach((gr) => gr.guide.parentElement?.remove())
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[5]"
      width={docSize.w || undefined}
      height={docSize.h || undefined}
      style={{ overflow: "visible" }}
    />
  )
}
