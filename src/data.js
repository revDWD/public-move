/* Public / Move: fictional pilot data. One source of truth for the
   landing page and the ride app. Nothing here is real. */

/* ---------- pricing constants ---------- */
export const FARE_CAP = 18;            // monthly cap, $
export const SUBSIDY = 0.5;            // share of at-cost fare paid by the public subsidy
export const BASE_FARE = 1.1;          // $ per trip before distance
export const PER_KM = 1.25;            // $ per km, at cost, for a Solo Pod
export const KM_PER_PX = 0.007;        // map scale
export const COST_SPLIT = { energy: 0.38, upkeep: 0.47, access: 0.15 };
export const EMERGENCY_UNITS = 48;
export const START_MIN = 8 * 60 + 12;  // simulated clock: 8:12 AM

/* ---------- street grid ---------- */
export const GRID_X = [-340, -200, -60, 80, 220, 360, 500, 640, 780, 920, 1060, 1200];
export const GRID_Y = [-280, -160, -40, 80, 200, 320, 440, 560, 680, 800, 920];
export const STREETS_V = { '-60': 'Bay St', 80: 'Larch Ave', 220: 'Elm St', 360: 'Oak St', 500: 'Civic Ave', 640: 'Market St', 780: 'Meridian Ave', 920: 'Eastgate Blvd', 1060: 'Shore Rd' };
export const STREETS_H = { '-40': 'North Rd', 80: '9th St', 200: '7th St', 320: 'Central Pkwy', 440: '5th St', 560: '3rd St', 680: 'Riverside Row', 800: 'River Rd' };

/* ---------- pickups and places ---------- */
export const PICKUPS = {
  here: { name: 'Current location', label: 'Elm St & 3rd', pt: [220, 560], icon: 'locate' },
  home: { name: 'Home', label: '418 Larch Ave', pt: [80, 440], icon: 'home' },
  hub: { name: 'Civic Hub Station', label: 'Central Pkwy & Market', pt: [640, 320], icon: 'station' }
};

/* benefit: covers the remaining fare after subsidy for eligible trips */
export const BENEFITS = {
  work: { name: 'Employment Mobility Benefit', short: 'Work trip · $0' },
  health: { name: 'Healthcare Mobility Benefit', short: 'Healthcare · $0' },
  edu: { name: 'Student Mobility Pass', short: 'Student pass · $0' }
};

export const PLACES = {
  work: { name: 'Meridian Works', kind: 'Work', area: 'Northside office park', pt: [780, 200], icon: 'work', benefit: 'work', saved: true },
  clinic: { name: 'Riverside Clinic', kind: 'Healthcare', area: 'Riverside Row', pt: [500, 680], icon: 'health', benefit: 'health', saved: true },
  market: { name: 'Elm Park Market', kind: 'Groceries', area: 'Oak St & 5th', pt: [360, 440], icon: 'market', saved: true },
  college: { name: 'Eastgate College', kind: 'Education', area: 'Eastgate Blvd', pt: [920, 560], icon: 'school', benefit: 'edu' },
  library: { name: 'Central Library', kind: 'Library', area: 'Civic Ave & 9th', pt: [500, 80], icon: 'book' },
  station: { name: 'Eastgate Station', kind: 'Transit hub', area: 'Market St & 3rd', pt: [640, 560], icon: 'station' },
  park: { name: 'Harbor Yards Park', kind: 'Park', area: 'Larch Ave & Riverside', pt: [80, 680], icon: 'tree' }
};

/* ---------- fleet ---------- */
/* mult: share of the Solo Pod at-cost fare. detour: extra ride minutes for sharing.
   mode: door = door to door, corner = nearest corner, stop = corridor stop. */
