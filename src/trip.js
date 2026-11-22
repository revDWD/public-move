/* Routing on the street grid and fare quotes. Pure functions over S + data. */
import { S, stepFree } from './state.js';
import { GRID_Y, PICKUPS, PLACES, FLEET, BENEFITS, FARE_CAP, SUBSIDY, BASE_FARE, PER_KM, KM_PER_PX, COST_SPLIT, STREETS_V, STREETS_H } from './data.js';
import { round2 } from './util.js';

const snapY = y => GRID_Y.reduce((a, b) => Math.abs(b - y) < Math.abs(a - y) ? b : a);

/** A street-following path between two grid points. */
export function routeBetween(a, b) {
  const [ax, ay] = a, [bx, by] = b;
  let pts;
  if (ax === bx || ay === by) pts = [a, b];
  else {
    const ym = snapY((ay + by) / 2);
    pts = ym === ay || ym === by ? [a, [ax, by], b] : [a, [ax, ym], [bx, ym], b];
  }
  const d = 'M' + pts.map(p => p.join(' ')).join('L');
  let px = 0;
  for (let i = 1; i < pts.length; i++) px += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
  return { d, pts, px };
}

/** Street name at fraction f of a route. */
export function streetAt(route, f) {
  let target = f * route.px, acc = 0;
  for (let i = 1; i < route.pts.length; i++) {
    const [x1, y1] = route.pts[i - 1], [x2, y2] = route.pts[i];
    const len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
    if (acc + len >= target || i === route.pts.length - 1) return x1 === x2 ? STREETS_V[x1] || 'Local street' : STREETS_H[y1] || 'Local street';
    acc += len;
  }
  return '';
}

/** Point and direction on a route at fraction f. */
export function pointAt(route, f) {
  let target = f * route.px, acc = 0;
  for (let i = 1; i < route.pts.length; i++) {
    const [x1, y1] = route.pts[i - 1], [x2, y2] = route.pts[i];
    const len = Math.abs(x2 - x1) + Math.abs(y2 - y1);
    if (acc + len >= target) {
      const t = len ? (target - acc) / len : 0;
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, horiz: y1 === y2 };
    }
    acc += len;
  }
  const p = route.pts[route.pts.length - 1];
  return { x: p[0], y: p[1], horiz: true };
}

/** The current trip: pickup → destination, plus the approach of the vehicle. */
export function currentTrip() {
  const from = PICKUPS[S.pickup].pt, place = PLACES[S.dest];
  const route = routeBetween(from, place.pt);
  const sx = from[0] < 500 ? from[0] + 420 : from[0] - 420;
  const sy = from[1] < 440 ? from[1] + 240 : from[1] - 240;
  const approach = routeBetween([sx, sy], from);
  return { from, place, route, approach, km: round2(route.px * KM_PER_PX) };
}

/** Fare quote for a vehicle type on the current trip. One source of truth for every receipt. */
export function quote(type) {
  const f = FLEET[type], t = currentTrip(), benefit = t.place.benefit ? BENEFITS[t.place.benefit] : null;
  const atCost = round2((BASE_FARE + t.km * PER_KM) * f.mult);
  const subsidy = round2(atCost * SUBSIDY);
  const afterSubsidy = round2(atCost - subsidy);
  let benefitCover = 0, capCover = 0, pay;
  if (benefit) { benefitCover = afterSubsidy; pay = 0; }
  else {
    pay = round2(Math.min(afterSubsidy, Math.max(0, FARE_CAP - S.month.fare)));
    capCover = round2(afterSubsidy - pay);
  }
  const energy = round2(atCost * COST_SPLIT.energy), upkeep = round2(atCost * COST_SPLIT.upkeep);
  const wheelExtra = S.access.wheel ? (f.seats > 4 ? 2 : 1) : 0;
  const walkMin = f.mode === 'stop' ? (S.access.walk || stepFree() ? 0 : 3) : f.mode === 'corner' ? (S.access.walk ? 0 : 1) : 0;
  const pickup = f.wait + wheelExtra;
  const ride = Math.round(t.km * 2.6 + 1 + f.detour);
  return {
    atCost, subsidy, benefit, benefitCover, capCover, pay,
    energy, upkeep, access: round2(atCost - energy - upkeep),
    pickup, walkMin, ride, km: t.km
  };
}
