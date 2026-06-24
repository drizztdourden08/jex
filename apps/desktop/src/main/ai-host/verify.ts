// Verify a downloaded plugin's integrity + authenticity before it is ever loaded.
// The manifest carries each plugin's sha256 (hex) and an Ed25519 signature (base64)
// over that hex string. We re-hash the downloaded zip, confirm it matches the
// manifest, then verify the signature against the embedded public key. Both checks
// must pass — a mismatch means tampering or corruption, and the plugin is rejected.

import { createHash, createPublicKey, verify as edVerify } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { PLUGIN_PUBLIC_KEY_SPKI_B64 } from './signing-key'

const publicKey = createPublicKey({
  key: Buffer.from(PLUGIN_PUBLIC_KEY_SPKI_B64, 'base64'),
  format: 'der',
  type: 'spki',
})

const hashFile = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(file)
      .on('data', (d) => hash.update(d))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })

// True only when the file hashes to `expectedSha256` AND `sigB64` is a valid Ed25519
// signature of that hash by the release key.
const verifyPluginZip = async (
  file: string,
  expectedSha256: string,
  sigB64: string,
): Promise<boolean> => {
  if (!sigB64) return false
  const actual = await hashFile(file)
  if (actual !== expectedSha256) return false
  try {
    return edVerify(null, Buffer.from(expectedSha256), publicKey, Buffer.from(sigB64, 'base64'))
  } catch {
    return false
  }
}

export { verifyPluginZip, hashFile }
