"use client"

import type { CSSProperties } from "react"
import { BLANK_PIXEL, SCENE_ASPECT, SCENE_FILTER, sceneSources, type SceneConfig } from "./scene-config"

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

  // Rendered scene width when the photo is height-fit (the usual case on desktop):
  // the layer is 2px shorter than its container (see top-px / calc(100% - 2px)).
  const sceneWidth = `((100cqh - 2px) * ${SCENE_ASPECT})`
  // Where the dark text layer ends: content left edge + copy column + 60% of the
  // feathered tail (alpha is already below 0.1 there).
  const shieldEnd = `max(0px, (100cqw - var(--container)) / 2) + var(--gutter) + var(--col-w, 36rem) + var(--shield-feather, 10rem) * 0.6`
  // Horizontal offset that puts the sign's left edge exactly at shieldEnd; clamped so the
  // photo never leaves a gap on either side (when it is width-fit the offset is 0).
  const objectPosition = `max(min(0px, 100cqw - ${sceneWidth}), min(0px, ${shieldEnd} - ${sceneWidth} * ${scene.signLeft})) 50%`

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-clip xl:block"
      style={{ containerType: "size" }}
      aria-hidden="true"
    >
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
          className="absolute inset-x-0 top-px w-full object-cover object-[var(--fx-fallback)]"
          style={
            {
              ...settle,
              height: "calc(100% - 2px)",
              "--fx-fallback": scene.focalWide,
              objectPosition,
              filter: SCENE_FILTER,
            } as React.CSSProperties
          }
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
