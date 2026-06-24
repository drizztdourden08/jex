/**
 * A loadable playbook the agent pulls on demand (progressive disclosure). The core
 * system prompt stays small and routing-focused; the detailed how-to for a specific
 * kind of task lives in a Skill that the model loads via `get_skill` ONLY when the
 * task calls for it — so it absorbs the right detail at the right moment instead of
 * carrying every playbook in every turn.
 */
interface Skill {
  id: string
  /** One line for the prompt's skill menu — names when to load this skill. */
  whenToUse: string
  /** The detailed playbook returned by `get_skill`. */
  guidance: string
}

export type { Skill }
