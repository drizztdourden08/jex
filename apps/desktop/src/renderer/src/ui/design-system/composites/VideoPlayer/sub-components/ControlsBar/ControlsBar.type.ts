import type { Level } from '../../behavior/useHlsVideo'

interface ControlsBarProps {
  videoRef: React.RefObject<HTMLVideoElement>
  cur: number
  dur: number
  playing: boolean
  muted: boolean
  volume: number
  rate: number
  level: number
  levels: Level[]
  menu: null | 'speed' | 'quality'
  qualityLabel: string
  togglePlay: () => void
  toggleMute: () => void
  setQuality: (i: number) => void
  toggleFullscreen: () => void
  setRate: (r: number) => void
  setMenu: React.Dispatch<React.SetStateAction<null | 'speed' | 'quality'>>
  setTheater: React.Dispatch<React.SetStateAction<boolean>>
}

export type { ControlsBarProps }
