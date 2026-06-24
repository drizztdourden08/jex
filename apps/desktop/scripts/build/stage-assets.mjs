// Stage brand assets from the central, tracked assets/ dir into the ephemeral,
// gitignored locations the build tools expect:
//   assets/icon.png    → build/icon.png            (electron-builder win icon + extraResources)
//   assets/icon.svg    → build/icon.svg            (kept beside it for render-icon)
//   assets/favicon.svg → src/renderer/public/favicon.svg  (vite publicDir; index.html /favicon.svg)
// assets/ is the single source of truth; build/ and src/renderer/public/ are never
// committed. The wordmark is bundled straight from assets/ via the @assets alias, so
// it needs no staging. Runs before dev/build/package (see package.json scripts).
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const COPIES = [
  ['assets/icon.png', 'build/icon.png'],
  ['assets/icon.svg', 'build/icon.svg'],
  ['assets/favicon.svg', 'src/renderer/public/favicon.svg'],
]

const stage = () => {
  for (const [from, to] of COPIES) {
    const dest = join(root, to)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(join(root, from), dest)
  }
  console.log(`[stage-assets] staged ${COPIES.length} asset(s) from assets/`)
}

stage()
