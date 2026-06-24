import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { SearchResultCard } from '@ui/compounds/SearchResultCard'
import { GameFilters } from '@ui/compounds/GameFilters'
import { SortControls } from '@ui/compounds/SortControls'
import { SEARCH_PAGE_SIZE } from '@shared/search'
import { BUFFER_PAGES, CATALOG_SORTS } from './SearchPage.constants'
import { useCatalogSearch } from './behavior/useCatalogSearch'
import { activeFacetCount } from './behavior/activeFacetCount'
import { Pager } from './sub-components/Pager'
import { StoreNativeFilters } from './sub-components/StoreNativeFilters'

/**
 * Native whole-catalog Search. Basic/Normal filter server-side (Steam store search,
 * paged in fixed batches — no infinite scroll) with store-native filters only (the
 * facets Steam can actually honor + price/sale/OS). Advanced can't be expressed as
 * Steam params, so it filters a fetched BUFFER of the top results client-side. All
 * state lives in a store, so opening a result and returning never re-runs anything.
 */
const SearchPage = () => {
  const {
    games,
    ownedByAppid,
    s,
    mode,
    spec,
    query,
    page,
    advanced,
    vocab,
    facets,
    loading,
    bufferGames,
    total,
    scanned,
    maxPage,
    results,
    rangeStart,
    rangeEnd,
  } = useCatalogSearch()

  return (
    <Box>
      <Box className="row" style={{ justifyContent: 'space-between' }}>
        <Box as="h1">Search</Box>
      </Box>
      <Box as="p" className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 13 }}>
        Search the whole Steam catalog — not just your library. Open any result for full
        details; it's cached as you go.
      </Box>

      {!vocab && (
        <Box className="panel muted">
          Filters use Steam's full tag list. Sync it once in <Box as="strong">Settings → Search
          filters</Box> to enable faceted catalog filtering.
        </Box>
      )}

      <GameFilters
        games={advanced ? bufferGames : games}
        mode={mode}
        setMode={s.setMode}
        spec={spec}
        setSpec={s.setSpec}
        query={query}
        setQuery={s.setQuery}
        dirty={false}
        reset={s.reset}
        facets={facets}
        omit={['installed', 'unplayed', 'free']}
        hideScores
        headerRight={
          activeFacetCount(spec) > 0 ? (
            <Button variant="ghost" onClick={s.reset} title="Clear filters" style={{ color: 'var(--text-2)' }}>
              ✕ Clear
            </Button>
          ) : undefined
        }
      />

      {advanced && (
        <Box as="p" className="muted" style={{ margin: '8px 2px', fontSize: 12 }}>
          Advanced filters the top {scanned || BUFFER_PAGES * SEARCH_PAGE_SIZE} results for your
          term/sort client-side (Steam's catalog API has no boolean query). Narrow with a term
          or sort to focus the sample.
        </Box>
      )}

      {/* Store-native filters (price + sales) — things unique to the storefront. */}
      {!advanced && <StoreNativeFilters spec={spec} setSpec={s.setSpec} />}

      <Box className="row" style={{ margin: '12px 0' }}>
        <Box as="span" className="muted">
          {total > 0
            ? `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${total.toLocaleString()}${advanced ? ` matched (top ${scanned.toLocaleString()} scanned)` : ''}`
            : ''}
        </Box>
        <Box as="span" style={{ marginLeft: 'auto' }} />
        <SortControls value={spec} onChange={(patch) => s.setSpec({ ...spec, ...patch })} sorts={CATALOG_SORTS} />
      </Box>

      {loading && results.length === 0 ? (
        <Box as="p" className="muted">Searching…</Box>
      ) : results.length === 0 ? (
        <Box as="p" className="muted">
          {advanced
            ? 'No results match — loosen the query or widen the term/sort.'
            : spec.text
              ? `No results for "${spec.text}".`
              : 'No results.'}
        </Box>
      ) : (
        <>
          <Box className="grid" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
            {results.map((r) => (
              <SearchResultCard key={r.appid} result={r} owned={ownedByAppid.get(r.appid)} />
            ))}
          </Box>
          <Pager page={page} maxPage={maxPage} disabled={loading} onChange={s.setPage} />
        </>
      )}
    </Box>
  )
}

export { SearchPage }
