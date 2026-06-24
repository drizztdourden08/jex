import { useCallback, useEffect, useState } from 'react'
import type { Game, ScanResult } from '@shared/library'

/**
 * Loads the library mirror from main (over IPC) into component state, and exposes
 * a `scan()` that re-reads the local Steam install. The renderer keeps the full
 * set in memory and runs the FilterSpec engine over it.
 */
const useLibrary = () => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setGames(await window.api.library.getAll())
    } finally {
      setLoading(false)
    }
  }, [])

  const scan = useCallback(async (): Promise<ScanResult> => {
    setScanning(true)
    try {
      const result = await window.api.library.scanLocal()
      setGames(await window.api.library.getAll())
      return result
    } finally {
      setScanning(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { games, loading, scanning, reload, scan }
}

export { useLibrary }
