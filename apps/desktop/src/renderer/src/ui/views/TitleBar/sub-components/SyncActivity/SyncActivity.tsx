import { useRef } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Glyph } from '@ds/primitives/media/Glyph'
import { Popover } from '@ds/primitives/overlay/Popover'
import { SyncProgress } from './sub-components/SyncProgress'
import type { SyncActivityProps } from './SyncActivity.type'
import './SyncActivity.css'

/** What the icon tells at a glance: running, last run failed, or idle. */
const stateOf = (active: boolean, phase?: string): string => {
  if (active) return 'active'
  return phase === 'error' ? 'failed' : 'idle'
}

/**
 * Title-bar icon for the library scan / sync. Spins with an accent dot while work
 * runs (a danger dot after a failed sync) and opens a popover with the progress,
 * the per-worker bars and the last outcome.
 */
const SyncActivity = ({ open, syncing, scanning, cancelling, progress, onToggle, onClose, onCancel }: SyncActivityProps) => {
  const anchorRef = useRef<HTMLElement>(null)
  const active = syncing || scanning
  const state = stateOf(active, progress?.phase)
  const label = active ? 'Library sync running' : 'Library sync'

  return (
    <>
      <Box as="span" ref={anchorRef} className="tb-sync" data-state={state}>
        <IconButton label={label} title={label} className="tb-sync-btn" data-on={open || undefined} onClick={onToggle}>
          <Glyph name="sync" size={15} className="tb-sync-glyph" />
        </IconButton>
      </Box>
      <Popover open={open} anchorRef={anchorRef} onClose={onClose} placement="bottom" align="end" className="tb-sync-pop" role="dialog">
        <Box className="tb-sync-pop-head">
          <Box as="span" className="tb-sync-pop-title">
            Library sync
          </Box>
          {syncing && (
            <Button variant="danger" size="slim" onClick={onCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </Button>
          )}
        </Box>
        {syncing && progress ? (
          <SyncProgress p={progress} />
        ) : scanning ? (
          <Box as="p" className="muted tb-sync-note">Scanning your local Steam install…</Box>
        ) : progress?.phase === 'error' ? (
          <Box as="p" className="tb-sync-note tb-sync-error">{progress.message}</Box>
        ) : progress?.phase === 'paused' ? (
          <Box as="p" className="muted tb-sync-note">
            Sync cancelled. Start it again from the Library to resume where it left off.
          </Box>
        ) : (
          <Box as="p" className="muted tb-sync-note">
            {progress?.phase === 'done' ? 'Last sync finished.' : 'No scan or sync running.'}
          </Box>
        )}
      </Popover>
    </>
  )
}

export { SyncActivity }
