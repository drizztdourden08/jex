import { settings } from '../settings'
import { autoSync, runWishlistSync } from '../library/sync'

/**
 * Background auto-sync on launch (granular, all default ON). Runs only on a real
 * launch (skipped during smokes), a beat after the window mounts. Library sync is
 * API-key-gated; wishlist sync is keyless and runs independently (failures are
 * non-fatal — private wishlist / no SteamID just leaves the tab empty).
 */
const scheduleStartupSync = (): void => {
  const flag = (k: string): boolean => settings.get(k) !== false // default true
  const flags = {
    onOpen: flag('autoSyncOnOpen'),
    daily: flag('autoSyncDaily'),
    monthly: flag('autoFullResyncMonthly'),
  }
  if (flags.onOpen || flags.daily || flags.monthly) {
    setTimeout(() => void autoSync(flags), 1500)
  }
  if (flag('autoSyncWishlist')) {
    setTimeout(() => {
      void runWishlistSync().catch((e) =>
        console.error('[main] wishlist auto-sync failed:', String(e)),
      )
    }, 2500)
  }
}

export { scheduleStartupSync }
