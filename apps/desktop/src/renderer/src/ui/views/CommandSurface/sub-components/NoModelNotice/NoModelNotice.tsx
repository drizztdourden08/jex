import { Mascot } from '@ds/primitives/util/Mascot'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type NoModelNoticeProps = {
  onOpenSettings: () => void
}

const NoModelNotice = ({ onOpenSettings }: NoModelNoticeProps) => (
  <Box className="chat-scroll">
    <Box className="chat-intro cmd-no-model">
      <Mascot className="chat-intro-mascot" size={92} state="idle" />
      <Box className="cmd-no-model-body">
        <Box as="p" className="muted chat-hint">
          To use the assistant, download a local model (it runs entirely on your PC) or add an API key in Settings to use a remote model.
        </Box>
        <Button variant="primary" onClick={onOpenSettings}>Open Settings</Button>
      </Box>
    </Box>
  </Box>
)

export { NoModelNotice }
export type { NoModelNoticeProps }
