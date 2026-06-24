import { registerTool } from '../registry'
import { FILTER_SPEC_SCHEMA } from '../filterSchema'
import { sanitize } from '../../parse'
import { SCOPE_KINDS, type ScopeKind } from '@jex/shared/scope'
import { TABS } from './constants'

const registerNavigationTools = (): void => {
  registerTool({
    name: 'open_game',
    description:
      "THE DEFAULT way to show ONE game. Opens the game's rich detail page INSIDE the app (media, metadata, scores, launch) — prefer this whenever the user wants to see/open/look at/show a specific game. Provide its numeric appid (use get_game or search_games first to find it). Do NOT send the user to the Steam store website for this; only use open_store_page if they explicitly ask for the store/web page.",
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: { appid: { type: 'number' } },
      required: ['appid'],
    },
    run: async (args, ctx) => {
      const appid = Number(args.appid)
      if (!Number.isFinite(appid) || appid <= 0) return { error: 'Provide a valid numeric appid.' }
      return ctx.ui('navigate', { route: `/game/${appid}` })
    },
  })

  registerTool({
    name: 'roll_randomizer',
    description:
      'Pick random game(s) to play on the Randomizer tab — for "surprise me / pick at random / what should I play right now". NOT for "best/acclaimed/top-rated" recommendations (use search_store sorted by score for those — one random pick is not "the best"). source chooses the pool: "library" (games you own — DEFAULT), "wishlist", or "store" (the wider Steam catalog). Use source:"wishlist" for "random game from my wishlist". Optionally limit by a filter. weight favors: unplayed, short (quick to finish), or rated (highly reviewed). Returns the pool size and the picked games — call it ONCE; do not re-roll repeatedly hoping for a different result.',
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        source: {
          enum: ['library', 'wishlist', 'store'],
          description: 'Which pool to roll from. Default "library".',
        },
        filter: FILTER_SPEC_SCHEMA,
        weight: { enum: ['uniform', 'unplayed', 'short', 'rated'] },
        count: { type: 'number', description: 'How many to pick (1-12, default 1).' },
      },
    },
    run: async (args, ctx) => {
      const source = SCOPE_KINDS.includes(args.source as ScopeKind)
        ? (args.source as ScopeKind)
        : 'library'
      const spec = args.filter ? sanitize(args.filter as Record<string, unknown>) : undefined
      const count = args.count ? Math.max(1, Math.min(12, Number(args.count))) : undefined
      return ctx.ui('roll_randomizer', { source, spec, weight: args.weight, count })
    },
  })

  registerTool({
    name: 'open_wishlist_group',
    description:
      "Open a specific sub-wishlist (group) on the Wishlist tab so the user SEES its games. Identify it by numeric id (from list_wishlist_groups) or by name. Returns how many games are in it.",
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'The group id (from list_wishlist_groups).' },
        name: { type: 'string', description: 'The group name, if the id is unknown.' },
      },
    },
    run: async (args, ctx) => {
      if (args.id == null && !String(args.name ?? '').trim()) {
        return { error: 'Provide the group id or name.' }
      }
      return ctx.ui('openWishlistGroup', { id: args.id, name: args.name })
    },
  })

  registerTool({
    name: 'navigate',
    description:
      "Switch the app to one of its main tabs: library (the user's games), wishlist, randomizer, store (the embedded Steam store), or settings.",
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: { tab: { enum: [...TABS] } },
      required: ['tab'],
    },
    run: async (args, ctx) => {
      const tab = String(args.tab)
      if (!TABS.includes(tab as (typeof TABS)[number])) {
        return { error: `Unknown tab "${tab}". Valid tabs: ${TABS.join(', ')}.` }
      }
      return ctx.ui('navigate', { route: `/${tab}` })
    },
  })
}

export { registerNavigationTools }
