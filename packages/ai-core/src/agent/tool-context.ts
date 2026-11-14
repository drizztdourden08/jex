import type { BrowserWindow } from 'electron'
import type { ToolContext } from '../tools'
import { getUiDispatcher } from './ui-dispatcher'

/** The context every tool runs with, shared by the local and remote loops. */
const buildToolContext = (window: BrowserWindow | null): ToolContext => ({
  window,
  ui: async (action, payload) => {
    const uiDispatch = getUiDispatcher()
    if (!uiDispatch) throw new Error('UI is not available right now.')
    return uiDispatch(action, payload)
  },
})

export { buildToolContext }
