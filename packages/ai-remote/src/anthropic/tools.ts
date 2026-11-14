import type { BetaTool, BetaToolUnion } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { LlmToolSpec } from '@jex/ai-contract'

// The API requires an object input schema; anything else is wrapped.
const asInputSchema = (schema: Record<string, unknown>): BetaTool.InputSchema =>
  schema.type === 'object'
    ? (schema as BetaTool.InputSchema)
    : { type: 'object', properties: {}, ...schema, type: 'object' }

const toBetaTools = (specs: readonly LlmToolSpec[], strict: ReadonlySet<string>): BetaToolUnion[] =>
  specs.map((spec): BetaTool => ({
    name: spec.name,
    description: spec.description,
    input_schema: asInputSchema(spec.inputSchema),
    eager_input_streaming: true,
    ...(strict.has(spec.name) ? { strict: true } : {}),
  }))

export { toBetaTools }
