import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useStoreNav } from '@/store/storeNav'
import type { SteamWebview } from '../StorePage.type'

// Reflect tab visibility so the title-bar controls + nav gestures only apply here.
// Main also needs it to gate the browser-nav keys (Alt+←/→, F5/Ctrl+R). On
// activation, move focus into the webview so mouse back/forward land on the store
// (when the host keeps focus, those buttons navigate the app router instead).
const useStoreActivation = (ref: RefObject<SteamWebview | null>, active: boolean) => {
  const setStatus = useStoreNav((s) => s.setStatus)

  useEffect(() => {
    setStatus({ active })
    void window.api.store.setActive(active)
    if (active) {
      const wv = ref.current
      // A tick after it's shown so the element is focusable.
      const t = setTimeout(() => wv?.focus(), 0)
      return () => clearTimeout(t)
    }
    return undefined
  }, [ref, active, setStatus])
}

export { useStoreActivation }
