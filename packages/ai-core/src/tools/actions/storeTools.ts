import { registerTool } from '../registry'

/**
 * Embedded-store navigation (safe — just shows a page). Known Steam destinations
 * now live in the searchable sitemap — see the find_steam_page / open_steam_page
 * tools (src/main/ai/tools/sitemap.ts).
 */
const registerStoreTools = (): void => {
  // ── Embedded-store navigation (safe — just shows a page) ───────────────────
  registerTool({
    name: 'open_store_page',
    description:
      "Open a game's page on the Steam STORE WEBSITE (the app's embedded browser), by numeric appid. Use this ONLY when the user explicitly asks for the store page, to buy it, or for web/store content. To simply SHOW or open a game in the app, use open_game (the in-app detail page) instead — that is the default.",
    category: 'store',
    sensitivity: 'safe',
    surface: 'ui',
    params: { type: 'object', properties: { appid: { type: 'number' } }, required: ['appid'] },
    run: async (args, ctx) => {
      const appid = Number(args.appid)
      if (!Number.isFinite(appid) || appid <= 0) return { error: 'Provide a valid numeric appid.' }
      return ctx.ui('navigateStore', { url: `https://store.steampowered.com/app/${appid}` })
    },
  })
}

export { registerStoreTools }
