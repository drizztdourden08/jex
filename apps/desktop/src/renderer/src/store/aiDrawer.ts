import { create } from 'zustand'

interface AiDrawerState {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/** Open/closed state for the AI command drawer (toggled by the top bar + Ctrl/Cmd+K). */
const useAiDrawer = create<AiDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}))

export { useAiDrawer }
