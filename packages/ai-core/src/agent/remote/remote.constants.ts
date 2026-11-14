/** Model calls (steps) allowed in one user turn. */
const MAX_STEPS = 30

/** Consecutive server-side pauses (pause_turn) allowed before the turn stops. */
const MAX_PAUSES = 3

const PROVIDER_LABEL: Record<string, string> = { anthropic: 'Anthropic', openai: 'OpenAI' }

export { MAX_STEPS, MAX_PAUSES, PROVIDER_LABEL }
