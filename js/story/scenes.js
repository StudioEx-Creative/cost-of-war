/* STORY · SCENES: API and rules in js/story/README.md. Edit only your scene's section. */

/* S00 Hero · LOCK */
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
    ["t-title", the, 0, [218, 208, 58], [49, 166, 26], 0.76],
    ["t-title s00-c", cost, 0, [214, 266, 180, 900], [48, 194, 58, 290], 0.76],
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
          : hunt ? [fl ? { x: Z.x + k * r[0], y: Z.y + k * r[1], w: k * r[2], h: k * r[3] } : bb(r), !(fl && v.short) && "SCANNING", 0, "tl"]
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
      T.forEach(function (r) { r[5] && api.set(r.e, "opacity", r.e.parentNode == paper ? L(1 - r[5], 1, st.fo) : 1); });
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

/* S01 The Line · PUSH */
(function () {
  "use strict";
  var S = Story, L = S.lerp, sm = S.smooth, C = S.copy, B = S.label, F = S.fig, ui, tz, cw, big, tag, lab, rule, src, link, intro, ld;
  var DEF = F("DEFENCE", "T"), PCT = F("globalContext.milPctGDP", "pct"), Y = S.prose("2025", "machineData[0].sum"), NAME = [F("machineData[0].name"), " · ", Y],
    CH = C("Chapter 01 · The Machine", "index.html:177"), TI = C("What we spend on war", "index.html:178"), US = [B("01"), " ", F("topSpenders[0].name"), " ", F("topSpenders[0].amt", "B")],
    EU = [B("02"), " ", B("Europe"), " ", "+", S.prose("14%", "machineData[0].detail")],
    IN = [Y, C(" was the eleventh straight record year. The world now spends ", "index.html:180"), PCT, C(" of everything it produces on its militaries, the highest share since ", "index.html:180-181"), S.prose("2009", "machineData[0].sum"), "."];
  var V = [
    { y: 560, o: 520, ry: -22, pe: 1300, c: [720, 450], st: [0, 0, 1440, 900], b: [468, 468, 78, 260, 1, 400 / 260], l: [96, 96, -40, 144], f: 0.5 },
    { y: 386, o: 260, ry: -26, pe: 760, c: [187.5, 406], st: [16, 56, 343, 500], b: [58, 28, 24, 96, 90 / 96, 98 / 96], l: [18, 34, 10, 26], f: 0.7 },
  ];
  var U = [
    ["t-labelW", CH, 0, [96, 84, 12], [16, 572, 11]],
    ["t-title", TI, 0, [96, 110, 56, 560], [16, 596, 32, 343]],
    ["t-body", IN, 1, [96, 712, 19, 620], [16, 572, 16, 343]],
    ["t-value s01-g", [PCT, " ", C("of everything it produces", "index.html:180-181")], 2, [96, 506, 24], [34, 228, 15]],
    ["t-labelW", US[0], 2, [1030, 595, 12], [76, 335, 10], [16, 690, 10]],
    ["t-label", US[2], 2, [1070, 595, 12], [104, 335, 10], [44, 690, 10]],
    ["t-value", US[4], 2, [1068, 618, 52], [102, 354, 40], [42, 706, 40]],
    ["t-labelW", EU[0], 2, [1030, 695, 12], [76, 429, 10], [190, 690, 10]],
    ["t-label", EU[2], 2, [1070, 695, 12], [104, 429, 10], [218, 690, 10]],
    ["t-value", EU.slice(4), 2, [1068, 718, 52], [102, 448, 40], [216, 706, 40]],
  ];

  S.scene({
    id: "S01", order: 1, name: "The Line", move: "PUSH", screens: 1.0,
    file: "01",
    anchors: ["machine"],
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    plateVisual: false,
    alt: "A red budget line crosses the frame at an angle, then thickens into a sheet that fills the screen: one year of world military spending.",

    build: function (api) {
      var el = api.el, pl = api.plate, url = S.get("machineData[0].url"), lk = B("SIPRI 2026");
      ui = el("div", "s01 on-sheet", null, null, api.ui);
      tz = el("div", "s01 on-sheet", null, null, api.ui);
      cw = el("div", "s01-w", null, null, api.layer);
      big = el("div", "s01-b t-giant on-sheet", DEF, null, cw);
      tag = el("div", "s01 on-sheet", null, null, api.layer);
      lab = el("div", "t-labelW", NAME, null, tag);
      rule = el("div", "s01-r", null, null, tag);
      src = el("div", "t-src", B("SIPRI 2026"), null, tag);
      api.rows(U, ui);
      link = api.link(url, lk, null, ui, "t-src s01-a");
      U.push(["", 0, 2, [1030, 790, 11], [76, 518, 10], [16, 760, 10]]);
      U[10].e = link;
      intro = U[2].e;
      ld = api.leader();
      el("p", "t-label", CH, null, pl);
      el("h2", "s01-t", TI, null, pl);
      el("p", "t-label", NAME, null, pl);
      el("p", "s01-pb", DEF, null, pl);
      el("p", null, IN, null, pl);
      el("p", null, US, null, pl);
      el("p", null, EU, null, pl);
      api.link(url, lk, null, el("p", "t-src", null, null, pl), "tap");
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone;
      api.map(ui, S.sb(v, 0));
      api.map(tz, S.sb(v, "t"));
      api.lead(ld, ph ? "M336 212V270L56 306V436M56 342h14M56 436h14M329 538h12v-12" : "M1046 470V540L1000 580V704M1000 604h22M1000 704h22");
      api.place(big, [0, 0, V[+ph].b[3]]);
      api.place(lab, [0, 0, ph ? 11 : 14]);
      api.place(rule, [0, ph ? -10 : -12, 0, ph ? 309 : 604]);
      api.place(src, [0, ph ? 36 : 56, ph ? 11 : 13]);
      U.forEach(function (r) {
        var a = r[v.short && r[5] ? 5 : ph ? 4 : 3];
        (ph && a[1] >= 556 ? tz : ui).appendChild(r.e);
        api.place(r.e, a);
      });
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], bh = v.stage.h / v.kt, st = v.short ? [16, 56, 343, bh] : d.st, g = Math.pow(S.clamp((p - 0.15) / 0.78, 0, 1), 1.6), h0 = 2 + (d.st[3] - 2) * g,
        m = S.sb(v, v.short ? S.clamp((300 - bh / 2) / (500 - bh), 0, 1) * (1 - g) : 0), k = m.k,
        g2 = g < 0.5 ? g * g : 1.5 * g - 0.5, e = 1 - Math.pow(Math.min(1, p / 0.85), 0.9),
        o = d.o * (1 - g), h = 2 + (st[3] - 2) * g, y = d.y - (d.y - st[1]) * g,
        t = e > 0 ? { rx: 14 * e, ry: d.ry * e, rz: -3 * e, persp: d.pe * k, ox: m.x + k * d.c[0], oy: m.y + k * d.c[1] } : null,
        sh = { x: m.x + k * (st[0] - o), y: m.y + k * y, w: k * (st[2] + 2 * o), h: k * h, mode: h > 3 ? "paper" : "line", tone: "red", edge: 2, tab: h > 3, tabSize: ph ? 8 : 12, tilt: t },
        b = S.cam.bbox({ x: m.x + k * st[0], y: sh.y, w: k * st[2], h: sh.h }, t), x0 = Math.max(b.x, 64), y0 = Math.max(b.y, 72), n = p < 0.5 ? 18 : 6,
        vb = { x: x0, y: y0, w: Math.min(b.x + b.w, v.W - 64) - x0, h: Math.min(b.y + b.h, v.H - 72) - y0, tone: "red" },
        a = ph ? sm(0, 0.2, p) : 0, bs = L(L(1, d.b[4], a), d.b[5], g2);
      return {
        sheet: sh, t: t, m: m, sh: v.short, cl: v.short ? v.stage : null,
        pool: vb,
        cx: Math.round(Math.min(0, m.x + k * (st[0] + st[2] + o) - v.W) * 100) / 100,
        big: [L(L(d.b[0], d.b[1], a), d.b[2], g2), y + h0 * (1 - d.f * g) - 6 - 0.797 * d.b[3] * bs, bs],
        tag: [L(d.l[0], d.l[1], g), y + d.l[2] + d.l[3] * g],
        o: [1 - sm(ph ? 0.3 : 0.8, ph ? 0.37 : 0.9, p), sm(ph ? 0.4 : 0.38, ph ? 0.47 : 0.5, p), sm(0.86, 0.94, p), ph ? 1 - sm(0.12, 0.2, p) : 1 - sm(0, 0.3, g), ph ? sm(0.86, 0.94, p) : sm(0.2, 0.6, g),
          ph ? 1 - sm(0.12, 0.2, p) + sm(0.5, 0.58, p) : L(1, 0.62, g)],
        iy: ph ? 0 : -60 * sm(0.8, 0.92, p),
        br: b.w >= 0.9 * k * st[2] && b.h >= 0.9 * k * st[3] ? null
          : [{ x: x0 - n, y: y0 - n, w: vb.w + 2 * n, h: vb.h + 2 * n }, (p < 0.5 ? "ACQUIRING · " : "LOCKED · ") + (h > 3 ? "BAND" : "LINE"), p >= 0.5],
      };
    },

    render: function (st, api) {
      var o = st.o, b = st.br;
      function M(e, a, x) { api.set(e, "transform", (x || "") + S.cam.at(st.m, a[0], a[1], a[2], st.t)); }
      var m = st.m;
      api.set(ui, "transform", m.t);
      api.attr(ld, "transform", "translate(" + m.x + " " + m.y + ") scale(" + m.k + ")");
      api.set(cw, "transform", "translateX(" + st.cx + "px)");
      M(big, st.big, "translateX(" + -st.cx + "px) ");
      M(tag, st.tag);
      api.set(src, "opacity", o[3]);
      api.set(rule, "opacity", o[4]);
      api.set(lab, "opacity", o[5]);
      U.forEach(function (r) { api.set(r.e, "opacity", o[r[2]]); });
      api.set(intro, "transform", "translateY(" + st.iy + "px)");
      api.set(link, "pointerEvents", o[2] > 0.5 ? "auto" : "none");
      api.attr(ld, "opacity", st.sh ? 0 : o[2]);
      if (b) api.brackets(b[0], { lock: b[2], label: (b[2] || !api.vp.phone) && b[1], len: api.vp.phone ? 10 : 14, tagAt: "tl", clip: st.cl });
    },
  });
})();

/* S02 The Ladder · PULL */
(function () {
  "use strict";
  var S = Story, L = S.lerp, F = S.fig, C = S.copy, B = S.label, P = S.prose, D = "machineData[1].sum, shortened", ui, sv, rl, chip, Q = [];
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
        api.el("h2", "t-label", nm, null, pl);
        api.el("p", "s02-pv", v, null, pl);
        api.el("p", null, r[3], null, pl);
        api.link(S.get(r[5]), r[4], null, api.el("p", "t-src", null, null, pl), "tap").setAttribute("data-p", [0.1, 0.45, 0.8, 1][i]);
      });
      rl = el("s02-r");
      chip = el("t-labelW s02-c", S.newCopy("DETAIL · ENLARGED", "decision 4"));
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
          : [{ x: b.x - n, y: b.y - n, w: b.w + 2 * n, h: b.h + 2 * n }, p < 0.5 ? !(ph && p < 0.36) && "ACQUIRING · LADDER" : a > 2 ? "LOCKED · SHEET LYING BACK" : "LOCKED · LADDER", p >= 0.5],
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

