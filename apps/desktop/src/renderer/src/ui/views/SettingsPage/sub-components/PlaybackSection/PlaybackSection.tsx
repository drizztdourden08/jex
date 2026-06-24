import { Box } from '@ds/primitives/layout/Box'
import { Toggle } from '../Toggle'

type PlaybackSectionProps = {
  prefs: Record<string, boolean>
  setPref: (key: string, value: boolean) => void
}

const PlaybackSection = ({ prefs, setPref }: PlaybackSectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Playback</Box>
      <Toggle
        on={!!prefs.autoplayVideos}
        onChange={(v) => setPref('autoplayVideos', v)}
        label="Autoplay trailers"
        hint="Start the first trailer automatically when opening a game. Clicking a video thumbnail always plays it."
      />
    </Box>
  )
}

export { PlaybackSection }
export type { PlaybackSectionProps }
