import './SettingsGroup.css'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import type { SettingsGroupProps } from './SettingsGroup.type'

/**
 * A labelled sub-group inside a SettingsSection: a small caps label (with optional
 * actions), an optional note, then an inset list whose rows are split by hairlines.
 */
const SettingsGroup = ({ label, description, actions, children }: SettingsGroupProps) => (
  <Box className="ds-settings-group" role="group" aria-label={label}>
    <Box className="ds-settings-group-head">
      <Text as="h3" className="ds-settings-group-label">
        {label}
      </Text>
      {actions && <Box className="ds-settings-group-actions">{actions}</Box>}
    </Box>
    {description && (
      <Text as="p" tone="muted" className="ds-settings-group-desc">
        {description}
      </Text>
    )}
    <Box className="ds-settings-group-body">{children}</Box>
  </Box>
)

export { SettingsGroup }
