import './Spinner.css'
import type { SpinnerProps } from './Spinner.type'

// Indeterminate loading ring; the label is read by assistive tech.
const Spinner = ({ label = 'Loading', className, ...rest }: SpinnerProps) => (
  <span role="status" aria-label={label} className={['ds-spinner', className].filter(Boolean).join(' ')} {...rest} />
)

export { Spinner }
