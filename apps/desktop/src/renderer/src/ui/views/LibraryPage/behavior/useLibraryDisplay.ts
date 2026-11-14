import { useCallback, useEffect, useState } from 'react'

type LibraryDisplay = 'cards' | 'list'

const SETTING_KEY = 'libraryDisplay'
const DEFAULT_DISPLAY: LibraryDisplay = 'cards'

// Module-level so a remount (back from a game's page) starts on the known choice
// instead of flashing the default until the settings read returns.
let known: LibraryDisplay | null = null

const isDisplay = (v: unknown): v is LibraryDisplay => v === 'cards' || v === 'list'

/** The Library's display mode (cover grid or master-detail list), kept in settings. */
const useLibraryDisplay = () => {
  const [display, setDisplayState] = useState<LibraryDisplay>(known ?? DEFAULT_DISPLAY)

  useEffect(() => {
    if (known) return
    let active = true
    window.api.settings
      .get<unknown>(SETTING_KEY)
      .then((v) => {
        known = isDisplay(v) ? v : DEFAULT_DISPLAY
        if (active) setDisplayState(known)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const setDisplay = useCallback((next: LibraryDisplay) => {
    known = next
    setDisplayState(next)
    window.api.settings.set(SETTING_KEY, next).catch(() => {})
  }, [])

  return { display, setDisplay }
}

export { useLibraryDisplay }
export type { LibraryDisplay }
