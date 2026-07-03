"use client"

import { useEffect, useRef, useState } from "react"

/** Detects the user's reduced-motion preference. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

/**
 * Reveals an element once it scrolls into view (fires a single time).
 * Lightweight IntersectionObserver, no scroll listeners.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px", ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

/** Premium ease-out curve used across every cinematic reveal. */
export const PREMIUM_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

type RevealOptions = {
  /** Delay before this element starts, in ms. */
  delay?: number
  /** Vertical travel distance, in px (kept between 12–24 for a refined feel). */
  y?: number
  /** Transition duration, in ms. */
  duration?: number
}

/**
 * Scroll-reveal controller with a per-element `reveal()` style helper.
 * Elements fade in and drift up in a gentle staggered sequence using a
 * premium ease-out curve. Honors `prefers-reduced-motion` by collapsing to
 * a simple fade with no movement.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const { ref, inView } = useInView<T>(options)
  const reduced = useReducedMotion()

  const reveal = ({ delay = 0, y = 16, duration = 700 }: RevealOptions = {}) => {
    const shown = inView || reduced
    return {
      opacity: inView ? 1 : 0,
      transform: shown ? "translateY(0px)" : `translateY(${y}px)`,
      transition: reduced
        ? `opacity ${duration}ms ease-out ${delay}ms`
        : `opacity ${duration}ms ${PREMIUM_EASE} ${delay}ms, transform ${duration}ms ${PREMIUM_EASE} ${delay}ms`,
      willChange: inView ? "auto" : ("opacity, transform" as const),
    }
  }

  /** Subtle background settle: starts slightly scaled up, eases to rest. */
  const settle = (scale = 1.04, duration = 1600) => {
    if (reduced) return undefined
    return {
      transform: inView ? "scale(1)" : `scale(${scale})`,
      transition: `transform ${duration}ms ${PREMIUM_EASE}`,
      willChange: inView ? "auto" : ("transform" as const),
    }
  }

  return { ref, inView, reduced, reveal, settle }
}
