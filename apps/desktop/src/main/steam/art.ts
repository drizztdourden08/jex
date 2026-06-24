import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Locate locally-cached library art for an app. Steam has used two layouts:
 * a per-appid folder (newer) and flat `<appid>_<kind>.jpg` files (older) — we
 * check both so cached art shows with zero network.
 */
const findArtFile = (steamPath: string, appid: number, kind: string): string | null => {
  const cache = join(steamPath, 'appcache', 'librarycache')
  const id = String(appid)
  const byKind: Record<string, string[]> = {
    header: [join(cache, id, 'header.jpg'), join(cache, `${id}_header.jpg`)],
    capsule: [join(cache, id, 'library_600x900.jpg'), join(cache, `${id}_library_600x900.jpg`)],
    hero: [join(cache, id, 'library_hero.jpg'), join(cache, `${id}_library_hero.jpg`)],
    logo: [join(cache, id, 'logo.png'), join(cache, `${id}_logo.png`)],
  }
  for (const p of byKind[kind] ?? byKind.header) if (existsSync(p)) return p
  return null
}

/** True when at least a header/capsule is cached locally. */
const hasLocalArt = (steamPath: string, appid: number): boolean => {
  return findArtFile(steamPath, appid, 'header') != null || findArtFile(steamPath, appid, 'capsule') != null
}

export { findArtFile, hasLocalArt }
