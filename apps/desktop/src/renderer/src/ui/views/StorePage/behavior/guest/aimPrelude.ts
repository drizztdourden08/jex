/**
 * Guest-side pointer helpers: toggle-state reading, and "aiming" at an element (scroll,
 * centre point, hit-test) so the host can send a trusted click there. Every aimed hit is
 * re-checked with refuseEl, so a covering element can never smuggle a click past the guard.
 */
const aimPrelude = String.raw`
const ARIA_STATE = ['aria-checked', 'aria-pressed', 'aria-selected', 'aria-expanded'];
const STATE_TOKEN = /(?:^|\s)(checked|active|selected|on|enabled)(?:\s|$)/;
const TOGGLE_HINT = /check|toggle|switch|filter_control|option|radio|pref/i;
const clsOf = (n) => (typeof n.className === 'string' ? n.className : '');
const stateOf = (el) => {
  if (!el) return null;
  const nat = (n) => (n && n.tagName === 'INPUT' && (n.type === 'checkbox' || n.type === 'radio') ? { on: !!n.checked, via: 'checked' } : null);
  const own = nat(el) || (el.tagName === 'LABEL' ? nat(el.control) : null) || nat(el.querySelector('input[type=checkbox],input[type=radio]'));
  if (own) return own;
  const chain = [];
  for (let n = el, i = 0; n && n !== document.body && i < 3; n = n.parentElement, i++) chain.push(n);
  for (const n of chain) {
    for (const a of ARIA_STATE) { const v = n.getAttribute(a); if (v === 'true' || v === 'false') return { on: v === 'true', via: a }; }
    const m = clsOf(n).match(STATE_TOKEN);
    if (m) return { on: true, via: 'class:' + m[1] };
  }
  return chain.some((n) => TOGGLE_HINT.test(clsOf(n))) ? { on: false, via: 'class' } : null;
};
const guardHit = (h) => {
  if (!h) return null;
  if (/^(IFRAME|FRAME|OBJECT|EMBED)$/.test(h.tagName)) return { error: 'That point is inside an embedded frame, which cannot be clicked safely.' };
  return refuseEl(h);
};
const aimEl = (el, pt) => {
  const a = el.closest('a');
  if (a && a.target === '_blank') a.removeAttribute('target');
  window.__jexAim = el;
  const r = el.getBoundingClientRect();
  const x = pt ? pt.x : Math.round(Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1));
  const y = pt ? pt.y : Math.round(Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1));
  const hit = document.elementFromPoint(x, y);
  const ok = r.width >= 2 && r.height >= 2 && !!hit && hit !== document.body && hit !== document.documentElement && (hit === el || el.contains(hit) || hit.contains(el));
  return { aim: { x, y, hit: ok }, hitEl: hit };
};
`

export { aimPrelude }
