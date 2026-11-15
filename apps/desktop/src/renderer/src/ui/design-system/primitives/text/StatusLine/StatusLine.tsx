import { Text } from '../Text'
import type { StatusLineProps } from './StatusLine.type'
import './StatusLine.css'

// A one-line muted status whose height is always reserved, so text appearing never shifts layout.
const StatusLine = ({ text = '', className }: StatusLineProps) => (
  <Text
    as="p"
    tone="muted"
    role="status"
    aria-live="polite"
    className={['ds-status-line', className].filter(Boolean).join(' ')}
  >
    {text}
  </Text>
)

export { StatusLine }
