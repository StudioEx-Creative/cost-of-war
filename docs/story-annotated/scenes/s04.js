/* S04 The Sort · RE-RANK (storyboard/scenes/s04.js). Storyboard px (Story.sb). A bar's size is its $bn and never
   changes, only the order. Hover or tap a bar: the giant figure shows its detail (the plate holds them all). */
(function () {
  "use strict";
  var S = Story, F = S.fig, B = S.label, C = S.copy, L = S.lerp, sm = S.smooth, cam = S.cam, N = 10, GL = 0.25, SN = 0.6, FU = 0.85,
    A = [], G = [], BX = [], gl, gn, gs, hit, ld, hov = -1, last, i, OG = B(" OF GDP"), YY = S.newCopy(" YEAR ON YEAR", "detail label for topSpenders.change"),
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
    alt: "Ten bars, the ten largest military budgets, sized by dollars. Ranked by share of the economy, Ukraine moves from seventh to first; then the bars fuse into one steel plate.",

    build: function (api) {
      var el = api.el, pl = api.plate, Y = api.layer;
      api.rows(T, el("div", "sb-box on-sheet", null, null, api.ui));
      el("h2", "t-label", T[0][1], null, pl);
      el("p", null, T[2][1], null, pl);
      for (i = 0; i < N; i++) {
        BX.push(el("div", "sb-box on-sheet", null, null, Y));
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
      hit.addEventListener("pointermove", pick);
      hit.addEventListener("pointerdown", pick);
      hit.addEventListener("pointerleave", function (e) { if (e.pointerType == "mouse") { hov = -1; show(api); } });
    },

    layout: function (api) {
      var v = api.vp, ph = v.phone, b = V[+ph], m = { k: v.k, x: 0, y: 0, r: v.kt / v.k }, c = { k: v.kt, x: 0, y: 0 };
      api.map(T[0].e.parentNode, S.sb(v, ph ? "t" : 0));
      api.text(T[1].e, B(ph ? "LENGTH" : "HEIGHT"));
      api.text(T[3].e, [B("ORDER · "), S.newCopy(ph ? "TAP A BAR" : "HOVER A BAR", "the detail: hover (desktop), tap (phone)")].join(""), "newCopy");
      T.forEach(function (r) { api.place(r.e, r[ph ? 4 : 3]); });
      BX.forEach(function (e, i) {
        var s = e.q, h = (A[i].amt * b[3]) / A[0].amt;
        (ph ? s[0] : e).appendChild(s[3]);
        api.place(s[0], ph ? [h + 12, 17, 14] : [-26, -h - 36, 20, 114], m, c);
        api.place(s[1], ph ? [2, 1, 10] : [0, 14, 11]);
        api.place(s[2], ph ? [24, 1, 10] : [0, 30, 11, 92]);
        api.place(s[3], !ph && [0, 70, 13]);
      });
      api.place(gl, [0, 0, ph ? 10 : 12]);
      api.place(gn, [0, 0, ph ? 150 : 300]);
      api.place(gs, [0, 0, ph ? 10 : 12]);
    },

    state: function (p, v) {
      var ph = v.phone, m = S.sb(v), k = m.k, b = V[+ph], g = S.clamp((p - GL) / (SN - GL), 0, 1), sn = p >= SN, rid = g && !sn, fu = sm(FU, 1, p),
        e = Math.sin((Math.PI / 2) * g), dx = ph || p < GL ? 0 : sn ? 130 - 110 * sm(SN, FU, p) : 130 * e,
        t = ph ? { rx: L(8, 34, fu), ry: L(22, 4, fu), rz: L(-2, -4, fu) }
          : { rx: p < FU ? L(-11, -4, Math.min(1, p / 0.8)) : L(-4, 44, fu), ry: p < SN ? 6 + 8 * e : L(L(14, 3, sm(SN, 0.8, p)), 0, fu), rz: -4 * fu },
        bars = [], an = [], lab = [], pts = [], gh = [], R = [], ld = sn ? MV : g ? -1 : 0, red = sn || g ? MV : 0, j, M, z, Z;
      t.persp = b[5] * k; t.ox = m.x + k * b[6]; t.oy = m.y + k * b[7];
      function P(x, y) { return [m.x + k * x, m.y + k * y]; }
      function Q(r, a) { return { x: m.x + k * r.x, y: m.y + k * r.y, w: k * r.w, h: k * r.h, a: a }; }
      A.forEach(function (a, i) {
        var l = (a.amt * b[3]) / A[0].amt, sl = sn ? G.indexOf(i) : i, mv = i == MV && rid, r,
          o = ph ? { x: b[4], y: b[0] + i * b[2] + 20, w: l, h: b[1] } : { x: b[4] + i * b[2] + dx, y: b[0] - l, w: b[1], h: l };
        if (mv) sl = i * (1 - g);
        r = ph ? { x: b[4] + (mv ? 150 : 0), y: L(b[0] + sl * b[2] + 20, 166 + sl * 28, fu), w: l, h: L(b[1], 28, fu) }
          : { x: L(b[4] + sl * b[2], 410 + sl * b[1], fu) + dx, y: b[0] - l - (mv ? 150 * Math.min(1, g * 6) : 0), w: b[1], h: l };
        if (mv) for (j = 0; j < 5; j++) gh.push(Q({ x: L(o.x, r.x, j / 5), y: L(o.y, r.y, j / 5), w: r.w, h: r.h }, 0.15 + j / 7));
        if (sn && !fu && sl != i) gh.push(Q(o, 0.3));
        lab.push(P(r.x, ph ? r.y - 20 : r.y + l));
        R.push(r);
        r = pts[sl] = Object.assign(Q(r), { tilt: t, tone: i == red && fu < 0.5 ? "red" : "neutral", edge: i == red ? 2 : 1, tab: i == red && fu < 0.5, tabSize: (ph ? 5 : 8) * k, shadow: false, mv: mv, sl: sl });
        bars.push(r);
        j = cam.project(r.x + r.w / 2, r.y + r.h / 2, 0, t);
        z = cam.project(r.x + r.w / 2, r.y - 8 * k, 0, t);
        an.push([j.x, j.y, z.x, z.y]);
      });
      M = R[MV];
      Z = rid ? [M.x + (ph ? 70 + M.w : -10), M.y - (ph ? 12 : 128), (ph ? 34 / 150 : 0.28) * (1 + 0.4 * g)] : sn ? (ph ? [70, 602, 1] : [872, 214, 1]) : ph ? [14, 590, 0.75] : [700, 158, 0.79];
      z = ph && !rid ? S.sb(v, "t") : m;
      return {
        sheet: null, pool: Object.assign({}, bars[ld < 0 ? MV : ld], { tone: "neutral" }), bars: bars, gh: gh, an: an, lab: lab, k: k, m: [m.x, m.y], ph: ph, hp: (ph ? 22 : 49) * k,
        t: t, dx: dx, rd: sm(0.12, 0.28, p), g: rid, sn: sn, fu: fu,
        plate: fu > 0 && pts,
        z: [0, [0, 1, 2].map(function (j) { return [z.x + z.k * (Z[0] + (j && (ph ? 4 : 8))), z.y + z.k * (Z[1] - [0, ph ? 12 : 26, ph ? 26 : 46][j])]; }), Z[2] * v.kt, ph ? null : t],
        ld: !ph && ld >= 0 && [[R[ld].x + 31, R[ld].y - 8], [R[ld].x + 31, 150], [Z[0] - 18, 150]].map(function (q) { q = P(q[0], q[1]); q = cam.project(q[0], q[1], 0, t); return [q.x, q.y]; }),
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
        at(e, st.lab[i]);
        set(e, "opacity", st.bars[i].mv ? 0 : nf);
        set(e.q[3], "opacity", st.rd);
        api.text(e.q[1], n2(Math.round(st.bars[i].sl)));
      });
      at(gn, z[1][0], z[2], z[3]);
      at(gl, z[1][1], 0, z[3]);
      at(gs, z[1][2], 0, z[3]);
      [gn, gl].forEach(function (e) { set(e, "opacity", nf); });
      set(hit, "pointerEvents", st.g || st.fu ? "none" : "auto");
      show(api);
      api.brackets(st.br[0], { lock: st.br[2], label: !v.short && st.br[1], len: ph ? 10 : 14, tagAt: "tl", clip: v.short && v.stage });
    },

    draw: function (g, st, api) {
      var t = st.t, k = st.k, ph = st.ph, d = (ph ? 5 : 9) * k * (1 - st.fu), m = st.m, c = st.plate, i;
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
      st.gh.forEach(function (r) { pl(box(r), "rgba(255,255,255," + r.a + ")", 1, [3, 4]); });
      st.bars.slice().sort(function (a, b) { return a.mv - b.mv; }).forEach(function (r) {
        var x = r.x, y = r.y, w = r.w, h = r.h, e = d * 0.6;
        pl([x + w, y, x + w + d, y - e, x + w + d, y + h - e, x + w, y + h], "rgba(255,255,255,0.14)", 1, 0, "#0A0A0A");
        pl([x, y, x + d, y - e, x + w + d, y - e, x + w, y], "rgba(255,255,255,0.35)", 1, 0, "rgba(255,255,255,0.2)");
        api.drawSheet(g, r);
      });
      if (c) {
        c.forEach(function (r) { pl(box(r), "rgba(255,255,255," + st.fu + ")", 1.5); });
        pl(ph ? [c[0].x - 14 * k, c[4].y + c[4].h, c[0].x + 330 * k, c[4].y + c[4].h] : [c[4].x + c[4].w, c[3].y - 60 * k, c[4].x + c[4].w, c[0].y + c[0].h + 40 * k], "rgba(255,255,255," + 0.85 * st.fu + ")", 1.2, [8, 6]);
      }
    },
  });

  function show(api) {
    var st = last, i = st.g || st.fu ? -1 : hov, d = i >= 0, j = d ? i : st.sn || st.g ? MV : 0, u = st.sn || st.g, c = gl.children, s = gs.children;
    api.text(c[0], f(j, "name"));
    api.text(c[2], B(u ? "% OF GDP" : "$BN"));
    api.text(gn, u ? f(j, "gdp", "pct") : f(j, "amt", "B"));
    api.text(s[0], u ? f(j, "amt", "B") : f(j, "gdp", "pct"));
    api.text(s[1], u ? "" : OG);
    api.text(s[3], f(j, "change"));
    api.set(gs, "opacity", +d);
    i = st.ld && (d ? st.an[i][2] < st.ld[2][0] && [st.an[i].slice(2), [st.an[i][2], st.ld[2][1]], st.ld[2]] : st.ld);
    api.attr(ld, "opacity", i ? st.o[5] : 0);
    if (i) api.lead(ld, "M" + i.join("L"));
  }
})();
