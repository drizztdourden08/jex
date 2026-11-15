/** One guest-side script fragment per op; each defines `ops.<name> = (A) => result`. A = the tool's args. */
const clickOp = String.raw`
ops.click = (A) => {
  const bad = refusePage(); if (bad) return bad;
  if (!A.selector && !A.text) return { error: 'Provide text and/or selector.' };
  const f = find({ selector: A.selector, text: A.text, index: A.index, kind: 'click' }); if (f.error) return f;
  const g = refuseEl(f.el); if (g) return g;
  f.el.scrollIntoView({ block: 'center' });
  clickEl(f.el);
  return { clicked: desc(f.el), matches: f.total, index: f.index, otherMatches: f.others };
};
`

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

const selectOp = String.raw`
ops.select = (A) => {
  const bad = refusePage(); if (bad) return bad;
  const f = find({ selector: A.selector, text: A.label, index: A.index, kind: 'control' }); if (f.error) return f;
  const el = f.el;
  const g = refuseField(el) || (el.tagName !== 'SELECT' ? refuseEl(el) : null); if (g) return g;
  el.scrollIntoView({ block: 'center' });
  if (el.tagName === 'SELECT') {
    const want = String(A.value == null ? '' : A.value).toLowerCase().trim();
    const opts = Array.from(el.options);
    const opt = opts.find((o) => o.value.toLowerCase() === want || o.text.trim().toLowerCase() === want) || opts.find((o) => o.text.toLowerCase().includes(want));
    if (!opt) return { error: 'No option matched "' + A.value + '".', options: opts.slice(0, 25).map((o) => o.text.trim() + ' (' + o.value + ')') };
    setNative(el, opt.value);
    fire(el, ['input', 'change']);
    return { selected: opt.text.trim(), value: opt.value, control: desc(el) };
  }
  const isOn = () => (el.type === 'checkbox' || el.type === 'radio' ? !!el.checked : el.getAttribute('aria-checked') === 'true');
  const want = A.checked !== false;
  if (isOn() !== want) clickEl(el);
  return { checked: isOn(), requested: want, control: desc(el) };
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

export { clickOp, typeOp, selectOp, keyOp }
