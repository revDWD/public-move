/* Fleet tab and the resident-car programme. */
import { S } from '../state.js';
import { FLEET } from '../data.js';
import { ic } from '../icons.js';
import { vehicleArt } from '../illustrations.js';
import { money } from '../util.js';

export function fleetCard(k, f, live = true) {
  const avail = live ? (k === 'pod' ? S.city.pods : k === 'comm' ? S.city.comm : k === 'emerg' ? S.city.emerg : f.avail) : f.avail;
  return `<article class="fleet-card" id="fleet-${k}">
    <div class="fleet-art" style="--tint:${f.color}">${vehicleArt(f.icon, f.name + ' illustration')}</div>
    <div class="fleet-body">
      <div class="fleet-title"><h3 class="h3">${f.name}</h3>${f.bookable ? '' : '<span class="chip alert">Dispatched by 911</span>'}</div>
      <p class="fine">${f.blurb}</p>
      <dl class="specs">
        <div><dt>Capacity</dt><dd>${f.capacity}</dd></div>
        <div><dt>Available now</dt><dd class="num">${avail}</dd></div>
        <div><dt>Typical wait</dt><dd>${f.wait == null ? 'Priority' : f.wait + ' min'}</dd></div>
        <div><dt>Service area</dt><dd>${f.area}</dd></div>
      </dl>
      <ul class="acc-list" aria-label="Accessibility">${f.access.map(a => `<li>${ic(f.wheel ? 'ramp' : 'access', 'sm')}${a}</li>`).join('')}</ul>
    </div>
  </article>`;
}

export function viewFleet() {
  return `<div class="page"><div class="page-head">
    <p class="eyebrow">The fleet</p>
    <h1 id="h" class="h2" tabindex="-1">The right vehicle for every trip</h1>
    <p class="lead">One network, six vehicle types, all electric and publicly owned. Booking picks the closest vehicle that fits your trip and your access needs.</p></div>
  <div class="fleet-list">${Object.entries(FLEET).map(([k, f]) => fleetCard(k, f)).join('')}</div>
  <div class="card night lend">
    <span class="row-ic">${ic('community')}</span>
    <div><b>Own a self-driving car?</b><p class="fine">Lend it to the network while it’s parked and get your energy costs reimbursed.</p>
    <button class="btn on-night sm mt-sm" data-act="goto" data-id="serve">Set up lending</button></div>
  </div></div>`;
}

export function viewServe() {
  const c = S.cs, wins = { work: 'Work hours', night: 'Nights', always: 'Whenever parked' };
  return `<div class="page"><div class="page-head">
    <button class="back" data-act="goto" data-id="fleet">${ic('back', 'sm')}<span>Fleet</span></button>
    <p class="eyebrow">Resident cars</p>
    <h1 id="h" class="h2" tabindex="-1">Lend your car while it’s parked</h1>
    <p class="lead">Most cars sit parked about 95% of the time. Lent cars carry neighbours on essential trips, and the energy they use is reimbursed at cost.</p></div>
  <div class="card flush">
    <button class="switch" role="switch" aria-checked="${c.on}" data-act="cs-on"><span class="row-ic">${ic('shared')}</span><span class="row-body"><b>My Solene S2</b><span class="meta">${c.on ? 'Available while parked and unused' : 'Paused. It stays home.'}</span></span><span class="knob" aria-hidden="true"></span></button>
    <div class="inset">
      <p class="label">Share it during</p>
      <div class="seg" role="group" aria-label="Sharing window">${Object.entries(wins).map(([k, v]) => `<button data-act="cs-win" data-id="${k}" aria-pressed="${c.win === k}">${v}</button>`).join('')}</div>
    </div>
    <button class="switch" role="switch" aria-checked="${c.essential}" data-act="cs-ess"><span class="row-ic">${ic('heart')}</span><span class="row-body"><b>Essential trips only</b><span class="meta">Healthcare, work and food</span></span><span class="knob" aria-hidden="true"></span></button>
  </div>
  <div class="card night">
    <p class="eyebrow on-night">Right now</p>
    <p class="big-line">${c.on ? 'Carrying a neighbour to Riverside Clinic · 6 min left' : 'Parked at home.'}</p>
    <button class="btn ghost-night sm mt-sm" data-act="recall">Recall my car</button>
  </div>
  <div class="grid2">
    <div class="card mini"><small>Energy reimbursed · October</small><strong class="num" id="cs-en">${money(c.energy)}</strong><p class="fine">Metered kWh at cost</p></div>
    <div class="card mini"><small>Service credit</small><strong class="num" id="cs-cr">${c.credit}</strong><p class="fine">Gift rides or offset home charging</p></div>
  </div>
  <div class="card">
    <h2 class="h3">Use your credit</h2>
    <div class="promise"><span class="row-ic">${ic('heart')}</span><div><b>Gift rides</b><p class="fine">Give trips to someone who needs them.</p>
      <button class="chip-btn mt-sm" data-act="redeem" data-id="20" data-msg="Gifted 20 credits as rides.">Gift 20 credits</button></div></div>
    <div class="promise"><span class="row-ic">${ic('bolt')}</span><div><b>Home charging rebate</b><p class="fine">Credit against your home charger’s grid fees.</p>
      <button class="chip-btn mt-sm" data-act="redeem" data-id="30" data-msg="Applied 30 credits to your charging rebate.">Apply 30 credits</button></div></div>
    <p class="fine"><b>Credit never buys faster service.</b> Nobody skips the queue.</p>
  </div></div>`;
}
