/* S11 · THE APPEAL · FILL · 1.0 screen · RESTRAINED
   The old ladder returns small, in grey, standing on the line S09 and S10
   left behind. Beside its corner an outline for the $33B appeal fills to
   $12B. The $119B rung sits right beside it at the same true-area scale.
   $33B and $12B are blue; $119B keeps a grey edge (no red in a restrained
   scene). Then all colour drains. No camera, no chrome, no brackets.

   ART DIRECTION (restrained: stillness, space, scale and light only).
   The old ladder is a stack of small paper sheets lying in shadow: dark
   paper, thin grey edges, its labels dim. One soft light falls beside it,
   on the appeal: the blue sheet is the only colour in the frame and the
   only thing lit. The drain to grey is that light going out; then the grey
   goes to black.

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
  // Scroll plan (p): 0 → 0.1 labels, the empty $33B outline, its figure and
  // the light on it fade in on the ladder S10 left (no pop-in) · 0.12 → 0.7
  // the fill rises · 0.7 → 0.82 held, the note · 0.82 → 0.9 all colour
  // drains as the light goes out (a slow cross-fade, blue to grey) · 0.9 → 1
  // the grey fades to the black S12 opens on.
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

  // ── light. Neutral white at very low alpha, no tint (the restrained scenes
  // get no atmosphere from the framework). Same lamp language as s09.js / s10.js.
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

  // The sheets' soft shadow. Same offset and blur as the framework's
  // sheetShadow, but its region is the whole frame: sheetShadow's region is
  // relative to the sheet, so under these small sheets it cut a hard-edged
  // box out of the blur, right in the light on the floor. The shadow goes
  // towards the ground colour. scenes/s10.js uses the same (kept in step by hand).
  var SHADOW = "s11-shadow";
  function shadowDefs(T, W, H) {
    return '<defs><filter id="' + SHADOW + '" filterUnits="userSpaceOnUse" x="0" y="0" width="' + W + '" height="' + H + '">' +
      '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="' + T.ground + '" flood-opacity="0.75"/></filter></defs>';
  }

  // The old ladder as small paper sheets lying in shadow, largest first so
  // each smaller sheet lies on the one behind it. scenes/s10.js ladderSvg()
  // draws it the same way in its exit frame (kept in step by hand).
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
  // A small lit sheet: paper, a coloured edge, its top edge catching the light.
  function litSheet(S, T, r, tone, catchA) {
    return S.rect(r.x, r.y, r.w, r.h, { fill: "url(#paper)", filter: "url(#" + SHADOW + ")" }) +
      S.sheet(r.x, r.y, r.w, r.h, { tone: tone, mode: "edge", sw: 1.5, flat: true }) +
      S.rect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, { fill: T.white, opacity: (catchA * 0.22).toFixed(3) }) +
      S.line(r.x + 1.5, r.y + 2, r.x + r.w - 1.5, r.y + 2, { stroke: T.white, opacity: catchA.toFixed(3) });
  }

  function build(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone;
    var altB = c.alt === "B";
    var p = c.plate ? D0 : c.p;
    var arr = c.plate ? 1 : clamp(p / A1); // labels, the appeal and its light fade in
    var fillT = clamp((p - F0) / (F1 - F0)); // the fill (alt B: the second sheet fading in)
    // Drawn states are the two ends of the drain; between D0 and D1 the live
    // build cross-fades the blue layer and the light out (no frame sits there).
    var drained = !c.plate && p >= D1;
    var black = c.plate ? 0 : clamp((p - D1) / (1 - D1)); // the fade to black
    var g = geom(c), L = g.L;
    var blue = drained ? T.grey : T.blue;
    var blueTxt = drained ? T.grey : T.blue;
    var capTxt = drained ? T.grey : T.soft; // the appeal's labels, lit while the light is on
    var words = drained ? 0.72 : 1; // with the light out, the words dim too
    var full = fillT >= 1;
    var light = drained ? 0 : arr; // the one light: up with the appeal, out with the drain
    var o = function (v) { return ";opacity:" + (+v).toFixed(2); };
    var gA = function (s, v) { return '<g opacity="' + (+v).toFixed(2) + '">' + s + "</g>"; };

    // ── the old ladder: small paper sheets in shadow, true area, anchored on the line
    var r289 = c.rung("DEFENCE", g.fit, g.box, "bl");
    var r954 = c.rung("topSpenders[0].amt", g.fit, g.box, "bl");
    var r119 = c.rung("machineData[1].amtB", g.fit, g.box, "bl");
    var r40 = c.rung("issueData[0].cost", g.fit, g.box, "bl");
    var ladDim = drained ? 0.7 : 1;

    // ── the appeal: $33B (2026 ask), anchored on the line beside the ladder's corner
    var x33r = g.ax - g.gap;
    var r33 = c.rung("displacedStats.appeal", g.fit, g.aBox(x33r), "br");
    var r12 = altB ? c.rung("displacedStats.received2025", g.fit, g.aBox(r33.x - g.gapB), "br") : null;

    // ── the light, falling on the appeal (both sheets in alt B), resting on the floor
    var lx = altB ? (r12.x + r33.x + r33.w) / 2 : r33.x + r33.w / 2;
    var lt = ph ? { rx: 150, ry: 46, a: 0.14, arx: 120, ary: 210, aa: 0.065, ady: 120 }
      : { rx: 380, ry: 96, a: 0.14, arx: 300, ary: 380, aa: 0.06, ady: 200 };
    if (light > 0) c.bgSvg(gA(pool(T.white, "s11-air", lx, L.y - lt.ady, lt.arx, lt.ary, lt.aa) +
      pool(T.white, "s11-pool", lx, L.y + 4, lt.rx, lt.ry, lt.a), light));

    c.svg(shadowDefs(T, c.W, c.H));
    c.svg(ladderSvg(S, T, [r289, r954, r119, r40], ladDim));
    var fillMark = null;
    if (!altB) {
      // a paper sheet with a blue edge that fills to $12B (2025 received): a level
      // across its full width, so the filled area is $12B at true area
      c.svg(gA(litSheet(S, T, r33, drained ? "grey" : "blue", 0.3 * light), arr));
      var v12 = SB.get("displacedStats.received2025"), v33 = SB.get("displacedStats.appeal");
      var hFull = (r33.h * v12) / v33, hNow = hFull * fillT;
      if (hNow > 0.5) c.svg(S.rect(r33.x, r33.y + r33.h - hNow, r33.w, hNow, { fill: blue, opacity: drained ? 0.55 : 0.92 }));
      if (fillT > 0 && fillT < 1) fillMark = r33.y + r33.h - hNow;
      var trueA = (g.box.w * g.box.h * v12) / g.fit;
      c.log.rungs.push({ path: "displacedStats.received2025 (fill level in the $33B outline)", value: v12, w: r33.w, h: hFull, err: (r33.w * hFull) / trueA - 1 });
    } else {
      // Alt B: two separate lit sheets, each with its year. No fill.
      c.svg(gA(litSheet(S, T, r33, drained ? "grey" : "blue", 0.3 * light), arr));
      c.svg(gA(litSheet(S, T, r12, drained ? "grey" : "blue", 0.3 * light), fillT));
      var tagSt = TX.src + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0.04em";
      var tw = ph ? 34 : 50;
      c.div(r33.x, r33.y - (ph ? 15 : 19), tw, c.copy("2026", "index.html:667 (‘UN humanitarian appeal 2026’)"), tagSt + o(arr));
      // the 2025 tag sits right-aligned over its sheet so the two tags never touch
      if (fillT > 0) c.div(r12.x + r12.w - tw, r12.y - (ph ? 15 : 19), tw, c.copy("2025", "index.html:679 (‘What 2025's appeal received’)"), tagSt + ";text-align:right" + o(fillT));
    }
    // the floor: the same line, now solid, catching the light by the appeal
    c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, opacity: 0.32 }));
    if (light > 0) c.svg(gA(glint(T.white, "s11-glint", L.x0, L.x1, L.y, lx, ph ? 110 : 300, 0.7, 1), light));
    // the rising level, while the fill moves
    if (fillMark != null) c.svg(S.line(r33.x - 6, fillMark, r33.x + r33.w + 6, fillMark, { stroke: T.white, opacity: 0.8 }));

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
    // labels in the shadow of the ladder: dim, still legible
    var shade = (drained ? 0.55 : 0.78) * arr;

    if (!ph) {
      // ladder labels: inside the two big sheets; $40B by a leader into the empty $954B sheet
      var nm = TX.label + ";font-size:11px";
      c.div(r289.x + 14, r289.y + 12, 480, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("DEFENCE", "T") + "</span>&nbsp; " + c.fig("machineData[0].name", "raw"), nm + o(shade));
      c.div(r954.x + 14, r954.y + 12, 280, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("topSpenders[0].amt", "B") + "</span>&nbsp; " + c.fig("topSpenders[0].name", "raw"), nm + o(shade));
      var lx40 = r119.x + r119.w + 30, ly40 = r119.y - 24;
      c.svg(gA(S.leader([[r40.x + r40.w, r40.y], [lx40 - 14, ly40], [lx40, ly40]], { anchor: T.grey, color: "rgba(255,255,255,0.4)" }), shade));
      c.div(lx40 + 8, ly40 - 10, 200, '<span style="' + TX.value + ";font-size:16px;color:" + T.soft + '">' + c.fig("issueData[0].cost", "B") + "</span>&nbsp; " + c.fig("issueData[0].name", "raw"), nm + o(shade));

      // the appeal: lit, the frame's one subject. Its figure stands above it in the
      // light, tied to the sheet by one hairline.
      var ar = altB ? r33.x + r33.w : r33.x + r33.w, sy = L.y - 168;
      c.div(ar - 360, sy + 12, 360, l33, TX.label + ";text-align:right;color:" + capTxt + o(arr * words));
      c.div(ar - 360, sy + 36, 360, f33 + ' <span style="' + TX.label + '">' + u33 + "</span>", TX.value + ";font-size:48px;text-align:right;color:" + blueTxt + o(arr * words));
      var lxa = r33.x + r33.w * 0.78;
      c.svg(gA(S.leader([[lxa, r33.y], [lxa, sy + 98]], { anchor: blue, color: "rgba(255,255,255,0.45)" }), arr));
      // under the floor: $12B under the appeal (alt B: under its own sheet)
      if (show12) {
        var ar12 = altB ? r12.x + r12.w : ar;
        c.div(ar12 - 360, L.y + 22, 360, l12, TX.label + ";text-align:right;color:" + capTxt + o(words));
        c.div(ar12 - 360, L.y + 46, 360, f12 + ' <span style="' + TX.label + '">' + u12 + "</span>", TX.value + ";font-size:48px;text-align:right;color:" + blueTxt + o(words));
      }
      // $119B: in the ladder's shadow, its figure under the floor, tied to its own
      // sheet by a leader that starts inside the sheet (clear of the $40B sheet),
      // so it cannot be read as a label for the whole ladder.
      var ax119 = r40.x + r40.w + (r119.x + r119.w - r40.x - r40.w) / 2, ay119 = r40.y + r40.h * 0.55;
      var lx119 = r119.x + r119.w + 26, ly119 = L.y + 30;
      c.svg(gA(S.leader([[ax119, ay119], [ax119, ly119], [lx119 - 6, ly119]], { anchor: T.grey, color: "rgba(255,255,255,0.4)" }), arr));
      c.div(lx119, L.y + 22, 420, l119, TX.label + o(arr * words));
      c.div(lx119, L.y + 46, 300, f119, TX.value + ";font-size:36px;color:" + capTxt + o(arr * words));
      // the words, far left in the dark, level with the top of the ladder
      c.div(120, r289.y, 470, kicker, TX.label + o(arr * words));
      if (full) {
        c.div(120, r289.y + 40, 380, note(), TX.body + ";font-size:18px" + o(words));
        c.div(120, r289.y + 186, 380, held(11), TX.body + ";font-size:18px;color:" + T.grey + o(words));
      }
    } else {
      // ladder labels in place, dim; $40B by a short leader into the $954B sheet
      var nmP = TX.src + ";font-size:10px;color:" + T.soft;
      c.div(r289.x + 6, r289.y + 6, 120, c.fig("DEFENCE", "T"), nmP + o(shade));
      c.div(r954.x + 6, r954.y + 6, 90, c.fig("topSpenders[0].amt", "B"), nmP + o(shade));
      var plx = r119.x + r119.w + 14, ply = r119.y - 14;
      c.svg(gA(S.leader([[r40.x + r40.w, r40.y], [plx - 8, ply], [plx, ply]], { anchor: T.grey, color: "rgba(255,255,255,0.4)" }), shade));
      c.div(plx + 4, ply - 7, 60, c.fig("issueData[0].cost", "B"), nmP + o(shade));
      // captions under the floor, each under its own sheet: the appeal's on the
      // left in blue, $119B on the right in the ladder's shadow
      var cy0 = L.y + 18;
      c.div(16, cy0, 150, f33, TX.value + ";font-size:26px;color:" + blueTxt + o(arr * words));
      c.div(16, cy0 + 32, 160, l33 + " · " + u33, TX.label + ";font-size:10px;letter-spacing:0.08em;color:" + capTxt + o(arr * words));
      if (show12) {
        c.div(16, cy0 + 82, 150, f12, TX.value + ";font-size:26px;color:" + blueTxt + o(words));
        c.div(16, cy0 + 114, 160, l12 + " · " + u12, TX.label + ";font-size:10px;letter-spacing:0.08em;color:" + capTxt + o(words));
      }
      var ax = r119.x + r119.w * 0.62, ay = r119.y + r119.h * 0.62, cx119 = 206;
      c.svg(gA(S.leader([[ax, ay], [ax, cy0 + 13], [cx119 - 6, cy0 + 13]], { anchor: T.grey, color: "rgba(255,255,255,0.4)" }), arr));
      c.div(cx119, cy0, 150, f119, TX.value + ";font-size:22px;color:" + capTxt + o(arr * words));
      c.div(cx119, cy0 + 30, 153, l119, TX.label + ";font-size:10px;letter-spacing:0.08em" + o(arr * words));
      var tb = c.textBox;
      if (!full) {
        c.div(tb.x, tb.y, tb.w, kicker, TX.bodySm + ";color:" + T.white + ";text-wrap:balance" + o(arr));
      } else {
        c.div(tb.x, tb.y, tb.w, note(), TX.bodySm + o(words));
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
      tone: drained ? "all grey, the light out: colour drained" : "ladder: dark paper in shadow, $119B firmer grey edge; appeal: blue, the only thing lit",
      note: black > 0 ? "colour drained, the light out; the grey is fading to black (" + Math.round(black * 100) + "% of the way), so S12 opens on black with no cut"
        : drained ? "colour drained as the light went out: the appeal is the same grey as the ladder; next, the grey fades to black"
        : fillT <= 0 && arr < 1 ? "labels, the empty $33B sheet and the light on it fading in beside the ladder S10 left"
        : altB ? (fillT >= 1 ? "$33B (2026) and $12B (2025) side by side in the light, no fill" : fillT > 0 ? "$12B sheet fading in beside $33B, in the light" : "$33B sheet alone in the light beside the ladder")
        : fillT >= 1 ? "$33B sheet filled to the $12B level, in the light" : fillT > 0 ? "fill rising inside the lit $33B sheet; no number runs" : "empty $33B sheet in the light beside the ladder in shadow",
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
    camera: "None. The ladder sits small and still in shadow; only the fill and the one light change.",
    reason:
      "All colour drains: the light on what was asked goes out, and its blue goes the same grey as what war spends, then to black. The money story ends here, so S12 can begin with what cannot be counted in dollars.",
    frames: [
      { k: "in", p: 0.1, cap: "The old ladder S10 left stands on the line, small paper sheets in shadow. One soft light has come up beside it on an empty blue sheet (the $33B appeal); its figure and the $119B figure, tied to its sheet, have faded in (p 0 to 0.1)." },
      { k: "mid", p: 0.4, cap: "The sheet fills from the floor. No number runs; only the level rises, in the light." },
      { k: "full", p: 0.75, cap: "Filled to $12B, at true area. The existing note; the ‘four months’ line held as struck." },
      { k: "out", p: 0.9, cap: "All colour drains as the light goes out (a slow cross-fade, p 0.82 to 0.9): the appeal goes the same grey as the ladder, in the same shadow." },
      { k: "fade", p: 0.96, cap: "Then the grey fades slowly to black (p 0.9 to 1). S12 opens on that black, so there is no cut." },
    ],
    alts: [
      { k: "B", label: "Two sheets, no fill (recommended)", frames: ["mid", "full", "out"], note: "Open decision 5 + audit F13/F02: $33B is the 2026 ask, $12B is what the 2025 appeal received. Two separate true-area sheets, each with its year, so nothing reads as part-funded. The move becomes a fade-in, not a fill. Same exit as the main frames (drain, then fade to black)." },
    ],
    draw: build,
    // No-motion plate: the filled state in colour and in the light, every figure, the held line.
    plate: build,
  });
})();
