/* S09 · Gaza · restrained (storyboard/scenes/s09.js): one hairline, one soft light, the year
   running back in whole years. Fades only. */
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
      el("p", "t-label", K, null, pl);
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
      api.text(yr, st.yr === Y0 ? Y0s : S.derived(String(st.yr), "year on the line = 2025 − round(77 × run), whole years"));
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
