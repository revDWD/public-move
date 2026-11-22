/* Render the active screen into the sheet and keep the map in step. */
import { $, $$ } from './util.js';
import { S } from './state.js';
import { PICKUPS } from './data.js';
import { ic } from './icons.js';
import { currentTrip } from './trip.js';
import { setTripGeometry, syncLayers } from './map.js';
import { retarget } from './camera.js';
import { viewRideTab } from './views/ride.js';
import { viewLive } from './views/live.js';
import { viewFleet, viewServe } from './views/fleet.js';
import { viewImpact } from './views/impact.js';
import { viewAccess } from './views/access.js';

const app = $('#app'), sheet = $('#sheet'), tabs = $('#tabs');
export const TABS = [['ride', 'go', 'Ride'], ['live', 'map', 'Live map'], ['fleet', 'fleet', 'Fleet'], ['impact', 'chart', 'Impact']];
const VIEWS = { ride: viewRideTab, live: viewLive, fleet: viewFleet, serve: viewServe, impact: viewImpact, access: viewAccess };
const MAP_SCREENS = new Set(['ride', 'live']);
const tabOf = s => s === 'serve' ? 'fleet' : s;

function renderTabs() {
  const cur = tabOf(S.screen);
  tabs.innerHTML = TABS.map(([k, i, l]) => `<button class="tab" data-act="goto" data-id="${k}" ${cur === k ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></button>`).join('');
}

export function syncMap(snap = false) {
  const trip = S.dest ? currentTrip() : { from: PICKUPS[S.pickup].pt };
  setTripGeometry(trip, PICKUPS[S.pickup].label);
  syncLayers();
  retarget(snap);
}

export function render(focus = true) {
  if (app.dataset.screen !== S.screen) $('#notice').classList.remove('show');
  app.dataset.screen = S.screen;
  app.dataset.step = S.step;
  app.dataset.phase = S.sim.phase;
  app.dataset.mode = MAP_SCREENS.has(S.screen) ? 'map' : 'page';
  sheet.innerHTML = VIEWS[S.screen]();
  renderTabs();
  $('#gearBtn').setAttribute('aria-pressed', S.screen === 'access');
  syncMap();
  if (focus) { const h = $('#h'); if (h) h.focus({ preventScroll: true }); sheet.scrollTop = 0; }
  const want = S.screen === 'ride' ? '' : '#' + S.screen;
  if (location.hash !== want) history.replaceState(null, '', want || location.pathname + location.search);
}

/** Re-render in place (toggles, radios) keeping scroll position and focus. */
export function keepScroll() {
  const y = sheet.scrollTop, f = document.activeElement;
  const act = f && f.dataset ? f.dataset.act : null, id = f && f.dataset ? f.dataset.id : null;
  render(false);
  if (sheet.firstElementChild) sheet.firstElementChild.style.animation = 'none';
  sheet.scrollTop = y;
  if (act) {
    const n = $$('[data-act]', sheet).find(x => x.dataset.act === act && x.dataset.id === id && !x.disabled);
    if (n) n.focus({ preventScroll: true });
  }
}
