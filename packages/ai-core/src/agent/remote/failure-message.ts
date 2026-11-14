import type { LlmFailure } from '@jex/ai-contract'
import { PROVIDER_LABEL } from './remote.constants'

/** Turn a provider failure into text for the user. Never includes a key. */
const failureMessage = (failure: LlmFailure): string => {
  const who = PROVIDER_LABEL[failure.provider] ?? failure.provider
  switch (failure.kind) {
    case 'auth':
      return `${who} rejected the API key. Check it in Settings.`
    case 'rate_limit':
      return failure.retryAfterSec
        ? `Rate-limited by ${who}. Try again in ${failure.retryAfterSec} s.`
        : `Rate-limited by ${who}. Try again in a moment.`
    case 'overloaded':
      return `${who} is overloaded right now. Try again in a moment.`
    case 'network':
      return `Could not reach ${who}. Check your connection and try again.`
    case 'bad_request':
      return `${who} could not process that request: ${failure.message}`
    case 'aborted':
      return 'Cancelled.'
    default:
      return `${who} returned an error: ${failure.message}`
  }
}

export { failureMessage }
