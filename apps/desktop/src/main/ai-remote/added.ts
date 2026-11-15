// The remote models the user added to their installed list (a persisted choice, like a
// downloaded local model). Refs only ('anthropic/claude-opus-5-5'); never a key.
import { isRemoteRef } from '@shared/remote-ai'
import { settings } from '../settings'

const ADDED_KEY = 'aiRemoteAdded'

const readStored = (): string[] | null => {
  const v = settings.get(ADDED_KEY) as unknown
  return Array.isArray(v) ? v.filter((r): r is string => typeof r === 'string' && isRemoteRef(r)) : null
}

const write = (refs: string[]): string[] => {
  const unique = [...new Set(refs)]
  settings.set(ADDED_KEY, unique)
  return unique
}

// First read ever: seed with the active model when it is remote, so a model chosen
// before this list existed stays in the installed set.
const listAdded = (activeRef?: string | null): string[] => {
  const stored = readStored()
  if (stored) return stored
  return write(isRemoteRef(activeRef) && activeRef ? [activeRef] : [])
}

const addRemote = (ref: string): string[] => {
  if (!isRemoteRef(ref)) throw new Error('Unknown model reference.')
  return write([...listAdded(), ref])
}

const removeRemote = (ref: string): string[] => write(listAdded().filter((r) => r !== ref))

export { listAdded, addRemote, removeRemote }
