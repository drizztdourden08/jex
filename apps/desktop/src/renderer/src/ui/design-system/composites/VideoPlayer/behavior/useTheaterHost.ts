import { useLayoutEffect, useRef } from 'react'

interface Params {
  theater: boolean
  onExit: () => void
}

/**
 * Lifts the player root into a body-level host while in theater, then puts it back.
 * A `position: fixed` element is otherwise confined by any `backdrop-filter`/`transform`
 * ancestor (glass panes), so CSS alone cannot cover the whole window. The DOM node is
 * moved (never re-created), so the <video> stays mounted and keeps playing. The host
 * doubles as the scrim: clicking it (not the stage) exits.
 */
const useTheaterHost = ({ theater, onExit }: Params) => {
  const slotRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const slot = slotRef.current
    const root = rootRef.current
    if (!theater || !slot || !root) return
    const host = document.createElement('div')
    host.className = 'vp-theater-host'
    host.addEventListener('click', (e) => e.target === host && onExit())
    document.body.appendChild(host)
    host.appendChild(root)
    return () => {
      slot.appendChild(root)
      host.remove()
    }
  }, [theater, onExit])

  return { slotRef, rootRef }
}

export { useTheaterHost }
