import type { ContextStatus } from '@shared/agent'

interface ContextMeterProps {
  /** Null before the first status arrives; the ring then shows its empty track. */
  ctx: ContextStatus | null
}

export type { ContextMeterProps }
