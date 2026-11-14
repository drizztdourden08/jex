import type { Game } from '@shared/library'

const statusFor = (game: Game): string => {
  const sizeGb = game.sizeOnDisk ? (game.sizeOnDisk / 1e9).toFixed(1) : null
  if (game.installed) return `Installed${sizeGb ? ` · ${sizeGb} GB` : ''}`
  return game.owned ? 'Owned (not installed)' : 'Not installed'
}

export { statusFor }
