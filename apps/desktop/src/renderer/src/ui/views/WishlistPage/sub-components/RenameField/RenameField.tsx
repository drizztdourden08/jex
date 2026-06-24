import { useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { TextInput } from '@ds/primitives/form/TextInput'
import { IconButton } from '@ds/primitives/actions/IconButton'

type Props = {
  initial: string
  onCommit: (name: string) => void
  onCancel: () => void
}

/** Inline name editor with accept (✓) / cancel (✕) affordances inside the field. */
const RenameField = ({ initial, onCommit, onCancel }: Props) => {
  const [v, setV] = useState(initial)
  return (
    <Box className="wl-rename">
      <TextInput
        autoFocus
        value={v}
        onChange={(e) => setV(e.currentTarget.value)}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onCommit(v)
          if (e.key === 'Escape') onCancel()
        }}
        onBlur={() => onCommit(v)}
      />
      <IconButton
        type="button"
        label="Save"
        className="wl-rename-ok"
        title="Save"
        // mousedown (not click) so it fires before the input's blur cancels focus.
        onMouseDown={(e) => {
          e.preventDefault()
          onCommit(v)
        }}
      >
        ✓
      </IconButton>
      <IconButton
        type="button"
        label="Cancel"
        className="wl-rename-cancel"
        title="Cancel"
        onMouseDown={(e) => {
          e.preventDefault()
          onCancel()
        }}
      >
        ✕
      </IconButton>
    </Box>
  )
}

export { RenameField }
export type { Props as RenameFieldProps }
