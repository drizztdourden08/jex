import type { ContextLevel, ContextStatus, PermissionMode } from '@shared/agent'
import type { RemoteEffort } from '@shared/remote-ai'
import { Select } from '@ds/primitives/form/Select'
import type { SelectGroup } from '@ds/primitives/form/Select'
import { Box } from '@ds/primitives/layout/Box'
import { ContextMeter } from './sub-components/ContextMeter'
import { PERM_OPTIONS, CTX_OPTIONS, EFFORT_OPTIONS } from './ChatFooter.constants'

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

const ChatFooter = ({
  permMode,
  changePermMode,
  ctx,
  ready,
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
    <Select
      value={permMode}
      options={PERM_OPTIONS}
      onChange={(m) => void changePermMode(m)}
      triggerClass="perm-tag"
      variant="ghost"
      placement="top"
      title="Tool permissions for THIS chat (doesn't change your saved settings). Normal = saved rules · Ask = confirm everything · Allow all = no prompts."
    />
    <Box className="chat-foot-right">
      {ctx && <ContextMeter used={ctx.usedTokens} size={ctx.contextSize} />}
      {ready && activeModel && modelGroups.length > 0 && (
        <Select
          value={activeModel.value}
          groups={modelGroups}
          onChange={(id) => void switchModel(id)}
          disabled={busy}
          title="Model used for this chat"
          variant="ghost"
          placement="top"
          align="end"
        />
      )}
      {ready && activeModel?.remote && (
        <Select
          value={effort}
          options={EFFORT_OPTIONS}
          onChange={(e) => void changeEffort(e)}
          disabled={busy}
          title="Reasoning effort for this chat (higher = more thinking, slower and costlier)"
          variant="ghost"
          placement="top"
          align="end"
        />
      )}
      <Select
        value={ctxLevel}
        options={CTX_OPTIONS}
        onChange={(l) => void changeContextLevel(l)}
        disabled={busy}
        title="Context window size for this session (larger = more memory + history, slower; clears the chat)"
        variant="ghost"
        placement="top"
        align="end"
      />
    </Box>
  </Box>
)

export { ChatFooter }
export type { ChatFooterProps }
