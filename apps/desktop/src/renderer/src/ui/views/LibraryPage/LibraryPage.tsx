import './LibraryPage.css'
import { useCallback, useMemo } from 'react'
import { useLibrary } from '@/hooks/useLibrary'
import { useFilterState } from '@/hooks/useFilterState'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { GameFilters } from '@ui/compounds/GameFilters'
import { LibraryGameList } from '@ui/compounds/LibraryGameList'
import { SortControls } from '@ui/compounds/SortControls'
import type { FilterSpec } from '@shared/filter'
import { useAgentLibraryActions } from './behavior/useAgentLibraryActions'
import { useLibrarySync } from './behavior/useLibrarySync'
import { useLibrarySelection } from './behavior/useLibrarySelection'
import { useLibraryDetail } from './behavior/useLibraryDetail'
import { LibraryHeader } from './sub-components/LibraryHeader'
import { LibraryNotices } from './sub-components/LibraryNotices'
import { LibraryDetailPane } from './sub-components/LibraryDetailPane'

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
  const { selected, select } = useLibrarySelection(filtered)
  const detail = useLibraryDetail(selected)

  const { spec, setSpec } = flt
  const handleSort = useCallback(
    (patch: Partial<FilterSpec>) => setSpec({ ...spec, ...patch }),
    [spec, setSpec],
  )

  const busy = scanning || syncing

  return (
    <Box className="lib-page">
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

      <LibraryNotices stats={stats} keySet={keySet} scanInfo={scanInfo} progress={progress} busy={busy} />

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
      <Box className="row lib-toolbar">
        <Box as="span" className="muted lib-count">{filtered.length} shown</Box>
        <SortControls value={flt.spec} onChange={handleSort} />
      </Box>

      {loading || (scanning && games.length === 0) ? (
        <Box as="p" className="muted">Reading your Steam install…</Box>
      ) : games.length === 0 ? (
        <Box as="p" className="muted">No games found yet — click Rescan local.</Box>
      ) : (
        <Box className="lib-md">
          <Box className="lib-md-list">
            {filtered.length > 0 ? (
              <LibraryGameList games={filtered} selectedAppid={selected?.appid ?? null} onSelect={select} />
            ) : (
              <Box as="p" className="muted lib-md-list-empty">No games match these filters.</Box>
            )}
          </Box>
          <LibraryDetailPane
            game={detail.game}
            extrasLoading={detail.extrasLoading}
            sanitized={detail.sanitized}
            reqs={detail.reqs}
            autoplay={detail.autoplay}
            onOpen={detail.open}
          />
        </Box>
      )}
    </Box>
  )
}

export { LibraryPage }
