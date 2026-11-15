import { host } from '../../../host'
import { registerTool } from '../../registry'

const registerSteamWishlistTools = (): void => {
  registerTool({
    name: 'add_to_steam_wishlist',
    description:
      "Add a game (by appid) to the user's REAL Steam wishlist on their Steam account (needs them signed in to Steam in the Store tab; if the result has needsLogin, tell them to sign in there and retry). Not needed to pin a game in a local group. Removing from the Steam wishlist is not supported.",
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { appid: { type: 'number' } }, required: ['appid'] },
    summarize: (a) => `Add app ${a.appid} to your Steam wishlist (changes your Steam account)`,
    run: async (args) => {
      const appid = Number(args.appid)
      if (!Number.isFinite(appid) || appid <= 0) return { error: 'Provide a valid appid.' }
      const r = await host().wishlist.addToSteam(appid)
      if (r.ok) return { added: true, appid }
      if (r.needsLogin) return { added: false, needsLogin: true, error: 'Not signed in to Steam in the Store tab; ask the user to sign in there, then retry.' }
      return { added: false, error: r.error ?? 'Steam rejected the request.' }
    },
  })

  registerTool({
    name: 'sync_wishlist',
    description: "Refresh the user's Steam wishlist from their public Steam profile.",
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: {} },
    summarize: () => 'Sync your Steam wishlist',
    run: async () => {
      const r = await host().library.runWishlistSync()
      return { synced: true, ...r }
    },
  })
}

export { registerSteamWishlistTools }
