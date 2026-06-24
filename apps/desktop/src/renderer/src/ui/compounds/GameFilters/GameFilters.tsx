import { FilterPanel, ResetOverlay } from '@ds/composites/FilterPanel'
import { Box } from '@ds/primitives/layout/Box'
import { TextInput } from '@ds/primitives/form/TextInput'
import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'
import { GameQuery } from '@ui/compounds/GameQuery'
import type { FilterMode } from '@/hooks/useFilterState'
import { ALL_MODES } from './GameFilters.constants'
import type { Props } from './GameFilters.type'
import { NormalFilters } from './sub-components/NormalFilters'

const GameFilters = ({
  games,
  mode,
  setMode,
  spec,
  setSpec,
  query,
  setQuery,
  dirty,
  reset,
  headerRight,
  omit,
  facets,
  modes = ALL_MODES,
  hideScores,
}: Props) => {
  const basicOverlay = dirty && mode === 'basic'
  const bodyDirty = dirty && mode === 'normal'
  const topbar = (
    <>
      <SegmentedControl
        options={modes.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
        value={mode}
        onChange={(v) => setMode(v as FilterMode)}
      />
      {mode === 'basic' && (
        <Box className="filter-text-wrap">
          <TextInput
            className="filter-text"
            placeholder="Filter by name…"
            value={spec.text ?? ''}
            onChange={(e) => setSpec({ ...spec, text: e.currentTarget.value || undefined })}
          />
          {basicOverlay && <ResetOverlay onClick={reset} compact />}
        </Box>
      )}
      {mode === 'advanced' && !dirty && (
        <Box as="span" className="muted" style={{ fontSize: 12 }}>
          Build any AND / OR formula across every field. Drag ⠿ to reorder.
        </Box>
      )}
      {headerRight && <Box className="filter-header-right">{headerRight}</Box>}
    </>
  )
  return (
    <FilterPanel topbar={topbar} dirty={bodyDirty} reset={reset}>
      {mode === 'advanced' ? (
        <GameQuery query={query} onChange={setQuery} games={games} />
      ) : mode === 'normal' ? (
        <NormalFilters games={games} value={spec} onChange={setSpec} omit={omit} facets={facets} hideScores={hideScores} />
      ) : null}
    </FilterPanel>
  )
}

export { GameFilters }
