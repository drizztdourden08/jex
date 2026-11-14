import { useEffect, useMemo, useState } from 'react'
import type { Game } from '@shared/library'

const ACTIVE_DEBOUNCE_MS = 250

/**
 * The Library's selected game. Falls back to the first visible game when nothing
 * is picked or the pick is filtered out, so the detail pane is never stale. The
 * selection is reported to the enrichment scheduler (debounced, so arrow-keying
 * does not churn it, and so it lands after Layout's own per-route report).
 */
const useLibrarySelection = (games: Game[]) => {
  const [picked, setPicked] = useState<number | null>(null)
  const selected = useMemo(
    () => games.find((g) => g.appid === picked) ?? games[0] ?? null,
    [games, picked],
  )
  const selectedAppid = selected?.appid ?? null

  useEffect(() => {
    if (selectedAppid == null) return
    const t = window.setTimeout(() => {
      window.api.enrich.setActive({ tab: 'library', appid: selectedAppid }).catch(() => {})
    }, ACTIVE_DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [selectedAppid])

  return { selected, select: setPicked }
}

export { useLibrarySelection }
