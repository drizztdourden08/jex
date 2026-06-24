import type { AllHTMLAttributes, ElementType, ImgHTMLAttributes, ReactNode } from 'react'

/** Polymorphic container. Uses AllHTMLAttributes so `<Box as="button" type=…>`,
 *  `<Box as="img" src=…>`, `<Box as="input" value=… onChange=…>` etc. all type-check
 *  (the migration replaces every raw element with Box/Text). `wrap` is omitted because
 *  Flex defines it as a boolean (vs the HTML textarea `wrap` string). `loading` is added
 *  from the img attrs (AllHTMLAttributes lacks it) so `<Box as="img" loading="lazy">`
 *  type-checks. */
interface BoxProps extends Omit<AllHTMLAttributes<HTMLElement>, 'wrap' | 'as'> {
  as?: ElementType
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading']
  children?: ReactNode
}

export type { BoxProps }
