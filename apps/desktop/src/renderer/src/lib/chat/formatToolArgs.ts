/**
 * Format a tool call's arguments into a compact one-line summary for the chat
 * timeline's tool chips (e.g. `genres: RPG · sortBy: name`). Pure — drops empty
 * values, flattens filter rules, and truncates long values. Shared by the live
 * turn renderer and committed-message rendering.
 */
const fmtVal = (v: unknown): string => {
  if (Array.isArray(v)) return v.map(fmtVal).join(', ')
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('field' in o && 'op' in o) {
      const val = o.value == null ? '' : ` ${fmtVal(o.value)}`
      return `${o.field} ${o.op}${val}`
    }
    return JSON.stringify(v)
  }
  return String(v)
}

const fmtArgs = (args: unknown): string => {
  if (!args || typeof args !== 'object') return ''
  const entries = Object.entries(args as Record<string, unknown>).filter(
    ([, v]) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0),
  )
  return entries
    .map(([k, v]) => {
      if (k === 'rules' && Array.isArray(v)) return v.map(fmtVal).join(' · ')
      const val = fmtVal(v)
      return `${k}: ${val.length > 48 ? `${val.slice(0, 48)}…` : val}`
    })
    .join(' · ')
}

export { fmtArgs, fmtVal }
