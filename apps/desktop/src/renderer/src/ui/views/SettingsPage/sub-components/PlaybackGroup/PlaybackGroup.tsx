import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { ToggleRow } from '../ToggleRow'

type PlaybackGroupProps = {
  prefs: Record<string, boolean>
  setPref: (key: string, value: boolean) => void
}

const PlaybackGroup = ({ prefs, setPref }: PlaybackGroupProps) => (
  <SettingsGroup label="Playback">
    <ToggleRow
      on={!!prefs.autoplayVideos}
      onChange={(v) => setPref('autoplayVideos', v)}
      label="Autoplay trailers"
      hint="Start the first trailer when a game opens. Clicking a video thumbnail always plays it."
    />
  </SettingsGroup>
)

export { PlaybackGroup }
export type { PlaybackGroupProps }
