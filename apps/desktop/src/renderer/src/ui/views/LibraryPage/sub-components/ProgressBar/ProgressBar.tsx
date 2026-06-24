import type { SyncProgress } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import './ProgressBar.css'

type ProgressBarProps = { p: SyncProgress }

const fmtDuration = (ms: number): string => {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

const ProgressBar = ({ p }: ProgressBarProps) => {
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
  const label = p.phase === 'owned' ? 'Fetching owned games' : 'Enriching metadata'
  const remaining = Math.max(0, p.total - p.done)
  return (
    <Box className="panel">
      <Box className="row" style={{ justifyContent: 'space-between' }}>
        <Box as="span">
          {label}
          {p.total > 1 ? ` — ${pct}%` : ''}
        </Box>
        {p.total > 1 && (
          <Box as="span" className="muted">
            {p.done}/{p.total}
            {p.etaMs != null && remaining > 0 && ` · ~${fmtDuration(p.etaMs)} left`}
            {p.avgMs != null && ` · ${(p.avgMs / 1000).toFixed(1)}s/game`}
          </Box>
        )}
      </Box>
      <Box className="progress" style={{ marginTop: 8 }}>
        <Box as="span" style={{ width: `${pct}%` }} />
      </Box>

      {p.workers && p.workers.length > 0 && (
        <Box style={{ marginTop: 12, display: 'grid', gap: 6 }}>
          {p.workers.map((w) => (
            <Box key={w.id} className="worker-row">
              <Box as="span" className="muted" style={{ fontSize: 12, width: 62, flex: 'none' }}>
                Worker {w.id + 1}
              </Box>
              <Box className={`wbar ${w.status}`}>
                <Box as="span" />
              </Box>
              <Box
                as="span"
                className="muted"
                style={{
                  fontSize: 12,
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {w.status === 'fetching' ? (w.current ?? 'fetching…') : w.status}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {p.message && (
        <Box as="p" className="muted" style={{ marginTop: 8 }}>
          {p.message}
        </Box>
      )}
    </Box>
  )
}

export { ProgressBar }
export type { ProgressBarProps }
