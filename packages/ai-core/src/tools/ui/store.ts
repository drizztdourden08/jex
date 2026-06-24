import { registerTool } from '../registry'

const registerStoreTools = (): void => {
  registerTool({
    name: 'open_steam_search',
    description:
      'Search the Steam store for a term, opened inside the embedded store (browse/buy new games).',
    category: 'store',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
    run: async (args, ctx) => {
      const q = String(args.query ?? '').trim()
      if (!q) return { error: 'Provide a search term.' }
      const url = `https://store.steampowered.com/search/?term=${encodeURIComponent(q)}`
      return ctx.ui('navigateStore', { url })
    },
  })

  registerTool({
    name: 'read_store_page',
    description:
      'Read or QUERY the live embedded Steam store page DOM. Call with NO args for a page overview ({url,title,text,headings,actions}). Call with a query to get matching ELEMENTS as HTML + live attributes (incl. form state like checkbox `checked`, `<select>` value, `disabled` — which plain text cannot show). Query fields: selector (CSS, e.g. "input", ".game_purchase_action"), containsText (case-insensitive), tag (e.g. "input","a","h2"), attribute (+ optional attributeValue, e.g. attribute:"checked" or attribute:"type",attributeValue:"checkbox"). Results are paginated — use page/pageSize and call again with the next page if `note` says more are available. Strategy: overview first to learn the page, then a targeted query (e.g. to check whether a setting toggle is on, query its input and read attrs.checked).',
    category: 'store',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector to scope the search.' },
        containsText: { type: 'string', description: 'Keep elements whose visible text contains this.' },
        tag: { type: 'string', description: 'Keep only this tag (a, button, input, h2, …).' },
        attribute: { type: 'string', description: 'Keep elements with this attribute/property (checked, href, type…).' },
        attributeValue: { type: 'string', description: 'Require the attribute to equal this value.' },
        page: { type: 'number', description: '0-based page of matches.' },
        pageSize: { type: 'number', description: 'Matches per page (default 5, max 20).' },
      },
    },
    run: async (args, ctx) => ctx.ui('readStorePage', args),
  })

  registerTool({
    name: 'scroll_store_page',
    description:
      'Scroll the embedded Steam store page so the user can SEE something on it. Pass `text` to scroll to the first place that text appears (e.g. "System Requirements", "Add to Cart", a section or game name), or `to:"top"`/`to:"bottom"` to jump to the start/end. Switches to the Store tab. Call read_store_page first if you need to know what text is on the page. Returns {found, matched}.',
    category: 'store',
    sensitivity: 'safe',
    surface: 'ui',
    params: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Visible text to scroll to (case-insensitive).' },
        to: { enum: ['top', 'bottom'], description: 'Jump to the top or bottom of the page.' },
      },
    },
    run: async (args, ctx) => {
      const text = typeof args.text === 'string' ? args.text.trim() : ''
      const to = args.to === 'top' || args.to === 'bottom' ? args.to : undefined
      if (!text && !to) return { error: 'Provide `text` to scroll to, or `to` ("top" | "bottom").' }
      return ctx.ui('scrollStorePage', { text: text || undefined, to })
    },
  })
}

export { registerStoreTools }
