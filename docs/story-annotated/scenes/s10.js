/* S10 Displacement · SEPARATE · restrained (storyboard/scenes/s10.js) */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, F = S.fig, C = S.copy, R = "index.html:", M = "M", W = "#FFFFFF", ui, lk, Q = [], a,
    nF = Math.ceil(S.get("displacementBreakdown[0].millions") / 0.2), nI = Math.ceil(S.get("displacedStats.internal") / 0.2), N = nI + nF,
    Y = [S.prose("2025", "humanData[3].body"), { kind: "prose", ref: "humanData[3].body" }],
    T = [
      ["t-label", [C("The people scattered", R + 626), " · ", C("Displacement", R + 627)], "k", [120, 92, 12], [20, 64, 10], 0],
      ["s10-r", 0, "t", [120, 718, 0, 32], [16, 572, 0, 24], 2],
      ["t-value", F("displacedStats.displaced", M), "t", [120, 730, 36], [16, 584, 34], 2],
      ["t-body", [C("people forcibly displaced by persecution, conflict and violence at the end of ", R + "633-634"), Y], "l", [292, 732, 18, 540], [16, 628, 16, 343], 2],
      ["t-label s10-b", [C("forcibly displaced", R + 633), C("at the end of ", R + "633-634"), Y], "e", 0, [166, 586, 10], 2],
      ["t-body s10-w", C("Most people driven from home never even leave their own country.", R + 731), "m", [120, 122, 19], [16, 572, 16, 343], 2],
      ["t-label s10-b", [C("TRAPPED INSIDE", R + 720), C("THEIR OWN COUNTRY", R + 720)], "s", [1060, 452, 11], [122, 64, 10], 0],
      ["t-value", F("displacedStats.internal", M), "s", [1060, 484, 30], [20, 64, 24], 0],
      ["t-value", F("displacementBreakdown[0].millions", M), "s", [1060, 548, 30], [20, 514, 24], 1],
      ["t-label s10-b", [C("FLED ACROSS", R + 723), C("A BORDER", R + 723)], "s", [1060, 584, 11], [122, 514, 10], 1],
      ["s10-r", 0, "r", [900, 718, 0, 32]],
      ["t-label s10-c", [F("humanImpactExtra.childrenDisplaced", M), " ", C("are children · ", R + 642), F("humanImpactExtra.childrenPct", "pct"), C(" of everyone displaced", R + 642)], "r", [900, 730, 11], [16, 636, 10], 2],
      ["t-label s10-c", [F("displacedStats.returns", M), " ", C("people went home", R + 635)], "r", [900, 758, 11], [16, 662, 10], 2],
      ["t-label s10-c", [F("displacedStats.ratio", "oneIn"), " ", C("human beings", R + 634)], "r", [900, 786, 11], [16, 688, 10], 2],
      ["t-src", [C("1 mark ≈ ", R + 732), S.missing("200,000", "people per mark (index.html:732)"), C(" people.", R + 732), "  "], "y", [292, 794, 11], [16, 738, 10], 2],
    ];

  function line(v) { var m = v.phone ? 16 * v.kt : v.W / 12, b = v.stage; return [m, v.W - m, Math.round(v.phone ? b.y + (b.h * 288) / 500 : v.H * (530 / 900)) + 0.5]; }
  function maps(v, L) {
    return v.phone ? [S.sb(v, 0), S.sb(v, 1), S.sb(v, "t")] : [(L = S.fit(v, [0, 0, 1440, 900], { x: 0, y: L[2] - 0.5 - 530 * v.k, w: v.W, h: 900 * v.k })), L, L];
  }
  function r() { a = (a * 16807) % 2147483647; return a / 2147483647; }
  function marks(ph) {
    a = 7;
    for (var c = Math.round(Math.sqrt(N * (ph ? 1.53 : 4.4))), P = [], i = 0; i < N; i++) P.push([(i % c + 0.5 + (r() - 0.5) * 0.85) / c, (((i / c) | 0) + 0.5 + (r() - 0.5) * 0.85) / Math.ceil(N / c), r() * 1.2 - 0.6, r()]);
    P.slice().sort(function (p, q) { return p[3] - q[3]; }).slice(0, nF).forEach(function (m, i) { m.push(r(), (0.5 * i) / nF); });
    return P;
  }
  function grad(g, a, l) { l.forEach(function (s) { g.addColorStop(s[0], "rgba(255,255,255," + (a * s[1]).toFixed(4) + ")"); }); return g; }
  function ln(g, al, L) { g.globalAlpha = al; g.beginPath(); g.moveTo(L[0], L[2]); g.lineTo(L[1], L[2]); g.stroke(); }

  S.scene({
    id: "S10", order: 10, name: "Displacement", move: "SEPARATE", screens: 1.5, restrained: true, chrome: false, file: "10",
    anchors: ["borderViz"],
    frames: [{ k: "in", p: 0.1 }, { k: "mid", p: 0.45 }, { k: "out", p: 0.8 }, { k: "exit", p: 0.96 }],
    plateP: 0.8,
    focusP: 0.8,
    alt: "Hundreds of still marks above a thin line, each a group of people forced from home. Those who fled their country cross it; the rest stay.",

    build: function (api) {
      var u = S.get("humanData[3].url"), s = C("UNHCR Global Trends 2026", R + 655);
      ui = api.el("div", "sb-box on-sheet s10", null, null, api.ui);
      api.rows(T, ui);
      lk = api.link(u, s, null, T[14].e, "s10-a");
      T.forEach(function (r) { if (r[1] && r[2] != "e") api.el("p", r[0], r[1], null, api.plate); });
      api.link(u, s, null, api.el("p", "t-src", null, null, api.plate), "tap");
    },
    layout: function (api) {
      var v = api.vp, m = maps(v, line(v));
      api.map(ui, m[2]);
      T.forEach(function (r) { api.place(r.e, r[v.phone ? 4 : 3], m[r[5]], m[2]); });
    },

    state: function (p, v) {
      var ph = v.phone, k = v.k, kt = v.kt, L = line(v), m = maps(v, L), t = m[0], z = ph ? kt : t.k, q = (p - 0.1) / 0.7, fd = sm(0.86, 1, p), lad = sm(0.9, 1, p),
        mo = sm(0, 0.1, p) * (1 - fd), sol = S.clamp(q * 2.5, 0, 1), A = 1 - sm(0.24, 0.29, p), E = sm(0.75, 0.8, p),
        o = { k: 1 - ph * sm(0.22, 0.29, p), m: ph ? sm(0.29, 0.34, p) - sm(0.7, 0.75, p) : sm(0.1, 0.45, p), t: ph ? Math.max(A, E) : 1, l: ph ? A : 1, e: E, r: ph ? E : sm(0.72, 0.8, p), s: sm(0.275, 0.66, p), y: 1 };
      for (var i in o) o[i] *= sm(0, 0.1, p) * (1 - sm(0.86, 0.92, p));
      return {
        sheet: null, ph: ph, z: z, x: t.x, q: q, L: L, M: m[2], o: o, mo: mo, sol: sol,
        H: ph ? [20 * kt, t.y + 110 * kt, 335 * kt, L[2] - 15 * k - t.y - 110 * kt] : [t.x + 120 * z, t.y + 310 * z, 880 * z, 200 * z],
        A: ph ? [20 * kt, L[2] + 14 * k, 335 * kt, m[1].y + 504 * kt - L[2] - 14 * k] : [t.x + 120 * z, t.y + 550 * z, 880 * z, 143 * z],
        dash: 0.42 * (1 - sol) * mo,
        ln: (0.5 * sol * (1 - fd) + 0.32 * fd) * (1 - lad),
        hold: lad > 0 ? { id: "S11", st: S.stateOf("S11", 0, v), opacity: lad } : null,
      };
    },
    render: function (st, api) {
      T.forEach(function (r) { api.set(r.e, "opacity", st.o[r[2]]); });
      api.set(lk, "pointerEvents", st.o.y > 0.5 ? "auto" : "none");
    },
    draw: function (g, st) {
      var P = Q[+st.ph] || (Q[+st.ph] = marks(st.ph)), L = st.L, H = st.H, B = st.A, a0 = g.globalAlpha, mo = st.mo, i, m, x, y,
        l = (st.ph ? [160, 44, 250, 230, 230, 90, 170, 2.2, 3] : [470, 60, 560, 300, 620, 170, 520, 3.4, 4.6]).map(function (n) { return n * st.z; }),
        u = st.x + l[0], w = L[2] - l[1];
      g.save();
      g.translate(u, L[2] + 6);
      g.scale(1, l[5] / l[4]);
      g.fillStyle = grad(g.createRadialGradient(0, 0, 0, 0, 0, l[4]), 0.09 * mo, [[0, 1], [0.22, 0.78], [0.45, 0.42], [0.7, 0.14], [1, 0]]);
      g.fillRect(-l[4], -l[4], 2 * l[4], 2 * l[4]);
      g.restore();
      g.strokeStyle = W;
      g.setLineDash([3, 5]);
      ln(g, a0 * st.dash, L);
      g.setLineDash([]);
      ln(g, a0 * st.ln, L);
      g.strokeStyle = grad(g.createLinearGradient(u - l[6], 0, u + l[6], 0), 0.55, [[0, 0], [0.3, 0.45], [0.5, 1], [0.7, 0.45], [1, 0]]);
      ln(g, a0 * mo * st.sol, L);
      g.fillStyle = W;
      for (i = 0; mo > 0 && i < N; i++) {
        m = P[i];
        x = H[0] + m[0] * H[2];
        y = H[1] + m[1] * H[3];
        if (m[4] != null) y += (B[1] + m[4] * B[3] - y) * sm(m[5], m[5] + 0.5, st.q);
        g.globalAlpha = a0 * mo * (0.3 + 0.66 * Math.exp(-Math.pow((x - u) / l[2], 2) - Math.pow((y - w) / l[3], 2)));
        g.save();
        g.translate(x, y);
        g.rotate(m[2]);
        g.fillRect(-l[7] / 2, -l[8] / 2, l[7], l[8]);
        g.restore();
      }
    },
  });
})();
