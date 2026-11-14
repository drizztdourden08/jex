import { openSync, writeSync, fsyncSync, closeSync, renameSync } from 'node:fs'

/** Crash-safe write: tmp file + fsync + rename over the target. */
const atomicWriteSync = (file: string, bytes: Uint8Array): void => {
  const tmp = `${file}.tmp`
  const fd = openSync(tmp, 'w')
  try {
    writeSync(fd, bytes)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(tmp, file)
}

export { atomicWriteSync }
