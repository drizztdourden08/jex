import type { ContextLevel, PermissionMode } from '@shared/agent'
import type { RemoteEffort } from '@shared/remote-ai'
import type { SelectOption } from '@ds/primitives/form/Select'

const PERM_OPTIONS: SelectOption<PermissionMode>[] = [
  { value: 'default', label: 'Normal', triggerClass: 'perm-normal' },
  { value: 'ask', label: 'Ask', triggerClass: 'perm-ask' },
  { value: 'allow', label: 'Allow all', triggerClass: 'perm-allow' },
]
const CTX_OPTIONS: SelectOption<ContextLevel>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]
// Labelled so it reads apart from the context-size select beside it.
const EFFORT_OPTIONS: SelectOption<RemoteEffort>[] = [
  { value: 'low', label: 'Effort: low' },
  { value: 'medium', label: 'Effort: medium' },
  { value: 'high', label: 'Effort: high' },
]

const fmtTokens = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`

export { PERM_OPTIONS, CTX_OPTIONS, EFFORT_OPTIONS, fmtTokens }
