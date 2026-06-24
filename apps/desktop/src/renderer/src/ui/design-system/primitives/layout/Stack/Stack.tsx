import { Flex } from '../Flex'
import type { StackProps } from './Stack.type'

// Vertical stack — a Flex column with a sensible default gap.
const Stack = ({ gap = 3, ...rest }: StackProps) => (
  <Flex direction="column" gap={gap} {...rest} />
)

export { Stack }
