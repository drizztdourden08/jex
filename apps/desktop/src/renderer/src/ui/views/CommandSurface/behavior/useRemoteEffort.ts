import { useCallback, useEffect, useState } from 'react'
import type { RemoteEffort } from '@shared/remote-ai'

// Reasoning effort for remote models, picked in the chat footer. Main stores it; it is
// re-read each time the drawer opens so the footer shows what the next request will use.
const useRemoteEffort = (open: boolean) => {
  const [effort, setEffort] = useState<RemoteEffort>('medium')

  useEffect(() => {
    if (!open) return
    window.api.ai.remote.getEffort().then(setEffort).catch(() => {})
  }, [open])

  const changeEffort = useCallback(
    async (next: RemoteEffort) => {
      const prev = effort
      setEffort(next)
      await window.api.ai.remote.setEffort(next).catch(() => setEffort(prev))
    },
    [effort],
  )

  return { effort, changeEffort }
}

export { useRemoteEffort }
