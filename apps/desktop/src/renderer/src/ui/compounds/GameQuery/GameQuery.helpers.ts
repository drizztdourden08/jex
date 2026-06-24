import type { Game } from '@shared/library'
import type { FieldDef } from '@shared/query'

const optionsFor = (games: Game[], def: FieldDef): { value: string; label: string }[] => {
  if (def.options) return def.options
  const counts = new Map<string, number>()
  for (const g of games) {
    const v = def.get(g)
    if (Array.isArray(v)) for (const x of v) counts.set(String(x), (counts.get(String(x)) ?? 0) + 1)
    else if (typeof v === 'string' && v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => ({ value, label: value }))
}

const numRange = (games: Game[], def: FieldDef): { min: number; max: number } | null => {
  if (def.key === 'metacritic' || def.key === 'reviewPercent') return { min: 0, max: 100 }
  if (def.key === 'metacriticUser') return { min: 0, max: 10 }
  if (def.unit === 'unix' || def.unit === 'bytes') return null
  let mn = Infinity
  let mx = -Infinity
  for (const g of games) {
    const v = def.get(g)
    if (typeof v === 'number' && isFinite(v)) {
      if (v < mn) mn = v
      if (v > mx) mx = v
    }
  }
  // Always give the slider a usable range, even when the library's data is sparse or
  // uniform (e.g. installed-only with little playtime) — otherwise the slider collapses
  // to a degenerate span (0–1 min) and can't move. Time fields get a sensible floor so
  // the track always spans a meaningful playtime (≥100 h) regardless of the data.
  const floor = def.unit === 'min' ? 6000 : 100
  if (mn === Infinity) return { min: 0, max: floor }
  const lo = Math.floor(Math.min(0, mn))
  const hi = Math.max(Math.ceil(mx), lo + 1, def.unit === 'min' || def.unit === '%' ? floor : lo + 1)
  return { min: lo, max: hi }
}

export { optionsFor, numRange }
