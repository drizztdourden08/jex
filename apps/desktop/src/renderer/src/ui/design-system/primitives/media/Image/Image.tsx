import { forwardRef } from 'react'
import type { ImageProps } from './Image.type'

/** Image primitive — a thin, ref-forwarding wrapper over <img> so no view reaches
 *  for a raw element. Forwards src/alt/loading/onError; style via `className`. */
const Image = forwardRef<HTMLImageElement, ImageProps>(({ className, alt = '', ...rest }, ref) => (
  <img ref={ref} alt={alt} className={['ds-image', className].filter(Boolean).join(' ')} {...rest} />
))
Image.displayName = 'Image'

export { Image }
