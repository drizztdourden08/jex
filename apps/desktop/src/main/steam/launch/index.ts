import { shell } from 'electron'
import type { LaunchAction, LaunchStatus } from '@shared/launch'
import { getMainWindow } from '../../window/window-ref'
import { watchLaunch } from './watchLaunch'

const push = (s: LaunchStatus): void => {
  getMainWindow()?.webContents.send('game:launchStatus', s)
}

/** Open the steam:// URL, then report progress until Steam shows a final state. */
const launchGame = async (appid: number, action: LaunchAction): Promise<void> => {
  if (!Number.isInteger(appid) || appid <= 0 || (action !== 'run' && action !== 'install')) return
  push({ appid, action, phase: 'opening', text: 'Opening Steam…' })
  try {
    await shell.openExternal(`steam://${action}/${appid}`)
  } catch {
    push({ appid, action, phase: 'error', text: 'Could not open Steam' })
    return
  }
  watchLaunch(appid, action, push)
}

export { launchGame }
