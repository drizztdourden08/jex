import { registerTool } from '../registry'
import type { ToolDef } from '../registry'

const ELEMENT_TARGET = {
  selector: { type: 'string', description: 'CSS selector (use a selector hint from store_list_links / read_store_page).' },
  index: { type: 'number', description: '0-based pick among several matches (default 0).' },
} as const

const BLOCKED =
  'Purchase / checkout / cart / gift / payment / sign-in / account buttons and pages, and password or card fields, are hard-blocked: they return a refusal. When that happens, STOP and ask the user to do that step themselves in the Store tab.'

type UiToolDef = Omit<ToolDef, 'category' | 'surface' | 'run'> & {
  action: string
  prep?: (a: Record<string, unknown>) => Record<string, unknown> | { error: string }
}

/** Register a store-category tool that forwards its args to a renderer UI action. */
const uiTool = (def: UiToolDef): void => {
  const { action, prep, ...rest } = def
  registerTool({
    ...rest,
    category: 'store',
    surface: 'ui',
    run: async (args, ctx) => {
      const payload = prep ? prep(args) : args
      if ('error' in payload && typeof payload.error === 'string') return payload
      return ctx.ui(action, payload)
    },
  })
}

export { uiTool, ELEMENT_TARGET, BLOCKED }
