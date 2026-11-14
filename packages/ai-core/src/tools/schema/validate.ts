type Node = Record<string, unknown>
type Verdict = { ok: true; value: unknown } | { ok: false; errors: string[] }

const isNode = (v: unknown): v is Node => typeof v === 'object' && v !== null && !Array.isArray(v)

const fail = (path: string, msg: string): Verdict => ({ ok: false, errors: [`${path || '(root)'}: ${msg}`] })

const typeMatches = (type: string, value: unknown): boolean => {
  if (type === 'array') return Array.isArray(value)
  if (type === 'object') return isNode(value)
  if (type === 'null') return value === null
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value)
  return typeof value === type
}

const coerceNumber = (type: string, value: unknown): unknown => {
  if (typeof value !== 'string' || value.trim() === '') return value
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return type === 'integer' && !Number.isInteger(n) ? value : n
}

const checkEnum = (path: string, options: unknown[], value: unknown): Verdict => {
  if (options.includes(value)) return { ok: true, value }
  if (typeof value === 'string') {
    const hit = options.find((o) => typeof o === 'string' && o.toLowerCase() === value.toLowerCase())
    if (hit !== undefined) return { ok: true, value: hit }
  }
  return fail(path, `must be one of ${JSON.stringify(options)}`)
}

const join = (path: string, key: string): string => (path ? `${path}.${key}` : key)

const validateObject = (schema: Node, obj: Node, path: string): Verdict => {
  const errors: string[] = []
  const out: Node = { ...obj }
  const props = isNode(schema.properties) ? schema.properties : {}
  for (const key of Array.isArray(schema.required) ? (schema.required as string[]) : []) {
    if (obj[key] === undefined) errors.push(`${join(path, key)}: required`)
  }
  for (const [key, sub] of Object.entries(props)) {
    if (obj[key] === undefined) continue
    const v = validateAt(sub, obj[key], join(path, key))
    if (v.ok) out[key] = v.value
    else errors.push(...v.errors)
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: out }
}

const validateItems = (items: unknown, arr: unknown[], path: string): Verdict => {
  const errors: string[] = []
  const out = arr.map((item, i) => {
    const v = validateAt(items, item, `${path}[${i}]`)
    if (v.ok) return v.value
    errors.push(...v.errors)
    return item
  })
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: out }
}

const validateAt = (schema: unknown, value: unknown, path: string): Verdict => {
  if (!isNode(schema)) return { ok: true, value }
  if (Array.isArray(schema.anyOf)) {
    for (const branch of schema.anyOf) {
      const v = validateAt(branch, value, path)
      if (v.ok) return v
    }
    return fail(path, 'does not match any allowed shape')
  }
  let current = value
  const types = Array.isArray(schema.type) ? (schema.type as string[]) : typeof schema.type === 'string' ? [schema.type] : []
  if (types.length > 0 && !types.some((t) => typeMatches(t, current))) {
    const numeric = types.find((t) => t === 'number' || t === 'integer')
    if (numeric) current = coerceNumber(numeric, current)
    if (!types.some((t) => typeMatches(t, current))) return fail(path, `expected ${types.join(' or ')}`)
  }
  if (Array.isArray(schema.enum)) {
    const e = checkEnum(path, schema.enum, current)
    if (!e.ok) return e
    current = e.value
  }
  if (isNode(current) && (isNode(schema.properties) || Array.isArray(schema.required))) {
    return validateObject(schema, current, path)
  }
  if (Array.isArray(current) && schema.items !== undefined) return validateItems(schema.items, current, path)
  return { ok: true, value: current }
}

/**
 * Validate a parsed tool input against a tool's JSON schema (type, properties,
 * required, items, enum, anyOf; everything else is ignored). Numeric strings are
 * coerced to numbers and enum values to their canonical casing.
 */
const validate = (schema: Record<string, unknown>, value: unknown): Verdict => {
  return validateAt(schema, value, '')
}

export { validate }
export type { Verdict }
