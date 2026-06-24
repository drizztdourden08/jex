import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { Portal } from '@ds/primitives/util/Portal'
import { Box } from '@ds/primitives/layout/Box'
import { registerOpen, registerClose, shouldKeepOpen, type Entry } from '../exclusiveOpen'

/**
 * The single portal overlay primitive. Renders through a Portal with `position: fixed`
 * anchored to a trigger, so it can never be clipped by an ancestor's overflow. It is a
 * BARE container — no padding/margin/background of its own; the caller's className owns
 * the surface. After it lays out, it measures itself and stays fully inside the viewport
 * (flips above the trigger when there's no room below; clamps horizontally). Registers
 * with the global coordinator: one sibling open at a time, nested overlays stack above
 * their ancestor, rising z-index. Outside-click/Escape close it (a click in a descendant
 * overlay keeps it open). `gap` is the trigger↔menu spacing (0 = seamless/flush).
 */
type Placement = 'top' | 'bottom' | 'auto'
type Align = 'start' | 'end' | 'stretch'

const MARGIN = 8

const Popover = ({ open, anchorRef, placement = 'auto', align = 'stretch', gap = 6, onClose, className, role, children }: PopoverProps) => {
  const popRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties | null>(null)
  const [zIndex, setZIndex] = useState(1000)
  const entryRef = useRef<Entry>({ close: onClose, content: popRef, trigger: anchorRef })
  entryRef.current.close = onClose

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const a = anchorRef.current
      if (!a) return
      const ar = a.getBoundingClientRect()
      const pr = popRef.current?.getBoundingClientRect()
      const ph = pr?.height ?? 0
      const pw = pr?.width ?? ar.width
      const vw = window.innerWidth
      const vh = window.innerHeight
      const roomBelow = vh - ar.bottom
      const up = placement === 'top' || (placement === 'auto' && ph > 0 && roomBelow < ph + gap + MARGIN && ar.top > roomBelow)
      let top = up ? ar.top - gap - ph : ar.bottom + gap
      top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - MARGIN - ph))
      let left = align === 'end' ? ar.right - pw : ar.left
      left = Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - MARGIN - pw))
      const next: CSSProperties = { position: 'fixed', zIndex, top: Math.round(top), left: Math.round(left) }
      if (align === 'stretch') next.minWidth = Math.round(ar.width)
      setStyle(next)
    }
    place()
    // Re-place after the menu has laid out, so its measured size flips/clamps it.
    const raf = requestAnimationFrame(place)
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, anchorRef, placement, align, gap, zIndex])

  useEffect(() => {
    if (!open) return
    setZIndex(registerOpen(entryRef.current))
    const entry = entryRef.current
    return () => registerClose(entry)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!shouldKeepOpen(entryRef.current, e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('mousedown', onDoc, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDoc, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || !style) return null
  return (
    <Portal>
      <Box ref={popRef} className={className} style={style} role={role}>
        {children}
      </Box>
    </Portal>
  )
}

interface PopoverProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  placement?: Placement
  align?: Align
  /** Trigger↔menu spacing in px. 0 makes the menu flush/seamless with the trigger. */
  gap?: number
  onClose: () => void
  className?: string
  role?: string
  children: ReactNode
}

export { Popover }
export type { PopoverProps, Placement, Align }
