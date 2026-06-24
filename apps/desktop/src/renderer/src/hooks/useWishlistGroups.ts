import { useCallback, useEffect, useState } from 'react'
import type { FilterSpec } from '@shared/filter'
import type { WishlistGroup, WishlistGroupPatch } from '@shared/wishlist'

/**
 * Loads + mutates the user's sub-wishlists over IPC. Each mutation round-trips to
 * main (the source of truth) and reloads, keeping the local list authoritative.
 */
const useWishlistGroups = () => {
  const [groups, setGroups] = useState<WishlistGroup[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setGroups(await window.api.wishlist.groups.list())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const create = useCallback(
    async (name: string, filterSpec?: FilterSpec | null, manualAppids?: number[]) => {
      const g = await window.api.wishlist.groups.create(name, filterSpec ?? null, manualAppids ?? [])
      await reload()
      return g
    },
    [reload],
  )

  const update = useCallback(
    async (id: number, patch: WishlistGroupPatch) => {
      await window.api.wishlist.groups.update(id, patch)
      await reload()
    },
    [reload],
  )

  const remove = useCallback(
    async (id: number) => {
      await window.api.wishlist.groups.delete(id)
      await reload()
    },
    [reload],
  )

  /** Pin/unpin a game in a group's manual member list. */
  const toggleManual = useCallback(
    async (id: number, appid: number) => {
      const g = groups.find((x) => x.id === id)
      if (!g) return
      const has = g.manualAppids.includes(appid)
      const manualAppids = has
        ? g.manualAppids.filter((a) => a !== appid)
        : [...g.manualAppids, appid]
      await update(id, { manualAppids })
    },
    [groups, update],
  )

  return { groups, loading, reload, create, update, remove, toggleManual }
}

export { useWishlistGroups }
