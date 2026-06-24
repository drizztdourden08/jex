import { useMemo } from 'react'
import { useLibrary } from '@/hooks/useLibrary'
import { useFilterState } from '@/hooks/useFilterState'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { GameCard } from '@ui/compounds/GameCard'
import { GameFilters } from '@ui/compounds/GameFilters'
import { LazyGrid } from '@ds/composites/LazyGrid'
import { SortControls } from '@ui/compounds/SortControls'
import { useAgentLibraryActions } from './behavior/useAgentLibraryActions'
import { useLibrarySync } from './behavior/useLibrarySync'
import { ProgressBar } from './sub-components/ProgressBar'
import { LibraryHeader } from './sub-components/LibraryHeader'

const relTime = (ms: number): string => {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

const LibraryPage = () => {
  const { games: allGames, loading, scanning, scan, reload } = useLibrary()
  // The Library shows owned/installed games only — wishlist-only entries (added by
  // the wishlist sync) live in the Wishlist view, not here.
  const games = useMemo(() => allGames.filter((g) => g.owned || g.installed), [allGames])
  const flt = useFilterState()
  useAgentLibraryActions(flt)
  const { scanInfo, keySet, syncing, cancelling, progress, stats, startSync, cancelSync, rescan } =
    useLibrarySync({ games, loading, scanning, scan, reload })

  const filtered = useMemo(() => flt.filterAndSort(games), [games, flt.filterAndSort])
  const installed = useMemo(() => games.filter((g) => g.installed).length, [games])
  const owned = useMemo(() => games.filter((g) => g.owned).length, [games])

  const busy = scanning || syncing

  return (
    <Box>
      <LibraryHeader
        total={games.length}
        installed={installed}
        owned={owned}
        scanning={scanning}
        syncing={syncing}
        cancelling={cancelling}
        keySet={keySet}
        busy={busy}
        onRescan={rescan}
        onStartSync={startSync}
        onCancelSync={cancelSync}
      />

      {stats && stats.total > 0 && (
        <Box as="p" className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 13 }}>
          {stats.enriched} with full metadata
          {stats.pending > 0 ? ` · ${stats.pending} pending` : ''}
          {stats.noStorePage > 0 ? ` · ${stats.noStorePage} no store page` : ''}
          {stats.lastEnrich ? ` · last synced ${relTime(stats.lastEnrich)}` : ''}
        </Box>
      )}

      {!keySet && (
        <Box className="panel">
          Showing installed games. Add a Steam Web API key in Settings to pull your full
          owned library (incl. not-installed) and metadata.
        </Box>
      )}

      {scanInfo && !scanInfo.detected.steamPath && (
        <Box className="panel">Couldn't find a Steam install on this PC.</Box>
      )}

      {progress && busy && <ProgressBar p={progress} />}
      {progress?.phase === 'error' && !busy && (
        <Box className="panel" style={{ color: 'var(--danger)' }}>{progress.message}</Box>
      )}
      {progress?.phase === 'paused' && !busy && (
        <Box className="panel muted">Sync cancelled — click "Sync owned + metadata" to resume where it left off.</Box>
      )}

      <GameFilters
        games={games}
        mode={flt.mode}
        setMode={flt.setMode}
        spec={flt.spec}
        setSpec={flt.setSpec}
        query={flt.query}
        setQuery={flt.setQuery}
        dirty={flt.dirty}
        reset={flt.reset}
        headerRight={
          flt.activeCount > 0 ? (
            <Button
              variant="ghost"
              onClick={flt.reset}
              title="Clear filters"
              style={{ color: 'var(--text-2)' }}
            >
              ✕ Clear
            </Button>
          ) : undefined
        }
      />

      {/* Sort + result count live with the list, separate from filtering. */}
      <Box className="row" style={{ margin: '12px 0' }}>
        <Box as="span" className="muted">{filtered.length} shown</Box>
        <Box as="span" style={{ marginLeft: 'auto' }} />
        <SortControls value={flt.spec} onChange={(patch) => flt.setSpec({ ...flt.spec, ...patch })} />
      </Box>

      {loading || (scanning && games.length === 0) ? (
        <Box as="p" className="muted">Reading your Steam install…</Box>
      ) : games.length === 0 ? (
        <Box as="p" className="muted">No games found yet — click Rescan local.</Box>
      ) : (
        <LazyGrid items={filtered} render={(g) => <GameCard key={g.appid} game={g} />} />
      )}
    </Box>
  )
}

export { LibraryPage }
