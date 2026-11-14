import { useCallback, useEffect, useState } from 'react'
import type { RemoteEffort, RemoteKeyCheck, RemoteKeyStatus, RemoteProviderId } from '@shared/remote-ai'

interface KeyResult {
  check: RemoteKeyCheck
  message?: string
}

type PerProvider<T> = Partial<Record<RemoteProviderId, T>>

const errText = (e: unknown): string => (e instanceof Error ? e.message : String(e))

// Drives the "Remote AI models" settings: which providers have a key (never the key
// itself), saving / replacing / clearing one, the verify result, and reasoning effort.
const useRemoteKeys = () => {
  const [status, setStatus] = useState<RemoteKeyStatus | null>(null)
  const [effort, setEffortState] = useState<RemoteEffort>('medium')
  const [drafts, setDrafts] = useState<PerProvider<string>>({})
  const [replacing, setReplacing] = useState<PerProvider<boolean>>({})
  const [results, setResults] = useState<PerProvider<KeyResult>>({})
  const [busy, setBusy] = useState<RemoteProviderId | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.api.ai.remote.keyStatus().then(setStatus).catch((e) => setError(errText(e)))
    window.api.ai.remote.getEffort().then(setEffortState).catch((e) => setError(errText(e)))
  }, [])

  const setDraft = useCallback((p: RemoteProviderId, v: string) => {
    setDrafts((d) => ({ ...d, [p]: v }))
  }, [])

  const startReplace = useCallback((p: RemoteProviderId) => {
    setReplacing((r) => ({ ...r, [p]: true }))
  }, [])

  const cancelReplace = useCallback((p: RemoteProviderId) => {
    setReplacing((r) => ({ ...r, [p]: false }))
    setDrafts((d) => ({ ...d, [p]: '' }))
  }, [])

  const save = useCallback(
    async (p: RemoteProviderId) => {
      const key = (drafts[p] ?? '').trim()
      if (!key) return
      setBusy(p)
      setError(null)
      try {
        const res = await window.api.ai.remote.setKey(p, key)
        setStatus(res.status)
        setResults((r) => ({ ...r, [p]: { check: res.check, message: res.message } }))
        // A rejected key stays in the field so it can be corrected.
        if (res.check !== 'rejected') {
          setDrafts((d) => ({ ...d, [p]: '' }))
          setReplacing((r) => ({ ...r, [p]: false }))
        }
      } catch (e) {
        setError(errText(e))
      } finally {
        setBusy(null)
      }
    },
    [drafts],
  )

  const clear = useCallback(async (p: RemoteProviderId) => {
    setBusy(p)
    setError(null)
    try {
      setStatus(await window.api.ai.remote.clearKey(p))
      setResults((r) => ({ ...r, [p]: undefined }))
    } catch (e) {
      setError(errText(e))
    } finally {
      setBusy(null)
    }
  }, [])

  const setEffort = useCallback(
    async (next: RemoteEffort) => {
      const prev = effort
      setEffortState(next)
      try {
        await window.api.ai.remote.setEffort(next)
      } catch (e) {
        setEffortState(prev)
        setError(errText(e))
      }
    },
    [effort],
  )

  return {
    status,
    effort,
    drafts,
    replacing,
    results,
    busy,
    error,
    setDraft,
    startReplace,
    cancelReplace,
    save,
    clear,
    setEffort,
  }
}

type RemoteKeysModel = ReturnType<typeof useRemoteKeys>

export { useRemoteKeys }
export type { RemoteKeysModel, KeyResult }
