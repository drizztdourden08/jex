/**
 * Guest-side safety guard (runs inside the store webview). Hard-refuses anything that
 * could buy, gift, pay, sign in/out, or touch credentials. Every acting op calls
 * `refusePage()` / `refuseEl()` / `refuseField()` first and returns the error unchanged.
 */
const guardPrelude = String.raw`
const REFUSE = 'Refused for safety: this is a purchase, payment, sign-in or account step. Do NOT retry; ask the user to do this step themselves in the Store tab.';
const badUrl = (u) => {
  let x; try { x = new URL(u, location.href); } catch (e) { return false; }
  const h = x.hostname.toLowerCase(), p = x.pathname.toLowerCase();
  if (h === 'login.steampowered.com' || h === 'checkout.steampowered.com') return true;
  if (h === 'help.steampowered.com' && /\/wizard\//.test(p)) return true;
  if (/paypal|stripe|adyen|paysafe|klarna|alipay|braintree/.test(h)) return true;
  if (/(^|\.)(steampowered|steamcommunity)\.com$/.test(h)) {
    if (/^\/(cart|checkout|account|login|buy|steamaccount|payment|addfunds|giftcard|gifts?)(\/|$)/.test(p)) return true;
    if (/^\/openid\/login/.test(p) || /\/(checkout|purchase)\//.test(p)) return true;
  }
  return false;
};
const BAD_TEXT = /\b(add to cart|add to basket|add to account|purchase|buy|checkout|check out|place (your )?order|continue to payment|pay|gift|add funds|complete (the )?(purchase|order)|redeem|sign in|log ?in|log ?out|logout)\b/i;
const BAD_ATTR = /add_?to_?cart|checkout|purchase_?btn|btn_purchase|giftbtn|buy_?now|addfunds/i;
const BAD_FIELD = /pass(word|wd|phrase)|card|cvv|cvc|cvn|security.?code|expir|iban|routing|account.?number|\bssn\b|steam guard|auth(entication)? code|one.?time/i;
const refusePage = () => (badUrl(location.href) ? { error: REFUSE, reason: 'page', url: location.href } : null);
const refuseEl = (el) => {
  const c = el.closest('a,button,[role=button],input,label,summary') || el;
  const shown = [(c.innerText || c.textContent || ''), c.getAttribute('aria-label'), c.getAttribute('title'), c.getAttribute('value')]
    .map((s) => (s || '').trim().replace(/\s+/g, ' ')).filter((s) => s && s.length <= 60);
  if (shown.some((s) => BAD_TEXT.test(s))) return { error: REFUSE, reason: 'button', text: shown[0] };
  if (BAD_ATTR.test((c.id || '') + ' ' + (typeof c.className === 'string' ? c.className : ''))) return { error: REFUSE, reason: 'button' };
  const href = c.getAttribute('href') || '';
  if (/javascript:.*(cart|purchase|gift|checkout)/i.test(href) || (href && badUrl(href))) return { error: REFUSE, reason: 'link', href };
  if (/cart|purchase|gift|checkout/i.test(c.getAttribute('onclick') || '')) return { error: REFUSE, reason: 'button' };
  const f = c.closest('form');
  if (f && (badUrl(f.getAttribute('action') || '') || f.querySelector('input[type=password]'))) return { error: REFUSE, reason: 'form' };
  return null;
};
const refuseField = (el) => {
  const hay = [el.type, el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.getAttribute('autocomplete')].join(' ');
  if (el.type === 'password' || /cc-|password/i.test(el.getAttribute('autocomplete') || '') || BAD_FIELD.test(hay)) {
    return { error: REFUSE, reason: 'sensitive field' };
  }
  const f = el.closest('form');
  if (f && (badUrl(f.getAttribute('action') || '') || f.querySelector('input[type=password]'))) return { error: REFUSE, reason: 'form' };
  return null;
};
`

export { guardPrelude }
