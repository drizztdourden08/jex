// Spacing scale helper — maps a numeric step to a spacing token (or '0').
// Shared by the layout primitives so gap/space props stay token-driven.

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10

const sp = (s?: Space): string | undefined =>
  s == null ? undefined : s === 0 ? '0' : `var(--sp-${s})`

export type { Space }
export { sp }
