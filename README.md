# The Cost of War

An interactive data artwork by **Blueprint × StudioEX** (2026).

In 2025, violence cost humanity **$21.81 trillion** — 10.5% of everything the world produces. This site counts what war takes — in money, in futures, and in lives — and asks one question: *what if we chose differently?*

**Live site:** https://[username].github.io/cost-of-war/ (set after deploy)

## Structure

```
index.html          — page structure (5 chapters + 4-step user journey)
css/style.css       — all styling (dark data-art aesthetic)
js/data.js          — ALL data and sources live here (edit figures here only)
js/main.js          — application logic (canvases, interactions, letter generator)
DATA-SOURCES.md     — audit trail for every figure, with primary-source links
archive-original.html — the original single-file prototype, kept for reference
```

There is no build step. It is a static site — open `index.html` in a browser, or serve the folder with any static server.

## The narrative

1. **Chapter 01 · The Machine** — direct military spending ($2,887B, SIPRI 2025)
2. **Chapter 02 · The Destruction** — reconstruction bills (Ukraine $588B, Gaza $71.4B), legacy costs, climate cost
3. **Chapter 03 · The Displaced** — 117.8M displaced, the humanitarian funding collapse
4. **Chapter 04 · The Human Cost** — lives, children, generations (the non-economic costs)
5. **Chapter 05 · The Choice** — interactive redistribution of the military budget into 14 SDG investment gaps
6. **Steps 01–04** — rank priorities → see your country → write the letter → join the coalition

## For the backend developer

Two integration points, both currently stubbed client-side:

1. **Coalition counter & submissions** (`js/main.js`, `// ═══ COALITION ═══` block).
   Currently localStorage + a fake seed count. To make it real, create a Supabase
   project with a `submissions` table (`ranking int[], country text, email text, ts bigint`),
   enable RLS allowing anonymous INSERT and a count-only SELECT, and set
   `SUPABASE_URL` / `SUPABASE_KEY` (anon key) at the top of the block.
   The fetch call is already written.

2. **Email capture** — posts to `formsubmit.co` (forwards to greg@studioex.co).
   Fine to launch with; replace with your own endpoint or Supabase when ready.

Data updates happen in `js/data.js` only — every figure has its source next to it,
and `DATA-SOURCES.md` documents the verification trail. Annual refresh points:
SIPRI (April), GPI (June), UNHCR Global Trends (June), ICAN (June), OCHA GHO (December).

## Deploying

Hosted on GitHub Pages from the `main` branch (Settings → Pages → Deploy from branch → main, root).
Any push to `main` redeploys automatically within a minute or two.

## Credits

An artwork by Blueprint · Produced by StudioEX · 2026
Contact: hello@studioex.co
