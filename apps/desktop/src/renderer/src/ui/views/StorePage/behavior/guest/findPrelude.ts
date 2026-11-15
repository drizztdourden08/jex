/**
 * Guest-side shared "find element" helper. click / type / select / key all resolve
 * targets through `find()`, so they match the same way. kinds: click | field | control | any.
 */
const findPrelude = String.raw`
const txt = (el) => ((el.innerText || el.textContent || '').trim().replace(/\s+/g, ' '));
const vis = (el) => {
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const s = getComputedStyle(el);
  return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
};
const hint = (el) => {
  if (el.id) return '#' + CSS.escape(el.id);
  const n = el.getAttribute('name');
  const cls = typeof el.className === 'string' ? el.className.split(/\s+/).filter((c) => /^[\w-]+$/.test(c)).slice(0, 2) : [];
  return el.tagName.toLowerCase() + (n ? '[name="' + n + '"]' : '') + (cls.length ? '.' + cls.join('.') : '');
};
const desc = (el) => ({ tag: el.tagName.toLowerCase(), text: (txt(el) || el.getAttribute('aria-label') || el.getAttribute('value') || el.getAttribute('placeholder') || '').slice(0, 80), selector: hint(el), href: el.getAttribute('href') || undefined });
const SEL = {
  click: 'a,button,[role=button],[role=link],[role=tab],[role=menuitem],[role=option],input[type=submit],input[type=button],input[type=checkbox],input[type=radio],summary,label,[onclick],[tabindex]',
  field: 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]):not([type=file]):not([type=image]):not([type=reset]),textarea,[contenteditable=""],[contenteditable=true],[role=textbox],[role=searchbox],[role=combobox]',
  control: 'select,input[type=checkbox],input[type=radio],[role=checkbox],[role=radio],[role=switch]',
};
SEL.any = SEL.click + ',' + SEL.field + ',' + SEL.control;
const names = (el, kind) => {
  const out = [txt(el), el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('value'), el.getAttribute('placeholder'), el.getAttribute('alt')];
  if (kind !== 'click') {
    if (el.id) document.querySelectorAll('label[for="' + CSS.escape(el.id) + '"]').forEach((l) => out.push(txt(l)));
    const w = el.closest('label'); if (w) out.push(txt(w));
    (el.getAttribute('aria-labelledby') || '').split(/\s+/).forEach((i) => { const n = document.getElementById(i); if (n) out.push(txt(n)); });
    out.push(el.getAttribute('name'), el.id);
  }
  return out.filter(Boolean).map((s) => s.toLowerCase());
};
const find = (o) => {
  const kind = o.kind || 'click';
  const want = (o.text || '').toLowerCase().trim();
  let pool;
  try { pool = Array.from(document.querySelectorAll(o.selector || SEL[kind])); }
  catch (e) { return { error: 'Invalid selector: ' + o.selector }; }
  pool = pool.filter(vis);
  let ranked = pool;
  if (want) {
    ranked = [];
    for (const el of pool) {
      const ns = names(el, kind);
      const r = ns.some((n) => n === want) ? 0 : ns.some((n) => n.startsWith(want)) ? 1 : ns.some((n) => n.includes(want)) ? 2 : -1;
      if (r >= 0) ranked.push({ el, r });
    }
    if (!ranked.length && kind === 'click' && !o.selector) {
      let best = null;
      for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,span,p,li,div,img')) {
        if (!vis(el)) continue;
        const t = (txt(el) || el.getAttribute('alt') || '').toLowerCase();
        if (t.includes(want) && (!best || t.length < best.len)) best = { el, len: t.length };
      }
      if (best) ranked.push({ el: best.el, r: 3 });
    }
    ranked.sort((a, b) => a.r - b.r);
    ranked = ranked.map((x) => x.el);
  }
  if (!ranked.length) {
    const words = want.split(/\s+/).filter(Boolean);
    const close = pool.map((el) => ({ el, s: words.filter((w) => names(el, kind).some((n) => n.includes(w))).length }))
      .sort((a, b) => b.s - a.s).slice(0, 8).map((x) => desc(x.el));
    return { error: 'No visible element matched' + (want ? ' text "' + o.text + '"' : '') + (o.selector ? ' selector "' + o.selector + '"' : '') + '. Use store_list_links or read_store_page to see what is on the page.', closeMatches: close };
  }
  const idx = Math.min(Math.max(Number(o.index) || 0, 0), ranked.length - 1);
  return { el: ranked[idx], total: ranked.length, index: idx, others: ranked.length > 1 ? ranked.slice(0, 6).map(desc) : undefined };
};
`

export { findPrelude }
