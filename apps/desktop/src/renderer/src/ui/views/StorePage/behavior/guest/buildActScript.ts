import { guardPrelude } from './guardPrelude'
import { findPrelude } from './findPrelude'
import { inputPrelude } from './inputPrelude'
import { clickOp, typeOp, selectOp, keyOp } from './ops'
import { linksOp, stateOp, hasOp } from './readOps'
import type { StoreActOp } from '@/store/storeNav'

const OPS: Record<StoreActOp, string> = {
  click: clickOp,
  type: typeOp,
  select: selectOp,
  key: keyOp,
  links: linksOp,
  state: stateOp,
  has: hasOp,
}

/**
 * Assemble the guest script for one op: shared guard + find + input helpers, then the
 * op itself. Runs inside the store webview; never reads or returns cookies/storage.
 */
const buildActScript = (op: StoreActOp, args: Record<string, unknown>): string => `(() => {
  const A = ${JSON.stringify(args ?? {})};
  const ops = {};
  ${guardPrelude}
  ${findPrelude}
  ${inputPrelude}
  ${OPS[op]}
  try { return ops[${JSON.stringify(op)}](A); }
  catch (e) { return { error: 'Page script failed: ' + (e && e.message ? e.message : e) }; }
})()`

export { buildActScript }
