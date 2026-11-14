import type { FunctionTool } from 'openai/resources/responses/responses'
import type { LlmToolSpec } from '@jex/ai-contract'

// strict:false — OpenAI strict mode demands every property required and no optional
// fields; the engine validates tool input itself, so the tools stay as declared.
const toFunctionTools = (specs: readonly LlmToolSpec[]): FunctionTool[] =>
  specs.map((spec): FunctionTool => ({
    type: 'function',
    name: spec.name,
    description: spec.description,
    parameters: spec.inputSchema,
    strict: false,
  }))

export { toFunctionTools }
