import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import type { RemoteModelListProps } from './RemoteModelList.type'
import './RemoteModelList.css'

// Remote models grouped under the local list. A model whose provider has no key is
// shown disabled with a pointer to the key fields above (bare: data and actions via props).
const RemoteModelList = ({ models, activeRef, busyRef, onUse }: RemoteModelListProps) => {
  if (models.length === 0) {
    return (
      <Box as="p" className="muted remote-models-empty">
        No remote models available. Add an API key in Settings, above.
      </Box>
    )
  }
  return (
    <Box className="remote-models" role="list" aria-label="Remote models">
      {models.map((m) => {
        const active = m.ref === activeRef
        return (
          <Box
            key={m.ref}
            role="listitem"
            className={`remote-model-row${active ? ' active' : ''}${m.keyPresent ? '' : ' disabled'}`}
          >
            <Box as="span" className="remote-model-name">
              {m.label}
              {m.recommended && <Box as="span" className="badge">Recommended</Box>}
              {active && <Box as="span" className="badge">Active</Box>}
            </Box>
            <Box as="span" className="muted remote-model-provider">{m.provider}</Box>
            {m.keyPresent ? (
              <Button
                variant={active ? 'ghost' : 'secondary'}
                className="remote-model-use"
                disabled={active || busyRef != null}
                onClick={() => onUse(m.ref)}
              >
                {active ? 'Active' : busyRef === m.ref ? 'Switching…' : 'Use'}
              </Button>
            ) : (
              <Box as="span" className="muted remote-model-hint">add a key in Settings</Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export { RemoteModelList }
