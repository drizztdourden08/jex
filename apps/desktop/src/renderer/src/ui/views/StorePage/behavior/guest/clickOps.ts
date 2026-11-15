/**
 * Pointer ops, two-phase. `aim` finds + guards the target and returns a hit-tested point
 * for a trusted host click (or hover); `synth` is the synthetic fallback; `probe` re-reads
 * toggle state. Hover skips the element guard (it never clicks); click never does.
 */
const aimOp = String.raw`
ops.aim = (A) => {
  const bad = refusePage(); if (bad) return bad;
  let el, pt = null, meta = {};
  if (A.x != null && A.y != null) {
    pt = { x: Number(A.x), y: Number(A.y) };
    if (!(pt.x >= 0 && pt.y >= 0 && pt.x < innerWidth && pt.y < innerHeight)) return { error: 'x,y is outside the viewport (' + innerWidth + 'x' + innerHeight + ' CSS px).' };
    el = document.elementFromPoint(pt.x, pt.y);
    if (!el) return { error: 'Nothing at that point.' };
  } else {
    if (!A.selector && !A.text) return { error: 'Provide text and/or selector, or x and y.' };
    const f = find({ selector: A.selector, text: A.text, index: A.index, kind: 'click' }); if (f.error) return f;
    el = f.el; meta = { matches: f.total, index: f.index, otherMatches: f.others };
  }
  if (!A.hover) { const g = guardHit(el); if (g) return g; }
  if (!pt) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  const r = aimEl(el, pt);
  if (!A.hover) { const g2 = guardHit(r.hitEl); if (g2) return g2; }
  const out = { ...meta, aim: r.aim, stateBefore: stateOf(el) };
  out[A.hover ? 'hovered' : 'clicked'] = desc(el);
  return out;
};
`

const synthOp = String.raw`
ops.synth = () => {
  const el = window.__jexAim;
  if (!el || !el.isConnected) return { error: 'The target is gone from the page.' };
  const bad = refusePage() || refuseEl(el); if (bad) return bad;
  clickEl(el);
  return { synthetic: true };
};
`

const probeOp = String.raw`
ops.probe = () => {
  const el = window.__jexAim;
  return { state: el && el.isConnected ? stateOf(el) : null };
};
`

export { aimOp, synthOp, probeOp }
