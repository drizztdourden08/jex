// Engine lifecycle IPC: the renderer reads ai:engineStatus + ai:enginePlugins on the
// setup screen and, when not installed, drives ai:installEngine with the user-selected
// plugin ids (progress streams on ai:engineProgress).
import { ipcMain } from 'electron'
import { engineStatus, enginePlugins, installEngine } from '../ai-host'
import { getMainWindow } from '../window/window-ref'

const registerAiHostHandlers = (): void => {
  ipcMain.handle('ai:engineStatus', () => engineStatus())
  ipcMain.handle('ai:enginePlugins', () => enginePlugins())
  ipcMain.handle('ai:installEngine', (_e, ids: string[]) =>
    installEngine(ids, (msg) => getMainWindow()?.webContents.send('ai:engineProgress', msg)),
  )
}

export { registerAiHostHandlers }
