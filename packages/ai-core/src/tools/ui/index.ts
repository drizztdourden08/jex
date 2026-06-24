import { registerNavigationTools } from './navigation'
import { registerFilterTools } from './filter'
import { registerStoreTools } from './store'

/**
 * UI-surface tools: they run in main but act on renderer state, so each `run`
 * dispatches through `ctx.ui(action, payload)` to the renderer's UI tool host
 * (see src/renderer/src/lib/ai/uiToolHost.ts). The host owns the matching
 * `action` handlers.
 */
const registerUiTools = (): void => {
  registerNavigationTools()
  registerFilterTools()
  registerStoreTools()
}

export { registerUiTools }
