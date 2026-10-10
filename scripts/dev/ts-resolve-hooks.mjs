import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

// Resolve "./thing" and "../thing" to thing.ts or thing/index.ts when the specifier has no extension.
export async function resolve(specifier, context, nextResolve) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../")
  if (relative && context.parentURL && !/\.[cm]?[jt]s$|\.json$/.test(specifier)) {
    const base = new URL(specifier, context.parentURL).href
    for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
      if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate, context)
    }
  }
  return nextResolve(specifier, context)
}
