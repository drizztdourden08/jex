// After a failed startup check: retry the manifest check in the background (at most 3
// tries, about a minute apart). A found update is only recorded as a pending marker and
// announced; it is applied at the next start, before the engine loads.
import { getMainWindow } from '../window/window-ref'
import { checkOutdated } from './update-check'
import { writePending } from './pending-update'
import { logAi } from './ai-log'

const TRIES = 3
const GAP_MS = 60_000
const RETRY_TIMEOUT_MS = 60_000
const READY_MESSAGE = 'An AI engine update is ready. Restart Jex to install it.'

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const retryInBackground = async (): Promise<void> => {
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    await wait(GAP_MS)
    logAi(`background update check ${attempt}/${TRIES}`)
    const { ok, ids } = await checkOutdated(RETRY_TIMEOUT_MS)
    if (!ok) continue
    if (ids.length > 0) {
      writePending(ids)
      getMainWindow()?.webContents.send('ai:engineProgress', READY_MESSAGE)
    }
    return
  }
  logAi('background update check gave up')
}

export { retryInBackground }
