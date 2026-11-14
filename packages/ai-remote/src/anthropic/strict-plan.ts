import type { LlmToolSpec } from '@jex/ai-contract'
import { STRICT_MAX_OPTIONAL, STRICT_MAX_TOOLS, STRICT_MAX_UNION } from './anthropic.constants'

interface SchemaCost {
  optional: number
  union: number
}

type Node = Record<string, unknown>

const isNode = (v: unknown): v is Node => typeof v === 'object' && v !== null && !Array.isArray(v)

// Counts optional parameters and unions, recursively. A union is an anyOf or an
// array-valued 'type'.
const costOf = (schema: unknown): SchemaCost => {
  const cost: SchemaCost = { optional: 0, union: 0 }
  if (!isNode(schema)) return cost
  const add = (c: SchemaCost): void => {
    cost.optional += c.optional
    cost.union += c.union
  }
  if (Array.isArray(schema.type)) cost.union += 1
  if (Array.isArray(schema.anyOf)) {
    cost.union += 1
    schema.anyOf.forEach((s) => add(costOf(s)))
  }
  if (isNode(schema.properties)) {
    const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : [])
    Object.entries(schema.properties).forEach(([name, s]) => {
      if (!required.has(name)) cost.optional += 1
      add(costOf(s))
    })
  }
  if (schema.items !== undefined) add(costOf(schema.items))
  return cost
}

// Picks the tools that get strict:true. Sensitive tools first, then the fewest
// optional parameters; a tool is added while the totals stay within the limits.
// Deterministic for a given tool list, so the request prefix stays cache-stable.
const planStrict = (tools: readonly LlmToolSpec[]): ReadonlySet<string> => {
  const ranked = tools
    .map((t, index) => ({ t, index, cost: costOf(t.inputSchema) }))
    .sort((a, b) => {
      if (a.t.sensitive !== b.t.sensitive) return a.t.sensitive ? -1 : 1
      return a.cost.optional - b.cost.optional || a.index - b.index
    })
  const chosen = new Set<string>()
  let optional = 0
  let union = 0
  for (const { t, cost } of ranked) {
    if (chosen.size >= STRICT_MAX_TOOLS) break
    if (optional + cost.optional > STRICT_MAX_OPTIONAL || union + cost.union > STRICT_MAX_UNION) continue
    chosen.add(t.name)
    optional += cost.optional
    union += cost.union
  }
  return chosen
}

export { planStrict }
