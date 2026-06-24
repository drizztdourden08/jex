// Load an installed (extracted) plugin: dynamic-import its index.mjs default export
// (the AiPluginFactory), instantiate it, and init() it with the host's capabilities.
// The plugin's own node_modules (node-llama-cpp + its backend) resolve relative to its
// dir; `electron` resolves to the running runtime. Sets the engine singleton on success.
import { app } from 'electron'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { AiPlugin, AiPluginFactory, UiDispatcher } from '@jex/ai-contract'
import { createHostServices } from './host-services'
import { createEmit } from './emit'
import { setEngine } from './engine'

const loadPluginFrom = async (dir: string, ui: UiDispatcher): Promise<AiPlugin> => {
  const entryUrl = pathToFileURL(join(dir, 'index.mjs')).href
  const mod = (await import(entryUrl)) as { default: AiPluginFactory }
  const plugin = mod.default()
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
