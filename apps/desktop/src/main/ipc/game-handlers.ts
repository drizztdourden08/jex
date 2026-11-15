import { ipcMain } from 'electron'
import type { LaunchAction } from '@shared/launch'
import { launchGame } from '../steam/launch'
import { currentRunning, startRunningMonitor, stopGame, watchRunning } from '../steam/running'

/** Launch / install / stop a game through Steam; progress and running state are pushed. */
const registerGameHandlers = (): void => {
  ipcMain.handle('game:launch', (_e, appid: number, action: LaunchAction) => launchGame(appid, action))
  ipcMain.handle('game:running', () => currentRunning())
  ipcMain.handle('game:watchRunning', (_e, appid: number | null) => watchRunning(appid))
  ipcMain.handle('game:stop', (_e, appid: number) => stopGame(appid))
  startRunningMonitor()
}

export { registerGameHandlers }
