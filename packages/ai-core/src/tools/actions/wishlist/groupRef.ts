import { host } from '../../../host'
import type { WishlistGroup } from '@jex/shared/wishlist'

/** The shared param pair every group-addressing tool accepts. */
const GROUP_REF_PROPS = {
  id: { type: 'number', description: 'Group id (from list_wishlist_groups).' },
  group: { type: 'string', description: 'Group name (case-insensitive) — use instead of id.' },
}

/** Resolve a group from `id` (number or numeric string) or `group`/`name` text. */
const resolveGroup = (args: Record<string, unknown>): WishlistGroup | { error: string } => {
  const raw = args.id ?? args.group
  const byId = typeof raw === 'number' || (typeof raw === 'string' && /^\d+$/.test(raw.trim()))
  if (byId) {
    const g = host().wishlist.getGroup(Number(raw))
    if (g) return g
  }
  const wanted = String(typeof raw === 'string' ? raw : (args.name ?? '')).trim().toLowerCase()
  if (!wanted) return { error: 'Provide a group id or name (see list_wishlist_groups).' }
  const matches = host().wishlist.listGroups().filter((g) => g.name.trim().toLowerCase() === wanted)
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) return { error: `Several groups are named "${wanted}"; use the numeric id.` }
  return { error: `No wishlist group "${String(raw)}". Use list_wishlist_groups.` }
}

const isError = (v: unknown): v is { error: string } =>
  typeof v === 'object' && v !== null && 'error' in v

const toAppids = (v: unknown): number[] =>
  Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n) && n > 0) : []

export { GROUP_REF_PROPS, resolveGroup, isError, toAppids }
