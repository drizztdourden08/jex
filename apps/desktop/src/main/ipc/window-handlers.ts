import { ipcMain } from 'electron'
import { getMainWindow } from '../window/window-ref'

/** Window controls for the frameless custom titlebar. */
const registerWindowHandlers = (): void => {
  ipcMain.handle('window:minimize', () => getMainWindow()?.minimize())
  ipcMain.handle('window:maximize', () => {
    const win = getMainWindow()
    if (!win) return false
    win.isMaximized() ? win.unmaximize() : win.maximize()
    return win.isMaximized()
  })
  ipcMain.handle('window:close', () => getMainWindow()?.close())
  ipcMain.handle('window:isMaximized', () => getMainWindow()?.isMaximized() ?? false)
}

export { registerWindowHandlers }
