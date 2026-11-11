/* H2 Your country · view code. js/main.js owns the state and the logic; this file only draws it.
   The world total is a plane receding into the dark, with the reader's country lit in its near
   corner at true area: the country's spend is part of the total, so nesting it is honest.
   Region in index.html: between the "H2 YOUR COUNTRY" markers. Styles: the H2 section of css/tools.css.
   Nothing here runs a loop: it draws when the country changes or the plane changes size. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var plane = document.getElementById("ccPlane");
  var card = document.getElementById("countryData");
  if (!plane || !card) return;
  var narrow = matchMedia("(max-width: 999.98px)");
  var still = /[?&]static=1/.test(location.search) || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var country = null, drawnSpend = null;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  var tilt = document.createElement("div");
  tilt.className = "ccp-tilt";
  var svg = el("svg", { class: "ccp-svg", "aria-hidden": "true" }, tilt);
  var defs = el("defs", {}, svg);
  function grad(tag, id, attrs, stops) {
    var g = el(tag, Object.assign({ id: id }, attrs), defs);
    stops.forEach(function (s) { el("stop", { offset: s[0], "stop-color": "#fff", "stop-opacity": s[1] }, g); });
  }
  grad("linearGradient", "ccpLit", { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, 0.13], [0.35, 0.035], [1, 0]]);
  grad("radialGradient", "ccpPool", {}, [[0, 0.07], [1, 0]]);
  var grid = el("path", { class: "ccp-grid" }, svg);
  var ticks = el("path", { class: "ccp-ticks" }, svg);
  var ghost = el("rect", { class: "ccp-ghost" }, svg);
  var pool = el("ellipse", { fill: "url(#ccpPool)" }, svg);
  var rung = el("rect", { class: "ccp-rung" }, svg);
  var marks = el("g", {}, svg);
  var lit = el("rect", { fill: "url(#ccpLit)" }, marks);
  var edge = el("line", { class: "ccp-edge" }, marks);
  var tab = el("rect", { class: "ccp-tab" }, marks);
  var label = document.createElement("div");
  label.className = "ccp-label";
  tilt.appendChild(label);
  plane.appendChild(tilt);
  var over = el("svg", { class: "ccp-over", "aria-hidden": "true" }, plane);
  var line = el("path", { class: "ccp-leader" }, over);
  var dot = el("rect", { class: "ccp-dot", width: 5, height: 5 }, over);

  function at(n) { return Math.round(n * 100) / 100; }

  function draw(animate) {
    var W = plane.clientWidth, H = plane.clientHeight;
    if (!W || !H) return;
    var phone = narrow.matches, u = W / 792;
    var rx = phone ? 38 : 36, persp = phone ? Math.max(900, W * 2.8) : 1500 * u;
    var rad = (rx * Math.PI) / 180;
    // where a point of the tipped plane lands, in the plane's own box
    function P(x, y) {
      var Y = y - H / 2, z = Y * Math.sin(rad), k = persp / (persp - z);
      return [W / 2 + (x - W / 2) * k, H / 2 + Y * Math.cos(rad) * k];
    }
    tilt.style.transform = "perspective(" + at(persp) + "px) rotateX(" + rx + "deg)";
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);

    var step = phone ? 34 : 50 * u, d = "", t = "", x, y;
    for (x = 0; x <= W + 0.1; x += step) d += "M" + at(x) + " 0V" + H;
    for (y = 0; y <= H + 0.1; y += step) d += "M0 " + at(y) + "H" + W;
    if (!phone)
      for (x = 0; x <= W + 0.1; x += step)
        for (y = 0; y <= H + 0.1; y += step)
          t += "M" + at(x - 3) + " " + at(y) + "h6M" + at(x) + " " + at(y - 3) + "v6";
    grid.setAttribute("d", d);
    ticks.setAttribute("d", t);
    set(ghost, { x: 0.5, y: 0.5, width: W - 1, height: H - 1 });

    var root = plane.parentNode, on = country ? "" : "none";
    rung.style.display = pool.style.display = line.style.display = on;
    if (!country) {
      marks.style.display = dot.style.display = "none";
      label.textContent = "";
      plane.removeAttribute("role");
      plane.removeAttribute("aria-label");
      plane.setAttribute("aria-hidden", "true");
      return;
    }
    // ── the country's sheet: its area is to the plane's as its spend is to the total
    var k = Math.sqrt(country.spend / DEFENCE);
    var rw = W * k, rh = H * k;
    if (rh < 1.5) { rw = (rw * rh) / 1.5; rh = 1.5; } // a sliver keeps its true area as long as it can
    rw = Math.max(rw, 1.5); // below that, one visible mark
    var ry = H - rh, big = rw >= 24 && rh >= 12;
    set(rung, { x: big ? 1 : 0, y: big ? ry + 1 : ry, width: big ? rw - 2 : rw, height: big ? rh - 2 : rh });
    rung.classList.toggle("is-speck", !big);
    marks.style.display = big ? "" : "none";
    set(lit, { x: 2, y: ry + 2, width: rw - 4, height: rh - 4 });
    set(edge, { x1: 3, y1: ry + 2.75, x2: rw - 3, y2: ry + 2.75 });
    var ts = phone ? 6 : 10;
    set(tab, { x: 0, y: ry, width: ts, height: ts });
    set(pool, { cx: rw / 2, cy: ry + rh / 2, rx: Math.max(rw * 1.6, 90 * u), ry: Math.max(rh * 2.2, 40) });
    label.textContent = fmt(DEFENCE) + " · global military total";
    label.classList.toggle("is-right", phone);
    plane.setAttribute("role", "img");
    plane.removeAttribute("aria-hidden");
    plane.setAttribute("aria-label", country.name + ": " + country.spendText + ", drawn at true area inside the " + fmt(DEFENCE) + " global military total.");

    place(root, phone, u, W, H, P, rw, ry, big);

    if (animate && !still && big && rung.animate) {
      // the lock: the sheet closes from the whole total down to the country's true area
      rung.style.transformOrigin = "0 " + H + "px";
      rung.animate([{ transform: "scale(" + at(W / rw) + "," + at(H / rh) + ")" }, { transform: "none" }], { duration: 260, easing: "cubic-bezier(0.2, 0, 0, 1)" });
      marks.animate([{ opacity: 0 }, { opacity: 0, offset: 0.99 }, { opacity: 1 }], { duration: 260 });
    }
  }

  function set(n, attrs) {
    for (var k in attrs) n.setAttribute(k, at(attrs[k]));
  }

  // The giant figure stands in front of the plane, clear of the country's sheet. The largest
  // sheet leaves no room beside it, so there the figure is set on the sheet, as H1 does.
  function place(root, phone, u, W, H, P, rw, ry, big) {
    var nameEl = card.querySelector(".cc-name"), num = card.querySelector(".cc-spend");
    if (!nameEl || !num) return;
    root.style.removeProperty("--cc-size");
    var base = parseFloat(getComputedStyle(num).fontSize), w = num.offsetWidth, fit = base;
    var path = "", tip;
    over.setAttribute("viewBox", "0 0 " + W + " " + H);
    over.setAttribute("width", W);
    over.setAttribute("height", H);
    if (phone) {
      var room = root.clientWidth - parseFloat(getComputedStyle(root).paddingLeft) - parseFloat(getComputedStyle(root).paddingRight);
      if (w > room) fit = (base * room) / w;
      tip = P(Math.min(rw * 0.6, 70), ry); // kept left of the plane's label
      path = "M" + at(tip[0]) + " " + at(tip[1] - 2) + "V-40";
      dot.style.display = big ? "" : "none";
    } else {
      var tr = P(rw, ry), minX = 188 * u, nx, ny, nameY;
      var left = Math.max(minX, tr[0] + 24 * u), side = Math.min(base, (base * (W - left)) / w);
      if (side >= base * 0.7) {
        // beside the sheet, with a leader down to it; a long figure is fitted to the room left
        fit = side;
        nx = Math.min(Math.max(minX, tr[0] + 36 * u), W - (w * fit) / base);
        ny = 166 * u;
        nameY = 150 * u;
        tip = big ? [tr[0] - 4, tr[1] + 4] : tr;
        path = "M" + at(tip[0]) + " " + at(tip[1]) + "L" + at(nx - 2) + " " + at(ny + 8 * u);
        dot.style.display = big ? "" : "none";
      } else {
        var bl = P(0, H), tl = P(0, ry), inner = tr[0] - tl[0] - 36 * u;
        fit = Math.min(base, (base * inner) / w);
        nx = tl[0] + 18 * u;
        ny = bl[1] - fit * 0.9 - 8 * u;
        nameY = ny - 16 * u;
      }
      root.style.setProperty("--cc-nx", at(nx) + "px");
      root.style.setProperty("--cc-ny", at(ny) + "px");
      root.style.setProperty("--cc-name-x", at(nx + 8 * u) + "px");
      root.style.setProperty("--cc-name-y", at(nameY) + "px");
    }
    if (fit !== base) root.style.setProperty("--cc-size", at(fit) + "px");
    line.setAttribute("d", path);
    if (tip) set(dot, { x: tip[0] - 2.5, y: tip[1] - 2.5 });
    if (!path) dot.style.display = "none";
  }

  ToolView.on("country", function (s) {
    country = s;
    // main.js shows the card as a block; its parts are laid out in the section's own grid
    if (s) card.style.display = "contents";
    var changed = !!s && drawnSpend !== null && drawnSpend !== s.spend;
    drawnSpend = s ? s.spend : drawnSpend;
    draw(changed);
  });

  ToolView.on("tax", function (s) {
    var slider = document.getElementById("taxSlider"), result = document.getElementById("taxResult");
    if (!slider) return;
    slider.style.setProperty("--p", s.position / 1000);
    slider.setAttribute("aria-label", "Your income per year");
    slider.setAttribute("aria-valuetext", s.currency + s.incomeText + " a year");
    slider.setAttribute("aria-describedby", "taxResult");
    if (result) result.classList.toggle("is-used", !!s.used);
  });

  if (window.ResizeObserver) new ResizeObserver(function () { draw(false); }).observe(plane);
  else addEventListener("resize", function () { draw(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(false); });
  draw(false);
})();
