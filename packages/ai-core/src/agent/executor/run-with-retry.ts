type RetryOutcome = { ok: true; value: unknown } | { ok: false; error: string }

/**
 * Run a tool up to `attempts` times for transient failures (e.g. a UI-bridge
 * timeout). Only a THROWN error is retried; a tool that returns an error object is
 * a normal result. Never throws.
 */
const runWithRetry = async (
  fn: () => Promise<unknown>,
  attempts: number,
  signal?: AbortSignal,
): Promise<RetryOutcome> => {
  let lastErr: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return { ok: true, value: await fn() }
    } catch (e) {
      lastErr = e
      if (attempt < attempts && !signal?.aborted) await new Promise((r) => setTimeout(r, 300 * attempt))
      else break
    }
  }
  return { ok: false, error: lastErr instanceof Error ? lastErr.message : String(lastErr) }
}

export { runWithRetry }
export type { RetryOutcome }
