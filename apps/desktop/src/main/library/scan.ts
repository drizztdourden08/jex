import type { ScanResult } from '@shared/library'
import { detectSteam } from '../steam/detect'
import { scanInstalledApps } from '../steam/appmanifest'
import { getMeta, setMeta } from '../db/database'
import { gameCount, syncInstalled } from '../db/games'

/**
 * Phase 1 scan: detect Steam, read installed apps from .acf manifests, and write
 * them into the mirror. No key, no network. Returns counts for the UI.
 */
const scanLocal = async (): Promise<ScanResult> => {
  const detected = await detectSteam()
  let installedCount = 0
  if (detected.steamPath) {
    const apps = scanInstalledApps(detected.libraryFolders)
    installedCount = syncInstalled(detected.steamPath, apps)
    setMeta('steamPath', detected.steamPath)
    setMeta('lastLocalScan', Date.now())
    if (detected.currentUser) setMeta('currentUser', detected.currentUser)
  }
  return { detected, installedCount, totalGames: gameCount() }
}

/** Steam path remembered from the last scan (used by the art protocol handler). */
const rememberedSteamPath = (): string | null => {
  return getMeta<string>('steamPath')
}

export { scanLocal, rememberedSteamPath }
