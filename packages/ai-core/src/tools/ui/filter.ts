import { registerTool } from '../registry'
import { SCOPE_PROPS, SCOPED_FILTER_SCHEMA } from '../filterSchema'
import { sanitize } from '../../parse'
import { FIELD_MAP, OPS_BY_TYPE, VALUELESS_OPS } from '@jex/shared/query/index'
import { FIELD_KEYS, ALL_OPS } from './constants'

/**
 * Resolve scope + group from raw tool args. A weak model dumps EVERY field (scope:
 * "library" alongside group:0); group:0 must NOT be read downstream as "wishlist group
 * 0" (which forces wishlist scope and returns nothing). Only a positive id is a real
 * group; scope is honored only when it's a valid value.
 */
const scopeArgs = (args: Record<string, unknown>): { scope?: string; group?: number } => {
  const group = typeof args.group === 'number' && args.group > 0 ? args.group : undefined
  const scope = args.scope === 'wishlist' || args.scope === 'library' ? args.scope : undefined
  return { scope, group }
}

const registerFilterTools = (): void => {
  registerTool({
    name: 'apply_filter',
    description:
      "THE DEFAULT WAY TO SHOW GAMES. Filters a collection to matching games and switches to that view so they SEE the list. Set scope:\"wishlist\" to show wishlist games (e.g. \"my roguelikes in my wishlist\"); omit scope (or scope:\"library\") for owned games. Build the filter from the request (genres, tags, features like coop/controllerFull, playtime, scores, installed/unplayed, sort, etc.). Returns how many games matched.",
    category: 'filter',
    sensitivity: 'safe',
    surface: 'ui',
    params: SCOPED_FILTER_SCHEMA,
    run: async (args, ctx) => {
      const spec = sanitize(args)
      return ctx.ui('applyFilter', { spec, ...scopeArgs(args) })
    },
  })

  registerTool({
    name: 'query_library',
    description:
      "Search a collection with a filter and get the matching COUNT plus a small SAMPLE of games (about 10, NOT the full list) back, without changing the view. Set scope:\"wishlist\" to count/answer over the wishlist (e.g. \"how many action games are on my wishlist\"); omit scope for the owned Library. Use this ONLY to ANSWER a question in chat. To SHOW the user games, prefer apply_filter. For aggregate analysis of taste/top genres/counts across the whole library, use taste_profile — do NOT raise the limit or page through everything (you only get a sample).",
    category: 'library',
    sensitivity: 'safe',
    surface: 'ui',
    params: SCOPED_FILTER_SCHEMA,
    run: async (args, ctx) => {
      const spec = sanitize(args)
      return ctx.ui('queryLibrary', { spec, ...scopeArgs(args) })
    },
  })

  registerTool({
    name: 'apply_advanced_filter',
    description:
      'Filter for what apply_filter cannot do: negation ("not/without"), OR logic, numeric ranges. Rules are {field, op, value} combined by match=all/any; shows the filtered view. Set scope:"wishlist" to filter the wishlist instead of the Library. EXCLUDE with op "none" on arrays (e.g. tags none ["Roguelike"]) or neq/notContains on scalars. Arrays (genres/categories/tags/features/platforms): any/all/none + list value. Numbers: gte/lte/gt/lt/eq. Booleans: isTrue/isFalse. Field/op are validated; call list_filter_values for exact tag names.',
    category: 'filter',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        ...SCOPE_PROPS,
        match: { enum: ['all', 'any'] },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { enum: FIELD_KEYS },
              op: { enum: ALL_OPS },
              value: {
                oneOf: [
                  { type: 'string' },
                  { type: 'number' },
                  { type: 'array', items: { type: 'string' } },
                ],
              },
            },
            required: ['field', 'op'],
          },
        },
        sortBy: {
          enum: ['name', 'playtimeForever', 'playtime2weeks', 'releaseYear', 'metacritic', 'reviewTotal', 'random'],
        },
        sortDir: { enum: ['asc', 'desc'] },
      },
      required: ['rules'],
    },
    run: async (args, ctx) => {
      const raw = Array.isArray(args.rules) ? (args.rules as Record<string, unknown>[]) : []
      const rules: { field: string; op: string; value?: unknown }[] = []
      for (const r of raw) {
        const field = String(r.field ?? '')
        const def = FIELD_MAP.get(field)
        if (!def) return { error: `Unknown field "${field}". Valid fields: ${FIELD_KEYS.join(', ')}.` }
        const op = String(r.op ?? '')
        if (!OPS_BY_TYPE[def.type].includes(op as never)) {
          return {
            error: `Operator "${op}" is invalid for ${field} (${def.type}). Allowed: ${OPS_BY_TYPE[def.type].join(', ')}.`,
          }
        }
        let value = r.value
        if (!VALUELESS_OPS.has(op as never)) {
          if (def.type === 'number') value = Number(value)
          else if (def.type === 'stringArray' || def.type === 'enumArray')
            value = Array.isArray(value) ? value.map(String) : value != null ? [String(value)] : []
          else value = value != null ? String(value) : ''
        } else {
          value = undefined
        }
        rules.push({ field, op, value })
      }
      if (!rules.length) return { error: 'Provide at least one rule.' }
      return ctx.ui('applyAdvancedFilter', {
        combinator: args.match === 'any' ? 'or' : 'and',
        rules,
        sortBy: args.sortBy,
        sortDir: args.sortDir,
        ...scopeArgs(args),
      })
    },
  })

  registerTool({
    name: 'set_sort',
    description:
      'Change how a view is sorted (and switch to it). Set scope:"wishlist" to sort the wishlist; omit for the Library. Use after/with apply_filter or on its own.',
    category: 'filter',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        ...SCOPE_PROPS,
        sortBy: {
          enum: [
            'name',
            'playtimeForever',
            'playtime2weeks',
            'releaseYear',
            'metacritic',
            'reviewTotal',
            'random',
          ],
        },
        sortDir: { enum: ['asc', 'desc'] },
      },
      required: ['sortBy'],
    },
    run: async (args, ctx) =>
      ctx.ui('set_sort', {
        sortBy: args.sortBy,
        sortDir: args.sortDir,
        ...scopeArgs(args),
      }),
  })

  registerTool({
    name: 'clear_filter',
    description:
      'Clear all active filters on a view (keeps the current sort). Set scope:"wishlist" for the wishlist; omit for the Library.',
    category: 'filter',
    sensitivity: 'safe',
    surface: 'ui',
    params: { type: 'object', properties: { ...SCOPE_PROPS } },
    run: async (args, ctx) => ctx.ui('clear_filter', { ...scopeArgs(args) }),
  })
}

export { registerFilterTools }
