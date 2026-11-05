/* S07 · THE MAP · TRAVEL · 2.0 screens
   The $21.8T sheet from S06 tips back and becomes a map plane: a
   latitude/longitude cross grid (no land outline in the repo yet).
   The camera travels place to place with a slow tilt. At each stop a
   block lands on the real location at true area (conflictCosts[i].amtB),
   with its note and source. At the end the camera tilts up until the
   map's far edge is a horizon, with all six blocks standing on it.
   Blocks stand upright (they face the camera), so tilting the map never
   foreshortens them: their areas stay true to each other in every frame.
   No brackets, no locks, no crosshairs on places where people live. */
(function () {
  "use strict";

  var RAD = Math.PI / 180;
  var KX = Math.cos(32 * RAD); // longitude scale at the region's middle latitude (plate carrée, locally corrected)
  // Real positions in degrees (lon, lat): approximate country centroids; Gaza is the Strip. Positions, not figures.
  var GEO = {
    Ukraine: [31.2, 48.4],
    Syria: [38.5, 35.0],
    Iraq: [43.7, 33.2],
    Gaza: [34.4, 31.45],
    Yemen: [47.6, 15.9],
    Sudan: [30.2, 15.6],
  };
  // Travel order: the brief's list (largest first). It ends at Gaza, the place S09 returns to.
  var ROUTE = ["Ukraine", "Syria", "Sudan", "Yemen", "Iraq", "Gaza"];
  var STOP_P = [0.16, 0.28, 0.4, 0.52, 0.64, 0.76];
  // Which corner of each block sits on its place in the wide shot (keeps neighbours clear).
  var ANCHOR = { Ukraine: "br", Syria: "bl", Iraq: "bl", Gaza: "bl", Yemen: "bl", Sudan: "bl" };
  // $B per full frame: S06's end scale ($21.8T = the frame), used for the wide shot. Read from data.js, never typed.
  function fitWide() { return SB.get("machineData[3].amtB"); }
  var CLOSE = 1.4; // at each stop the camera is closer: every block is drawn 1.4× (desktop), 2× (phone) linear

  // What the live conflict bars print: main.js fmt() (≥1000 → $x.xxT, else "$" + Math.round + "B").
  // Five of six match SB format B. Gaza's 71.4 prints as $71B on the live page, so the frames keep $71B.
  function liveFmt(b) { return b >= 1000 ? "$" + (b / 1000).toFixed(2) + "T" : "$" + Math.round(b) + "B"; }
  function money(c, P) {
    var v = SB.get(P);
    if (liveFmt(v) === SB.FMT.B(v)) return c.fig(P, "B");
    if (!c._s07fmt) {
      c._s07fmt = true;
      c.flag("decision", "Gaza: data.js holds " + SB.FMT.B(v) + " (conflictCosts amtB " + v + "), but the live conflict bars print " + liveFmt(v) + " (main.js:229, fmt() rounds to whole billions). Frames keep the live " + liveFmt(v) + " so the before-and-after figure diff stays clean. Printing " + SB.FMT.B(v) + " instead would change a figure on the page: approve either way.");
    }
    return c.sample(liveFmt(v), P + " (" + v + ") through main.js fmt(), as the live conflict bars print it (main.js:229)");
  }

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // The sheet as it tips: S06's full-frame sheet read as a map, centre (39°E, 32°N),
  // about 56° of latitude tall, so the six places sit well inside it.
  function sheetBounds(ph) {
    var ppd0 = ph ? 500 / 56 : 900 / 56;
    var halfLat = (ph ? 250 : 450) / ppd0;
    var halfLon = (ph ? 171.5 : 720) / (ppd0 * KX);
    return { ppd0: ppd0, lon0: 39 - halfLon, lon1: 39 + halfLon, lat0: 32 - halfLat, lat1: 32 + halfLat };
  }

  // Perspective of a tilted plane. tilt 0 = straight down. Points north of the focus are farther away.
  function proj(cam, lon, lat) {
    var dx = (lon - cam.lon) * KX * cam.ppd;
    var dy = -(lat - cam.lat) * cam.ppd;
    var d = Math.max(cam.D * 0.1, cam.D - dy * Math.sin(cam.tilt));
    var f = cam.D / d;
    return { x: cam.sx + dx * f, y: cam.sy + dy * Math.cos(cam.tilt) * f, f: f };
  }
  function lerpCam(a, b, t) {
    return {
      lon: lerp(a.lon, b.lon, t), lat: lerp(a.lat, b.lat, t),
      ppd: SB.fitBetween(a.ppd, b.ppd, t), tilt: lerp(a.tilt, b.tilt, t),
      sx: lerp(a.sx, b.sx, t), sy: lerp(a.sy, b.sy, t), D: lerp(a.D, b.D, t),
    };
  }

  // Camera at scroll progress p. Tip (0–0.12), swoop to the first stop, travel, then tilt up (0.8–1).
  function camAt(c, p) {
    var ph = c.phone, sb = sheetBounds(ph), st = c.stage;
    var base = { lon: 39, lat: sb.lat0, ppd: sb.ppd0, tilt: 0, sx: st.x + st.w / 2, sy: st.y + st.h, D: ph ? 1000 : 1800 };
    var tipEnd = Object.assign({}, base, { tilt: 55 * RAD });
    function stop(i) {
      var g = GEO[ROUTE[i]];
      return ph
        ? { lon: g[0], lat: g[1], ppd: 48, tilt: (24 + (10 * i) / 5) * RAD, sx: st.x + 96, sy: st.y + 392, D: 1000 }
        : { lon: g[0], lat: g[1], ppd: 70, tilt: (24 + (10 * i) / 5) * RAD, sx: 560, sy: 610, D: 1800 };
    }
    var wide = ph
      ? { lon: 38.9, lat: 15.7, ppd: 19, tilt: 50 * RAD, sx: st.x + 171, sy: st.y + 444, D: 900 }
      : { lon: 39, lat: 15, ppd: 84, tilt: 64 * RAD, sx: 740, sy: 820, D: 1700 };
    if (p <= 0.12) return lerpCam(base, tipEnd, ease(p / 0.12));
    if (p <= STOP_P[0]) return lerpCam(tipEnd, stop(0), ease((p - 0.12) / (STOP_P[0] - 0.12)));
    for (var i = 0; i < 5; i++) {
      if (p <= STOP_P[i + 1]) {
        var seg = (p - STOP_P[i]) / (STOP_P[i + 1] - STOP_P[i]);
        return lerpCam(stop(i), stop(i + 1), ease((seg - 0.35) / 0.65)); // dwell, then travel
      }
    }
    if (p <= 0.8) return stop(5);
    return lerpCam(stop(5), wide, ease((p - 0.8) / 0.2));
  }
  // Which stop the camera is at (−1 before the first landing; 6 = all landed, the wide shot).
  function stopAt(p) {
    if (p < STOP_P[0]) return -1;
    if (p > 0.8) return 6;
    for (var i = 5; i >= 0; i--) if (p >= STOP_P[i]) return i;
    return -1;
  }

  // conflictCosts index for a place name (data order differs from the route).
  function idx(name) {
    var arr = SB.get("conflictCosts");
    for (var i = 0; i < arr.length; i++) if (arr[i].name === name) return i;
    throw new Error("S07: no conflictCosts entry for " + name);
  }
  function place(c, name) {
    var i = idx(name), P = "conflictCosts[" + i + "]";
    return {
      name: name, path: P + ".amtB",
      label: c.fig(P + ".name", "raw").toUpperCase(),
      value: money(c, P + ".amtB"),
      note: c.fig(P + ".note", "raw"),
      src: c.fig(P + ".src", "raw"),
    };
  }

  // Phone: clip the map to the stage.
  function clipOn(c, id) {
    if (!c.phone) return;
    var s = c.stage;
    c.svg('<defs><clipPath id="' + id + '"><rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '"/></clipPath></defs><g clip-path="url(#' + id + ')">');
  }
  function clipOff(c) { if (c.phone) c.svg("</g>"); }

  // The map plane: paper, cross grid with tick, edges. edge: 'red' while it is still the $21.8T sheet.
  function drawPlane(c, cam, o) {
    var T = c.T, S = SB.SVG, sb = sheetBounds(c.phone);
    o = o || {};
    var n = 18, pts = [], k;
    for (k = 0; k <= n; k++) pts.push(proj(cam, lerp(sb.lon0, sb.lon1, k / n), sb.lat1));
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon1, lerp(sb.lat1, sb.lat0, k / n)));
    for (k = 0; k <= n; k++) pts.push(proj(cam, lerp(sb.lon1, sb.lon0, k / n), sb.lat0));
    for (k = 0; k <= n; k++) pts.push(proj(cam, sb.lon0, lerp(sb.lat0, sb.lat1, k / n)));
    var poly = pts.map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" ");
    c.svg('<polygon points="' + poly + '" fill="' + T.sheet + '"/>');
    // cross grid every 5°
    var g = "", lon, lat, a, b;
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) {
      a = proj(cam, lon, sb.lat0); b = proj(cam, lon, sb.lat1);
      g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + (o.gridA || 0.09) + ")" });
    }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
      a = proj(cam, sb.lon0, lat); b = proj(cam, sb.lon1, lat);
      g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + (o.gridA || 0.09) + ")" });
    }
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5)
      for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
        a = proj(cam, lon, lat);
        var t = Math.max(2, 3.5 * Math.min(1.4, a.f));
        g += S.path("M" + (a.x - t) + " " + a.y + " H" + (a.x + t) + " M" + a.x + " " + (a.y - t) + " V" + (a.y + t), { stroke: "rgba(255,255,255,0.24)" });
      }
    c.svg(g);
    // edges: red and a corner tab while it is still the money sheet; neutral once it is a map
    var edge = o.red
      ? { stroke: T.red, "stroke-width": 2, "stroke-opacity": o.red, fill: "none" }
      : { stroke: T.sheetLine, "stroke-width": 1, fill: "none" };
    c.svg('<polygon points="' + poly + '"' + Object.keys(edge).map(function (kk) { return " " + kk + '="' + edge[kk] + '"'; }).join("") + "/>");
    if (o.horizon) {
      a = proj(cam, sb.lon0, sb.lat1); b = proj(cam, sb.lon1, sb.lat1);
      c.svg(S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.25 }));
    }
    // the plane's on-screen bounds, clipped to the view (recorded as the Sheet's state)
    var v = c.phone ? c.stage : { x: 0, y: 0, w: c.W, h: c.H };
    var xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; });
    var bx0 = Math.max(v.x, Math.min.apply(null, xs)), bx1 = Math.min(v.x + v.w, Math.max.apply(null, xs));
    var by0 = Math.max(v.y, Math.min.apply(null, ys)), by1 = Math.min(v.y + v.h, Math.max.apply(null, ys));
    return { far: proj(cam, 39, sb.lat1), box: { x: Math.round(bx0), y: Math.round(by0), w: Math.round(bx1 - bx0), h: Math.round(by1 - by0) } };
  }

  // Coordinate labels where grid lines cross a screen line (positions, not figures).
  // lonAt: y of the horizontal line for longitude labels, x range [x0, x1].
  // latAt: x of the vertical line for latitude labels, y range [y0, y1].
  function gridLabels(c, cam, o) {
    var sb = sheetBounds(c.phone), TX = c.TX, lon, lat, st = TX.src + ";font-size:10px;opacity:0.85";
    var deg = function (v, h) { return c.label(Math.abs(v) + "°" + h, "map grid coordinate, not a figure"); };
    for (lon = Math.ceil(sb.lon0 / 5) * 5; o.lonAt != null && lon <= sb.lon1; lon += 5) {
      var a = proj(cam, lon, sb.lat0), b = proj(cam, lon, sb.lat1);
      var t = (o.lonAt - a.y) / (b.y - a.y);
      if (!(t >= 0 && t <= 1)) continue;
      var x = a.x + (b.x - a.x) * t;
      if (x < o.x0 || x > o.x1) continue;
      c.div(x + 4, o.lonAt - 15, 44, deg(lon, "E"), st);
    }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; o.latAt != null && lat <= sb.lat1; lat += 5) {
      var p0 = proj(cam, sb.lon0, lat), p1 = proj(cam, sb.lon1, lat);
      var u = (o.latAt - p0.x) / (p1.x - p0.x);
      if (!(u >= 0 && u <= 1)) continue;
      var y = p0.y + (p1.y - p0.y) * u;
      if (y < o.y0 || y > o.y1) continue;
      c.div(o.latAt + 4, y - 15, 44, deg(lat, "N"), st);
    }
  }
  // Text may only sit in the free part of the frame (not under the header, spec, log or chrome).
  // wide: the opening tip, when there is no spec or log on screen yet.
  function safe(c, q, wide) {
    if (c.phone) {
      var s = c.stage;
      return q.x > s.x + 2 && q.x < s.x + s.w - 70 && q.y > s.y + (wide ? 4 : 34) && q.y < s.y + s.h - 14;
    }
    return wide ? q.x > 20 && q.x < 1360 && q.y > 260 && q.y < 860 : q.x > 20 && q.x < 900 && q.y > 170 && q.y < 650;
  }

  // A block standing on its place at true area. box: the frame (desktop) or stage (phone) at `fit`.
  function block(c, pl, at, fit, anchor, o) {
    var bw = c.phone ? c.stage.w : c.W, bh = c.phone ? c.stage.h : c.H;
    o = o || {};
    var bx = anchor[1] === "l" ? at.x : at.x - bw;
    var by = anchor[0] === "b" ? at.y - bh : at.y;
    var r = c.rung(pl.path, fit, { x: bx, y: by, w: bw, h: bh }, anchor);
    c.svg(SB.SVG.sheet(r.x, r.y, r.w, r.h, { tone: o.tone || "grey", mode: "edge", sw: o.sw || 1.5, opacity: o.opacity }));
    c.svg(SB.SVG.rect(at.x - 2.5, at.y - 2.5, 5, 5, { fill: c.T.white }));
    return r;
  }
  function point(c, at, name, o) {
    o = o || {};
    c.svg(SB.SVG.rect(at.x - 2.5, at.y - 2.5, 5, 5, { fill: o.fill || c.T.grey }));
    if (name && safe(c, at, o.wide)) c.div(at.x + 8, at.y - 7, null, name, c.TX.src + ";font-size:" + (c.phone ? 10 : 11) + "px;letter-spacing:0.1em");
  }
  function route(c, pts) {
    if (pts.length < 2) return;
    c.svg(SB.SVG.path("M" + pts.map(function (q) { return q.x.toFixed(1) + " " + q.y.toFixed(1); }).join(" L"), { stroke: "rgba(255,255,255,0.35)", "stroke-dasharray": "3 5" }));
  }

  function texts(c) {
    return {
      kicker: c.copy("Chapter 02 · The Impact of War", "index.html:562").toUpperCase(),
      title: c.copy("Destruction", "index.html:575").toUpperCase(),
      mixed: c.newCopy("These are mixed estimates: reconstruction needs, damage and economic loss.",
        "brief S07 asks to keep 'mixed estimates' wording; none exists on the page (only a data.js comment). Replaces the page's '$bn needed' heading at index.html:579, which calls all six 'needed' (audit F12/F14)"),
    };
  }

  SB.scene({
    order: 7,
    id: "S07",
    name: "The Map",
    move: "TRAVEL",
    screens: 2.0,
    restrained: false,
    anchor: "#impact",
    trigger: "#impact top (Chapter 02), straight after S06's $21.8T sheet fills the frame.",
    camera: "The sheet tips back into a map plane. Then the camera travels stop to stop (Ukraine, Syria, Sudan, Yemen, Iraq, Gaza: the brief's order, largest first), tilting a little more at each stop. At the end it pulls back and tilts up until the map's far edge is the horizon.",
    reason:
      "Tipping the sheet into a map moves the story from one global total to the places where war's damage lands. Tilting up to the horizon then lifts the eye off the ground into the air above it, where S08 shows what war puts into the atmosphere.",
    frames: [
      { k: "in", p: 0.08, cap: "Entry. The $21.8T sheet tips back about its near edge and becomes a map: a latitude/longitude cross grid. Its red edge drains as its area stops meaning money. Six places appear as plain points. The ladder in its corner tips away with it." },
      { k: "stop", p: 0.16, cap: "First stop: Ukraine. A block lands on the place at true area, with its note and source. A travel log (bottom left) keeps every figure reached so far." },
      { k: "mid", p: 0.52, cap: "Fourth stop: Yemen, after Syria and Sudan. The camera has tilted a little more. The dashed route runs back toward Sudan; the log keeps Ukraine, Syria and Sudan with their figures. Iraq and Gaza are still ahead." },
      { k: "out", p: 1, cap: "All six blocks stand on their places, one scale. The camera tilts up until the map's far edge is a horizon. S08 rises above it." },
    ],

    draw: function (c) {
      var T = c.T, TX = c.TX, S = SB.SVG;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone, st = c.stage;
      var cam = camAt(c, p);
      var at = stopAt(p);
      var x = texts(c);
      var tipT = clamp(p / 0.12);
      c.flag("data", "land outline: Natural Earth 1:110m (public domain) to be added in phase 3 — needs approval to download");
      c.flag("decision", "The 'mixed estimates' line is new copy (audit F12/F14). The page's '$bn needed' heading (index.html:579) is not used, because Yemen is economic loss and Sudan is damage. Approve the wording.");
      c.flag("data", "Places sit at approximate country centroids (Gaza: the Strip). Coordinates are positions, not figures. Travel order is the brief's list.");

      clipOn(c, "s07clip");
      var planeBox = drawPlane(c, cam, { red: p < 0.12 ? (1 - tipT) * 0.9 + 0.1 : 0, horizon: at === 6, gridA: p < 0.12 ? 0.04 + 0.08 * tipT : 0.1 }).box;
      if (p < 0.12) {
        // the ladder in the sheet's corner tips away with it, unlabelled (it returns in S11)
        var sb = sheetBounds(ph), bw = ph ? st.w : c.W, bh = ph ? st.h : c.H;
        ["DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"].forEach(function (path, i) {
          var r = SB.rungAt(SB.get(path), SB.get("machineData[3].amtB"), { x: 0, y: 0, w: bw, h: bh }, "bl");
          var lonR = sb.lon0 + (r.w / bw) * (sb.lon1 - sb.lon0), latT = sb.lat0 + (r.h / bh) * (sb.lat1 - sb.lat0);
          var q = [proj(cam, sb.lon0, sb.lat0), proj(cam, lonR, sb.lat0), proj(cam, lonR, latT), proj(cam, sb.lon0, latT)];
          c.svg('<polygon points="' + q.map(function (v) { return v.x.toFixed(1) + "," + v.y.toFixed(1); }).join(" ") + '" fill="none" stroke="' + (i === 3 ? T.blue : T.red) + '" stroke-opacity="' + (0.35 * (1 - tipT) + 0.08) + '"/>');
        });
      }
      var FIT = fitWide();
      var fitNow = at === 6 ? FIT : FIT / Math.pow(ph ? 2 : CLOSE, 2);
      var visited = [], pos = {};
      ROUTE.forEach(function (name, i) {
        var g = GEO[name];
        pos[name] = proj(cam, g[0], g[1]);
        if (at >= i) visited.push(pos[name]);
      });
      if (at >= 0 && at < 6) route(c, visited);
      var info = [], curRect = null;
      ROUTE.forEach(function (name, i) {
        var pl = place(c, name), q = pos[name];
        info.push(pl);
        if (at < i) { point(c, q, ph && at >= 0 ? null : pl.label, { wide: at < 0 }); return; }
        var cur = i === at;
        var r = block(c, pl, q, fitNow, at === 6 ? ANCHOR[name] : "bl", { tone: cur ? "red" : at === 6 ? "white" : "grey", opacity: cur || at === 6 ? 1 : 0.8 });
        if (cur) curRect = r;
        if (at === 6) {
          // wide shot: name and value inside each block, source under its place
          var fsV = ph ? 11 : r.w > 150 ? 22 : 16, fsL = ph ? 9 : 11;
          if (!ph) {
            c.div(r.x + 10, r.y + 9, r.w - 14, pl.label, TX.labelW + ";font-size:" + fsL + "px;letter-spacing:0.1em");
            c.div(r.x + 10, r.y + 9 + fsL + 7, r.w - 14, pl.value, TX.value + ";font-size:" + fsV + "px");
            // near the right edge the source sits right-aligned under its block, clear of the frame's scan readout
            if (r.x > c.W - 300) c.div(r.x + r.w - 220, q.y + 7, 220, pl.src + " ↗", TX.src + ";font-size:10px;text-align:right");
            else c.div(r.x, q.y + 7, Math.min(260, c.W - r.x - 8), pl.src + " ↗", TX.src + ";font-size:10px");
          } else {
            var nx = r.x + r.w + 26 > st.x + st.w ? r.x - 21 : r.x + r.w + 3;
            c.div(nx, r.y - 3, 20, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0.02em");
          }
        } else if (!cur && !ph && safe(c, q)) {
          c.div(q.x + 8, q.y + 6, null, pl.label, TX.src + ";font-size:11px;letter-spacing:0.1em");
        }
      });
      if (at >= 0 && at < 6) {
        if (!ph) {
          gridLabels(c, cam, { lonAt: 856, x0: 430, x1: 1380 });
          gridLabels(c, cam, { latAt: 1390, y0: 160, y1: 280 });
          gridLabels(c, cam, { latAt: 1390, y0: 600, y1: 840 });
        } else {
          gridLabels(c, cam, { lonAt: st.y + st.h - 4, x0: st.x, x1: st.x + st.w - 44 });
          gridLabels(c, cam, { latAt: st.x + st.w - 46, y0: st.y + 40, y1: st.y + st.h - 30 });
        }
      }
      clipOff(c);

      // ── text
      var cur = at >= 0 && at < 6 ? info[at] : null;
      if (!ph) {
        if (p < STOP_P[0]) {
          c.div(120, 76, 600, x.kicker, TX.labelW);
          c.div(116, 104, 900, x.title, TX.title + ";font-size:64px");
          c.div(120, 184, 560, x.mixed, TX.body);
        } else if (at === 6) {
          c.div(120, 76, 330, x.kicker, TX.labelW);
          c.div(120, 104, 330, x.mixed, TX.bodySm);
        } else {
          c.div(120, 76, 600, x.kicker, TX.labelW);
          c.div(120, 104, 600, x.mixed, TX.bodySm);
          // spec figure for the current place
          var sx = 960, sy = 300;
          // thin leader from the block's top-right corner to the spec figure
          if (curRect) c.svg(S.leader([[curRect.x + curRect.w, curRect.y], [sx - 18, sy], [sx, sy]]));
          c.svg(S.line(sx, sy, sx + 400, sy, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(sx, sy + 12, 400, cur.label + ' <span style="color:' + T.grey + '">· ' + c.label(pad2(at + 1) + " / " + pad2(ROUTE.length), "stop number") + "</span>", TX.labelW + ";font-size:13px");
          c.div(sx - 5, sy + 40, null, cur.value, TX.giant + ";font-size:112px");
          c.div(sx, sy + 158, 400, cur.note, TX.body);
          c.div(sx, sy + 252, 400, cur.src + " ↗", TX.src);
          // travel log: every place reached so far keeps its figure
          var ly = 676;
          c.div(120, ly, 300, c.label("ROUTE", "travel-log heading"), TX.label + ";font-size:11px");
          info.forEach(function (pl, i) {
            var y = ly + 24 + i * 24, on = i <= at;
            c.div(120, y, 30, c.label(pad2(i + 1), "travel-log number"), TX.src + ";color:" + (i === at ? T.white : T.grey));
            c.div(152, y, 150, pl.label, TX.src + ";letter-spacing:0.1em;color:" + (i === at ? T.white : T.grey));
            if (on) c.div(270, y - 2, 120, pl.value, TX.value + ";font-size:15px;color:" + (i === at ? T.white : T.soft));
          });
        }
      } else {
        var tb = c.textBox;
        if (p < STOP_P[0]) {
          c.div(tb.x, tb.y, tb.w, x.kicker, TX.labelW + ";font-size:11px");
          c.div(tb.x, tb.y + 24, tb.w, x.title, TX.title + ";font-size:34px");
          c.div(tb.x, tb.y + 70, tb.w, x.mixed, TX.bodySm + ";font-size:15px");
        } else if (at === 6) {
          // stacked label rail at the top of the stage, numbered to match the blocks
          info.forEach(function (pl, i) {
            var col = i % 2, row = Math.floor(i / 2);
            var rx = st.x + 4 + col * 172, ry = st.y + 10 + row * 30;
            c.div(rx, ry + 2, 24, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0.04em");
            c.div(rx + 24, ry + 2, 90, pl.label, TX.label + ";font-size:10px;letter-spacing:0.08em");
            c.div(rx + 96, ry, 70, pl.value, TX.value + ";font-size:15px");
          });
          c.div(tb.x, tb.y, tb.w, x.kicker, TX.labelW + ";font-size:11px");
          c.div(tb.x, tb.y + 26, tb.w, x.mixed, TX.bodySm + ";font-size:15px");
        } else {
          // one location at a time
          c.div(st.x + 4, st.y + 10, 200, c.label(pad2(at + 1) + " / " + pad2(ROUTE.length), "stop number"), TX.labelW + ";font-size:10px");
          c.div(tb.x, tb.y, tb.w, cur.label, TX.labelW + ";font-size:11px");
          c.div(tb.x - 2, tb.y + 22, tb.w, cur.value, TX.giant + ";font-size:52px");
          c.div(tb.x, tb.y + 84, tb.w, cur.note, TX.bodySm + ";font-size:15px");
          c.div(tb.x, tb.y + 140, tb.w, cur.src + " ↗", TX.src + ";font-size:10px");
        }
      }
      c.chrome();
      // State: the map plane's on-screen bounds. Tone is the plane's own tone; other marks go in the note.
      c.state({
        form: p < 0.12 ? "sheet tipping into a map plane" : at === 6 ? "map plane tilted to the horizon" : "map plane (camera travelling)",
        x: planeBox.x, y: planeBox.y, w: planeBox.w, h: planeBox.h,
        tone: p < 0.12 ? "neutral paper; red edge draining" : "neutral paper, neutral edge",
        note: p < 0.12
          ? "tilt " + Math.round(cam.tilt / RAD) + "°. The map's area no longer means money. Places shown as points; no blocks yet."
          : at === 6
            ? "tilt " + Math.round(cam.tilt / RAD) + "°; far edge is the horizon. Six upright white-edged blocks at one fit (" + FIT + " $B per frame = S06's end scale). No colour on screen."
            : "camera at " + ROUTE[at] + ", tilt " + Math.round(cam.tilt / RAD) + "°. The current stop's block carries the one red edge; blocks already passed are grey. Fit " + Math.round(fitNow) + " (S06's end scale, camera " + (ph ? 2 : CLOSE) + "× closer).",
      });
    },

    // No-motion plate: the wide shot, plus every note and source (desktop: on the near plane; phone: a list).
    plate: function (c) {
      var T = c.T, TX = c.TX;
      if (c.desk) {
        this.draw(c);
        var y0 = 528;
        c.svg(SB.SVG.rect(300, y0 - 16, 1000, 290, { fill: T.ground, opacity: 0.88 }));
        ROUTE.forEach(function (name, i) {
          var pl = place(c, name), col = i % 2, row = Math.floor(i / 2);
          var x = 320 + col * 490, y = y0 + row * 92;
          c.div(x, y, 40, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:11px");
          c.div(x + 36, y, 420, pl.label + ' <span style="' + TX.value + ';letter-spacing:0;font-size:15px">' + pl.value + "</span>", TX.label + ";font-size:11px");
          c.div(x + 36, y + 22, 430, pl.note, TX.bodySm + ";font-size:15px;line-height:1.4");
        });
        return;
      }
      // phone: the six stops as a still list; each row keeps its block at true area, one fit for all
      var st = c.stage, x = texts(c);
      c.div(16, 14, 343, x.kicker, TX.labelW + ";font-size:10px");
      c.div(16, 32, 343, x.mixed, TX.bodySm + ";font-size:14px;line-height:1.4");
      var fit = 16887; // $B per 343×500 stage: Ukraine about 64×93
      ROUTE.forEach(function (name, i) {
        var pl = place(c, name), y = 92 + i * 118;
        c.svg(SB.SVG.line(16, y - 8, 359, y - 8, { stroke: T.rule }));
        var r = c.rung(pl.path, fit, { x: 16, y: y, w: st.w, h: st.h }, "tl");
        c.svg(SB.SVG.sheet(r.x, r.y, r.w, r.h, { tone: "white", mode: "edge", sw: 1 }));
        c.div(94, y, 30, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px");
        c.div(120, y, 140, pl.label, TX.label + ";font-size:10px");
        c.div(250, y - 3, 109, pl.value, TX.value + ";font-size:16px;text-align:right");
        c.div(94, y + 20, 265, pl.note, TX.bodySm + ";font-size:14px;line-height:1.35");
        c.div(94, y + 86, 265, pl.src + " ↗", TX.src + ";font-size:10px");
      });
      c.state({ form: "list of six stops (no-motion plate)", x: 16, y: 92, w: 343, h: 700, tone: "neutral", note: "each row carries its block at true area, one fit for all six (" + fit + " $B per 343×500 stage)" });
    },
  });
})();
