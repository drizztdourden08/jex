import { useEffect, useRef } from 'react'
import type { UiInvokeRequest } from '@shared/agent'

/**
 * The renderer half of the AI tool bridge. `ui`-surface tools run in main but act
 * on renderer state; main dispatches `ui:invoke` and this host runs the matching
 * handler and replies via `uiResult`. Handlers are supplied by the mounting
 * component (Layout) as closures over the router, stores, etc.
 *
 * Handlers are kept in a ref so the single IPC listener always calls the latest
 * closures (fresh `games`, `navigate`, …) without re-subscribing.
 */
type UiHandler = (payload: Record<string, unknown>) => Promise<unknown> | unknown

const useUiToolHost = (handlers: Record<string, UiHandler>): void => {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    return window.api.ai.onUiInvoke(async (req: UiInvokeRequest) => {
      const fn = ref.current[req.action]
      try {
        if (!fn) throw new Error(`Unknown UI action: ${req.action}`)
        const result = await fn((req.payload ?? {}) as Record<string, unknown>)
        window.api.ai.uiResult({ id: req.id, ok: true, result })
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e)
        window.api.ai.uiResult({ id: req.id, ok: false, error })
      }
    })
  }, [])
}

export { useUiToolHost }
export type { UiHandler }
