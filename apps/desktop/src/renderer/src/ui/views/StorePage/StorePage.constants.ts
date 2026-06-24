// Caps so a single tool result can't blow a local model's context window.
const OVERVIEW_TEXT_CAP = 3000 // page-overview innerText
const ELEMENT_HTML_CAP = 1200 // per matched element's outerHTML
const RESULT_TOTAL_CAP = 6000 // hard ceiling on a query response

// A persistent webview session — the Steam login and browsing state live here and
// survive restarts (and tab switches: this component stays mounted, just hidden).
const STORE_PARTITION = 'persist:steamstore'
const HOME_URL = 'https://store.steampowered.com/'

// Present as a plain desktop Chrome (drop the Electron/app tokens from the default
// UA) so Steam's login flow behaves the same as in a real browser. Derived from
// the running Chromium so it stays accurate across upgrades.
const CHROME_UA = navigator.userAgent.replace(/ (Electron|jex)\/[\d.]+/g, '')

export { OVERVIEW_TEXT_CAP, ELEMENT_HTML_CAP, RESULT_TOTAL_CAP, STORE_PARTITION, HOME_URL, CHROME_UA }
