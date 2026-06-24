import type { ReactNode } from 'react'

type GlyphName = 'send' | 'stop' | 'compose' | 'copy' | 'check'

interface GlyphProps {
  name: GlyphName
  size?: number
  className?: string
}

// Monochrome icons that inherit `currentColor`. `send` (solid paper-plane with a notch)
// and `stop` (plain square) are filled; `compose` is a line icon (inherits the stroke).
const PATHS: Record<GlyphName, ReactNode> = {
  send: <path d="M3 4 21 12 3 20 3 13 13 12 3 11Z" fill="currentColor" stroke="none" />,
  stop: <rect x="6" y="6" width="12" height="12" fill="currentColor" stroke="none" />,
  compose: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
}

const Glyph = ({ name, size = 18, className }: GlyphProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {PATHS[name]}
  </svg>
)

export { Glyph }
export type { GlyphName, GlyphProps }
