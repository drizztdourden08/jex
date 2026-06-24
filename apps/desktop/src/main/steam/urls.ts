/**
 * Steam URL classification. The embedded store webview may navigate within these
 * hosts in-app; anything else is treated as "leaving Steam" and offered to the OS
 * browser after a confirmation.
 */

const STEAM_HOSTS = [
  'steampowered.com',
  'steamcommunity.com',
  'steamstatic.com',
  'steamgames.com',
  'valvesoftware.com',
]

const isSteamUrl = (raw: string): boolean => {
  try {
    const u = new URL(raw)
    if (u.protocol === 'steam:') return true
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    const host = u.hostname.toLowerCase()
    return STEAM_HOSTS.some((d) => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

export { STEAM_HOSTS, isSteamUrl }
