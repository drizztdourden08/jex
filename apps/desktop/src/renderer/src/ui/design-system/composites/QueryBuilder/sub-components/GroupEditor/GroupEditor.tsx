import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'
import {
  addToGroup,
  emptyGroup,
  newCondition,
  removeNode,
  updateNode,
  type QueryGroup,
} from '@shared/query'
import type { Ctx } from '../../QueryBuilder.type'
import { ConditionEditor } from '../ConditionEditor'

const GroupEditor = ({ node, ctx, isRoot }: { node: QueryGroup; ctx: Ctx; isRoot?: boolean }) => {
  const setComb = (combinator: 'and' | 'or') =>
    ctx.onChange(updateNode(ctx.root, node.id, { combinator }) as QueryGroup)
  return (
    <Box
      className={`qb-group${ctx.dnd.dragId ? ' droppable' : ''}`}
      onDragOver={ctx.dnd.over}
      onDrop={(e) => {
        e.stopPropagation()
        ctx.dnd.dropInto(e, node.id)
      }}
    >
      <Box className="qb-group-head">
        {!isRoot && (
          <Box as="span" className="qb-handle" draggable onDragStart={(e) => ctx.dnd.start(e, node.id)} title="Drag group">
            ⠿
          </Box>
        )}
        <SegmentedControl
          size="sm"
          options={[
            { value: 'and', label: 'Match ALL' },
            { value: 'or', label: 'Match ANY' },
          ]}
          value={node.combinator}
          onChange={(v) => setComb(v as 'and' | 'or')}
        />
        {!isRoot && (
          <IconButton label="Remove group" className="qb-remove" title="Remove group" onClick={() => ctx.onChange(removeNode(ctx.root, node.id))}>
            ✕
          </IconButton>
        )}
      </Box>

      <Box className="qb-rules">
        {node.rules.map((r) =>
          r.kind === 'group' ? (
            <GroupEditor key={r.id} node={r} ctx={ctx} />
          ) : (
            <ConditionEditor key={r.id} node={r} ctx={ctx} />
          ),
        )}
        {node.rules.length === 0 && <Box as="p" className="muted qb-empty">No criteria — add one below.</Box>}
      </Box>

      <Box className="qb-add">
        <Button onClick={() => ctx.onChange(addToGroup(ctx.root, node.id, newCondition()))}>+ Add criteria</Button>
        <Button
          variant="ghost"
          className="ghost"
          onClick={() =>
            ctx.onChange(addToGroup(ctx.root, node.id, emptyGroup(node.combinator === 'and' ? 'or' : 'and')))
          }
        >
          + Add group
        </Button>
      </Box>
    </Box>
  )
}

export { GroupEditor }
