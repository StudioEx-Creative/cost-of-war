/* S07 · THE MAP · TRAVEL · 2.0 screens
   The $21.8T sheet from S06 tips back about its near edge and becomes a map
   plane: a latitude/longitude cross grid (no land outline in the repo yet).
   The plane settles into strong perspective, its grid running on past the
   sheet's edges to a horizon. The camera travels place to place by turning
   the plane under it (a slow rotation, stop by stop). At each stop a block
   lies on the real location, flat on the plane, at true area in the plane
   (conflictCosts[i].amtB at S06's end scale), and the place's note sits in
   the margin on a leader. At the end the camera pulls back and tilts up
   until the map's far edge is a horizon, all six blocks lying on it.
   Perspective foreshortens the blocks on screen, so a flat plan inset (FIG
   07.1) carries the route and the blocks at true area, without perspective.
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
  // How each block lies on its place: centred on it, or with one corner on it (keeps the Levant blocks apart).
  var ANCHOR = { Ukraine: "c", Syria: "bl", Iraq: "tl", Gaza: "tr", Yemen: "c", Sudan: "c" };
  // The plane turns under the camera as it travels, a quarter turn in all: north swings to the left.
  var YAW = [-14, -28, -42, -56, -70, -82];
  var YAW_WIDE = -90;
  // $B per full frame: S06's end scale ($21.8T = the frame). Read from data.js, never typed.
  function fitWide() { return SB.get("machineData[3].amtB"); }

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
  function pts(a) { return a.map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" "); }

  // The sheet as S06 left it, read as a map: centre (39°E, 32°N), 56° of latitude tall.
  function sheetBounds(ph) {
    var ppd0 = ph ? 500 / 56 : 900 / 56;
    var halfLat = (ph ? 250 : 450) / ppd0;
    var halfLon = (ph ? 171.5 : 720) / (ppd0 * KX);
    return { ppd0: ppd0, lon0: 39 - halfLon, lon1: 39 + halfLon, lat0: 32 - halfLat, lat1: 32 + halfLat };
  }

  /* ── The camera over the plane. cam: { lon, lat (focus), ppd (px per degree of latitude at the focus),
     tilt (0 = straight down), yaw (the plane's turn), sx, sy (where the focus lands), D (camera distance) }.
     Points behind the camera are clipped away, so lines can run out to the horizon. */
  function Cam(cam) {
    var ct = Math.cos(cam.tilt), stl = Math.max(1e-4, Math.sin(cam.tilt)), cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var dyMax = (cam.D * 0.86) / stl;
    function plane(lon, lat) {
      var ax = (lon - cam.lon) * KX * cam.ppd, ay = -(lat - cam.lat) * cam.ppd;
      return { dx: ax * cy - ay * sy, dy: ax * sy + ay * cy };
    }
    function scr(q) { var f = cam.D / (cam.D - q.dy * stl); return { x: cam.sx + q.dx * f, y: cam.sy + q.dy * ct * f, f: f }; }
    function cut(a, b) { var t = (dyMax - a.dy) / (b.dy - a.dy); return { dx: a.dx + (b.dx - a.dx) * t, dy: dyMax }; }
    return {
      cam: cam,
      horizon: cam.sy - (cam.D * ct) / stl,
      pt: function (lon, lat) { var q = plane(lon, lat); if (q.dy > dyMax) q.dy = dyMax; return scr(q); },
      line: function (a, b) {
        var A = plane(a[0], a[1]), B = plane(b[0], b[1]);
        if (A.dy > dyMax && B.dy > dyMax) return null;
        if (A.dy > dyMax) A = cut(B, A);
        else if (B.dy > dyMax) B = cut(A, B);
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
  function lerpCam(a, b, t) {
    return {
      lon: lerp(a.lon, b.lon, t), lat: lerp(a.lat, b.lat, t), ppd: SB.fitBetween(a.ppd, b.ppd, t),
      tilt: lerp(a.tilt, b.tilt, t), yaw: lerp(a.yaw, b.yaw, t),
      sx: lerp(a.sx, b.sx, t), sy: lerp(a.sy, b.sy, t), D: lerp(a.D, b.D, t),
    };
  }

  // Each place's block in degrees: at S06's end scale, in the plane, anchored on the place.
  function blockGeo(c, name, path) {
    var ph = c.phone, sb = sheetBounds(ph), g = GEO[name], an = ANCHOR[name];
    var W = ph ? 343 : 1440, H = ph ? 500 : 900;
    var a = SB.area(SB.get(path), fitWide(), { w: W, h: H });
    // plane px (at ppd0) → degrees
    var wDeg = a.w / (sb.ppd0 * KX), hDeg = a.h / sb.ppd0;
    var lonL = an === "c" ? g[0] - wDeg / 2 : an[1] === "l" ? g[0] : g[0] - wDeg;
    var latB = an === "c" ? g[1] - hDeg / 2 : an[0] === "b" ? g[1] : g[1] - hDeg;
    // logged at true area: the same rect in plane px, the frame at S06's end scale
    var px = (lonL - sb.lon0) * sb.ppd0 * KX, py = (sb.lat1 - latB - hDeg) * sb.ppd0;
    c.rung(path, fitWide(), { x: px, y: py, w: W, h: H }, "tl");
    return { lon0: lonL, lon1: lonL + wDeg, lat0: latB, lat1: latB + hDeg, wDeg: wDeg, hDeg: hDeg };
  }
  function corners(b) { return [[b.lon0, b.lat1], [b.lon1, b.lat1], [b.lon1, b.lat0], [b.lon0, b.lat0]]; }

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

  function texts(c) {
    return {
      kicker: c.copy("Chapter 02 · The Impact of War", "index.html:562").toUpperCase(),
      title: c.copy("Destruction", "index.html:575").toUpperCase(),
      mixed: c.newCopy("These are mixed estimates: reconstruction needs, damage and economic loss.",
        "brief S07 asks to keep 'mixed estimates' wording; none exists on the page (only a data.js comment). Replaces the page's '$bn needed' heading at index.html:579, which calls all six 'needed' (audit F12/F14)"),
    };
  }

  /* ── The plane, drawn through the camera ─────────────────────────────── */
  // Ground grid out to the horizon, the map sheet lit on it, its grid, its edge.
  function drawPlane(c, P, o) {
    var T = c.T, S = SB.SVG, sb = sheetBounds(c.phone), ph = c.phone;
    var v = ph ? c.stage : { x: 0, y: 0, w: c.W, h: c.H };
    var hy = P.horizon, id = o.id;
    var g = "", lon, lat, L;
    // fade toward the horizon, so the grid thins into distance instead of knotting
    c.svg('<defs><linearGradient id="' + id + 'g" gradientUnits="userSpaceOnUse" x1="0" y1="' + hy.toFixed(1) + '" x2="0" y2="' + (hy + (ph ? 120 : 220)).toFixed(1) + '">' +
      '<stop offset="0" stop-color="' + T.white + '" stop-opacity="0"/><stop offset="1" stop-color="' + T.white + '" stop-opacity="1"/></linearGradient>' +
      '<mask id="' + id + 'm" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="9000" height="9000"><rect x="-4000" y="-4000" width="9000" height="9000" fill="url(#' + id + 'g)"/></mask></defs>');
    c.svg('<g mask="url(#' + id + 'm)">');
    // the ground: the grid runs on past the sheet, faint
    var gA = (0.05 * (o.ground == null ? 1 : o.ground)).toFixed(3);
    if (gA > 0.002) {
      for (lon = -180; lon <= 180; lon += 5) { L = P.line([lon, -80], [lon, 89]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + gA + ")" }); }
      for (lat = -80; lat <= 85; lat += 5) { L = P.line([-180, lat], [180, lat]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + gA + ")" }); }
    }
    c.svg(g);
    // the sheet: lit paper lying on the ground
    var sheet = P.poly([[sb.lon0, sb.lat1], [sb.lon1, sb.lat1], [sb.lon1, sb.lat0], [sb.lon0, sb.lat0]]);
    c.svg('<polygon points="' + pts(sheet) + '" fill="url(#paper)"/>');
    g = "";
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) { L = P.line([lon, sb.lat0], [lon, sb.lat1]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + (o.gridA || 0.1) + ")" }); }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) { L = P.line([sb.lon0, lat], [sb.lon1, lat]); if (L) g += S.line(L[0].x, L[0].y, L[1].x, L[1].y, { stroke: "rgba(255,255,255," + (o.gridA || 0.1) + ")" }); }
    // tick crosses where the grid crosses (brand device), sized by depth
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5)
      for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
        var q = P.pt(lon, lat);
        if (q.x < v.x - 20 || q.x > v.x + v.w + 20 || q.y < hy || q.y > v.y + v.h + 20) continue;
        var t = Math.max(1.5, 3.5 * Math.min(1.5, q.f));
        g += S.path("M" + (q.x - t) + " " + q.y + " H" + (q.x + t) + " M" + q.x + " " + (q.y - t) + " V" + (q.y + t), { stroke: "rgba(255,255,255,0.26)" });
      }
    c.svg(g);
    c.svg('<polygon points="' + pts(sheet) + '" fill="none" stroke="' + T.sheetLine + '" stroke-width="1"/>');
    c.svg("</g>");
    // the horizon itself: a hairline across the view (gone once the map's own far edge is the horizon)
    if (o.ground == null || o.ground > 0.05) c.svg(S.line(v.x, hy, v.x + v.w, hy, { stroke: "rgba(255,255,255," + (0.22 * (o.ground == null ? 1 : o.ground)).toFixed(3) + ")" }));
    return { sheet: sheet };
  }
  // A block lying flat on the plane: lit paper with an edge, and a hairline under its near side for thickness.
  function drawBlock(c, P, b, o) {
    var T = c.T, q = P.poly(corners(b));
    var col = o.tone === "red" ? T.red : o.tone === "white" ? T.white : T.grey;
    var under = q.map(function (p) { return { x: p.x, y: p.y + (c.phone ? 2 : 3) }; });
    c.svg('<polygon points="' + pts(under) + '" fill="none" stroke="rgba(255,255,255,0.16)"/>');
    c.svg('<polygon points="' + pts(q) + '" fill="url(#paper)" stroke="' + col + '" stroke-width="' + (o.sw || 1.5) + '" stroke-linejoin="round"' + (o.opacity != null ? ' opacity="' + o.opacity + '"' : "") + "/>");
    return q;
  }
  function bbox(q) {
    var xs = q.map(function (p) { return p.x; }), ys = q.map(function (p) { return p.y; });
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
  }
  // The block's corner that reaches out toward the margin (largest x + small y), for leaders.
  function reach(q, dir) {
    var best = q[0];
    q.forEach(function (p) { if ((dir || 1) * p.x - 0.35 * p.y > (dir || 1) * best.x - 0.35 * best.y) best = p; });
    return best;
  }
  // Coordinate labels where grid lines cross a screen line (positions, not figures).
  function gridLabels(c, P, o) {
    var sb = sheetBounds(c.phone), TX = c.TX, lon, lat, st = TX.src + ";font-size:10px;opacity:0.85";
    var deg = function (v, h) { return c.label(Math.abs(v) + "°" + h, "map grid coordinate, not a figure"); };
    var seen = [];
    function put(x, y, s) {
      for (var i = 0; i < seen.length; i++) if (Math.abs(seen[i][0] - x) < 46 && Math.abs(seen[i][1] - y) < 16) return;
      seen.push([x, y]);
      c.div(x, y, 44, s, st);
    }
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) {
      var L = P.line([lon, sb.lat0], [lon, sb.lat1]);
      if (!L) continue;
      var a = L[0], b = L[1];
      if (o.atY != null) {
        var t = (o.atY - a.y) / (b.y - a.y);
        if (t >= 0 && t <= 1) { var x = a.x + (b.x - a.x) * t; if (x > o.x0 && x < o.x1) put(x + 4, o.atY - 15, deg(lon, "E")); }
      }
      if (o.atX != null) {
        var u = (o.atX - a.x) / (b.x - a.x);
        if (u >= 0 && u <= 1) { var y = a.y + (b.y - a.y) * u; if (y > o.y0 && y < o.y1) put(o.atX + 4, y - 15, deg(lon, "E")); }
      }
    }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) {
      var M = P.line([sb.lon0, lat], [sb.lon1, lat]);
      if (!M) continue;
      var p0 = M[0], p1 = M[1];
      if (o.atY != null) {
        var t2 = (o.atY - p0.y) / (p1.y - p0.y);
        if (t2 >= 0 && t2 <= 1) { var x2 = p0.x + (p1.x - p0.x) * t2; if (x2 > o.x0 && x2 < o.x1) put(x2 + 4, o.atY - 15, deg(lat, "N")); }
      }
      if (o.atX != null) {
        var u2 = (o.atX - p0.x) / (p1.x - p0.x);
        if (u2 >= 0 && u2 <= 1) { var y2 = p0.y + (p1.y - p0.y) * u2; if (y2 > o.y0 && y2 < o.y1) put(o.atX + 4, y2 - 15, deg(lat, "N")); }
      }
    }
  }

  /* ── Marginalia ──────────────────────────────────────────────────────── */
  function figChip(c, x, y, text) {
    var w = text.length * 7.3 + 12;
    c.uiSvg(SB.SVG.rect(x, y - 15, w, 15, { fill: c.T.white }));
    c.uiDiv(x + 6, y - 13, w, text, c.TX.label + ";font-size:10px;color:" + c.T.ground + ";letter-spacing:0.1em;font-weight:600;white-space:nowrap");
  }
  /* FIG 07.1: the region flat, no perspective. Route so far (dashed), reached blocks at true area
     (same geographic scale as the plane), the current one outlined in white, the rest as points. */
  function planInset(c, box, info, at, o) {
    var S = SB.SVG, T = c.T, TX = c.TX, ph = c.phone;
    var R = { lon0: 21, lon1: 57, lat0: 11, lat1: 56 };
    var k = Math.min(box.w / ((R.lon1 - R.lon0) * KX), box.h / (R.lat1 - R.lat0)); // px per degree of latitude
    var ox = box.x + (box.w - (R.lon1 - R.lon0) * KX * k) / 2, oy = box.y + (box.h - (R.lat1 - R.lat0) * k) / 2;
    function m(lon, lat) { return { x: ox + (lon - R.lon0) * KX * k, y: oy + (R.lat1 - lat) * k }; }
    var s = S.rect(box.x, box.y, box.w, box.h, { fill: T.ground, opacity: 0.9 });
    for (var lon = 25; lon <= 55; lon += 10) { var a = m(lon, R.lat0), b = m(lon, R.lat1); s += S.line(a.x, Math.max(a.y, box.y), b.x, b.y, { stroke: "rgba(255,255,255,0.08)" }); }
    for (var lat = 15; lat <= 55; lat += 10) { var a2 = m(R.lon0, lat), b2 = m(R.lon1, lat); s += S.line(Math.max(a2.x, box.x), a2.y, Math.min(b2.x, box.x + box.w), b2.y, { stroke: "rgba(255,255,255,0.08)" }); }
    var route = [];
    ROUTE.forEach(function (name, i) {
      var g = GEO[name], q = m(g[0], g[1]);
      if (i <= at) route.push(q);
    });
    if (route.length > 1) s += S.path("M" + route.map(function (q) { return q.x.toFixed(1) + " " + q.y.toFixed(1); }).join(" L"), { stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "2 3" });
    ROUTE.forEach(function (name, i) {
      var g = GEO[name], q = m(g[0], g[1]);
      if (i <= at) {
        var b = info[i].geo, p0 = m(b.lon0, b.lat1), p1 = m(b.lon1, b.lat0);
        s += S.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, { fill: "none", stroke: i === at && o.current ? T.white : "rgba(255,255,255,0.55)", "stroke-width": 1 });
      }
      s += S.rect(q.x - 1.5, q.y - 1.5, 3, 3, { fill: i <= at ? T.white : T.grey });
    });
    s += S.rect(box.x - 6.5, box.y - 6.5, box.w + 13, box.h + 13, { fill: "none", stroke: T.white, "stroke-width": 1 });
    c.uiSvg(s);
    figChip(c, box.x - 7, box.y - 7, o.chip);
    // numbers beside each reached place, set just outside its own block (right, left, below, above) where
    // they cross no block outline, no place point and no other number; a big block takes its number inside
    var lw = ph ? 13 : 15, lh = 11, rects = [], dots = [], taken = [], legs = [];
    ROUTE.forEach(function (name, i) {
      var g = GEO[name], q = m(g[0], g[1]);
      dots.push({ x0: q.x - 2, y0: q.y - 2, x1: q.x + 2, y1: q.y + 2 });
      if (i && i <= at) legs.push([route[i - 1], q]); // the dashed route, leg by leg
      if (i <= at) { var b = info[i].geo, p0 = m(b.lon0, b.lat1), p1 = m(b.lon1, b.lat0); rects[i] = { x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y }; }
    });
    function clash(r, own) {
      if (r.x0 < box.x + 1 || r.x1 > box.x + box.w - 1 || r.y0 < box.y + 1 || r.y1 > box.y + box.h - 1) return true;
      var hit = function (b, pad) { return r.x0 < b.x1 + pad && r.x1 > b.x0 - pad && r.y0 < b.y1 + pad && r.y1 > b.y0 - pad; };
      for (var k = 0; k < rects.length; k++) {
        var b = rects[k];
        if (!b) continue;
        // a block's outline is in the way unless the number lies wholly inside or wholly outside it
        var inside = r.x0 > b.x0 + 1 && r.x1 < b.x1 - 1 && r.y0 > b.y0 + 1 && r.y1 < b.y1 - 1;
        if (!inside && hit(b, 1.5)) return true;
        if (inside && k !== own) return true;
      }
      for (k = 0; k < dots.length; k++) if (k !== own && hit(dots[k], 1)) return true;
      for (k = 0; k < taken.length; k++) if (hit(taken[k], 1.5)) return true;
      for (k = 0; k < legs.length; k++) {
        var a = legs[k][0], e = legs[k][1], n = Math.ceil(Math.hypot(e.x - a.x, e.y - a.y) / 1.5);
        for (var s = 0; s <= n; s++) {
          var px = a.x + ((e.x - a.x) * s) / n, py = a.y + ((e.y - a.y) * s) / n;
          if (px > r.x0 - 2 && px < r.x1 + 2 && py > r.y0 - 2 && py < r.y1 + 2) return true;
        }
      }
      return false;
    }
    ROUTE.forEach(function (name, i) {
      if (i > at) return;
      var g = GEO[name], q = m(g[0], g[1]), b = rects[i], my = (b.y0 + b.y1) / 2 - lh / 2;
      var cands = [
        { x: q.x - lw - 3, y: q.y - lh / 2 }, { x: q.x + 4, y: q.y - lh - 2 }, // inside a big block, beside its point
        { x: b.x1 + 3, y: my }, { x: b.x0 - lw - 3, y: my }, { x: (b.x0 + b.x1) / 2 - lw / 2, y: b.y1 + 2 }, { x: (b.x0 + b.x1) / 2 - lw / 2, y: b.y0 - lh - 2 },
      ];
      var pick = null;
      for (var k = 0; k < cands.length && !pick; k++) {
        var r = { x0: cands[k].x, y0: cands[k].y, x1: cands[k].x + lw, y1: cands[k].y + lh };
        if (k < 2 && !(r.x0 > b.x0 + 1 && r.x1 < b.x1 - 1 && r.y0 > b.y0 + 1 && r.y1 < b.y1 - 1)) continue;
        if (!clash(r, i)) pick = r;
      }
      if (!pick) pick = { x0: b.x1 + 3, y0: my, x1: b.x1 + 3 + lw, y1: my + lh };
      taken.push(pick);
      c.uiDiv(pick.x0, pick.y0 - 1, lw + 4, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0;line-height:1.2;color:" + (i === at && o.current ? T.white : T.soft));
    });
    return m;
  }

  /* ── Camera path ─────────────────────────────────────────────────────── */
  function stopCam(c, i) {
    var ph = c.phone, st = c.stage, name = ROUTE[i], g = GEO[name];
    return ph
      ? { lon: g[0], lat: g[1], ppd: 23, tilt: 54 * RAD, yaw: YAW[i] * RAD, sx: st.x + 150, sy: st.y + 320, D: 420 }
      : { lon: g[0], lat: g[1], ppd: 26, tilt: 56 * RAD, yaw: YAW[i] * RAD, sx: 400, sy: 580, D: 660 };
  }
  function wideCam(c) {
    var ph = c.phone, st = c.stage;
    return ph
      ? { lon: 38.2, lat: 32.4, ppd: 7.4, tilt: 54 * RAD, yaw: YAW_WIDE * RAD, sx: st.x + 170, sy: st.y + 300, D: 640 }
      : { lon: 39.2, lat: 31.8, ppd: 21, tilt: 62 * RAD, yaw: YAW_WIDE * RAD, sx: 700, sy: 590, D: 1400 };
  }
  // the tip's end: the whole sheet in strong perspective, north up, before the swoop to the first stop
  function tipCam(c) {
    var ph = c.phone, st = c.stage;
    return ph
      ? { lon: 39, lat: 30, ppd: 8.9, tilt: 58 * RAD, yaw: 0, sx: st.x + 171, sy: st.y + 330, D: 520 }
      : { lon: 39, lat: 30, ppd: 16, tilt: 58 * RAD, yaw: 0, sx: 720, sy: 560, D: 900 };
  }
  function camAt(c, p) {
    if (p <= STOP_P[0]) return lerpCam(tipCam(c), stopCam(c, 0), ease((p - 0.12) / (STOP_P[0] - 0.12)));
    for (var i = 0; i < 5; i++) {
      if (p <= STOP_P[i + 1]) {
        var seg = (p - STOP_P[i]) / (STOP_P[i + 1] - STOP_P[i]);
        return lerpCam(stopCam(c, i), stopCam(c, i + 1), ease((seg - 0.35) / 0.65)); // dwell, then travel
      }
    }
    if (p <= 0.8) return stopCam(c, 5);
    return lerpCam(stopCam(c, 5), wideCam(c), ease((p - 0.8) / 0.2));
  }
  // Which stop the camera is at (−1 before the first landing; 6 = all landed, the wide shot).
  function stopAt(p) {
    if (p < STOP_P[0]) return -1;
    if (p > 0.8) return 6;
    for (var i = 5; i >= 0; i--) if (p >= STOP_P[i]) return i;
    return -1;
  }

  /* ── The tip (p < 0.12): S06's own sheet and camera, carried on in 3D ── */
  // A mirror of sb.js's c.tilt, as in S06, so the tip starts exactly where S06 ends.
  function tiltMap(c, o) {
    var d = o.persp, ox = c.W / 2, oy = c.H / 2;
    var a = o.rx * RAD, g = o.rz * RAD;
    var ca = Math.cos(a), sa = Math.sin(a), cg = Math.cos(g), sg = Math.sin(g);
    var R00 = cg, R01 = -sg, R10 = ca * sg, R11 = ca * cg, R20 = sa * sg, R21 = sa * cg;
    return {
      to: function (x, y) { var u = x - ox, v = y - oy, w = 1 - (R20 * u + R21 * v) / d; return { x: ox + (R00 * u + R01 * v) / w, y: oy + (R10 * u + R11 * v) / w }; },
      from: function (X, Y) {
        var xp = X - ox, yp = Y - oy;
        var a11 = R00 + (xp * R20) / d, a12 = R01 + (xp * R21) / d, a21 = R10 + (yp * R20) / d, a22 = R11 + (yp * R21) / d, det = a11 * a22 - a12 * a21;
        return { x: ox + (xp * a22 - a12 * yp) / det, y: oy + (a11 * yp - a21 * xp) / det };
      },
    };
  }
  // S06's end pose (scenes/s06.js CAM[2]) and where this tip ends.
  var S06_END = { desk: { rx: 40, rz: -5, persp: 900, corner: [110, 650], Z: 0.9 }, phone: { rx: 32, rz: -4, persp: 800, corner: [30, 506], Z: 1.0 } };
  var TIP_END = { desk: { rx: 58, rz: 0, persp: 860 }, phone: { rx: 52, rz: 0, persp: 760 } };
  function drawTip(c, p, x) {
    var T = c.T, TX = c.TX, S = SB.SVG, ph = c.phone, st = c.stage, sb = sheetBounds(ph);
    var E = S06_END[ph ? "phone" : "desk"], F = TIP_END[ph ? "phone" : "desk"], t = ease(p / 0.12);
    var o = { rx: lerp(E.rx, F.rx, t), rz: lerp(E.rz, F.rz, t), persp: lerp(E.persp, F.persp, t) };
    var tm = tiltMap(c, o);
    c.tilt(o);
    var A = tm.from(E.corner[0], E.corner[1]); // the near corner stays put: the sheet tips about its near edge
    var box = { x: A.x, y: A.y - st.h * E.Z, w: st.w * E.Z, h: st.h * E.Z };
    function w(lon, lat) { return { x: box.x + ((lon - sb.lon0) / (sb.lon1 - sb.lon0)) * box.w, y: box.y + ((sb.lat1 - lat) / (sb.lat1 - sb.lat0)) * box.h }; }
    // phone: the stage, carried back into the tilted world, clips it
    if (ph) {
      var cl = [[st.x, st.y], [st.x + st.w, st.y], [st.x + st.w, st.y + st.h], [st.x, st.y + st.h]].map(function (q) { var v = tm.from(q[0], q[1]); return v.x.toFixed(1) + "," + v.y.toFixed(1); });
      c.svg('<defs><clipPath id="s07tip"><polygon points="' + cl.join(" ") + '"/></clipPath></defs><g clip-path="url(#s07tip)">');
    }
    c.svg(S.rect(box.x, box.y, box.w, box.h, { fill: "url(#paper)", filter: "url(#sheetShadow)" }));
    var g = "", lon, lat, a, b;
    var ga = 0.03 + 0.08 * t;
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5) { a = w(lon, sb.lat0); b = w(lon, sb.lat1); g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + ga.toFixed(3) + ")" }); }
    for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) { a = w(sb.lon0, lat); b = w(sb.lon1, lat); g += S.line(a.x, a.y, b.x, b.y, { stroke: "rgba(255,255,255," + ga.toFixed(3) + ")" }); }
    for (lon = Math.ceil(sb.lon0 / 5) * 5; lon <= sb.lon1; lon += 5)
      for (lat = Math.ceil(sb.lat0 / 5) * 5; lat <= sb.lat1; lat += 5) { a = w(lon, lat); g += S.path("M" + (a.x - 3) + " " + a.y + " H" + (a.x + 3) + " M" + a.x + " " + (a.y - 3) + " V" + (a.y + 3), { stroke: "rgba(255,255,255," + (0.08 + 0.16 * t).toFixed(3) + ")" }); }
    c.svg(g);
    // the ladder in the sheet's corner tips away with it, unlabelled and fading (it returns in S11)
    ["DEFENCE", "topSpenders[0].amt", "machineData[1].amtB", "issueData[0].cost"].forEach(function (path, i) {
      var r = SB.rungAt(SB.get(path), fitWide(), box, "bl");
      c.svg(S.rect(r.x, r.y, r.w, r.h, { fill: "none", stroke: i === 3 ? T.blue : T.red, "stroke-opacity": (0.5 * (1 - t) + 0.08).toFixed(3) }));
    });
    // S06's printed figure, going with the money meaning of the sheet
    var s06 = tiltMap(c, E), A6 = s06.from(E.corner[0], E.corner[1]);
    var P6 = s06.from(ph ? st.x + 14 : 236, ph ? st.y + 262 : 352);
    var q0 = s06.to(P6.x, P6.y), q1 = s06.to(P6.x + 100, P6.y), sc = Math.hypot(q1.x - q0.x, q1.y - q0.y) / 100;
    var size6 = (ph ? 284 : 960) / (3.55 * sc), b6 = st.w * E.Z;
    var px = box.x + ((P6.x - A6.x) / b6) * box.w, py = box.y + box.h - ((A6.y - P6.y) / (st.h * E.Z)) * box.h;
    c.svg('<text x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" font-family="' + c.F.display + '" font-size="' + ((size6 * box.w) / b6).toFixed(1) + '" letter-spacing="-0.02em" fill="' + T.white + '" opacity="' + (0.5 * (1 - t)).toFixed(3) + '">' + c.fig("machineData[3].amt", "raw") + "</text>");
    // the sheet's edge: red while it is still the $21.8T sheet, draining to neutral
    c.svg(S.rect(box.x + 1, box.y + 1, box.w - 2, box.h - 2, { fill: "none", stroke: T.red, "stroke-width": 2, "stroke-opacity": ((1 - t) * 0.85 + 0.15).toFixed(3) }));
    c.svg(S.rect(box.x, box.y, ph ? 8 : 12, ph ? 8 : 12, { fill: T.red, opacity: (1 - t).toFixed(3) }));
    if (ph) c.svg("</g>");
    // six places as plain points, named flat beside them
    var places = [];
    ROUTE.forEach(function (name) {
      var g6 = GEO[name], q = tm.to(w(g6[0], g6[1]).x, w(g6[0], g6[1]).y);
      places.push({ name: name, q: q });
    });
    places.forEach(function (pl, i) {
      c.uiSvg(S.rect(pl.q.x - 2.5, pl.q.y - 2.5, 5, 5, { fill: T.soft }));
      var left = pl.name === "Gaza" || pl.q.x > c.W - 100;
      var dy = ph && pl.name === "Syria" ? -12 : ph && pl.name === "Iraq" ? 4 : 0;
      c.uiDiv(left ? pl.q.x - 98 : pl.q.x + 8, pl.q.y - 7 + dy, 90, c.fig("conflictCosts[" + idx(pl.name) + "].name", "raw").toUpperCase(), TX.src + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0.1em;color:" + T.soft + (left ? ";text-align:right" : ""));
    });
    var quad = [tm.to(box.x, box.y), tm.to(box.x + box.w, box.y), tm.to(box.x + box.w, box.y + box.h), tm.to(box.x, box.y + box.h)];
    return { quad: quad, tilt: o.rx };
  }

  SB.scene({
    order: 7,
    id: "S07",
    name: "The Map",
    move: "TRAVEL",
    screens: 2.0,
    restrained: false,
    anchor: "#impact",
    trigger: "#impact top (Chapter 02), straight after S06's $21.8T sheet leans back.",
    camera: "The sheet tips on back about its near edge (from S06's 40° to about 58°) and becomes a map plane in strong perspective, its grid running on to a horizon. Then the camera travels stop to stop (Ukraine, Syria, Sudan, Yemen, Iraq, Gaza: the brief's order, largest first), the plane turning under it a little more at each stop (a quarter turn in all). At the end it pulls back and tilts up until the map's far edge is the horizon.",
    reason:
      "Tipping the sheet into a map moves the story from one global total to the places where war's damage lands. Tilting up to the horizon then lifts the eye off the ground into the air above it, where S08 shows what war puts into the atmosphere.",
    frames: [
      { k: "in", p: 0.08, cap: "Entry. The $21.8T sheet tips on back about its near edge and becomes a map: a latitude/longitude cross grid. Its red edge and printed figure drain as its area stops meaning money. Six places appear as plain points. The ladder in its corner tips away with it." },
      { k: "stop", p: 0.16, cap: "First stop: Ukraine. A block lies flat on the place at true area in the plane; its figure, note and source sit in the margin on a leader. A flat plan inset (bottom left) starts the route." },
      { k: "mid", p: 0.52, cap: "Fourth stop: Yemen, after Syria and Sudan. The plane has turned under the camera; the blocks already passed lie grey on it. The inset keeps the route and every block reached so far. Iraq and Gaza are still ahead." },
      { k: "out", p: 1, cap: "All six blocks lie on their places, one scale, numbered in the margin. The camera tilts up until the map's far edge is a horizon. The inset shows all six flat at true area, since perspective shrinks the far ones. S08 rises above the horizon." },
    ],

    draw: function (c) {
      var T = c.T, TX = c.TX, S = SB.SVG;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone, st = c.stage;
      var at = stopAt(p);
      var x = texts(c);
      c.flag("data", "land outline: Natural Earth 1:110m (public domain) to be added in phase 3 — needs approval to download");
      c.flag("decision", "The 'mixed estimates' line is new copy (audit F12/F14). The page's '$bn needed' heading (index.html:579) is not used, because Yemen is economic loss and Sudan is damage. Approve the wording.");
      c.flag("data", "Places sit at approximate country centroids (Gaza: the Strip). Coordinates are positions, not figures. Travel order is the brief's list.");

      var info = ROUTE.map(function (name) { var pl = place(c, name); pl.geo = blockGeo(c, name, pl.path); return pl; });
      var view = ph ? st : { x: 0, y: 0, w: c.W, h: c.H };

      // ── the tip: S06's sheet carried on in 3D
      if (p < 0.12) {
        var tip = drawTip(c, p, x);
        if (!ph) {
          c.uiDiv(116, 70, 600, x.kicker, TX.labelW);
          c.uiDiv(108, 92, null, x.title, TX.title + ";font-size:150px;line-height:0.86");
          c.uiDiv(116, 230, 560, x.mixed, TX.body);
        } else {
          var tb0 = c.textBox;
          c.uiDiv(tb0.x, tb0.y, tb0.w, x.kicker, TX.labelW + ";font-size:11px");
          c.uiDiv(tb0.x - 1, tb0.y + 22, tb0.w + 4, x.title, TX.title + ";font-size:41px");
          c.uiDiv(tb0.x, tb0.y + 70, tb0.w, x.mixed, TX.bodySm + ";font-size:15px");
        }
        c.chrome();
        var b0 = bbox(tip.quad);
        var bx0 = Math.max(view.x, b0.x0), by0 = Math.max(view.y, b0.y0);
        c.state({
          form: "sheet tipping into a map plane",
          x: Math.round(bx0), y: Math.round(by0), w: Math.round(Math.min(view.x + view.w, b0.x1) - bx0), h: Math.round(Math.min(view.y + view.h, b0.y1) - by0),
          tone: "neutral paper; red edge draining",
          note: "tilt " + Math.round(tip.tilt) + "° (from S06's 40°), about its near edge. The map's area no longer means money. Places shown as points; no blocks yet.",
        });
        return;
      }

      var cam = camAt(c, p), P = Cam(cam);
      if (ph) c.svg('<defs><clipPath id="s07clip"><rect x="' + st.x + '" y="' + st.y + '" width="' + st.w + '" height="' + st.h + '"/></clipPath></defs><g clip-path="url(#s07clip)">');
      var plane = drawPlane(c, P, { id: "s07p", gridA: 0.11, ground: p > 0.8 ? 1 - ease((p - 0.8) / 0.2) : 1 });
      // once it is the horizon, the map's far edge is drawn bright (S08 rises from it)
      var farEdge = null;
      if (at === 6) {
        var sbw = sheetBounds(ph), far = Math.cos(cam.yaw) > 0.7 ? [[sbw.lon0, sbw.lat1], [sbw.lon1, sbw.lat1]] : [[sbw.lon1, sbw.lat0], [sbw.lon1, sbw.lat1]];
        var FL = P.line(far[0], far[1]);
        if (FL) { farEdge = FL; c.svg(S.line(FL[0].x, FL[0].y, FL[1].x, FL[1].y, { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.25 })); }
      }

      // route on the plane: dashed, through the places reached
      var pos = {}, visited = [];
      ROUTE.forEach(function (name, i) { var g = GEO[name]; pos[name] = P.pt(g[0], g[1]); if (at >= i && at < 6) visited.push(pos[name]); });
      if (visited.length > 1) c.svg(S.path("M" + visited.map(function (q) { return q.x.toFixed(1) + " " + q.y.toFixed(1); }).join(" L"), { stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "3 5" }));

      // blocks on their places; places not reached are plain points
      var quads = [];
      ROUTE.forEach(function (name, i) {
        var q = pos[name];
        if (at < i) { if (q.y < view.y + view.h - (ph ? 8 : 64)) c.svg(S.rect(q.x - 2.5, q.y - 2.5, 5, 5, { fill: T.grey })); return; }
        var cur = i === at;
        quads[i] = drawBlock(c, P, info[i].geo, { tone: cur ? "red" : at === 6 ? "white" : "grey", sw: cur ? 1.75 : 1.25, opacity: cur || at === 6 ? 1 : 0.85 });
        // the place's point, kept out of the overlay's bottom band (crop marks, progress tick), as for places ahead
        if (q.y < view.y + view.h - (ph ? 8 : 64)) c.svg(S.rect(q.x - 2.5, q.y - 2.5, 5, 5, { fill: T.white }));
      });
      if (ph) c.svg("</g>");

      var cur = at >= 0 && at < 6 ? info[at] : null;
      // place names on the plane (flat), for the places not yet reached and the ones passed
      ROUTE.forEach(function (name, i) {
        if (at === 6 || i === at) return;
        var q = pos[name];
        if (q.x < view.x + 10 || q.x > view.x + view.w - (ph ? 70 : 90) || q.y < Math.max(view.y + (ph ? 30 : 140), P.horizon + 8) || q.y > view.y + view.h - (ph ? 20 : 70)) return;
        if (!ph && q.x > 740 && at < 6) return; // the margin column belongs to the note
        c.uiDiv(q.x + 8, q.y - 7, null, info[i].label, TX.src + ";font-size:" + (ph ? 10 : 11) + "px;letter-spacing:0.1em;white-space:nowrap" + (i < at ? ";color:" + T.soft : ""));
      });

      var bBox = null;
      if (!ph) {
        c.uiDiv(120, 70, 560, x.kicker, TX.labelW);
        c.uiDiv(120, 94, 560, x.mixed, TX.body + ";color:" + T.soft);
        if (cur) {
          // ── a stop: the block's figure, note and source in the margin, on a leader from its far corner
          var q = quads[at], R = reach(q), mx = 768, my = 214;
          c.uiSvg(S.leader([[R.x, R.y], [mx - 26, my], [mx, my]], { color: "rgba(255,255,255,0.55)" }));
          c.uiSvg(S.line(mx, my, mx + 590, my, { stroke: "rgba(255,255,255,0.32)" }));
          c.uiDiv(mx, my + 12, 560, cur.label + ' <span style="color:' + T.grey + '">· ' + c.label(pad2(at + 1) + " / " + pad2(ROUTE.length), "stop number") + "</span>", TX.labelW + ";font-size:13px");
          c.uiDiv(mx - 7, my + 36, null, cur.value, TX.giant + ";font-size:186px");
          c.uiDiv(mx, my + 222, 440, cur.note, TX.body);
          c.uiDiv(mx, my + 304, 420, cur.src + " ↗", TX.src);
          gridLabels(c, P, { atY: 830, x0: 80, x1: 740 });
          planInset(c, { x: 1206, y: 604, w: 150, h: 196 }, info, at, { current: true, chip: c.label("FIG 07.1 · ROUTE", "inset tag") });
          bBox = bbox(q);
        } else {
          // ── the wide shot: every block numbered in the margin
          // (the no-motion plate carries each note too, so its notes are taller)
          var spots = calloutSpots(c, quads, info, c.plate);
          spots.forEach(function (s, i) {
            // the leader runs up the note's left margin, so it never crosses the note's own lines
            var lpts = s.from.y > s.y + s.h ? [[s.from.x, s.from.y], [s.x - 10, s.y + s.h - 6], [s.x - 10, s.y + 9], [s.x - 4, s.y + 9]] : [[s.from.x, s.from.y], [s.x - 14, s.y + 9], [s.x - 4, s.y + 9]];
            c.uiSvg(S.leader(lpts, { color: "rgba(255,255,255,0.5)" }));
            c.uiSvg(S.rect(s.x + 0.5, s.y + 0.5, 17, 17, { fill: "none", stroke: "rgba(255,255,255,0.7)" }));
            c.uiDiv(s.x, s.y + 3, 18, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0;text-align:center;line-height:1");
            c.uiDiv(s.x + 26, s.y - 2, 220, info[i].label + ' <span style="' + TX.value + ';font-size:19px;letter-spacing:0">' + info[i].value + "</span>", TX.labelW + ";font-size:11px");
            if (c.plate) c.uiDiv(s.x + 26, s.y + 22, 250, info[i].note, TX.body + ";font-size:18px;line-height:1.3;color:" + T.soft);
            c.uiDiv(s.x + 26, s.y + (c.plate ? 22 + 23.4 * Math.ceil((info[i].note.length * 8.6) / 250) + 4 : 22), 250, info[i].src + " ↗", TX.src + ";font-size:10px");
          });
          planInset(c, { x: 1208, y: 176, w: 150, h: 196 }, info, 5, { current: false, chip: c.label("FIG 07.1 · PLAN · TRUE AREA", "inset tag") });
        }
      } else {
        var tb = c.textBox;
        if (cur) {
          // the stop number and the inset ride in the stage; the figure, note and source sit below on a leader
          var qp = quads[at], Rp = reach(qp), lx = tb.x;
          c.uiSvg(S.leader([[Rp.x, Rp.y], [Math.min(Rp.x + 30, st.x + st.w - 30), st.y + st.h + 4], [lx + 40, st.y + st.h + 4]], { color: "rgba(255,255,255,0.5)" }));
          c.uiDiv(tb.x, tb.y + 2, tb.w, cur.label + ' <span style="color:' + T.grey + '">· ' + c.label(pad2(at + 1) + " / " + pad2(ROUTE.length), "stop number") + "</span>", TX.labelW + ";font-size:11px");
          c.uiDiv(tb.x - 4, tb.y + 18, tb.w, cur.value, TX.giant + ";font-size:" + (at === 0 ? 92 : 100) + "px");
          c.uiDiv(tb.x, tb.y + 116, tb.w, cur.note, TX.bodySm + ";font-size:15px");
          c.uiDiv(tb.x, tb.y + 172, tb.w, cur.src + " ↗", TX.src + ";font-size:10px");
          planInset(c, { x: st.x + 14, y: st.y + 30, w: 74, h: 96 }, info, at, { current: true, chip: c.label("FIG 07.1", "inset tag") });
          gridLabels(c, P, { atY: st.y + st.h - 6, x0: st.x + 4, x1: st.x + st.w - 40 });
          bBox = bbox(qp);
        } else {
          // wide: each block numbered on the plane; the numbers, names and figures in the text box
          ROUTE.forEach(function (name, i) {
            var R = pos[name]; // the chip sits just above its own place
            var nx = Math.min(R.x + 3, st.x + st.w - 20), ny = Math.max(R.y - 18, st.y + 4);
            c.uiSvg(S.rect(nx + 0.5, ny + 0.5, 17, 14, { fill: T.ground, stroke: "rgba(255,255,255,0.7)" }));
            c.uiDiv(nx, ny + 2, 18, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0;text-align:center;line-height:1");
          });
          c.uiDiv(tb.x, tb.y - 4, tb.w, x.kicker, TX.labelW + ";font-size:10px");
          c.uiDiv(tb.x, tb.y + 14, tb.w, x.mixed, TX.bodySm + ";font-size:14px;line-height:1.35");
          info.forEach(function (pl, i) {
            var col = i % 2, row = Math.floor(i / 2), rx = tb.x + col * 176, ry = tb.y + 72 + row * 28;
            c.uiDiv(rx, ry + 2, 22, c.label(pad2(i + 1), "travel-log number"), TX.labelW + ";font-size:10px;letter-spacing:0.02em");
            c.uiDiv(rx + 24, ry + 2, 150, pl.label + ' <span style="' + TX.value + ';font-size:15px;letter-spacing:0">' + pl.value + "</span>", TX.label + ";font-size:10px;letter-spacing:0.08em");
          });
        }
      }
      c.chrome();
      // State: the map plane's on-screen bounds. Tone is the plane's own tone; other marks go in the note.
      var pb = bbox(plane.sheet);
      var x0 = Math.max(view.x, pb.x0), y0 = Math.max(view.y, pb.y0, P.horizon);
      c.state({
        form: at === 6 ? "map plane tilted to the horizon" : "map plane (camera travelling)",
        x: Math.round(x0), y: Math.round(y0), w: Math.round(Math.min(view.x + view.w, pb.x1) - x0), h: Math.round(Math.min(view.y + view.h, pb.y1) - y0),
        tone: "neutral paper, neutral edge",
        note: at === 6
          ? "tilt " + Math.round(cam.tilt / RAD) + "°, plane turned " + Math.round(-cam.yaw / RAD) + "°; far edge is the horizon. Six white-edged blocks lie flat at one fit (" + fitWide() + " $B per frame = S06's end scale), true area in the plane; FIG 07.1 shows them flat. No colour on screen."
          : "camera at " + ROUTE[at] + ", tilt " + Math.round(cam.tilt / RAD) + "°, plane turned " + Math.round(-cam.yaw / RAD) + "°. The current block lies flat with the one red edge; blocks already passed are grey. Fit " + fitWide() + " (S06's end scale) in the plane; the camera is closer, not the blocks bigger." + (bBox ? " Block on screen about " + Math.round(bBox.x1 - bBox.x0) + "×" + Math.round(bBox.y1 - bBox.y0) + "." : ""),
      });
    },

    // No-motion plate: the wide shot, every block's note and source in its margin note (desktop); phone: a list.
    plate: function (c) {
      var T = c.T, TX = c.TX;
      if (c.desk) {
        this.draw(c);
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

  /* Wide-shot callouts (desktop): each block gets a numbered margin note on a leader, placed beside
     its own block (above, below, right or left: the first spot that is clear of every block, every
     other note and the inset), largest block first. */
  function calloutSpots(c, quads, info, tall) {
    var W = tall ? 280 : 238, H = tall ? 128 : 40, boxes = quads.map(bbox), taken = [];
    var keep = [{ x0: 1192, y0: 150, x1: 1372, y1: 386 }, { x0: 100, y0: 56, x1: 700, y1: 160 }]; // inset, header
    var lim = c.plate ? { x0: 40, x1: 1420, y0: 150, y1: 884 } : { x0: 60, x1: 1400, y0: 150, y1: 830 }; // plates carry no overlay
    function hits(r) {
      if (r.x0 < lim.x0 || r.x1 > lim.x1 || r.y0 < lim.y0 || r.y1 > lim.y1) return true;
      var all = boxes.concat(taken, keep);
      for (var i = 0; i < all.length; i++) { var b = all[i]; if (r.x0 < b.x1 + 6 && r.x1 > b.x0 - 6 && r.y0 < b.y1 + 6 && r.y1 > b.y0 - 6) return true; }
      return false;
    }
    var order = quads.map(function (q, i) { return i; }).sort(function (a, b) { return SB.get(info[b].path) - SB.get(info[a].path); });
    var out = [];
    order.forEach(function (i) {
      var b = boxes[i], q = quads[i];
      var cands = [
        { x: b.x0 + 10, y: b.y0 - H - 26 }, { x: b.x1 + 26, y: b.y0 - 8 }, { x: b.x0 + 10, y: b.y1 + 22 },
        { x: b.x0 - W - 26, y: b.y0 - 8 }, { x: b.x1 + 26, y: b.y0 - H - 30 }, { x: b.x0 - W / 2, y: b.y0 - H - 70 },
        { x: b.x0, y: b.y1 + 70 }, { x: b.x1 + 40, y: b.y1 + 10 },
        { x: b.x0 - 60, y: 168 }, { x: b.x0 + 120, y: 168 }, { x: b.x0 - 220, y: 168 }, { x: b.x1 - W, y: 168 },
      ];
      var pick = null;
      for (var k = 0; k < cands.length && !pick; k++) { var r = { x0: cands[k].x, y0: cands[k].y, x1: cands[k].x + W, y1: cands[k].y + H }; if (!hits(r)) pick = cands[k]; }
      if (!pick) pick = cands[0];
      taken.push({ x0: pick.x, y0: pick.y, x1: pick.x + W, y1: pick.y + H });
      // leader from the block corner nearest the note
      var near = q[0], bd = 1e9;
      q.forEach(function (p) { var d = Math.hypot(p.x - pick.x, p.y - (pick.y + 9)); if (d < bd) { bd = d; near = p; } });
      out[i] = { x: pick.x, y: pick.y, h: H, from: near };
    });
    return out;
  }
})();
