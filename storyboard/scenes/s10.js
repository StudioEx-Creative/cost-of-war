/* S10 · DISPLACEMENT · SEPARATE · 1.5 screens · RESTRAINED
   Still marks, each about 200,000 people. They start together above one
   line: the faint line S09 left behind, now a border. Scroll moves the
   people who fled across it; the rest do not move. Totals are still
   figures, never a counter. Marks are white/grey only. No HUD, no
   brackets, no red.

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
    var home, away, side;
    if (!ph) {
      // equal density on both sides: 980 × 200 holds 344 marks, 980 × 143 holds 246
      home = { x: 120, y: 310, w: 980, h: 200 };
      away = { x: 120, y: 550, w: 980, h: 143 };
      side = { x: 1140, w: 180 };
    } else {
      home = { x: 20, y: 110, w: 335, h: 219 };
      away = { x: 20, y: 358, w: 335, h: 146 }; // a touch denser than home (5%) to leave room for its label
    }
    // Every mark starts on the home side. The ones that fled cross; the rest stay still.
    var start = cells(home, cnt.n, 11, 0.6);
    var order = start.map(function (pt, i) { return { i: i, r: rnd(i * 1.37 + 5) }; });
    order.sort(function (a, b) { return a.r - b.r; });
    var fled = {};
    order.slice(0, cnt.nOut).forEach(function (o) { fled[o.i] = true; });
    var gone = [];
    for (var g = 0; g < cnt.n; g++) if (fled[g]) gone.push(g);
    var dest = cells(away, cnt.nOut, 501, 0.6);
    // pair crossing marks with destinations in x order, so paths run straight across
    gone.sort(function (a, b) { return start[a].x - start[b].x; });
    dest.sort(function (a, b) { return a.x - b.x; });
    var to = {};
    gone.forEach(function (i, k) { to[i] = dest[k]; });

    var r = ph ? 1.7 : 2.6;
    var markOp = 0.88 * arrive * (1 - fade);
    var marks = "";
    for (var i = 0; i < cnt.n; i++) {
      var a = start[i], x = a.x, y = a.y;
      if (fled[i]) {
        var d = rnd(i * 3.3 + 9) * 0.5; // staggered, scroll-driven, never timed
        var t = ease(clamp((q - d) / 0.5));
        x = a.x + (to[i].x - a.x) * t;
        y = a.y + (to[i].y - a.y) * t;
      }
      marks += S.circle(x.toFixed(1), y.toFixed(1), r, { fill: T.soft, opacity: markOp.toFixed(2) });
    }

    // the old ladder arrives on the line as the marks fade (exit only). Drawn
    // exactly as S11 draws it at its p 0 (grey outlines at 0.7; $119B as paper
    // with a grey edge), so the hand-over has no jump.
    if (ladIn > 0) {
      var lad = "", rg = ladderRungs(c);
      [rg[0], rg[1]].forEach(function (r) {
        lad += S.rect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, { fill: "none", stroke: T.grey, "stroke-width": 1, opacity: 0.7 });
      });
      lad += S.sheet(rg[2].x, rg[2].y, rg[2].w, rg[2].h, { tone: "grey", mode: "edge", sw: 1.5 });
      lad += S.rect(rg[3].x + 0.5, rg[3].y + 0.5, rg[3].w - 1, rg[3].h - 1, { fill: "none", stroke: T.grey, "stroke-width": 1, opacity: 0.7 });
      c.svg('<g opacity="' + ladIn.toFixed(2) + '">' + lad + "</g>");
    }
    // the border: S09's faint line, firming as the marks divide; solid as it becomes the floor
    var bOp = (0.42 + 0.2 * clamp(q * 2)) * (1 - fade);
    c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, "stroke-dasharray": "3 5", opacity: bOp.toFixed(2) }));
    if (fade > 0) c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, opacity: (0.32 * fade).toFixed(2) }));
    c.svg(marks);

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

    if (!ph) {
      c.div(120, 56, 900, kicker, TX.label + o(textOp));
      c.div(113, 84, 560, total, TX.giant + ";font-size:112px" + o(textOp));
      c.div(680, 94, 620, lead, TX.body + o(textOp));
      if (q > 0) c.div(680, 170, 620, most, TX.body + ";color:" + T.white + o(clamp(q * 2) * textOp));
      if (sideOp > 0) {
        c.div(side.x, L.y - 92, side.w, lblIn, TX.labelW + o(sideOp));
        c.div(side.x, L.y - 52, side.w, vIn, TX.value + ";font-size:34px" + o(sideOp));
        c.div(side.x, L.y + 22, side.w, lblOut, TX.labelW + o(sideOp));
        c.div(side.x, L.y + 62, side.w, vOut, TX.value + ";font-size:34px" + o(sideOp));
      }
      c.div(120, 712, 900, key + " &nbsp;" + src, TX.src + o(textOp));
      if (showRow) {
        [children(), returns(), ratio()].forEach(function (sp, k) {
          var x = 120 + k * 420;
          c.svg(S.line(x, 768, x + 360, 768, { stroke: T.rule, opacity: textOp.toFixed(2) }));
          c.div(x, 782, 380, sp[0], TX.value + ";font-size:34px" + o(textOp));
          c.div(x, 826, 380, sp[1], TX.label + ";font-size:11px" + o(textOp));
        });
      }
    } else {
      var tb = c.textBox;
      if (sideOp > 0) {
        c.div(20, 62, 220, lblIn, TX.labelW + ";font-size:10px" + o(sideOp));
        c.div(195, 64, 160, vIn, TX.value + ";font-size:26px;text-align:right" + o(sideOp));
        c.div(20, 512, 220, lblOut, TX.labelW + ";font-size:10px" + o(sideOp));
        c.div(195, 514, 160, vOut, TX.value + ";font-size:26px;text-align:right" + o(sideOp));
      }
      else c.div(20, 64, 335, kicker, TX.label + ";font-size:10px" + o(textOp));
      if (!showRow) {
        if (q < 0.25) {
          c.div(tb.x - 2, tb.y, tb.w, total, TX.giant + ";font-size:52px" + o(textOp));
          c.div(tb.x, tb.y + 60, tb.w, lead, TX.bodySm + o(textOp));
        } else {
          c.div(tb.x, tb.y, tb.w, most, TX.bodySm + ";color:" + T.white + o(textOp));
        }
        c.div(tb.x, tb.y + 166, tb.w, key + " " + src, TX.src + ";font-size:10px" + o(textOp));
      } else {
        c.div(tb.x - 2, tb.y, 200, total, TX.giant + ";font-size:44px" + o(textOp));
        // the year qualifies 117.8M, so the phone end state keeps it (no-motion plate shows every figure)
        c.div(tb.x + 182, tb.y + 4, 161, c.copy("forcibly displaced", "index.html:633") + "<br>" + c.copy("at the end of ", "index.html:633-634") + c.prose("2025", "humanData[3].body", "year of the 117.8M count"), TX.label + ";font-size:10px" + o(textOp));
        [children(), returns(), ratio()].forEach(function (sp, k) {
          var x = tb.x + k * 117;
          c.svg(S.line(x, tb.y + 66, x + 105, tb.y + 66, { stroke: T.rule, opacity: textOp.toFixed(2) }));
          c.div(x, tb.y + 76, 112, sp[0], TX.value + ";font-size:22px" + o(textOp));
          c.div(x, tb.y + 106, 112, sp[1], TX.label + ";font-size:10px;letter-spacing:0.08em" + o(textOp));
        });
        c.div(tb.x, tb.y + 182, tb.w, key + " " + src, TX.src + ";font-size:10px" + o(textOp));
      }
    }

    c.state({
      form: fade > 0 ? "border line becoming a floor" : "border line",
      x: L.x0, y: L.y, w: L.x1 - L.x0, h: 1,
      tone: fade > 0 ? "white, dashed → solid grey" : "white, dashed",
      note: fade > 0 ? "words gone first, marks fading; the old ladder fading in on the same line in grey, exactly as S11 opens"
        : q >= 1 ? cnt.nIn + " marks stay above the line, " + cnt.nOut + " have crossed"
        : q > 0 ? "marks crossing the line, staggered by scroll; the rest do not move"
        : "S09's faint line, now a border; all " + cnt.n + " marks together above it",
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
      { k: "in", p: 0.1, cap: "S09's faint line is now a border. The marks and words have faded in (p 0 to 0.1, no pop-in): all marks sit still, together, above it. 117.8M is a still figure." },
      { k: "mid", p: 0.45, cap: "Scroll moves the people who fled across the line, a few at a time. The rest do not move. The side totals fade in." },
      { k: "out", p: 0.8, cap: "Divided: 68.7M inside, 49.1M across. Every total shown, still: 45M children, 38%, 14.7M went home, 1 in 70." },
      { k: "exit", p: 0.96, cap: "The words go first (p 0.86 to 0.92), then the marks fade (to p 1). The line turns solid and the old ladder fades in on it, in grey, exactly as S11 opens." },
    ],
    alts: [
      { k: "B", label: "589 marks", frames: ["out"], note: "589 = 344 + 245: the fled side rounded down. The main frames draw 590 (each side rounded up, as the live code). Open: audit F07 / BR-23." },
    ],
    draw: build,
    // No-motion plate: divided, every total shown, nothing fading.
    plate: build,
  });
})();
