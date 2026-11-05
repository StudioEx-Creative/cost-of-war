/* S02 · THE LADDER · PULL · 2.0 screens
   Hard cut from the full-frame world sheet down to the smallest rung:
   Zero Hunger, at full frame, in blue. The camera then pulls out without
   a break (fit = SB.fitBetween, log-linear, so each doubling of scale takes
   the same scroll). Every rung is anchored at the same corner, the
   bottom-left of the stage. Each rung fills the frame once, then shrinks
   into the corner. Its label leaves the rung for a numbered callout:
   a fixed rail with leader lines on desktop, a stacked label rail on phone.
   Rungs, smallest first: Zero Hunger (blue), nuclear, United States,
   world military spending (red). The two appeal figures stay out (S11). */
(function () {
  "use strict";
  var S = SB.SVG;

  // Every value is read from js/data.js.
  var RUNGS = [
    { n: "01", path: "issueData[0].cost", fmt: "B", tone: "blue", name: "issueData[0].name" },
    { n: "02", path: "machineData[1].amtB", fmt: "B", tone: "red", name: "machineData[1].name" },
    { n: "03", path: "topSpenders[0].amt", fmt: "B", tone: "red", name: "topSpenders[0].name" },
    { n: "04", path: "DEFENCE", fmt: "T", tone: "red", name: "machineData[0].name" },
  ];
  var D = "js/data.js ";

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
        c.copy(" people faced hunger in ", D + "issueData[0].sum") + c.prose("2024", "issueData[0].sum") +
        c.copy(". Around ", D + "issueData[0].sum") + c.prose("$40 billion", "issueData[0].sum") +
        c.copy(" a year would end it by ", D + "issueData[0].sum") + c.prose("2030", "issueData[0].sum") + ".";
    if (i === 1)
      return c.copy("The ", D + "machineData[1].sum") + c.prose("nine", "machineData[1].sum") +
        c.copy(" nuclear states spent a record ", D + "machineData[1].sum") + c.fig("machineData[1].amtB", "B") +
        c.copy(" in ", D + "machineData[1].sum") + c.prose("2025", "machineData[1].sum") + ".";
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

  /* ── Desktop: spec figure inside the active rung ─────────────── */
  function specDesk(c, i, r, withSrc, below) {
    var T = c.T, TX = c.TX;
    var s = r.h / c.stage.h;
    var px = r.x + Math.max(64, Math.round(120 * s));
    var off = Math.max(40, Math.round(76 * s));
    var vf = Math.round(Math.max(72, 160 * s));
    // The block must clear the top of the next rung down (it sits inside this one).
    // Block height: rule→label 12, label→value 24, value, gap 22, line, source.
    if (below) {
      var lineH = i === 3 ? 44 : i === 0 ? 70 : 40;
      var avail = below.y - 18 - r.y;
      var need = function (f) { return 36 + f * 0.9 + 22 + lineH + 16; };
      if (off + need(vf) > avail) off = Math.max(24, avail - need(vf));
      if (off + need(vf) > avail) vf = Math.max(56, Math.floor((avail - off - 36 - 22 - lineH - 16) / 0.9));
    }
    var py = r.y + off;
    var rw = Math.min(620, r.x + r.w - px - 60);
    c.svg(S.line(px, py, px + rw, py, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(px, py + 12, 760, tagged(c, i), TX.label + ";font-size:13px");
    c.div(px - vf * 0.035, py + 36, null, val(c, i), TX.giant + ";font-size:" + vf + "px");
    var ly = py + 36 + vf * 0.9 + 22;
    if (i === 3) {
      c.div(px, ly, 700, line(c, i), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:" + Math.round(30 * Math.max(s, 0.8)) + "px");
      ly += 44;
    } else {
      c.div(px, ly, i === 0 ? 640 : 760, line(c, i), TX.body + ";font-size:" + (i === 2 ? 22 : 20) + "px");
      ly += i === 0 ? 70 : 40;
    }
    if (withSrc !== false) c.div(px, ly, 600, src(c, i), TX.src);
  }

  /* ── Desktop: fixed callout rail with leader lines ───────────── */
  var RAIL = { x: 980, w: 380, rows: { 2: 470, 1: 600, 0: 730 } };
  function railDesk(c, i, r, withLine) {
    var TX = c.TX;
    var y = RAIL.rows[i];
    c.svg(S.leader([[r.x + r.w, r.y], [RAIL.x - 30, y], [RAIL.x, y]]));
    c.svg(S.line(RAIL.x, y, RAIL.x + RAIL.w, y, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(RAIL.x, y + 10, 40, c.label(RUNGS[i].n, "rung number"), TX.labelW + ";font-size:12px");
    c.div(RAIL.x + 44, y + 10, RAIL.w - 44, name(c, i), TX.label + ";font-size:12px");
    c.div(RAIL.x + 44, y + 32, RAIL.w - 44, val(c, i), TX.value + ";font-size:44px");
    if (withLine) c.div(RAIL.x + 44, y + 84, RAIL.w - 44, line(c, i), TX.bodySm + ";font-size:14px;line-height:1.45");
  }

  /* ── Phone: spec inside the active rung, tags, stacked rail ──── */
  function specPhone(c, i, r, withLine) {
    var T = c.T, TX = c.TX;
    var px = r.x + 18, py = r.y + 20;
    var vf = Math.round(Math.max(38, Math.min(68, r.w * 0.2)));
    c.svg(S.line(px, py, r.x + r.w - 18, py, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(px, py + 10, r.w - 36, tagged(c, i), TX.label + ";font-size:10px");
    c.div(px - 2, py + (i === 0 || i === 3 ? 44 : 30), null, val(c, i), TX.giant + ";font-size:" + vf + "px");
    if (withLine) c.div(px, py + 44 + vf * 0.9 + 14, r.w - 36, line(c, i), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:16px;line-height:1.3");
  }
  function tagPhone(c, i, r) {
    c.div(r.x + 5, r.y + 4, null, c.label(RUNGS[i].n, "rung number"), c.TX.labelW + ";font-size:10px;letter-spacing:0.06em");
  }
  // Earlier rungs, biggest first, then the active rung's line and source.
  function textPhone(c, rail, i, plateLines) {
    var TX = c.TX, tb = c.textBox;
    var y = tb.y;
    rail.forEach(function (k) {
      c.div(tb.x, y + 3, 26, c.label(RUNGS[k].n, "rung number"), TX.labelW + ";font-size:10px");
      c.div(tb.x + 30, y, 64, val(c, k), TX.value + ";font-size:16px");
      c.div(tb.x + 96, y + 3, tb.w - 96, name(c, k), TX.label + ";font-size:10px;letter-spacing:0.08em");
      y += 22;
      if (plateLines) {
        c.div(tb.x + 30, y, tb.w - 30, line(c, k), TX.bodySm + ";font-size:14px;line-height:1.4");
        y += k === 2 ? 26 : 44;
      }
    });
    if (rail.length) {
      c.svg(S.line(tb.x, y + 4, tb.x + tb.w, y + 4, { stroke: c.T.rule }));
      y += 14;
    }
    if (i != null) {
      c.div(tb.x, y, tb.w, line(c, i), TX.bodySm + ";font-size:" + (i === 0 ? 15 : 16) + "px;line-height:1.45");
      y += i === 0 ? 70 : i === 1 ? 50 : 28;
      c.div(tb.x, y, tb.w, src(c, i), TX.src + ";font-size:10px");
    }
  }

  /* ── Alt B: side by side on one shared baseline ──────────────── */
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
    c.svg(S.line(ph ? st.x : 90, baseY + 0.5, ph ? st.x + st.w : c.W - 60, baseY + 0.5, { stroke: "rgba(255,255,255,0.35)" }));
    rects.forEach(function (r, i) {
      c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: RUNGS[i].tone, mode: "edge", sw: i === 3 ? 2 : 1.5, tab: i === 3, tabSize: ph ? 8 : 12 }));
    });
    if (!ph) {
      // labels sit on each rung, stepping up with the rungs
      // Narrow rungs: number, then the name on its own line(s), then the value,
      // stacked just above each rung and no wider than the gap to the next one.
      var NAMES2 = [
        [c.label(RUNGS[0].n, "rung number") + " · " + c.fig("issueData[0].sdg", "raw"), c.fig("issueData[0].name", "raw")],
        [c.label(RUNGS[1].n, "rung number"), c.fig("machineData[1].name", "raw")],
        [c.label(RUNGS[2].n, "rung number") + " · " + c.fig("topSpenders[0].name", "raw")],
      ];
      rects.forEach(function (r, i) {
        if (i === 3) return;
        var vf = [24, 28, 40][i];
        var lines = NAMES2[i];
        var y = r.y - 12 - vf - 8 - lines.length * 16;
        c.div(r.x, y, rects[i + 1].x - r.x - 8, lines.join("<br>"), TX.label + ";font-size:11px;letter-spacing:0.1em;line-height:16px");
        c.div(r.x, r.y - 12 - vf, null, val(c, i), TX.value + ";font-size:" + vf + "px");
      });
      var r3 = rects[3];
      c.svg(S.line(r3.x, r3.y - 170, r3.x + r3.w, r3.y - 170, { stroke: "rgba(255,255,255,0.3)" }));
      c.div(r3.x, r3.y - 158, r3.w, tagged(c, 3), TX.label + ";font-size:12px");
      c.div(r3.x - 3, r3.y - 132, null, val(c, 3), TX.giant + ";font-size:76px");
      c.div(r3.x, r3.y - 50, r3.w, line(c, 3), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:22px");
      c.div(120, baseY + 14, 700, c.label("SIPRI 2026 · ICAN 2026 · ") + c.fig("issueData[0].src", "raw"), TX.src);
    } else {
      rects.forEach(function (r, i) {
        if (i === 3) return;
        c.div(r.x, r.y - 16, null, c.label(RUNGS[i].n, "rung number"), TX.labelW + ";font-size:10px;letter-spacing:0.06em");
      });
      var q = rects[3];
      c.svg(S.line(st.x, st.y + 24, st.x + st.w, st.y + 24, { stroke: "rgba(255,255,255,0.3)" }));
      c.div(st.x, st.y + 34, st.w, tagged(c, 3), TX.label + ";font-size:10px");
      c.div(st.x - 2, st.y + 58, null, val(c, 3), TX.giant + ";font-size:60px");
      c.div(st.x, st.y + 122, st.w, line(c, 3), TX.value + ";font-weight:400;color:" + T.grey + ";font-size:16px");
      textPhone(c, [2, 1, 0], null);
      c.div(c.textBox.x, c.textBox.y + 82, c.textBox.w, c.label("SIPRI 2026 · ICAN 2026") + "<br>" + c.fig("issueData[0].src", "raw"), TX.src + ";font-size:10px");
    }
    c.flag("decision", "Nested or side by side (audit F11). Brief §8 nests every rung in one corner, which reads as 'part of': world nuclear spending sits inside the US rung, and Zero Hunger inside nuclear. Alt B sets the rungs side by side on one baseline, so no rung contains another. Choose before phase 2.");
    c.state({ form: "ladder · side by side (alt B)", x: Math.round(rects[3].x), y: Math.round(rects[3].y), w: Math.round(rects[3].w), h: Math.round(rects[3].h), tone: "red edge, neutral paper", note: "world sheet at the right end of a shared baseline; fit = " + Math.round(fit) + "B to the stage. Nothing fills the frame, which also sets up S03's centred sheet." });
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
      "Continuous pull-out. fit = SB.fitBetween(Zero Hunger, world total, p), log-linear, so each doubling of scale takes the same scroll. Every rung shares the stage's bottom-left corner. Each rung fills the frame at its own progress point (nuclear ≈ 0.25, US ≈ 0.74, world 1.0).",
    reason:
      "Rebuilding scale from the smallest rung up lets each figure arrive as a size the reader has already watched grow, so the world total lands with its true weight and no ratio is printed. Next, the world sheet centres so it can be cut open: what is the total made of?",
    frames: [
      { k: "in", p: 0, cap: "Hard cut down to the smallest rung. Zero Hunger fills the frame in blue: the cheapest thing in the story, at full scale." },
      { k: "mid", p: 0.45, cap: "Pulling out. Zero Hunger has shrunk into the corner; its label moves out to the rail on a leader. Nuclear has filled the frame and is shrinking too. The US rung arrives: its red edge already shows on the left and bottom of the frame." },
      { k: "late", p: 0.8, cap: "The US rung has pulled in from the frame edge. Nuclear joins the rail. The world sheet arrives from beyond the top-right." },
      { k: "out", p: 1, cap: "The world sheet fills the frame again, as S01 ended, now with the whole ladder nested in its corner, each rung labelled. Next: the sheet centres (S03)." },
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
      var fit = SB.fitBetween(SB.get(RUNGS[0].path), SB.get(RUNGS[3].path), p);
      var rects = RUNGS.map(function (r) { return c.rung(r.path, fit, st, "bl"); });
      var active = 0;
      rects.forEach(function (r, i) { if (r.value <= fit * 1.0001) active = i; });

      // Rungs, biggest first so each smaller one sits on top. Off-frame rungs
      // still draw: their left and bottom edges show along the frame edge.
      // Phone: the stage is a window inside the screen, so the rungs are
      // clipped to it (nothing runs into the chrome or the text box).
      if (ph) c.svg('<defs><clipPath id="s02-stage"><rect x="' + st.x + '" y="' + st.y + '" width="' + st.w + '" height="' + st.h + '"/></clipPath></defs><g clip-path="url(#s02-stage)">');
      for (var i = 3; i >= 0; i--) {
        var r = rects[i];
        c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: RUNGS[i].tone, mode: "edge", sw: i === active ? 2 : 1.5, tab: i === active, tabSize: ph ? 8 : 12 }));
      }
      if (ph) c.svg("</g>");

      var earlier = [];
      for (var k = active - 1; k >= 0; k--) earlier.push(k);
      var plate = c.plate;

      if (!ph) {
        specDesk(c, active, rects[active], true, active > 0 ? rects[active - 1] : null);
        earlier.forEach(function (k) { railDesk(c, k, rects[k], plate); });
        if (plate) c.div(RAIL.x + 44, 866, RAIL.w - 44, c.label("ICAN 2026 · ") + c.fig("issueData[0].src", "raw"), c.TX.src);
        if (active < 3 && p > 0) {
          var nx = active + 1;
          c.uiDiv(c.W - 40 - 420, 62, 420,
            c.label(RUNGS[nx].n, "rung number") + " · " + val(c, nx) + " ↗",
            c.TX.labelW + ";font-size:12px;text-align:right");
        }
      } else {
        specPhone(c, active, rects[active], plate && active === 3);
        earlier.forEach(function (k) { tagPhone(c, k, rects[k]); });
        textPhone(c, earlier, plate && active === 3 ? null : active, plate);
        if (plate && active === 3) c.div(c.textBox.x, c.textBox.y + 194, c.textBox.w, c.label("SIPRI 2026 · ICAN 2026") + "<br>" + c.fig("issueData[0].src", "raw"), c.TX.src + ";font-size:10px");
        if (active < 3 && p > 0) {
          var nxp = active + 1;
          c.uiDiv(st.x + st.w - 160, st.y + 8, 152,
            c.label(RUNGS[nxp].n, "rung number") + " · " + val(c, nxp) + " ↗",
            c.TX.labelW + ";font-size:10px;text-align:right");
        }
      }

      if (active <= 1) lineFlags(c);
      if (active === 3) {
        c.flag("decision", "Nested or side by side (audit F11). Brief §8 nests every rung in one corner, which reads as 'part of': world nuclear spending sits inside the US rung, and Zero Hunger inside nuclear. Alt B sets the rungs side by side. Choose before phase 2.");
        c.flag("decision", "Brief §8 makes every war rung red, so the end frame holds three red outlines (thin; only the newest has the 2px edge and the tab) against the brand's 'normally one red mark'. Confirm, or drop earlier war rungs to grey edges once they leave the frame.");
      }
      var ar = rects[active];
      var big = rects[3];
      c.state({
        form: active === 3 ? "sheet (full frame) with the ladder nested in its corner" : "ladder: rung " + RUNGS[active].n + " " + (p === 0 ? "at full frame" : "in frame, pulling out"),
        x: Math.round(ar.x), y: Math.round(ar.y), w: Math.round(ar.w), h: Math.round(ar.h),
        tone: RUNGS[active].tone + " edge, neutral paper",
        note: "fit " + Math.round(fit) + "B fills the stage; world sheet " + Math.round(big.w) + "×" + Math.round(big.h) + (big.w > st.w + 1 ? " (beyond the frame)" : "") + "; anchor: stage bottom-left",
      });
      c.chrome();
    },
    // No-motion plate: the end state, with every rung's line on the rail.
    plate: function (c) {
      this.draw(c);
    },
  });
})();
