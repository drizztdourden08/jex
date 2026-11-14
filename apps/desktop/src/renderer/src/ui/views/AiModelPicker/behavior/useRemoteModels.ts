import { useCallback, useEffect, useState } from 'react'
import type { RemoteModelOption } from '@shared/remote-ai'

const errText = (e: unknown): string => (e instanceof Error ? e.message : String(e))

// Remote-model side of the picker: the provider catalog, which ref is active, whether the
// local runtime is present, and "Use" (set the model, then start a fresh chat).
const useRemoteModels = () => {
  const [models, setModels] = useState<RemoteModelOption[]>([])
  const [activeRef, setActiveRef] = useState<string | null>(null)
  const [localRuntime, setLocalRuntime] = useState(true)
  const [busyRef, setBusyRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [list, st, engine] = await Promise.all([
        window.api.ai.remote.models(),
        window.api.ai.status(),
        window.api.ai.engineStatus(),
      ])
      setModels(list)
      setActiveRef(st.activeModelId ?? null)
      setLocalRuntime(engine.localRuntime)
    } catch (e) {
      setError(errText(e))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const use = useCallback(
    async (ref: string) => {
      setBusyRef(ref)
      setError(null)
      try {
        await window.api.ai.setModel(ref)
        await window.api.ai.resetChat()
        await reload()
      } catch (e) {
        setError(errText(e))
      } finally {
        setBusyRef(null)
      }
    },
    [reload],
  )

  return { models, activeRef, localRuntime, busyRef, error, use, reload }
}

export { useRemoteModels }
