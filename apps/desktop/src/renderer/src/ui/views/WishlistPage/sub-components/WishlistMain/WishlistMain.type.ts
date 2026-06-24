import type { Dispatch, SetStateAction } from 'react'
import type { useFilterState } from '@/hooks/useFilterState'
import type { FilterSpec } from '@shared/filter'
import type { Game, SyncProgress } from '@shared/library'
import type { WishlistGroup } from '@shared/wishlist'

type Selection = number | 'all'

type FilterState = ReturnType<typeof useFilterState>

type WishlistMainProps = {
  selected: Selection
  activeGroup: WishlistGroup | undefined
  base: Game[]
  ready: Game[]
  wishlist: Game[]
  filtered: Game[]
  loading: boolean
  syncing: boolean
  pendingCount: number
  progress: SyncProgress | null
  hint: string | null
  flt: FilterState
  groups: WishlistGroup[]
  openMenu: number | null
  canSaveFilter: boolean
  onSync: () => void | Promise<void>
  onCreateAndEdit: (filterSpec: FilterSpec | null) => void | Promise<void>
  onSaveFilterToGroup: () => void | Promise<void>
  onSetOpenMenu: Dispatch<SetStateAction<number | null>>
  onToggleManual: (id: number, appid: number) => void | Promise<void>
}

export type { WishlistMainProps, Selection }
