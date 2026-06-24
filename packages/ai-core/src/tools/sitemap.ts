import { registerTool } from './registry'
import { searchSitemap, SITEMAP_BY_ID } from '@jex/shared/steamSitemap/index'

/**
 * Steam sitemap tools. The agent looks up a destination by intent with
 * `find_steam_page` (pure search in main, no UI), then opens the chosen one in
 * the embedded store with `open_steam_page` (UI surface → reuses the existing
 * `navigateStore` renderer action). Replaces the old hardcoded `navigate_store`
 * enum with the full, searchable sitemap (@jex/shared/steamSitemap).
 */

const authNote = (needsAuth: boolean): string | undefined =>
  needsAuth ? 'This page shows personal data — the user may need to be signed into Steam in the Store tab.' : undefined

const exampleFor = (param: string | undefined): string =>
  param === 'slug' ? 'value:"multiplayer_coop"' : param === 'tag' ? 'value:"Roguelike"' : 'value:"…"'

const registerSitemapTools = (): void => {
  registerTool({
    name: 'find_steam_page',
    description:
      'Look up the right Steam web page (store, community, account, help/support, a store genre/category, or a game-specific tab) by what the user wants — e.g. "get a refund", "change my password", "sell my trading cards", "family settings", "on sale", "co-op games on the store", "this game\'s discussions". Returns ranked destinations with an id, url, and (when dynamic) the param to supply. Call this FIRST, then open the best match with open_steam_page. For a free-text store search use open_steam_search.',
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What the user wants to do or see on Steam.' },
        limit: { type: 'number', description: 'Max results to return (1-20, default 6).' },
      },
      required: ['query'],
    },
    run: async (args) => {
      const query = String(args.query ?? '').trim()
      if (!query) return { error: 'Provide a query describing what the user wants.' }
      const limit = args.limit ? Number(args.limit) : undefined
      const matches = searchSitemap(query, limit)
      if (!matches.length) {
        return {
          matches: [],
          hint: 'No sitemap match. For a specific game use open_store_page (by appid); for a free-text store search use open_steam_search.',
        }
      }
      return { matches }
    },
  })

  registerTool({
    name: 'open_steam_page',
    description:
      'Open a Steam sitemap destination in the embedded Store tab by its id (from find_steam_page). Dynamic destinations need an extra arg: param "appid" → pass appid (resolve the game with get_game/search_games first); param "slug" → pass value as the /category/ slug (e.g. "multiplayer_coop", "rpg_action"); param "tag" → pass value as the tag name (e.g. "Roguelike"). find_steam_page tells you the param. Use open_store_page / open_community_hub when you only have an appid.',
    category: 'navigation',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The sitemap entry id to open.' },
        appid: { type: 'number', description: 'Game appid, for dynamic destinations with param "appid".' },
        value: { type: 'string', description: 'The slug or tag, for dynamic destinations with param "slug"/"tag".' },
      },
      required: ['id'],
    },
    run: async (args, ctx) => {
      const id = String(args.id ?? '').trim()
      const entry = SITEMAP_BY_ID.get(id)
      if (!entry) {
        return { error: `Unknown destination id "${id}".`, suggestions: searchSitemap(id, 5) }
      }
      let url = entry.url
      if (entry.dynamic) {
        if (entry.param === 'appid') {
          const appid = Number(args.appid)
          if (!Number.isFinite(appid) || appid <= 0) {
            return {
              error: `"${entry.id}" needs an appid to open. Resolve the game with get_game/search_games first, or use open_store_page/open_community_hub.`,
            }
          }
          url = url.replace('<appid>', String(appid))
        } else {
          const value = String(args.value ?? '').trim()
          if (!value) return { error: `"${entry.id}" needs a ${entry.param} passed as "value" (e.g. ${exampleFor(entry.param)}).` }
          const filled = entry.param === 'tag' ? encodeURIComponent(value) : value
          url = url.replace(`<${entry.param}>`, filled)
        }
      }
      await ctx.ui('navigateStore', { url })
      return { opened: url, title: entry.title, needsAuth: entry.needsAuth, note: authNote(entry.needsAuth) }
    },
  })
}

export { registerSitemapTools }
