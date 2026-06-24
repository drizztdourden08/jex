import './app-name' // MUST be first — sets app name before any import resolves userData
import { app, BrowserWindow } from 'electron'
import { initDb } from './db/database'
import { onEnrichProgress } from './library/sync'
import { initEngine } from './ai-host'
import { registerLocalArtScheme, registerArtProtocol } from './protocol/localart'
import { registerIpc } from './ipc'
import { attachWebviewGuards } from './window/nav-guards'
import { createWindow } from './window/create-window'
import { setMainWindow, getMainWindow } from './window/window-ref'
import { scheduleStartupSync } from './app/startup-sync'
import { runSmokeHarness } from './dev/smoke'

/**
 * Electron main process — app lifecycle + wiring only. Everything privileged lives
 * in its domain module (steam/ · db/ · enrich/ · library/ · ai-host/); window creation,
 * nav guards, the localart:// protocol, the UI bridge, and per-domain IPC handler
 * registration are each their own module. NO_FOCUS=1 → the window is shown inactive
 * and never steals focus; SMOKE_MS=<ms> runs the dev smoke harness and auto-quits.
 */

// (App name is pinned to "Jex" by ./app-name, imported first above — before any module
// touches app.getPath('userData'); electron-store reads it at import time.)

// Must be declared before app is ready: the localart:// scheme is privileged.
registerLocalArtScheme()

app.whenReady().then(async () => {
  await initDb()
  registerIpc()
  registerArtProtocol()
  attachWebviewGuards()
  setMainWindow(createWindow())
  // Load the AI engine plugin if it's already installed (no-op otherwise — the
  // renderer's setup flow installs it on first use). Engine startup (tools, policy
  // store, host wiring) happens inside the plugin's init.
  void initEngine()
  // Single bridge: the shared enrichment scheduler streams ALL progress (library,
  // wishlist, game-detail) to the renderer on one channel.
  onEnrichProgress((p) => getMainWindow()?.webContents.send('enrich:progress', p))
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) setMainWindow(createWindow())
  })

  // Background auto-sync on a real launch; the smoke harness runs instead under SMOKE_MS.
  const smokeMs = Number(process.env.SMOKE_MS)
  if (smokeMs > 0) runSmokeHarness(smokeMs)
  else scheduleStartupSync()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
