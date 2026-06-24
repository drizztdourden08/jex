import { useId } from 'react'
import { MascotDefs } from './sub-components/MascotDefs'
import { MascotBody } from './sub-components/MascotBody'
import type { MascotProps } from './Mascot.type'
import './Mascot.css'

/** The Jex scanner-sprite mascot — a static logo or an animated character per `state`. */
const Mascot = ({ size = 128, state = 'static', title = 'Jex', className }: MascotProps) => {
  // useId() can contain ':' which is invalid inside url(#…) references — strip it.
  const uid = useId().replace(/:/g, '')
  const rootClass = ['mascot', `mascot--${state}`, className].filter(Boolean).join(' ')

  return (
    <svg
      className={rootClass}
      width={size}
      height={size}
      viewBox="48 26 408 408"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <MascotDefs uid={uid} />
      <MascotBody uid={uid} />
    </svg>
  )
}

export { Mascot }
