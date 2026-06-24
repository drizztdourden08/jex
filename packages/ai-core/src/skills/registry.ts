import type { Skill } from './types'
import { recommend } from './recommend'
import { facets } from './facets'
import { wishlistGroups } from './wishlistGroups'
import { storePages } from './storePages'

/** Every skill the agent can load. New playbooks are added here and surface in both
 *  the prompt's skill menu and the get_skill tool automatically. */
const SKILLS: Skill[] = [recommend, facets, wishlistGroups, storePages]

const byId = new Map(SKILLS.map((s) => [s.id, s]))

const getSkill = (id: string): Skill | undefined => byId.get(id)

const skillIds = (): string[] => SKILLS.map((s) => s.id)

/** One line per skill for the system prompt's skill menu. */
const skillMenu = (): string => SKILLS.map((s) => `- ${s.id}: ${s.whenToUse}`).join('\n')

export { SKILLS, getSkill, skillIds, skillMenu }
