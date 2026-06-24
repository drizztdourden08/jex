import { useCallback, useEffect, useRef, useState } from 'react'
import type Hls from 'hls.js'
import type { Level } from './useHlsVideo'

interface Params {
  videoRef: React.RefObject<HTMLVideoElement>
  hlsRef: React.RefObject<Hls | null>
  levels: Level[]
}

const usePlaybackControls = ({ videoRef, hlsRef, levels }: Params) => {
  const stageRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [level, setLevel] = useState(-1) // -1 = auto
  const [theater, setTheater] = useState(false)
  const [menu, setMenu] = useState<null | 'speed' | 'quality'>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate
  }, [rate, videoRef])

  useEffect(() => {
    if (!theater) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTheater(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theater])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play().catch(() => {})
    else v.pause()
  }, [videoRef])

  const toggleMute = () => {
    const v = videoRef.current
    if (v) v.muted = !v.muted
  }

  const setQuality = (i: number) => {
    setLevel(i)
    if (hlsRef.current) hlsRef.current.currentLevel = i
    setMenu(null)
  }

  const toggleFullscreen = () => {
    const el = stageRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen().catch(() => {})
  }

  const qualityLabel = level === -1 ? 'Auto' : `${levels.find((l) => l.i === level)?.height ?? ''}p`

  return {
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
  }
}

export { usePlaybackControls }
