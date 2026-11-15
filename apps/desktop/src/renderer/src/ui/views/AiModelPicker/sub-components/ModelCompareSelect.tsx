import type { ReactNode } from 'react'
import type { AiModelOption } from '@shared/ai'
import { REMOTE_PROVIDER_LABEL } from '@shared/remote-ai'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { SelectMenu } from '@ds/primitives/form/Select'
import type { CatalogEntry } from '../AiModelPicker.type'

/**
 * Custom column-layout dropdown: the one catalog for adding a model, local and cloud.
 * Bare and presentational: entries in, selected key out. Each row lays the comparison
 * facts (provider, params, type, download, RAM, context) into aligned columns; cloud
 * models have no download or RAM. Built on the SelectMenu primitive so the panel renders
 * through a Portal and can't be clipped by the scrolling Settings panel.
 */
const fmtCtx = (tokens: number | null): string => {
  if (tokens == null) return '—'
  return tokens >= 1000 ? `${Math.round(tokens / 1024)}K` : String(tokens)
}

const archLabel = (m: AiModelOption): string => (m.arch === 'moe' ? 'MoE' : 'Dense')

const nameOf = (e: CatalogEntry): string => {
  if (e.kind === 'provider') return `${REMOTE_PROVIDER_LABEL[e.provider]} models`
  return e.model.label
}

const providerOf = (e: CatalogEntry): string =>
  e.kind === 'local' ? 'Local' : REMOTE_PROVIDER_LABEL[e.kind === 'remote' ? e.model.provider : e.provider]

// The trigger's second line: what the chosen entry is, in one glance.
const subOf = (e: CatalogEntry): string => {
  if (e.kind === 'local') return `Local · ${archLabel(e.model)} · ~${e.model.sizeGb} GB · ~${e.model.ramGb} GB RAM`
  if (e.kind === 'remote') return `${providerOf(e)} · cloud · ${fmtCtx(e.model.contextSize)} context`
  return `${providerOf(e)} · add your API key to list its models`
}

// The comparison cells after the name: params, type, download, RAM, context.
const cellsOf = (e: CatalogEntry): string[] => {
  if (e.kind === 'local') {
    const m = e.model
    return [m.params, archLabel(m), `~${m.sizeGb} GB`, `~${m.ramGb} GB`, fmtCtx(m.contextSize)]
  }
  if (e.kind === 'remote') return ['—', 'Cloud', '—', '—', fmtCtx(e.model.contextSize)]
  return ['', 'Cloud', '', '', '']
}

const ModelCompareSelect = ({
  entries,
  value,
  onChange,
  disabled,
  recommendedId,
  fits,
}: ModelCompareSelectProps) => {
  const selected = entries.find((e) => e.key === value) ?? null

  const badges = (e: CatalogEntry): ReactNode => (
    <>
      {e.kind === 'local' && e.key === recommendedId && <Box as="span" className="badge">Recommended</Box>}
      {e.kind === 'remote' && e.model.recommended && <Box as="span" className="badge">Recommended</Box>}
      {e.kind === 'local' && !fits(e.model) && (
        <Box as="span" className="badge subtle" title="Larger than your GPU's VRAM — runs partly on CPU and slower">
          ⚠ &gt; VRAM
        </Box>
      )}
    </>
  )

  const trigger = selected ? (
    <Box as="span" className="model-select-current">
      <Box as="span" className="model-select-name">{nameOf(selected)}</Box>
      <Box as="span" className="muted model-select-sub">{subOf(selected)}</Box>
    </Box>
  ) : (
    <Box as="span" className="muted">Choose a model to add…</Box>
  )

  return (
    <Box className="model-select">
      <SelectMenu disabled={disabled} block menuClassName="model-select-panel" trigger={trigger}>
        {(close) => (
          <>
            <Box className="model-row model-row-head muted">
              <Box as="span">Model</Box>
              <Box as="span">Provider</Box>
              <Box as="span">Params</Box>
              <Box as="span">Type</Box>
              <Box as="span">Download</Box>
              <Box as="span">RAM</Box>
              <Box as="span">Context</Box>
            </Box>
            {entries.map((e) => (
              <Button
                variant="ghost"
                key={e.key}
                className={`model-row model-row-opt${e.key === value ? ' on' : ''}`}
                role="option"
                aria-selected={e.key === value}
                onClick={() => {
                  onChange(e.key)
                  close()
                }}
              >
                <Box as="span" className="model-row-name">
                  {nameOf(e)}
                  {badges(e)}
                </Box>
                <Box as="span">{providerOf(e)}</Box>
                {cellsOf(e).map((c, i) => (
                  <Box as="span" key={i}>{c}</Box>
                ))}
              </Button>
            ))}
          </>
        )}
      </SelectMenu>
    </Box>
  )
}

interface ModelCompareSelectProps {
  entries: CatalogEntry[]
  value: string | null
  onChange: (key: string) => void
  disabled?: boolean
  /** Id of the local model recommended for the detected GPU (dynamic, VRAM-aware). */
  recommendedId?: string | null
  /** Whether a local model fits the GPU's VRAM comfortably. */
  fits: (m: AiModelOption) => boolean
}

export { ModelCompareSelect }
export type { ModelCompareSelectProps }
