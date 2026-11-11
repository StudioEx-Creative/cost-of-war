# Story engine · scene author's guide

The scroll story of *The Cost of War* (rebuild, the full story S00–S13). Page:
`index.html`, where the tools follow it from `#haveyoursay`. Spec: the phase 3 spec (the phase 2 spec still holds).
Look: the storyboards in `storyboard/`. Start with **How to build a scene in phase 3** below.

**One rule above all: scroll position alone sets the story.** The engine turns the scroll
position into `s` (screens from the top of `#story`), finds the active scene, gives it
`p` (0 to 1) and asks it for a state. Your `state(p, vp)` is a pure function. Scrolling
back, reloading or deep-linking gives back exactly the same frame.

## Files

| File | What it is |
| --- | --- |
| `js/story/engine.js` | Everything engine, in three sections: the engine (with the shared helpers), the camera maths (`Story.cam`, true area, `Story.ladder`), the chrome and atmosphere. One file, one download. |
| `js/story/scenes.js` | All fourteen scenes, S00 … S13, one section each in story order. Each section is its own closure and starts with its header line (`/* S03 The Slice · CUT …`). Its last lines start the story (what `boot.js` used to do). |
| `css/story/scenes.css` | Every scene's styles, one section each in story order, each starting with its header line (`/* S03 · …`). |
| `css/story.css` | Tokens, type roles, stage layers, chrome, plates, no-motion mode, `.sb-box`, the "Read as text" link. |
| `js/map/land-110m.js` | S07's land outline (data, read only): `window.LAND_110M`, see the phase 3 spec. |
| `js/story-assets/s05-drawings.js` | S05's drawings (geometry, their styles, the labels printed on them): `window.S05_ART`. An asset, not story code. |
| `js/story-debug/selftest.js` | Debug only, loaded on demand by `Story.debug.selfTest()`. Never loaded by readers. |
| `js/story-debug/flags.js` | The review notes: every open decision and data, copy and design question, one line each with its scene. Never loaded by readers; the harness loads it so its report lists them (see **Figures and copy**). |

**Why one file for the scenes.** In phases 2 and 3 each scene had its own pair of files
(`js/story/scenes/s03.js` + `css/story/s03.css`) so that builders could work in parallel. Each
file is compressed on its own when it is served, and fourteen small files compress far worse
than one. With every scene built, the story measured 78 KB against the brief's 60 KB limit. The
integrator joined the scenes into one file (about 10 KB less to download for the same code),
took the comments out of the scene code and moved the review notes into `js/story-debug/flags.js`:
57.7 KB, with nothing cut on screen. It is not a build step: `scenes.js` is the source you edit.
To work on a scene, edit its section; to split them again for parallel work, cut at the header
lines (the harness's size check already measures each section on its own).

Load order in `index.html`, the story first: `js/data.js` (the story reads its figures),
GSAP 3.12.5, ScrollTrigger 3.12.5, `engine.js`, the assets the scenes read when the story starts
(`js/story-assets/s05-drawings.js`, `js/map/land-110m.js`), then `scenes.js`, which starts the story
at its end. The tools' scripts follow with `defer` (supabase-js, `config.js`, `backend.js`,
`main.js`, the six views, `room.js`, in that order): they are fetched at low priority and run once
the page has been read, so the story never waits for them. Scene order on
screen comes from each scene's `order`, not from its place in the file.

## Size budget (read this first)

All story code (`js/story/**/*.js`, `css/story.css`, `css/story/**/*.css`) is measured as
the sum of each file gzipped (1 KB = 1024 bytes, zlib default level, as the harness counts).
The brief's hard limit for the full story is **60 KB**. Comments count. Data and drawings
(`js/map/**`, `js/story-assets/**`) are assets, reported apart.

Each scene has a share (script + style), listed by `node tools/story-check.mjs --only size`
(noted, not failed): engine + base 16.5, S00 4.1, S01 3.8, S02 4.0, S03 2.6, S04 2.8,
S05 3.4, S06 2.6, S07 3.6, S08 2.4, S09 3.5, S10 2.8, S11 2.2, S12 3.7, S13 1.5 KB. The size
check gzips each section of `scenes.js` and `scenes.css` on its own to compare it with its
share: an estimate, because the sections compress better together than this sum says.

