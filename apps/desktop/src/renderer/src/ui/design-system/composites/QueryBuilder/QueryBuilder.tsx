import { useState } from 'react'
import { moveNode, type FieldDef, type QueryGroup } from '@shared/query'
import type { Dnd } from './QueryBuilder.type'
import { GroupEditor } from './sub-components/GroupEditor'
import './QueryBuilder.css'

const QueryBuilder = ({
  query,
  onChange,
  optionsFor,
  numRange,
}: {
  query: QueryGroup
  onChange: (q: QueryGroup) => void
  optionsFor: (def: FieldDef) => { value: string; label: string }[]
  numRange: (def: FieldDef) => { min: number; max: number } | null
}) => {
  const [dragId, setDragId] = useState<string | null>(null)
  const dnd: Dnd = {
    dragId,
    start: (e, id) => {
      e.dataTransfer.setData('text/plain', id)
      e.dataTransfer.effectAllowed = 'move'
      setDragId(id)
    },
    over: (e) => {
      if (dragId) e.preventDefault()
    },
    dropBefore: (e, targetId) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragId && dragId !== targetId) onChange(moveNode(query, dragId, targetId, false))
      setDragId(null)
    },
    dropInto: (e, groupId) => {
      e.preventDefault()
      if (dragId) onChange(moveNode(query, dragId, groupId, true))
      setDragId(null)
    },
  }
  return <GroupEditor node={query} ctx={{ root: query, onChange, optionsFor, numRange, dnd }} isRoot />
}

export { QueryBuilder }
