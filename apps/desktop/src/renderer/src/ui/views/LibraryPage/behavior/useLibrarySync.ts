import { useEffect, useState } from 'react'
import type { Game, LibraryStats, ScanResult, SyncProgress } from '@shared/library'

type Params = {
  games: Game[]
  loading: boolean
  scanning: boolean
  scan: () => Promise<ScanResult>
  reload: () => Promise<void> | void
}

const useLibrarySync = ({ games, loading, scanning, scan, reload }: Params) => {
  const [scanInfo, setScanInfo] = useState<ScanResult | null>(null)
  const [autoTried, setAutoTried] = useState(false)
  const [keySet, setKeySet] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [stats, setStats] = useState<LibraryStats | null>(null)

  // The sync runs in main and survives navigation. On (re)mount, ask main for the
  // real state so we resume the progress bar instead of restarting from 0, and
  // subscribe to live updates. Terminal phases flip us out of the syncing state.
  useEffect(() => {
    window.api.secrets.has('steamApiKey').then(setKeySet)
    window.api.library.syncState().then((st) => {
      if (st.running) {
        setSyncing(true)
        if (st.progress) setProgress(st.progress)
      }
    })
    return window.api.enrich.onProgress((p) => {
      setProgress(p)
      const terminal = p.phase === 'done' || p.phase === 'paused' || p.phase === 'error'
      setSyncing(!terminal)
      if (terminal) {
        setCancelling(false)
        void reload()
      }
    })
  }, [reload])

  // Refresh the analyzed-stats whenever the library data changes (scan/sync/reload).
  useEffect(() => {
    window.api.library.stats().then(setStats)
  }, [games])

  // Setup-free: auto-scan once on first load if the mirror is empty.
  useEffect(() => {
    if (!loading && games.length === 0 && !autoTried && !scanning) {
      setAutoTried(true)
      scan()
        .then(setScanInfo)
        .catch(() => {})
    }
  }, [loading, games.length, autoTried, scanning, scan])

  const startSync = () => {
    setSyncing(true)
    setProgress({ phase: 'owned', total: 1, done: 0, message: 'Starting…' })
    void window.api.library.syncFull()
  }

  const cancelSync = () => {
    setCancelling(true)
    window.api.library.cancelSync()
  }

  const rescan = () => {
    scan().then(setScanInfo)
  }

  return {
    scanInfo,
    keySet,
    syncing,
    cancelling,
    progress,
    stats,
    startSync,
    cancelSync,
    rescan,
  }
}

export { useLibrarySync }
