import { Fragment, useEffect, useMemo, useState } from 'react'
import type { ToolCategory, ToolInfo, ToolPolicy } from '@shared/agent'
import { Box } from '@ds/primitives/layout/Box'
import { Select } from '@ds/primitives/form/Select'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import './AiToolsPanel.css'

const TOOLS_HELP =
  'What the assistant may do. Ask first shows a confirm card before the action runs; Always allow runs it silently; Disabled hides it from the AI. Sensitive actions (launching games, changing settings, syncing) default to Ask first. A chat can override this from its footer.'

/**
 * Settings group: a granular list of every capability the AI agent has, grouped
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
    window.api.ai.listTools().then(setTools).catch(() => {})
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
    try {
      await window.api.ai.setToolPolicy(name, policy)
    } catch {
      // Not saved: show what the agent will really use.
      setTools(await window.api.ai.listTools().catch(() => tools))
    }
  }

  if (tools.length === 0) return null

  return (
    <SettingsGroup label="Tools & permissions" description={TOOLS_HELP}>
      {grouped.map(([category, list]) => (
        <Fragment key={category}>
          <Box className="ai-tool-cat">{CATEGORY_LABEL[category] ?? category}</Box>
          {list.map((t) => (
            <SettingRow
              key={t.name}
              label={
                <Box as="span" className="ai-tool-name">
                  <Box as="code">{t.name}</Box>
                  {t.sensitivity === 'sensitive' && <Box as="span" className="badge subtle">Sensitive</Box>}
                </Box>
              }
              description={t.description}
            >
              <Select
                className="ai-tool-policy"
                variant="field"
                value={t.policy}
                options={POLICY_OPTIONS}
                onChange={(v) => void setPolicy(t.name, v as ToolPolicy)}
              />
            </SettingRow>
          ))}
        </Fragment>
      ))}
    </SettingsGroup>
  )
}

export { AiToolsPanel }
