import type { HostWishlist } from '@jex/ai-contract'
import { createGroup, listGroups, getGroup, updateGroup, deleteGroup, reorderGroups } from '../db/wishlist'
import { addToWishlistAndMark } from '../steam/wishlistAddFlow'
import { getMainWindow } from '../window/window-ref'

const notifyChanged = (): void => {
  getMainWindow()?.webContents.send('wishlist:groupsChanged')
}

/** Wishlist host for the AI plugin; every group mutation tells the renderer to reload. */
const createWishlistHost = (): HostWishlist => ({
  listGroups,
  getGroup,
  createGroup: (name, filterSpec, manualAppids) => {
    const g = createGroup(name, filterSpec ?? null, manualAppids ?? [])
    notifyChanged()
    return g
  },
  updateGroup: (id, patch) => {
    const g = updateGroup(id, patch)
    notifyChanged()
    return g
  },
  deleteGroup: (id) => {
    deleteGroup(id)
    notifyChanged()
  },
  reorderGroups: (ids) => {
    reorderGroups(ids)
    notifyChanged()
  },
  addToSteam: addToWishlistAndMark,
})

export { createWishlistHost }
