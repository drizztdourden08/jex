import { useCallback, useEffect, useState } from 'react'

type FiltersPage = 'library' | 'randomizer' | 'search' | 'wishlist'
type CollapsedMap = Record<string, boolean>

const SETTING_KEY = 'filtersCollapsed'

// Module-level so a remount starts on the known state instead of flashing expanded.
let known: CollapsedMap | null = null

const parseMap = (v: unknown): CollapsedMap => {
  if (!v || typeof v !== 'object') return {}
  const out: CollapsedMap = {}
  for (const [k, val] of Object.entries(v)) if (val === true) out[k] = true
  return out
}

/** Per-page "filters collapsed" flag, persisted as one `filtersCollapsed` setting (default expanded). */
const useFiltersCollapsed = (page: FiltersPage) => {
  const [collapsed, setCollapsed] = useState<boolean>(known?.[page] ?? false)

  useEffect(() => {
    if (known) return
    let active = true
    window.api.settings
      .get<unknown>(SETTING_KEY)
      .then((v) => {
        known = parseMap(v)
        if (active) setCollapsed(known[page] ?? false)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [page])

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      known = { ...(known ?? {}), [page]: next }
      window.api.settings.set(SETTING_KEY, known).catch(() => {})
      return next
    })
  }, [page])

  return { collapsed, toggle }
}

export { useFiltersCollapsed }
export type { FiltersPage }
