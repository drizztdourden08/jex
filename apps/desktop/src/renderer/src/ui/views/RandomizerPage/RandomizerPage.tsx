import { GameFilters } from '@ui/compounds/GameFilters'
import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'
import { SOURCES, type Source } from './behavior/randomizer.constants'
import { useRandomizer } from './behavior/useRandomizer'
import { RollControls } from './sub-components/RollControls'
import { PickCard } from './sub-components/PickCard'
import { Box } from '@ds/primitives/layout/Box'

const RandomizerPage = () => {
  const {
    games,
    flt,
    weight,
    setWeight,
    count,
    setCount,
    picks,
    poolSize,
    excluded,
    source,
    busy,
    error,
    storeFacets,
    roll,
    reroll,
    reset,
    excludeOne,
    changeSource,
    shownPicks,
  } = useRandomizer()

  return (
    <Box>
      <Box as="h1">Randomizer</Box>
      <Box as="p" className="muted">
        Roll something to play — from your library, your wishlist, or the whole Steam store.
      </Box>

      <Box className="row" style={{ marginBottom: 16 }}>
        <SegmentedControl
          options={SOURCES}
          value={source}
          onChange={(v) => changeSource(v as Source)}
        />
      </Box>

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
        facets={source === 'store' ? storeFacets : undefined}
      />

      {source === 'store' && flt.advancedActive && (
        <Box className="panel" style={{ borderColor: 'var(--warn, #f0b84e)', marginTop: 12 }}>
          <Box as="p" className="muted" style={{ margin: 0 }}>
            ⚠️ Advanced formulas can't be sent to the Steam store, so this filter
            <Box as="strong"> won't apply to store rolls</Box>. Use <Box as="strong">Basic</Box> or{' '}
            <Box as="strong">Normal</Box> — both support tags/genres and roll from the matching store
            results. (Advanced still works for Library and Wishlist.)
          </Box>
        </Box>
      )}

      <RollControls
        source={source}
        weight={weight}
        setWeight={setWeight}
        count={count}
        setCount={setCount}
        busy={busy}
        hasGames={games.length > 0}
        picksCount={picks.length}
        excludedCount={excluded.length}
        poolSize={poolSize}
        error={error}
        spec={flt.spec}
        onSpecChange={(patch) => flt.setSpec({ ...flt.spec, ...patch })}
        onRoll={() => roll()}
        onReroll={reroll}
        onReset={reset}
      />

      <Box className="grid">
        {shownPicks.map((g) => (
          <PickCard key={g.appid} game={g} onExclude={excludeOne} />
        ))}
      </Box>
    </Box>
  )
}

export { RandomizerPage }
