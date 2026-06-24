// The built plugin's entry point: a default-exported AiPluginFactory the host
// dynamically imports after download + signature verification (see P3). esbuild
// bundles this file (inlining @jex/shared and the engine) with node-llama-cpp +
// electron kept external — they live in the plugin's own node_modules / the runtime.
import { createAiPlugin } from './plugin'

export default createAiPlugin
