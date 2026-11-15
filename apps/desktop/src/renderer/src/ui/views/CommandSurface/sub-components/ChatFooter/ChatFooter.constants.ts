import type { ContextLevel, PermissionMode } from '@shared/agent'
import type { RemoteEffort } from '@shared/remote-ai'
import type { SelectGroup } from '@ds/primitives/form/Select'

// Each footer picker is plain text when closed; the group label heads its open menu
// so the field is named where the choice is made.
const PERM_GROUPS: SelectGroup<PermissionMode>[] = [
  {
    label: 'Tool permissions',
    options: [
      { value: 'default', label: 'Normal' },
      { value: 'ask', label: 'Ask' },
      { value: 'allow', label: 'Allow all' },
    ],
  },
]
const CTX_GROUPS: SelectGroup<ContextLevel>[] = [
  {
    label: 'Context size',
    options: [
      { value: 'low', label: 'Low context' },
      { value: 'medium', label: 'Medium context' },
      { value: 'high', label: 'High context' },
    ],
  },
]
const EFFORT_GROUPS: SelectGroup<RemoteEffort>[] = [
  {
    label: 'Reasoning effort',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
]

const fmtTokens = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`

export { PERM_GROUPS, CTX_GROUPS, EFFORT_GROUPS, fmtTokens }
