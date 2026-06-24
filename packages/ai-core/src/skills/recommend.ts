import type { Skill } from './types'

/** Playbook for "suggest/recommend a game" — the request that most often makes a weak
 *  model thrash the randomizer. Steers it to ONE scored query, then an answer. */
const recommend: Skill = {
  id: 'recommend',
  whenToUse:
    'recommending or suggesting games — "suggest a game", "what\'s a good X", "best/top/acclaimed/highly-rated", "a game I haven\'t played".',
  guidance: [
    'RECOMMENDING / SUGGESTING GAMES.',
    'Do NOT use roll_randomizer for this. One random pick is not "the best/acclaimed", and re-rolling to hunt for a good one just loops. roll_randomizer is ONLY for "surprise me / pick at random / what should I play right now".',
    '',
    'PERSONALIZE. Use what you already know about the user (the "WHAT YOU KNOW ABOUT THIS USER" section of your instructions). For "based on what I like / my taste", call taste_profile once to get their top genres/tags/features, and bias picks toward those (add the genres/tags to search_store). If the user reveals a new durable preference, save it with remember_about_user.',
    '',
    'From the OWNED library ("what of mine should I play", "a good game I own"):',
    '- set_sort by a score (sortBy:"metacritic" or a review score, sortDir:"desc"), then apply_filter to show them — or query_library to answer in chat. Add unplayedOnly:true for "something I haven\'t played yet".',
    '',
    'From the STORE ("a game to buy", "acclaimed game I never played", "best RPGs to get"):',
    '- Call search_store EXACTLY ONCE. Keep filters MINIMAL: sortBy:"metacritic" (acclaimed) or "reviewTotal" (popular) PLUS at most ONE genre or ONE tag from their taste. Do NOT stack genres+tags+categories+features+platforms — over-filtering buries the acclaimed titles and returns obscure ones. Do NOT add maxPrice/freeOnly/platforms unless the user asked ("I could buy it" is NOT a budget).',
    '- From that ONE result set: drop inLibrary:true (already owns) and comingSoon:true / future-dated (can\'t be acclaimed yet), then pick the 2–4 with the best reviews/reviewPercent and RECOMMEND them. Judge acclaim from reviews/reviewPercent (there is no metacritic number in the results).',
    '- THEN STOP. Do not search again — not for "more famous"/"classic" titles, not by specific game names (Hades, Balatro, …), not "to be sure". The first result set IS your answer. If it looks thin, recommend the best of what you got anyway.',
    '- Present each pick on one line: name — reviews/reviewPercent + a few words on what it is + price. Offer to open one in the Store.',
    '',
    'Example — "recommend a critically acclaimed roguelite I never played":',
    'search_store({ tags:["Roguelike"], sortBy:"metacritic" }) → drop inLibrary:true and comingSoon → recommend the top 2–4 not-owned, each with its reviews/reviewPercent, what it is, and price. Done — no second search.',
  ].join('\n'),
}

export { recommend }
