import * as scheduler from '../scheduler'

// Re-export the scheduler's progress + state plumbing so callers (IPC) have one
// surface. All enrichment — library, wishlist, game-detail — flows through it.
const onEnrichProgress = scheduler.subscribe
const getSyncState = scheduler.getState
const setActiveContext = scheduler.setActive
const cancelEnrich = (): void => {
  scheduler.cancel()
}

export { onEnrichProgress, getSyncState, setActiveContext, cancelEnrich }
