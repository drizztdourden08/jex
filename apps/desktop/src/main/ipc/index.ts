import { registerWindowHandlers } from './window-handlers'
import { registerSettingsHandlers } from './settings-handlers'
import { registerLibraryHandlers } from './library-handlers'
import { registerWishlistHandlers } from './wishlist-handlers'
import { registerAiModelHandlers } from './ai-model-handlers'
import { registerAiAgentHandlers } from './ai-agent-handlers'
import { registerAiHostHandlers } from './ai-host-handlers'
import { registerSearchHandlers } from './search-handlers'
import { registerMiscHandlers } from './misc-handlers'

/**
 * Register every IPC channel, grouped per domain. Each `register*Handlers()` owns
 * one domain's `ipcMain.handle` wiring; the handler logic lives in that domain's
 * modules. Called once from app startup.
 */
const registerIpc = (): void => {
  registerWindowHandlers()
  registerSettingsHandlers()
  registerLibraryHandlers()
  registerWishlistHandlers()
  registerAiModelHandlers()
  registerAiAgentHandlers()
  registerAiHostHandlers()
  registerSearchHandlers()
  registerMiscHandlers()
}

export { registerIpc }
