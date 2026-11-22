/* Map camera: animates the SVG viewBox to frame what matters, clear of the sheet/panel.
   Layout numbers here must match the CSS custom properties --panel-w and --panel-gap. */
import { $ } from './util.js';
import { S } from './state.js';
import { pathEls, svg } from './map.js';
import { PICKUPS } from './data.js';

export const DESKTOP = 900;
const cssPx = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;

const mapEl = $('#map'), sheet = $('#sheet');
export let vb = { x: 0, y: 0, w: 1000, h: 800 };
export let target = null;

function insets() {
  const W = innerWidth, H = innerHeight;
  if (W >= DESKTOP) return { l: cssPx('--panel-gap', 20) * 2 + cssPx('--panel-w', 420), t: 90, r: 40, b: 40 };
  const top = sheet.getBoundingClientRect().top;
  return { l: 16, r: 16, t: 84, b: Math.max(80, H - top + 16) };
}

function fit(bb) {
  const W = mapEl.clientWidth || innerWidth, H = mapEl.clientHeight || innerHeight, i = insets();
  const uw = Math.max(80, W - i.l - i.r), uh = Math.max(80, H - i.t - i.b);
  const s = Math.min(uw / bb.w, uh / bb.h), cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
  return { x: cx - (i.l + uw / 2) / s, y: cy - (i.t + uh / 2) / s, w: W / s, h: H / s };
}

const pad = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.width + 2 * p, h: b.height + 2 * p });
const union = (a, b) => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
};

function frameNow() {
  if (S.screen === 'live' || S.screen === 'fleet' || S.screen === 'impact' || S.screen === 'serve' || S.screen === 'access') return { x: -40, y: -20, w: 1080, h: 860 };
  const st = S.step;
  if (st === 'home' || st === 'search' || !S.dest) {
    const [x, y] = PICKUPS[S.pickup].pt;
    const big = innerWidth >= DESKTOP;
    return big ? { x: x - 380, y: y - 300, w: 760, h: 560 } : { x: x - 230, y: y - 170, w: 460, h: 340 };
  }
  const rb = pathEls.route.getBBox();
  if (st === 'approach') {
    const ab = pathEls.ap.getBBox();
    return S.sim.phase === 'ride' ? pad(union(ab, rb), 70) : pad(ab, 90);
  }
  return pad(rb, 90);
}

export function retarget(snap = false) {
  target = fit(frameNow());
  if (snap || S.access.calm) { vb = { ...target }; applyVB(); }
}
export function applyVB() { svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); }

/** Ease the camera toward its target; called every frame. */
export function stepCamera(dt) {
  if (!target) return;
  const k = 1 - Math.exp(-dt * 4.5);
  vb.x += (target.x - vb.x) * k; vb.y += (target.y - vb.y) * k;
  vb.w += (target.w - vb.w) * k; vb.h += (target.h - vb.h) * k;
  applyVB();
}
