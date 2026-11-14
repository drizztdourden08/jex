import { useEffect, useRef, useState } from 'react'
import type { Game, LibraryStats, ScanResult, SyncProgress } from '@shared/library'
import { useSyncStatus } from '@/store/syncStatus'

type Params = {
  games: Game[]
  loading: boolean
  scanning: boolean
  scan: () => Promise<ScanResult>
  reload: () => Promise<void> | void
}

const REFRESH_MS = 8000

/**
 * The Library's side of the scan/sync. The sync state itself is app-wide (the
 * sync-status store, fed from main by the TitleBar); here we drive it, mirror the
 * local rescan into it, and reload the list as owned rows and metadata land.
 */
const useLibrarySync = ({ games, loading, scanning, scan, reload }: Params) => {
  const [scanInfo, setScanInfo] = useState<ScanResult | null>(null)
  const [autoTried, setAutoTried] = useState(false)
  const [keySet, setKeySet] = useState(false)
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const lastRefresh = useRef(0)
  const lastPhase = useRef<SyncProgress['phase'] | null>(null)
  const syncing = useSyncStatus((s) => s.syncing)
  const cancelling = useSyncStatus((s) => s.cancelling)
  const startSync = useSyncStatus((s) => s.start)
  const cancelSync = useSyncStatus((s) => s.cancel)
  const setScanning = useSyncStatus((s) => s.setScanning)

  useEffect(() => {
    window.api.secrets.has('steamApiKey').then(setKeySet).catch(() => {})
  }, [])

  // Owned rows land when the phase flips owned -> enrich; then refresh quietly,
  // throttled, as enrichment fills in metadata, and once more when the sync ends.
  useEffect(
    () =>
      window.api.enrich.onProgress((p) => {
        const now = Date.now()
        const ownedLanded = p.phase === 'enrich' && lastPhase.current !== 'enrich'
        lastPhase.current = p.phase
        if (p.phase === 'enrich' && (ownedLanded || now - lastRefresh.current > REFRESH_MS)) {
          lastRefresh.current = now
          void reload()
        }
        if (p.phase === 'done' || p.phase === 'paused' || p.phase === 'error') void reload()
      }),
    [reload],
  )

  // Mirror the local rescan into the app-wide status (the title-bar activity icon).
  useEffect(() => setScanning(scanning), [scanning, setScanning])
  useEffect(() => () => setScanning(false), [setScanning])

  // Refresh the analyzed-stats whenever the library data changes (scan/sync/reload).
  useEffect(() => {
    let active = true
    window.api.library
      .stats()
      .then((s) => active && setStats(s))
      .catch(() => {})
    return () => {
      active = false
    }
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

  const rescan = () => {
    scan()
      .then(setScanInfo)
      .catch(() => {})
  }

  return { scanInfo, keySet, syncing, cancelling, stats, startSync, cancelSync, rescan }
}

export { useLibrarySync }
