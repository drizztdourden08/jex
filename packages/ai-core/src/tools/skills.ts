import { registerTool } from './registry'
import { getSkill, skillIds } from '../skills'

/**
 * The meta-tool that makes progressive disclosure work: the model loads a focused
 * playbook for the task at hand instead of carrying every playbook in its prompt.
 * Pure read; never mutates anything.
 */
const registerSkillTools = (): void => {
  registerTool({
    name: 'get_skill',
    description:
      'Load a short playbook with the exact steps for a kind of task BEFORE you act on it. Call this FIRST whenever a request matches one of the skills listed in your instructions (recommending games, classifying filter facets/jargon, managing wishlist groups, reading Steam web pages). Returns the guidance to follow — do not guess the steps from memory when a skill exists. `id` is the skill name.',
    category: 'system',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: `One of: ${skillIds().join(', ')}.` },
      },
      required: ['id'],
    },
    run: async (args) => {
      const id = String(args.id ?? '')
      const skill = getSkill(id)
      if (!skill) return { error: `No skill "${id}".`, available: skillIds() }
      return { id: skill.id, guidance: skill.guidance }
    },
  })
}

export { registerSkillTools }
