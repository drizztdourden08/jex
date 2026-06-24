// The UI dispatcher handed to a plugin's init: `ui`-surface tools call into the
// renderer through here. We send a correlated ui:invoke and resolve when the renderer
// answers on ui:result; a timeout guards a missing/slow host. (Extracted from the old
// ui-bridge.ts — now wired via AiPlugin.init opts.ui instead of a module global.)
import { ipcMain } from 'electron'
import type { UiDispatcher } from '@jex/ai-contract'
import type { UiInvokeResult } from '@shared/agent'
import { getMainWindow } from '../window/window-ref'

const TIMEOUT_MS = 20_000

const createUiDispatcher = (): UiDispatcher => {
  const pending = new Map<string, (r: UiInvokeResult) => void>()
  let seq = 0

  ipcMain.on('ui:result', (_e, r: UiInvokeResult) => pending.get(r.id)?.(r))

  return (action, payload) => {
    const wc = getMainWindow()?.webContents
    if (!wc || wc.isDestroyed()) return Promise.reject(new Error('UI is not available.'))
    const id = `ui-${seq++}`
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`UI action "${action}" timed out.`))
      }, TIMEOUT_MS)
      pending.set(id, (r) => {
        clearTimeout(timer)
        pending.delete(id)
        if (r.ok) resolve(r.result)
        else reject(new Error(r.error ?? `UI action "${action}" failed.`))
      })
      wc.send('ui:invoke', { id, action, payload })
    })
  }
}

export { createUiDispatcher }
