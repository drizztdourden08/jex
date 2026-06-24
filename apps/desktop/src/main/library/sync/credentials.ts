import type { SteamUser } from '@shared/library'
import { getMeta } from '../../db/database'
import { detectSteam } from '../../steam/detect'
import { getSecret } from '../../secrets'

const getCredentials = async (): Promise<{ key: string | null; steamId: string | null }> => {
  // STEAM_KEY env is a dev/smoke fallback only; real runs read the encrypted secret.
  const key = process.env.STEAM_KEY || getSecret('steamApiKey')
  let steamId = getMeta<SteamUser>('currentUser')?.steamId ?? null
  if (!steamId) steamId = (await detectSteam()).currentUser?.steamId ?? null
  return { key, steamId }
}

export { getCredentials }
