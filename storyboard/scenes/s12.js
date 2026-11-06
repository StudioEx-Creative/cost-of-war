/* S12 · THE HUMAN IMPACT · STILLNESS · 2.0 screens · RESTRAINED
   No chrome, no brackets, no hard cuts, no red, no sound. Fades only.
   The Sheet is at its smallest here: one point of light, one person.
   Then every person killed in a year, all at once, in one slow fade:
   exactly DEATHS_PER_YEAR points, drawn by a seeded scatter so a redraw
   is identical. Then the kept figures as plain text, then a black pause.

   Alt B draws the CURRENT artwork (the flood, js/dossier.js:663-792)
   for comparison. Open decision 7: Blueprint must approve the change. */
(function () {
  "use strict";

  /* ── helpers (local to this scene) ─────────────────────────────── */
  // Seeded PRNG (mulberry32). Same seed, same field, every frame.
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 0 at e0, 1 at e1 (either direction), smooth in between.
  function smooth(e0, e1, x) {
    var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }
  // The single point of light, as the live scene draws it (r 5.5, blur 14).
  function light(g, T, x, y, r, blur) {
    g.save();
    g.globalAlpha = 1;
    g.fillStyle = T.white;
    g.shadowColor = T.white;
    g.shadowBlur = blur;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // The field at rest: exactly o.n people. Each is ONE distinct device pixel
  // (an occupancy grid rejects a pixel already lit, so no point hides another),
  // white or grey, most dim and a few bright, so it reads as lights, not grain.
  // o.held = the first point of light. It is one of the o.n (so the scatter is
  // o.n - 1), its glow is kept clear of scatter, and it is drawn here only when
  // o.drawHeld is true (the fade frames draw it on its own layer at full strength).
  // mask(x, y) in 0..1 thins the field to clear space for text.
  // The count is checked by reading the canvas back: lit pixels must equal the
  // scatter count, or the frame throws. Returns { url, scatter, fill }.
  function restField(T, o) {
    var cv = document.createElement("canvas");
    var W = Math.round(o.w * o.dpr), H = Math.round(o.h * o.dpr);
    cv.width = W;
    cv.height = H;
    var g = cv.getContext("2d");
    var rnd = prng(o.seed || 1);
    var occ = new Uint8Array(W * H);
    var held = o.held || null;
    var scatter = Math.max(0, o.n - (held ? 1 : 0));
    if (held) {
      // keep the held point's glow clear (radius 10 css px)
      var hr = 10 * o.dpr, hx = held.x * o.dpr, hy = held.y * o.dpr;
      for (var yy = Math.max(0, Math.floor(hy - hr)); yy <= Math.min(H - 1, Math.ceil(hy + hr)); yy++)
        for (var xx = Math.max(0, Math.floor(hx - hr)); xx <= Math.min(W - 1, Math.ceil(hx + hr)); xx++)
          if ((xx - hx) * (xx - hx) + (yy - hy) * (yy - hy) <= hr * hr) occ[yy * W + xx] = 1;
    }
    // capacity (mask-weighted free device pixels), for the density note
    var capacity = 0;
    for (var cy = 0; cy < H; cy++)
      for (var cx = 0; cx < W; cx++)
        if (!occ[cy * W + cx]) capacity += o.mask ? o.mask((cx + 0.5) / o.dpr, (cy + 0.5) / o.dpr) : 1;
    if (scatter > capacity * 0.9) throw new Error("S12 field: " + scatter + " points will not fit in " + Math.round(capacity) + " pixels");
    var placed = 0, tries = 0;
    while (placed < scatter) {
      if (++tries > scatter * 60) throw new Error("S12 field: gave up at " + placed + " of " + scatter);
      var x = rnd() * o.w, y = rnd() * o.h;
      if (o.mask && rnd() >= o.mask(x, y)) continue;
      var px = Math.floor(x * o.dpr), py = Math.floor(y * o.dpr), i = py * W + px;
      if (occ[i]) continue;
      occ[i] = 1;
      // a night sky: most points faint, a thin tail of bright ones, and the
      // bright ones gathered where o.glow (0..1) is high, like cloud in a sky.
      // The floor stays at 0.1 so every point still shows.
      g.globalAlpha = 0.1 + 0.85 * Math.pow(rnd(), 4.6) * (o.glow ? 0.3 + 0.7 * o.glow(x, y) : 1);
      g.fillStyle = rnd() < 0.35 ? T.grey : T.white;
      g.fillRect(px, py, 1, 1);
      placed++;
    }
    if (scatter > 0) {
      var d = g.getImageData(0, 0, W, H).data, lit = 0;
      for (var j = 3; j < d.length; j += 4) if (d[j]) lit++;
      if (lit !== scatter) throw new Error("S12 field: " + lit + " lit pixels, expected " + scatter);
    }
    if (held && o.drawHeld) light(g, T, held.x * o.dpr, held.y * o.dpr, 5.5 * o.dpr, 14);
    return { url: cv.toDataURL("image/png"), scatter: scatter, fill: capacity ? scatter / capacity : 0 };
  }
  // The held point alone (one person), on its own layer.
  function heldOnly(T, w, h, dpr, at) {
    return restField(T, { w: w, h: h, dpr: dpr, n: 1, held: at, drawHeld: true }).url;
  }
  function pctOf(f) { return Math.round(f * 100) + "%"; }
  // The faintest bloom around the held point: white, very low opacity.
  // Light, not an effect: it never pulses and never changes colour.
  function bloom(T, id, x, y, r, peak) {
    peak = peak || 0.085;
    return '<defs><radialGradient id="' + id + '">' +
      '<stop offset="0" stop-color="' + T.white + '" stop-opacity="' + peak + '"/>' +
      '<stop offset="0.07" stop-color="' + T.white + '" stop-opacity="' + (peak * 0.62) + '"/>' +
      '<stop offset="0.26" stop-color="' + T.white + '" stop-opacity="' + (peak * 0.24) + '"/>' +
      '<stop offset="0.6" stop-color="' + T.white + '" stop-opacity="' + (peak * 0.06) + '"/>' +
      '<stop offset="1" stop-color="' + T.white + '" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + id + ')"/>';
  }
  // Soft, slow variation in density (value noise, two octaves), so the field
  // reads as a night sky rather than even grain. Seeded: 0.0 … 1.0.
  function cloud(seed, cell) {
    function h(i, j) {
      var v = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453;
      return v - Math.floor(v);
    }
    function vn(x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      var a = h(i, j), b = h(i + 1, j), c2 = h(i, j + 1), d = h(i + 1, j + 1);
      return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + d) * fx * fy;
    }
    return function (x, y) {
      return 0.65 * vn(x / cell, y / cell) + 0.35 * vn(x / (cell * 0.42) + 9.3, y / (cell * 0.42) + 4.1);
    };
  }
  // One kept figure as a run-in line: the value leads its own sentence,
  // the source sits under it in mono. No rule, no cell, no grid.
  function runIn(c, d, o) {
    var TX = c.TX;
    return '<div style="margin-top:' + (o.gap || 0) + 'px">' +
      '<div style="' + TX.body + ";font-size:" + o.fs + "px;line-height:" + o.lh + '">' +
      '<span style="' + TX.value + ';font-size:inherit;line-height:inherit">' + d.value + "</span>&nbsp;" + d.text + "</div>" +
      '<div style="' + TX.src + ";font-size:" + o.sfs + "px;margin-top:" + o.sgap + 'px">' + d.src + "</div></div>";
  }
  // The CURRENT flood (js/dossier.js:697-735), reproduced for comparison:
  // grows outward from the centre, radius decays 5.5px → speck, first 40 glow.
  function floodField(T, o) {
    var cv = document.createElement("canvas");
    cv.width = Math.round(o.w * o.dpr);
    cv.height = Math.round(o.h * o.dpr);
    var g = cv.getContext("2d");
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    var hash = function (n) {
      var x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    g.fillStyle = T.white;
    for (var i = 0; i < o.n; i++) {
      var spread = 0.06 + 0.94 * Math.min(i / 500, 1);
      var ang = hash(i + 1) * 6.2832;
      var rad = Math.sqrt(hash(i + 91)) * spread;
      var px = o.w * 0.5 + Math.cos(ang) * rad * o.w * 0.62;
      var py = o.h * 0.5 + Math.sin(ang) * rad * o.h * 0.62;
      var r = Math.max(0.5, 5.5 * (1 - Math.min(i / 2200, 1)));
      g.globalAlpha = i < 60 ? 1 : 0.3 + hash(i + 7) * 0.55;
      if (r <= 0.75) g.fillRect(px, py, 1, 1);
      else {
        if (i < 40) { g.shadowColor = T.white; g.shadowBlur = 14; }
        g.beginPath();
        g.arc(px, py, r, 0, 6.2832);
        g.fill();
        g.shadowBlur = 0;
      }
    }
    return cv.toDataURL("image/png");
  }
  function image(url, x, y, w, h, op) {
    return '<image href="' + url + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" preserveAspectRatio="none"' + (op != null && op < 1 ? ' opacity="' + op + '"' : "") + "/>";
  }
  // Live count since opening: time-based, not scroll. Sample at 12 minutes.
  function since(c) {
    var secs = 12 * 60, year = 365 * 24 * 3600;
    var n = Math.floor((SB.get("DEATHS_PER_YEAR") / year) * secs);
    return c.sample(String(n),
      "live count since opening. Sample 12 min after opening = floor(DEATHS_PER_YEAR ÷ 31,536,000 s × 720 s), as dossier.js:786 computes it. Runs on time, not scroll; plain text, no aria-live.");
  }

  /* ── shared text blocks ────────────────────────────────────────── */
  function openLine(c) {
    return c.copy("Everything above can be counted in dollars.", "index.html:742") + "<br>" +
      c.copy("What follows cannot.", "index.html:742");
  }
  function closeLine(c) {
    return c.copy("Every number on this page was a person", "index.html:774") + "<br>" +
      c.copy("who wanted to live.", "index.html:774");
  }
  // "When you're ready": words only. A still white link, no cyan, no arrow.
  // Padding keeps the tap target at 44px or more.
  function readyLink(c, fs) {
    return '<span style="' + c.TX.bodySm + ";display:inline-block;padding:12px 2px 9px;border-bottom:1px solid " + c.T.white +
      ";font-weight:500;font-size:" + fs + "px;line-height:1.3;color:" + c.T.white + '">' +
      c.copy("When you're ready", "index.html:781") + "</span>";
  }
  // The figure block for the field: value, unit, rate, live count, source.
  function figure(c) {
    return {
      value: c.fig("DEATHS_PER_YEAR", "int"),
      unit: c.fig("humanData[0].unit", "raw"),
      rate: c.copy("one every ", "index.html:761") + c.fig("SECONDS_PER_DEATH", "minsec"),
      live: '<span style="color:' + c.T.white + '">' + c.label("LIVE COUNT", "names the running counter as live (time-based)") +
        "&nbsp; " + since(c) + "</span> " + c.copy("since you opened this page", "index.html:763"),
      src: c.copy("ACLED · Dec 2024 – Nov 2025", "index.html:765"),
    };
  }
  // The kept content as plain figures: hiPies (2) then humanStrip (4), live order.
  function contentItems(c) {
    var it = [];
    it.push({
      value: c.fig("humanImpactExtra.civilianShare", "pct"),
      text: c.copy("of those killed and wounded by explosive weapons in towns and cities are civilians, not combatants.", "js/main.js:301"),
      src: c.label("AOAV / UN", "js/main.js:302") + "&nbsp;↗",
    });
    it.push({
      value: c.fig("humanImpactExtra.childrenPct", "pct"),
      text: c.copy("of the ", "js/main.js:309") + c.fig("displacedStats.displaced", "raw") +
        c.copy(" million people displaced by war and persecution are children: about ", "js/main.js:309") +
        c.fig("humanImpactExtra.childrenDisplaced", "raw") + c.copy(" million.", "js/main.js:309"),
      src: c.fig("humanData[3].src", "raw", "same source string as main.js:310") + "&nbsp;↗",
    });
    [0, 2, 1, 4].forEach(function (i) {
      it.push({
        value: c.fig("humanData[" + i + "].num", "raw"),
        text: c.fig("humanData[" + i + "].unit", "raw"),
        src: c.fig("humanData[" + i + "].src", "raw") + "&nbsp;↗",
      });
    });
    return it;
  }
  // One cell: rule, value, text, source. Flows, so nothing can collide.
  function cell(c, d, o) {
    var T = c.T, TX = c.TX;
    return '<div style="border-top:1px solid ' + T.rule + ";padding-top:" + o.pad + 'px">' +
      '<div style="' + TX.value + ";font-size:" + o.vfs + 'px">' + d.value + "</div>" +
      '<div style="' + TX.bodySm + ";font-size:" + o.tfs + "px;line-height:" + (o.lh || 1.45) + ";margin-top:" + o.gap + 'px">' + d.text + "</div>" +
      '<div style="' + TX.src + ";font-size:" + o.sfs + "px;margin-top:" + (o.sgap != null ? o.sgap : 6) + 'px">' + d.src + "</div></div>";
  }
  // One row of a list: value column beside text and source.
  function row(c, d, o) {
    var T = c.T, TX = c.TX;
    return '<div style="display:flex;gap:' + o.colGap + "px;border-top:1px solid " + T.rule + ";padding:" + o.pad + "px 0 " + (o.pad + 2) + 'px">' +
      '<div style="flex:0 0 ' + o.valW + "px;" + TX.value + ";font-size:" + o.vfs + 'px;padding-top:1px">' + d.value + "</div>" +
      '<div style="flex:1 1 auto;min-width:0"><div style="' + TX.bodySm + ";font-size:" + o.tfs + 'px;line-height:1.4">' + d.text + "</div>" +
      '<div style="' + TX.src + ";font-size:" + o.sfs + 'px;margin-top:4px">' + d.src + "</div></div></div>";
  }
  function contentFlags(c) {
    c.flag("decision", "hiPies today read 'Most of those killed are civilians' / 'Up to 90%' and 'A third of the displaced are children'. data.js holds civilianShare 90 and childrenPct 38. Drawn with the data.js values and no headlines (audit F06, F08, F15, reviewer note on main.js:300-301). Approve the wording.");
    c.flag("decision", "hiPies donuts become plain figures with no ring (audit F06: brief §3 rebuilds donuts, §7 keeps hiPies as plain content).");
    c.flag("copy", "humanStrip labels and sources taken from humanData[].unit / .src in data.js, not main.js:398-414. Drops 'one every two minutes' (audit F16), 'the highest ever recorded' and 'including disease and collapse'. Sources named instead of 'source ↗'. Approve.");
  }
  function orderFlag(c) {
    c.flag("decision", "Order: the live page runs hiPies and humanStrip before the lives scene (index.html:744-745). These frames put them after the field, so 'What follows cannot' leads straight to the one point. humanStrip then repeats 244,700 just after the field states it; suggest the strip drops that item. Confirm both.");
  }

  /* ── the scene ─────────────────────────────────────────────────── */
  SB.scene({
    order: 12,
    id: "S12",
    name: "The Human Impact",
    move: "STILLNESS",
    screens: 2.0,
    restrained: true,
    anchor: "#humanPivot",
    trigger: "#humanPivot top (inside #impact), once S11's drained grey ladder has faded to black.",
    camera: "None. A fixed frame. Fades only.",
    reason:
      "The long black pause after the closing line shows that the story has stopped telling and now waits. 'When you're ready' hands the pace to the reader, so S13's blank sheet arrives only when they choose to move on.",
    frames: [
      { k: "in", p: 0, cap: "Black after S11's drain. One line: what follows cannot be counted in dollars. No chrome from here to the end of the scene." },
      { k: "one", p: 0.16, cap: "One point of light, held still from p 0.06 to 0.30 (about half a screen; today it holds for under a tenth). One line names it. No counter." },
      { k: "fade", p: 0.36, cap: "One slow fade, p 0.30 to 0.44: every point arrives at once, faint, already in place. Nothing grows, floods or shrinks. The first point holds." },
      { k: "field", p: 0.52, cap: "The field at rest: exactly 244,700 points, one per person, the held point among them; each is its own device pixel, none drawn over another. Below it, on black: the figure, the rate, the live count since opening and the source." },
      { k: "content", p: 0.74, cap: "The field fades out. hiPies and humanStrip follow as plain figures with sources: no donuts, no rings, no colour. (The live page has them before the field.)" },
      { k: "out", p: 1, cap: "A long black pause, p 0.84 to 1. The closing line, then 'When you're ready' as a still white link to #haveyoursay. S13's blank sheet appears from this black." },
    ],
    alts: [
      {
        k: "B",
        label: "CURRENT (for comparison)",
        frames: ["one", "field"],
        note:
          "The artwork as it is today (js/dossier.js:663-792), drawn on the 'one' and 'field' keys so each sits beside the brief's frame of the same key. 'one' = the flood under way: one point held for under a tenth of a screen, then points pour outward on a power-5 curve, each smaller than the last (5.5px to a speck), with a rising counter and a changing label. 'field' = the end: 244,700 and 'in a single year'. Removing this changes Blueprint's artwork: open decision 7.",
      },
    ],
    draw: function (c) {
      if (c.alt === "B") return drawCurrent(c);
      return c.phone ? drawPhone(c) : drawDesk(c);
    },
    // No-motion plate: the field at rest with every figure of the scene, still.
    plate: function (c) {
      return c.phone ? platePhone(c) : plateDesk(c);
    },
  });

  /* ── desktop ───────────────────────────────────────────────────── */
  // Composition: the light lives on the upper-right third (960, 300); the
  // scene's voice lives on one quiet text axis at the lower left (x 216).
  // Everything else is black. No camera, no tilt: stillness and light only.
  var D_LIGHT = { x: 960, y: 300 };
  var D_SEED = 2447;
  var AX = 216; // the text axis
  var D_CLOUD = cloud(31, 260);
  // The one slow fade runs p 0.30 → 0.44 (see the 'fade' caption).
  function FADE(p) { return smooth(0.30, 0.44, p); }
  // The field as a night sky: it fills the frame and falls away toward a
  // dark horizon at the lower left, where the figure sits on black.
  // Density only; every point is still placed (the count is checked).
  function dMask(x, y) {
    var t = y / 900 - 0.42 * (x / 1440); // 0 upper right … 1 lower left
    var sky = smooth(0.74, 0.30, t);
    var ex = (x - 450) / 460, ey = (y - 716) / 165;
    var clear = smooth(0.3, 1.7, ex * ex + ey * ey);
    return sky * clear * (0.78 + 0.22 * D_CLOUD(x, y));
  }
  // where the brighter points gather (brightness only; it moves no point)
  function dGlow(x, y) { return smooth(0.22, 0.82, D_CLOUD(x, y)); }

  function drawDesk(c) {
    var T = c.T, TX = c.TX, k = c.k;
    var N = SB.get("DEATHS_PER_YEAR");

    if (k === "in") {
      // Small and low, with the whole upper right left empty for the light to come.
      c.div(AX, 560, 760, c.copy("The Human Impact", "index.html:739"), TX.label);
      c.div(AX, 590, 760,
        '<span style="color:' + T.soft + '">' + c.copy("Everything above can be counted in dollars.", "index.html:742") + "</span><br>" +
        '<span style="color:' + T.white + '">' + c.copy("What follows cannot.", "index.html:742") + "</span>",
        TX.body + ";font-size:28px;line-height:1.42");
      c.state({ form: "none (black)", tone: "neutral", note: "S11 ended with the ladder drained to grey; it fades to black here. Only the line, small, low on the left; the upper right is kept empty for the point that follows." });
      return;
    }

    if (k === "one") {
      c.svg(bloom(T, "s12b1", D_LIGHT.x, D_LIGHT.y, 300));
      c.svg(image(heldOnly(T, c.W, c.H, 1, D_LIGHT), 0, 0, c.W, c.H));
      c.div(AX, 604, 640, c.copy("one person killed in armed conflict", "index.html:757"), TX.body + ";font-size:20px;color:" + T.soft);
      c.state({ form: "one point of light", x: D_LIGHT.x - 5.5, y: D_LIGHT.y - 5.5, w: 11, h: 11, tone: "white", note: "the Sheet at its smallest: one person. Held still on the upper-right third with the faintest white bloom (8.5% at its core); the line sits far below-left on black. No counter beside it." });
      return;
    }

    if (k === "fade" || k === "field") {
      var fade = k === "fade";
      var op = fade ? Math.round(FADE(c.p) * 100) / 100 : 1;
      var fld = restField(T, { w: c.W, h: c.H, dpr: 1, n: N, held: D_LIGHT, seed: D_SEED, mask: dMask, glow: dGlow });
      c.svg(bloom(T, "s12b2", D_LIGHT.x, D_LIGHT.y, 300));
      c.svg(image(fld.url, 0, 0, c.W, c.H, op));
      // the first point (one of the N) holds at full strength through the fade
      c.svg(image(heldOnly(T, c.W, c.H, 1, D_LIGHT), 0, 0, c.W, c.H));
      var f = figure(c);
      var fo = fade ? ";opacity:" + op : "";
      c.div(AX - 4, 612, 760, f.value, TX.giant + ";font-size:76px" + fo);
      c.div(AX, 696, 760, f.unit, TX.body + ";font-size:20px" + fo);
      c.div(AX, 744, 760, f.rate + "<br>" + f.live + "<br>" + f.src, TX.label + ";font-size:11px;line-height:1.85" + fo);
      c.state({ form: fade ? "point + field fading in (opacity " + op + ")" : "field at rest", x: 0, y: 0, w: c.W, h: c.H, tone: "white / grey points", note: "exactly " + SB.FMT.int(N) + " points: the held point + " + SB.FMT.int(fld.scatter) + " distinct device pixels (DPR 1, checked by reading the canvas back), seeded scatter, " + pctOf(fld.fill) + " of the free pixels lit. Set as a night sky: most points faint, a few bright, density falling away to a dark horizon at the lower left where the figure sits" });
      if (!fade) {
        c.flag("decision", "Open decision 7: removing the flood changes Blueprint's artwork. Main frames show the brief's version (one point held longer, the whole field at rest in one slow fade, no counter, no shrinking, no changing labels). Alt B shows today's flood. Blueprint must approve.");
        c.flag("data", "Rate shown as 'one every 2 min 9 sec' from SECONDS_PER_DEATH (minsec), which no script reads today (audit F09/F16). humanStrip's 'one every two minutes' is not shown.");
        c.flag("data", "ACLED period: index.html:765 and the data.js:14 comment say Dec 2024 – Nov 2025; humanData[0].body and DATA-SOURCES.md say Nov 2024 – Nov 2025 (audit F17). Kept the on-page wording; needs a check.");
        c.flag("decision", "Live count since opening runs on time, not scroll (audit F18: the brief should exempt it from rule 9). Plain text, no aria-live. Labelled 'LIVE COUNT'. Footer type is brand grey, not today's #565b61 (audit F31).");
      }
      return;
    }

    if (k === "content") {
      // One narrow reading column on the text axis, the right of the frame
      // left black where the field was. Each value leads its own sentence.
      var it = contentItems(c);
      var o = { fs: 20, lh: 1.5, sfs: 11, sgap: 7 };
      c.div(AX, 176, 600,
        it.slice(0, 2).map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 34 : 0 }, o)); }).join("") +
        '<div style="height:58px"></div>' +
        it.slice(2).map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 26 : 0 }, o)); }).join(""),
        "");
      c.state({ form: "none", tone: "neutral", note: "the field has faded out; plain text on black, one narrow column on the scene's text axis" });
      contentFlags(c);
      orderFlag(c);
      return;
    }

    // out: the long black pause. The line on the text axis; 'When you're
    // ready' set apart, alone, on the lower-right third.
    c.div(AX, 330, 900, closeLine(c), TX.body + ";font-size:34px;line-height:1.34;color:" + T.white);
    c.div(960, 594, 300, readyLink(c, 18), "");
    c.state({ form: "none (black)", tone: "neutral", note: "long black pause; S13 brings one blank sheet up from this black" });
  }

  /* ── phone: a separate design ──────────────────────────────────── */
  // The phone field is drawn at DPR 2 (the brief's cap). At DPR 1 the
  // phone stage (343 × 500) has fewer pixels than there are people.
  // Here the field runs full-bleed as a sky over the top of the screen and
  // falls away to black above the text, which gives the points more room
  // (and a fainter haze) than a box inside the stage would.
  var P_DPR = 2;
  var P_SEED = 2448;
  var P_LIGHT = { x: 250, y: 236 }; // upper-right third, screen coordinates
  var PAX = 32, PW = 311; // the phone text axis
  var P_FH = 640; // height of the field image
  var P_CLOUD = cloud(17, 120);
  function pMask(x, y) {
    var h = y + 0.22 * (375 - x); // horizon sits a little lower on the right
    return smooth(630, 420, h) * (0.8 + 0.2 * P_CLOUD(x, y));
  }
  function pGlow(x, y) { return smooth(0.22, 0.82, P_CLOUD(x, y)); }

  function drawPhone(c) {
    var T = c.T, TX = c.TX, k = c.k;
    var N = SB.get("DEATHS_PER_YEAR");

    if (k === "in") {
      c.div(PAX, 566, PW, c.copy("The Human Impact", "index.html:739"), TX.label + ";font-size:11px");
      c.div(PAX, 592, PW,
        '<span style="color:' + T.soft + '">' + c.copy("Everything above can be counted in dollars.", "index.html:742") + "</span><br>" +
        '<span style="color:' + T.white + '">' + c.copy("What follows cannot.", "index.html:742") + "</span>",
        TX.body + ";font-size:21px;line-height:1.42");
      c.state({ form: "none (black)", tone: "neutral", note: "S11's grey ladder has faded to black; the stage waits, empty, for the point" });
      return;
    }
    if (k === "one") {
      c.svg(bloom(T, "s12pb1", P_LIGHT.x, P_LIGHT.y, 170));
      c.svg(image(heldOnly(T, c.W, P_FH, P_DPR, P_LIGHT), 0, 0, c.W, P_FH));
      c.div(PAX, 604, PW, c.copy("one person killed in armed conflict", "index.html:757"), TX.body + ";font-size:17px;color:" + T.soft);
      c.state({ form: "one point of light", x: P_LIGHT.x - 5.5, y: P_LIGHT.y - 5.5, w: 11, h: 11, tone: "white", note: "the Sheet at its smallest: one person, held on the upper-right third with the faintest bloom" });
      return;
    }
    if (k === "fade" || k === "field") {
      var fade = k === "fade";
      var op = fade ? Math.round(FADE(c.p) * 100) / 100 : 1;
      var fld = restField(T, { w: c.W, h: P_FH, dpr: P_DPR, n: N, held: P_LIGHT, seed: P_SEED, mask: pMask, glow: pGlow });
      c.svg(bloom(T, "s12pb2", P_LIGHT.x, P_LIGHT.y, 170));
      c.svg(image(fld.url, 0, 0, c.W, P_FH, op));
      c.svg(image(heldOnly(T, c.W, P_FH, P_DPR, P_LIGHT), 0, 0, c.W, P_FH));
      var f = figure(c);
      var fo = fade ? ";opacity:" + op : "";
      c.div(PAX - 2, 590, PW, f.value, TX.giant + ";font-size:46px" + fo);
      c.div(PAX, 640, PW, f.unit, TX.bodySm + ";font-size:15px;line-height:1.4" + fo);
      c.div(PAX, 692, PW, f.rate + "<br>" + f.live + "<br>" + f.src, TX.label + ";font-size:10px;line-height:1.75" + fo);
      c.state({ form: fade ? "point + field fading in (opacity " + op + ")" : "field at rest", x: 0, y: 0, w: c.W, h: P_FH, tone: "white / grey points", note: "exactly " + SB.FMT.int(N) + " points: the held point + " + SB.FMT.int(fld.scatter) + " distinct device pixels at DPR 2 (checked by reading the canvas back), " + pctOf(fld.fill) + " of the free pixels lit; a full-bleed sky over the top of the screen, falling away to black above the text" });
      if (!fade) c.flag("decision", "Open decision 7 (see desktop). Phone field drawn at DPR 2, the brief's cap: at DPR 1 the 343×500 stage has fewer pixels than there are people, so the points cannot all show. At DPR 2, run full-bleed above the text, they light " + pctOf(fld.fill) + " of the field's free pixels, so on a phone the field reads as a dense haze, not separate lights.");
      return;
    }
    if (k === "content") {
      // No visual here: the kept figures run as one quiet reading column.
      var it = contentItems(c);
      var o = { fs: 15, lh: 1.45, sfs: 10, sgap: 5 };
      c.div(PAX, 128, PW,
        it.slice(0, 2).map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 22 : 0 }, o)); }).join("") +
        '<div style="height:40px"></div>' +
        it.slice(2).map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 18 : 0 }, o)); }).join(""),
        "");
      c.state({ form: "none", tone: "neutral", note: "field faded out; plain reading column that scrolls as normal text" });
      contentFlags(c);
      orderFlag(c);
      return;
    }
    // out
    c.div(PAX, 262, PW, c.copy("Every number on this page was a person", "index.html:774") + " " +
      c.copy("who wanted to live.", "index.html:774"), TX.body + ";font-size:25px;line-height:1.36;color:" + T.white);
    c.div(PAX, 600, PW, readyLink(c, 17), "");
    c.state({ form: "none (black)", tone: "neutral", note: "long black pause; S13's blank sheet appears from black" });
  }

  /* ── no-motion plates ──────────────────────────────────────────── */
  // A soft pool of dark around the held point and its one line (1 person).
  // It thins the field (points are moved, not hidden), so the count holds.
  function underLight(at, rx, ry, dx, dy, e0, e1) {
    return function (x, y) {
      var ex = (x - at.x - dx) / rx, ey = (y - at.y - dy) / ry;
      return smooth(e0, e1, ex * ex + ey * ey);
    };
  }
  function plateDesk(c) {
    var T = c.T, TX = c.TX;
    var N = SB.get("DEATHS_PER_YEAR");
    // the field is a sky over the right of the frame; the text keeps to one
    // column on the left, on black
    var at = { x: 1040, y: 300 };
    var clear = underLight(at, 230, 56, 0, 40, 0.1, 1.6);
    var fld = restField(T, { w: c.W, h: c.H, dpr: 1, n: N, held: at, drawHeld: true, seed: D_SEED, glow: dGlow, mask: function (x, y) {
      return smooth(620, 800, x) * smooth(920, 800, y) * clear(x, y);
    } });
    c.svg(bloom(T, "s12bp", at.x, at.y, 280));
    c.svg(image(fld.url, 0, 0, c.W, c.H));
    c.div(at.x - 170, at.y + 24, 340, c.copy("one person killed in armed conflict", "index.html:757"), TX.body + ";font-size:18px;line-height:1.3;text-align:center;color:" + T.white);
    var f = figure(c);
    var it = contentItems(c).filter(function (d, i) { return i !== 2; }); // 244,700 is the figure above
    var o = { fs: 18, lh: 1.45, sfs: 11, sgap: 4 };
    var html =
      '<div style="' + TX.label + '">' + c.copy("The Human Impact", "index.html:739") + "</div>" +
      '<div style="' + TX.body + ";font-size:19px;line-height:1.42;margin-top:10px\"><span style=\"color:" + T.soft + '">' +
        c.copy("Everything above can be counted in dollars.", "index.html:742") + '</span><br><span style="color:' + T.white + '">' +
        c.copy("What follows cannot.", "index.html:742") + "</span></div>" +
      '<div style="' + TX.giant + ';font-size:58px;margin:26px 0 0 -3px">' + f.value + "</div>" +
      '<div style="' + TX.body + ';font-size:18px;margin-top:8px">' + f.unit + "</div>" +
      '<div style="' + TX.label + ';font-size:11px;margin-top:8px;line-height:1.75">' + f.rate + "<br>" + f.live + "<br>" + f.src + "</div>" +
      '<div style="margin-top:22px">' + it.map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 12 : 0 }, o)); }).join("") + "</div>" +
      '<div style="' + TX.body + ";font-size:22px;line-height:1.3;color:" + T.white + ';margin-top:24px">' + closeLine(c) + "</div>" +
      '<div style="margin-top:4px">' + readyLink(c, 18) + "</div>";
    c.div(120, 60, 520, html, "");
    contentFlags(c);
    c.state({ form: "field at rest (static)", x: 620, y: 0, w: c.W - 620, h: c.H, tone: "white / grey points", note: "no fade, no hold: the end state with every figure. Exactly " + SB.FMT.int(N) + " points (the labelled held point + " + SB.FMT.int(fld.scatter) + " distinct pixels, " + pctOf(fld.fill) + " of the free pixels lit), a sky over the right of the frame; the text in one column on black. The live count still runs" });
  }

  // Phone plate: the field is a sky across the top, as tall as the figures
  // allow. 244,700 distinct points need room: at DPR 2 a 375-wide band must be
  // close to 300 px tall to keep the field under two-thirds lit. To make that
  // room, the kept figures run as short run-in lines instead of cells.
  function platePhone(c) {
    var T = c.T, TX = c.TX;
    var N = SB.get("DEATHS_PER_YEAR");
    var bh = 318, at = { x: 236, y: 190 };
    var clear = underLight(at, 118, 40, 0, 36, 0.12, 1.5);
    var fld = restField(T, { w: c.W, h: bh, dpr: P_DPR, n: N, held: at, drawHeld: true, seed: P_SEED, glow: pGlow, mask: function (x, y) {
      return smooth(bh, bh - 56, y) * clear(x, y);
    } });
    c.svg(bloom(T, "s12pp", at.x, at.y, 120));
    c.svg(image(fld.url, 0, 0, c.W, bh));
    c.div(at.x - 80, at.y + 16, 160, c.copy("one person killed in armed conflict", "index.html:757"), TX.bodySm + ";font-size:14px;line-height:1.3;text-align:center;color:" + T.white);
    var f = figure(c);
    var it = contentItems(c).filter(function (d, i) { return i !== 2; }); // 244,700 is the figure above
    var o = { fs: 14, lh: 1.36, sfs: 10, sgap: 2 };
    var html =
      '<div style="' + TX.giant + ';font-size:38px">' + f.value + "</div>" +
      '<div style="' + TX.bodySm + ';font-size:14px;line-height:1.35;margin-top:4px">' + f.unit + "</div>" +
      '<div style="' + TX.label + ';font-size:10px;line-height:1.6;margin:4px 0 12px">' + f.rate + "<br>" + f.live + "<br>" + f.src + "</div>" +
      it.map(function (d, i) { return runIn(c, d, Object.assign({ gap: i ? 8 : 0 }, o)); }).join("") +
      '<div style="' + TX.bodySm + ";font-size:15px;line-height:1.35;color:" + T.white + ';margin-top:12px">' + closeLine(c) + "</div>" +
      "<div>" + readyLink(c, 14) + "</div>";
    c.div(PAX - 8, bh - 44, PW + 8, html, "");
    contentFlags(c);
    c.flag("decision", "Phone no-motion plate: to fit every figure on one screen the field gets a " + bh + " px band, where the points light " + pctOf(fld.fill) + " of the free pixels (near-solid static). Alternative for the no-motion page: give the field its own full-stage plate, as in the 'field' frame, and let the figures follow below it. Choose one.");
    c.state({ form: "field at rest (static)", x: 0, y: 0, w: c.W, h: bh, tone: "white / grey points", note: "all figures still; exactly " + SB.FMT.int(N) + " points (the labelled held point + " + SB.FMT.int(fld.scatter) + " distinct pixels at DPR 2, " + pctOf(fld.fill) + " of the free pixels lit: dense at phone size). The live count still runs" });
  }

  /* ── Alt B: the current artwork, for comparison ────────────────── */
  function drawCurrent(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, ph = c.phone;
    var N = SB.get("DEATHS_PER_YEAR");
    var end = c.k !== "one";
    var P = 0.6; // pin progress shown for the mid-flood still
    var n = end ? N : Math.floor(N * Math.pow(P, 5));
    // today's stage is full-bleed, 100vh, on both desktop and phone
    var dpr = ph ? 2 : 1;
    c.svg(image(floodField(T, { w: c.W, h: c.H, dpr: dpr, n: n }), 0, 0, c.W, c.H));
    // the soft pool of dark behind the counter (dossier.css:1121-1136)
    var oy = c.H * 0.84; // overlay bottom = 16% from the bottom
    var cs = ph ? 48 : 128; // clamp(3rem, 11vw, 8rem)
    var ls = ph ? 11 : 14.7;
    var lh = ph ? 2 : 1;
    var cTop = oy - ls * 1.4 * lh - 11 - cs;
    c.svg('<defs><radialGradient id="s12pool"><stop offset="0" stop-color="' + T.ground + '" stop-opacity="0.92"/><stop offset="0.59" stop-color="' + T.ground + '" stop-opacity="0.72"/><stop offset="1" stop-color="' + T.ground + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="s12foot" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + T.ground + '" stop-opacity="0.95"/><stop offset="0.45" stop-color="' + T.ground + '" stop-opacity="0.8"/><stop offset="1" stop-color="' + T.ground + '" stop-opacity="0"/></linearGradient></defs>');
    var pw = ph ? 380 : 820, phh = ph ? 300 : 420;
    c.svg('<ellipse cx="' + c.W / 2 + '" cy="' + (cTop + (oy - cTop) / 2) + '" rx="' + pw / 2 + '" ry="' + phh / 2 + '" fill="url(#s12pool)"/>');
    c.svg(S.rect(0, c.H - 112, c.W, 112, { fill: "url(#s12foot)" }));
    var count = end ? c.fig("DEATHS_PER_YEAR", "int")
      : c.sample(SB.FMT.int(n), "CURRENT version: dossier.js:761 floor(DEATHS_PER_YEAR × p^5) at pin progress p = 0.6");
    var label = end ? c.copy("in a single year", "js/dossier.js:746")
      : c.copy("every point is one person who wanted to live", "js/dossier.js:745");
    c.div(0, cTop, c.W, count, TX.giant + ";font-size:" + cs + "px;line-height:1;text-align:center");
    c.div(ph ? 40 : 420, cTop + cs + 11, ph ? c.W - 80 : 600, label, TX.label + ";font-weight:400;font-size:" + ls + "px;color:" + T.soft + ";text-align:center;text-transform:none");
    // footer: rate · since · source (live: 9.3px in #565b61; drawn at 10px grey here)
    var br = ph ? "<br>" : '<span style="display:inline-block;width:22px"></span>';
    var foot = c.copy("one every ", "index.html:761") + c.fig("SECONDS_PER_DEATH", "minsec") + br +
      '<span style="color:' + T.white + '">' + since(c) + "</span> " + c.copy("since you opened this page", "index.html:763") + br +
      c.copy("ACLED · Dec 2024 – Nov 2025", "index.html:765");
    c.div(16, c.H - (ph ? 92 : 50), c.W - 32, foot, TX.label + ";font-size:10px;letter-spacing:0.16em;text-align:center;line-height:1.7");
    // storyboard annotation (not site copy)
    var tag = c.label("CURRENT (FOR COMPARISON)", "storyboard annotation, not site copy") + " · " +
      (end ? c.label("END OF FLOOD", "storyboard annotation") : c.label("MID-FLOOD", "storyboard annotation"));
    c.div(ph ? 16 : 40, ph ? 16 : 30, null, tag, TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px;padding:6px 10px;border:1px solid " + T.sheetLine + ";background:" + T.ground);
    c.state({ form: end ? "flooded field (current)" : "field flooding (current)", x: 0, y: 0, w: c.W, h: c.H, tone: "white points", note: end ? SB.FMT.int(N) + " drawn (DEATHS_PER_YEAR), counter at the total, label 'in a single year'" : "pin at p = " + P + ": " + SB.FMT.int(n) + " of " + SB.FMT.int(N) + " drawn on the power-5 curve; points shrink from 5.5px to a speck as they come" });
    c.flag("decision", "Open decision 7: this is today's flood, drawn for comparison. The brief removes the flood, the rising counter, the shrinking points and the changing labels ('still countable', 'you have already stopped counting', 'every point is one person who wanted to live', 'in a single year'). Blueprint must approve.");
    if (!end) c.flag("data", "Today the counter reads '0' under the label 'one person killed in armed conflict' for the first 4% of the pin (audit, dossier.js:742/761). The brief version shows no counter.");
  }
})();
