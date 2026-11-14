import type { LibraryStats } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { countsLine, statsLine } from './LibraryHeader.helpers'
import './LibraryHeader.css'

type LibraryHeaderProps = {
  total: number
  installed: number
  owned: number
  stats: LibraryStats | null
  scanning: boolean
  syncing: boolean
  cancelling: boolean
  keySet: boolean
  busy: boolean
  onRescan: () => void
  onStartSync: () => void
  onCancelSync: () => void
}

/** One slim row: title, library counts + metadata stats, then the rescan/sync actions. */
const LibraryHeader = ({
  total,
  installed,
  owned,
  stats,
  scanning,
  syncing,
  cancelling,
  keySet,
  busy,
  onRescan,
  onStartSync,
  onCancelSync,
}: LibraryHeaderProps) => {
  const meta = [countsLine(total, installed, owned), statsLine(stats)].filter(Boolean).join(' · ')
  return (
    <Box className="lib-head">
      <Box as="h1" className="lib-head-title">
        Library
      </Box>
      {meta && (
        <Box as="span" className="muted lib-head-meta">
          {meta}
        </Box>
      )}
      <Box className="lib-head-actions">
        <Button variant="secondary" size="slim" onClick={onRescan} disabled={busy}>
          {scanning ? 'Scanning…' : 'Rescan local'}
        </Button>
        {keySet && !syncing && (
          <Button size="slim" onClick={onStartSync} disabled={scanning}>
            Sync owned + metadata
          </Button>
        )}
        {syncing && (
          <Button variant="danger" size="slim" onClick={onCancelSync} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel sync'}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export { LibraryHeader }
export type { LibraryHeaderProps }
