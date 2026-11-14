import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'

const PAGE = 60

/**
 * Renders a large list incrementally — an initial page, then more as a sentinel
 * scrolls near the viewport. Keeps filtering instant: a filter click only ever
 * reconciles ~PAGE cards instead of the full 1000+ library.
 *
 * `resetKey` decides when the window snaps back to the first page. Without it every
 * new `items` array resets, which also fires on a plain data reload and throws away
 * the user's scroll depth; pass something that only changes with the query.
 */
const LazyGrid = <T,>({
  items,
  render,
  resetKey,
}: {
  items: T[]
  /** Must return a keyed element. */
  render: (item: T) => ReactNode
  resetKey?: unknown
}) => {
  const [count, setCount] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)
  const trigger = resetKey === undefined ? items : resetKey

  useEffect(() => setCount(PAGE), [trigger])

  // Re-observe after each page: an observer only fires on a change of intersection,
  // so a sentinel that stays in view (a tall window) would otherwise never load more.
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setCount((c) => (c < items.length ? c + PAGE : c))
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [items.length, count])

  return (
    <>
      <Box className="grid">{items.slice(0, count).map(render)}</Box>
      {count < items.length && <Box ref={sentinel} style={{ height: 1 }} aria-hidden />}
    </>
  )
}

export { LazyGrid }
