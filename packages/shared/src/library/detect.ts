/**
 * Steam install detection + scan result types — the output of reading the local
 * Steam files (registry + VDF + appmanifest). Shared across main and renderer via
 * the `@shared` alias.
 */

interface SteamUser {
  steamId: string // 64-bit
  personaName: string
  accountName?: string
  mostRecent: boolean
}

interface LibraryFolder {
  path: string // library root (contains steamapps/)
  label?: string
}

interface InstalledApp {
  appid: number
  name: string
  installDir: string
  sizeOnDisk: number
  lastUpdated?: number
  libraryFolder: string
}

interface DetectResult {
  steamPath: string | null
  currentUser: SteamUser | null
  users: SteamUser[]
  libraryFolders: LibraryFolder[]
}

interface ScanResult {
  detected: DetectResult
  installedCount: number
  totalGames: number
}

export type { SteamUser, LibraryFolder, InstalledApp, DetectResult, ScanResult }
