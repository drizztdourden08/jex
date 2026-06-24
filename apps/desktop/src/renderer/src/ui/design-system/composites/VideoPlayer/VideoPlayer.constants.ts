const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

const fmt = (t: number): string => {
  if (!isFinite(t) || t < 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export { RATES, fmt }
