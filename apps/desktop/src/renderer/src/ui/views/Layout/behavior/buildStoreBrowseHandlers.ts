import type { NavigateFunction } from 'react-router-dom'
import { useStoreNav } from '@/store/storeNav'
import type { StoreActOp, StoreNavControls } from '@/store/storeNav'
import type { UiHandler } from '@/lib/ai/uiToolHost'

const str = (v: unknown): string | undefined => (v != null && String(v).trim() !== '' ? String(v) : undefined)
const num = (v: unknown): number | undefined => (v != null && Number.isFinite(Number(v)) ? Number(v) : undefined)

const pickTarget = (p: Record<string, unknown>) => ({
  label: str(p.label),
  selector: str(p.selector),
  index: num(p.index),
  value: str(p.value),
  checked: typeof p.checked === 'boolean' ? p.checked : undefined,
})

/** AI browse handlers: show the Store tab, then drive the webview through its controls. */
const buildStoreBrowseHandlers = (deps: { navigate: NavigateFunction }): Record<string, UiHandler> => {
  const withControls = <T>(fn: (c: StoreNavControls, p: Record<string, unknown>) => Promise<T>): UiHandler => {
    return async (payload) => {
      deps.navigate('/store')
      const controls = useStoreNav.getState().controls
      if (!controls) throw new Error('The store view is not ready yet.')
      return fn(controls, payload ?? {})
    }
  }
  const act = (op: StoreActOp, pick: (p: Record<string, unknown>) => Record<string, unknown>): UiHandler =>
    withControls((c, p) => c.act(op, pick(p)))

  return {
    storeState: withControls((c) => c.pageState()),
    storeBack: withControls((c) => c.history('back')),
    storeForward: withControls((c) => c.history('forward')),
    storeReload: withControls((c) => c.history('reload')),
    storeWaitFor: withControls((c, p) => c.waitFor({ text: str(p.text), selector: str(p.selector), timeoutMs: num(p.timeoutMs) })),
    storeListLinks: act('links', (p) => ({
      containsText: str(p.containsText),
      page: num(p.page),
      pageSize: num(p.pageSize),
      inViewport: p.inViewport === true,
    })),
    storeClick: act('click', (p) => ({ text: str(p.text), selector: str(p.selector), index: num(p.index), x: num(p.x), y: num(p.y) })),
    storeHover: act('hover', (p) => ({ text: str(p.text), selector: str(p.selector), index: num(p.index), x: num(p.x), y: num(p.y) })),
    storeType: act('type', (p) => ({
      value: p.value != null ? String(p.value) : '',
      label: str(p.label),
      selector: str(p.selector),
      index: num(p.index),
      submit: p.submit === true,
      append: p.append === true,
    })),
    storeSelect: act('select', (p) => ({
      ...pickTarget(p),
      targets: Array.isArray(p.targets) ? p.targets.slice(0, 30).map((t) => pickTarget((t ?? {}) as Record<string, unknown>)) : undefined,
    })),
    storePressKey: act('key', (p) => ({
      key: str(p.key),
      label: str(p.label),
      selector: str(p.selector),
      index: num(p.index),
      shift: p.shift === true,
    })),
  }
}

export { buildStoreBrowseHandlers }
