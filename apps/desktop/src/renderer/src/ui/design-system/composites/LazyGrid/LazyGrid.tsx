import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'

const PAGE = 60

/**
 * Renders a large list incrementally — an initial page, then more as a sentinel
 * scrolls near the viewport. Keeps filtering instant: a filter click only ever
 * reconciles ~PAGE cards instead of the full 1000+ library.
 */
const LazyGrid = <T,>({
  items,
  render,
}: {
  items: T[]
  /** Must return a keyed element. */
  render: (item: T) => ReactNode
}) => {
  const [count, setCount] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)

  // Reset the window whenever the result set changes (new filter/sort).
  useEffect(() => setCount(PAGE), [items])

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
  }, [items.length])

  return (
    <>
      <Box className="grid">{items.slice(0, count).map(render)}</Box>
      {count < items.length && <Box ref={sentinel} style={{ height: 1 }} aria-hidden />}
    </>
  )
}

export { LazyGrid }
