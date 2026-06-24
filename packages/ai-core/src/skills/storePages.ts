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
    '',
    'Helping with a Steam setting (age verification, family sharing): find_steam_page → open_steam_page to the page → read overview → query the specific control → tell the user its exact state/location/steps.',
  ].join('\n'),
}

export { storePages }
