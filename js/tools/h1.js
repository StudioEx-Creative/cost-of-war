/* H1 Redistribute · view code. js/main.js owns the state and the logic; this file only draws it.
   Region in index.html: between the "H1 REDISTRIBUTE" markers. Styles: the H1 section of css/tools.css.

   The Sheet is the story's sheet again: same paper, same light, the tab it was handed in S13. Its
   area is the budget. Each choice cuts it to what remains (true area, anchored bottom left); the
   drained part stays as a dashed, hatched ghost. There is no animation: the drawing is replaced.

   The words on the drawing are set through data-t (css: ::before) because they repeat figures the
   tracker already states as text; the stage is hidden from screen readers for the same reason. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("h1Stage"), root = $("redistribute"), panel = $("prioPanel"), list = $("prioList");
  if (!stage || !root || !panel) return;

  stage.innerHTML =
    '<div class="h1-beam"></div><div class="h1-prompt"></div><div class="h1-tilt"><svg class="h1-paper" focusable="false"></svg>' +
    '<span class="h1-tab" data-t="Have your say"></span><span class="h1-lab" data-t="budget remaining"></span>' +
    '<span class="h1-fig"></span><span class="h1-was"></span></div><svg class="h1-lead" focusable="false"></svg>';
  var pick = function (c) { return stage.querySelector(c); };
  var prompt = pick(".h1-prompt"), tilt = pick(".h1-tilt"), paper = pick(".h1-paper"), tab = pick(".h1-tab"), lab = pick(".h1-lab"), fig = pick(".h1-fig"), was = pick(".h1-was"), lead = pick(".h1-lead");

  // the figure "allocated" with its numbered callout, and (phone) the cut-outs on one baseline
  var alloc = document.createElement("div"), strip = document.createElement("div");
  alloc.className = "h1-alloc";
  strip.className = "h1-strip";
  panel.prepend(alloc);
  panel.querySelector(".prio-head").after(strip);

  var DEFS =
    '<defs><linearGradient id="h1Paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1D20"/><stop offset=".55" stop-color="#121315"/><stop offset="1" stop-color="#0D0E10"/></linearGradient>' +
    '<linearGradient id="h1Lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".35" stop-color="#fff" stop-opacity=".035"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<filter id="h1Shade" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".75"/></filter>' +
    '<filter id="h1Tooth" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0"/></filter>' +
    '<pattern id="h1Hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line y2="8" stroke="#8A9099" stroke-opacity=".55"/></pattern></defs>';
  var RED = "#E8362B";
  var wide = matchMedia("(min-width: 1200px)");
  var last = null, refocus = null;

  function cross(x, y) { return '<path d="M' + (x - 5) + " " + y + "h10M" + x + " " + (y - 5) + 'v10" stroke="rgba(255,255,255,.4)" fill="none"/>'; }
  function round(n) { return Math.round(n * 10) / 10; }

  function draw(s) {
    if (!s) return;
    last = s;
    var W = tilt.clientWidth, H = tilt.clientHeight, phone = W < 500, on = s.count > 0;
    if (!W) return;
    root.style.setProperty("--h1-w", W + "px");
    root.style.setProperty("--h1-h", H + "px");

    // what remains: same proportions as the whole, so its area is the money left
    var k = Math.sqrt(Math.max(0, s.remaining) / s.defence), w = Math.max(6, round(W * k)), h = Math.max(6, round(H * k)), y = round(H - h);
    var svg = DEFS;
    if (on) {
      svg += '<path d="M0 0H' + W + "V" + H + "H0ZM0 " + y + "v" + h + "h" + w + "v" + -h + 'Z" fill="url(#h1Hatch)" fill-rule="evenodd" opacity=".7"/>' +
        '<rect x=".5" y=".5" width="' + (W - 1) + '" height="' + (H - 1) + '" fill="none" stroke="rgba(255,255,255,.5)" stroke-dasharray="5 5"/>';
    }
    var t = phone ? 8 : 12;
    svg += '<rect y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#h1Paper)" filter="url(#h1Shade)"/>' +
      '<rect x="1" y="' + (y + 1) + '" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + RED + '" stroke-width="2"/>' +
      '<rect y="' + y + '" width="' + t + '" height="' + t + '" fill="' + RED + '"/>' +
      '<rect x="2" y="' + (y + 2) + '" width="' + (w - 4) + '" height="' + (h - 4) + '" fill="url(#h1Lit)"/>' +
      '<rect x="2" y="' + (y + 2) + '" width="' + (w - 4) + '" height="' + (h - 4) + '" filter="url(#h1Tooth)" opacity=".09"/>' +
      '<line x1="3" y1="' + (y + 2.75) + '" x2="' + (w - 3) + '" y2="' + (y + 2.75) + '" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>' +
      cross(-12, -12) + cross(W + 12, -12) + cross(W + 12, H + 12) + cross(-12, H + 12) +
      '<rect class="h1-a" x="' + round((w + W) / 2 - 1) + '" y="' + (phone ? 20 : 46) + '" width="2" height="2" fill="none"/>';
    paper.innerHTML = svg;

    // the tab the sheet was handed in S13, still on its top edge. Once the sheet is narrower than the
    // tab, the tab moves up onto the dashed outline of the whole budget, so it never overhangs the sheet.
    var tw = phone ? 150 : 190, th = phone ? 26 : 30, off = w < tw;
    tab.style.cssText = "left:0;top:" + ((off ? 0 : y) - th) + "px;width:" + tw + "px;height:" + th + "px";
    tab.classList.toggle("is-ghost", off);

    // the figure and its label: on the paper while they fit, beside it once it is too small
    var pad = phone ? 14 : Math.round(W * 0.05), base = W * (phone ? 0.175 : 0.217), inside = k >= 0.5;
    fig.setAttribute("data-t", s.remainingText);
    fig.style.fontSize = base + "px";
    var fs = inside ? Math.min(base, (base * (w - pad * 2)) / fig.offsetWidth) : Math.max(28, W * 0.075);
    fig.style.fontSize = fs + "px";
    fig.classList.toggle("out", !inside);
    lab.classList.toggle("out", !inside);
    var beside = Math.max(w, tw) + 12, fx = inside ? pad - fs * 0.04 : beside, fy = inside ? y + h - fs * 0.9 - fs * 0.2 : H - fs * 0.9 - 12;
    fig.style.left = fx + "px";
    fig.style.top = fy + "px";
    lab.style.left = (inside ? pad : beside) + "px";
    lab.style.top = (inside ? y + (phone ? 18 : 32) : fy - 22) + "px";

    // the ghost keeps its figure, clear of the tab
    was.setAttribute("data-t", on ? fmt(s.defence) : "");
    if (on) {
      var band = Math.min(10, Math.max(3, (y - (y >= 30 ? 16 : 13)) / 2));
      was.style.right = (inside ? W - Math.max(w - 10, tw + 80) : 10) + "px";
      was.style.top = band + "px";
      was.style.fontSize = (y >= 30 ? 12 : 10) + "px";
    }

    prompt.setAttribute("data-t", $("redistPrompt").textContent);

    alloc.innerHTML = on ? '<i class="h1-co">1</i><div class="h1-alloc-l">allocated</div><div class="h1-alloc-v">' + s.allocatedText + "</div>" : "";
    strip.innerHTML = s.chosen.map(function (c) {
      return '<i class="h1-cut" style="--s:' + Math.sqrt(c.cost / s.defence).toFixed(4) + '"><b>' + c.rank + "</b></i>";
    }).join("");

    // drained band → allocated: a leader, only while the two sit side by side
    var co = alloc.querySelector(".h1-co"), line = "";
    if (co && wide.matches) {
      var o = lead.getBoundingClientRect(), a = paper.querySelector(".h1-a").getBoundingClientRect(), c = co.getBoundingClientRect();
      var ax = round(a.left - o.left + 1), ay = round(a.top - o.top + 1), cy = round(c.top + c.height / 2 - o.top);
      line = '<path d="M' + ax + " " + ay + "L" + (ax + 24) + " " + cy + "H" + round(c.left - o.left) + '" fill="none" stroke="#fff" stroke-opacity=".6"/><rect x="' + (ax - 2) + '" y="' + (ay - 2) + '" width="4" height="4" fill="#fff"/>';
    }
    lead.innerHTML = line;
  }

  // each cause's button says whether it is chosen; a blocked one says so without leaving the tab order
  function buttons(s) {
    document.querySelectorAll(".ix").forEach(function (ix) {
      var b = ix.querySelector(".ix-pick"), i = +ix.id.slice(2);
      if (!b) return;
      b.setAttribute("aria-pressed", s.ranking.indexOf(i) > -1);
      if (s.blocked.indexOf(i) > -1) b.setAttribute("aria-disabled", "true");
      else b.removeAttribute("aria-disabled");
    });
  }

  // An arrow at the end of the list stays a Tab stop that does nothing (aria-disabled, not
  // disabled), so focus stays on the arrow the reader pressed instead of jumping to the other
  // one, where a repeated Enter would move the cause back.
  function ends() {
    list.querySelectorAll(".prio-mv:disabled").forEach(function (b) {
      b.disabled = false;
      b.setAttribute("aria-disabled", "true");
    });
  }

  // main.js rebuilds the list on every change, so a keyboard user's place is put back by hand
  list.addEventListener("click", function (e) {
    var b = e.target.closest("button"), row = b && b.closest(".prio-item");
    if (!row) return;
    if (b.getAttribute("aria-disabled")) return e.stopPropagation(); // nothing moves, nothing to put back
    var i = +row.dataset.i, mv = b.classList.contains("prio-mv");
    refocus = { i: i, n: [].indexOf.call(row.parentNode.children, row), k: mv ? [].indexOf.call(row.querySelectorAll(".prio-mv"), b) : 2 };
  }, true);
  function restore() {
    var r = refocus, t;
    refocus = null;
    if (!r) return;
    var row = list.querySelector('[data-i="' + r.i + '"]');
    if (row) {
      var mv = row.querySelectorAll(".prio-mv");
      t = mv[r.k] && !mv[r.k].disabled ? mv[r.k] : mv[1 - r.k];
    } else {
      var rows = list.children;
      t = rows.length ? rows[Math.min(r.n, rows.length - 1)].querySelector(".prio-rm") : $("ix" + r.i).querySelector(".ix-pick");
    }
    if (t) t.focus({ preventScroll: true });
  }

  ToolView.on("redistribute", function (s) {
    draw(s);
    buttons(s);
    ends();
    restore();
  });

  if (window.ResizeObserver) new ResizeObserver(function () { draw(last); }).observe(tilt);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(last); });
})();
