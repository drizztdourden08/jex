import { registerLibraryTools, registerTasteTool } from './library'
import { registerUiTools } from './ui'
import { registerActionTools } from './actions'
import { registerSearchTools } from './search'
import { registerSitemapTools } from './sitemap'
import { registerSkillTools } from './skills'
import { registerProfileTools } from './profile'

/**
 * Registers all AI tools, exactly once, at startup. New tool groups (wishlist,
 * sync, launch, settings…) get their own `registerXTools()` and are added here as
 * later phases land.
 */
let registered = false

const registerAllTools = (): void => {
  if (registered) return
  registered = true
  registerLibraryTools()
  registerTasteTool()
  registerUiTools()
  registerActionTools()
  registerSearchTools()
  registerSitemapTools()
  registerSkillTools()
  registerProfileTools()
}

export { registerAllTools }
export * from './registry'