/* S03 The Slice · CUT */
(function () {
  "use strict";
  var S = Story, F = S.fig, B = S.label, C = S.copy, L = S.lerp, sm = S.smooth, cam = S.cam, N = 6, CUT = 0.5, EX = 0.8, D = S.get("DEFENCE"),
    V = [], A = [], P = [], Q = [], GR = [], ui, tz, sp, sl, sc, stp, us, i,
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
      Q.push([B("0" + (i + 1)), " ", F("spendBreakdown[" + i + "].label"), [F("spendBreakdown[" + i + "].amtB", V[i] < 1e3 ? "B" : "T"), { kind: "fig", ref: "spendBreakdown[" + i + "].amtB" }]]);
      T.push(["t-label", Q[i].slice(0, 3), 1, 0, [16, 572 + 17 * i, 10]]);
    }
  }

  var GH = [["topSpenders[0].amt", "topSpenders[0].name", "03"], ["machineData[1].amtB", "machineData[1].name", "02"], ["issueData[0].cost", "issueData[0].name", "01"]];
  GH.forEach(function (g, j) {
    g.t = [B(g[2]), " · ", F(g[0], "B")];
    T.push(["t-label", g.t.concat(" · ", F(g[1])), 5, 0, [16, 572 + 17 * j, 10]]);
  });

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
      var SN = [F("machineData[0].name"), " · ", S.prose("2025", "machineData[0].sum")];
      sl = el("div", "t-label on-sheet s03-q", SN, null, api.ui);
      sc = el("div", "t-src on-sheet s03-q", B("SIPRI 2026"), null, api.ui);
      GH.forEach(function (g) { GR.push(el("div", "t-label on-sheet s03-q s03-g", g.t, null, api.ui)); });
      Q.forEach(function (q) { P.push(el("div", "s03-p on-sheet", q, null, Y)); });
      us = el("div", "t-labelW on-sheet", F("topSpenders[0].name"), null, Y);
      stp = el("div", "t-labelW on-sheet s03-s", S.newCopy("INDICATIVE", "open decision 3 (brief §15.3)"), null, Y);
      el("h2", "t-label", T[0][1].concat(" ", T[1][1]), null, pl);
      el("p", null, T[3][1], null, pl);
      Q.forEach(function (q) { el("p", null, [q[0], " · ", q[2], " · ", q[3]], null, pl); });
      el("p", null, SN, null, pl);
      GH.forEach(function (g) { el("p", null, g.t.concat(" · ", F(g[1])), null, pl); });
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
      [us, sl, sc].concat(GR).forEach(function (e) { api.place(e, [0, 0, ph ? 10 : 12]); });
      [1, 2].forEach(function (i) { sl.children[i].style.display = v.short ? "none" : ""; });
      sl.w = sl.offsetWidth;
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
        var fl = sm(EX + 0.012 * i, EX + 0.08 + 0.012 * i, p) * 46 * k;
        n = (z / D) * (ph ? sh.h : sh.w);
        list.push(ph ? { x: sh.x + fl / 4, y: sh.y + u + k * b * 3 * i, w: sh.w, h: n } : { x: sh.x + u + k * b * 7 * i, y: sh.y + fl, w: n, h: sh.h });
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
        gr: p < 0.2 && S.ladder(GH.map(function (g) { return g[0]; }), D, sh, [], { tilt: t, edge: 0.8 * k, opacity: 1 - sm(0.1, 0.2, p) }), cl: cl, k: k, list: list, segs: segs, cut: S.clamp((p - 0.1) / 0.4, 0, 1), b: b,
        o: [s1 * !ex, p < CUT ? (ph ? 0.4 * s1 : 0) : +!ex, sm(EX, EX + 0.05, p), p < 0.12 ? 1 : p < CUT ? 0.3 : 0, s1 * !ex, 1 - sm(0.08, 0.12, p), 1 - sm(0.1, 0.2, p)],
        br: [cam.bbox({ x: sh.x - n, y: sh.y - n, w: sh.w + 2 * n, h: sh.h + 2 * n + 46 * k * b * b }, t), p < CUT ? "ACQUIRING · SHEET" : ex ? "LOCKED · TEN STRIPS" : "LOCKED · TREEMAP", p >= CUT],
      };
    },

    render: function (st, api) {
      var o = st.o, set = api.set, v = api.vp, ph = v.phone, k = st.k, sh = st.sh, L = st.list, r = (L[1] ? L : st.cl)[1];
      function at(e, x, y, s, z) { set(e, "transform", cam.matrix3d({ x: x, y: y, w: 1, h: 1 }, sh.tilt, { s: s || v.kt }) + (z || "")); }
      T.forEach(function (r) { set(r.e, "opacity", o[r[2]]); });
      var Z = (v.kt * sh.w) / (k * G[+ph][2]);
      [[sp, ph ? 32 : 62, Z], [sl, v.short ? (5 * v.kt) / k : ph ? 16 : 40], [sc, v.short ? 32 + (44 * Z) / k : ph ? 86 : 196]].forEach(function (q) { at(q[0], sh.x + k * (ph ? 14 : 46), sh.y + k * q[1], q[2]); set(q[0], "opacity", q[0] == sl && ph ? o[3] * S.clamp((sh.w - sl.w * v.kt - 8 * k) / (20 * k), 0, 1) : o[3]); });
      GR.forEach(function (e, i) { set(e, "opacity", st.gr ? o[6] : 0); if (st.gr) at(e, st.gr[i].x + 6 * k, st.gr[i].y + 6 * k); });
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

/* S04 The Sort · RE-RANK */
(function () {
  "use strict";
  var S = Story, F = S.fig, B = S.label, C = S.copy, L = S.lerp, sm = S.smooth, cam = S.cam, N = 10, GL = 0.25, SN = 0.6, FU = 0.85,
    A = [], G = [], BX = [], GW = {}, gl, gn, gs, hit, ld, hov = -1, last, td, i, OG = B(" OF GDP"), YY = S.newCopy(" YEAR ON YEAR", "S04 detail"),
    V = [[690, 62, 98, 440, 120, 1250, 720, 450], [102, 12, 44, 200, 22, 1000, 187.5, 406]],
    T = [
      ["t-labelW s04-k", C("10 largest military budgets · 2025 · $bn", "index.html:523"), 0, [568, 84, 13, 760], [16, 734, 11]],
      ["t-label s04-k", 0, 0, [568, 104, 11, 760], [16, 762, 10]],
      ["t-labelW s04-k", C("…and what that costs them · % of GDP", "index.html:527"), 1, [568, 130, 13, 760], [16, 734, 11]],
      ["t-label s04-k", 0, 2, [568, 150, 11, 760], [16, 762, 10]],
      ["t-src", B("SIPRI 2026"), 3, [72, 806, 11], [250, 762, 10]],
      ["t-labelW s04-k", C("THE PRODUCTION LINE", "index.html:293"), 4, [568, 70, 13, 760], [16, 572, 11]],
    ];
  for (i = 0; i < N; i++) { A.push(S.get("topSpenders[" + i + "]")); G.push(i); }
  G.sort(function (a, b) { return A[b].gdp - A[a].gdp; });
  var MV = G[0];
  function f(i, k, m) { return F("topSpenders[" + i + "]." + k, m); }
  function n2(i) { return B(("0" + (i + 1)).slice(-2)); }

  S.scene({
    id: "S04", order: 4, name: "The Sort", move: "RE-RANK", screens: 1.0, file: "04",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.45 }, { k: "out", p: 0.8 }, { k: "detail", p: 0.8 }, { k: "fuse", p: 1 }],
    plateP: 0.8, focusP: 0.8,
    alt: "Ten bars, the ten largest military budgets, sized by dollars. Ranked by share of the economy, Ukraine moves to the top; then the bars fuse into one steel plate.",

    build: function (api) {
      var el = api.el, pl = api.plate, Y = api.layer;
      api.rows(T, el("div", "sb-box on-sheet", null, null, api.ui));
      el("h2", "t-label", T[0][1], null, pl);
      el("p", null, T[2][1], null, pl);
      for (i = 0; i < N; i++) {
        BX.push(el("div", "sb-box on-sheet", null, null, api.ui));
        BX[i].q = api.rows([["t-value s04-v", f(i, "amt", "B")], ["t-label"], ["t-labelW", f(i, "name")], ["t-label s04-g", f(i, "gdp", "pct")]], BX[i]);
        el("p", null, [n2(i), " · ", f(i, "name"), " · ", f(i, "amt", "B"), " · ", f(i, "gdp", "pct"), OG, " · ", f(i, "change"), YY], null, pl);
      }
      api.link(S.get("machineData[0].url"), B("SIPRI 2026"), null, el("p", "t-src", null, null, pl), "tap");
      gl = el("div", "t-labelW on-sheet", ["", " · ", ""], null, Y);
      gn = el("div", "t-giant on-sheet", null, null, Y);
      gs = el("div", "t-label on-sheet", ["", "", " · ", "", YY], null, Y);
      ld = api.leader();
      hit = el("div", "s04-h", null, null, api.ui);
      function pick(e) {
        var r = hit.getBoundingClientRect(), d = 1e9;
        hov = -1;
        last.an.forEach(function (a, i) { var z = Math.abs(last.ph ? e.clientY - r.top - a[1] : e.clientX - r.left - a[0]); if (z < d) { d = z; if (z < last.hp) hov = i; } });
        show(api);
      }
      function mouse(e) { return e.pointerType == "mouse"; }
      hit.addEventListener("pointermove", function (e) { if (mouse(e)) pick(e); });
      hit.addEventListener("pointerdown", function (e) { if (mouse(e)) pick(e); else td = [e.clientX, e.clientY, scrollY]; });
      hit.addEventListener("pointerup", function (e) { if (td && Math.hypot(e.clientX - td[0], e.clientY - td[1]) < 10 && scrollY == td[2]) pick(e); td = 0; });
      hit.addEventListener("pointercancel", function () { td = 0; });
      hit.addEventListener("pointerleave", function (e) { if (mouse(e)) { hov = -1; show(api); } });
      addEventListener("scroll", function () { hov = -1; }, { passive: true });
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, b = V[+ph], m = { k: v.k, x: 0, y: 0, r: v.kt / v.k }, c = { k: v.kt, x: 0, y: 0 };
      api.map(T[0].e.parentNode, S.sb(v, ph ? "t" : 0));
      api.text(T[1].e, B(ph ? "LENGTH" : "HEIGHT"));
      api.text(T[3].e, [B("ORDER · "), S.newCopy(ph ? "TAP A BAR" : "HOVER A BAR", "S04 detail")].join(""), "newCopy");
      T.forEach(function (r) { api.place(r.e, r[ph ? 4 : 3]); });
      BX.forEach(function (e, i) {
        var s = e.q, h = (A[i].amt * b[3]) / A[0].amt;
        (ph ? s[0] : e).appendChild(s[3]);
        api.place(s[0], ph ? [h + 12, 17, 14] : [-26, -h - 36, 20, 114], m, c);
        api.place(s[1], ph ? [2, 1, v.short ? 11 : 10] : [0, 14, 11]);
        s[1].style.color = ph ? "var(--soft)" : "";
        api.place(s[2], ph ? [24, 1, 10] : [0, 30, 11, 92]);
        api.place(s[3], ph ? [0, 0, 10] : [0, 70, 13]);
        if (v.short) s[0].style.left = Math.max(parseFloat(s[0].style.left), 32 + s[2].offsetWidth) + "px";
        s[0].d = ph ? parseFloat(s[0].style.left) - 24 : 0;
      });
      api.place(gl, [0, 0, ph ? 10 : 12]);
      api.place(gn, [0, 0, ph ? 150 : 300]);
      api.place(gs, [0, 0, ph ? 10 : 12]);
      var o = gn.textContent;
      A.forEach(function (a, i) { [f(i, "amt", "B"), f(i, "gdp", "pct")].forEach(function (n) { gn.textContent = n; GW[n] = gn.offsetWidth; }); });
      gn.textContent = o;
    },

    state: function (p, v) {
      var ph = v.phone, m = S.sb(v), k = m.k, b = V[+ph], g = S.clamp((p - GL) / (SN - GL), 0, 1), sn = p >= SN, rid = g && !sn, fu = sm(FU, 1, p),
        e = Math.sin((Math.PI / 2) * g), dx = ph || p < GL ? 0 : sn ? 130 - 110 * sm(SN, FU, p) : 130 * e,
        t = ph ? { rx: L(8, 34, fu), ry: L(22, 4, fu), rz: L(-2, -4, fu) }
          : { rx: p < FU ? L(-11, -4, Math.min(1, p / 0.8)) : L(-4, 44, fu), ry: p < SN ? 6 + 8 * e : L(L(14, 3, sm(SN, 0.8, p)), 0, fu), rz: -4 * fu },
        bars = [], an = [], lab = [], pts = [], gh = [], R = [], ld = sn ? MV : g ? -1 : 0, red = sn || g ? MV : 0, lx = v.W - 74 * v.kt, j, M, z, Z, tie;
      t.persp = b[5] * k; t.ox = m.x + k * b[6]; t.oy = m.y + k * b[7];
      function P(x, y) { return [m.x + k * x, m.y + k * y]; }
      function Q(r, a) { return { x: m.x + k * r.x, y: m.y + k * r.y, w: k * r.w, h: k * r.h, a: a }; }
      A.forEach(function (a, i) {
        var l = (a.amt * b[3]) / A[0].amt, sl = sn ? G.indexOf(i) : i, mv = i == MV && rid, r,
          o = ph ? { x: b[4], y: b[0] + i * b[2] + 20, w: l, h: b[1] } : { x: b[4] + i * b[2] + dx, y: b[0] - l, w: b[1], h: l };
        if (mv) sl = i * (1 - g);
        r = ph ? { x: b[4] + (mv ? 150 : 0), y: L(b[0] + sl * b[2] + 20, 166 + sl * 28, fu), w: l, h: L(b[1], 28, fu) }
          : { x: L(b[4] + sl * b[2], 410 + sl * b[1], fu) + dx, y: b[0] - l - (mv ? 150 * Math.min(1, g * 6) : 0), w: b[1], h: l };
        if (mv) for (j = 0; j < 5; j++) gh.push(Q({ x: ph && j ? r.x : L(o.x, r.x, j / 5), y: L(o.y, r.y, j / 5), w: r.w, h: r.h }, 0.15 + j / 7));
        if (sn && !fu && sl != i) gh.push(Q(o, 0.3));
        lab.push(P(r.x, ph ? r.y - 20 : r.y + l));
        R.push(r);
        r = pts[sl] = Object.assign(Q(r), { tilt: t, tone: i == red && fu < 0.5 ? "red" : "neutral", edge: ((i == red ? 2 : 1) * (1 - sm(0.6, 1, fu))) || 0.01, tab: i == red && fu < 0.5, tabSize: (ph ? 5 : 8) * k, shadow: false, mv: mv, sl: sl });
        bars.push(r);
        j = cam.project(r.x + r.w / 2, r.y + r.h / 2, 0, t);
        z = cam.project(r.x + r.w / 2, r.y - 8 * k, 0, t);
        an.push([j.x, j.y, z.x, z.y]);
      });
      M = R[MV];
      Z = rid ? [M.x - 10, M.y - 128, ph ? 0.2 : 0.28 * (1 + 0.4 * g)] : sn ? (ph ? [70, 602, 1] : [872, 214, 1]) : ph ? [14, 590, 0.75] : [700, 158, 0.79];
      z = ph && !rid ? S.sb(v, "t") : m;
      var zy = z.y + z.k * Z[1];
      if (ph && rid) {
        j = bars[MV];
        j = cam.project(j.x + j.w, j.y + j.h / 2, 0, t);
        zy = j.y - 14 * v.kt;
        lab[MV] = [lx - 24 * v.kt, zy + 31 * v.kt];
        tie = [j.x + 6 * k, j.y, lx - 6 * v.kt];
      }
      return {
        sheet: null, pool: Q(ph ? { x: 22, y: 110, w: 300, h: 420 } : { x: L(240, 420, fu) + dx, y: 170, w: 760, h: 500 }), sub: bars[ld < 0 ? MV : ld], bars: bars, gh: gh, an: an, lab: lab, k: k, m: [m.x, m.y], ph: ph, hp: (ph ? 22 : 49) * k,
        t: t, dx: dx, rd: sm(0.12, 0.28, p), g: rid, lf: ph && rid ? 1 - sm(0.84, 0.93, g) : 1, sn: sn, fu: fu, tie: tie, noScan: ph && g > 0,
        plate: fu > 0 && pts,
        z: [0, [0, 1, 2].map(function (j) { return [(ph && rid ? lx : z.x + z.k * Z[0]) + (j && (ph ? (rid ? 1 : 4) : 8)) * v.kt, zy - v.kt * [0, ph ? 12 : 26, ph ? 26 : 46][j]]; }), Z[2] * v.kt, ph ? null : t],
        ld: !ph && ld >= 0 && [[R[ld].x + 31, R[ld].y - 8], [R[ld].x + 31, Z[1] - 18], [Z[0] - 18, Z[1] - 18]].map(function (q) { q = P(q[0], q[1]); q = cam.project(q[0], q[1], 0, t); return [q.x, q.y]; }),
        o: [ph ? 1 - sm(0.1, 0.14, p) : 1, sm(0.12, 0.2, p) * (ph || sn ? 1 : 0.6), +sn, 1, fu, 1 - sm(FU, 0.9, p)],
        br: [cam.bbox(Q(ph ? { x: 8, y: 88, w: 330, h: 450 } : fu ? { x: 390 + dx, y: 230, w: 660, h: 480 } : { x: 90 + dx, y: 130, w: 1040, h: 640 }), t),
          fu ? "LOCKED · STEEL PLATE" : (sn ? "LOCKED" : "ACQUIRING") + " · TEN BARS", sn],
      };
    },

    render: function (st, api) {
      var o = st.o, set = api.set, v = api.vp, ph = v.phone, nf = o[5], z = st.z;
      function at(e, a, s, t) { set(e, "transform", cam.matrix3d({ x: a[0], y: a[1], w: 1, h: 1 }, t === undefined ? st.t : t, { s: s || v.kt })); }
      last = st;
      T.forEach(function (r, i) { set(r.e, "opacity", o[r[2]] * (i > 4 || nf)); });
      BX.forEach(function (e, i) {
        var mv = st.bars[i].mv, fl = mv && ph, q = v.short && !fl && cam.project(st.lab[i][0], st.lab[i][1], 0, st.t);
        if (q) at(e, [q.x, q.y], 0, null); else at(e, st.lab[i], 0, fl ? null : undefined);
        set(e, "opacity", nf);
        set(e.q[3], "opacity", mv ? 0 : st.rd);
        set(e.q[0], "transform", mv ? "translate(" + -e.q[0].d + "px,3px)" : "none");
        set(e.q[1], "opacity", +!mv);
        set(e.q[2], "opacity", +!(mv && !ph));
        api.text(e.q[1], n2(Math.round(st.bars[i].sl)));
      });
      at(gl, z[1][1], 0, z[3]);
      at(gs, z[1][2], 0, z[3]);
      set(gn, "opacity", nf);
      set(gl, "opacity", nf * st.lf);
      set(hit, "pointerEvents", st.g || st.fu ? "none" : "auto");
      show(api);
      api.brackets(st.br[0], { lock: st.br[2], label: !v.short && st.br[1], len: ph ? 10 : 14, tagAt: "tl", clip: v.short && v.stage });
    },

    draw: function (g, st, api) {
      var t = st.t, k = st.k, ph = st.ph, F = st.fu, d = (ph ? 5 : 9) * k * (1 - F), m = st.m, c = st.plate, W = "rgba(255,255,255,", a0 = g.globalAlpha, nf = 1 - F, Y = m[1] + 690 * k, X0 = m[0] - 600 * k, X1 = m[0] + 2000 * k, i, o, q;
      function pl(a, s, w, dsh, fl) {
        g.beginPath();
        for (var i = 0; i < a.length; i += 2) { var q = cam.project(a[i], a[i + 1], 0, t); g.lineTo(q.x, q.y); }
        g.setLineDash(dsh || []);
        g.strokeStyle = s;
        g.lineWidth = w;
        g.fillStyle = fl;
        if (fl) g.fill();
        if (s) g.stroke();
      }
      function box(r) { return [r.x, r.y, r.x + r.w, r.y, r.x + r.w, r.y + r.h, r.x, r.y + r.h, r.x, r.y]; }
      for (i = -6; i < 20; i++) {
        var x = m[0] + k * (i * (ph ? 34 : 98) + st.dx), y = m[1] + k * i * (ph ? 34 : 60);
        pl([x, m[1] - 300 * k, x, m[1] + 1300 * k], "rgba(255,255,255,0.05)", 1);
        pl([m[0] - 600 * k, y, m[0] + 2000 * k, y], "rgba(255,255,255,0.05)", 1);
      }
      function gr(x, y, h, a, b) { var q = cam.project(x, y, 0, t), r = cam.project(x, y + h, 0, t), G = g.createLinearGradient(0, q.y, 0, r.y); G.addColorStop(0, W + a + ")"); G.addColorStop(1, W + (b || 0) + ")"); return G; }
      if (nf && !ph) {
        q = st.sub;
        o = q.x + q.w / 2;
        i = 260 * k;
        pl([o - 26 * k, q.y - i, o + 26 * k, q.y - i, q.x + q.w + 46 * k, Y, q.x - 46 * k, Y], 0, 0, 0, gr(o, q.y - i, Y - q.y + i, 0, 0.07 * nf));
        pl([X0, Y, X1, Y, X1, Y + 170 * k, X0, Y + 170 * k], 0, 0, 0, gr(X0, Y, 170 * k, 0.05 * nf));
        pl([X0, Y, X1, Y], W + 0.4 * nf + ")", 1);
        st.bars.forEach(function (r) { var h = Math.min(r.h * 0.55, 74 * k); if (!r.mv) pl(box({ x: r.x, y: Y + 2, w: r.w, h: h }), 0, 0, 0, gr(r.x, Y + 2, h, 0.075 * nf)); });
      }
      if (nf && ph) pl([m[0] + 22 * k, m[1] + 90 * k, m[0] + 22 * k, m[1] + 560 * k], W + 0.4 * nf + ")", 1);
      st.gh.forEach(function (r) { pl(box(r), "rgba(255,255,255," + r.a + ")", 1, [3, 4]); });
      st.bars.slice().sort(function (a, b) { return a.mv - b.mv; }).forEach(function (r) {
        var x = r.x, y = r.y, w = r.w, h = r.h, e = d * 0.6;
        pl([x + w, y, x + w + d, y - e, x + w + d, y + h - e, x + w, y + h], "rgba(255,255,255,0.14)", 1, 0, "#0A0A0A");
        pl([x, y, x + d, y - e, x + w + d, y - e, x + w, y], "rgba(255,255,255,0.35)", 1, 0, "rgba(255,255,255,0.2)");
        api.drawSheet(g, r);
      });
      if (st.tie) {
        g.beginPath();
        g.moveTo(st.tie[0], st.tie[1]);
        g.lineTo(st.tie[2], st.tie[1]);
        g.setLineDash([2, 4]);
        g.strokeStyle = W + "0.45)";
        g.lineWidth = 1;
        g.stroke();
      }
      if (c) {
        var J = sm(0.6, 1, F), C0 = c[0], C9 = c[9], x0 = C0.x, X = C9.x + C9.w, TY = 1e9, BY = 0, P;
        o = ph ? [x0, C0.y] : [x0, C0.y + C0.h];
        c.forEach(function (r) {
          TY = Math.min(TY, r.y); BY = Math.max(BY, r.y + r.h); X = Math.max(X, r.x + r.w);
          if (ph) o.push(r.x + r.w, r.y, r.x + r.w, r.y + r.h); else o.push(r.x, r.y, r.x + r.w, r.y);
        });
        o = o.concat(ph ? [x0, BY] : [C9.x + C9.w, BY], o.slice(0, 2));
        c.forEach(function (r) { pl(box(r), W + F * (1 - J) + ")", 1.5); });
        g.globalAlpha = a0 * J;
        if (!ph) pl(box({ x: x0, y: BY, w: X - x0, h: 14 * k }), W + "0.28)", 1, 0, "#0A0A0A");
        q = [cam.project(x0, TY, 0, t), cam.project(X, BY, 0, t)];
        P = g.createLinearGradient(q[0].x, q[0].y, q[1].x, q[1].y);
        P.addColorStop(0, "#1B1D20"); P.addColorStop(0.55, "#121315"); P.addColorStop(1, "#0D0E10");
        pl(o, 0, 0, 0, P);
        g.save();
        g.clip();
        g.setLineDash([]);
        g.strokeStyle = "rgba(138,144,153,0.5)";
        g.lineWidth = 1;
        g.beginPath();
        for (i = -(BY - TY); i < X - x0; i += 11.3 * k) {
          q = [cam.project(x0 + i + BY - TY, TY, 0, t), cam.project(x0 + i, BY, 0, t)];
          g.moveTo(q[1].x, q[1].y); g.lineTo(q[0].x, q[0].y);
        }
        g.stroke();
        g.restore();
        pl(o, W + "1)", 1.5);
        g.globalAlpha = a0;
        pl(ph ? [c[0].x - 14 * k, c[4].y + c[4].h, c[0].x + 330 * k, c[4].y + c[4].h] : [c[4].x + c[4].w, c[3].y - 60 * k, c[4].x + c[4].w, c[0].y + c[0].h + 40 * k], "rgba(255,255,255," + 0.85 * st.fu + ")", 1.2, [8, 6]);
      }
    },
  });

  function show(api) {
    var st = last, i = st.g || st.fu ? -1 : hov, d = i >= 0, j = d ? i : st.sn || st.g ? MV : 0, u = st.sn || st.g, c = gl.children, s = gs.children, z = st.z, a = z[1][0], n = u ? f(j, "gdp", "pct") : f(j, "amt", "B"), rd = st.ph && st.g;
    api.text(c[0], rd ? "" : f(j, "name"));
    api.text(c[1], rd ? "" : " · ");
    api.text(c[2], B(u ? "% OF GDP" : "$BN"));
    api.text(gn, n);
    var sc = z[2], R = api.vp.W - 24 * api.vp.kt, q0, q1;
    if (j != (u ? MV : 0)) {
      q0 = z[3] ? cam.project(a[0], a[1], 0, z[3]) : { x: a[0] };
      q1 = z[3] ? cam.project(a[0] + sc * GW[n], a[1], 0, z[3]) : { x: a[0] + sc * GW[n] };
      if (q1.x > R) sc *= (R - q0.x) / (q1.x - q0.x);
    }
    api.set(gn, "transform", cam.matrix3d({ x: a[0], y: a[1], w: 1, h: 1 }, z[3], { s: sc }));
    api.text(s[0], u ? f(j, "amt", "B") : f(j, "gdp", "pct"));
    api.text(s[1], u ? "" : OG);
    api.text(s[3], f(j, "change"));
    api.set(gs, "opacity", +d);
    i = st.ld && (d ? st.an[i][2] < st.ld[2][0] && [st.an[i].slice(2), [st.an[i][2], st.ld[2][1]], st.ld[2]] : st.ld);
    api.attr(ld, "opacity", i ? st.o[5] : 0);
    if (i) api.lead(ld, "M" + i.join("L"));
  }
})();

