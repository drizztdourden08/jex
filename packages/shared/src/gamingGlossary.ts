/**
 * Gaming-jargon glossary: maps the loose terms players actually use to the
 * concrete Steam categories / tags / features the filter engine understands.
 *
 * Used two ways:
 *  - baked into the agent's system prompt (so it translates terms itself), and
 *  - exposed as the `interpret_gaming_terms` tool (a reliable lookup the model can
 *    call, and that we can unit-test deterministically).
 *
 * Values are *candidates* — the resolver intersects them with what actually
 * exists in the user's library so the filter uses real values.
 */
interface GlossaryEntry {
  /** Canonical term. */
  term: string
  /** Other phrasings that should resolve to this entry (lowercase). */
  aliases: string[]
  /** One-line meaning, shown to the model. */
  meaning: string
  categories?: string[]
  tags?: string[]
  features?: string[]
  genres?: string[]
  /** Tags/genres that should be EXCLUDED for this term (op "none"). */
  excludeTags?: string[]
}

const GAMING_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'couch co-op',
    aliases: ['couch coop', 'local co-op', 'local coop', 'split screen', 'split-screen', 'same screen', 'local multiplayer'],
    meaning: 'Two+ players on ONE PC/screen — local/split-screen co-op (not online).',
    categories: ['Shared/Split Screen Co-op', 'Shared/Split Screen', 'Remote Play Together'],
    tags: ['Local Co-Op', 'Couch Co-Op', 'Split Screen', 'Local Multiplayer', '4 Player Local'],
    features: ['coop'],
  },
  {
    term: 'online co-op',
    aliases: ['online coop', 'online multiplayer co-op', 'coop online'],
    meaning: 'Co-op played over the internet with remote players.',
    categories: ['Online Co-op'],
    tags: ['Online Co-Op', 'Co-op'],
    features: ['onlineCoop', 'coop'],
  },
  {
    term: 'soulslike',
    aliases: ['souls-like', 'soulsborne', 'souls like', 'dark souls like'],
    meaning: 'Punishing, deliberate combat with stamina management and death loops, in the Dark Souls lineage.',
    tags: ['Souls-like', 'Soulslike', 'Difficult', 'Dark Fantasy', 'Action RPG'],
  },
  {
    term: 'roguelite',
    aliases: ['rogue-lite', 'rogue lite'],
    meaning: 'Run-based with permanent meta-progression between deaths (softer than roguelike).',
    tags: ['Rogue-lite', 'Roguelite', 'Roguelike', 'Rogue-like', 'Procedural Generation'],
  },
  {
    term: 'roguelike',
    aliases: ['rogue-like', 'rogue like'],
    meaning: 'Run-based with permadeath and little/no persistent progression.',
    tags: ['Roguelike', 'Rogue-like', 'Rogue-lite', 'Roguelite'],
  },
  {
    term: 'metroidvania',
    aliases: ['metroid-vania', 'igavania'],
    meaning: 'Interconnected 2D world gated by abilities you unlock to backtrack.',
    tags: ['Metroidvania', 'Exploration', 'Platformer'],
  },
  {
    term: '4X',
    aliases: ['4x strategy', 'explore expand exploit exterminate'],
    meaning: 'Grand strategy: eXplore, eXpand, eXploit, eXterminate (Civ-style).',
    tags: ['4X', 'Grand Strategy', 'Turn-Based Strategy', 'Strategy'],
    genres: ['Strategy'],
  },
  {
    term: 'CRPG',
    aliases: ['crpg', 'classic rpg', 'isometric rpg', 'party rpg'],
    meaning: 'Deep, party-based, often isometric RPGs (Baldur’s Gate, Pillars).',
    tags: ['CRPG', 'Party-Based RPG', 'Isometric', 'Choices Matter', 'Story Rich'],
    genres: ['RPG'],
  },
  {
    term: 'boomer shooter',
    aliases: ['retro fps', 'old school shooter', 'boomershooter'],
    meaning: 'Fast, retro-style first-person shooters in the Doom/Quake mold.',
    tags: ['Old School', 'Retro', 'FPS', 'First-Person', 'Fast-Paced'],
  },
  {
    term: 'bullet hell',
    aliases: ['shmup', 'shoot em up', "shoot 'em up", 'danmaku', 'bullet-hell'],
    meaning: 'Dense projectile-dodging shooters (vertical/horizontal scrollers).',
    tags: ['Bullet Hell', "Shoot 'Em Up", 'Shmup', 'Danmaku', 'Arcade'],
  },
  {
    term: 'cozy',
    aliases: ['wholesome', 'relaxing', 'chill', 'comfy'],
    meaning: 'Low-stress, comforting games (farming, life-sim, decorating).',
    tags: ['Cozy', 'Wholesome', 'Relaxing', 'Casual', 'Life Sim'],
  },
  {
    term: 'walking simulator',
    aliases: ['walking sim', 'narrative exploration'],
    meaning: 'Story/atmosphere-first games with minimal mechanics.',
    tags: ['Walking Simulator', 'Atmospheric', 'Story Rich', 'Exploration'],
  },
  {
    term: 'deckbuilder',
    aliases: ['deck builder', 'deck-building', 'roguelike deckbuilder', 'card battler'],
    meaning: 'Build a deck of cards as the core mechanic (Slay the Spire-like).',
    tags: ['Deckbuilding', 'Card Battler', 'Roguelike Deckbuilder', 'Card Game'],
  },
  {
    term: 'soulslike metroidvania',
    aliases: ['metroidvania souls'],
    meaning: 'Combines exploration-gated map with souls-style combat.',
    tags: ['Metroidvania', 'Souls-like', 'Difficult'],
  },
  {
    term: 'steam deck friendly',
    aliases: ['steam deck', 'handheld', 'deck verified', 'great on deck'],
    meaning: 'Plays well on a handheld/controller — needs full controller support.',
    features: ['controllerFull'],
    tags: ['Great Soundtrack'],
  },
  {
    term: 'controller friendly',
    aliases: ['with controller', 'gamepad', 'controller support', 'plays with controller'],
    meaning: 'Full controller support (no keyboard/mouse needed).',
    features: ['controllerFull'],
  },
  {
    term: 'party game',
    aliases: ['party games', 'couch competitive', 'local versus', 'local pvp'],
    meaning: 'Multiplayer games for a group in the same room.',
    categories: ['Shared/Split Screen PvP', 'Shared/Split Screen'],
    tags: ['Party Game', 'Local Multiplayer', 'Funny'],
    features: ['multiplayer'],
  },
  {
    term: 'open world',
    aliases: ['openworld', 'sandbox'],
    meaning: 'Large freely-explorable world.',
    tags: ['Open World', 'Sandbox', 'Exploration'],
  },
  {
    term: 'soulslike shooter',
    aliases: ['looter shooter'],
    meaning: 'Loot-driven shooters with RPG progression.',
    tags: ['Looter Shooter', 'Loot', 'FPS', 'RPG'],
  },
  {
    term: 'pvp',
    aliases: ['player versus player', 'competitive'],
    meaning: 'Player-versus-player competition.',
    categories: ['Online PvP', 'PvP'],
    tags: ['PvP', 'Competitive', 'Multiplayer'],
  },
]

