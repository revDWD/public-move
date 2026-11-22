/* Ride tab: home → search → options → approach → ride → arrived. */
import { S, stepFree, blockedFor } from '../state.js';
import { PICKUPS, PLACES, FLEET, BOOKABLE, START_MIN, FARE_CAP, PROMISES } from '../data.js';
import { quote, currentTrip } from '../trip.js';
import { ic } from '../icons.js';
import { vehicleArt } from '../illustrations.js';
import { money, clock, esc } from '../util.js';

const back = (act, label) => `<button class="back" data-act="${act}">${ic('back', 'sm')}<span>${label}</span></button>`;
const benefitChip = p => p.benefit ? `<span class="chip good">${ic('check')}$0 with benefit</span>` : `<span class="chip">$18 monthly cap</span>`;
const greet = () => { const h = Math.floor(START_MIN / 60); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

function pickupPicker() {
  if (!S.pickOpen) return '';
  return `<div class="picklist" role="radiogroup" aria-label="Pickup location">${Object.entries(PICKUPS).map(([k, p]) => `
    <button class="row" role="radio" aria-checked="${S.pickup === k}" data-act="pickup" data-id="${k}">
      <span class="row-ic">${ic(p.icon)}</span><span class="row-body"><b>${p.name}</b><span class="meta">${p.label}</span></span>
      ${S.pickup === k ? `<span class="row-end tick">${ic('check')}</span>` : ''}</button>`).join('')}</div>`;
}

function pickupRow() {
  const p = PICKUPS[S.pickup];
  return `<div class="pickup">
    <span class="dot-a" aria-hidden="true"></span>
    <span class="pickup-body"><span class="meta">Pickup</span><b>${p.name === 'Current location' ? p.label : p.name}</b></span>
    <button class="chip-btn" data-act="toggle-pick" aria-expanded="${S.pickOpen}">${S.pickOpen ? 'Done' : 'Change'}</button>
  </div>${pickupPicker()}`;
}

function viewHome() {
  const saved = Object.entries(PLACES).filter(([, p]) => p.saved);
  return `<div class="grab" aria-hidden="true"></div>
  <p class="eyebrow">${greet()}</p>
  <h1 id="h" class="h2" tabindex="-1">Where to?</h1>
  <button class="where" data-act="search">${ic('search')}<span>Search destinations</span><span class="where-now">${ic('clock', 'sm')}Now</span></button>
  ${pickupRow()}
  <div class="shortcuts" role="list" aria-label="Saved places">${saved.map(([k, p]) => `
    <button class="short" role="listitem" data-act="dest" data-id="${k}"><span class="short-ic">${ic(p.icon)}</span><b>${p.kind}</b><span class="meta">${p.name}</span></button>`).join('')}</div>
  <div class="nearby">
    <span class="chip live">${S.city.pods} Solo Pods nearby</span>
    <span class="meta">Avg. pickup <b class="num">${S.city.wait.toFixed(1)} min</b> · ${stepFree() ? 'ramp vehicles reserved' : '6 ramp vehicles within 5 min'}</span>
  </div>
  <div class="card promise-strip">
    <span class="row-ic brand">${ic('ret')}</span>
    <div><b>Every trip includes a guaranteed ride back.</b><p class="fine">Fares are capped at ${money(FARE_CAP)} a month. Work, healthcare and school trips are $0.</p></div>
  </div>`;
}

function viewSearch() {
  const q = S.query.trim().toLowerCase();
  const list = Object.entries(PLACES).filter(([, p]) => !q || (p.name + ' ' + p.kind + ' ' + p.area).toLowerCase().includes(q));
  const from = PICKUPS[S.pickup].pt;
  const dist = p => ((Math.abs(p.pt[0] - from[0]) + Math.abs(p.pt[1] - from[1])) * 0.007).toFixed(1);
  return `<div class="grab" aria-hidden="true"></div>
  ${back('back-home', 'Back')}
  <h1 id="h" class="h2" tabindex="-1">Plan your trip</h1>
  <div class="fields">
    <button class="field" data-act="toggle-pick" aria-expanded="${S.pickOpen}"><span class="dot-a" aria-hidden="true"></span><span class="field-body"><span class="meta">From</span><b>${PICKUPS[S.pickup].label}</b></span>${ic('chevron', 'sm')}</button>
    ${pickupPicker()}
    <label class="field input"><span class="dot-b" aria-hidden="true"></span><span class="field-body"><span class="meta">To</span>
      <input id="q" type="search" autocomplete="off" placeholder="Search places in the pilot area" value="${esc(S.query)}" aria-controls="results"></span></label>
  </div>
  <div id="results"><p class="eyebrow tight">${q ? 'Results' : 'Suggested'}</p>
  <div class="list">${list.length ? list.map(([k, p]) => `
    <button class="row" data-act="dest" data-id="${k}"><span class="row-ic">${ic(p.icon)}</span>
      <span class="row-body"><b>${p.name}</b><span class="meta">${p.kind} · ${p.area} · ${dist(p)} km</span></span>
      <span class="row-end">${benefitChip(p)}</span></button>`).join('') :
      `<p class="empty">No places match “${esc(S.query)}” in the pilot service area.</p>`}</div></div>`;
}

function optRow(k) {
  const f = FLEET[k], q = quote(k), sel = S.opt === k, blocked = blockedFor(f);
  const tags = [];
  if (f.wheel) tags.push(`<span class="tag">${ic('ramp', 'sm')}Ramp</span>`);
  if (f.mode === 'stop') tags.push(`<span class="tag">${ic('walk', 'sm')}${q.walkMin ? q.walkMin + ' min walk to stop' : 'Door connection'}</span>`);
  if (f.mode === 'corner') tags.push(`<span class="tag">${ic('pin', 'sm')}Nearest corner</span>`);
  if (f.detour) tags.push(`<span class="tag">${ic('users', 'sm')}Shared</span>`);
  if (k === 'comm') tags.push(`<span class="tag warm">${ic('heart', 'sm')}Lent by a resident</span>`);
  return `<button class="opt" role="radio" aria-checked="${sel}" ${blocked ? 'disabled aria-disabled="true"' : ''} data-act="opt" data-id="${k}">
    <span class="opt-art">${vehicleArt(f.icon)}</span>
    <span class="opt-body">
      <span class="opt-name"><b>${f.name}</b><span class="seats">${ic('users', 'sm')}${f.seats}</span></span>
      <span class="meta">${blocked ? 'No ramp, so not offered with wheelchair access on' : `${q.pickup} min away · Arrive ${clock(START_MIN + q.pickup + q.walkMin + q.ride)}`}</span>
      ${blocked ? '' : `<span class="tags">${tags.join('')}</span>`}
    </span>
    <span class="opt-price">${blocked ? '' : `<strong class="num ${q.pay === 0 ? 'free' : ''}">${q.pay === 0 ? '$0' : money(q.pay)}</strong><s class="num">${money(q.atCost)}</s>`}</span>
  </button>`;
}

function receipt(q) {
  const t = currentTrip();
  const lines = [
    ['Fare at cost', money(q.atCost), ''],
    ['Energy', money(q.energy), 'sub'],
    ['Vehicle upkeep', money(q.upkeep), 'sub'],
    ['Accessible service', money(q.access), 'sub'],
    ['Public subsidy · 50%', '−' + money(q.subsidy), 'credit']
  ];
  if (q.benefit) lines.push([q.benefit.name, '−' + money(q.benefitCover), 'credit']);
  else if (q.capCover > 0) lines.push([`Monthly ${money(FARE_CAP)} cap reached`, '−' + money(q.capCover), 'credit']);
  return `<details class="receipt" ${S.receiptOpen ? 'open' : ''}>
    <summary><span>Fare breakdown</span><span class="num">${q.pay === 0 ? 'You pay $0' : 'You pay ' + money(q.pay)}</span>${ic('chevron', 'sm')}</summary>
    <div class="rlines">${lines.map(([a, b, c]) => `<div class="rline ${c}"><span>${a}</span><span class="num">${b}</span></div>`).join('')}
      <div class="rline total"><span>You pay</span><span class="num">${money(q.pay)}</span></div></div>
    <p class="fine">${t.km} km · ${PROMISES.slice(0, 3).map(p => 'no ' + p.toLowerCase()).join(', ')}. Cancelling is always free.</p>
  </details>`;
}

function viewOptions() {
  const t = currentTrip(), f = FLEET[S.opt], q = quote(S.opt);
  return `<div class="grab" aria-hidden="true"></div>
  ${back('search', 'Change destination')}
  <div class="tripsum">
    <span class="tripsum-line" aria-hidden="true"><i class="dot-a"></i><i class="bar"></i><i class="dot-b"></i></span>
    <span><span class="meta">${PICKUPS[S.pickup].label}</span><b>${t.place.name}</b></span>
    <span class="tripsum-km num">${t.km} km</span>
  </div>
  ${t.place.benefit ? `<div class="banner good">${ic('check')}${q.benefit.name} applies. This trip is free.</div>` : ''}
  <h1 id="h" class="h3 mt" tabindex="-1">Choose a ride</h1>
  <div class="opts" role="radiogroup" aria-label="Ride options">${BOOKABLE.map(optRow).join('')}</div>
  ${receipt(q)}
  <div class="sticky"><button class="btn brand block" data-act="confirm">Confirm ${f.name}<span class="btn-sub num">${q.pay === 0 ? '$0' : money(q.pay)}</span></button></div>`;
}

function viewApproach() {
  const s = S.sim, f = FLEET[S.opt], q = quote(S.opt), t = currentTrip();
  if (s.phase === 'matching') {
    return `<div class="grab" aria-hidden="true"></div>
    <div class="radar" aria-hidden="true"><i></i><i></i><i></i><span>${ic(f.icon, 'lg')}</span></div>
    <h1 id="h" class="h2 center" tabindex="-1">Finding your ${f.name}</h1>
    <p class="meta center">Matching you with the closest ${stepFree() ? 'accessible ' : ''}vehicle near ${PICKUPS[S.pickup].label}.</p>
    <button class="link-btn center-block" data-act="cancel">Cancel · always free</button>`;
  }
  const wait = s.phase === 'wait';
  const extras = [];
  if (stepFree()) extras.push(`<li class="${s.reassigned ? 'pop' : ''}">${ic('ramp')}<span>Accessible vehicle reserved${S.access.wheel ? ' · ramp ready on arrival' : ' · step-free route'}</span></li>`);
  if (s.reassigned) extras.push(`<li class="alert pop">${ic('siren')}<span>Reassigned to the nearest ramp vehicle. Pickup is now ${q.pickup} min.</span></li>`);
  if (f.mode === 'stop' && q.walkMin) extras.push(`<li>${ic('walk')}<span>Walk ${q.walkMin} min to the C2 stop at ${PICKUPS[S.pickup].label}</span></li>`);
  return `<div class="grab" aria-hidden="true"></div>
  <div class="status-head">
    <div><p class="eyebrow">${wait ? 'Arrived at pickup' : 'On the way'}</p>
      <h1 id="h" class="h2" tabindex="-1">${wait ? 'Your vehicle is here' : `Pickup in <span class="num" id="eta">${q.pickup}</span> min`}</h1>
      <p class="meta">${wait ? 'Doors unlock with your code.' : `Arriving at ${PICKUPS[S.pickup].label} around ${clock(START_MIN + q.pickup)}`}</p></div>
  </div>
  <div class="progress" role="progressbar" aria-label="Vehicle approach" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${wait ? 100 : 0}"><i id="bar" style="width:${wait ? 100 : 0}%"></i></div>
  <div class="vcard">
    <div class="vcard-art">${vehicleArt(f.icon, f.name)}</div>
    <div class="vcard-body"><span class="plate">${f.plate}</span><b>${f.name}</b><span class="meta">${f.capacity} · ${f.wheel ? 'Ramp equipped' : 'Step-in entry'}</span></div>
    <div class="code" aria-label="Unlock code 4 8 2 1"><span class="meta">Unlock code</span><b class="num">4821</b></div>
  </div>
  <ul class="facts">
    ${extras.join('')}
    <li>${ic(t.place.benefit ? 'heart' : 'wallet')}<span>${t.place.benefit ? q.benefit.name + ' · you pay $0' : 'You pay ' + money(q.pay) + ', capped at ' + money(FARE_CAP) + ' this month'}</span></li>
    <li>${ic('ret')}<span>Return trip guaranteed</span></li>
  </ul>
  <button class="btn brand block ${wait ? 'ready-go' : ''}" id="readyBtn" data-act="ready" ${wait ? '' : 'disabled'}>${wait ? 'I’m seated, let’s go' : 'Doors unlock on arrival'}</button>
  <div class="actions3">
    <button class="act" data-act="share">${ic('share')}<span>Share status</span></button>
    <button class="act" data-act="help">${ic('help')}<span>Rider support</span></button>
    <button class="act" data-act="cancel">${ic('close')}<span>Cancel · free</span></button>
  </div>`;
}

function viewRide() {
  const t = currentTrip(), q = quote(S.opt), f = FLEET[S.opt];
  const chips = [];
  if (t.place.benefit) chips.push(`<span class="chip good">${ic('check')}$0 fare</span>`);
  if (S.access.quiet) chips.push(`<span class="chip">${ic('quiet')}Quiet cabin</span>`);
  if (S.access.audio) chips.push(`<span class="chip">${ic('audio')}Spoken updates</span>`);
  if (stepFree()) chips.push(`<span class="chip">${ic('stairs')}Step-free drop-off</span>`);
  return `<div class="grab" aria-hidden="true"></div>
  <p class="eyebrow">${f.name} · ${f.plate}</p>
  <h1 id="h" class="h2" tabindex="-1">Heading to ${t.place.name}</h1>
  <div class="eta-row">
    <div><span class="eta-big num" id="eta">${q.ride}</span><span class="meta"> min</span></div>
    <div class="eta-arr"><span class="meta">Arrive</span><b class="num">${clock(START_MIN + q.pickup + q.walkMin + q.ride)}</b></div>
  </div>
  <div class="progress" role="progressbar" aria-label="Trip progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="bar" style="width:0"></i></div>
  <p class="now">${ic('pin', 'sm')}<span>Now on <b id="street">${PICKUPS[S.pickup].label.split(' & ')[0]}</b></span></p>
  <ul class="events" id="events" aria-live="polite">${S.events.map(e => `<li class="${e.k}">${e.t}</li>`).join('')}</ul>
  ${chips.length ? `<div class="chips">${chips.join('')}</div>` : ''}
  <div class="actions3">
    <button class="act" data-act="share">${ic('share')}<span>Share trip</span></button>
    <button class="act" data-act="help">${ic('help')}<span>Rider support</span></button>
    <button class="act" data-act="stop">${ic('pin')}<span>Stop early</span></button>
  </div>`;
}

function viewArrived() {
  const t = currentTrip(), q = quote(S.opt), f = FLEET[S.opt];
  const saved = Math.max(0, 0.17 * t.km * (f.seats > 2 ? 1.3 : 1)).toFixed(1);
  return `<div class="grab" aria-hidden="true"></div>
  <div class="done-check">${ic('check', 'lg')}</div>
  <h1 id="h" class="h2 center" tabindex="-1">You’ve arrived</h1>
  <p class="meta center">${t.place.name} · ${clock(START_MIN + q.pickup + q.walkMin + q.ride)}</p>
  <div class="card summary">
    <div class="sumrow"><span>Fare at cost</span><b class="num">${money(q.atCost)}</b></div>
    <div class="sumrow credit"><span>Subsidy and benefits</span><b class="num">−${money(q.subsidy + q.benefitCover + q.capCover)}</b></div>
    <div class="sumrow total"><span>You paid</span><b class="num">${money(q.pay)}</b></div>
    <div class="sumrow"><span>Trip</span><b>${q.ride} min · ${t.km} km</b></div>
    <div class="sumrow"><span>${ic('leaf', 'sm')} CO₂ avoided vs. driving alone</span><b>≈ ${saved} kg</b></div>
  </div>
  <div class="rate" role="group" aria-label="Rate this trip">
    <span class="meta">How was your ride?</span>
    <button class="rate-btn" data-act="rate" data-id="up" aria-pressed="${S.rating === 'up'}" aria-label="Good">${ic('thumbUp')}</button>
    <button class="rate-btn" data-act="rate" data-id="down" aria-pressed="${S.rating === 'down'}" aria-label="Needs work">${ic('thumbDown')}</button>
  </div>
  <div class="card brand ret-card"><span>${ic('ret')}</span><div><b>Your ride back is reserved</b><p class="fine">${S.dest === 'work' ? 'A vehicle is held for 5:30 PM.' : 'A vehicle will be ready when you are.'} Change or cancel any time, for free.</p></div></div>
  <button class="btn block" data-act="done">Done</button>
  <button class="link-btn center-block" data-act="to-impact">See your month</button>`;
}

export function viewRideTab() {
  return { home: viewHome, search: viewSearch, options: viewOptions, approach: viewApproach, ride: viewRide, arrived: viewArrived }[S.step]();
}
