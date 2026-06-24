import { useEffect, useMemo, useState } from 'react'
import type { ToolCategory, ToolInfo, ToolPolicy } from '@shared/agent'
import { Box } from '@ds/primitives/layout/Box'
import { Select } from '@ds/primitives/form/Select'
import './AiToolsPanel.css'

/**
 * Settings panel: a granular list of every capability the AI agent has, grouped
 * by category, with a per-tool policy. Disabled tools are never even offered to
 * the model. Backed by the same registry the agent reads (config.json overrides).
 */
const POLICY_LABEL: Record<ToolPolicy, string> = {
  allow: 'Always allow',
  confirm: 'Ask first',
  disabled: 'Disabled',
}

const POLICY_OPTIONS = (Object.keys(POLICY_LABEL) as ToolPolicy[]).map((p) => ({
  value: p,
  label: POLICY_LABEL[p],
}))

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  navigation: 'Navigation',
  library: 'Library',
  filter: 'Filtering',
  wishlist: 'Wishlist',
  sync: 'Sync',
  launch: 'Launch & external',
  store: 'Steam store pages',
  settings: 'App settings',
  secrets: 'Secrets',
  system: 'Assistant skills',
  memory: 'Memory about you',
}

const AiToolsPanel = () => {
  const [tools, setTools] = useState<ToolInfo[]>([])

  useEffect(() => {
    window.api.ai.listTools().then(setTools)
  }, [])

  const grouped = useMemo(() => {
    const m = new Map<ToolCategory, ToolInfo[]>()
    for (const t of tools) {
      const arr = m.get(t.category) ?? []
      arr.push(t)
      m.set(t.category, arr)
    }
    return [...m.entries()]
  }, [tools])

  const setPolicy = async (name: string, policy: ToolPolicy) => {
    setTools((ts) => ts.map((t) => (t.name === name ? { ...t, policy, overridden: true } : t)))
    await window.api.ai.setToolPolicy(name, policy)
  }

  if (tools.length === 0) return null

  return (
    <Box className="panel">
      <Box as="h3">AI tools &amp; permissions</Box>
      <Box as="p" className="muted" style={{ marginTop: 0 }}>
        Control what the assistant can do. <Box as="strong">Ask first</Box> shows a confirm card
        before the action runs; <Box as="strong">Always allow</Box> runs it silently;{' '}
        <Box as="strong">Disabled</Box> hides the capability from the AI entirely. Sensitive
        actions (launching games, changing settings, syncing) default to “Ask first”.
      </Box>

      {grouped.map(([category, list]) => (
        <Box key={category} className="ai-tool-group">
          <Box className="ai-tool-cat">{CATEGORY_LABEL[category] ?? category}</Box>
          {list.map((t) => (
            <Box key={t.name} className="ai-tool-row">
              <Box className="ai-tool-info">
                <Box className="ai-tool-name">
                  <Box as="code">{t.name}</Box>
                  {t.sensitivity === 'sensitive' && <Box as="span" className="badge subtle">Sensitive</Box>}
                </Box>
                <Box className="muted ai-tool-desc">{t.description}</Box>
              </Box>
              <Select
                className="ai-tool-policy"
                variant="field"
                value={t.policy}
                options={POLICY_OPTIONS}
                onChange={(v) => void setPolicy(t.name, v as ToolPolicy)}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export { AiToolsPanel }
