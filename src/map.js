/* The simulated city: a deterministic SVG map with layers, fleet and trip overlays. */
import { NS, $ } from './util.js';
import { GRID_X, GRID_Y, CORRIDORS, HUBS, DEPOTS, DEMAND, LOOPS, AMBIENT, FLEET } from './data.js';
import { S } from './state.js';

export const svg = $('#mapsvg');
export const pathEls = {};
export let vehicles = [];

const C = {
  ground: '#eceeea', block: ['#e2e5e0', '#dfe3dd', '#e5e8e3'], building: '#d6dbd5',
  park: '#cfe5cc', tree: '#b6d6b1', water: '#c9dfea', waterDeep: '#b6d2e0',
  road: '#ffffff', casing: '#d3d8d3', major: '#fffaf0', majorCasing: '#d8d0bd'
};

const hash = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

/** Top-down vehicle marks, drawn facing +x. */
export function vehShape(type, color) {
  switch (type) {
    case 'pod': return `<rect x="-8" y="-6" width="16" height="12" rx="6" fill="#0e1513" stroke="#fff" stroke-width="2"/><circle cx="3" r="2.2" fill="#2fd18f"/>`;
    case 'shared': return `<rect x="-11" y="-6.5" width="22" height="13" rx="4.5" fill="#2453c4" stroke="#fff" stroke-width="2"/><rect x="1" y="-4" width="6" height="8" rx="2" fill="#bcd3f5"/>`;
    case 'shuttle': return `<rect x="-14" y="-7" width="28" height="14" rx="5" fill="#0a7a52" stroke="#fff" stroke-width="2"/><rect x="-9" y="-3" width="18" height="6" rx="2" fill="#bfe8d4"/>`;
    case 'bus': return `<rect x="-19" y="-7" width="38" height="14" rx="5" fill="${color || '#0b7285'}" stroke="#fff" stroke-width="2.2"/><path d="M-13 0h26" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>`;
    case 'comm': return `<rect x="-10" y="-6" width="20" height="12" rx="4" fill="#c76a0a" stroke="#fff" stroke-width="2"/><circle cx="2" r="2.6" fill="#fff"/>`;
    case 'emerg': return `<circle r="12" fill="#c62d25" class="sirenpulse"/><rect x="-12" y="-7" width="24" height="14" rx="4" fill="#c62d25" stroke="#fff" stroke-width="2"/><path d="M-2 -4h4v8h-4zM-5 -1.5h10v3h-10z" fill="#fff"/>`;
    case 'hero': return `<circle r="20" fill="#0a7a52" opacity=".18" class="pulse"/><rect x="-11" y="-8" width="22" height="16" rx="7" fill="#0a7a52" stroke="#fff" stroke-width="3"/><circle cx="4" r="2.6" fill="#fff"/>`;
  }
  return '';
}

function blocks() {
  const parks = [[80, 320], [360, 80], [640, 440], [-200, 560]];
  let out = '';
  GRID_X.slice(0, -1).forEach((x, i) => GRID_Y.slice(0, -1).forEach((y, j) => {
    const r = hash(i, j);
    if (parks.some(p => p[0] === x && p[1] === y)) {
      out += `<rect x="${x + 9}" y="${y + 9}" width="122" height="102" rx="16" fill="${C.park}"/>`;
      for (let k = 0; k < 7; k++) out += `<circle cx="${x + 24 + hash(i + k, j) * 92}" cy="${y + 22 + hash(j + k, i) * 76}" r="${5 + hash(k, i + j) * 5}" fill="${C.tree}"/>`;
      return;
    }
    out += `<rect x="${x + 9}" y="${y + 9}" width="122" height="102" rx="8" fill="${C.block[Math.floor(r * 3)]}"/>`;
    // two to four buildings per block
    const n = 2 + Math.floor(r * 3);
    for (let k = 0; k < n; k++) {
      const bw = 26 + hash(k, i * 7 + j) * 30, bh = 20 + hash(i + j, k * 3) * 26;
      const bx = x + 16 + (k % 2) * 56 + hash(k, j) * 6, by = y + 16 + Math.floor(k / 2) * 46 + hash(i, k) * 4;
      out += `<rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${Math.min(bw, 50).toFixed(0)}" height="${Math.min(bh, 38).toFixed(0)}" rx="3" fill="${C.building}"/>`;
    }
  }));
  return out;
}

