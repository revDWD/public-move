# Public / Move

**Public transit that comes to your door.** A concept for a publicly owned network of on-demand autonomous vehicles: book from your phone like rideshare, run like public transit.

**Live:** https://move.abbydavid.com · **Demo:** https://move.abbydavid.com/app/

## The idea

What if rideshare were public infrastructure? Cities run one fleet, made up of Solo Pods, Shared Rides, Neighborhood Shuttles, Community Buses on busy corridors, Emergency Units and residents’ lent cars, and riders book any of it from one app.

- **Fares at cost, then subsidised.** A 50% public subsidy, $0 for work, healthcare and school trips, and an $18 monthly cap.
- **A published service guarantee.** Maximum pickup times by area, 24/7 essential service, a guaranteed ride home.
- **Accessibility built in.** Ramp vehicles within 8 minutes, step-free routing, quiet cabins, spoken updates.
- **Never:** surge pricing, tips, ads, premium tiers or paid queue-jumping.

## What’s here

| Path | |
|---|---|
| `index.html` | Landing page |
| `app/` | The simulated ride app: booking, live map with layers, fleet, impact |
| `src/` | ES modules shared by both pages (data, pricing, map, simulation, views) |
| `assets/` | Design system CSS, self-hosted Inter font, images |
| `pitch/` | St. Louis pilot one-pager |
| `docs/` | Enhancement plan, change log, deployment guide |

## Run it

No build step and no dependencies. ES modules need a local server:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Notes

Everything in the demo is simulated: there are no real vehicles, accounts, payments or dispatch, and city figures are fictional. Real-world figures (AAA, APTA, NHTSA, EPA, ITF/OECD, CDC) are rounded and credited in the app; check the originals before citing.

Inter is © The Inter Project Authors, under the SIL Open Font License (`assets/fonts/OFL-Inter.txt`).

## License

MIT