/* S05 The Line of Production · MORPH + SPLIT */
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
    GL = [S.newCopy("growth in the volume of major-arms transfers", "index.html:506"), ", ", S.prose("2021–25", "machineData[2].sum"), " ",
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
    ["s05-r", 0, 22, [900, 640, 0, 400], [30, 372, 0, 315], 2, 1, [16, 718, 0, 343]],
    ["t-label", GL, 22, [900, 652, 12, 400], [30, 424, 10, 315], 2, 1, [130, 724, 10, 229]],
    ["t-value", G9, 22, [898, 698, 72], [30, 382, 34], 2, 1, [16, 726, 34]],
    ["t-src s05-a", SA, 22, [900, 790, 11], [30, 474, 10], 2, 1, [130, 771, 10]],
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
        return [r[0], t.map ? [C(t[0], t[1]), " · ", B(t[2])] : f === 0 ? S.newCopy(t, "index.html:476") : f ? C(t, f) : B(t)].concat(r.slice(3));
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
        else el(i ? "p" : "h2", i ? (i == 7 || i == 11 ? "s05-pf" : null) : "t-label", T[i][1], null, pl);
      });
      var seen = {}, li = [];
      T.slice(16).forEach(function (r) { var t = [].concat(r[1]), j = t.join(""); if (/[a-z]{3}/i.test(j) && !seen[j]) { seen[j] = 1; li = li.concat(li[0] ? " · " : [], t); } });
      el("p", "t-label", li, null, pl);
      H.p = el("div", "s05w s05-pv", null, null, null);
      H.p.setAttribute("aria-hidden", "true");
      pl.insertBefore(H.p, pl.firstChild);
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
        if (S.debug.mode != "motion") {
          api.def.render(api.def.state(0.3, v), api);
          sv.setAttribute("viewBox", A.V[+ph].sh.join(" "));
          H.p.appendChild(sv);
        }
      }
      api.map(U, u);
      api.map(LP, f);
      W.style.setProperty("--s", t0.k);
      api.layer.style.clipPath = ph && v.short ? "inset(" + s.y + "px 0 " + (v.H - s.y - s.h) + "px)" : "";
      T.forEach(function (r) {
        var b = v.short && r[7], z = b ? 2 : ph && r[6] != null ? r[6] : r[5] || 0;
        X0[z].appendChild(r.e);
        api.place(r.e, b || r[ph ? 4 : 3], M[z], N[z]);
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
        r = cam(mix(c, [1, 0, 0, 0, 0, 0, c[6]], x), ph && v.short ? t0 : f);
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

/* S06 The Turn · PULL WIDE */
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
      [A1, A2, [TOP[0], " · ", BIG], RD].forEach(function (t, i) { el(i ? "p" : "h2", null, t, null, pl); });
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

/* S07 The Map · TRAVEL */
(function () {
  "use strict";
  var S = Story, F = S.fig, B = S.label, sm = S.smooth, M = Math, RD = M.PI / 180, KX = M.cos(32 * RD), W = "rgba(255,255,255,", BIG = "machineData[3].amtB",
    LAND = [], N = [], I = [], E = [], tz, ins, ld, big,
    RT = [0, 1, 5, 4, 2, 3], GEO = [[31.2, 48.4], [38.5, 35], [30.2, 15.6], [47.6, 15.9], [43.7, 33.2], [34.4, 31.45]], AN = [.5, .5, 0, 1, .5, .5, .5, .5, 0, 0, 1, 0],
    T0 = [0, .12, .202, .322, .442, .562, .682, .8], T1 = [.12, .16, .28, .4, .52, .64, .76, 1],
    V = [{ k: [[29.49, 16.06, 14.46, 40, -5, 900, 720, 450], [22.41, 23.02, 14.46, 58, 0, 860, 720, 450]], s: [26, 56, 660, 400, 580], w: [39.2, 31.8, 21, 62, -90, 1400, 700, 590], a: 1.6,
      i: [1206, 604, 150, 196], u: [28, 27, 77, 78, 11, 170, 122, 168, 120, 101, 18, 107], x: [162, 518, 482, 425, 1030, 572, 971, 437, 682, 576, 718, 715], g: [-12.8, 44.7, 20.1] },
    { k: [[36.6, 15.08, 8.93, 32, -4, 800, 187.5, 406], [34.15, 19.57, 8.93, 52, 0, 760, 187.5, 406]], s: [23, 54, 420, 166, 376], w: [38.2, 32.4, 7.4, 54, -90, 640, 186, 356], a: .686,
      i: [30, 86, 74, 96], u: [33, 10, 50, 30, 2, 80, 58, 79, 54, 46, 8, 49], g: [15.35, 36.3, 9.6] }],
    T = [["t-labelW", S.copy("Chapter 02 · The Impact of War", "index.html:562"), 0, [120, 76, 12], [16, 572, 11]],
      ["t-title", S.copy("Destruction", "index.html:575"), 1, [112, 96, 150], [15, 594, 41]],
      ["t-body", S.newCopy("These are mixed estimates: reconstruction needs, damage and economic loss.", "audit F12/F14"), 2, [120, 236, 19, 560], [16, 642, 15, 343]],
      ["s07-r", 0, 10, [768, 214, 0, 590], 0]];
  V.forEach(function (d) { d.K = d.k.concat(GEO.map(function (g, i) { return [g[0], g[1], d.s[0], d.s[1], i < 5 ? -14 - 14 * i : -82, d.s[2], d.s[3], d.s[4]]; }), [d.w]); });

  function amt(c) {
    var P = "conflictCosts[" + c + "].amtB", v = S.get(P), s = "$" + M.round(v) + "B";
    return s === S.FMT.B(v) ? F(P, "B") : S.derived(s, P + " rounded as main.js:229");
  }
  function pj(c) {
    var s = M.sin(c[3] * RD), co = M.cos(c[3] * RD), cz = M.cos(c[4] * RD), sz = M.sin(c[4] * RD), D = c[5], o = { u: (D * .86) / s, hz: c[7] - (D * co) / s };
    o.pl = function (g) { var a = (g[0] - c[0]) * KX * c[2], b = (c[1] - g[1]) * c[2]; return [a * cz - b * sz, a * sz + b * cz]; };
    o.sc = function (q) { var y = M.min(q[1], o.u), f = D / (D - y * s); return [c[6] + q[0] * f, c[7] + y * co * f, f]; };
    o.pt = function (g) { var q = o.pl(g); return q[1] <= o.u && o.sc(q); };
    return o;
  }
  function tr(g, P, Q, z) {
    var o = [], u = P.u, n = Q.length, i, a, b;
    Q = Q.map(P.pl);
    for (i = 0; i < n; i++) {
      a = Q[i]; b = Q[(i + 1) % n];
      if (a[1] <= u) o.push(a);
      if ((z || i < n - 1) && a[1] <= u !== b[1] <= u) o.push([a[0] + ((b[0] - a[0]) * (u - a[1])) / (b[1] - a[1]), u]);
    }
    o.forEach(function (q, i) { q = P.sc(q); g[i ? "lineTo" : "moveTo"](q[0], q[1]); });
    if (z) g.closePath();
  }
  function blk(i, x, y, q, a, o) {
    var r = S.rung("conflictCosts[" + RT[i] + "].amtB", S.get(BIG), { x: 0, y: 0, w: 56 * q * a, h: 56 * q }, "tl");
    r.x = x + GEO[i][0] * KX * q - AN[2 * i] * r.w;
    r.y = y - GEO[i][1] * q - AN[2 * i + 1] * r.h;
    return Object.assign(r, o);
  }

  S.scene({
    id: "S07", order: 7, name: "The Map", move: "TRAVEL", screens: 2.0, file: "07",
    anchors: ["impact"],
    anchorP: { impact: .08 },
    frames: [{ k: "in", p: .08 }, { k: "stop", p: .16 }, { k: "mid", p: .52 }, { k: "out", p: 1 }],
    alt: "The sheet of the cost of violence tips back into a map. The camera visits six places, each with a block sized to its estimated cost of war: Ukraine, Syria, Sudan, Yemen, Iraq, Gaza. At the end all six lie on the map at one scale.",

    build: function (api) {
      var el = api.el, pl = api.plate, fl = el("div", "sb-box", null, null, api.ui);
      tz = el("div", "sb-box on-sheet", null, null, api.ui);
      ins = el("div", "sb-box on-sheet", null, null, api.ui);
      big = el("div", "t-giant on-sheet", F("machineData[3].amt"), null, api.layer);
      ld = api.leader();
      RT.forEach(function (c, i) {
        var P = "conflictCosts[" + c + "].", n = B("0" + (i + 1)), x = V[0].x.slice(2 * i), u = S.get(P + "url"), s = F(P + "src"), nm = F(P + "name"), a = amt(c), y = 646 + (i >> 1) * 28, r = 16 + (i % 2) * 176;
        T.push(["t-labelW s07-n", [nm, B(" · " + n + " / 06")], 3 + i, [768, 226, 13], [16, 574, 11]], ["t-giant", a, 3 + i, [761, 250, 186], [12, 590, i ? 100 : 92]],
          ["t-body", F(P + "note"), 3 + i, [768, 436, 19, 440], [16, 688, 15, 343]], ["t-src s07-a", s, 3 + i, [768, 518, 11], [16, 744, 10], u],
          ["t-labelW s07-b", n, 9, [x[0], x[1], 10], [r, y, 10]], ["t-labelW s07-v", [nm, a], 9, [x[0] + 26, x[1] - 2, 11], [r + 24, y, 10]], ["t-src s07-a", s, 9, [x[0] + 26, x[1] + 22, 10], 0, u]);
        N.push(el("div", "t-label s07-o", nm, null, fl), el("div", "t-labelW s07-c", n, null, fl));
        I.push(el("div", "t-labelW", n, null, ins));
        E.push(api.leader());
      });
      T.forEach(function (r, i) {
        r.e = r[5] ? api.link(r[5], r[1], null, tz, r[0]) : el("div", r[0], r[1] || null, null, tz);
        if (i === 3) el("p", "t-label", [F("machineData[3].name"), " · ", F("machineData[3].amt")], null, pl);
        if (r[1] && r[2] < 9) r[5] ? api.link(r[5], r[1], null, el("p", "t-src", null, null, pl), "tap").setAttribute("data-p", T1[r[2] - 2] + .05) : el(i == 1 ? "h2" : "p", i % 7 === 5 && "s07-pf", r[1], null, pl);
      });
      I.push(el("div", "t-labelW s07-k", B("FIG 07.1 · ROUTE"), null, ins), el("div", "t-labelW s07-k", B("FIG 07.1 · PLAN · TRUE AREA"), null, ins));
      el("p", "t-src", S.newCopy("Map: Natural Earth (public domain).", "map credit"), null, pl);
      (window.LAND_110M || []).forEach(function (r) {
        for (var q = [], j = 0; j < r.length; j += 2) q.push([r[j] / 10, r[j + 1] / 10]);
        LAND.push(q);
      });
    },

    layout: function (api) {
      var v = api.vp, d = V[+v.phone], b = d.i;
      api.map(tz, S.sb(v, "t"));
      api.lay(T);
      api.place(big, [0, 0, 100]);
      N.forEach(function (e) { api.place(e, [0, 0, (v.phone ? 10 : 11) * v.kt]); });
      I.forEach(function (e, i) { api.place(e, i < 6 ? [b[0] + d.u[2 * i], b[1] + d.u[2 * i + 1], 10] : (i < 7 || !v.phone) && [b[0] - 7, b[1] - 22, 10]); });
      api.text(I[6], B(v.phone ? "FIG 07.1" : "FIG 07.1 · ROUTE"));
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], m = S.sb(v, 1 - .3 * sm(.04, .16, p)), mi = S.sb(v, 0),
        k = m.k, kt = v.kt, w = ph ? v.stage : { x: 0, y: 0, w: v.W, h: v.H }, R = w.x + w.w, Bt = w.y + w.h,
        j = 0, at = -1, o = [], U = [], any = 0, i, e8 = sm(.8, .84, p), e9 = sm(.92, .98, p), fi = sm(.02, .07, p), t = sm(0, .12, p), dy = ph ? 0 : -428 * sm(.8, 1, p), c, P, A, u;
      while (p > T1[j]) j++;
      A = d.K[j + 1];
      u = sm(T0[j], T1[j], p);
      c = d.K[j].map(function (x, i) { return i === 2 ? x * M.pow(A[2] / x, u) : x + (A[i] - x) * u; });
      c = [c[0], c[1], c[2] * k, c[3], c[4], c[5] * k, m.x + c[6] * k, m.y + c[7] * k];
      P = pj(c);
      for (i = 0; i < 6; i++) if (p >= T1[i + 1] - .02) at = i;
      if (p > .8) at = 6;
      o[1] = sm(.04, .08, p) * (1 - sm(.1, .14, p));
      o[0] = o[2] = ph ? o[1] + sm(.86, .94, p) : sm(.04, .08, p);
      for (i = 0; i < 6; i++) any += o[3 + i] = ((U[i] = sm(T1[i + 1] - .02, T1[i + 1], p)), i === M.min(at, 5)) * U[0] * (1 - e8);
      o[9] = e9;
      o[10] = any;
      function px(x, y) { return m.x + k * x + "," + (m.y + k * y); }
      function win(x, a, b) { return sm(a, a + 20 * kt, x) * (1 - sm(b - 20 * kt, b, x)); }
      var x0 = c[6] - c[0] * KX * c[2], y0 = c[7] + c[1] * c[2], tl = { rx: c[3], rz: c[4], persp: c[5], ox: c[6], oy: c[7] },
        sh = { x: x0 + (39 * KX - 28 * d.a) * c[2], y: y0 - 60 * c[2], w: 56 * c[2] * d.a, h: 56 * c[2] }, Z = GEO.map(P.pt),
        bl = Z.map(function (z, i) { return U[i] && z && z[2] < 2.5 && blk(i, x0, y0, c[2], d.a, { mode: "paper", shadow: false, tilt: tl, tone: i === at ? "red" : "neutral", edge: (i === at ? 1.75 : 1.25) * kt, opacity: U[i] * (i === at || at > 5 ? 1 : .6) }); }),
        q = at > -1 && at < 6 && bl[at] && S.cam.quad(bl[at], tl).reduce(function (a, z) { return z.x - .35 * z.y > a.x - .35 * a.y ? z : a; });
      return {
        sheet: null, c: c, k: k, at: at, t: t, o: o, U: U, Z: Z, fi: fi, end: e9, gd: 1 - sm(.8, 1, p), fe: sm(.85, 1, p), bl: bl, tl: tl, lo: any,
        my: ph ? -52 * sm(.8, .86, p) : -136 * sm(.1, .16, p),
        lead: q && "M" + q.x + "," + q.y + (ph ? "L" + M.min(q.x + 30 * kt, R - 30 * kt) + "," + (Bt + 4 * kt) + "H" + 56 * kt : "L" + px(742, 214) + "L" + px(768, 214)),
        pool: p < .12 ? Object.assign({ tilt: tl, tone: "red", opacity: 1 - t }, sh) : { x: w.x + .1 * w.w, y: M.max(w.y, P.hz), w: .6 * w.w, h: .5 * w.h, opacity: sm(.12, .2, p) },
        rs: t < 1 ? S.ladder(["DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"], S.get(BIG), sh, ["red", "red", "red", "blue"], { mode: "paper", shadow: false, tilt: tl, edge: 1.25 * k, opacity: .9 * (1 - t) }, "bl") : [],
        g: [x0 + d.g[0] * KX * c[2], y0 - d.g[1] * c[2], (d.g[2] * c[2]) / 100, .96 * (1 - .74 * sm(0, .05, p)) * (1 - sm(.08, .12, p))],
        n: Z.map(function (z, i) {
          var l = z && (i > 4 || z[0] > R - 100 * kt), b = ph ? 70 : 90, ix = mi.x + mi.k * (d.i[0] + d.i[2]), iy = mi.y + mi.k * (d.i[1] + d.i[3]);
          return z ? [z[0] + (l ? -8 : 8) * kt, z[1] + ((ph ? [0, -12, 0, 0, 4, 0][i] : 0) - 7) * kt, fi * (1 - o[3 + i]) * (1 - e8) * win(z[0], w.x + (l ? b : 10) * kt, R - (l ? 10 : b) * kt) *
            win(z[1], M.max(w.y + (ph ? 30 : 140) * kt, P.hz + 8 * kt), Bt - (ph ? 20 : 70) * kt) * (ph ? 1 - sm(.13, .16, p) * (1 - sm(.8, .86, p)) * sm(ix + 72 * kt, ix + 56 * kt, z[0]) * sm(iy + 22 * kt, iy + 8 * kt, z[1]) : 1 - sm(.1, .14, p) * sm(m.x + 700 * k, m.x + 740 * k, z[0])), l,
            M.min(z[0] + 3 * kt, R - 20 * kt), M.max(z[1] - 18 * kt, w.y + 4 * kt), ph * e9] : [0, 0, 0, 0, 0, 0, 0];
        }),
        ib: [mi.x + mi.k * d.i[0], mi.y + mi.k * (d.i[1] + dy), mi.k * d.i[2], mi.k * d.i[3]], io: sm(.13, .16, p) * (ph ? 1 - sm(.8, .86, p) : 1),
        it: "translate(" + mi.x + "px," + mi.y + "px) scale(" + mi.k + ") translateY(" + dy + "px)", ki: [1 - sm(.86, .9, p), ph ? 0 : sm(.9, .94, p)],
        E: bl.map(function (b, i) {
          var Q = !ph && b && S.cam.quad(b, tl)[i < 4 ? 1 : 0], x = d.x && d.x.slice(2 * i);
          return Q && "M" + Q.x + "," + Q.y + "L" + px(x[0] - 10, M.min(M.max((Q.y - m.y) / k, x[1] + 9), x[1] + 34)) + "L" + px(x[0] - 10, x[1] + 9) + "L" + px(x[0] - 4, x[1] + 9);
        }),
      };
    },

    render: function (st, api) {
      var set = api.set;
      function at(e, x, y, o, l) { set(e, "transform", "translate(" + x + "px," + y + "px)" + (l ? " translateX(-100%)" : "")); set(e, "opacity", o); }
      T.forEach(function (r) { api.fade(r.e, st.o[r[2]]); });
      set(T[2].e, "transform", "translateY(" + st.my + "px)");
      set(big, "transform", S.cam.matrix3d({ x: st.g[0], y: st.g[1], w: 1, h: 1 }, st.tl, { x: 0, y: 0, s: st.g[2] }));
      set(big, "opacity", st.g[3]);
      set(ins, "transform", st.it);
      I.forEach(function (e, i) {
        var n = st.n[i] || [];
        set(e, "opacity", st.io * (i < 6 ? st.U[i] * (i === st.at ? 1 : .7) : st.ki[i - 6]));
        if (i > 5) return;
        at(N[2 * i], n[0], n[1], n[2], n[3]);
        at(N[2 * i + 1], n[4], n[5], n[6]);
        api.attr(E[i], "opacity", st.E[i] ? st.end : 0);
        if (st.E[i]) api.lead(E[i], st.E[i]);
      });
      api.attr(ld, "opacity", st.lead ? st.lo : 0);
      if (st.lead) api.lead(ld, st.lead);
    },

    draw: function (g, st, api) {
      var v = api.vp, ph = v.phone, d = V[+ph], P = pj(st.c), a0 = g.globalAlpha, k = st.k, t = st.t, x0 = 39 - (28 * d.a) / KX, x1 = 78 - x0,
        SQ = [[x0, 60], [x1, 60], [x1, 4], [x0, 4]], w = ph ? v.stage : { x: 0, y: 0, w: v.W, h: v.H }, i, j, q, r, b = st.ib, z, ox, oy;
      function pa(Q, c) { g.beginPath(); Q.forEach(function (L) { tr(g, P, L, c); }); }
      function ln(c, w) { g.strokeStyle = c; g.lineWidth = w || 1; g.stroke(); }
      function gr(x, y, X, Y, s) { r = g.createLinearGradient(x, y, X, Y); s.forEach(function (c, i) { r.addColorStop(i / (s.length - 1), c); }); return r; }
      function dot(q, c, s) { g.fillStyle = c ? "#FFFFFF" : "#8A9099"; g.fillRect(q[0] - s / 2, q[1] - s / 2, s, s); }
      if (ph) { g.beginPath(); g.rect(w.x, w.y, w.w, w.h); g.clip(); }
      for (q = [], i = -180; i <= 180; i += 5) { q.push([[i, -80], [i, 85]]); if (i > -81 && i < 86) q.push([[-180, i], [180, i]]); }
      pa(q);
      ln(gr(0, P.hz, 0, P.hz + (ph ? 120 : 220) * k, [W + "0)", W + .05 * st.gd * t + ")"]));
      q = [P.sc(P.pl(SQ[0])), P.sc(P.pl(SQ[2]))];
      g.fillStyle = gr(q[0][0], q[0][1], q[1][0], q[1][1], ["#1B1D20", "#121315", "#0D0E10"]);
      pa([SQ], 1);
      g.fill();
      g.save();
      g.clip();
      g.fillStyle = W + .045 * t + ")";
      pa(LAND, 1);
      g.fill();
      for (q = [], i = -10; i <= x1; i += 5) q.push([[i, 4], [i, 60]], [[x0, i + 15], [x1, i + 15]]);
      pa(q);
      ln(W + (.03 + .08 * t) + ")");
      g.beginPath();
      for (i = -10; i <= x1; i += 5) for (j = 5; j <= 60; j += 5) if ((q = P.pt([i, j])) && q[1] > P.hz && q[1] < w.y + w.h + 20 && q[0] > w.x - 20 && q[0] < w.x + w.w + 20) {
        z = M.max(1.5, 3.5 * M.min(1.5, q[2])) * k;
        g.moveTo(q[0] - z, q[1]); g.lineTo(q[0] + z, q[1]); g.moveTo(q[0], q[1] - z); g.lineTo(q[0], q[1] + z);
      }
      ln(W + (.08 + .18 * t) + ")");
      g.restore();
      api.sheets(g, st.rs);
      pa([SQ], 1);
      ln(W + ".28)");
      g.globalAlpha = a0 * (1 - t);
      ln("#E8362B", 2);
      g.globalAlpha = a0;
      pa([[[x1, 4], [x1, 60]]]);
      ln(W + .7 * st.fe + ")", 1.25);
      g.beginPath(); g.moveTo(w.x, P.hz); g.lineTo(w.x + w.w, P.hz);
      ln(W + .22 * st.gd * t + ")");
      g.setLineDash([3 * k, 5 * k]);
      pa(GEO.slice(1, st.at + 1).map(function (c, i) { return [GEO[i], c]; }));
      ln(W + .4 * (1 - st.end) + ")");
      g.setLineDash([]);
      st.bl.forEach(function (r) { if (r) api.drawSheet(g, r); });
      g.globalAlpha = a0 * st.fi;
      GEO.map(P.pt).forEach(function (q, i) { if (q && q[1] < w.y + w.h - (ph ? 8 : 64) * k) dot(q, i <= st.at, 5 * k); });
      if (st.io > 0) {
        z = M.min(b[2] / (36 * KX), b[3] / 45); ox = b[0] + (b[2] - 36 * KX * z) / 2 - 21 * KX * z; oy = b[1] + 56 * z;
        g.globalAlpha = a0 * st.io;
        g.fillStyle = "rgba(10,10,10,.9)";
        g.fillRect(b[0], b[1], b[2], b[3]);
        g.strokeStyle = "#FFFFFF";
        g.strokeRect(b[0] - 6.5, b[1] - 6.5, b[2] + 13, b[3] + 13);
        g.setLineDash([2, 3]);
        g.beginPath();
        GEO.slice(0, st.at + 1).forEach(function (c, i) { g[i ? "lineTo" : "moveTo"](ox + c[0] * KX * z, oy - c[1] * z); });
        ln(W + ".5)");
        g.setLineDash([]);
        api.sheets(g, GEO.map(function (c, i) {
          dot([ox + c[0] * KX * z, oy - c[1] * z], i <= st.at, 3);
          return blk(i, ox, oy, z, d.a, { mode: "outline", edge: 1, opacity: st.U[i] * (i === st.at ? 1 : .7) });
        }));
      }
      g.globalAlpha = a0;
    },
  });
})();

/* S08 The Air · ORBIT */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, L = S.lerp, F = S.fig, C = S.copy, M = Math, E = S.get("emittersCompare"), H = 3, W = "#FFFFFF", ui, tz, ld, R = [], T,
    V = [[328, 1067, 313.6, 600, 640, 2000, 4.6, 150, 1150, 810, 288, 826], [14, 363, 283, 166, 468, 1100, 4, 26, 316, 126, 140, 132]];
  function pt(A, o, x) {
    var c = A.c / (1 + A.c * o), q = M.sqrt(M.max(0.01, 1 - x * x * c * c)), y = (x * x * c) / (1 + q) - o, s = M.sin(A.r), k = M.cos(A.r);
    return [A.x + x * k - y * s, A.y + x * s + y * k, M.atan((x * c) / q) + A.r];
  }
  function edge(g, A, o, a, b, n) { for (var i = 0, q; i < 41; i++) { q = pt(A, o, L(a, b, i / 40)); g[i || n ? "lineTo" : "moveTo"](q[0], q[1]); } }

  S.scene({
    id: "S08", order: 8, name: "The Air", move: "ORBIT", screens: 1.0, file: "08",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 0.9 }],
    plateP: 0.5,
    alt: "The map's far edge bends into the curve of the earth. Six layers rise from it, each as thick as one emitter's share of global emissions; the world's militaries are the red one.",

    build: function (api) {
      var el = api.el, pl = api.plate, P = "emittersCompare[", u = S.get("destructionData[3].url"), s = F("destructionData[3].src"), HN,
        TI = C("If the world's militaries were a country · share of global CO₂", "index.html:586"),
        CA = C("Approx. share of global emissions. Military estimate: SGR / CEOBS · national shares: Global Carbon Project.", "index.html:590-591");
      E.forEach(function (e, i) { if (e.hot) H = i; });
      HN = [F(P + H + "].name"), " · ", F("envFacts[0].src")];
      ui = el("div", "sb-box on-sheet", null, null, api.ui);
      tz = el("div", "sb-box on-sheet", null, null, api.ui);
      ld = api.leader();
      T = [["t-labelW s08-t", TI, 0, [120, 70, 13], [16, 590, 20, 343]], ["s08-q", "", 1, [120, 770, 0, 44]], ["t-body", CA, 1, [120, 782, 19, 1140], [16, 652, 14, 343], [16, 698, 14, 343]],
        ["s08-q", "", 3, 0, [16, 578, 0, 44]], ["s08-r", "", 2, [830, 92, 0, 520]], ["t-labelW s08-h", HN, 2, [830, 102, 12], [136, 68, 10], [16, 588, 10]],
        ["t-giant", F(P + H + "].pct", "pct"), 2, [822, 124, 204], [132, 84, 92], [12, 604, 92]]];
      api.rows(T, ui);
      T.push(["", 0, 1, [120, 814, 11], [16, 736, 10], [16, 764, 10]]);
      T[7].e = api.link(u, s, null, ui, "t-src s08-a");
      el("h2", "t-label", TI, null, pl);
      E.forEach(function (e, i) {
        var t = [F(P + i + "].name"), F(P + i + "].pct", "pct")];
        R.push(el("div", "s08-n" + (i === H ? " h" : e.pct < 4 ? " s" : ""), t, null, ui));
        el("p", null, [t[0], " ", t[1]].concat(i === H ? HN.slice(1) : []), null, pl);
      });
      el("p", null, CA, null, pl);
      api.link(u, s, null, el("p", "t-src", null, null, pl), "tap");
      api.link(S.get("envFacts[1].url"), F("envFacts[1].src"), null, el("p", "t-src", null, null, pl), "tap");
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone;
      api.map(ui, S.sb(v, ph ? 1 : null));
      api.map(tz, S.sb(v, "t"));
      T.forEach(function (r) {
        var a = r[v.short && r[5] ? 5 : ph ? 4 : 3];
        if (a) (ph && a[1] > 555 ? tz : ui).appendChild(r.e);
        api.place(r.e, a);
      });
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], m = S.sb(v, ph ? 1 : null), n = S.sb(v, ph ? 0.7 : null), k = m.k, x = ph ? v.stage.x : 0, w = ph ? v.stage.w : v.W,
        t = sm(0.02, 0.45, p), u = sm(0.6, 0.9, p), q = sm(0.92, 1, p), f = M.cos(1.82 * u), l = S.stateOf("S09", 0, v).sheet, lo = L(1, l.opacity, q),
        A = {}, B = [], o = 0, b = p < 0.45 ? 18 : 6, i, out = 1 - sm(0.6, 0.7, p), e = (ph ? 6 : 60) * k,
        A0 = [n.x + (k * (d[0] + d[1])) / 2, n.y + k * d[2], 0, 0, (k * (d[0] - d[1])) / 2, (k * (d[1] - d[0])) / 2],
        A1 = [m.x + k * d[3], m.y + k * (d[4] + (ph ? 0.18 * M.max(0, 500 - v.stage.h / k) : 0)), 1 / (k * d[5]), -(4 + 1.2 * sm(0.45, 0.62, p)) / 57.3],
        A2 = [l.x + l.w / 2, l.y + 1, 0, 0, -l.w / 2, l.w / 2];
      A1.push(x - A1[0] - 60 * k, x + w - A1[0] + 60 * k);
      A0.forEach(function (a, i) { A["xycrlh"[i]] = L(L(a, A1[i], t), A2[i], u); });
      for (i = 5; i >= 0; i--) {
        var g = i ? sm(0.05 + 0.055 * i, 0.17 + 0.055 * i, p) : L(0.34, 1, sm(0, 0.14, p)), h = E[i].pct * d[6] * k * g, s = M.max(0, -f) * 4 * k * (ph ? 64 - 8 * i : 104 - 14 * i);
        B[i] = [o * f - s, (o + h) * f - s, g];
        o += h;
      }
      var lx = M.max(m.x + k * d[7], A.x + A.l + 8 * k) - A.x, x0 = M.max(A.x + A.l, x + e) - b, y0 = pt(A, o, 0)[1] - b, z = pt(A, (B[H][0] + B[H][1]) / 2, m.x + k * d[8] - A.x);
      return {
        sheet: null,
        pool: { x: A.x + A.l, y: A.y - o * M.max(f, 0) - 1, w: A.h - A.l, h: o * M.max(f, 0) + 2, tone: "neutral", opacity: lo },
        A: A, B: B, f: f, u: u, q: q, lo: lo, t: t, a0: A0, gc: 0.25 / (k * d[5]), tn: -32 * t, g: L(1, 0.3, t) * (1 - sm(0.6, 0.75, p)),
        br: p < 0.6 && [{ x: x0, y: y0, w: M.min(A.x + A.h, x + w - e) + b - x0, h: A.y + (ph ? 50 : 150) * k * t + b - y0 }, p < 0.2 ? "ACQUIRING · MAP PLANE" : p < 0.45 ? "ACQUIRING · STRATA" : "LOCKED · STRATA", p >= 0.45],
        lab: B.map(function (b) { var z = pt(A, (b[0] + b[1]) / 2, lx); return [(z[0] - m.x) / k, (z[1] - m.y) / k, z[2] * 57.3, sm(0.2, 0.4, b[2]) * (1 - sm(0, 0.3, u))]; }),
        ld: "M" + z[0] + " " + z[1] + "L" + (m.x + k * d[9]) + " " + (m.y + k * d[10]) + "H" + (m.x + k * d[11]),
        o: [out * (v.short ? 1 - sm(0.38, 0.45, p) : 1), sm(0.45, 0.52, p) * out, +(p >= 0.45) * (1 - sm(0.6, 0.68, p)), out, !v.short],
      };
    },

    render: function (st, api) {
      var ph = api.vp.phone;
      T.forEach(function (r) { api.set(r.e, "opacity", st.o[r[2]]); });
      api.fade(T[7].e, st.o[1]);
      R.forEach(function (e, i) {
        var z = st.lab[i];
        api.set(e, "transform", "translate(" + z[0].toFixed(1) + "px," + z[1].toFixed(1) + "px) rotate(" + z[2].toFixed(2) + "deg) translateY(-50%)");
        api.set(e, "opacity", z[3]);
      });
      api.lead(ld, st.ld);
      api.attr(ld, "opacity", st.o[2] * st.o[4]);
      if (st.br) api.brackets(st.br[0], { lock: st.br[2], label: !api.vp.short && st.br[1], len: ph ? 10 : 14, tagAt: "tl", clip: ph && api.vp.stage });
    },

    draw: function (g, st, api) {
      var v = api.vp, A = st.A, a0 = g.globalAlpha, b, i, z, x = M.min(2 * v.W, 0.98 / M.max(A.c, 1e-9)), gr = g.createLinearGradient(A.x, A.y - 400, A.x + 600, A.y);
      function al(x) { g.globalAlpha = a0 * x; }
      if (v.phone) { g.beginPath(); g.rect(v.stage.x, v.stage.y, v.stage.w, v.stage.h); g.clip(); }
      if (st.g > 0) {
        g.save();
        g.beginPath();
        edge(g, A, 900 * (1 - st.t), -x, x);
        z = pt(A, 0, x); g.lineTo(z[0], 9e3);
        z = pt(A, 0, -x); g.lineTo(z[0], 9e3);
        g.clip();
        g.translate(A.x, A.y); g.rotate(A.r); g.scale(1 - 0.3 * st.t, 1 - 0.55 * st.t); g.translate(-st.a0[0], -st.a0[1]);
        al(st.g);
        z = S.stateOf("S07", 1, v);
        z.io = 0;
        z.c[4] = z.tl.rz += st.tn;
        api.drawScene(g, "S07", z);
        g.restore();
      }
      gr.addColorStop(0, "#1B1D20"); gr.addColorStop(1, "#0D0E10");
      g.strokeStyle = W;
      for (i = 5; i >= 0; i--) {
        b = st.B[i];
        z = st.f > 0 ? A : { x: A.x, y: A.y, c: st.gc, r: A.r, l: A.l * (0.65 + 0.07 * i), h: A.h * (0.65 + 0.07 * i) };
        if (M.abs(b[1] - b[0]) < 0.2) continue;
        g.beginPath(); edge(g, z, b[1], z.l, z.h); edge(g, z, b[0], z.h, z.l, 1); g.closePath();
        if (st.f > 0) {
          al(1); g.fillStyle = gr; g.fill();
          al(0.012 + (5 - i) * 0.009); g.fillStyle = W; g.fill();
          al(1); g.strokeStyle = i === H ? "#E8362B" : "#8A9099"; g.lineWidth = i === H ? 2 : 1;
        } else { al(0.3 * (1 - st.q)); g.setLineDash([3, 5]); }
        g.stroke();
      }
      al(L(0.75, 0.62, st.u) * st.lo);
      g.setLineDash([]);
      g.lineWidth = L(1.25, 1.5, st.u);
      g.strokeStyle = W;
      g.beginPath(); edge(g, A, 0, A.l, A.h); g.stroke();
    },
  });
})();

