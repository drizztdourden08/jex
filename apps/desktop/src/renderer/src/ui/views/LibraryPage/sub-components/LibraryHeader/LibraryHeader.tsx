import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type LibraryHeaderProps = {
  total: number
  installed: number
  owned: number
  scanning: boolean
  syncing: boolean
  cancelling: boolean
  keySet: boolean
  busy: boolean
  onRescan: () => void
  onStartSync: () => void
  onCancelSync: () => void
}

const LibraryHeader = ({
  total,
  installed,
  owned,
  scanning,
  syncing,
  cancelling,
  keySet,
  busy,
  onRescan,
  onStartSync,
  onCancelSync,
}: LibraryHeaderProps) => {
  return (
    <Box className="row" style={{ justifyContent: 'space-between' }}>
      <Box as="h1">
        Library{' '}
        {total > 0 && (
          <Box as="span" className="muted" style={{ fontSize: 14 }}>
            {total} · {installed} installed{owned > 0 ? ` · ${owned} owned` : ''}
          </Box>
        )}
      </Box>
      <Box className="row">
        <Button variant="secondary" onClick={onRescan} disabled={busy}>
          {scanning ? 'Scanning…' : 'Rescan local'}
        </Button>
        {keySet && !syncing && (
          <Button onClick={onStartSync} disabled={scanning}>
            Sync owned + metadata
          </Button>
        )}
        {syncing && (
          <Button variant="danger" onClick={onCancelSync} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel sync'}
          </Button>
        )}
      </Box>
    </Box>
  )
}

export { LibraryHeader }
export type { LibraryHeaderProps }
