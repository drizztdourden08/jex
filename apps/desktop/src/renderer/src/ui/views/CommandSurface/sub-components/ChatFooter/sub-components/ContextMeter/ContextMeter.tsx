import { Box } from '@ds/primitives/layout/Box'
import { fmtTokens } from '../../ChatFooter.constants'

type ContextMeterProps = {
  used: number
  /** Null/0 when the provider does not report a window (some remote models). */
  size: number | null
}

// Context usage. With an unknown window only the used tokens show; never divide by it.
const ContextMeter = ({ used, size }: ContextMeterProps) => {
  if (size == null || size <= 0) {
    return (
      <Box as="span" className="chat-ctx-meter" title={`${used} tokens used`}>
        <Box as="span" className="muted">
          {fmtTokens(used)} tokens
        </Box>
      </Box>
    )
  }
  return (
    <Box as="span" className="chat-ctx-meter" title={`${used} / ${size} tokens used`}>
      <Box as="span" className="chat-ctx-bar">
        <Box as="span" style={{ width: `${Math.min(100, Math.round((used / size) * 100))}%` }} />
      </Box>
      <Box as="span" className="muted">
        {fmtTokens(used)}/{fmtTokens(size)}
      </Box>
    </Box>
  )
}

export { ContextMeter }
