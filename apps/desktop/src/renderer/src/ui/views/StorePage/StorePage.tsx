import { useRef } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { useStoreControls } from './behavior/useStoreControls'
import { useStoreActivation } from './behavior/useStoreActivation'
import { STORE_PARTITION, HOME_URL, CHROME_UA } from './StorePage.constants'
import type { SteamWebview } from './StorePage.type'

/**
 * The embedded Steam store. Rendered once by Layout and kept mounted for the whole
 * session — `active` only toggles visibility — so navigating away and back returns
 * to exactly where the user left off (page, scroll, login).
 */
const StorePage = ({ active }: { active: boolean }) => {
  const ref = useRef<SteamWebview | null>(null)

  useStoreControls(ref)
  useStoreActivation(ref, active)

  return (
    <Box style={{ display: active ? 'flex' : 'none', width: '100%', height: '100%' }}>
      {/* <webview> is an Electron custom element (not real HTML) with element-specific
          attrs (partition/useragent/allowpopups) absent from AllHTMLAttributes, so it
          can't be a <Box as="webview">. Left raw like SVG content. */}
      <webview
        ref={ref as unknown as React.Ref<HTMLElement>}
        src={HOME_URL}
        partition={STORE_PARTITION}
        useragent={CHROME_UA}
        allowpopups
        style={{ width: '100%', height: '100%', display: 'flex', border: 0, background: '#1b2838' }}
      />
    </Box>
  )
}

export { StorePage }
