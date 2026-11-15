import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { Spinner } from '@ds/primitives/feedback/Spinner'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import type { TroubleshootGroupProps } from './TroubleshootGroup.type'

// Troubleshooting for the AI engine: what is installed vs published, the last update check,
// and the actions to check again, read the log, or reinstall. Bare: data comes via props.
const TroubleshootGroup = ({ diag, busy, note, check, reinstall, openLog }: TroubleshootGroupProps) => {
  if (!diag) {
    return (
      <SettingsGroup label="Troubleshooting">
        <Spinner />
      </SettingsGroup>
    )
  }
  const { lastCheck } = diag
  return (
    <SettingsGroup label="Troubleshooting" description="Installed versions, the last update check and the engine log.">
      {diag.plugins.map((p) => (
        <SettingRow
          key={p.id}
          label={p.id}
          description={`Installed ${p.installedSha ?? 'unknown'} · Published ${p.publishedSha ?? 'not checked'}${p.outdated ? ' · outdated' : ''}`}
        />
      ))}
      <SettingRow
        label="Last update check"
        description={lastCheck ? `${new Date(lastCheck.at).toLocaleString()} · ${lastCheck.detail}` : 'No check yet this session'}
      >
        <Button variant="secondary" onClick={check} disabled={busy}>
          {busy ? 'Working…' : 'Check for updates'}
        </Button>
      </SettingRow>
      <SettingRow label="Engine log" description="Update decisions and download results.">
        <Button variant="secondary" onClick={openLog} disabled={busy}>
          Open log
        </Button>
      </SettingRow>
      <SettingRow
        label="Reinstall engine"
        description={diag.pendingRestart ? 'Pending: restart Jex to apply.' : 'Re-downloads the base and AI engine (not the CUDA add-on) at the next start.'}
      >
        <Button variant="secondary" onClick={reinstall} disabled={busy}>
          Reinstall
        </Button>
      </SettingRow>
      {note && <Text as="p" tone="muted">{note}</Text>}
    </SettingsGroup>
  )
}

export { TroubleshootGroup }
