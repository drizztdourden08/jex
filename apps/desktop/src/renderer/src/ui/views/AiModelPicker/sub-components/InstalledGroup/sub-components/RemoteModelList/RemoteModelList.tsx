import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import type { RemoteModelListProps } from './RemoteModelList.type'
import './RemoteModelList.css'

const fmtCtx = (tokens: number | null): string => {
  if (tokens == null) return '—'
  return tokens >= 1000 ? `${Math.round(tokens / 1024)}K context` : `${tokens} context`
}

// One provider's added (installed) cloud models, in the same radio-row look as the local
// list: click a row to use it, Remove to take it off the list. Without the provider's key
// a row is dimmed and marked; the key field is the section header above. Bare.
const RemoteModelList = ({ models, activeRef, busyRef, onUse, onRemove }: RemoteModelListProps) => {
  if (models.length === 0) {
    return (
      <Box as="p" className="muted remote-models-empty">
        No models added yet. Pick one in the list above and press Add.
      </Box>
    )
  }
  return (
    <Box className="remote-models" role="radiogroup" aria-label="Added cloud models">
      {models.map((m) => {
        const active = m.ref === activeRef
        const usable = m.keyPresent && busyRef == null
        return (
          <Box
            key={m.ref}
            role="radio"
            aria-checked={active}
            aria-disabled={!m.keyPresent || undefined}
            tabIndex={m.keyPresent ? 0 : -1}
            className={`remote-model-row${active ? ' active' : ''}${m.keyPresent ? '' : ' disabled'}`}
            onClick={active || !usable ? undefined : () => onUse(m.ref)}
          >
            <Box as="span" className="remote-model-name">
              <Box as="span" className={`model-radio${active ? ' on' : ''}`} aria-hidden />
              {m.label}
              {active && <Box as="span" className="badge">Active</Box>}
              {!m.keyPresent && <Box as="span" className="badge subtle">Needs a key</Box>}
              {busyRef === m.ref && <Box as="span" className="muted remote-model-hint">Working…</Box>}
            </Box>
            <Box as="span" className="muted remote-model-ctx">{fmtCtx(m.contextSize)}</Box>
            <Button
              variant="ghost"
              type="button"
              className="model-remove ghost"
              title={`Remove ${m.label} from your models`}
              disabled={busyRef != null}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(m.ref)
              }}
            >
              Remove
            </Button>
          </Box>
        )
      })}
    </Box>
  )
}

export { RemoteModelList }
