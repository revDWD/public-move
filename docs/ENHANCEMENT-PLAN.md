# Public / Move: enhancement plan

Written before the November 2026 launch pass. It records the audit, the decisions taken with the owner, and the order of work.

## Decisions (agreed with the owner)

| Question | Decision |
|---|---|
| Framing | Present-day pilot, neutral tone. "2040" and advocacy language removed; benefits stated as practical outcomes. The service promises (no surge, tips, ads, premium tier or paid queue-jumping) stay. |
| Fleet | Five vehicle types (Solo Pod, Shared Ride, Neighborhood Shuttle, Community Bus, Emergency Unit) plus the resident-contributed car. |
| Stack | Stay zero-build: plain HTML/CSS/ES modules, no runtime dependencies, deploys as static files. |
| Hosting | `move.abbydavid.com` on GitHub Pages (custom subdomain, same pattern as `atfitnesstracker.abbydavid.com`). |

## 1. Audit of the starting point

**What was there:** `index.html` + one 657-line `app.js` + one 319-line `styles.css`. Zero dependencies. A procedurally drawn SVG city with ambient vehicles, a five-step trip state machine, an open fare receipt with an $18 monthly cap, accessibility settings persisted to `localStorage`, and City / Serve / Guarantee / Impact tabs.

**Strengths to keep**
- Zero-build static architecture: cheap to host, nothing to break.
- Deterministic map, rAF simulation, camera that frames the relevant area.
- Accessibility is genuinely good: `inert` intro, focus management, live regions, spoken updates, reduce motion, larger text.
- Sourced real-world statistics, clearly separated from projections.

**Problems**
| Area | Finding |
|---|---|
| Visual | Dark UI over a light beige map (and a light `theme-color`), inconsistent tokens, inline styles throughout templates, system font only. Reads as a prototype. |
| Landing | A full-screen dialog over the app, not a product page. No fleet imagery, no "how it works", no clear call to action beyond "Start the journey". |
| Booking | Three fixed destinations, no destination search, no pickup choice, routes hard-coded as SVG strings that must match the map by hand. |
| Map | Good bones, but no layer controls, no demand zones, no depots, transit lines are unlabelled "trams" unrelated to the fleet. |
| Fleet | Three ride options; no capacity, service area or accessibility comparison. |
| Code | Everything in one dense file; long one-line statements; constants (cap, cost split, unit counts) duplicated across views; ~60 inline `style=` attributes. |
| Deploy | No `CNAME`, no `404.html`, no Open Graph / favicon, docs point to the old `dwdyck` account. |

## 2. Quick wins
- Reconcile theme: one light, civic palette for UI and map; fix `theme-color`.
- Self-hosted Inter (OFL) for a clear type hierarchy; no third-party font CDN.
- Named constants for the fare cap, subsidy and cost split (one source of truth).
- Favicon, Open Graph image and meta tags; `404.html`; `CNAME`.
- Remove inline styles in favour of utility and component classes.

## 3. High-impact improvements
1. **Landing page** (`/`): hero with the "what if rideshare were public infrastructure?" pitch, fleet illustrations, how it works, benefits with sources, the service promise, a section for cities and agencies, and a call to action into the demo.
2. **Ride app** (`/app/`): destination search, pickup selection, routes computed on the street grid, vehicle comparison with capacity, wait, fare and subsidy, a matching state, vehicle card with unlock code, live trip with events, arrival summary and rating, top-of-screen trip notifications.
3. **Live map**: layer controls (fleet by type, bus corridors, stations and hubs, demand zones, charging depots), live counters, recenter.
4. **Fleet tab**: comparison cards for each vehicle type with capacity, availability, service area, accessibility and wait times; the resident-car programme lives here.
5. **Impact tab**: costs, coverage and guarantee, sourced facts, open questions a pilot must answer.

## 4. Technical risks
| Risk | Mitigation |
|---|---|
| ES modules don't run from `file://` | Documented: run a local server (`python3 -m http.server`). Pages serves over HTTPS, so production is unaffected. |
| Paths break between `revdwd.github.io/public-move/` and the subdomain root | All asset and page links are **relative**. Works under either base path. |
| Camera math is coupled to CSS layout | Sheet width and insets are read from one place (`camera.js`) and mirrored by CSS custom properties. |
| rAF loop cost | No allocations or re-renders inside `frame()`; only transforms and a few `textContent` updates. |
| Accessibility regressions in a redesign | Kept every existing feature; tested keyboard flow, focus moves, `aria-*` states, reduced motion. |
| Credibility | Real statistics kept verbatim with sources; demo numbers labelled "simulated". |
| DNS cut-over | Needs one CNAME record at the DNS host; until it exists, Pages keeps serving `revdwd.github.io/public-move/`. See `DEPLOYMENT.md`. |

## 5. Phases
1. Plan and docs (this file, `DEPLOYMENT.md`).
2. Design system: tokens, type, components (`assets/css`).
3. Landing page.
4. Ride app rebuilt as modules (`src/`), with map, booking flow, fleet, impact and accessibility.
5. Deployment config (`CNAME`, `404.html`, meta, sitemap).
6. Browser verification at 360 px and 1280 px, keyboard run-through, console check.

The change log is in [`CHANGES.md`](CHANGES.md).
