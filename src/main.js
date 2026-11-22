/* Public / Move ride app: entry point and event wiring.
   All behaviour runs through data-act attributes and one delegated click listener. */
import { $ } from './util.js';
import { S, saveAccess, blockedFor } from './state.js';
import { FLEET, PLACES } from './data.js';
import { buildMap } from './map.js';
import { retarget } from './camera.js';
import { render, keepScroll, syncMap } from './render.js';
import { frame, startTrip, boardTrip, resetTrip, startTicks } from './sim.js';
import { toast } from './ui.js';
import { viewRideTab } from './views/ride.js';

const sheet = $('#sheet');
const SCREENS = new Set(['ride', 'live', 'fleet', 'impact', 'access', 'serve']);

function applyAccess() {
  document.documentElement.classList.toggle('large-text', S.access.large);
  document.body.classList.toggle('calm', S.access.calm);
  saveAccess();
}

function pickDest(id) {
  S.dest = id; S.step = 'options'; S.pickOpen = false; S.query = '';
  if (blockedFor(FLEET[S.opt])) S.opt = 'pod';
  render();
}

const ACTIONS = {
  goto: id => { S.screen = id; render(); },
  'open-access': () => { if (S.screen === 'access') S.screen = S.prev; else { S.prev = S.screen; S.screen = 'access'; } render(); },
  'close-access': () => { S.screen = S.prev || 'ride'; render(); },
  search: () => {
    if (S.sim.phase !== 'idle' && S.sim.phase !== 'done') return;
    S.step = 'search'; S.pickOpen = false; render(false);
    const q = $('#q'); if (q) q.focus();
  },
  'back-home': () => { S.step = 'home'; S.dest = null; S.query = ''; S.pickOpen = false; render(); },
  'toggle-pick': () => { S.pickOpen = !S.pickOpen; keepScroll(); },
  pickup: id => { S.pickup = id; S.pickOpen = false; keepScroll(); },
  dest: pickDest,
  opt: id => { S.opt = id; keepScroll(); },
  confirm: () => startTrip(),
  ready: () => boardTrip(),
  cancel: () => { resetTrip(); toast('Trip cancelled. Cancelling is always free.'); },
  stop: () => { toast('Your vehicle will pull over at the next safe spot. (Simulated)'); },
  share: () => { toast('A live trip link would be shared here. (Simulated, nothing is sent)'); },
  help: () => { toast('Rider support would connect you to a person here. (Simulated)'); },
  done: () => resetTrip(),
  'to-impact': () => { resetTrip(); S.screen = 'impact'; render(); },
  rate: id => { S.rating = S.rating === id ? null : id; keepScroll(); if (S.rating) toast('Thanks. Feedback goes to the service team.'); },
  recenter: () => retarget(),
  layer: id => { S.layers[id] = !S.layers[id]; keepScroll(); },
  legend: id => { S.hide[id] = !S.hide[id]; keepScroll(); },
  acc: id => { S.access[id] = !S.access[id]; if (id === 'wheel' && S.access.wheel && blockedFor(FLEET[S.opt])) S.opt = 'pod'; applyAccess(); keepScroll(); },
  'cs-on': () => { S.cs.on = !S.cs.on; keepScroll(); },
  'cs-win': id => { S.cs.win = id; keepScroll(); },
  'cs-ess': () => { S.cs.essential = !S.cs.essential; keepScroll(); },
  recall: () => toast('Your car is heading home. Arriving in 4 min, fully charged.'),
  redeem: (id, el) => {
    const n = parseInt(id, 10);
    if (S.cs.credit >= n) { S.cs.credit -= n; toast(el.dataset.msg); keepScroll(); } else toast('Not enough credit yet.');
  },
  district: id => { S.district = id; keepScroll(); }
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const fn = ACTIONS[b.dataset.act];
  if (fn) fn(b.dataset.id, b);
});

/* destination search: update results without replacing the input */
sheet.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  S.query = e.target.value.slice(0, 60);
  const tmp = document.createElement('div');
  tmp.innerHTML = viewRideTab();
  const fresh = tmp.querySelector('#results'), cur = $('#results');
  if (fresh && cur) cur.replaceWith(fresh);
});
sheet.addEventListener('keydown', e => {
  if (e.target.id === 'q' && e.key === 'Enter') {
    const first = $('#results [data-act="dest"]');
    if (first) { e.preventDefault(); pickDest(first.dataset.id); }
  }
});
sheet.addEventListener('toggle', e => { if (e.target.matches('details.receipt')) S.receiptOpen = e.target.open; }, true);

addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (S.screen === 'access') ACTIONS['close-access']();
  else if (S.pickOpen) ACTIONS['toggle-pick']();
});
addEventListener('resize', () => retarget(true));
addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (SCREENS.has(h) && h !== S.screen) { S.screen = h; render(); }
});

/* deep links: #live, #fleet, #impact; ?to=work preselects a destination */
const h = location.hash.slice(1);
if (SCREENS.has(h)) S.screen = h;
const to = new URLSearchParams(location.search).get('to');
if (to && PLACES[to]) { S.dest = to; S.step = 'options'; }

applyAccess();
buildMap();
render(false);
syncMap(true);
startTicks();
requestAnimationFrame(frame);
