import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { InstalledApp, LibraryFolder } from '@shared/library'
import { readVdf } from './vdf'

interface AppManifest {
  AppState?: {
    appid?: string
    name?: string
    installdir?: string
    SizeOnDisk?: string
    LastUpdated?: string
  }
}

/** Scan every library's steamapps/appmanifest_*.acf → installed games. */
const scanInstalledApps = (folders: LibraryFolder[]): InstalledApp[] => {
  const apps: InstalledApp[] = []
  for (const folder of folders) {
    const steamapps = join(folder.path, 'steamapps')
    let files: string[]
    try {
      files = readdirSync(steamapps)
    } catch {
      continue
    }
    for (const f of files) {
      if (!/^appmanifest_\d+\.acf$/i.test(f)) continue
      const s = readVdf<AppManifest>(join(steamapps, f))?.AppState
      const appid = Number(s?.appid)
      if (!s?.appid || !Number.isFinite(appid)) continue
      apps.push({
        appid,
        name: s.name ?? `App ${appid}`,
        installDir: s.installdir ?? '',
        sizeOnDisk: Number(s.SizeOnDisk ?? 0),
        lastUpdated: s.LastUpdated ? Number(s.LastUpdated) : undefined,
        libraryFolder: folder.path,
      })
    }
  }
  return apps
}

export { scanInstalledApps }
