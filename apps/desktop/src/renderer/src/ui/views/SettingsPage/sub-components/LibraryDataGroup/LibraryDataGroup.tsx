import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'

type LibraryDataGroupProps = {
  confirmDrop: boolean
  setConfirmDrop: (v: boolean) => void
  dropMsg: string | null
  dropMetadata: () => void
}

// The one destructive library action, behind a click-again confirm.
const LibraryDataGroup = ({ confirmDrop, setConfirmDrop, dropMsg, dropMetadata }: LibraryDataGroupProps) => (
  <SettingsGroup label="Data">
    <SettingRow
      label="Drop all metadata"
      description="Clears descriptions, media, reviews, scores, features and tags, and re-queues every game. Owned games and playtime are kept; a sync re-fetches the rest."
    >
      {confirmDrop && (
        <Button variant="ghost" onClick={() => setConfirmDrop(false)}>
          Cancel
        </Button>
      )}
      <Button variant={confirmDrop ? 'danger' : 'secondary'} onClick={dropMetadata}>
        {confirmDrop ? 'Click again to confirm' : 'Drop metadata'}
      </Button>
    </SettingRow>
    {dropMsg && (
      <Text as="p" tone="muted" role="status">
        {dropMsg}
      </Text>
    )}
  </SettingsGroup>
)

export { LibraryDataGroup }
export type { LibraryDataGroupProps }
