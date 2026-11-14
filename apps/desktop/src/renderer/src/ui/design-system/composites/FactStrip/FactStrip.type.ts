import type { ReactNode } from 'react'

type Fact = {
  key: string
  label: string
  value: ReactNode
  /** Tooltip with the precise value when `value` is rounded or abbreviated. */
  title?: string
}

type FactStripProps = {
  /** Primary action(s) shown at the start of the strip. */
  actions?: ReactNode
  facts: Fact[]
  className?: string
}

export type { Fact, FactStripProps }
