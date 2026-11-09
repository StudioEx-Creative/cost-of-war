/* S05 The Line of Production · MORPH + SPLIT (storyboard/scenes/s05.js). Drawings: js/story-assets/s05-drawings.js. */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, C = S.copy, B = S.label, A, CUT = 0.65, X = 0.9, W, sv, U, LP, ld, vw, busy, Q, H = {};
  var K = [[[1, 20, 0, 44, 0, -4, 1250], [1, -130, -12, 16, 0, -2.5, 1600], [0.92, 0, 0, 14, 0, -2, 1800], [1, 0, 0, 6, 0, -0.8, 1800]],
    [[1, 0, 20, 34, 4, -4, 900], [1, 0, 0, 12, 0, -2, 1000], [0.92, 0, 0, 12, 0, -2, 1000], [1, 0, 0, 7, 0, -1.2, 1000]]];
  var O = [[-1, null, 0.08, 0.18], [0.06, 0.18], [-1], [-1, null, 0.45, 0.5, 0.5], [0.24, 0.3], [0.24, 0.3, 0.45, 0.5], [0.24, 0.3, 0.45, 0.5, 0.5],
    [0.26, 0.3, 0.44, 0.46], [0.45, 0.47], [0.45, 0.52], [-1, null, 0.45, 0.63], [-1, null, 0.45, 0.63, 0.35], [-1, null, 0.45, 0.55], [-1, null, 0.45, 0.55, 0.45],
    [0.16, 0.24, 0.45, 0.5, 0.55], [0.11, 0.13, 0.28, 0.3], [-1, null, 0.08, 0.14], [CUT, null, X, 0.93], [CUT, null, 0.95, 0.99], [-1, null, X, 0.95],
    [0.47, 0.53, CUT], [0.67, 0.72, X, 0.94], [0.69, 0.74, X, 0.94], [-1, null, 0.92, 0.99], [CUT, null, X, 0.94]];
  function w(a, b, p) { return b == null ? +(p >= a) : sm(a, b, p); }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  var L2 = C("The only variable is what we choose to build.", "index.html:386"), R6 = S.missing("$679B", "SIPRI Top 100 arms revenue, 2024 (index.html:486)"),
    G9 = S.fig("globalContext.armsTradeGrowth", "ppct"), ST = B("SIPRI TOP 100"), SA = B("SIPRI ARMS TRANSFERS 2026"),
    GL = [S.newCopy("growth in the volume of major-arms transfers", "index.html:506 said 'global arms trade'"), ", ", S.prose("2021–25", "machineData[2].sum"), " ",
      S.newCopy("vs", ""), " ", S.missing("2016–20", "the base period of +9.2% (DATA-SOURCES.md:15)")],
    TP = ["https://www.sipri.org/media/press-release/2025/sipri-top-100-arms-producers-see-combined-revenues-surge-states-rush-modernize-and-expand-arsenals", S.get("machineData[2].url")];
  var T = [
    ["t-labelW s05-y", C("THE PRODUCTION LINE", "index.html:293"), 16, [728, 70, 13, 600], [16, 572, 11], 2],
    ["s05-r", 0, 16, [1338, 78, 0, 30], 0, 2],
    ["t-body s05-l", C("The same factories. The same steel, the same engineers.", "index.html:385"), 14, [120, 76, 30, 940], [16, 600, 20, 343], 2],
    ["t-body s05-l s05-b", L2, 20, [120, 116, 28, 1000], [16, 572, 20, 343], 2],
    ["t-body s05-l s05-b", L2, 24, [120, 76, 30, 1000], 0, 2],
    ["s05-r", 0, 21, [120, 640, 0, 480], 0, 2],
    ["t-label", C("record revenue of the 100 largest arms makers, 2024", "index.html:486"), 21, [120, 652, 12, 480], [16, 572, 10, 343], 2],
    ["t-giant", R6, 21, [112, 666, 150], [13, 602, 84], 2],
    ["t-src s05-a", ST, 21, [120, 806, 11], [16, 694, 10], 2],
    ["s05-r", 0, 22, [900, 640, 0, 400], [30, 372, 0, 315], 2, 1],
    ["t-label", GL, 22, [900, 652, 12, 400], [30, 424, 10, 315], 2, 1],
    ["t-value", G9, 22, [898, 698, 72], [30, 382, 34], 2, 1],
    ["t-src s05-a", SA, 22, [900, 790, 11], [30, 474, 10], 2, 1],
    ["t-labelW", B("THE COST OF WAR"), 23, 0, [16, 10, 11], 3],
    ["t-label", B("FILE 05"), 23, 0, [16, 26, 10], 3],
    ["t-label s05-n", B("THE LINE OF PRODUCTION"), 23, 0, [146, 11, 10], 3],
  ];

  S.scene({
    id: "S05", order: 5, name: "The Line of Production", move: "MORPH + SPLIT", screens: 1.5, file: "05",
    chrome: { labels: "desktop" },
    anchors: ["mfMorph"],
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.3 }, { k: "fold", p: 0.55 }, { k: "push", p: 0.8 }, { k: "out", p: 0.95 }],
    plateVisual: false,
    alt: "A sheet of drawing paper folded in two: a wind turbine in blue on one half, a munition with a red warhead on the other. The turbine folds into a munition; the halves close into one drawing of a munition, which shrinks into a corner.",

    build: function (api) {
      var el = api.el, pl = api.plate;
      A = window.S05_ART;
      T = T.concat(A.labels.map(function (r) {
        var t = r[1], f = r[2];
        return [r[0], t.map ? [C(t[0], t[1]), " · ", B(t[2])] : f === 0 ? S.newCopy(t, "replaces 'SCALE 1:40' (index.html:476)") : f ? C(t, f) : B(t)].concat(r.slice(3));
      }));
      W = el("div", "s05w sb-box on-sheet", null, null, api.layer);
      sv = api.svgEl("svg", { fill: "none" }, W);
      U = el("div", "sb-box on-sheet", null, null, api.ui);
      LP = el("div", "s05w sb-box on-sheet", null, null, api.ui);
      H.z = el("div", null, null, null, LP);
      ld = api.leader();
      api.rows(T, W);
      T.forEach(function (r, i) {
        if (/s05-a/.test(r[0])) r.e.remove(), (r.e = api.link(TP[i > 8 ? 1 : 0], r[1], null, null, r[0]));
        r.e.g = r[2];
      });
      [0, 2, 3, 7, 6, -1, 11, 10, -2].forEach(function (i) {
        if (i < 0) api.link(TP[-i - 1], i < -1 ? SA : ST, null, el("p", "t-src", null, null, pl), "tap");
        else el("p", i == 7 || i == 11 ? "s05-pf" : null, T[i][1], null, pl);
      });
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, f = S.sb(v), t0 = S.sb(v, 0), t = S.sb(v, "t"), u = ph ? t : f, s = v.stage, M = [f, t0, u, t0, f], N = [f, t0, u, u, f], X0 = [W, W, U, U, LP];
      if (vw !== ph) {
        vw = ph;
        sv.innerHTML = A.sheet(ph);
        H.z.innerHTML = A.loupe(ph);
        Q = [].slice.call(document.querySelectorAll(".s05w [data-g]"));
        Q.forEach(function (e) { e.g = +e.getAttribute("data-g"); });
        "hbwlk".split("").forEach(function (k) { H[k] = document.querySelectorAll(".s05w [data-" + k + "]"); });
      }
      api.map(U, u);
      api.map(LP, f);
      W.style.setProperty("--s", t0.k);
      api.layer.style.clipPath = ph && v.short ? "inset(" + s.y + "px 0 " + (v.H - s.y - s.h) + "px)" : "";
      T.forEach(function (r) {
        var z = ph && r[6] != null ? r[6] : r[5] || 0;
        X0[z].appendChild(r.e);
        api.place(r.e, r[ph ? 4 : 3], M[z], N[z]);
      });
    },

    state: function (p, v) {
      var ph = v.phone, d = A.V[+ph], k = K[+ph], f = S.sb(v), t0 = S.sb(v, 0), s = v.stage, cut = p >= CUT, x = sm(X, 0.96, p), fo = sm(0.45, 0.63, p), ho = sm(0.92, 0.99, p), c, r, sh, pool, br, ln, hold;
      function cam(c, m) {
        var q = m.k, R = { x: m.x + q * (d.o[0] * (1 - c[0]) + c[1]), y: m.y + q * (d.o[1] * (1 - c[0]) + c[2]), s: q * c[0], t: { rx: c[3], ry: c[4], rz: c[5], persp: c[6] * q, ox: m.x + q * d.o[0], oy: m.y + q * d.o[1] } };
        R.R = function (a, z) { return { x: R.x + R.s * a[0], y: R.y + R.s * a[1], w: R.s * a[2], h: R.s * a[3], tilt: Object.assign({}, R.t, { rz: c[5] + (z || 0) }) }; };
        return R;
      }
      if (cut) {
        c = mix(k[2], k[3], sm(CUT, 0.8, p));
        c[0] += 0.025 * sm(0.8, X, p);
        r = cam(mix(c, [1, 0, 0, 0, 0, 0, c[6]], x), ph && v.short ? S.sb(v, sm(0.66, 0.8, p) * (1 - x)) : f);
        pool = Object.assign({ tone: p >= X ? "red" : "neutral" }, r.R(mix(d.pp, [(s.x - t0.x) / t0.k, (s.y - t0.y) / t0.k, s.w / t0.k, s.h / t0.k], x)));
        sh = [Object.assign({ mode: "paper", edge: p >= X ? 2 : 1, tab: p >= X, tabSize: (ph ? 8 : 12) * v.kt, opacity: 1 - ho }, pool)];
        if (p >= X && !busy) {
          busy = 1;
          try { hold = { id: "S06", st: S.stateOf("S06", 0, v), opacity: ho }; } finally { busy = 0; }
        }
      } else {
        c = mix(k[0], k[1], sm(0, 0.24, p));
        c[0] += 0.03 * sm(0.24, CUT, p);
        r = cam(c, f);
        var l = d.lp, n = p < 0.45 ? 14 + 6 * Math.sin(p * 50) : 6, bb = S.cam.bbox((pool = r.R(mix(d.pb, d.sh, sm(0.04, 0.24, p)))), r.t), a = r.R(d.a[+(p >= 0.45)].concat(0, 0));
        sh = [Object.assign(r.R(d.us, d.un), { mode: "paper", edge: 1, opacity: 0.9 * sm(0.06, 0.18, p) }), Object.assign(r.R(d.sh), { mode: "paper", edge: 1, opacity: sm(0.06, 0.18, p) })];
        br = { x: bb.x - n, y: bb.y - n, w: bb.w + 2 * n, h: bb.h + 2 * n };
        a = S.cam.project(a.x, a.y, 0, r.t);
        ln = "M" + a.x + " " + a.y + "L" + (f.x + f.k * (l[0] + (ph ? l[2] / 2 : 0))) + " " + (f.y + f.k * (l[1] + (ph ? 0 : l[3] / 2)));
      }
      var th = 240 * sm(0.12, 0.48, p), q = 1 - 0.72 * fo, wp = sm(0.12, 0.3, p), y0 = ph ? 56 : 140, g = ph ? 30 + 20 * sm(0, 0.12, p) : 46 + 40 * sm(0, 0.12, p), K2 = mix(d.k, d.kp, sm(X, 0.97, p));
      return {
        sheet: null, sh: sh, hold: hold, pool: pool, br: br, ln: ln, ph: ph, cl: ph ? [s.x, s.y, s.w, s.h] : null,
        lab: p < 0.1 ? "ACQUIRING · STEEL PLATE" : p < 0.45 ? "ACQUIRING · SPLIT FRAME" : "LOCKED · SPLIT FRAME",
        o: O.map(function (a, i) { a = ph && i == 14 ? [-1, null, 0.45, 0.5] : a; return w(a[0], a[1], p) * (1 - (1 - (a[4] || 0)) * w(a[2], a[3], p)) * (i < 16 && cut ? 0 : 1); }),
        w: S.cam.matrix3d({ x: r.x, y: r.y, w: 1, h: 1 }, r.t, { x: 0, y: 0, s: r.s }),
        a: [ph ? "translate(0 " + -g + ")" : "translate(" + -g + ")", "matrix(1 0 0 " + wp + " 0 " + y0 * (1 - wp) + ")", "translate(0 " + (y0 + (ph ? 500 : 680) * wp) + ")",
          "translate(" + K2[0] + " " + K2[1] + ") scale(" + K2[2] + ")"].concat([2, 0, 1].map(function (j) {
          return (j ? "rotate(" + (j > 1 ? -54.2 : 54.2) * fo + " 100 120)" : "matrix(1 0 0 " + q + " 0 " + 120 * (1 - q) + ")") + " rotate(" + th + " 100 120)";
        })),
      };
    },

    render: function (st, api) {
      var o = st.o, a = st.a, at = api.attr;
      api.set(W, "transform", st.w);
      Q.concat(T.map(function (r) { return r.e; })).forEach(function (e) { api.set(e, "opacity", o[e.g]); });
      [].forEach.call(H.h, function (e, i) { at(e, "transform", i ? a[0].replace("-", "") : a[0]); });
      [H.w[0], H.l[0], H.k[0]].forEach(function (e, i) { at(e, "transform", a[i + 1]); });
      [].forEach.call(H.b, function (e, i) { at(e, "transform", a[4 + (i % 3)]); });
      [8, 12].forEach(function (i) { api.set(T[i].e, "pointerEvents", o[T[i][2]] > 0.5 ? "auto" : "none"); });
      at(ld, "opacity", st.ln ? o[7] + o[8] : 0);
      if (st.ln) api.lead(ld, st.ln);
      if (st.br) api.brackets(st.br, { lock: st.lab[0] == "L", label: !st.ph && st.lab, len: st.ph ? 10 : 14, tagAt: st.lab[0] == "L" ? "tr" : "tl", clip: st.ph ? api.vp.stage : null });
    },

    draw: function (g, st, api) { api.sheets(g, st.sh, st.cl); },
  });
})();
