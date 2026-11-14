import { useCallback } from 'react'
import type { KeyboardEvent } from 'react'

type Params = {
  count: number
  selectedIndex: number
  pageSize: number
  onSelect: (index: number) => void
}

/** Arrow / Home / End / Page keys move the selection, clamped to the list. */
const useListKeyboard = ({ count, selectedIndex, pageSize, onSelect }: Params) => {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (count === 0) return
      const at = selectedIndex < 0 ? -1 : selectedIndex
      const step: Record<string, number> = {
        ArrowDown: at + 1,
        ArrowUp: at < 0 ? 0 : at - 1,
        PageDown: at + pageSize,
        PageUp: at - pageSize,
        Home: 0,
        End: count - 1,
      }
      const next = step[e.key]
      if (next === undefined) return
      e.preventDefault()
      const clamped = Math.max(0, Math.min(count - 1, next))
      if (clamped !== selectedIndex) onSelect(clamped)
    },
    [count, selectedIndex, pageSize, onSelect],
  )

  return { onKeyDown }
}

export { useListKeyboard }
