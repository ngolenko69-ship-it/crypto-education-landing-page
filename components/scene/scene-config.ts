/**
 * Per-scene parameters: which master image, where its focal point sits for
 * the full-bleed desktop layer and for the framed tablet/phone crop, and how
 * strong the local text protection has to be. Everything else (seams, wash,
 * card surface, type) is shared, so a scene is tuned here and nowhere else.
 */
export type SceneConfig = {
  /** base file name inside /public/images, without extension */
  image: string
  /** object-position for the full-bleed layer (xl and up) */
  focalWide: string
  /** object-position for the framed crop (below xl) */
  focalFrame: string
  /** aspect ratio of the framed crop on tablets (phones use 4 / 3) */
  frameAspect?: string
  /** density of the text shield, 0..1 — Hero / Comunidad / About / final use the strongest */
  shield?: number
  /** soft gold glow behind the scene's main object (desktop only) */
  glow?: string
}

export const SCENE_IMAGE_WIDTHS = { small: 1680, master: 3351 } as const

export function sceneSources(image: string) {
  return {
    src: `/images/${image}.webp`,
    srcSet: `/images/${image}-1680.webp 1680w, /images/${image}.webp 3351w`,
  }
}

/**
 * 1x1 transparent GIF. Used as the <source> for the breakpoint where a scene
 * layer is display:none, so the hidden layer never downloads its real file
 * (the full-bleed desktop layer on phones, the framed crop on desktops).
 */
export const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/** The one photographic grade every scene shares (near neutral). */
export const SCENE_FILTER = "saturate(1.04) brightness(1.06) contrast(1.01)"
