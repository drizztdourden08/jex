import { useCallback, useRef, useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { ProgressRing } from '@ds/primitives/feedback/ProgressRing'
import { Popover } from '@ds/primitives/overlay/Popover'
import { ContextDetails } from './sub-components/ContextDetails'
import type { ContextMeterProps } from './ContextMeter.type'

// A small always-visible ring for context usage; clicking it opens the numbers. With an
// unknown window (0/null) only the empty track shows. Opens upward near the window bottom.
const ContextMeter = ({ ctx }: ContextMeterProps) => {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((o) => !o), [])
  const size = ctx?.contextSize ?? 0
  const frac = ctx && size > 0 ? ctx.usedTokens / size : 0
  return (
    <>
      <Box as="span" ref={anchorRef} className="chat-ctx-anchor">
        <IconButton plain size="fit" label="Context usage" title="Context usage" className="chat-ctx-ring" onClick={toggle} aria-expanded={open}>
          <ProgressRing value={frac} size={16} />
        </IconButton>
      </Box>
      <Popover open={open} anchorRef={anchorRef} placement="auto" align="end" onClose={close} className="chat-ctx-pop" role="dialog">
        <ContextDetails ctx={ctx} />
      </Popover>
    </>
  )
}

export { ContextMeter }
