/* S01 The Line · PUSH (storyboard/scenes/s01.js). The year's budget line, the total on it; the
   camera pushes and the rule thickens into the Sheet at full frame. Storyboard px (Story.sb). */
(function () {
  "use strict";
  var S = Story, L = S.lerp, sm = S.smooth, C = S.copy, B = S.label, F = S.fig, ui, cw, big, tag, lab, rule, src, link, intro, ld;
  var DEF = F("DEFENCE", "T"), PCT = F("globalContext.milPctGDP", "pct"), Y = S.prose("2025", "machineData[0].sum"), NAME = [F("machineData[0].name"), " · ", Y],
    CH = C("Chapter 01 · The Machine", "index.html:177"), TI = C("What we spend on war", "index.html:178"), US = [B("01"), " ", F("topSpenders[0].name"), " ", F("topSpenders[0].amt", "B")],
    EU = [B("02"), " ", B("Europe"), " ", "+", S.prose("14%", "machineData[0].detail")],
    IN = [Y, C(" was the eleventh straight record year. The world now spends ", "index.html:180"), PCT, C(" of everything it produces on its militaries, the highest share since ", "index.html:180-181"), S.prose("2009", "machineData[0].sum"), "."];
  // desktop | phone: line y, overhang, ry, perspective, centre, stage, total [x line, band, sheet · px · scale band, sheet], label [x0 x1 dy0 dy1], baseline share
  // phone: the total moves in by p .2, so only the sheet's edge cuts the T (a deep cut reads as 1 or 7)
  var V = [
    { y: 560, o: 520, ry: -22, pe: 1300, c: [720, 450], st: [0, 0, 1440, 900], b: [468, 468, 78, 260, 1, 400 / 260], l: [96, 96, -40, 144], f: 0.5 },
    { y: 386, o: 260, ry: -26, pe: 760, c: [187.5, 406], st: [16, 56, 343, 500], b: [58, 28, 24, 96, 90 / 96, 98 / 96], l: [18, 34, 10, 26], f: 0.7 },
  ];
  // flat: [class, text, group (heading, intro, end), desktop, phone]
  var U = [
    ["t-labelW", CH, 0, [96, 84, 12], [16, 572, 11]],
    ["t-title", TI, 0, [96, 110, 56, 560], [16, 596, 32, 343]],
    ["t-body", IN, 1, [96, 712, 19, 620], [16, 572, 16, 343]],
    ["t-value s01-g", [PCT, " ", C("of everything it produces", "index.html:180-181")], 2, [96, 506, 24], [34, 228, 15]],
    ["t-labelW", US[0], 2, [1030, 595, 12], [76, 335, 10]],
    ["t-label", US[2], 2, [1070, 595, 12], [104, 335, 10]],
    ["t-value", US[4], 2, [1068, 618, 52], [102, 354, 40]],
    ["t-labelW", EU[0], 2, [1030, 695, 12], [76, 429, 10]],
    ["t-label", EU[2], 2, [1070, 695, 12], [104, 429, 10]],
    ["t-value", EU.slice(4), 2, [1068, 718, 52], [102, 448, 40]],
  ];

  S.scene({
    id: "S01", order: 1, name: "The Line", move: "PUSH", screens: 1.0,
    file: "01",
    anchors: ["machine"], // live site: #machine opens Chapter 01
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    plateVisual: false,
    alt: "A red budget line crosses the frame at an angle, then thickens into a sheet that fills the screen: one year of world military spending.",

    build: function (api) {
      var el = api.el, pl = api.plate, url = S.get("machineData[0].url"), lk = B("SIPRI 2026");
      ui = el("div", "s01 on-sheet", null, null, api.ui);
      cw = el("div", "s01-w", null, null, api.layer);
      big = el("div", "s01-b t-giant on-sheet", DEF, null, cw);
      tag = el("div", "s01 on-sheet", null, null, api.layer);
      lab = el("div", "t-labelW", NAME, null, tag);
      rule = el("div", "s01-r", null, null, tag);
      src = el("div", "t-src", B("SIPRI 2026"), null, tag);
      U.forEach(function (r) { r.e = el("div", r[0], r[1], null, ui); });
      link = api.link(url, lk, null, ui, "t-src s01-a");
      U.push(["", 0, 2, [1030, 790, 11], [76, 518, 10]]);
      U[10].e = link;
      intro = U[2].e;
      ld = api.svgEl("g", { stroke: "rgba(255,255,255,.55)", fill: "none" }, api.svg);
      ld.p = api.svgEl("path", {}, ld);
      ld.r = api.svgEl("rect", { width: 5, height: 5, fill: "#FFFFFF", stroke: "none" }, ld);
      // reading order
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
      var v = api.vp, ph = v.phone, m = S.sb(v);
      api.set(ui, "transform", m.t);
      api.attr(ld, "transform", "translate(" + m.x + " " + m.y + ") scale(" + m.k + ")");
      api.attr(ld.p, "d", ph ? "M336 212V270L56 306V436M56 342h14M56 436h14M329 538h12v-12" : "M1046 470V540L1000 580V704M1000 604h22M1000 704h22");
      api.attr(ld.r, "x", ph ? 333.5 : 1043.5);
      api.attr(ld.r, "y", ph ? 209.5 : 467.5);
      api.place(big, [0, 0, V[+ph].b[3]]);
      api.place(lab, [0, 0, ph ? 11 : 14]);
      api.place(rule, [0, ph ? -10 : -12, 0, ph ? 309 : 604]);
      api.place(src, [0, ph ? 36 : 56, ph ? 11 : 13]);
      U.forEach(function (r) { api.place(r.e, r[ph ? 4 : 3]); });
    },

    state: function (p, v) {
      var ph = v.phone, d = V[+ph], m = S.sb(v), k = m.k, st = d.st,
        // the band is the Sheet by p 0.85
        g = Math.pow(S.clamp((p - 0.15) / 0.7, 0, 1), 1.6), g2 = g * g, e = 1 - Math.pow(Math.min(1, p / 0.85), 0.9),
        o = d.o * (1 - g), h = 2 + (st[3] - 2) * g, y = d.y - (d.y - st[1]) * g,
        t = e > 0 ? { rx: 14 * e, ry: d.ry * e, rz: -3 * e, persp: d.pe * k, ox: m.x + k * d.c[0], oy: m.y + k * d.c[1] } : null,
        sh = { x: m.x + k * (st[0] - o), y: m.y + k * y, w: k * (st[2] + 2 * o), h: k * h, mode: h > 3 ? "paper" : "line", tone: "red", edge: 2, tab: h > 3, tabSize: ph ? 8 : 12, tilt: t },
        b = S.cam.bbox({ x: m.x + k * st[0], y: sh.y, w: k * st[2], h: sh.h }, t), x0 = Math.max(b.x, 64), y0 = Math.max(b.y, 72), n = p < 0.5 ? 18 : 6,
        vb = { x: x0, y: y0, w: Math.min(b.x + b.w, v.W - 64) - x0, h: Math.min(b.y + b.h, v.H - 72) - y0, tone: "red" },
        a = ph ? sm(0, 0.2, p) : 0, bs = L(L(1, d.b[4], a), d.b[5], g2);
      return {
        sheet: sh, t: t, m: [m.x, m.y, k],
        pool: vb, // the light: the part in frame
        cx: Math.round(Math.min(0, m.x + k * (st[0] + st[2] + o) - v.W) * 100) / 100, // clip: the band's right edge (≤ 0: the box only moves left)
        big: [L(L(d.b[0], d.b[1], a), d.b[2], g2), y + h * (1 - d.f * g) - 6 - 0.797 * d.b[3] * bs, bs],
        tag: [L(d.l[0], d.l[1], g), y + d.l[2] + d.l[3] * g],
        o: [1 - sm(ph ? 0.3 : 0.8, ph ? 0.37 : 0.9, p), sm(ph ? 0.4 : 0.38, ph ? 0.47 : 0.5, p), sm(0.86, 0.94, p), ph ? 1 - sm(0.12, 0.2, p) : 1 - sm(0, 0.3, g), ph ? sm(0.86, 0.94, p) : sm(0.2, 0.6, g),
          ph ? 1 - sm(0.12, 0.2, p) + sm(0.5, 0.58, p) : L(1, 0.62, g)], // phone: away while the total crosses the edge
        iy: ph ? 0 : -60 * sm(0.8, 0.92, p),
        // tracking box on the part across the frame; none once the Sheet fills it
        br: b.w >= 0.9 * k * st[2] && b.h >= 0.9 * k * st[3] ? null
          : [{ x: x0 - n, y: y0 - n, w: vb.w + 2 * n, h: vb.h + 2 * n }, (p < 0.5 ? "ACQUIRING · " : "LOCKED · ") + (h > 3 ? "BAND" : "LINE"), p >= 0.5],
      };
    },

    render: function (st, api) {
      var m = st.m, o = st.o, b = st.br;
      function M(e, a, x) { api.set(e, "transform", (x || "") + S.cam.matrix3d({ x: m[0] + m[2] * a[0], y: m[1] + m[2] * a[1], w: 1, h: 1 }, st.t, { s: m[2] * (a[2] || 1) })); }
      api.set(cw, "transform", "translateX(" + st.cx + "px)");
      M(big, st.big, "translateX(" + -st.cx + "px) ");
      M(tag, st.tag);
      api.set(src, "opacity", o[3]);
      api.set(rule, "opacity", o[4]);
      api.set(lab, "opacity", o[5]);
      U.forEach(function (r) { api.set(r.e, "opacity", o[r[2]]); });
      api.set(intro, "transform", "translateY(" + st.iy + "px)");
      api.set(link, "pointerEvents", o[2] > 0.5 ? "auto" : "none");
      api.attr(ld, "opacity", o[2]);
      if (b) api.brackets(b[0], { lock: b[2], label: b[1], len: api.vp.phone ? 10 : 14, tagAt: "tl" });
    },
  });
})();
