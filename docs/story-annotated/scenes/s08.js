/* S08 The Air · ORBIT: S07's map drops away under its far edge, which bends into the curve of the earth; the
   shares rise off it as strata (thickness = share), then fold edge-on into S09's line */
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
      el("p", "t-label", TI, null, pl);
      E.forEach(function (e, i) {
        var t = [F(P + i + "].name"), F(P + i + "].pct", "pct")];
        R.push(el("div", "s08-n" + (i === H ? " h" : e.pct < 4 ? " s" : ""), t, null, ui));
        el("p", null, [t[0], " ", t[1]].concat(i === H ? HN.slice(1) : []), null, pl);
      });
      el("p", null, CA, null, pl);
      api.link(u, s, null, el("p", "t-src", null, null, pl), "tap");
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
        A: A, B: B, f: f, u: u, q: q, lo: lo, t: t, a0: A0, gc: 0.25 / (k * d[5]), g: L(1, 0.3, t) * (1 - sm(0.6, 0.75, p)),
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
        api.drawScene(g, "S07", S.stateOf("S07", 1, v));
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
