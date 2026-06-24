import { forwardRef } from 'react'
import type { TextInputProps } from './TextInput.type'

/** Text/search input primitive. Base styling comes from the global `input` rule;
 *  pass `className` for width/placement variants. */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ type = 'text', className, ...rest }, ref) => (
    <input ref={ref} type={type} className={['ds-input', className].filter(Boolean).join(' ')} {...rest} />
  ),
)
TextInput.displayName = 'TextInput'

export { TextInput }
