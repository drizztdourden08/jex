import { ipcMain } from 'electron'
import { createGroup, deleteGroup, listGroups, reorderGroups, updateGroup } from '../db/wishlist'
import { runWishlistSync } from '../library/sync'
import { addToWishlistAndMark } from '../steam/wishlistAddFlow'
import type { FilterSpec } from '@shared/filter'
import type { WishlistGroupPatch } from '@shared/wishlist'

/** Keyless wishlist sync + local sub-wishlist groups. */
const registerWishlistHandlers = (): void => {
  ipcMain.handle('wishlist:sync', () => runWishlistSync())
  // Add a game to the Steam wishlist via the logged-in Store-tab session.
  ipcMain.handle('wishlist:add', (_e, appid: number) => addToWishlistAndMark(appid))
  ipcMain.handle('wishlist:groups:list', () => listGroups())
  ipcMain.handle(
    'wishlist:groups:create',
    (_e, name: string, filterSpec?: FilterSpec | null, manualAppids?: number[]) =>
      createGroup(name, filterSpec ?? null, manualAppids ?? []),
  )
  ipcMain.handle('wishlist:groups:update', (_e, id: number, patch: WishlistGroupPatch) =>
    updateGroup(id, patch),
  )
  ipcMain.handle('wishlist:groups:delete', (_e, id: number) => deleteGroup(id))
  ipcMain.handle('wishlist:groups:reorder', (_e, ids: number[]) => reorderGroups(ids))
}

export { registerWishlistHandlers }
