import { useEffect, useMemo, useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { useLibrary } from '@/hooks/useLibrary'
import { useFilterState } from '@/hooks/useFilterState'
import { useWishlistGroups } from '@/hooks/useWishlistGroups'
import { groupMembers } from '@/lib/query/wishlist'
import { WishlistRail } from './sub-components/WishlistRail'
import { WishlistMain } from './sub-components/WishlistMain'
import { useWishlistSync } from './behavior/useWishlistSync'
import { useAgentWishlistActions } from './behavior/useAgentWishlistActions'
import { isResolved } from './behavior/wishlist-utils'
import type { Selection } from './sub-components/WishlistRail'
import type { FilterSpec } from '@shared/filter'
import './WishlistPage.css'
import type { WishlistGroup } from '@shared/wishlist'

const WishlistPage = () => {
  const { games, loading, reload } = useLibrary()
  const flt = useFilterState()
  const wl = useWishlistGroups()
  const [selected, setSelected] = useState<Selection>('all')
  const [renaming, setRenaming] = useState<number | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null) // appid whose add-menu is open

  const wishlist = useMemo(() => games.filter((g) => g.wishlisted), [games])
  const ready = useMemo(() => wishlist.filter(isResolved), [wishlist])
  const pendingCount = wishlist.length - ready.length

  const { syncing, progress, hint, doSync } = useWishlistSync({ wishlist, reload })

  useAgentWishlistActions(flt, setSelected)

  // Default to Steam wishlist order on first mount.
  useEffect(() => {
    flt.setSpec({ ...flt.spec, sortBy: 'wishlistPriority', sortDir: 'asc' })

  }, [])

  // One card add-menu open at a time; a click anywhere outside closes it.
  useEffect(() => {
    if (openMenu == null) return
    const onDown = (e: globalThis.MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.wl-add')) setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openMenu])

  const activeGroup: WishlistGroup | undefined =
    selected === 'all' ? undefined : wl.groups.find((g) => g.id === selected)

  const base = useMemo(() => {
    if (selected === 'all' || !activeGroup) return ready
    return groupMembers(ready, activeGroup)
  }, [selected, activeGroup, ready])

  const filtered = useMemo(() => flt.filterAndSort(base), [base, flt.filterAndSort])

  const canSaveFilter = flt.activeCount > 0 && flt.mode !== 'advanced'

  /** Create a sub-wishlist and drop straight into renaming it (no transient form). */
  const createAndEdit = async (filterSpec: FilterSpec | null) => {
    const g = await wl.create('New sub-wishlist', filterSpec)
    setSelected(g.id)
    setRenaming(g.id)
  }

  const saveFilterToGroup = async () => {
    if (!activeGroup) return
    await wl.update(activeGroup.id, { filterSpec: { ...flt.spec } })
  }

  const removeGroup = async (id: number) => {
    await wl.remove(id)
    if (selected === id) setSelected('all')
    if (renaming === id) setRenaming(null)
  }

  const countFor = (sel: Selection): number => {
    if (sel === 'all') return ready.length
    const g = wl.groups.find((x) => x.id === sel)
    return g ? groupMembers(ready, g).length : 0
  }

  const commitRename = (id: number, name: string) => {
    if (name.trim()) void wl.update(id, { name: name.trim() })
    setRenaming(null)
  }

  return (
    <Box className="wl-layout">
      <WishlistRail
        groups={wl.groups}
        selected={selected}
        readyCount={ready.length}
        renaming={renaming}
        countFor={countFor}
        onSelect={setSelected}
        onCommitRename={commitRename}
        onCancelRename={() => setRenaming(null)}
        onStartRename={setRenaming}
        onRemove={(id) => void removeGroup(id)}
        onCreate={() => void createAndEdit(null)}
      />

      <WishlistMain
        selected={selected}
        activeGroup={activeGroup}
        base={base}
        ready={ready}
        wishlist={wishlist}
        filtered={filtered}
        loading={loading}
        syncing={syncing}
        pendingCount={pendingCount}
        progress={progress}
        hint={hint}
        flt={flt}
        groups={wl.groups}
        openMenu={openMenu}
        canSaveFilter={canSaveFilter}
        onSync={doSync}
        onCreateAndEdit={createAndEdit}
        onSaveFilterToGroup={saveFilterToGroup}
        onSetOpenMenu={setOpenMenu}
        onToggleManual={wl.toggleManual}
      />
    </Box>
  )
}

export { WishlistPage }
