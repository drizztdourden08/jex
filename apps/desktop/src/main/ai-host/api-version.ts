import { AI_PLUGIN_API_VERSION } from '@jex/ai-contract'

const MISMATCH = 'The published AI engine is for a different app version. Update Jex, or wait for the next release.'

// An engine built for another plugin API version is refused: this app could not load it.
const assertApiVersion = (apiVersion: number): void => {
  if (apiVersion !== AI_PLUGIN_API_VERSION) throw new Error(MISMATCH)
}

export { assertApiVersion }
