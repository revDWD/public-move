/* Accessibility settings. */
import { S } from '../state.js';
import { ic } from '../icons.js';

const sw = (k, icon, title, desc) => `<button class="switch" role="switch" aria-checked="${S.access[k]}" data-act="acc" data-id="${k}"><span class="row-ic">${ic(icon)}</span><span class="row-body"><b>${title}</b><span class="meta">${desc}</span></span><span class="knob" aria-hidden="true"></span></button>`;

export function viewAccess() {
  const a = S.access, bits = [];
  if (a.wheel) bits.push('Ramp vehicles only');
  if (a.walk) bits.push('Door-to-door');
  if (a.stairs) bits.push('Step-free routes');
  if (a.quiet) bits.push('Quiet cabin');
  if (a.audio) bits.push('Spoken updates');
  return `<div class="page"><div class="page-head">
    <button class="back" data-act="close-access">${ic('back', 'sm')}<span>Back</span></button>
    <p class="eyebrow">Accessibility</p>
    <h1 id="h" class="h2" tabindex="-1">Travel on your terms</h1>
    <p class="lead">Set it once. Every booking, vehicle and route follows it. Saved on this device only.</p></div>
  <h2 class="label">Trip needs</h2>
  <div class="card flush">
    ${sw('wheel', 'ramp', 'Wheelchair access', 'Ramp vehicles only, with extra time to board')}
    ${sw('walk', 'walk', 'Reduced walking', 'Door-to-door pickup and drop-off')}
    ${sw('stairs', 'stairs', 'Step-free routing', 'Step-free stops, entrances and transfers')}
    ${sw('quiet', 'quiet', 'Quiet travel', 'Low-sensory cabin, softer light, no chimes')}
    ${sw('audio', 'audio', 'Audio navigation', 'Spoken updates for pickup, route and arrival')}
  </div>
  <h2 class="label">Display</h2>
  <div class="card flush">
    ${sw('large', 'text', 'Larger text', 'Increase text size across the app')}
    ${sw('calm', 'motion', 'Reduce motion', 'Calmer animations and a still camera')}
  </div>
  <div class="card night">
    <p class="eyebrow on-night">Your next trip</p>
    <p class="big-line">${bits.length ? bits.join(' · ') : 'Standard service. Turn something on to see it applied.'}</p>
    ${a.wheel ? '<p class="fine">Shared Rides and resident cars without a ramp won’t be offered.</p>' : ''}
  </div></div>`;
}
