import { forwardRef } from 'react'
import type { Ref } from 'react'
import type { BoxProps } from './Box.type'

// Polymorphic container — renders any element via `as`, forwards ref + all props.
// ref is Ref<any> because `as` makes the underlying element type dynamic (a typed
// HTMLElement ref would reject callers' element-specific refs).
const Box = forwardRef(({ as, children, ...rest }: BoxProps, ref: Ref<any>) => {
  const Tag = as ?? 'div'
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  )
})
Box.displayName = 'Box'

export { Box }
