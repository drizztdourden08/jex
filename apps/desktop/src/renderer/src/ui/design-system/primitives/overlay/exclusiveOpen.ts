import type { RefObject } from 'react'

// Global coordinator for portal overlays (dropdowns/menus). A stack drives three things:
//  1. Single-open — opening a NEW overlay closes any open SIBLING (one at a time)…
//  2. …but a NESTED overlay (its trigger lives inside an already-open overlay) is kept
//     stacked above its ancestor instead of closing it.
//  3. Rising z-index so a later-opened overlay always paints above earlier ones.
// It also answers outside-click: an overlay stays open while the click lands in itself,
// its trigger, or any descendant overlay above it.
interface Entry {
  close: () => void
  content: RefObject<HTMLElement | null>
  trigger: RefObject<HTMLElement | null>
}

const stack: Entry[] = []
let z = 1000

const registerOpen = (entry: Entry): number => {
  // Close every open overlay that does NOT contain this one's trigger (siblings),
  // top-down; stop at the first ancestor so nested overlays keep it open beneath.
  while (stack.length) {
    const top = stack[stack.length - 1]
    const t = entry.trigger.current
    if (t && top.content.current && top.content.current.contains(t)) break
    top.close()
    stack.pop()
  }
  z += 1
  stack.push(entry)
  return z
}

const registerClose = (entry: Entry): void => {
  const i = stack.indexOf(entry)
  if (i >= 0) stack.splice(i, 1)
}

/** Should `entry` stay open for a click on `target`? Yes if the click is inside the
 *  overlay, its trigger, or any descendant overlay stacked above it. */
const shouldKeepOpen = (entry: Entry, target: Node): boolean => {
  if (entry.content.current?.contains(target)) return true
  if (entry.trigger.current?.contains(target)) return true
  const i = stack.indexOf(entry)
  if (i < 0) return false
  for (let j = i + 1; j < stack.length; j++) {
    if (stack[j].content.current?.contains(target)) return true
  }
  return false
}

export { registerOpen, registerClose, shouldKeepOpen }
export type { Entry }
