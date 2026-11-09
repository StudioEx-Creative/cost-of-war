/* S11 The Appeal · FILL · restrained (storyboard/scenes/s11.js) */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, F = S.fig, C = S.copy, R = "index.html:", B = "B", ui, Ld = [],
    P = ["DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"], RF = S.get("displacedStats.received2025") / S.get("displacedStats.appeal"),
    f33 = F("displacedStats.appeal", B), f12 = F("displacedStats.received2025", B), f119 = F("machineData[1].amtB", B),
    l33 = C("UN humanitarian appeal 2026", R + 667), a33 = C("asked", R + 667), l12 = C("What 2025's appeal received", R + 679), u12 = C("lowest in a decade", R + 680), l119 = C("2025 nuclear weapons spending, for scale", R + 692),
    K = C("Humanitarian funding: what was asked, what arrived", R + 663),
    N = [C("The world's entire humanitarian system received ", R + 703), "$", F("displacedStats.received2025"), C(" billion", R + 704), C(" last year, while ", R + 704), S.prose("nine", "machineData[1].sum"), C(" countries spent ", R + 704), "$", F("machineData[1].amtB"), C(" billion", R + 705), C(" maintaining nuclear weapons.", R + 705)],
    T = [
      ["t-label s11-k", K, "k", [120, 203, 12], [16, 572, 16, 343], 2],
      ["t-body s11-n", N, "n", [120, 243, 18, 380], [16, 572, 16, 343], 2, [16, 608, 16, 343]],
      ["t-label s11-R s11-c", l33, "c", [416, 374, 12, 360]],
      ["t-label s11-R s11-x", [f33, " ", a33], "a", [416, 398, 12, 360]],
      ["t-label s11-R s11-c", l12, "C", [416, 552, 12, 360]],
      ["t-label s11-R s11-x", [f12, " ", u12], "b", [416, 576, 12, 360]],
      ["t-value s11-x s11-f", [f33], "a", 0, [16, 362, 26], 1],
      ["t-label s11-p s11-c", [l33, " · ", a33], "c", 0, [16, 394, 10, 160], 1],
      ["t-value s11-x s11-f", [f12], "b", 0, [16, 444, 26], 1],
      ["t-label s11-p s11-c", [l12, " · ", u12], "C", 0, [16, 476, 10, 160], 1],
      ["t-label s11-p", l119, "u", [932, 552, 12], [206, 392, 10, 153], 1],
      ["t-value s11-s", f119, "u", [932, 576, 36], [206, 362, 22], 1],
      ["t-label s11-v", [F("DEFENCE", "T"), " ", F("machineData[0].name")], "h"],
      ["t-label s11-v", [F("topSpenders[0].amt", B), " ", F("topSpenders[0].name")], "h"],
      ["t-label s11-v", [F("issueData[0].cost", B), " ", F("issueData[0].name")], "h"],
    ];
  [T[3], T[5], T[6], T[8]].forEach(function (r) { T.push([r[0] + " s11-g", r[1], r[2].toUpperCase(), r[3], r[4], r[5]]); });

  function geo(v) {
    var ph = v.phone, kt = v.kt, s = S.stateOf("S10", 0.5, v), y = s.L[2] + 0.5, b = ph ? [109, 68, 189.3, 276] : [800, -370, 1440, 900], k = Math.min(kt, (y - v.stage.y - 12 * kt) / 276);
    return { L: s.L, b: b, fit: S.get(ph ? "DEFENCE" : "machineData[3].amtB"), ar: ph ? 97 : 776,
      m: ph ? [S.fit(v, b, { x: 109 * kt, y: y - 276 * k, w: 189.3 * k, h: 276 * k }), S.fit(v, [0, 344, 375, 1], { x: 0, y: y, w: v.W, h: kt }), s.M] : [s.M, s.M, s.M] };
  }
  function rungs(G, m) {
    var b = { x: m.x + m.k * G.b[0], y: m.y + m.k * G.b[1], w: m.k * G.b[2], h: m.k * G.b[3] }, r = S.ladder(P, G.fit, b, [], { mode: "paper" });
    r.push(S.rung("displacedStats.appeal", G.fit, { x: m.x + m.k * G.ar - b.w, y: b.y, w: b.w, h: b.h }, "br"));
    return r;
  }
  function pt(m, x, y) { return (m.x + m.k * x).toFixed(1) + " " + (m.y + m.k * y).toFixed(1); }
  function grad(g, a, l) { l.forEach(function (s) { g.addColorStop(s[0], "rgba(255,255,255," + (a * s[1]).toFixed(4) + ")"); }); return g; }
  function pool(g, x, y, rx, ry, al) {
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    g.fillStyle = grad(g.createRadialGradient(0, 0, 0, 0, 0, rx), al, [[0, 1], [0.22, 0.78], [0.45, 0.42], [0.7, 0.14], [1, 0]]);
    g.fillRect(-rx, -rx, 2 * rx, 2 * rx);
    g.restore();
  }
  function ln(g, a, x0, x1, y) { g.globalAlpha = a; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }

  S.scene({
    id: "S11", order: 11, name: "The Appeal", move: "FILL", screens: 1.0, restrained: true, chrome: false, file: "11",
    frames: [{ k: "in", p: 0.1 }, { k: "mid", p: 0.4 }, { k: "full", p: 0.75 }, { k: "out", p: 0.9 }, { k: "fade", p: 0.96 }],
    plateP: 0.75,
    focusP: 0.75,
    alt: "Small grey sheets from earlier stand on a line at true scale. Beside them a blue sheet, what the UN asked for, fills to what it received, then the colour drains away.",

    build: function (api) {
      ui = api.el("div", "sb-box on-sheet", null, null, api.ui);
      api.rows(T, ui);
      for (var i = 0; i < 3; i++) (Ld[i] = api.leader()).r.setAttribute("fill", "#8A9099");
      [K, [l33, " · ", f33, " ", a33], [l12, " · ", f12, " · ", u12], [l119, " · ", f119], N, T[12][1].concat(" · ", T[13][1], " · ", T[14][1])].forEach(function (t) { api.el("p", null, t, null, api.plate); });
    },
    layout: function (api) {
      var v = api.vp, ph = v.phone, G = geo(v), M = G.m, m = M[0], s = rungs(G, { x: 0, y: 0, k: 1 }), q = s[2], o = s[3], a = s[4], d = ph ? [6, 6, 18, 21, 10, 14, 6, 14] : [14, 12, 38, 34, 11, 24, 16, 30];
      T[12][3 + ph] = [s[0].x + d[0], s[0].y + d[1], d[4]];
      T[13][3 + ph] = [s[1].x + d[0], s[1].y + d[1], d[4]];
      T[14][3 + ph] = [q.x + q.w + d[2], q.y - d[3], d[4]];
      api.map(ui, M[2]);
      T.forEach(function (r) { api.place(r.e, r[v.short && r[6] ? 6 : ph ? 4 : 3], M[r[5] || 0], M[2]); });
      api.lead(Ld[0], "M" + pt(m, o.x + o.w, o.y) + "L" + pt(m, q.x + q.w + d[6], q.y - d[5]) + "L" + pt(m, q.x + q.w + d[7], q.y - d[5]));
      api.lead(Ld[1], "M" + pt(m, ph ? q.x + q.w * 0.62 : (o.x + o.w + q.x + q.w) / 2, ph ? q.y + q.h * 0.62 : o.y + o.h * 0.55) + "V" + (ph ? M[1].y + 375 * v.kt : m.y + 560 * m.k) + "H" + (ph ? 200 * v.kt : m.x + 926 * m.k));
      api.lead(Ld[2], "M" + pt(m, a.x + a.w * 0.78, a.y) + "V" + (m.y + 460 * m.k));
      api.attr(Ld[2], "display", ph ? "none" : "inline");
    },

    state: function (p, v) {
      var G = geo(v), r = rungs(G, G.m[0]), a = r.pop(), f = S.clamp((p - 0.12) / 0.58, 0, 1), h = a.h * RF * f, d = sm(0.82, 0.9, p), n = sm(0, 0.1, p), E = sm(0.7, 0.75, p), w = 1 - 0.28 * d;
      return {
        sheet: null, ph: v.phone, L: G.L, z: G.m[0].k, r: r, a: a, d: d, n: n, f: f, layerOpacity: 1 - sm(0.9, 1, p),
        fill: { x: a.x, y: a.y + a.h - h, w: a.w, h: h, mode: "outline", tone: "blue", opacity: 1 - d, rung: f < 1 ? null : { path: "displacedStats.received2025", value: S.get("displacedStats.received2025"), fit: G.fit, area: a.rung.area * RF } },
        o: { k: n * w * (v.phone ? 1 - E : 1), n: E * w, h: (0.78 - 0.23 * d) * n, a: n * (1 - d * d) * w, A: n * d * (2 - d) * w, b: E * (1 - d * d) * w, B: E * d * (2 - d) * w, c: n * w, C: E * w, u: n * w },
      };
    },
    render: function (st, api) {
      T.forEach(function (r) { api.set(r.e, "opacity", st.o[r[2]]); });
      api.attr(Ld[0], "opacity", st.o.h);
      api.attr(Ld[1], "opacity", st.o.u);
      api.attr(Ld[2], "opacity", st.o.c);
    },
    draw: function (g, st, api) {
      var L = st.L, a = st.a, d = st.d, f = st.fill, li = st.n * (1 - d), a0 = (g.globalAlpha *= st.layerOpacity), x = a.x + a.w / 2, Y = L[2], dim = 1 - 0.3 * d,
        l = (st.ph ? [120, 120, 210, 150, 46, 110] : [200, 300, 380, 380, 96, 300]).map(function (n) { return n * st.z; });
      if (li > 0) {
        pool(g, x, Y - l[0], l[1], l[2], 0.06 * li);
        pool(g, x, Y + 4, l[3], l[4], 0.14 * li);
      }
      api.sheets(g, st.r.slice().reverse().map(function (s) { return Object.assign({}, s, { edge: 0.01, opacity: 0.72 * dim }); }));
      api.sheets(g, st.r.map(function (s, i) { return Object.assign({}, s, { mode: "outline", edge: i == 2 ? 1.5 : 1, opacity: (i == 2 ? 0.7 : 0.4) * dim }); }));
      api.drawSheet(g, Object.assign({}, a, { edge: 0.01, opacity: st.n }));
      [["#FFFFFF", 0.066 * li, a], ["#3C8FDE", 0.92 * (1 - d), f], ["#8A9099", 0.55 * d, f]].forEach(function (c) {
        g.fillStyle = c[0];
        g.globalAlpha = a0 * c[1];
        g.fillRect(c[2].x, c[2].y, c[2].w, c[2].h);
      });
      g.globalAlpha = a0;
      api.sheets(g, [Object.assign({}, a, { mode: "outline", tone: "blue", opacity: st.n * (1 - d) }), Object.assign({}, a, { mode: "outline", opacity: 0.6 * st.n * d }), f]);
      g.strokeStyle = "#FFFFFF";
      g.lineWidth = 1;
      ln(g, a0 * 0.32, L[0], L[1], Y);
      if (st.f > 0) ln(g, a0 * 0.8 * (1 - st.f), f.x - 6, f.x + f.w + 6, f.y);
      g.strokeStyle = grad(g.createLinearGradient(x - l[5], 0, x + l[5], 0), 0.7, [[0, 0], [0.3, 0.45], [0.5, 1], [0.7, 0.45], [1, 0]]);
      ln(g, a0 * li, L[0], L[1], Y);
    },
  });
})();
