// Design-system primitives — generic atoms. Grouped by category folder; this barrel
// is the single import surface (`@ds/primitives`). Raw HTML is allowed only here.
export { Portal } from './util/Portal'
export { Mascot } from './util/Mascot'
export type { MascotProps } from './util/Mascot'
export { SegmentedControl } from './form/SegmentedControl'
export type { SegOption } from './form/SegmentedControl'
export { Slider } from './form/Slider'

export type { Space } from './scales'

export { Box } from './layout/Box'
export type { BoxProps } from './layout/Box'
export { Flex } from './layout/Flex'
export type { FlexProps } from './layout/Flex'
export { Stack } from './layout/Stack'
export type { StackProps } from './layout/Stack'
export { Grid } from './layout/Grid'
export type { GridProps } from './layout/Grid'
export { Divider } from './layout/Divider'
export type { DividerProps } from './layout/Divider'

export { Text } from './text/Text'
export type { TextProps } from './text/Text'

export { Button } from './actions/Button'
export type { ButtonProps } from './actions/Button'
export { IconButton } from './actions/IconButton'
export type { IconButtonProps } from './actions/IconButton'

export { Icon } from './media/Icon'
export type { IconProps } from './media/Icon'

export { Badge } from './feedback/Badge'
export type { BadgeProps } from './feedback/Badge'
export { Chip } from './feedback/Chip'
export type { ChipProps } from './feedback/Chip'
