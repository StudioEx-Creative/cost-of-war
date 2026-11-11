# The Cost of War

An interactive data artwork by **Blueprint × StudioEX** (2026).

In 2025, violence cost humanity **$21.81 trillion** — 10.5% of everything the world produces. This site counts what war takes — in money, in futures, and in lives — and asks one question: *what if we chose differently?*

**Live site:** https://studioex-creative.github.io/cost-of-war/
**Repository:** https://github.com/StudioEx-Creative/cost-of-war

## Structure

```
index.html          — the page: the scroll story, then the tools (markers show each tool's region)
css/story.css, css/story/ — the story's styles and the brand tokens
css/tools.css — the tools' styles: shared rules, then one section per tool (H1 to H6)
js/story/           — the story engine and its scenes (see js/story/README.md)
js/data.js          — ALL data and sources live here (edit figures here only)
js/main.js          — the tools' state and logic (ranking, country, tax, letter, coalition, card)
js/tools/           — one view per tool, each reading js/main.js through ToolView
js/room.js          — the Archive
css/style.css       — old styles, kept only for privacy.html
DATA-SOURCES.md     — audit trail for every figure, with primary-source links
archive-original.html — the original single-file prototype, kept for reference
tools/              — the safe preview server and the two test harnesses (story-check, tool-check)
```

There is no build step. It is a static site.

**Looking at it on your own computer: use the safe preview.** `js/config.js` holds the real Supabase
address, and "Submit my priorities" also emails Greg through formsubmit.co. So any plain server
(`python3 -m http.server`, `npx serve`, opening `index.html` from disk) talks to the real database as
soon as the page opens, and one Submit saves a real entry and sends a real email. Instead run
`node tools/preview-server.mjs` and open http://localhost:4174/ (the "cost-of-war" preview in
`.claude/launch.json` does exactly this). It serves `js/config.js` with the backend settings blank, so
the page runs in its local demo mode, and it tells the browser not to contact `*.supabase.co`,
`formsubmit.co` or `challenges.cloudflare.com` at all. To try the real backend on purpose, use a plain
server, and remember that every Submit is real.

Two more files are not safe outside the safe preview. `archive-original.html` (the original prototype)
emails Greg through formsubmit.co from its own code, whatever `js/config.js` says: on a plain server or
opened from disk, its email box sends a real email (whether to remove it or blank that address is an
open decision). `storyboard/tools/baseline.mjs` (the Phase 1 measuring tool) drives Chrome with no
network blocking and opens the live site unless told otherwise; the page it opens asks the real
database for its counts (it never presses Submit). Run it only on purpose.

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
   **The Supabase integration is now fully built** — client (`js/backend.js`),
   schema (`supabase-schema.sql`) and config (`js/config.js`). To go live, create
   a free Supabase project, run the SQL, and paste the URL + anon key into
   `js/config.js`. Full walkthrough in **[BACKEND.md](BACKEND.md)**. Until then it
   runs in localStorage demo mode automatically.

2. **Email capture** — also posts to `formsubmit.co` (forwards to greg@studioex.co)
   as a notification; emails are stored in the Supabase `submissions` table too.

Data updates happen in `js/data.js` only — every figure has its source next to it,
and `DATA-SOURCES.md` documents the verification trail. One exception, until Greg and Daniel decide
(it is in `js/story-debug/flags.js`): the letter's figures are typed into `js/main.js` (`generateLetter`)
and "$2.89T" / "$2.89 trillion" into `index.html`, as on the old page, so check them by hand at each refresh. Annual refresh points:
SIPRI (April), GPI (June), UNHCR Global Trends (June), ICAN (June), OCHA GHO (December).

## Deploying

Hosted on GitHub Pages from the `main` branch (Settings → Pages → Deploy from branch → main, root).
Any push to `main` redeploys automatically within a minute or two.

## Credits

An artwork by Blueprint · Produced by StudioEX · 2026
Contact: hello@studioex.co
