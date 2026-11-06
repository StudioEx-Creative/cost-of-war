# Story engine · scene author's guide

The scroll story of *The Cost of War* (rebuild, phase 2 prototype). Page: `prototype.html`.
Spec: the phase 2 spec. Look: the storyboards in `storyboard/`.

**One rule above all: scroll position alone sets the story.** The engine turns the scroll
position into `s` (screens from the top of `#story`), finds the active scene, gives it
`p` (0 to 1) and asks it for a state. Your `state(p, vp)` is a pure function. Scrolling
back, reloading or deep-linking gives back exactly the same frame.

## Files

| File | What it is |
| --- | --- |
| `js/story/engine.js` | Everything engine, in three sections: the engine, the camera maths (`Story.cam`), the chrome and atmosphere. One file, one download. |
| `js/story/boot.js` | Calls `Story.start()` after every scene has registered. |
| `js/story/scenes/<id>.js` + `css/story/<id>.css` | One pair per scene. You only ever touch your own pair. |
| `css/story.css` | Tokens, type roles, stage layers, chrome, plates, no-motion mode. |
| `js/story-debug/selftest.js` | Debug only, loaded on demand by `Story.debug.selfTest()`. Never loaded by readers. |

Load order in `prototype.html`: `js/data.js`, GSAP 3.12.5, ScrollTrigger 3.12.5,
`engine.js`, the scenes, `boot.js`. Scene order on screen comes from each scene's `order`,
not from the order of the script tags.

To add a scene: add a `<script>` and a `<link>` for your pair, call `Story.scene({...})`.

## Size budget (read this first)

All story code (`js/story/**/*.js`, `css/story.css`, `css/story/**/*.css`) is measured as
the sum of each file gzipped (1 KB = 1024 bytes, zlib default level, as the harness counts).
The brief's limit for the **full** story is 60 KB. The engine core is about 20 KB, which leaves
about 3 KB per scene for the 14 scenes. So the prototype budget is **36 KB**: engine + GAP
(about 20 KB) + five scenes at about **3 KB each, script and style together** (S02, two screens,
may take 4 KB if another scene stays under). Comments count. Keep scenes compact: short "why"
comments, shared helpers, one-line CSS rules. Check with `node tools/story-check.mjs --only size`.

Where it stands after the phase 2 fixes and touch-ups (gzipped, script and style): engine + base CSS + boot
13.4 + 2.3 + 0.2 KB, GAP 1.2, S00 3.8, S01 3.7, S02 4.1, S09 3.5, S12 3.6. Total 35.7 KB
of 36 (0.3 KB left). The engine keeps only a handful of one-line comments: **this README is its commentary**.
At these sizes the full story would not fit 60 KB: 14 scenes must average about 3.1 KB (S02-type
two-screen scenes about 4 KB). The harness's size check lists each scene against that share
(noted, not failed, in phase 2). Before phase 3, move repeated patterns into engine helpers:
the U/T placement tables, leader and rail drawing, the 44 px link style.

## The scene definition

```js
Story.scene({
  id: "S01", order: 1, name: "The Line", move: "PUSH", screens: 1.0,
  restrained: false,     // S09–S12: true → no chrome, no brackets, no grain or pool; fades only
  chrome: true,          // dossier overlay; { labels: false } = overlay without the FILE label (S00)
  file: "01",            // chrome label "FILE 01 · THE LINE"
  anchors: ["machine"],  // extra deep-link ids at the scene start (#s01 is always made)
  frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }], // storyboard frames, for the harness
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
{ W, H, phone, dpr, k, stage: {x, y, w, h}, text: {x, y, w, h} | null }
```

