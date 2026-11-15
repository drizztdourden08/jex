/**
 * select op. Dropdowns are set here; toggles (native, ARIA or Steam's styled boxes) return
 * a plan {toggle, state, aim} and the host clicks (trusted) and verifies, so the click and
 * the after-state read never share one guest call.
 */
const selectOp = String.raw`
ops.select = (A) => {
  const bad = refusePage(); if (bad) return bad;
  let f = find({ selector: A.selector, text: A.label, index: A.index, kind: 'control' });
  let viaClick = false;
  if (f.error && A.label && !A.selector) {
    const f2 = find({ text: A.label, index: A.index, kind: 'click' });
    if (!f2.error) { f = f2; viaClick = true; }
  }
  if (f.error) return f;
  const el = f.el;
  const g = refuseField(el) || (el.tagName !== 'SELECT' ? refuseEl(el) : null); if (g) return g;
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  if (el.tagName === 'SELECT') {
    const want = String(A.value == null ? '' : A.value).toLowerCase().trim();
    const opts = Array.from(el.options);
    const opt = opts.find((o) => o.value.toLowerCase() === want || o.text.trim().toLowerCase() === want) || opts.find((o) => o.text.toLowerCase().includes(want));
    if (!opt) return { error: 'No option matched "' + A.value + '".', options: opts.slice(0, 25).map((o) => o.text.trim() + ' (' + o.value + ')') };
    const changed = el.value !== opt.value;
    setNative(el, opt.value);
    fire(el, ['input', 'change']);
    return { selected: opt.text.trim(), value: opt.value, changed, control: desc(el) };
  }
  const st = stateOf(el);
  if (viaClick && !st) return { error: 'Matched ' + JSON.stringify(desc(el)) + ' but it does not look like a checkbox or toggle. Use store_click for it.' };
  const r = aimEl(el, null);
  const g2 = guardHit(r.hitEl); if (g2) return g2;
  return { toggle: true, control: desc(el), state: st, aim: r.aim, matches: f.total };
};
`

export { selectOp }