/* S09 Gaza · REVERSE */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, cl = S.clamp, W = "#FFFFFF", F = "px 'Archivo Black', 'Arial Black', sans-serif";
  var Y0s = S.prose("2025", "machineData[0].sum"), Y0 = +Y0s, N = +S.prose("77", "destructionData[1].sum");
  var IN = 0.08, RUN = 0.75, R = 2.566, B = 1.3, MAX = 180;
  var yr, gh, kick, lead, un, src;

  function tr(x, y) { return "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)"; }
  function stops(gr, a, l) {
    l.forEach(function (s) { gr.addColorStop(s[0], "rgba(255,255,255," + (a * s[1]).toFixed(4) + ")"); });
    return gr;
  }
  function pool(g, x, y, rx, ry, a) {
    if (a < 1e-3) return;
    g.save();
    g.translate(x, y);
    g.scale(1, ry / rx);
    g.fillStyle = stops(g.createRadialGradient(0, 0, 0, 0, 0, rx), a, [[0, 1], [0.22, 0.78], [0.45, 0.42], [0.7, 0.14], [1, 0]]);
    g.fillRect(-rx, -rx, 2 * rx, 2 * rx);
    g.restore();
  }
  function ln(g, a, xa, ya, xb, yb, w) {
    if (a <= 0) return;
    g.globalAlpha = a;
    g.lineWidth = w || 1;
    g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke();
  }
  function para(api, parent, cls) {
    var el = api.el, p = el("p", cls, null, null, parent);
    var b = el("span", "s09-un", S.copy(" The UN estimates one war set human development in Gaza back ", "index.html:609-610"));
    el("b", null, [S.prose("77", "destructionData[1].sum"), S.copy(" years", "index.html:611")], null, b);
    el("span", null, [S.copy(" — to ", "index.html:611"), S.derived(String(Y0 - N), "1948 = 2025 − 77"), S.copy(", before almost anyone alive today was born.", "index.html:611-612")], null, b);
    return [el("span", "s09-lead", S.copy("Money can rebuild a building. It cannot rebuild time.", "index.html:609"), null, p), p.appendChild(b)];
  }

  Story.scene({
    id: "S09",
    order: 9,
    name: "Gaza",
    move: "REVERSE",
    screens: 1.5,
    restrained: true,
    chrome: false,
    file: "09",
    frames: [{ k: "in", p: 0.08 }, { k: "mid", p: 0.415 }, { k: "out", p: 0.8 }, { k: "fade", p: 0.93 }],
    plateP: 0.8,
    focusP: 0.8,
    alt: "One thin line across black. The year on it runs back from " + Y0s + " to " + (Y0 - N) + ": " + (Y0 - N) + " stands at its left end, " + Y0s + " faint at its right.",

    build: function (api) {
      var K = S.copy("GAZA · HUMAN DEVELOPMENT INDEX", "index.html:601"), U = S.copy("UN 2026", "index.html:617"), url = S.get("destructionData[1].url"), el = api.el, pl = api.plate;
      gh = el("div", "s09-yr s09-gh t-giant", Y0s, null, api.layer);
      yr = el("div", "s09-yr t-giant", Y0s, null, api.layer);
      kick = el("p", "s09-kick t-label", K, null, api.ui);
      var box = el("div", "s09-txt", null, null, api.ui), t = para(api, box, "s09-p t-body");
      lead = t[0]; un = t[1];
      src = api.link(url, U, null, box, "s09-src t-src");
      el("h2", "t-label", K, null, pl);
      para(api, pl);
      api.link(url, U, null, el("p", "t-src", null, null, pl), "tap");
    },

    state: function (p, vp) {
      var ph = vp.phone, k = vp.kt, b = vp.stage, m = ph ? 16 * k : vp.W / 12, x1 = vp.W - m, y = Math.round(ph ? b.y + (b.h * 288) / 500 : vp.H * (530 / 900)) + 0.5;
      var ys = Math.min((ph ? 132 : 340) * k, MAX), gs = ys * (ph ? 84 / 132 : 250 / 340);
      var run = cl((p - IN) / (RUN - IN), 0, 1), xm = x1 - run * (x1 - m);
      var on = sm(0, IN, p), keep = on * (1 - sm(0.86, 1, p)), x = cl(xm - B * ys, m - 0.105 * ys, x1 - R * ys);
      return {
        sheet: { x: m, y: y - 1, w: xm - m, h: 2, mode: "line", opacity: 1 - sm(0.9, 1, p) },
        ph: ph, k: k, x0: m, x1: x1, ly: y, ys: ys, gs: gs, xm: xm, keep: keep,
        yr: Y0 - Math.round(N * run),
        x: x, y: y - (ph ? 18 : 30) * k - 0.797 * ys, lx: x + B * ys,
        ghost: 0.22 * keep * sm(IN, 0.16, p),
        gx: x1 - R * gs, gy: y + (ph ? 16 : 28) * k - 0.085 * gs,
        lead: keep * (ph ? 1 - sm(0.7, 0.745, p) : 1),
        un: keep * sm(0.745, 0.79, p),
      };
    },

    render: function (st, api) {
      var set = api.set;
      api.text(yr, st.yr === Y0 ? Y0s : S.derived(String(st.yr), "year on the line"));
      set(yr, "transform", tr(st.x, st.y));
      set(yr, "opacity", st.keep);
      set(gh, "transform", tr(st.gx, st.gy));
      set(gh, "opacity", st.ghost);
      set(kick, "opacity", st.keep);
      set(lead, "opacity", st.lead);
      set(un, "opacity", st.un);
      api.fade(src, st.un);
    },

    draw: function (g, st) {
      var k = st.k, ph = st.ph, x0 = st.x0, x1 = st.x1, y = st.ly, xm = st.xm, kp = st.keep, pl = g.canvas.className == "plate-visual", d, x;
      if (!pl) pool(g, st.lx, y - (ph ? 110 : 230) * k, (ph ? 230 : 620) * k, (ph ? 260 : 480) * k, (ph ? 0.05 : 0.045) * kp);
      pool(g, st.lx, y + (ph ? 4 : 8) * k, (ph ? 230 : 640) * k, (ph ? 70 : 150) * k, (ph ? 0.11 : 0.1) * kp);
      g.strokeStyle = W;
      g.setLineDash([3, 5]);
      ln(g, 0.42 * st.sheet.opacity, x1, y, xm, y);
      g.setLineDash([]);
      for (d = Math.ceil((Y0 - N) / 10) * 10; d < Y0; d += 10) {
        x = x1 - ((Y0 - d) / N) * (x1 - x0);
        ln(g, (x > xm ? 0.14 : 0.3) * kp, x, y - (ph ? 4 : 5), x, y + (ph ? 4 : 5));
      }
      ln(g, 0.4 * kp, x0, y - 9, x0, y + 9);
      ln(g, 0.4 * kp, x1, y - 9, x1, y + 9);
      d = (ph ? 150 : 420) * k;
      g.strokeStyle = stops(g.createLinearGradient(xm - d, 0, xm + d, 0), 0.9, [[0, 0], [0.3, 0.45], [0.5, 1], [0.7, 0.45], [1, 0]]);
      ln(g, kp, Math.max(x0, xm - d), y, Math.min(x1, xm + d), y, 1.5);
      g.strokeStyle = W;
      ln(g, kp, xm, y - (ph ? 14 : 22), xm, y + (ph ? 14 : 22), 1.5);
      if (!pl) return;
      g.fillStyle = W;
      g.globalAlpha = kp;
      g.font = st.ys + F;
      x = String(st.yr);
      g.fillText(x, x0 + g.measureText(x).actualBoundingBoxLeft, y - (ph ? 18 : 30) * k);
      g.fillStyle = "#8A9099";
      g.globalAlpha = st.ghost;
      g.font = st.gs + F;
      d = g.measureText(Y0s);
      g.fillText(Y0s, x1 - d.actualBoundingBoxRight, y + (ph ? 16 : 28) * k + d.actualBoundingBoxAscent);
    },
  });
})();

