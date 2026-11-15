import { useEffect, useRef } from 'react'

type Params = {
  loaded: boolean
  hasActive: boolean
  fallbackId: string | null
  switchModel: (id: string) => Promise<void>
}

// Usable models exist but none is active (or the saved one is stale): activate the
// fallback once. The ref makes it a single attempt, never a loop.
const useAutoActivateModel = ({ loaded, hasActive, fallbackId, switchModel }: Params) => {
  const tried = useRef(false)
  useEffect(() => {
    if (!loaded || hasActive || !fallbackId || tried.current) return
    tried.current = true
    void switchModel(fallbackId)
  }, [loaded, hasActive, fallbackId, switchModel])
}

export { useAutoActivateModel }
