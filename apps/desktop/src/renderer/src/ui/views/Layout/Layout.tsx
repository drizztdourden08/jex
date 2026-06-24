import { useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { TitleBar } from '@ui/views/TitleBar'
import { CommandSurface } from '@ui/views/CommandSurface'
import { StorePage } from '@ui/views/StorePage'
import { Sidebar } from './sub-components/Sidebar'
import { Box } from '@ds/primitives/layout/Box'
import { useLayoutAiTools } from './behavior/useLayoutAiTools'
import { useLayoutEffects } from './behavior/useLayoutEffects'

const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = useLocation().pathname
  // The Store tab is a full-bleed webview — drop the content padding/scroll for it.
  const bleed = pathname.startsWith('/store')

  useLayoutAiTools()
  useLayoutEffects()

  return (
    <Box className="root-shell">
      <TitleBar />
      <Box className="app">
        <Sidebar />
        <Box as="main" className={bleed ? 'content content--bleed' : 'content'}>
          {/* Persistent store: mounted for the whole session, shown only on /store
              so its login + browsing state are never lost on tab switches. */}
          <StorePage active={bleed} />
          {!bleed && children}
        </Box>
      </Box>
      <CommandSurface />
    </Box>
  )
}

export { Layout }
