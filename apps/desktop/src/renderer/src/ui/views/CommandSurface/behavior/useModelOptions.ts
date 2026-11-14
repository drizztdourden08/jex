import { useCallback, useMemo, useState } from 'react'
import type { AiModelOption } from '@shared/ai'
import type { RemoteModelOption } from '@shared/remote-ai'
import type { SelectGroup } from '@ds/primitives/form/Select'

// The footer's model choices: installed local models plus remote models whose provider
// has a key. "Ready" = the active model is usable (a downloaded local one, or a remote
// one with a key), so a stale saved default never reads as ready.
const useModelOptions = () => {
  const [local, setLocal] = useState<AiModelOption[]>([])
  const [remote, setRemote] = useState<RemoteModelOption[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const [models, st, remoteModels] = await Promise.all([
      window.api.ai.listModels().catch(() => [] as AiModelOption[]),
      window.api.ai.status().catch(() => null),
      window.api.ai.remote.models().catch(() => [] as RemoteModelOption[]),
    ])
    setLocal(models)
    setRemote(remoteModels)
    setActiveId(models.find((m) => m.installed && m.active)?.id ?? st?.activeModelId ?? null)
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

  const usableRemote = useMemo(() => remote.filter((m) => m.keyPresent), [remote])
  const installed = useMemo(() => local.filter((m) => m.installed), [local])

  const activeModel = useMemo(() => {
    if (!activeId) return null
    const l = installed.find((m) => m.id === activeId)
    if (l) return { value: l.id, label: l.label }
    const r = usableRemote.find((m) => m.ref === activeId)
    return r ? { value: r.ref, label: r.label } : null
  }, [activeId, installed, usableRemote])

  const modelGroups = useMemo<SelectGroup[]>(() => {
    const groups: SelectGroup[] = []
    if (usableRemote.length > 0) {
      groups.push({ label: 'Remote', options: usableRemote.map((m) => ({ value: m.ref, label: m.label })) })
    }
    if (installed.length > 0) {
      groups.push({ label: 'Local', options: installed.map((m) => ({ value: m.id, label: m.label })) })
    }
    return groups
  }, [usableRemote, installed])

  return { activeModel, modelGroups, ready: activeModel != null, refresh, switchModel }
}

export { useModelOptions }
