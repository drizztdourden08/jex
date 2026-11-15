/** Guest-side helpers shared by the type / select / key ops: framework-friendly value setting, key events, submit. */
const inputPrelude = String.raw`
const setNative = (el, value) => {
  const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value');
  if (setter && setter.set) setter.set.call(el, value); else el.value = value;
};
const fire = (el, names) => names.forEach((n) => el.dispatchEvent(new Event(n, { bubbles: true })));
const KEYS = { enter: ['Enter', 13], escape: ['Escape', 27], esc: ['Escape', 27], tab: ['Tab', 9], arrowup: ['ArrowUp', 38], arrowdown: ['ArrowDown', 40], arrowleft: ['ArrowLeft', 37], arrowright: ['ArrowRight', 39] };
const keyEv = (type, k) => new KeyboardEvent(type, { key: k[0], code: k[0], keyCode: k[1], which: k[1], bubbles: true, cancelable: true });
const submitEl = (el) => {
  const form = el.form || el.closest('form');
  const bad = refuseField(el) || (form && refuseEl(form));
  if (bad) return bad;
  const k = KEYS.enter;
  const go = el.dispatchEvent(keyEv('keydown', k));
  el.dispatchEvent(keyEv('keypress', k));
  el.dispatchEvent(keyEv('keyup', k));
  if (go && form) { if (form.requestSubmit) form.requestSubmit(); else form.submit(); }
  return null;
};
const clickEl = (el) => {
  const a = el.closest('a');
  if (a && a.target === '_blank') a.removeAttribute('target');
  ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach((t) => el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window })));
  if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
};
`

export { inputPrelude }
