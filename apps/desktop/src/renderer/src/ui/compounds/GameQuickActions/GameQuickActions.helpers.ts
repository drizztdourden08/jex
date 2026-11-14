import type { Game } from '@shared/library'
import type { Fact } from '@ds/composites/FactStrip'

const hours = (min: number): string => {
  const h = min / 60
  return h >= 10 ? `${Math.round(h)} h` : `${h.toFixed(1)} h`
}

const size = (bytes: number): string => {
  const gb = bytes / 1e9
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(bytes / 1e6)} MB`
}

/**
 * The at-a-glance facts for one game, built only from what the mirror holds.
 * A fact whose source field is missing is left out, never shown as a placeholder.
 */
const gameFacts = (game: Game): Fact[] => {
  const facts: Fact[] = []
  if (game.owned) {
    facts.push({
      key: 'played',
      label: 'Played',
      value: game.playtimeForever > 0 ? hours(game.playtimeForever) : 'Never',
      title: game.playtime2weeks > 0 ? `${hours(game.playtime2weeks)} in the last two weeks` : undefined,
    })
  }
  if (game.lastPlayed && game.lastPlayed > 0) {
    const d = new Date(game.lastPlayed * 1000)
    facts.push({ key: 'last', label: 'Last played', value: d.toLocaleDateString(), title: d.toLocaleString() })
  }
  if (game.installed && game.sizeOnDisk) {
    facts.push({ key: 'size', label: 'On disk', value: size(game.sizeOnDisk) })
  }
  const overall = game.reviews?.overall
  if (overall) {
    facts.push({
      key: 'reviews',
      label: 'Reviews',
      value: `${overall.percent}% · ${overall.desc}`,
      title: `${overall.total.toLocaleString()} reviews`,
    })
  }
  if (typeof game.metacritic === 'number') {
    facts.push({ key: 'metacritic', label: 'Metacritic', value: String(game.metacritic) })
  }
  if (game.hltb && game.hltb.main > 0) {
    facts.push({ key: 'hltb', label: 'Main story', value: `${game.hltb.main} h` })
  }
  return facts
}

export { gameFacts }
