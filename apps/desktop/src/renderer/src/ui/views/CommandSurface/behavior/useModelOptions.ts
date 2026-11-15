import { useCallback, useMemo, useState } from 'react'
import type { AiModelOption } from '@shared/ai'
import { REMOTE_PROVIDERS, REMOTE_PROVIDER_LABEL } from '@shared/remote-ai'
import type { RemoteKeyStatus, RemoteModelOption } from '@shared/remote-ai'
import type { SelectGroup } from '@ds/primitives/form/Select'
import { toInstalledRemote } from '@/lib/ai/installedRemote'
import { pickUsableModel } from './pickUsableModel'
import { useAutoActivateModel } from './useAutoActivateModel'

// The footer's model choices: the installed set, grouped like Settings (Local, then one
// group per provider): downloaded local models plus the remote models the user added. A
// remote model whose provider has no key is listed but disabled. "Ready" = a usable
// model exists; when none is active the first usable one is activated automatically.
const useModelOptions = () => {
  const [local, setLocal] = useState<AiModelOption[]>([])
  const [remote, setRemote] = useState<RemoteModelOption[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [keys, setKeys] = useState<RemoteKeyStatus | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const [models, st, remoteModels, addedRefs, keyStatus] = await Promise.all([
      window.api.ai.listModels().catch(() => [] as AiModelOption[]),
      window.api.ai.status().catch(() => null),
      window.api.ai.remote.models().catch(() => [] as RemoteModelOption[]),
      window.api.ai.remote.added().catch(() => [] as string[]),
      window.api.ai.remote.keyStatus().catch(() => null),
    ])
    setLocal(models)
    setRemote(remoteModels)
    setAdded(addedRefs)
    setKeys(keyStatus)
    setActiveId(models.find((m) => m.installed && m.active)?.id ?? st?.activeModelId ?? null)
    setLoaded(true)
  }, [])

  const switchModel = useCallback(
    async (id: string) => {
      try {
        await window.api.ai.setModel(id)
        await window.api.ai.resetChat()
      } catch {
        // The refreshed list below shows which model is really active.
      }
      await refresh()
    },
    [refresh],
  )

  const installedRemote = useMemo(() => toInstalledRemote(added, remote, keys), [added, remote, keys])
  const installed = useMemo(() => local.filter((m) => m.installed), [local])

  const activeModel = useMemo(() => {
    if (!activeId) return null
    const l = installed.find((m) => m.id === activeId)
    if (l) return { value: l.id, label: l.label, remote: false }
    const r = installedRemote.find((m) => m.ref === activeId && m.keyPresent)
    return r ? { value: r.ref, label: r.label, remote: true } : null
  }, [activeId, installed, installedRemote])

  const fallbackId = useMemo(() => pickUsableModel(installed, installedRemote), [installed, installedRemote])
  useAutoActivateModel({ loaded, hasActive: activeModel != null, fallbackId, switchModel })

  const modelGroups = useMemo<SelectGroup[]>(() => {
    const groups: SelectGroup[] = []
    if (installed.length > 0) {
      groups.push({ label: 'Local', options: installed.map((m) => ({ value: m.id, label: m.label })) })
    }
    for (const p of REMOTE_PROVIDERS) {
      const models = installedRemote.filter((m) => m.provider === p)
      if (models.length === 0) continue
      groups.push({
        label: REMOTE_PROVIDER_LABEL[p],
        options: models.map((m) => ({
          value: m.ref,
          label: m.keyPresent ? m.label : `${m.label} (needs a key)`,
          disabled: !m.keyPresent,
        })),
      })
    }
    return groups
  }, [installedRemote, installed])

  return { activeModel, modelGroups, ready: activeModel != null || fallbackId != null, refresh, switchModel }
}

export { useModelOptions }
