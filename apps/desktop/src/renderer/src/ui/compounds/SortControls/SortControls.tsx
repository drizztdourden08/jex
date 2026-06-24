import { Box } from '@ds/primitives/layout/Box'
import { Select } from '@ds/primitives/form/Select'
import type { FilterSpec, SortKey } from '@shared/filter'

type SortOption = { key: SortKey; label: string }

const DEFAULT_SORTS: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'playtimeForever', label: 'Playtime' },
  { key: 'lastPlayed', label: 'Last played' },
  { key: 'releaseYear', label: 'Release year' },
  { key: 'metacritic', label: 'Metacritic' },
  { key: 'reviewTotal', label: 'Reviews' },
]

/** Compact sort dropdowns operating on a FilterSpec. Lives in toolbar rows (not
 *  inside the filter panel) so it's always reachable. `sorts` overrides the option
 *  list (e.g. the Wishlist tab adds priority / date-added). */
const SortControls = ({
  value,
  onChange,
  sorts = DEFAULT_SORTS,
}: {
  value: FilterSpec
  onChange: (patch: Partial<FilterSpec>) => void
  sorts?: SortOption[]
}) => {
  const dir = value.sortDir ?? (value.sortBy === 'name' ? 'asc' : 'desc')
  return (
    <Box className="sort-controls">
      <Box as="span" className="muted sort-label">
        Sort
      </Box>
      <Select
        variant="field"
        title="Sort by"
        value={value.sortBy ?? 'name'}
        onChange={(v) => onChange({ sortBy: v as SortKey })}
        options={sorts.map((s) => ({ value: s.key, label: s.label }))}
      />
      <Select
        variant="field"
        title="Order"
        value={dir}
        onChange={(v) => onChange({ sortDir: v as 'asc' | 'desc' })}
        options={[
          { value: 'asc', label: 'Asc' },
          { value: 'desc', label: 'Desc' },
        ]}
      />
    </Box>
  )
}

export { SortControls, DEFAULT_SORTS }
export type { SortOption }
