import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  OverloadedError,
  PermissionDeniedError,
  RateLimitError,
} from '@anthropic-ai/sdk'
import type { LlmFailure, LlmFailureKind } from '@jex/ai-contract'
import type { StepCtx } from '../remote-llm.types'
import { scrub } from '../scrub'

const parseRetryAfter = (e: RateLimitError): number | undefined => {
  const n = Number(e.headers?.get?.('retry-after'))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

const kindOf = (e: unknown): LlmFailureKind => {
  if (e instanceof APIUserAbortError) return 'aborted'
  if (e instanceof AuthenticationError || e instanceof PermissionDeniedError) return 'auth'
  if (e instanceof RateLimitError) return 'rate_limit'
  if (e instanceof APIConnectionError || e instanceof APIConnectionTimeoutError) return 'network'
  if (e instanceof OverloadedError) return 'overloaded'
  if (e instanceof APIError && (e.status === 529 || (e.type as string | null) === 'overloaded_error')) return 'overloaded'
  if (e instanceof BadRequestError) return 'bad_request'
  return 'unknown'
}

const messageOf = (e: unknown, kind: LlmFailureKind): string => {
  if (kind === 'auth') return 'Anthropic rejected the API key.'
  if (kind === 'aborted') return 'Cancelled.'
  if (kind === 'network') return 'Could not reach Anthropic.'
  if (kind === 'overloaded') return 'Anthropic is overloaded.'
  if (kind === 'rate_limit') return 'Rate-limited by Anthropic.'
  if (e instanceof APIError) return e.apiMessage ?? e.message
  return e instanceof Error ? e.message : 'Unexpected error from Anthropic.'
}

// Maps any thrown value to an LlmFailure. Logs provider, kind, status and request id only.
const toFailure = (e: unknown, ctx: Pick<StepCtx, 'key' | 'signal' | 'log'>): LlmFailure => {
  const kind = ctx.signal.aborted ? 'aborted' : kindOf(e)
  const status = e instanceof APIError ? e.status : undefined
  const requestId = e instanceof APIError ? e.requestID : undefined
  ctx.log('remote llm failure', { provider: 'anthropic', kind, status, requestId })
  const failure: LlmFailure = { kind, provider: 'anthropic', message: scrub(messageOf(e, kind), ctx.key) }
  if (e instanceof RateLimitError) {
    const retryAfterSec = parseRetryAfter(e)
    if (retryAfterSec !== undefined) failure.retryAfterSec = retryAfterSec
  }
  return failure
}

export { toFailure }