export function buildMap() {
  const vr = GRID_X.map(x => `M${x} -400V1100`).join(''), hr = GRID_Y.map(y => `M-500 ${y}H1500`).join('');
  const major = 'M500 -400V1100M-500 320H1500';
  const river = 'M-500 890C100 800 260 870 520 825S900 790 1500 860';
  const paths = { ...LOOPS, ...Object.fromEntries(Object.entries(CORRIDORS).map(([k, c]) => [k, c.d])) };

  const corridors = Object.entries(CORRIDORS).map(([k, c]) =>
    `<path d="${c.d}" stroke="#fff" stroke-width="13"/><path d="${c.d}" stroke="${c.color}" stroke-width="7" stroke-dasharray="${k === 'c2' ? 'none' : 'none'}"/>`).join('');
  const stops = Object.values(CORRIDORS).map(c => c.stops.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="6.5" fill="#fff" stroke="${c.color}" stroke-width="3.5"/>`).join('')).join('');
  const corrLabels = Object.values(CORRIDORS).map(c => {
    const m = c.d.match(/M(-?\d+) (-?\d+)/); const x = Math.max(+m[1], 10), y = Math.max(+m[2], 40);
    return `<g class="maplbl" transform="translate(${x + 14} ${y - 12})"><rect x="-4" y="-14" width="34" height="20" rx="6" fill="${c.color}"/><text x="13" y="0" text-anchor="middle" fill="#fff" font-size="12" font-weight="750">${c.name}</text></g>`;
  }).join('');
  const hubs = HUBS.map(h => `<g><circle cx="${h.pt[0]}" cy="${h.pt[1]}" r="15" fill="#fff" stroke="#0e1513" stroke-width="5"/><path d="M${h.pt[0] - 5} ${h.pt[1]}h10M${h.pt[0]} ${h.pt[1] - 5}v10" stroke="#0e1513" stroke-width="3"/><text class="hublbl" x="${h.pt[0] + 22}" y="${h.pt[1] - 16}">${h.name}</text></g>`).join('');
  const depots = DEPOTS.map(d => `<g transform="translate(${d.pt[0]} ${d.pt[1]})"><rect x="-17" y="-17" width="34" height="34" rx="9" fill="#0e1513"/><path d="M2 -9l-8 11h6l-2 8 8-11h-6z" fill="#2fd18f"/><text class="hublbl" x="24" y="5">${d.name} · ${d.bays} bays</text></g>`).join('');
  const demand = DEMAND.map((z, i) => `<g><circle cx="${z.pt[0]}" cy="${z.pt[1]}" r="${z.r}" fill="url(#heat${z.level === 'High' ? 'H' : 'R'})" class="breathe" style="animation-delay:${i * .6}s"/><text class="zonelbl" x="${z.pt[0]}" y="${z.pt[1] - z.r * .55}" text-anchor="middle">${z.level} demand</text></g>`).join('');

  svg.innerHTML = `
  <defs>
    ${Object.entries(paths).map(([k, d]) => `<path id="p-${k}" d="${d}" fill="none"/>`).join('')}
    <radialGradient id="heatH"><stop offset="0" stop-color="#e8590c" stop-opacity=".34"/><stop offset=".6" stop-color="#e8590c" stop-opacity=".12"/><stop offset="1" stop-color="#e8590c" stop-opacity="0"/></radialGradient>
    <radialGradient id="heatR"><stop offset="0" stop-color="#e8930c" stop-opacity=".28"/><stop offset=".6" stop-color="#e8930c" stop-opacity=".1"/><stop offset="1" stop-color="#e8930c" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="-1500" y="-1500" width="4000" height="4000" fill="${C.ground}"/>
  ${blocks()}
  <path d="${river}" fill="none" stroke="${C.waterDeep}" stroke-width="100" stroke-linecap="round"/>
  <path d="${river}" fill="none" stroke="${C.water}" stroke-width="76" stroke-linecap="round"/>
  <path d="${vr}${hr}" stroke="${C.casing}" stroke-width="15" fill="none"/>
  <path d="${major}" stroke="${C.majorCasing}" stroke-width="23" fill="none"/>
  <path d="${vr}${hr}" stroke="${C.road}" stroke-width="11" fill="none"/>
  <path d="${major}" stroke="${C.major}" stroke-width="19" fill="none"/>
  <text class="lbl" x="92" y="386">Elm Park</text><text class="lbl" x="372" y="146">Civic Gardens</text>
  <text class="lbl" x="652" y="506">Eastgate</text><text class="lbl" x="800" y="140">Northside</text><text class="lbl water" x="760" y="842">The River</text>
  <g id="lyr-demand" class="layer">${demand}</g>
  <g id="lyr-corridors" class="layer" fill="none" stroke-linecap="round" stroke-linejoin="round">${corridors}</g>
  <g id="lyr-stops" class="layer">${stops}${corrLabels}</g>
  <g id="lyr-hubs" class="layer">${hubs}</g>
  <g id="lyr-depots" class="layer">${depots}</g>
  <g class="routeLayer">
    <path id="apLine" fill="none" stroke="#0e1513" stroke-width="5" stroke-dasharray="2 11" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="routeCase" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="routeLine" fill="none" stroke="#0e1513" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="routeDone" fill="none" stroke="#0a7a52" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 9999"/>
  </g>
  <g id="pinA"><circle r="24" fill="#2453c4" opacity=".16" class="pulse"/><circle r="11" fill="#2453c4" stroke="#fff" stroke-width="4.5"/><text id="pinAl" x="18" y="28" class="pinlbl"></text></g>
  <g id="pinB" class="routeLayer"><rect x="-12" y="-12" width="24" height="24" rx="6" fill="#0e1513" stroke="#fff" stroke-width="3.5"/><rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#fff"/><text id="pinBl" x="-20" y="-18" text-anchor="end" class="pinlbl"></text></g>
  <g id="lyr-fleet" class="layer"><g id="vehicles"></g></g>
  <g id="emV" style="display:none"></g>
  <g id="hero"></g>`;

  for (const k of Object.keys(paths)) pathEls[k] = $('#p-' + k);
  pathEls.route = $('#routeLine');
  pathEls.ap = $('#apLine');
  buildVehicles();
  $('#hero').innerHTML = vehShape('hero');
}

function buildVehicles() {
  const g = $('#vehicles');
  vehicles = AMBIENT.map(([type, path, off, speed]) => {
    const el = document.createElementNS(NS, 'g');
    el.setAttribute('class', 'veh');
    el.dataset.type = type;
    el.innerHTML = vehShape(type, CORRIDORS[path] ? CORRIDORS[path].color : null);
    g.appendChild(el);
    const p = pathEls[path];
    return { type, path: p, len: p.getTotalLength(), off, speed, pingpong: !!CORRIDORS[path], el };
  });
}

export function place(el, path, d) {
  const a = path.getPointAtLength(d), b = path.getPointAtLength(d + 1.5);
  el.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI).toFixed(1)})`);
}

