/* S12 The Human Impact · restrained: fades only, no red */
(function () {
  "use strict";
  var S = Story, sm = S.smooth, C = S.copy, G = S.fig, E = {}, F;
  function at(v) { return { x: v.W * 2 / 3, y: v.H * (v.phone ? 0.29 : 1 / 3) }; }

  // DEATHS_PER_YEAR points (the held one too), each its own cell; ½ px where px are fewer than people
  function field(v) {
    var ph = v.phone, W = v.W, H = v.H * (ph ? 0.79 : 1), q = ph || W * H < 5e5 ? 2 : 1, u = 1 / (ph ? 120 : 260) / v.k, o = at(v), a = 2447, n = 1, t = 0,
      cv = document.createElement("canvas"), w = (cv.width = Math.ceil(W * q)), g = cv.getContext("2d"), im = g.createImageData(w, (cv.height = Math.ceil(H * q))), d = im.data, N = S.get("DEATHS_PER_YEAR"), x, y, X, Y, c, i;
    function r() { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return (a >>> 0) / 4294967296; }
    new Uint32Array(d.buffer).fill(0xffffff);
    while (n < N && t++ < 2e7) {
      x = r() * W; y = r() * H; X = x / W; Y = y / v.H; i = 4 * ((y * q | 0) * w + (x * q | 0)) + 3;
      c = Math.sin(2.4 * x * u + 2 * Math.sin(1.7 * y * u)) + Math.sin(2.2 * y * u + 2 * Math.sin(1.9 * x * u));
      if (!d[i] && Math.hypot(x - o.x, y - o.y) > 10 && r() < (0.9 + 0.05 * c) * (ph ? sm(0.78, 0.52, Y + 0.1 - 0.1 * X)
        : sm(0.74, 0.3, Y - 0.42 * X) * sm(0.55, 1.3, Math.hypot(3.13 * X - 0.98, 5.45 * Y - 4.34))))
        d[i] = 20 + 220 * Math.pow(r(), 4.6) * (0.65 + 0.175 * c), n++;
    }
    g.putImageData(im, 0, 0);
    F = { k: W + "x" + v.H, c: cv, q: q };
  }

  S.scene({
    id: "S12", order: 12, name: "The Human Impact", move: "STILLNESS", screens: 2, restrained: true, chrome: false, file: "12",
    // in 0.06: from S09's black · one 0.2 (storyboard .16): every fade ≥ 0.1 screen
    frames: [{ k: "in", p: 0.06 }, { k: "one", p: 0.2 }, { k: "fade", p: 0.36 }, { k: "field", p: 0.52 }, { k: "content", p: 0.74 }, { k: "out", p: 1 }],
    plateP: 0.52,
    alt: "A still field of faint points of light, one for each person killed in armed conflict in a year. One brighter point among them: one person.",

    build: function (api) {
      var el = api.el, pl = api.plate, L = "index.html:", M = "js/main.js:", s12 = el("div", "s12", null, null, api.ui), b, h, k;
      function grp(k) { return (E[k] = el("div", "s12-" + k, null, null, s12)); }
      function a(h, x, par) { api.link(h, x, null, par, "tap"); }
      b = grp("open");
      el("p", "t-label", C("The Human Impact", L + 739), null, b);
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
      // plate: the same words in reading order
      for (k in E) pl.appendChild(E[k].cloneNode(true)).setAttribute("data-p", { field: 0.52, content: 0.74 }[k] || 1);
      api.live("deaths", pl.querySelector("b"));
      pl.querySelector(".s12-it:nth-child(3)").remove(); // given just above
    },

    state: function (p, v) {
      var out = 1 - sm(0.56, 0.62, p);
      return {
        sheet: null, // the Sheet at its smallest: the one point (draw)
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
      for (var k in E) {
        api.set(E[k], "opacity", st[k]);
        api.set(E[k], "pointerEvents", st[k] > 0.5 ? "auto" : "none"); // links: taps once shown
      }
    },

    draw: function (g, st, api) {
      var v = api.vp, o = at(v), px = g.getTransform().a, r = (v.phone ? 170 : 300) * v.k, b = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      if (st.field > 0) {
        if (!F || F.k != v.W + "x" + v.H) field(v); // made once, while the point holds still
        g.globalAlpha = st.field;
        g.imageSmoothingEnabled = px < F.q;
        g.drawImage(F.c, 0, 0, F.c.width / F.q, F.c.height / F.q);
      }
      // bloom (open decision 5), then the point as the live site draws it
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
