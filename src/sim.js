/* Simulation loop: ambient fleet, the rider's trip, emergency yield, camera, live stats.
   frame() runs every animation frame: no allocations-heavy work or full re-renders inside. */
import { $ } from './util.js';
import { S, stepFree } from './state.js';
import { FLEET, PICKUPS, TICKS, EMERGENCY_UNITS, START_MIN } from './data.js';
import { currentTrip, quote, streetAt, pointAt } from './trip.js';
import { vehicles, pathEls, place, vehShape } from './map.js';
import { stepCamera } from './camera.js';
import { render } from './render.js';
import { toast, notify, announce } from './ui.js';
import { money, clock } from './util.js';

export const DUR = { matching: 2000, approach: 13000, ride: 21000 };

export function addEvent(text, kind = '') {
  S.events.push({ t: text, k: kind });
  const ul = $('#events');
  if (ul) { const li = document.createElement('li'); li.className = kind; li.textContent = text; ul.appendChild(li); }
  announce(text);
}

export function startTrip() {
  S.step = 'approach';
  S.sim = { phase: 'matching', t0: performance.now(), moved: 0, hold: 0, ev: {}, reassigned: false };
  S.rating = null;
  render();
  announce('Trip confirmed. Finding your vehicle.');
}

export function boardTrip() {
  const t = currentTrip(), q = quote(S.opt);
  S.step = 'ride';
  S.sim.phase = 'ride';
  S.sim.moved = 0;
  S.events = [];
  render();
  addEvent('Doors closed. Your trip has started.');
  addEvent(t.place.benefit ? `${q.benefit.name} applied. Your way back is reserved.` : `You pay ${money(q.pay)}. Your way back is reserved.`);
}

export function resetTrip() {
  S.step = 'home'; S.dest = null; S.sim = { phase: 'idle' }; S.events = []; S.em = null;
  $('#emV').style.display = 'none';
  render();
}

function emergencyPath(route, f) {
  const p = pointAt(route, f);
  const el = $('#p-em') || (() => {
    const n = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    n.id = 'p-em'; $('#mapsvg defs').appendChild(n); return n;
  })();
  // cross the rider's street at the next intersection, along the perpendicular street
  const gx = Math.round((p.x - 80) / 140) * 140 + 80, gy = Math.round((p.y - 80) / 120) * 120 + 80;
  el.setAttribute('d', p.horiz ? `M${gx} ${p.y - 520}V${p.y + 520}` : `M${p.x - 620} ${gy}H${p.x + 620}`);
  return el;
}

