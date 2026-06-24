import type { NavigateFunction } from 'react-router-dom'
import { useStoreNav } from '@/store/storeNav'
import type { UiHandler } from '@/lib/ai/uiToolHost'

interface StoreDeps {
  navigate: NavigateFunction
}

const buildStoreHandlers = (deps: StoreDeps): Record<string, UiHandler> => ({
  navigateStore: (payload) => {
    const url = String(payload.url ?? '')
    if (!/^https?:\/\//.test(url)) throw new Error(`Invalid store URL: ${url}`)
    deps.navigate('/store')
    const controls = useStoreNav.getState().controls
    if (!controls) throw new Error('The store view is not ready yet.')
    controls.loadURL(url)
    return { opened: url }
  },
  readStorePage: async (payload) => {
    deps.navigate('/store')
    const controls = useStoreNav.getState().controls
    if (!controls) throw new Error('The store view is not ready yet.')
    const q = (payload ?? {}) as Record<string, unknown>
    return controls.readContent({
      selector: q.selector != null ? String(q.selector) : undefined,
      containsText: q.containsText != null ? String(q.containsText) : undefined,
      tag: q.tag != null ? String(q.tag) : undefined,
      attribute: q.attribute != null ? String(q.attribute) : undefined,
      attributeValue: q.attributeValue != null ? String(q.attributeValue) : undefined,
      page: q.page != null ? Number(q.page) : undefined,
      pageSize: q.pageSize != null ? Number(q.pageSize) : undefined,
    })
  },
  scrollStorePage: async (payload) => {
    deps.navigate('/store')
    const controls = useStoreNav.getState().controls
    if (!controls) throw new Error('The store view is not ready yet.')
    const to = payload.to === 'top' || payload.to === 'bottom' ? payload.to : undefined
    const text = payload.text != null ? String(payload.text) : undefined
    return controls.scrollTo({ to, text })
  },
})

export { buildStoreHandlers }
export type { StoreDeps }
