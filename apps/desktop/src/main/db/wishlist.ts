import type { WishlistGroup, WishlistGroupPatch } from '@shared/wishlist'
import type { FilterSpec } from '@shared/filter'
import { all, get, persist, run } from './database'

/**
 * CRUD for sub-wishlists (`wishlist_groups`). A group's membership (manual pins ∪
 * saved filter) is computed in the renderer from the live game set; here we just
 * store the definition. Every mutation persists immediately.
 */

interface GroupRow {
  id: number
  name: string
  filterSpec: string | null
  manualAppids: string | null
  sortOrder: number
  createdAt: number
  updatedAt: number
}

const parseSpec = (v: string | null): FilterSpec | null => {
  if (!v) return null
  try {
    return JSON.parse(v) as FilterSpec
  } catch {
    return null
  }
}

const parseAppids = (v: string | null): number[] => {
  if (!v) return []
  try {
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

const toGroup = (r: GroupRow): WishlistGroup => {
  return {
    id: r.id,
    name: r.name,
    filterSpec: parseSpec(r.filterSpec),
    manualAppids: parseAppids(r.manualAppids),
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

const listGroups = (): WishlistGroup[] => {
  return all<GroupRow>('SELECT * FROM wishlist_groups ORDER BY sortOrder, id').map(toGroup)
}

const getGroup = (id: number): WishlistGroup | null => {
  const r = get<GroupRow>('SELECT * FROM wishlist_groups WHERE id = ?', [id])
  return r ? toGroup(r) : null
}

const createGroup = (
  name: string,
  filterSpec: FilterSpec | null = null,
  manualAppids: number[] = [],
): WishlistGroup => {
  const now = Date.now()
  const maxOrder = get<{ n: number | null }>('SELECT MAX(sortOrder) AS n FROM wishlist_groups')?.n
  run(
    'INSERT INTO wishlist_groups (name, filterSpec, manualAppids, sortOrder, createdAt, updatedAt) VALUES (?,?,?,?,?,?)',
    [
      name.trim() || 'Untitled',
      filterSpec ? JSON.stringify(filterSpec) : null,
      JSON.stringify(manualAppids),
      (maxOrder ?? -1) + 1,
      now,
      now,
    ],
  )
  // Read the new row back BEFORE persisting: persist() calls _db.export(), which
  // resets sqlite's last_insert_rowid() to 0 — querying after it would miss the row.
  const r = get<GroupRow>('SELECT * FROM wishlist_groups WHERE id = last_insert_rowid()')
  persist()
  return toGroup(r as GroupRow)
}

const updateGroup = (id: number, patch: WishlistGroupPatch): WishlistGroup | null => {
  const existing = get<GroupRow>('SELECT * FROM wishlist_groups WHERE id = ?', [id])
  if (!existing) return null
  const name = patch.name != null ? patch.name.trim() || existing.name : existing.name
  const filterSpec =
    patch.filterSpec !== undefined
      ? patch.filterSpec
        ? JSON.stringify(patch.filterSpec)
        : null
      : existing.filterSpec
  const manualAppids =
    patch.manualAppids !== undefined ? JSON.stringify(patch.manualAppids) : existing.manualAppids
  run('UPDATE wishlist_groups SET name = ?, filterSpec = ?, manualAppids = ?, updatedAt = ? WHERE id = ?', [
    name,
    filterSpec,
    manualAppids,
    Date.now(),
    id,
  ])
  persist()
  return getGroup(id)
}

const deleteGroup = (id: number): void => {
  run('DELETE FROM wishlist_groups WHERE id = ?', [id])
  persist()
}

/** Persist a new ordering (array of ids in the desired order). */
const reorderGroups = (ids: number[]): void => {
  run('BEGIN')
  try {
    ids.forEach((id, i) => run('UPDATE wishlist_groups SET sortOrder = ? WHERE id = ?', [i, id]))
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
  persist()
}

export { listGroups, getGroup, createGroup, updateGroup, deleteGroup, reorderGroups }