Where it stands in phase 4, after the fifth round of fixes (gzipped): `engine.js` 15.0 KB, `css/story.css` 2.3 KB,
`scenes.js` 39.7 KB, `scenes.css` 2.7 KB: **59.71 KB of 60**, 301 bytes to spare (59.51 KB before the fixes).
The first round added 47 bytes: the corrected 'busy' test, the call to `window.__keepPlace()` after a resize (the
place-keeping itself is in `js/main.js`, the tools' code) and the story's focus ring at 4 px, as the tools'. The fifth
round added 155 bytes to `engine.js`: ScrollTrigger's endless empty frame loop rests while the story is off screen
or in still mode (see **The page and the tools**, "Loops at rest"). The tools' code
(`js/tools/*.js`, `css/tools.css`, and the Archive's `js/room.js`) is counted apart from the 60 KB (see **The page and the tools**). The accounting: `js/story-assets/s05-drawings.js`
counts as an asset whole, although about 2.4 KB of its 6.5 KB (gzipped) is S05's layout numbers, styles and label list rather
than geometry. That needs a ruling from Greg or Daniel (it is in the review notes). The nine new
scenes came in at about twice their shares; joining the files (above), taking the comments out
of the scene code and moving the review notes into `js/story-debug/flags.js` made the room,
without cutting anything on screen. Keep comments to short "why" lines: this README is the
commentary, and the scene code now carries none beyond its header lines (the builders' phase 3
reports, the review notes and the Transitions table below carry the reasoning).

## The page and the tools (phase 4)

`index.html` is the page: the story in `<main id="story">`, then the tools from `#haveyoursay` on.
`prototype.html` is gone, and the old story markup, `css/style.css`, `css/dossier.css` and
`js/dossier.js` have left the page (`css/style.css` stays in the repo only for `privacy.html`).
Both harnesses test `index.html`.

**Who owns what.** `js/main.js` owns every tool's state and logic: the ranking, the gate, the
country figures, the tax model, the letter, the share text, the card and the submission. Each
tool's look lives in its own view file, `js/tools/h1.js` … `h6.js`, which only draws what
main.js says. In `index.html` each tool sits between comment markers (`H1 REDISTRIBUTE · START`
… `END`). The Archive's data, reading rules and preview stay in `js/room.js`.

**The hooks.** main.js calls `ToolView.update(name, state)` after every change; a view calls
`ToolView.on(name, fn)` and gets the latest state at once and after each change. A view that
throws is logged and never stops the tool. The states, with every field, are listed under
"TOOL VIEWS" at the top of `js/main.js`: `redistribute`, `country`, `tax`, `letter`,
`coalition`, `globe`, `card`, `share`, and `archive` (sent by `js/room.js`, with
`openLetter(i)` and `letterMeta(i)`). A view may add classes, styles and drawn elements; it
never changes a figure, a word, a payload or the order of a choice.

**Choices, not scroll.** Nothing in the tools reads the scroll position (brief §9): no `.rv`
reveal, nothing that waits to be scrolled to. Only the globe and the Archive load and pause by
visibility (audit SCR-1); their words and controls do not depend on it. The tracker is CSS
`position: sticky` inside Redistribute, so it never sits over the other tools.

**Styles.** `css/tools.css` holds only rules the tools use, on the tokens in `css/story.css`:
shared rules first, then one section per tool, each starting with its header line
(`/* H3 · LETTER …`). It was seven files while six builders worked at once; one file is
16.8 KB to download instead of 21.5 KB (gzip). To work on a tool, edit its section.

**Sizes** (gzip, measured after the fifth round of fixes, apart from the 60 KB story budget): the six
view files 15.0 KB together (14.7 KB before the fixes; target 12 KB: an open decision in the review notes),
`css/tools.css` 17.7 KB (16.8 KB before the fixes, 17.6 KB after the second round), `js/main.js` 19.6 KB (17.9 KB
after the second round, 19.1 KB after the fourth; 20.4 KB on the old page; it keeps the reader's place and caret on
a resize, holds back globe.gl's spare loops and, since round 5, the four clocks of its globe layer, gives up on a
globe.gl that never arrives and lands deep links into the tools), `js/room.js` 10.4 KB (was 6.4 KB on the old page;
the Archive's keyboard path, the reader's own sheet, the no-3D layout, and since round 4 its private three.js, its
time limit and its 3D test). Story code after round 5: 59.71 KB of 60.

**Download size, old page and new** (measured in round 5: every file the page asks for when it opens, in
Chrome at 1440 × 900, each gzipped as the size check counts; then the page scrolled to the end). On opening,
the page's own files: **133.9 KB on the old page (e17c27c), 197.8 KB now**, the logo (37.8 KB) counted once in
both. Now: the story's code 59.7 KB, its assets 11.3 KB (the S05 drawings and the map), the tools' views and
styles 32.7 KB, main.js 19.6 KB, room.js 10.4 KB, data.js 15.0 KB, backend.js and config.js 2.7 KB, the page
itself 8.5 KB. Before: style.css and dossier.css 26.2 KB, dossier.js 10.2 KB, main.js 20.4 KB, room.js 6.4 KB,
data.js 15.0 KB, backend.js and config.js 2.7 KB, the page 15.2 KB. From the CDN on opening, the same in both: GSAP and ScrollTrigger 44.7 KB, and supabase-js (its
unpinned address is not cached here, so not measured). Later, only when the reader comes near them, the same
in both: globe.gl 513.1 KB and three.js 163.2 KB. Fonts were not measured: the test browser fetches no fonts.
(Measured by a one-off probe, not kept in the repo.)

**Loops at rest** (round 5, measured with the reader still for 3 s, desktop and phone, the real libraries).
Below the story the page asked for 64 frames a second at all times. GSAP's own clock was not the cause (it
already sleeps when nothing moves): ScrollTrigger keeps an empty frame loop running for ever (its
`_rafBugFix`, 60 a second) and checks the scroll position four times a second. The engine now lets that loop
rest while the story is off screen or in still mode and restarts it when the story comes back
(`window.requestAnimationFrame` is wrapped once in `engine.js`, next to `request()`; it drops only that one
function, by name). Below the story the page now asks for 4 frames a second. With the coalition globe turning
on screen it asked for 304 and now 64: globe.gl's globe layer (three-globe) ran four clocks of its own for
layer transitions, arc dashes, path dashes and rings, none of which this globe uses (every transition is 0),
so `globeQuiet()` in main.js keeps them paused and only globe.gl's drawing loop runs. Still running by
design: the story's live counter while the story is on screen (60), the globe's drawing loop while it is on
screen and turning (60), the Archive's while it is on screen (60), and ScrollTrigger's quarter-second check (4).

**Removed from js/main.js** (phase 4; 878 lines removed, 521 added, against e17c27c). What each served on
the old page; the story now tells the same figures from js/data.js, or the tools' views draw them:
- The old story's charts: `buildDonut` with `buildSpendDonut` and `buildViolencePie` (the spend and
  violence donuts; the spend split is S03's treemap, the violence breakdown is an open decision), `buildConflictBars`
  (reconstruction bars, now S07), `buildDualSpenders` (the top ten budgets, now S04), `buildEmittersChart`,
  `buildEmissions` and `buildEnvFacts` (emissions bars and cards, now S08; two facts are an open decision),
  `drawDotField` and `buildDotLegend` (the displacement dot field, now S10), `miniPieSVG`, `buildHiPies` and
  `buildHumanStrip` (the human-impact pies and strip, now S12's plain list), `drawLives` (the lives field and
  its flood, now S12's one point of light and the field at rest).
- The old story's motion: `initReveal` (the `.rv` scroll reveal: nothing in the tools waits to be scrolled
  to now), `initScrollProgress` (the top progress bar), `rsz` (sized the empty `#bg` canvas), `cntTo` and
  `animHeroCoalition` (the hero's count-ups; the brief keeps at most one money count-up), `tickLiveSpend`
  (the hero's live spend; the engine's live counters replace it and pause off screen).
- The Redistribute flow canvas: `rszFlow`, `getNodes`, `spawnP`, `drawFlow` (its loop ran all the time;
  H1's sheet in `js/tools/h1.js` replaces it).
- `burst` (the floating '#2' and 'removed' labels in neon green and red over a chosen cause; off-brand, and
  the rank number now sits on the cause itself), `volColor` (the globe bars' teal-to-red ramp; the bars are one
  brand blue, flagged), `goToCountry` (never called on the old page).

**The two 3D libraries.** The globe (globe.gl, in main.js) and the Archive (three.js r160, in room.js) load
only when the reader comes near them. The Archive keeps its three.js to itself: the file puts itself on
`window.THREE`, and globe.gl takes any `window.THREE` it finds over its own built-in copy, so with the older
copy the globe lost its 3D whenever the Archive was opened first ('s3.Timer is not a constructor').
room.js now takes the copy and puts `window.THREE` back as it was the moment the file has run. Each loader
has a 15 s limit: a download that never ends gets the still globe or the no-3D Archive (no waiting words, no
drag hints), and a file that arrives after that changes nothing. A browser without 3D downloads neither
library (room.js makes the same test as main.js). A reader who Tabs onto the room before it has started, in
a browser where it then cannot be built, is moved to its message (which says why) before the room stops
being a Tab stop, so focus is never dropped; the next Tab goes on to the letters.

**Structure for screen readers.** The tools sit in one region, `<section class="tools" aria-label="Have
your say">`, from `#haveyoursay` to the end of the Archive. Each tool's title is a heading (h2; Redistribute's
own title is h3 under "What if we chose differently?") with its old class, so it looks the same; a
zero-weight rule in `css/tools.css` removes the browser's heading margins. Symbols that only decorate
(▾ ▸ ▲ ▼ ↺ ↗ ✉ ↓) sit in `<span aria-hidden="true">`, so a screen reader reads the words beside them; in a
link or summary laid out as flex, the words and the symbol share one wrapping span so the space between them
stays. Symbols that carry meaning stay readable: → in "Continue → …", ✓ and ⚠ in messages, ↑ ↓ in the reorder hint.

**The letter's Send bar.** Below 1024 px wide Send stays at the foot of the screen while the reader is on the
letter (the whole action bar on screens 760 px tall or more, Send alone below that), steps aside while they
type in the letter, and stays in place under the letter on screens under 420 px tall (a phone on its side,
300 to 400% zoom), where it would cover a quarter of the screen. On short screens Send alone is drawn over
what follows it, so anything placed after Send must leave 20 px for its own focus ring.

**Testing.** `node tools/tool-check.mjs --out tools/out/<you>` (see its header): the old page's
recorded behaviour, keyboard and pointer journeys, consent, overlays, the globe and the
Archive with and without 3D, deep links, brand and widths. The keyboard journey fails any focus
ring that is partly under a bar that stays on screen (the letter's Send, the tracker), and runs
once more at 320 × 180, a 1280 × 720 laptop at 400% zoom. `together` loads the 3D globe and the 3D room on
one page in both orders; `no3d` runs a browser with 3D switched off, an empty three.js and two stalled
downloads; `page` also turns a phone and a tablet while the reader types at the end of the letter (the caret's
line must stay on screen) and hit-tests each line of the letter's contact link (44 px or more). Since round 5:
`keyboard` and `pointer` each run once more with reduced motion and once in still mode (`?static=1`); `globe`
counts the frames asked for while the 3D globe turns (one loop, about 60 a second); `page` follows a link into
the tools, moves 3,000 px with the wheel and reloads, then does the same on the page opened without the link,
and wants both to end in the same place, never back at the link's target; and the waits for the card
after Submit allow 20 s, because on this machine under memory pressure a page timer once took longer than the
6 s it had (round 4's lone "the card did not open"; the next step found focus inside the card). It fakes every
outside address, so nothing reaches Supabase, formsubmit or Cloudflare.

**Looking by hand.** Never serve the folder with a plain server: `js/config.js` holds the real
Supabase address, so the page reads the real database as soon as it opens, and Submit saves a real
entry and emails Greg. Use `node tools/preview-server.mjs` (http://localhost:4174/, also the
"cost-of-war" preview): it blanks the backend settings in `js/config.js` (local demo mode), sends no other
setting but SHOW_SEEDED and SEED_COUNT, serves nothing that a link leads outside the folder, and tells
the browser not to contact Supabase, formsubmit or Cloudflare's check (see its header). Two files are not
safe outside it (the top README says why): `archive-original.html`, which emails Greg through formsubmit
from its own code, and `storyboard/tools/baseline.mjs`, which opens the live site with no network blocking.

## The scene definition

```js
Story.scene({
  id: "S01", order: 1, name: "The Line", move: "PUSH", screens: 1.0,
  restrained: false,     // S09–S12: true → no chrome, no brackets, no grain or pool; fades only
  chrome: true,          // dossier overlay; { labels: false }: no FILE label (S00); { labels: "desktop" }: none on phones (S05)
  file: "01",            // chrome label "FILE 01 · THE LINE"
  anchors: ["machine"],  // extra deep-link ids at the scene start (#s01 is always made)
  anchorP: { impact: .08 }, // optional: an anchor that lands inside the scene, at this p (S07)
  frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }], // every storyboard frame (the harness fails a missing one)
  alt: "Short text alternative for the visual.", // new words: flagged for approval (Story.newCopy)
  plateP: 1,             // p drawn as the still canvas in no-motion mode (default 1)
  focusP: 1,             // p the story scrolls to when focus enters the plate (default 1, the scene end)
  plateVisual: true,     // false: no plate canvas; the plate gets `alt` as a visually hidden sentence
  reveal: false,         // first scene only: one ≤ 700 ms opacity reveal on a fresh load at the top
  build(api) {},         // once: create DOM in api.layer, SVG in api.svg, reading-order copy in api.plate
  layout(api) {},        // on start, on fonts loaded, when the stage resizes: sizes and positions (style writes OK here)
  state(p, vp) {},       // PURE: returns plain JSON, must include `sheet` (object or null)
  render(st, api) {},    // apply st: transform / opacity / text only, through api.set / api.text
  draw(g, st, api) {},   // optional Canvas 2D marks, drawn after the engine draws st.sheet
});
```

- `build` runs before the viewport is known: `api.vp` is `null` there. Size things in `layout`.
- `state` must not read the DOM, the clock (`Date.now`, `performance.now`) or `Math.random`.
  A seeded generator is fine.
- `render` and `draw` run on every frame the scroll moves. Only the active scene renders.
- The state may also hold `layerOpacity` (fades your DOM layer and SVG group), `pool`
  (a rect the light pool should sit behind instead of the Sheet), `hold` (see Handovers),
  and anything else you need.
- A hard cut is a step at one exact `p`. Use `Story.smooth(e0, e1, p)` for fades. No
  time-based tweens, no `elastic`, `back` or `bounce` easing.

### Stage geometry: `vp`

```
{ W, H, phone, dpr, k, kt, stage: {x, y, w, h}, text: {x, y, w, h} | null, short }
```

- `phone = W < 768`, or a window at most 1024 wide and taller than it is wide (a tablet held upright, see **Short-phone layout**). `H` is the stage height (100svh in px), not `innerHeight`.
- Desktop: `stage` = the full frame, `text = null`, `k = kt = min(W/1440, H/900)`.
- Phone (see **Short-phone layout**): `kt = W/375` is the text scale; `stage` is the visual
  band between the chrome and the text zone, `{16·kt, 56·kt, W − 32·kt, H − 312·kt}`; `text`
  is the text zone at the bottom, `{16·kt, H − 240·kt, 343·kt, 220·kt}`; `k = min(kt, stage.h/500)`
  is the visual's fitted scale. `short` is true when the band shows less than 480 of the
  storyboard's 500 px (an iPhone in Safari, 390 × 664, shows about 326).
- At 375 × 812 all of this is exactly the storyboard: `k = kt = 1`, stage 16, 56, 343 × 500,
  text 16, 572, 343 × 220.
- The engine sets CSS variables on the stage: `--k`, `--kt`, `--kc` (chrome: `max(1, kt)` on
  phones), `--W`, `--H` (px), and the classes `story-phone` and `story-short` on `<html>`.
  Text sized in CSS on a phone uses `--kt` (`calc(var(--kt) * 16px)`), never `--k`.
- Still plates on a phone are drawn for a tall phone (`H` = 812·kt), so `stage` is never cut.

### Short-phone layout

The storyboard's phone frame is 375 × 812. A real phone in its browser is shorter (about
390 × 664 on an iPhone in Safari). The rule: **text keeps its width-scaled size** (`kt = W/375`,
never smaller; the harness fails any visible stage text smaller than its 375 × 812 size × W/375,
± 0.5 px, on phones from 320 × 568 up), and **the visual gives up height**: it lives in the
band between the chrome and the text zone, fitted (`k`) or cropped (at `kt`), as your
storyboard allows. The text zone (storyboard y 572–792) stays at the bottom at full width scale.
Under 560 px tall the still plates take over, as before.

**Tablets held upright** get the phone design. Width-scaled text alone would pack a 3:4 screen far tighter than any phone (an iPad's band would show 188 of the storyboard's 500 px), so from 430 px wide (and on any phone window squatter than about 375 × 620) the stage narrows to a centred column no wider than `H × 375 / 638`, the proportions of an iPhone in Safari (602 of 768 px on an iPad), with black either side (a side margin under 6 px is not worth a column: the stage then stays full width). `vp.W` is then the column, `kt = W / 375` of the column, and scenes need nothing special. The engine sets `--mx` (the side margin) on `<html>` for the two things outside the stage (the "Read as text" link and the focus dock). The harness compares text sizes with `375 × 812 × kt`, the column's scale.

Pick a map for each part of your frame (all from `Story.sb` / `Story.fit`, below):

- **Fit** `Story.sb(vp)`: the whole 343 × 500 window scaled by `k` and centred in the band. Good
  for drawings with little text. Text placed in it through `api.place(el, a, m)` gets `m.r`
  (= `kt/k`) as a font boost, so it keeps its text size while positions shrink.
- **Crop** `Story.sb(vp, f)`: the window at text scale `kt`, cropped to the band; `f` 0 keeps the
  top, 1 the bottom. A pure function of `p` can move `f` (a pan): S01 follows its band up,
  S00 pans down the file before the lock. Move the tilt's origin with a pan (S00's `dy`) or the
  perspective changes the size of text on the paper.
- **Text zone** `Story.sb(vp, "t")`: storyboard y 572–792 anchored to the bottom at `kt`.
- **A region** `Story.fit(vp, [x, y, w, h], box)`: any storyboard rect fitted into a screen box
  (S02 fits its ladder under its big figure on a short phone).

What the five scenes built in phase 2 do: S00 crops its file at text scale and pans to the counter, its
flat copy in the text zone; S01 crops and follows the band up, the Sheet fills the band and
its end figures join the text zone (`short` positions); S02 keeps the big figure at the top of
the band at text scale and fits the ladder under it (no bracket tag on a short phone; the inset
chip moves under the inset); S09 puts its line in the band and sizes the year and words at
`kt`; S12 sizes all words at `kt`, anchors the lower ones to the text zone and lifts its list
of figures on a short phone (`.story-short`).

And the phase 3 scenes: S03 fits its sheet in the band and lists the sector names in the text
zone; S04 fits its bars (rank and name keep their spacing at text size) and lays its giant
figure flat in the text zone, and while Ukraine's bar climbs it gives the bar's name, dollars and the giant figure a lane of their own at the right (74 · kt wide, clear of every row's share figure, tied to the bar by a dotted line); S05 fits the drafting sheet and, for FIG. 2, crops at text scale
and moves +9.2% into the text zone beside $679B, so the munition stays in frame; S06 fits its plane and lets its frame grow from the band's
shape to the storyboard's 343 × 500 during the pull, so it lands on S07's map exactly; S07
crops anchored at the band's foot (S06's anchor) and pans to its framing in the swoop; S08 moves
5.5%, its label and the caption into the text zone; S10 packs its marks a little closer; S11
fits its ladder above the line and moves its note lower; S13 shrinks the sheet and puts the
title in the text zone.

### Storyboard px: maps and `api.place`

The cheap way (every built scene): keep every position in the storyboard's own pixels
(1440 × 900, phone 375 × 812) and let one transform scale them.

- A **map** `{ k, x, y, r, t }`: storyboard px → stage px is `x + k·px`, `y + k·py`; `r` is the
  text boost (`kt/k`, 1 on desktop); `t` is the same as a CSS transform. Give `t` to a box with
  the classes `on-sheet` (and `sb-box`: children absolute, no margins, no wrapping) in
  `layout()` with `api.map(box, m)` (it also sets `--s` = `k` on the box, for 44 px tap boxes:
  `padding: calc(22px / var(--s) - .7em) 0`). Children then use storyboard px, font sizes included.
- `Story.sb(vp)`, `Story.sb(vp, f)`, `Story.sb(vp, "t")`, `Story.fit(vp, rect, box)`: see above.
  On desktop all of them return the same 1440 × 900 map.
- `api.place(el, [x, y, fontPx, width])` in `layout()`: left, top, font size and (when given)
  width with wrapping on. No array (`null`, `0`, `false`) hides the element (`display: none`),
  so one table can hold a desktop and a phone position per element.
  `api.place(el, a, m, c)`: `a` is in map `m`'s storyboard px, `el` sits in a box drawn with map
  `c` (default `m`): positions are converted, font and width get the text scale. S02 keeps one
  box (its ladder's map) and places its big figure (top of the band) and its text-zone rows
  through their own maps; that keeps the DOM as it was, so 375 × 812 renders identically.
- **Layout tables**: rows `[class, text, tag, desktop, phone]`; `api.rows(T, box)` builds a `div`
  per row (`row.e`), `api.lay(T, m, c)` places them all (index 3 desktop, 4 phone). Most scenes use them.
- On a tilted sheet, `Story.cam.at(m, x, y, s, tilt)` is the `matrix3d` that puts an element's
  point (0, 0) on storyboard point (x, y) of map `m`, scaled `s`, on the tilt (S01's total and label).
  General form: `Story.cam.matrix3d({ x: m.x + m.k·cx, y: m.y + m.k·cy, w: 1, h: 1 }, tilt, { s: m.k·scale })`.

## The Sheet

`st.sheet` is the one object the story follows. The engine draws it every frame:

```js
{ x, y, w, h,                        // rect in stage px, in the paper's own plane (before tilt)
  tilt: { rx, ry, rz, persp, ox, oy } | null, // degrees, px; origin defaults to the rect's centre
  mode: "paper" | "outline" | "line" | "band",
  tone: "neutral" | "red" | "blue",  // edge colour
  edge: 1.5,                         // edge width px (drawn inside the rect)
  opacity: 1, tab: false, tabSize: 10, shadow: true }
```

- `paper`: lit paper (gradient, soft shadow, light on the top edge) with a coloured edge.
- `outline`: the edge only. `line`: a ledger rule along the rect's middle, `edge` px wide.
- `band`: paper with only the top and bottom edges (it runs off the frame).
- Extra sheets (rungs, stacked files): `api.drawSheet(g, sheetLike)` in `draw`. Same renderer.
- A red Sheet gets the warm (ember) light pool; everything else the cold (deep blue) one.
- Handover: scenes meet by matching end and start states. Only the active layer is visible;
  there is no crossfade between two scenes' layers. **Your state at p → 1 must equal the next
  scene's state at p 0**: a step at exactly `p = 1` is never seen in your scene and shows up as
  a cut at the start of the next one. (S02 picks its active rung by nearest fit for
  this reason.)

## Camera: `Story.cam`

A tilt means exactly what CSS means by
`transform-origin: ox oy; transform: perspective(persp) rotateX(rx) rotateY(ry) rotateZ(rz)`.

- `Story.cam.project(x, y, z, tilt)` → `{x, y}`. Here `ox/oy` default to 0, **not** the
  sheet's centre: pass `Story.cam.resolve(sheet.tilt, sheet)` to land on a drawn sheet.
- `Story.cam.quad(rect, tilt)` → the 4 projected corners `[tl, tr, br, bl]` (what the canvas draws).
- `Story.cam.bbox(rect, tilt)` → the screen bounding box (for brackets).
- `Story.cam.resolve(tilt, rect)` → the tilt with every default filled in.
- `Story.cam.matrix3d(rect, tilt, at)` → a CSS `matrix3d(...)` that prints a DOM element on
  the tilted paper. Element point `(u, v)` lands where paper point `(rect.x + s·u, rect.y + s·v)`
  lands. `at = {x, y, s}` is where the element sits in layout plus a scale; the default is
  `rect` itself (an element of size `rect.w × rect.h` at `rect.x/rect.y`).
  Measured error against the canvas quad: **0.001 px** (see `Story.debug.selfTest()`).

**Text on a moving sheet** (the pattern S03, S04 and S07 use): give the element the class `on-sheet`
(absolute, left 0, top 0, origin 0 0), size it in `layout`, and per frame:

```js
api.set(el, "transform", Story.cam.matrix3d(st.sheet, st.sheet.tilt, { x: 0, y: 0, s: scale }));
```

**Gotcha: give `ox`/`oy` explicitly** when a sheet and its text (or several rungs) share one
plane. The default origin is each rect's own centre, so two rects with default origins sit on
two different planes.

## True area

- `Story.area(valueB, fitValueB, box)` → `{w, h}` with `w·h / (box.w·box.h) = valueB / fitValueB`.
- `Story.rung(path, fitValueB, box, anchor)` (also `api.rung`) → a rect anchored at the box
  corner (`"bl" | "br" | "tl" | "tr"`), read from `js/data.js`. Pure, so use it in `state`.
  Spread your sheet fields onto it (`rect.mode = "paper"` …).
- `Story.ladder(paths, fit, box, tones, fields, anchor)` → one rung per path, all on one corner,
  `tones[i]` each, `fields` (e.g. `{ edge, tilt }`) on every rung; `.a` = the index of the
  largest rung that fits (`value ≤ fit`). S02, S06 and S11 use it. Draw it largest first:
  `api.sheets(g, rs.slice().reverse(), clip)`.
- `Story.fitBetween(a, b, p)` → a log-linear camera: each doubling of scale takes equal scroll.
- The renderer logs each rung **when it is drawn** (`st.sheet`, `api.drawSheet` or `api.sheets`)
  to `Story.debug.rungs` with `areaErrorPct`, measured from the drawn polygon (tilted: in the
  paper's plane). A rung you only use for DOM is not measured. The harness fails over 2%.
  A rect that is not from `Story.rung` (S11's fill) can carry its own
  `rung: { path, value, fit, area }` to be measured.

## Drawing helpers

- `api.sheets(g, list, clip)` → draws sheets in order (first underneath), clipped to
  `clip = [x, y, w, h]` if given (phone: `vp.stage`, the band).
- `drawSheet` / `api.sheets` stroke edges with the canvas's current line dash: S03 sets
  `g.setLineDash([4, 4])` on purpose to draw S02's rungs as dashed ghosts. The engine saves and
  restores the canvas around your `draw()`, so a dash never leaks into another scene, but reset
  it yourself (`g.setLineDash([])`) before drawing solid sheets in the same `draw()`.
- `api.inset(g, d, list)` → a boxed, magnified view (S02's DETAIL · ENLARGED): box `d = {x, y,
  w, h}`, point `(d.ax, d.ay)` shown `d.z`× at `(d.cx, d.cy)`; with `d.f` it also draws the
  dashed source box and its connector.
- `api.leader(parentGroup)` → a leader (a group with a path and a 5 px anchor square);
  `api.lead(leader, "M x y L …")` sets its path and puts the square on the first point. Set its
  `opacity` with `api.attr`. Numbered callouts: a leader plus a label in a layout table.
- `api.fade(el, o)` → opacity, and pointer events on only while `o > 0.5` (for anything that
  holds a link).

## Figures and copy

Every visible number goes through one of these. Each returns a plain string and remembers
where it came from, so the DOM helpers tag the element by themselves.

| Helper | Use | Tag |
| --- | --- | --- |
| `Story.fig(path, fmt)` | a `js/data.js` value. `fmt`: `T` `B` `M` `Mword` `pct` `ppct` `int` `usd` `oneIn` `minsec` `raw` (identical to `storyboard/sb.js`) | `fig` |
| `Story.prose(text, path)` | a number that data.js only holds inside a sentence (checked; warns and flags if missing) | `prose` |
| `Story.copy(text, ref)` | existing copy, verbatim, with its ref (`index.html:180`) | `copy` |
| `Story.label(text)` | short mono labels and source codes | `label` |
| `Story.newCopy(text, why)` | anything new: flagged for approval | `newCopy` |
| `Story.derived(text, how)` | a display value derived from figures (S09's year): flagged once per `how` | `derived` |
| `Story.missing(shown, why)` | a figure the live site prints that data.js lacks ($679B, 2016–20, 200,000 per mark). Flagged "needs a data.js field" | `missing` |

- Every storyboard flag (`c.flag`), `c.missing` and `c.sample` must be carried. Figures go through
  `Story.missing` / `Story.derived` in the code (they tag the screen). Decisions and questions
  (kinds: `decision`, `data`, `copy`, `design`, `brand`, `a11y`) go in **`js/story-debug/flags.js`**,
  one line each with its scene: readers never download them, and the harness loads that file so
  its report lists them beside the ones the code raises. `Story.flag(kind, text)` still works in
  scene code, but every word of it ships to readers: use it only for a flag that depends on what
  happens at run time.
- `Story.get(path)` reads a raw value **for maths only** (never print it). The root must be a
  `js/data.js` name: `"2025"`, `"Math.PI"` or anything on `window` throws, and `Story.fig`
  then shows `?`, logs a console error and a flag.
- One string, one source, per scene: helpers remember each string by its text, separately for
  each scene. If two helpers in the *same* scene make the same text, the last call wins the tag;
  pass `src` when that matters.
- Paths: `DEFENCE`, `topSpenders[0].amt`, `globalContext.milPctGDP`.

DOM helpers (all on `api`):

- `api.el(tag, cls, text, src, parent)` → element. `text` may be an **array of parts**:
  each part becomes its own `<span>` with its own tag. A part may be `[text, src]` to give it
  its own source (S02's nuclear line: `[Story.prose("2025", "machineData[1].sum"), { kind: "prose",
  ref: "machineData[1].sum" }]`). E.g.
  `[Story.copy("…back ", "index.html:609"), Story.prose("77", "destructionData[1].sum"), Story.copy(" years", "index.html:611")]`.
  `src` is only needed for strings no helper made (`"copy:index.html:89"`, `"label"`, `{kind, ref}`).
- `api.text(el, str, src)` → set text (written only when it changed).
- `api.link(href, text, src, parent, cls)` → a link (external ones open in a new tab).
  Links in the stage get `tabindex="-1"` automatically, after every `layout()` (so a link your
  layout attaches late is covered too); put the real one in the plate.
  Do not type "↗" into link text: css/story.css adds it to every `a[target]` with an empty
  text alternative, so screen readers do not say "north east arrow".
- `api.set(el, prop, value)` → cached style write. Per frame: `transform`, `opacity` only
  (and `pointerEvents`, see below). The harness records every style write while it scrolls
  and fails anything else.
- `api.attr(el, name, value)` → cached attribute write (SVG geometry).
- `api.svgEl(tag, attrs, parent)` → SVG element.
- A digit in text with no source logs a console warning and an `untagged` flag.

## Live counters

`api.live(kind, el, fmt?)` (same as `Story.live`) registers a counter element:
`"military"` (MIL_PER_SECOND × seconds since open, `"$" + floor + toLocaleString`, as
js/main.js:41-49) or `"deaths"` (DEATHS_PER_YEAR / 31,536,000 × seconds, floored, as
js/dossier.js:782-790; updated at most once a second). Optional `fmt(n)` replaces the format.
It ticks only while its scene is active and the story is on screen (a story whose edge only
touches the screen, as at #haveyoursay, is off screen); in no-motion mode, while its plate is in
view. When its scene becomes active it is written at once, so the first frame is never stale.
Never `aria-live`. Snapshots ignore its text.

## Brackets

`api.brackets(rect, { lock, label, id, len, tagAt, fs, dx })` in `render`: four corner brackets
and a mono tag in your SVG group. Move `rect` with `p` (hunting) and flip `lock` at one exact `p`.
Locked = 2 px, full white; hunting = 1.25 px, 70%. `tagAt`: `"tl" | "tr" | "bl" | "br"`
(default `tl` hunting, `bl` locked). Use `id` for a second set. `opacity` overrides the stroke
opacity (S00's faint trace of where the brackets just were: `{ id: "t", opacity: 0.25 }`).
Brackets on a tilted sheet: pass `{ q: Story.cam.quad(rect, tilt) }` instead of a rect; the arms
then run along the paper's edges (S00). With a camera push, grow them with it: `len`, `fs` (tag
font px, default 10, phone 9) and `dx` (tag offset px) in screen px, e.g. `24 · scale`.
Brackets not drawn in a frame are hidden. Restrained scenes get none (the call is refused and flagged).
`clip: vp.stage` keeps every corner inside the band on a short phone (S00, S01, S02).
The default tag size on a phone is 9 px × max(1, kt).

## Chrome and atmosphere

The engine owns them; scenes never draw them.
- Chrome (scenes with `chrome` on and not restrained): crop marks, "THE COST OF WAR / FILE NN ·
  NAME", "● REC · SCROLL s / TOTAL", "MOVE · NAME", a scan line that follows `p`, a left rail
  (desktop), and the red progress tick with scene markers. Phone: a compact version.
- Atmosphere: a light pool behind `st.pool` or the Sheet, a key light, static grain, a vignette.
- Entering or leaving a chrome-off scene, chrome, pool, key and grain fade over the first 0.2
  screen of the new scene, as a function of scroll. **Before a restrained scene the fade happens
  over the last 0.2 screen of the scene before it**, so a restrained scene never opens with chrome
  on it (S08's fold carries the fade; S09 starts clean). The vignette stays.

## Plates, no-motion mode, focus dock

- `api.plate` is a `<section>` in reading order: put **all** the scene's copy, figures and source
  links there, under one `<h2>` (its existing label or title, so a screen reader can jump by
  heading). The engine adds the still visual (a canvas of `state(plateP)`, `role="img"`,
  `aria-label` = `alt`) at its top. The still draws your sheet and `draw` only (not a `hold`).
- No-motion mode: no stage, `#story` is in flow, plates show as still end-state plates.
  `Story.debug.mode = "static"`, `Story.debug.reason` says why. Deep-link ids move into the plates.
  It starts for:
  - `static`: any `static` in the query (as js/dossier.js); the page's visible "Read as text"
    link (top left of the hero, index.html) opens `?static=1`;
  - `reduced-motion`: `prefers-reduced-motion: reduce`;
  - `lowpower`: `?lowpower=1`, `navigator.deviceMemory < 2`, or the data-saver setting
    (`navigator.connection.saveData`). Not `hardwareConcurrency`: iOS reports 2 for every iPhone.
    The spec said `deviceMemory <= 2`; `< 2` lets 2 GB phones keep the motion. **Open decision.**
    Safari reports no `deviceMemory`, so iPhones keep the motion;
  - `short`: the stage (100svh) is under 560 px tall: a phone turned sideways, browser zoom of
    about 160% or more, an iPhone SE with Safari's bars. The design would print too small there.
  If a resize crosses 560 px (a rotation, a zoom change), the page reloads into the other mode
  on the scene that was on screen (`#s09` …) with scroll restoration off, so it lands there, and
  the exact story position is kept for that browser tab, so turning a phone sideways and back
  returns to the same frame. Focus goes to that scene's plate. A reader below the story, or with
  anything to lose in the tools, is never reloaded (see **Phase 4** under **Resize**).
  S05 has no canvas plate: in still mode its SVG drawing (the `mid` frame) moves into the plate.
- Motion mode: plates are visually hidden but stay readable and tabbable. Each plate has
  `tabindex="-1"`: after a deep link, and after a click or tap on the stage, the engine focuses
  the active scene's plate (without scrolling), so the next Tab continues from the scene on
  screen instead of jumping back to S01. Focus on the plate itself moves nothing. When focus
  enters an element in a plate, the story scrolls to that scene (`data-p` of the nearest element that has one; the plate
  has `focusP`) and the focus dock (bottom left) shows what has focus, with the focus ring.
  Give a focusable its own target: `el.setAttribute("data-p", "0.52")`. A target of p 1 lands
  1.5 px before the next scene (scroll positions snap to pixels). If your scene's end is faded
  out (S09), set `focusP` to a frame where it is visible.

## Deep links

Every scene gets `#<id lowercased>` (`#s00` … `#s13`) at its start, plus its `anchors`:

- `#machine` → **S01**, as Chapter 01 on the live site.
- `#impact` → **S07**, at 8% of the scene (`anchorP`), where the chapter title has arrived. On the live site `#impact` (index.html:560) opens "Chapter 02 · The Impact
  of War", headed "Where the $21.8 trillion goes", and its first content is the reconstruction
  bars (`#conflictBars`, conflictCosts): S07's data. S06's turn ("That was the cost to the states
  that spend it. This is what it costs everyone.", the `#matchcut` scene) sits just *before*
  `#impact` (index.html:538–556), so it belongs to Chapter 01's end, not to `#impact`.
- `#mfMorph` → S05 and `#borderViz` → S10: the live page's ids for those sections, kept so old
  links still land (the storyboards ask for them; not among the brief's four).
- `#haveyoursay` → the tools, right after the story. `#roomSection` → the Archive, after the coalition.

On a fresh load with a hash, the engine scrolls to the anchor. A hash it cannot read is ignored. After that it never scrolls
for a hash change: the anchors sit at the right pixel, so the browser's own jump lands, and Back
or Forward restore the reader's place (the engine only moves focus to the plate).

A link into the tools (`#haveyoursay`, `#roomSection`, also with `?static=1`) is followed by the engine
before js/main.js has built the tools above it (measured on a 390 × 664 phone in still mode: the Archive
then moves 3,577 px further down).
Chrome puts the reader back by itself; Safari has no scroll anchoring. So js/main.js (`landDeepLink`)
puts the target back at the top of the screen once the tools are built, at load and when the fonts are in,
until the reader moves the page themselves. Measured in Chrome with its own help taken away (no scroll
anchoring, the hash added after the browser's jump): every tools link landed at 0 px, desktop and phone,
moving and still. Not tested in Safari itself.
It does nothing after a reload, or after Back to a page the browser no longer holds in memory: the browser
then puts the reader back where they were, and that place wins over the link (round 4 pulled such a reader
back to the link's target, up to 3,000 px from where they had moved). The one exception is the story's own
reload when the screen changes mode, which turns the browser's restoring off, so the link lands. Measured in
round 5: after a link, 3,000 px of wheel and a reload, or Back with the page cache off, the reader came back to
the same pixel in 12 of 12 runs (desktop 1440 × 900 and phone 390 × 844, #haveyoursay and #roomSection), and
8 of 8 in still mode; a fresh link still lands at 0 px. One browser behaviour remains, and it is not the link's:
in the tool check's 375 × 812 phone, with no cause chosen (the tools locked), a reload 3,000 px above the Archive
comes back 1,062 px further down, through the link or without it, and with or without `landDeepLink` (and once, in still mode without a link, 1,621 px). Chrome
first restores the right place, then the tools are built above the reader (their scripts run after the story's)
and its restoring at load settles lower. It is in the review notes.

## Handovers

- `Story.stateOf(id, p, vp)` → another scene's (pure) state. This is how scenes meet exactly at
  every screen size: S03 starts from `Story.stateOf("S02", 1, vp)` (the $2.89T rung); S05 starts
  from S04's plate; S07 rebuilds S06's end pose; S08 reads S09's line (`stateOf("S09", 0)`) to
  land on it; S11 reads S10's line and layout (`stateOf("S10", 0.5)`); S13 holds S12's last frame.
  Two scenes may read each other only with a guard against a loop (S05 ↔ S06 use one).
- `st.hold = { id, st, opacity }` keeps another scene's whole frame on screen under yours:
  the engine runs that scene's `render` (its DOM layer and SVG at `opacity`) and draws its
  sheet and marks on the canvas first. It shows only while `opacity > 0`. S13 uses it
  to fade S12's last frame, words and all, to black. Use it for a fade-out of the scene before
  (a restrained scene must not cut), not for a crossfade: let the held frame reach 0 before
  your own content fades in.
- `hold` also works forwards: a scene may show the **next** scene's first frame under its own
  exit, so the join is exact whatever the next scene draws. S05 fades S06's first frame in under
  its last 7% (the drawing dissolves into S06's parked copy); S10 fades S11's first frame (the old
  ladder on the line) in under its last 10%. The next scene's p 0 must then equal that frame,
  which it does by definition.
- `api.drawScene(g, id, st)` draws another scene's sheet and marks under the current alpha
  (canvas only; `hold` does this for you).
- So in `draw()`, **multiply** `g.globalAlpha`, never set it outright: a frame held by the next
  scene is drawn at the hold's alpha, and `g.globalAlpha = 0.4` would make those marks brighter
  than the rest of the fading frame.
- A hard cut between two scenes is also a handover: the two states simply differ at the seam
  (S00 → S01 and S01 → S02 are cuts by design). A scene that may not cut (restrained) fades
  from or to black instead.

## Debug: `Story.debug`

`total`, `scenes` (`id, name, start, screens, restrained, frames, anchors`), `s`, `active`,
`mode`, `reason`, `figs`, `copies`, `flags`, `rungs`, `ready` (a Promise: fonts loaded,
first render done, load reveal finished), `vp()`, and:

- `goto(s)` → Promise: scrolls so story progress = `s`, renders, resolves two frames later.
- `snapshot()` → `{ s, scene, p, state, dom, canvas }`. `dom` hashes everything visible in the
  stage: layer text, transforms, opacities, laid-out sizes, SVG attributes, atmosphere and
  chrome (not live counters or the boxes they stretch); `canvas` hashes every 4th pixel.
  Same `s` → same hashes.
- `goto(s)` lands on a whole (device) pixel, so `Story.debug.s` can differ from `s` by up to
  half a pixel. Near a scene edge, stay 1.5 px inside (`1.5 / vp.H` screens).
- `selfTest()` → Promise of `{ maxErrorPx, pass, cases }`: DOM on a tilted sheet against the
  canvas quad, for five tilts, three ways (spec form, per-frame form, Chrome's own CSS tilt).

## Rules that bite

- Never set `visibility: visible` on anything inside your layer: it shows through the hidden
  layer when your scene is not active. Use `opacity`.
- A stage link at opacity 0 still takes clicks and taps (`.story-world a` has pointer events
  on). Switch it off until it shows: `api.set(link, "pointerEvents", o > 0.5 ? "auto" : "none")`
  (S12). Stage tap targets must be at least 44 × 44 px on phones (the harness checks).
- Two DOM layers per scene: `api.layer` sits **under** the key light, grain and vignette (use it
  for big type and text printed on the Sheet), and `api.ui` sits **above** them, under the chrome
  (use it for small labels, source lines, captions: the storyboards' UI layer). The vignette
  darkens the frame edges by up to 60%, so small grey (`#8A9099`) text belongs in `api.ui`.
  Both layers share the scene's visibility and `st.layerOpacity`.
- Never write `top/left/width/height/font-size` per frame. Size in `layout`, move with `transform`.
- Restrained scenes: no red, no cuts, no brackets, no grain bursts; fades only.
- Colours: only the brand tokens in `css/story.css` and rgba() of them. Fonts: the three faces.
- No number typed into a string. If the harness's trace check finds an untagged digit, it fails.
- Small grey text printed on the lit paper (in `api.layer`) is darkened by the vignette and sits
  on lighter paper: give it `--soft`, not `--grey` (S00's labels measured 3.9:1 in grey).
- Second readings (the grey line under a spec figure, e.g. "2.5% of everything it produces") are
  IBM Plex Mono, as brief §5 says, even where a storyboard frame drew them in Sans.
- Tap boxes inside a box scaled by a map shrink with it: size them in screen px,
  e.g. `padding: calc(22px / var(--s) - .7em) 0` (S01's link; `api.map` sets `--s`), or for text
  sized `kt · s`, `padding: max(0px, calc(22px - .7em)) 0` (S12). The harness checks phones from
  320 px wide.
- Nothing may flash more than 3 times a second (brief §12): a big area must not change in
  place at scroll speed. S09's running year is capped at 180 px (`MAX`) for this; S00's title
  dims to about a quarter during its push, and S01's last push is spread over more scroll, for the same reason. The harness's flash check scrolls the story
  at 1 screen a second at 1440 × 900 and 1920 × 1080, and at 2 a second at 1920 × 1080.
- No red glow as a page background: the light pool follows `st.pool` or the Sheet's bounding
  box, so a sheet that runs far off screen (S01's ledger rule) must pass `st.pool` = the part
  in frame.

## Worked example

A small scene: a blue sheet that grows to true area while its figure rides on the paper.

```js
(function () {
  "use strict";
  var big;
  Story.scene({
    id: "SX", order: 5, name: "Example", move: "GROW", screens: 1,
    frames: [{ k: "in", p: 0 }, { k: "out", p: 1 }],
    alt: "A blue sheet grows to the size of the Zero Hunger budget.",
    build: function (api) {
      big = api.el("div", "sx-big t-giant on-sheet", Story.fig("issueData[0].cost", "B"), null, api.layer);
      api.el("p", null, [Story.fig("issueData[0].name", "raw"), " ", Story.fig("issueData[0].cost", "B")], null, api.plate);
    },
    state: function (p, vp) {
      var box = { x: vp.stage.x + 40, y: vp.stage.y + 40, w: vp.stage.w * 0.6, h: vp.stage.h * 0.6 };
      var fit = Story.fitBetween(Story.get("DEFENCE"), Story.get("issueData[0].cost"), p);
      var sheet = Story.rung("issueData[0].cost", fit, box, "bl");
      sheet.mode = "paper"; sheet.tone = "blue";
      sheet.tilt = { rx: 12 * (1 - p), persp: 1400, ox: box.x, oy: box.y + box.h }; // one plane, explicit origin
      return { sheet: sheet, lock: p >= 0.5 };
    },
    render: function (st, api) {
      api.set(big, "transform", Story.cam.matrix3d({ x: st.sheet.x + 12, y: st.sheet.y + 12, w: 1, h: 1 }, st.sheet.tilt, { x: 0, y: 0 }));
      api.brackets(Story.cam.bbox(st.sheet, st.sheet.tilt), { lock: st.lock, label: st.lock ? "LOCKED · ZERO HUNGER" : "SCANNING" });
    },
  });
})();
```

```css
.sx-big { font-size: calc(var(--k) * 120px); white-space: nowrap; } /* desktop; a phone sizes text with --kt */
```

## Resize

The engine re-lays out (`layout()` for every scene, canvas, chrome) when the stage changes
size, and keeps the reader's place: the same `s` (the very end included), or, for a reader
below the story, what they were on. That part is the tools' code, not the engine's: js/main.js notes,
on every scroll and focus below the story, the control the reader is in, if it is on screen, otherwise
the element in the middle of the screen (never one stuck to the screen, sticky or fixed, whose place
says nothing; a canvas counts as its box, since a canvas can give way to a still picture). Once the
engine has laid itself out at the new size it calls `window.__keepPlace()`, which scrolls that element
back to the same height on screen (motion and still mode alike). A reader typing in the letter (often
taller than the screen) is kept by the caret's line instead of the letter's top: the same height if that
is still on screen, else as near as fits (turning a 430 × 932 phone used to leave it 604 px down a 430 px screen). The tools reflow at a new width, so
the old rule (the same distance below the story's end) landed in a different tool after a zoom or a
half-screen window; the engine keeps it only as the fallback when nothing was noted (no tools, or
`__keepPlace` answers false). For a reader in the story the engine takes the place from
the last scroll position seen before the resize, because by the time the resize event fires the
browser has already pulled `scrollY` up to fit the shorter page. The stage is `100svh`, so a
phone's toolbar or keyboard (which only move `innerHeight`) never re-lays out or jumps; a
rotation, split screen or desktop window resize does (and under 560 px, a reload into the
still plates, if the reader has nothing to lose: below). Your `layout()` must size everything from `api.vp` alone: the harness compares
every scene after a resize with a fresh load at the new size.

### Phase 4: never reload a reader who is below the story

The interactive half sits below the story, so a resize across the 560 px height (either way) must
not cost anyone a half-written letter. The engine reloads to switch mode only when the reader is in
the story and has nothing to lose. It does not reload when any of these is true:

- the reader was below the story when the resize came (the tools are on screen, or further down);
- focus is in something after the story (`(root.compareDocumentPosition(a) & 20) == 4` in `busy`). Focus
  inside the story does not count: the engine itself focuses a scene's plate on every tap, after a deep
  link and after its own reload, and a test for `& 4` alone counted that as focus in the tools (16, "inside",
  comes with 4), so a tapped story never switched to the still plates when a phone was turned;
- `window.__toolDirty` is set: js/main.js sets it on the first `input`, `change` or click on a
  control outside `#story`. It is a plain flag; nothing the reader did is stored by it.

Then the current mode carries on, re-laid out for the new size, and the switch waits. It happens on
a later scroll if the reader has come back into the story with nothing to lose; otherwise it never
happens. Resizing back over the line cancels it. Tool state is never put in sessionStorage to survive
a reload (the engine stores only the story position there, for a reader in the story). The code is
`due`, `under` and `busy` in `engine.js`. tools/tool-check.mjs tests all of it (`--only noreload`), and a phone
turned on its side and back below the story with a typed letter (`--only page`, the `rotate` line).

## Checking your scene

- In the page: `await Story.debug.goto(2.5); Story.debug.snapshot()`, `Story.debug.flags`,
  `Story.debug.rungs`, `await Story.debug.selfTest()`.
- Harness: `node tools/story-check.mjs --scenes S01 --views desktop,phone --out tools/out/<you>`.
  **Always pass your own `--out`**: other people run it at the same time. It needs the internet
  (GSAP from jsdelivr, Google Fonts). Beyond the spec's checks it also scrolls for real (not
  only `goto`), watches every style write while it scrolls, resizes mid-story (late, at the
  end, below the story, and a phone turned sideways), presses Tab after every deep link, checks
  phone tap targets, and lints scene files for clocks, timers, tweens and CSS transitions.
- `shots` fails a scene that leaves out a frame its storyboard drew (`storyboard/frames`).
  `trace` accepts `Story.missing` figures and lists them as "needs a data.js field".
- `fit` tries real screen sizes (an iPhone in Safari at 390 × 664, 375 × 667, 360 × 640,
  320 × 568, 414 × 896, iPads held upright at 768 × 1024 and 820 × 1180, 1920 × 1080, 1024 × 640; under 560 px tall it expects the still plates).
  It fails text cut by the screen edge that is not cut at the reference size (text your own
  window crops with an `inset()` clip-path is cropped by design and skipped), and, on phones,
  any visible stage text smaller than its 375 × 812 size × `kt` (W/375 on a phone; ± 0.5 px): the short-phone
  rule. It measures what is on screen (font size × every transform, the 3D paper included).
- `length`: S00–S12 at most 18 screens on desktop; the phone story never longer.
- `size`: 60 KB in all, each scene against its share (noted), assets listed apart.
- `flash` counts flashes at a steady scroll (WCAG 2.3.1): 1 screen a second, and also 2 a second
  at 1920 × 1080, where the type is largest.

## How to build a scene in phase 3

1. Read your storyboard (`storyboard/scenes/<id>.js`, frames in `storyboard/frames`), the
   phase 3 spec and this file. Edit your scene's section of `js/story/scenes.js` and
   `css/story/scenes.css` (from its header line to the next); keep its `id`, `order`, `screens`,
   `anchors` and `frames` unless the integrator agrees otherwise (the timeline, the deep links
   and the harness depend on them).
2. Lay text out in **layout tables** (`api.rows`, `api.lay`) in storyboard px inside an
   `on-sheet sb-box` box given a map with `api.map`. On a phone, decide per part: the visual in
   the band (fit, crop or `Story.fit` a region), words in the text zone (`Story.sb(vp, "t")`).
   Give short phones (`vp.short`, `.story-short`) their own positions where the band is too
   small (S01's sixth column). Never size phone text from `--k` or `vp.k`: use `kt`.
3. Money at true area: `Story.rung` / `Story.ladder`, drawn with `api.sheets`. Leaders:
   `api.leader` + `api.lead`. A magnified corner: `api.inset`. Print on a tilted sheet:
   `Story.cam.at`.
4. Every figure through the helpers; carry every storyboard flag (`Story.missing`,
   `Story.derived` for `c.sample`, the rest in `js/story-debug/flags.js`). Copy verbatim with its
   ref; new words through `Story.newCopy`.
5. Meet the scenes either side of you (see **Transitions**): your state at p 0 is the end of
   the scene before (or a fade from black in a restrained scene), and the next scene's p 0 is
   your end.
6. Run the harness on your scene with your own `--out`, desktop and phone, then look at the
   shots at 375 × 812 and at a short phone (390 × 664) beside the storyboard frames.

## Transitions

Every seam has a written reason (brief §14). Final for phase 3: the builders wrote these and the
integrator checked each join by scrolling for real at 1440 × 900, 375 × 812 and 390 × 664 and
looking at the frames either side. Energetic scenes may cut (a state change at one exact `p`);
restrained ones (S09 to S12) only fade.

| Seam | What happens | Why it explains something |
| --- | --- | --- |
| S00 → S01 | Hard cut into the locked line. | The lock names the one line that matters: what the world spends on its militaries. |
| S01 → S02 | Hard cut down to the smallest rung of the ladder. | Start small ($40B, Zero Hunger) so the pull-out shows each larger sum at true scale. |
| S02 → S03 | The $2.89T sheet carries on unbroken: it rises off the table and centres, the ladder's labels cut away, its rungs fade from the corner as dashed ghosts and the total is printed on the paper. A knife then scores it and it falls apart into six sectors at true area. | The total is a budget with parts; the knife shows what it pays for: people, upkeep, weapons, research, bases, nuclear. |
| S03 → S04 | The paper is re-cut into ten strips at true size, one per largest budget; they fall and land as ten steel bars (a cut). | The same money, re-cut by who spends it: the ten largest budgets. |
| S04 → S05 | The ten bars close up into one stepped steel plate (same outline, same area) that tips back onto the table, with a dashed line where it will be cut. S05 opens on the plate snapped apart on that line, its halves sliding onto two drawing sheets (a cut). | The money becomes material: the same steel can be a turbine or a munition. |
| S05 → S06 | The drawing shrinks into the top-right corner as the paper flattens into the $2.89T sheet, red edge back; S06's first frame fades in under it, so the join is exact. | Back from one choice to the scale of all spending: the paper means money again, ready to pull wider. |
| S06 → S07 | At the lock the $21.8T sheet is named and holds, leaning back; S07 tips that same sheet further back into a map. Its red edge, printed figure and nested ladder drain away; S06's labels and brackets cut away. | From one global total to the places where war's damage lands; the sheet's area stops meaning money. |
| S07 → S08 | The camera pulls back and tilts up until the map's far edge is the horizon. S08 draws S07's own last frame as the ground; the edge bends into the curve of the earth and the first layer rises off it, while S07's labels cut away. | Lifts the eye off the ground into the air above it: what war puts into the atmosphere. |
| S08 → S09 | The layers fold back edge-on into one thin line, exactly where S09's line runs, and the chrome and the light fade out over S08's last 0.2 screen. The line crosses the join already lit; S09 opens with no chrome and its year fades in. | Drops shares and money for one measure, time, run back along that same line. |
| S09 → S10 | A slow fade through black: S10's border fades in exactly where S09's line was, still dashed, and closes into one hairline as the people divide. | The line stays as a border: from lost time to lost homes, with no cut in a restrained scene. |
| S10 → S11 | The words go first, then the marks and their light; the old ladder fades in standing on the same line, which becomes S11's floor (S11's first frame, held under S10's). | After the people, the money comes back as a measure: what was asked for them against what war spends. |
| S11 → S12 | The light on the appeal goes out, its blue drains to the ladder's grey, then the whole frame fades to the black S12 opens on. | The money story ends; what follows cannot be counted in dollars. |
| S12 → S13 | The long black pause with "When you're ready"; the last words fade to black (S13 holds S12's last frame); then one blank sheet settles in under a light. | The counting is over; the Sheet comes back blank and belongs to the reader. |
| S13 → #haveyoursay → H1 | The question lands in two cuts and the tab reads "Have your say"; scrubbing stops and the page simply scrolls on. The blank sheet leaves upward, and the $2.89T sheet arrives below it under the same light, with the same corner marks, carrying that same tab and blue mark. It lies flatter, on the desk, and takes its red edge back; the story's last frame fades into the desk instead of ending on a line. Two sheets on one page, not one sheet moving: a moving sheet would be a scroll-driven object over the tools, which brief §9 rules out. (Checked by H1, and again by the integrator with the mouse wheel at a reading pace, 1440 × 900 and 375 × 812.) | The sheet the reader was just handed is the budget they now get to spend. From here their choices cut it down, not the scroll. |
| H1 → H2 | Continue → Your country. The $2.89T sheet comes back as a dashed plane tipped back into the dark, labelled with its total, and the reader's country is cut into its near corner at true area with the red edge. | The budget the reader just spent is the world's total; their own country is one piece of it. |
| H2 → H3 | Continue → Write the letter. The letter is the sheet: dark paper on the desk under the light, a white edge and the blue tab at its corner, the words editable. | The choices so far, the causes and the country, are written onto the sheet as a letter the reader can send. |
| H3 → H4 → H5 | The coalition puts the reader's choice on a lit globe (one blue bar per country); submitting opens the card, a print of the same sheet with their ranked causes. | One reader's sheet joins everyone's, and they can take a copy away. |
| H4 → H6 | After the coalition, the Archive: dark sheets hanging on threads, one per person; the reader's own blank sheet hangs there only if they opted in. | The letter sheet's last form: one sheet among many, read only after review. |

**The Sheet, followed** (brief §4 and §14): the classified file (S00) → the budget line that
becomes the $2.89T sheet (S01) → the true-area ladder (S02) → the same sheet cut into sectors,
then into ten strips (S03) → ten steel bars that fuse into one plate (S04) → the plate cut into
the engineering drawing, which flattens back into the $2.89T sheet (S05) → that sheet small in a
corner of the $21.8T sheet (S06) → the $21.8T sheet tipped into a map (S07) → the map's edge as
the horizon, the layers folded into one line (S08) → the timeline (S09) → the border (S10) → the
floor the old ladder stands on (S11) → one point of light (S12) → one blank sheet (S13) → that sheet, its tab kept and its red edge back, as the $2.89T the reader spends (H1) → the same total as a plane with the reader's country cut into it (H2) → the letter, written on the sheet, blue tab and all (H3) → a bar on the globe and the card the reader keeps (H4, H5) → one blank sheet hanging in the Archive, for a reader who opted in (H6). Checked by the integrator in phase 4 by scrolling the whole page with choices made, at 1440 × 900, 1024 × 768 and 375 × 812.

**Count-ups**: none. No money figure runs with the scroll anywhere in the story (checked by
sampling every visible number every 0.02 screens). The only number that changes with the scroll
is S09's year (2025 back to 1948, whole years), which is not money. The two live counters (S00:
military spending since the page opened; S12: deaths since it opened) run on the clock, as on the
live site.

## Asked for, not built yet

What the builders asked the engine for in phase 3, and what was done:

- Done: S09's line now starts lit, so S08's fold carries straight into it (S08's request).
  `hold` for the next scene's first frame is documented under **Handovers** (S05, S10). The
  dashed-edge behaviour of `drawSheet` is documented under **Drawing helpers** (S03). A home
  for review notes outside story code: `js/story-debug/flags.js` (S10, S11). The chrome's FILE
  and MOVE lines no longer meet at 320 px wide (S05, S06: the letters sit closer on phones under
  360 px).
- Not built, because one file for all scenes makes repeated code nearly free to download (gzip
  stores a repeat as a short reference): a shared polyline-on-the-tilt helper (S03, S04), a
  wrapper for placing an element on the tilt (S03, S04: `Story.cam.at` already does this), the
  quiet scenes' line, pool of light and glint (S09, S10, S11), a map per row in `api.lay` (S10,
  S11), a shared map-plane camera (S07, S08: S08 now draws S07's own last frame instead), moving
  S07's place and camera tables into an asset file.
- Not built, not needed yet: `api.requestRender()` so a hover could also light a bar on the
  canvas (S04: the detail shows in the giant figure and its leader); the reverse of
  `Story.cam.project` (S06 finds its corner with a short loop); a near-camera cut in `drawSheet`
  for very large tilted planes (S07 draws its own); a shorter phone FILE label for long scene
  names (S05 draws its own top line, as its storyboard does).
- A `prepare(api)` hook (asked for by S12, and S10 may want it) is not built as a general hook. S12 does it for itself:
  it builds its 244,700-point field in slices of idle time after `Story.debug.ready` (again after a resize), so
  the first frame that shows the field no longer stalls (it cost about 50 ms on a laptop and about 240 ms on the 4×
  slowed phone test). If the reader gets there first, `draw` finishes the job at once. `state()` is untouched.
