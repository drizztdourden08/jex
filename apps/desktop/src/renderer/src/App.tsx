import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FrostFilter } from '@ds/primitives/util/FrostFilter'
import { Layout } from '@ui/views/Layout'
import { FirstRun } from '@ui/views/FirstRun'
import { LibraryPage } from '@ui/views/LibraryPage'
import { SearchPage } from '@ui/views/SearchPage'
import { WishlistPage } from '@ui/views/WishlistPage'
import { GameDetailPage } from '@ui/views/GameDetailPage'
import { RandomizerPage } from '@ui/views/RandomizerPage'
import { SettingsPage } from '@ui/views/SettingsPage'

export default function App() {
  const [accepted, setAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    window.api.settings.get<boolean>('acceptedTerms').then((v) => setAccepted(!!v))
  }, [])

  if (accepted === null) return null // brief load while we read settings
  if (!accepted) return <FirstRun onAccept={() => setAccepted(true)} />

  return (
    <>
      <FrostFilter />
      <Layout>
        <Routes>
        <Route path="/" element={<Navigate to="/library" replace />} />
        {/* The Store is a persistent webview rendered by Layout; this route only
            exists so navigating to it doesn't hit the catch-all redirect. */}
        <Route path="/store" element={null} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/game/:appid" element={<GameDetailPage />} />
        <Route path="/randomizer" element={<RandomizerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
      </Layout>
    </>
  )
}
