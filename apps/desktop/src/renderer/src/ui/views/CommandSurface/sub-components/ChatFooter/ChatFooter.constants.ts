import type { ContextLevel, PermissionMode } from '@shared/agent'
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

const fmtTokens = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`

export { PERM_OPTIONS, CTX_OPTIONS, fmtTokens }
