// Main-side tap on the plugin's `ai:stream` events, so dev probes can watch a turn
// (tool calls, confirm requests, the final text) without a renderer.
import type { AiStreamEvent } from '@shared/agent'

type StreamListener = (ev: AiStreamEvent) => void

const listeners = new Set<StreamListener>()

const onAiStream = (listener: StreamListener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const tapAiStream = (ev: AiStreamEvent): void => {
  for (const l of listeners) l(ev)
}

export { onAiStream, tapAiStream }