let last = performance.now();
export function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const t = now / 1000;

  // ambient fleet
  for (const v of vehicles) {
    if (v.el.style.display === 'none') continue;
    let d = t * v.speed + v.off * v.len;
    if (v.pingpong) { const m = d % (2 * v.len); d = m > v.len ? 2 * v.len - m : m; } else d %= v.len;
    place(v.el, v.path, d);
  }

  // rider's trip
  const s = S.sim, hero = $('#hero');
  if (s.phase !== 'idle' && S.dest) {
    const rl = pathEls.route.getTotalLength(), al = pathEls.ap.getTotalLength();
    const f = FLEET[S.opt];
    if (s.phase === 'matching') {
      place(hero, pathEls.ap, 0);
      if (now - s.t0 >= DUR.matching) {
        s.phase = 'approach'; s.t0 = now;
        if (stepFree()) { s.reassigned = true; toast('Reassigned to the nearest ramp vehicle'); }
        render();
        notify(`${f.name} is on the way`, `${f.plate} · ${quote(S.opt).pickup} min away · code 4821`, f.icon);
      }
    } else if (s.phase === 'approach') {
      const p = Math.min(1, (now - s.t0) / DUR.approach), q = quote(S.opt);
      place(hero, pathEls.ap, p * al);
      const eta = $('#eta'), bar = $('#bar');
      if (eta) eta.textContent = Math.max(1, Math.ceil((1 - p) * q.pickup));
      if (bar) { bar.style.width = (p * 100) + '%'; bar.parentNode.setAttribute('aria-valuenow', Math.round(p * 100)); }
      if (p >= .82 && !s.ev.near) { s.ev.near = 1; notify('Arriving in 1 minute', `Look for ${f.plate} at ${PICKUPS[S.pickup].label}`, 'clock'); }
      if (p >= 1) {
        s.phase = 'wait'; render();
        notify('Your vehicle is here', `${f.plate} · Unlock with code 4821`, 'lock', 'good');
      }
    } else if (s.phase === 'wait') {
      place(hero, pathEls.ap, al);
    } else if (s.phase === 'ride') {
      if (now >= s.hold) s.moved += dt * 1000;
      const p = Math.min(1, s.moved / DUR.ride), q = quote(S.opt), trip = currentTrip();
      place(hero, pathEls.route, p * rl);
      $('#routeDone').setAttribute('stroke-dasharray', `${p * rl} ${rl + 10}`);
      const eta = $('#eta'), bar = $('#bar'), st = $('#street');
      if (eta) eta.textContent = Math.max(0, Math.ceil((1 - p) * q.ride));
      if (bar) { bar.style.width = (p * 100) + '%'; bar.parentNode.setAttribute('aria-valuenow', Math.round(p * 100)); }
      if (st) { const name = streetAt(trip.route, p); if (st.textContent !== name) st.textContent = name; }
      if (trip.route.px > 480 && p >= .38 && !s.ev.em) {
        s.ev.em = 1; s.hold = now + 3300;
        S.em = { t0: now, path: emergencyPath(trip.route, .4) };
        addEvent('Emergency vehicle approaching. Pulling over to yield.', 'em');
        notify('Yielding to an emergency vehicle', 'Your trip resumes in a few seconds. The guarantee clock is paused.', 'siren', 'alert');
      }
      if (p >= .6 && !s.ev.mid) { s.ev.mid = 1; addEvent(f.detour ? 'Picking up a neighbour on the way. On schedule.' : 'Halfway there. On schedule.'); }
      if (p >= .9 && !s.ev.near) { s.ev.near = 1; addEvent(`Arriving at ${trip.place.name}. ${stepFree() ? 'Step-free drop-off at the main entrance.' : 'Drop-off at the main entrance.'}`); }
      if (p >= 1) {
        s.phase = 'done'; S.step = 'arrived';
        const m = S.month;
        m.journeys++; m.fare = Math.round((m.fare + q.pay) * 100) / 100;
        m.subsidy += q.subsidy; m.benefits += q.benefitCover + q.capCover;
        render();
        notify(`Arrived at ${trip.place.name}`, `${clock(START_MIN + q.pickup + q.walkMin + q.ride)} · You paid ${money(q.pay)}`, 'check', 'good');
      }
    } else if (s.phase === 'done') place(hero, pathEls.route, rl);
  }

  // emergency vehicle crossing
  const emv = $('#emV');
  if (S.em) {
    const el = S.em.path, L = el.getTotalLength(), d = (now - S.em.t0) / 1000 * 240;
    if (!emv.firstChild) emv.innerHTML = vehShape('emerg');
    if (d >= L) { S.em = null; emv.style.display = 'none'; } else { emv.style.display = ''; place(emv, el, d); }
  }

  stepCamera(dt);
  requestAnimationFrame(frame);
}

/* live counters */
let tickI = 0;
export function startTicks() {
  setInterval(() => {
    const c = S.city, j = (n, a) => Math.round(n + (Math.random() - .5) * a);
    c.vehicles = j(c.vehicles, 6); c.riders += Math.round(Math.random() * 14); c.step += Math.round(Math.random() * 4);
    c.pods = Math.max(396, Math.min(428, j(c.pods, 4)));
    c.wait = Math.max(3.1, Math.min(4.6, c.wait + (Math.random() - .5) * .2));
    c.emerg = Math.max(44, Math.min(EMERGENCY_UNITS, c.emerg + (Math.random() > .7 ? (Math.random() > .5 ? 1 : -1) : 0)));
    const set = (id, v) => { const e = $('#' + id); if (e) e.textContent = v; };
    set('s-veh', c.vehicles.toLocaleString()); set('s-rid', c.riders.toLocaleString()); set('s-wait', c.wait.toFixed(1) + ' min');
    set('s-em', c.emerg + ' / ' + EMERGENCY_UNITS); set('s-stp', c.step.toLocaleString());
    if (S.cs.on) { S.cs.energy += .03; set('cs-en', money(S.cs.energy)); }
  }, 2200);
  setInterval(() => { const e = $('#tick'); if (e) { tickI = (tickI + 1) % TICKS.length; e.textContent = TICKS[tickI]; } }, 5200);
}
