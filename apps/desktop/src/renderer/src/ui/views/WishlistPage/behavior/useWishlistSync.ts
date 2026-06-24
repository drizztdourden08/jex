import { useEffect, useRef, useState } from 'react'
import { SYNC_INTERVAL_MS, RELOAD_THROTTLE_MS } from './wishlist-utils'
import type { Game, SyncProgress } from '@shared/library'

type Params = {
  wishlist: Game[]
  reload: () => Promise<void> | void
}

const useWishlistSync = ({ wishlist, reload }: Params) => {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const syncingRef = useRef(false)
  const lastReload = useRef(0)

  const doSync = async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setSyncing(true)
    try {
      const res = await window.api.wishlist.sync()
      setHint(
        res.empty && wishlist.length === 0
          ? 'No wishlist items found. Make sure your Steam profile’s wishlist is public.'
          : null,
      )
      await reload()
    } catch (e) {
      setHint(String(e))
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }

  useEffect(() => {
    const off = window.api.enrich.onProgress((p) => {
      setProgress(p)
      const now = Date.now()
      if (p.phase === 'done' || now - lastReload.current > RELOAD_THROTTLE_MS) {
        lastReload.current = now
        void reload()
      }
    })
    void doSync()
    const onFocus = () => void doSync()
    window.addEventListener('focus', onFocus)
    const id = window.setInterval(() => void doSync(), SYNC_INTERVAL_MS)
    return () => {
      off()
      window.removeEventListener('focus', onFocus)
      window.clearInterval(id)
    }

  }, [])

  return { syncing, progress, hint, doSync }
}

export { useWishlistSync }
