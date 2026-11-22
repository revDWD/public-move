/* Feedback: toasts, trip notifications and screen-reader announcements. */
import { $ } from './util.js';
import { ic } from './icons.js';
import { S } from './state.js';

let toastT, noticeT;

export function toast(text, ms = 4200) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), ms);
}

/** Push-style notification at the top of the screen, like a phone banner. */
export function notify(title, body, icon = 'bell', tone = '') {
  const el = $('#notice');
  el.className = 'notice ' + tone;
  el.innerHTML = `<span class="notice-ic">${ic(icon)}</span><span><b>${title}</b><span>${body}</span></span><span class="notice-time">now</span>`;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(noticeT);
  noticeT = setTimeout(() => el.classList.remove('show'), 5200);
  announce(title + '. ' + body);
}

export function announce(text) {
  $('#live').textContent = text;
  if (S.access.audio && 'speechSynthesis' in window) {
    try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) { /* speech unavailable */ }
  }
}
