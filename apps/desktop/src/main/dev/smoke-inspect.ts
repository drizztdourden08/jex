import { app } from 'electron'
import { getAllGames, getGame, upsertOwned } from '../db/games'
import { refreshOne } from '../library/sync'
import { requireEngine } from '../ai-host/engine'
import { fetchFullMetadata } from '../enrich/metadata'
import { fetchMetacritic } from '../enrich/metacritic'
import { fetchSteamSpy } from '../enrich/steamspy'
import { fetchHltb } from '../enrich/hltb'
import { fetchReviews } from '../steam/reviews'
import { getCurrentPlayers } from '../steam/webapi'

/**
 * Smoke probes that inspect AI inference + the metadata-enrichment pipeline. All are
 * one-shot, env-gated dev helpers that quit when done (download/inference/network).
 */

const smokeAi = (): void => {
  void (async () => {
    try {
      const engine = requireEngine()
      await engine.downloadModel()
      const r = await engine.buildQuery("a random roguelite with base building I haven't played", {
        genres: ['Roguelike', 'Action', 'Indie'],
        categories: ['Base Building', 'Co-op', 'Singleplayer'],
      })
      console.log('[main] smoke ai query →', JSON.stringify(r.spec))
    } catch (e) {
      console.error('[main] smoke ai error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

// Install (from JEX_PLUGIN_DIST or the release) + load the AI engine plugin, proving
// the host's download→verify→extract→dynamic-import→init path end to end.
const smokeEngine = (): void => {
  void (async () => {
    try {
      const { engineStatus, enginePlugins, installEngine } = await import('../ai-host')
      console.log('[main] engine before:', JSON.stringify(await engineStatus()))
      const ids = (await enginePlugins()).filter((p) => p.recommended).map((p) => p.id)
      await installEngine(ids, (m) => console.log('[main] engine install:', m))
      console.log('[main] engine after:', JSON.stringify(await engineStatus()))
    } catch (e) {
      console.error('[main] smoke engine error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

const smokeDiag = (): void => {
  void (async () => {
    try {
      const all = getAllGames()
      const enriched = all.filter((g) => g.enrichment === 'enriched')
      const distinct = (key: 'genres' | 'categories' | 'tags'): number => {
        const s = new Set<string>()
        for (const g of all) for (const v of g[key] ?? []) s.add(v)
        return s.size
      }
      console.log(`[main] diag: ${enriched.length}/${all.length} enriched`)
      console.log(
        `  distinct genres=${distinct('genres')} categories=${distinct('categories')} tags=${distinct('tags')}`,
      )
      const tagCounts = new Map<string, number>()
      for (const g of all) for (const t of g.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
      const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])
      console.log(
        `  tag count distribution: top=${sorted[0]?.[1]} median≈${sorted[Math.floor(sorted.length / 2)]?.[1]} singletons=${sorted.filter(([, n]) => n === 1).length}`,
      )
      const avgTags = (all.reduce((n, g) => n + (g.tags?.length ?? 0), 0) / (enriched.length || 1)).toFixed(1)
      console.log(`  avg tags per enriched game=${avgTags}`)
      const m = all.filter((g) => /house of ashes/i.test(g.name))
      for (const g of m) {
        console.log(`  GAME ${g.name} (${g.appid}) enrichment=${g.enrichment}`)
        console.log('    categories:', JSON.stringify(g.categories))
        console.log('    tags:', JSON.stringify(g.tags))
        console.log('    features:', JSON.stringify(g.features))
      }
      const hasCat = (g: (typeof all)[0], c: string): boolean =>
        g.categories.map((x) => x.toLowerCase()).includes(c.toLowerCase())
      const hasTag = (g: (typeof all)[0], t: string): boolean =>
        g.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
      const ss = all.filter((g) => hasCat(g, 'Shared/Split Screen'))
      const sr = all.filter((g) => hasTag(g, 'Story Rich'))
      const both = all.filter((g) => hasCat(g, 'Shared/Split Screen') && hasTag(g, 'Story Rich'))
      console.log(`  Shared/Split Screen=${ss.length}  Story Rich=${sr.length}  BOTH=${both.length}`)
      console.log('  both:', both.slice(0, 20).map((g) => g.name))
    } catch (e) {
      console.error('[main] smoke diag error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

const smokeMeta = (): void => {
  void (async () => {
    try {
      const appid = Number(process.env.SMOKE_APPID) || 1245620
      const d = (await (
        await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)
      ).json()) as Record<string, { data?: { name?: string; metacritic?: { url?: string } } }>
      const data = d[appid]?.data
      const name = data?.name ?? ''
      const mcUrl = data?.metacritic?.url
      const [reviews, players, spy, hltb, mc] = await Promise.all([
        fetchReviews(appid),
        getCurrentPlayers(appid),
        fetchSteamSpy(appid),
        fetchHltb(name),
        mcUrl ? fetchMetacritic(mcUrl) : Promise.resolve(null),
      ])
      const full = await fetchFullMetadata(appid)
      console.log(`[main] smoke meta: ${name} (${appid})`)
      console.log('  reviews:', JSON.stringify(reviews))
      console.log('  players:', players)
      console.log('  steamspy:', spy ? `${spy.tags.slice(0, 8).join(', ')} | owners ${spy.ownersEstimate}` : null)
      console.log('  hltb:', JSON.stringify(hltb))
      console.log('  metacritic:', JSON.stringify(mc))
      console.log('  NORMALIZED genres:', JSON.stringify(full?.genres))
      console.log('  NORMALIZED categories:', JSON.stringify(full?.categories))
      console.log('  NORMALIZED tags:', JSON.stringify(full?.tags))
      console.log('  NORMALIZED features:', JSON.stringify(full?.features))
    } catch (e) {
      console.error('[main] smoke meta error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

const smokeRefresh = (): void => {
  // Full Phase-1b chain: refreshOne fetches + persists rich metadata, then getGame
  // must read those rich fields back out of the new `rich` column.
  void (async () => {
    try {
      const appid = Number(process.env.SMOKE_APPID) || 1245620
      // Seed a row so mergeMetadata (UPDATE-only) has something to enrich.
      upsertOwned([{ appid, name: '', playtimeForever: 0, playtime2weeks: 0 }])
      const updated = await refreshOne(appid)
      const g = getGame(appid) // independent read — proves the DB round-trip
      console.log(`[main] smoke refresh: ${g?.name} (${appid}) enrichment=${g?.enrichment}`)
      console.log('  via refreshOne === via getGame:', updated?.updatedAt === g?.updatedAt)
      console.log('  features:', JSON.stringify(g?.features))
      console.log('  reviews.overall:', JSON.stringify(g?.reviews?.overall))
      console.log('  metacritic/user:', g?.metacritic, '/', g?.metacriticUser)
      console.log('  languages:', (g?.languages ?? []).slice(0, 6).join(', '))
      console.log('  tags:', (g?.tags ?? []).slice(0, 6).join(', '))
      console.log('  reqMin present:', Boolean(g?.requirementsMin), '| players:', g?.currentPlayers)
      console.log('  movie[0].hls:', g?.media?.movies?.[0]?.hls ?? null)
    } catch (e) {
      console.error('[main] smoke refresh error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

export { smokeAi, smokeEngine, smokeDiag, smokeMeta, smokeRefresh }
