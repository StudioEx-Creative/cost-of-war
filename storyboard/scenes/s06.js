/* S06 · THE TURN · PULL WIDE · 1.5 screens
   S05's drawing has shrunk into a corner of the $2.89T sheet. The camera
   pulls wide until $2.89T is small and the $21.8T sheet fills the frame.
   Every earlier rung stays, labelled. Area uses machineData[3].amtB; the
   label prints machineData[3].amt ("$21.8T"), as the live page does.
   Main frames: the brief's version (rungs nested in the corner).
   Alt B: the audit's version ($21.8T beside the ladder, not around it). */
(function () {
  "use strict";

  // The ladder rungs carried in from S02, largest first. Tones per brief §8.
  var RUNGS = [
    { path: "DEFENCE", fmt: "T", name: "machineData[0].name", tone: "red" },
    { path: "topSpenders[0].amt", fmt: "B", name: "topSpenders[0].name", tone: "red" },
    { path: "machineData[1].amtB", fmt: "B", name: "machineData[1].name", tone: "red" },
    { path: "issueData[0].cost", fmt: "B", name: "issueData[0].name", tone: "blue" },
  ];
  var BIG = "machineData[3].amtB"; // area only
  var BIG_LABEL = "machineData[3].amt"; // "$21.8T", the page's own string

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  // Rough line count for mono text wrapped into a box (for stacking rail rows).
  function lines(text, w, cw) {
    var n = 1, at = 0, per = Math.max(1, Math.floor(w / cw));
    String(text).split(" ").forEach(function (word) {
      var L = word.length + (at ? 1 : 0);
      if (at + L > per && at) { n++; at = word.length; } else at += L;
    });
    return n;
  }
  // Phone: the world is clipped to the stage, so a sheet larger than the stage runs out of view.
  function clipOn(c, id) {
    if (!c.phone) return;
    var s = c.stage;
    c.svg('<defs><clipPath id="' + id + '"><rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '"/></clipPath></defs><g clip-path="url(#' + id + ')">');
  }
  function clipOff(c) { if (c.phone) c.svg("</g>"); }

  // S05's engineering drawing, parked in a corner: grey line art only.
  function drawing(x, y, w, S, T) {
    var h = w * 0.5, cy = y + h * 0.42, st = { stroke: T.grey, "stroke-width": 1, fill: "none" };
    var bx = x + w * 0.16, bw = w * 0.6, bh = h * 0.26;
    var s = "";
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
    return s;
  }
  // Where the parked drawing sits on the $2.89T sheet, scaled with it from its corner anchor.
  function parkedDrawing(c, ax, ay, k) {
    var st = c.stage;
    var d0 = c.phone ? { x: st.x + st.w - 128, y: st.y + 168, w: 108 } : { x: 1150, y: 78, w: 220 };
    c.svg(drawing(ax + (d0.x - st.x) * k, ay - (st.y + st.h - d0.y) * k, d0.w * k, SB.SVG, c.T));
  }

  function toneCol(c, t) { return t === "blue" ? c.T.blue : t === "red" ? c.T.red : c.T.grey; }
  // Two-line rail row: swatch, value, mono name. Optional leader from the rung's top-right corner.
  function railRow(c, it, x, y, w, o) {
    var TX = c.TX, S = SB.SVG;
    o = o || {};
    var vs = o.vs || 20, ls = o.ls || 11;
    if (o.leader) c.svg(S.leader([[it.r.x + it.r.w, it.r.y], [x - 22, y + 11], [x - 8, y + 11]]));
    c.svg(S.rect(x - 1, y + 6, 9, 9, { fill: "none", stroke: toneCol(c, it.tone), "stroke-width": 1.5 }));
    c.div(x + 16, y, w - 16, it.value, TX.value + ";font-size:" + vs + "px");
    c.div(x + 16, y + vs + 6, w - 16, it.name, TX.label + ";font-size:" + ls + "px" + (o.tight ? ";letter-spacing:0.04em" : ""));
  }
  // One-line rail row (phone, when the space beside the nest is narrow).
  function railLine(c, it, x, y, w) {
    var TX = c.TX, S = SB.SVG;
    c.svg(S.rect(x, y + 5, 8, 8, { fill: "none", stroke: toneCol(c, it.tone), "stroke-width": 1.5 }));
    c.div(x + 16, y, w - 16, it.value + ' &nbsp;<span style="' + TX.label + ';font-size:10px">' + it.name + "</span>", TX.value + ";font-size:16px");
  }

  function rungs(c, fit, box) {
    return RUNGS.map(function (R) {
      return { r: c.rung(R.path, fit, box, "bl"), tone: R.tone, value: c.fig(R.path, R.fmt), name: c.fig(R.name, "raw").toUpperCase() };
    });
  }
  function drawRungs(c, list) {
    list.forEach(function (it, i) {
      var r = it.r;
      c.svg(SB.SVG.sheet(r.x, r.y, r.w, r.h, { tone: it.tone, mode: "edge", sw: i === 0 ? 1.5 : 1.25, tab: i === 0, tabSize: c.phone ? 6 : 8 }));
    });
  }
  function texts(c) {
    var T = c.T;
    return {
      cA: c.copy("That was the cost to the states that spend it.", "index.html:552"),
      cB: c.copy("This is what it costs everyone.", "index.html:554"),
      bigVal: c.fig(BIG_LABEL, "raw"),
      bigName: c.fig("machineData[3].name", "raw").toUpperCase(),
      pct: c.fig("globalContext.violencePctGDP", "pct") + " " + c.copy("of world GDP", "index.html:212"),
      per: c.copy("about ", "index.html:213") + '<b style="color:' + T.white + ';font-weight:600">' + c.fig("globalContext.violencePerPerson", "usd") + "</b>" + c.copy(" taken from every person alive", "index.html:213"),
      iep: c.label("IEP GPI 2026 ↗"),
    };
  }

  SB.scene({
    order: 6,
    id: "S06",
    name: "The Turn",
    move: "PULL WIDE",
    screens: 1.5,
    restrained: false,
    anchor: null,
    trigger: "End of S05: the drawing has shrunk into the top-right corner of the $2.89T sheet.",
    camera: "Continuous pull-out, log-linear in scale, from $2.89T at full frame to $21.8T at full frame. Every rung keeps the shared bottom-left corner.",
    reason:
      "Pulling wide past $2.89T moves the story from what states choose to spend to what violence costs everyone: a second, larger measure, with every earlier sheet still in view for scale (never as a share of it: open decision 2). Next the $21.8T sheet tips back into a map, so the story moves from one global total to real places.",
    frames: [
      { k: "in", p: 0, cap: "Entry. $2.89T fills the frame. S05's drawing is parked in its top-right corner. $954B, $119B and $40B sit nested at the shared corner, labelled inside." },
      { k: "mid", p: 0.5, cap: "The camera pulls wide. Every rung shrinks toward the corner and its label moves out onto a leader. The paper runs on past the frame: a larger sheet. The first caption gives way to the second." },
      { k: "out", p: 1, cap: "$21.8T fills the frame. $2.89T is a small sheet in the corner, every rung still labelled. Next, the sheet tips back into a map." },
    ],
    alts: [
      {
        k: "B",
        label: "Beside, not around (audit recommendation)",
        frames: ["mid", "out"],
        note: "Open decision 2 (audit 15.2b, F11). IEP's $21.8T is a different measure from SIPRI's $2.89T: purchasing-power dollars with a multiplier. Nesting reads as 'part of'. Here the camera pulls the ladder back to one side and the $21.8T sheet arrives beside it on a shared baseline, at the same scale, with a different-measure label. $2.89T never morphs into a 45% slice. 'in' is the same as the main frames.",
      },
    ],

    draw: function (c) {
      var T = c.T, TX = c.TX, S = SB.SVG;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone;
      var st = c.stage;
      c.flag("data", "$21.8T: area uses machineData[3].amtB (21810); the label prints machineData[3].amt ('$21.8T'), never '$21.81T' (audit F08).");
      c.flag("data", "10.5% is shown on its own. Never set it beside S01's 2.5%: they are shares of different GDP bases (audit F10).");
      if (c.alt === "B") return drawAltB(c, p);
      c.flag("decision", "Open decision 2: the brief nests $2.89T inside $21.8T, which reads as 'part of' (audit 15.2b). Alt B sets $21.8T beside the ladder on a shared baseline. Choose before phase 3.");

      var fit = SB.fitBetween(SB.get("DEFENCE"), SB.get(BIG), p);
      var big = c.rung(BIG, fit, st, "bl");
      var list = rungs(c, fit, st);
      var r29 = list[0].r;
      var k29 = r29.w / st.w; // the $2.89T sheet's scale against its full-frame size
      var x = texts(c);

      // ── the paper: at p=0 the $2.89T sheet is the frame; after that the $21.8T sheet runs past it
      clipOn(c, "s06clip");
      if (p > 0) c.svg(S.sheet(big.x, big.y, big.w, big.h, { tone: "red", mode: "edge", sw: 2, tab: big.y >= st.y - 0.5, tabSize: ph ? 8 : 12 }));
      drawRungs(c, list);
      parkedDrawing(c, st.x, st.y + st.h, k29);
      clipOff(c);

      if (!ph) {
        if (p === 0) {
          // labels sit inside each rung while there is room
          c.svg(S.line(120, 84, 760, 84, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(120, 96, 700, list[0].name + " · " + c.label("SIPRI 2026"), TX.label + ";font-size:13px");
          c.div(114, 124, null, list[0].value, TX.giant + ";font-size:120px");
          c.div(120, 262, 900, x.cA, TX.value + ";font-weight:400;font-size:34px;color:" + T.white);
          list.slice(1).forEach(function (it, i) {
            var r = it.r, pad = i === 0 ? 24 : 14;
            c.div(r.x + pad, r.y + pad - 4, r.w - pad * 2, it.value, TX.value + ";font-size:" + (i === 0 ? 40 : 22) + "px");
            c.div(r.x + pad, r.y + pad + (i === 0 ? 42 : 22), r.w - pad * 2, it.name, TX.label + ";font-size:11px");
          });
        } else {
          // labels move onto leader lines: one rail to the right of the nest
          var rx = Math.max(r29.x + r29.w + 64, 600);
          var ry = Math.max(r29.y + 8, 240);
          list.forEach(function (it, i) { railRow(c, it, rx, ry + i * 64, 330, { leader: true }); });
          if (p < 1) {
            c.div(120, 84, 1100, x.cA, TX.value + ";font-weight:400;font-size:34px;color:" + T.grey);
            c.div(120, 136, 1100, x.cB, TX.value + ";font-weight:400;font-size:34px;color:" + T.white);
          } else {
            c.div(120, 72, 1100, x.cB, TX.value + ";font-weight:400;font-size:34px;color:" + T.white);
            c.svg(S.line(120, 140, 760, 140, { stroke: "rgba(255,255,255,0.3)" }));
            c.div(120, 152, 700, x.bigName + " · " + x.iep, TX.label + ";font-size:13px");
            c.div(112, 180, null, x.bigVal, TX.giant + ";font-size:188px");
            c.div(120, 362, 700, x.pct, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:34px");
            c.div(120, 420, 640, x.per, TX.body);
          }
        }
      } else {
        var tb = c.textBox;
        if (p === 0) {
          c.svg(S.line(st.x + 20, st.y + 24, st.x + st.w - 20, st.y + 24, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(st.x + 20, st.y + 34, 300, list[0].name, TX.label + ";font-size:10px");
          c.div(st.x + 18, st.y + 54, null, list[0].value, TX.giant + ";font-size:52px");
          var r9 = list[1].r;
          c.div(r9.x + 14, r9.y + 12, r9.w - 20, list[1].value, TX.value + ";font-size:24px");
          c.div(r9.x + 14, r9.y + 42, r9.w - 20, list[1].name, TX.label + ";font-size:10px");
          // the two small rungs: rail rows level with their tops, right of $954B
          var qx = r9.x + r9.w + 14;
          railRow(c, list[2], qx, list[2].r.y - 26, st.x + st.w - qx - 6, { vs: 16, ls: 10 });
          railRow(c, list[3], qx, list[3].r.y + 4, st.x + st.w - qx - 6, { vs: 16, ls: 10 });
          c.div(tb.x, tb.y, tb.w, x.cA, TX.value + ";font-weight:400;font-size:22px;line-height:1.3;color:" + T.white);
          c.div(tb.x, tb.y + 70, tb.w, c.label("SIPRI 2026"), TX.src + ";font-size:10px");
        } else {
          // stacked label rail (no leaders on phone): beside the nest when there is room, else above it
          var px = r29.x + r29.w + 14, pw = st.x + st.w - px - 6;
          if (pw >= 180) list.forEach(function (it, i) { railRow(c, it, px, r29.y + 4 + i * 46, pw, { vs: 16, ls: 10 }); });
          else list.forEach(function (it, i) { railLine(c, it, st.x + 12, r29.y - 132 + i * 30, st.w - 20); });
          if (p < 1) {
            c.div(tb.x, tb.y, tb.w, x.cA, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.grey);
            c.div(tb.x, tb.y + 64, tb.w, x.cB, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white);
          } else {
            c.svg(S.line(st.x + 20, st.y + 24, st.x + st.w - 20, st.y + 24, { stroke: "rgba(255,255,255,0.3)" }));
            c.div(st.x + 20, st.y + 34, 300, x.bigName, TX.label + ";font-size:10px");
            c.div(st.x + 16, st.y + 56, null, x.bigVal, TX.giant + ";font-size:76px");
            c.div(st.x + 20, st.y + 134, 300, x.pct, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:20px");
            // the plate keeps both captions in reading order: the first one, small and grey, above the second
            var o = c.plate ? 30 : 0;
            if (c.plate) c.div(tb.x, tb.y, tb.w, x.cA, TX.bodySm + ";font-size:14px;color:" + T.grey);
            c.div(tb.x, tb.y + o, tb.w, x.cB, TX.value + ";font-weight:400;font-size:22px;line-height:1.3;color:" + T.white);
            c.div(tb.x, tb.y + 40 + o, tb.w, x.per, TX.bodySm);
            c.div(tb.x, tb.y + 94 + o, tb.w, x.iep, TX.src + ";font-size:10px");
          }
        }
      }
      c.chrome();
      // (form text can appear on screen as the frame's lock tag, so it carries no figures)
      c.state({
        form: p === 0 ? "military spending sheet, full frame" : p < 1 ? "sheet pulling wide" : "violence sheet, full frame",
        x: Math.round(big.x), y: Math.round(big.y), w: Math.round(big.w), h: Math.round(big.h),
        tone: "red edge, neutral paper",
        note: p === 0
          ? list[0].value + " is the frame; " + list[1].value + ", " + list[2].value + " (red) and " + list[3].value + " (blue) nested at the bottom-left corner; S05 drawing parked top-right"
          : "fit " + Math.round(fit) + " ($B per frame). " + list[0].value + " now " + Math.round(r29.w) + "×" + Math.round(r29.h) + " at the shared corner; every rung labelled" + (ph ? " on a stacked rail" : " by leader"),
      });
    },

    // No-motion plate: the end state plus the first caption, so both lines and every figure show.
    // (Phone: draw() puts the first caption above the second when c.plate is set.)
    plate: function (c) {
      this.draw(c);
      if (c.desk) c.div(120, 40, 1100, c.copy("That was the cost to the states that spend it.", "index.html:552"), c.TX.bodySm + ";color:" + c.T.grey);
    },
  });

  // ── ALT B: $21.8T beside the ladder on one baseline, never around it ──
  function drawAltB(c, p) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone, st = c.stage;
    c.flag("decision", "Open decision 2, alt B (audit recommendation): $21.8T as a separate sheet beside the ladder, same scale, shared baseline, with a different-measure label. The main frames show the brief's nesting.");
    var lab = c.newCopy("DIFFERENT MEASURE · IEP · PURCHASING-POWER DOLLARS · INCLUDES A MULTIPLIER", "open decision 2: IEP's $21.8T uses purchasing-power dollars and a multiplier; SIPRI's $2.89T does not (audit 15.2)");
    var x = texts(c);
    // end layout: desktop leaves a gap between the sheets for the ladder's label rail
    var L = ph ? { x: st.x, base: st.y + 444, gap: 10, bigW: 244 } : { x: 72, base: 780, gap: 260, bigW: 780 };
    var fitEnd = SB.get(BIG) * (st.w * st.h) / (L.bigW * (L.bigW * st.h / st.w));
    var fit = SB.fitBetween(SB.get("DEFENCE"), fitEnd, p);
    var t = ease(p);
    var ax = st.x + (L.x - st.x) * t, ay = st.y + st.h + (L.base - (st.y + st.h)) * t;
    var list = rungs(c, fit, { x: ax, y: ay - st.h, w: st.w, h: st.h });
    var r29 = list[0].r;
    var bx = r29.x + r29.w + L.gap * t + (ph ? 6 : 40) * (1 - t);
    var big = c.rung(BIG, fit, { x: bx, y: ay - st.h, w: st.w, h: st.h }, "bl");

    clipOn(c, "s06clipB");
    c.svg(S.line(ph ? st.x : 40, ay, ph ? st.x + st.w : c.W - 40, ay, { stroke: "rgba(255,255,255,0.3)" }));
    c.svg(S.sheet(big.x, big.y, big.w, big.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
    drawRungs(c, list);
    parkedDrawing(c, ax, ay, r29.w / st.w);
    clipOff(c);

    if (!ph) {
      if (p >= 1) {
        var ix = big.x + 40, iy = big.y + 36;
        c.div(72, 72, 1100, x.cB, TX.value + ";font-weight:400;font-size:34px;color:" + T.white);
        c.svg(S.line(ix, iy, ix + 560, iy, { stroke: "rgba(255,255,255,0.3)" }));
        c.div(ix, iy + 12, 700, x.bigName + " · " + x.iep, TX.label + ";font-size:13px");
        c.div(ix - 6, iy + 40, null, x.bigVal, TX.giant + ";font-size:150px");
        c.div(ix, iy + 192, 640, x.pct, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:30px");
        c.div(ix, iy + 244, 560, x.per, TX.body);
        c.div(big.x, ay + 14, big.w, lab, TX.label + ";font-size:11px;color:" + T.white);
        c.div(r29.x, ay + 14, r29.w, c.label("SIPRI 2026"), TX.src);
        // ladder labels on a rail in the gap, leaders from each rung corner
        var rx = r29.x + r29.w + 40, ry = r29.y - 60;
        list.forEach(function (it) {
          railRow(c, it, rx, ry, 206, { leader: true, vs: 18 });
          ry += 18 + 6 + lines(it.name, 190, 8.3) * 15 + 14;
        });
      } else {
        c.div(72, 84, 1100, x.cA, TX.value + ";font-weight:400;font-size:34px;color:" + T.grey);
        c.div(72, 136, 1100, x.cB, TX.value + ";font-weight:400;font-size:34px;color:" + T.white);
        // the arriving sheet: name and figure at its lower-left, inside it
        c.div(big.x + 32, ay - 116, 300, x.bigName, TX.label + ";font-size:11px");
        c.div(big.x + 30, ay - 92, 300, x.bigVal, TX.value + ";font-size:56px");
        // big rungs labelled inside; the two small ones on short leaders
        c.div(r29.x + 24, r29.y + 18, 300, list[0].value, TX.value + ";font-size:24px");
        c.div(r29.x + 24, r29.y + 48, 360, list[0].name, TX.label + ";font-size:11px");
        var r9 = list[1].r;
        c.div(r9.x + 16, r9.y + 14, 300, list[1].value, TX.value + ";font-size:20px");
        c.div(r9.x + 16, r9.y + 40, 300, list[1].name, TX.label + ";font-size:11px");
        var qx = r9.x + r9.w + 56;
        railRow(c, list[2], qx, list[2].r.y - 60, 220, { leader: true, vs: 18 });
        railRow(c, list[3], qx, list[3].r.y - 18, 220, { leader: true, vs: 18 });
      }
    } else {
      var tb = c.textBox;
      if (p >= 1) {
        var jx = big.x + 12;
        c.div(jx, big.y + 14, big.w - 20, x.bigName, TX.label + ";font-size:10px");
        c.div(jx - 2, big.y + 46, null, x.bigVal, TX.giant + ";font-size:50px");
        c.div(jx, big.y + 102, big.w - 20, x.pct, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:16px");
        c.div(big.x, ay + 8, big.w, lab, TX.label + ";font-size:10px;color:" + T.white + ";letter-spacing:0.06em");
        c.div(st.x, ay + 8, r29.w, c.label("SIPRI 2026"), TX.src + ";font-size:10px");
        // stacked rail above the ladder, rows as tall as their wrapped names
        var y = big.y + 4, rw = r29.w + 6;
        list.forEach(function (it) {
          railRow(c, it, st.x, y, rw, { vs: 15, ls: 10, tight: true });
          y += 15 + 6 + lines(it.name, rw - 16, 6.6) * 13.5 + 10;
        });
        c.div(tb.x, tb.y, tb.w, x.cB, TX.value + ";font-weight:400;font-size:22px;line-height:1.3;color:" + T.white);
        c.div(tb.x, tb.y + 40, tb.w, x.per, TX.bodySm);
        c.div(tb.x, tb.y + 94, tb.w, x.iep, TX.src + ";font-size:10px");
      } else {
        c.div(r29.x + 12, r29.y + 12, r29.w - 20, list[0].value, TX.value + ";font-size:22px");
        c.div(r29.x + 12, r29.y + 40, r29.w - 20, list[0].name, TX.label + ";font-size:10px");
        // the three small rungs keep their labels on a stacked rail above the ladder (no leaders on phone)
        var railW = Math.min(r29.w, big.x - st.x - 8), ry0 = r29.y - 10 - 3 * 44;
        list.slice(1).forEach(function (it, i) { railRow(c, it, st.x, ry0 + i * 44, railW, { vs: 15, ls: 10, tight: true }); });
        if (big.x < st.x + st.w - 60) c.div(big.x + 10, Math.max(big.y, st.y) + 12, st.x + st.w - big.x - 16, x.bigVal, TX.value + ";font-size:22px");
        c.div(tb.x, tb.y, tb.w, x.cA, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.grey);
        c.div(tb.x, tb.y + 64, tb.w, x.cB, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white);
      }
    }
    c.chrome();
    c.state({
      form: p >= 1 ? "IEP sheet beside the ladder" : "IEP sheet arriving beside the ladder",
      x: Math.round(big.x), y: Math.round(big.y), w: Math.round(big.w), h: Math.round(big.h),
      tone: "red edge, neutral paper; ground between the sheets",
      note: x.bigVal + " beside the ladder at the same fit (" + Math.round(fit) + "), on one baseline, never around it. The ladder's rungs stay nested inside " + list[0].value + " as in S02.",
    });
  }
})();
