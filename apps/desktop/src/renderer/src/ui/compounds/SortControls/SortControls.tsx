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

/** Compact sort dropdowns operating on a FilterSpec. Lives in an always-visible
 *  toolbar (a page row, or the filter panel's top bar on the Library). `sorts`
 *  overrides the option list (e.g. the Wishlist tab adds priority / date-added);
 *  `size="sm"` fits a slim bar. */
const SortControls = ({
  value,
  onChange,
  sorts = DEFAULT_SORTS,
  size = 'md',
}: {
  value: FilterSpec
  onChange: (patch: Partial<FilterSpec>) => void
  sorts?: SortOption[]
  size?: 'sm' | 'md'
}) => {
  const dir = value.sortDir ?? (value.sortBy === 'name' ? 'asc' : 'desc')
  return (
    <Box className="sort-controls">
      <Box as="span" className="muted sort-label">
        Sort
      </Box>
      <Select
        variant="field"
        size={size}
        title="Sort by"
        value={value.sortBy ?? 'name'}
        onChange={(v) => onChange({ sortBy: v as SortKey })}
        options={sorts.map((s) => ({ value: s.key, label: s.label }))}
      />
      <Select
        variant="field"
        size={size}
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
