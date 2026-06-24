// Prune electron-builder's leftovers from release/ so only the distributables
// remain (installer + portable + their blockmap + latest.yml for auto-update).
// Run after `electron-builder` locally and in the release workflow — same pruning
// in both places. Removing the multi-hundred-MB win-unpacked/ dir is the big one.
import { rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const releaseDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'release')

const CRUFT = [
  'win-unpacked',
  '.icon-ico',
  'builder-debug.yml',
  'builder-effective-config.yaml',
]

const clean = () => {
  for (const entry of CRUFT) {
    rmSync(join(releaseDir, entry), { recursive: true, force: true })
  }
  console.log(`[clean-release] pruned build leftovers — release/ holds only the distributables`)
}

clean()
