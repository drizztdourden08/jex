import { useCallback, useState } from 'react'

const KEY = 'jex.settings.tab'

const read = (fallback: string, valid: string[]): string => {
  try {
    const v = localStorage.getItem(KEY)
    return v && valid.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

// The selected Settings tab, remembered across visits (a per-viewer convenience only).
const useSettingsTab = (valid: string[], fallback: string) => {
  const [tab, setTab] = useState(() => read(fallback, valid))
  const select = useCallback((id: string) => {
    setTab(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {
      // storage unavailable: the tab just is not remembered
    }
  }, [])
  return { tab, select }
}

export { useSettingsTab }
