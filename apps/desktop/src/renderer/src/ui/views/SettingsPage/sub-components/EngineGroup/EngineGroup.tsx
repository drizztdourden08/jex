import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { Checkbox } from '@ds/primitives/form/Checkbox'
import { Table } from '@ds/composites/Table'
import type { TableRow } from '@ds/composites/Table'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import { COLUMNS, ENGINE_HELP } from './EngineGroup.constants'
import { describeMachine, fmtSize } from './EngineGroup.helpers'
import type { EngineGroupProps } from './EngineGroup.type'

// The AI engine: detected machine, a transparent checklist of exactly what gets
// downloaded (recommended engine pre-checked and required; add-ons optional), install.
const EngineGroup = ({
  status,
  plugins,
  selected,
  toggle,
  installing,
  progress,
  error,
  install,
  loadError,
  retry,
}: EngineGroupProps) => {
  if (!status && loadError) {
    return (
      <SettingsGroup label="Engine">
        <SettingRow label="Couldn't load the AI engine status" description={<Text tone="danger">{loadError}</Text>}>
          <Button variant="secondary" onClick={retry}>
            Retry
          </Button>
        </SettingRow>
      </SettingsGroup>
    )
  }
  if (!status) return null

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
        <Text as="span" weight="semibold">
          {p.name}
        </Text>
      ),
      packages: <Text tone="muted">{p.packages}</Text>,
      size: <Text tone="muted">{p.installed ? 'Installed' : fmtSize(p.sizeBytes)}</Text>,
      notes: <Text tone="muted">{p.notes}</Text>,
    },
  }))

  return (
    <SettingsGroup label="Engine">
      <SettingRow label="This PC" description={describeMachine(status)} />
      <Table columns={COLUMNS} rows={rows} />
      <SettingRow
        label={status.installed ? 'AI engine installed' : 'AI engine not installed'}
        description={progress ?? (status.installed ? ENGINE_HELP.installed : ENGINE_HELP.missing)}
      >
        <Button onClick={install} disabled={installing || selected.size === 0}>
          {installing ? 'Installing…' : status.installed ? 'Install selected' : 'Install AI engine'}
        </Button>
      </SettingRow>
      {error && (
        <Text as="p" tone="danger" role="alert">
          {error}
        </Text>
      )}
    </SettingsGroup>
  )
}

export { EngineGroup }
