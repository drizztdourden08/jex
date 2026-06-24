import { app } from 'electron'
import { getMainWindow } from '../window/window-ref'
import { smokeScan, smokeSync, smokeDrop, smokeCancel } from './smoke-probes'
import { smokeAi, smokeEngine, smokeDiag, smokeMeta, smokeRefresh } from './smoke-inspect'

/**
 * Smoke/E2E harness: when launched with SMOKE_MS=<ms> (headless/CI), run the
 * env-selected probe(s), then auto-quit after the deadline so the launch doesn't
 * linger. The E2E self-check asserts the window is shown WITHOUT focus (NO_FOCUS)
 * and that the renderer mounted. Dev-only; never runs on a real launch.
 */

const PROBES: Record<string, () => void> = {
  SMOKE_SCAN: smokeScan,
  SMOKE_SYNC: smokeSync,
  SMOKE_AI: smokeAi,
  SMOKE_ENGINE: smokeEngine,
  SMOKE_DIAG: smokeDiag,
  SMOKE_META: smokeMeta,
  SMOKE_REFRESH: smokeRefresh,
  SMOKE_DROP: smokeDrop,
  SMOKE_CANCEL: smokeCancel,
}

const runE2eCheck = (): void => {
  // E2E self-check: confirm the window is shown WITHOUT focus (NO_FOCUS) and the
  // renderer actually mounted, then report + quit. Asserted by the test.
  setTimeout(async () => {
    const win = getMainWindow()
    const focused = win ? win.isFocused() : true
    let rootMounted = false
    try {
      const n = (await win?.webContents.executeJavaScript(
        'document.getElementById("root")?.childElementCount || 0',
      )) as number
      rootMounted = n > 0
    } catch {
      /* ignore */
    }
    console.log(`[main] e2e: focused=${focused} rootMounted=${rootMounted}`)
    app.quit()
  }, 2500)
}

const runSmokeHarness = (smokeMs: number): void => {
  for (const [env, probe] of Object.entries(PROBES)) {
    if (process.env[env] === '1') probe()
  }
  if (process.env.SMOKE_E2E === '1') runE2eCheck()
  setTimeout(() => {
    console.log('[main] smoke: quitting')
    app.quit()
  }, smokeMs)
}

export { runSmokeHarness }