- `phone = W < 768`. `H` is the stage height (100svh in px), not `innerHeight`.
- Desktop: `stage` = the full frame, `text = null`, `k = min(W/1440, H/900)`.
- Phone: `stage = {16, H·56/812, W−32, H·500/812}` (the visual, about 60%),
  `text = {16, H·572/812, W−32, H·220/812}` (two short lines), `k = min(W/375, H/812)`.
  A browser's bars leave a phone less than 812 tall (an iPhone in Safari is about 390 × 664),
  so the 375 × 812 storyboard frame is fitted to the height as well and centred sideways;
  `Story.sb` does this for you. Do not size phone text from `W` alone.
- The engine also sets CSS variables on the stage: `--k`, `--W`, `--H` (px), and the class
  `story-phone` on `<html>` when `vp.phone`. Write storyboard sizes as
  `calc(var(--k) * 260px)`: they change at layout only, never per frame.

### Storyboard px: `Story.sb(vp)` and `api.place`

The cheaper way (S00, S01, S02): keep every position in the storyboard's own pixels
(1440 × 900, phone 375 × 812) and let one transform scale them.

- `Story.sb(vp)` → `{ k, x, y, t }`: storyboard px → stage px is `x + k·px`, `y + k·py`.
  Desktop: the 1440 × 900 frame scaled by `k` and centred; phone: the 375 frame scaled by `k`,
  centred sideways, its visual window (storyboard y 56) at `vp.stage.y`. The frame can be
  narrower than the screen: clip to the frame (`m.x + k·16`, `343·k` wide), not to `vp.stage`. `t` is the same as a CSS transform: give it to a
  container with the class `on-sheet` in `layout()` (`api.set(box, "transform", Story.sb(vp).t)`)
  and its children use storyboard px, font sizes included.
- On a tilted sheet, use `Story.cam.matrix3d({ x: m.x + m.k·cx, y: m.y + m.k·cy, w: 1, h: 1 }, tilt,
  { s: m.k·scale })`: element point (u, v) lands on paper point (cx + scale·u, cy + scale·v) in
  storyboard px. Scale the tilt's perspective by `k` and put its origin through the same map.
