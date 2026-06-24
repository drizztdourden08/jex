import { useEffect, useState } from 'react'
import { useStoreNav } from '@/store/storeNav'
import { Mascot } from '@ds/primitives/util/Mascot'
import { Box } from '@ds/primitives/layout/Box'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Image } from '@ds/primitives/media/Image'
import wordmarkUrl from '@assets/wordmark.svg'
import './TitleBar.css'

/**
 * Frameless-window titlebar: draggable strip with the brand and window controls.
 * The AI command surface (the morphing pill ⇄ drawer) is a fixed-position element
 * rendered by Layout that floats over the titlebar's centre — it is NOT a child
 * here, so the pill and the open drawer are literally the same element.
 *
 * When the Store tab is open the titlebar also hosts the webview's
 * back/forward/reload controls, anchored at the sidebar width.
 */
const TitleBar = () => {
  const [maximized, setMaximized] = useState(false)
  const nav = useStoreNav()

  useEffect(() => {
    window.api?.window.isMaximized().then(setMaximized).catch(() => {})
  }, [])

  return (
    <Box as="header" className="titlebar">
      <Box className="tb-left">
        <Box as="span" className="brand">
          <Mascot className="brand-mascot" size={20} state="static" title="Jex" />
          <Image className="brand-wordmark" src={wordmarkUrl} alt="Jex" />
        </Box>
      </Box>

      {nav.active && (
        <Box className="tb-storenav">
          <IconButton
            label="Back"
            className="tb-navbtn"
            title="Back"
            disabled={!nav.canBack}
            onClick={() => nav.controls?.back()}
          >
            ←
          </IconButton>
          <IconButton
            label="Forward"
            className="tb-navbtn"
            title="Forward"
            disabled={!nav.canFwd}
            onClick={() => nav.controls?.forward()}
          >
            →
          </IconButton>
          <IconButton
            label={nav.loading ? 'Stop' : 'Reload'}
            className="tb-navbtn"
            title={nav.loading ? 'Stop' : 'Reload'}
            onClick={() => (nav.loading ? nav.controls?.stop() : nav.controls?.reload())}
          >
            {nav.loading ? '✕' : '⟳'}
          </IconButton>
        </Box>
      )}

      {/* Centre is intentionally empty — the morphing AI command surface (rendered
          by Layout) floats here as a fixed-position element. */}

      <Box className="tb-right">
        <IconButton label="Minimize" className="winctl" onClick={() => window.api?.window.minimize()}>
          –
        </IconButton>
        <IconButton
          label="Maximize"
          className="winctl"
          onClick={async () => setMaximized((await window.api?.window.maximize()) ?? false)}
        >
          {maximized ? '❐' : '▢'}
        </IconButton>
        <IconButton label="Close" className="winctl close" onClick={() => window.api?.window.close()}>
          ✕
        </IconButton>
      </Box>
    </Box>
  )
}

export { TitleBar }