export const FLEET = {
  pod: {
    name: 'Solo Pod', icon: 'pod', color: '#0e1513', bookable: true,
    seats: 2, capacity: '1–2 riders', wheel: true, wait: 3, mult: 1, detour: 0, mode: 'door', avail: 412,
    area: 'Citywide, 24/7',
    blurb: 'A private two-seat cabin for quick trips, door to door.',
    access: ['Side ramp and one wheelchair bay', 'Audio and tactile controls', 'Low step-in height'],
    plate: 'PM-0417'
  },
  shared: {
    name: 'Shared Ride', icon: 'shared', color: '#2453c4', bookable: true,
    seats: 4, capacity: 'Up to 4, shared', wheel: false, wait: 5, mult: 0.45, detour: 4, mode: 'door', avail: 286,
    area: 'Citywide, 6 AM – midnight',
    blurb: 'Matched with neighbours heading the same way. A short detour for a much lower fare.',
    access: ['Step-in entry', 'Priority front seat'],
    plate: 'SR-1182'
  },
  shuttle: {
    name: 'Neighborhood Shuttle', icon: 'shuttle', color: '#0a7a52', bookable: true,
    seats: 10, capacity: 'Up to 10', wheel: true, wait: 7, mult: 0.3, detour: 6, mode: 'corner', avail: 94,
    area: 'Elm Park, Eastgate, Riverside',
    blurb: 'Flexible routes inside a neighbourhood. Picks up at your nearest corner.',
    access: ['Level boarding', 'Deployable ramp', 'Two wheelchair bays'],
    plate: 'NS-22'
  },
  bus: {
    name: 'Community Bus', icon: 'bus', color: '#0b7285', bookable: true,
    seats: 24, capacity: 'Up to 24', wheel: true, wait: 4, mult: 0.2, detour: 8, mode: 'stop', avail: 38,
    area: 'Corridors C1, C2, C3',
    blurb: 'Small autonomous buses on the busiest corridors, every 4–6 minutes.',
    access: ['Level boarding with kneeling floor', 'Audio and visual stop announcements', 'Three wheelchair bays'],
    plate: 'C2 · Bus 7'
  },
  comm: {
    name: 'Resident Car', icon: 'community', color: '#b45f06', bookable: true,
    seats: 3, capacity: 'Up to 3', wheel: false, wait: 4, mult: 0.55, detour: 0, mode: 'door', avail: 212,
    area: 'Wherever residents lend',
    blurb: 'A neighbour’s own self-driving car, lent to the network while it would sit parked.',
    access: ['Standard entry, no ramp'],
    plate: 'CV-3081'
  },
  emerg: {
    name: 'Emergency Unit', icon: 'siren', color: '#c62d25', bookable: false,
    seats: 0, capacity: 'Crew and patient', wheel: true, wait: null, mult: 0, detour: 0, mode: 'dispatch', avail: 46,
    area: 'Citywide, pre-positioned',
    blurb: 'Ambulance and response units with right-of-way. The whole fleet yields automatically.',
    access: ['Stretcher and wheelchair lift'],
    plate: 'E-12'
  }
};
export const BOOKABLE = Object.keys(FLEET).filter(k => FLEET[k].bookable);

/* ---------- map geometry ---------- */
export const CORRIDORS = {
  c1: { name: 'C1', color: '#6d3fd1', d: 'M-60 440H360V320H640V200H1060', stops: [[80, 440], [360, 440], [500, 320], [640, 200], [920, 200]] },
  c2: { name: 'C2', color: '#0b7285', d: 'M500 -40V320H640V800', stops: [[500, 80], [500, 200], [640, 440], [640, 560], [640, 680]] },
  c3: { name: 'C3', color: '#c2580c', d: 'M-60 680H500V560H920V320', stops: [[80, 680], [220, 680], [500, 600], [780, 560], [920, 440]] }
};
export const HUBS = [
  { name: 'Civic Hub', pt: [640, 320] },
  { name: 'Eastgate Station', pt: [640, 560] },
  { name: 'Harbor Yards', pt: [220, 680] },
  { name: 'Elm Exchange', pt: [500, 200] }
];
export const DEPOTS = [
  { name: 'Harbor Yards depot', pt: [-60, 800], bays: 64 },
  { name: 'North depot', pt: [920, -40], bays: 48 },
  { name: 'Eastgate depot', pt: [1060, 680], bays: 40 }
];
export const DEMAND = [
  { name: 'Civic Hub', pt: [600, 300], r: 150, level: 'High' },
  { name: 'Eastgate', pt: [700, 600], r: 120, level: 'High' },
  { name: 'Elm Park', pt: [260, 500], r: 110, level: 'Rising' },
  { name: 'Meridian', pt: [820, 180], r: 100, level: 'Rising' }
];
export const LOOPS = {
  la: 'M80 200H640V560H80Z',
  lb: 'M220 80H780V440H220Z',
  lc: 'M360 320H920V680H360Z',
  ld: 'M-60 -40H500V440H-60Z',
  le: 'M80 560H920V800H80Z'
};
/* [type, path, offset 0-1, speed px/s] */
export const AMBIENT = [
  ['pod', 'la', .02, 46], ['pod', 'la', .4, 48], ['shared', 'la', .62, 40], ['comm', 'la', .85, 44],
  ['pod', 'lb', .1, 50], ['shuttle', 'lb', .45, 36], ['comm', 'lb', .7, 46], ['shared', 'lb', .9, 42],
  ['pod', 'lc', .05, 48], ['shared', 'lc', .33, 44], ['shuttle', 'lc', .55, 36], ['pod', 'lc', .8, 46],
  ['pod', 'ld', .2, 50], ['shared', 'ld', .6, 42], ['shuttle', 'le', .3, 34], ['pod', 'le', .7, 48],
  ['emerg', 'lc', .2, 110], ['emerg', 'ld', .75, 104],
  ['bus', 'c1', .1, 58], ['bus', 'c1', .6, 58], ['bus', 'c2', .2, 54], ['bus', 'c2', .7, 54], ['bus', 'c3', .15, 56], ['bus', 'c3', .65, 56]
];

