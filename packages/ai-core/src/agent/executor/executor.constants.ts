import type { ToolExecLimits } from './executor.types'

/** Today's local behaviour: tight limits for a weak local model. */
const LOCAL_LIMITS: ToolExecLimits = { maxRepeats: 3, maxPerTool: 5, maxTotal: 24, attempts: 3 }

/** A capable remote model gets more room; a thrown tool is not retried. */
const REMOTE_LIMITS: ToolExecLimits = { maxRepeats: 3, maxPerTool: 8, maxTotal: 40, attempts: 1 }

/** A tool result longer than this is cut before it goes back to a remote model. */
const RESULT_CHAR_LIMIT = 60_000

export { LOCAL_LIMITS, REMOTE_LIMITS, RESULT_CHAR_LIMIT }
