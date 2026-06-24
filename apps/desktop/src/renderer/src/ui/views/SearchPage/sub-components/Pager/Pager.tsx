import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type PagerProps = {
  page: number
  maxPage: number
  disabled: boolean
  onChange: (p: number) => void
}

const Pager = ({ page, maxPage, disabled, onChange }: PagerProps) => {
  if (maxPage === 0) return null
  const go = (p: number) => {
    onChange(Math.max(0, Math.min(maxPage, p)))
    window.scrollTo({ top: 0 })
  }
  return (
    <Box className="row" style={{ justifyContent: 'center', gap: 12, margin: '20px 0' }}>
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
