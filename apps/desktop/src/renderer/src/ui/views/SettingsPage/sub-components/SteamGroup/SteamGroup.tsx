import type { DetectResult } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'

type SteamGroupProps = {
  detect: DetectResult | null
  loading: boolean
  keySet: boolean
  keyInput: string
  setKeyInput: (v: string) => void
  msg: string | null
  saveKey: () => void
  clearKey: () => void
}

const KEY_HELP = (
  <>
    Fetches your full owned library (not-installed games too) and metadata. Stored encrypted on
    this PC and sent only to Steam. Free at{' '}
    <Box as="a" href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer">
      steamcommunity.com/dev/apikey
    </Box>{' '}
    (the domain can be <Box as="code">localhost</Box>).
  </>
)

// What was detected on this PC, plus the Steam Web API key.
const SteamGroup = ({ detect, loading, keySet, keyInput, setKeyInput, msg, saveKey, clearKey }: SteamGroupProps) => {
  const found = detect?.steamPath
  const account = detect?.currentUser
    ? `${detect.currentUser.personaName} (${detect.currentUser.steamId})`
    : 'None detected'
  return (
    <SettingsGroup label="Steam">
      <SettingRow
        label="Steam install"
        description={loading ? 'Detecting…' : (found ?? 'No Steam install found on this PC.')}
      />
      {found && detect && (
        <>
          <SettingRow label="Signed-in account" description={account} />
          <SettingRow
            label={`Library folders (${detect.libraryFolders.length})`}
            description={detect.libraryFolders.map((f) => f.path).join(' · ')}
          />
        </>
      )}
      <SettingRow label="Steam Web API key" description={KEY_HELP} control={keySet ? 'auto' : 'wide'}>
        {keySet ? (
          <>
            <Text as="span" tone="muted">
              ✓ Saved
            </Text>
            <Button variant="secondary" onClick={clearKey}>
              Remove
            </Button>
          </>
        ) : (
          <>
            <TextInput
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.currentTarget.value)}
              placeholder="Paste API key"
              aria-label="Steam Web API key"
            />
            <Button onClick={saveKey} disabled={!keyInput.trim()}>
              Save
            </Button>
          </>
        )}
      </SettingRow>
      {msg && (
        <Text as="p" tone="muted" role="status">
          {msg}
        </Text>
      )}
    </SettingsGroup>
  )
}

export { SteamGroup }
export type { SteamGroupProps }
