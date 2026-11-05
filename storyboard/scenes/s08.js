/* S08 · THE AIR · ORBIT · 1.0 screen
   The camera rises over the map's far edge (S07's horizon) and orbits
   above it. Emissions shares rise from the horizon as stacked bands
   (emittersCompare; the militaries' band is the one red mark). At the end
   everything falls away and the map turns edge-on: one thin line, which
   S09 uses as its time line.
   Main frames: the brief's stacked bands. Alt B: separate bars, each with
   its base labelled (the bases are mixed, see the decision flag). */
(function () {
  "use strict";

  var RAD = Math.PI / 180;
  var KX = Math.cos(32 * RAD);
  // S07's six places and its wide-shot camera, so the entry matches S07's exit exactly.
  var GEO = { Ukraine: [31.2, 48.4], Syria: [38.5, 35.0], Iraq: [43.7, 33.2], Gaza: [34.4, 31.45], Yemen: [47.6, 15.9], Sudan: [30.2, 15.6] };
  var ANCHOR = { Ukraine: "br", Syria: "bl", Iraq: "bl", Gaza: "bl", Yemen: "bl", Sudan: "bl" };
  // S07's wide-shot scale: $21.8T per frame, read from data.js (never typed).
  function fitWide() { return SB.get("machineData[3].amtB"); }
  // S09's time line (scenes/s09.js LINE). S08's exit must land exactly on it.
  var LINE = { desk: { y: 530, x0: 120, x1: 1320 }, phone: { y: 344, x0: 16, x1: 359 } };

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function sheetBounds(ph) {
    var ppd0 = ph ? 500 / 56 : 900 / 56;
    var halfLat = (ph ? 250 : 450) / ppd0, halfLon = (ph ? 171.5 : 720) / (ppd0 * KX);
    return { lon0: 39 - halfLon, lon1: 39 + halfLon, lat0: 32 - halfLat, lat1: 32 + halfLat };
  }
  // Tilted plane with an optional yaw (the orbit turns the map under the camera).
  function proj(cam, lon, lat) {
    var ax = (lon - cam.lon) * KX * cam.ppd, ay = -(lat - cam.lat) * cam.ppd;
    var yw = cam.yaw || 0;
    var dx = ax * Math.cos(yw) - ay * Math.sin(yw), dy = ax * Math.sin(yw) + ay * Math.cos(yw);
    var d = Math.max(cam.D * 0.08, cam.D - dy * Math.sin(cam.tilt));
    var f = cam.D / d;
    return { x: cam.sx + dx * f, y: cam.sy + dy * Math.cos(cam.tilt) * f, f: f };
  }
  function wideCam(c) {
    var st = c.stage;
    return c.phone
      ? { lon: 38.9, lat: 15.7, ppd: 19, tilt: 50 * RAD, sx: st.x + 171, sy: st.y + 444, D: 900 }
      : { lon: 39, lat: 15, ppd: 84, tilt: 64 * RAD, sx: 740, sy: 820, D: 1700 };
  }
  function clipOn(c, id, box) {
    c.svg('<defs><clipPath id="' + id + '"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs><g clip-path="url(#' + id + ')">');
  }
  function clipOff(c) { c.svg("</g>"); }

  // The map plane under the camera: paper, cross grid, far edge. Clipped to `box`.
  function plane(c, cam, box, o) {
    var S = SB.SVG, T = c.T, sb = sheetBounds(c.phone), n = 18, pts = [], k;
    o = o || {};
    clipOn(c, o.id || "s08plane", box);
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon0 + (sb.lon1 - sb.lon0) * k / n, sb.lat1));
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon1, sb.lat1 + (sb.lat0 - sb.lat1) * k / n));
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon1 + (sb.lon0 - sb.lon1) * k / n, sb.lat0));
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon0, sb.lat0 + (sb.lat1 - sb.lat0) * k / n));
    c.svg('<polygon points="' + pts.map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" ") + '" fill="' + T.sheet + '" opacity="' + (o.opacity != null ? o.opacity : 1) + '"/>');
    var g = "", lon, lat, a, b, ga = o.gridA || 0.1;
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) { a = proj(cam, lon, sb.lat0); b = proj(cam, lon, sb.lat1); g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + ga + ")" }); }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) { a = proj(cam, sb.lon0, lat); b = proj(cam, sb.lon1, lat); g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + ga + ")" }); }
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5)
      for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
        a = proj(cam, lon, lat);
        var t = Math.max(1.5, 3.5 * Math.min(1.3, a.f));
        g += S.path("M" + (a.x - t) + " " + a.y + " H" + (a.x + t) + " M" + a.x + " " + (a.y - t) + " V" + (a.y + t), { stroke: "rgba(255,255,255," + (ga * 2.2).toFixed(2) + ")" });
      }
    c.svg(g);
    clipOff(c);
  }

  // The ground under the orbiting camera, out to the horizon: a two-point perspective cross grid.
  // The grid's lines run to the two vanishing points the yaw sets on the horizon.
  function ground(c, cam, box, o) {
    var S = SB.SVG, T = c.T, th = cam.tilt, yw = cam.yaw, step = 10;
    o = o || {};
    var hy = cam.sy - cam.D * Math.cos(th) / Math.sin(th);
    var vpN = cam.sx + cam.D * Math.tan(yw) / Math.sin(th);
    var vpW = cam.sx - cam.D * Math.cos(yw) / (Math.sin(yw) * Math.sin(th));
    var ga = o.gridA || 0.07, g = "", k, P, s, top = hy + 10; // lines stop short of the horizon: no bright knot where they meet
    clipOn(c, o.id || "s08g", box);
    c.svg(S.rect(box.x, box.y, box.w, box.h, { fill: T.sheet }));
    var bot = box.y + box.h, lats = [], lons = [];
    for (k = -24; k <= 24; k++) {
      P = proj(cam, cam.lon + step * k, cam.lat - 4);
      if (P.f > 6 || P.y <= hy + 1) continue;
      lons.push(cam.lon + step * k);
      var s0 = (top - hy) / (P.y - hy), s1 = (bot - hy) / (P.y - hy);
      g += S.line(vpN + (P.x - vpN) * s0, top, vpN + (P.x - vpN) * s1, bot, { stroke: "rgba(255,255,255," + ga + ")" });
    }
    var lastY = 1e9;
    for (k = -2; k <= 200; k++) {
      P = proj(cam, cam.lon, cam.lat + step * k);
      if (P.f > 6 || P.y <= top || lastY - P.y < 9) continue;
      lastY = P.y;
      lats.push(cam.lat + step * k);
      var xR = box.x + box.w + 400;
      s = (xR - vpW) / (P.x - vpW);
      g += S.line(vpW, hy, xR, hy + (P.y - hy) * s, { stroke: "rgba(255,255,255," + ga + ")" });
    }
    // ticks where the two families cross, where the grid is still open enough to read
    lats.forEach(function (lat) {
      lons.forEach(function (lon) {
        var q = proj(cam, lon, lat);
        if (q.f > 6 || q.y < hy + 24 || q.x < box.x || q.x > box.x + box.w) return;
        var t = Math.max(1.5, 3.5 * Math.min(1.3, q.f));
        g += S.path("M" + (q.x - t) + " " + q.y + " H" + (q.x + t) + " M" + q.x + " " + (q.y - t) + " V" + (q.y + t), { stroke: "rgba(255,255,255," + (ga * 2.4).toFixed(2) + ")" });
      });
    });
    c.svg(g);
    clipOff(c);
    return hy;
  }

  // The six emitters, in the live page's order. hot = the militaries.
  function emitters(c) {
    return SB.get("emittersCompare").map(function (e, i) {
      var P = "emittersCompare[" + i + "]";
      return { i: i, pct: e.pct, hot: !!e.hot, value: c.fig(P + ".pct", "pct"), name: c.fig(P + ".name", "raw").toUpperCase() };
    });
  }
  function texts(c) {
    return {
      title: c.copy("If the world's militaries were a country · share of global CO₂", "index.html:586"),
      cap: c.copy("Approx. share of global emissions. Military estimate: SGR / CEOBS · national shares: Global Carbon Project.", "index.html:590-591"),
      src: c.fig("destructionData[3].src", "raw") + " ↗",
    };
  }
  function flags(c) {
    c.flag("copy", "index.html:586 calls the whole chart 'share of global CO₂', but the militaries' 5.5% is a share of all greenhouse-gas emissions (envFacts[0].lbl). A wording fix needs approval.");
    c.flag("data", "envFacts '4th' and '~0%' and their CEOBS links have no place in S08's data (audit F28). Keep them elsewhere or drop them: needs a decision.");
  }

  // Stacked bands rising from the horizon line y0, x0..x1, thickness ∝ share (k px per %). rise 0–1 per band.
  function bands(c, list, x0, x1, y0, k, rise) {
    var S = SB.SVG, y = y0, out = [];
    for (var j = list.length - 1; j >= 0; j--) {
      var e = list[j], h = e.pct * k * rise[j];
      if (h <= 0.5) { out[j] = null; continue; }
      y -= h;
      c.svg(S.sheet(x0, y, x1 - x0, h, { tone: e.hot ? "red" : "grey", mode: "edge", sw: e.hot ? 1.5 : 1 }));
      out[j] = { y: y, h: h };
    }
    return out;
  }

  SB.scene({
    order: 8,
    id: "S08",
    name: "The Air",
    move: "ORBIT",
    screens: 1.0,
    restrained: false,
    anchor: null,
    trigger: "End of S07, as the tilt reaches the horizon.",
    camera: "Orbit: the camera rises over the map's far edge and swings around above it (the grid below turns). The bands rise from the horizon. At the end the map turns edge-on to the camera: one thin line, settling exactly where S09's time line runs (desktop y 530, x 120–1320; phone y 344, x 16–359).",
    reason:
      "Rising off the ground into the air shows a cost the money totals leave out: what war puts into the atmosphere. When everything falls away to one thin line, the story drops money and shares for one measure, time, which S09 runs back along that same line.",
    frames: [
      { k: "in", p: 0, cap: "Entry: S07's horizon. As the camera starts to rise, the six blocks drop back and China's band begins to rise off the far edge." },
      { k: "mid", p: 0.5, cap: "The camera has orbited above the horizon; the grid below has turned. Six bands stand stacked, thickness = share. The militaries' band is the one red mark." },
      { k: "out", p: 1, cap: "Everything falls away (faint ghosts show the drop). The map turns edge-on: one thin line, in the exact place where S09's time line begins." },
    ],
    alts: [
      {
        k: "B",
        label: "Separate bars, bases labelled",
        frames: ["mid"],
        note: "Audit (reviewer finding): emittersCompare mixes national CO₂ shares (Global Carbon Project) with the militaries' share of all greenhouse gas (SGR / CEOBS), and military emissions already sit inside national totals. Stacking implies one shared whole. Here each bar stands alone on the horizon; the national bars share one base label, the militaries' bar stands apart with its own.",
      },
    ],

    draw: function (c) {
      var T = c.T, TX = c.TX, S = SB.SVG;
      var p = c.plate ? 0.5 : c.p;
      var ph = c.phone, st = c.stage;
      var x = texts(c), list = emitters(c);
      flags(c);
      if (c.alt === "B") return drawAltB(c, x, list);
      c.flag("decision", "Stacked bands (brief) imply one shared whole, but the bases are mixed: national shares are CO₂, the militaries' 5.5% is all greenhouse gas, and military emissions already sit inside national totals (audit). Alt B shows separate bars with labelled bases. Choose before phase 3.");

      if (p === 0) {
        // ── entry: S07's wide shot; blocks dropping back; China's band starting to rise
        var cam = wideCam(c), sb = sheetBounds(ph);
        var box = ph ? st : { x: 0, y: 0, w: c.W, h: c.H };
        plane(c, cam, box, { id: "s08in" });
        var e0 = proj(cam, sb.lon0, sb.lat1), e1 = proj(cam, sb.lon1, sb.lat1);
        if (ph) clipOn(c, "s08inB", st);
        Object.keys(GEO).forEach(function (name) {
          var arr = SB.get("conflictCosts"), i;
          for (i = 0; i < arr.length; i++) if (arr[i].name === name) break;
          var q = proj(cam, GEO[name][0], GEO[name][1]), bw = ph ? st.w : c.W, bh = ph ? st.h : c.H, an = ANCHOR[name];
          var r = c.rung("conflictCosts[" + i + "].amtB", fitWide(), { x: an[1] === "l" ? q.x : q.x - bw, y: q.y - bh, w: bw, h: bh }, an);
          c.svg(S.sheet(r.x, r.y + 6, r.w, r.h, { tone: "white", mode: "outline", sw: 1, opacity: 0.22, dash: "3 4" }));
        });
        var hy = e0.y;
        var x0 = ph ? st.x : 120, x1 = ph ? st.x + st.w : 1040, kk = ph ? 6.2 : 6;
        var rb = bands(c, list, x0, x1, hy, kk, [0.3, 0, 0, 0, 0, 0]);
        c.svg(S.line(e0.x, e0.y, e1.x, e1.y, { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.25 }));
        if (ph) clipOff(c);
        if (!ph) {
          c.div(120, 72, 760, x.title, TX.labelW + ";font-size:13px");
          c.div(x1 + 24, rb[0].y + rb[0].h / 2 - 10, 300, list[0].value + ' <span style="' + TX.label + ';font-size:11px">' + list[0].name + "</span>", TX.value + ";font-size:17px");
        } else {
          // the rising band is named inside it, as in the stacked frame
          var cyIn = rb[0].y + rb[0].h / 2;
          c.div(x0 + 8, cyIn - 7, 230, list[0].name, TX.label + ";font-size:10px;letter-spacing:0.08em");
          c.div(x1 - 72, cyIn - 8, 64, list[0].value, TX.value + ";font-size:14px;text-align:right");
          c.div(c.textBox.x, c.textBox.y, c.textBox.w, x.title, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white);
        }
        c.chrome();
        c.state({ form: "map plane + horizon (from S07); first band rising", x: Math.round(Math.max(0, e0.x)), y: Math.round(hy), w: ph ? st.w : c.W, h: 1, tone: "neutral; blocks fading", note: "horizon = the map's far edge, y " + Math.round(hy) + ". China's band 0.3 of the way up." });
        return;
      }

      if (p < 1) {
        // ── orbiting above the horizon; all six bands stacked
        var hy2 = ph ? st.y + 470 : LINE.desk.y; // desktop: the horizon already sits where S09's line will be
        var camO = ph
          ? { lon: 39, lat: 24, ppd: 15, tilt: 76 * RAD, yaw: 26 * RAD, sx: st.x + 171, sy: hy2 + 600 / Math.tan(76 * RAD), D: 600 }
          : { lon: 39, lat: 28, ppd: 34, tilt: 75 * RAD, yaw: 26 * RAD, sx: 720, sy: hy2 + 1200 / Math.tan(75 * RAD), D: 1200 };
        var pbox = ph ? { x: st.x, y: hy2, w: st.w, h: st.y + st.h - hy2 } : { x: 0, y: hy2, w: c.W, h: c.H - hy2 };
        ground(c, camO, pbox, { id: "s08mid", gridA: 0.08 });
        var X0 = ph ? st.x : 120, X1 = ph ? st.x + st.w : 1040, K = ph ? 6.2 : 6;
        var rr = bands(c, list, X0, X1, hy2, K, [1, 1, 1, 1, 1, 1]);
        c.svg(S.line(ph ? st.x : 0, hy2, ph ? st.x + st.w : c.W, hy2, { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.25 }));
        if (!ph) {
          c.div(120, 72, 900, x.title, TX.labelW + ";font-size:13px");
          list.forEach(function (e, j) {
            var r = rr[j], cy = r.y + r.h / 2;
            c.svg(S.line(X1, cy, X1 + 18, cy, { stroke: "rgba(255,255,255,0.4)" }));
            c.div(X1 + 26, cy - 10, 340, e.value + ' <span style="' + TX.label + ";font-size:11px;color:" + (e.hot ? T.white : T.grey) + '">' + e.name + "</span>", TX.value + ";font-size:17px");
          });
          c.div(120, hy2 + 40, 760, x.cap, TX.bodySm + ";font-size:15px");
          c.div(120, hy2 + 92, 600, x.src, TX.src);
        } else {
          list.forEach(function (e, j) {
            var r = rr[j], cy = r.y + r.h / 2;
            c.div(X0 + 8, cy - 7, 230, e.name, TX.label + ";font-size:10px;letter-spacing:0.08em;color:" + (e.hot ? T.white : T.grey));
            c.div(X1 - 72, cy - 8, 64, e.value, TX.value + ";font-size:14px;text-align:right");
          });
          var tb = c.textBox;
          c.div(tb.x, tb.y, tb.w, x.title, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white);
          c.div(tb.x, tb.y + 64, tb.w, x.cap, TX.bodySm + ";font-size:14px;line-height:1.4");
          c.div(tb.x, tb.y + 128, tb.w, x.src, TX.src + ";font-size:10px");
        }
        c.chrome();
        c.state({ form: "stacked bands above the horizon", x: X0, y: Math.round(rr[0].y), w: X1 - X0, h: Math.round(hy2 - rr[0].y), tone: "neutral bands; militaries' band red edge", note: "horizon at y " + hy2 + "; band thickness " + K + " px per %. Map below turned 26° by the orbit." });
        return;
      }

      // ── out: everything falls away; one thin line, exactly where S09's time line runs
      var L = ph ? LINE.phone : LINE.desk;
      // faint dashed ghosts of the six bands, in their stacked order, dropped below the line,
      // flattened and drawing apart as they fall (no red: the militaries' band has gone grey too)
      var gy = L.y + (ph ? 22 : 30), gw = (L.x1 - L.x0) * (ph ? 1 : 0.77);
      list.forEach(function (e, j) {
        var inset = (ph ? 3 : 6) * j, h = Math.max(2, e.pct * (ph ? 6.2 : 6) * 0.25);
        c.svg(S.rect(L.x0 + inset, gy, gw - inset * 2, h, { fill: "none", stroke: "rgba(255,255,255," + (0.26 - j * 0.03).toFixed(3) + ")", "stroke-dasharray": "3 5" }));
        gy += h + (ph ? 10 : 14) + j * (ph ? 3 : 4);
      });
      c.svg(S.line(L.x0, L.y, L.x1, L.y, { stroke: T.white, "stroke-width": 1.5, opacity: 0.78 }));
      c.state({
        form: "one thin line (the map edge-on)",
        x: L.x0, y: L.y, w: L.x1 - L.x0, h: 1.5, tone: "white, 0.78",
        note: "lands exactly on S09's time line (" + (ph ? "phone" : "desktop") + ": y " + L.y + ", x " + L.x0 + "–" + L.x1 + "; scenes/s09.js LINE). Faint dashed ghosts below show the bands falling away.",
      });
      c.chrome();
    },

    // No-motion plate: the stacked bands at rest, every share, the caption and the source.
    plate: function (c) {
      this.draw(c);
    },
  });

  // ── ALT B: separate bars standing on the horizon, each base labelled ──
  function drawAltB(c, x, list) {
    var T = c.T, TX = c.TX, S = SB.SVG, ph = c.phone, st = c.stage;
    c.flag("decision", "Alt B: separate bars, not stacked. National bars carry 'share of global CO₂ · Global Carbon Project'; the militaries' bar stands apart with 'of all global greenhouse-gas emissions · SGR / CEOBS'. Same figures; no new comparison.");
    var co2 = c.copy("share of global CO₂", "index.html:586");
    var gcp = c.copy("national shares: Global Carbon Project", "index.html:591");
    var ghg = c.copy("of all global greenhouse-gas emissions", "js/data.js:589 (envFacts[0].lbl)");
    var mil = list.filter(function (e) { return e.hot; })[0];
    var nat = list.filter(function (e) { return !e.hot; });
    if (!ph) {
      var hy = LINE.desk.y, K = 10; // px per %; horizon where S09's line will run
      ground(c, { lon: 39, lat: 28, ppd: 34, tilt: 75 * RAD, yaw: 26 * RAD, sx: 720, sy: hy + 1200 / Math.tan(75 * RAD), D: 1200 }, { x: 0, y: hy, w: c.W, h: c.H - hy }, { id: "s08B", gridA: 0.07 });
      c.svg(S.line(0, hy, c.W, hy, { stroke: "rgba(255,255,255,0.35)" }));
      c.div(120, 72, 900, x.title, TX.labelW + ";font-size:13px");
      var bw = 104, gap = 40, x0 = 120;
      nat.forEach(function (e, j) {
        var bx = x0 + j * (bw + gap), h = e.pct * K;
        c.svg(S.sheet(bx, hy - h, bw, h, { tone: "grey", mode: "edge", sw: 1 }));
        c.div(bx, hy - h - 30, bw + 30, e.value, TX.value + ";font-size:20px");
        c.div(bx, hy + 12, bw + 30, e.name, TX.label + ";font-size:11px;letter-spacing:0.08em");
      });
      var gx1 = x0 + nat.length * (bw + gap) - gap;
      c.svg(S.line(x0, hy + 52, gx1, hy + 52, { stroke: "rgba(255,255,255,0.5)" }));
      c.div(x0, hy + 62, gx1 - x0, co2.toUpperCase() + " · " + gcp.toUpperCase(), TX.labelW + ";font-size:11px");
      // the militaries' bar, apart, with its own base
      var mx = gx1 + 150, mh = mil.pct * K;
      c.svg(S.sheet(mx, hy - mh, bw, mh, { tone: "red", mode: "edge", sw: 1.5 }));
      c.div(mx, hy - mh - 30, bw + 30, mil.value, TX.value + ";font-size:20px");
      c.div(mx, hy + 12, 260, mil.name, TX.labelW + ";font-size:11px;letter-spacing:0.08em");
      c.svg(S.line(mx, hy + 52, mx + 300, hy + 52, { stroke: "rgba(255,255,255,0.5)" }));
      c.div(mx, hy + 62, 330, ghg.toUpperCase() + " · " + c.fig("envFacts[0].src", "raw"), TX.labelW + ";font-size:11px");
      c.div(120, hy + 150, 760, x.cap, TX.bodySm + ";font-size:15px");
      c.div(120, hy + 200, 600, x.src, TX.src);
      // the locked box takes in the bars and the values above them, so its tag clears the tallest value
      var topY = Math.round(hy - nat[0].pct * K - 36);
      c.state({ form: "separate bars on the horizon", x: x0, y: topY, w: mx + bw - x0, h: hy - topY, tone: "neutral bars; militaries' bar red edge", note: "bar height " + K + " px per %. Two bases, two base lines; the militaries' bar stands apart." });
    } else {
      var tb = c.textBox, Kp = 8.6; // px per %, horizontal bars
      var y0 = st.y + 34, y = y0; // room above for the frame's lock tag
      c.div(st.x, y, st.w, co2.toUpperCase(), TX.labelW + ";font-size:10px");
      c.div(st.x, y + 16, st.w, gcp.toUpperCase(), TX.label + ";font-size:10px");
      y += 46;
      nat.forEach(function (e) {
        c.div(st.x, y, 200, e.name, TX.label + ";font-size:10px;letter-spacing:0.08em");
        c.svg(S.sheet(st.x, y + 16, e.pct * Kp, 18, { tone: "grey", mode: "edge", sw: 1 }));
        c.div(st.x + e.pct * Kp + 8, y + 16, 80, e.value, TX.value + ";font-size:15px");
        y += 50;
      });
      y += 18;
      c.svg(S.line(st.x, y - 10, st.x + st.w, y - 10, { stroke: "rgba(255,255,255,0.35)" }));
      c.div(st.x, y, st.w, ghg.toUpperCase(), TX.labelW + ";font-size:10px");
      c.div(st.x, y + 30, st.w, c.fig("envFacts[0].src", "raw"), TX.label + ";font-size:10px");
      y += 58;
      c.div(st.x, y, 240, mil.name, TX.labelW + ";font-size:10px;letter-spacing:0.08em");
      c.svg(S.sheet(st.x, y + 16, mil.pct * Kp, 18, { tone: "red", mode: "edge", sw: 1.5 }));
      c.div(st.x + mil.pct * Kp + 8, y + 16, 80, mil.value, TX.value + ";font-size:15px");
      c.div(tb.x, tb.y, tb.w, x.title, TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white);
      c.div(tb.x, tb.y + 64, tb.w, x.cap, TX.bodySm + ";font-size:14px;line-height:1.4");
      c.div(tb.x, tb.y + 128, tb.w, x.src, TX.src + ";font-size:10px");
      c.state({ form: "separate bars, bases labelled", x: st.x, y: y0, w: st.w, h: y + 34 - y0, tone: "neutral bars; militaries' bar red edge", note: "phone: horizontal bars, " + Kp + " px per %. Two groups, each under its own base label." });
    }
    c.chrome();
  }
})();
