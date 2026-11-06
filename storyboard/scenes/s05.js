/* S05 · THE LINE OF PRODUCTION · MORPH + SPLIT · 1.5 screens
   S04's steel plate is cut down its centre line. The two halves become
   two drawing sheets in a split frame: CLEAN ENERGY (the turbine, blue
   line) and MUNITIONS (white line, one red warhead). The turbine folds
   into a munition and the blue drains as the red takes over. The split
   closes into one drawing (FIG. 2), the camera pushes in, and the
   figures land as still spec figures. At the exit the drawing shrinks
   into the top-right corner and its paper re-reads as the $2.89T sheet
   S06 pulls wide from.

   Art direction: a drafting table. S04's plate lies on the table where
   S04 left it (same tilt); the camera rises over it and holds, looking
   down at one lit sheet folded down its centre: the turbine half (blue)
   and the munition half (red warhead) are two halves of the same paper,
   with a second sheet under it. A flat loupe (DETAIL D, DETAIL E) holds a
   3× crop of the warhead, then of the turbine hub as it folds. The push
   flattens the sheet into the frame; the exit lays it square as money.
   Dimensions are fine marginalia carrying letters, never numbers.

   Geometry adapted from index.html:291-518 (#mfMorph, #mfBlueprint).
   Every invented number on the live drawings is replaced by a letter. */
