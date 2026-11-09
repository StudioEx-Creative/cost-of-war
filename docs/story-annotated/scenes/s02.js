/* S02 The Ladder · PULL (storyboard/scenes/s02.js). Hard cut to the smallest rung; the camera
   pulls out and leans back over four sheets at true area. Storyboard px (Story.sb). */
(function () {
  "use strict";
  var S = Story, L = S.lerp, F = S.fig, C = S.copy, B = S.label, P = S.prose, D = "shortened from js/data.js machineData[1].sum; not on the live page", ui, sv, rl, chip, Q = [];
  var R = [
    ["issueData[0].cost", "B", [F("issueData[0].sdg"), " · ", F("issueData[0].name")], [F("issueData[0].sum")], F("issueData[0].src"), "issueData[0].url"],
    ["machineData[1].amtB", "B", [F("machineData[1].name")], [S.newCopy("The nine nuclear states spent a record ", D), F("machineData[1].amtB", "B"), S.newCopy(" in ", D), [P("2025", "machineData[1].sum"), { kind: "prose", ref: "machineData[1].sum" }], "."], B("ICAN 2026"), "machineData[1].url"],
    ["topSpenders[0].amt", "B", [F("topSpenders[0].name")], [C("The US alone spent ", "index.html:197"), F("topSpenders[0].amt", "B"), "."], B("SIPRI 2026"), "machineData[0].url"],
    ["DEFENCE", "T", [F("machineData[0].name"), " · ", P("2025", "machineData[0].sum")], [F("globalContext.milPctGDP", "pct"), " ", C("of everything it produces", "index.html:180-181")], B("SIPRI 2026"), "machineData[0].url"],
  ];
  var GD = [[132, 180, 340, 142, 480, 21, 620, 552], [572, 88, 250, 1000, 316, 20, 400, 380], [560, 88, 250, 1000, 316, 20, 400, 352], [452, 80, 266, 1000, 352, 20, 400, 388]],
    GP = [[36, 160, 104, 572, 15, 642], [16, 66, 106, 608, 16, 658], [16, 66, 100, 630, 16, 658], [16, 66, 94, 652, 14, 680]],
    SL = [[1088, 654], [1044, 562], [1000, 470]];
  function maps(v) {
    var T = S.sb(v, 0), b = v.stage, y = b.y + 124 * v.kt;
    return [v.short ? S.fit(v, [16, 110, 343, 446], { x: 0, y: y, w: v.W, h: b.y + b.h - y }) : T, T, S.sb(v, "t")];
  }

  S.scene({
    id: "S02", order: 2, name: "The Ladder", move: "PULL", screens: 2.0,
    file: "02",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.45 }, { k: "late", p: 0.8 }, { k: "out", p: 1 }],
    alt: "Four sheets at true scale, stacked in one corner of a table that tilts back: Zero Hunger, nuclear arsenals, the United States and world military spending, each far larger than the last.",

    build: function (api) {
      var pl = api.plate;
      function el(c, t, p) { return api.el("div", c, t, null, p || ui); }
      ui = api.el("div", "s02 on-sheet", null, null, api.ui);
      sv = api.svgEl("g", {}, api.svg);
      R.forEach(function (r, i) {
        var q = (Q[i] = {}), v = F(r[0], r[1]), n = B("0" + (i + 1)), nm = [n, " · "].concat(r[2]);
        q.s = el("s02-s");
        q.e = api.rows([["s02-r"], ["t-label", nm], ["t-giant", v], [i > 2 ? "t-body s02-g" : "t-body", r[3]], ["t-src", r[4]]], q.s);
        if (i < 3) {
          q.k = el("s02-s");
          q.f = api.rows([["s02-r"], ["t-labelW", n], ["t-label", r[2]], ["t-value", v]], q.k);
          q.t = el("t-labelW s02-t", n);
          q.l = api.leader(sv);
        }
        if (i) q.h = el("t-labelW s02-h", [n, " · ", v, " ↗"]);
        api.el("p", "t-label", nm, null, pl);
        api.el("p", "s02-pv", v, null, pl);
        api.el("p", null, r[3], null, pl);
        api.link(S.get(r[5]), r[4], null, api.el("p", "t-src", null, null, pl), "tap").setAttribute("data-p", [0.1, 0.45, 0.8, 1][i]);
      });
      rl = el("s02-r");
      chip = el("t-labelW s02-c", S.newCopy("DETAIL · ENLARGED", "decision 4: no ratio printed until decided; the storyboard's ratio label is the alternative"));
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, s = v.short, M = maps(v), m = M[0], zc = { k: v.kt, x: m.x, y: m.y, r: 1 };
      function put(e, a, z) { api.place(e, a, ph ? (z ? M[z] || zc : m) : null, m); }
      api.map(ui, m);
      api.attr(sv, "transform", "translate(" + m.x + " " + m.y + ") scale(" + m.k + ")");
      Q.forEach(function (q, i) {
        var d = GD[i], a = GP[i], e = q.e, f = q.f;
        put(e[0], ph ? (i || s ? 0 : [a[0], a[1] - 10, 0, 293]) : [d[0] + 8, d[1] - 26, 0, 560]);
        put(e[1], ph ? [s ? 16 : a[0], s ? 66 : a[1], 10] : [d[0] + 8, d[1] - 16, 13], 1);
        put(e[2], ph ? [s ? 13 : a[0] - 3, s ? 84 : a[1] + 18, a[2]] : d.slice(0, 3), 1);
        put(e[3], ph ? [16, a[3], a[4], 343] : d.slice(3, 7), 2);
        put(e[4], ph ? [16, a[5], 10] : [d[3], d[7], 11], 2);
        if (f) {
          put(q.k, ph ? [16, 572] : SL[i], 2);
          put(f[0], ph ? 0 : [0, 0, 0, 330], 3);
          put(f[1], ph ? [0, 3, 10] : [0, 8, 12], 3);
          put(f[2], ph ? [96, 3, 10] : [36, 8, 12], 3);
          put(f[3], ph ? [30, 0, 16] : [34, 28, 40], 3);
          put(q.t, ph && [0, 0, 10]);
        }
        if (i) put(q.h, ph ? [199, 538, 10, 156] : [980, 62, 12, 420]);
      });
      put(rl, ph && [16, 576, 0, 343], 2);
      put(chip, ph ? (s ? [268, 398, 10] : [232, 287, 10]) : [96, 87, 10]);
    },

    state: function (p, v) {
      var ph = v.phone, m = maps(v)[0], k = m.k, e = Math.pow(p, 0.8), cam = S.cam,
        fit = S.fitBetween(S.get(R[0][0]), S.get(R[3][0]), p < 0.8 ? p : 0.8 + 0.2 * Math.min(1, (p - 0.8) / 0.12)),
        cs = ph ? L(0.86, 0.72, e) : L(0.76, 0.52, e), sx = ph ? L(38, 34, e) : L(96, 124, e), sy = ph ? L(540, 512, e) : L(806, 774, e),
        box = { x: m.x + k * sx, y: m.y + k * (sy - cs * (ph ? 500 : 900)), w: k * cs * (ph ? 343 : 1440), h: k * cs * (ph ? 500 : 900) },
        t = { rx: L(ph ? 6 : 5, ph ? 32 : 30, e), ry: L(-1, -4, e), rz: L(-1, ph ? -6 : -5, e), persp: (ph ? 900 : 1500) * k, ox: m.x + k * (ph ? 187.5 : 720), oy: m.y + k * (ph ? 406 : 450) },
        rs = S.ladder(R.map(function (r) { return r[0]; }), fit, box, ["blue", "red", "red", "red"], { edge: 1.5 * cs * k, tilt: t }),
        a = rs.a, A = rs[a], b = cam.bbox(A, t), n = p < 0.5 ? 18 : 6, d = ph ? [268, 304, 86, 90, 0.1, 0.9] : [96, 104, 240, 150, 0.06, 0.92],
        o = cam.project(rs[3].x, rs[3].y + rs[3].h, 0, t);
      A.edge = 2 * cs * k;
      A.tab = 1;
      A.tabSize = (ph ? 8 : 12) * cs * k;
      return {
        sheet: null,
        pool: A, rs: rs, a: a, p: p > 0, r: m.r, cl: v.short ? v.stage : null,
        c: rs.slice(0, 3).map(function (q) { var c = cam.project(q.x + q.w, q.y, 0, t); return [(c.x - m.x) / k, (c.y - m.y) / k]; }),
        br: b.w >= 0.9 * v.W && b.h >= (ph ? 450 * k : 0.9 * v.H) ? null
          : [{ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }, p < 0.5 ? "ACQUIRING · LADDER" : a > 2 ? "LOCKED · SHEET LYING BACK" : "LOCKED · LADDER", p >= 0.5],
        det: a > 2 && { x: m.x + k * d[0], y: m.y + k * d[1], w: k * d[2], h: k * d[3], z: ph ? 2.5 : 2, cx: m.x + k * (d[0] + d[2] * d[4]), cy: m.y + k * (d[1] + d[3] * d[5]), ax: o.x, ay: o.y, f: [d[4], d[5]] },
        clip: ph ? [v.stage.x, v.stage.y, v.stage.w, v.stage.h] : null,
      };
    },

    render: function (st, api) {
      var ph = api.vp.phone, a = st.a, r = st.r, set = api.set;
      Q.forEach(function (q, i) {
        var c = st.c[i], j = a - 1 - i, on = +(i < a), x, y;
        set(q.s, "opacity", +(a === i));
        if (q.h) set(q.h, "opacity", +(st.p && a === i - 1));
        if (!q.k) return;
        x = ph ? Math.min(339 - 20 * r, c[0] + 26 * r + 6 * j * r) : SL[i][0];
        y = ph ? c[1] - 26 * r - 4 * j * r : SL[i][1];
        set(q.k, "opacity", on);
        set(q.k, "transform", "translateY(" + (ph ? 22 * j * r : 0) + "px)");
        set(q.t, "opacity", on);
        set(q.t, "transform", "translate(" + x + "px," + y + "px)");
        api.attr(q.l, "opacity", on);
        api.lead(q.l, "M" + c + (ph ? "L" + (x - 4 * r) + " " + (y + 8 * r) : "L" + (x - 44) + " " + y + "H" + (x - 8)));
      });
      set(rl, "opacity", +(a > 0));
      set(rl, "transform", "translateY(" + 22 * a * r + "px)");
      set(chip, "opacity", +!!st.det);
      if (st.br) api.brackets(st.br[0], { lock: st.br[2], label: !st.cl && st.br[1], len: ph ? 10 : 14, tagAt: "tl", clip: st.cl });
    },

    draw: function (g, st, api) {
      var rs = st.rs.slice().reverse();
      api.sheets(g, rs, st.clip);
      if (st.det) api.inset(g, st.det, rs);
    },
  });
})();
