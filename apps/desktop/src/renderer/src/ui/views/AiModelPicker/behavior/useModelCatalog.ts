import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDownloads } from '@/store/downloads'
import { fitsVram, recommendedFor } from '@/lib/ai/modelFit'
import type { AiBackendInfo, AiModelOption } from '@shared/ai'

/** A catalog model plus its live download progress (0–1), for in-table progress. */
interface DownloadingModel extends AiModelOption {
  downloaded: number
  total: number
}

/**
 * Data hook for the model picker (Custom Hook pattern). The single place that
 * touches `window.api` for the catalog itself; live download progress comes from
 * the global `useDownloads` store, so it survives navigating away from Settings
 * and covers several concurrent downloads at once.
 */
const useModelCatalog = () => {
  const [models, setModels] = useState<AiModelOption[]>([])
  const [backend, setBackend] = useState<AiBackendInfo | null>(null)
  const { progress, errors, doneSeq, start } = useDownloads()

  const refresh = useCallback(async () => {
    setModels(await window.api.ai.listModels())
  }, [])

  useEffect(() => {
    void refresh()
    window.api.ai.backend().then(setBackend).catch(() => {})
  }, [refresh])

  // A download settling flips a model to installed — re-list so the table updates.
  useEffect(() => {
    if (doneSeq > 0) void refresh()
  }, [doneSeq, refresh])

  const select = useCallback(
    async (id: string) => {
      await window.api.ai.setModel(id)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      await window.api.ai.deleteModel(id)
      await refresh()
    },
    [refresh],
  )

  /** Delete every installed model except the active one (the "Clean up" button). */
  const cleanInactive = useCallback(async () => {
    const stale = models.filter((m) => m.installed && !m.active)
    for (const m of stale) await window.api.ai.deleteModel(m.id)
    await refresh()
  }, [models, refresh])

  const installed = useMemo(() => models.filter((m) => m.installed), [models])
  const downloading = useMemo<DownloadingModel[]>(
    () =>
      models
        .filter((m) => progress[m.id])
        .map((m) => ({ ...m, downloaded: progress[m.id].downloaded, total: progress[m.id].total })),
    [models, progress],
  )
  // Available to download: not installed and not already downloading.
  const available = useMemo(
    () => models.filter((m) => !m.installed && !progress[m.id]),
    [models, progress],
  )

  const vramGb = backend?.vramGb
  const recommendedId = useMemo(() => recommendedFor(models, vramGb), [models, vramGb])
  const fits = useCallback((m: AiModelOption) => fitsVram(m, vramGb), [vramGb])

  return {
    available,
    installed,
    downloading,
    backend,
    vramGb,
    recommendedId,
    fits,
    errors,
    download: start,
    select,
    remove,
    cleanInactive,
  }
}

export { useModelCatalog }
export type { DownloadingModel }