- `api.place(el, [x, y, fontPx, width])` in `layout()`: left, top, font size and (when given)
  width with wrapping on. No array (`null`, `0`, `false`) hides the element (`display: none`),
  so one table can hold a desktop and a phone position per element.

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
  a cut at the start of the next one. (The S02 stub picks its active rung by nearest fit for
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

**Text on a moving sheet** (the pattern the stubs use): give the element the class `on-sheet`
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
- `Story.fitBetween(a, b, p)` → a log-linear camera: each doubling of scale takes equal scroll.
- The renderer logs each rung **when it is drawn** (`st.sheet` or `api.drawSheet`) to
  `Story.debug.rungs` with `areaErrorPct`, measured from the drawn polygon (tilted: in the
  paper's plane). A rung you only use for DOM is not measured. The harness fails over 2%.

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

- `Story.get(path)` reads a raw value **for maths only** (never print it). The root must be a
  `js/data.js` name: `"2025"`, `"Math.PI"` or anything on `window` throws, and `Story.fig`
  then shows `?`, logs a console error and a flag.
- One string, one source: helpers remember each string by its text. If two helpers make the
  same text (e.g. `"2025"` as prose and as a derived year), the last call wins the tag; pass
  `src` to `api.text` when that matters.
- Paths: `DEFENCE`, `topSpenders[0].amt`, `globalContext.milPctGDP`.

DOM helpers (all on `api`):

- `api.el(tag, cls, text, src, parent)` → element. `text` may be an **array of parts**:
  each part becomes its own `<span>` with its own tag. A part may be `[text, src]` to give it
  its own source (S02's nuclear line: `[Story.prose("2025", "machineData[1].sum"), { kind: "prose",
  ref: "machineData[1].sum" }]`, because S01 and S09 make the same "2025" from machineData[0]). E.g.
  `[Story.copy("…back ", "index.html:609"), Story.prose("77", "destructionData[1].sum"), Story.copy(" years", "index.html:611")]`.
  `src` is only needed for strings no helper made (`"copy:index.html:89"`, `"label"`, `{kind, ref}`).
- `api.text(el, str, src)` → set text (written only when it changed).
- `api.link(href, text, src, parent, cls)` → a link (external ones open in a new tab).
  Links in the stage get `tabindex="-1"` automatically; put the real one in the plate.
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

## Chrome and atmosphere

The engine owns them; scenes never draw them.
- Chrome (scenes with `chrome` on and not restrained): crop marks, "THE COST OF WAR / FILE NN ·
  NAME", "● REC · SCROLL s / TOTAL", "MOVE · NAME", a scan line that follows `p`, a left rail
  (desktop), and the red progress tick with scene markers. Phone: a compact version.
- Atmosphere: a light pool behind `st.pool` or the Sheet, a key light, static grain, a vignette.
- Entering or leaving a restrained (or chrome-off) scene, chrome, pool, key and grain fade over
  the first 0.2 screen of the new scene, as a function of scroll. The vignette stays.

## Plates, no-motion mode, focus dock

- `api.plate` is a `<section>` in reading order: put **all** the scene's copy, figures and source
  links there. The engine adds the still visual (a canvas of `state(plateP)`, `role="img"`,
  `aria-label` = `alt`) at its top. The still draws your sheet and `draw` only (not a `hold`).
- No-motion mode: no stage, `#story` is in flow, plates show as still end-state plates.
  `Story.debug.mode = "static"`, `Story.debug.reason` says why. Deep-link ids move into the plates.
  It starts for:
  - `static`: any `static` in the query (as js/dossier.js); the page's visible "Read as text"
    link (top left of the hero, prototype.html) opens `?static=1`;
  - `reduced-motion`: `prefers-reduced-motion: reduce`;
  - `lowpower`: `?lowpower=1`, `navigator.deviceMemory < 2`, or the data-saver setting
    (`navigator.connection.saveData`). Not `hardwareConcurrency`: iOS reports 2 for every iPhone.
    The spec said `deviceMemory <= 2`; `< 2` lets 2 GB phones keep the motion. **Open decision.**
    Safari reports no `deviceMemory`, so iPhones keep the motion;
  - `short`: the stage (100svh) is under 560 px tall: a phone turned sideways, browser zoom of
    about 160% or more, an iPhone SE with Safari's bars. The design would print too small there.
  If a resize crosses 560 px (a rotation, a zoom change), the page reloads into the other mode
  on the scene that was on screen (`#s09` …) with scroll restoration off, so it lands there.
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

Every scene gets `#<id lowercased>` (`#s00 #s01 #s02 #gap #s09 #s12`) at its start, plus its
`anchors`. `#machine` → S01 (as Chapter 01 on the live site). `#impact` opens "Chapter 02 · The
Impact of War" on the live site ("Where the $21.8 trillion goes", index.html:560), before Gaza:
in phase 3 it belongs to S07 (storyboard/scenes/s07.js). **Prototype only:** `#impact` → GAP,
which stands in for S03–S08. `#roomSection` does not exist in the prototype. `#haveyoursay`
is the end section.

On a fresh load with a hash, the engine scrolls to the scene start. After that it never scrolls
for a hash change: the anchors sit at the right pixel, so the browser's own jump lands, and Back
or Forward restore the reader's place (the engine only moves focus to the plate).

## Handovers

- `Story.stateOf(id, p, vp)` → another scene's (pure) state. GAP uses `Story.stateOf("S02", 1, vp)`.
- `st.hold = { id, st, opacity }` keeps another scene's whole frame on screen under yours:
  the engine runs that scene's `render` (its DOM layer and SVG at `opacity`) and draws its
  sheet and marks on the canvas first. It shows only while `opacity > 0`. GAP uses it to fade
  S02's last frame, text and all, to black. Use it for a fade-out of the scene before (a
  restrained scene must not cut), not for a crossfade: let the held frame reach 0 before your
  own content fades in.
- `api.drawScene(g, id, st)` draws another scene's sheet and marks under the current alpha
  (canvas only; `hold` does this for you).
