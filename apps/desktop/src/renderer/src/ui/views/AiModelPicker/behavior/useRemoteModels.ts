import { useCallback, useEffect, useState } from 'react'
import type { RemoteModelOption, RemoteProviderId } from '@shared/remote-ai'
import { ipcErrorText as errText } from '@/lib/ipc/ipcErrorText'

// Remote-model side of the picker: the provider catalog, the refs the user added to the
// installed list (persisted in main), which model is active, whether the local runtime is
// present, providers opened for a key, and Use / Add / Remove.
const useRemoteModels = () => {
  const [models, setModels] = useState<RemoteModelOption[]>([])
  const [added, setAdded] = useState<string[]>([])
  const [activeRef, setActiveRef] = useState<string | null>(null)
  const [localRuntime, setLocalRuntime] = useState(true)
  const [revealed, setRevealed] = useState<RemoteProviderId[]>([])
  const [busyRef, setBusyRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [list, refs, st, engine] = await Promise.all([
        window.api.ai.remote.models(),
        window.api.ai.remote.added(),
        window.api.ai.status(),
        window.api.ai.engineStatus(),
      ])
      setModels(list)
      setAdded(refs)
      setActiveRef(st.activeModelId ?? null)
      setLocalRuntime(engine.localRuntime)
    } catch (e) {
      setError(errText(e))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  // Runs one remote action with the busy marker and error surface.
  const run = useCallback(async (ref: string, action: () => Promise<void>) => {
    setBusyRef(ref)
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(errText(e))
    } finally {
      setBusyRef(null)
    }
  }, [])

  const use = useCallback(
    (ref: string) =>
      run(ref, async () => {
        await window.api.ai.setModel(ref)
        await window.api.ai.resetChat()
        await reload()
      }),
    [run, reload],
  )

  const add = useCallback(
    (ref: string) =>
      run(ref, async () => {
        setAdded(await window.api.ai.remote.add(ref))
        // Main activates it when no usable model was active; pick that up.
        await reload()
      }),
    [run, reload],
  )

  const remove = useCallback(
    (ref: string) => run(ref, async () => setAdded(await window.api.ai.remote.remove(ref))),
    [run],
  )

  const reveal = useCallback((p: RemoteProviderId) => {
    setRevealed((r) => (r.includes(p) ? r : [...r, p]))
  }, [])

  return { models, added, activeRef, localRuntime, revealed, busyRef, error, use, add, remove, reveal, reload }
}

export { useRemoteModels }
