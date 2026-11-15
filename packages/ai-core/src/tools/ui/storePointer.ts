import { uiTool, ELEMENT_TARGET, BLOCKED } from './storeUiTool'

const TEXT_TARGET = { type: 'string', description: 'Visible text / aria-label / title to match.' } as const
const XY = {
  x: { type: 'number', description: 'Viewport X in CSS pixels (from the screenshot note); use instead of text/selector.' },
  y: { type: 'number', description: 'Viewport Y in CSS pixels.' },
} as const

const hasTarget = (a: Record<string, unknown>) => !!(a.text || a.selector || (typeof a.x === 'number' && typeof a.y === 'number'))

const registerStorePointerTools = (): void => {
  uiTool({
    name: 'store_click',
    description: `Click a link/button/tab/checkbox on the open store page with a real (trusted) mouse click. Target by visible \`text\` and/or CSS \`selector\` (optional \`index\` among matches), or by \`x\`,\`y\` viewport CSS pixels read off a screenshot when no selector works. Scrolls into view, clicks, waits for any navigation, and returns {clicked, url, title, navigated}. For toggle-like targets (checkboxes, Steam's styled filter boxes, tabs) it also returns state:{before,after} so you can tell what happened. If nothing matches you get closeMatches. Adding to the user's WISHLIST via the store button is allowed. ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: { type: 'object', properties: { text: TEXT_TARGET, ...ELEMENT_TARGET, ...XY } },
    summarize: (a) => `Click ${a.text || a.selector ? `"${a.text ?? a.selector}"` : `(${a.x}, ${a.y})`} in the store browser`,
    action: 'storeClick',
    prep: (a) => (hasTarget(a) ? a : { error: 'Provide `text` and/or `selector`, or both `x` and `y`.' }),
  })

  uiTool({
    name: 'store_hover',
    description:
      'Move the mouse over an element (by `text`/`selector`, or `x`,`y` viewport CSS pixels) WITHOUT clicking, for menus and tooltips that open on hover (e.g. the store top menu). Then read_store_page / store_list_links / screenshot to see what appeared and store_click it.',
    sensitivity: 'safe',
    params: { type: 'object', properties: { text: TEXT_TARGET, ...ELEMENT_TARGET, ...XY } },
    action: 'storeHover',
    prep: (a) => (hasTarget(a) ? a : { error: 'Provide `text` and/or `selector`, or both `x` and `y`.' }),
  })

  uiTool({
    name: 'store_select',
    description: `Set a <select> dropdown (by option \`value\` or visible text) or a checkbox/radio/switch (\`checked\` true/false). Also works on Steam's styled (non-native) checkboxes, matched by label text. Target by \`label\` and/or \`selector\`, or pass \`targets\` (max 30 of {label?, selector?, index?, checked?, value?}) to set many boxes in ONE call. \`checked\` is REQUIRED for checkboxes/toggles: omit it and you get an error stating the current state. Read the state first (read_store_page). Returns {changed, checked, state:{before,after}} (changed:false + a note if it was already in that state). ${BLOCKED}`,
    sensitivity: 'sensitive',
    params: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Control label / aria-label / name.' },
        value: { type: 'string', description: 'Option value or text (for <select>).' },
        checked: { type: 'boolean', description: 'Desired state for a checkbox/radio/switch. Required for those; pass false to uncheck.' },
        targets: {
          type: 'array',
          description: 'Batch: several controls in one call (max 30).',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              selector: { type: 'string' },
              index: { type: 'number' },
              checked: { type: 'boolean' },
              value: { type: 'string' },
            },
          },
        },
        ...ELEMENT_TARGET,
      },
    },
    summarize: (a) =>
      Array.isArray(a.targets)
        ? `Set ${a.targets.length} controls in the store browser`
        : `Set ${a.label ?? a.selector ?? 'a control'} to ${a.value ?? a.checked ?? 'on'} in the store browser`,
    action: 'storeSelect',
    prep: (a) =>
      a.label || a.selector || (Array.isArray(a.targets) && a.targets.length)
        ? a
        : { error: 'Provide `label` and/or `selector`, or a non-empty `targets` array.' },
  })
}

export { registerStorePointerTools }
