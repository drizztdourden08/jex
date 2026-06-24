import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import '@ds/tokens/index.css'
import '@ui/global.css'

// MemoryRouter keeps the app's routing history in memory rather than in
// window.history. That's deliberate: tab changes never become browser-history
// entries, so the OS Back/Forward gestures (mouse buttons, Alt+←/→) can't walk
// back through tabs — they belong to the embedded store webview, which has its own
// separate history. (We previously used HashRouter; the trade-off is that a hard
// renderer reload resets to the default route, which is fine for this desktop app.)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </StrictMode>,
)
