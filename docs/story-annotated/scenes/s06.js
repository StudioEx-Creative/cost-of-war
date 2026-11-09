/* S06 The Turn · PULL WIDE (storyboard/scenes/s06.js): one tilted plane, every sheet at true area on one corner */
(function () {
  "use strict";
  var S = Story, F = S.fig, C = S.copy, B = S.label, L = S.lerp, m = S.smooth, CUT = 0.86, ui, T, PR, co,
    R = ["machineData[3].amtB", "DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"],
    N = ["machineData[0].name", "topSpenders[0].name", "machineData[1].name", "issueData[0].name"],
    V = [F(R[1], "T"), F(R[2], "B"), F(R[3], "B"), F(R[4], "B")], BIG = F("machineData[3].amt"),
    A1 = C("That was the cost to the states that spend it.", "index.html:552"),
    K = [[[0, 0, 1e3, 0, 0, 1], [21, -2.5, 1e3, 104, -224, 0.96], [40, -5, 900, 110, -250, 0.9]], [[0, 0, 900, 0, 0, 1], [18, -2.5, 900, 8, -32, 0.9], [32, -4, 800, 14, -50, 1]]],
    P = [[[106, 114, 1], [40, -914, 3.58], [1150, 78, 220]], [[28, 106, 1], [22, -242, 2.62], [231, 224, 108]]],
    O = [[19, 18, 24, 1, 1.9, 1.16, 1.16, 16, -12, 72, 26, 80, -22, 202, -2, 69, -12, 18, 58], [15, 15, 7, 1, 1.47, 1.07, 1.07, 16, -12, 12, 14, 141, -64, 171, -4, 28, -6, 6, 54]],
    DW = [[0, 46, 220, 46], [9, 32, 9, 13, 35, 32, 167, 32, 196, 35, 213, 46, 196, 57, 167, 61, 35, 61, 35, 32], [35, 61, 9, 79, 9, 61], [68, 32, 68, 61], [101, 32, 101, 61], [134, 32, 134, 61], [35, 99, 213, 99], [35, 95, 35, 103], [213, 95, 213, 103]];

  S.scene({
    id: "S06", order: 6, name: "The Turn", move: "PULL WIDE", screens: 1.5, file: "06",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    alt: "The camera pulls back from the sheet of world military spending until it lies small in one corner of a far larger sheet, the total economic impact of violence. All stay at true scale.",

    build: function (api) {
      var el = api.el, pl = api.plate, IEP = B("IEP GPI 2026"), SIP = B("SIPRI 2026"), TOP = [F("machineData[3].name"), " · ", IEP],
        RD = [F("globalContext.violencePctGDP", "pct"), " ", C("of world GDP", "index.html:212"), " · ", C("about ", "index.html:213"), F("globalContext.violencePerPerson", "usd"), C(" taken from every person alive", "index.html:213")],
        A2 = C("This is what it costs everyone.", "index.html:554");
      ui = el("div", "sb-box on-sheet", null, null, api.ui);
      T = [["t-label s06-l", [F(N[0]), " · ", SIP], 0, [120, 78, 13, 640], [32, 78, 10, 311], 1],
        ["t-body s06-a s06-k", A1, 1, [900, 688, 36, 470], [16, 590, 24, 343]],
        ["t-src", SIP, 1, [900, 788, 11], [16, 662, 10]],
        ["t-body s06-g s06-k", A1, 2, [120, 720, 22, 800], [16, 590, 17, 343]],
        ["t-body s06-a", A2, 3, [120, 758, 38, 800], [16, 642, 24, 343], 0, 1],
        ["t-labelW s06-k", TOP, 4, [120, 692, 12], [16, 590, 10]],
        ["t-body s06-r", RD, 4, [120, 768, 19, 860], [16, 650, 15, 343]]];
      api.rows(T, ui);
      PR = [V[0], BIG].map(function (t) { return el("div", "t-giant on-sheet", t, null, api.layer); });
      co = V.map(function (v, i) {
        var c = el("div", "s06-c on-sheet", null, null, api.ui);
        el("u", null, B("0" + (i + 1)), null, c);
        el("i", i > 2 ? "b" : "", null, null, c);
        c.v = el("b", null, v, null, c);
        c.n = el("div", "t-label", F(N[i]), null, c);
        c.l = api.leader();
        return c;
      });
      [A1, A2, [TOP[0], " · ", BIG], RD].forEach(function (t) { el("p", null, t, null, pl); });
      api.link(S.get("machineData[3].url"), IEP, null, el("p", "t-src", null, null, pl), "tap");
      V.forEach(function (v, i) { el("p", "t-label", [F(N[i]), " · ", v], null, pl); });
      api.link(S.get("machineData[0].url"), SIP, null, el("p", "t-src", null, null, pl), "tap");
    },

    layout: function (api) {
      var v = api.vp, t = S.sb(v, "t");
      api.map(ui, t);
      T.forEach(function (r) { api.place(r.e, r[v.phone ? 4 : 3], r[5] ? S.sb(v, 0) : t, t); });
      PR.forEach(function (e) { api.place(e, [0, 0, (v.phone ? 90 : 248) * v.kt]); });
    },

    state: function (p, v) {
      var ph = +v.phone, u = v.kt, s = v.stage, M = S.sb(v, 0), k = K[ph], o = O[ph], h = +(p >= 0.5), e = m(0, 0.5, p - h / 2), lk = p >= CUT, i, q,
        c = k[h].map(function (x, i) { return L(x, k[h + 1][i], e); }),
        j = ph ? 0 : m(0, 0.5, p), f = ph ? 1 : 1 - p, fw = ph ? s.w : L(s.w, 1440 * u, p), fh = L(s.h, (ph ? 500 : 900) * u, p),
        X = s.x + c[3] * u + j * (M.x - s.x), Y = s.y + s.h + c[4] * u + j * (M.y + 900 * u - s.y - s.h), A = { x: X, y: Y }, z = c[5],
        t = { rx: c[0], rz: c[1], persp: c[2] * u, ox: v.W / 2, oy: ph ? s.y + s.h - 150 * u : v.H / 2 };
      function pj(x, y) { return S.cam.project(x, y, 0, t); }
      for (i = 0; i < 9; i++) { q = pj(A.x, A.y); A.x += X - q.x; A.y += Y - q.y; }
      var rs = S.ladder(R, S.fitBetween(S.get(R[1]), S.get(R[0]), p), { x: A.x, y: A.y - fh * z, w: fw * z, h: fh * z }, ["red", "red", "red", "red", "blue"], { tilt: t, edge: 1.25, shadow: !1 }),
        G = rs[0], r = rs[1], g = r.w / fw, w = m(0.55, CUT, p), b = S.cam.bbox(G, t), n = p < 0.45 ? 18 : 6,
        sh = ph ? Math.max(0, 1 - s.h / 500 / u) : 0, d = P[ph][2],
        cn = rs.slice(1).map(function (q) { return pj(q.x + q.w, q.y); }),
        y0 = cn[0].y + o[16] * u, dy = Math.min(o[18] * u, (s.y + s.h - y0) / 3 - 12 * u);
      d = [d[0], d[1] - 92 * sh, d[2] * (1 - sh / 2)];
      function wp(x, y) { return [r.x + g * (f * (M.x - s.x) + x * u), r.y + g * (f * (M.y - s.y) + y * u)]; }
      G.edge = 2; G.tab = r.tab = 1; G.tabSize = (ph ? 8 : 12) * u; G.shadow = !0;
      r.edge = 1.5; r.tabSize = (ph ? 6 : 8) * u;
      return {
        sheet: null, big: G, rs: rs, u: u, lk: +lk, d: lk * (ph ? -32 : -44),
        pool: { x: L(r.x, G.x, p), y: L(r.y, G.y, p), w: L(r.w, G.w, p), h: L(r.h, G.h, p), tilt: t, tone: "red" },
        clip: ph ? [s.x, s.y, s.w, s.h] : null,
        o: [1 - m(0.02, 0.12, p), 1 - m(0.18, 0.3, p), m(0.38, 0.46, p) * !lk, m(0.42, 0.5, p), +lk],
        pm: [0, 1].map(function (i) { var q = P[ph][i], a = wp(q[0], q[1]); return S.cam.matrix3d({ x: a[0], y: a[1], w: 1, h: 1 }, t, { x: 0, y: 0, s: g * q[2] }); }),
        dw: DW.map(function (l) { for (var a = [], j = 0; j < l.length; j += 2) a.push(pj.apply(0, wp(d[0] + (l[j] * d[2]) / 220, d[1] + (l[j + 1] * d[2]) / 220))); return a; }),
        c: cn.map(function (q, i) {
          var a = i === 1 ? pj(rs[2].x + g * o[9] * u, rs[2].y + g * o[10] * u) : { x: q.x + o[7 + 2 * i] * u, y: q.y + o[8 + 2 * i] * u * (1 - sh) },
            x = L(a.x, cn[0].x + (o[15] + o[17] * i) * u, w), y = L(a.y, y0 + dy * i, w), Z = L(o[3 + i], 1, m(0, 0.85, p)), f = i ? 1 : m(0.3, 0.42, p);
          return [x, y, Z, f, (Z - 1) * o[0], f * (i === 1 ? w : 1), "M" + q.x + " " + q.y + "L" + (x - (3 + o[2]) * u) + " " + (y + (o[1] / 2 + 2.5) * u) + "H" + (x - 3 * u)];
        }),
        br: p < 0.25 ? null : [{ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }, p >= 0.45, lk ? "LOCKED · VIOLENCE SHEET" : p < 0.45 ? "ACQUIRING · SHEET" : "LOCKED · SHEET PULLING WIDE",
          ph ? { x: s.x, y: s.y + 24 * u, w: s.w, h: s.h - 24 * u } : { x: 0, y: 80, w: v.W, h: v.H - 120 }],
      };
    },

    render: function (st, api) {
      var f = api.set;
      T.forEach(function (r) { f(r.e, "opacity", st.o[r[2]]); if (r[6]) f(r.e, "transform", "translateY(" + st.d + "px)"); });
      PR.forEach(function (e, i) { f(e, "transform", st.pm[i]); f(e, "opacity", i ? 0.96 * st.lk : 1 - st.lk); });
      co.forEach(function (e, i) {
        var c = st.c[i];
        f(e, "transform", "translate(" + c[0] + "px," + c[1] + "px) scale(" + st.u + ")");
        f(e, "opacity", c[3]);
        f(e.v, "transform", "scale(" + c[2] + ")");
        f(e.n, "transform", "translateY(" + c[4] + "px)");
        api.attr(e.l, "opacity", c[5]);
        api.lead(e.l, c[6]);
      });
      if (st.br) api.brackets(st.br[0], { lock: st.br[1], label: st.br[2], tagAt: "tl", clip: st.br[3] });
    },

    draw: function (g, st, api) {
      api.sheets(g, st.rs, st.clip);
      g.strokeStyle = "#8A9099";
      st.dw.forEach(function (l) { g.beginPath(); l.forEach(function (q) { g.lineTo(q.x, q.y); }); g.stroke(); });
    },
  });
})();
