import { Box } from '@ds/primitives/layout/Box'
import { IconButton } from '@ds/primitives/actions/IconButton'

/** A removable selected-value chip (label + ✕). */
const ValChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  return (
    <Box as="span" className="val-chip">
      {label}
      <IconButton type="button" onClick={onRemove} label={`Remove ${label}`}>
        ✕
      </IconButton>
    </Box>
  )
}

export { ValChip }
