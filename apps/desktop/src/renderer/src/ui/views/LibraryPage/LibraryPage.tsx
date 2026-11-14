import './LibraryPage.css'
import { useCallback, useMemo } from 'react'
import { useLibrary } from '@/hooks/useLibrary'
import { useFilterState } from '@/hooks/useFilterState'
import { Box } from '@ds/primitives/layout/Box'
import { LazyGrid } from '@ds/composites/LazyGrid'
import { GameCard } from '@ui/compounds/GameCard'
import { GameFilters } from '@ui/compounds/GameFilters'
import { LibraryGameList } from '@ui/compounds/LibraryGameList'
import type { FilterSpec } from '@shared/filter'
import type { Game } from '@shared/library'
import { useAgentLibraryActions } from './behavior/useAgentLibraryActions'
import { useLibrarySync } from './behavior/useLibrarySync'
import { useLibrarySelection } from './behavior/useLibrarySelection'
import { useLibraryDetail } from './behavior/useLibraryDetail'
import { useLibraryDisplay } from './behavior/useLibraryDisplay'
import { LibraryHeader } from './sub-components/LibraryHeader'
import { LibraryNotices } from './sub-components/LibraryNotices'
import { LibraryToolbar } from './sub-components/LibraryToolbar'
import { LibraryDetailPane } from './sub-components/LibraryDetailPane'

const NO_GAMES: Game[] = []
const renderCard = (g: Game) => <GameCard key={g.appid} game={g} />

const LibraryPage = () => {
  const { games: allGames, loading, scanning, scan, reload } = useLibrary()
  // The Library shows owned/installed games only — wishlist-only entries (added by
  // the wishlist sync) live in the Wishlist view, not here.
  const games = useMemo(() => allGames.filter((g) => g.owned || g.installed), [allGames])
  const flt = useFilterState()
  useAgentLibraryActions(flt)
  const { scanInfo, keySet, syncing, cancelling, stats, startSync, cancelSync, rescan } =
    useLibrarySync({ games, loading, scanning, scan, reload })
  const { display, setDisplay } = useLibraryDisplay()

  const filtered = useMemo(() => flt.filterAndSort(games), [games, flt.filterAndSort])
  const installed = useMemo(() => games.filter((g) => g.installed).length, [games])
  const owned = useMemo(() => games.filter((g) => g.owned).length, [games])
  const isList = display === 'list'
  const { selected, select } = useLibrarySelection(isList ? filtered : NO_GAMES)
  const detail = useLibraryDetail(selected)

  const { spec, setSpec, query, mode } = flt
  const handleSort = useCallback(
    (patch: Partial<FilterSpec>) => setSpec({ ...spec, ...patch }),
    [spec, setSpec],
  )
  // The card grid jumps back to its first page only when the query changes, not on
  // every data reload during a sync.
  const gridKey = useMemo(() => ({ spec, query, mode }), [spec, query, mode])

  const busy = scanning || syncing

  return (
    <Box className={isList ? 'lib-page lib-page--list' : 'lib-page'}>
      <LibraryHeader
        total={games.length}
        installed={installed}
        owned={owned}
        stats={stats}
        scanning={scanning}
        syncing={syncing}
        cancelling={cancelling}
        keySet={keySet}
        busy={busy}
        onRescan={rescan}
        onStartSync={startSync}
        onCancelSync={cancelSync}
      />

      <LibraryNotices keySet={keySet} scanInfo={scanInfo} />

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
          <LibraryToolbar
            shown={filtered.length}
            spec={flt.spec}
            onSort={handleSort}
            display={display}
            onDisplay={setDisplay}
            canClear={flt.activeCount > 0}
            onClear={flt.reset}
          />
        }
      />

      {loading || (scanning && games.length === 0) ? (
        <Box as="p" className="muted">Reading your Steam install…</Box>
      ) : games.length === 0 ? (
        <Box as="p" className="muted">No games found yet — click Rescan local.</Box>
      ) : !isList ? (
        <LazyGrid items={filtered} render={renderCard} resetKey={gridKey} />
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
