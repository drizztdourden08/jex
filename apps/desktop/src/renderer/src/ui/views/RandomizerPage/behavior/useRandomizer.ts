import { useEffect, useMemo, useState } from 'react'
import { useLibrary } from '@/hooks/useLibrary'
import { useFilterState } from '@/hooks/useFilterState'
import { randomPick, type WeightMode } from '@/lib/query/randomizer'
import { applyFilter } from '@shared/filterApply'
import { storeToGames } from '@/lib/search/storeToGames'
import { useAgentRandomizer, takeRandomizerRequest } from '@/store/agentRandomizer'
import { inScope } from '@shared/scope'
import type { Game } from '@shared/library'
import type { SearchVocab } from '@shared/search'
import type { ExplicitFacets } from '@ui/compounds/GameFilters'
import { CATALOG_FEATURES, type Source } from './randomizer.constants'

const useRandomizer = () => {
  const { games } = useLibrary()
  const flt = useFilterState()
  const [weight, setWeight] = useState<WeightMode>('uniform')
  const [count, setCount] = useState(1)
  const [picks, setPicks] = useState<Game[]>([])
  const [poolSize, setPoolSize] = useState<number | null>(null)
  const [excluded, setExcluded] = useState<number[]>([])
  const [source, setSource] = useState<Source>('library')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The faceted vocabulary lets us reconstruct genres/tags on store hits (loaded
  // once; null until ready — store rolls still work, just without tag names).
  const [vocab, setVocab] = useState<SearchVocab | null>(null)
  useEffect(() => {
    void window.api.search.getVocab().then(setVocab)
  }, [])

  // For the Store source, offer the whole-Steam faceted vocabulary (synced tags +
  // genres + catalog-filterable features) so Normal mode can filter by any store
  // tag — not just the ones in your local library.
  const storeFacets: ExplicitFacets | undefined = vocab
    ? {
        genres: vocab.genres,
        categories: vocab.categories,
        tags: vocab.tags.map((t) => t.name),
        features: CATALOG_FEATURES,
      }
    : undefined

  // ── Library / wishlist: pick locally from the in-memory mirror ──
  // The pool is whatever the chosen source + filter (basic/normal/advanced)
  // matches; randomPick then just applies weighting + exclusions.
  const pickFrom = (exclude: number[]) => {
    const base = games.filter((g) => inScope(g, source) && flt.predicate(g))
    return randomPick(base, {}, { count, weight, exclude })
  }

  const rollStore = async (exclude: number[]) => {
    // The store bridge ships in the preload, which only loads at app startup — if
    // the renderer hot-reloaded onto an older preload it won't exist yet.
    if (typeof window.api.search.randomPicks !== 'function') {
      setError('Store rolling needs an app restart to load — fully restart, then try again.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await window.api.search.randomPicks(
        { text: flt.spec.text?.trim() || undefined, spec: flt.spec },
        // Over-fetch so the client-side exclusion filter doesn't starve the roll.
        Math.min(50, count + exclude.length),
      )
      const fresh = storeToGames(res.picks, vocab)
        .filter((g) => !exclude.includes(g.appid))
        .slice(0, count)
      setPicks(fresh)
      setPoolSize(res.total)
    } catch (e) {
      console.error('store randomizer roll failed', e)
      setError('Could not reach the Steam store — check your connection and try again.')
      setPicks([])
      setPoolSize(null)
    } finally {
      setBusy(false)
    }
  }

  const roll = (exclude = excluded) => {
    if (source === 'store') {
      void rollStore(exclude)
      return
    }
    const r = pickFrom(exclude)
    setPicks(r.picks)
    setPoolSize(r.poolSize)
  }

  const reroll = () => {
    const next = [...excluded, ...picks.map((g) => g.appid)]
    setExcluded(next)
    roll(next)
  }

  const excludeOne = (appid: number) => {
    const next = [...excluded, appid]
    setExcluded(next)
    roll(next)
  }

  const reset = () => {
    setExcluded([])
    roll([])
  }

  const changeSource = (v: Source) => {
    setSource(v)
    // Picks/exclusions belong to the previous source — drop them so only
    // the chosen source's content is shown until the next roll.
    setPicks([])
    setPoolSize(null)
    setExcluded([])
    setError(null)
  }

  // The AI roll_randomizer tool: the Layout dispatch already resolved the roll
  // (source/filter/weight/count → picks + poolSize), so we just reflect the chosen
  // source + filter in the toolbar and display the picks it sent.
  const rNonce = useAgentRandomizer((s) => s.nonce)
  useEffect(() => {
    const req = takeRandomizerRequest()
    if (!req) return
    setSource(req.source)
    if (req.spec) {
      flt.setMode('normal')
      flt.setSpec({ sortBy: 'random', sortDir: 'asc', ...req.spec })
    }
    if (req.weight) setWeight(req.weight)
    if (req.count) setCount(req.count)
    setPicks(req.picks)
    setPoolSize(req.poolSize)
    setExcluded([])
  }, [rNonce])

  // Sort the rolled results for display (random order by default; the toolbar
  // sort reorders them). Only sort keys matter here — picks already passed filters.
  const shownPicks = useMemo(
    () => applyFilter(picks, { sortBy: flt.spec.sortBy, sortDir: flt.spec.sortDir }),
    [picks, flt.spec.sortBy, flt.spec.sortDir],
  )

  return {
    games,
    flt,
    weight,
    setWeight,
    count,
    setCount,
    picks,
    poolSize,
    excluded,
    source,
    busy,
    error,
    storeFacets,
    roll,
    reroll,
    reset,
    excludeOne,
    changeSource,
    shownPicks,
  }
}

export { useRandomizer }
