import './Dialog.css'
import { useId } from 'react'
import type { MouseEvent } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import { Portal } from '@ds/primitives/util/Portal'
import { useDialogBehavior } from './behavior/useDialogBehavior'
import type { DialogProps } from './Dialog.type'

/** Generic modal: portal + scrim + glass panel with a title, body and an actions row. */
const Dialog = ({ open, title, children, actions, onClose }: DialogProps) => {
  const titleId = useId()
  const { panelRef } = useDialogBehavior(open, onClose)
  if (!open) return null

  const handleBackdrop = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <Portal>
      <Box className="ds-dialog-backdrop" onMouseDown={handleBackdrop}>
        <Box
          ref={panelRef}
          className="ds-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <Text as="h2" id={titleId} className="ds-dialog-title">
            {title}
          </Text>
          {children && <Box className="ds-dialog-body">{children}</Box>}
          {actions && <Box className="ds-dialog-actions">{actions}</Box>}
        </Box>
      </Box>
    </Portal>
  )
}

export { Dialog }
