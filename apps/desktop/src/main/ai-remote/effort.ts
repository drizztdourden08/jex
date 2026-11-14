import type { RemoteEffort } from '@shared/remote-ai'
import { settings } from '../settings'

const EFFORT_KEY = 'aiRemoteEffort'
const EFFORTS: readonly RemoteEffort[] = ['low', 'medium', 'high']

const getEffort = (): RemoteEffort => {
  const v = settings.get(EFFORT_KEY) as unknown
  return EFFORTS.includes(v as RemoteEffort) ? (v as RemoteEffort) : 'medium'
}

const setEffort = (effort: RemoteEffort): void => {
  if (!EFFORTS.includes(effort)) return
  settings.set(EFFORT_KEY, effort)
}

export { getEffort, setEffort }
