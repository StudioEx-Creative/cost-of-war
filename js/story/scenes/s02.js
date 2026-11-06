/* S02 The Ladder · PULL (storyboard/scenes/s02.js). Hard cut to the smallest rung; the camera
   pulls out and leans back over four sheets at true area. Storyboard px (Story.sb). */
(function () {
  "use strict";
  var S = Story, L = S.lerp, F = S.fig, C = S.copy, B = S.label, P = S.prose, D = "shortened from js/data.js machineData[1].sum; not on the live page", ui, sv, rl, chip, Q = [];
  // path, format, name, line, source, its link
  var R = [
    ["issueData[0].cost", "B", [F("issueData[0].sdg"), " · ", F("issueData[0].name")], [F("issueData[0].sum")], F("issueData[0].src"), "issueData[0].url"],
    ["machineData[1].amtB", "B", [F("machineData[1].name")], [S.newCopy("The nine nuclear states spent a record ", D), F("machineData[1].amtB", "B"), S.newCopy(" in ", D), [P("2025", "machineData[1].sum"), { kind: "prose", ref: "machineData[1].sum" }], "."], B("ICAN 2026"), "machineData[1].url"],
    ["topSpenders[0].amt", "B", [F("topSpenders[0].name")], [C("The US alone spent ", "index.html:197"), F("topSpenders[0].amt", "B"), "."], B("SIPRI 2026"), "machineData[0].url"],
    ["DEFENCE", "T", [F("machineData[0].name"), " · ", P("2025", "machineData[0].sum")], [F("globalContext.milPctGDP", "pct"), " ", C("of everything it produces", "index.html:180-181")], B("SIPRI 2026"), "machineData[0].url"],
  ];
  // desktop: figure [x y px], line [x y px w], source y · phone: name [x y], figure px, line y px, source y
  var GD = [[132, 180, 340, 142, 480, 21, 620, 552], [572, 88, 250, 1000, 316, 20, 400, 380], [560, 88, 250, 1000, 316, 20, 400, 352], [452, 80, 266, 1000, 352, 20, 400, 388]],
    GP = [[36, 160, 104, 572, 15, 642], [16, 66, 106, 608, 16, 658], [16, 66, 100, 630, 16, 658], [16, 66, 94, 652, 14, 680]],
    SL = [[1088, 654], [1044, 562], [1000, 470]];

  S.scene({
    id: "S02", order: 2, name: "The Ladder", move: "PULL", screens: 2.0,
    file: "02",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.45 }, { k: "late", p: 0.8 }, { k: "out", p: 1 }],
    alt: "Four sheets at true scale, stacked in one corner of a table that tilts back: Zero Hunger, nuclear arsenals, the United States and world military spending, each far larger than the last.",

    build: function (api) {
      var pl = api.plate;
      function el(c, t, p) { return api.el("div", c, t, null, p || ui); }
      ui = api.el("div", "s02 on-sheet", null, null, api.ui);
      sv = api.svgEl("g", { stroke: "rgba(255,255,255,.55)", fill: "none" }, api.svg);
      R.forEach(function (r, i) {
        var q = (Q[i] = {}), v = F(r[0], r[1]), n = B("0" + (i + 1)), nm = [n, " · "].concat(r[2]);
        q.s = el("s02-s"); // the newest rung's spec figure
        q.e = [el("s02-r", null, q.s), el("t-label", nm, q.s), el("t-giant", v, q.s), el(i > 2 ? "t-body s02-g" : "t-body", r[3], q.s), el("t-src", r[4], q.s)];
        if (i < 3) {
          q.k = el("s02-s"); // earlier rung: callout (phone: rail row)
          q.f = [el("s02-r", null, q.k), el("t-labelW", n, q.k), el("t-label", r[2], q.k), el("t-value", v, q.k)];
          q.t = el("t-labelW s02-t", n);
          q.l = api.svgEl("path", {}, sv);
          q.r = api.svgEl("rect", { width: 5, height: 5, fill: "#FFFFFF", stroke: "none" }, sv);
        }
        if (i) q.h = el("t-labelW s02-h", [n, " · ", v, " ↗"]);
        api.el("p", "t-label", nm, null, pl);
        api.el("p", "s02-pv", v, null, pl);
        api.el("p", null, r[3], null, pl);
        api.link(S.get(r[5]), r[4], null, api.el("p", "t-src", null, null, pl), "tap").setAttribute("data-p", [0.1, 0.45, 0.8, 1][i]); // its rung newest
      });
      rl = el("s02-r");
      chip = el("t-labelW s02-c", S.newCopy("DETAIL · ENLARGED", "decision 4: no ratio printed until decided; the storyboard's ratio label is the alternative"));
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, m = S.sb(v), put = api.place;
      api.set(ui, "transform", m.t);
      api.attr(sv, "transform", "translate(" + m.x + " " + m.y + ") scale(" + m.k + ")");
      Q.forEach(function (q, i) {
        var d = GD[i], a = GP[i], e = q.e, f = q.f;
        put(e[0], ph ? (i ? 0 : [a[0], a[1] - 10, 0, 293]) : [d[0] + 8, d[1] - 26, 0, 560]);
        put(e[1], ph ? [a[0], a[1], 10] : [d[0] + 8, d[1] - 16, 13]);
        put(e[2], ph ? [a[0] - 3, a[1] + 18, a[2]] : d.slice(0, 3));
        put(e[3], ph ? [16, a[3], a[4], 343] : d.slice(3, 7));
        put(e[4], ph ? [16, a[5], 10] : [d[3], d[7], 11]);
        if (f) {
          put(q.k, ph ? [16, 572] : SL[i]);
          put(f[0], ph ? 0 : [0, 0, 0, 330]);
          put(f[1], ph ? [0, 3, 10] : [0, 8, 12]);
          put(f[2], ph ? [96, 3, 10] : [36, 8, 12]);
          put(f[3], ph ? [30, 0, 16] : [34, 28, 40]);
          put(q.t, ph && [0, 0, 10]);
        }
        if (i) put(q.h, ph ? [199, 538, 10, 156] : [980, 62, 12, 420]);
      });
      put(rl, ph && [16, 576, 0, 343]);
      put(chip, ph ? [232, 287, 10] : [96, 87, 10]);
    },

    state: function (p, v) {
      var ph = v.phone, m = S.sb(v), k = m.k, e = Math.pow(p, 0.8), cam = S.cam,
        // the storyboard's pull to p .8, then the world total by .92, then holds
        fit = S.fitBetween(S.get(R[0][0]), S.get(R[3][0]), p < 0.8 ? p : 0.8 + 0.2 * Math.min(1, (p - 0.8) / 0.12)),
        cs = ph ? L(0.86, 0.72, e) : L(0.76, 0.52, e), sx = ph ? L(38, 34, e) : L(96, 124, e), sy = ph ? L(540, 512, e) : L(806, 774, e),
        box = { x: m.x + k * sx, y: m.y + k * (sy - cs * (ph ? 500 : 900)), w: k * cs * (ph ? 343 : 1440), h: k * cs * (ph ? 500 : 900) },
        // the tilt is the camera, not the data
        t = { rx: L(ph ? 6 : 5, ph ? 32 : 30, e), ry: L(-1, -4, e), rz: L(-1, ph ? -6 : -5, e), persp: (ph ? 900 : 1500) * k, ox: m.x + k * (ph ? 187.5 : 720), oy: m.y + k * (ph ? 406 : 450) },
        a = 0,
        rs = R.map(function (r, i) {
          var q = S.rung(r[0], fit, box, "bl");
          if (q.rung.value <= fit * 1.0001) a = i;
          q.tone = i ? "red" : "blue";
          q.edge = 1.5 * cs * k; // on the paper: thins as the camera pulls
          q.tilt = t;
          return q;
        }),
        A = rs[a], b = cam.bbox(A, t), n = p < 0.5 ? 18 : 6, d = ph ? [268, 304, 86, 90, 0.1, 0.9] : [96, 104, 240, 150, 0.06, 0.92],
        o = cam.project(rs[3].x, rs[3].y + rs[3].h, 0, t); // the shared corner
      A.edge = 2 * cs * k;
      A.tab = 1;
      A.tabSize = (ph ? 8 : 12) * cs * k;
      return {
        sheet: null, // all four are drawn in draw() (phone: clipped to the visual window)
        pool: A, rs: rs, a: a, p: p > 0,
        c: rs.slice(0, 3).map(function (q) { var c = cam.project(q.x + q.w, q.y, 0, t); return [(c.x - m.x) / k, (c.y - m.y) / k]; }), // leader ends, storyboard px
        br: b.w >= 0.9 * v.W && b.h >= (ph ? 450 * k : 0.9 * v.H) ? null
          : [{ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }, p < 0.5 ? "ACQUIRING · LADDER" : a > 2 ? "LOCKED · SHEET LYING BACK" : "LOCKED · LADDER", p >= 0.5],
        // the stack's corner magnified: the smallest rung stays readable
        det: a > 2 && { x: m.x + k * d[0], y: m.y + k * d[1], w: k * d[2], h: k * d[3], z: ph ? 2.5 : 2, cx: m.x + k * (d[0] + d[2] * d[4]), cy: m.y + k * (d[1] + d[3] * d[5]), ax: o.x, ay: o.y, f: [d[4], d[5]] },
        clip: ph ? [m.x + 16 * k, m.y + 56 * k, 343 * k, 500 * k] : null,
      };
    },

    render: function (st, api) {
      var ph = api.vp.phone, a = st.a, set = api.set;
      Q.forEach(function (q, i) {
        var c = st.c[i], j = a - 1 - i, on = +(i < a), x, y;
        set(q.s, "opacity", +(a === i));
        if (q.h) set(q.h, "opacity", +(st.p && a === i - 1));
        if (!q.k) return;
        x = ph ? Math.min(319, c[0] + 26 + 6 * j) : SL[i][0];
        y = ph ? c[1] - 26 - 4 * j : SL[i][1];
        set(q.k, "opacity", on);
        set(q.k, "transform", "translateY(" + (ph ? 22 * j : 0) + "px)");
        set(q.t, "opacity", on);
        set(q.t, "transform", "translate(" + x + "px," + y + "px)");
        api.attr(q.l, "opacity", on);
        api.attr(q.r, "opacity", on);
        api.attr(q.l, "d", "M" + c + (ph ? "L" + (x - 4) + " " + (y + 8) : "L" + (x - 44) + " " + y + "H" + (x - 8)));
        api.attr(q.r, "x", c[0] - 2.5);
        api.attr(q.r, "y", c[1] - 2.5);
      });
      set(rl, "opacity", +(a > 0));
      set(rl, "transform", "translateY(" + 22 * a + "px)");
      set(chip, "opacity", +!!st.det);
      if (st.br) api.brackets(st.br[0], { lock: st.br[2], label: st.br[1], len: ph ? 10 : 14, tagAt: "tl" });
    },

    draw: function (g, st, api) {
      var d = st.det, c = st.clip, a = g.globalAlpha, i, w, h, x, y; // a: GAP's hold fades it
      g.save();
      if (c) { g.beginPath(); g.rect(c[0], c[1], c[2], c[3]); g.clip(); }
      for (i = 3; i >= 0; i--) api.drawSheet(g, st.rs[i]);
      g.restore();
      if (!d) return;
      g.save();
      g.fillStyle = "#0A0A0A";
      g.fillRect(d.x, d.y, d.w, d.h);
      g.beginPath();
      g.rect(d.x, d.y, d.w, d.h);
      g.clip();
      g.translate(d.cx, d.cy);
      g.scale(d.z, d.z);
      g.translate(-d.ax, -d.ay);
      for (i = 3; i >= 0; i--) api.drawSheet(g, Object.assign({}, st.rs[i], { edge: 1.5 / d.z, tab: 0, shadow: false }));
      g.restore();
      w = d.w / d.z; h = d.h / d.z; x = d.ax - w * d.f[0]; y = d.ay - h * d.f[1];
      g.strokeStyle = "#FFFFFF";
      g.lineWidth = 1;
      g.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1);
      g.globalAlpha = a * 0.7;
      g.setLineDash([3, 3]);
      g.strokeRect(x, y, w, h);
      g.setLineDash([]);
      g.globalAlpha = a * 0.4;
      g.beginPath();
      g.moveTo(x + w, y);
      g.lineTo(d.x, d.y + d.h);
      g.stroke();
    },
  });
})();
