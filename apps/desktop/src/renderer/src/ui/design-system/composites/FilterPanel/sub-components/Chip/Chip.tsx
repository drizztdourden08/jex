import type { ReactNode } from 'react'
import { Button } from '@ds/primitives/actions/Button'

const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) => {
  return (
    <Button variant="ghost" className="pill chip-btn" data-on={on || undefined} onClick={onClick}>
      {children}
    </Button>
  )
}

export { Chip }
