/* Landing page: fills icons, fleet cards and open questions from the shared data. */
import { FLEET, OPEN_QUESTIONS } from './data.js';
import { ic } from './icons.js';
import { vehicleArt } from './illustrations.js';

for (const el of document.querySelectorAll('[data-ic]')) el.innerHTML = ic(el.dataset.ic);
for (const k of ['pod', 'shared', 'bus']) {
  const el = document.getElementById('hero-art-' + k);
  if (el) el.innerHTML = vehicleArt(FLEET[k].icon);
}

const grid = document.getElementById('fleet-grid');
if (grid) grid.innerHTML = Object.entries(FLEET).map(([k, f]) => `
  <article class="vcard-l" style="--tint:${f.color}">
    <div class="vcard-art">${vehicleArt(f.icon, f.name + ' illustration')}</div>
    <div class="vcard-txt">
      <div class="vcard-top"><h3 class="h3">${f.name}</h3>${f.bookable ? `<span class="chip">${f.capacity}</span>` : '<span class="chip alert">Dispatched by 911</span>'}</div>
      <p>${f.blurb}</p>
      <dl>
        <div><dt>Typical wait</dt><dd>${f.wait == null ? 'Priority' : f.wait + ' min'}</dd></div>
        <div><dt>Service area</dt><dd>${f.area}</dd></div>
        <div><dt>Access</dt><dd>${f.wheel ? 'Ramp equipped' : 'Step-in'}</dd></div>
      </dl>
    </div>
  </article>`).join('');

const qs = document.getElementById('questions');
if (qs) qs.innerHTML = OPEN_QUESTIONS.map(([i, t, d]) => `<div class="question"><span class="q-ic">${ic(i)}</span><div><h4>${t}</h4><p>${d}</p></div></div>`).join('');