- So in `draw()`, **multiply** `g.globalAlpha`, never set it outright: a frame held by the next
  scene is drawn at the hold's alpha, and `g.globalAlpha = 0.4` would make those marks brighter
  than the rest of the fading frame (S02's detail box did this until phase 2's integration).
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
  (S12 stub). Stage tap targets must be at least 44 × 44 px on phones (the harness checks).
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
- Tap boxes inside a container scaled by `k` shrink with it: size them in screen px,
  e.g. `padding: calc(22px / var(--k) - .7em) 0` (S01's link), or for text sized `k · s`,
  `padding: max(0px, calc(22px - .7em)) 0` (S12). The harness checks 320 and 360 px wide phones.
- Nothing may flash more than 3 times a second (brief §12): a big area must not change in
  place at scroll speed. S09's running year is capped at 180 px (`MAX`) for this; the harness's
  flash check scrolls the story at 1 screen a second at 1440 × 900 and 1920 × 1080.
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
.sx-big { font-size: calc(var(--k) * 120px); white-space: nowrap; }
```

## Resize

The engine re-lays out (`layout()` for every scene, canvas, chrome) when the stage changes
size, and keeps the reader's place: the same `s` (the very end included), or, for a reader
below the story (at #haveyoursay), the same distance below its end. It takes that place from
the last scroll position seen before the resize, because by the time the resize event fires the
browser has already pulled `scrollY` up to fit the shorter page. The stage is `100svh`, so a
phone's toolbar or keyboard (which only move `innerHeight`) never re-lays out or jumps; a
rotation, split screen or desktop window resize does (and under 560 px, a reload into the
still plates). Your `layout()` must size everything from `api.vp` alone: the harness compares
every scene after a resize with a fresh load at the new size.

### Phase 3: never reload a reader who is below the story

Today a resize that takes the stage under 560 px tall (or back over it) reloads the page to
switch between the moving story and the still plates. That is harmless in the prototype, but in
phase 3 the interactive half (letters, forms) sits below the story, and a reader there must
never be reloaded: a half-written letter would be lost. So the engine must either switch modes
in place (tear down the stage, show the plates, keep the scroll place and every form field
as it is) or defer the switch until the reader is back in the story, and never reload while
anything below the story has focus or unsaved input. Not changed in phase 2.

## Checking your scene

- In the page: `await Story.debug.goto(2.5); Story.debug.snapshot()`, `Story.debug.flags`,
  `Story.debug.rungs`, `await Story.debug.selfTest()`.
- Harness: `node tools/story-check.mjs --scenes S01 --views desktop,phone --out tools/out/<you>`.
  Beyond the spec's checks it also scrolls for real (not only `goto`), watches every style write
  while it scrolls, resizes mid-story (late, at the end, below the story, and a phone turned
  sideways), presses Tab after every deep link, checks phone tap targets, and lints scene files
  for clocks, timers, tweens and CSS transitions. `fit` tries real screen sizes (an iPhone in
  Safari at 390 × 664, 375 × 667, 360 × 640, 320 × 568, 1920 × 1080, 1024 × 640; under 560 px
  tall it expects the still plates) and fails text cut by the screen edge that is not cut at the
  reference size. `flash` counts flashes at a steady scroll (WCAG 2.3.1).

## Asked for, not built yet

- A `prepare(api)` hook (asked for by S12): run one heavy, one-off drawing in idle time after
  load, so it is ready before the scene needs it. Not built in phase 2: S12 builds its
  244,700-point field the first time it is needed (s 6.6, as the field starts to fade in). That
  one frame takes about 50 ms on a laptop and **130–190 ms on the 4× slowed phone test**
  (measured by the phase 2 review at 320–430 px wide), a visible hitch on a mid-range phone.
  Build it in idle time or in slices before S12 starts, or at half resolution on phones. Reconsider
  in phase 3 (S10's 589 marks and the Archive may want it too); if built, it must run after
  `Story.debug.ready`, again after a resize, and never change what `state()` returns.
