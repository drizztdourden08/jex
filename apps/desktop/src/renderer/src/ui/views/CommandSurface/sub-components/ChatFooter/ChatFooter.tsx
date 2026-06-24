import type { ContextLevel, ContextStatus, PermissionMode } from '@shared/agent'
import type { AiModelOption } from '@shared/ai'
import { Select } from '@ds/primitives/form/Select'
import { Box } from '@ds/primitives/layout/Box'
import { PERM_OPTIONS, CTX_OPTIONS, fmtTokens } from './ChatFooter.constants'

type ChatFooterProps = {
  permMode: PermissionMode
  changePermMode: (mode: PermissionMode) => void
  ctx: ContextStatus | null
  ready: boolean
  installed: AiModelOption[]
  active: AiModelOption | null
  switchModel: (id: string) => void
  busy: boolean
  ctxLevel: ContextLevel
  changeContextLevel: (level: ContextLevel) => void
}

const ChatFooter = ({
  permMode,
  changePermMode,
  ctx,
  ready,
  installed,
  active,
  switchModel,
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
      {ctx && (
        <Box as="span" className="chat-ctx-meter" title={`${ctx.usedTokens} / ${ctx.contextSize} tokens used`}>
          <Box as="span" className="chat-ctx-bar">
            <Box
              as="span"
              style={{ width: `${Math.min(100, Math.round((ctx.usedTokens / ctx.contextSize) * 100))}%` }}
            />
          </Box>
          <Box as="span" className="muted">
            {fmtTokens(ctx.usedTokens)}/{fmtTokens(ctx.contextSize)}
          </Box>
        </Box>
      )}
      {ready && installed.length > 0 && (
        <Select
          value={active!.id}
          options={installed.map((m) => ({ value: m.id, label: m.label }))}
          onChange={(id) => void switchModel(id)}
          disabled={busy}
          title="Model used for this chat"
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
