import { host } from '../../host'
import { registerTool } from '../registry'
import { FEATURE_KEYS } from '../../parse'
import type { GAMING_GLOSSARY } from '@jex/shared/gamingGlossary';
import { lookupGamingTerms } from '@jex/shared/gamingGlossary'
import type { Game } from '@jex/shared/library/index'
import { brief, facetCounts } from './helpers'

/**
 * Read-only, main-surface library tools. These run entirely in the main process
 * against the SQLite mirror — no UI round-trip — so they work as soon as the
 * agent is up (the renderer-state tools live in ./ui, added in Phase 2/3).
 */

const registerLibraryTools = (): void => {
  registerTool({
    name: 'library_stats',
    description:
      "Get high-level counts about the user's Steam library: total games, how many are installed, owned, and how many have full metadata. Use this to answer questions about library size or sync state.",
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const s = host().db.getStats()
      return {
        total: s.total,
        installed: s.installed,
        owned: s.owned,
        enriched: s.enriched,
        pendingMetadata: s.pending,
        lastSync: s.lastOwnedSync,
      }
    },
  })

  registerTool({
    name: 'interpret_gaming_terms',
    description:
      'Translate gaming jargon/genre slang into the concrete categories/tags/features to filter by. ALWAYS call this for fuzzy terms before filtering — e.g. "couch co-op" (=split-screen/local co-op, NOT just Co-op), soulslike, roguelite vs roguelike, metroidvania, 4X, CRPG, boomer shooter, bullet hell/shmup, cozy, walking sim, deckbuilder, Steam Deck, party game. Returns values that actually exist in the user\'s library when possible.',
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        terms: { type: 'array', items: { type: 'string' }, description: 'Jargon terms or the raw request.' },
      },
      required: ['terms'],
    },
    run: async (args) => {
      const terms = Array.isArray(args.terms) ? args.terms.map(String) : [String(args.terms ?? '')]
      const games = host().db.getAllGames()
      const present = (key: 'genres' | 'categories' | 'tags') => {
        const s = new Set<string>()
        for (const g of games) for (const v of g[key] ?? []) s.add(v.toLowerCase())
        return s
      }
      const have = { genres: present('genres'), categories: present('categories'), tags: present('tags') }
      // Keep candidate values that exist in the library; if none do, keep all candidates.
      const filterPresent = (vals: string[] | undefined, set: Set<string>) => {
        if (!vals?.length) return undefined
        const hit = vals.filter((v) => set.has(v.toLowerCase()))
        return hit.length ? hit : vals
      }

      const matches = new Map<string, ReturnType<typeof toResult>>()
      const toResult = (e: (typeof GAMING_GLOSSARY)[number]) => {
        return {
          term: e.term,
          meaning: e.meaning,
          categories: filterPresent(e.categories, have.categories),
          tags: filterPresent(e.tags, have.tags),
          genres: filterPresent(e.genres, have.genres),
          features: e.features,
          excludeTags: e.excludeTags,
        }
      }
      for (const t of terms) for (const e of lookupGamingTerms(t)) matches.set(e.term, toResult(e))

      const results = [...matches.values()]
      return results.length
        ? { results }
        : { results: [], note: 'No known gaming terms matched; filter by the literal words or call list_filter_values.' }
    },
  })

  registerTool({
    name: 'list_filter_values',
    description:
      "List the actual values present in the user's library for a facet (genres, categories, or tags), with counts. Call this BEFORE filtering when unsure of exact names, so apply_filter/query_library use values that exist. For features, the fixed vocabulary is returned.",
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        facet: { enum: ['genres', 'categories', 'tags', 'features'] },
        limit: { type: 'number', description: 'Max values (default 40).' },
      },
      required: ['facet'],
    },
    run: async (args) => {
      const facet = String(args.facet)
      const limit = Math.max(1, Math.min(200, Number(args.limit) || 40))
      if (facet === 'features') return { facet, values: FEATURE_KEYS }
      if (facet !== 'genres' && facet !== 'categories' && facet !== 'tags') {
        return { error: 'facet must be genres, categories, tags, or features.' }
      }
      const counts = facetCounts(host().db.getAllGames(), facet)
      return {
        facet,
        total: counts.length,
        values: counts.slice(0, limit).map(([value, count]) => ({ value, count })),
      }
    },
  })

  registerTool({
    name: 'search_games',
    description:
      'Find games by name (substring, case-insensitive). Returns a short list of matches with their appids. Use for "do I own X" or to disambiguate before opening/launching.',
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        limit: { type: 'number', description: 'Max results (default 10).' },
      },
      required: ['text'],
    },
    run: async (args) => {
      const text = String(args.text ?? '').trim().toLowerCase()
      if (!text) return { error: 'Provide search text.' }
      const limit = Math.max(1, Math.min(25, Number(args.limit) || 10))
      const matches = host().db.getAllGames()
        .filter((g) => g.name.toLowerCase().includes(text))
        .sort((a, b) => a.name.length - b.name.length)
      return {
        count: matches.length,
        results: matches.slice(0, limit).map(brief),
      }
    },
  })

  registerTool({
    name: 'get_game',
    description:
      'Look up a single game by name (substring, case-insensitive) or numeric appid. Returns its key details. Use before launching, opening a store page, or answering questions about one game.',
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'A game name or appid to look up.' },
      },
      required: ['query'],
    },
    run: async (args) => {
      const query = String(args.query ?? '').trim()
      if (!query) return { error: 'Provide a game name or appid.' }
      const games = host().db.getAllGames()
      const asId = Number(query)
      let match: Game | undefined
      if (Number.isFinite(asId) && asId > 0) match = games.find((g) => g.appid === asId)
      if (!match) {
        const q = query.toLowerCase()
        // Prefer an exact (case-insensitive) name, else the shortest substring match.
        match =
          games.find((g) => g.name.toLowerCase() === q) ??
          games
            .filter((g) => g.name.toLowerCase().includes(q))
            .sort((a, b) => a.name.length - b.name.length)[0]
      }
      if (!match) return { found: false, query }
      return {
        found: true,
        ...brief(match),
        shortDescription: match.shortDescription,
        developers: match.developers,
        categories: match.categories?.slice(0, 8),
      }
    },
  })
}

export { registerLibraryTools }
