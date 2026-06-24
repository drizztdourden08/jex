import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAiDrawer } from '@/store/aiDrawer'

const useLayoutEffects = () => {
  const toggle = useAiDrawer((s) => s.toggle)
  const pathname = useLocation().pathname

  // Tell the enrichment scheduler which tab/detail is open so it gives those items
  // worker priority (a game's detail page wins outright; the Wishlist tab promotes
  // wishlist items above the rest).
  useEffect(() => {
    const m = pathname.match(/^\/game\/(\d+)/)
    const tab = m ? 'game' : pathname.replace(/^\//, '').split('/')[0] || 'library'
    void window.api.enrich.setActive({ tab, appid: m ? Number(m[1]) : undefined })
  }, [pathname])

  // Ctrl/Cmd+K toggles the AI drawer from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  // Mouse back/forward buttons: for mice that deliver them as DOM events (XBUTTON)
  // rather than WM_APPCOMMAND, catch them here and forward to the store webview.
  // Always preventDefault so they can never drive the app router (tab changes).
  // main coalesces this with the app-command path so we navigate exactly once.
  useEffect(() => {
    const isNav = (e: MouseEvent) => e.button === 3 || e.button === 4
    const block = (e: MouseEvent) => {
      if (isNav(e)) e.preventDefault()
    }
    const onUp = (e: MouseEvent) => {
      if (!isNav(e)) return
      e.preventDefault()
      void window.api.store.nav(e.button === 3 ? 'back' : 'forward')
    }
    window.addEventListener('mousedown', block, true)
    window.addEventListener('mouseup', onUp, true)
    window.addEventListener('auxclick', block, true)
    return () => {
      window.removeEventListener('mousedown', block, true)
      window.removeEventListener('mouseup', onUp, true)
      window.removeEventListener('auxclick', block, true)
    }
  }, [])
}

export { useLayoutEffects }
