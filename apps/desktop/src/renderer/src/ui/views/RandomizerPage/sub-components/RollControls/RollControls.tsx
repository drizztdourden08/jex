import type { WeightMode } from '@/lib/query/randomizer'
import type { FilterSpec } from '@shared/filter'
import { SortControls } from '@ui/compounds/SortControls'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { Select } from '@ds/primitives/form/Select'
import { NumberInput } from '@ds/primitives/form/NumberInput'
import { WEIGHTS, type Source } from '../../behavior/randomizer.constants'

type RollControlsProps = {
  source: Source
  weight: WeightMode
  setWeight: (w: WeightMode) => void
  count: number
  setCount: (n: number) => void
  busy: boolean
  hasGames: boolean
  picksCount: number
  excludedCount: number
  poolSize: number | null
  error: string | null
  spec: FilterSpec
  onSpecChange: (patch: Partial<FilterSpec>) => void
  onRoll: () => void
  onReroll: () => void
  onReset: () => void
}

const RollControls = ({
  source,
  weight,
  setWeight,
  count,
  setCount,
  busy,
  hasGames,
  picksCount,
  excludedCount,
  poolSize,
  error,
  spec,
  onSpecChange,
  onRoll,
  onReroll,
  onReset,
}: RollControlsProps) => {
  return (
    <Box className="panel">
      <Box className="row">
        <Box className="field" style={{ marginBottom: 0 }}>
          <Box as="label">Weighting</Box>
          <Select<WeightMode>
            value={weight}
            onChange={(v) => setWeight(v)}
            options={WEIGHTS.map((w) => ({ value: w.key, label: w.label }))}
            variant="field"
            disabled={source === 'store'}
            title={source === 'store' ? 'Weighting needs playtime/ratings — store rolls are uniform' : undefined}
          />
        </Box>
        <Box className="field" style={{ marginBottom: 0 }}>
          <Box as="label">How many</Box>
          <NumberInput
            min={1}
            max={12}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(12, Number(e.currentTarget.value))))}
            style={{ width: 80 }}
          />
        </Box>
        <Button
          onClick={() => onRoll()}
          disabled={busy || (source !== 'store' && !hasGames)}
          style={{ marginTop: 14 }}
        >
          {busy ? 'Rolling…' : '🎲 Roll'}
        </Button>
        {picksCount > 0 && (
          <Button variant="secondary" onClick={onReroll} disabled={busy} style={{ marginTop: 14 }}>
            Reroll (skip these)
          </Button>
        )}
        {excludedCount > 0 && (
          <Button
            variant="ghost"
            onClick={onReset}
            disabled={busy}
            style={{ marginTop: 14, color: 'var(--text-2)' }}
          >
            Reset exclusions ({excludedCount})
          </Button>
        )}
        <Box style={{ marginLeft: 'auto', marginTop: 14 }}>
          <SortControls value={spec} onChange={onSpecChange} />
        </Box>
      </Box>
      {error && (
        <Box as="p" className="muted" style={{ marginTop: 10, color: 'var(--danger, #f87171)' }}>
          {error}
        </Box>
      )}
      {!error && poolSize === 0 && (
        <Box as="p" className="muted" style={{ marginTop: 10 }}>
          {source === 'store'
            ? 'No store games match these filters.'
            : 'Nothing in this slice — adjust the filters and roll again.'}
        </Box>
      )}
      {!error && poolSize !== null && poolSize > 0 && (
        <Box as="p" className="muted" style={{ marginTop: 10 }}>
          {source === 'store' ? 'Rolled from ' : 'Picked from a pool of '}
          {poolSize.toLocaleString()} game{poolSize === 1 ? '' : 's'}
          {source === 'store' ? ' in the Steam store' : ''}
          {excludedCount > 0 ? ` (${excludedCount} excluded)` : ''}.
        </Box>
      )}
    </Box>
  )
}

export { RollControls }
export type { RollControlsProps }
