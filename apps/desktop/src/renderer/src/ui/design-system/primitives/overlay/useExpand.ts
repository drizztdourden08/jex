import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { registerOpen, registerClose, shouldKeepOpen, type Entry } from './exclusiveOpen'

const OPEN_DUR = 380 // --dur-drawer
const CLOSE_DUR = 180 // --dur-base (close is quicker)
const MARGIN = 8
const TITLEBAR = 40

type Rect = { top: number; left: number; width: number; height: number }

/**
 * Drives a dropdown that reads as ONE element expanding from the trigger, PORTALLED so
 * it can't be clipped and clamped to the content zone so it never goes off-screen. It is
 * anchored at the trigger's horizontal CENTER (translateX(-50%)) so growing width expands
 * both sides equally and the collapsed state lands exactly on the trigger — making the
 * last close frame identical to the idle trigger. Re-anchors on scroll/resize (instant),
 * transitions any viewport-fit shift, and is killed when the trigger leaves the viewport.
 */
const useExpand = (open: boolean, onClose: () => void) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const zRef = useRef(1000)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [grown, setGrown] = useState(false)
  const [openWidth, setOpenWidth] = useState<number | undefined>(undefined)
  const [rect, setRect] = useState<Rect | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const entryRef = useRef<Entry>({ close: () => onCloseRef.current(), content: surfaceRef, trigger: triggerRef })

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    setExpanded(false)
    if (!mounted) return
    const id = window.setTimeout(() => {
      setMounted(false)
      setOpenWidth(undefined)
    }, CLOSE_DUR)
    return () => window.clearTimeout(id)
  }, [open, mounted])

  useEffect(() => {
    if (!(open && mounted)) return
    const raf = requestAnimationFrame(() => setExpanded(true))
    return () => cancelAnimationFrame(raf)
  }, [open, mounted])

  useEffect(() => {
    if (!expanded) {
      setGrown(false)
      return
    }
    const id = window.setTimeout(() => setGrown(true), OPEN_DUR)
    return () => window.clearTimeout(id)
  }, [expanded])

  useLayoutEffect(() => {
    if (!mounted) return
    const place = () => {
      const t = triggerRef.current
      if (!t) return
      const r = t.getBoundingClientRect()
      if (r.bottom <= TITLEBAR || r.top >= window.innerHeight || r.right <= 0 || r.left >= window.innerWidth) {
        onCloseRef.current()
        return
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      // Natural content width (clamped) — only used to keep the centered box in-viewport.
      const sw = surfaceRef.current?.scrollWidth
      if (sw) setOpenWidth(Math.min(Math.round(sw), 460))
    }
    zRef.current = registerOpen(entryRef.current)
    place()
    const onScroll = () => place()
    const onDoc = (e: MouseEvent) => {
      if (!shouldKeepOpen(entryRef.current, e.target as Node)) onCloseRef.current()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    window.addEventListener('mousedown', onDoc, true)
    window.addEventListener('keydown', onKey)
    const entry = entryRef.current
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('mousedown', onDoc, true)
      window.removeEventListener('keydown', onKey)
      registerClose(entry)
    }
  }, [mounted])

  const style = useMemo<CSSProperties | null>(() => {
    if (!rect) return null
    const centerX = rect.left + rect.width / 2
    const w = expanded ? openWidth ?? rect.width : rect.width
    const half = w / 2
    let corr = 0
    if (centerX - half < MARGIN) corr = MARGIN - (centerX - half)
    else if (centerX + half > window.innerWidth - MARGIN) corr = window.innerWidth - MARGIN - (centerX + half)
    const maxBody = Math.max(80, Math.round(window.innerHeight - MARGIN - rect.top - rect.height))
    return {
      position: 'fixed',
      top: Math.round(Math.max(TITLEBAR, rect.top)),
      left: Math.round(centerX),
      transform: `translateX(-50%) translateX(${Math.round(corr)}px)`,
      // max-content while open (animated via interpolate-size), trigger width while closed.
      width: expanded ? 'max-content' : `${Math.round(rect.width)}px`,
      minWidth: Math.round(rect.width),
      zIndex: zRef.current,
      ['--ds-maxh' as string]: `${maxBody}px`,
    }
  }, [rect, openWidth, expanded])

  return { triggerRef, surfaceRef, mounted, expanded, grown, style }
}

export { useExpand }
