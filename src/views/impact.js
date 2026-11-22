/* Impact tab: the rider's month, the service guarantee, where money goes, evidence. */
import { S } from '../state.js';
import { FARE_CAP, COST_SPLIT, DISTRICTS, PROMISES, FACTS_REAL, FACTS_PROJ, OPEN_QUESTIONS } from '../data.js';
import { ic } from '../icons.js';
import { money } from '../util.js';

const pct = n => Math.round(n * 100);
export const proof = (f, cls = '') => `<div class="proof ${cls}"><div class="proof-n">${f[0]}</div><p>${f[1]}<span class="src">${f[2]}</span></p></div>`;

export function viewImpact() {
  const m = S.month, d = DISTRICTS[S.district];
  const months = [['May', 14.2], ['Jun', 16.0], ['Jul', 18], ['Aug', 17.4], ['Sep', 15.1], ['Oct', m.fare]];
  const fill = Math.min(100, m.fare / FARE_CAP * 100);
  const split = `Energy ${pct(COST_SPLIT.energy)}%, upkeep ${pct(COST_SPLIT.upkeep)}%, accessible service ${pct(COST_SPLIT.access)}%`;
  return `<div class="page"><div class="page-head">
    <p class="eyebrow">Your month · October</p>
    <h1 id="h" class="h2" tabindex="-1">What riding public saved you</h1>
    <p class="lead">Simulated numbers for a sample rider, shown in full.</p></div>

  <div class="card brand">
    <p class="eyebrow on-brand">Fares this month</p>
    <div class="big num">${money(m.fare)}<span class="of"> of ${money(FARE_CAP)} cap</span></div>
    <div class="meter" role="progressbar" aria-label="Monthly fare cap used" aria-valuemin="0" aria-valuemax="${FARE_CAP}" aria-valuenow="${m.fare}"><i style="width:${fill}%"></i></div>
    <p class="fine">Once you reach ${money(FARE_CAP)}, every trip for the rest of the month is free.</p>
  </div>
  <div class="grid2">
    <div class="card mini"><small>Trips taken</small><strong class="num" id="im-j">${m.journeys}</strong></div>
    <div class="card mini"><small>Subsidy and benefits</small><strong class="num">${money(m.subsidy + m.benefits)}</strong></div>
    <div class="card mini wide"><small>Car costs avoided (est.)</small><strong class="num">$684</strong><p class="fine">About two-thirds of a typical $1,015 monthly cost to own and run a car (AAA, 2023).</p></div>
  </div>
  <div class="card"><h2 class="h3">Six months of fares</h2>
    <div class="chart" role="img" aria-label="Monthly fares from May to October, each $18 or less">${months.map(([n, v], i) => `
      <div><span class="num">$${v.toFixed(0)}</span><i style="height:${Math.round(v / FARE_CAP * 100)}%;animation-delay:${i * 70}ms"></i><span>${n}</span></div>`).join('')}</div>
    <p class="fine">The dashed line is the ${money(FARE_CAP)} cap. No month goes over it.</p></div>

  <h2 class="h3 mt">The service guarantee</h2>
  <div class="card night">
    <p class="eyebrow on-night">Maximum pickup time</p>
    <div class="big num">${d.max}<span class="of"> min</span></div>
    <p class="fine">Average right now in this area: <b class="num">${d.now} min</b>. Published daily.</p>
    <div class="seg on-night" role="group" aria-label="Service area">${Object.entries(DISTRICTS).map(([k, v]) => `<button data-act="district" data-id="${k}" aria-pressed="${S.district === k}">${v.name}</button>`).join('')}</div>
  </div>
  <div class="card flush">
    <div class="promise"><span class="row-ic">${ic('moon')}</span><div><b>24/7 for essential travel</b><p class="fine">Healthcare, shift work, food and safety, every hour in every district.</p></div></div>
    <div class="promise"><span class="row-ic">${ic('ramp')}</span><div><b>A ramp vehicle within 8 minutes</b><p class="fine">In every neighbourhood. If yours is reassigned, you’re told right away.</p></div></div>
    <div class="promise"><span class="row-ic">${ic('ret')}</span><div><b>A guaranteed way home</b><p class="fine">Every outbound trip reserves a return, even late or in bad weather.</p></div></div>
    <div class="promise"><span class="row-ic">${ic('siren')}</span><div><b>Emergency vehicles go first</b><p class="fine">Your vehicle yields automatically, and the guarantee clock pauses.</p></div></div>
    <div class="promise"><span class="row-ic">${ic('shield')}</span><div><b>When a promise is missed</b><p class="fine">The delay is logged publicly, reviewed by staff, and the trip is free.</p></div></div>
  </div>

  <div class="card"><h2 class="h3">Where each fare dollar goes</h2>
    <div class="stack" role="img" aria-label="${split}"><span style="flex:${pct(COST_SPLIT.energy)};background:var(--brand)"></span><span style="flex:${pct(COST_SPLIT.upkeep)};background:var(--ink)"></span><span style="flex:${pct(COST_SPLIT.access)};background:var(--blue)"></span></div>
    <ul class="keys"><li><i style="background:var(--brand)"></i>Energy ${pct(COST_SPLIT.energy)}%</li><li><i style="background:var(--ink)"></i>Upkeep ${pct(COST_SPLIT.upkeep)}%</li><li><i style="background:var(--blue)"></i>Accessible service ${pct(COST_SPLIT.access)}%</li></ul>
    <p class="label mt-sm">Never part of a fare</p>
    <ul class="never">${PROMISES.map(p => `<li>${ic('close', 'sm')}${p}</li>`).join('')}</ul></div>

  <p class="eyebrow mt">Evidence</p>
  <h2 class="h3">What public transportation already shows</h2>
  <div class="proofs">${FACTS_REAL.map(f => proof(f)).join('')}</div>
  <p class="eyebrow mt amber">Projections</p>
  <h2 class="h3">What shared autonomous fleets could add</h2>
  <p class="fine">From modelling studies. Scenarios, not promises.</p>
  <div class="proofs">${FACTS_PROJ.map(f => proof(f, 'proj')).join('')}</div>
  <p class="eyebrow mt blue">Open questions</p>
  <h2 class="h3">What a pilot has to prove</h2>
  <div class="card flush">${OPEN_QUESTIONS.map(([i, t, d]) => `<div class="promise"><span class="row-ic">${ic(i)}</span><div><b>${t}</b><p class="fine">${d}</p></div></div>`).join('')}</div>
  </div>`;
}
