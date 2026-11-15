import { parseModelRef } from '@shared/remote-ai'
import type { RemoteKeyStatus, RemoteModelOption, RemoteProviderId } from '@shared/remote-ai'

/** A remote model in the user's installed set, with whether its provider has a key. */
interface InstalledRemote {
  ref: string
  provider: RemoteProviderId
  label: string
  contextSize: number | null
  keyPresent: boolean
}

/**
 * Adapter: the persisted added refs + the provider model list + key status -> the
 * installed remote models, in the order they were added. A ref the provider no longer
 * lists (no key yet, list failed) still shows, labelled by its id.
 */
const toInstalledRemote = (
  added: string[],
  models: RemoteModelOption[],
  status: RemoteKeyStatus | null,
): InstalledRemote[] =>
  added.flatMap((ref) => {
    const parsed = parseModelRef(ref)
    if (!parsed) return []
    const listed = models.find((m) => m.ref === ref)
    const keyPresent = status ? status[parsed.provider].present : (listed?.keyPresent ?? false)
    return [
      {
        ref,
        provider: parsed.provider,
        label: listed?.label ?? parsed.id,
        contextSize: listed?.contextSize ?? null,
        keyPresent,
      },
    ]
  })

export { toInstalledRemote }
export type { InstalledRemote }
