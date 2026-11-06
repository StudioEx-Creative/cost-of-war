/* S08 · THE AIR · ORBIT · 1.0 screen
   The camera rises over the map's far edge (S07's horizon) and orbits above
   it. Seen from that height the horizon bends into the curve of the earth,
   and emissions shares rise off it as strata, layers of sky, each as thick
   as its share (emittersCompare; the militaries' layer is the one red mark),
   each named along its own curve. At the end everything falls away and the
   map turns edge-on: one thin line, which S09 uses as its time line.
   Main frames: the brief's stacked bands. Alt B: separate bars standing on
   the curve, each with its base labelled (the bases are mixed, see the
   decision flag). */
(function () {
  "use strict";

  var RAD = Math.PI / 180;
  var KX = Math.cos(32 * RAD);
  // S07's six places, anchors and wide-shot camera, so the entry matches S07's exit exactly.
  var GEO = { Ukraine: [31.2, 48.4], Syria: [38.5, 35.0], Iraq: [43.7, 33.2], Gaza: [34.4, 31.45], Yemen: [47.6, 15.9], Sudan: [30.2, 15.6] };
  var ANCHOR = { Ukraine: "c", Syria: "bl", Iraq: "tl", Gaza: "tr", Yemen: "c", Sudan: "c" };
  // S07's wide-shot scale: $21.8T per frame, read from data.js (never typed).
  function fitWide() { return SB.get("machineData[3].amtB"); }
  // S09's time line (scenes/s09.js LINE). S08's exit must land exactly on it.
  var LINE = { desk: { y: 530, x0: 120, x1: 1320 }, phone: { y: 344, x0: 16, x1: 359 } };

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function pts(a) { return a.map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" "); }
  function sheetBounds(ph) {
    var ppd0 = ph ? 500 / 56 : 900 / 56;
    var halfLat = (ph ? 250 : 450) / ppd0, halfLon = (ph ? 171.5 : 720) / (ppd0 * KX);
    return { ppd0: ppd0, lon0: 39 - halfLon, lon1: 39 + halfLon, lat0: 32 - halfLat, lat1: 32 + halfLat };
  }
  // The camera over the plane (the same model as scenes/s07.js): focus, scale, tilt, the plane's turn, distance.
  function Cam(cam) {
    var ct = Math.cos(cam.tilt), stl = Math.max(1e-4, Math.sin(cam.tilt)), cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var dyMax = (cam.D * 0.86) / stl;
    function plane(lon, lat) { var ax = (lon - cam.lon) * KX * cam.ppd, ay = -(lat - cam.lat) * cam.ppd; return { dx: ax * cy - ay * sy, dy: ax * sy + ay * cy }; }
    function scr(q) { var f = cam.D / (cam.D - q.dy * stl); return { x: cam.sx + q.dx * f, y: cam.sy + q.dy * ct * f, f: f }; }
    function cut(a, b) { var t = (dyMax - a.dy) / (b.dy - a.dy); return { dx: a.dx + (b.dx - a.dx) * t, dy: dyMax }; }
    return {
      horizon: cam.sy - (cam.D * ct) / stl,
      pt: function (lon, lat) { var q = plane(lon, lat); if (q.dy > dyMax) q.dy = dyMax; return scr(q); },
      line: function (a, b) {
        var A = plane(a[0], a[1]), B = plane(b[0], b[1]);
        if (A.dy > dyMax && B.dy > dyMax) return null;
        if (A.dy > dyMax) A = cut(B, A); else if (B.dy > dyMax) B = cut(A, B);
        return [scr(A), scr(B)];
      },
      poly: function (P) {
        var Q = P.map(function (p) { return plane(p[0], p[1]); }), out = [];
        for (var i = 0; i < Q.length; i++) {
          var a = Q[i], b = Q[(i + 1) % Q.length], ina = a.dy <= dyMax, inb = b.dy <= dyMax;
          if (ina) out.push(a);
          if (ina !== inb) out.push(cut(a, b));
        }
        return out.map(scr);
      },
    };
  }
  // S07's wide shot (scenes/s07.js wideCam).
  function wideCam(c) {
    var ph = c.phone, st = c.stage;
    return ph
      ? { lon: 38.2, lat: 32.4, ppd: 7.4, tilt: 54 * RAD, yaw: -90 * RAD, sx: st.x + 170, sy: st.y + 300, D: 640 }
      : { lon: 39.2, lat: 31.8, ppd: 21, tilt: 62 * RAD, yaw: -90 * RAD, sx: 700, sy: 590, D: 1400 };
  }
  // A place's block in degrees, at S07's scale, logged at true area.
  function blockGeo(c, name) {
    var ph = c.phone, sb = sheetBounds(ph), g = GEO[name], an = ANCHOR[name], arr = SB.get("conflictCosts"), i;
    for (i = 0; i < arr.length; i++) if (arr[i].name === name) break;
    var path = "conflictCosts[" + i + "].amtB";
    var W = ph ? 343 : 1440, H = ph ? 500 : 900, a = SB.area(SB.get(path), fitWide(), { w: W, h: H });
    var wDeg = a.w / (sb.ppd0 * KX), hDeg = a.h / sb.ppd0;
    var lonL = an === "c" ? g[0] - wDeg / 2 : an[1] === "l" ? g[0] : g[0] - wDeg;
    var latB = an === "c" ? g[1] - hDeg / 2 : an[0] === "b" ? g[1] : g[1] - hDeg;
    c.rung(path, fitWide(), { x: (lonL - sb.lon0) * sb.ppd0 * KX, y: (sb.lat1 - latB - hDeg) * sb.ppd0, w: W, h: H }, "tl");
    return [[lonL, latB + hDeg], [lonL + wDeg, latB + hDeg], [lonL + wDeg, latB], [lonL, latB]];
  }

  // The map plane under the camera (as S07 leaves it): lit paper, cross grid, ticks.
  function mapPlane(c, P, o) {
    var S = SB.SVG, T = c.T, sb = sheetBounds(c.phone), g = "", lon, lat, L;
    var sheet = P.poly([[sb.lon0, sb.lat1], [sb.lon1, sb.lat1], [sb.lon1, sb.lat0], [sb.lon0, sb.lat0]]);
    c.svg('<polygon points="' + pts(sheet) + '" fill="url(#paper)" opacity="' + (o.opacity != null ? o.opacity : 1) + '"/>');
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) { L = P.line([lon, sb.lat0], [lon, sb.lat1]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + o.gridA + ")" }); }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) { L = P.line([sb.lon0, lat], [sb.lon1, lat]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + o.gridA + ")" }); }
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5)
      for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
        var q = P.pt(lon, lat), t = Math.max(1.5, 3.5 * Math.min(1.5, q.f));
        g += S.path("M" + (q.x - t) + " " + q.y + " H" + (q.x + t) + " M" + q.x + " " + (q.y - t) + " V" + (q.y + t), { stroke: "rgba(255,255,255,0.26)" });
      }
    c.svg(g);
    c.svg('<polygon points="' + pts(sheet) + '" fill="none" stroke="' + T.sheetLine + '"/>');
    return sheet;
  }

  /* ── The curve of the earth, and the strata on it ─────────────────────
     A circle of radius R whose top (the apex) sits at (ax, ay); the whole
     figure rolled by `roll` degrees about the apex (the orbiting camera). */
  function Arc(ax, ay, R, roll) {
    var cy = ay + R;
    function p(r, a) { return [ax + r * Math.sin(a), cy - r * Math.cos(a)]; }
    function f(q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }
    return {
      ax: ax, ay: ay, R: R, roll: roll,
      open: '<g transform="rotate(' + roll + " " + ax + " " + ay + ')">',
      // a band between radii r0 and r1, over angles a0..a1 (radians from straight up, clockwise)
      band: function (r0, r1, a0, a1) {
        return "M" + f(p(r1, a0)) + " A" + r1.toFixed(1) + " " + r1.toFixed(1) + " 0 0 1 " + f(p(r1, a1)) + " L" + f(p(r0, a1)) +
          " A" + r0.toFixed(1) + " " + r0.toFixed(1) + " 0 0 0 " + f(p(r0, a0)) + " Z";
      },
      curve: function (r, a0, a1) { return "M" + f(p(r, a0)) + " A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 0 1 " + f(p(r, a1)); },
      // below the curve, down to y = bottom (for clipping the ground)
      below: function (a0, a1, bottom) { return "M" + f(p(R, a0)) + " A" + R + " " + R + " 0 0 1 " + f(p(R, a1)) + " L" + p(R, a1)[0].toFixed(1) + " " + bottom + " L" + p(R, a0)[0].toFixed(1) + " " + bottom + " Z"; },
      // screen point of (r, a) after the roll
      at: function (r, a) {
        var q = p(r, a), t = roll * RAD, dx = q[0] - ax, dy = q[1] - ay;
        return { x: ax + dx * Math.cos(t) - dy * Math.sin(t), y: ay + dx * Math.sin(t) + dy * Math.cos(t) };
      },
    };
  }
  // The ground below the curve: S07's grid seen from the orbit, turned, fading into the curve.
  function groundBelow(c, A, a0, a1, bottom, cam, id) {
    var S = SB.SVG, P = Cam(cam), g = "", lon, lat, L;
    c.svg('<defs><clipPath id="' + id + '"><path d="' + A.below(a0, a1, bottom) + '"/></clipPath>' +
      '<linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="' + A.ay + '" x2="0" y2="' + (A.ay + (c.phone ? 110 : 220)) + '"><stop offset="0" stop-color="' + c.T.white + '" stop-opacity="0.15"/><stop offset="1" stop-color="' + c.T.white + '" stop-opacity="1"/></linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="9000" height="9000"><rect x="-4000" y="-4000" width="9000" height="9000" fill="url(#' + id + 'g)"/></mask></defs>');
    c.svg(A.open + '<g clip-path="url(#' + id + ')"><path d="' + A.below(a0, a1, bottom) + '" fill="' + c.T.sheet + '"/><g mask="url(#' + id + 'm)">');
    for (lon = -180; lon <= 180; lon += 5) { L = P.line([lon, -80], [lon, 89]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255,0.08)" }); }
    for (lat = -80; lat <= 85; lat += 5) { L = P.line([-180, lat], [180, lat]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255,0.08)" }); }
    for (lon = -40; lon <= 120; lon += 5)
      for (lat = -20; lat <= 80; lat += 5) {
        var q = P.pt(lon, lat);
        if (q.f > 2.2 || q.y < A.ay - 10) continue;
        var t = Math.max(1.2, 3.2 * Math.min(1.4, q.f));
        g += S.path("M" + (q.x - t) + " " + q.y + " H" + (q.x + t) + " M" + q.x + " " + (q.y - t) + " V" + (q.y + t), { stroke: "rgba(255,255,255,0.22)" });
      }
    c.svg(g + "</g></g></g>");
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
  function lowerThird(c, x, y, w, rows) {
    c.uiSvg(SB.SVG.line(x, y, x + 44, y, { stroke: c.T.white, "stroke-width": 1.5 }));
    var at = y + 12;
    rows.forEach(function (r) { c.uiDiv(x, at, w, r.html, r.style); at += r.h; });
  }

  // Geometry of the orbit frame: where the curve sits, how big, how far it rolls, thickness per %.
  function orbitGeo(c) {
    var st = c.stage, g = c.phone
      ? { ax: st.x + 150, ay: st.y + 412, R: 1100, roll: -4, k: 4.0, bottom: st.y + st.h + 40, x0: st.x - 10, x1: st.x + st.w + 10 }
      : { ax: 600, ay: 640, R: 2000, roll: -4, k: 4.6, bottom: 1200, x0: -20, x1: 1460 };
    // the angles that just cover the view (a little past each side, so the roll never shows an end)
    g.a0 = Math.asin(Math.max(-0.99, (g.x0 - g.ax) / g.R)) - 0.03;
    g.a1 = Math.asin(Math.min(0.99, (g.x1 - g.ax) / g.R)) + 0.03;
    return g;
  }
  // the camera on the ground plane once it has orbited: higher, turned further round
  function orbitCam(c, A) {
    var st = c.stage, t = c.phone ? 72 * RAD : 74 * RAD, D = c.phone ? 520 : 1000;
    return { lon: 39, lat: 30, ppd: c.phone ? 9 : 18, tilt: t, yaw: -122 * RAD, sx: c.phone ? st.x + 171 : 720, sy: A.ay + (D * Math.cos(t)) / Math.sin(t), D: D };
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
    camera: "Orbit: the camera rises over the map's far edge and swings around above it (the grid below turns a further third of a turn; the frame rolls a few degrees). From that height the horizon bends into the curve of the earth and the strata rise off it. At the end the map turns edge-on to the camera: one thin line, settling exactly where S09's time line runs (desktop y 530, x 120–1320; phone y 344, x 16–359).",
    reason:
      "Rising off the ground into the air shows a cost the money totals leave out: what war puts into the atmosphere. When everything falls away to one thin line, the story drops money and shares for one measure, time, which S09 runs back along that same line.",
    frames: [
      { k: "in", p: 0, cap: "Entry: S07's horizon. As the camera starts to rise, the six blocks drop back to dashed ghosts and China's layer begins to rise off the far edge." },
      { k: "mid", p: 0.5, cap: "The camera has orbited up: the horizon bends into the curve of the earth and the grid below has turned. Six strata stand on it, thickness = share, each named along its own curve. The militaries' layer is the one red mark; its figure sits large in the sky on a leader." },
      { k: "out", p: 1, cap: "Everything falls away (faint dashed ghosts of the strata flatten as they drop). The curve straightens and turns edge-on: one thin line, in the exact place where S09's time line begins." },
    ],
    alts: [
      {
        k: "B",
        label: "Separate bars, bases labelled",
        frames: ["mid"],
        note: "Audit (reviewer finding): emittersCompare mixes national CO₂ shares (Global Carbon Project) with the militaries' share of all greenhouse gas (SGR / CEOBS), and military emissions already sit inside national totals. Stacking implies one shared whole. Here each bar stands alone on the curve of the horizon; the national bars share one base label, the militaries' bar stands apart with its own.",
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
        // ── entry: S07's wide shot; the blocks drop back to ghosts; China's layer starts to rise off the far edge
        var cam = wideCam(c), P = Cam(cam), sb = sheetBounds(ph);
        if (ph) c.svg('<defs><clipPath id="s08in"><rect x="' + st.x + '" y="' + st.y + '" width="' + st.w + '" height="' + st.h + '"/></clipPath></defs><g clip-path="url(#s08in)">');
        mapPlane(c, P, { gridA: 0.1 });
        Object.keys(GEO).forEach(function (name) {
          var q = P.poly(blockGeo(c, name)).map(function (v) { return { x: v.x, y: v.y + (ph ? 4 : 8) }; });
          c.svg('<polygon points="' + pts(q) + '" fill="none" stroke="rgba(255,255,255,0.3)" stroke-dasharray="3 4"/>');
        });
        var FL = P.line([sb.lon1, sb.lat0], [sb.lon1, sb.lat1]);
        var e0 = FL[0].x < FL[1].x ? FL[0] : FL[1], e1 = FL[0].x < FL[1].x ? FL[1] : FL[0];
        var h0 = list[0].pct * (ph ? 4.2 : 5.2) * 0.3;
        c.svg('<polygon points="' + pts([{ x: e0.x, y: e0.y - h0 }, { x: e1.x, y: e1.y - h0 }, e1, e0]) + '" fill="url(#paper)" stroke="' + T.grey + '" stroke-width="1"/>');
        c.svg(S.line(e0.x, e0.y - h0, e1.x, e1.y - h0, { stroke: "rgba(255,255,255,0.14)" }));
        c.svg(S.line(e0.x, e0.y, e1.x, e1.y, { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.25 }));
        if (ph) c.svg("</g>");
        var mid0 = { x: e1.x, y: e1.y - h0 / 2 };
        if (!ph) {
          c.uiDiv(120, 70, 760, x.title, TX.labelW + ";font-size:13px");
          c.uiSvg(S.leader([[mid0.x, mid0.y], [mid0.x + 40, mid0.y - 60], [mid0.x + 56, mid0.y - 60]], { color: "rgba(255,255,255,0.5)" }));
          c.uiDiv(mid0.x + 62, mid0.y - 74, 300, list[0].value + ' <span style="' + TX.label + ';font-size:11px">' + list[0].name + "</span>", TX.value + ";font-size:20px");
        } else {
          c.uiDiv(e0.x + 6, e0.y - h0 / 2 - 7, 160, list[0].name + ' <span style="' + TX.value + ';font-size:13px;letter-spacing:0">' + list[0].value + "</span>", TX.label + ";font-size:10px;letter-spacing:0.08em");
          lowerThird(c, c.textBox.x, c.textBox.y + 6, c.textBox.w, [{ html: x.title, style: TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white, h: 60 }]);
        }
        c.chrome();
        c.state({ form: "map plane + horizon (from S07); first band rising", x: Math.round(Math.max(view(c).x, e0.x)), y: Math.round(e0.y - h0), w: Math.round(Math.min(view(c).x + view(c).w, e1.x) - Math.max(view(c).x, e0.x)), h: Math.round(h0 + 2), tone: "neutral; blocks fading", note: "horizon = the map's far edge (S07's wide shot, plane turned 90°). China's layer 0.3 of the way up." });
        return;
      }

      if (p < 1) {
        // ── orbiting above the curve of the earth; all six strata stacked on it
        var G = orbitGeo(c), A = Arc(G.ax, G.ay, G.R, G.roll);
        groundBelow(c, A, G.a0 - 0.05, G.a1 + 0.05, G.bottom, orbitCam(c, A), ph ? "s08gp" : "s08g");
        var r = G.R, bands = [];
        c.svg(A.open);
        var layer = 0;
        for (var j = list.length - 1; j >= 0; j--) {
          var e = list[j], h = e.pct * G.k;
          bands[j] = { r0: r, r1: r + h };
          c.svg('<path d="' + A.band(r, r + h, G.a0, G.a1) + '" fill="url(#paper)"/>');
          c.svg('<path d="' + A.band(r, r + h, G.a0, G.a1) + '" fill="' + T.white + '" fill-opacity="' + (0.012 + layer * 0.009).toFixed(3) + '" stroke="' + (e.hot ? T.red : T.grey) + '" stroke-width="' + (e.hot ? 2 : 1) + '"/>');
          c.svg('<path d="' + A.curve(r + h - 1.5, G.a0, G.a1) + '" fill="none" stroke="rgba(255,255,255,0.12)"/>'); // light on each layer's upper edge
          r += h;
          layer++;
        }
        // each layer named along its own curve, starting at the same screen x
        var lx = ph ? st.x + 10 : 150;
        list.forEach(function (e, j) {
          var b = bands[j], rm = (b.r0 + b.r1) / 2, id = "s08c" + (ph ? "p" : "") + j;
          var aL = Math.asin((lx - G.ax) / rm), off = rm * (aL - G.a0);
          c.svg('<defs><path id="' + id + '" d="' + A.curve(rm, G.a0, G.a1) + '"/></defs>');
          // type sized to the layer's thickness (thin layers such as Japan's are only ~12–14px), never under 10px,
          // and centred on the layer's mid-line by the taller of the two runs, so neither touches an edge
          var th = b.r1 - b.r0, fs = Math.min(ph ? 10 : 11, Math.max(10, th * 0.72)), vs = Math.min(ph ? 13 : 15, Math.max(fs, th - 3));
          c.svg('<text font-family="' + c.F.mono + '" font-size="' + fs.toFixed(1) + '" font-weight="500" letter-spacing="0.12em" fill="' + (e.hot ? T.white : T.soft) + '" dy="' + (vs * 0.35).toFixed(1) + '"><textPath href="#' + id + '" startOffset="' + off.toFixed(1) + '">' + e.name +
            '<tspan font-family="' + c.F.sans + '" font-weight="600" font-size="' + vs.toFixed(1) + '" letter-spacing="0" fill="' + T.white + '" dx="10">' + e.value + "</tspan></textPath></text>");
        });
        c.svg(A.curve(G.R, G.a0 - 0.05, G.a1 + 0.05) ? '<path d="' + A.curve(G.R, G.a0 - 0.05, G.a1 + 0.05) + '" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.25"/>' : "");
        c.svg("</g>");
        var hot = list.filter(function (e) { return e.hot; })[0], hb = bands[hot.i];
        var top = A.at(r, 0);
        if (!ph) {
          c.uiDiv(120, 70, 900, x.title, TX.labelW + ";font-size:13px");
          // the militaries' figure, large in the sky, on a leader from its layer
          var hp = A.at((hb.r0 + hb.r1) / 2, Math.asin((1150 - G.ax) / ((hb.r0 + hb.r1) / 2))), gx = 830, gy = 92;
          c.uiSvg(S.leader([[hp.x, hp.y], [gx - 20, gy + 196], [gx - 4, gy + 196]], { color: "rgba(255,255,255,0.55)" }));
          c.uiSvg(S.line(gx, gy, gx + 520, gy, { stroke: "rgba(255,255,255,0.32)" }));
          c.uiDiv(gx, gy + 10, 520, hot.name + ' <span style="color:' + T.grey + '">· ' + c.fig("envFacts[0].src", "raw") + "</span>", TX.labelW + ";font-size:12px");
          c.uiDiv(gx - 8, gy + 32, null, hot.value, TX.giant + ";font-size:204px");
          lowerThird(c, 120, 770, 1140, [
            { html: x.cap, style: TX.body + ";color:" + T.soft, h: 32 },
            { html: x.src, style: TX.src, h: 18 },
          ]);
        } else {
          var rmp = (hb.r0 + hb.r1) / 2, hpp = A.at(rmp, Math.asin((st.x + 300 - G.ax) / rmp)), gxp = st.x + 120, gyp = st.y + 12;
          c.uiDiv(gxp, gyp, st.x + st.w - gxp - 4, hot.name, TX.labelW + ";font-size:10px;letter-spacing:0.08em");
          c.uiDiv(gxp - 4, gyp + 16, null, hot.value, TX.giant + ";font-size:92px");
          c.uiSvg(S.leader([[hpp.x, hpp.y], [gxp - 10, gyp + 72], [gxp - 4, gyp + 72]], { color: "rgba(255,255,255,0.55)" }));
          var tb = c.textBox;
          lowerThird(c, tb.x, tb.y + 6, tb.w, [
            { html: x.title, style: TX.value + ";font-weight:400;font-size:20px;line-height:1.3;color:" + T.white, h: 62 },
            { html: x.cap, style: TX.bodySm + ";font-size:14px;line-height:1.4", h: 84 },
            { html: x.src, style: TX.src + ";font-size:10px", h: 16 },
          ]);
        }
        c.chrome();
        var L0 = A.at(G.R + 0, G.a0), R0 = A.at(G.R, G.a1);
        var sx0 = Math.max(view(c).x, Math.min(L0.x, A.at(r, G.a0).x)), sx1 = Math.min(view(c).x + view(c).w, Math.max(R0.x, A.at(r, G.a1).x));
        // the overlay's lock tag prints the form up to its first comma (22 characters at most)
        c.state({ form: "strata, stacked bands on the curve of the earth", x: Math.round(sx0), y: Math.round(top.y), w: Math.round(sx1 - sx0), h: Math.round(Math.max(L0.y, R0.y) - top.y), tone: "neutral bands; militaries' band red edge", note: "curve apex at y " + G.ay + ", radius " + G.R + ", rolled " + G.roll + "°; thickness " + G.k + " px per %. Ground grid below turned to 122° by the orbit." });
        return;
      }

      // ── out: everything falls away; one thin line, exactly where S09's time line runs
      var Ln = ph ? LINE.phone : LINE.desk, mid = (Ln.x0 + Ln.x1) / 2;
      // the strata, dropped below the line as faint dashed ghosts, flattening as they fall (no red: the militaries' layer has gone grey too)
      var gy = Ln.y + (ph ? 24 : 34), span = (Ln.x1 - Ln.x0) / 2;
      list.slice().reverse().forEach(function (e, j) {
        var h = Math.max(2, e.pct * (ph ? 4.2 : 5.2) * 0.22), sag = (ph ? 10 : 22) * (1 - j / 6), w0 = span * (1 - j * 0.07);
        var d = "M" + (mid - w0) + " " + (gy + sag) + " Q" + mid + " " + (gy - sag) + " " + (mid + w0) + " " + (gy + sag);
        c.svg(S.path(d + " L" + (mid + w0) + " " + (gy + sag + h) + " Q" + mid + " " + (gy - sag + h) + " " + (mid - w0) + " " + (gy + sag + h) + " Z",
          { stroke: "rgba(255,255,255," + (0.24 - j * 0.03).toFixed(3) + ")", "stroke-dasharray": "3 5" }));
        gy += h + (ph ? 10 : 15) + j * (ph ? 3 : 5);
      });
      c.svg(S.line(Ln.x0, Ln.y, Ln.x1, Ln.y, { stroke: T.white, "stroke-width": 1.5, opacity: 0.78 }));
      c.state({
        form: "one thin line (the map edge-on)",
        x: Ln.x0, y: Ln.y, w: Ln.x1 - Ln.x0, h: 1.5, tone: "white, 0.78",
        note: "lands exactly on S09's time line (" + (ph ? "phone" : "desktop") + ": y " + Ln.y + ", x " + Ln.x0 + "–" + Ln.x1 + "; scenes/s09.js LINE). Faint dashed ghosts below show the strata flattening as they fall away.",
      });
      c.chrome();
    },

    // No-motion plate: the stacked strata at rest, every share, the caption and the source.
    plate: function (c) {
      this.draw(c);
    },
  });

  function view(c) { return c.phone ? c.stage : { x: 0, y: 0, w: c.W, h: c.H }; }

  // ── ALT B: separate bars standing on the curve, each base labelled ──
  function drawAltB(c, x, list) {
    var T = c.T, TX = c.TX, S = SB.SVG, ph = c.phone, st = c.stage;
    c.flag("decision", "Alt B: separate bars, not stacked. National bars carry 'share of global CO₂ · Global Carbon Project'; the militaries' bar stands apart with 'of all global greenhouse-gas emissions · SGR / CEOBS'. Same figures; no new comparison.");
    var co2 = c.copy("share of global CO₂", "index.html:586");
    var gcp = c.copy("national shares: Global Carbon Project", "index.html:591");
    var ghg = c.copy("of all global greenhouse-gas emissions", "js/data.js:589 (envFacts[0].lbl)");
    var mil = list.filter(function (e) { return e.hot; })[0];
    var nat = list.filter(function (e) { return !e.hot; });
    var G = orbitGeo(c), A = Arc(G.ax, G.ay, G.R, G.roll);
    groundBelow(c, A, G.a0 - 0.05, G.a1 + 0.05, G.bottom, orbitCam(c, A), ph ? "s08Bgp" : "s08Bg");
    // bars stand on the curve, each along its own radius: height ∝ share
    var K = ph ? 7.2 : 10, bwA = (ph ? 32 : 96) / G.R, gapA = (ph ? 9 : 30) / G.R;
    var a = Math.asin(((ph ? st.x + 40 : 330) - G.ax) / G.R), bars = [];
    nat.forEach(function (e) { bars.push({ e: e, a0: a, a1: a + bwA }); a += bwA + gapA; });
    var natEnd = a - gapA;
    a += (ph ? 18 : 150) / G.R; // the militaries' bar stands apart
    bars.push({ e: mil, a0: a, a1: a + bwA });
    c.svg(A.open);
    bars.forEach(function (b) {
      c.svg('<path d="' + A.band(G.R, G.R + b.e.pct * K, b.a0, b.a1) + '" fill="url(#paper)" stroke="' + (b.e.hot ? T.red : T.grey) + '" stroke-width="' + (b.e.hot ? 1.5 : 1) + '"/>');
    });
    c.svg('<path d="' + A.curve(G.R, G.a0 - 0.05, G.a1 + 0.05) + '" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.25"/>');
    // two base lines, one per base, hung just under the curve
    var bo = ph ? 30 : 46;
    c.svg('<path d="' + A.curve(G.R - bo, bars[0].a0, natEnd) + '" fill="none" stroke="rgba(255,255,255,0.5)"/>');
    // the militaries' base line runs just past its bar (desktop): right of the apex the curve falls away,
    // so a long line would run down through its own flat label
    var mb = bars[bars.length - 1], mEnd = mb.a1 + (ph ? 40 : 30) / G.R;
    c.svg('<path d="' + A.curve(G.R - bo, mb.a0, mEnd) + '" fill="none" stroke="rgba(255,255,255,0.5)"/>');
    // desktop: each name runs along the curve under its own bar, centred on it, so it keeps clear of the
    // curve and the base lines however steeply they fall (type on a curve, as in the main frames)
    var nameR = G.R - 16, ext = [];
    if (!ph) bars.forEach(function (b, i) {
      var am = (b.a0 + b.a1) / 2, id = "s08Bn" + i, half = (b.e.name.length * 7.7) / 2;
      c.svg('<defs><path id="' + id + '" d="' + A.curve(nameR, G.a0, G.a1) + '"/></defs>');
      c.svg('<text font-family="' + c.F.mono + '" font-size="11" font-weight="500" letter-spacing="0.1em" text-anchor="middle" fill="' + (b.e.hot ? T.white : T.grey) + '" dy="4"><textPath href="#' + id + '" startOffset="' + (nameR * (am - G.a0)).toFixed(1) + '">' + b.e.name + "</textPath></text>");
      var pad = (half + 10) / nameR; // a little air past each end, so the overlay's corners never touch the type
      ext.push(A.at(nameR - 10, am - pad), A.at(nameR - 10, am + pad), A.at(nameR + 6, am - pad), A.at(nameR + 6, am + pad));
    });
    c.svg("</g>");
    // values above each bar (flat type, at the rolled positions); phone: numbers at each foot
    bars.forEach(function (b) {
      var tp = A.at(G.R + b.e.pct * K + (ph ? 6 : 10), b.a0);
      // phone: kept left of the overlay's SCAN readout at the right edge
      var vx = ph ? Math.min(tp.x - 2, c.W - 78 - b.e.value.length * 8) : tp.x - 2;
      c.uiDiv(vx, tp.y - (ph ? 18 : 26), ph ? 44 : 90, b.e.value, TX.value + ";font-size:" + (ph ? 14 : 20) + "px");
      if (!ph) ext.push({ x: vx - 8, y: tp.y - 34 }, { x: vx + b.e.value.length * 12 + 8, y: tp.y });
      [[G.R, b.a0], [G.R, b.a1], [G.R + b.e.pct * K, b.a0], [G.R + b.e.pct * K, b.a1]].forEach(function (q) { ext.push(A.at(q[0], q[1])); });
    });
    var baseN = A.at(G.R - bo - (ph ? 8 : 10), bars[0].a0), baseM = A.at(G.R - bo - (ph ? 8 : 10), mb.a0);
    if (!ph) {
      c.uiDiv(120, 70, 900, x.title, TX.labelW + ";font-size:13px");
      c.uiDiv(baseN.x, baseN.y + 12, 560, co2.toUpperCase() + " · " + gcp.toUpperCase(), TX.labelW + ";font-size:11px");
      // hung under the lowest point of its own base line
      var mLow = Math.max(baseM.y, A.at(G.R - bo, mEnd).y);
      c.uiDiv(baseM.x, mLow + 12, 260, ghg.toUpperCase() + " · " + c.fig("envFacts[0].src", "raw"), TX.labelW + ";font-size:11px");
      // the caption and source hang in the open sky under the title
      c.uiDiv(120, 98, 1140, x.cap, TX.body + ";color:" + T.soft);
      c.uiDiv(120, 132, 600, x.src, TX.src);
    } else {
      // phone: the bars carry numbers; the names sit in a key under each base
      bars.forEach(function (b, i) {
        var ft = A.at(G.R - 12, b.a0);
        c.uiDiv(ft.x, ft.y, 30, c.label((i + 1 < 10 ? "0" : "") + (i + 1), "bar number"), (b.e.hot ? TX.labelW : TX.label) + ";font-size:10px;letter-spacing:0.04em");
      });
      var tb = c.textBox;
      c.uiDiv(st.x + 4, st.y + 10, st.w - 8, x.title, TX.labelW + ";font-size:10px;line-height:1.5");
      var keyN = nat.map(function (e, i) { return c.label("0" + (i + 1), "bar number") + " " + e.name; }).join(" · ");
      lowerThird(c, tb.x, tb.y + 6, tb.w, [
        { html: co2.toUpperCase() + " · " + gcp.toUpperCase(), style: TX.labelW + ";font-size:10px", h: 30 },
        { html: keyN, style: TX.label + ";font-size:10px;letter-spacing:0.06em", h: 30 },
        { html: c.label("06", "bar number") + " " + mil.name + " · " + ghg.toUpperCase() + " · " + c.fig("envFacts[0].src", "raw"), style: TX.labelW + ";font-size:10px", h: 44 },
        { html: x.cap, style: TX.bodySm + ";font-size:14px;line-height:1.4", h: 62 },
        { html: x.src, style: TX.src + ";font-size:10px", h: 16 },
      ]);
    }
    c.chrome();
    var tops = bars.map(function (b) { return A.at(G.R + b.e.pct * K, b.a0).y; });
    var l = A.at(G.R, bars[0].a0), rr = A.at(G.R, bars[bars.length - 1].a1);
    var topY = Math.round(Math.min.apply(null, tops) - (ph ? 22 : 30));
    var sr = { x: Math.round(l.x), y: topY, w: Math.round(rr.x - l.x), h: Math.round(Math.max(l.y, rr.y) - topY) };
    if (!ph) {
      // desktop: the box takes in every bar (the roll tips them past their feet), its value and its name,
      // so the overlay's corners land in clear sky and ground, never on a label
      var xs = ext.map(function (q) { return q.x; }), ys = ext.map(function (q) { return q.y; });
      var bx0 = Math.min.apply(null, xs), by0 = Math.min.apply(null, ys);
      sr = { x: Math.round(bx0), y: Math.round(by0), w: Math.round(Math.max.apply(null, xs) - bx0), h: Math.round(Math.max.apply(null, ys) - by0) };
    }
    // the overlay's lock tag prints the form up to its first comma (22 characters at most)
    c.state({ form: "separate bars, on the curve", x: sr.x, y: sr.y, w: sr.w, h: sr.h, tone: "neutral bars; militaries' bar red edge", note: "bar height " + K + " px per %, standing along the curve's radii. Two bases, two base lines; the militaries' bar stands apart." });
  }
})();
