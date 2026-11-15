import type { BrowserWindow } from 'electron'
import type { ToolContext } from '../tools'
import { getUiDispatcher } from './ui-dispatcher'

/** The context every tool runs with, shared by the local and remote loops. `vision`
 *  is false for local models: node-llama-cpp 3.18.1 takes text prompts only. */
const buildToolContext = (window: BrowserWindow | null, vision: boolean): ToolContext => ({
  window,
  vision,
  ui: async (action, payload) => {
    const uiDispatch = getUiDispatcher()
    if (!uiDispatch) throw new Error('UI is not available right now.')
    return uiDispatch(action, payload)
  },
})

export { buildToolContext }
