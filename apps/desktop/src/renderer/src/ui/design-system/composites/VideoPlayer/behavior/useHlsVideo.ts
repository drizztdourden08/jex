import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface Params {
  src: string
  autoPlay: boolean
}

interface Level {
  i: number
  height: number
}

const useHlsVideo = ({ src, autoPlay }: Params) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [levels, setLevels] = useState<Level[]>([])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let hls: Hls | null = null
    const tryAutoplay = () => autoPlay && void video.play().catch(() => {})

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', tryAutoplay, { once: true })
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true })
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls!.levels.map((l, i) => ({ i, height: l.height })))
        tryAutoplay()
      })
    }
    return () => {
      hls?.destroy()
      hlsRef.current = null
    }
  }, [src, autoPlay])

  return { videoRef, hlsRef, levels }
}

export { useHlsVideo }
export type { Level }
