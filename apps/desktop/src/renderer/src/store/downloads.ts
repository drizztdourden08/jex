import { create } from 'zustand'

/**
 * Global model-download state. Lives in a store (not a component) with a one-time
 * IPC subscription so progress survives navigating away from Settings — the
 * download keeps running in main, and any mounted view reads live progress from
 * here. Tracks several concurrent downloads by model id.
 */
interface DlProgress {
  downloaded: number
  total: number
}

interface DownloadsState {
  progress: Record<string, DlProgress>
  errors: Record<string, string>
  /** Bumps whenever a download settles — views watch it to re-list models. */
  doneSeq: number
  start: (id: string) => void
}

let subscribed = false

const useDownloads = create<DownloadsState>((set, get) => {
  const ensureSub = () => {
    if (subscribed) return
    subscribed = true
    // Hydrate any downloads already running (e.g. started before this view mounted).
    window.api.ai
      .downloads()
      .then((d) => {
        const progress: Record<string, DlProgress> = {}
        for (const [id, p] of Object.entries(d)) {
          progress[id] = { downloaded: p.downloadedSize, total: p.totalSize }
        }
        set({ progress: { ...progress, ...get().progress } })
      })
      .catch(() => {})
    window.api.ai.onDownloadProgress((p) =>
      set((s) => ({
        progress: { ...s.progress, [p.modelId]: { downloaded: p.downloadedSize, total: p.totalSize } },
      })),
    )
    window.api.ai.onDownloadDone((d) =>
      set((s) => {
        const { [d.modelId]: _done, ...progress } = s.progress
        const errors = { ...s.errors }
        if (d.ok) delete errors[d.modelId]
        else errors[d.modelId] = d.error ?? 'Download failed.'
        return { progress, errors, doneSeq: s.doneSeq + 1 }
      }),
    )
  }
  ensureSub()

  return {
    progress: {},
    errors: {},
    doneSeq: 0,
    start: (id) => {
      // Optimistically show the row as downloading; main starts reporting bytes next.
      set((s) => {
        const errors = { ...s.errors }
        delete errors[id]
        return { progress: { ...s.progress, [id]: { downloaded: 0, total: 0 } }, errors }
      })
      // The done event carries any error; the rejection here is expected and ignored.
      window.api.ai.downloadModel(id).catch(() => {})
    },
  }
})

export { useDownloads }
export type { DlProgress }
