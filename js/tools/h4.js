/* H4 Coalition · view code. js/main.js owns the state and the logic; this file only draws it.
   States: "coalition" and "globe" (see "TOOL VIEWS" in js/main.js). Styles: the H4 section of css/tools.css.
   A lit sphere with lines of latitude and longitude: globe.gl when it loads, a still SVG until then
   or instead. After a submit the reader's country gets a ring, a leader line and an inset. */
(function () {
  "use strict";
  var section = document.getElementById("coalitionSection");
  var wrap = document.getElementById("globeWrap");
  if (!section || !wrap) return;
  var block = section.querySelector(".globe-block");
  var RAD = Math.PI / 180,
    LINE = "rgba(255,255,255,0.2)",
    BLUE = "#3C8FDE",
    RING = 'fill="none" stroke="' + BLUE + '" stroke-width="1.5"',
    NS = "http://www.w3.org/2000/svg";
  var mode = null, inst = null, coalition = null, was = false, pin = null, landing = 0;
  var flat, layer, fig, resizing = 0;

  function circle(cx, cy, r, rest) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + rest + "/>"; }
  function svgEl(cls) {
    var e = document.createElementNS(NS, "svg");
    e.setAttribute("class", cls);
    e.setAttribute("aria-hidden", "true");
    return e;
  }
  function phone() { return !window.matchMedia("(min-width: 1024px)").matches; }
  // the sphere's radius on screen, for a canvas of height h, as the camera sees it
  function radius(h) {
    var fov = inst ? inst.camera().fov : 50;
    return (h / 2) * Math.tan(Math.asin(1 / (1 + GLOBE_ALTITUDE))) / Math.tan((fov / 2) * RAD);
  }

  /* ── the sphere as SVG (the still globe and the inset) ── */
  function ortho(lat0, lng0, R) {
    var p0 = lat0 * RAD, s0 = Math.sin(p0), c0 = Math.cos(p0);
    return function (lat, lng) {
      var f = lat * RAD, l = (lng - lng0) * RAD, cf = Math.cos(f), sf = Math.sin(f), cl = Math.cos(l);
      return [R * cf * Math.sin(l), R * (c0 * sf - s0 * cf * cl), s0 * sf + c0 * cf * cl];
    };
  }
  function trace(P, cx, cy, pts) {
    var d = "", on = false;
    pts.forEach(function (q) {
      var v = P(q[0], q[1]);
      if (v[2] > 0) { d += (on ? "L" : "M") + (cx + v[0]).toFixed(1) + " " + (cy - v[1]).toFixed(1); on = true; }
      else on = false;
    });
    return d;
  }
  // the lines of latitude and longitude, every 20°, as lists of [lat, lng]
  function graticule() {
    var out = [], lat, lng, a, i;
    for (lng = -180; lng < 180; lng += 20) { a = []; for (i = -90; i <= 90; i += 3) a.push([i, lng]); out.push(a); }
    for (lat = -60; lat <= 60; lat += 20) { a = []; for (i = -180; i <= 180; i += 3) a.push([lat, i]); out.push(a); }
    return out;
  }
  // The world's coastlines (Natural Earth 1:110m, js/map/world-110m.js), loaded only with the globe.
  // Each is a list of [lat, lng] marked .c, so the 3D globe can draw it brighter than the grid.
  var COAST = "rgba(255,255,255,0.72)", coast = null, coastFile = null;
  function land() {
    if (coast) return coast;
    var w = window.LAND_WORLD_110M;
    if (w) {
      coast = w.map(function (r) { var a = []; for (var i = 0; i < r.length; i += 2) a.push([r[i + 1] / 10, r[i] / 10]); a.c = 1; return a; });
      return coast;
    }
    if (!coastFile) {
      coastFile = document.createElement("script");
      coastFile.src = "js/map/world-110m.js";
      coastFile.onload = function () { if (mode === "webgl" && inst) inst.pathsData(paths()); else drawFlat(); place(); };
      document.head.appendChild(coastFile);
    }
    return [];
  }
  function paths() { return graticule().concat(land()); }
  // the light on the sphere: from the upper left, with a rim on that limb
  function light(cx, cy, R) {
    var a = 196 * RAD, b = 292 * RAD, f = function (t, k) { return (k ? cy + R * Math.sin(t) : cx + R * Math.cos(t)).toFixed(1); };
    return circle(cx, cy, R, 'fill="url(#h4Spec)"') + circle(cx, cy, R, 'fill="url(#h4Shade)"') +
      '<path d="M' + f(a) + " " + f(a, 1) + "A" + R + " " + R + " 0 0 1 " + f(b) + " " + f(b, 1) + '" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>' +
      circle(cx, cy, R, 'fill="none" stroke="rgba(255,255,255,0.14)"');
  }
  function sphere(cx, cy, R, lat0, lng0, bars) {
    var P = ortho(lat0, lng0, R), d = graticule().map(function (g) { return trace(P, cx, cy, g); }).join("");
    var s = circle(cx, cy, R, 'fill="#121315"') + '<path d="' + d + '" fill="none" stroke="' + LINE + '"/>' +
      '<path d="' + land().map(function (g) { return trace(P, cx, cy, g); }).join("") + '" fill="none" stroke="' + COAST + '" stroke-linejoin="round"/>' + light(cx, cy, R);
    bars.forEach(function (b) {
      var v = P(b.lat, b.lng);
      if (v[2] > 0) s += '<line x1="' + (cx + v[0]) + '" y1="' + (cy - v[1]) + '" x2="' + (cx + v[0] * (1 + b.h)) + '" y2="' + (cy - v[1] * (1 + b.h)) + '" stroke="' + BLUE + '" stroke-width="4"/>';
    });
    return s;
  }
  function turnedTo(c) { return c ? globeTurn(c.lat, c.lng) : [22, 22]; }
  function drawFlat() {
    if (mode === "webgl" || !coalition) return;
    if (!flat || !flat.parentNode) { flat = svgEl("globe-flat"); wrap.insertBefore(flat, wrap.firstChild); }
    var W = wrap.clientWidth, H = wrap.clientHeight, v = turnedTo(mine());
    flat.setAttribute("viewBox", "0 0 " + W + " " + H);
    flat.innerHTML = sphere(W / 2, H / 2, radius(H), v[0], v[1], coalition.globe.map(function (d) {
      return { lat: d.lat, lng: d.lng, h: globeBarAlt(d) };
    }));
  }

  /* ── the globe.gl look ── */
  function dress(g) {
    g.globeMaterial().color.set("#121315");
    // no light of its own: the sphere keeps one flat value, and the light is the layer over it
    g.scene().traverse(function (o) {
      if (o.isDirectionalLight) o.intensity = 0;
      else if (o.isAmbientLight) { o.color.set("#ffffff"); o.intensity = Math.PI; }
    });
    g.pathsData(paths()).pathPoints(function (p) { return p; })
      .pathPointLat(function (q) { return q[0]; }).pathPointLng(function (q) { return q[1]; })
      .pathPointAlt(0.002).pathColor(function (p) { return p.c ? COAST : LINE; }).pathTransitionDuration(0);
    var over = svgEl("globe-light"), W = wrap.clientWidth, H = wrap.clientHeight, R = radius(H);
    over.setAttribute("viewBox", "0 0 " + W + " " + H);
    over.innerHTML = light(W / 2, H / 2, R) + circle(W / 2, H / 2, R + 5, 'class="globe-ring"');
    wrap.appendChild(over);
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "The coalition globe. Use the arrow keys to spin it.");
  }
  // keyboard: the arrows spin the globe, ten degrees a press
  wrap.addEventListener("keydown", function (e) {
    var k = { ArrowLeft: [0, -10], ArrowRight: [0, 10], ArrowUp: [10, 0], ArrowDown: [-10, 0] }[e.key];
    if (!k || mode !== "webgl" || e.target !== wrap) return;
    e.preventDefault();
    var v = inst.pointOfView();
    inst.controls().autoRotate = false;
    inst.pointOfView({ lat: Math.max(-80, Math.min(80, v.lat + k[0])), lng: v.lng + k[1], altitude: v.altitude }, 0);
    globeWake(600);
    place();
  });

  /* ── the reader's country: ring, leader, inset ── */
  function mine() {
    if (!coalition || !coalition.submitted) return null;
    return coalition.globe.filter(function (p) { return p.country === coalition.country; })[0] || null;
  }
  function point(lat, lng, alt) {
    if (mode === "webgl") return inst.getScreenCoords(lat, lng, alt);
    var H = wrap.clientHeight, W = wrap.clientWidth, R = radius(H), v = turnedTo(mine()), q = ortho(v[0], v[1], R)(lat, lng);
    return { x: W / 2 + q[0] * (1 + alt), y: H / 2 - q[1] * (1 + alt) };
  }
  function facing(c) {
    if (mode !== "webgl") return true;
    var v = inst.pointOfView(), a = v.lat * RAD, b = c.lat * RAD;
    return Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos((c.lng - v.lng) * RAD) > 1 / (1 + GLOBE_ALTITUDE);
  }
  function place() {
    if (!pin || !layer) return;
    if (mode === "webgl") inst.camera().updateMatrixWorld(); // the camera may have moved since it was last drawn
    var from = block.getBoundingClientRect(), w = wrap.getBoundingClientRect(), box = fig.querySelector("svg").getBoundingClientRect();
    if (!facing(pin)) { layer.innerHTML = ""; return; }
    var dx = w.left - from.left, dy = w.top - from.top;
    var t = point(pin.lat, pin.lng, globeBarAlt(pin)), b = point(pin.lat, pin.lng, 0);
    var tx = t.x + dx, ty = t.y + dy, r = box.right - from.left, cy = box.top + box.height / 2 - from.top, ph = phone();
    layer.innerHTML =
      '<path d="M' + tx + " " + ty + "L" + (r + (ph ? 10 : 18)) + " " + (ph ? cy : ty) + "L" + r + " " + cy + '" fill="none" stroke="rgba(255,255,255,0.55)"/>' +
      '<line x1="' + (b.x + dx) + '" y1="' + (b.y + dy) + '" x2="' + tx + '" y2="' + ty + '" stroke="' + BLUE + '" stroke-width="4"/>' +
      '<rect x="' + (tx - 2.5) + '" y="' + (ty - 2.5) + '" width="5" height="5" fill="#fff"/>' +
      circle(b.x + dx, b.y + dy, 8, RING);
  }
  // the inset is the sphere again, magnified about the bar, at the moment the globe came to rest
  function showPin() {
    pin = mine();
    if (!pin) return;
    if (!layer) { layer = svgEl("globe-pin"); block.appendChild(layer); }
    if (!fig) {
      fig = document.createElement("div");
      fig.className = "globe-fig";
      fig.innerHTML = '<span class="globe-fig-chip"></span><div class="globe-fig-box"></div><span class="globe-fig-name"></span>';
      block.appendChild(fig);
    }
    // the close-up is drawn ×3 (×2.5 on a phone); the caption prints no ratio until Greg approves one
    var k = phone() ? 2.5 : 3, box = fig.querySelector(".globe-fig-box");
    fig.querySelector(".globe-fig-chip").textContent = "FIG. 1";
    fig.querySelector(".globe-fig-name").textContent = pin.country;
    box.innerHTML = "";
    var W = box.clientWidth, H = box.clientHeight, R = radius(wrap.clientHeight);
    var v = mode === "webgl" ? inst.pointOfView() : { lat: turnedTo(pin)[0], lng: turnedTo(pin)[1] };
    var alt = globeBarAlt(pin), q = ortho(v.lat, v.lng, R)(pin.lat, pin.lng);
    var mx = q[0] * (1 + alt / 2), my = -q[1] * (1 + alt / 2);
    var s = svgEl("globe-fig-svg");
    s.setAttribute("viewBox", "0 0 " + W + " " + H);
    s.innerHTML = '<g transform="translate(' + W / 2 + " " + H / 2 + ") scale(" + k + ") translate(" + -mx + " " + -my + ')">' + sphere(0, 0, R, v.lat, v.lng, [{ lat: pin.lat, lng: pin.lng, h: alt }]) +
      circle(q[0], -q[1], 8, RING) + "</g>";
    box.appendChild(s);
    place();
  }

  /* ── states ── */
  ToolView.on("globe", function (g) {
    if (g.mode === "webgl" && mode !== "webgl") {
      inst = g.instance;
      mode = "webgl";
      dress(inst);
      inst.controls().addEventListener("change", place);
    } else if (g.mode === "flat") {
      mode = "flat";
      section.classList.add("is-flat");
      drawFlat();
      if (mine()) showPin();
    }
    if (g.landsIn != null) {
      if (layer) layer.innerHTML = "";
      clearTimeout(landing);
      landing = setTimeout(showPin, g.landsIn + 40);
    }
  });
  ToolView.on("coalition", function (s) {
    coalition = s;
    // words, not numbers: with the seeds off these only show what real people have done
    var chips = document.getElementById("coalitionTopIssues"), prio = document.getElementById("globalPrio");
    if (chips) chips.hidden = !s.showSeeded;
    if (prio) prio.hidden = !s.showSeeded && !(window.__cowLive && window.__cowLive.ready);
    section.classList.toggle("is-submitted", s.submitted);
    drawFlat();
    if (s.submitted && !was) {
      was = true;
      var thanks = document.getElementById("coalitionThanks");
      if (thanks) thanks.focus({ preventScroll: true }); // the button it came from has switched off
      if (phone()) block.scrollIntoView({ block: "start" }); // the form is above; the reward is here
      if (mode === "flat") { drawFlat(); showPin(); }
    }
    if (mode === "webgl" && pin) showPin();
  });

  /* ── start ── */
  var email = document.getElementById("coalitionEmail"), ph = section.querySelector(".coalition-ph");
  if (email && ph) { ph.dataset.ph = email.placeholder; email.classList.add("ph-on"); }
  drawFlat();
  window.addEventListener("resize", function () {
    clearTimeout(resizing);
    resizing = setTimeout(function () {
      if (mode !== "webgl") drawFlat();
      if (pin) showPin();
    }, 120);
  });
})();
