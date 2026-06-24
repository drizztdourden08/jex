import type { AiModelOption } from '@shared/ai'
import type { DownloadingModel } from '../behavior/useModelCatalog'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

/**
 * The model table shown below the download dropdown: already-installed models
 * (click a row to make it active, trash to delete) plus any models currently
 * downloading (a live progress bar in place of the action). Bare and
 * presentational. Showing in-flight downloads here keeps several concurrent
 * downloads clear at a glance.
 */
const fmtCtx = (tokens: number): string =>
  tokens >= 1000 ? `${Math.round(tokens / 1024)}K` : String(tokens)

const pct = (downloaded: number, total: number): number =>
  total > 0 ? Math.round((downloaded / total) * 100) : 0

const InstalledModelList = ({ models, downloading, onSelect, onRemove }: InstalledModelListProps) => {
  if (models.length === 0 && downloading.length === 0) {
    return (
      <Box as="p" className="muted model-installed-empty">
        No models installed yet. Pick one above and download it.
      </Box>
    )
  }

  return (
    <Box className="model-installed" role="radiogroup" aria-label="Installed models">
      <Box className="model-row model-row-installed model-row-head muted">
        <Box as="span">Model</Box>
        <Box as="span">Params</Box>
        <Box as="span">Type</Box>
        <Box as="span">Size</Box>
        <Box as="span">RAM</Box>
        <Box as="span">Context</Box>
        <Box as="span" />
      </Box>
      {models.map((m) => (
        <Box
          key={m.id}
          className={`model-row model-row-installed model-row-opt${m.active ? ' active' : ''}`}
          role="radio"
          aria-checked={m.active}
          tabIndex={0}
          onClick={m.active ? undefined : () => onSelect(m.id)}
        >
          <Box as="span" className="model-row-name">
            <Box as="span" className={`model-radio${m.active ? ' on' : ''}`} aria-hidden />
            {m.label}
            {m.active && <Box as="span" className="badge">Active</Box>}
          </Box>
          <Box as="span">{m.params}</Box>
          <Box as="span">{m.arch === 'moe' ? 'MoE' : 'Dense'}</Box>
          <Box as="span">~{m.sizeGb} GB</Box>
          <Box as="span">~{m.ramGb} GB</Box>
          <Box as="span">{fmtCtx(m.contextSize)}</Box>
          <Button
            variant="ghost"
            type="button"
            className="model-remove ghost"
            title={`Delete ${m.label} from disk`}
            onClick={(e) => {
              e.stopPropagation()
              onRemove(m.id)
            }}
          >
            Remove
          </Button>
        </Box>
      ))}
      {downloading.map((m) => (
        <Box key={m.id} className="model-row-downloading" aria-disabled="true">
          <Box as="span" className="model-dl-name">{m.label}</Box>
          <Box as="span" className="model-dl">
            <Box as="span" className="model-dl-bar">
              <Box as="span" style={{ width: `${pct(m.downloaded, m.total)}%` }} />
            </Box>
            <Box as="span" className="model-dl-pct">
              {m.total > 0 ? `${pct(m.downloaded, m.total)}%` : 'Starting…'}
            </Box>
          </Box>
          <Box as="span" className="muted model-dl-meta">
            {m.params} · {m.arch === 'moe' ? 'MoE' : 'Dense'} · ~{m.sizeGb} GB
          </Box>
        </Box>
      ))}
    </Box>
  )
}

interface InstalledModelListProps {
  models: AiModelOption[]
  downloading: DownloadingModel[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}

export { InstalledModelList }
export type { InstalledModelListProps }
