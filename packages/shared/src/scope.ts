/**
 * A6 · Scoped Collection — the single contract for "which set of games does this
 * verb act on". The app has three base sources (the same three the Randomizer UI
 * offers) plus addressable sub-wishlist groups:
 *   • library  — games you own or have installed
 *   • wishlist — games on your Steam wishlist
 *   • store    — mirror entries that are neither owned nor wishlisted (catalog)
 *   • { group } — a specific sub-wishlist, resolved from its filter + manual pins
 *
 * The three base scopes partition the in-memory mirror by `Game` flags, so the
 * predicate is pure and isomorphic and lives here. Group resolution needs the
 * group's saved filter + pins, so it's done by the renderer's resolveScope (which
 * unions them over the wishlist). Every scoped verb (filter/count/sort/randomize)
 * is built on this so a new surface inherits the verbs for free.
 */
import type { Game } from './library'

type ScopeKind = 'library' | 'wishlist' | 'store'

/** A scope is one of the base sources or a specific sub-wishlist group by id. */
type Scope = ScopeKind | { group: number }

const SCOPE_KINDS: ScopeKind[] = ['library', 'wishlist', 'store']

/** Partition predicate for the three base scopes. */
const inScope = (game: Game, kind: ScopeKind): boolean => {
  if (kind === 'wishlist') return game.wishlisted
  if (kind === 'store') return !game.owned && !game.installed && !game.wishlisted
  return game.owned || game.installed
}

export { SCOPE_KINDS, inScope }
export type { Scope, ScopeKind }
