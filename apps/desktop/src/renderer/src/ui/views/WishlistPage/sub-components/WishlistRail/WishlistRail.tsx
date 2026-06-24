import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { RenameField } from '../RenameField'
import type { WishlistGroup } from '@shared/wishlist'

type Selection = number | 'all'

type Props = {
  groups: WishlistGroup[]
  selected: Selection
  readyCount: number
  renaming: number | null
  countFor: (sel: Selection) => number
  onSelect: (sel: Selection) => void
  onCommitRename: (id: number, name: string) => void
  onCancelRename: () => void
  onStartRename: (id: number) => void
  onRemove: (id: number) => void
  onCreate: () => void
}

const WishlistRail = ({
  groups,
  selected,
  readyCount,
  renaming,
  countFor,
  onSelect,
  onCommitRename,
  onCancelRename,
  onStartRename,
  onRemove,
  onCreate,
}: Props) => (
  <Box as="aside" className="wl-rail">
    <Box className="wl-rail-head">Wishlists</Box>

    <Button
      variant="ghost"
      className={`wl-rail-item${selected === 'all' ? ' active' : ''}`}
      onClick={() => onSelect('all')}
    >
      <Box as="span" className="wl-rail-name">Main wishlist</Box>
      <Box as="span" className="wl-rail-count">{readyCount}</Box>
    </Button>

    <Box className="wl-rail-divider" aria-hidden />

    {groups.map((g) =>
      renaming === g.id ? (
        <RenameField
          key={g.id}
          initial={g.name}
          onCommit={(name) => onCommitRename(g.id, name)}
          onCancel={onCancelRename}
        />
      ) : (
        <Box key={g.id} className={`wl-rail-item${selected === g.id ? ' active' : ''}`}>
          <Button variant="ghost" className="wl-rail-name" onClick={() => onSelect(g.id)}>
            {g.name}
            {g.filterSpec && (
              <Box as="span" className="wl-rail-smart" title="Smart list (saved filter)">
                ⚡
              </Box>
            )}
          </Button>
          <Box as="span" className="wl-rail-count">{countFor(g.id)}</Box>
          <Box as="span" className="wl-rail-actions">
            <IconButton label="Rename" title="Rename" onClick={() => onStartRename(g.id)}>
              ✎
            </IconButton>
            <IconButton label="Delete" title="Delete" onClick={() => onRemove(g.id)}>
              ✕
            </IconButton>
          </Box>
        </Box>
      ),
    )}

    <Button variant="ghost" className="wl-rail-create" onClick={onCreate}>
      ＋ New sub-wishlist
    </Button>
  </Box>
)

export { WishlistRail }
export type { Props as WishlistRailProps, Selection }
