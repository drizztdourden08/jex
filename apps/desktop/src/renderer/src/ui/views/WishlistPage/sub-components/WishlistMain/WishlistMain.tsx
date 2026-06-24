import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { GameCard } from '@ui/compounds/GameCard'
import { GameFilters } from '@ui/compounds/GameFilters'
import { LazyGrid } from '@ds/composites/LazyGrid'
import { SortControls } from '@ui/compounds/SortControls'
import { AddToGroupButton } from '../AddToGroupButton'
import { WISHLIST_SORTS, cardSubtitle } from '../../behavior/wishlist-utils'
import type { WishlistMainProps } from './WishlistMain.type'
import type { Game } from '@shared/library'

const WishlistMain = ({
  selected,
  activeGroup,
  base,
  ready,
  wishlist,
  filtered,
  loading,
  syncing,
  pendingCount,
  progress,
  hint,
  flt,
  groups,
  openMenu,
  canSaveFilter,
  onSync,
  onCreateAndEdit,
  onSaveFilterToGroup,
  onSetOpenMenu,
  onToggleManual,
}: WishlistMainProps) => (
  <Box as="section" className="wl-main">
    <Box className="row" style={{ justifyContent: 'space-between' }}>
      <Box as="h1">
        {selected === 'all' ? 'Wishlist' : activeGroup?.name}{' '}
        <Box as="span" className="muted" style={{ fontSize: 14 }}>
          {base.length} {selected === 'all' ? 'items' : 'in this list'}
        </Box>
      </Box>
      <Box className="row">
        <Button variant="secondary" onClick={() => void onSync()} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Refresh wishlist'}
        </Button>
      </Box>
    </Box>

    {pendingCount > 0 && (
      <Box className="panel wl-syncbar">
        <Box className="row" style={{ justifyContent: 'space-between' }}>
          <Box as="span">
            ⏳ Syncing metadata — {pendingCount} item{pendingCount === 1 ? '' : 's'} may be
            missing until this finishes.
          </Box>
          {progress && progress.phase === 'enrich' && progress.total > 0 && (
            <Box as="span" className="muted">
              {progress.done}/{progress.total}
            </Box>
          )}
        </Box>
        <Box className="progress" style={{ marginTop: 8 }}>
          <Box
            as="span"
            style={{
              width: `${
                progress && progress.total > 0
                  ? Math.round((progress.done / progress.total) * 100)
                  : 8
              }%`,
            }}
          />
        </Box>
      </Box>
    )}

    {hint && <Box className="panel muted">{hint}</Box>}

    <GameFilters
      games={ready}
      mode={flt.mode}
      setMode={flt.setMode}
      spec={flt.spec}
      setSpec={flt.setSpec}
      query={flt.query}
      setQuery={flt.setQuery}
      dirty={flt.dirty}
      reset={flt.reset}
      omit={['installed', 'unplayed']}
    />

    <Box className="row" style={{ margin: '12px 0' }}>
      <Box as="span" className="muted">{filtered.length} shown</Box>
      {canSaveFilter && (
        <Button
          variant="secondary"
          style={{ marginLeft: 12 }}
          onClick={() => void onCreateAndEdit({ ...flt.spec })}
        >
          Save filter as sub-wishlist
        </Button>
      )}
      {activeGroup && flt.activeCount > 0 && flt.mode !== 'advanced' && (
        <Button
          variant="secondary"
          style={{ marginLeft: 8 }}
          onClick={() => void onSaveFilterToGroup()}
          title="Replace this list's saved filter with the current one"
        >
          Update “{activeGroup.name}” filter
        </Button>
      )}
      <Box as="span" style={{ marginLeft: 'auto' }} />
      <SortControls
        value={flt.spec}
        sorts={WISHLIST_SORTS}
        onChange={(patch) => flt.setSpec({ ...flt.spec, ...patch })}
      />
    </Box>

    {loading ? (
      <Box as="p" className="muted">Loading wishlist…</Box>
    ) : wishlist.length === 0 ? (
      <Box as="p" className="muted">
        {syncing ? 'Syncing your wishlist…' : 'Your wishlist is empty (or set to private).'}
      </Box>
    ) : filtered.length === 0 ? (
      <Box as="p" className="muted">
        {selected !== 'all' &&
        activeGroup &&
        !activeGroup.filterSpec &&
        activeGroup.manualAppids.length === 0
          ? 'This sub-wishlist is empty — pin games with the ＋ on a card, or save a filter into it.'
          : 'Nothing matches — adjust the filter.'}
      </Box>
    ) : (
      <LazyGrid
        items={filtered}
        render={(g: Game) => (
          <GameCard
            key={g.appid}
            game={g}
            showStatus={false}
            subtitle={cardSubtitle(g)}
            action={
              <AddToGroupButton
                appid={g.appid}
                groups={groups}
                open={openMenu === g.appid}
                onToggleOpen={() => onSetOpenMenu((cur) => (cur === g.appid ? null : g.appid))}
                onToggle={onToggleManual}
              />
            }
          />
        )}
      />
    )}
  </Box>
)

export { WishlistMain }
export type { WishlistMainProps } from './WishlistMain.type'
