/**
 * ID generation, node factories, and immutable tree edits for the query model.
 */
import type { Combinator, QueryCondition, QueryGroup, QueryNode } from './types'
import { FIELD_MAP, OPS_BY_TYPE } from './fields'

// ── ID + node factories ──────────────────────────────────────────────────────
let _id = 0
const uid = (prefix = 'q'): string => {
  return `${prefix}${++_id}`
}

const emptyGroup = (combinator: Combinator = 'and'): QueryGroup => {
  return { kind: 'group', id: uid('g'), combinator, rules: [] }
}

const newCondition = (field = 'name'): QueryCondition => {
  const def = FIELD_MAP.get(field)
  const op = def ? OPS_BY_TYPE[def.type][0] : 'contains'
  return { kind: 'condition', id: uid('c'), field, op }
}

const isEmptyQuery = (q: QueryGroup): boolean => {
  return q.rules.length === 0
}

// ── Immutable tree edits ─────────────────────────────────────────────────────
const updateNode = (root: QueryGroup, id: string, patch: Partial<QueryNode>): QueryGroup => {
  const walk = (n: QueryNode): QueryNode => {
    if (n.id === id) return { ...n, ...patch } as QueryNode
    if (n.kind === 'group') return { ...n, rules: n.rules.map(walk) }
    return n
  }
  return walk(root) as QueryGroup
}

const removeNode = (root: QueryGroup, id: string): QueryGroup => {
  const walk = (g: QueryGroup): QueryGroup => ({
    ...g,
    rules: g.rules.filter((r) => r.id !== id).map((r) => (r.kind === 'group' ? walk(r) : r)),
  })
  return walk(root)
}

const addToGroup = (root: QueryGroup, groupId: string, node: QueryNode): QueryGroup => {
  const walk = (g: QueryGroup): QueryGroup => {
    const rules = g.rules.map((r) => (r.kind === 'group' ? walk(r) : r))
    if (g.id === groupId) rules.push(node)
    return { ...g, rules }
  }
  return walk(root)
}

const findNode = (root: QueryGroup, id: string): QueryNode | null => {
  if (root.id === id) return root
  for (const r of root.rules) {
    if (r.id === id) return r
    if (r.kind === 'group') {
      const f = findNode(r, id)
      if (f) return f
    }
  }
  return null
}

const isAncestor = (node: QueryNode, maybeDescendantId: string): boolean => {
  if (node.kind !== 'group') return false
  return node.rules.some((r) => r.id === maybeDescendantId || isAncestor(r, maybeDescendantId))
}

/**
 * Move `draggedId` to just before `targetId` (or, if targetId is a group and
 * `intoGroup`, append inside it). No-op for invalid moves (into self/descendant).
 */
const moveNode = (
  root: QueryGroup,
  draggedId: string,
  targetId: string,
  intoGroup = false,
): QueryGroup => {
  if (draggedId === targetId) return root
  const dragged = findNode(root, draggedId)
  const target = findNode(root, targetId)
  if (!dragged || !target) return root
  // Can't drop a group into itself or one of its own descendants.
  if (dragged.kind === 'group' && (dragged.id === targetId || isAncestor(dragged, targetId))) return root

  const without = removeNode(root, draggedId)

  if (intoGroup && target.kind === 'group') {
    return addToGroup(without, targetId, dragged)
  }

  // Insert before targetId within its parent group.
  const insertBefore = (g: QueryGroup): QueryGroup => {
    const idx = g.rules.findIndex((r) => r.id === targetId)
    if (idx >= 0) {
      const rules = [...g.rules]
      rules.splice(idx, 0, dragged)
      return { ...g, rules: rules.map((r) => (r.kind === 'group' && r.id !== dragged.id ? r : r)) }
    }
    return { ...g, rules: g.rules.map((r) => (r.kind === 'group' ? insertBefore(r) : r)) }
  }
  return insertBefore(without)
}

export {
  uid,
  emptyGroup,
  newCondition,
  isEmptyQuery,
  updateNode,
  removeNode,
  addToGroup,
  findNode,
  isAncestor,
  moveNode,
}
