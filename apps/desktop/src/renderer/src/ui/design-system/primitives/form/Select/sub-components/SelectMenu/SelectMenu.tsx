import { useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Portal } from '@ds/primitives/util/Portal'
import { useExpand } from '@ds/primitives/overlay/useExpand'
import type { SelectMenuProps } from '../../Select.type'

const HIDDEN = { visibility: 'hidden' as const }

/** A Select with fully custom menu CONTENT only. The base owns everything else — the
 *  standard glass trigger box, the chevron pinned right, the portalled one-element
 *  expanding surface and its glass. The caller supplies the left trigger content and the
 *  menu body; it never re-skins the chrome (`triggerClass` is additive layout only). */
const SelectMenu = ({
  trigger,
  children,
  disabled = false,
  title,
  triggerClass,
  className,
  menuClassName,
  block = false,
  triggerBare = false,
  hideChevron = false,
}: SelectMenuProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const x = useExpand(open, close)
  const triggerCls = ['ds-select-trigger', 'ds-select-trigger--md', !triggerBare && 'ds-select-box', triggerClass]
    .filter(Boolean)
    .join(' ')

  const head = (
    <>
      <Box as="span" className="ds-select-trigger-content">{trigger}</Box>
      {!hideChevron && <Box as="span" className="ds-select-chevron" aria-hidden>▾</Box>}
    </>
  )

  return (
    <Box className={['ds-select', block && 'ds-select--block', className].filter(Boolean).join(' ')}>
      <button
        ref={x.triggerRef}
        type="button"
        className={triggerCls}
        style={x.mounted ? HIDDEN : undefined}
        disabled={disabled}
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {head}
      </button>

      {x.mounted && (
        <Portal>
          <Box
            ref={x.surfaceRef}
            className={['ds-select-surface', x.expanded && 'is-open', x.grown && 'is-grown'].filter(Boolean).join(' ')}
            style={x.style ?? undefined}
          >
            <button type="button" className="ds-select-trigger ds-select-trigger--md" onClick={() => setOpen((o) => !o)}>
              {head}
            </button>
            <Box className="ds-select-grow">
              <Box className={['ds-select-custom', menuClassName].filter(Boolean).join(' ')}>{children(close)}</Box>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  )
}

export { SelectMenu }
