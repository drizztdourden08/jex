import { registerTool } from '../registry'
import { descriptionPage } from './description'
import { gameDetails } from './details'
import { resolveGame } from './resolve'
import { viewScreenshots } from './screenshots'

const QUERY_PARAM = {
  type: 'string',
  description: 'A game name (library) or numeric appid (library or any search_store result).',
}

/** Detail tools for ONE game, in the library or anywhere on the Steam store. All models. */
const registerGameTools = (): void => {
  registerTool({
    name: 'get_game_details',
    description:
      'Read everything stored about ONE game: description (plain text, paged), tags, genres, categories, features, developers/publishers, release date, Steam reviews, Metacritic, HowLongToBeat, player counts, playtime, install state, languages, requirements, and how many screenshots/trailers it has. Works for library games (name or appid) AND store games not in the library (pass the appid from search_store; inLibrary:false). The description comes back as page 1 of N; call again with page:2… only if you need more. Use get_game for a quick appid lookup instead.',
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        query: QUERY_PARAM,
        page: { type: 'number', description: 'Description page to read (default 1).' },
      },
      required: ['query'],
    },
    run: async (args) => {
      const resolved = await resolveGame(args.query)
      if (!resolved.ok) return resolved.result
      const { game } = resolved
      const page = Number(args.page) || 1
      const description = descriptionPage(game.detailedHtml ?? game.aboutHtml ?? game.shortDescription, page)
      if (page > 1) return { found: true, appid: game.appid, name: game.name, description }
      return { found: true, ...gameDetails(game), description }
    },
  })

  registerTool({
    name: 'view_game_screenshots',
    description:
      "LOOK at a game's Steam screenshots (images are attached to the result) to judge its art style, mood, UI or graphics. Works for library games and store games (appid from search_store). Default 3 spread across the set, at most 4 per call; pass indices (1-based) for specific ones. get_game_details tells you how many exist. If the model cannot view images, the result says so.",
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        query: QUERY_PARAM,
        indices: { type: 'array', items: { type: 'number' }, description: 'Screenshot numbers, 1-based.' },
        count: { type: 'number', description: 'How many to view (default 3, max 4).' },
      },
      required: ['query'],
    },
    run: viewScreenshots,
  })
}

export { registerGameTools }
