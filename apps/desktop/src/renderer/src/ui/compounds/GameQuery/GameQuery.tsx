import { useCallback } from 'react'
import type { FieldDef } from '@shared/query'
import { QueryBuilder } from '@ds/composites/QueryBuilder'
import { optionsFor, numRange } from './GameQuery.helpers'
import type { GameQueryProps } from './GameQuery.type'

/** Binds the generic QueryBuilder to the Game schema: facet options + numeric ranges
 *  are computed from the actual games array. */
const GameQuery = ({ query, onChange, games }: GameQueryProps) => {
  const opts = useCallback((def: FieldDef) => optionsFor(games, def), [games])
  const range = useCallback((def: FieldDef) => numRange(games, def), [games])
  return <QueryBuilder query={query} onChange={onChange} optionsFor={opts} numRange={range} />
}

export { GameQuery }
