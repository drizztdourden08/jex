import type { BrowserWindow } from 'electron'

/**
 * Holder for the single main window. Many IPC handlers and the UI bridge need to
 * reach `mainWindow.webContents` after it's created; rather than thread it through
 * every module, they read it through this accessor (set once from app startup).
 */

let mainWindow: BrowserWindow | null = null

const setMainWindow = (win: BrowserWindow | null): void => {
  mainWindow = win
}

const getMainWindow = (): BrowserWindow | null => mainWindow

export { setMainWindow, getMainWindow }
