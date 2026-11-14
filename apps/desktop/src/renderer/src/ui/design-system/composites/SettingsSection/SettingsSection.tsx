import './SettingsSection.css'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import type { SettingsSectionProps } from './SettingsSection.type'

/**
 * One glass card per settings area: a title, an optional lead line, then its groups
 * stacked with even spacing. Domain-agnostic; pair with SettingsGroup + SettingRow.
 */
const SettingsSection = ({ title, description, children, id }: SettingsSectionProps) => (
  <Box as="section" className="ds-settings-section" id={id} aria-label={title}>
    <Box className="ds-settings-section-head">
      <Text as="h2" className="ds-settings-section-title">
        {title}
      </Text>
      {description && (
        <Text as="p" tone="muted" className="ds-settings-section-desc">
          {description}
        </Text>
      )}
    </Box>
    <Box className="ds-settings-section-body">{children}</Box>
  </Box>
)

export { SettingsSection }
