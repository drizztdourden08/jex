import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { FilterSpec, SortKey } from '@shared/filter'

type LibrarySort = { sortBy: SortKey; sortDir: 'asc' | 'desc' }

const SETTING_KEY = 'librarySort'
const DEFAULT_SORT: LibrarySort = { sortBy: 'lastPlayed', sortDir: 'desc' }
const SORT_KEYS: readonly string[] = [
  'name',
  'playtimeForever',
  'playtime2weeks',
  'lastPlayed',
  'releaseYear',
  'metacritic',
  'reviewTotal',
  'wishlistPriority',
  'wishlistDate',
  'random',
]

// Module-level so a remount starts on the known choice instead of flashing the default.
let known: LibrarySort | null = null

const parseSort = (v: unknown): LibrarySort => {
  const o = v as Partial<LibrarySort> | null
  if (o && typeof o.sortBy === 'string' && SORT_KEYS.includes(o.sortBy) && (o.sortDir === 'asc' || o.sortDir === 'desc')) {
    return { sortBy: o.sortBy, sortDir: o.sortDir }
  }
  return DEFAULT_SORT
}

const getInitialLibrarySort = (): LibrarySort => known ?? DEFAULT_SORT

/** Loads the Library's saved sort into the filter spec and persists user sort changes. */
const useLibrarySort = (setSpec: Dispatch<SetStateAction<FilterSpec>>) => {
  useEffect(() => {
    if (known) return
    let active = true
    window.api.settings
      .get<unknown>(SETTING_KEY)
      .then((v) => {
        known = parseSort(v)
        if (active) setSpec((s) => ({ ...s, ...known }))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [setSpec])

  const saveSort = useCallback((next: LibrarySort) => {
    known = next
    window.api.settings.set(SETTING_KEY, next).catch(() => {})
  }, [])

  return { saveSort }
}

export { useLibrarySort, getInitialLibrarySort }
export type { LibrarySort }
