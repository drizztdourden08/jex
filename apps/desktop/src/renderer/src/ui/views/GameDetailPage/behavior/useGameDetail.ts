import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import type { Game } from '@shared/library'

const FRESH_MS = 10 * 60 * 1000 // skip refetch-on-open if metadata is younger than this
const RESCAN_MS = 60 * 1000 // throttle the local install re-scan across navigations

// Module-level so it persists across detail-page mounts (a single rescan covers
// every game, so we don't repeat it for each one the user opens in quick succession).
let lastLocalRescan = 0

type UseGameDetailParams = {
  id: number
  name?: string
}

const useGameDetail = ({ id, name }: UseGameDetailParams) => {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true) // no core data yet → full skeleton
  const [extrasLoading, setExtrasLoading] = useState(false) // stage-2 (reviews/tags/…) in flight

  useEffect(() => {
    let active = true
    setLoading(true)
    setExtrasLoading(false)
    setGame(null)
    void (async () => {
      // 1) Show whatever's cached instantly (skeletons fill in for the rest).
      const cached = await window.api.library.get(id).catch(() => null)
      if (!active) return
      if (cached) {
        setGame(cached)
        setLoading(false)
        // Re-check local install state/art on open (throttled — one scan covers all).
        if (Date.now() - lastLocalRescan > RESCAN_MS) {
          lastLocalRescan = Date.now()
          window.api.library
            .scanLocal()
            .then(() => window.api.library.get(id))
            .then((r) => active && r && setGame(r))
            .catch(() => {})
        }
      }

      // Skip the network if metadata was fetched recently, or the page is delisted.
      const fresh =
        cached?.enrichment === 'enriched' &&
        cached.enrichedAt != null &&
        Date.now() - cached.enrichedAt < FRESH_MS
      if (fresh || cached?.enrichment === 'no-store-page') {
        setLoading(false)
        return
      }

      // 2) Stage 1 — core (appdetails): name/media/description/price/genres/…
      const core = await window.api.library.detailCore(id, name).catch(() => null)
      if (!active) return
      if (core) setGame(core)
      setLoading(false)

      // 3) Stage 2 — slow extras: reviews, players, tags, Metacritic, HLTB.
      setExtrasLoading(true)
      const full = await window.api.library.detailExtras(id).catch(() => null)
      if (!active) return
      if (full) setGame(full)
      setExtrasLoading(false)
    })()
    return () => {
      active = false
    }
  }, [id])

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
