import { registerTool } from '../registry'
import type { ToolDef } from '../registry'

const ELEMENT_TARGET = {
  selector: { type: 'string', description: 'CSS selector (use a selector hint from store_list_links / read_store_page).' },
  index: { type: 'number', description: '0-based pick among several matches (default 0).' },
} as const

const BLOCKED =
  'Purchase / checkout / cart / gift / payment / sign-in / account buttons and pages, and password or card fields, are hard-blocked: they return a refusal. When that happens, STOP and ask the user to do that step themselves in the Store tab.'

const uiTool = (def: Omit<ToolDef, 'category' | 'surface' | 'run'> & { action: string; prep?: (a: Record<string, unknown>) => Record<string, unknown> | { error: string } }): void => {
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

const registerStoreBrowseTools = (): void => {
  uiTool({
    name: 'store_page_state',
    description:
      'State of the embedded Steam store browser: url, title, canGoBack/canGoForward, isLoading, scroll position + page height, and a logged-in hint. Call first when you are unsure where the browser is.',
    sensitivity: 'safe',
    params: { type: 'object', properties: {} },
    action: 'storeState',
  })

  for (const [name, action, what] of [
    ['store_back', 'storeBack', 'Go back one page'],
    ['store_forward', 'storeForward', 'Go forward one page'],
    ['store_reload', 'storeReload', 'Reload the current page'],
  ] as const) {
    uiTool({
      name,
      description: `${what} in the embedded Steam store browser. Waits for the page to finish loading, then returns {url, title, navigated, timedOut}.`,
      sensitivity: 'safe',
      params: { type: 'object', properties: {} },
      action,
    })
  }

  uiTool({
    name: 'store_list_links',
    description:
      'List the visible links and buttons on the open store page ({text, href, selector, kind}), paged, so you can pick what to store_click. Items marked restricted:true are purchase/login/account controls that will be refused. Filter with containsText; inViewport:true limits to what is on screen.',
    sensitivity: 'safe',
    params: {
      type: 'object',
      properties: {
        containsText: { type: 'string', description: 'Keep links whose text or href contains this.' },
        page: { type: 'number', description: '0-based page.' },
        pageSize: { type: 'number', description: 'Items per page (default 25, max 50).' },
        inViewport: { type: 'boolean', description: 'Only links currently on screen.' },
      },
    },
    action: 'storeListLinks',
  })

  uiTool({
    name: 'store_click',
    description: `Click a link/button/tab on the open store page. Target by visible \`text\` (case-insensitive; exact matches rank first) and/or CSS \`selector\`, with optional \`index\` among matches. Scrolls it into view, clicks, waits for any resulting navigation, and returns {clicked, url, title, navigated}. If nothing matches you get closeMatches. Adding to the user's WISHLIST via the store button is allowed. ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: {
      type: 'object',
      properties: { text: { type: 'string', description: 'Visible text / aria-label / title to match.' }, ...ELEMENT_TARGET },
    },
    summarize: (a) => `Click "${a.text ?? a.selector}" in the store browser`,
    action: 'storeClick',
    prep: (a) => (a.text || a.selector ? a : { error: 'Provide `text` and/or `selector`.' }),
  })

  uiTool({
    name: 'store_type',
    description: `Type into a text input/textarea on the store page (e.g. the search box). Target by \`label\` (label text, placeholder, aria-label or name) and/or \`selector\`. Fires real input/change events so Steam's scripts react. \`submit:true\` presses Enter / submits the form. \`append:true\` keeps existing text. Never types into password, card or payment fields. ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Text to enter.' },
        label: { type: 'string', description: 'Field label / placeholder / aria-label / name.' },
        submit: { type: 'boolean', description: 'Press Enter / submit afterwards.' },
        append: { type: 'boolean', description: 'Append instead of replacing.' },
        ...ELEMENT_TARGET,
      },
      required: ['value'],
    },
    summarize: (a) => `Type "${String(a.value ?? '').slice(0, 60)}" into ${a.label ?? a.selector ?? 'a field'} in the store browser`,
    action: 'storeType',
    prep: (a) => (a.label || a.selector ? a : { error: 'Provide `label` and/or `selector` to say which field.' }),
  })

  uiTool({
    name: 'store_select',
    description: `Set a <select> dropdown (by option \`value\` or visible text) or a checkbox/radio/switch (\`checked\` true/false) on the store page. Target by \`label\` and/or \`selector\`. Fires change events. ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Control label / aria-label / name.' },
        value: { type: 'string', description: 'Option value or text (for <select>).' },
        checked: { type: 'boolean', description: 'Desired state for checkbox/radio/switch (default true).' },
        ...ELEMENT_TARGET,
      },
    },
    summarize: (a) => `Set ${a.label ?? a.selector ?? 'a control'} to ${a.value ?? a.checked ?? 'on'} in the store browser`,
    action: 'storeSelect',
    prep: (a) => (a.label || a.selector ? a : { error: 'Provide `label` and/or `selector` to say which control.' }),
  })

  uiTool({
    name: 'store_press_key',
    description: `Press Enter, Escape, Tab, ArrowUp/Down/Left/Right on the focused element, or on a target (\`label\`/\`selector\`). Enter submits a focused input or activates a focused button/link. Waits for any resulting navigation. ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: {
      type: 'object',
      properties: {
        key: { enum: ['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] },
        label: { type: 'string', description: 'Optional target field/control label.' },
        shift: { type: 'boolean', description: 'With Tab: move focus backwards.' },
        ...ELEMENT_TARGET,
      },
      required: ['key'],
    },
    summarize: (a) => `Press ${a.key} in the store browser`,
    action: 'storePressKey',
  })

  uiTool({
    name: 'store_wait_for',
    description:
      'Wait until `text` appears in the page or a visible element matches `selector` (poll, max ~10 s). Use after a click/type when the page loads content asynchronously. Returns {found, waitedMs, url, title}; found:false means it timed out.',
    sensitivity: 'safe',
    params: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to wait for (case-insensitive).' },
        selector: { type: 'string', description: 'CSS selector to wait for (must be visible).' },
        timeoutMs: { type: 'number', description: 'Max wait in ms (default 8000, capped at 10000).' },
      },
    },
    action: 'storeWaitFor',
  })
}

export { registerStoreBrowseTools }
