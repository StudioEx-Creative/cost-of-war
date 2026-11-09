/* S03 The Slice · CUT (storyboard/scenes/s03.js). Storyboard px (Story.sb). */
(function () {
  "use strict";
  var S = Story, F = S.fig, B = S.label, C = S.copy, L = S.lerp, sm = S.smooth, cam = S.cam, N = 6, CUT = 0.5, EX = 0.8, D = S.get("DEFENCE"),
    V = [], A = [], P = [], Q = [], ui, tz, sp, stp, us, i,
    G = [[168, 166, 900, 562.5, 1500, 720, 450, 1], [36.5, 108, 302, 440.3, 900, 187.5, 406, 0.85]],
    T = [
      ["t-title", [C("Where the ", "index.html:242"), F("DEFENCE", "T"), C(" goes", "index.html:242")], 0, [96, 70, 40], [16, 50, 19]],
      ["t-label", C("· by sector", "index.html:242"), 0, [674, 87, 13], [16, 75, 10]],
      ["t-src", [B("SIPRI 2026"), " · ", B("ICAN nuclear 2026")], 0, [100, 114, 11], [16, 756, 10]],
      ["t-body", S.newCopy("Indicative split, modelled on typical national defence budgets. SIPRI publishes the world total only. Nuclear: ICAN.", "open decision 3"), 0, [1150, 702, 18, 270], [16, 692, 14, 343]],
      ["t-labelW", C("10 largest military budgets · 2025 · $bn", "index.html:523"), 2, [96, 76, 14], [16, 572, 11]],
      ["t-src", B("SIPRI 2026"), 2, [96, 102, 11], [16, 594, 10]],
    ];
  for (i = 0; i < 10; i++) {
    A.push(S.get("topSpenders[" + i + "].amt"));
    if (i < N) {
      V.push(S.get("spendBreakdown[" + i + "].amtB"));
      Q.push([B("0" + (i + 1)), " ", F("spendBreakdown[" + i + "].label"), F("spendBreakdown[" + i + "].amtB", V[i] < 1e3 ? "B" : "T")]);
      T.push(["t-label", Q[i].slice(0, 3), 1, 0, [16, 572 + 17 * i, 10]]);
    }
  }

  function sq(x, y, w, h) {
    var o = [], i = 0, f = (w * h) / D, s, n, a, b, z, t, u;
    while (i < N) {
      for (s = Math.min(w, h), n = i, a = 0, b = 1 / 0; n < N; n++) {
        z = a + V[n] * f;
        z = Math.max((s * s * V[i] * f) / z / z, (z * z) / (s * s * V[n] * f));
        if (z > b) break;
        b = z;
        a += V[n] * f;
      }
      for (t = a / s, u = 0; i < n; i++, u += z) {
        z = (V[i] * f) / t;
        o.push(w < h ? { x: x + u, y: y, w: z, h: t } : { x: x, y: y + u, w: t, h: z });
      }
      if (w < h) { y += t; h -= t; } else { x += t; w -= t; }
    }
    return o;
  }

  S.scene({
    id: "S03", order: 3, name: "The Slice", move: "CUT", screens: 1.0, file: "03",
    frames: [{ k: "in", p: 0.1 }, { k: "score", p: 0.3 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    plateP: 0.6, focusP: 0.6,
    alt: "A knife cuts the sheet of world military spending into six pieces, each as large as its share, then into ten strips: the ten largest budgets.",

    build: function (api) {
      var el = api.el, pl = api.plate, Y = api.layer;
      ui = el("div", "sb-box on-sheet", null, null, api.ui);
      tz = el("div", "sb-box on-sheet", null, null, api.ui);
      api.rows(T, ui);
      sp = el("div", "t-giant on-sheet", F("DEFENCE", "T"), null, Y);
      Q.forEach(function (q) { P.push(el("div", "s03-p on-sheet", q, null, Y)); });
      us = el("div", "t-labelW on-sheet", F("topSpenders[0].name"), null, Y);
      stp = el("div", "t-labelW on-sheet s03-s", S.newCopy("INDICATIVE", "open decision 3 (brief §15.3)"), null, Y);
      el("h2", "t-label", T[0][1].concat(" ", T[1][1]), null, pl);
      el("p", null, T[3][1], null, pl);
      Q.forEach(function (q) { el("p", null, [q[0], " · ", q[2], " · ", q[3]], null, pl); });
      el("p", null, [T[4][1], " · ", Q[0][0], " ", F("topSpenders[0].name")], null, pl);
      api.link(S.get("machineData[0].url"), B("SIPRI 2026"), null, el("p", "t-src", null, null, pl), "tap");
      api.link(S.get("machineData[1].url"), B("ICAN nuclear 2026"), null, el("p", "t-src", null, null, pl), "tap");
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, g = G[+ph], c = sq(0, 0, g[2], g[3]);
      api.map(ui, S.sb(v, 0));
      api.map(tz, S.sb(v, "t"));
      T.forEach(function (r) {
        var a = r[ph ? 4 : 3];
        (ph && a && a[1] > 556 ? tz : ui).appendChild(r.e);
        api.place(r.e, a);
      });
      api.place(sp, [0, 0, ph ? 48 : 120]);
      P.forEach(function (e, i) {
        var r = c[i], n = ph || r.w < 200;
        api.place(e, [0, 0, n ? 11 : 13, r.w - 30]);
        e.children[2].style.display = ph ? "none" : "";
        e.lastChild.style.fontSize = S.clamp(Math.round(Math.sqrt(r.w * r.h) * (ph ? 0.12 : 0.13)), ph ? 15 : 28, ph ? 30 : 60) / (n ? 11 : 13) + "em";
      });
      api.place(us, [0, 0, ph ? 11 : 13]);
      api.place(stp, [0, 0, ph ? 11 : 14]);
    },

    state: function (p, v) {
      var ph = v.phone, m = S.sb(v), k = m.k, a = S.stateOf("S02", 1, v).rs[3], o = a.tilt, e = sm(0, 0.1, p), g = G[+ph], ex = p >= EX, b = sm(EX, 1, p),
        j = p < 0.1 ? 0 : p < CUT ? 1 : 2, q = j ? (p - [0, 0.1, CUT][j]) / [0, 0.4, 0.5][j] : e, s1 = sm(0.1, 0.16, p),
        t = { persp: L(o.persp, g[4] * k, e), ox: L(o.ox, m.x + k * g[5], e), oy: L(o.oy, m.y + k * g[6], e) }, sh = { tilt: t }, list = [], segs = [], u = 0, n, cl;
      "xywh".split("").forEach(function (c, i) { sh[c] = L(a[c], (i < 2 ? m[c] : 0) + k * g[i], e); });
      [[o.rx, 24 * g[7], 18 * g[7], 12 * g[7]], [o.ry, -3.8, -3, -2], [o.rz, -4.1, -2.5, -1.5]].forEach(function (K, i) { t["r" + "xyz"[i]] = L(K[j], K[j + 1], q); });
      cl = sq(sh.x, sh.y, sh.w, sh.h);
      if (ex) A.forEach(function (z, i) {
        n = (z / D) * (ph ? sh.h : sh.w);
        list.push(ph ? { x: sh.x + k * b * (4 + 2 * i), y: sh.y + u + k * b * 2 * i, w: sh.w, h: n } : { x: sh.x + u + k * b * 4 * i, y: sh.y + k * b * b * (46 - 4 * i), w: n, h: sh.h });
        u += n;
      });
      else if (p >= CUT) cl.forEach(function (r) {
        n = (ph ? 0.03 : 0.024) * (1 + 0.4 * sm(CUT, EX, p));
        list.push({ x: r.x + (r.x + r.w / 2 - sh.x - sh.w / 2) * n, y: r.y + (r.y + r.h / 2 - sh.y - sh.h / 2) * n, w: r.w, h: r.h });
      });
      else cl.forEach(function (r) {
        if (r.x + r.w < sh.x + sh.w - 0.5) segs.push([r.x + r.w, r.y, r.x + r.w, r.y + r.h]);
        if (r.y + r.h < sh.y + sh.h - 0.5) segs.push([r.x, r.y + r.h, r.x + r.w, r.y + r.h]);
      });
      list.forEach(function (r, i) { Object.assign(r, { tilt: t, edge: 1, tone: "neutral" }, ex && !i && { tone: "red", edge: 2, tab: 1, tabSize: 10 * k }); });
      n = p < CUT ? 26 - 16 * sm(0.1, CUT, p) : 6;
      return {
        sheet: p < CUT ? Object.assign({ tone: "red", edge: L(a.edge, 2, e), tab: 1, tabSize: L(a.tabSize, (ph ? 8 : 12) * k, e) }, sh) : null,
        pool: Object.assign({ tone: ex ? "neutral" : "red" }, sh), sh: sh,
        gr: p < 0.15 && S.ladder(["topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"], D, sh, ["red", "red", "blue"], { tilt: t, edge: 0.8 * k, opacity: 1 - sm(0, 0.15, p) }), cl: cl, k: k, list: list, segs: segs, cut: S.clamp((p - 0.1) / 0.4, 0, 1), b: b,
        o: [s1 * !ex, p < CUT ? (ph ? 0.4 * s1 : 0) : +!ex, sm(EX, EX + 0.05, p), p < 0.1 ? 1 : p < CUT ? 0.3 : 0, s1 * !ex],
        br: [cam.bbox({ x: sh.x - n, y: sh.y - n, w: sh.w + 2 * n, h: sh.h + 2 * n + 46 * k * b * b }, t), p < CUT ? "ACQUIRING · SHEET" : ex ? "LOCKED · TEN STRIPS" : "LOCKED · TREEMAP", p >= CUT],
      };
    },

    render: function (st, api) {
      var o = st.o, set = api.set, v = api.vp, ph = v.phone, k = st.k, sh = st.sh, L = st.list, r = (L[1] ? L : st.cl)[1];
      function at(e, x, y, s, z) { set(e, "transform", cam.matrix3d({ x: x, y: y, w: 1, h: 1 }, sh.tilt, { s: s || v.kt }) + (z || "")); }
      T.forEach(function (r) { set(r.e, "opacity", o[r[2]]); });
      at(sp, sh.x + k * (ph ? 14 : 46), sh.y + k * (ph ? 18 : 40), (v.kt * sh.w) / (k * G[+ph][2]));
      set(sp, "opacity", o[3]);
      at(stp, ph ? r.x + 14 * k : r.x + r.w - 230 * k, r.y + r.h - (ph ? 46 : 92) * k, 0, " rotate(-7deg)");
      set(stp, "opacity", o[4]);
      P.forEach(function (e, i) {
        set(e, "opacity", +(o[1] == 1));
        if (o[1] == 1) at(e, L[i].x + k * (ph ? 10 : 15), L[i].y + k * (ph ? 9 : 16));
      });
      set(us, "opacity", o[2]);
      if (o[2]) at(us, L[0].x + k * (ph ? 26 : 16), L[0].y + k * (ph ? 10 : 18));
      api.brackets(st.br[0], { lock: st.br[2], label: !v.short && st.br[1], len: ph ? 10 : 14, tagAt: "tl", clip: v.short && v.stage });
    },

    draw: function (g, st, api) {
      var k = st.k, sh = st.sh, w = 0;
      function pl(a, s, lw, d, f) {
        g.beginPath();
        for (var i = 0; i < a.length; i += 2) { var q = cam.project(a[i], a[i + 1], 0, sh.tilt); g.lineTo(q.x, q.y); }
        g.setLineDash(d || []);
        g.strokeStyle = s;
        g.lineWidth = lw;
        g.fillStyle = f;
        f ? g.fill() : g.stroke();
      }
      function box(r) { return [r.x, r.y, r.x + r.w, r.y, r.x + r.w, r.y + r.h, r.x, r.y + r.h, r.x, r.y]; }
      st.segs.forEach(function (s) { w += Math.hypot(s[2] - s[0], s[3] - s[1]); });
      w *= st.cut;
      st.segs.forEach(function (s) {
        var l = Math.hypot(s[2] - s[0], s[3] - s[1]), f = S.clamp(w / l, 0, 1), x = s[0] + (s[2] - s[0]) * f, y = s[1] + (s[3] - s[1]) * f, v = s[0] == s[2], z = 1.6 * k;
        if (f < 1) pl([x, y, s[2], s[3]], "rgba(255,255,255," + 0.32 * st.o[4] + ")", 1, [6, 6]);
        if (f) pl([s[0] + v * z, s[1] + !v * z, x + v * z, y + !v * z], "rgba(255,255,255,0.72)", 1);
        z = 10 * k;
        if (f && f < 1) pl(v ? [x, y, x - z / 2, y - z * 1.8, x + z / 2, y - z * 1.8] : [x, y, x - z * 1.8, y - z / 2, x - z * 1.8, y + z / 2], 0, 0, 0, "#FFFFFF");
        w -= l;
      });
      g.setLineDash(st.gr ? [4, 4] : []);
      api.sheets(g, st.gr || st.list);
      if (st.b) pl(box(sh), "rgba(255,255,255," + 0.3 * (1 - st.b) + ")", 1, [3, 6]);
      else st.list.forEach(function (r, i) {
        var c = st.cl[i], q = box(r);
        [c.y - sh.y, sh.x + sh.w - c.x - c.w, sh.y + sh.h - c.y - c.h, c.x - sh.x].forEach(function (d, j) { if (d < 1) pl(q.slice(2 * j, 2 * j + 4), "#E8362B", 2); });
        if (!i) pl(box({ x: r.x, y: r.y, w: 12 * k, h: 12 * k }), 0, 0, 0, "#E8362B");
      });
    },
  });
})();
