interface HltbTimes {
  main: number // hours, main story
  extra: number // hours, main + extras
  complete: number // hours, completionist
}

/**
 * HowLongToBeat times via the maintained `howlongtobeat` package (it tracks
 * HLTB's rotating internal API token, which hand-scraping can't keep up with).
 * Best-effort: any failure (no match, endpoint moved) returns null.
 */
const fetchHltb = async (name: string): Promise<HltbTimes | null> => {
  try {
    const { HowLongToBeatService } = await import('howlongtobeat')
    const results = await new HowLongToBeatService().search(name)
    if (!results?.length) return null
    const g = results[0] // package returns results sorted by name similarity
    const times: HltbTimes = {
      main: g.gameplayMain ?? 0,
      extra: g.gameplayMainExtra ?? 0,
      complete: g.gameplayCompletionist ?? 0,
    }
    return times.main || times.extra || times.complete ? times : null
  } catch {
    return null
  }
}

export { fetchHltb }
export type { HltbTimes }
