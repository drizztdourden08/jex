import { ipcMain } from 'electron'
import type { LaunchAction } from '@shared/launch'
import { launchGame } from '../steam/launch'

/** Launch / install a game through Steam, with progress pushed as `game:launchStatus`. */
const registerGameHandlers = (): void => {
  ipcMain.handle('game:launch', (_e, appid: number, action: LaunchAction) => launchGame(appid, action))
}

export { registerGameHandlers }
