import type { BrowserWindow } from 'electron'

// Pushes the maximized state to the renderer on every change, so the titlebar icon
// follows the event instead of re-reading a state that can still be the old one.
const pushMaximized = (win: BrowserWindow): void => {
  const send = (maximized: boolean): void => {
    if (!win.isDestroyed()) win.webContents.send('window:maximized-changed', maximized)
  }
  win.on('maximize', () => send(true))
  win.on('unmaximize', () => send(false))
  win.on('enter-full-screen', () => send(true))
  win.on('leave-full-screen', () => send(win.isMaximized()))
  win.on('restore', () => send(win.isMaximized()))
}

export { pushMaximized }
