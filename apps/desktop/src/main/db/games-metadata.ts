import { all, get, persist, run, setMeta } from './database'
import { RICH_KEYS } from './row-mapper'
import type { MetadataPatch } from '../steam/store'

const UPDATE_META = `
  UPDATE games SET
    name = CASE WHEN @name IS NOT NULL AND @name <> '' THEN @name ELSE name END,
    type = @type, isFree = @isFree, shortDescription = @shortDescription,
    developers = @developers, publishers = @publishers, genres = @genres, categories = @categories,
    releaseDate = @releaseDate, releaseYear = @releaseYear, metacritic = @metacritic, reviewTotal = @reviewTotal,
    platforms = @platforms, controllerSupport = @controllerSupport, media = @media,
    tags = CASE WHEN @tags IS NOT NULL THEN @tags ELSE tags END,
    rich = @rich,
    enrichment = 'enriched', enrichedAt = @now, updatedAt = @now
  WHERE appid = @appid
`

/** Apply full metadata to an existing row (provenance: only metadata + rich columns). Caller persists. */
const mergeMetadata = (appid: number, patch: MetadataPatch): void => {
  const rich: Record<string, unknown> = {}
  for (const k of RICH_KEYS) {
    const v = (patch as Record<string, unknown>)[k]
    if (v !== undefined) rich[k] = v
  }
  run(UPDATE_META, {
    '@appid': appid,
    '@name': patch.name ?? null,
    '@type': patch.type ?? null,
    '@isFree': patch.isFree == null ? null : patch.isFree ? 1 : 0,
    '@shortDescription': patch.shortDescription ?? null,
    '@developers': JSON.stringify(patch.developers ?? []),
    '@publishers': JSON.stringify(patch.publishers ?? []),
    '@genres': JSON.stringify(patch.genres ?? []),
    '@categories': JSON.stringify(patch.categories ?? []),
    '@releaseDate': patch.releaseDate ?? null,
    '@releaseYear': patch.releaseYear ?? null,
    '@metacritic': patch.metacritic ?? null,
    '@reviewTotal': patch.reviewTotal ?? null,
    '@platforms': JSON.stringify(patch.platforms ?? { windows: false, mac: false, linux: false }),
    '@controllerSupport': patch.controllerSupport ?? null,
    '@media': patch.media ? JSON.stringify(patch.media) : null,
    '@tags': patch.tags ? JSON.stringify(patch.tags) : null,
    '@rich': JSON.stringify(rich),
    '@now': Date.now(),
  })
}

/** Metadata-patch field → games column, for fields stored as plain columns. */
const COLUMN_FIELDS: Record<string, 'json' | 'scalar'> = {
  type: 'scalar',
  isFree: 'scalar',
  shortDescription: 'scalar',
  developers: 'json',
  publishers: 'json',
  genres: 'json',
  categories: 'json',
  tags: 'json',
  releaseDate: 'scalar',
  releaseYear: 'scalar',
  metacritic: 'scalar',
  reviewTotal: 'scalar',
  platforms: 'json',
  controllerSupport: 'scalar',
  media: 'json',
}

/**
 * Merge ONLY the fields present in `patch` into a row — used for the staged detail
 * fetch, where stage 2 (reviews/tags/playtime/…) must not wipe stage 1's columns
 * (genres/media/…). `rich` is merged additively over the existing blob. Unlike
 * mergeMetadata, columns absent from the patch are left untouched. Caller persists.
 */