/** Find glossary entries whose term/aliases appear in the text (longest match first). */
const lookupGamingTerms = (text: string): GlossaryEntry[] => {
  const hay = ` ${text.toLowerCase()} `
  const hits: GlossaryEntry[] = []
  for (const entry of GAMING_GLOSSARY) {
    const phrases = [entry.term.toLowerCase(), ...entry.aliases]
    if (phrases.some((p) => hay.includes(p.toLowerCase()))) hits.push(entry)
  }
  // Prefer more specific (longer-term) matches first.
  return hits.sort((a, b) => b.term.length - a.term.length)
}

/** A terse one-line-per-term reference for the system prompt. */
const glossaryPromptLines = (): string => {
  return GAMING_GLOSSARY.map((e) => {
    const parts: string[] = []
    if (e.categories) parts.push(`categories~[${e.categories.join(', ')}]`)
    if (e.tags) parts.push(`tags~[${e.tags.join(', ')}]`)
    if (e.features) parts.push(`features=[${e.features.join(', ')}]`)
    if (e.genres) parts.push(`genres=[${e.genres.join(', ')}]`)
    return `- ${e.term}: ${parts.join(' ')}`
  }).join('\n')
}

export { GAMING_GLOSSARY, lookupGamingTerms, glossaryPromptLines }
export type { GlossaryEntry }
