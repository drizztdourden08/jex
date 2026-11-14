import { create } from 'zustand'

const KEY = 'jex.sidebar.collapsed'

// Collapsed by default; a stored explicit "0" means the viewer expanded it.
const read = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
}

const write = (collapsed: boolean): void => {
  try {
    localStorage.setItem(KEY, collapsed ? '1' : '0')
  } catch {
    /* storage unavailable — state stays in memory */
  }
}

interface SidebarState {
  collapsed: boolean
  toggle: () => void
}

/** Collapsed/expanded state of the main side nav, persisted per viewer. */
const useSidebar = create<SidebarState>((set, get) => ({
  collapsed: read(),
  toggle: () => {
    const collapsed = !get().collapsed
    write(collapsed)
    set({ collapsed })
  },
}))

export { useSidebar }
