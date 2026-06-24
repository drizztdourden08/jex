import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AiModelOption } from '@shared/ai'
import type { ContextStatus, ContextLevel, PermissionMode } from '@shared/agent'
import { useAiDrawer } from '@/store/aiDrawer'
import { useChat } from '@/store/chat'
import { transcriptText } from '@/lib/chat/transcript'

const useCommandSurface = () => {
  const { open, setOpen, toggle } = useAiDrawer()
  const { messages, turn, busy, send, decide, cancel, newChat } = useChat()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const [prompt, setPrompt] = useState('')
  const [models, setModels] = useState<AiModelOption[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [ctx, setCtx] = useState<ContextStatus | null>(null)
  const [ctxLevel, setCtxLevel] = useState<ContextLevel>('high')
  const [permMode, setPermMode] = useState<PermissionMode>('default')
  const [copied, setCopied] = useState(false)

  const navigate = useNavigate()
  const installed = models.filter((m) => m.installed)
  // "Ready" means the active model is actually downloaded — the saved default may
  // point at a model the user never fetched, which must NOT read as ready.
  const active = installed.find((m) => m.active) ?? null
  const ready = !!active

  const refreshModels = async () => {
    setModels(await window.api.ai.listModels())
  }
  const refreshContext = async () => {
    setCtx(await window.api.ai.contextStatus().catch(() => null))
  }

  useEffect(() => {
    if (!open) return
    void refreshModels()
    void refreshContext()
    window.api.ai.getContextLevel().then(setCtxLevel).catch(() => {})
    window.api.ai.getPermissionMode().then(setPermMode).catch(() => {})
    void window.api.ai.warmup().catch(() => {})
    stick.current = true
    setTimeout(() => {
      inputRef.current?.focus()
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }, 60)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  useEffect(() => {
    if (!busy) {
      setElapsed(0)
      return
    }
    const t0 = Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 250)
    return () => clearInterval(id)
  }, [busy])

  useEffect(() => {
    const el = scrollRef.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [messages, turn])

  const onScroll = () => {
    const el = scrollRef.current
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  useEffect(() => {
    if (open && !busy) void refreshContext()
  }, [busy, open, messages.length])

  const changeContextLevel = async (level: ContextLevel) => {
    setCtxLevel(level)
    await window.api.ai.setContextLevel(level)
    await refreshContext()
  }
  const changePermMode = async (mode: PermissionMode) => {
    setPermMode(mode)
    await window.api.ai.setPermissionMode(mode)
  }
  const submit = () => {
    if (!prompt.trim() || busy) return
    void send(prompt)
    setPrompt('')
    // Keep the caret in the field after a click-send (Enter-send never leaves it).
    inputRef.current?.focus()
  }
  const copyTranscript = () => {
    void navigator.clipboard.writeText(transcriptText(messages)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  const switchModel = async (id: string) => {
    await window.api.ai.setModel(id)
    await window.api.ai.resetChat()
    await refreshModels()
  }

  const working = turn && busy
  const lastPart = turn?.parts[turn.parts.length - 1]
  const toolRunning = lastPart?.kind === 'tool' && lastPart.status === 'running'
  const phase = toolRunning ? 'Working' : 'Thinking'
  // Show the "…thinking/working" dots only when nothing is actively streaming —
  // i.e. before the first output, or while waiting on a running tool call.
  const showWorkingDots = !lastPart || lastPart.kind === 'tool'
  // The empty greeting state vs. an active conversation; drives where the mascot lives.
  const isIntro = messages.length === 0 && !turn

  return {
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
  }
}

type CommandSurfaceModel = ReturnType<typeof useCommandSurface>

export { useCommandSurface }
export type { CommandSurfaceModel }
