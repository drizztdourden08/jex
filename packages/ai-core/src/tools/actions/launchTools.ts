import { shell } from 'electron'
import { registerTool } from '../registry'

/**
 * Launch / external action tools — leave the app: run a game through Steam or
 * open its Community hub in the OS browser. Both are `sensitive`.
 */
const registerLaunchTools = (): void => {
  // ── Launch / external ─────────────────────────────────────────────────────
  registerTool({
    name: 'launch_game',
    description:
      'Launch an installed game through Steam by its numeric appid (use get_game first to find it).',
    category: 'launch',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { appid: { type: 'number' } }, required: ['appid'] },
    summarize: (a) => `Launch game ${a.appid} via Steam`,
    run: async (args) => {
      const appid = Number(args.appid)
      if (!Number.isFinite(appid) || appid <= 0) return { error: 'Provide a valid numeric appid.' }
      await shell.openExternal(`steam://run/${appid}`)
      return { launched: appid }
    },
  })

  registerTool({
    name: 'open_community_hub',
    description:
      "Open a game's Steam Community hub (discussions, guides) in the OS browser, by numeric appid.",
    category: 'launch',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { appid: { type: 'number' } }, required: ['appid'] },
    summarize: (a) => `Open the community hub for game ${a.appid} in your browser`,
    run: async (args) => {
      const appid = Number(args.appid)
      if (!Number.isFinite(appid) || appid <= 0) return { error: 'Provide a valid numeric appid.' }
      await shell.openExternal(`https://steamcommunity.com/app/${appid}`)
      return { opened: appid }
    },
  })
}

export { registerLaunchTools }