/* ---------- service guarantee ---------- */
export const DISTRICTS = {
  central: { name: 'Central', max: 5, now: 3.1 },
  neighbourhood: { name: 'Neighbourhoods', max: 10, now: 4.6 },
  outlying: { name: 'Outlying', max: 15, now: 7.9 },
  night: { name: 'Overnight', max: 20, now: 9.4 }
};

export const PROMISES = ['Surge pricing', 'Tips', 'Ads', 'Premium tiers', 'Paid queue-jumping'];

/* ---------- facts (real figures, rounded, with sources) ---------- */
export const FACTS_REAL = [
  ['≈ $12,000', 'a year to own and run a new car in the U.S., about $1,000 a month.', 'AAA, Your Driving Costs (2023)'],
  ['≈ $13,000', 'saved per year by a household that takes public transit instead of owning a car.', 'APTA, public transportation savings estimates'],
  ['≈ 95%', 'of the time a typical private car sits parked.', 'Shoup, The High Cost of Free Parking; RAC Foundation'],
  ['~10×', 'safer per mile: public transit travel compared with travelling by car.', 'APTA, citing National Safety Council data'],
  ['≈ 40,000', 'people die on U.S. roads each year.', 'NHTSA, FARS annual reports'],
  ['≈ 28%', 'of U.S. greenhouse gas emissions come from transportation, the largest source.', 'U.S. EPA, GHG inventory'],
  ['$1 → ~$5', 'in economic return for every dollar invested in public transportation.', 'APTA / Economic Development Research Group']
];
export const FACTS_PROJ = [
  ['up to 90%', 'fewer cars needed in a city served by shared self-driving fleets plus high-capacity transit.', 'ITF/OECD, Shared Mobility Simulations for Lisbon (2015). Modelled scenario'],
  ['up to 95%', 'of on-street parking space could be freed for other uses.', 'ITF/OECD, Lisbon study. Modelled scenario'],
  ['1 in 4', 'U.S. adults live with a disability. On-demand ramp vehicles widen independent travel.', 'CDC, Disability and Health data'],
  ['≈ 94%', 'of crashes involve a driver-related critical factor in NHTSA’s survey. Automation may address many of them.', 'NHTSA (2015). Frequently debated; treat as directional']
];

export const OPEN_QUESTIONS = [
  ['work', 'Workforce transition', 'Bus, taxi and rideshare drivers need a planned path: retraining, pay protection and public jobs in fleet operations, remote assistance and accessibility.'],
  ['shield', 'Privacy', 'Trip data kept to the minimum, deleted on a published schedule, never sold, and released only under legal process.'],
  ['check', 'Safety evidence', 'Independent, public reporting of incidents and disengagements before and during each service expansion.'],
  ['bolt', 'Funding', 'Capital, energy and upkeep costs, and how fares, subsidy and benefits share them, published line by line.']
];

export const TICKS = [
  'Emergency unit E-12 responding on Civic Ave. Nearby vehicles are yielding.',
  'C2 corridor running every 4 minutes. Shuttles covering the Elm Park detour.',
  'A resident’s car joined the network in Eastgate.',
  'Harbor Yards depot: 31 vehicles charging.',
  'Demand rising near Civic Hub. 12 Solo Pods repositioning.',
  'A ramp vehicle was reassigned for an accessibility need, adding 2 minutes to a pickup.'
];
