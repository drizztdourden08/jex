const relDays = (ms: number): string => {
  const d = Math.floor((Date.now() - ms) / 86_400_000)
  if (d <= 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d} days ago`
}

export { relDays }
