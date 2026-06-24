import { registerLaunchTools } from './launchTools'
import { registerStoreTools } from './storeTools'
import { registerSettingsTools } from './settingsTools'
import { registerSyncTools } from './syncTools'
import { registerWishlistTools } from './wishlistTools'
import { registerSteamInfoTools } from './steamInfoTools'

/**
 * Action tools — they change something (launch, settings, sync, wishlist) or leave
 * the app. Most are `sensitive` (confirm-gated by default); pure navigation to a
 * Steam page is `safe`. The user can retune any of these in Settings → AI tools.
 */
const registerActionTools = (): void => {
  registerLaunchTools()
  registerStoreTools()
  registerSettingsTools()
  registerSyncTools()
  registerWishlistTools()
  registerSteamInfoTools()
}

export { registerActionTools }
