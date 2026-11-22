/* Live map tab: city stats, layer controls, fleet filter, activity ticker. */
import { S } from '../state.js';
import { FLEET, TICKS, EMERGENCY_UNITS } from '../data.js';
import { ic } from '../icons.js';

const LAYERS = [
  ['fleet', 'fleet', 'Vehicles', 'Every public vehicle in motion'],
  ['corridors', 'bus', 'Bus corridors', 'C1, C2 and C3 with stops'],
  ['hubs', 'station', 'Hubs and stations', 'Transfer points with level boarding'],
  ['demand', 'flame', 'Demand zones', 'Where requests are rising now'],
  ['depots', 'zap', 'Charging depots', 'Where vehicles rest and recharge']
];
const TYPES = ['pod', 'shared', 'shuttle', 'bus', 'comm', 'emerg'];

export function viewLive() {
  const c = S.city;
  const stat = (id, label, v, icon) => `<div class="stat"><span class="stat-ic">${ic(icon, 'sm')}</span><small>${label}</small><strong class="num" id="${id}">${v}</strong></div>`;
  return `<div class="grab" aria-hidden="true"></div>
  <div class="head-row"><div><p class="eyebrow"><span class="chip live">Live · simulated</span></p>
    <h1 id="h" class="h2" tabindex="-1">The network right now</h1></div>
    <button class="icon-btn" data-act="recenter" aria-label="Recenter map">${ic('recenter')}</button></div>
  <div class="stats">
    ${stat('s-veh', 'Vehicles in service', c.vehicles.toLocaleString(), 'fleet')}
    ${stat('s-wait', 'Average pickup', c.wait.toFixed(1) + ' min', 'clock')}
    ${stat('s-rid', 'Riders today', c.riders.toLocaleString(), 'users')}
    ${stat('s-em', 'Emergency units ready', c.emerg + ' / ' + EMERGENCY_UNITS, 'siren')}
    ${stat('s-com', 'Resident cars lent', c.comm, 'community')}
    ${stat('s-stp', 'Step-free trips today', c.step.toLocaleString(), 'ramp')}
  </div>
  <div class="ticker" aria-live="off">${ic('bell', 'sm')}<span id="tick">${TICKS[0]}</span></div>
  <h2 class="h3 mt">Map layers</h2>
  <div class="card flush">${LAYERS.map(([k, icon, t, d]) => `
    <button class="switch" role="switch" aria-checked="${S.layers[k]}" data-act="layer" data-id="${k}"><span class="row-ic">${ic(icon)}</span><span class="row-body"><b>${t}</b><span class="meta">${d}</span></span><span class="knob" aria-hidden="true"></span></button>`).join('')}</div>
  <h2 class="h3 mt">Show vehicle types</h2>
  <div class="legend" role="group" aria-label="Vehicle types on the map">${TYPES.map(k => `
    <button class="leg" data-act="legend" data-id="${k}" aria-pressed="${!S.hide[k]}" ${S.layers.fleet ? '' : 'disabled'}><i style="background:${FLEET[k].color}"></i>${FLEET[k].name}</button>`).join('')}</div>`;
}