/* S10 Displacement · SEPARATE */
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
      T.forEach(function (r, i) { if (r[1] && r[2] != "e") { var e = api.el(i ? "p" : "h2", r[0], r[1], null, api.plate); if (i == 9) api.plate.insertBefore(e, e.previousSibling); } });
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

/* S11 The Appeal · FILL */
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
      [K, [l33, " · ", f33, " ", a33], [l12, " · ", f12, " · ", u12], [l119, " · ", f119], N, T[12][1].concat(" · ", T[13][1], " · ", T[14][1])].forEach(function (t, i) { api.el(i ? "p" : "h2", null, t, null, api.plate); });
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
      if (st.f > 0) ln(g, a0 * 0.8 * (1 - st.f) * sm(0, 0.07, st.f), f.x - 6, f.x + f.w + 6, f.y);
      g.strokeStyle = grad(g.createLinearGradient(x - l[5], 0, x + l[5], 0), 0.7, [[0, 0], [0.3, 0.45], [0.5, 1], [0.7, 0.45], [1, 0]]);
      ln(g, a0 * li, L[0], L[1], Y);
    },
  });
})();

/* S12 The Human Impact · STILLNESS */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, C = S.copy, G = S.fig, E = {}, F, J;
  function at(v) { return { x: v.W * 2 / 3, y: v.H * (v.phone ? 0.29 : 1 / 3) }; }

  function field(v) {
    var ph = v.phone, W = v.W, H = v.H * (ph ? 0.79 : 1), q = ph || W * H < 5e5 ? 2 : 1, u = 1 / (ph ? 120 : 260) / v.k, o = at(v), a = 2447, n = 1, t = 0, key = W + "x" + v.H,
      cv = document.createElement("canvas"), w = (cv.width = Math.ceil(W * q)), g = cv.getContext("2d"), im = g.createImageData(w, (cv.height = Math.ceil(H * q))), d = im.data, N = S.get("DEATHS_PER_YEAR"), x, y, X, Y, c, i;
    function r() { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return (a >>> 0) / 4294967296; }
    new Uint32Array(d.buffer).fill(0xffffff);
    J = { k: key, run: function (m) {
      for (m += t; n < N && t < 2e7 && t < m; t++) {
        x = r() * W; y = r() * H; X = x / W; Y = y / v.H; i = 4 * ((y * q | 0) * w + (x * q | 0)) + 3;
        c = Math.sin(2.4 * x * u + 2 * Math.sin(1.7 * y * u)) + Math.sin(2.2 * y * u + 2 * Math.sin(1.9 * x * u));
        if (!d[i] && Math.hypot(x - o.x, y - o.y) > 10 && r() < (0.9 + 0.05 * c) * (ph ? sm(0.78, 0.52, Y + 0.1 - 0.1 * X)
          : sm(0.74, 0.3, Y - 0.42 * X) * sm(0.55, 1.3, Math.hypot(3.13 * X - 0.98, 5.45 * Y - 4.34))))
          d[i] = 20 + 220 * Math.pow(r(), 4.6) * (0.65 + 0.175 * c), n++;
      }
      if (n < N && t < 2e7) return;
      g.putImageData(im, 0, 0);
      F = { k: key, c: cv, q: q };
      J = 0;
    } };
  }
  function ready(v) { return F && F.k == v.W + "x" + v.H; }
  function job(v) { if (!J || J.k != v.W + "x" + v.H) field(v); return J; }

  S.scene({
    id: "S12", order: 12, name: "The Human Impact", move: "STILLNESS", screens: 2, restrained: true, chrome: false, file: "12",
    frames: [{ k: "in", p: 0.06 }, { k: "one", p: 0.2 }, { k: "fade", p: 0.36 }, { k: "field", p: 0.52 }, { k: "content", p: 0.74 }, { k: "out", p: 1 }],
    plateP: 0.52,
    alt: "A still field of faint points of light, one for each person killed in armed conflict in a year. One brighter point among them: one person.",

    build: function (api) {
      var el = api.el, pl = api.plate, L = "index.html:", M = "js/main.js:", s12 = el("div", "s12", null, null, api.ui), b, h, k;
      function grp(k) { return (E[k] = el("div", "s12-" + k, null, null, s12)); }
      function a(h, x, par) { api.link(h, x, null, par, "tap"); }
      b = grp("open");
      el("h2", "t-label", C("The Human Impact", L + 739), null, b);
      el("p", "s12-ol t-body", [C("Everything above can be counted in dollars.", L + 742), C(" What follows cannot.", L + 742)], null, b);
      el("p", "t-body", C("one person killed in armed conflict", L + 757), null, grp("one"));
      b = grp("field");
      el("p", "s12-v t-body", [G("DEATHS_PER_YEAR", "int"), " ", G("humanData[0].unit", "raw")], null, b);
      b = el("div", "s12-l", null, null, b);
      el("p", "t-label", [C("one every ", L + 761), G("SECONDS_PER_DEATH", "minsec")], null, b);
      h = el("p", "t-label", null, null, b);
      api.live("deaths", el("b", null, "0", "live", h));
      el("span", null, C(" since you opened this page", L + 763), null, h);
      a(S.get("humanData[0].url"), C("ACLED · Dec 2024 – Nov 2025", L + 765), el("p", "t-label", null, null, b));
      b = grp("content");
      h = function (i) { i = "humanData[" + i + "]."; return [[G(i + "num", "raw"), " ", G(i + "unit", "raw")], G(i + "src", "raw"), S.get(i + "url")]; };
      [
        [[C("Up to ", M + 301), G("humanImpactExtra.civilianShare", "pct"), C(" of those killed and wounded by explosive weapons in towns and cities are civilians, not combatants.", M + 301)], C("AOAV / UN", M + 302), "https://aoav.org.uk/explosiveviolence/", 1],
        [[G("humanImpactExtra.childrenPct", "pct"), C(" of the ", M + 309), G("displacedStats.displaced", "raw"), C(" million people displaced by war and persecution are children: about ", M + 309), G("humanImpactExtra.childrenDisplaced", "raw"), C(" million.", M + 309)], G("humanData[3].src", "raw"), S.get("humanData[3].url")],
        h(0), h(2), h(1), h(4),
      ].forEach(function (d) {
        var it = el("div", "s12-it", null, null, b);
        el("p", "t-body", d[0], null, it).children[d[3] || 0].className = "s12-b";
        a(d[2], d[1], el("p", "t-src", null, null, it));
      });
      el("p", "s12-cl t-body", C("Every number on this page was a person\nwho wanted to live.", L + 774), null, grp("close"));
      a("#haveyoursay", C("When you're ready", L + 781), grp("ready"));
      for (k in E) pl.appendChild(E[k].cloneNode(true)).setAttribute("data-p", { field: 0.52, content: 0.74 }[k] || 1);
      api.live("deaths", pl.querySelector("b"));
      pl.querySelector(".s12-it:nth-child(3)").remove();
    },

    layout: function (api) {
      S.debug.ready.then(function step() {
        var v = api.vp;
        if (S.debug.mode != "motion" || ready(v)) return;
        job(v).run(3e4);
        (window.requestIdleCallback || requestAnimationFrame)(step);
      });
    },

    state: function (p, v) {
      var out = 1 - sm(0.56, 0.62, p);
      return {
        sheet: null,
        open: sm(0, 0.05, p) * (1 - sm(0.1, 0.15, p)),
        point: sm(0.06, 0.12, p) * out,
        one: sm(0.15, 0.2, p) * (1 - sm(0.26, 0.31, p)),
        field: sm(0.3, 0.44, p) * out,
        content: sm(0.62, 0.67, p) * (1 - sm(0.8, 0.85, p)),
        close: sm(0.85, 0.9, p),
        ready: sm(0.89, 0.94, p),
      };
    },

    render: function (st, api) {
      for (var k in E) api.fade(E[k], st[k]);
    },

    draw: function (g, st, api) {
      var v = api.vp, o = at(v), px = g.getTransform().a, r = (v.phone ? 170 : 300) * v.k, b = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      if (st.field > 0) {
        if (!ready(v)) job(v).run(1 / 0);
        g.globalAlpha = st.field;
        g.imageSmoothingEnabled = px < F.q;
        g.drawImage(F.c, 0, 0, F.c.width / F.q, F.c.height / F.q);
      }
      b.addColorStop(0, "rgba(255,255,255,.085)");
      b.addColorStop(0.2, "rgba(255,255,255,.03)");
      b.addColorStop(0.7, "rgba(255,255,255,0)");
      g.globalAlpha = st.point;
      g.fillStyle = b;
      g.fillRect(o.x - r, o.y - r, 2 * r, 2 * r);
      g.fillStyle = g.shadowColor = "#FFFFFF";
      g.shadowBlur = (v.phone ? 7 : 14) * px;
      g.beginPath();
      g.arc(o.x, o.y, 5.5, 0, 7);
      g.fill();
    },
  });
})();

