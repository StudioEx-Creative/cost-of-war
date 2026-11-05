/* S03 · THE SLICE · CUT · 1.0 screen
   S02 ends on the $2.89T sheet at full frame with the ladder nested in its
   corner. The sheet centres at a smaller true-area scale (room for labels)
   and the ladder lets go. Scroll scores dashed cut guides across the sheet;
   at one exact progress point (0.5) the sheet is cut: six sectors of
   spendBreakdown, area ∝ $B, summing exactly to DEFENCE. One red edge (the
   sheet's own); sectors are neutral paper told apart by white rules and
   numbered labels, never six red shades. The split is modelled, so it
   carries an indicative label. Exit: the slices restack into the ten
   largest budgets (S04). */
(function () {
  "use strict";
  var S = SB.SVG;
  var N = 6;
  var CENTRE = 0.1; // 0–0.1: S02's full-frame sheet eases in to centre
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
  // full-frame sheet), drawn at a smaller true-area scale and centred.
  function geom(c) {
    var ph = c.phone;
    var FW = ph ? c.stage.w : c.W, FH = ph ? c.stage.h : c.H;
    var k = ph ? 302 / 343 : 900 / 1440;
    var w = FW * k;
    var x = ph ? c.stage.x + (c.stage.w - w) / 2 : (c.W - w) / 2;
    var y = ph ? 110 : 150;
    var fit = SB.get("DEFENCE") / (k * k);
    return { k: k, fit: fit, box: { x: x, y: y, w: FW, h: FH } };
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
      c.uiDiv(270, 66, 900, t + '<span style="' + TX.label + ';font-size:13px;margin-left:16px;vertical-align:6px">' + by + "</span>",
        TX.title + ";font-size:40px;opacity:" + op);
    } else {
      c.uiDiv(16, 62, 343, t, TX.title + ";font-size:19px;opacity:" + op);
      c.uiDiv(16, 86, 200, by, TX.label + ";font-size:10px;opacity:" + op);
    }
  }
  function indicativeTag(c, sh) {
    var ph = c.phone;
    c.uiDiv(sh.x + sh.w - 200, sh.y - (ph ? 22 : 24), 200,
      c.label("INDICATIVE", "data-status tag; wording under open decision 3"),
      c.TX.labelW + ";text-align:right;font-size:" + (ph ? 10 : 11) + "px");
  }
  function note(c, sh, y) {
    var TX = c.TX, ph = c.phone;
    var txt = c.newCopy("Indicative split, modelled on typical national defence budgets. SIPRI publishes the world total only. Nuclear: ICAN.", "open decision 3 wording");
    if (!ph) c.uiDiv(sh.x, y, sh.w, txt, TX.bodySm + ";font-size:15px;color:" + c.T.grey);
    else c.uiDiv(c.textBox.x, y, c.textBox.w, txt, TX.bodySm + ";font-size:14px;line-height:1.4;color:" + c.T.grey);
  }
  function sources(c, x, y) {
    c.uiDiv(x, y, c.phone ? c.textBox.w : 400, c.copy("SIPRI 2026 ↗", "index.html:252") + " &nbsp;·&nbsp; " + c.copy("ICAN nuclear 2026 ↗", "index.html:258"),
      c.TX.src + (c.phone ? ";font-size:10px" : ""));
  }

  // The spec figure S02 left in the sheet's corner, carried in at the new scale.
  function spec(c, sh, op) {
    var TX = c.TX, ph = c.phone;
    var px = sh.x + (ph ? 16 : 52), py = sh.y + (ph ? 22 : 44);
    var rw = ph ? sh.w - 32 : 560;
    var s = '<g opacity="' + op + '">' + S.line(px, py, px + rw, py, { stroke: "rgba(255,255,255,0.3)" }) + "</g>";
    c.svg(s);
    c.div(px, py + (ph ? 10 : 12), rw, c.fig("machineData[0].name", "raw") + " · " + c.prose("2025", "machineData[0].sum"),
      TX.label + ";font-size:" + (ph ? 10 : 12) + "px;opacity:" + op);
    c.div(px - (ph ? 2 : 5), py + (ph ? 32 : 36), null, c.fig("DEFENCE", "T"), TX.giant + ";font-size:" + (ph ? 56 : 120) + "px;opacity:" + op);
    c.div(px, py + (ph ? 90 : 154), 300, c.label("SIPRI 2026"), TX.src + ";opacity:" + op + (ph ? ";font-size:10px" : ""));
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
      c.div(r.x + (ph ? 4 : 8), r.y + (ph ? 4 : 7), null, lab, TX.label + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0.06em;opacity:" + Math.min(1, op + 0.15));
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

  // Dashed cut guides, scored progressively (frac 0..1 of their total length).
  function guides(c, segs, frac) {
    var tot = segs.reduce(function (a, s) { return a + Math.hypot(s[2] - s[0], s[3] - s[1]); }, 0);
    var left = tot * frac, tip = null, out = "";
    segs.forEach(function (s) {
      if (left <= 0) return;
      var L = Math.hypot(s[2] - s[0], s[3] - s[1]);
      var f = Math.min(1, left / L);
      var x2 = s[0] + (s[2] - s[0]) * f, y2 = s[1] + (s[3] - s[1]) * f;
      out += S.line(s[0], s[1], x2, y2, { stroke: "rgba(255,255,255,0.6)", "stroke-dasharray": "6 5", "stroke-width": 1.25 });
      if (f < 1) tip = [x2, y2];
      left -= L;
    });
    c.svg(out);
    if (tip) c.svg(S.rect(tip[0] - 3, tip[1] - 3, 6, 6, { fill: c.T.white }));
  }

  // The cut: white rules on every boundary, then numbered labels in each sector.
  function cutSheet(c, cells, segs, sh) {
    var T = c.T, TX = c.TX, ph = c.phone;
    sheetEdge(c, sh, "red");
    var rules = "";
    segs.forEach(function (s) { rules += S.line(s[0], s[1], s[2], s[3], { stroke: T.white, "stroke-width": ph ? 1.5 : 2 }); });
    c.svg(rules);
    cells.forEach(function (r, i) {
      logArea(c, secPath(i), SB.get(secPath(i)), r, sh);
      var A = r.w * r.h;
      if (!ph) {
        var pad = 16, nameW = r.w - pad * 2 - 30;
        var nm = secName(c, i);
        var raw = SB.get("spendBreakdown[" + i + "].label").toUpperCase();
        var longest = Math.max.apply(null, raw.split(" ").map(function (w) { return w.length; })) * 8.9;
        // narrow sector: the name drops under the number and takes the full width
        var under = longest > nameW;
        if (under) nameW = r.w - pad * 2;
        var nl = lines(raw, nameW, 8.9) + (under ? 1 : 0);
        var vf = clamp(Math.round(Math.sqrt(A) * 0.13), 22, 56);
        c.div(r.x + pad, r.y + 14, 28, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:12px");
        c.div(r.x + pad + (under ? 0 : 30), r.y + 14 + (under ? 18 : 0), nameW, nm, TX.label + ";font-size:12px;line-height:16px");
        var vy = r.y + 14 + nl * 16 + 12 + (under ? 2 : 0);
        c.div(r.x + pad, vy, null, secVal(c, i), TX.value + ";font-size:" + vf + "px");
        if (i === N - 1) c.div(r.x + pad, vy + vf + 10, r.w - pad * 2, c.label("ICAN 2026"), TX.src);
      } else {
        var vfp = clamp(Math.round(Math.sqrt(A) * 0.12), 14, 30);
        c.div(r.x + 12, r.y + 9, 30, c.label(pad2(i), "sector number"), TX.labelW + ";font-size:10px;letter-spacing:0.06em");
        c.div(r.x + 12, r.y + 25, null, secVal(c, i), TX.value + ";font-size:" + vfp + "px");
      }
    });
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

  /* ── Exit: the sheet is re-cut into the ten largest budgets ─────── */
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
    // Main: fading out (dropped). Alt B: held as a firm outline that travels on.
    c.svg(S.rect(rem.x + 0.75, rem.y + 0.75, rem.w - 1.5, rem.h - 1.5, { fill: "none", stroke: keep ? T.white : T.grey, "stroke-width": keep ? 1.5 : 1, "stroke-dasharray": keep ? "8 4" : "3 6", opacity: keep ? 0.75 : 0.22 }));
    // the ten strips, scored apart by white rules; the largest takes the one red edge
    rs.forEach(function (r, i) {
      if (i === 0) return;
      c.svg(S.rect(r.x, r.y, r.w, r.h, { fill: T.sheet, stroke: T.sheetLine }));
    });
    var rules = "";
    rs.forEach(function (r, i) {
      if (i === 0) return;
      rules += ph ? S.line(r.x, r.y, r.x + r.w, r.y, { stroke: T.white, "stroke-width": 1.25 })
                  : S.line(r.x, r.y, r.x, r.y + r.h, { stroke: T.white, "stroke-width": 1.5 });
    });
    c.svg(rules);
    var r0 = rs[0];
    c.svg(S.sheet(r0.x, r0.y, r0.w, r0.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 10 }));
    // numbers: above each strip (desktop), in the left gutter (phone)
    rs.forEach(function (r, i) {
      var st = (i === 0 ? TX.labelW : TX.label) + ";font-size:10px;letter-spacing:0.04em;line-height:10px";
      if (!ph) c.div(r.x + r.w / 2 - 15, sh.y - 20, 30, c.label(pad2(i), "rank number"), st + ";text-align:center");
      else c.div(c.stage.x, r.y + r.h / 2 - 5, 18, c.label(pad2(i), "rank number"), st);
    });
    c.div(r0.x + (ph ? 26 : 14), r0.y + (ph ? 10 : 16), ph ? r0.w - 40 : r0.w - 28, c.fig("topSpenders[0].name", "raw"), TX.labelW + ";font-size:" + (ph ? 10 : 12) + "px");
    // drop tracks: each strip falls to S04's baseline (desktop)
    if (!ph) {
      var tr = "";
      (keep ? rs.concat([rem]) : rs).forEach(function (r) {
        var cx = r.x + r.w / 2, y0 = sh.y + sh.h + 8, y1 = y0 + 34;
        tr += S.line(cx, y0, cx, y1, { stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "2 4" });
        tr += S.path("M" + (cx - 3.5) + " " + (y1 - 4) + " L" + cx + " " + y1 + " L" + (cx + 3.5) + " " + (y1 - 4), { stroke: "rgba(255,255,255,0.55)" });
      });
      c.svg(tr);
    }
    return { rs: rs, rem: rem, keep: keep };
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
      "Still. Over 0–0.1 the sheet eases from S02's full frame to centre at a smaller true-area scale (room for labels); this is S02's transition. From 0.1 nothing moves. The cut is a state change at one exact progress point (0.5).",
    reason:
      "Cutting the one total into what it pays for (people, upkeep, weapons, research, bases, nuclear) shows the " + DEF_T + " is a budget with parts, not an abstraction. Next, the same sheet is re-cut by who spends it: the slices restack into the ten largest budgets (S04). Those ten sum to less than the sheet, so area stops summing to " + DEF_T + " at the restack (flagged).",
    frames: [
      { k: "in", p: 0.1, cap: "0–0.1: S02's full-frame sheet eases in to centre at a smaller true-area scale (faint traces: its path from the frame corners). The ladder lets go: its three rungs hang as grey dashed ghosts in the corner, fading by 0.2. The spec figure is still on the sheet." },
      { k: "score", p: 0.3, cap: "From 0.1, scroll scores dashed cut guides across the sheet, largest cut first (white square = the blade). The title and the indicative label arrive. The spec figure dims under the guides." },
      { k: "mid", p: 0.5, cap: "HARD CUT at 0.5: the guides snap to white rules. Six sectors, area ∝ $B, summing exactly to the sheet. One red edge (the sheet's); sectors told apart by rules and numbered labels. Holds to 0.8." },
      { k: "out", p: 1, cap: "Exit (0.8–1.0): sector labels clear; the sheet is re-cut into the ten largest budgets, strip width ∝ $B (phone: height), ranked. The red edge passes to strip 01. The uncut rest is an unlabelled grey ghost, fading out: it is dropped. The strips fall into S04's bars." },
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

      // 'in' only: faint traces from the frame corners, the sheet pulling in to centre
      if (p <= CENTRE && !c.plate) {
        var F = ph ? c.stage : { x: 0, y: 0, w: c.W, h: c.H };
        var tr = "";
        [[F.x, F.y, sh.x, sh.y], [F.x + F.w, F.y, sh.x + sh.w, sh.y], [F.x, F.y + F.h, sh.x, sh.y + sh.h], [F.x + F.w, F.y + F.h, sh.x + sh.w, sh.y + sh.h]].forEach(function (q) {
          tr += S.line(q[0], q[1], q[2], q[3], { stroke: "rgba(255,255,255,0.22)", "stroke-dasharray": "2 6" });
        });
        c.bgSvg(tr);
      }

      if (p < CUT) {
        // ── before the cut: the whole sheet
        sheetEdge(c, sh, "red");
        var gOp = clamp(1 - (p - CENTRE) / 0.1, 0, 1) * 0.6; // ghosts fade out by 0.2
        if (gOp > 0) ghosts(c, g, sh, gOp);
        spec(c, sh, p <= CENTRE ? 1 : 0.3);
        if (p > CENTRE) {
          guides(c, segs, clamp((p - CENTRE) / (CUT - CENTRE), 0, 1));
          title(c);
          indicativeTag(c, sh);
          if (!ph) {
            note(c, sh, sh.y + sh.h + 20);
            sources(c, sh.x, sh.y + sh.h + 58);
          } else {
            note(c, sh, c.textBox.y);
            sources(c, c.textBox.x, c.textBox.y + 68);
          }
        } else if (ph) {
          ghostRail(c, 0.6);
        }
        c.state({
          form: p <= CENTRE ? "sheet (centred, whole)" : "sheet (centred), cut guides scored",
          x: Math.round(sh.x), y: Math.round(sh.y), w: Math.round(sh.w), h: Math.round(sh.h),
          tone: "red edge, neutral paper",
          note: "area = DEFENCE at fit " + Math.round(g.fit) + "B per frame; scale " + g.k.toFixed(3) + " of S02's full frame" +
            (p <= CENTRE ? "; eased in from full frame over 0–0.1; ladder rungs released as fading grey ghosts (return in S11)" : "; " + Math.round(clamp((p - CENTRE) / (CUT - CENTRE), 0, 1) * 100) + "% of the cut length scored"),
        });
      } else if (p < EXIT) {
        // ── the cut (and the no-motion plate)
        cutSheet(c, cells, segs, sh);
        title(c);
        indicativeTag(c, sh);
        if (!ph) {
          note(c, sh, sh.y + sh.h + 20);
          sources(c, sh.x, sh.y + sh.h + 58);
        } else {
          var ny = sectorRail(c);
          note(c, sh, ny);
          sources(c, c.textBox.x, ny + 66);
        }
        c.flag("decision", "Open decision 3: data.js:26-30 says the sector split is indicative and modelled, but the live page cites SIPRI for it. Proposed: an INDICATIVE tag on the sheet plus the note below it (new copy). Confirm the wording.");
        c.flag("data", "Sector values are modelled, not sourced; only Nuclear forces (" + NUKE_B + ", ICAN) is a published figure. Values print as the live legend prints them (js/main.js:14 fmt), so Personnel & pay shows " + PERS_T + ", not " + PERS_B + ".");
        c.flag("decision", "Brand (audit BR-07): data.js gives the six sectors six red shades. Drawn here as neutral paper inside the sheet's one red edge, told apart by white rules and numbered labels. Confirm with the brand owner.");
        c.flag("copy", "The live card's third link, 'SIPRI arms 2026 ↗' (index.html:264), is about arms transfers, not this split. Not carried here; it belongs with the +9.2% figure in S05.");
        c.state({
          form: "treemap (6 sectors) on the sheet",
          x: Math.round(sh.x), y: Math.round(sh.y), w: Math.round(sh.w), h: Math.round(sh.h),
          tone: "red edge, neutral paper; sectors split by white rules",
          note: "squarified, area ∝ spendBreakdown amtB; the six sum exactly to DEFENCE, so the sectors fill the sheet",
        });
      } else {
        // ── exit: restack into the ten largest budgets
        var res = strips(c, sh);
        var head = c.copy("10 largest military budgets · 2025 · $bn", "index.html:523");
        // the sector title has gone with the sector labels; S04's heading takes its place
        if (!ph) {
          c.uiDiv(sh.x, 76, 760, head, TX.labelW + ";font-size:13px");
          c.uiDiv(sh.x, sh.y + sh.h + 58, 300, c.copy("SIPRI 2026 ↗", "index.html:252"), TX.src);
        } else {
          c.uiDiv(c.textBox.x, c.textBox.y, c.textBox.w, head, TX.bodySm + ";font-size:16px;color:" + T.white);
          c.uiDiv(c.textBox.x, c.textBox.y + 30, c.textBox.w, c.copy("SIPRI 2026 ↗", "index.html:252"), TX.src + ";font-size:10px");
        }
        c.flag("decision", "Restack (audit F12): the six sectors sum to the whole sheet, the ten budgets do not, so area cannot keep summing to " + DEF_T + " through the restack. Main: each strip keeps its own true area and the uncut rest is an unlabelled grey ghost that is dropped (S04 main). ALT B: the rest is kept as an unlabelled outline that drops with the strips (S04 ALT B); it is derived (DEFENCE minus the ten), not in data.js. Choose one for both scenes.");
        c.state({
          form: "ten strips (re-cut sheet) + uncut rest " + (res.keep ? "kept as an outline (alt B)" : "ghost, dropped"),
          x: Math.round(sh.x), y: Math.round(sh.y), w: Math.round(sh.w), h: Math.round(sh.h),
          tone: "neutral paper; red edge moves to strip 01 (" + SB.get("topSpenders[0].name") + ")",
          note: (ph ? "horizontal strips, height" : "vertical strips, width") + " ∝ topSpenders amt at the sheet's scale; uncut rest " + Math.round(ph ? res.rem.h : res.rem.w) + "px, unlabelled, not carried to S04",
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
