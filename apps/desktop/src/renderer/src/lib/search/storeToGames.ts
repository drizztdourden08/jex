import type { Game } from '@shared/library'
import type { SearchResult, SearchVocab } from '@shared/search'
import { resultToGame, vocabMaps } from './resultToGame'

/**
 * Map live Steam catalog hits to partial `Game`s so store picks flow through the
 * same cards / exclude / reroll path as local picks. The faceted vocab lets us
 * reconstruct genre/tag names; the hi-res capsule stands in for header art.
 */
const storeToGames = (results: SearchResult[], vocab: SearchVocab | null): Game[] => {
  const { tagNameById, genreSet } = vocabMaps(vocab)
  return results.map((r) => {
    const g = resultToGame(r, tagNameById, genreSet)
    const big = r.capsule?.replace('capsule_231x87', 'capsule_616x353')
    return big ? { ...g, media: { headerImage: big, screenshots: [], movies: [] } } : g
  })
}

export { storeToGames }
