import type { LibraryStats, ScanResult } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'

type LibraryNoticesProps = {
  stats: LibraryStats | null
  keySet: boolean
  scanInfo: ScanResult | null
}

const relTime = (ms: number): string => {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

/** Metadata stats and setup hints above the library. Sync progress and its outcome
 *  live in the title-bar activity popover. */
const LibraryNotices = ({ stats, keySet, scanInfo }: LibraryNoticesProps) => (
  <>
    {stats && stats.total > 0 && (
      <Box as="p" className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 13 }}>
        {stats.enriched} with full metadata
        {stats.pending > 0 ? ` · ${stats.pending} pending` : ''}
        {stats.noStorePage > 0 ? ` · ${stats.noStorePage} no store page` : ''}
        {stats.lastEnrich ? ` · last synced ${relTime(stats.lastEnrich)}` : ''}
      </Box>
    )}

    {!keySet && (
      <Box className="panel">
        Showing installed games. Add a Steam Web API key in Settings to pull your full
        owned library (incl. not-installed) and metadata.
      </Box>
    )}

    {scanInfo && !scanInfo.detected.steamPath && (
      <Box className="panel">Couldn't find a Steam install on this PC.</Box>
    )}
  </>
)

export { LibraryNotices }
export type { LibraryNoticesProps }
