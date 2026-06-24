import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useStoreNav, type StoreReadQuery, type StoreReadResult, type StoreScrollResult } from '@/store/storeNav'
import { buildReadScript } from './buildReadScript'
import { OVERVIEW_TEXT_CAP, ELEMENT_HTML_CAP, RESULT_TOTAL_CAP } from '../StorePage.constants'
import type { SteamWebview } from '../StorePage.type'

// Wire the webview's controls + status into the shared store once on mount.
const useStoreControls = (ref: RefObject<SteamWebview | null>) => {
  const setStatus = useStoreNav((s) => s.setStatus)
  const setControls = useStoreNav((s) => s.setControls)

  useEffect(() => {
    const wv = ref.current
    if (!wv) return

    const sync = () => setStatus({ canBack: wv.canGoBack(), canFwd: wv.canGoForward() })
    const onStart = () => setStatus({ loading: true })
    const onStop = () => {
      setStatus({ loading: false })
      sync()
    }

    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('did-navigate', sync)
    wv.addEventListener('did-navigate-in-page', sync)

    setControls({
      back: () => wv.canGoBack() && wv.goBack(),
      forward: () => wv.canGoForward() && wv.goForward(),
      reload: () => wv.reload(),
      stop: () => wv.stop(),
      loadURL: (url: string) => void wv.loadURL(url),
      // Read/query the guest page's DOM by running JS inside the webview (the
      // renderer can't reach into the cross-origin store DOM any other way).
      readContent: (query?: StoreReadQuery) =>
        wv.executeJavaScript(
          buildReadScript(query ?? {}, {
            overview: OVERVIEW_TEXT_CAP,
            html: ELEMENT_HTML_CAP,
            total: RESULT_TOTAL_CAP,
          }),
        ) as Promise<StoreReadResult>,
      // Scroll to top/bottom, or to the SHORTEST (most specific) element whose text
      // contains `text` — so "scroll to the reviews" lands on the heading, not the page.
      scrollTo: (opts) =>
        wv.executeJavaScript(`(() => {
          const opts = ${JSON.stringify(opts)};
          if (opts.to === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return { found: true }; }
          if (opts.to === 'bottom') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); return { found: true }; }
          const needle = (opts.text || '').toLowerCase().trim();
          if (!needle) return { found: false };
          let best = null;
          for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,a,button,span,p,li,div')) {
            const t = (el.innerText || '').trim();
            if (t && t.toLowerCase().includes(needle) && (!best || t.length < best.len)) best = { el, txt: t, len: t.length };
          }
          if (!best) return { found: false };
          best.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return { found: true, matched: best.txt.slice(0, 140) };
        })()`) as Promise<StoreScrollResult>,
    })

    return () => {
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('did-navigate', sync)
      wv.removeEventListener('did-navigate-in-page', sync)
      setControls(null)
    }
  }, [ref, setStatus, setControls])
}

export { useStoreControls }
