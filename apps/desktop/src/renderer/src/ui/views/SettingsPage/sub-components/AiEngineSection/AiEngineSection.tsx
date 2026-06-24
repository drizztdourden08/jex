import { Box } from '@ds/primitives/layout/Box'
import { Stack } from '@ds/primitives/layout/Stack'
import { Flex } from '@ds/primitives/layout/Flex'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { Checkbox } from '@ds/primitives/form/Checkbox'
import { Table } from '@ds/composites/Table'
import type { TableColumn, TableRow } from '@ds/composites/Table'
import type { AiEngineSectionProps } from './AiEngineSection.type'

// One row of the detected-specs list (label + value).
const Spec = ({ label, value }: { label: string; value: string }) => (
  <Flex gap={2}>
    <Text as="span" tone="faint" style={{ width: 52, flex: 'none' }}>
      {label}
    </Text>
    <Text as="span" tone="default">
      {value}
    </Text>
  </Flex>
)

const fmtSize = (bytes: number | null): string => {
  if (bytes == null) return '—'
  const mb = bytes / 1024 / 1024
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

const COLUMNS: TableColumn[] = [
  { key: 'check', header: '', width: '36px', align: 'center' },
  { key: 'name', header: 'Plugin' },
  { key: 'packages', header: 'Included' },
  { key: 'size', header: 'Size', align: 'right' },
  { key: 'notes', header: 'Notes' },
]

// First-run setup: detected specs, then a transparent checklist of exactly what gets
// downloaded + installed (recommended engine pre-checked and required; add-ons optional).
// Presentational — SettingsPage owns the state and gates the model section on installed.
const AiEngineSection = ({
  status,
  plugins,
  selected,
  toggle,
  installing,
  progress,
  error,
  install,
}: AiEngineSectionProps) => {
  if (!status) return null

  const gpu = status.gpu
    ? `${status.gpu}${status.vramGb ? ` (${status.vramGb} GB)` : ''}`
    : 'No NVIDIA GPU detected'

  const rows: TableRow[] = plugins.map((p) => ({
    id: p.id,
    cells: {
      check: p.installed ? (
        <Text as="span" weight="bold" style={{ color: 'var(--installed)' }} title="Installed">
          ✓
        </Text>
      ) : (
        <Checkbox
          checked={selected.has(p.id)}
          disabled={p.recommended}
          onCheckedChange={() => toggle(p.id)}
          aria-label={p.name}
        />
      ),
      name: (
        <Text as="span" tone="default" weight="semibold">
          {p.name}
        </Text>
      ),
      packages: <Text as="span" tone="muted">{p.packages}</Text>,
      size: <Text as="span" tone="muted">{p.installed ? '✓' : fmtSize(p.sizeBytes)}</Text>,
      notes: <Text as="span" tone="muted">{p.notes}</Text>,
    },
  }))

  return (
    <Box className="panel">
      <Box as="h3">AI engine</Box>
      <Stack gap={4}>
        <Stack gap={1}>
          <Spec label="CPU" value={status.cpu} />
          <Spec label="GPU" value={gpu} />
          <Spec label="RAM" value={`${status.ramGb} GB`} />
          <Spec label="OS" value={`${status.os} (${status.arch})`} />
        </Stack>

        <Text as="div" tone="muted">
          {status.installed
            ? 'Your AI engine is installed. You can add any of the items below at any time.'
            : 'Choose what to install — the recommended engine is pre-selected. The AI model itself is downloaded later from the model picker.'}
        </Text>

        <Table columns={COLUMNS} rows={rows} />

        <Flex gap={3} style={{ marginTop: 4, alignItems: 'center' }}>
          <Button onClick={install} disabled={installing || selected.size === 0}>
            {installing ? 'Installing…' : status.installed ? 'Install selected' : 'Install AI engine'}
          </Button>
          {progress && (
            <Text as="span" tone="muted">
              {progress}
            </Text>
          )}
        </Flex>

        {error && (
          <Text as="p" tone="muted">
            {error}
          </Text>
        )}
      </Stack>
    </Box>
  )
}

export { AiEngineSection }
