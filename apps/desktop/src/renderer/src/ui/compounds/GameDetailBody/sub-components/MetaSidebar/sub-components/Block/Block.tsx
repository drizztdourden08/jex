import type { ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'

type BlockProps = {
  title: string
  children: ReactNode
}

const Block = ({ title, children }: BlockProps) => {
  return (
    <Box className="meta-block">
      <Box className="meta-block-title">{title}</Box>
      {children}
    </Box>
  )
}

export { Block }
export type { BlockProps }
