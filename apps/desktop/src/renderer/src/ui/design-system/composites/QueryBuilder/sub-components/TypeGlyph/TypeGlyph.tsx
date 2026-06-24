import type { ReactNode } from 'react'
import type { FieldType } from '@shared/query'

/** Tiny schematic glyph for each field's data type. */
const TypeGlyph = ({ type }: { type: FieldType }) => {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const }
  const svg = (children: ReactNode) => (
    <svg className="type-glyph" viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      {children}
    </svg>
  )
  switch (type) {
    case 'number':
      return svg(<path d="M6 3 5 13M11 3 10 13M3 6.5h10M3 9.5h10" {...p} />)
    case 'boolean':
      return svg(
        <>
          <rect x="2" y="5" width="12" height="6" rx="3" {...p} />
          <circle cx="10.5" cy="8" r="1.6" fill="currentColor" stroke="none" />
        </>,
      )
    case 'enum':
      return svg(
        <>
          <circle cx="8" cy="8" r="5" {...p} />
          <circle cx="8" cy="8" r="1.8" fill="currentColor" stroke="none" />
        </>,
      )
    case 'stringArray':
    case 'enumArray':
      return svg(<path d="M5 4.5h8M5 8h8M5 11.5h8M2.5 4.5h.01M2.5 8h.01M2.5 11.5h.01" {...p} />)
    default: // string
      return svg(<path d="M4 6.5h8M4 9.5h5" {...p} />)
  }
}

export { TypeGlyph }
