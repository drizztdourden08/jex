import { app } from 'electron'
import { getMainWindow } from '../../window/window-ref'
import { readRunningAppId } from '../launch/readSteamState'
import { installFolderOf } from './installFolder'
import { processesInFolder } from './processes'

const POLL_MS = 2000
const PROCESS_CHECK_MS = 5000

let steamRunning = 0
let fallbackRunning = false
let watched: number | null = null
let lastKey = ''
let lastProcessCheck = 0
let timer: ReturnType<typeof setInterval> | null = null

/** Appids currently running: Steam's flag plus the one watched game's process check. */
const currentRunning = (): number[] => {
  const ids = new Set<number>()
  if (steamRunning > 0) ids.add(steamRunning)
  if (fallbackRunning && watched) ids.add(watched)
  return [...ids].sort((a, b) => a - b)
}

const emitIfChanged = (): void => {
  const key = currentRunning().join(',')
  if (key === lastKey) return
  lastKey = key
  getMainWindow()?.webContents.send('game:runningChanged', currentRunning())
}

const checkProcesses = async (): Promise<void> => {
  const appid = watched
  const folder = appid ? installFolderOf(appid) : null
  if (!appid || !folder) {
    fallbackRunning = false
    return
  }
  const found = (await processesInFolder(folder)).length > 0
  if (watched === appid) fallbackRunning = found
}

const tick = async (): Promise<void> => {
  steamRunning = await readRunningAppId()
  if (watched && steamRunning !== watched && Date.now() - lastProcessCheck >= PROCESS_CHECK_MS) {
    lastProcessCheck = Date.now()
    await checkProcesses()
  }
  emitIfChanged()
}

/** Start the one cheap poll that tracks running games for the app's lifetime. */
const startRunningMonitor = (): void => {
  if (timer) return
  timer = setInterval(() => void tick(), POLL_MS)
  app.on('will-quit', () => {
    if (timer) clearInterval(timer)
    timer = null
  })
}

/** Also process-check this one game (the open detail page); null stops. */
const watchRunning = (appid: number | null): void => {
  watched = appid !== null && Number.isInteger(appid) && appid > 0 ? appid : null
  fallbackRunning = false
  lastProcessCheck = 0
}

export { startRunningMonitor, watchRunning, currentRunning }
