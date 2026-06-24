import { ipcMain, shell } from 'electron'
import { routeNav, setStoreActive } from '../window/nav-guards'

/** External-link opening + Store-tab nav state reporting. */
const registerMiscHandlers = (): void => {
  ipcMain.handle('app:openExternal', (_e, url: string) => {
    if (/^(https?|steam):/.test(url)) return shell.openExternal(url)
  })
  // Renderer reports whether the Store tab is showing, so nav keys only act there.
  ipcMain.handle('store:setActive', (_e, active: boolean) => {
    setStoreActive(active)
  })
  // Renderer-caught mouse back/forward (DOM path, for mice that send XBUTTON rather
  // than WM_APPCOMMAND). Routed through the same coalescing path.
  ipcMain.handle('store:nav', (_e, action: 'back' | 'forward') => {
    routeNav(action)
  })
}

export { registerMiscHandlers }
