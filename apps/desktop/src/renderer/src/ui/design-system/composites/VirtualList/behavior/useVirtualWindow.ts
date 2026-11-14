import { useCallback, useEffect, useRef, useState } from 'react'

type Params = {
  count: number
  rowHeight: number
  overscan: number
}

/** Tracks the scroll viewport and returns the slice of rows worth rendering. */
const useVirtualWindow = ({ count, rowHeight, overscan }: Params) => {
  const ref = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.clientHeight))
    ro.observe(el)
    setHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  // A shorter list can leave the old offset past the end; the browser clamps
  // scrollTop, but our copy must follow or the window renders nothing.
  useEffect(() => {
    const el = ref.current
    if (el) setScrollTop(el.scrollTop)
  }, [count])

  const onScroll = useCallback(() => {
    const el = ref.current
    if (el) setScrollTop(el.scrollTop)
  }, [])

  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const end = Math.min(count, Math.ceil((scrollTop + height) / rowHeight) + overscan)
  const pageSize = Math.max(1, Math.floor(height / rowHeight) - 1)

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = ref.current
      if (!el || index < 0) return
      const top = index * rowHeight
      const bottom = top + rowHeight
      if (top < el.scrollTop) el.scrollTop = top
      else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight
    },
    [rowHeight],
  )

  return { ref, onScroll, start, end, pageSize, totalHeight: count * rowHeight, scrollToIndex }
}

export { useVirtualWindow }
