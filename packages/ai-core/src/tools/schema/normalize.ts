import { STRIPPED_KEYWORDS, SCHEMA_MAP_KEYS, SCHEMA_LIST_KEYS, SCHEMA_SINGLE_KEYS } from './schema.constants'

type Node = Record<string, unknown>

const isNode = (v: unknown): v is Node => typeof v === 'object' && v !== null && !Array.isArray(v)

const normalizeNode = (schema: unknown): unknown => {
  if (!isNode(schema)) return schema
  const out: Node = {}
  for (const [key, value] of Object.entries(schema)) {
    if (STRIPPED_KEYWORDS.includes(key)) continue
    const outKey = key === 'oneOf' ? 'anyOf' : key
    if (SCHEMA_MAP_KEYS.includes(key) && isNode(value)) {
      out[outKey] = Object.fromEntries(Object.entries(value).map(([name, sub]) => [name, normalizeNode(sub)]))
    } else if (SCHEMA_LIST_KEYS.includes(key) && Array.isArray(value)) {
      out[outKey] = value.map(normalizeNode)
    } else if (SCHEMA_SINGLE_KEYS.includes(key)) {
      out[outKey] = normalizeNode(value)
    } else {
      out[outKey] = value
    }
  }
  if (out.type === 'object') out.additionalProperties = false
  const options = out.enum
  if (out.type === undefined && Array.isArray(options) && options.length > 0 && options.every((v) => typeof v === 'string')) {
    out.type = 'string'
  }
  return out
}

/**
 * Make a tool's JSON schema safe for strict provider APIs: objects forbid extra
 * properties, oneOf becomes anyOf, unsupported keywords are dropped and a bare string
 * enum gets its type. Pure; never mutates the input.
 */
const normalizeSchema = (schema: Record<string, unknown>): Record<string, unknown> => {
  return normalizeNode(schema) as Record<string, unknown>
}

export { normalizeSchema }
