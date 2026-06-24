const WORKER_COUNT = 5
const DEFAULT_INTERVAL = 1200
const MAX_INTERVAL = 6000
const IDLE_POLL_MS = 200

// Lower number = sooner. Detail beats the active tab beats background.
const PRI_DETAIL = 0
const PRI_ACTIVE = 10
const PRI_BACKGROUND = 20

export {
  WORKER_COUNT,
  DEFAULT_INTERVAL,
  MAX_INTERVAL,
  IDLE_POLL_MS,
  PRI_DETAIL,
  PRI_ACTIVE,
  PRI_BACKGROUND,
}
