import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { RangeInput } from '@ds/primitives/form/RangeInput'
import { I } from '../../VideoPlayer.icons'
import { RATES, fmt } from '../../VideoPlayer.constants'
import type { ControlsBarProps } from './ControlsBar.type'

const ControlsBar = ({
  videoRef,
  cur,
  dur,
  playing,
  muted,
  volume,
  rate,
  level,
  levels,
  menu,
  qualityLabel,
  togglePlay,
  toggleMute,
  setQuality,
  toggleFullscreen,
  setRate,
  setMenu,
  setTheater,
}: ControlsBarProps) => (
  <Box className="vp-controls" onClick={(e) => e.stopPropagation()}>
    <RangeInput
      className="vp-seek"
      min={0}
      max={dur || 0}
      step={0.1}
      value={Math.min(cur, dur || 0)}
      style={{ '--pct': `${dur ? (cur / dur) * 100 : 0}%` } as React.CSSProperties}
      onChange={(e) => {
        const v = videoRef.current
        if (v) v.currentTime = Number(e.currentTarget.value)
      }}
      aria-label="Seek"
    />
    <Box className="vp-bar">
      <IconButton label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>
        {playing ? I.pause : I.play}
      </IconButton>
      <IconButton label="Mute" onClick={toggleMute}>
        {muted || volume === 0 ? I.mute : I.vol}
      </IconButton>
      <RangeInput
        className="vp-vol"
        min={0}
        max={1}
        step={0.05}
        value={muted ? 0 : volume}
        onChange={(e) => {
          const v = videoRef.current
          if (!v) return
          v.volume = Number(e.currentTarget.value)
          v.muted = Number(e.currentTarget.value) === 0
        }}
        aria-label="Volume"
      />
      <Box as="span" className="vp-time">
        {fmt(cur)} / {fmt(dur)}
      </Box>

      <Box className="vp-spacer" />

      <Box className="vp-menu-wrap">
        <Button variant="ghost" onClick={() => setMenu(menu === 'speed' ? null : 'speed')}>
          {rate}×
        </Button>
        {menu === 'speed' && (
          <Box className="vp-menu">
            {RATES.map((r) => (
              <Button
                variant="ghost"
                key={r}
                className={r === rate ? 'on' : ''}
                onClick={() => {
                  setRate(r)
                  setMenu(null)
                }}
              >
                {r}×
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {levels.length > 1 && (
        <Box className="vp-menu-wrap">
          <Button variant="ghost" onClick={() => setMenu(menu === 'quality' ? null : 'quality')}>
            {qualityLabel}
          </Button>
          {menu === 'quality' && (
            <Box className="vp-menu">
              <Button variant="ghost" className={level === -1 ? 'on' : ''} onClick={() => setQuality(-1)}>
                Auto
              </Button>
              {[...levels]
                .sort((a, b) => b.height - a.height)
                .map((l) => (
                  <Button
                    variant="ghost"
                    key={l.i}
                    className={l.i === level ? 'on' : ''}
                    onClick={() => setQuality(l.i)}
                  >
                    {l.height}p
                  </Button>
                ))}
            </Box>
          )}
        </Box>
      )}

      <IconButton label="Theater mode" onClick={() => setTheater((t) => !t)}>
        {I.theater}
      </IconButton>
      <IconButton label="Fullscreen" onClick={toggleFullscreen}>
        {I.fs}
      </IconButton>
    </Box>
  </Box>
)

export { ControlsBar }
