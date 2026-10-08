"use client"

import type { CSSProperties } from "react"
import { BLANK_PIXEL, SCENE_FILTER, sceneSources, type SceneConfig } from "./scene-config"

type Props = {
  scene: SceneConfig
  /** background settle animation from useReveal (optional) */
  settle?: CSSProperties
  /** the hero is the LCP image: eager + high priority; every other scene is lazy */
  priority?: boolean
  /** hide the top seam (the hero sits directly under the header) */
  noTopSeam?: boolean
}

/**
 * Full-bleed scene layer (desktop, xl and up). Layer order, bottom to top:
 * base surface → photo (cover, scene focal point) → light left wash → optional
 * glow on the object → short top/bottom seams. The dense protection under the
 * copy is NOT here: that is the TextShield, local to the text column.
 * Decor only: no pointer events, clipped by the section.
 */
export function SceneBackdrop({ scene, settle, priority = false, noTopSeam = false }: Props) {
  const { src, srcSet } = sceneSources(scene.image)
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip xl:block" aria-hidden="true">
      <div className="absolute inset-0 bg-surface-deep" />

      <picture>
        {/* below xl this layer is display:none — resolve it to a blank pixel so nothing downloads */}
        <source media="(max-width: 1279px)" srcSet={BLANK_PIXEL} />
        <img
          src={src}
          srcSet={srcSet}
          sizes="100vw"
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-x-0 top-px w-full object-cover"
          style={{ ...settle, height: "calc(100% - 2px)", objectPosition: scene.focalWide, filter: SCENE_FILTER }}
        />
      </picture>

      {/* light, wide left wash — keeps the shield from reading as a pasted
          rectangle; the right half of the scene stays at full brightness */}
      <div
        className="absolute inset-y-0 left-0 w-[52%]"
        style={{
          background:
            "linear-gradient(to right, rgba(7,19,15,0.5) 0%, rgba(7,19,15,0.22) 55%, transparent 100%)",
        }}
      />

      {scene.glow && (
        <div className="absolute inset-y-0 right-0 w-[55%]" style={{ background: scene.glow }} />
      )}

      {!noTopSeam && <div className="scene-seam-top absolute inset-x-0 top-0 h-[6%]" />}
      <div className="scene-seam-bottom absolute inset-x-0 bottom-0 h-[7%]" />
    </div>
  )
}
