/** Guest-side type / key ops; each defines `ops.<name> = (A) => result`. A = the tool's args. Click / select live in clickOps.ts / selectOp.ts. */
const typeOp = String.raw`
ops.type = (A) => {
  const bad = refusePage(); if (bad) return bad;
  const f = find({ selector: A.selector, text: A.label, index: A.index, kind: 'field' }); if (f.error) return f;
  const el = f.el;
  const g = refuseField(el); if (g) return g;
  el.scrollIntoView({ block: 'center' });
  el.focus();
  const val = String(A.value == null ? '' : A.value);
  if (el.isContentEditable) {
    el.textContent = (A.append ? el.textContent : '') + val;
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: val, inputType: 'insertText' }));
  } else {
    setNative(el, (A.append ? el.value : '') + val);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: val, inputType: 'insertText' }));
    fire(el, ['change']);
  }
  el.dispatchEvent(keyEv('keyup', ['a', 65]));
  if (A.submit) { const s = submitEl(el); if (s) return s; }
  return { typed: desc(f.el), value: String(el.value != null ? el.value : el.textContent).slice(0, 120), submitted: !!A.submit };
};
`

const keyOp = String.raw`
ops.key = (A) => {
  const bad = refusePage(); if (bad) return bad;
  const k = KEYS[String(A.key || '').toLowerCase().replace(/[\s_-]/g, '')];
  if (!k) return { error: 'Unsupported key. Use Enter, Escape, Tab, ArrowUp, ArrowDown, ArrowLeft or ArrowRight.' };
  let el = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body;
  if (A.selector || A.label) {
    const f = find({ selector: A.selector, text: A.label, index: A.index, kind: 'any' }); if (f.error) return f;
    el = f.el; el.scrollIntoView({ block: 'center' }); el.focus();
  }
  if (k[0] === 'Tab') {
    const all = Array.from(document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')).filter((e) => !e.disabled && e.tabIndex >= 0 && vis(e));
    const next = all[(all.indexOf(el) + (A.shift ? -1 : 1) + all.length) % all.length];
    if (next) next.focus();
    return { pressed: 'Tab', focused: next ? desc(next) : null };
  }
  if (k[0] === 'Enter') {
    const typing = el.matches('input,textarea');
    const g = typing ? refuseField(el) : refuseEl(el); if (g) return g;
    if (typing) { const s = submitEl(el); if (s) return s; }
    else if (el.matches('a,button,[role=button],summary,input[type=submit],input[type=button]')) clickEl(el);
    else el.dispatchEvent(keyEv('keydown', k));
    return { pressed: 'Enter', target: desc(el) };
  }
  el.dispatchEvent(keyEv('keydown', k)); el.dispatchEvent(keyEv('keyup', k));
  return { pressed: k[0], target: desc(el) };
};
`

export { typeOp, keyOp }
