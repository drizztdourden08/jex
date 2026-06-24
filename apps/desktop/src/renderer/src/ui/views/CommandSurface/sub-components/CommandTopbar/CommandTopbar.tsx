import { Mascot } from '@ds/primitives/util/Mascot'
import { Box } from '@ds/primitives/layout/Box'
import { Glyph } from '@ds/primitives/media/Glyph'
import { IconButton } from '@ds/primitives/actions/IconButton'
import type { CommandSurfaceModel } from '../../behavior/useCommandSurface'

type CommandTopbarProps = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  working: CommandSurfaceModel['working']
  messages: CommandSurfaceModel['messages']
  busy: boolean
  copied: boolean
  copyTranscript: () => void
  newChat: () => Promise<void>
}

const CommandTopbar = ({
  open,
  setOpen,
  toggle,
  working,
  messages,
  busy,
  copied,
  copyTranscript,
  newChat,
}: CommandTopbarProps) => (
  <Box className="cmd-topbar" onClick={() => !open && setOpen(true)}>
    {!open && (
      <Mascot
        className="cmd-spark"
        size={24}
        state={working ? 'working' : 'static'}
        title="Assistant"
      />
    )}
    {open ? (
      <>
        <Box as="span" className="cmd-title">Assistant</Box>
        {messages.length > 0 && (
          <IconButton
            label={copied ? 'Copied' : 'Copy conversation'}
            title="Copy the whole conversation"
            className="chat-glyph chat-copy"
            onClick={copyTranscript}
            disabled={busy}
          >
            <Glyph name={copied ? 'check' : 'copy'} size={17} />
          </IconButton>
        )}
        <IconButton
          label="New chat"
          title="New chat"
          className="chat-glyph chat-newchat"
          onClick={() => void newChat()}
          disabled={busy}
        >
          <Glyph name="compose" size={18} />
        </IconButton>
      </>
    ) : (
      <>
        <Box as="span" className="cmd-placeholder">Ask your library…</Box>
        <Box as="span" className="kbd">Ctrl K</Box>
      </>
    )}
    {open && (
      <IconButton
        label="Close chat"
        className="cmd-x"
        title="Close chat"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
      >
        ✕
      </IconButton>
    )}
  </Box>
)

export { CommandTopbar }
export type { CommandTopbarProps }
