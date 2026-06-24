import './VideoPlayer.css'
import { Box } from '@ds/primitives/layout/Box'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { I } from './VideoPlayer.icons'
import { useHlsVideo } from './behavior/useHlsVideo'
import { usePlaybackControls } from './behavior/usePlaybackControls'
import { ControlsBar } from './sub-components/ControlsBar'

interface Props {
  src: string
  /** Optional still. Omitted by default so hls.js renders the video's real first frame. */
  poster?: string
  /** Start playing on mount (clicked a video thumbnail, or autoplay setting on). */
  autoPlay: boolean
}

/**
 * Custom HLS video player. Steam serves adaptive manifests, so hls.js is attached
 * directly (so the real first frame renders as the still — no blurry thumbnail) and
 * exposes its renditions for the quality menu. Controls: play/seek/volume, playback
 * speed, quality, an in-app "theater" mode (fills the app like the image lightbox),
 * and native fullscreen.
 */
const VideoPlayer = ({ src, poster, autoPlay }: Props) => {
  const { videoRef, hlsRef, levels } = useHlsVideo({ src, autoPlay })
  const {
    stageRef,
    playing,
    setPlaying,
    cur,
    setCur,
    dur,
    setDur,
    muted,
    setMuted,
    volume,
    setVolume,
    rate,
    setRate,
    level,
    theater,
    setTheater,
    menu,
    setMenu,
    togglePlay,
    toggleMute,
    setQuality,
    toggleFullscreen,
    qualityLabel,
  } = usePlaybackControls({ videoRef, hlsRef, levels })

  const stage = (
    <Box className="vp-stage" ref={stageRef}>
      <Box
        as="video"
        ref={videoRef}
        poster={poster}
        preload="auto"
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCur(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDur(videoRef.current?.duration ?? 0)}
        onVolumeChange={() => {
          const v = videoRef.current
          if (v) {
            setMuted(v.muted)
            setVolume(v.volume)
          }
        }}
      />

      {!playing && (
        <IconButton label="Play" className="vp-bigplay" onClick={togglePlay}>
          {I.play}
        </IconButton>
      )}

      <ControlsBar
        videoRef={videoRef}
        cur={cur}
        dur={dur}
        playing={playing}
        muted={muted}
        volume={volume}
        rate={rate}
        level={level}
        levels={levels}
        menu={menu}
        qualityLabel={qualityLabel}
        togglePlay={togglePlay}
        toggleMute={toggleMute}
        setQuality={setQuality}
        toggleFullscreen={toggleFullscreen}
        setRate={setRate}
        setMenu={setMenu}
        setTheater={setTheater}
      />
    </Box>
  )

  // Same element position in both states (scrim always rendered) so toggling
  // theater never remounts the <video> — playback continues seamlessly.
  return (
    <>
      <Box className={theater ? 'vp-scrim show' : 'vp-scrim'} onClick={() => setTheater(false)} />
      <Box className={theater ? 'vp-root theater' : 'vp-root'}>{stage}</Box>
    </>
  )
}

export { VideoPlayer }
