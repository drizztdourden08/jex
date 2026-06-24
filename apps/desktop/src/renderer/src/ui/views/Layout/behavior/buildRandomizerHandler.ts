import type { NavigateFunction } from 'react-router-dom'
import { useAgentRandomizer } from '@/store/agentRandomizer'
import { randomPick, type WeightMode } from '@/lib/query/randomizer'
import { matches } from '@shared/filterApply'
import { storeToGames } from '@/lib/search/storeToGames'
import { brief } from '@/lib/ai/brief'
import { inScope, type ScopeKind } from '@shared/scope'
import type { FilterSpec } from '@shared/filter'
import type { Game } from '@shared/library'
import type { UiHandler } from '@/lib/ai/uiToolHost'

interface RandomizerDeps {
  navigate: NavigateFunction
  games: Game[]
}

const buildRandomizerHandler = (deps: RandomizerDeps): Record<string, UiHandler> => ({
  roll_randomizer: async (payload) => {
    const source = (payload.source as ScopeKind) ?? 'library'
    const spec = (payload.spec ?? undefined) as FilterSpec | undefined
    const weight = payload.weight as WeightMode | undefined
    const count = payload.count ? Math.max(1, Math.min(12, Number(payload.count))) : 1
    // Resolve the roll up-front so the agent gets the pool size + picks back, and the
    // page shows exactly what we report. Store rolls hit the live catalog.
    let picks: Game[]
    let poolSize: number
    if (source === 'store') {
      const res = await window.api.search.randomPicks(
        { text: spec?.text?.trim() || undefined, spec: spec ?? {} },
        count,
      )
      const vocab = await window.api.search.getVocab()
      picks = storeToGames(res.picks, vocab).slice(0, count)
      poolSize = res.total
    } else {
      const pool = deps.games.filter((g) => inScope(g, source) && (spec ? matches(g, spec) : true))
      const r = randomPick(pool, {}, { count, weight })
      picks = r.picks
      poolSize = r.poolSize
    }
    useAgentRandomizer.getState().roll({ source, spec, weight, count, picks, poolSize })
    deps.navigate('/randomizer')
    return { rolled: true, source, poolSize, picks: picks.map(brief) }
  },
})

export { buildRandomizerHandler }
export type { RandomizerDeps }
