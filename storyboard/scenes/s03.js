/* S03 · THE SLICE · CUT · 1.0 screen
   S02 ends on the $2.89T sheet lying back on the table with the ladder in
   its corner. The sheet rises toward camera and centres (a little left, so
   the margin can carry notes) at a smaller true-area scale, and the ladder
   lets go. Scroll scores the paper with a knife: incisions behind the blade,
   dashed guides ahead of it. At one exact progress point (0.5) the sheet is
   cut and the six pieces part slightly along the cuts, in perspective:
   spendBreakdown, area ∝ $B, summing exactly to DEFENCE (the pieces move
   apart, they never change size). The sheet's red edge stays on the outer
   edges of the pieces; the cuts show as paper edges catching light. The
   split is modelled, so an INDICATIVE stamp sits on the paper (mono, white,
   never red). Exit: the paper is re-cut into the ten largest budgets, which
   start to fall into S04's bars. */
(function () {
  "use strict";
  var S = SB.SVG;
  /* ── Depth: world → screen through the camera, then the tilt ─────
     Same maths as sb.js build(): translate+scale, then perspective ·
     rotateX · rotateY · rotateZ about the frame centre. Used to keep the
     overlay's tracking rect and the screen-space marks on the tilted file. */
  function depth(c) {
    var cam = c._cam || { s: 1, tx: 0, ty: 0 }, t = c._tilt, cx = c.W / 2, cy = c.H / 2, R = Math.PI / 180;
    var H = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    if (t) {
      var cz = Math.cos(t.rz * R), sz = Math.sin(t.rz * R), cY = Math.cos(t.ry * R), sY = Math.sin(t.ry * R), cX = Math.cos(t.rx * R), sX = Math.sin(t.rx * R);
      H = [
        [cY * cz, -cY * sz, 0],
        [cX * sz + sX * sY * cz, cX * cz - sX * sY * sz, 0],
        [-(sX * sz - cX * sY * cz) / t.persp, -(sX * cz + cX * sY * sz) / t.persp, 1],
      ];
    }
    function pt(x, y) {
      var X = x * cam.s + cam.tx - cx, Y = y * cam.s + cam.ty - cy, w = H[2][0] * X + H[2][1] * Y + 1;
      return [(H[0][0] * X + H[0][1] * Y) / w + cx, (H[1][0] * X + H[1][1] * Y) / w + cy];
    }
    function box(r) {
      var q = [pt(r.x, r.y), pt(r.x + r.w, r.y), pt(r.x, r.y + r.h), pt(r.x + r.w, r.y + r.h)];
      var xs = q.map(function (p) { return p[0]; }), ys = q.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
      return { x: x0, y: y0, w: Math.max.apply(null, xs) - x0, h: Math.max.apply(null, ys) - y0 };
    }
    // The overlay applies the camera only, so hand it the camera-inverse of the screen box.
    function state(r) {
      var b = box(r);
      return { x: Math.round((b.x - cam.tx) / cam.s), y: Math.round((b.y - cam.ty) / cam.s), w: Math.round(b.w / cam.s), h: Math.round(b.h / cam.s) };
    }
    // screen → world (on the paper plane)
    var a = H, det = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    var I = [
      [(a[1][1] * a[2][2] - a[1][2] * a[2][1]) / det, (a[0][2] * a[2][1] - a[0][1] * a[2][2]) / det, (a[0][1] * a[1][2] - a[0][2] * a[1][1]) / det],
      [(a[1][2] * a[2][0] - a[1][0] * a[2][2]) / det, (a[0][0] * a[2][2] - a[0][2] * a[2][0]) / det, (a[0][2] * a[1][0] - a[0][0] * a[1][2]) / det],
      [(a[1][0] * a[2][1] - a[1][1] * a[2][0]) / det, (a[0][1] * a[2][0] - a[0][0] * a[2][1]) / det, (a[0][0] * a[1][1] - a[0][1] * a[1][0]) / det],
    ];
    function back(sx, sy) {
      var X = sx - cx, Y = sy - cy, w = I[2][0] * X + I[2][1] * Y + I[2][2];
      var qx = (I[0][0] * X + I[0][1] * Y + I[0][2]) / w + cx, qy = (I[1][0] * X + I[1][1] * Y + I[1][2]) / w + cy;
      return [(qx - cam.tx) / cam.s, (qy - cam.ty) / cam.s];
    }
    // A world-space clip polygon that lands exactly on a screen rectangle.
    function clip(id, r) {
      var q = [back(r.x, r.y), back(r.x + r.w, r.y), back(r.x + r.w, r.y + r.h), back(r.x, r.y + r.h)];
      return '<defs><clipPath id="' + id + '"><path d="M' + q.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + ' Z"/></clipPath></defs>';
    }
    // The same window for a world text block whose top-left sits at world (x, y).
    function clipCss(r, x, y) {
      var q = [back(r.x, r.y), back(r.x + r.w, r.y), back(r.x + r.w, r.y + r.h), back(r.x, r.y + r.h)];
      return ";clip-path:polygon(" + q.map(function (p) { return (p[0] - x).toFixed(1) + "px " + (p[1] - y).toFixed(1) + "px"; }).join(",") + ")";
    }
    return { pt: pt, box: box, state: state, back: back, clip: clip, clipCss: clipCss };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var N = 6;
  var CENTRE = 0.1; // 0–0.1: S02's sheet rises and eases in to centre
  var CUT = 0.5; // the hard cut: one exact progress point
  var EXIT = 0.8; // restack begins
  // Figures used in notes and flags (never typed).
  var DEF_T = SB.FMT.T(SB.get("DEFENCE"));
  var NUKE_B = SB.FMT.B(SB.get("spendBreakdown[5].amtB"));
  var PERS_T = SB.FMT.T(SB.get("spendBreakdown[0].amtB"));
  var PERS_B = SB.FMT.B(SB.get("spendBreakdown[0].amtB"));

  function pad2(n) { return (n < 9 ? "0" : "") + (n + 1); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function secPath(i) { return "spendBreakdown[" + i + "].amtB"; }
  // The live legend prints amtB through js/main.js:14 fmt(): $1.01T, $780B …
  function secVal(c, i) {
    var v = SB.get(secPath(i));
    return c.fig(secPath(i), v >= 1000 ? "T" : "B", "modelled split (data.js:26-30); live legend format");
  }
  function secName(c, i) { return c.fig("spendBreakdown[" + i + "].label", "raw"); }

  /* ── Geometry ─────────────────────────────────────────────────── */
  // The sheet keeps the frame's aspect (it is the same object as S02's
  // world sheet), drawn at a smaller true-area scale, a little left of centre.
  function geom(c) {
    var ph = c.phone;
    var FW = ph ? c.stage.w : c.W, FH = ph ? c.stage.h : c.H;
    var k = ph ? 302 / 343 : 900 / 1440;
    var w = FW * k;
    var x = ph ? c.stage.x + (c.stage.w - w) / 2 : 168;
    var y = ph ? 108 : 166;
    var fit = SB.get("DEFENCE") / (k * k);
    return { k: k, fit: fit, box: { x: x, y: y, w: FW, h: FH } };
  }
  // The table: the sheet rises out of S02's lean-back, holds through the cut, and lifts a little more on exit.
  // 0–0.1 starts from S02's end tilt (desk rx 30 / rz −5, phone rx 32 / rz −6) so the boundary has no jump.
  function table(c, p) {
    var ph = c.phone, a0 = clamp(p / CENTRE, 0, 1), a = clamp((p - CENTRE) / (CUT - CENTRE), 0, 1), b = clamp((p - CUT) / (1 - CUT), 0, 1);
    var k = ph ? 0.85 : 1;
    var rx = p <= CENTRE ? lerp(ph ? 32 : 30, 24 * k, a0) : p <= CUT ? lerp(24, 18, a) * k : lerp(18, 12, b) * k;
    var ry = p <= CENTRE ? lerp(-4, -3.8, a0) : p <= CUT ? lerp(-3.8, -3, a) : lerp(-3, -2, b);
    var rz = p <= CENTRE ? lerp(ph ? -6 : -5, -4.1, a0) : p <= CUT ? lerp(-4.1, -2.5, a) : lerp(-2.5, -1.5, b);
    if (c.plate) { rx = 14 * k; ry = -2; rz = -2; }
    c.tilt({ rx: rx, ry: ry, rz: rz, persp: ph ? 900 : 1500 });
    return depth(c);
  }
  function logArea(c, path, v, r, sh) {
    var trueA = (sh.w * sh.h * v) / SB.get("DEFENCE");
    c.log.rungs.push({ path: path, value: v, w: r.w, h: r.h, err: (r.w * r.h) / trueA - 1 });
  }

  // Squarified treemap. Values in data order (already largest first).
  function squarify(vals, R) {
    var tot = vals.reduce(function (a, b) { return a + b; }, 0);
    var items = vals.map(function (v, i) { return { i: i, a: (v / tot) * R.w * R.h }; })
      .sort(function (a, b) { return b.a - a.a; });
    var out = [], x = R.x, y = R.y, w = R.w, h = R.h;
    function worst(row, side) {
      var s = row.reduce(function (a, r) { return a + r.a; }, 0), m = 0;
      row.forEach(function (r) { m = Math.max(m, (side * side * r.a) / (s * s), (s * s) / (side * side * r.a)); });
      return m;
    }
    while (items.length) {
      var side = Math.min(w, h), row = [items[0]], k = 1;
      while (k < items.length && worst(row.concat(items[k]), side) <= worst(row, side)) { row.push(items[k]); k++; }
      items = items.slice(row.length);
      var s = row.reduce(function (a, r) { return a + r.a; }, 0);
      if (w >= h) {
        var cw = s / h, yy = y;
        row.forEach(function (r) { var rh = r.a / cw; out[r.i] = { x: x, y: yy, w: cw, h: rh }; yy += rh; });
        x += cw; w -= cw;
      } else {
        var rh2 = s / w, xx = x;
        row.forEach(function (r) { var rw = r.a / rh2; out[r.i] = { x: xx, y: y, w: rw, h: rh2 }; xx += rw; });
        y += rh2; h -= rh2;
      }
    }
    return out;
  }
  // Internal boundaries of the treemap = the cut lines.
  function cuts(cells, sh) {
    var segs = [];
    cells.forEach(function (r) {
      if (r.x + r.w < sh.x + sh.w - 0.5) segs.push([r.x + r.w, r.y, r.x + r.w, r.y + r.h]);
      if (r.y + r.h < sh.y + sh.h - 0.5) segs.push([r.x, r.y + r.h, r.x + r.w, r.y + r.h]);
    });
    return segs;
  }
  // The pieces part along the cuts: each moves away from the sheet's centre in proportion
  // to its distance from it, so every cut opens by about the same gap. Size never changes.
  function explode(cells, sh, f) {
    var cx = sh.x + sh.w / 2, cy = sh.y + sh.h / 2;
    return cells.map(function (r) {
      var dx = (r.x + r.w / 2 - cx) * f, dy = (r.y + r.h / 2 - cy) * f;
      return { x: r.x + dx, y: r.y + dy, w: r.w, h: r.h };
    });
  }
  // Greedy word wrap estimate for the mono label (12px + 0.14em ≈ 8.9px a glyph).
  function lines(text, w, adv) {
    var words = String(text).split(" "), n = 1, cur = 0;
    words.forEach(function (wd) {
      var l = wd.length * adv;
      if (cur && cur + adv + l > w) { n++; cur = l; } else cur += (cur ? adv : 0) + l;
    });
    return n;
  }

  /* ── Pieces ───────────────────────────────────────────────────── */
  function title(c, o) {
    var TX = c.TX, ph = c.phone, op = o && o.opacity != null ? o.opacity : 1;
    var t = c.copy("Where the ", "index.html:242") + c.fig("DEFENCE", "T") + c.copy(" goes", "index.html:242");
    var by = c.copy("· by sector", "index.html:242");
    if (!ph) {
      // one line, as the live heading reads: title, then '· by sector' as its mono tail
      c.uiDiv(96, 70, 1000, t + '<span style="' + TX.label + ';font-size:13px;margin-left:16px;vertical-align:6px">' + by + "</span>",
        TX.title + ";font-size:40px;opacity:" + op);
    } else {
      c.uiDiv(16, 50, 343, t, TX.title + ";font-size:19px;opacity:" + op);
      c.uiDiv(16, 73, 200, by, TX.label + ";font-size:10px;opacity:" + op);
    }
  }
  // INDICATIVE: a rubber stamp on the paper (world layer, so it lies on the sheet). Mono, white, not red.
  function stamp(c, x, y) {
    var ph = c.phone;
    c.div(x, y, null, c.label("INDICATIVE", "data-status tag; wording under open decision 3"),
      c.TX.labelW + ";font-size:" + (ph ? 11 : 14) + "px;letter-spacing:0.28em;padding:" + (ph ? "4px 6px 4px 9px" : "6px 10px 6px 14px") +
      ";border:2px solid rgba(255,255,255,0.82);outline:1px solid rgba(255,255,255,0.4);outline-offset:3px;opacity:0.86;transform:rotate(-7deg);transform-origin:0 0;white-space:nowrap");
  }
  function note(c, x, y, w) {
    var TX = c.TX, ph = c.phone;
    var txt = c.newCopy("Indicative split, modelled on typical national defence budgets. SIPRI publishes the world total only. Nuclear: ICAN.", "open decision 3 wording");
    c.uiDiv(x, y, w, txt, ph ? TX.bodySm + ";font-size:14px;line-height:1.4;color:" + c.T.grey : TX.body + ";font-size:18px;line-height:1.45;color:" + c.T.grey);
  }
  function sources(c, x, y) {
    c.uiDiv(x, y, c.phone ? c.textBox.w : 300, c.copy("SIPRI 2026 ↗", "index.html:252") + " &nbsp;·&nbsp; " + c.copy("ICAN nuclear 2026 ↗", "index.html:258"),
      c.TX.src + (c.phone ? ";font-size:10px" : ""));
  }
  // Desktop: the margin column (note, then sources), flat on the screen.
  var MARGIN = { x: 1140, w: 270 };

  // The spec figure S02 left on the sheet, carried in at the new scale.
  function spec(c, sh, op) {
    var TX = c.TX, ph = c.phone;
    var px = sh.x + (ph ? 16 : 52), py = sh.y + (ph ? 22 : 44);
    var rw = ph ? sh.w - 32 : 560;
    c.svg('<g opacity="' + op + '">' + S.line(px, py, px + rw, py, { stroke: "rgba(255,255,255,0.3)" }) + "</g>");
    c.div(px, py + (ph ? 10 : 12), rw, c.fig("machineData[0].name", "raw") + " · " + c.prose("2025", "machineData[0].sum"),
      TX.label + ";font-size:" + (ph ? 11 : 12) + "px;opacity:" + op);
    c.div(px - (ph ? 2 : 5), py + (ph ? 32 : 36), null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:" + (ph ? 56 : 120) + "px;opacity:" + op);
    c.div(px, py + (ph ? 90 : 154), 300, c.label("SIPRI 2026"), TX.src + ";opacity:" + op + (ph ? ";font-size:11px" : ""));
  }

  // S02's ladder, released: grey dashed ghosts at true area in the sheet's
  // bottom-left corner, fading as the sheet is scored.
  var LADDER = [
    { n: "01", path: "issueData[0].cost", fmt: "B" },
    { n: "02", path: "machineData[1].amtB", fmt: "B" },
    { n: "03", path: "topSpenders[0].amt", fmt: "B" },
  ];
  function ghosts(c, g, sh, op) {
    var TX = c.TX, ph = c.phone;
    var bl = { x: sh.x, y: sh.y + sh.h - g.box.h, w: g.box.w, h: g.box.h };
    for (var i = LADDER.length - 1; i >= 0; i--) {
      var r = c.rung(LADDER[i].path, g.fit, bl, "bl");
      c.svg(S.rect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, { fill: "none", stroke: c.T.grey, "stroke-dasharray": "4 4", opacity: op }));
      var lab = c.label(LADDER[i].n, "rung number") + (ph ? "" : " · " + c.fig(LADDER[i].path, LADDER[i].fmt));
      c.div(r.x + (ph ? 4 : 8), r.y + (ph ? 4 : 7), null, lab, TX.label + ";font-size:" + (ph ? 10 : 12) + "px;letter-spacing:0.06em;opacity:" + Math.min(1, op + 0.15));
    }
  }

  // Phone: the ladder rail S02 ended on, dimmed as it lets go.
  function ghostRail(c, op) {
    var TX = c.TX, tb = c.textBox, y = tb.y;
    [2, 1, 0].forEach(function (k) {
      var L = LADDER[k];
      var nm = k === 0 ? c.fig("issueData[0].sdg", "raw") + " · " + c.fig("issueData[0].name", "raw")
        : k === 1 ? c.fig("machineData[1].name", "raw") : c.fig("topSpenders[0].name", "raw");
      c.uiDiv(tb.x, y + 3, 26, c.label(L.n, "rung number"), TX.labelW + ";font-size:10px;opacity:" + op);
      c.uiDiv(tb.x + 30, y, 64, c.fig(L.path, L.fmt), TX.value + ";font-size:16px;opacity:" + op);
      c.uiDiv(tb.x + 96, y + 3, tb.w - 96, nm, TX.label + ";font-size:10px;letter-spacing:0.08em;opacity:" + op);
      y += 22;
    });
  }

  function sheetEdge(c, sh, tone, o) {
    o = o || {};
    c.svg(S.sheet(sh.x, sh.y, sh.w, sh.h, { tone: tone, mode: "edge", sw: 2, tab: tone === "red", tabSize: c.phone ? 8 : 12, dash: o.dash, opacity: o.opacity }));
  }
  // Registration marks just outside the paper's corners (printed on the table, they stay when the paper parts).
  function regMarks(c, sh) {
    var o = c.phone ? 8 : 16, l = c.phone ? 6 : 10, s = "";
    [[sh.x - o, sh.y - o], [sh.x + sh.w + o, sh.y - o], [sh.x + sh.w + o, sh.y + sh.h + o], [sh.x - o, sh.y + sh.h + o]].forEach(function (q) {
      s += S.path("M" + (q[0] - l) + " " + q[1] + " H" + (q[0] + l) + " M" + q[0] + " " + (q[1] - l) + " V" + (q[1] + l), { stroke: "rgba(255,255,255,0.35)" });
    });
    c.svg(s);
  }

  // Knife scores: behind the blade, an incision (a dark groove with a lit lip);
  // ahead of it, the dashed guide still to be cut. frac 0..1 of the total length.
  function scores(c, segs, frac) {
    var tot = segs.reduce(function (a, s) { return a + Math.hypot(s[2] - s[0], s[3] - s[1]); }, 0);
    var left = tot * frac, tip = null, cut = "", ahead = "";
    segs.forEach(function (s) {
      var L = Math.hypot(s[2] - s[0], s[3] - s[1]);
      var f = clamp(left / L, 0, 1);
      var x2 = s[0] + (s[2] - s[0]) * f, y2 = s[1] + (s[3] - s[1]) * f;
      var vert = Math.abs(s[2] - s[0]) < 0.5;
      if (f > 0) {
        cut += S.line(s[0], s[1], x2, y2, { stroke: c.T.ground, "stroke-width": 2.5, "stroke-opacity": 0.9 });
        cut += S.line(s[0] + (vert ? 1.6 : 0), s[1] + (vert ? 0 : 1.6), x2 + (vert ? 1.6 : 0), y2 + (vert ? 0 : 1.6), { stroke: "rgba(255,255,255,0.72)", "stroke-width": 1 });
      }
      if (f < 1) ahead += S.line(x2, y2, s[2], s[3], { stroke: "rgba(255,255,255,0.32)", "stroke-dasharray": "6 6", "stroke-width": 1 });
      if (f > 0 && f < 1) tip = [x2, y2, vert];
      left -= L;
    });
    c.svg(ahead + cut);
    if (tip) {
      // the blade: a small white wedge on the line, its point at the cut's end
      var k = c.phone ? 6 : 10, x = tip[0], y = tip[1];
      var d = tip[2] ? "M" + x + " " + y + " L" + (x - k * 0.5) + " " + (y - k * 1.8) + " L" + (x + k * 0.5) + " " + (y - k * 1.8) + " Z"
                     : "M" + x + " " + y + " L" + (x - k * 1.8) + " " + (y - k * 0.5) + " L" + (x - k * 1.8) + " " + (y + k * 0.5) + " Z";
      c.svg(S.path(d, { fill: c.T.white, stroke: "none" }));
    }
    return tip;
  }

  // A piece of the cut sheet: lit paper with a shadow; the sheet's red edge on its outer
  // sides, a pale cut edge on the inner ones.
  function piece(c, r, home, sh, i) {
    var T = c.T, ph = c.phone;
    c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "grey", mode: "edge", sw: 0.001 }));
    var e = 0.5, s = "";
    var sides = [
      [home.y <= sh.y + e, r.x, r.y, r.x + r.w, r.y],
      [home.x + home.w >= sh.x + sh.w - e, r.x + r.w, r.y, r.x + r.w, r.y + r.h],
      [home.y + home.h >= sh.y + sh.h - e, r.x, r.y + r.h, r.x + r.w, r.y + r.h],
      [home.x <= sh.x + e, r.x, r.y, r.x, r.y + r.h],
    ];
    sides.forEach(function (q) {
      s += q[0] ? S.line(q[1], q[2], q[3], q[4], { stroke: T.red, "stroke-width": 2 })
                : S.line(q[1], q[2], q[3], q[4], { stroke: "rgba(255,255,255,0.55)", "stroke-width": 1 });
    });
    if (i === 0) s += S.rect(r.x, r.y, ph ? 8 : 12, ph ? 8 : 12, { fill: T.red }); // the sheet's tab stays on its corner
    c.svg(s);
  }

  // The cut: the pieces part; numbered labels on each; on desktop the three narrow
  // pieces send their names out to the margin on leaders.
  function cutSheet(c, D, cells, sh) {
    var TX = c.TX, ph = c.phone;
    var parts = explode(cells, sh, ph ? 0.03 : 0.024);
    parts.forEach(function (r, i) {
      logArea(c, secPath(i), SB.get(secPath(i)), r, sh);
      piece(c, r, cells[i], sh, i);
    });
    parts.forEach(function (r, i) {
      var A = r.w * r.h;
      if (!ph) {
        var pad = 18, narrow = r.w < 200;
        var vf = clamp(Math.round(Math.sqrt(A) * 0.13), 28, 60);
        c.div(r.x + pad, r.y + 16, 30, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:13px");
        if (!narrow) {
          var raw = SB.get("spendBreakdown[" + i + "].label").toUpperCase();
          var nl = lines(raw, r.w - pad * 2 - 34, 9.6);
          c.div(r.x + pad + 34, r.y + 16, r.w - pad * 2 - 34, secName(c, i), TX.label + ";font-size:13px;line-height:17px");
          c.div(r.x + pad - 2, r.y + 16 + nl * 17 + 12, null, secVal(c, i), TX.value + ";font-size:" + vf + "px");
        } else {
          c.div(r.x + pad - 2, r.y + 40, null, secVal(c, i), TX.value + ";font-size:" + vf + "px");
        }
      } else {
        var vfp = clamp(Math.round(Math.sqrt(A) * 0.12), 15, 30);
        c.div(r.x + 10, r.y + 9, 30, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:11px;letter-spacing:0.06em");
        c.div(r.x + 10, r.y + 27, null, secVal(c, i), TX.value + ";font-size:" + vfp + "px");
      }
    });
    if (!ph) {
      // marginalia: names of the narrow pieces, on leaders from their outer edge
      var slotY = [];
      parts.forEach(function (r, i) {
        if (r.w >= 200) return;
        var a = D.pt(r.x + r.w, r.y + Math.min(r.h / 2, 46));
        var y = Math.max(a[1], (slotY.length ? slotY[slotY.length - 1] + 70 : 0));
        slotY.push(y);
        c.uiSvg(S.leader([[a[0] - 0, a[1]], [MARGIN.x - 34, y], [MARGIN.x - 8, y]], { anchor: c.T.white }));
        c.uiDiv(MARGIN.x, y - 9, 30, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:12px");
        c.uiDiv(MARGIN.x + 34, y - 9, MARGIN.w - 34, secName(c, i), TX.label + ";font-size:12px;line-height:16px");
        if (i === N - 1) c.uiDiv(MARGIN.x + 34, y + 28, 200, c.label("ICAN 2026"), TX.src);
      });
    }
    return parts;
  }

  // Phone: the stacked label rail (number + name) above the indicative note.
  function sectorRail(c) {
    var TX = c.TX, tb = c.textBox;
    for (var i = 0; i < N; i++) {
      var y = tb.y + i * 17;
      c.uiDiv(tb.x, y, 24, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:10px;letter-spacing:0.06em");
      c.uiDiv(tb.x + 30, y, tb.w - 30, secName(c, i), TX.label + ";font-size:10px;letter-spacing:0.08em");
    }
    c.uiSvg(S.line(tb.x, tb.y + N * 17 + 4, tb.x + tb.w, tb.y + N * 17 + 4, { stroke: c.T.rule }));
    return tb.y + N * 17 + 14;
  }

  /* ── Exit: the sheet is re-cut into the ten largest budgets, which start to fall ── */
  function strips(c, sh) {
    var T = c.T, TX = c.TX, ph = c.phone;
    var SP = SB.get("topSpenders"), DEF = SB.get("DEFENCE");
    var rs = [], at = ph ? sh.y : sh.x;
    SP.forEach(function (s, i) {
      var r = ph
        ? { x: sh.x, y: at, w: sh.w, h: (sh.h * s.amt) / DEF }
        : { x: at, y: sh.y, w: (sh.w * s.amt) / DEF, h: sh.h };
      logArea(c, "topSpenders[" + i + "].amt", s.amt, r, sh);
      rs.push(r);
      at += ph ? r.h : r.w;
    });
    // What is left of the sheet. Main: an unlabelled ghost, dropped (it does
    // not travel to S04). Alt B: kept as an unlabelled outline that drops with
    // the strips, so area still sums to the sheet (matches S04 ALT B).
    var keep = c.alt === "B";
    var rem = ph ? { x: sh.x, y: at, w: sh.w, h: sh.y + sh.h - at } : { x: at, y: sh.y, w: sh.x + sh.w - at, h: sh.h };
    // The strips part along the new cuts and start to fall, the first a little ahead (moved, never resized).
    function fall(r, i) {
      return ph ? { x: r.x + 4 + i * 2.2, y: r.y + i * 2.2, w: r.w, h: r.h } : { x: r.x + i * 4, y: r.y + 4 + i * 4, w: r.w, h: r.h };
    }
    var fs = rs.map(fall);
    var fr = keep ? fall(rem, rs.length) : rem;
    // Main: fading out (dropped). Alt B: held as a firm outline that travels on.
    c.svg(S.rect(fr.x + 0.75, fr.y + 0.75, fr.w - 1.5, fr.h - 1.5, { fill: "none", stroke: keep ? T.white : T.grey, "stroke-width": keep ? 1.5 : 1, "stroke-dasharray": keep ? "8 4" : "3 6", opacity: keep ? 0.75 : 0.22 }));
    // the ten strips as paper; the largest takes the one red edge
    fs.forEach(function (r, i) {
      if (i === 0) return;
      c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "white", mode: "edge", sw: 1, opacity: 0.95 }));
    });
    var r0 = fs[0];
    c.svg(S.sheet(r0.x, r0.y, r0.w, r0.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 10 }));
    // numbers: above each strip (desktop), in the left gutter (phone)
    fs.forEach(function (r, i) {
      var st = (i === 0 ? TX.labelW : TX.label) + ";font-size:11px;letter-spacing:0.04em;line-height:11px";
      if (!ph) c.div(r.x + r.w / 2 - 15, r.y - 22, 30, c.label(pad2(i), "rank number"), st + ";text-align:center");
      else c.div(c.stage.x, r.y + r.h / 2 - 5, 18, c.label(pad2(i), "rank number"), st);
    });
    c.div(r0.x + (ph ? 26 : 16), r0.y + (ph ? 10 : 18), ph ? r0.w - 40 : r0.w - 32, c.fig("topSpenders[0].name", "raw"), TX.labelW + ";font-size:" + (ph ? 11 : 13) + "px");
    // drop tracks: each strip falls to S04's baseline (desktop)
    if (!ph) {
      var tr = "";
      (keep ? fs.concat([fr]) : fs).forEach(function (r) {
        var cx = r.x + r.w / 2, y0 = r.y + r.h + 8, y1 = y0 + 24;
        tr += S.line(cx, y0, cx, y1, { stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "2 4" });
        tr += S.path("M" + (cx - 4) + " " + (y1 - 5) + " L" + cx + " " + y1 + " L" + (cx + 4) + " " + (y1 - 5), { stroke: "rgba(255,255,255,0.6)" });
      });
      c.svg(tr);
    }
    return { rs: fs, rem: rem, keep: keep };
  }

  // Where the sheet came from: S02's end position (lying back in the corner), as a faint
  // dashed outline, with traces to where the sheet is now. Screen space.
  function arrival(c, D, sh) {
    var ph = c.phone, st = c.stage;
    var prev = depth({ W: c.W, H: c.H,
      _tilt: ph ? { rx: 32, ry: -4, rz: -6, persp: 900 } : { rx: 30, ry: -4, rz: -5, persp: 1500 },
      _cam: ph ? { s: 0.72, tx: 34 - 0.72 * st.x, ty: 512 - 0.72 * (st.y + st.h) } : { s: 0.52, tx: 124, ty: 774 - 0.52 * 900 } });
    var F = ph ? st : { x: 0, y: 0, w: c.W, h: c.H };
    var a = [prev.pt(F.x, F.y), prev.pt(F.x + F.w, F.y), prev.pt(F.x + F.w, F.y + F.h), prev.pt(F.x, F.y + F.h)];
    var b = [D.pt(sh.x, sh.y), D.pt(sh.x + sh.w, sh.y), D.pt(sh.x + sh.w, sh.y + sh.h), D.pt(sh.x, sh.y + sh.h)];
    var s = S.path("M" + a.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + " Z", { stroke: "rgba(255,255,255,0.34)", "stroke-dasharray": "3 6" });
    a.forEach(function (q, i) { s += S.line(q[0], q[1], b[i][0], b[i][1], { stroke: "rgba(255,255,255,0.26)", "stroke-dasharray": "2 6" }); });
    c.bgSvg(s);
  }

  function union(rs) {
    var x0 = Math.min.apply(null, rs.map(function (r) { return r.x; })), y0 = Math.min.apply(null, rs.map(function (r) { return r.y; }));
    var x1 = Math.max.apply(null, rs.map(function (r) { return r.x + r.w; })), y1 = Math.max.apply(null, rs.map(function (r) { return r.y + r.h; }));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* ── Scene ────────────────────────────────────────────────────── */
  SB.scene({
    order: 3,
    id: "S03",
    name: "The Slice",
    move: "CUT",
    screens: 1.0,
    restrained: false,
    anchor: null,
    trigger: "End of S02: the " + DEF_T + " sheet centres.",
    camera:
      "Still on the table. Over 0–0.1 the sheet rises out of S02's lean-back (rx 30° → 24°) and eases in a little left of centre at a smaller true-area scale; this is S02's transition. From 0.1 the camera holds and the paper settles (rx → 18°). The cut is a state change at one exact progress point (0.5); on exit the paper lifts a little more (rx 12°) as the strips start to fall.",
    reason:
      "Cutting the one total into what it pays for (people, upkeep, weapons, research, bases, nuclear) shows the " + DEF_T + " is a budget with parts, not an abstraction. Next, the same sheet is re-cut by who spends it: the slices restack into the ten largest budgets (S04). Those ten sum to less than the sheet, so area stops summing to " + DEF_T + " at the restack (flagged).",
    frames: [
      { k: "in", p: 0.1, cap: "0–0.1: S02's sheet rises off the table and eases in to centre at a smaller true-area scale (faint traces: its outline where S02 left it). The ladder lets go: its three rungs hang as grey dashed ghosts in the corner, fading by 0.2. The spec figure is still on the paper." },
      { k: "score", p: 0.3, cap: "From 0.1, a knife scores the paper, largest cut first: an incision behind the white blade, a dashed guide ahead of it. The title and the INDICATIVE stamp arrive. The spec figure dims under the scores." },
      { k: "mid", p: 0.5, cap: "HARD CUT at 0.5: the scores go through and the six pieces part slightly along the cuts, in perspective (moved, never resized: area ∝ $B, summing exactly to the sheet). The red edge stays on the outer edges; cuts show as pale paper edges. Narrow pieces send their names to the margin on leaders. Holds to 0.8." },
      { k: "out", p: 1, cap: "Exit (0.8–1.0): sector labels clear; the paper is re-cut into the ten largest budgets, strip width ∝ $B (phone: height), ranked, and the strips start to fall toward S04's bars, the first a little ahead. The red edge passes to strip 01. The uncut rest is an unlabelled grey ghost, fading out: it is dropped." },
    ],
    alts: [
      {
        k: "B",
        label: "Rest kept through the restack",
        frames: ["out"],
        note: "Audit F12: the ten budgets sum to less than the sheet. Here the uncut rest is kept as an unlabelled outline and drops with the ten strips (drop track on desktop), so area still sums to the " + DEF_T + " sheet in S04 (pairs with S04 ALT B). The rest is derived (DEFENCE minus the ten) and not in data.js.",
      },
    ],
    draw: function (c) {
      var T = c.T, TX = c.TX, ph = c.phone;
      var p = c.plate ? CUT : c.p;
      var g = geom(c);
      var sh = c.rung("DEFENCE", g.fit, g.box, "tl");
      var vals = SB.get("spendBreakdown").map(function (s) { return s.amtB; });
      var cells = squarify(vals, sh);
      var segs = cuts(cells, sh);
      var D = table(c, p);
      // the stamp lies on piece 02 and travels with it (on phone, piece 01 would put it over the dimmed spec figure while scoring)
      var stampCell = 1;
      function stampOn(r) { stamp(c, ph ? r.x + 14 : r.x + r.w - 230, ph ? r.y + r.h - 46 : r.y + r.h - 92); }
      function deskText() {
        sources(c, 100, 114); // under the title, with air above the overlay's tracking tag
        note(c, MARGIN.x + 10, 702, MARGIN.w + 10); // under the last margin callout (06 and its ICAN source), clear of the corner mark
      }

      if (p <= CENTRE && !c.plate) arrival(c, D, sh);
      regMarks(c, sh);

      if (p < CUT) {
        // ── before the cut: the whole sheet
        sheetEdge(c, sh, "red");
        var gOp = clamp(1 - (p - CENTRE) / 0.1, 0, 1) * 0.6; // ghosts fade out by 0.2
        if (gOp > 0) ghosts(c, g, sh, gOp);
        spec(c, sh, p <= CENTRE ? 1 : 0.3);
        if (p > CENTRE) {
          scores(c, segs, clamp((p - CENTRE) / (CUT - CENTRE), 0, 1));
          title(c);
          stampOn(cells[stampCell]);
          if (!ph) deskText();
          else {
            note(c, c.textBox.x, c.textBox.y, c.textBox.w);
            sources(c, c.textBox.x, c.textBox.y + 68);
          }
        } else if (ph) {
          ghostRail(c, 0.6);
        }
        var s0 = D.state(sh);
        c.state({
          form: p <= CENTRE ? "sheet (centred, whole)" : "sheet (centred), scored with a knife",
          x: s0.x, y: s0.y, w: s0.w, h: s0.h,
          tone: "red edge, neutral paper",
          note: "area = DEFENCE at fit " + Math.round(g.fit) + "B per frame; scale " + g.k.toFixed(3) + " of S02's full frame; on the table at rx " + Math.round(c._tilt.rx) + "°" +
            (p <= CENTRE ? "; risen out of S02's lean-back over 0–0.1; ladder rungs released as fading grey ghosts (return in S11)" : "; " + Math.round(clamp((p - CENTRE) / (CUT - CENTRE), 0, 1) * 100) + "% of the cut length scored"),
        });
      } else if (p < EXIT) {
        // ── the cut (and the no-motion plate)
        var parts = cutSheet(c, D, cells, sh);
        title(c);
        stampOn(parts[stampCell]);
        if (!ph) deskText();
        else {
          var ny = sectorRail(c);
          note(c, c.textBox.x, ny, c.textBox.w);
          sources(c, c.textBox.x, ny + 66);
        }
        c.flag("decision", "Open decision 3: data.js:26-30 says the sector split is indicative and modelled, but the live page cites SIPRI for it. Proposed: an INDICATIVE tag on the sheet plus the note below it (new copy). Confirm the wording.");
        c.flag("data", "Sector values are modelled, not sourced; only Nuclear forces (" + NUKE_B + ", ICAN) is a published figure. Values print as the live legend prints them (js/main.js:14 fmt), so Personnel & pay shows " + PERS_T + ", not " + PERS_B + ".");
        c.flag("decision", "Brand (audit BR-07): data.js gives the six sectors six red shades. Drawn here as neutral paper inside the sheet's one red edge, told apart by white rules and numbered labels. Confirm with the brand owner.");
        c.flag("copy", "The live card's third link, 'SIPRI arms 2026 ↗' (index.html:264), is about arms transfers, not this split. Not carried here; it belongs with the +9.2% figure in S05.");
        var s1 = D.state(union(parts));
        c.state({
          form: "treemap (6 pieces) cut from the sheet",
          x: s1.x, y: s1.y, w: s1.w, h: s1.h,
          tone: "red outer edge, neutral paper; pieces parted along the cuts",
          note: "squarified, area ∝ spendBreakdown amtB; the six sum exactly to DEFENCE. Pieces part by " + (ph ? 3 : 2.4) + "% of their distance from the centre (moved, not resized)",
        });
      } else {
        // ── exit: restack into the ten largest budgets
        var res = strips(c, sh);
        var head = c.copy("10 largest military budgets · 2025 · $bn", "index.html:523");
        // the sector title has gone with the sector labels; S04's heading takes its place
        if (!ph) {
          c.uiDiv(96, 76, 760, head, TX.labelW + ";font-size:14px");
          c.uiDiv(96, 102, 300, c.copy("SIPRI 2026 ↗", "index.html:252"), TX.src);
        } else {
          c.uiDiv(c.textBox.x, c.textBox.y, c.textBox.w, head, TX.bodySm + ";font-size:16px;color:" + T.white);
          c.uiDiv(c.textBox.x, c.textBox.y + 30, c.textBox.w, c.copy("SIPRI 2026 ↗", "index.html:252"), TX.src + ";font-size:10px");
        }
        c.flag("decision", "Restack (audit F12): the six sectors sum to the whole sheet, the ten budgets do not, so area cannot keep summing to " + DEF_T + " through the restack. Main: each strip keeps its own true area and the uncut rest is an unlabelled grey ghost that is dropped (S04 main). ALT B: the rest is kept as an unlabelled outline that drops with the strips (S04 ALT B); it is derived (DEFENCE minus the ten), not in data.js. Choose one for both scenes.");
        var s2 = D.state(union(res.rs.concat([res.rem])));
        c.state({
          form: "ten strips (re-cut sheet) + uncut rest " + (res.keep ? "kept as an outline (alt B)" : "ghost, dropped"),
          x: s2.x, y: s2.y, w: s2.w, h: s2.h,
          tone: "neutral paper; red edge moves to strip 01 (" + SB.get("topSpenders[0].name") + ")",
          note: (ph ? "horizontal strips, height" : "vertical strips, width") + " ∝ topSpenders amt at the sheet's scale, starting to fall; uncut rest " + Math.round(ph ? res.rem.h : res.rem.w) + "px, unlabelled, not carried to S04",
        });
      }
      c.chrome();
    },
    // No-motion plate: the cut treemap with every sector, value, label and source.
    plate: function (c) {
      this.draw(c);
    },
  });
})();
