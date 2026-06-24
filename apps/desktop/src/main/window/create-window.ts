import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { attachNavKeys, routeNav } from './nav-guards'

/**
 * Main window creation: frameless Mica/Acrylic glass, no focus stealing under
 * NO_FOCUS, and the host-level browser-nav interception (keys + mouse app-commands).
 */

const NO_FOCUS = process.env.NO_FOCUS === '1'
const isWin = process.platform === 'win32'

// The Jex mascot, rasterized to assets/icon.png (see scripts/render-icon.mjs).
// Packaged builds carry it via electron-builder `extraResources`; dev reads the
// source-of-truth file straight from the project's assets/ dir. (On packaged Windows
// the taskbar uses the exe's embedded icon — this drives the dev taskbar and
// non-Windows platforms.)
const APP_ICON = app.isPackaged
  ? join(process.resourcesPath, 'icon.png')
  : join(app.getAppPath(), 'assets', 'icon.png')

const createWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    icon: APP_ICON,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    // Fully transparent window background so the OS material shows through the
    // (transparent) web content. Acrylic = the frosted, blurred glass look (Mica
    // is far too subtle — barely a wallpaper tint).
    transparent: !isWin, // mac/linux true transparency; Windows uses backgroundMaterial
    backgroundColor: '#00000000',
    ...(isWin
      ? { backgroundMaterial: 'acrylic' as const }
      : { vibrancy: 'under-window' as const }),
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/index.mjs'),
      contextIsolation: true,
      // sandbox:false is required to load the bundled ESM preload under
      // electron-vite; contextIsolation + nodeIntegration:false remain the
      // security boundary (renderer has no Node access).
      sandbox: false,
      nodeIntegration: false,
      // Enables the <webview> tag used by the Store tab. The guest content runs
      // out-of-process in its own persistent session (set on the tag) where the
      // Steam login is kept; it gets no Node and its navigation is constrained by
      // attachWebviewGuards().
      webviewTag: true,
    },
  })

  win.once('ready-to-show', () => {
    // Re-assert the material after show — some Win11 builds ignore the
    // constructor option until the window exists.
    if (isWin) {
      try {
        win.setBackgroundMaterial('acrylic')
      } catch {
        /* older Electron/Windows — constructor option still applies */
      }
    }
    // NO_FOCUS: show without activating so we never steal focus from other apps.
    if (NO_FOCUS) win.showInactive()
    else win.show()
    console.log(`[main] window shown (${NO_FOCUS ? 'inactive' : 'active'})`)
  })

  attachNavKeys(win.webContents)

  // Mouse back/forward buttons arrive on Windows as app-commands at the window
  // level (not as DOM events), and Chromium's default is to navigate the focused
  // webContents' history — which here means flipping app tabs. Always suppress that
  // default; when the Store tab is showing, send it to the store webview instead.
  win.on('app-command', (event, command) => {
    console.log(`[main] app-command ${command}`)
    if (command === 'browser-backward' || command === 'browser-forward') {
      event.preventDefault()
      routeNav(command === 'browser-backward' ? 'back' : 'forward')
    }
  })

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[main] renderer failed to load: ${code} ${desc} ${url}`)
  })
  win.webContents.on('console-message', (_e, _lvl, msg) => {
    if (/error/i.test(msg)) console.error(`[renderer] ${msg}`)
  })

  // Open external links (Steam store pages, etc.) in the OS browser, not in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('steam://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(import.meta.dirname, '../renderer/index.html'))
  }
  return win
}

export { createWindow }
