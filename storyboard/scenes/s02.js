/* S02 · THE LADDER · PULL · 2.0 screens
   Hard cut from the full-frame world sheet down to the smallest rung:
   Zero Hunger, near full frame, in blue. The camera then pulls out without
   a break (fit = SB.fitBetween, log-linear, so each doubling of scale takes
   the same scroll) and leans back as it pulls (rx 5° → 30°), so the rungs
   read as sheets of paper lying stacked in one corner of a table. True area
   holds in the paper's plane: every rung is c.rung() at the same fit,
   anchored at the stage's bottom-left; the tilt is the camera, not the data.
   Each new rung's number sits huge and flat in the negative space; earlier
   rungs are labelled by leader lines that land on their corners.
   Rungs, smallest first: Zero Hunger (blue), nuclear, United States,
   world military spending (red). The two appeal figures stay out (S11). */
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

  // Every value is read from js/data.js.
  var RUNGS = [
    { n: "01", path: "issueData[0].cost", fmt: "B", tone: "blue", name: "issueData[0].name" },
    { n: "02", path: "machineData[1].amtB", fmt: "B", tone: "red", name: "machineData[1].name" },
    { n: "03", path: "topSpenders[0].amt", fmt: "B", tone: "red", name: "topSpenders[0].name" },
    { n: "04", path: "DEFENCE", fmt: "T", tone: "red", name: "machineData[0].name" },
  ];
  var D_ = "js/data.js ";

  function val(c, i) { return c.fig(RUNGS[i].path, RUNGS[i].fmt); }
  // "01 · ZERO HUNGER" (uppercase comes from the label style, not toUpperCase)
  function name(c, i) {
    var nm = c.fig(RUNGS[i].name, "raw");
    if (i === 0) nm = c.fig("issueData[0].sdg", "raw") + " · " + nm;
    if (i === 3) nm += " · " + c.prose("2025", "machineData[0].sum");
    return nm;
  }
  function tagged(c, i) { return c.label(RUNGS[i].n, "rung number") + " · " + name(c, i); }
  // One short line per rung, from data.js text or existing page copy.
  function line(c, i) {
    if (i === 0)
      return c.prose("673 million", "issueData[0].sum") +
        c.copy(" people faced hunger in ", D_ + "issueData[0].sum") + c.prose("2024", "issueData[0].sum") +
        c.copy(". Around ", D_ + "issueData[0].sum") + c.prose("$40 billion", "issueData[0].sum") +
        c.copy(" a year would end it by ", D_ + "issueData[0].sum") + c.prose("2030", "issueData[0].sum") + ".";
    if (i === 1)
      return c.copy("The ", D_ + "machineData[1].sum") + c.prose("nine", "machineData[1].sum") +
        c.copy(" nuclear states spent a record ", D_ + "machineData[1].sum") + c.fig("machineData[1].amtB", "B") +
        c.copy(" in ", D_ + "machineData[1].sum") + c.prose("2025", "machineData[1].sum") + ".";
    if (i === 2)
      return c.copy("The US alone spent ", "index.html:197") + c.fig("topSpenders[0].amt", "B") + ".";
    return c.fig("globalContext.milPctGDP", "pct") + " " + c.copy("of everything it produces", "index.html:180-181");
  }
  function src(c, i) {
    if (i === 0) return c.fig("issueData[0].src", "raw");
    return c.label(i === 1 ? "ICAN 2026" : "SIPRI 2026");
  }
  function lineFlags(c) {
    c.flag("copy", "The Zero Hunger and nuclear rung lines are data.js text (issueData[0].sum, machineData[1].sum), not yet page copy. Approve as copy.");
  }

  /* ── The table: lean-back and framing as the camera pulls ─────── */
  function stage3d(c, p) {
    var ph = c.phone, st = c.stage;
    var e = Math.pow(Math.max(0, Math.min(1, p)), 0.8);
    if (ph) {
      c.tilt({ rx: lerp(6, 32, e), ry: lerp(-1, -4, e), rz: lerp(-1, -6, e), persp: 900 });
      c.camera(lerp(0.86, 0.72, e), st.x, st.y + st.h, lerp(st.x + 22, st.x + 18, e), lerp(st.y + st.h - 16, st.y + st.h - 44, e));
    } else {
      c.tilt({ rx: lerp(5, 30, e), ry: lerp(-1, -4, e), rz: lerp(-1, -5, e), persp: 1500 });
      c.camera(lerp(0.76, 0.52, e), 0, st.y + st.h, lerp(96, 124, e), lerp(806, 774, e));
    }
    return depth(c);
  }
  // A rung's outline on screen (for leaders and insets).
  function quad(D, r) { return [D.pt(r.x, r.y), D.pt(r.x + r.w, r.y), D.pt(r.x + r.w, r.y + r.h), D.pt(r.x, r.y + r.h)]; }

  /* ── Desktop: the active rung's spec figure, flat in the negative space ── */
  // Sized so the frame edge never cuts into a letter: a cropped B reads as E, a cropped T as 7.
  var GIANT = { 0: { x: 132, y: 180, f: 340 }, 1: { x: 572, y: 88, f: 250 }, 2: { x: 560, y: 88, f: 250 }, 3: { x: 452, y: 80, f: 266 } };
  function specDesk(c, i, plate) {
    var T = c.T, TX = c.TX, g = GIANT[i];
    var gy = g.y + g.f * 0.8; // under the glyphs
    c.uiSvg(S.line(g.x + 8, g.y - 26, g.x + 8 + 560, g.y - 26, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(g.x + 8, g.y - 16, 760, tagged(c, i), TX.label + ";font-size:13px");
    c.uiDiv(g.x, g.y, null, val(c, i), TX.giant + ";font-size:" + g.f + "px;white-space:nowrap;max-width:" + (c.W - g.x) + "px;overflow:hidden");
    var lx = g.x + 10, ly = gy + 28;
    if (i === 3) {
      // the grey second reading sits at the head of the margin, above the callouts
      c.uiDiv(1000, plate ? 318 : 352, 400, line(c, i), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:26px;line-height:1.2");
      c.uiDiv(1000, plate ? 352 : 388, 300, src(c, i), TX.src);
    } else if (i === 0) {
      c.uiDiv(lx, ly, 620, line(c, i), TX.body + ";font-size:21px");
      c.uiDiv(lx, ly + 72, 600, src(c, i), TX.src);
    } else {
      c.uiDiv(1000, ly, 400, line(c, i), TX.body + ";font-size:20px");
      c.uiDiv(1000, ly + (i === 1 ? 64 : 36), 300, src(c, i), TX.src);
    }
  }
  // Earlier rungs: numbered callouts in the margin, leaders landing on each rung's top-right corner.
  // Slots sit above the baseline edges that cross the bottom-right margin in 'mid' (the US rung)
  // and 'late' (the world sheet), so no red edge runs through a callout.
  var SLOTS = { 2: [1000, 470], 1: [1044, 562], 0: [1088, 654] };
  var SLOTS_PLATE = { 2: [1000, 390], 1: [1000, 506], 0: [1000, 646] };
  function calloutDesk(c, D, i, r, plate) {
    var TX = c.TX, s = (plate ? SLOTS_PLATE : SLOTS)[i];
    var a = D.pt(r.x + r.w, r.y);
    c.uiSvg(S.leader([a, [s[0] - 44, s[1]], [s[0] - 8, s[1]]], { anchor: c.T.white }));
    c.uiSvg(S.line(s[0], s[1], s[0] + (plate ? 410 : 330), s[1], { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(s[0], s[1] + 8, 32, c.label(RUNGS[i].n, "rung number"), TX.labelW + ";font-size:12px");
    c.uiDiv(s[0] + 36, s[1] + 8, plate ? 380 : 300, name(c, i), TX.label + ";font-size:12px");
    c.uiDiv(s[0] + 34, s[1] + 28, 300, val(c, i), TX.value + ";font-size:" + (plate ? 34 : 40) + "px");
    if (plate) c.uiDiv(s[0] + 36, s[1] + 70, 380, line(c, i), TX.body + ";font-size:18px;line-height:1.4");
  }

  /* ── Phone: spec in the stage's negative space, tags on leaders, text below ── */
  var GIANT_P = { 0: 104, 1: 106, 2: 100, 3: 94 };
  function specPhone(c, i, onSheet) {
    var TX = c.TX, st = c.stage, y = onSheet ? st.y + 104 : st.y + 10, x = onSheet ? st.x + 20 : st.x;
    if (onSheet) c.uiSvg(S.line(x, y - 10, st.x + st.w - 30, y - 10, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(x, y, st.w - (x - st.x), tagged(c, i), TX.label + ";font-size:10px");
    c.uiDiv(x - 3, y + 18, null, val(c, i), TX.giant + ";font-size:" + GIANT_P[i] + "px;white-space:nowrap;max-width:" + (c.W - x + 3) + "px;overflow:hidden");
  }
  function tagPhone(c, D, i, r, k) {
    var a = D.pt(r.x + r.w, r.y);
    var tx = Math.min(c.stage.x + c.stage.w - 40, a[0] + 26 + k * 6), ty = a[1] - 26 - k * 4;
    c.uiSvg(S.leader([a, [tx - 4, ty + 8]], { anchor: c.T.white }));
    c.uiDiv(tx, ty, null, c.label(RUNGS[i].n, "rung number"), c.TX.labelW + ";font-size:10px;letter-spacing:0.06em;background:" + c.T.ground + ";padding:1px 4px");
  }
  // Earlier rungs, biggest first, then the active rung's line and source.
  function textPhone(c, rail, i, plateLines) {
    var TX = c.TX, tb = c.textBox;
    var y = tb.y;
    rail.forEach(function (k) {
      c.uiDiv(tb.x, y + 3, 26, c.label(RUNGS[k].n, "rung number"), TX.labelW + ";font-size:10px");
      c.uiDiv(tb.x + 30, y, 64, val(c, k), TX.value + ";font-size:16px");
      c.uiDiv(tb.x + 96, y + 3, tb.w - 96, name(c, k), TX.label + ";font-size:10px;letter-spacing:0.08em");
      y += 22;
      if (plateLines) {
        c.uiDiv(tb.x + 30, y, tb.w - 30, line(c, k), TX.bodySm + ";font-size:14px;line-height:1.4");
        y += k === 2 ? 26 : 44;
      }
    });
    if (rail.length) {
      c.uiSvg(S.line(tb.x, y + 4, tb.x + tb.w, y + 4, { stroke: c.T.rule }));
      y += 14;
    }
    if (i != null) {
      c.uiDiv(tb.x, y, tb.w, line(c, i), TX.bodySm + ";font-size:" + (i === 0 ? 15 : 16) + "px;line-height:1.45");
      y += i === 0 ? 70 : i === 1 ? 50 : 28;
      c.uiDiv(tb.x, y, tb.w, src(c, i), TX.src + ";font-size:10px");
    }
  }

  // A boxed detail: the stack's corner at 3:1, so the smallest rungs stay readable as the pull goes on.
  function detail(c, D, rects, box, k, chip, at) {
    var a = D.pt(rects[3].x, rects[3].y + rects[3].h); // the shared corner
    var cx = box.x + box.w * at[0], cy = box.y + box.h * at[1]; // where the corner lands in the box
    var g = '<defs><clipPath id="s02-det-' + c.variant + '"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>';
    g += S.rect(box.x, box.y, box.w, box.h, { fill: c.T.ground });
    g += '<g clip-path="url(#s02-det-' + c.variant + ')"><g transform="translate(' + cx + " " + cy + ") scale(" + k + ") translate(" + -a[0] + " " + -a[1] + ')">';
    for (var i = 3; i >= 0; i--) {
      var q = quad(D, rects[i]);
      g += S.path("M" + q.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + " Z",
        { fill: "url(#paper)", stroke: i === 0 ? c.T.blue : c.T.red, "stroke-width": (1.5 / k).toFixed(2), "stroke-opacity": i === 3 ? 1 : 0.85 });
    }
    g += "</g></g>";
    g += S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: c.T.white, "stroke-width": 1 });
    // the source region on the stack, boxed, with a leader to the detail
    var sw = box.w / k, sh = box.h / k;
    var sx = a[0] - sw * at[0], sy = a[1] - sh * at[1];
    g += S.rect(sx, sy, sw, sh, { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": 1, "stroke-dasharray": "3 3" });
    var near = box.y > sy ? [box.x, box.y] : [box.x, box.y + box.h];
    g += S.line(sx + sw, box.y > sy ? sy + sh : sy, near[0], near[1], { stroke: "rgba(255,255,255,0.4)" });
    c.uiSvg(g);
    c.uiDiv(box.x, box.y - 17, null, c.label(chip, "detail chip: magnified view of the stack's corner"), c.TX.labelW + ";font-size:10px;background:" + c.T.ground + ";border:1px solid " + c.T.white + ";padding:1px 5px");
  }

  /* ── Alt B: side by side on one shared baseline, on the same table ── */
  function drawSideBySide(c) {
    var T = c.T, TX = c.TX, ph = c.phone, st = c.stage;
    var gap = ph ? 10 : 48, left = ph ? st.x : 120, right = ph ? 0 : 80;
    var baseY = ph ? st.y + st.h : 790;
    var sumSqrt = RUNGS.reduce(function (a, r) { return a + Math.sqrt(SB.get(r.path)); }, 0);
    var avail = (ph ? st.w : c.W - left - right) - gap * 3;
    var fit = Math.pow((st.w * sumSqrt) / avail, 2); // w_i = st.w * sqrt(v_i / fit)
    var x = left, rects = [];
    RUNGS.forEach(function (rg, i) {
      var r = c.rung(rg.path, fit, { x: x, y: baseY - st.h, w: st.w, h: st.h }, "bl");
      rects.push(r);
      x += r.w + gap;
    });
    // the row lies on the table: the same lean-back as the main pull's end
    c.tilt(ph ? { rx: 30, ry: -3, rz: -4, persp: 900 } : { rx: 30, ry: -4, rz: -4, persp: 1500 });
    if (ph) c.camera(0.96, st.x, baseY, st.x + 4, st.y + st.h - 40);
    else c.camera(0.86, left, baseY, 96, 792);
    var D = depth(c);
    c.svg(S.line(ph ? st.x - 40 : 40, baseY + 0.5, ph ? st.x + st.w + 40 : c.W - 20, baseY + 0.5, { stroke: "rgba(255,255,255,0.35)" }));
    rects.forEach(function (r, i) {
      c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: RUNGS[i].tone, mode: "edge", sw: i === 3 ? 2 : 1.5, tab: i === 3, tabSize: ph ? 8 : 12 }));
    });
    var r3 = rects[3];
    if (!ph) {
      // the world total, flat and huge in the negative space above the row
      c.uiSvg(S.line(408, 66, 968, 66, { stroke: "rgba(255,255,255,0.3)" }));
      c.uiDiv(408, 76, 760, tagged(c, 3), TX.label + ";font-size:13px");
      c.uiDiv(400, 96, null, val(c, 3), TX.giant + ";font-size:250px;white-space:nowrap;max-width:" + (c.W - 400) + "px;overflow:hidden");
      c.uiDiv(410, 318, 640, line(c, 3), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:26px");
      // the three smaller rungs: a staircase of callouts rising with the rungs, each on a
      // short leader from its rung's top-right corner
      var slot = { 0: [62, 652], 1: [190, 556], 2: [372, 438] };
      [0, 1, 2].forEach(function (i) {
        var s = slot[i], a = D.pt(rects[i].x + rects[i].w, rects[i].y), vf = [28, 32, 40][i];
        var foot = s[1] + 30 + vf;
        c.uiSvg(S.leader([a, [a[0] + 14, foot + 8], [s[0], foot + 8]], { anchor: T.white }) + S.line(s[0], foot + 8, s[0] + 210, foot + 8, { stroke: "rgba(255,255,255,0.3)" }));
        c.uiDiv(s[0], s[1], 300, c.label(RUNGS[i].n, "rung number") + " · " + name(c, i), TX.label + ";font-size:11px;letter-spacing:0.1em");
        c.uiDiv(s[0] - 2, s[1] + 22, null, val(c, i), TX.value + ";font-size:" + vf + "px");
      });
      // sources under the second reading (clear of the scan line's resting place at the foot of the frame)
      c.uiDiv(410, 360, 760, c.label("SIPRI 2026 · ICAN 2026 · ") + c.fig("issueData[0].src", "raw"), TX.src);
    } else {
      rects.forEach(function (r, i) {
        if (i === 3) return;
        var a = D.pt(r.x, r.y);
        c.uiDiv(a[0], a[1] - 16, null, c.label(RUNGS[i].n, "rung number"), TX.labelW + ";font-size:10px;letter-spacing:0.06em");
      });
      c.uiSvg(S.line(st.x, st.y + 14, st.x + st.w, st.y + 14, { stroke: "rgba(255,255,255,0.3)" }));
      c.uiDiv(st.x, st.y + 22, st.w, tagged(c, 3), TX.label + ";font-size:10px");
      c.uiDiv(st.x - 3, st.y + 40, null, val(c, 3), TX.giant + ";font-size:94px;white-space:nowrap");
      c.uiDiv(st.x, st.y + 134, st.w, line(c, 3), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:16px");
      textPhone(c, [2, 1, 0], null);
      c.uiDiv(c.textBox.x, c.textBox.y + 82, c.textBox.w, c.label("SIPRI 2026 · ICAN 2026") + "<br>" + c.fig("issueData[0].src", "raw"), TX.src + ";font-size:10px");
    }
    c.flag("decision", "Nested or side by side (audit F11). Brief §8 nests every rung in one corner, which reads as 'part of': world nuclear spending sits inside the US rung, and Zero Hunger inside nuclear. Alt B sets the rungs side by side on one baseline, so no rung contains another. Choose before phase 2.");
    var s3 = D.state(r3);
    c.state({ form: "ladder · side by side (alt B)", x: s3.x, y: s3.y, w: s3.w, h: s3.h, tone: "red edge, neutral paper", note: "world sheet at the right end of a shared baseline, lying on the table (rx 30°); fit = " + Math.round(fit) + "B to the stage. Nothing fills the frame, which also sets up S03's centred sheet." });
    c.chrome();
  }

  SB.scene({
    order: 2,
    id: "S02",
    name: "The Ladder",
    move: "PULL",
    screens: 2.0,
    restrained: false,
    anchor: null,
    trigger: "End of S01: a hard cut at S01's last progress point.",
    camera:
      "Continuous pull-out that leans back as it goes (rx 5° → 30°, rz −1° → −5°), so the rungs read as stacked paper lying in one corner of a table. fit = SB.fitBetween(Zero Hunger, world total, p), log-linear, so each doubling of scale takes the same scroll. Every rung shares the stage's bottom-left corner. Each rung fills the stage's plane at its own progress point (nuclear ≈ 0.25, US ≈ 0.74, world 1.0); the framing pulls back from 0.76 to 0.52 of the frame (phone 0.86 to 0.72) to leave the top right for the number.",
    reason:
      "Rebuilding scale from the smallest rung up lets each figure arrive as a size the reader has already watched grow, so the world total lands with its true weight and no ratio is printed. Next, the world sheet centres so it can be cut open: what is the total made of?",
    frames: [
      { k: "in", p: 0, cap: "Hard cut down to the smallest rung. Zero Hunger fills the frame in blue, almost flat on the table: the cheapest thing in the story, at full scale, its figure monumental on the paper." },
      { k: "mid", p: 0.45, cap: "Pulling out and leaning back. Zero Hunger has shrunk into the corner; a leader carries its label to the margin. Nuclear has filled the plane and is shrinking too; its figure sits huge in the space above. The US rung arrives under them: a larger sheet, its edges at the frame." },
      { k: "late", p: 0.8, cap: "The US rung has pulled in from the frame edge and lies on the world sheet, which arrives from beyond the top right. Nuclear joins the margin on its own leader." },
      { k: "out", p: 1, cap: "The world sheet lies back on the table (rx 30°) with the whole ladder stacked in its corner, each rung on a leader; a 2:1 detail (2.5:1 on phone) keeps the smallest readable. $2.89T sits monumental in the space above. Next: the sheet centres (S03)." },
    ],
    alts: [
      {
        k: "B",
        label: "Side by side on one baseline",
        frames: ["out"],
        note: "Audit F11: corner nesting reads as 'part of' (world nuclear inside the US rung; Zero Hunger inside nuclear). Here the same four rungs, at true area, stand side by side on a shared baseline. The pull-out becomes a pull-and-pan along the baseline, and the world sheet ends smaller, not full frame.",
      },
    ],
    draw: function (c) {
      if (c.alt === "B" && c.k === "out") return drawSideBySide(c);
      var T = c.T, ph = c.phone, st = c.stage;
      var p = c.plate ? 1 : c.p;
      var plate = c.plate;
      var fit = SB.fitBetween(SB.get(RUNGS[0].path), SB.get(RUNGS[3].path), p);
      var rects = RUNGS.map(function (r) { return c.rung(r.path, fit, st, "bl"); });
      var active = 0;
      rects.forEach(function (r, i) { if (r.value <= fit * 1.0001) active = i; });
      var D = stage3d(c, p);

      // Rungs, biggest first so each smaller one lies on top. Off-frame rungs
      // still draw: their edges run off the frame. Phone: the stage is a
      // window, so the rungs are clipped to it (exactly, through the tilt).
      if (ph) c.svg(D.clip("s02-stage", st) + '<g clip-path="url(#s02-stage)">');
      for (var i = 3; i >= 0; i--) {
        var r = rects[i];
        c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: RUNGS[i].tone, mode: "edge", sw: i === active ? 2 : 1.5, tab: i === active, tabSize: ph ? 8 : 12 }));
      }
      if (ph) c.svg("</g>");

      var earlier = [];
      for (var k = active - 1; k >= 0; k--) earlier.push(k);

      if (!ph) {
        specDesk(c, active, plate);
        earlier.forEach(function (k2) { calloutDesk(c, D, k2, rects[k2], plate); });
        if (plate) c.uiDiv(1036, 832, 380, c.label("ICAN 2026 · ") + c.fig("issueData[0].src", "raw"), c.TX.src);
        if (active === 3 && !plate) detail(c, D, rects, { x: 96, y: 104, w: 240, h: 150 }, 2, "DETAIL · 2:1", [0.06, 0.92]);
        if (active < 3 && p > 0) {
          var nx = active + 1;
          c.uiDiv(c.W - 40 - 420, 62, 420,
            c.label(RUNGS[nx].n, "rung number") + " · " + val(c, nx) + " ↗",
            c.TX.labelW + ";font-size:12px;text-align:right");
        }
      } else {
        specPhone(c, active, p === 0);
        earlier.forEach(function (k2, j) { tagPhone(c, D, k2, rects[k2], j); });
        textPhone(c, earlier, plate && active === 3 ? null : active, plate);
        if (plate && active === 3) c.uiDiv(c.textBox.x, c.textBox.y + 194, c.textBox.w, c.label("SIPRI 2026 · ICAN 2026") + "<br>" + c.fig("issueData[0].src", "raw"), c.TX.src + ";font-size:10px");
        if (active === 3 && !plate) detail(c, D, rects, { x: 268, y: 304, w: 86, h: 90 }, 2.5, "2.5:1", [0.1, 0.9]);
        if (active < 3 && p > 0) {
          var nxp = active + 1;
          c.uiDiv(st.x + st.w - 160, st.y + st.h - 18, 156,
            c.label(RUNGS[nxp].n, "rung number") + " · " + val(c, nxp) + " ↗",
            c.TX.labelW + ";font-size:10px;text-align:right");
        }
      }

      if (active <= 1) lineFlags(c);
      if (active === 3) {
        c.flag("decision", "Nested or side by side (audit F11). Brief §8 nests every rung in one corner, which reads as 'part of': world nuclear spending sits inside the US rung, and Zero Hunger inside nuclear. Alt B sets the rungs side by side. Choose before phase 2.");
        c.flag("decision", "Brief §8 makes every war rung red, so the end frame holds three red outlines (thin; only the newest has the 2px edge and the tab) against the brand's 'normally one red mark'. Confirm, or drop earlier war rungs to grey edges once they leave the frame.");
      } else if (active >= 1) {
        c.flag("decision", "Brief §8 makes every war rung red, so this frame already holds more than one red outline (the active rung, plus the edges of the next war rung at the frame; only the active rung has the 2px edge and the tab) against the brand's 'normally one red mark'. Same decision as the end frame.");
      }
      var ar = rects[active];
      var big = rects[3];
      var sa = D.state(ar);
      c.state({
        form: active === 3 ? "sheet lying back, the ladder stacked in its corner" : "ladder: rung " + RUNGS[active].n + " " + (p === 0 ? "near full frame" : "in frame, pulling out"),
        x: sa.x, y: sa.y, w: sa.w, h: sa.h,
        tone: RUNGS[active].tone + " edge, neutral paper",
        note: "fit " + Math.round(fit) + "B fills the stage's plane; world sheet " + Math.round(big.w) + "×" + Math.round(big.h) + (big.w > st.w + 1 ? " (beyond the frame)" : "") + "; anchor: stage bottom-left; table tilt rx " + Math.round(c._tilt.rx) + "°",
      });
      c.chrome();
    },
    // No-motion plate: the end state, with every rung's line on its callout.
    plate: function (c) {
      this.draw(c);
    },
  });
})();
