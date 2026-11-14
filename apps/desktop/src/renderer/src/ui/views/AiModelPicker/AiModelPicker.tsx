import { useEffect, useState } from 'react'
import { useModelCatalog } from './behavior/useModelCatalog'
import { useCudaInstall } from './behavior/useCudaInstall'
import { useRemoteModels } from './behavior/useRemoteModels'
import { RemoteModelList } from './sub-components/RemoteModelList'
import { ModelCompareSelect } from './sub-components/ModelCompareSelect'
import { InstalledModelList } from './sub-components/InstalledModelList'
import { CudaCallout } from './sub-components/CudaCallout'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import { ipcErrorText } from '@/lib/ipc/ipcErrorText'
import { BACKEND_LABEL, LOCAL_HELP } from './AiModelPicker.constants'
import './AiModelPicker.css'

/**
 * Settings model picker (View), rendered as two groups of the AI settings section:
 * remote models (pick one whose provider has a key) and local models (compute info,
 * CUDA callout, a compare-dropdown with Download, and the installed/downloading list).
 * Downloads keep running after navigating away, since their state lives in the store.
 */
const AiModelPicker = () => {
  const {
    available,
    installed,
    downloading,
    backend,
    vramGb,
    recommendedId,
    fits,
    errors,
    download,
    select,
    remove,
    cleanInactive,
  } = useModelCatalog()
  const cuda = useCudaInstall()
  const remote = useRemoteModels()
  const [actionError, setActionError] = useState<string | null>(null)

  // Local actions can reject (engine missing, disk error); surface it, and keep the
  // remote group's "Active" marker in step with whichever model was just chosen.
  const selectLocal = async (id: string) => {
    setActionError(null)
    try {
      await select(id)
      await remote.reload()
    } catch (e) {
      setActionError(ipcErrorText(e))
    }
  }
  const removeLocal = async (id: string) => {
    setActionError(null)
    try {
      await remove(id)
    } catch (e) {
      setActionError(ipcErrorText(e))
    }
  }
  const [chosenId, setChosenId] = useState<string | null>(null)

  // Keep a sensible default selected in the dropdown: the GPU-recommended model if
  // it's downloadable, else the first available. Reset if the chosen one leaves.
  useEffect(() => {
    if (chosenId && available.some((m) => m.id === chosenId)) return
    const rec = available.some((m) => m.id === recommendedId) ? recommendedId : null
    setChosenId(rec ?? available[0]?.id ?? null)
  }, [available, chosenId, recommendedId])

  const errorIds = Object.keys(errors)
  const inactiveCount = installed.filter((m) => !m.active).length
  const chosen = available.find((m) => m.id === chosenId) ?? null
  const chosenTooBig = chosen != null && !fits(chosen)
  const compute = backend
    ? [
        BACKEND_LABEL[backend.backend] ?? backend.backend,
        backend.deviceName,
        vramGb != null ? `${Math.round(vramGb)} GB VRAM` : null,
        backend.gpu ? 'GPU-accelerated.' : 'No GPU detected: runs on the CPU and will be slow, prefer a smaller model.',
      ]
        .filter(Boolean)
        .join(' · ')
    : null

  return (
    <>
      <SettingsGroup label="Remote models" description="Chat with a cloud model. Needs that provider's key above.">
        <RemoteModelList
          models={remote.models}
          activeRef={remote.activeRef}
          busyRef={remote.busyRef}
          onUse={(ref) => void remote.use(ref)}
        />
        {remote.error && (
          <Text as="p" tone="danger" role="alert">
            {remote.error}
          </Text>
        )}
      </SettingsGroup>

      <SettingsGroup
        label="Local models"
        description={LOCAL_HELP}
        actions={
          inactiveCount > 0 && (
            <Button variant="ghost" className="ghost model-clean-btn" onClick={() => void cleanInactive()}>
              Clean up ({inactiveCount} unused)
            </Button>
          )
        }
      >
        {!remote.localRuntime && (
          <SettingRow
            label="Local runtime not installed"
            description="Install the native base in Engine above to run local models."
          />
        )}
        {compute && <SettingRow label="Compute" description={compute} />}
        <CudaCallout
          status={cuda.status}
          installing={cuda.installing}
          message={cuda.message}
          installed={cuda.installed}
          error={cuda.error}
          onInstall={() => void cuda.install()}
        />
        {actionError && (
          <Text as="p" tone="danger" role="alert">
            {actionError}
          </Text>
        )}
        {errorIds.map((id) => (
          <Text as="p" key={id} tone="danger">
            {id}: {errors[id]}
          </Text>
        ))}
        <Box className="model-download-bar">
          <ModelCompareSelect
            options={available}
            value={chosenId}
            onChange={setChosenId}
            recommendedId={recommendedId}
            fits={fits}
          />
          <Button className="model-download-btn" onClick={() => chosenId && download(chosenId)} disabled={!chosenId}>
            Download
          </Button>
        </Box>
        {chosenTooBig && (
          <Box as="p" className="model-warn">
            ⚠ {chosen?.label} (~{chosen?.sizeGb} GB) is larger than your
            {vramGb != null ? ` ~${Math.round(vramGb)} GB` : ''} GPU VRAM. It still runs, partly on
            the CPU and noticeably slower.
          </Box>
        )}
        <InstalledModelList
          models={installed}
          downloading={downloading}
          onSelect={(id) => void selectLocal(id)}
          onRemove={(id) => void removeLocal(id)}
        />
      </SettingsGroup>
    </>
  )
}

export { AiModelPicker }