(function () {
  "use strict";

  /* ── S04's plate, rebuilt from the same data so the cut lines up ── */
  var SP = SB.get("topSpenders");
  var BY_GDP = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].gdp - SP[a].gdp; });
  var MAXAMT = Math.max.apply(null, SP.map(function (s) { return s.amt; }));

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  // Scroll timeline inside the scene (one state per range; reverses exactly)
  //   0.00–0.10  the plate splits into two sheets (hard state change at 0)
  //   0.10–0.45  split frame: turbine | munition
  //   0.45–0.65  the fold: turbine → munition, blue → red
  //   0.65       hard cut: the split closes into one drawing
  //   0.65–0.90  push into FIG. 2; spec figures land (still, no count-up)
  //   0.90–1.00  the drawing shrinks into the top-right corner
  function phase(p) {
    if (p < 0.1) return "split";
    if (p < 0.45) return "panels";
    if (p < 0.65) return "fold";
    if (p < 0.9) return "push";
    return "exit";
  }

  /* ── SVG bits in drawing units (scaled groups, hairline strokes) ── */
  function grp(m, inner) {
    return '<g transform="translate(' + m.ox + " " + m.oy + ") scale(" + m.s + ')">' + inner + "</g>";
  }
  function P(d, o) {
    o = o || {};
    return '<path d="' + d + '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || "none") +
      '" stroke-width="' + (o.sw || 1) + '" vector-effect="non-scaling-stroke" stroke-linejoin="round"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.tf ? ' transform="' + o.tf + '"' : "") + (o.rule ? ' fill-rule="' + o.rule + '"' : "") + "/>";
  }
  function E(a, o) {
    o = o || {};
    return '<ellipse cx="' + a[0] + '" cy="' + a[1] + '" rx="' + a[2] + '" ry="' + a[3] + '" fill="' + (o.fill || "none") +
      '" stroke="' + (o.stroke || "none") + '" stroke-width="' + (o.sw || 1) + '" vector-effect="non-scaling-stroke"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") + "/>";
  }
  function map(ox, oy, s) {
    return { ox: ox, oy: oy, s: s, x: function (v) { return ox + v * s; }, y: function (v) { return oy + v * s; } };
  }

  /* FIG. 1a · turbine (index.html:303-343, viewBox 200 × 250) */
  var TURB = {
    far: [
      { mast: "M31 234 L34.2 179 L35.8 179 L39 234 Z", ground: [35, 234, 6, 1.7], hub: [35, 179, 2.2, 2.6],
        blades: ["M35 179 L33.2 152 L36.6 153.4 Z", "M35 179 L58 193 L56.4 195.6 Z", "M35 179 L12 194 L13.6 196.6 Z"] },
      { mast: "M164 236 L166.4 190 L167.6 190 L170 236 Z", ground: [167, 236, 5, 1.5], hub: [167, 190, 1.8, 2.1],
        blades: ["M167 190 L165.6 168 L168.4 169.2 Z", "M167 190 L186 201 L184.6 203.2 Z", "M167 190 L148 202 L149.4 204.2 Z"] },
    ],
    mast: "M93.5 240 L97.6 126 L102.4 126 L106.5 240 Z",
    ground: [100, 240, 10, 2.8],
    nacelle: "M92 115.5 L110 112.5 L113 120 L95 123.5 Z",
    blades: ["M96.5 118 L95.4 38 Q100 27 104.4 39 L103 119.5 Z",
      "M102.6 123 L171 160 Q179.5 165.5 170 167.6 L100.4 127 Z",
      "M97.4 123 L29 160 Q20.5 165.5 30 167.6 L99.6 127 Z"],
    hub: [100, 120, 4.6, 5.4],
  };
  /* FIG. 1b · munition (index.html:345-377) */
  var MUN = {
    body: "M87 230 L87 78 Q100 42 113 78 L113 230 Z",
    rings: [[100, 82, 13, 3.6], [100, 124, 13, 3.8], [100, 168, 13, 3.8], [100, 206, 13, 3.8]],
    tail: [100, 230, 13, 4],
    fins: ["M87 202 L62 240 L87 221 Z", "M113 202 L138 240 L113 221 Z"],
    seam: "M100 206 V228",
    tip: "M100 46 V18",
    warhead: "M87 124 L87 78 Q100 42 113 78 L113 124 Z", // the one red mark (WARHEAD leader points here)
    charge: "M87 128 H113 V202 H87 Z", // propellant casing, hatched
  };

  function turbineSvg(c, m, o) {
    var T = c.T, f = o.f || 0, s = "";
    var col = o.col || T.blue, op = o.op != null ? o.op : 1;
    TURB.far.forEach(function (t) {
      var fo = { stroke: T.grey, sw: 1, op: 0.6 * (1 - f) };
      s += P(t.mast, fo) + E(t.ground, fo) + t.blades.map(function (b) { return P(b, fo); }).join("") + E(t.hub, fo);
    });
    var lo = { stroke: col, sw: 1.75, op: op, fill: T.sheet };
    s += P(TURB.mast, lo) + E(TURB.ground, { stroke: col, sw: 1, op: op }) + P(TURB.nacelle, lo);
    var rot = [0, (84 - 29.8) * f, -(150.2 - 96) * f];
    TURB.blades.forEach(function (b, i) {
      var tf = !f ? null : i === 0 ? "translate(0 120) scale(1 " + (1 - 0.72 * f) + ") translate(0 -120)" : "rotate(" + rot[i] + " 100 120)";
      s += P(b, { stroke: col, sw: 1.75, op: op, fill: T.sheet, tf: tf });
    });
    s += E(TURB.hub, lo);
    if (o.dims) {
      var dg = { stroke: T.grey, sw: 1, op: o.dimOp };
      s += P("M108 240 H130", dg) + P("M108 121 H130", dg) + P("M126 123 V238", dg) +
        P("M126 123 L123 130 L129 130 Z", { fill: T.grey, op: o.dimOp }) + P("M126 238 L123 231 L129 231 Z", { fill: T.grey, op: o.dimOp }) +
        P("M110 117 L150 100 L163 100", dg);
    }
    return grp(m, s);
  }
  function munitionSvg(c, m, o) {
    var T = c.T, s = "", op = o.op != null ? o.op : 1;
    if (o.ghost) {
      var gd = { stroke: T.white, sw: 1, dash: "5 4", op: 0.75 };
      s += P(MUN.body, gd) + MUN.fins.map(function (fn) { return P(fn, gd); }).join("");
      MUN.rings.forEach(function (r) { s += E(r, { stroke: T.white, sw: 1, dash: "2 4", op: 0.5 }); });
      if (o.redDash) s += P(MUN.warhead, { stroke: T.red, sw: 2, dash: "6 4" });
      return grp(m, s);
    }
    var L = { stroke: T.white, sw: 1.5, fill: T.sheet, op: op };
    s += P(MUN.body, L);
    s += P(MUN.charge, { fill: "url(#hatch-grey)", op: 0.7 * op });
    MUN.rings.forEach(function (r) { s += E(r, { stroke: T.grey, sw: 1, op: op }); });
    s += E(MUN.tail, { stroke: T.grey, sw: 1, op: op });
    MUN.fins.forEach(function (fn) { s += P(fn, L); });
    s += P(MUN.seam, { stroke: T.grey, op: op }) + P(MUN.tip, { stroke: T.grey, op: op });
    if (o.red) s += P(MUN.warhead, { fill: "url(#hatch-red)" }) + P(MUN.warhead, { stroke: T.red, sw: 2 });
    if (o.dims) {
      var dg = { stroke: T.grey, sw: 1, op: op };
      var ag = { fill: T.grey, op: op };
      s += P("M115 78 H134", dg) + P("M115 230 H134", dg) + P("M130 80 V228", dg) +
        P("M130 80 L127 87 L133 87 Z", ag) + P("M130 228 L127 221 L133 221 Z", ag) +
        P("M87 232 V250", dg) + P("M113 232 V250", dg) + P("M89 246 H111", dg) +
        P("M89 246 L96 243 L96 249 Z", ag) + P("M111 246 L104 243 L104 249 Z", ag) +
        P("M113 96 L150 84 L163 84", dg) + P("M113 150 L150 158 L163 158", dg);
    }
    return grp(m, s);
  }
  // Text on a drawing, placed at a drawing-unit point (screen-space type, so it stays legible).
  function tag(c, m, vx, vy, html, size, o) {
    o = o || {};
    var st = (o.white ? c.TX.labelW : c.TX.label) + ";font-size:" + size + "px;white-space:nowrap" + (o.op != null ? ";opacity:" + o.op : "");
    var x = m.x(vx) - (o.center ? (o.w || 40) / 2 : o.right ? o.w || 80 : 0);
    c.div(x, m.y(vy) - size, o.center || o.right ? o.w || 40 : null, html, st + (o.center ? ";text-align:center" : o.right ? ";text-align:right" : ""));
  }
  function turbineTags(c, m, size, o) {
    o = o || {};
    if (o.fig !== false) tag(c, m, 8, 16, c.copy("FIG. 1a — TURBINE", "index.html:343"), size, { white: true });
    tag(c, m, 165, 103, c.copy("NACELLE", "index.html:342"), size);
    tag(c, m, 132, 186, c.label("A", "dimension letter; replaces 'H 120 M' (index.html:340)"), size + 2, { white: true });
  }
  function munitionTags(c, m, size, o) {
    o = o || {};
    var op = o.op;
    if (o.fig !== false) tag(c, m, 8, 16, c.copy("FIG. 1b — MUNITION", "index.html:377"), size, { white: true, op: op });
    tag(c, m, 165, 87, c.copy("WARHEAD", "index.html:374"), size, { op: op });
    tag(c, m, 165, 161, c.copy("PROPELLANT", "index.html:376"), size, { op: op });
    tag(c, m, 133, 120, c.label("B", "dimension letter; replaces '4.1 M' (index.html:365)"), size + 2, { white: true, op: op });
    tag(c, m, 117, 253, c.label("Ø C", "dimension letter; replaces 'Ø 340' (index.html:371)"), size + 1, { white: true, op: op });
  }

  /* FIG. 2 · side elevation (index.html:399-480, viewBox 360 × 250) */
  var BALLOONS = [
    { n: 1, x: 287, from: 88, y: 40, key: ["1 · NOSE / SEEKER", "index.html:466"] },
    { n: 2, x: 240, from: 116, y: 150, key: ["2 · GUIDANCE", "index.html:467"] },
    { n: 3, x: 158, from: 126, y: 162, key: ["3 · WARHEAD", "index.html:468"] },
    { n: 4, x: 100, from: 116, y: 150, key: ["4 · PROPELLANT", "index.html:469"] },
  ];
  function fig2Svg(c, m, o) {
    var T = c.T, s = "";
    var L = { stroke: T.white, sw: 1.5 }, Th = { stroke: T.grey, sw: 1 }, ag = { fill: T.grey };
    s += P("M30 96 H322", { stroke: T.grey, sw: 1, dash: "14 4 2 4" });
    s += P("M302 96 L272 76 L60 76 L48 82 L48 110 L60 116 L272 116 Z", { fill: T.sheet });
    s += P("M60 76 L40 52 L86 76 Z M60 116 L40 140 L86 116 Z", { fill: T.sheet });
    if (o.red) s += P("M120 76 H186 V116 H120 Z", { fill: "url(#hatch-red)" });
    else s += P("M60 76 H120 V116 H60 Z", { fill: "url(#hatch-grey)", op: 0.5 });
    s += P("M272 76 L302 96 L272 116", L) + P("M272 76 L60 76", L) + P("M272 116 L60 116", L) + P("M60 76 L48 82 L48 110 L60 116", L);
    s += P("M48 82 A5 14 0 0 0 48 110", Th);
    [104, 158, 212].forEach(function (x) { s += P("M" + x + " 76 A5 20 0 0 0 " + x + " 116", Th); });
    [240, 186, 120].forEach(function (x) { s += P("M" + x + " 76 L" + x + " 116", Th); });
    s += P("M60 76 L40 52 L86 76", L) + P("M60 116 L40 140 L86 116", L);
    if (o.red) s += P("M120 76 H186 V116 H120 Z", { stroke: T.red, sw: 2 });
    // dimension · overall length (letter B) and diameter (letter Ø C), as on the munition
    s += P("M48 74 V52", Th) + P("M302 92 V52", Th) + P("M48 56 H302", Th) +
      P("M48 56 L55 53 L55 59 Z", ag) + P("M302 56 L295 53 L295 59 Z", ag);
    s += P("M46 76 H30", Th) + P("M46 116 H30", Th) + P("M34 76 V116", Th) +
      P("M34 76 L31 82 L37 82 Z", ag) + P("M34 116 L31 110 L37 110 Z", ag);
    // section marker A–A
    s += P("M158 66 V126", { stroke: T.white, sw: 1, dash: "10 3 2 3" });
    // balloon leaders
    BALLOONS.forEach(function (b) {
      var end = b.y + (b.y < b.from ? 6 : -6);
      s += P("M" + b.x + " " + b.from + " L" + b.x + " " + end, Th);
    });
    return grp(m, s);
  }
  function fig2Tags(c, m, r, size, o) {
    var T = c.T, S = SB.SVG;
    o = o || {};
    BALLOONS.forEach(function (b) {
      var bx = m.x(b.x), by = m.y(b.y);
      c.svg(S.circle(bx, by, r, { fill: T.sheet, stroke: T.grey, "stroke-width": 1 }));
      c.div(bx - r, by - size * 0.62, r * 2, c.label(String(b.n), "callout balloon number (index.html:449-460)"), c.TX.labelW + ";font-size:" + size + "px;letter-spacing:0;text-align:center;line-height:1.2");
      if (o.names) c.div(bx + r + 8, by - size * 0.66, null, c.copy(b.key[0], b.key[1]), c.TX.label + ";font-size:" + size + "px;white-space:nowrap");
    });
    tag(c, m, 175, 50, c.label("B", "dimension letter; replaces '4 100 MM' (index.html:459)"), size + 2, { white: true, center: true, w: 30 });
    var dia = c.label("Ø C", "dimension letter; replaces 'Ø 340' (index.html:460)");
    if (o.diaBelow) tag(c, m, 12, 134, dia, size + 1, { white: true }); // phone: under the dimension, clear of the border
    else tag(c, m, 21, 100, dia, size + 1, { white: true, center: true, w: 44 });
    tag(c, m, 158, 63, c.copy("A", "index.html:461"), size, { white: true, center: true, w: 20 });
    tag(c, m, 158, 135, c.copy("A", "index.html:462"), size, { white: true, center: true, w: 20 });
  }
  function sectionAA(c, cx, cy, R, size, o) {
    o = o || {};
    var T = c.T, S = SB.SVG, r2 = R * 0.68, r3 = R * 0.26;
    var ring = "M" + (cx - R) + " " + cy + " a" + R + " " + R + " 0 1 0 " + 2 * R + " 0 a" + R + " " + R + " 0 1 0 " + -2 * R + " 0 Z " +
      "M" + (cx - r2) + " " + cy + " a" + r2 + " " + r2 + " 0 1 0 " + 2 * r2 + " 0 a" + r2 + " " + r2 + " 0 1 0 " + -2 * r2 + " 0 Z";
    c.svg(P(ring, { fill: "url(#hatch-grey)", rule: "evenodd" }));
    c.svg(S.circle(cx, cy, R, { fill: "none", stroke: T.white, "stroke-width": 1.5 }));
    c.svg(S.circle(cx, cy, r2, { fill: "none", stroke: T.grey, "stroke-width": 1 }));
    c.svg(S.circle(cx, cy, r3, { fill: "none", stroke: T.grey, "stroke-width": 1 }));
    c.svg(S.line(cx - R - 10, cy, cx + R + 10, cy, { stroke: T.grey, "stroke-dasharray": "8 3 2 3" }));
    c.svg(S.line(cx, cy - R - 10, cx, cy + R + 10, { stroke: T.grey, "stroke-dasharray": "8 3 2 3" }));
    var lbl = c.copy("SECTION A–A", "index.html:463 (scale '2:1' dropped)");
    if (o.chip) c.div(o.chip.x, o.chip.y, null, lbl, c.TX.labelW + ";font-size:" + size + "px;color:" + T.ground + ";white-space:nowrap");
    else c.div(cx - 60, cy + R + 14, 120, lbl, c.TX.label + ";font-size:" + size + "px;text-align:center");
  }

  /* S06's parked drawing (scenes/s06.js, drawing()), repeated here so the hand-over matches it exactly. */
  function parked(x, y, w, S, T, op) {
    var h = w * 0.5, cy = y + h * 0.42, st = { stroke: T.grey, "stroke-width": 1, fill: "none" };
    var bx = x + w * 0.16, bw = w * 0.6, bh = h * 0.26;
    var s = '<g opacity="' + (op == null ? 1 : op) + '">';
    s += S.line(x, cy, x + w, cy, { stroke: T.grey, "stroke-dasharray": "6 3 1 3", opacity: 0.6 });
    s += S.rect(bx, cy - bh / 2, bw, bh, st);
    s += S.path("M" + (bx + bw) + " " + (cy - bh / 2) + " Q" + (x + w * 0.92) + " " + (cy - bh / 2) + " " + (x + w * 0.97) + " " + cy +
      " Q" + (x + w * 0.92) + " " + (cy + bh / 2) + " " + (bx + bw) + " " + (cy + bh / 2), st);
    s += S.path("M" + bx + " " + (cy - bh / 2) + " L" + (x + w * 0.04) + " " + (cy - bh * 1.15) + " L" + (x + w * 0.04) + " " + (cy - bh / 2) +
      " M" + bx + " " + (cy + bh / 2) + " L" + (x + w * 0.04) + " " + (cy + bh * 1.15) + " L" + (x + w * 0.04) + " " + (cy + bh / 2), st);
    for (var i = 1; i < 4; i++) s += S.line(bx + (bw * i) / 4, cy - bh / 2, bx + (bw * i) / 4, cy + bh / 2, { stroke: T.grey, opacity: 0.5 });
    var dy = y + h * 0.9;
    s += S.line(bx, dy, x + w * 0.97, dy, { stroke: T.grey, opacity: 0.7 });
    s += S.line(bx, dy - 4, bx, dy + 4, { stroke: T.grey }) + S.line(x + w * 0.97, dy - 4, x + w * 0.97, dy + 4, { stroke: T.grey });
    return s + "</g>";
  }

  /* Small chevron arrow at (x, y) pointing in direction (dx, dy) */
  function chevron(x, y, dx, dy, n, col) {
    var px = -dy, py = dx;
    return SB.SVG.path("M" + (x - dx * n + px * n * 0.8) + " " + (y - dy * n + py * n * 0.8) + " L" + x + " " + y + " L" + (x - dx * n - px * n * 0.8) + " " + (y - dy * n - py * n * 0.8), { stroke: col, "stroke-width": 1.5 });
  }
  /* Camera push marks: an L tick where a corner of the drawing's border sat at the hard
     cut, and a dashed arrow carrying it out to where it sits now (the frame). */
  function pushMarks(c, list, L) {
    var S = SB.SVG, T = c.T, col = "rgba(255,255,255,0.55)";
    list.forEach(function (mk) {
      var f = mk.f, t = mk.t;
      var sx = Math.sign(f[0] - t[0]), sy = Math.sign(f[1] - t[1]);
      c.svg(S.path("M" + (f[0] + sx * L) + " " + f[1] + " H" + f[0] + " V" + (f[1] + sy * L), { stroke: col, "stroke-width": 1.25 }));
      var len = Math.hypot(t[0] - f[0], t[1] - f[1]), dx = (t[0] - f[0]) / len, dy = (t[1] - f[1]) / len;
      c.svg(S.line(f[0] + dx * 4, f[1] + dy * 4, t[0] - dx * 2, t[1] - dy * 2, { stroke: col, "stroke-dasharray": "3 4" }) + chevron(t[0], t[1], dx, dy, L > 12 ? 8 : 6, T.white));
    });
  }
  function texts(c) {
    return {
      l1: c.copy("The same factories. The same steel, the same engineers.", "index.html:385"),
      l2: c.copy("The only variable is what we choose to build.", "index.html:386"),
      eyebrow: c.copy("THE PRODUCTION LINE", "index.html:293"),
      clean: c.copy("CLEAN ENERGY", "index.html:381"),
      war: c.copy("MUNITIONS", "index.html:382"),
    };
  }
  // The two figures. Kept apart on purpose: different measures, different sources.
  function rev(c) {
    return {
      v: c.missing("$679B", "SIPRI Top 100 arms revenue 2024, source link at index.html:486-489; needs a data.js field"),
      lbl: c.copy("record revenue of the 100 largest arms makers, 2024", "index.html:486"),
      src: c.label("SIPRI TOP 100 ↗"),
    };
  }
  function vol(c) {
    c.flag("data", "+9.2% is globalContext.armsTradeGrowth: growth in the VOLUME of major-arms transfers, 2021–25 vs 2016–20 (machineData[2].sum; DATA-SOURCES.md:15). Not money, not revenue growth. The brief pairs it with $679B (company revenue, 2024): pairing risks a 'revenue grew 9.2%' reading. Here it has its own rule, label and source, sits apart from $679B with the section view between them, and is never drawn as area.");
    // The two periods are figures too: 2021–25 is in machineData[2].sum (prose only);
    // the base period 2016–20 is only in DATA-SOURCES.md:15, so it is shown as missing.
    return {
      v: c.fig("globalContext.armsTradeGrowth", "ppct"),
      lbl: c.newCopy("growth in the volume of major-arms transfers", "replaces 'growth in the global arms trade' (index.html:506) so +9.2% cannot read as money or revenue (audit)") + ", " +
        c.prose("2021–25", "machineData[2].sum", "the period of the +9.2% growth") + " " + c.newCopy("vs", "joins the two periods") + " " +
        c.missing("2016–20", "base period of +9.2% (DATA-SOURCES.md:15); not in data.js — add it beside globalContext.armsTradeGrowth"),
      src: c.label("SIPRI ARMS TRANSFERS 2026 ↗"),
    };
  }
  function dimsFlag(c) {
    c.flag("decision", "Drawing dimensions removed; or exempt as illustrative. The live drawings print invented numbers ('H 120 M', '4.1 M', 'Ø 340', '4 100 MM', 'SCALE 1:40', 'SECTION A–A · 2:1', 'SHT 1/1', 'DWG No. 679-B'). Here every dimension line stays and carries a letter (A, B, Ø C) and the title block reads 'SCALE · NTS' (not to scale). Alternative: approve the numbers as illustrative and exempt them in the acceptance test (audit F20).");
  }

  /* ── Camera helpers: projection through the camera and c.tilt ───── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function projector(c) {
    var t = c._tilt || { rx: 0, ry: 0, rz: 0, persp: 1600 };
    var cam = c._cam || { s: 1, tx: 0, ty: 0 };
    var R = Math.PI / 180, ox = c.W / 2, oy = c.H / 2;
    var cX = Math.cos(t.rx * R), sX = Math.sin(t.rx * R), cY = Math.cos(t.ry * R), sY = Math.sin(t.ry * R), cZ = Math.cos(t.rz * R), sZ = Math.sin(t.rz * R);
    return function (x, y) {
      var X = x * cam.s + cam.tx - ox, Y = y * cam.s + cam.ty - oy;
      var x1 = X * cZ - Y * sZ, y1 = X * sZ + Y * cZ;
      var x2 = x1 * cY, z2 = -x1 * sY;
      var y3 = y1 * cX - z2 * sX, z3 = y1 * sX + z2 * cX;
      var w = 1 - z3 / t.persp;
      return [ox + x2 / w, oy + y3 / w];
    };
  }
  // The Sheet's state as its on-screen footprint after the tilt (camera space), so the
  // overlay's tracking box and the light pool land on what the reader sees.
  function stateOn(c, o, r) {
    var pr = projector(c), cam = c._cam || { s: 1, tx: 0, ty: 0 };
    var pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].map(function (q) { return pr(q[0], q[1]); });
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys), x1 = Math.max.apply(null, xs), y1 = Math.max.apply(null, ys);
    o.x = Math.round((x0 - cam.tx) / cam.s);
    o.y = Math.round((y0 - cam.ty) / cam.s);
    o.w = Math.round((x1 - x0) / cam.s);
    o.h = Math.round((y1 - y0) / cam.s);
    if (c._tilt) o.note = (o.note ? o.note + "; " : "") + "rect = on-screen footprint after the tilt";
    c.state(o);
  }
  // Hatches for a drawing group scaled by s: the hatch keeps a fine screen-size line.
  function hatchDefs(id, s) {
    return "<defs>" + ["red", "grey"].map(function (t) {
      return '<pattern id="' + id + "-" + t + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(' + (1 / s).toFixed(4) + ') rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="' + (t === "red" ? SB.T.red : SB.T.grey) + '" stroke-width="1" stroke-opacity="0.6"/></pattern>';
    }).join("") + "</defs>";
  }
  function fineHatch(svg, id) { return svg.replace(/#hatch-red/g, "#" + id + "-red").replace(/#hatch-grey/g, "#" + id + "-grey"); }
  function stop5(o, col, a) { return '<stop offset="' + o + '" stop-color="' + col + '" stop-opacity="' + a + '"/>'; }
  var DEFS5 =
    '<defs><linearGradient id="s05sheen" x1="0" y1="0" x2="1" y2="1">' + stop5(0, SB.T.white, 0.12) + stop5(0.5, SB.T.white, 0.02) + stop5(1, SB.T.white, 0) + '</linearGradient>' +
    '<linearGradient id="s05crease" x1="0" y1="0" x2="1" y2="0">' + stop5(0, SB.T.ground, 0.5) + stop5(1, SB.T.ground, 0) + '</linearGradient>' +
    '<linearGradient id="s05creaseV" x1="0" y1="0" x2="0" y2="1">' + stop5(0, SB.T.ground, 0.5) + stop5(1, SB.T.ground, 0) + '</linearGradient></defs>';

  // Lit paper on the table: shadowed sheet, light along the top edge, hairline border.
  function litSheet(x, y, w, h, o) {
    o = o || {};
    var S = SB.SVG, T = SB.T, s = "";
    var tf = o.rot ? ' transform="rotate(' + o.rot + " " + (x + w / 2) + " " + (y + h / 2) + ')"' : "";
    s += "<g" + tf + (o.op != null ? ' opacity="' + o.op + '"' : "") + ">";
    s += S.rect(x, y, w, h, { fill: "url(#paper)", filter: o.flat ? null : "url(#sheetShadow)" });
    s += S.rect(x + 0.5, y + 0.5, w - 1, h - 1, { fill: "none", stroke: T.sheetLine });
    s += S.line(x + 1, y + 1, x + w - 1, y + 1, { stroke: "rgba(255,255,255,0.22)" });
    return s + "</g>";
  }
  // A steel rule lying on the table: ticks, no numbers.
  function rule(x, y, w, rot) {
    var S = SB.SVG, T = SB.T, s = '<g transform="rotate(' + rot + " " + x + " " + y + ')">';
    s += S.rect(x, y, w, 26, { fill: "url(#paper)", filter: "url(#sheetShadow)" }) + S.rect(x + 0.5, y + 0.5, w - 1, 25, { fill: "none", stroke: "rgba(255,255,255,0.35)" });
    s += S.line(x + 1, y + 1, x + w - 1, y + 1, { stroke: "rgba(255,255,255,0.4)" });
    for (var i = 8; i < w - 4; i += 8) s += S.line(x + i, y + 26, x + i, y + 26 - (i % 80 === 0 ? 14 : i % 40 === 0 ? 10 : 6), { stroke: "rgba(255,255,255,0.45)" });
    return s + "</g>";
  }
  // The FIG chip over an inset box (white tab, dark mono type).
  function chip(c, x, y, html, w, ph) {
    c.uiSvg(SB.SVG.rect(x, y - (ph ? 17 : 20), w, ph ? 17 : 20, { fill: c.T.white }));
    c.uiDiv(x + (ph ? 5 : 8), y - (ph ? 14 : 17), null, html, c.TX.labelW + ";font-size:10px;color:" + c.T.ground + ";white-space:nowrap");
  }
  // A flat loupe: a 3× crop of a drawing, boxed, with a clip.
  function loupe(c, id, box, inner, sI) {
    var S = SB.SVG, T = c.T;
    var u = hatchDefs(id, sI) + '<defs><clipPath id="' + id + 'c"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>';
    u += S.rect(box.x, box.y, box.w, box.h, { fill: T.sheet });
    u += '<g clip-path="url(#' + id + 'c)">' + S.grid(box.x, box.y, box.w, box.h, Math.round(box.w / 9), { ticks: false }) + fineHatch(inner, id) + "</g>";
    u += S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: T.white, "stroke-width": 1 });
    c.uiSvg(u);
  }
  // The detail mark on the drawing (dashed circle + letter balloon) and the leader to the loupe.
  function detailMark(c, cx, cy, r, letter, box, ph) {
    var S = SB.SVG, T = c.T;
    c.svg(S.circle(cx, cy, r, { fill: "none", stroke: T.white, "stroke-width": 1, "stroke-dasharray": "4 3", opacity: 0.85 }));
    var bx = cx + r * 0.72, by = cy - r * 0.72, br = ph ? 8 : 11;
    c.svg(S.circle(bx, by, br, { fill: T.sheet, stroke: T.white, "stroke-width": 1 }));
    c.div(bx - br, by - (ph ? 6 : 8), br * 2, letter, c.TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0;text-align:center");
    var pr = projector(c), a = pr(bx + br * 0.7, by - br * 0.7);
    var tx = a[0] < box.x ? box.x : box.x + box.w, ty = box.y + box.h * 0.5;
    if (ph) { tx = box.x + box.w * 0.5; ty = a[1] < box.y ? box.y : box.y + box.h; }
    c.uiSvg(S.path("M" + a[0] + " " + a[1] + " L" + tx + " " + ty, { stroke: "rgba(255,255,255,0.55)" }) + S.rect(a[0] - 2.5, a[1] - 2.5, 5, 5, { fill: T.white }));
  }

  SB.scene({
    order: 5,
    id: "S05",
    name: "The Line of Production",
    move: "MORPH + SPLIT",
    screens: 1.5,
    restrained: false,
    anchor: "#mfMorph", // the live page's id for this section (index.html:297), kept so deep links still land here
    trigger: "End of S04: the ten bars have fused into one steel plate with a cut line down its centre.",
    camera: "Wide and still on the split frame through the fold; then a push into the single drawing until its border meets the frame. At the exit the frame holds while the drawing shrinks into the top-right corner.",
    reason:
      "Folding the turbine into a munition on the same steel says the factories, the steel and the engineers do not change; only the choice does. The drawing then steps back into a corner so its paper can mean money again: full frame is the $2.89T sheet, the scale S06 pulls wide from.",
    frames: [
      { k: "in", p: 0, cap: "Hard state change on S04's cut line: the steel plate, lying on the table where S04 tipped it, splits. One half slides toward each sheet of a split frame, CLEAN ENERGY and MUNITIONS (dashed on the table). Construction lines start on both. Area stops meaning money here: this is drawing stock." },
      { k: "mid", p: 0.3, cap: "Split frame, wide and still: the camera has risen over the drafting table. One lit sheet folded down its centre. Left half: the turbine, line-work in blue. Right half: the munition in white line; its warhead is the one red mark, held 3× in a loupe (DETAIL D). Same stock, same sheet. First line of copy." },
      { k: "fold", p: 0.55, cap: "The turbine folds into a munition: blades swing down along the mast, the mast swells into the casing (dashed). Blue drains as the new warhead takes the red; the right-hand munition goes grey. The loupe moves to the hub (DETAIL E). The fold line closes next." },
      { k: "push", p: 0.8, cap: "Hard cut at 0.65: the split closes into one drawing (FIG. 2) and the camera pushes in until its border meets the frame (corner ticks: where the border sat at the cut); the sheet is almost flat. $679B lands whole, a still spec figure with no count-up. +9.2% stands apart with its own label: transfer volume, not money. Section A–A sits boxed between them." },
      { k: "out", p: 0.95, cap: "Exit, mid-move: the drawing shrinks toward the top-right corner (dashed: where it parks; faint ghosts: its path). The table tilt is gone: the paper is full frame again and re-reads as the $2.89T sheet, red edge back. S06's rungs fade in. At p = 1 the frame is S06 'in', and the pull starts." },
    ],
    alts: [
      {
        k: "B",
        label: "$679B dropped (no data.js field)",
        frames: ["push"],
        note: "Audit F01: $679B has no data.js field or DATA-SOURCES row. If the exception is not approved, the push lands on the drawing and +9.2% only. The pairing risk with +9.2% disappears with it.",
      },
    ],
    draw: function (c) {
      var ph = phase(c.p);
      dimsFlag(c);
      c.svg(DEFS5);
      if (c.phone) {
        if (ph === "split") phoneSplit(c);
        else if (ph === "panels" || ph === "fold") phonePanels(c, ph === "fold" ? 0.5 : 0);
        else if (ph === "push") phonePush(c);
        else phoneExit(c);
      } else {
        if (ph === "split") deskSplit(c);
        else if (ph === "panels" || ph === "fold") deskPanels(c, ph === "fold" ? 0.5 : 0);
        else if (ph === "push") deskPush(c);
        else deskExit(c);
      }
      chrome(c);
    },
    // No-motion plate: the split (turbine | munition) with both lines of copy and both figures, still.
    plate: function (c) {
      dimsFlag(c);
      c.svg(DEFS5);
      if (c.phone) phonePlate(c);
      else deskPlate(c);
    },
  });

  /* ═══ DESKTOP ═══════════════════════════════════════════════════ */
  // The drafting table, in world units. The sheet's fold sits on S04's cut line (x 720).
  var SHEET = { x: 240, y: 168, w: 960, h: 620 }, CREASE = 720, DS = 2.1;
  var TABLE = { rx: 16, ry: 0, rz: -2.5, persp: 1600 }; // the camera, risen and still (mid, fold)
  var S04END = { rx: 44, ry: 0, rz: -4, persp: 1250 }; // S04's exit camera (its plate lies on the table)
  function dL() { return map(SHEET.x + 30, SHEET.y + 58, DS); }
  function dR() { return map(CREASE + 30, SHEET.y + 58, DS); }
  function tableCam(c) { c.camera(1, CREASE, 450, 590, 438); c.tilt(TABLE); }

  // The table and the sheet, folded at the crease: left half lit, right half a shade darker.
  function table(c, S, T, o) {
    o = o || {};
    c.svg(S.grid(-600, -400, 2600, 1800, 60, { ticks: false }));
    c.svg(litSheet(SHEET.x + 16, SHEET.y + 22, SHEET.w, SHEET.h, { rot: 1.8 })); // the sheet under it
    if (o.rule) c.svg(rule(SHEET.x + 40, SHEET.y + SHEET.h + 34, 760, -1.2)); // a steel rule (plate only: live frames keep the bottom band clear)
    c.svg(litSheet(SHEET.x, SHEET.y, SHEET.w, SHEET.h));
    c.svg('<g opacity="' + (o.gridOp || 1) + '">' + S.grid(SHEET.x + 12, SHEET.y + 12, SHEET.w - 24, SHEET.h - 24, 46, { ticks: false }) + "</g>");
    c.svg(S.rect(CREASE, SHEET.y, SHEET.w / 2, SHEET.h, { fill: T.ground, opacity: 0.22 }));
    c.svg(S.rect(CREASE, SHEET.y, 40, SHEET.h, { fill: "url(#s05crease)" }));
    c.svg(S.rect(SHEET.x, SHEET.y, SHEET.w, SHEET.h, { fill: "url(#s05sheen)" }));
  }
  // The two halves' title strips, printed on the paper.
  function halfTitles(c, x, op) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    c.svg(S.rect(SHEET.x + 30, SHEET.y + 22, 9, 9, { fill: T.blue }));
    c.div(SHEET.x + 46, SHEET.y + 18, null, x.clean, TX.labelW + ";font-size:12px;white-space:nowrap");
    c.div(CREASE + 30, SHEET.y + 18, null, x.war, TX.labelW + ";font-size:12px;white-space:nowrap" + (op != null ? ";opacity:" + op : ""));
    c.svg(S.line(SHEET.x + 30, SHEET.y + 42, CREASE - 30, SHEET.y + 42, { stroke: T.sheetLine }) + S.line(CREASE + 30, SHEET.y + 42, SHEET.x + SHEET.w - 30, SHEET.y + 42, { stroke: T.sheetLine }));
  }

  // 'in': S04's plate, on the table under S04's exit camera, cut in two at its centre line.
  function deskSplit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    c.camera(1, c.W / 2, c.H / 2, c.W / 2 + 20, c.H / 2);
    c.tilt(S04END);
    var base = 690, k = 440 / MAXAMT, cw = 62, px0 = (c.W - cw * 10) / 2, gap = 46;
    c.svg(S.grid(-500, -300, c.W + 1000, 1500, 60, { ticks: false }));
    // the two sheets each half is about to become, dashed on the table
    [[SHEET.x, CREASE - SHEET.x], [CREASE, SHEET.x + SHEET.w - CREASE]].forEach(function (h) {
      c.svg(S.rect(h[0] + 0.5, SHEET.y + 0.5, h[1] - 1, SHEET.h - 1, { fill: "none", stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "4 6" }));
    });
    // titles set a little into each sheet: on the far edge they sat under the overlay's tracking bracket
    c.svg(S.rect(SHEET.x + 30, SHEET.y + 46, 9, 9, { fill: T.blue }));
    c.div(SHEET.x + 46, SHEET.y + 40, null, x.clean, TX.labelW + ";font-size:14px;white-space:nowrap");
    c.div(CREASE + 30, SHEET.y + 40, null, x.war, TX.labelW + ";font-size:14px;white-space:nowrap");
    // construction lines: what each half is about to become
    var mL = dL(), mR = dR();
    c.svg(S.line(mL.x(100), mL.y(30), mL.x(100), mL.y(242), { stroke: T.blue, "stroke-dasharray": "10 6", opacity: 0.8 }));
    c.svg(S.circle(mL.x(100), mL.y(120), 86 * DS, { fill: "none", stroke: T.blue, "stroke-dasharray": "3 7", opacity: 0.55 }));
    c.svg(S.line(mR.x(100), mR.y(14), mR.x(100), mR.y(250), { stroke: T.grey, "stroke-dasharray": "14 4 2 4", opacity: 0.8 }));
    c.svg(S.line(mR.x(87), mR.y(78), mR.x(87), mR.y(230), { stroke: T.grey, "stroke-dasharray": "3 6", opacity: 0.6 }));
    c.svg(S.line(mR.x(113), mR.y(78), mR.x(113), mR.y(230), { stroke: T.grey, "stroke-dasharray": "3 6", opacity: 0.6 }));
    // the two halves of the plate (GDP order, as S04 left them), parting; lit steel with a near edge
    [[0, 5, -gap], [5, 10, gap]].forEach(function (hf) {
      var x0 = px0 + hf[0] * cw + hf[2], x1 = px0 + hf[1] * cw + hf[2];
      var d = "M" + x0 + " " + base;
      for (var s = hf[0]; s < hf[1]; s++) {
        var xx = px0 + s * cw + hf[2], h = SP[BY_GDP[s]].amt * k;
        d += " V" + (base - h) + " H" + (xx + cw);
      }
      d += " V" + base + " Z";
      c.svg(S.path("M" + x0 + " " + base + " H" + x1 + " v14 H" + x0 + " Z", { fill: T.ground, stroke: T.sheetLine }) + S.line(x0, base + 1, x1, base + 1, { stroke: "rgba(255,255,255,0.55)" }));
      c.svg('<path d="' + d + '" fill="url(#paper)" filter="url(#sheetShadow)"/>' + '<path d="' + d + '" fill="url(#hatch-grey)"/>' + '<path d="' + d + '" fill="url(#s05sheen)"/>');
      c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    });
    // the cut: now the fold line of the sheet
    c.svg(S.line(CREASE, SHEET.y - 40, CREASE, SHEET.y + SHEET.h + 40, { stroke: T.white, "stroke-width": 1.5 }));
    var ay = base + 70;
    c.svg(S.line(CREASE - 30, ay, CREASE - 220, ay, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 5" }) + chevron(CREASE - 220, ay, -1, 0, 8, T.white));
    c.svg(S.line(CREASE + 30, ay, CREASE + 220, ay, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 5" }) + chevron(CREASE + 220, ay, 1, 0, 8, T.white));
    c.uiSvg(S.line(c.W - 102, 78, c.W - 72, 78, { stroke: "rgba(255,255,255,0.5)" }));
    c.uiDiv(c.W - 712, 70, 600, x.eyebrow, TX.labelW + ";font-size:13px;text-align:right");
    stateOn(c, { form: "steel plate, cut in two → two drawing sheets (split frame)", tone: "neutral, grey steel hatch; blue construction line on the left sheet; no red", note: "cut on S04's centre line, under S04's exit camera; halves keep their stepped outline but area no longer means money (drawing stock)" },
      { x: px0 - gap, y: base - 440, w: cw * 10 + gap * 2, h: 454 });
  }

  // 'mid' (f = 0) and 'fold' (f = 0.5): one sheet, two halves, on the drafting table
  function deskPanels(c, f) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    tableCam(c);
    table(c, S, T);
    halfTitles(c, x, f ? 0.5 : null);
    var mL = dL(), mR = dR();
    c.svg(hatchDefs("s05hm", DS));
    // the loupe's right edge stays left of x 1320, where the overlay's SCAN readout runs
    var box = { x: 1040, y: 188, w: 264, h: 284 }, sI = DS * 3;
    if (!f) {
      c.svg(fineHatch(turbineSvg(c, mL, { dims: true }), "s05hm"));
      turbineTags(c, mL, 12);
      c.svg(fineHatch(munitionSvg(c, mR, { red: true, dims: true }), "s05hm"));
      munitionTags(c, mR, 12);
      // DETAIL D: the warhead, 3× in the loupe
      var fx = 104, fy = 70;
      detailMark(c, mR.x(fx), mR.y(fy), 24 * DS, c.label("D", "detail letter (drawing convention; no scale number)"), box);
      var mI = map(box.x + box.w / 2 - fx * sI, box.y + box.h / 2 - fy * sI, sI);
      loupe(c, "s05l", box, munitionSvg(c, mI, { red: true, dims: true }), sI);
      chip(c, box.x, box.y, c.copy("FIG. 1b — MUNITION", "index.html:377") + " · " + c.label("DETAIL D"), 240);
      c.uiDiv(box.x, box.y + box.h + 10, box.w, c.copy("WARHEAD", "index.html:374"), TX.label + ";font-size:11px");
      c.uiDiv(120, 64, 940, x.l1, TX.value + ";font-weight:400;font-size:32px;color:" + T.white);
      stateOn(c, { form: "split frame: two drawing sheets", tone: "neutral paper; turbine line in blue (left); one red warhead (right), held 3× in the loupe", note: "no area meaning: drawings; one sheet folded at S04's cut line" }, SHEET);
      return;
    }
    // the fold: target outline first, the turbine folding over it, motion arcs on top
    c.svg(fineHatch(munitionSvg(c, mL, { ghost: true, redDash: true }), "s05hm"));
    c.svg(turbineSvg(c, mL, { f: f, op: 0.7, dims: false }));
    var arcs = "", R0 = 86;
    function pt(a) { return (100 + R0 * Math.cos(a * Math.PI / 180)) + " " + (120 + R0 * Math.sin(a * Math.PI / 180)); }
    arcs += P("M" + pt(29.8) + " A" + R0 + " " + R0 + " 0 0 1 " + pt(84), { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    arcs += P("M" + pt(150.2) + " A" + R0 + " " + R0 + " 0 0 0 " + pt(96), { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    arcs += P("M104 32 C 132 40, 136 84, 114 104", { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    c.svg(grp(mL, arcs));
    var a1 = [mL.x(100 + R0 * Math.cos(84 * Math.PI / 180)), mL.y(120 + R0 * Math.sin(84 * Math.PI / 180))];
    var a2 = [mL.x(100 + R0 * Math.cos(96 * Math.PI / 180)), mL.y(120 + R0 * Math.sin(96 * Math.PI / 180))];
    c.svg(chevron(a1[0], a1[1], -0.99, 0.1, 9, T.white) + chevron(a2[0], a2[1], 0.99, 0.1, 9, T.white) + chevron(mL.x(114), mL.y(104), -0.6, 0.8, 9, T.white));
    tag(c, mL, 8, 16, c.copy("FIG. 1a — TURBINE", "index.html:343"), 12, { white: true });
    // the new warhead's callout sits left, clear of the fold arcs
    c.svg(grp(mL, P("M87 96 L76 72 H72", { stroke: T.grey })));
    tag(c, mL, 70, 76, c.copy("WARHEAD", "index.html:374"), 12, { white: true, right: true, w: 80 });
    // right half: the template munition, gone grey (its red has moved left)
    c.svg(fineHatch(munitionSvg(c, mR, { red: false, dims: true, op: 0.45 }), "s05hm"));
    munitionTags(c, mR, 12, { op: 0.5 });
    // the fold line, dashed: it closes (hard cut) at 0.65
    c.svg(S.line(CREASE, SHEET.y - 30, CREASE, SHEET.y + SHEET.h + 30, { stroke: T.white, "stroke-width": 1, "stroke-dasharray": "6 6", opacity: 0.8 }));
    c.svg(chevron(CREASE - 12, SHEET.y + SHEET.h / 2, 1, 0, 9, T.white) + chevron(CREASE + 12, SHEET.y + SHEET.h / 2, -1, 0, 9, T.white));
    // DETAIL E: the hub, 3× in the loupe, as the blades swing
    var hx = 100, hy = 112;
    detailMark(c, mL.x(hx), mL.y(hy), 22 * DS, c.label("E", "detail letter (drawing convention; no scale number)"), box);
    var mI2 = map(box.x + box.w / 2 - hx * sI, box.y + box.h / 2 - hy * sI, sI);
    loupe(c, "s05l", box, munitionSvg(c, mI2, { ghost: true, redDash: true }) + turbineSvg(c, mI2, { f: f, op: 0.85 }), sI);
    chip(c, box.x, box.y, c.copy("FIG. 1a — TURBINE", "index.html:343") + " · " + c.label("DETAIL E"), 232);
    c.uiDiv(box.x, box.y + box.h + 10, box.w, c.copy("NACELLE", "index.html:342"), TX.label + ";font-size:11px");
    c.uiDiv(120, 56, 1000, x.l1, TX.value + ";font-weight:400;font-size:28px;color:" + T.grey);
    c.uiDiv(120, 96, 1000, x.l2, TX.value + ";font-weight:600;font-size:28px;color:" + T.white);
    stateOn(c, { form: "split frame, fold in progress", tone: "neutral paper; blue fading on the left; the one red mark moves to the new warhead", note: "fold line dashed: it closes (hard cut) at 0.65" }, SHEET);
  }

  function deskPush(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    var altB = c.alt === "B";
    // pushed in: the drawing's border meets the frame; the sheet is almost flat now
    c.tilt({ rx: 6, ry: 0, rz: -0.8, persp: 1800 });
    c.svg(S.rect(-240, -180, c.W + 480, c.H + 360, { fill: "url(#paper)" }));
    c.svg(S.rect(-240, -180, c.W + 480, c.H + 360, { fill: "url(#s05sheen)" }));
    c.svg(S.grid(48, 56, 1344, 788, 36, { ticks: false }));
    c.svg(S.rect(40.5, 48.5, 1359, 803, { fill: "none", stroke: T.sheetLine }));
    c.svg(S.rect(48.5, 56.5, 1343, 787, { fill: "none", stroke: T.sheetLine }));
    var m = map(250 - 22 * 3.6, 150 - 34 * 3.6, 3.6);
    c.svg(hatchDefs("s05h2", 3.6));
    c.svg(fineHatch(fig2Svg(c, m, { red: true }), "s05h2"));
    // the push: where the drawing's border sat at the cut (corner ticks), carried out to the frame
    pushMarks(c, [{ f: [100, 136], t: [56, 64] }, { f: [100, 768], t: [56, 836] }, { f: [1340, 768], t: [1384, 836] }], 14);
    fig2Tags(c, m, 18, 12, { names: true });
    // section A–A, boxed on the sheet with its chip
    var sb = { x: 650, y: 668, w: 180, h: 150 };
    c.svg(S.rect(sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, { fill: "none", stroke: T.white, "stroke-width": 1 }));
    c.svg(S.rect(sb.x, sb.y - 20, 132, 20, { fill: T.white }));
    sectionAA(c, m.x(158), sb.y + 66, 46, 11, { chip: { x: sb.x + 8, y: sb.y - 17 } });
    // title block, top right (numbers removed)
    var tb = { x: 1132, y: 56, w: 260, h: 66 };
    c.svg(S.rect(tb.x + 0.5, tb.y + 0.5, tb.w - 1, tb.h - 1, { fill: T.sheet, stroke: T.sheetLine }));
    c.svg(S.line(tb.x, tb.y + 22, tb.x + tb.w, tb.y + 22, { stroke: T.sheetLine }) + S.line(tb.x, tb.y + 44, tb.x + tb.w, tb.y + 44, { stroke: T.sheetLine }));
    c.div(tb.x + 10, tb.y + 5, null, c.copy("FIG. 2 — MUNITION", "index.html:475"), TX.labelW + ";font-size:11px");
    c.div(tb.x + 10, tb.y + 27, null, c.newCopy("SCALE · NTS", "replaces 'SCALE 1:40' (index.html:476); NTS = not to scale, marks the drawing as illustrative"), TX.label + ";font-size:11px");
    c.div(tb.x + 10, tb.y + 49, null, c.copy("STATUS: IN PRODUCTION", "index.html:479"), TX.labelW + ";font-size:11px");
    c.uiDiv(120, 70, 960, x.l2, TX.value + ";font-weight:600;font-size:30px;color:" + T.white);
    // the two spec figures, apart, set flat over the sheet
    var g = vol(c);
    var gx = altB ? 120 : 900;
    c.uiSvg(S.line(gx, 640, gx + 400, 640, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(gx, 652, 400, g.lbl, TX.label + ";font-size:12px");
    c.uiDiv(gx - 2, 698, null, g.v, TX.value + ";font-size:72px");
    c.uiDiv(gx, 790, 420, g.src, TX.src);
    if (!altB) {
      var r = rev(c);
      c.uiSvg(S.line(120, 640, 600, 640, { stroke: "rgba(255,255,255,0.3)" }));
      c.uiDiv(120, 652, 480, r.lbl, TX.label + ";font-size:12px");
      c.uiDiv(112, 666, null, r.v, TX.giant + ";font-size:150px");
      c.uiDiv(120, 806, 440, r.src, TX.src);
      c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it (679, $B, 2024, SIPRI Top 100 link at index.html:489) to data.js and DATA-SOURCES.md, or drop it from S05 (Alt B).");
    } else {
      c.flag("decision", "Alt B: $679B dropped from S05 because it has no data.js field (audit F01). +9.2% stands alone with its volume label.");
    }
    c.state({ form: "one engineering drawing (FIG. 2), full frame", x: 0, y: 0, w: c.W, h: c.H, tone: "neutral paper, white/grey line; one red mark (warhead section 3)", note: "camera pushed in: drawing border meets the frame; sheet nearly flat (tilt 6°); no area meaning" + (altB ? "; Alt B: no $679B" : "") });
  }

  function deskExit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage;
    var R = c.rung("DEFENCE", SB.get("DEFENCE"), st, "bl"); // full frame = $2.89T, as at S06 entry
    c.svg(S.sheet(R.x, R.y, R.w, R.h, { tone: "red", mode: "edge", sw: 1.5, tab: true, tabSize: 8, flat: true }));
    // the drawing's border, which met the frame in the push, dissolving
    c.svg(S.rect(40.5, 48.5, 1359, 803, { fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 8" }));
    rungsIn(c, 0.35);
    // the drawing mid-shrink, on its way to S06's parked spot (dashed), with ghosts of its path
    var A = { x: 290, y: 167, w: 980 }, B = { x: 1150, y: 78, w: 220 }, t = 0.85; // p 0.95: nearly parked, clear of the arriving figure
    function at(u) { return { x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, w: A.w + (B.w - A.w) * u }; }
    var M = at(t);
    [0.35, 0.6].forEach(function (u, j) { var G = at(u); c.svg(parked(G.x, G.y, G.w, S, T, 0.1 + 0.08 * j)); });
    c.svg(S.rect(B.x - 8, B.y - 8, B.w + 16, B.w * 0.5 + 16, { fill: "none", stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }));
    [[0, 0], [1, 0.5]].forEach(function (k) {
      var x1 = M.x + M.w * k[0], y1 = M.y + M.w * k[1], x2 = B.x - 8 + (B.w + 16) * k[0], y2 = B.y - 8 + (B.w * 0.5 + 16) * k[1] * 2;
      var len = Math.hypot(x2 - x1, y2 - y1);
      c.svg(S.line(x1, y1, x2, y2, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 5" }) + chevron(x2, y2, (x2 - x1) / len, (y2 - y1) / len, 9, T.white));
    });
    c.svg(parked(M.x, M.y, M.w, S, T, 1));
    // the sheet re-reads as money: S06's label arrives
    var o = "opacity:0.55";
    // same place and size as S06 'in' (scenes/s06.js), fading up, so the seam is a fade, not a jump
    c.svg(S.line(120, 78, 760, 78, { stroke: "rgba(255,255,255,0.3)", opacity: 0.55 }));
    c.div(120, 88, 700, c.fig("machineData[0].name", "raw").toUpperCase() + " · " + c.label("SIPRI 2026"), TX.label + ";font-size:13px;" + o);
    c.div(106, 114, null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:248px;" + o);
    c.flag("decision", "Exit parks the drawing in the top-right corner of the $2.89T sheet (S06's entry). The drawing has no area: it must not read as a share of $2.89T ($679B is company revenue, a different measure). Alternative: park it outside the sheet.");
    c.state({ form: "sheet, full frame ($2.89T); drawing shrinking to the top-right corner", x: 0, y: 0, w: c.W, h: c.H, tone: "red edge back, neutral paper; drawing grey line art (red warhead gone); S06's rungs fading in", note: "area = DEFENCE at the frame's fit again (no tilt). At p = 1 this is S06 'in': drawing parked at 1150, 78, w 220; rungs at full strength" });
  }

  // S06's nested rungs (scenes/s06.js RUNGS and its 'in' labels), fading in as the pull starts.
  var RUNGS = [
    { path: "topSpenders[0].amt", fmt: "B", name: "topSpenders[0].name", tone: "red" },
    { path: "machineData[1].amtB", fmt: "B", name: "machineData[1].name", tone: "red" },
    { path: "issueData[0].cost", fmt: "B", name: "issueData[0].name", tone: "blue" },
  ];
  function rungsIn(c, op) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, fit = SB.get("DEFENCE");
    var list = RUNGS.map(function (R) {
      return { r: c.rung(R.path, fit, st, "bl"), tone: R.tone, value: c.fig(R.path, R.fmt), name: c.fig(R.name, "raw").toUpperCase() };
    });
    list.forEach(function (it) { c.svg(S.sheet(it.r.x, it.r.y, it.r.w, it.r.h, { tone: it.tone, mode: "edge", sw: 1.25, opacity: op, flat: true })); });
    // S06 'in' (scenes/s06.js callout(), lead()) labels the rungs as numbered callouts:
    // 02 on $954B, 03 and 04 off to the right with leaders. Same places here, faded.
    var lo = Math.min(1, op + 0.2), r9 = list[0].r;
    var corners = list.map(function (it) { return { x: it.r.x + it.r.w, y: it.r.y }; });
    if (!c.phone) {
      callout06(c, 72, r9.y + 26, 2, list[0], { vs: 36, ls: 12 }, lo);
      lead06(c, corners[1], callout06(c, 372, list[1].r.y - 22, 3, list[1], { vs: 22 }, lo), 34, lo);
      lead06(c, corners[2], callout06(c, 372, list[2].r.y - 2, 4, list[2], { vs: 22 }, lo), 34, lo);
    } else {
      callout06(c, r9.x + 12, r9.y + 14, 2, list[0], { vs: 22, ls: 10, w: r9.w - 50 }, lo);
      var qx = r9.x + r9.w + 14, qw = st.x + st.w - qx - 40;
      lead06(c, corners[1], callout06(c, qx, list[1].r.y - 64, 3, list[1], { vs: 16, ls: 10, w: qw }, lo), 8, lo);
      lead06(c, corners[2], callout06(c, qx, list[2].r.y - 4, 4, list[2], { vs: 16, ls: 10, w: qw }, lo), 8, lo);
    }
    return list;
  }
  function pad06(n) { return (n < 10 ? "0" : "") + n; }
  // A numbered callout as S06 draws it (boxed number, tone square, value, mono name), at opacity op.
  function callout06(c, x, y, n, it, o, op) {
    var S = SB.SVG, TX = c.TX, T = c.T, nb = c.phone ? 15 : 18, vs = o.vs || 20, ls = o.ls || 11, w = o.w || 260;
    var col = it.tone === "blue" ? T.blue : it.tone === "red" ? T.red : T.grey;
    c.uiSvg('<g opacity="' + op + '">' + S.rect(x + 0.5, y + 2.5, nb, nb, { fill: "none", stroke: "rgba(255,255,255,0.7)" }) +
      S.rect(x + nb + 7, y + 7, 7, 7, { fill: "none", stroke: col, "stroke-width": 1.5 }) + "</g>");
    c.uiDiv(x, y + (c.phone ? 4 : 5), nb + 1, c.label(pad06(n), "callout number (as S06 'in')"), TX.labelW + ";font-size:10px;letter-spacing:0;text-align:center;line-height:1;opacity:" + op);
    c.uiDiv(x + nb + 20, y, w, it.value, TX.value + ";font-size:" + vs + "px;opacity:" + op);
    c.uiDiv(x + nb + 20, y + vs + 4, w, it.name, TX.label + ";font-size:" + ls + "px;opacity:" + op);
    return { x: x - 3, y: y + nb / 2 + 2.5 };
  }
  function lead06(c, from, to, elbow, op) {
    c.uiSvg('<g opacity="' + op + '">' + SB.SVG.leader([[from.x, from.y], [to.x - elbow, to.y], [to.x, to.y]], { color: "rgba(255,255,255,0.5)" }) + "</g>");
  }

  // Phone: the scene name is too long for the shared top bar at 375px, so S05 sets its own
  // breadcrumb (same labels, one size down) clear of the REC readout. Desktop uses the shared chrome.
  function chrome(c) {
    if (!c.phone) return c.chrome();
    c.chrome({ labels: false });
    c.uiDiv(16, 10, null, c.label("THE COST OF WAR", "top bar"), c.TX.labelW + ";font-size:11px");
    c.uiDiv(16, 26, null, c.label("FILE 05", "top bar"), c.TX.label + ";font-size:10px");
    c.uiDiv(146, 11, 160, c.label("THE LINE OF PRODUCTION", "top bar, one size down to fit 375px"), c.TX.label + ";font-size:10px;letter-spacing:0.04em;white-space:nowrap");
  }

  function deskPlate(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    // the table, still: the same sheet and loupe as 'mid', set left; both figures in the right margin
    c.camera(0.86, CREASE, 470, 520, 470);
    c.tilt({ rx: 12, ry: 0, rz: -2, persp: 1600 });
    table(c, S, T, { rule: true });
    halfTitles(c, x);
    var mL = dL(), mR = dR();
    c.svg(hatchDefs("s05hm", DS));
    c.svg(fineHatch(turbineSvg(c, mL, { dims: true }), "s05hm"));
    turbineTags(c, mL, 13);
    c.svg(fineHatch(munitionSvg(c, mR, { red: true, dims: true }), "s05hm"));
    munitionTags(c, mR, 13);
    c.uiDiv(120, 52, 1200, x.l1, TX.value + ";font-weight:400;font-size:28px;color:" + T.white);
    c.uiDiv(120, 92, 1200, x.l2, TX.value + ";font-weight:600;font-size:28px;color:" + T.white);
    var r = rev(c), g = vol(c);
    c.uiSvg(S.line(1010, 200, 1360, 200, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(1010, 212, 350, r.lbl, TX.label + ";font-size:12px");
    c.uiDiv(1004, 254, null, r.v, TX.giant + ";font-size:104px");
    c.uiDiv(1010, 364, 350, r.src, TX.src);
    c.uiSvg(S.line(1010, 480, 1360, 480, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(1010, 492, 350, g.lbl, TX.label + ";font-size:12px");
    c.uiDiv(1008, 540, null, g.v, TX.value + ";font-size:60px");
    c.uiDiv(1010, 620, 350, g.src, TX.src);
    // (logged after the figures so the plate's flags keep their committed order)
    c.div(SHEET.x + 30, SHEET.y + SHEET.h - 34, 820, c.newCopy("SCALE · NTS", "replaces 'SCALE 1:40' (index.html:476); NTS = not to scale, marks the drawings as illustrative"), TX.src + ";font-size:13px");
    c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05.");
    stateOn(c, { form: "split frame (still), no motion", tone: "neutral; blue turbine line; one red warhead", note: "plate shows both drawings, both copy lines and both figures; static table view" }, SHEET);
  }

  /* ═══ PHONE · split stacks top / bottom ═════════════════════════ */
  // One sheet in the stage, folded across its middle (y 306, S04's phone cut line).
  var PSHEET = { x: 20, y: 64, w: 335, h: 484 }, PCREASE = 306, PS = 0.84;
  var PTABLE = { rx: 12, ry: 0, rz: -2, persp: 1000 };
  var P04END = { rx: 34, ry: 4, rz: -4, persp: 900 }; // S04's phone exit view
  function pTop() { return map(PSHEET.x + (PSHEET.w - 200 * PS) / 2 - 6, PSHEET.y + 26, PS); }
  function pBot() { return map(PSHEET.x + (PSHEET.w - 200 * PS) / 2 - 6, PCREASE + 26, PS); }
  function pTable(c, S, T) {
    c.svg(S.grid(-300, -300, 1000, 1400, 34, { ticks: false }));
    c.svg(litSheet(PSHEET.x + 8, PSHEET.y + 10, PSHEET.w, PSHEET.h, { rot: 1.6 }));
    c.svg(litSheet(PSHEET.x, PSHEET.y, PSHEET.w, PSHEET.h));
    c.svg(S.grid(PSHEET.x + 6, PSHEET.y + 6, PSHEET.w - 12, PSHEET.h - 12, 30, { ticks: false }));
    c.svg(S.rect(PSHEET.x, PCREASE, PSHEET.w, PSHEET.y + PSHEET.h - PCREASE, { fill: T.ground, opacity: 0.22 }));
    c.svg(S.rect(PSHEET.x, PCREASE, PSHEET.w, 24, { fill: "url(#s05creaseV)" }));
    c.svg(S.rect(PSHEET.x, PSHEET.y, PSHEET.w, PSHEET.h, { fill: "url(#s05sheen)" }));
  }
  function pTitles(c, x, op) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    c.svg(S.rect(PSHEET.x + 12, PSHEET.y + 13, 8, 8, { fill: T.blue }));
    c.div(PSHEET.x + 26, PSHEET.y + 10, null, x.clean, TX.labelW + ";font-size:10px;white-space:nowrap");
    c.div(PSHEET.x + 12, PCREASE + 10, null, x.war, TX.labelW + ";font-size:10px;white-space:nowrap" + (op != null ? ";opacity:" + op : ""));
  }

  function phoneSplit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox, x = texts(c);
    c.tilt(P04END);
    c.svg(S.grid(-300, -300, 1000, 1400, 34, { ticks: false }));
    var k = 200 / MAXAMT, bh = 28, x0 = st.x + 6, py = PCREASE - bh * 5, gap = 30; // S04 phoneFuse plate
    // the two sheets each half is about to become, dashed on the table
    [[PSHEET.y, PCREASE - PSHEET.y], [PCREASE, PSHEET.y + PSHEET.h - PCREASE]].forEach(function (h) {
      c.svg(S.rect(PSHEET.x + 0.5, h[0] + 0.5, PSHEET.w - 1, h[1] - 1, { fill: "none", stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "4 5" }));
    });
    c.svg(S.rect(PSHEET.x + 12, PSHEET.y + 13, 8, 8, { fill: T.blue }));
    c.div(PSHEET.x + 26, PSHEET.y + 9, null, x.clean, TX.labelW + ";font-size:11px;white-space:nowrap");
    c.div(PSHEET.x + 12, PSHEET.y + PSHEET.h - 24, null, x.war, TX.labelW + ";font-size:11px;white-space:nowrap");
    [[0, 5, -gap], [5, 10, gap]].forEach(function (hf) {
      var y0 = py + hf[0] * bh + hf[2];
      var d = "M" + x0 + " " + y0;
      for (var s = hf[0]; s < hf[1]; s++) d += " H" + (x0 + SP[BY_GDP[s]].amt * k) + " V" + (py + (s + 1) * bh + hf[2]);
      d += " H" + x0 + " Z";
      c.svg('<path d="' + d + '" fill="url(#paper)" filter="url(#sheetShadow)"/>' + '<path d="' + d + '" fill="url(#hatch-grey)"/>' + '<path d="' + d + '" fill="url(#s05sheen)"/>');
      c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    });
    c.svg(S.line(PSHEET.x - 10, PCREASE, PSHEET.x + PSHEET.w + 10, PCREASE, { stroke: T.white, "stroke-width": 1.5 }));
    var ax = PSHEET.x + PSHEET.w - 40;
    c.svg(S.line(ax, PCREASE - 16, ax, PCREASE - 96, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }) + chevron(ax, PCREASE - 96, 0, -1, 7, T.white));
    c.svg(S.line(ax, PCREASE + 16, ax, PCREASE + 96, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }) + chevron(ax, PCREASE + 96, 0, 1, 7, T.white));
    c.uiDiv(tb.x, tb.y, tb.w, x.eyebrow, TX.labelW + ";font-size:11px");
    c.uiDiv(tb.x, tb.y + 28, tb.w, x.l1, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.white);
    stateOn(c, { form: "steel plate cut in two → two sheets stacked", tone: "neutral, grey steel hatch; no red", note: "cut on S04's horizontal line, under S04's exit view; area no longer means money" }, { x: x0, y: py - gap, w: 200, h: bh * 10 + gap * 2 });
  }

  function phonePanels(c, f) {
    var T = c.T, TX = c.TX, S = SB.SVG, tb = c.textBox, x = texts(c);
    c.tilt(PTABLE);
    pTable(c, S, T);
    pTitles(c, x, f ? 0.5 : null);
    var mT = pTop(), mB = pBot();
    c.svg(hatchDefs("s05hp", PS * 1.6));
    var box = { x: 24, y: 380, w: 104, h: 112 }, sI = PS * 3;
    if (!f) {
      c.svg(fineHatch(turbineSvg(c, mT, { dims: true }), "s05hp"));
      turbineTags(c, mT, 10, { fig: false });
      c.svg(fineHatch(munitionSvg(c, mB, { red: true, dims: true }), "s05hp"));
      munitionTags(c, mB, 10, { fig: false });
      var fx = 104, fy = 70;
      detailMark(c, mB.x(fx), mB.y(fy), 24 * PS, c.label("D", "detail letter (drawing convention; no scale number)"), box, true);
      loupe(c, "s05lp", box, munitionSvg(c, map(box.x + box.w / 2 - fx * sI, box.y + box.h / 2 - fy * sI, sI), { red: true, dims: true }), sI);
      chip(c, box.x, box.y, c.label("DETAIL D"), 70, true);
      c.uiDiv(tb.x, tb.y, tb.w, x.l1, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.white);
      stateOn(c, { form: "split frame, stacked", tone: "neutral; blue turbine line (top); one red warhead (bottom), held 3× in the loupe", note: "no area meaning; one sheet folded on S04's cut line" }, PSHEET);
      return;
    }
    c.svg(fineHatch(munitionSvg(c, mT, { ghost: true, redDash: true }), "s05hp"));
    c.svg(turbineSvg(c, mT, { f: f, op: 0.7 }));
    var R0 = 86;
    function pt(a) { return (100 + R0 * Math.cos(a * Math.PI / 180)) + " " + (120 + R0 * Math.sin(a * Math.PI / 180)); }
    c.svg(grp(mT, P("M" + pt(29.8) + " A86 86 0 0 1 " + pt(84), { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 }) +
      P("M" + pt(150.2) + " A86 86 0 0 0 " + pt(96), { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 }) +
      P("M104 32 C 132 40, 136 84, 114 104", { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 })));
    c.svg(grp(mT, P("M87 96 L76 72 H72", { stroke: T.grey })));
    tag(c, mT, 70, 76, c.copy("WARHEAD", "index.html:374"), 10, { white: true, right: true, w: 70 });
    c.svg(fineHatch(munitionSvg(c, mB, { red: false, dims: true, op: 0.45 }), "s05hp"));
    munitionTags(c, mB, 10, { fig: false, op: 0.5 });
    c.svg(S.line(PSHEET.x - 8, PCREASE, PSHEET.x + PSHEET.w + 8, PCREASE, { stroke: T.white, "stroke-dasharray": "5 5", opacity: 0.8 }));
    c.svg(chevron(PSHEET.x + PSHEET.w - 30, PCREASE - 12, 0, 1, 6, T.white) + chevron(PSHEET.x + PSHEET.w - 30, PCREASE + 12, 0, -1, 6, T.white));
    var hx = 100, hy = 112;
    detailMark(c, mT.x(hx), mT.y(hy), 22 * PS, c.label("E", "detail letter (drawing convention; no scale number)"), box, true);
    loupe(c, "s05lp", box, munitionSvg(c, map(box.x + box.w / 2 - hx * sI, box.y + box.h / 2 - hy * sI, sI), { ghost: true, redDash: true }) + turbineSvg(c, map(box.x + box.w / 2 - hx * sI, box.y + box.h / 2 - hy * sI, sI), { f: f, op: 0.85 }), sI);
    chip(c, box.x, box.y, c.label("DETAIL E"), 70, true);
    c.uiDiv(tb.x, tb.y, tb.w, x.l2, TX.value + ";font-weight:600;font-size:20px;line-height:1.35;color:" + T.white);
    stateOn(c, { form: "stacked split, fold in progress", tone: "blue fading (top); red moves to the new warhead; bottom goes grey", note: "fold line closes at 0.65" }, PSHEET);
  }

  function phonePush(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox;
    var altB = c.alt === "B";
    c.tilt({ rx: 7, ry: 0, rz: -1.2, persp: 1000 });
    c.svg(S.grid(-300, -300, 1000, 1400, 34, { ticks: false }));
    c.svg(litSheet(st.x, st.y, st.w, st.h));
    c.svg(S.grid(st.x + 6, st.y + 6, st.w - 12, st.h - 12, 27, { ticks: false }));
    c.svg(S.rect(st.x + 6.5, st.y + 6.5, st.w - 13, st.h - 13, { fill: "none", stroke: T.sheetLine }));
    c.svg(S.rect(st.x, st.y, st.w, st.h, { fill: "url(#s05sheen)" }));
    // scale 1.0 with a 26px origin keeps 'Ø C' clear of the drawing's border (it sat on it at 1.04)
    var m = map(26, 70, 1.0);
    c.svg(hatchDefs("s05h2p", 1.6));
    c.svg(fineHatch(fig2Svg(c, m, { red: true }), "s05h2p"));
    pushMarks(c, [{ f: [52, 522], t: [29, 544] }, { f: [323, 522], t: [346, 544] }], 10);
    fig2Tags(c, m, 9, 10, { names: false, diaBelow: true });
    c.div(st.x + 14, st.y + 14, null, c.copy("FIG. 2 — MUNITION", "index.html:475"), TX.labelW + ";font-size:10px");
    c.div(st.x + 14, st.y + 30, null, c.copy("STATUS: IN PRODUCTION", "index.html:479"), TX.label + ";font-size:10px");
    BALLOONS.forEach(function (b, i) {
      c.div(st.x + 14, 268 + i * 16, 180, c.copy(b.key[0], b.key[1]), TX.label + ";font-size:10px;white-space:nowrap");
    });
    // section A–A, boxed with its chip
    var sb = { x: 238, y: 256, w: 104, h: 96 };
    c.svg(S.rect(sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, { fill: "none", stroke: T.white, "stroke-width": 1 }));
    c.svg(S.rect(sb.x, sb.y - 17, 100, 17, { fill: T.white }));
    sectionAA(c, sb.x + sb.w / 2, sb.y + sb.h / 2, 30, 10, { chip: { x: sb.x + 5, y: sb.y - 15 } });
    var g = vol(c);
    c.svg(S.line(st.x + 14, 372, st.x + st.w - 14, 372, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(st.x + 14, 382, null, g.v, TX.value + ";font-size:34px");
    c.div(st.x + 14, 424, st.w - 28, g.lbl, TX.label + ";font-size:10px");
    c.div(st.x + 14, 474, st.w - 28, g.src, TX.src + ";font-size:10px");
    if (!altB) {
      var r = rev(c);
      c.uiDiv(tb.x, tb.y, tb.w, r.lbl, TX.label + ";font-size:10px");
      c.uiDiv(tb.x - 3, tb.y + 30, null, r.v, TX.giant + ";font-size:84px");
      c.uiDiv(tb.x, tb.y + 122, tb.w, r.src, TX.src + ";font-size:10px");
      c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05 (Alt B).");
    } else {
      c.uiDiv(tb.x, tb.y, tb.w, texts(c).l2, TX.value + ";font-weight:600;font-size:20px;line-height:1.35;color:" + T.white);
      c.flag("decision", "Alt B: $679B dropped from S05 because it has no data.js field (audit F01).");
    }
    stateOn(c, { form: "one drawing (FIG. 2), fills the stage", tone: "neutral paper; one red mark (warhead section 3)", note: "pushed in; sheet nearly flat; no area meaning" + (altB ? "; Alt B: no $679B" : "") }, st);
  }

  function phoneExit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox, x = texts(c);
    var R = c.rung("DEFENCE", SB.get("DEFENCE"), st, "bl");
    c.svg(S.sheet(R.x, R.y, R.w, R.h, { tone: "red", mode: "edge", sw: 1.5, tab: true, tabSize: 6, flat: true }));
    c.svg(S.rect(st.x + 6.5, st.y + 6.5, st.w - 13, st.h - 13, { fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 6" }));
    rungsIn(c, 0.35);
    var A = { x: 30, y: 102, w: 316 }, B = { x: st.x + st.w - 128, y: st.y + 168, w: 108 }, t = 0.8;
    function at(u) { return { x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, w: A.w + (B.w - A.w) * u }; }
    var M = at(t);
    var G = at(0.4);
    c.svg(parked(G.x, G.y, G.w, S, T, 0.16));
    c.svg(parked(M.x, M.y, M.w, S, T, 1)); // its parked spot sits inside its own path on phone, so no target box
    var x1 = M.x + 4, y1 = M.y + M.w * 0.5 + 6, x2 = B.x - 10, y2 = B.y + B.w * 0.5 + 2, len = Math.hypot(x2 - x1, y2 - y1);
    c.svg(S.line(x1, y1, x2, y2, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "2 4" }) + chevron(x2, y2, (x2 - x1) / len, (y2 - y1) / len, 6, T.white));
    var o = "opacity:0.55";
    // same place and size as S06 'in' (scenes/s06.js), fading up
    c.svg(S.line(st.x + 16, st.y + 22, st.x + st.w - 16, st.y + 22, { stroke: "rgba(255,255,255,0.3)", opacity: 0.55 }));
    c.div(st.x + 16, st.y + 30, 300, c.fig("machineData[0].name", "raw").toUpperCase() + " · " + c.label("SIPRI 2026"), TX.label + ";font-size:10px;" + o);
    c.div(st.x + 12, st.y + 50, null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:90px;" + o);
    c.div(tb.x, tb.y, tb.w, x.l2, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.grey);
    c.flag("decision", "Exit parks the drawing inside the $2.89T sheet (S06's entry). It has no area and must not read as a share of $2.89T. Alternative: park it outside the sheet.");
    c.state({ form: "sheet, full stage ($2.89T); drawing shrinking to its parked spot", x: st.x, y: st.y, w: st.w, h: st.h, tone: "red edge back, neutral paper; drawing grey; S06's rungs fading in", note: "no tilt: area = DEFENCE again. At p = 1 this is S06 'in' (drawing at 231, 224, w 108)" });
  }

  function phonePlate(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, tb = c.textBox, x = texts(c);
    c.tilt(PTABLE);
    pTable(c, S, T);
    pTitles(c, x);
    var mT = pTop(), mB = pBot();
    c.svg(hatchDefs("s05hp", PS * 1.6));
    c.svg(fineHatch(turbineSvg(c, mT, { dims: true }), "s05hp"));
    turbineTags(c, mT, 10, { fig: false });
    c.svg(fineHatch(munitionSvg(c, mB, { red: true, dims: true }), "s05hp"));
    munitionTags(c, mB, 10, { fig: false });
    c.uiDiv(tb.x, tb.y - 4, tb.w, x.l1 + " <b style=\"color:" + T.white + ";font-weight:600\">" + x.l2 + "</b>", TX.bodySm + ";font-size:14px;line-height:1.45");
    var r = rev(c), g = vol(c), cw = 163, y = tb.y + 74;
    c.uiSvg(S.line(tb.x, y, tb.x + cw, y, { stroke: "rgba(255,255,255,0.3)" }) + S.line(tb.x + cw + 17, y, tb.x + tb.w, y, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(tb.x - 1, y + 8, null, r.v, TX.giant + ";font-size:30px");
    c.uiDiv(tb.x, y + 44, cw, r.lbl, TX.label + ";font-size:10px;letter-spacing:0.08em");
    c.uiDiv(tb.x, y + 104, cw, r.src, TX.src + ";font-size:10px");
    c.uiDiv(tb.x + cw + 17, y + 8, null, g.v, TX.value + ";font-size:28px");
    c.uiDiv(tb.x + cw + 17, y + 44, cw, g.lbl, TX.label + ";font-size:10px;letter-spacing:0.08em");
    c.uiDiv(tb.x + cw + 17, y + 104, cw, g.src, TX.src + ";font-size:10px");
    c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05.");
    stateOn(c, { form: "stacked split (still)", tone: "neutral; blue turbine line; one red warhead", note: "plate: both drawings, both copy lines, both figures" }, PSHEET);
  }
})();
