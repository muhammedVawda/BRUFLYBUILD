# BruFly

A new build of the BruFly travel platform: domestic flight requests (FlySafair and LIFT), BruFly Stays accommodation search and booking, BruPass membership with a value calculator, host enquiries, booking status and support.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm test             # unit tests (pricing, dates, search, calculator, booking store)
PW_CHROMIUM=/path/to/chromium npm run test:e2e   # Playwright journeys (desktop + mobile)
```

## What is real and what is placeholder

| Area | Status |
| --- | --- |
| Search, filtering, sorting, URL state, back/forward | Working, seed inventory |
| Pricing (nightly, weekend uplift, extra guests, child ages, cleaning fee) | Working, server-side, unit tested |
| Booking requests (stays and flights) | Working request flow; **in-memory store**, no email, no payment provider |
| Flight fares | **Sample fares** labelled as such; no airline/GDS integration |
| BruPass prices, benefits, terms | **Placeholders** in `src/config/business.ts`, must be verified |
| Company contact details, legal name | **Placeholders** in `src/config/business.ts` |
| Logo and brand colours | **Placeholder** wordmark (`src/components/Logo.tsx`) and tokens (`src/app/globals.css`) |
| Photography | None. Listings show labelled illustrations until real photos are dropped into `public/images/stays/<slug>/` and listed in `photos` |
| Map | Self-drawn SVG map of South Africa with real coordinates; no tile provider |
| Analytics | `track()` pushes to `window.dataLayer` only after consent; set `analytics.gtmId` and add the GTM snippet |

## Where things live

- `src/config/business.ts` — every commercial value (fees, windows, BruPass plans, contact details).
- `src/lib/data/` — destinations, properties, airports and routes (seed inventory).
- `src/lib/pricing.ts` — stay quotes; `src/lib/search.ts` — search engine; `src/lib/brupass-calc.ts` — calculator.
- `src/lib/bookings-store.ts` — in-memory booking store with idempotency and status transitions. Replace with a database.
- `src/app/api/` — quote, search, bookings, flights, BruPass, host enquiry routes.
- `tests/unit`, `tests/e2e` — Vitest and Playwright.

## Booking states

`request_received → awaiting_confirmation → confirmed | declined`, plus `cancelled`. Nothing on the site shows "Confirmed" unless the server record is confirmed. No payment is captured anywhere in this build.
