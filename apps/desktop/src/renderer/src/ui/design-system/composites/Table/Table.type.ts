import type { ReactNode } from 'react'

type TableColumn = {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
}

type TableRow = {
  id: string
  cells: Record<string, ReactNode>
}

interface TableProps {
  columns: TableColumn[]
  rows: TableRow[]
}

export type { TableColumn, TableRow, TableProps }
