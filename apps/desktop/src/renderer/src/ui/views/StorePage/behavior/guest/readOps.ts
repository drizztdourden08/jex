/** Read-only guest ops (no guard needed beyond flagging): link listing, page state, wait probe. */
const linksOp = String.raw`
ops.links = (A) => {
  const needle = String(A.containsText || '').toLowerCase().trim();
  const size = Math.min(Math.max(Number(A.pageSize) || 25, 1), 50);
  const page = Math.max(Number(A.page) || 0, 0);
  const seen = new Set();
  const items = [];
  for (const el of document.querySelectorAll('a[href],button,[role=button],input[type=submit],input[type=button]')) {
    if (!vis(el)) continue;
    if (A.inViewport) { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue; }
    const text = (txt(el) || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('value') || '').slice(0, 100);
    const href = el.tagName === 'A' ? el.href : undefined;
    if (!text && !href) continue;
    if (href && /^javascript:/i.test(href) && !text) continue;
    const key = text + '|' + href;
    if (seen.has(key)) continue; seen.add(key);
    if (needle && !(text + ' ' + (href || '')).toLowerCase().includes(needle)) continue;
    const item = { text: text || undefined, kind: el.tagName.toLowerCase(), href, selector: hint(el) };
    if (refuseEl(el) || (href && badUrl(href))) item.restricted = true;
    items.push(item);
  }
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  return { url: location.href, title: document.title, total: items.length, page, totalPages, links: items.slice(page * size, page * size + size),
    note: page < totalPages - 1 ? 'More: call again with page=' + (page + 1) : undefined };
};
`

const stateOp = String.raw`
ops.state = () => {
  const acct = document.querySelector('#account_pulldown');
  const loginLink = document.querySelector('a.global_action_link[href*="login"], a[href*="/login/"]');
  return { scrollY: Math.round(scrollY), scrollHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight, viewportWidth: innerWidth,
    readyState: document.readyState, loggedIn: acct ? true : loginLink ? false : undefined, account: acct ? txt(acct).slice(0, 60) : undefined,
    restrictedPage: badUrl(location.href) || undefined };
};
`

const hasOp = String.raw`
ops.has = (A) => {
  const text = String(A.text || '').toLowerCase().trim();
  const bodyHas = text ? ((document.body && document.body.innerText) || '').toLowerCase().includes(text) : false;
  let selHas = false;
  if (A.selector) { try { selHas = Array.from(document.querySelectorAll(A.selector)).some(vis); } catch (e) { return { error: 'Invalid selector: ' + A.selector }; } }
  return { found: bodyHas || selHas, matchedText: bodyHas || undefined, matchedSelector: selHas || undefined };
};
`

export { linksOp, stateOp, hasOp }
