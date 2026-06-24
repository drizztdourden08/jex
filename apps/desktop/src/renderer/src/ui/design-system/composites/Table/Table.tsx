import { Box } from '@ds/primitives/layout/Box'
import type { TableProps } from './Table.type'
import './Table.css'

// A light, generic table: declarative columns + rows whose cells are arbitrary nodes
// (so a cell can hold a checkbox, badge, etc.). Domain-agnostic — no app knowledge.
const Table = ({ columns, rows }: TableProps) => (
  <Box as="table" className="ds-table">
    <Box as="thead">
      <Box as="tr">
        {columns.map((col) => (
          <Box
            as="th"
            key={col.key}
            className="ds-table-th"
            style={{ textAlign: col.align ?? 'left', width: col.width }}
          >
            {col.header}
          </Box>
        ))}
      </Box>
    </Box>
    <Box as="tbody">
      {rows.map((row) => (
        <Box as="tr" key={row.id} className="ds-table-tr">
          {columns.map((col) => (
            <Box
              as="td"
              key={col.key}
              className="ds-table-td"
              style={{ textAlign: col.align ?? 'left' }}
            >
              {row.cells[col.key]}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
)

export { Table }
