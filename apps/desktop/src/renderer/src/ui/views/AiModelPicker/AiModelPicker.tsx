import { useEffect, useState } from 'react'
import { useModelCatalog } from './behavior/useModelCatalog'
import { useCudaInstall } from './behavior/useCudaInstall'
import { useRemoteModels } from './behavior/useRemoteModels'
import { RemoteModelList } from './sub-components/RemoteModelList'
import { ModelCompareSelect } from './sub-components/ModelCompareSelect'
import { InstalledModelList } from './sub-components/InstalledModelList'
import { CudaCallout } from './sub-components/CudaCallout'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import './AiModelPicker.css'

const BACKEND_LABEL: Record<string, string> = {
  cuda: 'NVIDIA GPU (CUDA)',
  vulkan: 'GPU (Vulkan)',
  metal: 'Apple GPU (Metal)',
  cpu: 'CPU only',
}

/**
 * Settings model picker (View). Composes the catalog hook with two bare
 * sub-components: a compare-dropdown of downloadable models with a Download
 * button beside it, and a list of installed + currently-downloading models (the
 * latter showing live per-row progress). Downloads keep running and reporting
 * even after navigating away, since their state lives in the global store.
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
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }
  const removeLocal = async (id: string) => {
    setActionError(null)
    try {
      await remove(id)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
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

  return (
    <Box className="panel">
      <Box as="h3">AI model</Box>
      <Box as="h4" className="model-installed-title">Remote models</Box>
      <RemoteModelList
        models={remote.models}
        activeRef={remote.activeRef}
        busyRef={remote.busyRef}
        onUse={(ref) => void remote.use(ref)}
      />
      {remote.error && (
        <Box as="p" className="model-error" role="alert">
          {remote.error}
        </Box>
      )}

      <Box as="h4" className="model-installed-title">Local models</Box>
      {!remote.localRuntime && (
        <Box as="p" className="muted model-warn">
          Local runtime not installed. Install the native base in the AI engine section to run
          local models.
        </Box>
      )}
      <Box as="p" className="muted model-intro">
        Local models run fully on your PC — no account, no key, nothing leaves your
        machine. These are Qwen reasoning models; bigger ones are smarter and better at using the
        app's tools but need more disk and RAM. Each is a one-time download.
      </Box>
      {backend && (
        <Box as="p" className="muted model-intro">
          Compute: <Box as="strong">{BACKEND_LABEL[backend.backend] ?? backend.backend}</Box>
          {backend.deviceName ? ` · ${backend.deviceName}` : ''}
          {vramGb != null ? ` · ${Math.round(vramGb)} GB VRAM` : ''}.{' '}
          {backend.gpu
            ? 'Inference is GPU-accelerated.'
            : '⚠ No GPU detected — inference runs on the CPU and will be slow. Prefer a smaller model.'}
        </Box>
      )}
      <CudaCallout
        status={cuda.status}
        installing={cuda.installing}
        message={cuda.message}
        installed={cuda.installed}
        error={cuda.error}
        onInstall={() => void cuda.install()}
      />
      {actionError && (
        <Box as="p" className="model-error" role="alert">
          {actionError}
        </Box>
      )}
      {errorIds.map((id) => (
        <Box as="p" key={id} className="model-error">
          {id}: {errors[id]}
        </Box>
      ))}

      <Box className="model-download-bar">
        <ModelCompareSelect
          options={available}
          value={chosenId}
          onChange={setChosenId}
          recommendedId={recommendedId}
          fits={fits}
        />
        <Button
          className="model-download-btn"
          onClick={() => chosenId && download(chosenId)}
          disabled={!chosenId}
        >
          Download
        </Button>
      </Box>
      {chosenTooBig && (
        <Box as="p" className="muted model-warn">
          ⚠ {chosen?.label} (~{chosen?.sizeGb} GB) is larger than your{' '}
          {vramGb != null ? `~${Math.round(vramGb)} GB` : ''} GPU VRAM. It will still run, but partly
          on the CPU and noticeably slower.
        </Box>
      )}

      <Box className="model-installed-head">
        <Box as="h4" className="model-installed-title">Installed models</Box>
        {inactiveCount > 0 && (
          <Button variant="ghost" className="ghost model-clean-btn" onClick={() => void cleanInactive()}>
            Clean up ({inactiveCount} unused)
          </Button>
        )}
      </Box>
      <InstalledModelList
        models={installed}
        downloading={downloading}
        onSelect={(id) => void selectLocal(id)}
        onRemove={(id) => void removeLocal(id)}
      />
    </Box>
  )
}

export { AiModelPicker }
