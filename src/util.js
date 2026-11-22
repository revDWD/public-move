export const NS = 'http://www.w3.org/2000/svg';
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const money = n => '$' + n.toFixed(2);
export const round2 = n => Math.round(n * 100) / 100;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const clock = m => {
  const h = Math.floor(m / 60) % 24, mm = Math.round(m % 60);
  return ((h + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' AM' : ' PM');
};
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape any text that did not come from this codebase before putting it in HTML. */
export const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