/** Point pins and route lines at the current trip (or just the pickup). */
export function setTripGeometry(trip, pickupLabel) {
  const [ax, ay] = trip ? trip.from : [0, 0];
  $('#pinA').setAttribute('transform', `translate(${ax} ${ay})`);
  $('#pinAl').textContent = pickupLabel || '';
  if (!trip.route) return;
  ['routeCase', 'routeLine', 'routeDone'].forEach(id => $('#' + id).setAttribute('d', trip.route.d));
  $('#apLine').setAttribute('d', trip.approach.d);
  const [bx, by] = trip.place.pt;
  $('#pinB').setAttribute('transform', `translate(${bx} ${by})`);
  $('#pinBl').textContent = trip.place.name;
  // flip the destination label to the right if it would sit off the left of the route
  $('#pinBl').setAttribute('text-anchor', bx < 400 ? 'start' : 'end');
  $('#pinBl').setAttribute('x', bx < 400 ? 20 : -20);
}

/** Show or hide map layers and fleet types to match state. */
export function syncLayers() {
  const L = S.layers;
  $('#lyr-fleet').style.display = L.fleet ? '' : 'none';
  $('#lyr-corridors').style.display = L.corridors ? '' : 'none';
  $('#lyr-stops').style.display = L.corridors ? '' : 'none';
  $('#lyr-hubs').style.display = L.hubs ? '' : 'none';
  $('#lyr-depots').style.display = L.depots ? '' : 'none';
  $('#lyr-demand').style.display = L.demand ? '' : 'none';
  vehicles.forEach(v => { v.el.style.display = S.hide[v.type] ? 'none' : ''; });
}

/** Count of ambient vehicles of a type currently drawn (for the live legend). */
export const fleetColor = t => FLEET[t === 'emerg' ? 'emerg' : t].color;
