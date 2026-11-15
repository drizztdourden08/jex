import { useEffect, useMemo, useState } from 'react'
import type { AiModelOption } from '@shared/ai'
import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import type { RemoteKeyStatus, RemoteModelOption } from '@shared/remote-ai'
import type { CatalogEntry } from '../AiModelPicker.type'

interface UseCatalogParams {
  /** Local models not installed and not downloading. */
  available: AiModelOption[]
  remoteModels: RemoteModelOption[]
  /** Remote refs already in the installed list (hidden from the catalog). */
  added: string[]
  keys: RemoteKeyStatus | null
  recommendedId: string | null
}

// The one "add a model" list: local models, then each provider's remote models. A provider
// with no key and no listed models (OpenAI lists only with a key) gets one entry that opens
// its key field. Keeps a sensible entry selected: the GPU-recommended local model, else the
// first one, and resets when the chosen entry leaves the list.
const useCatalog = ({ available, remoteModels, added, keys, recommendedId }: UseCatalogParams) => {
  const entries = useMemo<CatalogEntry[]>(() => {
    const local: CatalogEntry[] = available.map((m) => ({ kind: 'local', key: m.id, model: m }))
    const remote = REMOTE_PROVIDERS.flatMap((p): CatalogEntry[] => {
      const listed = remoteModels.filter((m) => m.provider === p)
      if (listed.length === 0) {
        return keys?.[p].present ? [] : [{ kind: 'provider', key: `provider:${p}`, provider: p }]
      }
      return listed
        .filter((m) => !added.includes(m.ref))
        .map((m): CatalogEntry => ({ kind: 'remote', key: m.ref, model: m }))
    })
    return [...local, ...remote]
  }, [available, remoteModels, added, keys])

  const [chosenKey, setChosenKey] = useState<string | null>(null)

  useEffect(() => {
    if (chosenKey && entries.some((e) => e.key === chosenKey)) return
    const rec = entries.some((e) => e.key === recommendedId) ? recommendedId : null
    setChosenKey(rec ?? entries[0]?.key ?? null)
  }, [entries, chosenKey, recommendedId])

  const chosen = entries.find((e) => e.key === chosenKey) ?? null

  return { entries, chosen, chosenKey, setChosenKey }
}

export { useCatalog }
