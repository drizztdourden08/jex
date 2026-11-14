import { useCallback, useState } from 'react'
import { useSyncStatus } from '@/store/syncStatus'
import { useSyncStatusFeed } from '@/hooks/useSyncStatusFeed'

/**
 * The title bar's scan/sync activity: feeds the app-wide sync-status store from main
 * (the TitleBar is mounted for the whole session) and owns the popover's open state.
 */
const useSyncActivity = () => {
  useSyncStatusFeed()
  const syncing = useSyncStatus((s) => s.syncing)
  const scanning = useSyncStatus((s) => s.scanning)
  const cancelling = useSyncStatus((s) => s.cancelling)
  const progress = useSyncStatus((s) => s.progress)
  const cancel = useSyncStatus((s) => s.cancel)
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])

  return { open, toggle, close, syncing, scanning, cancelling, progress, cancel }
}

export { useSyncActivity }
