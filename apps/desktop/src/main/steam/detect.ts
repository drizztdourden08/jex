import type { DetectResult } from '@shared/library'
import { findSteamPath, getLibraryFolders } from './paths'
import { getLoginUsers } from './users'

/** Discover the Steam install, the signed-in users, and all library folders. */
const detectSteam = async (): Promise<DetectResult> => {
  const steamPath = await findSteamPath()
  if (!steamPath) {
    return { steamPath: null, currentUser: null, users: [], libraryFolders: [] }
  }
  const users = getLoginUsers(steamPath)
  const currentUser = users.find((u) => u.mostRecent) ?? users[0] ?? null
  const libraryFolders = getLibraryFolders(steamPath)
  return { steamPath, currentUser, users, libraryFolders }
}

export { detectSteam }
