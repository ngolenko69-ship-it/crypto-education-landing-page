import { BLANK_PIXEL, SCENE_FILTER, sceneSources, type SceneConfig } from "./scene-config"

type Props = {
  scene: SceneConfig
  className?: string
  priority?: boolean
  /** accessible description when the picture carries meaning (hero); decorative otherwise */
  label?: string
}

/**
 * Framed crop of the scene for tablets and phones (below xl), placed in the
 * reading flow after the copy. The crop follows the scene's own focal point,
 * so the main object stays in frame and faces are never cut; 4:3 on phones,
 * wider on tablets. No text ever sits on it.
 */
export function SceneFrame({ scene, className = "", priority = false, label }: Props) {
  const { src, srcSet } = sceneSources(scene.image)
  const aspect = scene.frameAspect ?? "16 / 9"
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border border-[var(--line-gold)] bg-surface xl:hidden ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <picture>
        {/* from xl this frame is display:none — resolve it to a blank pixel so nothing downloads */}
        <source media="(min-width: 1280px)" srcSet={BLANK_PIXEL} />
        <img
          src={src}
          srcSet={srcSet}
          sizes="100vw"
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="block aspect-[4/3] w-full object-cover sm:aspect-[var(--frame-aspect)]"
          style={{ "--frame-aspect": aspect, objectPosition: scene.focalFrame, filter: SCENE_FILTER } as React.CSSProperties}
        />
      </picture>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%]"
        style={{ background: "linear-gradient(to top, rgba(7,19,15,0.45), transparent)" }}
        aria-hidden="true"
      />
    </div>
  )
}
