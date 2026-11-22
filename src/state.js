/* App state: one plain object, mutated by event handlers, read by views. */

const ACCESS_KEY = 'pm-access';
const ACCESS_DEFAULTS = { wheel: false, walk: false, stairs: false, quiet: false, audio: false, large: false, calm: false };

/** Only trust boolean keys we know about from storage. */
function loadAccess() {
  const out = { ...ACCESS_DEFAULTS };
  try {
    const raw = JSON.parse(localStorage.getItem(ACCESS_KEY) || '{}');
    for (const k of Object.keys(ACCESS_DEFAULTS)) if (typeof raw[k] === 'boolean') out[k] = raw[k];
  } catch (e) { /* storage unavailable or corrupt: use defaults */ }
  return out;
}
export function saveAccess() {
  try { localStorage.setItem(ACCESS_KEY, JSON.stringify(S.access)); } catch (e) { /* ignore */ }
}

export const S = {
  screen: 'ride',            // ride | live | fleet | impact | access | serve
  prev: 'ride',
  step: 'home',              // home | search | options | approach | ride | arrived
  pickup: 'here',
  dest: null,
  opt: 'pod',
  query: '',
  pickOpen: false,
  rating: null,
  access: loadAccess(),
  layers: { fleet: true, corridors: true, hubs: true, demand: true, depots: false },
  hide: {},                  // fleet types hidden on the live map
  cs: { on: true, win: 'work', essential: true, energy: 41.8, credit: 126 },
  district: 'central',
  events: [],
  em: null,
  sim: { phase: 'idle' },    // idle | matching | approach | wait | ride | done
  month: { journeys: 34, fare: 11.6, subsidy: 142.3, benefits: 96.4 },
  city: { vehicles: 1284, wait: 3.8, riders: 18420, emerg: 46, comm: 212, step: 9310, pods: 412 }
};

export const stepFree = () => S.access.wheel || S.access.stairs;
/** Vehicle types this rider can't use with their settings. */
export const blockedFor = (f) => S.access.wheel && !f.wheel;
