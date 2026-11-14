import { useRef } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type PagerProps = {
  page: number
  maxPage: number
  disabled: boolean
  onChange: (p: number) => void
}

const Pager = ({ page, maxPage, disabled, onChange }: PagerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  if (maxPage === 0) return null
  // The page itself never scrolls: the Layout's `.content` pane is the scroller.
  const go = (p: number) => {
    onChange(Math.max(0, Math.min(maxPage, p)))
    ref.current?.closest('.content')?.scrollTo({ top: 0 })
  }
  return (
    <Box ref={ref} className="row" style={{ justifyContent: 'center', gap: 12, margin: '20px 0' }}>
      <Button variant="secondary" onClick={() => go(page - 1)} disabled={disabled || page <= 0}>
        ← Prev
      </Button>
      <Box as="span" className="muted">
        Page {page + 1} of {maxPage + 1}
      </Box>
      <Button variant="secondary" onClick={() => go(page + 1)} disabled={disabled || page >= maxPage}>
        Next →
      </Button>
    </Box>
  )
}

export { Pager }
export type { PagerProps }