/* S13 The Handover */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, C = S.copy, ui, tz, tab, T,
    V = [[965, 146, 580, 16, -4, 1700, 214, 32], [195.5, 112, 316, 14, -3, 1100, 150, 26]];
  function poly(g, q) { g.beginPath(); q.forEach(function (p) { g.lineTo(p.x, p.y); }); g.closePath(); }
  function lit(gr, l) { l.forEach(function (s) { gr.addColorStop(s[0], "rgba(255,255,255," + s[1] + ")"); }); return gr; }

  S.scene({
    id: "S13", order: 13, name: "The Handover", move: "HAND OVER", screens: 0.5, chrome: false, file: "13",
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    alt: "One blank sheet of paper under a light from above. Its tab carries a small blue mark.",

    build: function (api) {
      var el = api.el, pl = api.plate, Q = C("What if we chose ", "index.html:792"), D = C("differently?", "index.html:792"), Y = C("Have your say", "index.html:791"),
        I = [C("Tap the causes you'd fund, ", "index.html:829"), C("in order of priority — your most urgent first", "index.html:829-830"), C(".", "index.html:830")];
      ui = el("div", "sb-box on-sheet", null, null, api.ui);
      tz = el("div", "sb-box on-sheet", null, null, api.ui);
      tab = el("div", "t-labelW on-sheet s13-t", Y, null, api.ui);
      T = [["t-title", Q, 0, [96, 548, 58], [16, 462, 31], [16, 574, 31]], ["t-title s13-b", D, 1, [96, 603.4, 106], [16, 492.5, 41], [16, 604.5, 41]],
        ["t-label", S.label("FIG. 13 · BLANK"), 2, [1208, 196, 10]], ["s13-r", "", 2, [1208, 230, 0, 28], [16, 592, 0, 24], [16, 656, 0, 24]],
        ["t-body s13-h", I, 2, [1208, 246, 19, 200], [16, 606, 15, 300], [16, 670, 15, 343]], ["t-labelW", "▾", 2, [1208, 386, 14], [16, 678, 14], [16, 742, 14]]];
      api.rows(T, ui);
      api.link("#haveyoursay", Y, null, el("p", "t-label", null, null, pl), "tap");
      el("h2", "s13-p", [Q, D], null, pl);
      el("p", null, I, null, pl);
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone;
      api.map(ui, S.sb(v, ph ? 0 : null));
      api.map(tz, S.sb(v, "t"));
      api.place(tab, [0, 0, ph ? 10 : 11]);
      T.forEach(function (r) {
        var a = r[v.short && r[5] ? 5 : ph ? 4 : 3];
        if (a) (ph && a[1] > 555 ? tz : ui).appendChild(r.e);
        api.place(r.e, a);
      });
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], m = S.sb(v, ph ? 0 : null), k = m.k, h = Math.min(d[2], ph ? v.stage.h / k - 84 : 1e3), w = Math.round(h / Math.SQRT2),
        o = sm(0.32, 0.62, p), x = m.x + k * (d[0] - w / 2), y = m.y + k * d[1], on = sm(0.8, 0.9, p),
        t = { rx: d[3] + 10 * (1 - o), ry: d[4], rz: -2.5, persp: k * d[5], ox: x + (k * w) / 2, oy: y + (k * (h - d[7])) / 2 };
      return {
        hold: { id: "S12", st: S.stateOf("S12", 1, v), opacity: 1 - sm(0, 0.26, p) },
        sheet: { x: x, y: y, w: k * w, h: k * h, tilt: t, mode: "paper", tone: "neutral", edge: 1, opacity: o },
        tab: { x: x, y: y - k * d[7], w: k * d[6], h: k * d[7], tilt: t, mode: "paper", tone: "neutral", edge: 1, shadow: false, opacity: on },
        m: m, k: k, on: on, tl: [d[0] - w / 2 + 28, d[1] - d[7] + (ph ? 7 : 9)], o: [+(p >= 0.66), +(p >= 0.74), sm(0.84, 0.94, p)],
      };
    },

    render: function (st, api) {
      T.forEach(function (r) { api.set(r.e, "opacity", st.o[r[2]]); });
      api.set(tab, "transform", S.cam.at(st.m, st.tl[0], st.tl[1], 1, st.sheet.tilt));
      api.set(tab, "opacity", st.on);
    },

    draw: function (g, st, api) {
      var s = st.sheet, t = st.tab, k = st.k, a0 = g.globalAlpha, a = a0 * s.opacity, q = S.cam.quad(s, s.tilt), x = s.x + s.w / 2, y = s.y + s.h + 40 * k, r = 1.1 * s.w,
        n = (api.vp.phone ? 5 : 7) * k;
      if (a <= 0) return;
      g.globalCompositeOperation = g.canvas.className == "plate-visual" ? "source-over" : "destination-over";
      g.globalAlpha = a * (0.55 + 0.45 * st.on);
      g.fillStyle = lit(g.createLinearGradient(0, 0, 0, y), [[0, 0.1], [0.7, 0.035], [1, 0]]);
      poly(g, [{ x: x - 60 * k, y: 0 }, { x: x + 60 * k, y: 0 }, { x: x + 0.85 * s.w, y: y }, { x: x - 0.85 * s.w, y: y }]);
      g.fill();
      g.save(); g.translate(x, y); g.scale(1, (46 * k) / r);
      g.fillStyle = lit(g.createRadialGradient(0, 0, 0, 0, 0, r), [[0, 0.06], [1, 0]]);
      g.fillRect(-r, -r, 2 * r, 2 * r);
      g.restore();
      g.globalCompositeOperation = "source-over";
      g.strokeStyle = "#FFFFFF";
      g.globalAlpha = a * (0.2 + 0.2 * st.on);
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, s.y - 80 * k);
      [q[1], q[2], q[3], st.on > 0 ? S.cam.quad(t, t.tilt)[0] : q[0]].forEach(function (p) {
        var dx = p.x - x, dy = p.y - s.y - s.h / 2, l = 16 / Math.hypot(dx, dy), u = p.x + dx * l, v = p.y + dy * l;
        g.moveTo(u - n, v); g.lineTo(u + n, v); g.moveTo(u, v - n); g.lineTo(u, v + n);
      });
      g.stroke();
      g.globalAlpha = a;
      g.fillStyle = lit(g.createLinearGradient(q[0].x, q[0].y, q[3].x, q[3].y), [[0, 0.2], [0.4, 0.05], [1, 0]]);
      poly(g, q); g.fill();
      g.globalAlpha = a * 0.75;
      g.beginPath(); g.moveTo(q[0].x, q[0].y); g.lineTo(q[1].x, q[1].y); g.stroke();
      g.globalAlpha = a0;
      api.drawSheet(g, t);
      g.globalAlpha = a0 * st.on;
      g.fillStyle = "#3C8FDE";
      poly(g, S.cam.quad({ x: t.x + 12 * k, y: t.y + t.h / 2 - 4 * k, w: 8 * k, h: 8 * k }, t.tilt));
      g.fill();
    },
  });
})();

/* BOOT */
(function () {
  "use strict";
  if (window.Story && window.Story.start) window.Story.start();
  else console.error("Story: engine.js did not load");
})();
