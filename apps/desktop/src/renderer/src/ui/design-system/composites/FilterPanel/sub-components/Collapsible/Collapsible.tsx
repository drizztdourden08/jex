import { useState, type ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

const Collapsible = ({ label, count, children }: { label: string; count: number; children: ReactNode }) => {
  const [open, setOpen] = useState(true)
  if (count === 0) return null
  return (
    <Box className="fsec">
      <Button variant="ghost" type="button" className="fsec-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Box as="span" className="fsec-chevron">{open ? '▾' : '▸'}</Box>
        <Box as="span">{label}</Box>
        <Box as="span" className="fsec-count">{count}</Box>
      </Button>
      {open && <Box className="fsec-body">{children}</Box>}
    </Box>
  )
}

export { Collapsible }
