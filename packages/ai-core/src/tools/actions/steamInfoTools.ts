import { host } from '../../host'
import { registerTool } from '../registry'

/**
 * Steam install info (read-only) — report the detected install path, signed-in
 * account, and library folders to answer setup questions.
 */
const registerSteamInfoTools = (): void => {
  // ── Steam install info (read-only) ─────────────────────────────────────────
  registerTool({
    name: 'get_steam_info',
    description:
      'Get the detected Steam install: install path, signed-in account (persona + SteamID), and library folders. Use to answer setup questions.',
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const d = await host().steam.detectSteam()
      return {
        steamPath: d.steamPath,
        account: d.currentUser
          ? { persona: d.currentUser.personaName, steamId: d.currentUser.steamId }
          : null,
        libraryFolders: d.libraryFolders.map((f) => f.path),
      }
    },
  })
}

export { registerSteamInfoTools }
