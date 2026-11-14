/** Keywords providers reject or ignore in strict tool schemas; checked client-side instead. */
const STRIPPED_KEYWORDS: readonly string[] = [
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minLength',
  'maxLength',
  'minItems',
  'maxItems',
  'uniqueItems',
  'pattern',
  'format',
]

/** Keys whose value is a map of name -> sub-schema (the names are never keywords). */
const SCHEMA_MAP_KEYS: readonly string[] = ['properties', '$defs', 'definitions']

/** Keys whose value is a list of sub-schemas. */
const SCHEMA_LIST_KEYS: readonly string[] = ['anyOf', 'oneOf', 'allOf', 'prefixItems']

/** Keys whose value is a single sub-schema. */
const SCHEMA_SINGLE_KEYS: readonly string[] = ['items', 'additionalProperties']

export { STRIPPED_KEYWORDS, SCHEMA_MAP_KEYS, SCHEMA_LIST_KEYS, SCHEMA_SINGLE_KEYS }
