// Load an installed (extracted) plugin: dynamic-import its index.mjs default export
// (the AiPluginFactory), instantiate it, and init() it with the host's capabilities.
// The plugin's own node_modules (node-llama-cpp + its backend) resolve relative to its
// dir (when it has any); `electron` resolves to the running runtime. Sets the engine singleton on success.
import { app } from 'electron'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { AI_PLUGIN_API_VERSION } from '@jex/ai-contract'
import type { AiPlugin, AiPluginFactory, UiDispatcher } from '@jex/ai-contract'
import { createHostServices } from './host-services'
import { createEmit } from './emit'
import { getEngine, setEngine } from './engine'

const loadPluginFrom = async (dir: string, ui: UiDispatcher): Promise<AiPlugin> => {
  const entryUrl = pathToFileURL(join(dir, 'index.mjs')).href
  const mod = (await import(entryUrl)) as { default: AiPluginFactory }
  const plugin = mod.default()
  if (plugin.apiVersion !== AI_PLUGIN_API_VERSION) throw new Error('AI engine needs an update')
  // Replacing a loaded engine (e.g. ai-engine -> base): release the old one first.
  const previous = getEngine()
  if (previous) {
    setEngine(null)
    await previous.dispose().catch((e) => console.error('[ai-host] dispose failed:', e))
  }
  await plugin.init({
    host: createHostServices(),
    emit: createEmit(),
    ui,
    modelDir: join(app.getPath('userData'), 'models'),
  })
  setEngine(plugin)
  return plugin
}

export { loadPluginFrom }