const mergePatch = (appid: number, patch: MetadataPatch, markEnriched = false): void => {
  const p = patch as Record<string, unknown>
  const sets: string[] = []
  const params: Record<string, unknown> = { '@appid': appid, '@now': Date.now() }

  if (typeof p.name === 'string' && p.name) {
    sets.push('name = @name')
    params['@name'] = p.name
  }
  for (const [field, kind] of Object.entries(COLUMN_FIELDS)) {
    if (p[field] === undefined) continue
    const v = p[field]
    sets.push(`${field} = @${field}`)
    params[`@${field}`] = kind === 'json' ? JSON.stringify(v) : v === false ? 0 : v === true ? 1 : (v ?? null)
  }

  // Additive rich merge: keep existing keys, overlay the patch's rich keys.
  const richPatch: Record<string, unknown> = {}
  for (const k of RICH_KEYS) if (p[k] !== undefined) richPatch[k] = p[k]
  if (Object.keys(richPatch).length) {
    const existing = get<{ rich: string | null }>('SELECT rich FROM games WHERE appid=?', [appid])?.rich
    let merged: Record<string, unknown> = {}
    if (existing) {
      try {
        merged = JSON.parse(existing) as Record<string, unknown>
      } catch {
        merged = {}
      }
    }
    sets.push('rich = @rich')
    params['@rich'] = JSON.stringify({ ...merged, ...richPatch })
  }

  if (markEnriched) {
    sets.push("enrichment = 'enriched'", 'enrichedAt = @now')
  }
  sets.push('updatedAt = @now')

  if (sets.length === 1) return // only updatedAt — nothing to write
  run(`UPDATE games SET ${sets.join(', ')} WHERE appid = @appid`, params)
}

const DROP_META = `
  UPDATE games SET
    type = NULL, isFree = NULL, shortDescription = NULL,
    developers = NULL, publishers = NULL, genres = NULL, categories = NULL, tags = NULL,
    releaseDate = NULL, releaseYear = NULL, metacritic = NULL, reviewTotal = NULL,
    platforms = NULL, controllerSupport = NULL, media = NULL, rich = NULL,
    enrichment = 'owned-only', enrichedAt = NULL, updatedAt = @now
`

/**
 * Drop all fetched Store/rich metadata, re-queuing every game for enrichment.
 * Install state, ownership and playtime are preserved (those come from the local
 * scan / GetOwnedGames, not the Store). Returns the number of games reset.
 */
const dropAllMetadata = (): number => {
  // Count rows directly (rather than importing gameCount from ./games, which would
  // create a cycle: games.ts re-exports this module's metadata API).
  const n = get<{ n: number }>('SELECT COUNT(*) AS n FROM games')?.n ?? 0
  run(DROP_META, { '@now': Date.now() })
  setMeta('lastEnrich', null) // getStats reads this → "last synced" clears
  persist()
  return n
}

/**
 * Re-queue metadata older than `olderThanMs` for a fresh enrichment pass (the
 * monthly full re-sync). Flips terminal 'enriched' rows back to 'owned-only' so
 * `getUnenrichedAppids` picks them up. Returns how many were re-queued.
 */
const requeueStale = (olderThanMs: number): number => {
  const cutoff = Date.now() - olderThanMs
  const n =
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM games WHERE enrichment='enriched' AND (enrichedAt IS NULL OR enrichedAt < ?)",
      [cutoff],
    )?.n ?? 0
  if (n > 0) {
    run("UPDATE games SET enrichment='owned-only' WHERE enrichment='enriched' AND (enrichedAt IS NULL OR enrichedAt < ?)", [
      cutoff,
    ])
    persist()
  }
  return n
}

/** Transient failure (network blip / non-429) — re-queued for retry next run. */
const markEnrichFailed = (appid: number): void => {
  run('UPDATE games SET enrichment = ?, updatedAt = ? WHERE appid = ?', ['failed', Date.now(), appid])
}

/** Permanent: app has no store page (delisted/region-locked) — NOT re-queued. */
const markNoStorePage = (appid: number): void => {
  run('UPDATE games SET enrichment = ?, updatedAt = ? WHERE appid = ?', [
    'no-store-page',
    Date.now(),
    appid,
  ])
}

/** Appids still needing Store metadata — installed + most-played first.
 *  Excludes 'enriched' and 'no-store-page' (both terminal); retries 'failed'. */
const getUnenrichedAppids = (): number[] => {
  return all<{ appid: number }>(
    "SELECT appid FROM games WHERE enrichment IN ('owned-only','failed') ORDER BY installed DESC, playtimeForever DESC",
  ).map((r) => r.appid)
}

export {
  mergeMetadata,
  mergePatch,
  dropAllMetadata,
  requeueStale,
  markEnrichFailed,
  markNoStorePage,
  getUnenrichedAppids,
}
