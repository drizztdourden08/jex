import type { StoreReadQuery } from '@/store/storeNav'

/**
 * Guest-side DOM reader/query. Runs INSIDE the store webview (the only place the
 * cross-origin Steam DOM + live element properties are reachable). Returns either a
 * page overview (no query) or matched elements with HTML + live attrs, paginated.
 * Self-contained (no libs needed — the live DOM is richer than any HTML parser:
 * it exposes checkbox `checked`, `<select>` `value`, `disabled`, etc.).
 */
const buildReadScript = (query: StoreReadQuery, caps: { overview: number; html: number; total: number }): string => {
  return `(() => {
    const q = ${JSON.stringify(query ?? {})};
    const CAP = ${JSON.stringify(caps)};
    const clean = (h) => (h || '')
      .replace(/<script[\\s\\S]*?<\\/script>/gi, '')
      .replace(/<style[\\s\\S]*?<\\/style>/gi, '')
      .replace(/<svg[\\s\\S]*?<\\/svg>/gi, '<svg/>')
      .replace(/\\son[a-z]+="[^"]*"/gi, '')
      .replace(/\\s+/g, ' ')
      .trim()
      .slice(0, CAP.html);
    const txt = (el) => ((el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' '));
    const hasQuery = !!(q.selector || q.containsText || q.tag || q.attribute);

    const overview = () => {
      const raw = (document.body && document.body.innerText) || '';
      const text = raw.replace(/\\n{3,}/g, '\\n\\n').trim();
      const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
        .map((e) => txt(e)).filter(Boolean).slice(0, 30);
      const actions = Array.from(document.querySelectorAll('a,button,input[type=submit],input[type=button]'))
        .map((e) => txt(e) || e.getAttribute('value') || e.getAttribute('aria-label') || '')
        .map((s) => s.trim()).filter(Boolean).slice(0, 40);
      return { url: location.href, title: document.title,
        text: text.slice(0, CAP.overview), truncated: text.length > CAP.overview,
        headings, actions };
    };

    if (!hasQuery) return overview();

    let nodes;
    try { nodes = Array.from(document.querySelectorAll(q.selector || '*')); }
    catch (e) { return { url: location.href, title: document.title, error: 'Invalid selector: ' + q.selector }; }

    const tag = (q.tag || '').toLowerCase();
    const needle = (q.containsText || '').toLowerCase();
    const attr = q.attribute || '';
    const attrVal = q.attributeValue;
    let matches = nodes.filter((el) => {
      if (tag && el.tagName.toLowerCase() !== tag) return false;
      if (needle && !txt(el).toLowerCase().includes(needle)) return false;
      if (attr) {
        const has = el.hasAttribute(attr) || (attr in el);
        if (!has) return false;
        if (attrVal != null && attrVal !== '') {
          const v = el.getAttribute(attr) != null ? el.getAttribute(attr) : el[attr];
          if (String(v).toLowerCase() !== String(attrVal).toLowerCase()) return false;
        }
      }
      return true;
    });
    // When matching by text without a selector, keep the most specific (drop ancestors
    // that merely contain another match) so we don't return the whole page wrapper.
    if (needle && !q.selector) {
      matches = matches.filter((el) => !matches.some((o) => o !== el && el.contains(o)));
    }

    // A zero-match query must NOT return an empty result — that strands the model
    // with no page content and invites a retry loop. Instead, hand back the page
    // OVERVIEW so it can always SEE what's actually here and decide (this is the
    // wrong page → navigate; or answer) rather than re-querying blindly.
    if (matches.length === 0) {
      return Object.assign(overview(), {
        queryMatched: 0,
        note: 'Your query matched nothing on this page — here is the page overview instead. Read it to decide: if what the user wants is NOT here, this is the WRONG page (navigate somewhere else or tell the user). Do NOT repeat the same query.',
      });
    }

    const pageSize = Math.min(Math.max(q.pageSize || 5, 1), 20);
    const page = Math.max(q.page || 0, 0);
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    const slice = matches.slice(page * pageSize, page * pageSize + pageSize);

    const ATTRS = ['href','src','type','name','placeholder','role','aria-label','aria-checked','aria-expanded','title','alt','id','data-tooltip-text'];
    const describe = (el) => {
      const attrs = {};
      for (const n of ATTRS) { const v = el.getAttribute(n); if (v != null && v !== '') attrs[n] = v; }
      if ('checked' in el) attrs.checked = !!el.checked;
      if ('selected' in el) attrs.selected = !!el.selected;
      if (el.disabled) attrs.disabled = true;
      if ('value' in el && el.value != null && el.value !== '' && !attrs.href) attrs.value = String(el.value).slice(0, 120);
      const cls = (typeof el.className === 'string') ? el.className.split(/\\s+/).filter(Boolean).slice(0, 6) : [];
      return { tag: el.tagName.toLowerCase(),
        classes: cls.length ? cls : undefined,
        text: txt(el).slice(0, 200) || undefined,
        attrs: Object.keys(attrs).length ? attrs : undefined,
        html: clean(el.outerHTML) };
    };

    const results = [];
    let used = 0;
    for (const el of slice) {
      const d = describe(el);
      const sz = JSON.stringify(d).length;
      if (used + sz > CAP.total && results.length > 0) break;
      used += sz; results.push(d);
    }
    return { url: location.href, title: document.title,
      totalMatches: matches.length, page, totalPages, returned: results.length, results,
      note: matches.length === 0
        ? 'No elements matched. Broaden the query (drop selector/tag, use containsText) or call with no query for a page overview.'
        : (page < totalPages - 1 ? ('More pages: call again with page=' + (page + 1)) : undefined) };
  })()`
}

export { buildReadScript }
