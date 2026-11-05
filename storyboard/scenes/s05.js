/* S05 · THE LINE OF PRODUCTION · MORPH + SPLIT · 1.5 screens
   S04's steel plate is cut down its centre line. The two halves become
   two drawing sheets in a split frame: CLEAN ENERGY (the turbine, blue
   line) and MUNITIONS (white line, one red warhead). The turbine folds
   into a munition and the blue drains as the red takes over. The split
   closes into one drawing (FIG. 2), the camera pushes in, and the
   figures land as still spec figures. At the exit the drawing shrinks
   into the top-right corner and its paper re-reads as the $2.89T sheet
   S06 pulls wide from.

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
  function sectionAA(c, cx, cy, R, size) {
    var T = c.T, S = SB.SVG, r2 = R * 0.68, r3 = R * 0.26;
    var ring = "M" + (cx - R) + " " + cy + " a" + R + " " + R + " 0 1 0 " + 2 * R + " 0 a" + R + " " + R + " 0 1 0 " + -2 * R + " 0 Z " +
      "M" + (cx - r2) + " " + cy + " a" + r2 + " " + r2 + " 0 1 0 " + 2 * r2 + " 0 a" + r2 + " " + r2 + " 0 1 0 " + -2 * r2 + " 0 Z";
    c.svg(P(ring, { fill: "url(#hatch-grey)", rule: "evenodd" }));
    c.svg(S.circle(cx, cy, R, { fill: "none", stroke: T.white, "stroke-width": 1.5 }));
    c.svg(S.circle(cx, cy, r2, { fill: "none", stroke: T.grey, "stroke-width": 1 }));
    c.svg(S.circle(cx, cy, r3, { fill: "none", stroke: T.grey, "stroke-width": 1 }));
    c.svg(S.line(cx - R - 10, cy, cx + R + 10, cy, { stroke: T.grey, "stroke-dasharray": "8 3 2 3" }));
    c.svg(S.line(cx, cy - R - 10, cx, cy + R + 10, { stroke: T.grey, "stroke-dasharray": "8 3 2 3" }));
    c.div(cx - 60, cy + R + 14, 120, c.copy("SECTION A–A", "index.html:463 (scale '2:1' dropped)"), c.TX.label + ";font-size:" + size + "px;text-align:center");
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
  function paper(c, pn, o) {
    var T = c.T, S = SB.SVG;
    o = o || {};
    if (o.ghost) return c.svg(S.rect(pn.x + 0.5, pn.y + 0.5, pn.w - 1, pn.h - 1, { fill: "none", stroke: T.sheetLine, "stroke-dasharray": "4 6" }));
    c.svg(S.rect(pn.x, pn.y, pn.w, pn.h, { fill: T.sheet, stroke: T.sheetLine, opacity: o.op }));
    if (o.grid) c.svg('<g opacity="' + (o.op == null ? 1 : o.op) + '">' + S.grid(pn.x, pn.y, pn.w, pn.h, o.grid, { ticks: false }) + "</g>");
  }
  function panelTab(c, pn, html, blue, o) {
    var T = c.T, S = SB.SVG;
    o = o || {};
    var th = o.h || 28, tw = o.w || 200, fs = o.fs || 11;
    if (o.inside) {
      if (blue) c.svg(S.rect(pn.x + 10, pn.y + 10, 8, 8, { fill: T.blue }));
      c.div(pn.x + (blue ? 24 : 10), pn.y + 7, null, html, c.TX.labelW + ";font-size:" + fs + "px");
      return;
    }
    c.svg(S.rect(pn.x, pn.y - th, tw, th, { fill: T.sheet, stroke: T.sheetLine }));
    if (blue) c.svg(S.rect(pn.x + 12, pn.y - th / 2 - 4, 8, 8, { fill: T.blue }));
    c.div(pn.x + (blue ? 28 : 12), pn.y - th / 2 - 8, null, html, c.TX.labelW + ";font-size:" + fs + "px");
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
      { k: "in", p: 0, cap: "Hard state change on S04's cut line: the steel plate splits. One half slides into each sheet of a split frame, CLEAN ENERGY and MUNITIONS. Construction lines start on both sheets. Area stops meaning money here: this is drawing stock." },
      { k: "mid", p: 0.3, cap: "Split frame, wide and still. Left: the turbine, line-work in blue. Right: the munition in white line; its warhead is the one red mark. Same stock, same sheet. First line of copy." },
      { k: "fold", p: 0.55, cap: "The turbine folds into a munition: blades swing down along the mast, the mast swells into the casing (dashed). Blue drains as the new warhead takes the red; the right-hand munition goes grey. The split line closes next." },
      { k: "push", p: 0.8, cap: "Hard cut at 0.65: the split closes into one drawing (FIG. 2) and the camera pushes in until its border meets the frame (corner ticks: where the border sat at the cut). $679B lands whole, a still spec figure with no count-up. +9.2% stands apart with its own label: transfer volume, not money." },
      { k: "out", p: 0.95, cap: "Exit, mid-move: the drawing shrinks toward the top-right corner (dashed: where it parks). Its border dissolves; the paper is full frame again and re-reads as the $2.89T sheet, red edge back. S06's rungs fade in. At p = 1 the frame is S06 'in', and the pull starts." },
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
      if (c.phone) phonePlate(c);
      else deskPlate(c);
    },
  });

  /* ═══ DESKTOP ═══════════════════════════════════════════════════ */
  var DL = { x: 120, y: 176, w: 580, h: 620 }, DR = { x: 740, y: 176, w: 580, h: 620 }, DS = 2.3;
  function dOrigin(pn) { return map(pn.x + 60, pn.y + 24, DS); }

  // 'in': S04's plate cut in two at its centre line (S04 ends with the camera 20px right).
  function deskSplit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    var off = 20, base = 690, k = 440 / MAXAMT, cw = 68, px0 = (c.W - cw * 10) / 2 + off, gap = 40;
    var L = { x: DL.x + off, y: DL.y, w: DL.w, h: DL.h }, R = { x: DR.x + off, y: DR.y, w: DR.w, h: DR.h };
    paper(c, L, { ghost: true });
    paper(c, R, { ghost: true });
    panelTab(c, L, x.clean, true);
    panelTab(c, R, x.war, false);
    // construction lines: what each half is about to become
    var mL = dOrigin(L), mR = dOrigin(R);
    c.svg(S.line(mL.x(100), mL.y(30), mL.x(100), mL.y(242), { stroke: T.blue, "stroke-dasharray": "10 6", opacity: 0.8 }));
    c.svg(S.circle(mL.x(100), mL.y(120), 86 * DS, { fill: "none", stroke: T.blue, "stroke-dasharray": "3 7", opacity: 0.55 }));
    c.svg(S.line(mR.x(100), mR.y(14), mR.x(100), mR.y(250), { stroke: T.grey, "stroke-dasharray": "14 4 2 4", opacity: 0.8 }));
    c.svg(S.line(mR.x(87), mR.y(78), mR.x(87), mR.y(230), { stroke: T.grey, "stroke-dasharray": "3 6", opacity: 0.6 }));
    c.svg(S.line(mR.x(113), mR.y(78), mR.x(113), mR.y(230), { stroke: T.grey, "stroke-dasharray": "3 6", opacity: 0.6 }));
    // the two halves of the plate (GDP order, as S04 left them), parting
    [[0, 5, -gap], [5, 10, gap]].forEach(function (hf) {
      var x0 = px0 + hf[0] * cw + hf[2];
      var d = "M" + x0 + " " + base;
      for (var s = hf[0]; s < hf[1]; s++) {
        var xx = px0 + s * cw + hf[2], h = SP[BY_GDP[s]].amt * k;
        d += " V" + (base - h) + " H" + (xx + cw);
      }
      d += " V" + base + " Z";
      c.svg('<path d="' + d + '" fill="' + T.sheet + '"/>' + '<path d="' + d + '" fill="url(#hatch-grey)"/>');
      c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    });
    // the cut: now the split line of the frame
    var cut = c.W / 2 + off;
    c.svg(S.line(cut, 140, cut, 836, { stroke: T.white, "stroke-width": 1.5 }));
    var ay = base + 52;
    c.svg(S.line(cut - 30, ay, cut - 210, ay, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 5" }) + chevron(cut - 210, ay, -1, 0, 8, T.white));
    c.svg(S.line(cut + 30, ay, cut + 210, ay, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 5" }) + chevron(cut + 210, ay, 1, 0, 8, T.white));
    c.uiDiv(120, 70, 600, x.eyebrow, TX.labelW + ";font-size:13px");
    c.state({ form: "steel plate cut in two → two drawing sheets (split frame)", x: px0 - gap, y: base - 440, w: cw * 10 + gap * 2, h: 440, tone: "neutral, grey steel hatch; blue construction line on the left sheet; no red", note: "cut on S04's centre line; halves keep their stepped outline but area no longer means money (drawing stock)" });
  }

  // 'mid' (f = 0) and 'fold' (f = 0.5): two sheets side by side
  function deskPanels(c, f) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    paper(c, DL, { grid: 46 });
    paper(c, DR, { grid: 46, op: f ? 0.8 : 1 });
    panelTab(c, DL, x.clean, true);
    panelTab(c, DR, x.war, false);
    var mL = dOrigin(DL), mR = dOrigin(DR);
    if (!f) {
      c.svg(turbineSvg(c, mL, { dims: true }));
      turbineTags(c, mL, 11);
      c.svg(munitionSvg(c, mR, { red: true, dims: true }));
      munitionTags(c, mR, 11);
      c.svg(S.line(c.W / 2, 140, c.W / 2, 836, { stroke: T.white, "stroke-width": 1.5 }));
      c.uiDiv(120, 64, 1100, x.l1, TX.value + ";font-weight:400;font-size:30px;color:" + T.white);
      c.state({ form: "split frame: two drawing sheets", x: DL.x, y: DL.y, w: DR.x + DR.w - DL.x, h: DL.h, tone: "neutral paper; turbine line in blue (left); one red warhead (right)", note: "no area meaning: drawings" });
      return;
    }
    // the fold: target outline first, the turbine folding over it, motion arcs on top
    c.svg(munitionSvg(c, mL, { ghost: true, redDash: true }));
    c.svg(turbineSvg(c, mL, { f: f, op: 0.7, dims: false }));
    var arcs = "";
    var R0 = 86;
    function pt(a) { return (100 + R0 * Math.cos(a * Math.PI / 180)) + " " + (120 + R0 * Math.sin(a * Math.PI / 180)); }
    arcs += P("M" + pt(29.8) + " A" + R0 + " " + R0 + " 0 0 1 " + pt(84), { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    arcs += P("M" + pt(150.2) + " A" + R0 + " " + R0 + " 0 0 0 " + pt(96), { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    arcs += P("M104 32 C 132 40, 136 84, 114 104", { stroke: T.white, sw: 1.25, dash: "3 5", op: 0.8 });
    c.svg(grp(mL, arcs));
    var a1 = [mL.x(100 + R0 * Math.cos(84 * Math.PI / 180)), mL.y(120 + R0 * Math.sin(84 * Math.PI / 180))];
    var a2 = [mL.x(100 + R0 * Math.cos(96 * Math.PI / 180)), mL.y(120 + R0 * Math.sin(96 * Math.PI / 180))];
    c.svg(chevron(a1[0], a1[1], -0.99, 0.1, 9, T.white) + chevron(a2[0], a2[1], 0.99, 0.1, 9, T.white) + chevron(mL.x(114), mL.y(104), -0.6, 0.8, 9, T.white));
    tag(c, mL, 8, 16, c.copy("FIG. 1a — TURBINE", "index.html:343"), 11, { white: true });
    // the new warhead's callout sits left, clear of the fold arcs
    c.svg(grp(mL, P("M87 96 L76 72 H72", { stroke: T.grey })));
    tag(c, mL, 70, 76, c.copy("WARHEAD", "index.html:374"), 11, { white: true, right: true, w: 80 });
    // right sheet: the template munition, gone grey (its red has moved left)
    c.svg(munitionSvg(c, mR, { red: false, dims: true, op: 0.45 }));
    munitionTags(c, mR, 11, { op: 0.5 });
    c.svg(S.line(c.W / 2, 140, c.W / 2, 836, { stroke: T.white, "stroke-width": 1, "stroke-dasharray": "6 6", opacity: 0.7 }));
    c.svg(chevron(c.W / 2 - 10, 486, 1, 0, 8, T.white) + chevron(c.W / 2 + 10, 486, -1, 0, 8, T.white));
    c.uiDiv(120, 58, 1100, x.l1, TX.value + ";font-weight:400;font-size:28px;color:" + T.grey);
    c.uiDiv(120, 98, 1100, x.l2, TX.value + ";font-weight:600;font-size:28px;color:" + T.white);
    c.state({ form: "split frame, fold in progress", x: DL.x, y: DL.y, w: DR.x + DR.w - DL.x, h: DL.h, tone: "neutral paper; blue fading on the left; the one red mark moves to the new warhead", note: "split line dashed: it closes (hard cut) at 0.65" });
  }

  function deskPush(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    var altB = c.alt === "B";
    // paper fills the frame; the drawing's border meets it (camera pushed in)
    c.svg(S.rect(0, 0, c.W, c.H, { fill: T.sheet }));
    c.svg(S.grid(48, 56, 1344, 788, 36, { ticks: false }));
    c.svg(S.rect(40.5, 48.5, 1359, 803, { fill: "none", stroke: T.sheetLine }));
    c.svg(S.rect(48.5, 56.5, 1343, 787, { fill: "none", stroke: T.sheetLine }));
    var m = map(250 - 22 * 3.6, 150 - 34 * 3.6, 3.6);
    c.svg(fig2Svg(c, m, { red: true }));
    // the push: where the drawing's border sat at the cut (corner ticks), carried out to the frame
    pushMarks(c, [{ f: [100, 136], t: [56, 64] }, { f: [100, 768], t: [56, 836] }, { f: [1340, 768], t: [1384, 836] }], 14);
    fig2Tags(c, m, 18, 12, { names: true });
    sectionAA(c, m.x(158), 735, 58, 12);
    // title block, top right (numbers removed)
    var tb = { x: 1132, y: 56, w: 260, h: 66 };
    c.svg(S.rect(tb.x + 0.5, tb.y + 0.5, tb.w - 1, tb.h - 1, { fill: T.sheet, stroke: T.sheetLine }));
    c.svg(S.line(tb.x, tb.y + 22, tb.x + tb.w, tb.y + 22, { stroke: T.sheetLine }) + S.line(tb.x, tb.y + 44, tb.x + tb.w, tb.y + 44, { stroke: T.sheetLine }));
    c.div(tb.x + 10, tb.y + 5, null, c.copy("FIG. 2 — MUNITION", "index.html:475"), TX.labelW + ";font-size:11px");
    c.div(tb.x + 10, tb.y + 27, null, c.newCopy("SCALE · NTS", "replaces 'SCALE 1:40' (index.html:476); NTS = not to scale, marks the drawing as illustrative"), TX.label + ";font-size:11px");
    c.div(tb.x + 10, tb.y + 49, null, c.copy("STATUS: IN PRODUCTION", "index.html:479"), TX.labelW + ";font-size:11px");
    c.uiDiv(120, 70, 960, x.l2, TX.value + ";font-weight:600;font-size:30px;color:" + T.white);
    // the two spec figures, apart
    var g = vol(c);
    var gx = altB ? 120 : 900;
    c.svg(S.line(gx, 650, gx + 420, 650, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(gx, 662, 420, g.lbl, TX.label + ";font-size:12px");
    c.div(gx - 2, 704, null, g.v, TX.value + ";font-size:60px");
    c.div(gx, 776, 420, g.src, TX.src);
    if (!altB) {
      var r = rev(c);
      c.svg(S.line(120, 650, 600, 650, { stroke: "rgba(255,255,255,0.3)" }));
      c.div(120, 662, 480, r.lbl, TX.label + ";font-size:12px");
      c.div(114, 700, null, r.v, TX.giant + ";font-size:104px");
      c.div(120, 808, 440, r.src, TX.src);
      c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it (679, $B, 2024, SIPRI Top 100 link at index.html:489) to data.js and DATA-SOURCES.md, or drop it from S05 (Alt B).");
    } else {
      c.flag("decision", "Alt B: $679B dropped from S05 because it has no data.js field (audit F01). +9.2% stands alone with its volume label.");
    }
    c.state({ form: "one engineering drawing (FIG. 2), full frame", x: 0, y: 0, w: c.W, h: c.H, tone: "neutral paper, white/grey line; one red mark (warhead section 3)", note: "camera pushed in: drawing border meets the frame; no area meaning" + (altB ? "; Alt B: no $679B" : "") });
  }

  function deskExit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage;
    var R = c.rung("DEFENCE", SB.get("DEFENCE"), st, "bl"); // full frame = $2.89T, as at S06 entry
    c.svg(S.sheet(R.x, R.y, R.w, R.h, { tone: "red", mode: "edge", sw: 1.5, tab: true, tabSize: 8 }));
    // the drawing's border, which met the frame in the push, dissolving
    c.svg(S.rect(40.5, 48.5, 1359, 803, { fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 8" }));
    rungsIn(c, 0.35);
    // the drawing mid-shrink, on its way to S06's parked spot (dashed)
    var A = { x: 290, y: 167, w: 980 }, B = { x: 1150, y: 78, w: 220 }, t = 0.6;
    var M = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, w: A.w + (B.w - A.w) * t };
    c.svg(S.rect(B.x - 8, B.y - 8, B.w + 16, B.w * 0.5 + 16, { fill: "none", stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }));
    [[0, 0], [1, 0.5]].forEach(function (k) {
      var x1 = M.x + M.w * k[0], y1 = M.y + M.w * k[1], x2 = B.x - 8 + (B.w + 16) * k[0], y2 = B.y - 8 + (B.w * 0.5 + 16) * k[1] * 2;
      var len = Math.hypot(x2 - x1, y2 - y1);
      c.svg(S.line(x1, y1, x2, y2, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 5" }) + chevron(x2, y2, (x2 - x1) / len, (y2 - y1) / len, 9, T.white));
    });
    c.svg(parked(M.x, M.y, M.w, S, T, 1));
    // the sheet re-reads as money: S06's label arrives
    var o = "opacity:0.55";
    c.svg(S.line(120, 84, 760, 84, { stroke: "rgba(255,255,255,0.3)", opacity: 0.55 }));
    c.div(120, 96, 700, c.fig("machineData[0].name", "raw").toUpperCase() + " · " + c.label("SIPRI 2026"), TX.label + ";font-size:13px;" + o);
    c.div(114, 124, null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:120px;" + o);
    c.flag("decision", "Exit parks the drawing in the top-right corner of the $2.89T sheet (S06's entry). The drawing has no area: it must not read as a share of $2.89T ($679B is company revenue, a different measure). Alternative: park it outside the sheet.");
    c.state({ form: "sheet, full frame ($2.89T); drawing shrinking to the top-right corner", x: 0, y: 0, w: c.W, h: c.H, tone: "red edge back, neutral paper; drawing grey line art (red warhead gone); S06's rungs fading in", note: "area = DEFENCE at the frame's fit again. At p = 1 this is S06 'in': drawing parked at 1150, 78, w 220; rungs at full strength" });
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
    list.forEach(function (it) { c.svg(S.sheet(it.r.x, it.r.y, it.r.w, it.r.h, { tone: it.tone, mode: "edge", sw: 1.25, opacity: op })); });
    var lo = ";opacity:" + Math.min(1, op + 0.2);
    if (!c.phone) {
      list.forEach(function (it, i) {
        var r = it.r, pad = i === 0 ? 24 : 14;
        c.div(r.x + pad, r.y + pad - 4, r.w - pad * 2, it.value, TX.value + ";font-size:" + (i === 0 ? 40 : 22) + "px" + lo);
        c.div(r.x + pad, r.y + pad + (i === 0 ? 42 : 22), r.w - pad * 2, it.name, TX.label + ";font-size:11px" + lo);
      });
    } else {
      var r9 = list[0].r;
      c.div(r9.x + 14, r9.y + 12, r9.w - 20, list[0].value, TX.value + ";font-size:24px" + lo);
      c.div(r9.x + 14, r9.y + 42, r9.w - 20, list[0].name, TX.label + ";font-size:10px" + lo);
      var qx = r9.x + r9.w + 14, qw = st.x + st.w - qx - 6;
      [[list[1], list[1].r.y - 26], [list[2], list[2].r.y + 4]].forEach(function (a) {
        var it = a[0], y = a[1];
        c.svg(S.rect(qx - 1, y + 6, 9, 9, { fill: "none", stroke: it.tone === "blue" ? T.blue : T.red, "stroke-width": 1.5, opacity: op }));
        c.div(qx + 16, y, qw - 16, it.value, TX.value + ";font-size:16px" + lo);
        c.div(qx + 16, y + 22, qw - 16, it.name, TX.label + ";font-size:10px" + lo);
      });
    }
    return list;
  }

  // Phone: the scene name is too long for the shared top bar at 375px, so S05 sets its own (same
  // labels, one size down). Desktop uses the shared chrome.
  function chrome(c) {
    if (!c.phone) return c.chrome();
    c.chrome({ labels: false });
    c.uiDiv(16, 10, null, c.label("THE COST OF WAR", "top bar"), c.TX.labelW + ";font-size:11px");
    c.uiDiv(c.W - 16 - 220, 11, 220, c.label("S05 · THE LINE OF PRODUCTION", "top bar, one size down to fit 375px"), c.TX.label + ";font-size:10px;letter-spacing:0.06em;text-align:right");
  }

  function deskPlate(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, x = texts(c);
    var L = { x: 120, y: 190, w: 400, h: 520 }, R = { x: 540, y: 190, w: 400, h: 520 };
    paper(c, L, { grid: 40 });
    paper(c, R, { grid: 40 });
    panelTab(c, L, x.clean, true);
    panelTab(c, R, x.war, false);
    var mL = map(L.x + 20, L.y + 36, 1.8), mR = map(R.x + 20, R.y + 36, 1.8);
    c.svg(turbineSvg(c, mL, { dims: true }));
    turbineTags(c, mL, 10);
    c.svg(munitionSvg(c, mR, { red: true, dims: true }));
    munitionTags(c, mR, 10);
    c.svg(S.line(530, 160, 530, 730, { stroke: T.white, "stroke-width": 1.5 }));
    c.div(120, 52, 1200, x.l1, TX.value + ";font-weight:400;font-size:28px;color:" + T.white);
    c.div(120, 92, 1200, x.l2, TX.value + ";font-weight:600;font-size:28px;color:" + T.white);
    var r = rev(c), g = vol(c);
    c.svg(S.line(1010, 190, 1320, 190, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(1010, 202, 310, r.lbl, TX.label + ";font-size:12px");
    c.div(1004, 252, null, r.v, TX.giant + ";font-size:96px");
    c.div(1010, 350, 310, r.src, TX.src);
    c.svg(S.line(1010, 470, 1320, 470, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(1010, 482, 310, g.lbl, TX.label + ";font-size:12px");
    c.div(1008, 528, null, g.v, TX.value + ";font-size:56px");
    c.div(1010, 606, 310, g.src, TX.src);
    c.div(120, 736, 820, c.newCopy("SCALE · NTS", "replaces 'SCALE 1:40' (index.html:476); NTS = not to scale, marks the drawings as illustrative"), TX.src);
    c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05.");
    c.state({ form: "split frame (still), no motion", x: L.x, y: L.y, w: R.x + R.w - L.x, h: L.h, tone: "neutral; blue turbine line; one red warhead", note: "plate shows both drawings, both copy lines and both figures" });
  }

  /* ═══ PHONE · split stacks top / bottom ═════════════════════════ */
  var PT = { x: 16, y: 56, w: 343, h: 244 }, PB = { x: 16, y: 312, w: 343, h: 244 }, PS = 0.84;
  function pOrigin(pn) { return map(pn.x + (pn.w - 200 * PS) / 2 - 6, pn.y + 26, PS); }

  function phoneSplit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox, x = texts(c);
    var k = 214 / MAXAMT, bh = 14, py = st.y + (st.h - bh * 10) / 2, gap = 34;
    paper(c, PT, { ghost: true });
    paper(c, PB, { ghost: true });
    panelTab(c, PT, x.clean, true, { inside: true, fs: 10 });
    panelTab(c, PB, x.war, false, { inside: true, fs: 10 });
    [[0, 5, -gap], [5, 10, gap]].forEach(function (hf) {
      var y0 = py + hf[0] * bh + hf[2];
      var d = "M" + st.x + " " + y0;
      for (var s = hf[0]; s < hf[1]; s++) d += " H" + (st.x + SP[BY_GDP[s]].amt * k) + " V" + (py + (s + 1) * bh + hf[2]);
      d += " H" + st.x + " Z";
      c.svg('<path d="' + d + '" fill="' + T.sheet + '"/>' + '<path d="' + d + '" fill="url(#hatch-grey)"/>');
      c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    });
    var cut = py + bh * 5;
    c.svg(S.line(st.x, cut, st.x + st.w, cut, { stroke: T.white, "stroke-width": 1.5 }));
    var ax = st.x + st.w - 40;
    c.svg(S.line(ax, cut - 16, ax, cut - 96, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }) + chevron(ax, cut - 96, 0, -1, 7, T.white));
    c.svg(S.line(ax, cut + 16, ax, cut + 96, { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "3 4" }) + chevron(ax, cut + 96, 0, 1, 7, T.white));
    c.div(tb.x, tb.y, tb.w, x.eyebrow, TX.labelW + ";font-size:11px");
    c.div(tb.x, tb.y + 28, tb.w, x.l1, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.white);
    c.state({ form: "steel plate cut in two → two sheets stacked", x: st.x, y: py - gap, w: st.w, h: bh * 10 + gap * 2, tone: "neutral, grey steel hatch; no red", note: "cut on S04's horizontal line; area no longer means money" });
  }

  function phonePanels(c, f) {
    var T = c.T, TX = c.TX, S = SB.SVG, tb = c.textBox, x = texts(c);
    paper(c, PT, { grid: 34 });
    paper(c, PB, { grid: 34, op: f ? 0.8 : 1 });
    panelTab(c, PT, x.clean, true, { inside: true, fs: 10 });
    panelTab(c, PB, x.war, false, { inside: true, fs: 10 });
    var mT = pOrigin(PT), mB = pOrigin(PB);
    if (!f) {
      c.svg(turbineSvg(c, mT, { dims: true }));
      turbineTags(c, mT, 10, { fig: false });
      c.svg(munitionSvg(c, mB, { red: true, dims: true }));
      munitionTags(c, mB, 10, { fig: false });
      c.svg(S.line(PT.x, 306, PT.x + PT.w, 306, { stroke: T.white, "stroke-width": 1.5 }));
      c.div(tb.x, tb.y, tb.w, x.l1, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.white);
      c.state({ form: "split frame, stacked", x: PT.x, y: PT.y, w: PT.w, h: PB.y + PB.h - PT.y, tone: "neutral; blue turbine line (top); one red warhead (bottom)", note: "no area meaning" });
      return;
    }
    c.svg(munitionSvg(c, mT, { ghost: true, redDash: true }));
    c.svg(turbineSvg(c, mT, { f: f, op: 0.7 }));
    var R0 = 86;
    function pt(a) { return (100 + R0 * Math.cos(a * Math.PI / 180)) + " " + (120 + R0 * Math.sin(a * Math.PI / 180)); }
    c.svg(grp(mT, P("M" + pt(29.8) + " A86 86 0 0 1 " + pt(84), { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 }) +
      P("M" + pt(150.2) + " A86 86 0 0 0 " + pt(96), { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 }) +
      P("M104 32 C 132 40, 136 84, 114 104", { stroke: T.white, sw: 1, dash: "2 4", op: 0.8 })));
    c.svg(grp(mT, P("M87 96 L76 72 H72", { stroke: T.grey })));
    tag(c, mT, 70, 76, c.copy("WARHEAD", "index.html:374"), 10, { white: true, right: true, w: 70 });
    c.svg(munitionSvg(c, mB, { red: false, dims: true, op: 0.45 }));
    munitionTags(c, mB, 10, { fig: false, op: 0.5 });
    c.svg(S.line(PT.x, 306, PT.x + PT.w, 306, { stroke: T.white, "stroke-dasharray": "5 5", opacity: 0.7 }));
    c.svg(chevron(PT.x + PT.w - 40, 294, 0, 1, 6, T.white) + chevron(PT.x + PT.w - 40, 318, 0, -1, 6, T.white));
    c.div(tb.x, tb.y, tb.w, x.l2, TX.value + ";font-weight:600;font-size:20px;line-height:1.35;color:" + T.white);
    c.state({ form: "stacked split, fold in progress", x: PT.x, y: PT.y, w: PT.w, h: PB.y + PB.h - PT.y, tone: "blue fading (top); red moves to the new warhead; bottom goes grey", note: "split closes at 0.65" });
  }

  function phonePush(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox;
    var altB = c.alt === "B";
    c.svg(S.rect(st.x, st.y, st.w, st.h, { fill: T.sheet }));
    c.svg(S.grid(st.x + 6, st.y + 6, st.w - 12, st.h - 12, 27, { ticks: false }));
    c.svg(S.rect(st.x + 6.5, st.y + 6.5, st.w - 13, st.h - 13, { fill: "none", stroke: T.sheetLine }));
    // scale 1.0 with a 26px origin keeps 'Ø C' clear of the drawing's border (it sat on it at 1.04)
    var m = map(26, 70, 1.0);
    c.svg(fig2Svg(c, m, { red: true }));
    pushMarks(c, [{ f: [52, 522], t: [29, 544] }, { f: [323, 522], t: [346, 544] }], 10);
    fig2Tags(c, m, 9, 10, { names: false, diaBelow: true });
    c.div(st.x + 14, st.y + 14, null, c.copy("FIG. 2 — MUNITION", "index.html:475"), TX.labelW + ";font-size:10px");
    c.div(st.x + 14, st.y + 30, null, c.copy("STATUS: IN PRODUCTION", "index.html:479"), TX.label + ";font-size:10px");
    BALLOONS.forEach(function (b, i) {
      c.div(st.x + 14, 268 + i * 16, 180, c.copy(b.key[0], b.key[1]), TX.label + ";font-size:10px;white-space:nowrap");
    });
    sectionAA(c, 290, 302, 30, 10);
    var g = vol(c);
    c.svg(S.line(st.x + 14, 372, st.x + st.w - 14, 372, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(st.x + 14, 382, null, g.v, TX.value + ";font-size:32px");
    c.div(st.x + 14, 422, st.w - 28, g.lbl, TX.label + ";font-size:10px");
    c.div(st.x + 14, 472, st.w - 28, g.src, TX.src + ";font-size:10px");
    if (!altB) {
      var r = rev(c);
      c.div(tb.x, tb.y, tb.w, r.lbl, TX.label + ";font-size:10px");
      c.div(tb.x - 2, tb.y + 36, null, r.v, TX.giant + ";font-size:60px");
      c.div(tb.x, tb.y + 104, tb.w, r.src, TX.src + ";font-size:10px");
      c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05 (Alt B).");
    } else {
      c.div(tb.x, tb.y, tb.w, texts(c).l2, TX.value + ";font-weight:600;font-size:20px;line-height:1.35;color:" + T.white);
      c.flag("decision", "Alt B: $679B dropped from S05 because it has no data.js field (audit F01).");
    }
    c.state({ form: "one drawing (FIG. 2), fills the stage", x: st.x, y: st.y, w: st.w, h: st.h, tone: "neutral paper; one red mark (warhead section 3)", note: "pushed in; no area meaning" + (altB ? "; Alt B: no $679B" : "") });
  }

  function phoneExit(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, st = c.stage, tb = c.textBox, x = texts(c);
    var R = c.rung("DEFENCE", SB.get("DEFENCE"), st, "bl");
    c.svg(S.sheet(R.x, R.y, R.w, R.h, { tone: "red", mode: "edge", sw: 1.5, tab: true, tabSize: 6 }));
    c.svg(S.rect(st.x + 6.5, st.y + 6.5, st.w - 13, st.h - 13, { fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 6" }));
    rungsIn(c, 0.35);
    var A = { x: 30, y: 102, w: 316 }, B = { x: st.x + st.w - 128, y: st.y + 168, w: 108 }, t = 0.45;
    var M = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, w: A.w + (B.w - A.w) * t };
    c.svg(parked(M.x, M.y, M.w, S, T, 1)); // its parked spot sits inside its own path on phone, so no target box
    var x1 = M.x + 4, y1 = M.y + M.w * 0.5 + 6, x2 = B.x - 10, y2 = B.y + B.w * 0.5 + 2, len = Math.hypot(x2 - x1, y2 - y1);
    c.svg(S.line(x1, y1, x2, y2, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "2 4" }) + chevron(x2, y2, (x2 - x1) / len, (y2 - y1) / len, 6, T.white));
    var o = "opacity:0.55";
    c.svg(S.line(st.x + 20, st.y + 24, st.x + st.w - 20, st.y + 24, { stroke: "rgba(255,255,255,0.3)", opacity: 0.55 }));
    c.div(st.x + 20, st.y + 34, 300, c.fig("machineData[0].name", "raw").toUpperCase(), TX.label + ";font-size:10px;" + o);
    c.div(st.x + 18, st.y + 54, null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:52px;" + o);
    c.div(tb.x, tb.y, tb.w, x.l2, TX.value + ";font-weight:400;font-size:20px;line-height:1.35;color:" + T.grey);
    c.div(tb.x, tb.y + 64, tb.w, c.label("SIPRI 2026"), TX.src + ";font-size:10px");
    c.flag("decision", "Exit parks the drawing inside the $2.89T sheet (S06's entry). It has no area and must not read as a share of $2.89T. Alternative: park it outside the sheet.");
    c.state({ form: "sheet, full stage ($2.89T); drawing shrinking to its parked spot", x: st.x, y: st.y, w: st.w, h: st.h, tone: "red edge back, neutral paper; drawing grey; S06's rungs fading in", note: "at p = 1 this is S06 'in' (drawing at 231, 224, w 108)" });
  }

  function phonePlate(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, tb = c.textBox, x = texts(c);
    paper(c, PT, { grid: 34 });
    paper(c, PB, { grid: 34 });
    panelTab(c, PT, x.clean, true, { inside: true, fs: 10 });
    panelTab(c, PB, x.war, false, { inside: true, fs: 10 });
    var mT = pOrigin(PT), mB = pOrigin(PB);
    c.svg(turbineSvg(c, mT, { dims: true }));
    turbineTags(c, mT, 10, { fig: false });
    c.svg(munitionSvg(c, mB, { red: true, dims: true }));
    munitionTags(c, mB, 10, { fig: false });
    c.svg(S.line(PT.x, 306, PT.x + PT.w, 306, { stroke: T.white, "stroke-width": 1.5 }));
    c.div(tb.x, tb.y - 4, tb.w, x.l1 + " <b style=\"color:" + T.white + ";font-weight:600\">" + x.l2 + "</b>", TX.bodySm + ";font-size:14px;line-height:1.45");
    var r = rev(c), g = vol(c), cw = 163, y = tb.y + 74;
    c.svg(S.line(tb.x, y, tb.x + cw, y, { stroke: "rgba(255,255,255,0.3)" }) + S.line(tb.x + cw + 17, y, tb.x + tb.w, y, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(tb.x - 1, y + 8, null, r.v, TX.giant + ";font-size:30px");
    c.div(tb.x, y + 44, cw, r.lbl, TX.label + ";font-size:10px;letter-spacing:0.08em");
    c.div(tb.x, y + 104, cw, r.src, TX.src + ";font-size:10px");
    c.div(tb.x + cw + 17, y + 8, null, g.v, TX.value + ";font-size:28px");
    c.div(tb.x + cw + 17, y + 44, cw, g.lbl, TX.label + ";font-size:10px;letter-spacing:0.08em");
    c.div(tb.x + cw + 17, y + 104, cw, g.src, TX.src + ";font-size:10px");
    c.flag("decision", "$679B has no data.js field (audit F01). Approve adding it, or drop it from S05.");
    c.state({ form: "stacked split (still)", x: PT.x, y: PT.y, w: PT.w, h: PB.y + PB.h - PT.y, tone: "neutral; blue turbine line; one red warhead", note: "plate: both drawings, both copy lines, both figures" });
  }
})();
