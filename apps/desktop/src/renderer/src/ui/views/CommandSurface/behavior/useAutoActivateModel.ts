import { useEffect, useRef } from 'react'

type Params = {
  loaded: boolean
  hasActive: boolean
  fallbackId: string | null
  switchModel: (id: string) => Promise<void>
  /** Bumped each time the assistant opens; allows one attempt per open. */
  epoch: number
}

// Usable models exist but none is active (or the saved one is stale): activate the
// fallback. At most one attempt per epoch (per open of the assistant), never a loop, so
// an attempt that failed early, before the engine loaded, is retried on the next open.
const useAutoActivateModel = ({ loaded, hasActive, fallbackId, switchModel, epoch }: Params) => {
  const triedAt = useRef<number | null>(null)
  useEffect(() => {
    if (!loaded || hasActive || !fallbackId || triedAt.current === epoch) return
    triedAt.current = epoch
    void switchModel(fallbackId)
  }, [loaded, hasActive, fallbackId, switchModel, epoch])
}

export { useAutoActivateModel }
