import { host } from '../../host'
import { registerTool } from '../registry'

/**
 * Sync action tools — start/cancel a full library sync and report its progress.
 */
const registerSyncTools = (): void => {
  // ── Sync ─────────────────────────────────────────────────────────────────
  registerTool({
    name: 'run_sync',
    description:
      'Start a full library sync with Steam (owned games + metadata). Runs in the background and respects rate limits.',
    category: 'sync',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: {} },
    summarize: () => 'Sync your library with Steam now',
    run: async () => {
      void host().library.runFullSync()
      return { started: true }
    },
  })

  registerTool({
    name: 'cancel_sync',
    description: 'Cancel a sync that is currently running.',
    category: 'sync',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      host().library.cancelEnrich()
      return { cancelled: true }
    },
  })

  registerTool({
    name: 'sync_status',
    description: 'Check whether a library sync is currently running and its progress.',
    category: 'sync',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const st = host().library.getSyncState()
      return { running: st.running, phase: st.progress?.phase, done: st.progress?.done, total: st.progress?.total }
    },
  })
}

export { registerSyncTools }
