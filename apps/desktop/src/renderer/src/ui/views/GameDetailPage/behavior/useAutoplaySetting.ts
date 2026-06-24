import { useEffect, useState } from 'react'

/**
 * Read the user's "autoplay videos" preference (one-shot). Lives at the View tier so
 * the bare MediaCarousel compound can stay presentational (it takes `autoplay` via a
 * prop instead of reaching into window.api itself).
 */
const useAutoplaySetting = (): boolean => {
  const [autoplay, setAutoplay] = useState(false)
  useEffect(() => {
    void window.api.settings.get<boolean>('autoplayVideos').then((v) => setAutoplay(!!v))
  }, [])
  return autoplay
}

export { useAutoplaySetting }
