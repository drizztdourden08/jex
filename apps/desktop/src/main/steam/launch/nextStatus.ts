import type { LaunchAction, LaunchPhase, LaunchStatus } from '@shared/launch'
import { INSTALL_TIMEOUT_MS, OPENING_TICKS, RUN_TIMEOUT_MS } from './launch.constants'
import type { SteamState } from './readSteamState'

type TickInput = {
  appid: number
  action: LaunchAction
  state: SteamState
  tick: number
  elapsedMs: number
  wasInstalled: boolean
}

/** Pure: the status line for one poll of Steam's state. */
const nextStatus = ({ appid, action, state, tick, elapsedMs, wasInstalled }: TickInput): LaunchStatus => {
  const make = (phase: LaunchPhase, text: string): LaunchStatus => ({ appid, action, phase, text })
  const { runningAppId, running, updating, installed } = state
  if (action === 'run') {
    if (runningAppId === appid || running) return make('running', 'Running')
    if (elapsedMs >= RUN_TIMEOUT_MS) return make('timeout', 'Sent to Steam')
    if (updating) return make('updating', 'Steam is updating the game…')
    if (tick < OPENING_TICKS) return make('opening', 'Opening Steam…')
    return make('starting', 'Starting…')
  }
  if (installed && !wasInstalled) return make('done', 'Installed')
  if (elapsedMs >= INSTALL_TIMEOUT_MS) return make('timeout', 'Continue the install in Steam')
  if (updating) return make('installing', 'Downloading in Steam…')
  if (tick < OPENING_TICKS) return make('opening', 'Opening Steam…')
  return make('installDialog', 'Install dialog open in Steam')
}

export { nextStatus }
