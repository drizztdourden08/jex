import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import type { AiModelOption } from '@shared/ai'
import type { InstalledRemote } from '@/lib/ai/installedRemote'

// The model to activate when none is: the first installed local model, else the first
// keyed remote model in provider order. Null when nothing is usable.
const pickUsableModel = (installed: AiModelOption[], remote: InstalledRemote[]): string | null => {
  if (installed.length > 0) return installed[0].id
  for (const p of REMOTE_PROVIDERS) {
    const hit = remote.find((m) => m.provider === p && m.keyPresent)
    if (hit) return hit.ref
  }
  return null
}

export { pickUsableModel }
