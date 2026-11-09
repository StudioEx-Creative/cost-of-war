/* S00 Hero · LOCK (storyboard/scenes/s00.js). Brackets hunt the file, lock on the live military
   counter, and the camera pushes into that line, where S01 cuts in. Storyboard px (Story.sb). */
(function () {
  "use strict";
  var S = Story, L = S.lerp, C = S.copy, B = S.label, LOCK = 0.7, paper, ui;
  var V = [
    { f: [150, 124, 1060, 680], c: 636, t: [280, 30], o: [720, 450, 1500], u: [[26, 18, 1.5, 0.95], [-16, 34, -1.1, 0.75]], b: [[134, 80, 1092, 740], [736, 438, 428, 196], [202, 622, 476, 140]] },
    { f: [34, 100, 312, 446], c: 418, t: [176, 22], o: [187.5, 406, 900], u: [[10, 12, 2.2, 0.95], [-6, 20, -1.6, 0.75]], b: [[26, 70, 328, 484], [10, 570, 355, 128], [42, 410, 284, 122]] },
  ];
  var the = C("THE", "index.html:76"), cost = C("COST OF WAR", "index.html:77"), head = [C("▚", "index.html:71"), C(" ACQUIRING TARGET… PATTERN RECOGNITION ONLINE", "index.html:71-72")],
    cred = C("Blueprint × StudioEX", "index.html:65"), vsrc = B("VIOLENCE · PER SECOND · IEP GPI 2026"), since = C("Since you opened this file, the world has spent", "index.html:86"),
    mil = [C("on its militaries", "index.html:89"), B(" · SIPRI 2026 · RUNNING")],
    rate = [C("Every second, violence costs humanity ", "index.html:80"), S.fig("VIOLENCE_PER_SECOND", "usd"), C(". This page cross-references what we spend on destruction against what that same money could build.", "index.html:80-82")];
  var T = [
    ["t-labelW", B("FILE · THE COST OF WAR"), 0, [164, 102, 12], [44, 83, 11], 1],
    ["t-label", head, 0, [220, 150, 12, 560], [50, 114, 11, 266], 1],
    ["t-labelW", cred, 1, [942, 150, 12], [16, 722, 10], 1],
    ["s00-l", 0, 0, [220, 184, 0, 940], [50, 152, 0, 282]],
    ["t-title", the, 0, [218, 208, 58], [49, 166, 26]],
    ["t-title s00-c", cost, 0, [214, 266, 180, 900], [48, 194, 58, 290]],
    ["t-body s00-v", rate, 1, [750, 450, 20, 400], [16, 576, 16, 343], 1],
    ["t-src", vsrc, 1, [750, 604, 11], [16, 676, 10], 1],
    ["s00-l", 0, 0, [220, 620, 0, 940], [50, 406, 0, 282]],
    ["t-labelW", since, 0, [220, 636, 12, 640], [50, 418, 10, 270]],
    ["t-value s00-n", 0, 0, [216, 668, 84], [48, 452, 50]],
    ["t-bodySm s00-m", mil, 0, [690, 718, 18, 420], [50, 510, 14, 280]],
    ["t-label", C("▼   BEGIN DEBRIEF   ▼", "index.html:93"), 2, [1131, 814, 11], [124, 758, 10]],
    ["s00-h", 0, 0, [169, 307, 0, 14], [38, 246, 0, 8]],
    ["s00-h", 0, 0, [169, 587, 0, 14], [38, 386, 0, 8]],
    ["s00-r", 0, 0, [1183, 141, 0, 10], [331, 109, 0, 6]],
    ["s00-r", 0, 0, [1183, 777, 0, 10], [331, 531, 0, 6]],
    ["s00-r", 0, 0, [197, 777, 0, 10]],
  ];

  S.scene({
    id: "S00", order: 0, name: "Hero", move: "LOCK", screens: 1.0,
    chrome: { labels: false },
    file: "00",
    reveal: true,
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    plateVisual: false,
    alt: "A classified file titled The Cost of War lies tilted on a dark desk. Brackets hunt across it and lock on the live count of military spending.",

    build: function (api) {
      var el = api.el, pl = api.plate, q;
      paper = el("div", "s00 s00-p on-sheet", null, null, api.layer);
      ui = el("div", "s00 on-sheet", null, null, api.ui);
      api.rows(T, paper);
      var nl = 0;
      api.live("military", T[10].e, function (v) {
        var s = S.FMT.usd(Math.floor(v)), w = s.length - s.split(",").length / 2;
        if (w !== nl) api.set(T[10].e, "transform", "scale(" + Math.min(1, 8.5 / (nl = w)) + ")");
        return s;
      });
      el("p", "t-label", head, null, pl).firstChild.setAttribute("aria-hidden", "true");
      el("h1", "s00-t", [the, " ", cost], null, pl);
      el("p", null, rate, null, pl);
      el("p", "t-src", vsrc, null, pl);
      q = el("p", null, [since, " "], null, pl);
      api.live("military", el("b", "s00-n", "$0", "live", q));
      el("span", null, [" "].concat(mil), null, q);
      el("p", "t-label", cred, null, pl);
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone;
      api.set(ui, "transform", S.sb(v, "t").t); 
      api.layer.style.clipPath = ph ? "inset(" + (v.stage.y - 8) + "px 0 " + (v.H - v.stage.y - v.stage.h) + "px)" : "";
      T.forEach(function (r) {
        (r[2] > !ph ? ui : paper).appendChild(r.e);
        api.place(r.e, r[ph ? 4 : 3]);
      });
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], m = S.sb(v, 0), k = m.k, f = d.f, cam = S.cam, B = v.stage.h / k, pn = v.short ? 524 - B : 0, Z = S.sb(v, "t"),
        s0 = ph ? 1 : L(0.88, 0.95, Math.min(1, p / 0.9)), q = S.smooth(LOCK, 1, p), z = ph ? 1.3 : 1.62,
        tx = L(ph ? 0 : 676 - s0 * (f[0] + f[2] / 2), (ph ? 186 : 560) - z * (f[0] + (ph ? 150 : 300)), q),
        ty = L(ph ? -pn * S.smooth(0.1, 0.6, p) : 448 - s0 * (f[1] + f[3] / 2), (v.short ? 56 + 0.632 * B : ph ? 372 : 470) - z * (d.c + (ph ? 60 : 70)), q),
        dy = pn && ty - L(0, 372 - z * (d.c + 60), q),
        A = { x: m.x + k * tx, y: m.y + k * ty, w: 1, h: 1, s: k * L(s0, z, q) },
        t = { rx: L(ph ? 12 : 13, ph ? 2 : 2.5, p), ry: L(ph ? -8 : -5, -1, p), rz: L(ph ? -2.5 : -2.2, -0.4, p), persp: d.o[2] * k, ox: m.x + k * d.o[0], oy: m.y + k * (d.o[1] + dy) };
      function R(a, o) { return { x: A.x + A.s * a[0], y: A.y + A.s * a[1], w: A.s * a[2], h: A.s * a[3], tilt: o || t, tone: "neutral", edge: 1 }; }
      function bb(a) { return { q: cam.quad(R(a), t) }; }
      var sh = d.u.map(function (u) {
          var r = R([f[0] + u[0], f[1] + u[1], f[2], f[3]], Object.assign({}, t, { rz: t.rz + u[2] }));
          r.opacity = u[3];
          return r;
        }),
        tab = R([f[0], f[1] - d.t[1], d.t[0], d.t[1] + 2]), file = R(f), r = d.b[1], hunt = p >= 0.34, fl = ph && hunt && p < LOCK;
      tab.shadow = false;
      sh.push(tab, file);
      return {
        sheet: null,
        pool: file, A: A, t: t, sh: sh, s: fl ? k : A.s,
        br: p >= LOCK ? [bb(d.b[2]), "LOCKED · MILITARY SPENDING", 1, "bl", ph ? 0 : 24]
          : hunt ? [fl ? { x: Z.x + k * r[0], y: Z.y + k * r[1], w: k * r[2], h: k * r[3] } : bb(r), "SCANNING", 0, "tl"]
          : [bb(d.b[0]), "SCANNING", 0, ph ? "tl" : "tr"],
        tr: hunt && p < LOCK ? bb(d.b[0]) : null,
        clip: ph ? [0, v.stage.y - 8, v.W, v.stage.h + 8] : null,
        cl: v.short ? v.stage : null,
        fo: 1 - S.smooth(0.72, 0.78, p),
      };
    },

    render: function (st, api) {
      var b = st.br, s = st.s, n = api.vp.phone ? 12 : 24;
      api.set(paper, "transform", S.cam.matrix3d(st.A, st.t, { s: st.A.s }));
      T.forEach(function (r) { r[5] && api.set(r.e, "opacity", r.e.parentNode == paper ? st.fo : 1); });
      api.brackets(b[0], { lock: b[2], label: b[1], tagAt: b[3], dx: (b[4] || 0) * s, fs: 11 * s, len: n * s, clip: st.cl });
      if (st.tr) api.brackets(st.tr, { id: "t", opacity: 0.25, len: n * st.A.s, clip: st.cl });
    },

    draw: function (g, st, api) {
      var v = api.vp, m = S.sb(v, 0), z = m.k * (v.phone ? 47 : 60), x;
      g.strokeStyle = "rgba(255,255,255,0.07)";
      g.beginPath();
      for (x = m.x % z; x < v.W; x += z) { g.moveTo(x, 0); g.lineTo(x, v.H); }
      for (x = m.y % z; x < v.H; x += z) { g.moveTo(0, x); g.lineTo(v.W, x); }
      g.stroke();
      api.sheets(g, st.sh, st.clip);
    },
  });
})();
