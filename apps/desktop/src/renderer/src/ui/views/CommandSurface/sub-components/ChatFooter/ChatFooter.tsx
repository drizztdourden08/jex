import type { ContextLevel, ContextStatus, PermissionMode } from '@shared/agent'
import type { RemoteEffort } from '@shared/remote-ai'
import { Select } from '@ds/primitives/form/Select'
import type { SelectGroup } from '@ds/primitives/form/Select'
import { Box } from '@ds/primitives/layout/Box'
import { ContextMeter } from './sub-components/ContextMeter'
import { PERM_GROUPS, CTX_GROUPS, EFFORT_GROUPS } from './ChatFooter.constants'

type ChatFooterProps = {
  permMode: PermissionMode
  changePermMode: (mode: PermissionMode) => void
  ctx: ContextStatus | null
  ready: boolean
  modelGroups: SelectGroup[]
  activeModel: { value: string; label: string; remote: boolean } | null
  switchModel: (id: string) => void
  effort: RemoteEffort
  changeEffort: (effort: RemoteEffort) => void
  busy: boolean
  ctxLevel: ContextLevel
  changeContextLevel: (level: ContextLevel) => void
}

// One quiet row of plain-text pickers (model · effort or context · permissions · meter):
// each reads as text and only becomes a dropdown when clicked. The open menu's header
// names the field. The model picker shows whenever any model exists, even when none
// is active yet, so the user can always choose one.
const ChatFooter = ({
  permMode,
  changePermMode,
  ctx,
  modelGroups,
  activeModel,
  switchModel,
  effort,
  changeEffort,
  busy,
  ctxLevel,
  changeContextLevel,
}: ChatFooterProps) => (
  <Box className="chat-foot">
    {modelGroups.length > 0 && (
      <Select
        value={activeModel?.value ?? ''}
        groups={modelGroups}
        placeholder="Choose a model"
        onChange={(id) => void switchModel(id)}
        disabled={busy}
        title="Model for this chat"
        triggerBare
        triggerClass="chat-pick chat-pick--model"
      />
    )}
    {activeModel?.remote && (
      <Select
        value={effort}
        groups={EFFORT_GROUPS}
        onChange={(e) => void changeEffort(e)}
        disabled={busy}
        title="Reasoning effort for this chat (higher = more thinking, slower and costlier)"
        triggerBare
        triggerClass="chat-pick chat-pick--dim"
      />
    )}
    {/* Context size sizes the local llama context only; a cloud model's window is fixed. */}
    {activeModel && !activeModel.remote && (
      <Select
        value={ctxLevel}
        groups={CTX_GROUPS}
        onChange={(l) => void changeContextLevel(l)}
        disabled={busy}
        title="Context size for this session (larger = more memory + history, slower; clears the chat)"
        triggerBare
        triggerClass="chat-pick chat-pick--dim"
      />
    )}
    <Select
      value={permMode}
      groups={PERM_GROUPS}
      onChange={(m) => void changePermMode(m)}
      title="Tool permissions for THIS chat (doesn't change your saved settings). Normal = saved rules · Ask = confirm everything · Allow all = no prompts."
      triggerBare
      triggerClass={`chat-pick perm-${permMode}`}
    />
    {ctx && <ContextMeter used={ctx.usedTokens} size={ctx.contextSize} />}
  </Box>
)

export { ChatFooter }
export type { ChatFooterProps }
