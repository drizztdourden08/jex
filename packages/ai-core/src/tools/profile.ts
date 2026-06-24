import { host } from '../host'
import { registerTool } from './registry'

/**
 * Long-term memory ABOUT THE USER. Durable facts (favorite genres, games they finished
 * or dislike, hardware, how they like recommendations) are persisted by the host under a
 * single meta key in the SQLite mirror (userData), so they survive restarts and inform
 * future turns. The saved notes are also injected into the system prompt each session, so
 * the assistant carries this context without having to read it back every turn.
 */
const KEY = 'aiUserProfile'
const MAX_NOTES = 50
const MAX_LEN = 240

interface Profile {
  notes: string[]
  updatedAt: string
}

const load = (): Profile => {
  const p = host().db.getMeta<Profile>(KEY)
  return { notes: Array.isArray(p?.notes) ? p!.notes.filter((n) => typeof n === 'string') : [], updatedAt: p?.updatedAt ?? '' }
}

const save = (notes: string[]): Profile => {
  const profile: Profile = { notes: notes.slice(-MAX_NOTES), updatedAt: new Date().toISOString() }
  host().db.setMeta(KEY, profile)
  return profile
}

const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

const registerProfileTools = (): void => {
  registerTool({
    name: 'remember_about_user',
    description:
      'Save ONE durable fact about the user so you remember it in future chats — e.g. a favorite/disliked genre or tag, a game they finished or love, their hardware, or how they like recommendations. Use it whenever the user reveals a lasting preference. Do NOT save one-off requests, secrets, or anything they asked you not to keep. Persisted locally.',
    category: 'memory',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: { note: { type: 'string', description: 'A short, self-contained fact, e.g. "Loves roguelikes and soulslikes; dislikes sports games."' } },
      required: ['note'],
    },
    run: async (args) => {
      const note = String(args.note ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN)
      if (!note) return { error: 'Provide a non-empty note.' }
      const { notes } = load()
      if (notes.some((n) => norm(n) === norm(note))) return { saved: false, reason: 'already known', count: notes.length }
      const profile = save([...notes, note])
      return { saved: true, note, count: profile.notes.length }
    },
  })

  registerTool({
    name: 'get_user_profile',
    description:
      'Recall everything you have saved about the user (their durable preferences and facts). Use it to personalize answers and recommendations. Returns the saved notes.',
    category: 'memory',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const { notes, updatedAt } = load()
      return { notes, count: notes.length, updatedAt }
    },
  })

  registerTool({
    name: 'forget_about_user',
    description:
      'Remove a saved fact about the user when they ask you to forget it or correct it. Pass text that matches the note to drop (case-insensitive substring).',
    category: 'memory',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: { match: { type: 'string', description: 'Text contained in the note(s) to remove.' } },
      required: ['match'],
    },
    run: async (args) => {
      const match = norm(String(args.match ?? ''))
      if (!match) return { error: 'Provide text to match.' }
      const { notes } = load()
      const kept = notes.filter((n) => !norm(n).includes(match))
      save(kept)
      return { removed: notes.length - kept.length, count: kept.length }
    },
  })
}

export { registerProfileTools }
