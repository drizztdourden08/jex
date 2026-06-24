import { host } from '../../host'
import { registerTool } from '../registry'
import { SETTING_KEYS } from './settingKeys'

/**
 * Settings + secrets action tools — toggle/read allowed boolean preferences and
 * save the encrypted Steam Web API key.
 */
const registerSettingsTools = (): void => {
  // ── Settings ───────────────────────────────────────────────────────────────
  registerTool({
    name: 'set_setting',
    description: `Change an app preference. Allowed keys (all true/false): ${SETTING_KEYS.join(', ')}.`,
    category: 'settings',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: { key: { enum: [...SETTING_KEYS] }, value: { type: 'boolean' } },
      required: ['key', 'value'],
    },
    summarize: (a) => `Set "${a.key}" to ${a.value}`,
    run: async (args) => {
      const key = String(args.key)
      if (!SETTING_KEYS.includes(key)) return { error: `Setting "${key}" is not allowed.` }
      const value = Boolean(args.value)
      host().settings.set(key, value)
      return { key, value }
    },
  })

  registerTool({
    name: 'get_setting',
    description: `Read an app preference. Allowed keys: ${SETTING_KEYS.join(', ')}.`,
    category: 'settings',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: { key: { enum: [...SETTING_KEYS] } },
      required: ['key'],
    },
    run: async (args) => {
      const key = String(args.key)
      if (!SETTING_KEYS.includes(key)) return { error: `Setting "${key}" is not allowed.` }
      return { key, value: host().settings.get(key) ?? null }
    },
  })

  registerTool({
    name: 'set_steam_api_key',
    description:
      'Save the user\'s Steam Web API key (stored encrypted on this PC, sent only to Steam). Use when the user provides a key so the full owned library can sync.',
    category: 'secrets',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
    // Never echo the secret value in the confirm card.
    summarize: () => 'Save a Steam Web API key (encrypted on this PC)',
    run: async (args) => {
      const key = String(args.key ?? '').trim()
      if (!key) return { error: 'No key provided.' }
      await host().secrets.setSecret('steamApiKey', key)
      return { saved: true }
    },
  })
}

export { registerSettingsTools }
