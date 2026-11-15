import Registry from 'winreg'

type SteamState = { runningAppId: number; running: boolean; updating: boolean; installed: boolean }

const STEAM_KEY = '\\Software\\Valve\\Steam'

const regNumber = (key: string, name: string): Promise<number> =>
  new Promise((resolve) => {
    try {
      new Registry({ hive: Registry.HKCU, key }).get(name, (err, item) => {
        const n = err || !item ? 0 : Number(item.value)
        resolve(Number.isFinite(n) ? n : 0)
      })
    } catch {
      resolve(0)
    }
  })

/** Snapshot of what Steam's registry says about one app (DWORDs arrive as "0x.."). */
const readSteamState = async (appid: number): Promise<SteamState> => {
  const appKey = `${STEAM_KEY}\\Apps\\${appid}`
  const [runningAppId, running, updating, installed] = await Promise.all([
    regNumber(STEAM_KEY, 'RunningAppID'),
    regNumber(appKey, 'Running'),
    regNumber(appKey, 'Updating'),
    regNumber(appKey, 'Installed'),
  ])
  return { runningAppId, running: running === 1, updating: updating === 1, installed: installed === 1 }
}

export { readSteamState }
export type { SteamState }
