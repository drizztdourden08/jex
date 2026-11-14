import type { SearchVocab } from '@shared/search'
import { Button } from '@ds/primitives/actions/Button'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import { ToggleRow } from '../ToggleRow'
import { relDays } from './SyncGroup.helpers'

type SyncGroupProps = {
  prefs: Record<string, boolean>
  setPref: (key: string, value: boolean) => void
  vocab: SearchVocab | null
  syncingVocab: boolean
  syncVocab: () => void
}

// Background sync preferences + the Steam catalog tag list used by the Search tab.
const SyncGroup = ({ prefs, setPref, vocab, syncingVocab, syncVocab }: SyncGroupProps) => {
  const vocabState = vocab
    ? `${vocab.tags.length.toLocaleString()} tags, synced ${relDays(vocab.syncedAt)}.`
    : 'Not synced yet.'
  return (
    <SettingsGroup
      label="Sync"
      description="Syncs run in the background within Steam's rate limit; cancel a running one from the Library. Filter options always come live from your library."
    >
      <ToggleRow
        on={!!prefs.autoSyncOnOpen}
        onChange={(v) => setPref('autoSyncOnOpen', v)}
        label="Sync when the app opens"
        hint="Re-scan installed games and fetch anything not yet synced."
      />
      <ToggleRow
        on={!!prefs.autoSyncDaily}
        onChange={(v) => setPref('autoSyncDaily', v)}
        label="Daily sync of new items"
        hint="Once a day, pull new purchases and metadata that's still missing."
      />
      <ToggleRow
        on={!!prefs.autoFullResyncMonthly}
        onChange={(v) => setPref('autoFullResyncMonthly', v)}
        label="Monthly full re-sync"
        hint="Re-fetch metadata older than ~30 days so scores, reviews and tags stay current."
      />
      <SettingRow
        label="Search filters"
        description={`Steam's full tag list for filtering the whole catalog in Search. ${vocabState}`}
      >
        <Button variant="secondary" onClick={syncVocab} disabled={syncingVocab}>
          {syncingVocab ? 'Syncing…' : vocab ? 'Re-sync' : 'Sync now'}
        </Button>
      </SettingRow>
    </SettingsGroup>
  )
}

export { SyncGroup }
export type { SyncGroupProps }
