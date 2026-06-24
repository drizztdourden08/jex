import { ipcMain } from 'electron'
import { markWishlisted } from '../db/games'
import { persist } from '../db/database'
import { createGroup, deleteGroup, listGroups, reorderGroups, updateGroup } from '../db/wishlist'
import { runWishlistSync } from '../library/sync'
import { addToWishlist } from '../steam/wishlistAdd'
import type { FilterSpec } from '@shared/filter'
import type { WishlistGroupPatch } from '@shared/wishlist'

/** Keyless wishlist sync + local sub-wishlist groups. */
const registerWishlistHandlers = (): void => {
  ipcMain.handle('wishlist:sync', () => runWishlistSync())
  // Add a game to the Steam wishlist via the logged-in Store-tab session. On
  // success, optimistically flip the local flag so the UI reflects it immediately.
  ipcMain.handle('wishlist:add', async (_e, appid: number) => {
    const res = await addToWishlist(appid)
    if (res.ok) {
      markWishlisted(appid, true)
      persist()
      void runWishlistSync().catch(() => {})
    }
    return res
  })
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
