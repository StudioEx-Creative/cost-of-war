/* S04 · THE SORT · RE-RANK · 1.0 screen
   The $2.89T treemap has restacked into ten bars: the ten largest
   military budgets. Bar length is dollars and never changes. Only the
   order changes: first by dollars, then by share of GDP. Ukraine glides
   from seventh to first, the camera trucks with it, and the other nine
   snap into the new order the moment it lands. Then the bars close up
   and fuse into one steel plate, which S05 cuts into drawing stock. */
(function () {
  "use strict";

  var N = 10;
  var SP = SB.get("topSpenders");
  // Order by dollars is the data order; order by GDP share is a stable sort,
  // exactly as js/main.js:336-337 sorts the live page's second column.
  var BY_USD = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].amt - SP[a].amt; });
  var BY_GDP = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].gdp - SP[a].gdp; });
  var MOVER = BY_GDP[0]; // the bar that travels furthest (Ukraine)
  var MAXAMT = Math.max.apply(null, SP.map(function (s) { return s.amt; }));

  function slotOf(order, i) { return order.indexOf(i); }
  function pad2(n) { return (n < 9 ? "0" : "") + (n + 1); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  // Timeline (scroll progress inside the scene)
  //   0.00–0.25  ranked by dollars; GDP readings fade in from 0.12
  //   0.25–0.60  the mover glides from its dollar slot to slot 01 (lifted, in front)
  //   0.60       the other nine hard-snap into GDP order (one state change)
  //   0.85–1.00  the bars close up and fuse into one steel plate
  function phase(p) {
    return {
      read: clamp((p - 0.12) / 0.16), // GDP reading opacity
      glide: clamp((p - 0.25) / 0.35), // mover travel 0..1
      snapped: p >= 0.6,
      fuse: clamp((p - 0.85) / 0.15),
    };
  }

  SB.scene({
    order: 4,
    id: "S04",
    name: "The Sort",
    move: "RE-RANK",
    screens: 1.0,
    restrained: false,
    anchor: null,
    trigger: "S03's treemap has restacked into ten bars (end of S03).",
    camera: "Slow lateral truck: the camera drifts left with the bar that moves furthest, then settles. Desktop only; phone holds still.",
    reason:
      "Fusing the ten bars into one plate turns the money into material: the same steel that becomes the drawing in S05. Bar length never changed, so the plate is still the same money until S05 cuts it in two on the dashed line and it becomes drawing stock.",
    frames: [
      { k: "in", p: 0, cap: "The treemap's slices land as ten bars, ranked by dollars. Length = $bn. The top-ranked bar carries the one red edge." },
      { k: "mid", p: 0.45, cap: "GDP share arrives as a grey second reading. Ukraine leaves seventh place and glides to first, in front; the camera trucks with it. Lengths never change." },
      { k: "out", p: 0.8, cap: "Ukraine lands. The other nine hard-snap into GDP order at one exact point (reverses exactly). Length still = dollars; only the order changed." },
      { k: "detail", p: 0.8, cap: "Hover (desktop) or tap (phone) on a bar opens its detail. Shown on Ukraine." },
      { k: "fuse", p: 1, cap: "Exit: labels go, gaps close, the ten bars fuse into one steel plate, outline unchanged. A cut line appears for S05's split." },
    ],
    alts: [
      {
        k: "B",
        label: "Rest of world kept as an outline",
        frames: ["in"],
        note: "The ten budgets sum to less than the $2.89T sheet. An unlabelled grey outline holds the rest so area still means money through the restack. That remainder is derived (DEFENCE minus the ten) and is not in data.js.",
      },
    ],
    draw: function (c) {
      if (c.phone) drawPhone(c);
      else drawDesk(c);
    },
    // No-motion plate: GDP order, every bar with its dollar value and its GDP reading.
    plate: function (c) {
      if (c.phone) drawPhone(c, { plate: true });
      else drawDesk(c, { plate: true });
    },
  });

  /* ── shared bits ──────────────────────────────────────────────── */
  function names(c) {
    return SP.map(function (_, i) { return c.fig("topSpenders[" + i + "].name", "raw").toUpperCase(); });
  }
  function remainderB() {
    var sum = SP.reduce(function (a, s) { return a + s.amt; }, 0);
    return { sum: sum, rest: SB.get("DEFENCE") - sum };
  }

  /* ═══ DESKTOP · vertical bars on one baseline ═══════════════════ */
  function drawDesk(c, o) {
    o = o || {};
    var T = c.T, TX = c.TX, S = SB.SVG;
    var p = o.plate ? 0.8 : c.p;
    var ph = phase(p);
    var altB = c.alt === "B";
    var detail = c.k === "detail" && !o.plate;
    var base = 690; // baseline
    var HMAX = 440; // the largest budget's height
    var k = HMAX / MAXAMT; // px per $B (length = money; same width, so area = money too)
    var cw = 68, pitch = 120;
    var nCols = altB ? N + 1 : N;
    var x0 = Math.round((c.W - ((nCols - 1) * pitch + cw)) / 2);
    var NM = names(c);

    // Camera: slow lateral truck. Follows the mover left while it glides, then settles.
    var dx = 0;
    if (!o.plate) {
      if (p < 0.25) dx = 0;
      else if (p < 0.6) dx = 130 * Math.sin(Math.PI * 0.5 * ph.glide);
      else dx = 130 - 110 * clamp((p - 0.6) / 0.25);
    }
    c.camera(1, c.W / 2, c.H / 2, c.W / 2 + dx, c.H / 2);

    // world grid (moves with the camera, so the truck reads in a still)
    c.svg(S.grid(-240, 30, c.W + 480, 840, 60, { ticks: false }));
    c.svg(S.line(x0 - 60, base, x0 + (nCols - 1) * pitch + cw + 60, base, { stroke: "rgba(255,255,255,0.4)" }));

    if (ph.fuse > 0) return deskFuse(c, o, { base: base, k: k, cw: cw, pitch: pitch, x0: x0, f: ph.fuse, NM: NM });

    // slot of each bar at this progress
    var useGdp = ph.snapped || o.plate;
    var order = useGdp ? BY_GDP : BY_USD;
    var leader = order[0];
    var redOn = useGdp ? MOVER : ph.glide > 0 ? MOVER : leader; // the one red edge
    var cols = [];
    SP.forEach(function (s, i) {
      var slot = slotOf(order, i), lift = 0, moving = false;
      if (!useGdp && i === MOVER && ph.glide > 0) {
        var from = slotOf(BY_USD, i);
        slot = from + (0 - from) * ph.glide;
        lift = 150 * Math.min(1, ph.glide * 6) * (ph.glide < 1 ? 1 : 0);
        moving = true;
      }
      cols.push({ i: i, slot: slot, x: x0 + slot * pitch, h: s.amt * k, lift: lift, moving: moving });
    });

    // ghost of the mover's old slot + its travel line
    var mv = cols[MOVER];
    if (mv.moving) {
      var gx = x0 + slotOf(BY_USD, MOVER) * pitch;
      c.svg(S.rect(gx + 0.5, base - mv.h + 0.5, cw - 1, mv.h - 1, { fill: "none", stroke: T.grey, "stroke-dasharray": "4 4" }));
      var ty = base - mv.lift - mv.h / 2;
      c.svg(S.path("M" + (gx + cw / 2) + " " + (base - mv.h) + " V" + ty + " H" + (mv.x + cw + 6), { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 5" }));
      c.svg(S.path("M" + (mv.x - 12) + " " + (ty - 7) + " L" + (mv.x - 26) + " " + ty + " L" + (mv.x - 12) + " " + (ty + 7), { stroke: T.white, "stroke-width": 1.5 }));
      c.svg(S.line(mv.x - 26, ty, mv.x - 60, ty, { stroke: T.white, "stroke-width": 1.5, opacity: 0.5 }));
    }

    // 'in': the bars have just dropped out of S03's treemap; faint drop tracks above each
    if (!o.plate && p < 0.05 && !useGdp) {
      cols.forEach(function (cl) {
        var top = base - cl.h - 44;
        [cl.x + 6, cl.x + cw - 6].forEach(function (lx) {
          c.svg(S.line(lx, 150, lx, top, { stroke: "rgba(255,255,255,0.22)", "stroke-dasharray": "2 6" }));
        });
      });
      c.svg(S.line(x0 - 30, 150, x0 + (nCols - 1) * pitch + cw + 30, 150, { stroke: "rgba(255,255,255,0.22)", "stroke-dasharray": "2 6" }));
    }

    // bars (the mover last, so it passes in front)
    cols.slice().sort(function (a, b) { return (a.moving ? 1 : 0) - (b.moving ? 1 : 0); }).forEach(function (cl) {
      var y = base - cl.lift - cl.h;
      if (cl.i === redOn) c.svg(S.sheet(cl.x, y, cw, cl.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: 8 }));
      else {
        c.svg(S.rect(cl.x, y, cw, cl.h, { fill: T.sheet, stroke: T.sheetLine }));
        c.svg(S.line(cl.x, y + 1, cl.x + cw, y + 1, { stroke: T.white, "stroke-width": 2 }));
      }
      if (detail && cl.i === MOVER) c.svg(S.rect(cl.x - 6, y - 6, cw + 12, cl.h + 12, { fill: "none", stroke: T.white, "stroke-width": 1 }));
    });

    // labels
    cols.forEach(function (cl) {
      var i = cl.i, y = base - cl.lift - cl.h;
      var val = c.fig("topSpenders[" + i + "].amt", "B");
      c.div(cl.x - 26, y - 30, cw + 52, val, TX.value + ";font-size:20px;text-align:center");
      if (cl.moving) {
        // the travelling bar carries its own name and reading
        c.div(cl.x - 26, y - 76, cw + 52, NM[i], TX.labelW + ";font-size:11px;text-align:center");
        c.div(cl.x - 26, y - 56, cw + 52, c.fig("topSpenders[" + i + "].gdp", "pct"), TX.label + ";font-size:13px;text-align:center;letter-spacing:0.06em");
        // its old name slot stays, dimmed
        var gx = x0 + slotOf(BY_USD, i) * pitch;
        c.div(gx, base + 12, 112, pad2(slotOf(BY_USD, i)), TX.label + ";font-size:11px;opacity:0.5");
        c.div(gx, base + 28, 112, NM[i], TX.label + ";font-size:11px;opacity:0.5");
        return;
      }
      var rank = Math.round(cl.slot);
      c.div(cl.x, base + 12, 112, pad2(rank), TX.label + ";font-size:11px");
      c.div(cl.x, base + 28, 112, NM[i], TX.labelW + ";font-size:11px");
      if (ph.read > 0 || o.plate)
        c.div(cl.x, base + 66, 112, c.fig("topSpenders[" + i + "].gdp", "pct"),
          TX.label + ";letter-spacing:0.06em;font-size:" + (useGdp ? 16 : 13) + "px;opacity:" + (o.plate ? 1 : ph.read));
    });

    if (altB) {
      // the unlabelled remainder: area = DEFENCE minus the ten (derived, flagged)
      var R = remainderB();
      var rx = x0 + N * pitch, rh = R.rest * k;
      c.svg(S.rect(rx + 0.5, base - rh + 0.5, cw - 1, rh - 1, { fill: "none", stroke: T.grey, "stroke-dasharray": "5 5" }));
      c.flag("decision", "ALT B keeps an unlabelled 'rest of world' outline so area still equals the $2.89T sheet through the restack. It is derived (DEFENCE − Σ topSpenders = " + R.rest.toFixed(1) + " $B) and not in data.js. Approve the derived outline, or accept that area stops summing to $2.89T at the restack (main frames).");
      c.state({ form: "ten bars + remainder outline", x: x0, y: base - HMAX, w: N * pitch + cw, h: HMAX, tone: "neutral, one red edge", note: "bar heights ∝ $B; remainder outline ∝ derived rest; together they equal DEFENCE at this scale" });
    }

    // ── fixed text (UI layer)
    var hx = 120, hy = 70;
    if (!useGdp && ph.read === 0) {
      c.uiDiv(hx, hy, 160, c.label("HEIGHT & ORDER"), TX.label + ";font-size:11px");
      c.uiDiv(hx + 170, hy - 1, 760, c.copy("10 largest military budgets · 2025 · $bn", "index.html:523").toUpperCase(), TX.labelW + ";font-size:13px");
    } else {
      c.uiDiv(hx, hy, 160, c.label("HEIGHT"), TX.label + ";font-size:11px");
      c.uiDiv(hx + 170, hy - 1, 760, c.copy("10 largest military budgets · 2025 · $bn", "index.html:523").toUpperCase(), TX.labelW + ";font-size:13px");
      c.uiDiv(hx, hy + 28, 160, c.label(useGdp ? "ORDER" : "ORDER · CHANGING"), TX.label + ";font-size:11px");
      c.uiDiv(hx + 170, hy + 27, 760, c.copy("…and what that costs them · % of GDP", "index.html:527").toUpperCase(),
        (useGdp ? TX.labelW : TX.label) + ";font-size:13px;opacity:" + (o.plate ? 1 : Math.max(0.6, ph.read)));
    }
    c.uiDiv(120, 820, 300, c.label("SIPRI 2026 ↗"), TX.src);

    if (detail) deskDetail(c, cols[MOVER], base, cw, dx);

    if (!altB) {
      if (c.k === "in") c.flag("decision", "Restack from S03: the ten bars sum to less than the $2.89T treemap (see ALT B). Main frames let area stop summing to $2.89T at the restack; each bar's length still equals its own budget.");
      c.state({
        form: "ten bars",
        x: x0, y: base - HMAX, w: (N - 1) * pitch + cw, h: HMAX,
        tone: "neutral paper, one red edge (" + SP[redOn].name + ")",
        note: (useGdp ? "ordered by % of GDP" : ph.glide > 0 ? "re-rank in progress" : "ordered by $") + "; height ∝ $B, width fixed, so area ∝ money; camera dx " + Math.round(dx),
      });
    }
    if (!o.plate) c.chrome();
  }

  function deskDetail(c, cl, base, cw, dx) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var i = cl.i;
    var top = base - cl.h;
    // card: 226 wide so it clears the next tall bar (United States, slot 04) by 24px
    var ax = cl.x + cw / 2, cx = cl.x + 110, cy = 360, cwd = 226;
    c.svg(S.leader([[ax, top - 34], [ax, cy + 70], [cx, cy + 70]]));
    // hover cursor
    c.svg(S.path("M" + (ax + 8) + " " + (top + 8) + " l0 18 l5 -5 l4 9 l3 -1.5 l-4 -9 l7 0 Z", { fill: T.white, stroke: T.ground, "stroke-width": 1 }));
    c.svg(S.rect(cx, cy, cwd, 196, { fill: T.ground, stroke: T.sheetLine }));
    c.svg(S.line(cx + 18, cy + 18, cx + cwd - 18, cy + 18, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(cx + 18, cy + 28, cwd - 36, pad2(slotOf(BY_GDP, i)) + " · " + c.fig("topSpenders[" + i + "].name", "raw").toUpperCase(), TX.labelW + ";font-size:12px");
    c.div(cx + 18, cy + 52, cwd - 36, c.fig("topSpenders[" + i + "].amt", "B"), TX.value + ";font-size:44px");
    c.div(cx + 18, cy + 108, cwd - 36, c.fig("topSpenders[" + i + "].gdp", "pct") + " " + c.label("OF GDP"), TX.label + ";font-size:13px;letter-spacing:0.08em");
    c.div(cx + 18, cy + 130, cwd - 36, c.fig("topSpenders[" + i + "].change", "raw") + " " + c.newCopy("YEAR ON YEAR", "hover-detail label for topSpenders.change (no year typed; the change is 2025 on the year before, SIPRI)"), TX.label + ";font-size:13px;letter-spacing:0.08em");
    c.div(cx + 18, cy + 164, cwd - 36, c.label("SIPRI 2026 ↗"), TX.src);
    c.flag("decision", "Hover/tap detail prints topSpenders.change (" + SB.get("topSpenders[" + i + "].change") + " for " + SB.get("topSpenders[" + i + "].name") + "). It is in data.js but not on the live page. Approve, or keep the detail to $bn and % of GDP only.");
  }

  function deskFuse(c, o, g) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var f = g.f;
    // gaps close toward the centre; outline (and so area) unchanged
    var w = g.cw * N;
    var px0 = (c.W - w) / 2;
    var d = "";
    var pts = [];
    BY_GDP.forEach(function (i, slot) {
      var from = g.x0 + slot * g.pitch, to = px0 + slot * g.cw;
      var x = from + (to - from) * f;
      var h = SP[i].amt * g.k;
      pts.push({ x: x, h: h, i: i });
    });
    // fused outline (stepped skyline) as one path once closed
    var path = "M" + pts[0].x + " " + g.base;
    pts.forEach(function (pt) { path += " V" + (g.base - pt.h) + " H" + (pt.x + g.cw); });
    path += " V" + g.base + " Z";
    // where the bars stood a moment ago (dashed), and the inward close-up
    BY_GDP.forEach(function (i, slot) {
      var gx = g.x0 + slot * g.pitch, h = SP[i].amt * g.k;
      c.svg(S.rect(gx + 0.5, g.base - h + 0.5, g.cw - 1, h - 1, { fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "3 5" }));
    });
    [[g.x0 + 20, px0 - 24, 1], [g.x0 + (N - 1) * g.pitch + g.cw - 20, px0 + w + 24, -1]].forEach(function (a) {
      var ay = g.base + 56;
      c.svg(S.line(a[0], ay, a[1], ay, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 5" }));
      c.svg(S.path("M" + (a[1] - 8 * a[2]) + " " + (ay - 6) + " L" + a[1] + " " + ay + " L" + (a[1] - 8 * a[2]) + " " + (ay + 6), { stroke: T.white, "stroke-width": 1.5 }));
    });
    c.svg('<path d="' + path + '" fill="' + T.sheet + '"/>');
    c.svg('<path d="' + path + '" fill="url(#hatch-grey)"/>');
    c.svg(S.path(path, { stroke: T.white, "stroke-width": 1.5 }));
    // faint welds where the bars met
    pts.slice(1).forEach(function (pt, j) {
      var hh = Math.min(pt.h, pts[j].h);
      c.svg(S.line(pt.x, g.base - hh, pt.x, g.base, { stroke: "rgba(255,255,255,0.22)" }));
    });
    // the cut line S05 opens
    var mid = c.W / 2;
    c.svg(S.line(mid, g.base - g.k * MAXAMT - 40, mid, g.base + 30, { stroke: T.white, "stroke-dasharray": "6 6", opacity: 0.8 }));
    c.svg(S.path("M" + (mid - 8) + " " + (g.base + 30) + " L" + mid + " " + (g.base + 42) + " L" + (mid + 8) + " " + (g.base + 30), { stroke: T.white, "stroke-width": 1.5 }));
    c.uiDiv(120, 70, 600, c.copy("THE PRODUCTION LINE", "index.html:293"), TX.labelW + ";font-size:13px");
    c.uiDiv(120, 820, 300, c.label("SIPRI 2026 ↗"), TX.src + ";opacity:0.5");
    c.state({ form: "steel plate (fused bars)", x: Math.round(px0), y: Math.round(g.base - g.k * MAXAMT), w: w, h: Math.round(g.k * MAXAMT), tone: "neutral, grey steel hatch, no red", note: "gaps closed, stepped outline kept: area still = the ten budgets. S05 cuts it in two on the dashed line; area stops meaning money there." });
    c.chrome();
  }

  /* ═══ PHONE · horizontal bars, one row per budget ═══════════════ */
  function drawPhone(c, o) {
    o = o || {};
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage, tb = c.textBox;
    var p = o.plate ? 0.8 : c.p;
    var ph = phase(p);
    var altB = c.alt === "B";
    var detail = c.k === "detail" && !o.plate;
    var NM = names(c);
    var LMAX = 214;
    var k = LMAX / MAXAMT;
    var rowH = altB ? 43 : 47;
    var y0 = st.y + 26;
    var bx = st.x;
    var useGdp = ph.snapped || o.plate;
    var order = useGdp ? BY_GDP : BY_USD;
    var redOn = useGdp ? MOVER : ph.glide > 0 ? MOVER : order[0];

    if (ph.fuse > 0) return phoneFuse(c, { k: k, rowH: rowH, y0: y0 });

    // column heads inside the stage
    c.div(bx, st.y, 200, c.label("$BN"), TX.label + ";font-size:10px");
    if (ph.read > 0 || o.plate) c.div(st.x + st.w - 120, st.y, 120, c.label("% OF GDP"), TX.label + ";font-size:10px;text-align:right;opacity:" + (o.plate ? 1 : Math.max(ph.read, 0.5)));

    var rows = [];
    SP.forEach(function (s, i) {
      var slot = slotOf(order, i), moving = false, off = 0;
      if (!useGdp && i === MOVER && ph.glide > 0) {
        var from = slotOf(BY_USD, i);
        slot = from + (0 - from) * ph.glide;
        moving = true;
        off = 150; // pulled out to the right while it travels up
      }
      rows.push({ i: i, slot: slot, y: y0 + slot * rowH, off: off, moving: moving, len: s.amt * k });
    });

    var mv = rows[MOVER];
    if (mv.moving) {
      var gy = y0 + slotOf(BY_USD, MOVER) * rowH;
      c.svg(S.rect(bx + 0.5, gy + 18.5, mv.len - 1, 13, { fill: "none", stroke: T.grey, "stroke-dasharray": "3 3" }));
      c.div(bx, gy, 200, pad2(slotOf(BY_USD, MOVER)) + "&nbsp;&nbsp;" + NM[MOVER], TX.label + ";font-size:10px;opacity:0.5");
      c.svg(S.path("M" + (bx + mv.len + 6) + " " + (gy + 25) + " H" + (bx + mv.off - 10) + " V" + (mv.y + 34), { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 4" }));
      c.svg(S.path("M" + (bx + mv.off + 30) + " " + (mv.y - 2) + " l6 -9 l6 9", { stroke: T.white, "stroke-width": 1.5 }));
    }

    rows.forEach(function (r) {
      if (r.moving) return;
      phoneRow(c, r, NM, ph, o, useGdp, redOn, detail);
    });
    if (mv.moving) phoneRow(c, mv, NM, ph, o, useGdp, redOn, detail);

    if (altB) {
      var R = remainderB();
      var ry = y0 + N * rowH;
      c.svg(S.rect(bx + 0.5, ry + 18.5, R.rest * k - 1, 13, { fill: "none", stroke: T.grey, "stroke-dasharray": "4 4" }));
      c.flag("decision", "ALT B keeps an unlabelled 'rest of world' outline so area still equals the $2.89T sheet through the restack. It is derived (DEFENCE − Σ topSpenders = " + R.rest.toFixed(1) + " $B) and not in data.js. Approve the derived outline, or accept that area stops summing to $2.89T at the restack (main frames).");
    }

    // ── text box: one idea, two short lines
    if (detail) {
      var i = MOVER;
      c.svg(S.line(tb.x, tb.y, tb.x + tb.w, tb.y, { stroke: "rgba(255,255,255,0.3)" }));
      c.div(tb.x, tb.y + 10, tb.w, pad2(slotOf(BY_GDP, i)) + " · " + NM[i], TX.labelW + ";font-size:11px");
      c.div(tb.x, tb.y + 32, tb.w, c.fig("topSpenders[" + i + "].amt", "B"), TX.value + ";font-size:40px");
      c.div(tb.x, tb.y + 84, tb.w, c.fig("topSpenders[" + i + "].gdp", "pct") + " " + c.label("OF GDP") + " · " +
        c.fig("topSpenders[" + i + "].change", "raw") + " " + c.newCopy("YEAR ON YEAR", "tap-detail label for topSpenders.change (no year typed; the change is 2025 on the year before, SIPRI)"), TX.label + ";font-size:12px;letter-spacing:0.08em");
      c.div(tb.x, tb.y + 112, tb.w, c.label("SIPRI 2026 ↗"), TX.src);
      c.flag("decision", "Hover/tap detail prints topSpenders.change (" + SB.get("topSpenders[" + i + "].change") + " for " + SB.get("topSpenders[" + i + "].name") + "). It is in data.js but not on the live page. Approve, or keep the detail to $bn and % of GDP only.");
    } else if (!useGdp && ph.read === 0) {
      c.div(tb.x, tb.y, tb.w, c.copy("10 largest military budgets · 2025 · $bn", "index.html:523"), TX.bodySm + ";color:" + T.white);
      c.div(tb.x, tb.y + 56, tb.w, c.label("LENGTH AND ORDER · $BN"), TX.label + ";font-size:10px");
      c.div(tb.x, tb.y + 80, tb.w, c.label("SIPRI 2026 ↗"), TX.src);
    } else {
      c.div(tb.x, tb.y, tb.w, c.copy("…and what that costs them · % of GDP", "index.html:527"), TX.bodySm + ";color:" + T.white);
      c.div(tb.x, tb.y + 56, tb.w, c.label("LENGTH · $BN") + "&nbsp;&nbsp;&nbsp;" + c.label(useGdp ? "ORDER · % OF GDP" : "ORDER · CHANGING"), TX.label + ";font-size:10px");
      if (useGdp && !o.plate) c.div(tb.x, tb.y + 80, tb.w, c.newCopy("TAP A BAR", "phone hint: no hover on touch (brief §11)"), TX.label + ";font-size:10px;color:" + T.white);
      c.div(tb.x, tb.y + (useGdp && !o.plate ? 104 : 80), tb.w, c.label("SIPRI 2026 ↗"), TX.src);
    }

    if (!altB) {
      if (c.k === "in") c.flag("decision", "Restack from S03: the ten bars sum to less than the $2.89T treemap (see ALT B). Main frames let area stop summing to $2.89T at the restack; each bar's length still equals its own budget.");
      c.state({ form: "ten bars (rows)", x: st.x, y: y0, w: LMAX, h: N * rowH, tone: "neutral paper, one red edge (" + SP[redOn].name + ")", note: (useGdp ? "ordered by % of GDP" : ph.glide > 0 ? "re-rank in progress" : "ordered by $") + "; length ∝ $B, fixed thickness" });
    } else c.state({ form: "ten rows + remainder outline", x: st.x, y: y0, w: LMAX, h: (N + 1) * rowH, tone: "neutral, one red edge", note: "remainder outline ∝ derived rest" });
    if (!o.plate) c.chrome();
  }

  function phoneRow(c, r, NM, ph, o, useGdp, redOn, detail) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var i = r.i, x = c.stage.x + r.off, y = r.y;
    var rank = r.moving ? null : Math.round(r.slot);
    var nm = (rank != null ? pad2(rank) + "&nbsp;&nbsp;" : "") + NM[i];
    c.div(x, y, r.moving ? 190 : 230, nm, (r.moving ? TX.labelW : TX.labelW) + ";font-size:10px");
    if (ph.read > 0 || o.plate || r.moving) {
      var gtxt = c.fig("topSpenders[" + i + "].gdp", "pct");
      if (r.moving) c.div(x, y + 36, 120, gtxt, TX.label + ";font-size:12px;letter-spacing:0.06em");
      else c.div(c.stage.x + c.stage.w - 80, y - 1, 80, gtxt, TX.label + ";text-align:right;letter-spacing:0.06em;font-size:" + (useGdp ? 13 : 12) + "px;opacity:" + (o.plate ? 1 : ph.read));
    }
    if (i === redOn) c.svg(S.sheet(x, y + 18, r.len, 14, { tone: "red", mode: "edge", sw: 1.5, tab: true, tabSize: 5 }));
    else {
      c.svg(S.rect(x, y + 18, r.len, 14, { fill: T.sheet, stroke: T.sheetLine }));
      c.svg(S.line(x + r.len - 1, y + 18, x + r.len - 1, y + 32, { stroke: T.white, "stroke-width": 2 }));
    }
    c.div(x + r.len + 8, y + 16, 90, c.fig("topSpenders[" + i + "].amt", "B"), TX.value + ";font-size:15px");
    if (detail && i === MOVER) {
      c.svg(S.rect(c.stage.x - 4, y - 6, c.stage.w + 8, 46, { fill: "none", stroke: T.white, "stroke-width": 1 }));
      c.svg(S.circle(x + 190, y + 18, 13, { fill: "none", stroke: T.white, "stroke-width": 1.5 }));
      c.svg(S.circle(x + 190, y + 18, 3.5, { fill: T.white }));
    }
  }

  function phoneFuse(c, g) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage, tb = c.textBox;
    var bh = 14;
    var plateH = bh * N;
    var py = st.y + (st.h - plateH) / 2;
    // rows close up (gaps only; each bar keeps its length and its left edge):
    // one plate with the bars' ragged edge, so its outline is still the ten budgets
    var d = "M" + st.x + " " + py;
    BY_GDP.forEach(function (i, slot) {
      d += " H" + (st.x + SP[i].amt * g.k) + " V" + (py + (slot + 1) * bh);
    });
    d += " H" + st.x + " Z";
    // ghosts of the rows a moment ago (left-aligned), faint
    BY_GDP.forEach(function (i, slot) {
      var len = SP[i].amt * g.k, gy = st.y + 26 + slot * 47 + 18;
      c.svg(S.rect(st.x + 0.5, gy + 0.5, len - 1, 13, { fill: "none", stroke: "rgba(255,255,255,0.14)", "stroke-dasharray": "2 4" }));
    });
    c.svg('<path d="' + d + '" fill="' + T.sheet + '"/>');
    c.svg('<path d="' + d + '" fill="url(#hatch-grey)"/>');
    c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    [[st.y + 30, py - 12, 1], [st.y + st.h - 20, py + plateH + 12, -1]].forEach(function (a) {
      var ax = st.x + st.w - 30;
      c.svg(S.line(ax, a[0], ax, a[1], { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 4" }));
      c.svg(S.path("M" + (ax - 6) + " " + (a[1] - 8 * a[2]) + " L" + ax + " " + a[1] + " L" + (ax + 6) + " " + (a[1] - 8 * a[2]), { stroke: T.white, "stroke-width": 1.5 }));
    });
    // cut line (S05 stacks its split top / bottom)
    var cy = py + plateH / 2;
    c.svg(S.line(st.x, cy, st.x + st.w, cy, { stroke: T.white, "stroke-dasharray": "5 5", opacity: 0.8 }));
    c.div(tb.x, tb.y, tb.w, c.copy("THE PRODUCTION LINE", "index.html:293"), TX.labelW + ";font-size:11px");
    c.state({ form: "steel plate (fused rows)", x: st.x, y: Math.round(py), w: Math.round(MAXAMT * g.k), h: plateH, tone: "neutral, grey steel hatch, no red", note: "gaps closed, ragged edge kept: area still = the ten budgets; S05 cuts it on the dashed line" });
    c.chrome();
  }
})();
