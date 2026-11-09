/* S07 The Map · TRAVEL (storyboard/scenes/s07.js). S06's $21.8T sheet tips back into a map; the camera travels place
   to place, turning the plane; blocks lie on their places at true area; then it tilts up to the horizon. No brackets. */
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
      ["t-body", S.newCopy("These are mixed estimates: reconstruction needs, damage and economic loss.", "audit F12/F14: replaces the page's '$bn needed' (index.html:579); Yemen is economic loss, Sudan damage. Approve the wording"), 2, [120, 236, 19, 560], [16, 642, 15, 343]],
      ["s07-r", 0, 10, [768, 214, 0, 590], 0]];
  V.forEach(function (d) { d.K = d.k.concat(GEO.map(function (g, i) { return [g[0], g[1], d.s[0], d.s[1], i < 5 ? -14 - 14 * i : -82, d.s[2], d.s[3], d.s[4]]; }), [d.w]); });

  function amt(c) {
    var P = "conflictCosts[" + c + "].amtB", v = S.get(P), s = "$" + M.round(v) + "B";
    return s === S.FMT.B(v) ? F(P, "B") : S.derived(s, P + " (" + v + ") rounded as the live bars print it (main.js:229). Storyboard decision: keep " + s + " or print " + S.FMT.B(v));
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
        N.push(el("div", "t-label", nm, null, fl), el("div", "t-labelW s07-c", n, null, fl));
        I.push(el("div", "t-labelW", n, null, ins));
        E.push(api.leader());
      });
      T.forEach(function (r, i) {
        r.e = r[5] ? api.link(r[5], r[1], null, tz, r[0]) : el("div", r[0], r[1] || null, null, tz);
        if (i === 3) el("p", "t-label", [F("machineData[3].name"), " · ", F("machineData[3].amt")], null, pl);
        if (r[1] && r[2] < 9) r[5] ? api.link(r[5], r[1], null, el("p", "t-src", null, null, pl), "tap").setAttribute("data-p", T1[r[2] - 2] + .05) : el("p", i % 7 === 5 && "s07-pf", r[1], null, pl);
      });
      I.push(el("div", "t-labelW s07-k", B("FIG 07.1 · ROUTE"), null, ins), el("div", "t-labelW s07-k", B("FIG 07.1 · PLAN · TRUE AREA"), null, ins));
      el("p", "t-src", S.newCopy("Map: Natural Earth (public domain).", "phase 3 spec: credit the map in S07's plate"), null, pl);
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
      o[1] = sm(0, .04, p) * (1 - sm(.1, .14, p));
      o[0] = o[2] = ph ? o[1] + sm(.86, .94, p) : sm(0, .04, p);
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
        g: [x0 + d.g[0] * KX * c[2], y0 - d.g[1] * c[2], (d.g[2] * c[2]) / 100, .96 * (1 - t)],
        n: Z.map(function (z, i) {
          var l = z && (i > 4 || z[0] > R - 100 * kt), b = ph ? 70 : 90;
          return z ? [z[0] + (l ? -8 : 8) * kt, z[1] + ((ph ? [0, -12, 0, 0, 4, 0][i] : 0) - 7) * kt, fi * (1 - o[3 + i]) * (1 - e8) * win(z[0], w.x + (l ? b : 10) * kt, R - (l ? 10 : b) * kt) *
            win(z[1], M.max(w.y + (ph ? 30 : 140) * kt, P.hz + 8 * kt), Bt - (ph ? 20 : 70) * kt) * (ph || 1 - sm(.1, .14, p) * sm(m.x + 700 * k, m.x + 740 * k, z[0])), l,
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
      st.Z.forEach(function (q, i) { if (q && q[1] < w.y + w.h - (ph ? 8 : 64) * k) dot(q, i <= st.at, 5 * k); });
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
