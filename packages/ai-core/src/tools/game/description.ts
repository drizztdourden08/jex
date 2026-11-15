// Store descriptions arrive as HTML. They go to the model as plain text, split into
// pages of about PAGE_CHARS on paragraph, then sentence, boundaries, so a long one
// can be read page by page only when the model needs it.

const PAGE_CHARS = 1500

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '-',
  mdash: '-',
  hellip: '...',
  trade: '(TM)',
  reg: '(R)',
  copy: '(C)',
}

const decodeEntities = (s: string): string =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return NAMED_ENTITIES[code.toLowerCase()] ?? match
    const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match
  })

const htmlToText = (html: string): string =>
  decodeEntities(
    html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*li[^>]*>/gi, '\n- ')
      .replace(/<\s*h[1-6][^>]*>/gi, '\n\n')
      .replace(/<\/\s*(p|div|h[1-6]|ul|ol)\s*>/gi, '\n\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t\f\v\r]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// One paragraph longer than a page: split on sentences, then hard-cut a giant sentence.
const splitLong = (para: string): string[] => {
  if (para.length <= PAGE_CHARS) return [para]
  const sentences = para.match(/[^.!?]*[.!?]+\s*|[^.!?]+$/g) ?? [para]
  const out: string[] = []
  let cur = ''
  for (const s of sentences) {
    if (s.length > PAGE_CHARS) {
      if (cur.trim()) out.push(cur.trim())
      cur = ''
      for (let i = 0; i < s.length; i += PAGE_CHARS) out.push(s.slice(i, i + PAGE_CHARS).trim())
    } else if (cur.length + s.length > PAGE_CHARS) {
      out.push(cur.trim())
      cur = s
    } else {
      cur += s
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out.filter(Boolean)
}

const paginate = (text: string): string[] => {
  const pages: string[] = []
  let cur = ''
  for (const piece of text.split(/\n{2,}/).flatMap(splitLong)) {
    const next = cur ? `${cur}\n\n${piece}` : piece
    if (next.length > PAGE_CHARS && cur) {
      pages.push(cur)
      cur = piece
    } else {
      cur = next
    }
  }
  if (cur) pages.push(cur)
  return pages
}

interface DescriptionPage {
  page: number
  pages: number
  text: string
  hint?: string
}

/** Page `page` (1-based, clamped) of the plain-text description. */
const descriptionPage = (html: string | undefined, page: number): DescriptionPage => {
  const pages = paginate(html ? htmlToText(html) : '')
  if (pages.length === 0) return { page: 1, pages: 0, text: '', hint: 'No description stored for this game.' }
  const at = Math.min(Math.max(1, Math.floor(page) || 1), pages.length)
  const more = at < pages.length
  return {
    page: at,
    pages: pages.length,
    text: pages[at - 1],
    ...(more
      ? { hint: `Page ${at} of ${pages.length}. Call get_game_details again with page:${at + 1} only if you need more.` }
      : {}),
  }
}

export { htmlToText, descriptionPage }
export type { DescriptionPage }
