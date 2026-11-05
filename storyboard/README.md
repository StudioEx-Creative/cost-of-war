# Storyboards · scroll rebuild, phase 1

Still frames of every scene in the rebuild brief, at 1440×900 and 375×812.
**Not part of the live site.** Nothing here is loaded by `index.html`.

- `index.html` — the review page (every scene, every frame, with notes).
- `frame.html?s=S02&f=mid&v=desktop` — one frame at native size (`&plate=1` for the no-motion plate, `&alt=B` for an alternative).
- `sb.js` — the framework. `scenes/*.js` — one file per scene.
- `tools/render.mjs` — screenshots every frame with headless Chrome, measures colour, checks overflow and true-area rungs.

```bash
node storyboard/tools/render.mjs            # all scenes
node storyboard/tools/render.mjs S02 S03    # some scenes
```

PNGs land in `storyboard/frames/` (not committed). `measure.js` feeds the review page.

## Rules the framework enforces

1. **Figures only from `js/data.js`.** Use `c.fig(path, fmt)`. Paths look like `DEFENCE`, `displacedStats.appeal`, `topSpenders[0].amt`, `machineData[3].amt`. Formats: `T` ($2.89T), `B` ($954B), `M` (117.8M), `Mword`, `pct`, `ppct`, `int` (244,700), `usd` ($691,590), `oneIn`, `minsec` (2 min 9 sec), `raw`.
   - Only inside a sentence in data.js: `c.prose("77", "destructionData[1].sum")`. It checks the text is really there and flags it.
   - Not in data.js at all: `c.missing("$679B", "why / where it comes from")`. Always flagged.
   - A sample reading of a live counter: `c.sample(shown, "how it is derived")`.
   - Never type a number into a string.
2. **Copy has a source.** Existing copy: `c.copy(text, "index.html:742")`, verbatim. Short mono labels and source codes: `c.label("SIPRI 2026")`. Anything else: `c.newCopy(text, why)`, which is flagged for approval. Keep new copy to a minimum.
3. **Brand only.** Colours from `c.T` (ground, white, soft, grey, rule, faint, sheet, sheetLine, red, blue, ember, deep). Type from `c.TX` presets: `label`, `labelW`, `src` (Plex Mono); `body`, `bodySm`, `value` (Plex Sans); `title`, `giant` (Archivo Black). No other hex values, no other fonts.
   - About 92% black/white/grey, 5% red, 3% blue. Normally one red mark per screen. Never a red or blue page background. Ember and deep blue are support only, never a live figure.
4. **True area.** Money sheets use `c.rung(path, fit, box, anchor)` (logs its error; render fails it over 2%), or `SB.area` / `SB.rungAt` / `SB.fitBetween` for camera moves.
5. **Restrained scenes (S09–S12):** no chrome, no brackets, no hard cuts, no red emphasis. Fades only.

## Drawing API (`c` in `draw(c)`)

- `c.p` progress 0–1 for this frame; `c.k` frame key; `c.alt` alternative key or null; `c.plate` true for the no-motion plate.
- `c.phone` / `c.desk`; `c.W`, `c.H`; `c.stage` (desktop: full frame; phone: 343×500 at x16 y56); `c.textBox` (phone only: 343×220 at x16 y572).
- `c.svg(str)` world layer (moves with the camera). `c.bgSvg(str)` fixed, behind. `c.uiSvg(str)` fixed, on top.
- `c.div(x, y, w, html, style)` text block on the world layer; `c.uiDiv(...)` fixed text.
- `c.camera(scale, fx, fy, sx, sy)` puts world point (fx, fy) at screen point (sx, sy).
- `c.chrome()` top labels + progress scale (skipped in restrained scenes and plates). `c.chrome({labels:false})` scale only.
- `c.state({form, x, y, w, h, tone, note})` records the Sheet's state for the notes.
- `c.flag(kind, text)` raises a note (kinds used: `decision`, `copy`, `data`).
- SVG helpers on `SB.SVG`: `rect`, `line`, `path`, `circle`, `text`, `sheet(x,y,w,h,{tone, mode:'edge'|'outline'|'solid'|'hatch', sw, tab, dash, opacity})`, `grid`, `brackets`, `leader(points)`, `tick`.

## Scene definition

```js
SB.scene({
  order: 2, id: "S02", name: "The Ladder", move: "PULL", screens: 2.0, restrained: false,
  anchor: null, trigger: "...", camera: "...",
  reason: "Why the transition out of this scene explains something.",
  frames: [ { k: "in", p: 0, cap: "..." }, { k: "mid", p: 0.5, cap: "..." }, { k: "out", p: 1, cap: "..." } ],
  alts: [ { k: "B", label: "Side by side", frames: ["out"], note: "..." } ],   // optional
  draw: function (c) { ... },
  plate: function (c) { ... },   // optional: the no-motion end-state plate
});
```

See `scenes/s00.js` and `scenes/s01.js` for the pattern.

## Art direction (applies to every scene)

Greg's note on the first pass: it should feel alive and art-directed, not like a corporate interface. The framework now adds, automatically:
- **Dossier overlay** in S00–S08 (`c.chrome()`): crop marks, REC and scroll readouts, a position rail, a scan line that travels with scroll, the red progress tick with scene markers, and a tracking box that acquires (before p 0.5) and locks (after) on the Sheet's last `c.state()` rect. Not on S07 (no locks on places where people live). Off in restrained scenes and plates.
- **Atmosphere**: a cold deep-blue light pool behind the Sheet (ember behind red sheets), a soft key light, film grain and a vignette. Restrained scenes get the vignette only.
- **Paper**: `mode:'edge'` sheets are lit paper with a soft shadow (`flat:true` turns the shadow off).
- **Depth**: `c.tilt({rx, ry, rz, persp})` tilts the world in 3D about the frame centre, before the 2D camera. Use it for camera moves (a pull that leans back, a sheet that tips into the map plane, an orbit).

Compose each frame like a film still, not a dashboard:
1. One dominant subject per frame. Extreme scale contrast. Off-centre framing. Giant Archivo Black numerals may crop at the frame edge.
2. The Sheet is a physical object in space: it tilts, turns, stacks, casts a shadow. Avoid flat boxes floating on black.
3. Annotations as technical marginalia around the subject (leader lines, numbered callouts, boxed insets), not tidy tables or card grids.
4. No UI tropes in the story: no card rows, no centred stacks of labels, no button-like elements before S13.
5. Restrained scenes (S09–S12) get their art direction from stillness, space and light, never from effects.
