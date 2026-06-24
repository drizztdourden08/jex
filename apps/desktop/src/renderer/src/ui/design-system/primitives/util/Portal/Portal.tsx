import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Renders children into <body> so popovers/dialogs escape any overflow/stacking
 *  context and sit above everything. */
const Portal = ({ children }: { children: ReactNode }) => {
  const [el] = useState(() => document.createElement('div'))
  useEffect(() => {
    el.className = 'portal-root'
    document.body.appendChild(el)
    return () => {
      document.body.removeChild(el)
    }
  }, [el])
  return createPortal(children, el)
}

export { Portal }
