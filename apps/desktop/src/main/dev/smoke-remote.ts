import { app } from 'electron'
import { initEngine } from '../ai-host'
import { requireEngine } from '../ai-host/engine'
import { onAiStream } from '../ai-host/stream-tap'
import { listAdded } from '../ai-remote/added'
import { keyStatus } from '../ai-remote/keys'
import { parseModelRef } from '@shared/remote-ai'

/**
 * Dev probe (SMOKE_REMOTE=1): one remote-chat turn end to end, no renderer. Waits for the
 * engine load (initEngine is memoized, so this awaits the launch's own promise), picks
 * SMOKE_REMOTE_MODEL or the first added remote model whose provider has a key, activates it
 * as ai:setModel does, then runs SMOKE_PROMPT through the engine's chatTurn (the same call
 * as the ai:chatTurn IPC handler), auto-approving confirm requests. Never logs keys.
 */

const DEFAULT_PROMPT = 'How many games are in my library?'

const pickModel = (): string => {
  const wanted = process.env.SMOKE_REMOTE_MODEL
  if (wanted) return wanted
  const status = keyStatus()
  const hit = listAdded().find((ref) => {
    const parsed = parseModelRef(ref)
    return parsed != null && status[parsed.provider].present
  })
  if (!hit) throw new Error('no added remote model has a provider key')
  return hit
}

const smokeRemote = (): void => {
  void (async () => {
    const stop = onAiStream((ev) => {
      if (ev.type === 'tool-call') console.log(`[main] smoke remote tool → ${ev.name}`)
      else if (ev.type === 'confirm') requireEngine().confirm(ev.callId, 'once')
    })
    try {
      await initEngine()
      const engine = requireEngine()
      const ref = pickModel()
      console.log(`[main] smoke remote model → ${ref}`)
      await engine.setModel(ref)
      engine.resetChat()
      let reply = ''
      let failure: string | null = null
      const stopTurn = onAiStream((ev) => {
        if (ev.turnId !== 'smoke-remote') return
        if (ev.type === 'done') reply = ev.text
        else if (ev.type === 'error') failure = ev.error
      })
      try {
        await engine.chatTurn('smoke-remote', process.env.SMOKE_PROMPT || DEFAULT_PROMPT)
      } finally {
        stopTurn()
      }
      if (failure) console.error(`[main] smoke remote error → ${failure}`)
      else console.log(`[main] smoke remote reply → ${reply}`)
    } catch (e) {
      console.error(`[main] smoke remote error → ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      stop()
      app.quit()
    }
  })()
}

export { smokeRemote }
