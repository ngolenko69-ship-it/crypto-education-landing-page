// Dev-only helper for `npm run test:bot`: lets plain Node (built-in TypeScript type stripping) run the
// app's TypeScript, whose relative imports have no file extension (the Next.js style).
import { register } from "node:module"

register("./ts-resolve-hooks.mjs", import.meta.url)
