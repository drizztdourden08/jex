import { app } from 'electron'
import { getAllGames, getStats, dropAllMetadata } from '../db/games'
import { scanLocal } from '../library/scan'
import { cancelEnrich, enrichLibrary, getSyncState, runFullSync, syncOwned } from '../library/sync'

/**
 * Smoke probes for the local-library / enrichment lifecycle. Each is a one-shot,
 * env-gated dev helper run from the smoke harness; output is plain console logging
 * asserted (or eyeballed) by CI / the developer. scan + sync do NOT quit (they let
 * the harness's SMOKE_MS timer end the run); drop + cancel quit themselves.
 */

const smokeScan = (): void => {
  void scanLocal()
    .then((r) =>
      console.log(
        `[main] smoke scan: steamPath=${r.detected.steamPath} ` +
          `user=${r.detected.currentUser?.personaName ?? 'none'} ` +
          `libraries=${r.detected.libraryFolders.length} ` +
          `installed=${r.installedCount} total=${r.totalGames}`,
      ),
    )
    .catch((e) => console.error('[main] smoke scan error:', e))
}

const smokeSync = (): void => {
  void (async () => {
    try {
      const scan = await scanLocal()
      const owned = await syncOwned()
      const limit = Number(process.env.SMOKE_ENRICH_LIMIT) || 3
      const t0 = Date.now()
      let peakWorkers = 0
      await enrichLibrary(
        (p) => {
          const fetching = p.workers?.filter((w) => w.status === 'fetching').length ?? 0
          peakWorkers = Math.max(peakWorkers, fetching)
        },
        { limit, delayMs: 500 },
      )
      const enriched = getAllGames().filter((g) => g.enrichment === 'enriched').length
      console.log(
        `[main] smoke sync: installed=${scan.installedCount} owned=${owned} ` +
          `enriched=${enriched} took=${Date.now() - t0}ms peakWorkers=${peakWorkers}`,
      )
    } catch (e) {
      console.error('[main] smoke sync error:', String(e))
    }
  })()
}

const smokeDrop = (): void => {
  void (async () => {
    try {
      const before = getStats()
      const n = dropAllMetadata()
      const after = getStats()
      console.log(
        `[main] smoke drop: reset=${n} | before enriched=${before.enriched} pending=${before.pending} ` +
          `lastEnrich=${before.lastEnrich} | after enriched=${after.enriched} pending=${after.pending} ` +
          `lastEnrich=${after.lastEnrich} | owned kept ${before.owned}=>${after.owned}`,
      )
    } catch (e) {
      console.error('[main] smoke drop error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

const smokeCancel = (): void => {
  // Start a full sync, cancel after 4s, and report how quickly it actually stops.
  void (async () => {
    try {
      const t0 = Date.now()
      const p = enrichLibrary(() => {})
      await runFullSync()
      setTimeout(() => {
        console.log('[main] cancel: requesting')
        cancelEnrich()
      }, 4000)
      await p
      const st = getSyncState()
      console.log(
        `[main] smoke cancel: stopped ${Date.now() - t0}ms after start; ` +
          `running=${st.running} phase=${st.progress?.phase} done=${st.progress?.done}`,
      )
    } catch (e) {
      console.error('[main] smoke cancel error:', String(e))
    } finally {
      app.quit()
    }
  })()
}

export { smokeScan, smokeSync, smokeDrop, smokeCancel }
