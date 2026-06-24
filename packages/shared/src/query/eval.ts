/**
 * Pure evaluation of a query tree against a Game. `evaluateNode` walks the
 * AND/OR group structure; `evalCondition` resolves a single leaf condition.
 */
import type { Game } from '../library'
import type { QueryCondition, QueryNode } from './types'
import { FIELD_MAP } from './fields'

const asArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase())
  return v != null ? [String(v).toLowerCase()] : []
}

const evalCondition = (g: Game, c: QueryCondition): boolean => {
  const def = FIELD_MAP.get(c.field)
  if (!def) return true
  const v = def.get(g)

  switch (c.op) {
    case 'exists':
      return Array.isArray(v) ? v.length > 0 : v != null && v !== ''
    case 'notExists':
      return Array.isArray(v) ? v.length === 0 : v == null || v === ''
    case 'isTrue':
      return v === true
    case 'isFalse':
      return !v
  }

  if (def.type === 'number') {
    const n = typeof v === 'number' ? v : null
    const cv = Number(c.value)
    if (n == null || !isFinite(cv)) return false
    switch (c.op) {
      case 'eq':
        return n === cv
      case 'neq':
        return n !== cv
      case 'gt':
        return n > cv
      case 'gte':
        return n >= cv
      case 'lt':
        return n < cv
      case 'lte':
        return n <= cv
    }
  }

  if (def.type === 'string' || def.type === 'enum') {
    const s = (typeof v === 'string' ? v : '').toLowerCase()
    const cv = String(c.value ?? '').toLowerCase()
    if (!cv) return true
    switch (c.op) {
      case 'eq':
        return s === cv
      case 'neq':
        return s !== cv
      case 'contains':
        return s.includes(cv)
      case 'notContains':
        return !s.includes(cv)
    }
  }

  if (def.type === 'stringArray' || def.type === 'enumArray') {
    const arr = asArray(v)
    const wanted = asArray(c.value)
    if (wanted.length === 0) return true
    switch (c.op) {
      case 'any':
        return wanted.some((w) => arr.includes(w))
      case 'all':
        return wanted.every((w) => arr.includes(w))
      case 'none':
        return !wanted.some((w) => arr.includes(w))
    }
  }

  return true
}

const evaluateNode = (g: Game, node: QueryNode): boolean => {
  if (node.kind === 'condition') return evalCondition(g, node)
  if (node.rules.length === 0) return true // empty group matches everything
  return node.combinator === 'and'
    ? node.rules.every((r) => evaluateNode(g, r))
    : node.rules.some((r) => evaluateNode(g, r))
}

export { asArray, evalCondition, evaluateNode }
