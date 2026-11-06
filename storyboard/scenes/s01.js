/* S01 · THE LINE · PUSH · 1.0 screen
   The locked counter line becomes the year's budget line: a red ledger
   rule crossing the whole frame, seen at an angle on the desk, with the
   year's total set monumental on it and cropped by the frame edge. The
   camera pushes; the rule thickens into a band that rises toward camera as
   the tilt eases to flat, until the band is the Sheet: $2.89T at full frame. */
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
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // The overlay's tracking box: the part of a world rect that is in frame (no camera in this scene).
  function visible(D, r) {
    var b = D.box(r), m = 64;
    var x0 = clamp(b.x, m, 1e9), y0 = clamp(b.y, m + 8, 1e9);
    var x1 = Math.min(b.x + b.w, D.W - m), y1 = Math.min(b.y + b.h, D.H - m - 8);
    return { x: Math.round(x0), y: Math.round(y0), w: Math.round(Math.max(0, x1 - x0)), h: Math.round(Math.max(0, y1 - y0)) };
  }
  // A deliberate crop: the block is clipped by its own box (max-width), not by the frame.
  function crop(c, x, y, maxW, html, style) {
    c.div(x, y, null, html, style + ";max-width:" + Math.max(0, Math.round(maxW)) + "px;overflow:hidden;white-space:nowrap");
  }

  SB.scene({
    order: 1,
    id: "S01",
    name: "The Line",
    move: "PUSH",
    screens: 1.0,
    restrained: false,
    anchor: "#machine",
    trigger: "#machine top.",
    camera: "Push until one budget line fills the screen. The rule starts on the desk at an angle (rx 14°, ry −22°) and the tilt eases to flat as it becomes the Sheet.",
    reason:
      "The per-second counter becomes the year's total, so the reader sees one number grow into the object the story follows. Next, a hard cut drops to the smallest rung so scale can be rebuilt from the bottom.",
    frames: [
      { k: "in", p: 0, cap: "Hard cut lands on the locked line, now the year's budget line: a red rule crossing the whole frame at an angle, the year's total set monumental on it and cropped by the right edge." },
      { k: "mid", p: 0.5, cap: "The camera pushes. The red rule thickens into a band of paper that rises toward camera as the tilt eases to flat: the line becoming a sheet." },
      { k: "out", p: 1, cap: "The Sheet fills the frame, flat: $2.89T at 400px, bleeding off the right edge, with the US and Europe as marginal callouts. Hard cut to the smallest rung next." },
    ],
    draw: function (c) {
      var T = c.T, TX = c.TX;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone;
      var st = c.stage; // desktop: full frame; phone: 343 × 500 visual
      var defence = c.fig("DEFENCE", "T");
      var label = c.fig("machineData[0].name", "raw").toUpperCase();
      var year = c.prose("2025", "machineData[0].sum");

      // ── the move: the rule becomes a band, the band becomes the Sheet
      var lineY = ph ? st.y + 330 : 560;
      var t = clamp((p - 0.15) / 0.85, 0, 1);
      var g = Math.pow(t, 1.6);
      var bandH = 2 + (st.h - 2) * g;
      var bandY = lineY - (lineY - st.y) * g;
      // the band starts wider than the frame (a ledger rule) and narrows onto the stage
      var over = (ph ? 260 : 520) * (1 - g);
      var band = { x: st.x - over, y: bandY, w: st.w + over * 2, h: bandH };
      // tilt eases to flat with the push (none at the end: the Sheet is the frame)
      var e = 1 - Math.pow(clamp(p, 0, 1), 0.9);
      if (p < 1) c.tilt(ph ? { rx: 14 * e, ry: -26 * e, rz: -3 * e, persp: 760 } : { rx: 14 * e, ry: -22 * e, rz: -3 * e, persp: 1300 });
      var D = depth(c);
      D.W = c.W; D.H = c.H;

      if (p === 0 || bandH <= 3) {
        // ── the ledger line: crosses the whole frame, the year's total set on it,
        //    big enough that the frame edge takes a third of the T
        c.svg(S.line(band.x - 400, lineY, band.x + band.w + 400, lineY, { stroke: T.red, "stroke-width": 2 }));
        if (!ph) {
          c.div(96, lineY - 40, 560, label + " · " + year, TX.labelW + ";font-size:15px");
          c.div(96, lineY + 16, null, c.label("SIPRI 2026"), TX.src + ";font-size:13px");
          c.div(468, lineY - 214, null, defence, TX.giant + ";font-size:260px");
        } else {
          c.div(st.x + 2, lineY + 10, 320, label + " · " + year, TX.labelW + ";font-size:11px");
          c.div(st.x + 2, lineY + 46, null, c.label("SIPRI 2026"), TX.src + ";font-size:11px");
          c.div(st.x + 42, lineY - 82, null, defence, TX.giant + ";font-size:96px");
        }
        // the tracking box takes the part of the rule that is in frame
        var sl = visible(D, { x: 0, y: lineY - 1, w: c.W, h: 2 });
        c.state({ form: "line", x: sl.x, y: sl.y, w: sl.w, h: sl.h, tone: "red", note: "budget line, 2px red rule crossing the frame at an angle (rx 14°, ry −22°, rz −3°)" });
      } else if (p < 1) {
        // ── the band: paper rising toward camera, tilt easing to flat
        c.svg(S.sheet(band.x, band.y, band.w, band.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
        // the year's total stays where it sat on the line; the band rises around it
        if (!ph) {
          c.svg(S.line(96, band.y + 26, 700, band.y + 26, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(96, band.y + 38, 560, label + " · " + year, TX.label + ";font-size:14px");
          c.div(468, band.y + band.h / 2 - 104, null, defence, TX.giant + ";font-size:240px");
        } else {
          c.div(st.x + 2, band.y - 24, 300, label + " · " + year, TX.labelW + ";font-size:11px");
          c.div(st.x + 12, band.y + band.h / 2 - 43, null, defence, TX.giant + ";font-size:90px"); // T clear of the scan readout
        }
        var sb = visible(D, band);
        c.state({ form: "band", x: sb.x, y: sb.y, w: sb.w, h: sb.h, tone: "red edge, neutral paper", note: "the rule thickening into a sheet; tilt half eased (rx 7°, ry −11°)" });
      } else {
        // ── the Sheet at full frame, flat
        c.svg(S.sheet(st.x, st.y, st.w, st.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
        c.state({ form: "sheet (full frame)", x: st.x, y: st.y, w: st.w, h: st.h, tone: "red edge, neutral paper", note: "area = DEFENCE at the frame's fit" });
        var second = c.fig("globalContext.milPctGDP", "pct") + " " + c.copy("of everything it produces", "index.html:181");
        if (!ph) {
          // spec figure: rule, label, value (monumental, cropped by the frame), grey second reading
          c.svg(S.line(96, 92, 720, 92, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(96, 104, 640, label + " · " + year, TX.label + ";font-size:13px");
          crop(c, 78, 128, c.W - 78, defence, TX.giant + ";font-size:400px");
          c.div(96, 506, 700, second, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:30px");
          // marginalia: one leader drops from the total and branches to two numbered callouts
          var us = c.fig("topSpenders[0].amt", "B");
          var eu = c.prose("14%", "machineData[0].detail", "Europe's rise");
          var ax = 1046, ay = 470, sx = 1000, y1 = 604, y2 = 704;
          c.svg(S.leader([[ax, ay], [ax, 540], [sx, 580], [sx, y2]]));
          c.svg(S.line(sx, y1, sx + 22, y1, { stroke: "rgba(255,255,255,0.55)" }) + S.line(sx, y2, sx + 22, y2, { stroke: "rgba(255,255,255,0.55)" }));
          [[y1, c.label("01", "callout number"), c.label("UNITED STATES"), us], [y2, c.label("02", "callout number"), c.label("EUROPE"), "+" + eu]].forEach(function (r) {
            c.div(sx + 30, r[0] - 9, 30, r[1], TX.labelW + ";font-size:12px");
            c.div(sx + 70, r[0] - 9, 280, r[2], TX.label + ";font-size:12px");
            c.div(sx + 68, r[0] + 14, 300, r[3], TX.value + ";font-size:52px");
          });
          c.div(sx + 30, 790, 300, c.label("SIPRI 2026 ↗"), TX.src);
        } else {
          c.svg(S.line(st.x + 18, st.y + 26, st.x + st.w - 18, st.y + 26, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(st.x + 18, st.y + 36, st.w - 36, label + " · " + year, TX.label + ";font-size:10px");
          // sized so the sheet edge takes only the right arm of the T (a deeper crop reads as "1" or "7")
          crop(c, st.x + 8, st.y + 72, st.w - 8, defence, TX.giant + ";font-size:98px");
          c.div(st.x + 18, st.y + 172, st.w - 36, second, TX.value + ";font-weight:400;color:" + T.grey + ";font-size:18px");
          // marginalia: a leader drops from the total and branches to two numbered callouts
          var usP = c.fig("topSpenders[0].amt", "B");
          var euP = c.prose("14%", "machineData[0].detail", "Europe's rise");
          // the leader drops from under the T's stem, right of the grey reading, so it never crosses it
          var px0 = st.x + 320, sxp = st.x + 40, q1 = st.y + 286, q2 = st.y + 380;
          c.svg(S.leader([[px0, st.y + 156], [px0, st.y + 214], [sxp, st.y + 250], [sxp, q2]]));
          c.svg(S.line(sxp, q1, sxp + 14, q1, { stroke: "rgba(255,255,255,0.55)" }) + S.line(sxp, q2, sxp + 14, q2, { stroke: "rgba(255,255,255,0.55)" }));
          [[q1, c.label("01", "callout number"), c.label("UNITED STATES"), usP], [q2, c.label("02", "callout number"), c.label("EUROPE"), "+" + euP]].forEach(function (r) {
            c.div(sxp + 20, r[0] - 7, 24, r[1], TX.labelW + ";font-size:10px");
            c.div(sxp + 48, r[0] - 7, 220, r[2], TX.label + ";font-size:10px");
            c.div(sxp + 46, r[0] + 12, 240, r[3], TX.value + ";font-size:40px");
          });
          c.div(sxp + 20, st.y + 462, 240, c.label("SIPRI 2026 ↗"), TX.src + ";font-size:10px");
          c.svg(S.path("M" + (st.x + st.w - 30) + " " + (st.y + st.h - 18) + " H" + (st.x + st.w - 18) + " V" + (st.y + st.h - 30), { stroke: "rgba(255,255,255,0.4)" }));
        }
      }

      // ── text: Chapter 01 intro, flat on the screen over the object
      if (!ph) {
        if (p < 1) {
          c.uiDiv(96, 84, 600, c.copy("Chapter 01 · The Machine", "index.html:177").toUpperCase(), TX.labelW);
          c.uiDiv(96, 110, 560, c.copy("What we spend on war", "index.html:178").toUpperCase(), TX.title + ";font-size:56px");
        }
        if (p >= 0.5) {
          var intro =
            c.copy("2025 was the eleventh straight record year.", "index.html:180") + " " +
            c.copy("The world now spends ", "index.html:180") + c.fig("globalContext.milPctGDP", "pct") +
            c.copy(" of everything it produces on its militaries, the highest share since ", "index.html:181") +
            c.prose("2009", "machineData[0].sum") + ".";
          if (p >= 1) c.div(96, 652, 620, intro, TX.body + ";font-size:19px");
          else c.uiDiv(96, 712, 620, intro, TX.body + ";font-size:19px");
          c.flag("copy", "“eleventh straight record year”: data.js:47 says “11th consecutive year of growth”. Copy fix needs approval.");
        }
      } else {
        var tb = c.textBox;
        if (p < 0.5) {
          c.uiDiv(tb.x, tb.y, tb.w, c.copy("Chapter 01 · The Machine", "index.html:177").toUpperCase(), TX.labelW + ";font-size:11px");
          c.uiDiv(tb.x, tb.y + 24, tb.w, c.copy("What we spend on war", "index.html:178").toUpperCase(), TX.title + ";font-size:32px");
        } else if (p < 1) {
          c.uiDiv(tb.x, tb.y, tb.w,
            c.copy("2025 was the eleventh straight record year.", "index.html:180") + " " +
            c.copy("The world now spends ", "index.html:180") + c.fig("globalContext.milPctGDP", "pct") +
            c.copy(" of everything it produces on its militaries.", "index.html:181"),
            TX.bodySm);
          c.flag("copy", "“eleventh straight record year”: data.js:47 says “11th consecutive year of growth”. Copy fix needs approval.");
        } else {
          // the US and Europe are callouts on the Sheet; the text below carries the intro
          c.uiDiv(tb.x, tb.y, tb.w,
            c.copy("2025 was the eleventh straight record year.", "index.html:180") + " " +
            c.copy("The world now spends ", "index.html:180") + c.fig("globalContext.milPctGDP", "pct") +
            c.copy(" of everything it produces on its militaries, the highest share since ", "index.html:181") +
            c.prose("2009", "machineData[0].sum") + ".",
            TX.bodySm);
          c.flag("copy", "“eleventh straight record year”: data.js:47 says “11th consecutive year of growth”. Copy fix needs approval.");
        }
      }
      c.chrome();
    },
    // No-motion plate: the end state with every figure of the scene shown.
    plate: function (c) {
      this.draw(c);
    },
  });
})();
