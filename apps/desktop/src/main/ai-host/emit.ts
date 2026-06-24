// The push channel handed to a plugin's init: forwards the plugin's events to the
// renderer on the same channels it already listens on (ai:stream, ai:downloadProgress,
// …). When AI_EVAL_LOG=1 it also taps ai:stream to stdout for the headless eval harness.
import type { AiStreamEvent } from '@shared/agent'
import { getMainWindow } from '../window/window-ref'

const logEvalEvent = (ev: AiStreamEvent): void => {
  if (ev.type === 'thinking') process.stdout.write(`[agent:thinking] ${ev.text.slice(-120).replace(/\n/g, ' ')}\n`)
  else if (ev.type === 'token') process.stdout.write(`[agent:token] ${ev.text.slice(-80).replace(/\n/g, ' ')}\n`)
  else if (ev.type === 'tool-call') process.stdout.write(`[agent:tool-call] ${ev.name} ${JSON.stringify(ev.args).slice(0, 800)}\n`)
  else if (ev.type === 'tool-result') process.stdout.write(`[agent:tool-result] ${ev.name} ok=${ev.ok} ${JSON.stringify(ev.result ?? ev.error ?? '').slice(0, 300)}\n`)
  else if (ev.type === 'done') process.stdout.write(`[agent:done] ${(ev.text ?? '').slice(0, 200)}\n`)
  else if (ev.type === 'error') process.stdout.write(`[agent:error] ${ev.error}\n`)
}

const createEmit = () => {
  const evalLog = process.env.AI_EVAL_LOG === '1'
  return (channel: string, ...args: unknown[]): void => {
    getMainWindow()?.webContents.send(channel, ...args)
    if (evalLog && channel === 'ai:stream') logEvalEvent(args[0] as AiStreamEvent)
  }
}

export { createEmit }
