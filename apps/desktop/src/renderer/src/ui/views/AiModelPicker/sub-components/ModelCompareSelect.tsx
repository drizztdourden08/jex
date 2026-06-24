import type { AiModelOption } from '@shared/ai'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { SelectMenu } from '@ds/primitives/form/Select'

/**
 * Custom column-layout dropdown for picking a model to download. Bare and
 * presentational — options in, selected id out. Each row lays the comparison
 * facts (params, type, download, RAM, context) into aligned columns so sizes are
 * easy to scan side by side, keeping the page compact (one row collapsed). Built
 * on the SelectMenu primitive so the panel renders through a Portal and can't be
 * clipped by the scrolling Settings panel.
 */
const fmtCtx = (tokens: number): string =>
  tokens >= 1000 ? `${Math.round(tokens / 1024)}K` : String(tokens)

const ModelCompareSelect = ({
  options,
  value,
  onChange,
  disabled,
  recommendedId,
  fits,
}: ModelCompareSelectProps) => {
  const selected = options.find((m) => m.id === value) ?? null

  const trigger = selected ? (
    <Box as="span" className="model-select-current">
      <Box as="span" className="model-select-name">{selected.label}</Box>
      <Box as="span" className="muted model-select-sub">
        {selected.arch === 'moe' ? 'MoE' : 'Dense'} · ~{selected.sizeGb} GB · ~{selected.ramGb} GB RAM
      </Box>
    </Box>
  ) : (
    <Box as="span" className="muted">Choose a model to download…</Box>
  )

  return (
    <Box className="model-select">
      <SelectMenu
        disabled={disabled}
        block
        menuClassName="model-select-panel"
        trigger={trigger}
      >
        {(close) => (
          <>
            <Box className="model-row model-row-head muted">
              <Box as="span">Model</Box>
              <Box as="span">Params</Box>
              <Box as="span">Type</Box>
              <Box as="span">Download</Box>
              <Box as="span">RAM</Box>
              <Box as="span">Context</Box>
            </Box>
            {options.map((m) => (
              <Button
                variant="ghost"
                key={m.id}
                className={`model-row model-row-opt${m.id === value ? ' on' : ''}`}
                role="option"
                aria-selected={m.id === value}
                onClick={() => {
                  onChange(m.id)
                  close()
                }}
              >
                <Box as="span" className="model-row-name">
                  {m.label}
                  {m.id === recommendedId && <Box as="span" className="badge">Recommended</Box>}
                  {!fits(m) && (
                    <Box as="span" className="badge subtle" title="Larger than your GPU's VRAM — runs partly on CPU and slower">
                      ⚠ &gt; VRAM
                    </Box>
                  )}
                </Box>
                <Box as="span">{m.params}</Box>
                <Box as="span">{m.arch === 'moe' ? 'MoE' : 'Dense'}</Box>
                <Box as="span">~{m.sizeGb} GB</Box>
                <Box as="span">~{m.ramGb} GB</Box>
                <Box as="span">{fmtCtx(m.contextSize)}</Box>
              </Button>
            ))}
          </>
        )}
      </SelectMenu>
    </Box>
  )
}

interface ModelCompareSelectProps {
  options: AiModelOption[]
  value: string | null
  onChange: (id: string) => void
  disabled?: boolean
  /** Id of the model recommended for the detected GPU (dynamic, VRAM-aware). */
  recommendedId?: string | null
  /** Whether a model fits the GPU's VRAM comfortably. */
  fits: (m: AiModelOption) => boolean
}

export { ModelCompareSelect }
export type { ModelCompareSelectProps }
