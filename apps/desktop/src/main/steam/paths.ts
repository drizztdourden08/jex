import { existsSync } from 'node:fs'
import { join, normalize } from 'node:path'
import Registry from 'winreg'
import type { LibraryFolder } from '@shared/library'
import { readVdf } from './vdf'

const regGet = (hive: string, key: string, name: string): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const r = new Registry({ hive, key })
      r.get(name, (err, item) => resolve(err || !item ? null : item.value))
    } catch {
      resolve(null)
    }
  })
}

const defaultSteamDir = (): string | null => {
  const pf = process.env['ProgramFiles(x86)'] ?? process.env.ProgramFiles
  return pf ? join(pf, 'Steam') : null
}

/** Locate the Steam install directory (registry first, then the default path). */
const findSteamPath = async (): Promise<string | null> => {
  const hkcu = await regGet(Registry.HKCU, '\\Software\\Valve\\Steam', 'SteamPath')
  const hklm = await regGet(Registry.HKLM, '\\SOFTWARE\\WOW6432Node\\Valve\\Steam', 'InstallPath')
  const candidates = [hkcu, hklm, defaultSteamDir()].filter((c): c is string => Boolean(c))
  for (const c of candidates) {
    const p = normalize(c)
    if (existsSync(join(p, 'steamapps')) || existsSync(join(p, 'steam.exe'))) return p
  }
  return candidates[0] ? normalize(candidates[0]) : null
}

/** All Steam library roots (each contains a steamapps/ dir), incl. the main install. */
const getLibraryFolders = (steamPath: string): LibraryFolder[] => {
  const data = readVdf<{ libraryfolders?: Record<string, { path?: string; label?: string }> }>(
    join(steamPath, 'steamapps', 'libraryfolders.vdf'),
  )
  const folders: LibraryFolder[] = []
  const seen = new Set<string>()
  const add = (p?: string, label?: string) => {
    if (!p) return
    const n = normalize(p)
    const key = n.toLowerCase()
    if (seen.has(key) || !existsSync(join(n, 'steamapps'))) return
    seen.add(key)
    folders.push({ path: n, label: label || undefined })
  }
  add(steamPath)
  const lf = data?.libraryfolders ?? {}
  for (const k of Object.keys(lf)) add(lf[k]?.path, lf[k]?.label)
  return folders
}

export { findSteamPath, getLibraryFolders }
