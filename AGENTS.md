# AGENTS.md: Public / Move

Guidance for AI coding agents. Read this first.

## 1. Project overview

**What it is:** a static concept site for a publicly owned, on-demand autonomous transit network ("what if rideshare were public infrastructure?"). It has two parts: a landing page (`/`) and a fully simulated ride app (`/app/`).

**Audience:** city planners, transit agencies, investors and the general public. It must look like a credible, launch-ready product.

**Framing (owner's decision, Nov 2026):** present-day pilot, neutral tone. Avoid political or advocacy language; state benefits as practical outcomes. Keep the honest "what a pilot has to prove" section.

**Non-goals**
- No real vehicles, accounts, payments, dispatch, maps, location or user data.
- No backend, auth, analytics, tracking, ads or third-party scripts, fonts or CDNs.
- Never add features that contradict the service promises: no surge pricing, tips, ads, premium tiers or paid queue-jumping.

## 2. Architecture

Zero-build static site with ES modules. GitHub Pages serves `main` from `/` at **move.abbydavid.com** (see `docs/DEPLOYMENT.md`).

| Path | Purpose |
|---|---|
| `index.html` + `src/landing.js` + `assets/css/landing.css` | Landing page. Fleet cards and open questions render from `src/data.js`. |
| `app/index.html` + `src/main.js` + `assets/css/app.css` | Ride app shell and entry point. |
| `assets/css/base.css` | Design tokens (colours, type scale, radii, shadows, motion) and shared components (`.btn`, `.chip`, `.card`). Used by both pages. |
| `src/data.js` | **Single source of truth:** pricing constants, street grid, pickups, places, fleet, corridors, hubs, depots, demand zones, districts, sourced facts. |
| `src/state.js` | One mutable `S` object; accessibility prefs persisted to `localStorage` key `pm-access` (known boolean keys only). |
| `src/trip.js` | `routeBetween()` (street-grid routing), `currentTrip()`, `quote()`, the **only** fare calculation. |
| `src/map.js` | Builds the SVG city, layers (`#lyr-*`), ambient vehicles, pins and route paths. |
| `src/camera.js` | Animates the SVG `viewBox` to frame the trip clear of the sheet or panel. Reads `--panel-w` and `--panel-gap` from CSS. |
| `src/sim.js` | `requestAnimationFrame` loop: ambient fleet, trip phases, notifications, emergency yield, live counters. |
| `src/render.js` | Renders the active screen into `#sheet`, tabs, map sync, hash routing. |
| `src/ui.js` | `toast()`, `notify()` (top banner), `announce()` (live region + optional speech). |
| `src/views/*.js` | `ride` (home/search/options/approach/ride/arrived), `live`, `fleet` (+ `viewServe`), `impact`, `access`. Pure functions returning HTML strings. |
| `src/icons.js`, `src/illustrations.js` | Line icons; original side-view vehicle art. |
| `pitch/` | Standalone St. Louis one-pager. Not loaded by the app; its figures are separate projections. |

**Data flow:** click → `data-act` → handler in `ACTIONS` (`main.js`) mutates `S` → `render()` (or `keepScroll()` for in-place toggles) → views read `S` and `quote()`. The rAF loop only moves SVG transforms and updates `#eta`, `#bar`, `#street` and `#events` directly.

**State machines:** `S.step`: `home → search → options → approach → ride → arrived`. `S.sim.phase`: `idle → matching → approach → wait → ride → done`. `S.screen`: `ride | live | fleet | serve | impact | access` (mirrored in the URL hash).

## 3. Conventions

- **Actions:** add behaviour with `data-act="name"` (+ `data-id`) and an entry in `ACTIONS`. No per-element listeners (search `input`/`keydown` and receipt `toggle` are the delegated exceptions on `#sheet`).
- **Styling:** use tokens from `base.css`. No inline colours in templates except data-driven tints (`FLEET[k].color`). Class names are short and kebab-case; state goes in `aria-*` or `data-*` attributes.
- **Paths:** keep every link and asset **relative** (the site must also work under `/public-move/`). Only `404.html` uses root paths.
- **Escaping:** anything a user types goes through `esc()` before reaching HTML.
- **Naming:** camelCase functions, `viewX()` for views, SCREAMING_CASE for constant tables.
- **No `console.log`** in committed code; user feedback goes through `toast()`, `notify()` and `announce()`.

## 4. Special caution

- `quote()` is the only fare logic. Receipts, option prices, the arrival summary and the month totals all read it.
- `routeBetween()` assumes points sit on the street grid (`GRID_X`/`GRID_Y`). New places must use grid intersections.
- Camera insets depend on CSS layout. Change `--panel-w` in CSS, not in JS.
- `frame()` runs every animation frame. Don't re-render there or allocate heavily.
- `FACTS_REAL` and `FACTS_PROJ` are public factual claims with sources. Don't change numbers without checking the original.

## 5. Accessibility is a product promise

Focus moves to `#h` on every screen change; announce trip changes; touch targets ≥ 44 px; WCAG AA contrast; honour `.calm` and `prefers-reduced-motion`; never use colour alone; wheelchair mode disables vehicles without a ramp and says why.

## 6. Constraints

- No frameworks, bundlers, TypeScript or preprocessors without explicit approval. JSDoc is fine.
- No new dependencies. Inter is self-hosted under the OFL.
- Prefer surgical edits; keep the module boundaries above.

## 7. Testing

No automated suite in the repo. Minimum:
- `for f in src/*.js src/views/*.js; do node --check "$f"; done`
- Serve (`python3 -m http.server`) and check `/` and `/app/` at ~360 px and ~1280 px: no console errors, no horizontal overflow.
- Full trip (search → options → confirm → wait → "I'm seated" → arrival); a trip long enough to trigger the emergency yield (e.g. to Meridian Works); cancel mid-trip.
- Live map layers and filters; Fleet, Impact (district switcher), Accessibility (every toggle; wheelchair disables Shared Ride and Resident Car; settings persist across reload).
- Keyboard-only run; Enter in search picks the first result; Escape closes settings.

## 8. Workflow

Work on a branch and open a PR. Pushing to `main` publishes to the public site. List the files you touched and any risks in the PR. Include the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>` when an AI agent authored the commit.

## 9. Known gaps / ideas

- Real-device testing (iOS Safari, Android) and screen-reader passes.
- A small Playwright smoke test plus a CI syntax check.
- Localisation; a dark theme.
- A dedicated Sources page with access dates.
