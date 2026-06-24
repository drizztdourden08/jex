// The loaded AI engine — a singleton AiPlugin instance, or null when no plugin is
// installed yet. The ai:* IPC handlers read it through here; requireEngine() throws a
// user-facing message when the engine isn't set up (the renderer gates on
// ai:engineStatus so this is a backstop, not the normal path).
import type { AiPlugin } from '@jex/ai-contract'

let engine: AiPlugin | null = null

const getEngine = (): AiPlugin | null => engine

const setEngine = (plugin: AiPlugin | null): void => {
  engine = plugin
}

const requireEngine = (): AiPlugin => {
  if (engine == null) {
    throw new Error('The AI engine is not installed yet — open Settings to set it up.')
  }
  return engine
}

export { getEngine, setEngine, requireEngine }
