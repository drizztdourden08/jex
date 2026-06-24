import type { Ref } from 'react'
import { Mascot } from '@ds/primitives/util/Mascot'
import { Box } from '@ds/primitives/layout/Box'
import { Glyph } from '@ds/primitives/media/Glyph'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { TextInput } from '@ds/primitives/form/TextInput'
import type { CommandSurfaceModel } from '../../behavior/useCommandSurface'

type ChatInputProps = {
  isIntro: boolean
  working: CommandSurfaceModel['working']
  inputRef: Ref<HTMLInputElement>
  prompt: string
  setPrompt: (value: string) => void
  submit: () => void
  cancel: () => void
  ready: boolean
  busy: boolean
}

const ChatInput = ({
  isIntro,
  working,
  inputRef,
  prompt,
  setPrompt,
  submit,
  cancel,
  ready,
  busy,
}: ChatInputProps) => (
  <Box className="row chat-input" style={{ gap: 8 }}>
    {!isIntro && (
      <Mascot
        className="chat-dock-mascot"
        size={42}
        state={working ? 'working' : 'sleeping'}
        title={working ? 'Working…' : 'Resting'}
      />
    )}
    <Box className="chat-input-field">
      <TextInput
        ref={inputRef}
        value={prompt}
        onChange={(e) => setPrompt(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Message the assistant…"
        // Stay enabled while the assistant works so the field keeps focus (a disabled
        // input blurs) and the user can type the next message; submit() guards `busy`.
        disabled={!ready}
      />
      {busy ? (
        <IconButton label="Stop generating" className="chat-glyph chat-send" onClick={cancel}>
          <Glyph name="stop" size={16} />
        </IconButton>
      ) : (
        <IconButton label="Send" className="chat-glyph chat-send" onClick={submit} disabled={!ready || !prompt.trim()}>
          <Glyph name="send" size={18} />
        </IconButton>
      )}
    </Box>
  </Box>
)

export { ChatInput }
export type { ChatInputProps }
