/* S10 · DISPLACEMENT · SEPARATE · 1.5 screens · RESTRAINED
   Still marks, each about 200,000 people. They start together above one
   line: the faint line S09 left behind, now a border. Scroll moves the
   people who fled across it; the rest do not move. Totals are still
   figures, never a counter. Marks are white/grey only. No HUD, no
   brackets, no red.

   ART DIRECTION (restrained: stillness, space, scale and light only).
   The marks are a quiet field of tiny paper flecks, every one the same
   size, lying under one soft light: the ones near it catch it, the ones at
   the edge sit in shade, none goes dark. The border is a single hairline.
   The totals are set like museum captions under the work: a short rule,
   the figure, its words, the source. Nothing moves but the marks.

   THE LINE (shared with s09.js and s11.js, kept in step by hand):
     desktop: y 530, x 120 → 1320   ·   phone: y 344, x 16 → 359
   It is S09's time line, this scene's border, and S11's floor. */
(function () {
  "use strict";

  var LINE = { desk: { y: 530, x0: 120, x1: 1320 }, phone: { y: 344, x0: 16, x1: 359 } };
  // Scroll plan (p): 0 → 0.1 the marks and words fade in above S09's line
  // (no pop-in) · 0.1 → 0.8 the marks divide · 0.8 → 0.86 still, all totals
  // · 0.86 → 0.92 the words fade out · 0.86 → 1 the marks fade out
  // · 0.9 → 1 the old ladder fades in on the line, exactly as S11 opens.
  var IN = 0.1, DIV = 0.8, FADE0 = 0.86, WORDS0 = 0.92, LAD0 = 0.9;

  function rnd(s) {
    var x = Math.sin(s * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t * t * (3 - 2 * t); }

  // Mark counts, derived from data.js at render time. The 200,000-per-mark
  // scale is typed at index.html:732 and is not in data.js (flagged).
  function counts(alt) {
    var perM = 0.2; // million people per mark (index.html:732)
    var r3 = function (v) { return Math.round(v * 1000) / 1000; };
    var inside = r3(SB.get("displacedStats.internal") / perM); // 343.5
    var across = r3(SB.get("displacementBreakdown[0].millions") / perM); // 245.5
    var nIn = Math.ceil(inside);
    var nOut = alt === "B" ? Math.floor(across) : Math.ceil(across);
    return { nIn: nIn, nOut: nOut, n: nIn + nOut };
  }

  // A jittered grid of n cells filling rect r (row by row).
  function cells(r, n, seed, jit) {
    var cols = Math.max(1, Math.round(Math.sqrt((n * r.w) / r.h)));
    var rows = Math.ceil(n / cols);
    var sx = r.w / cols, sy = r.h / rows, out = [];
    for (var j = 0; j < rows && out.length < n; j++)
      for (var i = 0; i < cols && out.length < n; i++) {
        var k = j * cols + i;
        out.push({
          x: r.x + (i + 0.5) * sx + (rnd(seed + k * 3.1) - 0.5) * sx * jit,
          y: r.y + (j + 0.5) * sy + (rnd(seed + k * 7.7) - 0.5) * sy * jit,
        });
      }
    return out;
  }

  // ── light. Neutral white at very low alpha, no tint (the restrained scenes
  // get no atmosphere from the framework). Same lamp language as s09.js / s11.js.
  function stops(W, list) {
    return list.map(function (s) {
      return '<stop offset="' + s[0].toFixed(4) + '" stop-color="' + W + '" stop-opacity="' + Math.max(0, s[1]).toFixed(4) + '"/>';
    }).join("");
  }
  function pool(W, id, cx, cy, rx, ry, a) {
    return '<defs><radialGradient id="' + id + '">' +
      stops(W, [[0, a], [0.22, a * 0.78], [0.45, a * 0.42], [0.7, a * 0.14], [1, 0]]) +
      '</radialGradient></defs><ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx + '" ry="' + ry + '" fill="url(#' + id + ')"/>';
  }
  function glint(W, id, x0, x1, y, cx, spread, a, sw) {
    var f = function (x) { return clamp((x - x0) / (x1 - x0)); };
    return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + x0 + '" y1="0" x2="' + x1 + '" y2="0">' +
      stops(W, [[f(cx - spread), 0], [f(cx - spread * 0.4), a * 0.45], [f(cx), a], [f(cx + spread * 0.4), a * 0.45], [f(cx + spread), 0]]) +
      '</linearGradient></defs><line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="url(#' + id + ')" stroke-width="' + sw + '"/>';
  }

  // S11's opening state, so the exit frame shows the ladder arriving on the
  // line. Same geometry as scenes/s11.js geom() (kept in step by hand).
  function ladderRungs(c) {
    var ph = c.phone;
    var paths = ["DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"];
    var fit, box;
    if (!ph) {
      fit = SB.get("machineData[3].amtB"); // §8 scale: $21.81T would fill the frame
      box = { x: 800, y: LINE.desk.y - 900, w: 1440, h: 900 };
    } else {
      fit = SB.get("DEFENCE");
      var H = 276, W = H * (343 / 500);
      box = { x: 109, y: LINE.phone.y - H, w: W, h: H };
    }
    return paths.map(function (pth) { return SB.rungAt(SB.get(pth), fit, box, "bl"); });
  }
  // The sheets' soft shadow, as scenes/s11.js shadowDefs() (kept in step by
  // hand): sheetShadow's offset and blur over a whole-frame region, so the
  // blur under the small sheets is not cut into a hard-edged box.
  var SHADOW = "s10-shadow";
  function shadowDefs(T, W, H) {
    return '<defs><filter id="' + SHADOW + '" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '">' +
      '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="' + T.ground + '" flood-opacity="0.75"/></filter></defs>';
  }
  // The old ladder as small paper sheets lying in shadow. Drawn exactly as
  // scenes/s11.js ladderSvg() draws it (kept in step by hand).
  function ladderSvg(S, T, rg, dim) {
    var s = "";
    rg.forEach(function (r, i) {
      var war = i === 2; // $119B keeps a firmer grey edge
      s += '<g opacity="' + (0.72 * dim).toFixed(3) + '">' + S.rect(r.x, r.y, r.w, r.h, { fill: "url(#paper)", filter: "url(#" + SHADOW + ")" }) + "</g>";
      s += S.line(r.x + 1, r.y + 0.5, r.x + r.w - 1, r.y + 0.5, { stroke: T.white, opacity: (0.1 * dim).toFixed(3) });
      s += S.rect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, { fill: "none", stroke: T.grey, "stroke-width": war ? 1.5 : 1, opacity: ((war ? 0.8 : 0.45) * dim).toFixed(3) });
    });
    return s;
  }

  function build(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone;
    var p = c.plate ? DIV : c.p;
    var arrive = c.plate ? 1 : clamp(p / IN); // the fade in from S09's line
    var q = clamp((p - IN) / (DIV - IN)); // division progress
    var fade = c.plate ? 0 : clamp((p - FADE0) / (1 - FADE0)); // the marks' exit fade
    var wordFade = c.plate ? 0 : clamp((p - FADE0) / (WORDS0 - FADE0)); // words leave first
    var ladIn = c.plate ? 0 : clamp((p - LAD0) / (1 - LAD0)); // then the ladder arrives
    var cnt = counts(c.alt);
    var L = ph ? LINE.phone : LINE.desk;

    // ── figures (still) and copy
    var total = c.fig("displacedStats.displaced", "M");
    var vIn = c.fig("displacedStats.internal", "M");
    var vOut = c.fig("displacementBreakdown[0].millions", "M");
    var scale = c.missing("200,000", "people per mark: typed at index.html:732, not in data.js. Mark counts are derived from 68.7M and 49.1M at render time");
    var key = c.copy("1 mark ≈ ", "index.html:732") + scale + c.copy(" people.", "index.html:732");
    var src = c.copy("UNHCR Global Trends 2026 ↗", "index.html:655");
    var lblIn = c.copy("TRAPPED INSIDE", "index.html:720") + "<br>" + c.copy("THEIR OWN COUNTRY", "index.html:720");
    var lblOut = c.copy("FLED ACROSS", "index.html:723") + "<br>" + c.copy("A BORDER", "index.html:723");
    var kicker = c.copy("The people scattered", "index.html:626").toUpperCase() + " · " + c.copy("Displacement", "index.html:627").toUpperCase();
    var lead = c.copy("people forcibly displaced by persecution, conflict and violence at the end of ", "index.html:633-634") +
      c.prose("2025", "humanData[3].body", "year of the 117.8M count");
    var most = c.copy("Most people driven from home never even leave their own country.", "index.html:731");

    // ── geometry
    var home, away, lamp;
    if (!ph) {
      // equal density on both sides: 880 × 200 holds 344 marks, 880 × 143 holds 246
      home = { x: 120, y: 310, w: 880, h: 200 };
      away = { x: 120, y: 550, w: 880, h: 143 };
      lamp = { x: 470, y: 470, sx: 560, sy: 300 };
    } else {
      home = { x: 20, y: 110, w: 335, h: 219 };
      away = { x: 20, y: 358, w: 335, h: 146 }; // a touch denser than home (5%) to leave room for its label
      lamp = { x: 160, y: 300, sx: 250, sy: 230 };
    }
    // Every mark starts on the home side. The ones that fled cross; the rest stay still.
    var start = cells(home, cnt.n, 11, 0.85);
    var order = start.map(function (pt, i) { return { i: i, r: rnd(i * 1.37 + 5) }; });
    order.sort(function (a, b) { return a.r - b.r; });
    var fled = {};
    order.slice(0, cnt.nOut).forEach(function (o) { fled[o.i] = true; });
    var gone = [];
    for (var g = 0; g < cnt.n; g++) if (fled[g]) gone.push(g);
    var dest = cells(away, cnt.nOut, 501, 0.85);
    // pair crossing marks with destinations in x order, so paths run straight across
    gone.sort(function (a, b) { return start[a].x - start[b].x; });
    dest.sort(function (a, b) { return a.x - b.x; });
    var to = {};
    gone.forEach(function (i, k) { to[i] = dest[k]; });

    // ── the light: one soft lamp over the field, and where it falls on the line
    var lit = arrive * (1 - fade);
    c.bgSvg('<g opacity="' + lit.toFixed(3) + '">' +
      pool(T.white, "s10-air", lamp.x, lamp.y - (ph ? 60 : 140), ph ? 260 : 640, ph ? 300 : 420, ph ? 0.045 : 0.04) +
      pool(T.white, "s10-pool", lamp.x, L.y + 6, ph ? 230 : 620, ph ? 90 : 170, ph ? 0.09 : 0.09) + "</g>");

    // ── the marks: tiny paper flecks, all one size; the light sets how much each catches
    var fw = ph ? 2.2 : 3.4, fh = ph ? 3 : 4.6;
    var markOp = arrive * (1 - fade);
    var marks = "";
    for (var i = 0; i < cnt.n; i++) {
      var a = start[i], x = a.x, y = a.y;
      if (fled[i]) {
        var d = rnd(i * 3.3 + 9) * 0.5; // staggered, scroll-driven, never timed
        var t = ease(clamp((q - d) / 0.5));
        x = a.x + (to[i].x - a.x) * t;
        y = a.y + (to[i].y - a.y) * t;
      }
      var dx = (x - lamp.x) / lamp.sx, dy = (y - lamp.y) / lamp.sy;
      var catchLight = Math.exp(-(dx * dx + dy * dy));
      var rot = (rnd(i * 5.1 + 2) - 0.5) * 70;
      marks += '<rect x="' + (x - fw / 2).toFixed(1) + '" y="' + (y - fh / 2).toFixed(1) + '" width="' + fw + '" height="' + fh +
        '" transform="rotate(' + rot.toFixed(0) + " " + x.toFixed(1) + " " + y.toFixed(1) + ')" fill="' + T.white +
        '" opacity="' + ((0.3 + 0.66 * catchLight) * markOp).toFixed(3) + '"/>';
    }

    // the border: S09's faint dashed line, closing into a single hairline as
    // the marks divide; at the exit it settles to S11's floor (solid, 0.32)
    var solid = clamp(q * 2.5);
    var dashOp = 0.42 * (1 - solid) * (1 - fade);
    var lineOp = (0.5 * solid) * (1 - fade) + 0.32 * fade;
    if (dashOp > 0.005) c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, "stroke-dasharray": "3 5", opacity: dashOp.toFixed(3) }));
    if (lineOp > 0.005) c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, opacity: lineOp.toFixed(3) }));
    c.svg('<g opacity="' + (lit * solid).toFixed(3) + '">' + glint(T.white, "s10-glint", L.x0, L.x1, L.y, lamp.x, ph ? 170 : 520, 0.55, 1) + "</g>");
    c.svg(marks);
    // the old ladder arrives on the line as the marks fade (exit only), in
    // front of them. Drawn exactly as S11 draws it at its p 0: paper sheets
    // lying in shadow.
    if (ladIn > 0) c.svg(shadowDefs(T, c.W, c.H) + ladderSvg(S, T, ladderRungs(c), ladIn));

    var textOp = arrive * (1 - wordFade);
    var sideOp = clamp((q - 0.25) / 0.55) * textOp; // side totals fade in as the marks divide
    var showRow = q >= 1;
    var o = function (v) { return ";opacity:" + v.toFixed(2); };
    function children() {
      return [c.fig("humanImpactExtra.childrenDisplaced", "M"),
        c.copy("are children · ", "index.html:642") + c.fig("humanImpactExtra.childrenPct", "pct") + c.copy(" of everyone displaced", "index.html:642")];
    }
    function returns() { return [c.fig("displacedStats.returns", "M"), c.copy("people went home", "index.html:635")]; }
    function ratio() { return [c.fig("displacedStats.ratio", "oneIn"), c.copy("human beings", "index.html:634")]; }
    // a museum caption line: the figure in Plex Sans, its words in Plex Mono
    function capLine(sp, vs, ls) {
      return '<span style="' + TX.value + ";font-size:" + vs + 'px;margin-right:10px">' + sp[0] + '</span><span style="' + TX.label + ";font-size:" + ls + 'px">' + sp[1] + "</span>";
    }

    if (!ph) {
      // top left, in the dark above the field: the scene's one line of voice
      c.div(120, 92, 900, kicker, TX.label + o(textOp));
      if (q > 0) c.div(120, 122, 680, most, TX.body + ";color:" + T.white + o(clamp(q * 2) * textOp));
      // the captions under the work: rule, figure, words, then the key and source
      c.svg('<g opacity="' + textOp.toFixed(2) + '">' + S.line(120, 718, 152, 718, { stroke: T.grey }) + "</g>");
      c.div(120, 730, 170, total, TX.value + ";font-size:36px" + o(textOp));
      c.div(292, 732, 540, lead, TX.body + ";font-size:18px;line-height:1.45" + o(textOp));
      c.div(292, 794, 560, key + " &nbsp;" + src, TX.src + o(textOp));
      // the two side totals, either side of the line at its far end (mirrored about it)
      if (sideOp > 0) {
        c.div(1060, 452, 260, lblIn, TX.label + ";font-size:11px" + o(sideOp));
        c.div(1060, 484, 260, vIn, TX.value + ";font-size:30px;color:" + T.white + o(sideOp));
        c.div(1060, 548, 260, vOut, TX.value + ";font-size:30px;color:" + T.white + o(sideOp));
        c.div(1060, 584, 260, lblOut, TX.label + ";font-size:11px" + o(sideOp));
      }
      // the rest of the totals: a second caption beside the first
      if (showRow) {
        c.svg('<g opacity="' + textOp.toFixed(2) + '">' + S.line(900, 718, 932, 718, { stroke: T.grey }) + "</g>");
        [children(), returns(), ratio()].forEach(function (sp, k) {
          c.div(900, 730 + k * 28, 420, capLine(sp, 17, 11), "line-height:22px;white-space:nowrap" + o(textOp));
        });
      }
    } else {
      var tb = c.textBox;
      if (sideOp > 0) {
        c.div(20, 64, 110, vIn, TX.value + ";font-size:24px" + o(sideOp));
        c.div(122, 64, 233, lblIn, TX.label + ";font-size:10px" + o(sideOp));
        c.div(20, 514, 110, vOut, TX.value + ";font-size:24px" + o(sideOp));
        c.div(122, 514, 233, lblOut, TX.label + ";font-size:10px" + o(sideOp));
      }
      else c.div(20, 64, 335, kicker, TX.label + ";font-size:10px" + o(textOp));
      if (!showRow) {
        if (q < 0.25) {
          c.svg('<g opacity="' + textOp.toFixed(2) + '">' + S.line(tb.x, tb.y, tb.x + 24, tb.y, { stroke: T.grey }) + "</g>");
          c.div(tb.x, tb.y + 12, tb.w, total, TX.value + ";font-size:34px" + o(textOp));
          c.div(tb.x, tb.y + 56, tb.w, lead, TX.bodySm + ";text-wrap:balance" + o(textOp));
        } else {
          c.div(tb.x, tb.y, tb.w, most, TX.bodySm + ";color:" + T.white + ";text-wrap:balance" + o(textOp));
        }
        c.div(tb.x, tb.y + 166, tb.w, key + " " + src, TX.src + ";font-size:10px" + o(textOp));
      } else {
        c.svg('<g opacity="' + textOp.toFixed(2) + '">' + S.line(tb.x, tb.y, tb.x + 24, tb.y, { stroke: T.grey }) + "</g>");
        c.div(tb.x, tb.y + 12, 160, total, TX.value + ";font-size:30px" + o(textOp));
        // the year qualifies 117.8M, so the phone end state keeps it (no-motion plate shows every figure)
        c.div(tb.x + 150, tb.y + 14, 193, c.copy("forcibly displaced", "index.html:633") + "<br>" + c.copy("at the end of ", "index.html:633-634") + c.prose("2025", "humanData[3].body", "year of the 117.8M count"), TX.label + ";font-size:10px" + o(textOp));
        [children(), returns(), ratio()].forEach(function (sp, k) {
          c.div(tb.x, tb.y + 64 + k * 26, tb.w, capLine(sp, 15, 10).replace("letter-spacing:0.14em", "letter-spacing:0.08em"), "line-height:20px;white-space:nowrap" + o(textOp));
        });
        c.div(tb.x, tb.y + 158, tb.w, key + " " + src, TX.src + ";font-size:10px" + o(textOp));
      }
    }

    c.state({
      form: fade > 0 ? "border line becoming a floor" : "border line",
      x: L.x0, y: L.y, w: L.x1 - L.x0, h: 1,
      tone: fade > 0 ? "white hairline → S11's solid grey floor" : solid >= 1 ? "white hairline under one soft light" : "white, dashed (S09's line)",
      note: fade > 0 ? "words gone first, flecks and light fading; the old ladder fading in on the same line as paper sheets in shadow, exactly as S11 opens"
        : q >= 1 ? cnt.nIn + " flecks stay above the line, " + cnt.nOut + " have crossed; all totals set as captions under the field"
        : q > 0 ? "flecks crossing the line, staggered by scroll; the rest do not move; the dashed line closes into one hairline"
        : "S09's faint line, now a border; all " + cnt.n + " flecks together above it under one soft light",
    });
    if (c.alt !== "B") c.flag("decision", "589 or 590 marks. Brief says 589 (117.8M ÷ 200,000), but 68.7M and 49.1M give 343.5 and 245.5 marks, so whole marks per side cannot make 589. Drawn: " + cnt.nIn + " + " + cnt.nOut + " = " + cnt.n + " (each side rounded up, as the live code). Alt B draws 589.");
    else c.flag("decision", "Alt B: 589 marks = " + cnt.nIn + " + " + cnt.nOut + " (the fled side rounded down). It looks the same; only the count differs.");
    if (showRow || c.plate) c.flag("copy", "‘Nearly half of the displaced have not finished growing up’ (index.html:649) conflicts with 38% (humanImpactExtra.childrenPct). These frames show 38% and leave that line out. Needs approval.");
    if (q >= 1) c.flag("data", "49.1M is the remainder 117.8 − 68.7, not a sourced UNHCR figure (audit F18). Confirm against UNHCR Global Trends 2026 before it drives the split.");
    if (q < 1 && !c.plate) c.flag("decision", "The border runs across the frame (home above, fled below) because it is S09's line kept in place; the live page uses an upright border at 56% width. Confirm.");
  }

  SB.scene({
    order: 10,
    id: "S10",
    name: "Displacement",
    move: "SEPARATE",
    screens: 1.5,
    restrained: true,
    anchor: "#borderViz",
    trigger: "S09's slow fade has left only its faint line. The live #borderViz id stays as an in-page anchor; it is not one of the four required deep links.",
    camera: "None. The marks move; the frame does not.",
    reason:
      "The marks fade and leave the ladder standing on the same line: after the people, the money comes back as a measure, so S11 can set what was asked for them against what war spends.",
    frames: [
      { k: "in", p: 0.1, cap: "S09's faint line is now a border. The marks, tiny paper flecks under one soft light, have faded in with the words (p 0 to 0.1, no pop-in): all sit still, together, above it. 117.8M is a still figure, set as a caption under the field." },
      { k: "mid", p: 0.45, cap: "Scroll moves the people who fled across the line, a few at a time. The rest do not move. The dashed line closes into one hairline; the side totals fade in at its far end." },
      { k: "out", p: 0.8, cap: "Divided: 68.7M inside, 49.1M across, either side of the line. Every total shown, still, as captions under the work: 45M children, 38%, 14.7M went home, 1 in 70." },
      { k: "exit", p: 0.96, cap: "The words go first (p 0.86 to 0.92), then the flecks and their light fade (to p 1). The line settles into S11's floor and the old ladder fades in on it, paper sheets in shadow, exactly as S11 opens." },
    ],
    alts: [
      { k: "B", label: "589 marks", frames: ["out"], note: "589 = 344 + 245: the fled side rounded down. The main frames draw 590 (each side rounded up, as the live code). Open: audit F07 / BR-23." },
    ],
    draw: build,
    // No-motion plate: divided, every total shown, nothing fading.
    plate: build,
  });
})();
