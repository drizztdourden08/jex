import type { LlmToolSpec } from '@jex/ai-contract'
import { enabledTools } from '../../tools'
import { normalizeSchema } from '../../tools/schema'

/** The enabled tools as provider-safe specs (schemas normalized, order = registry order). */
const buildToolSpecs = (): LlmToolSpec[] =>
  enabledTools().map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: normalizeSchema(tool.params as unknown as Record<string, unknown>),
    sensitive: tool.sensitivity === 'sensitive',
  }))

export { buildToolSpecs }
