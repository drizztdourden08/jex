import { useEffect } from 'react'
import { useSyncStatus } from '@/store/syncStatus'

/**
 * Keeps the sync-status store in step with main: adopts the running state once, then
 * follows every progress event. Mount it ONCE, in a component that lives for the
 * whole session (the TitleBar).
 */
const useSyncStatusFeed = (): void => {
  useEffect(() => {
    const { hydrate, receive } = useSyncStatus.getState()
    window.api.library
      .syncState()
      .then((st) => hydrate(st.running, st.progress))
      .catch(() => {})
    return window.api.enrich.onProgress(receive)
  }, [])
}

export { useSyncStatusFeed }
