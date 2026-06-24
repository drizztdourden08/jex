import { forwardRef } from 'react'
import type { NumberInputProps } from './NumberInput.type'

/** Numeric input primitive (`type="number"`). Base styling comes from the global
 *  `input` rule; pass `className` for width/placement variants. */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} type="number" className={['ds-input', className].filter(Boolean).join(' ')} {...rest} />
  ),
)
NumberInput.displayName = 'NumberInput'

export { NumberInput }
