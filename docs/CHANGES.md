# Launch pass: what changed

November 2026. Plan and audit: [`ENHANCEMENT-PLAN.md`](ENHANCEMENT-PLAN.md). Hosting: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## 1. Landing page (`/`): new
| What | Why | User impact |
|---|---|---|
| Product landing page replaces the full-screen intro dialog: hero with the "what if rideshare were public infrastructure?" pitch, an animated phone mockup, sourced evidence band, how it works, fleet, benefits, service guarantee, a section for cities, and a closing call to action. | The old intro read as a prototype. Planners, agencies and the public need the concept explained before they see the demo. | Visitors understand the idea in seconds, then choose the demo or the city map. |
| Present-day, neutral framing. "2040", "not profit" and "public right" language removed; benefits are stated as practical outcomes. | Owner's decision: something that could launch now, without political messaging. | Credible for mixed audiences. The service promises (no surge, tips, ads, premium tiers, queue-jumping) remain. |

## 2. Design system: rebuilt
| What | Why | User impact |
|---|---|---|
| One light civic palette for UI and map (`assets/css/base.css` tokens), self-hosted Inter (OFL, no CDN), a type scale, and shared button, chip and card components. | The dark UI clashed with the light map and `theme-color`; there were ~60 inline styles. | Consistent, polished look; better contrast (all text ≥ WCAG AA). |
| Original side-view vehicle illustrations for every fleet type (`src/illustrations.js`). | The brief asked for vehicle imagery; no third-party art. | Vehicles are recognisable on cards, options and the landing page. |

## 3. Ride app (`/app/`): rebuilt as ES modules
| What | Why | User impact |
|---|---|---|
| **Booking flow:** pickup choice (current location, home, station), destination search with suggestions and keyboard Enter, routes computed on the street grid, ride comparison with seats, ETA, arrival time, fare at cost, subsidy and benefit, a collapsible fare breakdown, and a sticky confirm button showing the price. | Three hard-coded destinations didn't feel like a real platform. | Feels like Uber/Waymo; any of 7 places from 3 pickups. |
| **Trip states:** matching (radar), vehicle card with plate and unlock code, approach progress, "I'm seated", live trip with street name and events, emergency yield, arrival summary, rating and reserved return trip. | The brief called for vehicle assignment, ETA, active trip and arrival notifications. | Every stage of a real trip is shown. |
| **Notifications:** phone-style banners for vehicle assigned, arriving in 1 minute, arrived at pickup, yielding to an emergency, and arrival. Also read out through the live region and spoken updates. | Arrival notifications were requested; they also help screen-reader users. | Clear moments in the trip, accessibly announced. |
| **Fare model:** at-cost fare → 50% public subsidy → benefit (work, healthcare, education = $0) → $18 monthly cap. One function (`quote()` in `src/trip.js`) feeds every receipt. | "Free or heavily subsidised" from the brief; the old code repeated constants. | Riders see exactly what they pay and why. |

## 4. Map: the centrepiece
| What | Why | User impact |
|---|---|---|
| Buildings, parks, river; **layer controls** for vehicles, bus corridors (C1–C3, with stops), hubs and stations, demand zones (animated heat), charging depots; vehicle-type filters; recenter. | Requested: route overlays, hubs, demand zones, fleet distribution, layers, infrastructure. | The Live map tab shows how the whole system operates. |
| Distinct top-down marks for all six vehicle types; corridor buses run the bus lines. | Fleet distribution must be readable at a glance. | Users can tell pods, shared rides, shuttles, buses, resident cars and emergency units apart. |
| Camera reads panel width from CSS (`--panel-w`) instead of a hard-coded number. | Removes a layout-coupling bug noted in AGENTS.md. | The map stays clear of the panel at every width. |

## 5. Fleet
Six types (Solo Pod, Shared Ride, Neighborhood Shuttle, Community Bus, Resident Car, Emergency Unit). Each card shows capacity, live availability, typical wait, service area and accessibility features. The resident-car lending programme moved under Fleet.

## 6. Impact
The rider's month (cap meter, chart with cap line, subsidy and benefits), the service guarantee (by district), the cost split, sourced evidence, labelled projections, and "what a pilot has to prove" (workforce, privacy, safety evidence, funding).

## 7. Code quality
- `app.js` (657 dense lines) split into `src/` modules: `data`, `state`, `trip`, `map`, `camera`, `sim`, `render`, `ui`, `icons`, `illustrations`, and `views/*`.
- Named constants (`FARE_CAP`, `SUBSIDY`, `COST_SPLIT`, `EMERGENCY_UNITS`) instead of repeated literals.
- An `ACTIONS` map replaces the long switch; still one delegated click listener.
- `esc()` for the only user-typed text (search); `localStorage` only reads known boolean keys.
- JSDoc on the non-obvious functions. Still no build, no runtime dependencies.

## 8. Accessibility (kept and extended)
Kept: focus moves to the screen heading, live-region announcements, spoken updates, wheelchair / reduced walking / step-free / quiet / larger text / reduce motion, all persisted. Added: radio semantics on pickup and ride lists, `aria-valuenow` on progress bars, `aria-current` on tabs, Escape closes settings and the pickup list, labelled search field, touch targets ≥ 44 px, `prefers-reduced-motion` honoured globally, and ramp-less vehicles disabled with an explanation when wheelchair access is on.

## 9. Deployment
`CNAME` (`move.abbydavid.com`), `.nojekyll`, `404.html`, `robots.txt`, `sitemap.xml`, favicon, Apple touch icon, Open Graph image and meta tags, canonical URLs, relative paths throughout. See `DEPLOYMENT.md`.

## Verified
Headless Chrome at 360, 390 and 1280 px wide: full trip on every screen, no console errors, no horizontal overflow, wheelchair flow, settings persisting across reload, corrupt storage, keyboard search and Enter, cancel mid-trip, deep links, the 404 page, reduced motion, and loading under a `/public-move/` sub-path.

Not tested: real iOS Safari and Android devices, or a screen reader (VoiceOver or TalkBack) by hand.
