/**
 * The single, app-wide metadata enrichment queue.
 *
 * EVERY Store-metadata fetch in the app goes through here — the library sync, the
 * wishlist sync, and opening a game's detail page — so there is exactly ONE shared
 * rate limiter and we can never collectively exceed Steam's ~200 req / 5 min cap
 * no matter how many things ask at once.
 *
 * A fixed pool of workers pulls from a priority-ordered set. Priority follows the
 * UI: the open game-detail wins outright, then the active tab's items (wishlist
 * items while the Wishlist tab is open), then everything else in the background.
 * Re-opening the same appid attaches to the in-flight fetch rather than duplicating
 * it. Workers live for the app's lifetime and park when the queue is empty.
 */

export type { ActiveContext } from './types'
export { subscribe, emitPhase, getState, isBusy, drain } from './progress'
export { setActive } from './priority'
export { setBaseInterval, enqueue, enqueueMany, cancel } from './enqueue'
