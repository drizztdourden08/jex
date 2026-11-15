import { useEffect, useRef } from 'react'

/**
 * Modal behavior: Escape closes, and on open focus moves to the element marked
 * data-autofocus inside the panel (falling back to the panel itself).
 */
const useDialogBehavior = (open: boolean, onClose: () => void) => {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const target = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current
    target?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      previous?.focus?.()
    }
  }, [open])

  return { panelRef }
}

export { useDialogBehavior }
