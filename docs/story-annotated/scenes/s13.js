/* S13 The Handover: S12's words fade to black; one blank sheet settles under a light (no figure: its size means
   no money); the title lands in two cuts, then the tab and the hint. #haveyoursay follows (phase 4: the tools) */
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
      el("p", "s13-p", [Q, D], null, pl);
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
