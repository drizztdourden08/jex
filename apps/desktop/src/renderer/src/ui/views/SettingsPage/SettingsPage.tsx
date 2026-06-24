import { Box } from '@ds/primitives/layout/Box'
import { AiModelPicker } from '@ui/views/AiModelPicker'
import { AiToolsPanel } from '@ui/views/AiToolsPanel'
import { useSettings } from './behavior/useSettings'
import { useAiEngine } from './behavior/useAiEngine'
import { SteamDetectionSection } from './sub-components/SteamDetectionSection'
import { ApiKeySection } from './sub-components/ApiKeySection'
import { AiEngineSection } from './sub-components/AiEngineSection'
import { PlaybackSection } from './sub-components/PlaybackSection'
import { AutoSyncSection } from './sub-components/AutoSyncSection'
import { SearchFiltersSection } from './sub-components/SearchFiltersSection'
import { LibraryDataSection } from './sub-components/LibraryDataSection'

const SettingsPage = () => {
  const {
    detect,
    loading,
    keySet,
    keyInput,
    setKeyInput,
    msg,
    confirmDrop,
    setConfirmDrop,
    dropMsg,
    prefs,
    vocab,
    syncingVocab,
    syncVocab,
    saveKey,
    clearKey,
    setPref,
    dropMetadata,
  } = useSettings()
  const aiEngine = useAiEngine()

  return (
    <Box>
      <Box as="h1">Settings</Box>

      <SteamDetectionSection detect={detect} loading={loading} />

      <ApiKeySection
        keySet={keySet}
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        msg={msg}
        saveKey={saveKey}
        clearKey={clearKey}
      />

      <AiEngineSection {...aiEngine} />

      {/* The model + tools sections only make sense once the engine plugin is installed. */}
      {aiEngine.status?.installed && (
        <>
          <AiModelPicker />
          <AiToolsPanel />
        </>
      )}

      <PlaybackSection prefs={prefs} setPref={setPref} />

      <AutoSyncSection prefs={prefs} setPref={setPref} />

      <SearchFiltersSection vocab={vocab} syncingVocab={syncingVocab} syncVocab={syncVocab} />

      <LibraryDataSection
        confirmDrop={confirmDrop}
        setConfirmDrop={setConfirmDrop}
        dropMsg={dropMsg}
        dropMetadata={dropMetadata}
      />
    </Box>
  )
}

export { SettingsPage }
