declare module "threejs-components/build/cursors/tubes1.min.js" {
  interface TubesCursorOptions {
    bloom?: { threshold?: number; strength?: number; radius?: number } | false
    tubes?: {
      count?: number
      colors?: string[]
      minRadius?: number
      maxRadius?: number
      minTubularSegments?: number
      maxTubularSegments?: number
      material?: { metalness?: number; roughness?: number }
      lights?: { intensity?: number; colors?: string[] }
      lerp?: number
      noise?: number
    }
    sleepRadiusX?: number
    sleepRadiusY?: number
    sleepTimeScale1?: number
    sleepTimeScale2?: number
  }

  interface TubesCursorHandle {
    dispose: () => void
  }

  export default function createTubesCursor(
    canvas: HTMLCanvasElement,
    options?: TubesCursorOptions,
  ): TubesCursorHandle
}
