/** Map an origin pathname to the back link's destination + label. */
const backTarget = (from?: string): { to: string; label: string } => {
  if (from?.startsWith('/wishlist')) return { to: '/wishlist', label: 'Wishlist' }
  if (from?.startsWith('/randomizer')) return { to: '/randomizer', label: 'Randomizer' }
  if (from?.startsWith('/search')) return { to: '/search', label: 'Search' }
  return { to: '/library', label: 'Library' }
}

export { backTarget }
