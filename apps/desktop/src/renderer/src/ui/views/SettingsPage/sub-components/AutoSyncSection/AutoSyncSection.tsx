import { Box } from '@ds/primitives/layout/Box'
import { Toggle } from '../Toggle'

type AutoSyncSectionProps = {
  prefs: Record<string, boolean>
  setPref: (key: string, value: boolean) => void
}

const AutoSyncSection = ({ prefs, setPref }: AutoSyncSectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Automatic sync</Box>
      <Box as="p" className="muted" style={{ marginTop: 0 }}>
        All optional. Syncs run in the background and respect Steam's rate limit;
        you can cancel a running sync from the Library.
      </Box>
      <Toggle
        on={!!prefs.autoSyncOnOpen}
        onChange={(v) => setPref('autoSyncOnOpen', v)}
        label="Sync when the app opens"
        hint="Re-scan installed games and fetch anything not yet synced."
      />
      <Toggle
        on={!!prefs.autoSyncDaily}
        onChange={(v) => setPref('autoSyncDaily', v)}
        label="Daily sync of new items"
        hint="Once a day, pull new purchases and metadata that's still missing."
      />
      <Toggle
        on={!!prefs.autoFullResyncMonthly}
        onChange={(v) => setPref('autoFullResyncMonthly', v)}
        label="Monthly full re-sync"
        hint="Re-fetch metadata older than ~30 days so scores, reviews and tags stay current."
      />
      <Box as="p" className="muted toggle-hint" style={{ marginTop: 10 }}>
        Filter options (genres, tags, features, scores) are always built live from
        your current library, so they refresh automatically as metadata syncs.
      </Box>
    </Box>
  )
}

export { AutoSyncSection }
export type { AutoSyncSectionProps }
