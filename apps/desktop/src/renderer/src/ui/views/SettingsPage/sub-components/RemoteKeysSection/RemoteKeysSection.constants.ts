import type { RemoteEffort, RemoteProviderId } from '@shared/remote-ai'
import type { SegOption } from '@ds/primitives/form/SegmentedControl/SegmentedControl.type'

const PROVIDER_LABEL: Record<RemoteProviderId, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
}

const PROVIDERS: RemoteProviderId[] = ['anthropic', 'openai']

const EFFORT_OPTIONS: SegOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const isEffort = (v: string): v is RemoteEffort => v === 'low' || v === 'medium' || v === 'high'

export { PROVIDER_LABEL, PROVIDERS, EFFORT_OPTIONS, isEffort }
