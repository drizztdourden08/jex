import { execFile } from 'node:child_process'
import type { StopResult } from '@shared/launch'
import { installFolderOf } from './installFolder'
import { processesInFolder } from './processes'

const FORCE_AFTER_MS = 5000

const taskkill = (pid: number, force: boolean): Promise<void> =>
  new Promise((resolve) => {
    const args = ['/PID', String(pid), '/T', ...(force ? ['/F'] : [])]
    execFile('taskkill', args, { windowsHide: true, timeout: 10000 }, () => resolve())
  })

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** End the game's processes: ask politely, force only what is still alive after 5 s. */
const stopGame = async (appid: number): Promise<StopResult> => {
  const folder = installFolderOf(appid)
  if (!folder) return { stopped: 0, error: 'Install folder unknown' }
  const procs = await processesInFolder(folder)
  if (procs.length === 0) return { stopped: 0, error: 'No running process found for this game' }
  await Promise.all(procs.map((p) => taskkill(p.pid, false)))
  await sleep(FORCE_AFTER_MS)
  const left = await processesInFolder(folder)
  await Promise.all(left.map((p) => taskkill(p.pid, true)))
  return { stopped: procs.length }
}

export { stopGame }
