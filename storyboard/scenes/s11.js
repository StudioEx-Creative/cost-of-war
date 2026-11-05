/* S11 · THE APPEAL · FILL · 1.0 screen · RESTRAINED
   The old ladder returns small, in grey, standing on the line S09 and S10
   left behind. Beside its corner an outline for the $33B appeal fills to
   $12B. The $119B rung sits right beside it at the same true-area scale.
   $33B and $12B are blue; $119B keeps a grey edge (no red in a restrained
   scene). Then all colour drains. No camera, no chrome, no brackets.

   THE LINE (shared with s09.js and s10.js, kept in step by hand):
     desktop: y 530, x 120 → 1320   ·   phone: y 344, x 16 → 359
   Here it is the floor. Every sheet is anchored on it.

   SCALE. Desktop uses §8's table exactly: the frame is the $21.81T fit
   (not drawn), so $2.89T is 524×327, $119B 106×66, $33B 56×35, $12B 34×21.
   Phone: §8's phone scale would make $33B 13×19, too small to read, so
   $2.89T is 189×276 here. All rungs share one scale per frame. */
(function () {
  "use strict";

  var LINE = { desk: { y: 530, x0: 120, x1: 1320 }, phone: { y: 344, x0: 16, x1: 359 } };
  // Scroll plan (p): 0 → 0.1 labels, the empty $33B outline and its figure
  // fade in on the ladder S10 left (no pop-in) · 0.12 → 0.7 the fill rises
  // · 0.7 → 0.82 held, the note · 0.82 → 0.9 all colour drains (a slow
  // cross-fade, blue to grey) · 0.9 → 1 the grey fades to the black S12
  // opens on.
  var A1 = 0.1, F0 = 0.12, F1 = 0.7, D0 = 0.82, D1 = 0.9;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  // Shared geometry. scenes/s10.js ladderRungs() draws the same ladder in
  // its exit frame (kept in step by hand).
  function geom(c) {
    var ph = c.phone, L = ph ? LINE.phone : LINE.desk;
    if (!ph) {
      return { L: L, fit: SB.get("machineData[3].amtB"), ax: 800, gap: 24, gapB: 18,
        box: { x: 800, y: L.y - 900, w: 1440, h: 900 }, aBox: function (xr) { return { x: xr - 1440, y: L.y - 900, w: 1440, h: 900 }; } };
    }
    var H = 276, W = H * (343 / 500);
    return { L: L, fit: SB.get("DEFENCE"), ax: 109, gap: 12, gapB: 12,
      box: { x: 109, y: L.y - H, w: W, h: H }, aBox: function (xr) { return { x: xr - W, y: L.y - H, w: W, h: H }; } };
  }

  function build(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone;
    var altB = c.alt === "B";
    var p = c.plate ? D0 : c.p;
    var arr = c.plate ? 1 : clamp(p / A1); // labels and the appeal fade in
    var fillT = clamp((p - F0) / (F1 - F0)); // the fill (alt B: the second sheet fading in)
    // Drawn states are the two ends of the drain; between D0 and D1 the live
    // build cross-fades the blue layer out over its grey copy (no frame sits there).
    var drained = !c.plate && p >= D1;
    var black = c.plate ? 0 : clamp((p - D1) / (1 - D1)); // the fade to black
    var g = geom(c), L = g.L;
    var blue = drained ? T.grey : T.blue;
    var blueTxt = drained ? T.soft : T.blue;
    var full = fillT >= 1;
    var o = function (v) { return ";opacity:" + (+v).toFixed(2); };
    var gA = function (s, v) { return '<g opacity="' + (+v).toFixed(2) + '">' + s + "</g>"; };

    // ── the old ladder: small, grey, true area, anchored on the line
    var r289 = c.rung("DEFENCE", g.fit, g.box, "bl");
    var r954 = c.rung("topSpenders[0].amt", g.fit, g.box, "bl");
    var r119 = c.rung("machineData[1].amtB", g.fit, g.box, "bl");
    var r40 = c.rung("issueData[0].cost", g.fit, g.box, "bl");
    var ladOp = drained ? 0.5 : 0.7;
    var lad = "";
    [r289, r954].forEach(function (r) {
      lad += S.rect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, { fill: "none", stroke: T.grey, "stroke-width": 1, opacity: ladOp });
    });
    // $119B: still a war figure: paper with a firmer grey edge. No red.
    lad += S.sheet(r119.x, r119.y, r119.w, r119.h, { tone: "grey", mode: "edge", sw: 1.5, opacity: drained ? 0.7 : 1 });
    lad += S.rect(r40.x + 0.5, r40.y + 0.5, r40.w - 1, r40.h - 1, { fill: "none", stroke: T.grey, "stroke-width": 1, opacity: ladOp });
    c.svg(lad);

    // ── the appeal: $33B (2026 ask), anchored on the line beside the ladder's corner
    var x33r = g.ax - g.gap;
    var r33 = c.rung("displacedStats.appeal", g.fit, g.aBox(x33r), "br");
    var r12 = null;
    if (!altB) {
      // an outline that fills to $12B (2025 received): a level across its full width, so the filled area is $12B at true area
      c.svg(gA(S.sheet(r33.x, r33.y, r33.w, r33.h, { tone: drained ? "grey" : "blue", mode: "outline", sw: 1.5 }), arr));
      var v12 = SB.get("displacedStats.received2025"), v33 = SB.get("displacedStats.appeal");
      var hFull = (r33.h * v12) / v33, hNow = hFull * fillT;
      if (hNow > 0.5) c.svg(S.rect(r33.x, r33.y + r33.h - hNow, r33.w, hNow, { fill: blue, opacity: drained ? 0.55 : 0.92 }));
      if (fillT > 0 && fillT < 1) c.svg(S.line(r33.x - 6, r33.y + r33.h - hNow, r33.x + r33.w + 6, r33.y + r33.h - hNow, { stroke: T.white, opacity: 0.8 }));
      var trueA = (g.box.w * g.box.h * v12) / g.fit;
      c.log.rungs.push({ path: "displacedStats.received2025 (fill level in the $33B outline)", value: v12, w: r33.w, h: hFull, err: (r33.w * hFull) / trueA - 1 });
    } else {
      // Alt B: two separate sheets, each with its year. No fill.
      c.svg(gA(S.sheet(r33.x, r33.y, r33.w, r33.h, { tone: drained ? "grey" : "blue", mode: "edge", sw: 1.5 }), arr));
      r12 = c.rung("displacedStats.received2025", g.fit, g.aBox(r33.x - g.gapB), "br");
      c.svg(S.sheet(r12.x, r12.y, r12.w, r12.h, { tone: drained ? "grey" : "blue", mode: "edge", sw: 1.5, opacity: fillT.toFixed(2) }));
      var tagSt = TX.src + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0.04em";
      var tw = ph ? 34 : 50;
      c.div(r33.x, r33.y - (ph ? 15 : 19), tw, c.copy("2026", "index.html:667 (‘UN humanitarian appeal 2026’)"), tagSt + o(arr));
      // the 2025 tag sits right-aligned over its sheet so the two tags never touch
      if (fillT > 0) c.div(r12.x + r12.w - tw, r12.y - (ph ? 15 : 19), tw, c.copy("2025", "index.html:679 (‘What 2025's appeal received’)"), tagSt + ";text-align:right" + o(fillT));
    }
    // the floor: the same line, now solid
    c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, opacity: 0.32 }));

    // ── figures and copy
    var f33 = c.fig("displacedStats.appeal", "B");
    var f12 = c.fig("displacedStats.received2025", "B");
    var f119 = c.fig("machineData[1].amtB", "B");
    var l33 = c.copy("UN humanitarian appeal 2026", "index.html:667");
    var u33 = c.copy("asked", "index.html:667");
    var l12 = c.copy("What 2025's appeal received", "index.html:679");
    var u12 = c.copy("lowest in a decade", "index.html:680");
    var l119 = c.copy("2025 nuclear weapons spending, for scale", "index.html:692");
    var kicker = c.copy("Humanitarian funding: what was asked, what arrived", "index.html:663");
    // $12B is named once the fill (alt B: the fade-in) is complete. A part-faded
    // blue figure would read as deep blue, which may never carry a live figure.
    var show12 = full;
    var op12 = 1;
    function note() {
      var b = '<b style="color:' + T.white + ';font-weight:600">';
      return c.copy("The world's entire humanitarian system received ", "index.html:703") +
        b + "$" + c.fig("displacedStats.received2025", "raw") + c.copy(" billion", "index.html:704") + "</b>" +
        c.copy(" last year, while ", "index.html:704") + c.prose("nine", "machineData[1].sum") + c.copy(" countries spent ", "index.html:704") +
        b + "$" + c.fig("machineData[1].amtB", "raw") + c.copy(" billion", "index.html:705") + "</b>" +
        c.copy(" maintaining nuclear weapons.", "index.html:705");
    }
    function held(size) {
      c.flag("copy", "‘Reaching all 240 million people in need costs about four months of nuclear-arsenal budgets’ (index.html:705-707) is not supportable (open decision 5, audit F23 / 15.5): ‘four months’ is a derived figure with no data.js home, and the $33B ask targets 135M people (displacedStats.targetPeople), not 240M. Shown struck. Not approved.");
      return '<span style="text-decoration:line-through;text-decoration-color:' + T.grey + '">' +
        c.copy("Reaching all ", "index.html:705") + c.fig("displacedStats.inNeed", "Mword") +
        c.copy(" people in need costs about ", "index.html:705-706") + c.missing("four months", "not in data.js; derived from nuclear spending (open decision 5)") +
        c.copy(" of nuclear-arsenal budgets.", "index.html:706-707") + "</span>" +
        '<div style="' + TX.src + ";font-size:" + size + "px;margin-top:8px;color:" + T.grey + '">' +
        c.label("HELD · OPEN DECISION 5 · NOT APPROVED", "storyboard annotation, not site copy") + "</div>";
    }

    if (!ph) {
      // ladder labels: inside the two big rungs; $40B by a leader into the empty $954B rung
      var nm = TX.label + ";font-size:11px";
      var lblOp = (ladOp / 0.7) * arr;
      c.div(r289.x + 14, r289.y + 12, 480, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("DEFENCE", "T") + "</span>&nbsp; " + c.fig("machineData[0].name", "raw"), nm + o(lblOp));
      c.div(r954.x + 14, r954.y + 12, 280, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("topSpenders[0].amt", "B") + "</span>&nbsp; " + c.fig("topSpenders[0].name", "raw"), nm + o(lblOp));
      var lx = r119.x + r119.w + 30, ly = r119.y - 24;
      c.svg(gA(S.leader([[r40.x + r40.w, r40.y], [lx - 14, ly], [lx, ly]], { anchor: T.grey }), arr));
      c.div(lx + 8, ly - 10, 200, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("issueData[0].cost", "B") + "</span>&nbsp; " + c.fig("issueData[0].name", "raw"), nm + o(lblOp));

      // the appeal: spec figure above its outline, joined by a short leader
      var ar = r33.x + r33.w, sy = L.y - 168;
      c.svg(gA(S.line(ar - 300, sy, ar, sy, { stroke: T.rule }), arr));
      c.div(ar - 330, sy + 12, 330, l33, TX.label + ";text-align:right" + o(arr));
      c.div(ar - 330, sy + 36, 330, f33 + ' <span style="' + TX.label + '">' + u33 + "</span>", TX.value + ";font-size:44px;text-align:right;color:" + blueTxt + o(arr));
      var lxa = r33.x + r33.w * 0.78;
      c.svg(gA(S.leader([[lxa, r33.y], [lxa, sy + 96]], { anchor: blue }), arr));
      // under the floor: $12B under the appeal (alt B: under its own sheet)
      if (show12) {
        var ar12 = altB ? r12.x + r12.w : ar;
        c.div(ar12 - 360, L.y + 22, 360, l12, TX.label + ";text-align:right" + o(op12));
        c.div(ar12 - 360, L.y + 46, 360, f12 + ' <span style="' + TX.label + '">' + u12 + "</span>", TX.value + ";font-size:44px;text-align:right;color:" + blueTxt + o(op12));
      }
      // $119B: its spec figure under the floor, tied to its own rung by a
      // leader that starts inside the rung (clear of the $40B rung), so it
      // cannot be read as a label for the whole ladder.
      var ax119 = r40.x + r40.w + (r119.x + r119.w - r40.x - r40.w) / 2, ay119 = r40.y + r40.h * 0.55;
      var lx119 = r119.x + r119.w + 26, ly119 = L.y + 30;
      c.svg(gA(S.leader([[ax119, ay119], [ax119, ly119], [lx119 - 6, ly119]], { anchor: T.grey }), arr));
      c.div(lx119, L.y + 22, 420, l119, TX.label + o(arr));
      c.div(lx119, L.y + 46, 300, f119, TX.value + ";font-size:44px" + o(arr));
      // text column
      c.div(120, r289.y, 470, kicker, TX.label + o(arr));
      if (full) {
        c.div(120, r289.y + 40, 380, note(), TX.body + ";font-size:18px");
        c.div(120, r289.y + 186, 330, held(11), TX.bodySm + ";font-size:15px;color:" + T.grey);
      }
    } else {
      // ladder labels in place; $40B by a short leader into the $954B rung
      var nmP = TX.src + ";font-size:10px;color:" + T.soft;
      var lblOpP = (ladOp / 0.7) * arr;
      c.div(r289.x + 6, r289.y + 6, 120, c.fig("DEFENCE", "T"), nmP + o(lblOpP));
      c.div(r954.x + 6, r954.y + 6, 90, c.fig("topSpenders[0].amt", "B"), nmP + o(lblOpP));
      var plx = r119.x + r119.w + 14, ply = r119.y - 14;
      c.svg(gA(S.leader([[r40.x + r40.w, r40.y], [plx - 8, ply], [plx, ply]], { anchor: T.grey }), arr));
      c.div(plx + 4, ply - 7, 60, c.fig("issueData[0].cost", "B"), nmP + o(lblOpP));
      // a stacked label rail under the floor (no leaders on phone)
      var rows = [
        { sw: "outline", v: f33, l: l33 + " · " + u33, col: blueTxt, op: arr },
        { sw: altB ? "edge" : "fill", v: f12, l: l12 + " · " + u12, col: blueTxt, op: show12 ? op12 : 0 },
        { sw: "grey", v: f119, l: l119, col: T.white, op: arr },
      ];
      rows.forEach(function (rw, k) {
        if (rw.op <= 0) return;
        var y = L.y + 16 + k * 48;
        var sw = rw.sw === "fill" ? S.sheet(16, y + 5, 16, 12, { tone: drained ? "grey" : "blue", mode: "outline", sw: 1.2 }) + S.rect(16, y + 12, 16, 5, { fill: blue })
          : rw.sw === "grey" ? S.sheet(16, y + 5, 16, 12, { tone: "grey", mode: "edge", sw: 1.2 })
          : S.sheet(16, y + 5, 16, 12, { tone: drained ? "grey" : "blue", mode: rw.sw === "edge" ? "edge" : "outline", sw: 1.2 });
        c.svg('<g opacity="' + rw.op.toFixed(2) + '">' + sw + "</g>");
        c.div(40, y, 66, rw.v, TX.value + ";font-size:20px;color:" + rw.col + o(rw.op));
        c.div(112, y + 2, 247, rw.l, TX.label + ";font-size:10px;letter-spacing:0.08em" + o(rw.op));
      });
      var tb = c.textBox;
      if (!full) {
        c.div(tb.x, tb.y, tb.w, kicker, TX.bodySm + ";color:" + T.white + o(arr));
      } else {
        c.div(tb.x, tb.y, tb.w, note(), TX.bodySm);
        if (c.plate) c.div(tb.x, tb.y + 112, tb.w, held(10), TX.bodySm + ";font-size:14px;color:" + T.grey);
      }
    }

    // ── the fade to black: a ground-coloured veil over every layer (no cut into S12)
    if (black > 0) c.uiDiv(0, 0, c.W, "", "height:" + c.H + "px;background:" + T.ground + o(black));

    // ── notes
    c.state({
      form: altB ? "ladder (small) + two appeal sheets, on the floor line" : "ladder (small) + appeal outline, on the floor line",
      x: Math.round(Math.min(r33.x, r12 ? r12.x : r33.x)), y: Math.round(r289.y),
      w: Math.round(r289.x + r289.w - Math.min(r33.x, r12 ? r12.x : r33.x)), h: Math.round(r289.h),
      tone: drained ? "all grey: colour drained" : "ladder grey, $119B grey edge, appeal blue",
      note: black > 0 ? "colour drained; the grey is fading to black (" + Math.round(black * 100) + "% of the way), so S12 opens on black with no cut"
        : drained ? "colour drained: the appeal is the same grey as the ladder; next, the grey fades to black"
        : fillT <= 0 && arr < 1 ? "labels and the empty $33B outline fading in on the ladder S10 left"
        : altB ? (fillT >= 1 ? "$33B (2026) and $12B (2025) side by side, no fill" : fillT > 0 ? "$12B sheet fading in beside $33B" : "$33B sheet alone beside $119B")
        : fillT >= 1 ? "$33B outline filled to the $12B level" : fillT > 0 ? "fill rising inside the $33B outline; no number runs" : "empty $33B outline beside the $119B rung",
    });
    c.flag("decision", "The old ladder returns all grey, $40B included (it was blue in S02), so blue means only the appeal here. $119B keeps a grey edge on paper, not red (restrained scene). Confirm both.");
    if (!altB) c.flag("decision", "Open decision 5 + audit F13/F02: the fill sets the 2026 ask ($33B) against what the 2025 appeal received ($12B), so it reads as the 2026 appeal being part-funded, which no source says. Alt B (recommended): two separate sheets with year labels, no fill.");
    if (full || c.plate) c.flag("copy", "‘The world's entire humanitarian system received $12 billion’ overstates: data.js and DATA-SOURCES define $12B as what the 2025 UN appeal received. Suggest ‘the UN's appeal received’. Needs approval.");
    c.flag("data", "The years in the labels (2026 ask, 2025 received, 2025 nuclear) are existing page copy (index.html:667, :679, :692). data.js holds them only in a field name (received2025) and comments.");
    c.flag("copy", "Kicker ‘what was asked, what arrived’ (index.html:663) pairs the 2026 ask with 2025 receipts: the same year mix as the fill. Fix with open decision 5.");
  }

  SB.scene({
    order: 11,
    id: "S11",
    name: "The Appeal",
    move: "FILL",
    screens: 1.0,
    restrained: true,
    anchor: null,
    trigger: "S10's marks have faded; the old ladder is left standing on the line. No live id (the gap-box has none).",
    camera: "None. The ladder sits small and still; only the fill moves.",
    reason:
      "All colour drains: the blue of what was asked goes the same grey as what war spends, then to black. The money story ends here, so S12 can begin with what cannot be counted in dollars.",
    frames: [
      { k: "in", p: 0.1, cap: "The old ladder S10 left is standing on the line, small and grey. Its labels, an empty blue outline beside its corner (the $33B appeal) and the $119B figure, tied to its rung, have faded in (p 0 to 0.1)." },
      { k: "mid", p: 0.4, cap: "The outline fills from the floor. No number runs; only the level rises." },
      { k: "full", p: 0.75, cap: "Filled to $12B, at true area. The existing note; the ‘four months’ line held as struck." },
      { k: "out", p: 0.9, cap: "All colour drains (a slow cross-fade, p 0.82 to 0.9): the blue of the appeal goes the same grey as the ladder." },
      { k: "fade", p: 0.96, cap: "Then the grey fades slowly to black (p 0.9 to 1). S12 opens on that black, so there is no cut." },
    ],
    alts: [
      { k: "B", label: "Two sheets, no fill (recommended)", frames: ["mid", "full", "out"], note: "Open decision 5 + audit F13/F02: $33B is the 2026 ask, $12B is what the 2025 appeal received. Two separate true-area sheets, each with its year, so nothing reads as part-funded. The move becomes a fade-in, not a fill. Same exit as the main frames (drain, then fade to black)." },
    ],
    draw: build,
    // No-motion plate: the filled state in colour, every figure, the held line.
    plate: build,
  });
})();
