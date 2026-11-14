import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import type { Game } from '@shared/library'

const FRESH_MS = 10 * 60 * 1000
const RESCAN_MS = 60 * 1000

// Module-level so it persists across mounts: one rescan covers every game, so it is
// not repeated for each game opened in quick succession.
let lastLocalRescan = 0

type UseGameDetailParams = {
  id: number
  name?: string
  /** A copy already in memory (the library list's): shown at once instead of a skeleton. */
  seed?: Game | null
  /** Wait this long before any IPC, so arrow-keying through a list stays quiet. */
  delayMs?: number
  /** Metadata younger than this skips the Store API refetch (the API is IP-rate-limited). */
  freshMs?: number
}

/**
 * Staged detail load for one game: the cached mirror row first, then the Store API
 * core details, then the slow extras (reviews, players, tags, Metacritic, HLTB).
 */
const useGameDetail = ({ id, name, seed, delayMs = 0, freshMs = FRESH_MS }: UseGameDetailParams) => {
  const [game, setGame] = useState<Game | null>(seed ?? null)
  const [loading, setLoading] = useState(!seed)
  const [extrasLoading, setExtrasLoading] = useState(false)
  const seedRef = useRef(seed)
  seedRef.current = seed

  useEffect(() => {
    let active = true
    const initial = seedRef.current?.appid === id ? seedRef.current : null
    setGame(initial)
    setLoading(!initial)
    setExtrasLoading(false)

    const run = async () => {
      const cached = await window.api.library.get(id).catch(() => null)
      if (!active) return
      if (cached) {
        setGame(cached)
        setLoading(false)
        if (Date.now() - lastLocalRescan > RESCAN_MS) {
          lastLocalRescan = Date.now()
          window.api.library
            .scanLocal()
            .then(() => window.api.library.get(id))
            .then((r) => active && r && setGame(r))
            .catch(() => {})
        }
      }

      const fresh =
        cached?.enrichment === 'enriched' &&
        cached.enrichedAt != null &&
        Date.now() - cached.enrichedAt < freshMs
      if (fresh || cached?.enrichment === 'no-store-page') {
        setLoading(false)
        return
      }

      const core = await window.api.library.detailCore(id, name).catch(() => null)
      if (!active) return
      if (core) setGame(core)
      setLoading(false)

      setExtrasLoading(true)
      const full = await window.api.library.detailExtras(id).catch(() => null)
      if (!active) return
      if (full) setGame(full)
      setExtrasLoading(false)
    }

    const timer = window.setTimeout(() => void run(), delayMs)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [id])

  // A reloaded list hands in a newer copy of the same game (install state, a sync):
  // take it unless what is on screen is fresher.
  useEffect(() => {
    if (!seed || seed.appid !== id) return
    setGame((cur) =>
      !cur || cur.appid !== id || (seed.enrichedAt ?? 0) >= (cur.enrichedAt ?? 0) ? seed : cur,
    )
  }, [seed])

  const sanitized = useMemo(() => {
    const html = game?.detailedHtml || game?.aboutHtml
    return html ? DOMPurify.sanitize(html) : null
  }, [game?.detailedHtml, game?.aboutHtml])

  const reqs = useMemo(() => {
    const min = game?.requirementsMin ? DOMPurify.sanitize(game.requirementsMin) : null
    const rec = game?.requirementsRec ? DOMPurify.sanitize(game.requirementsRec) : null
    return min || rec ? { min, rec } : null
  }, [game?.requirementsMin, game?.requirementsRec])

  return { game, setGame, loading, extrasLoading, sanitized, reqs }
}

export { useGameDetail }
export type { UseGameDetailParams }
