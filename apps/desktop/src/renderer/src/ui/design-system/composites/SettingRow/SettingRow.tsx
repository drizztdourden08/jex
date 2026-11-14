import './SettingRow.css'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import type { SettingRowProps } from './SettingRow.type'

/**
 * One setting: label + description on the left, its control on the right (or under it
 * when stacked). Rows in a SettingsGroup are split by hairlines.
 */
const SettingRow = ({ label, description, children, layout = 'inline', control = 'auto' }: SettingRowProps) => (
  <Box className="ds-setting-row" data-layout={layout} data-control={control}>
    <Box className="ds-setting-row-text">
      <Text as="span" className="ds-setting-row-label">
        {label}
      </Text>
      {description && (
        <Text as="span" tone="muted" className="ds-setting-row-desc">
          {description}
        </Text>
      )}
    </Box>
    {children && <Box className="ds-setting-row-control">{children}</Box>}
  </Box>
)

export { SettingRow }
