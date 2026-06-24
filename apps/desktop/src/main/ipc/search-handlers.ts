import { ipcMain } from 'electron'
import { settings } from '../settings'
import { getAllGames } from '../db/games'
import { searchCatalog, randomStorePicks } from '../steam/search'
import { getVocab, syncVocab } from '../steam/searchVocab'
import type { SearchQuery } from '@shared/search'

/** Whole-Steam catalog search (native Search tab) + the randomizer's store source. */
const registerSearchHandlers = (): void => {
  ipcMain.handle('search:query', (_e, query: SearchQuery) =>
    searchCatalog(query ?? {}, (settings.get('storeCountry') as string) || undefined),
  )
  // Random sample from the live store catalog — backs the randomizer's "Store"
  // source (at most two cached requests per roll; see randomStorePicks).
  ipcMain.handle('search:randomPicks', (_e, query: SearchQuery, count: number) =>
    randomStorePicks(query ?? {}, count ?? 1, (settings.get('storeCountry') as string) || undefined),
  )
  // Sync the faceted vocabulary (popular tags) once; fold in the user's own
  // library tags so the filter list is never poorer than what they already have.
  ipcMain.handle('search:syncVocab', () => {
    const libTags = new Set<string>()
    for (const g of getAllGames()) for (const t of g.tags ?? []) libTags.add(t)
    return syncVocab([...libTags])
  })
  ipcMain.handle('search:getVocab', () => getVocab())
}

export { registerSearchHandlers }
