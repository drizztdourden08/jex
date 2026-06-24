import type { Ref, UIEventHandler } from 'react'
import { Mascot } from '@ds/primitives/util/Mascot'
import { TurnTimeline } from '@ui/compounds/TurnTimeline'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import type { CommandSurfaceModel } from '../../behavior/useCommandSurface'

type ChatTimelineProps = {
  scrollRef: Ref<HTMLDivElement>
  onScroll: UIEventHandler<HTMLDivElement>
  isIntro: boolean
  busy: boolean
  messages: CommandSurfaceModel['messages']
  turn: CommandSurfaceModel['turn']
  working: CommandSurfaceModel['working']
  showWorkingDots: boolean
  phase: string
  elapsed: number
  decide: CommandSurfaceModel['decide']
}

const ChatTimeline = ({
  scrollRef,
  onScroll,
  isIntro,
  busy,
  messages,
  turn,
  working,
  showWorkingDots,
  phase,
  elapsed,
  decide,
}: ChatTimelineProps) => (
  <Box className="chat-scroll" ref={scrollRef} onScroll={onScroll}>
    {isIntro && (
      <Box className="chat-intro">
        <Mascot className="chat-intro-mascot" size={92} state={busy ? 'working' : 'idle'} />
        <Box as="p" className="muted chat-hint">
          Ask me about your library or tell me what to do — e.g. “show my unplayed co-op
          games”, “sort the library by Metacritic”, “open Steam family sharing settings”, or
          “launch Hades”. I’ll act in the app; ask me to “just tell me” to keep it in chat.
        </Box>
      </Box>
    )}

    {messages.map((m, i) =>
      m.role === 'user' ? (
        <Box key={i} className="chat-msg user">
          <Box className="chat-bubble">{m.content.trim()}</Box>
        </Box>
      ) : (
        <Box key={i} className="chat-msg assistant">
          {m.parts ? (
            <TurnTimeline parts={m.parts} live={false} />
          ) : (
            m.content.trim() && <Box className="chat-text">{m.content.trim()}</Box>
          )}
          {m.durationMs != null && (
            <Box className="chat-meta">took {(m.durationMs / 1000).toFixed(1)}s</Box>
          )}
        </Box>
      ),
    )}

    {turn && (
      <Box className="chat-msg assistant">
        <TurnTimeline parts={turn.parts} live={true} />
        {working && showWorkingDots ? (
          <Box as="span" className="thinking">
            <Box as="span" className="dot" />
            <Box as="span" className="dot" />
            <Box as="span" className="dot" />
            <Box as="span" className="muted" style={{ marginLeft: 6 }}>
              {phase}…{elapsed >= 2 ? ` ${elapsed}s` : ''}
            </Box>
          </Box>
        ) : null}

        {turn.confirm && (
          <Box className="confirm-card">
            <Box className="confirm-summary">{turn.confirm.summary}</Box>
            <Box className="row" style={{ gap: 8, marginTop: 8 }}>
              <Button size="slim" onClick={() => void decide(turn.confirm!.callId, 'once')}>Allow once</Button>
              <Button size="slim" variant="secondary" onClick={() => void decide(turn.confirm!.callId, 'always')}>
                Always allow
              </Button>
              <Button size="slim" variant="secondary" onClick={() => void decide(turn.confirm!.callId, 'deny')}>
                Deny
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    )}
  </Box>
)

export { ChatTimeline }
export type { ChatTimelineProps }
