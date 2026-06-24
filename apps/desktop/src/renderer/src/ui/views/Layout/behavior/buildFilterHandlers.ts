import type { NavigateFunction } from 'react-router-dom'
import { useAgentFilter, type AgentFilterAction } from '@/store/agentFilter'
import { useAgentWishlist } from '@/store/agentWishlist'
import { applyFilter } from '@shared/filterApply'
import { resolveScope } from '@/lib/query/scope'
import { brief } from '@/lib/ai/brief'
import { uid, evaluateNode, type QueryGroup, type QueryCondition, type QueryOp } from '@shared/query'
import type { Scope, ScopeKind } from '@shared/scope'
import type { FilterSpec } from '@shared/filter'
import type { Game } from '@shared/library'
import type { WishlistGroup } from '@shared/wishlist'
import type { UiHandler } from '@/lib/ai/uiToolHost'

interface FilterDeps {
  navigate: NavigateFunction
  games: Game[]
  groups: WishlistGroup[]
}

/** Read scope + sub-wishlist from a tool payload. A `group` id implies wishlist. */
const readTarget = (payload: Record<string, unknown>): { scope: ScopeKind; group?: number } => {
  const n = payload.group != null ? Number(payload.group) : NaN
  // Only a POSITIVE id is a real group — a stray group:0 (a small model dumping every
  // field) must not be read as "wishlist group 0", which silently nukes the result.
  const group = Number.isFinite(n) && n > 0 ? n : undefined
  const scope: ScopeKind = group != null || payload.scope === 'wishlist' ? 'wishlist' : 'library'
  return { scope, group }
}

const toScope = (scope: ScopeKind, group?: number): Scope => (group != null ? { group } : scope)

// Route a filter action to the right view's channel and navigate there. selectGroup
// drives the sub-wishlist selection (replace/advanced pick a group; sort/clear keep
// the current one).
const route = (
  deps: FilterDeps,
  scope: ScopeKind,
  group: number | undefined,
  action: AgentFilterAction,
  selectGroup: boolean,
): void => {
  if (scope === 'wishlist') {
    useAgentWishlist.getState().apply({ action, group: selectGroup ? (group ?? 'all') : undefined })
    deps.navigate('/wishlist')
    return
  }
  useAgentFilter.getState().apply(action)
  deps.navigate('/library')
}

const scopedSet = (deps: FilterDeps, scope: ScopeKind, group?: number): Game[] =>
  resolveScope(toScope(scope, group), { games: deps.games, groups: deps.groups })

const buildFilterHandlers = (deps: FilterDeps): Record<string, UiHandler> => ({
  applyFilter: (payload) => {
    const spec = (payload.spec ?? {}) as FilterSpec
    const { scope, group } = readTarget(payload)
    route(deps, scope, group, { kind: 'replace', spec }, true)
    return {
      applied: true,
      scope,
      matches: applyFilter(scopedSet(deps, scope, group), { ...spec, limit: undefined }).length,
    }
  },
  set_sort: (payload) => {
    const spec: FilterSpec = {}
    if (payload.sortBy) spec.sortBy = payload.sortBy as FilterSpec['sortBy']
    if (payload.sortDir) spec.sortDir = payload.sortDir as FilterSpec['sortDir']
    const { scope, group } = readTarget(payload)
    route(deps, scope, group, { kind: 'merge', spec }, false)
    return { sorted: spec, scope }
  },
  clear_filter: (payload) => {
    const { scope, group } = readTarget(payload)
    route(deps, scope, group, { kind: 'clear' }, false)
    return { cleared: true, scope }
  },
  applyAdvancedFilter: (payload) => {
    const raw = (payload.rules ?? []) as { field: string; op: string; value?: unknown }[]
    const rules: QueryCondition[] = raw.map((r) => ({
      kind: 'condition',
      id: uid('c'),
      field: r.field,
      op: r.op as QueryOp,
      value: r.value as QueryCondition['value'],
    }))
    const query: QueryGroup = {
      kind: 'group',
      id: uid('g'),
      combinator: payload.combinator === 'or' ? 'or' : 'and',
      rules,
    }
    const { scope, group } = readTarget(payload)
    route(
      deps,
      scope,
      group,
      {
        kind: 'advanced',
        query,
        sortBy: payload.sortBy as FilterSpec['sortBy'],
        sortDir: payload.sortDir as FilterSpec['sortDir'],
      },
      true,
    )
    return {
      applied: true,
      scope,
      matches: scopedSet(deps, scope, group).filter((g) => evaluateNode(g, query)).length,
    }
  },
  queryLibrary: (payload) => {
    const spec = (payload.spec ?? {}) as FilterSpec
    const { scope, group } = readTarget(payload)
    const set = scopedSet(deps, scope, group)
    const count = applyFilter(set, { ...spec, limit: undefined }).length
    // Keep the sample small — this answers a question; a big list just bloats the
    // model's context and invites tool-call loops.
    const results = applyFilter(set, { ...spec, limit: Math.min(spec.limit ?? 8, 10) }).map(brief)
    return { count, scope, results }
  },
})

export { buildFilterHandlers }
export type { FilterDeps }
