import { app, dialog, shell } from 'electron'
import { settings } from '../settings'
import { isSteamUrl } from '../steam/urls'
import { getMainWindow } from './window-ref'

/**
 * Navigation guards for the embedded Steam <webview>. Constrains the guest to
 * Steam, routes browser-nav gestures (keys, mouse buttons, app-commands) to the
 * store webview only while it's active, and offers non-Steam links to the OS
 * browser behind a one-time-dismissable confirmation.
 */

// The single store webview's webContents and whether the Store tab is showing.
// Browser-nav keys are routed to the store only while it's active, and never
// allowed to flip app tabs.
let storeView: Electron.WebContents | null = null
let storeActive = false

const setStoreActive = (active: boolean): void => {
  storeActive = !!active
}

const driveStore = (action: 'back' | 'forward' | 'reload'): void => {
  const wc = storeView
  if (!wc || wc.isDestroyed()) return
  const hist = wc.navigationHistory
  if (action === 'back') {
    if (hist.canGoBack()) hist.goBack()
  } else if (action === 'forward') {
    if (hist.canGoForward()) hist.goForward()
  } else {
    wc.reload()
  }
}

// A browser-nav gesture (mouse button, key, or app-command) can reach us via more
// than one path for the same physical press; coalesce within a short window so we
// navigate exactly once. Only acts on the Store tab.
let lastNavTs = 0
const routeNav = (action: 'back' | 'forward' | 'reload'): void => {
  if (!storeActive) return
  const now = Date.now()
  if (now - lastNavTs < 80) return
  lastNavTs = now
  console.log(`[main] routeNav ${action}`)
  driveStore(action)
}

/**
 * Intercept browser-style nav keys (Alt+←/→, F5, Ctrl/Cmd+R) before the renderer or
 * the guest acts on them. Attached to both the host window and the store webview so
 * it fires no matter which has focus. The default is always suppressed (so it can't
 * change app tabs); the store is driven only while the Store tab is active.
 */
const attachNavKeys = (contents: Electron.WebContents): void => {
  contents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const k = input.key
    const reload = k === 'F5' || ((input.control || input.meta) && (k === 'r' || k === 'R'))
    const back = input.alt && k === 'ArrowLeft'
    const forward = input.alt && k === 'ArrowRight'
    if (!reload && !back && !forward) return
    event.preventDefault()
    routeNav(reload ? 'reload' : back ? 'back' : 'forward')
  })
}

/**
 * Open a non-Steam URL in the OS browser, gated by a one-time-dismissable
 * confirmation. The "Don't ask again" checkbox defaults to unchecked and is only
 * honored when the user actually proceeds.
 */
const openExternalConfirmed = async (url: string): Promise<void> => {
  if (/^steam:/i.test(url)) {
    void shell.openExternal(url)
    return
  }
  if (!/^https?:/i.test(url)) return

  if (settings.get('skipExternalLinkPrompt') === true) {
    void shell.openExternal(url)
    return
  }

  const opts = {
    type: 'question' as const,
    buttons: ['Open in browser', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
    title: 'Leave the Steam store?',
    message: 'This link goes outside Steam and will open in your default browser.',
    detail: url,
    checkboxLabel: "Don't ask again",
    checkboxChecked: false,
    noLink: true,
  }
  const mainWindow = getMainWindow()
  const { response, checkboxChecked } = mainWindow
    ? await dialog.showMessageBox(mainWindow, opts)
    : await dialog.showMessageBox(opts)

  if (response === 0) {
    if (checkboxChecked) settings.set('skipExternalLinkPrompt', true)
    void shell.openExternal(url)
  }
}

/**
 * Constrain the embedded store webview to Steam. Steam navigations stay in the
 * webview (popups are folded back into the same view); anything else is blocked
 * and offered to the OS browser via openExternalConfirmed().
 */
const attachWebviewGuards = (): void => {
  app.on('web-contents-created', (_e, contents) => {
    if (contents.getType() !== 'webview') return

    // The single store webview: remember it so nav keys can drive it, and catch
    // browser-nav keys while the guest page itself has focus.
    storeView = contents
    attachNavKeys(contents)
    contents.on('destroyed', () => {
      if (storeView === contents) storeView = null
    })

    contents.on('will-navigate', (event, url) => {
      if (!isSteamUrl(url)) {
        event.preventDefault()
        void openExternalConfirmed(url)
      }
    })

    contents.setWindowOpenHandler(({ url }) => {
      // Keep new-tab/window.open targets inside the single embedded view.
      if (isSteamUrl(url)) {
        void contents.loadURL(url)
      } else {
        void openExternalConfirmed(url)
      }
      return { action: 'deny' }
    })
  })
}

export { routeNav, attachNavKeys, openExternalConfirmed, attachWebviewGuards, setStoreActive }
