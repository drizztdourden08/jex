import { forwardRef } from 'react'
import type { RangeInputProps } from './RangeInput.type'

/** Range slider input primitive (`type="range"`) — used for media seek/volume.
 *  Visual styling is supplied by the consumer's class (e.g. the VideoPlayer track). */
const RangeInput = forwardRef<HTMLInputElement, RangeInputProps>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} type="range" className={['ds-range', className].filter(Boolean).join(' ')} {...rest} />
  ),
)
RangeInput.displayName = 'RangeInput'

export { RangeInput }
