import { closeSync, fsyncSync, openSync, renameSync, writeSync } from 'node:fs'

/**
 * Durable, atomic file replace: write the bytes to `<file>.tmp`, fsync them to disk,
 * then rename over the target. A crash (app kill, BSOD, power loss) at any point
 * leaves either the previous complete file or the new complete file — never a
 * truncated or zero-filled one, which is what a plain writeFileSync can leave behind.
 */
const writeFileAtomic = (file: string, data: Uint8Array): void => {
  const tmp = `${file}.tmp`
  const fd = openSync(tmp, 'w')
  try {
    let off = 0
    while (off < data.length) off += writeSync(fd, data, off, data.length - off)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(tmp, file)
}

export { writeFileAtomic }
