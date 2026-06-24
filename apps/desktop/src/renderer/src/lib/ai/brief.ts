import type { Game } from '@shared/library'

/** Compact game projection returned to the agent (keeps its context small). */
const brief = (g: Game) => {
  return {
    appid: g.appid,
    name: g.name,
    installed: g.installed,
    playtimeHours: Math.round((g.playtimeForever / 60) * 10) / 10,
    genres: g.genres?.slice(0, 5),
  }
}

export { brief }
