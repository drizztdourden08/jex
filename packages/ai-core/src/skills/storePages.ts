import type { Skill } from './types'

/** Finding/opening Steam web pages and perceiving the live store page. The longest,
 *  least-frequently-needed block — moved out of the always-on prompt. */
const storePages: Skill = {
  id: 'store-pages',
  whenToUse:
    'finding/opening a Steam web page (refund, password, family settings, a game\'s discussions/guides/reviews) or reading/querying the live store page.',
  guidance: [
    'STEAM WEB PAGES & THE LIVE STORE PAGE.',
    'Finding/opening a page: find_steam_page({query}) with what the user wants ("get a refund", "change my password", "sell my trading cards", "family settings", "redeem a key", "on sale", "this game\'s discussions/guides/reviews") → open_steam_page({id}) to open the best match in the Store tab.',
    '- If a result is marked dynamic (a game-specific page: discussions/guides/reviews/DLC) it needs an appid — resolve the game with get_game/search_games, then open_steam_page({id, appid}).',
    '- open_steam_search for a free-text store search.',
    '- If a result is needsAuth, mention the user may need to be signed into Steam in the Store tab.',
    '',
    'Reading/perceiving the OPEN store page (it is a live web page you can query):',
    '- read_store_page with NO args = an overview (text, headings, actions).',
    "- read_store_page WITH a query (selector/containsText/tag/attribute) = matching ELEMENTS as HTML + live attributes — including form state like a checkbox's `checked` or a `<select>` value that plain text hides.",
    '- Read the OVERVIEW first, then a TARGETED query. Results paginate — request the next page if told more exist. scroll_store_page({text}) brings something into view.',
    '- screenshot_store_page shows you the visible viewport as an image (vision-capable models only; store page must be open). Prefer read_store_page for facts; use the screenshot for layout/visuals.',
    '',
    'BROWSING THE STORE YOURSELF (you drive the embedded browser like a person; the user watches the Store tab):',
    '- Loop: store_page_state (where am I?) → read_store_page overview and/or store_list_links({containsText}) (what can I click?) → store_click / store_type / store_select / store_press_key → store_wait_for if content loads late → read again to confirm. Never click blind: list or read first, and re-read after every action because the page changed.',
    '- Navigation tools (open_steam_search, open_steam_page, open_store_page, store_back/forward/reload, store_click) wait for the load and return {url, title}; check them against what you expected.',
    '- store_click: target by visible `text` and/or `selector`, `index` to pick among several matches. On no match you get closeMatches — pick one of those or list links; do not repeat the same call.',
    '- store_type: target a field by `label` (label/placeholder/name) or `selector`; `submit:true` presses Enter. store_select sets dropdowns/checkboxes (age gate: select birth year, then click the continue button).',
    '- Adding a game to the Steam WISHLIST via its store button is fine. NEVER try to buy: purchase/Add to Cart/checkout/gift/payment/sign-in/account pages and password or card fields are hard-blocked and come back as "Refused for safety". When that happens stop and ask the user to do that step themselves in the Store tab.',
    '- Store PREFERENCE pages (content preferences: mature-content checkboxes, ignored tags; notification settings) are allowed: when the user asks you to change one, do it yourself — open it, read the controls, store_select / store_click them, click Save, then re-read to confirm. Do not just tell the user the steps.',
    '- You cannot read cookies or storage, and should not try.',
    '',
    'Helping with a Steam setting (age verification, family sharing): find_steam_page → open_steam_page to the page → read overview → query the specific control → tell the user its exact state/location/steps.',
  ].join('\n'),
}

export { storePages }
