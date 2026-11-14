import type { TableColumn } from '@ds/composites/Table'

const COLUMNS: TableColumn[] = [
  { key: 'check', header: '', width: '36px', align: 'center' },
  { key: 'name', header: 'Component' },
  { key: 'packages', header: 'Included' },
  { key: 'size', header: 'Size', align: 'right' },
  { key: 'notes', header: 'Notes' },
]

const ENGINE_HELP = {
  installed: 'Installed. Remote models run on it; add the native base to run local models.',
  missing: 'Install the AI engine to use remote models. The native base is only needed for local models.',
}

export { COLUMNS, ENGINE_HELP }
