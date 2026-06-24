// The Ed25519 PUBLIC key the app verifies downloaded plugins against (SPKI, base64
// DER). Public keys are safe to commit. The matching PRIVATE key signs the plugin
// manifest in CI (a GitHub secret) — and locally lives only in the gitignored
// plugins/.signing-key.json. To rotate: generate a new pair, replace this constant,
// and update the CI secret (old plugins then fail verification — bump the release).
const PLUGIN_PUBLIC_KEY_SPKI_B64 = 'MCowBQYDK2VwAyEAMhc7ZakGkDZeBZameAvJ9LSlOkR9+A6g3UcJnGHGOrU='

export { PLUGIN_PUBLIC_KEY_SPKI_B64 }
