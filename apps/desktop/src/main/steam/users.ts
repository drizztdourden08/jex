import { join } from 'node:path'
import type { SteamUser } from '@shared/library'
import { readVdf } from './vdf'

interface LoginUsersVdf {
  users?: Record<
    string,
    { PersonaName?: string; AccountName?: string; MostRecent?: string }
  >
}

/** Parse config/loginusers.vdf → the accounts that have signed in on this PC. */
const getLoginUsers = (steamPath: string): SteamUser[] => {
  const data = readVdf<LoginUsersVdf>(join(steamPath, 'config', 'loginusers.vdf'))
  const u = data?.users ?? {}
  return Object.keys(u).map((steamId) => ({
    steamId,
    personaName: u[steamId]?.PersonaName ?? steamId,
    accountName: u[steamId]?.AccountName,
    mostRecent: u[steamId]?.MostRecent === '1',
  }))
}

export { getLoginUsers }
