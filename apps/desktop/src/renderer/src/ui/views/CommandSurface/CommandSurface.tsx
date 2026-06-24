import './CommandSurface.css'
import { Box } from '@ds/primitives/layout/Box'
import { useCommandSurface } from './behavior/useCommandSurface'
import { CommandTopbar } from './sub-components/CommandTopbar'
import { NoModelNotice } from './sub-components/NoModelNotice'
import { ChatTimeline } from './sub-components/ChatTimeline'
import { ChatInput } from './sub-components/ChatInput'
import { ChatFooter } from './sub-components/ChatFooter'

/**
 * The AI command surface — ONE element that morphs between two states:
 *   collapsed → a pill in the titlebar ("Ask your library…"),
 *   open      → the full chat drawer.
 * It's `position: fixed` and CSS-transitions its own width/height/radius, so the
 * pill physically expands into the drawer (a true shared-element morph, not two
 * separate widgets). Toggled by Ctrl/Cmd+K (Layout) or the ⌄/✕ in the topbar.
 */

const CommandSurface = () => {
  const {
    open,
    setOpen,
    toggle,
    messages,
    turn,
    busy,
    decide,
    cancel,
    newChat,
    inputRef,
    scrollRef,
    prompt,
    setPrompt,
    installed,
    active,
    ready,
    ctx,
    ctxLevel,
    permMode,
    copied,
    elapsed,
    navigate,
    onScroll,
    changeContextLevel,
    changePermMode,
    submit,
    copyTranscript,
    switchModel,
    working,
    phase,
    showWorkingDots,
    isIntro,
  } = useCommandSurface()

  return (
    <>
      {open && <Box className="ai-scrim" onClick={() => setOpen(false)} />}
      <Box className={`cmd-surface${open ? ' open' : ''}`} role="dialog" aria-label="AI assistant">
        <Box className="cmd-topedge" />

        {/* The morphing top strip: pill text when collapsed, header when open. */}
        <CommandTopbar
          open={open}
          setOpen={setOpen}
          toggle={toggle}
          working={working}
          messages={messages}
          busy={busy}
          copied={copied}
          copyTranscript={copyTranscript}
          newChat={newChat}
        />

        {/* Body: present always (so the morph is one element); shown only when open. */}
        <Box className="cmd-body">
          {!ready ? (
            <NoModelNotice
              onOpenSettings={() => {
                setOpen(false)
                navigate('/settings')
              }}
            />
          ) : (
            <>
              <ChatTimeline
                scrollRef={scrollRef}
                onScroll={onScroll}
                isIntro={isIntro}
                busy={busy}
                messages={messages}
                turn={turn}
                working={working}
                showWorkingDots={showWorkingDots}
                phase={phase}
                elapsed={elapsed}
                decide={decide}
              />

              <ChatInput
                isIntro={isIntro}
                working={working}
                inputRef={inputRef}
                prompt={prompt}
                setPrompt={setPrompt}
                submit={submit}
                cancel={cancel}
                ready={ready}
                busy={busy}
              />

              <ChatFooter
                permMode={permMode}
                changePermMode={changePermMode}
                ctx={ctx}
                ready={ready}
                installed={installed}
                active={active}
                switchModel={switchModel}
                busy={busy}
                ctxLevel={ctxLevel}
                changeContextLevel={changeContextLevel}
              />
            </>
          )}
        </Box>
      </Box>
    </>
  )
}

export { CommandSurface }
