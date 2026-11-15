// Which installed plugin is the loaded engine, and which installed plugins failed the
// apiVersion check (stale: installed by an older Jex, unusable until re-installed).
// In-memory only; recomputed at every startup.
let loadedId: string | null = null
const stale = new Set<string>()

const getLoadedId = (): string | null => loadedId
const setLoadedId = (id: string | null): void => {
  loadedId = id
}

const markStale = (id: string): void => {
  stale.add(id)
}
const clearStale = (ids: string[]): void => ids.forEach((id) => stale.delete(id))
const isStale = (id: string): boolean => stale.has(id)
const staleIds = (): string[] => [...stale]

export { getLoadedId, setLoadedId, markStale, clearStale, isStale, staleIds }
