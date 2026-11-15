// After a remote model is added: make it the active one when no usable model is active
// (the active id is unset, stale, or a remote model that lost its key).
import { isRemoteRef, parseModelRef } from '@shared/remote-ai'
import { getEngine } from '../ai-host/engine'
import { keyStatus } from './keys'
import { listAdded } from './added'

const hasKey = (ref: string): boolean => {
  const parsed = parseModelRef(ref)
  return parsed != null && keyStatus()[parsed.provider].present
}

const activateIfNoUsable = async (ref: string): Promise<void> => {
  const engine = getEngine()
  if (!engine || !hasKey(ref)) return
  const active = engine.modelStatus().activeModelId
  const usable =
    active != null &&
    (isRemoteRef(active)
      ? listAdded().includes(active) && hasKey(active)
      : engine.listModels().some((m) => m.id === active && m.installed))
  if (usable) return
  try {
    await engine.setModel(ref)
    engine.resetChat()
  } catch {
    // The model stays added; the picker shows which model is really active.
  }
}

export { activateIfNoUsable }
