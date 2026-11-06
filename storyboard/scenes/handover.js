/* HANDOVER TOOLS · H1–H6 · not scroll-driven
   One scene per tool. Each frame is a state the reader reaches by choosing,
   never by scrolling. Chrome is off (whether it returns is decision SCR-2,
   raised in S13).

   The example reader used in every frame (sample state, not data):
   - picks three causes, in this order: Zero Hunger, Clean Water, Global Health
   - picks United Kingdom in the country step
   All costs, names and country figures are read from js/data.js. Anything the
   tool computes from them (remaining, allocated, tax) is shown with
   c.sample() and the formula it comes from.

   Art direction. The tools are interfaces and stay flat, clear and usable
   (44px targets, visible focus). The objects are staged: the budget sheet is
   lit paper on a desk with its drained part hatched away; the world total is a
   plane receding into the dark with the reader's country lit in its corner;
   the letter is a sheet of paper lying on the desk; the card is a printed
   object; the globe is a lit sphere; the Archive is paper hanging in space,
   with the reader's blank sheet caught in a beam of light. */
(function () {
  "use strict";
  var S = SB.SVG, T = SB.T, TX = SB.TX, F = SB.F, esc = SB.esc;

  var RANK = [0, 4, 1]; // issueData indices, in the order chosen (= rank)
  var CI = 5; // countryData index: United Kingdom
  var CP = "countryData[" + CI + "]";

  /* ── figures ─────────────────────────────────────────────────── */
  function D() { return SB.get("DEFENCE"); }
  function costOf(i) { return SB.get("issueData[" + i + "].cost"); }
  function allocB(rank) { return rank.reduce(function (s, i) { return s + costOf(i); }, 0); }
  // main.js fmt(): ≥1000 → "$x.xxT", else "$xB"
  function liveFmt(b) { return b >= 1000 ? "$" + (b / 1000).toFixed(2) + "T" : "$" + Math.round(b) + "B"; }
  var FMT_FLAG = "Climate Action prints as $1.00T in the live tool (main.js fmt). SB format T would print $1T. Frames keep the live $1.00T.";
  function cost(c, i) {
    var p = "issueData[" + i + "].cost", v = SB.get(p);
    if (v >= 1000) {
      if (!c.log.flags.some(function (f) { return f.text === FMT_FLAG; })) c.flag("data", FMT_FLAG);
      return c.sample(liveFmt(v), p + " through main.js fmt(), two decimals, as the live card prints it");
    }
    return c.fig(p, "B");
  }
  function iname(c, i) { return c.fig("issueData[" + i + "].name", "raw"); }
  function isdg(c, i) { return c.fig("issueData[" + i + "].sdg", "raw"); }
  function remFig(c, rank) {
    return c.sample(liveFmt(D() - allocB(rank)), "tool output: DEFENCE − chosen issueData costs, main.js fmt()");
  }
  function allocFig(c, rank) {
    return c.sample(liveFmt(allocB(rank)), "tool output: sum of chosen issueData costs, main.js fmt()");
  }
  // "$2.89 trillion", the words index.html and the letter print
  function defWords(c, where) {
    return c.sample("$" + (D() / 1000).toFixed(2) + " trillion", "DEFENCE ÷ 1000 to 2 dp + ' trillion', as " + where + " prints it");
  }
  function pctOfDefence(c, b, how) {
    return c.sample(String(Math.round((b / D()) * 100)), how);
  }
  // tax slider model, copied from main.js:1110-1125 (indicative, audit F06)
  function sliderToIncome(pos) {
    if (pos <= 700) return Math.round((pos / 700) * 200000);
    return Math.round(200000 + ((pos - 700) / 300) * (6000000 - 200000));
  }
  function effectiveTaxRate(income) {
    if (income < 15000) return 0.08;
    if (income < 50000) return 0.08 + ((income - 15000) / 35000) * 0.12;
    if (income < 150000) return 0.2 + ((income - 50000) / 100000) * 0.12;
    if (income < 500000) return 0.32 + ((income - 150000) / 350000) * 0.08;
    return 0.42;
  }
  function fmtMoney(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + "M";
    return Math.round(n).toLocaleString("en-US");
  }
  function tax(pos) {
    var income = sliderToIncome(pos);
    var share = SB.get(CP + "[3]") / 100 / SB.get("GOV_SPEND_GDP");
    var annual = income * effectiveTaxRate(income);
    var toWar = annual * share;
    var perDay = toWar / 365;
    return {
      pos: pos, income: income, share: share, annual: annual, toWar: toWar,
      perDay: perDay < 10 ? perDay.toFixed(2) : Math.round(perDay).toLocaleString("en-US"),
    };
  }

  /* ── staging: light, paper as an object in space ─────────────── */
  // Light, all white or ground at low opacity: a top light that falls across
  // paper, a beam from above, a soft pool, and the shading of a sphere.
  function lightDefs(c) {
    var W = T.white, G = T.ground;
    c.bgSvg("<defs>" +
      '<linearGradient id="hoLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + W + '" stop-opacity="0.13"/><stop offset="0.35" stop-color="' + W + '" stop-opacity="0.035"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="hoBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + W + '" stop-opacity="0.085"/><stop offset="0.75" stop-color="' + W + '" stop-opacity="0.025"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="hoPool"><stop offset="0" stop-color="' + W + '" stop-opacity="0.07"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hoShade" cx="0.32" cy="0.28" r="0.9"><stop offset="0" stop-color="' + G + '" stop-opacity="0"/><stop offset="0.38" stop-color="' + G + '" stop-opacity="0.18"/><stop offset="0.68" stop-color="' + G + '" stop-opacity="0.78"/><stop offset="0.9" stop-color="' + G + '" stop-opacity="0.97"/></radialGradient>' +
      '<radialGradient id="hoSpec" cx="0.3" cy="0.26" r="0.6"><stop offset="0" stop-color="' + W + '" stop-opacity="0.3"/><stop offset="0.45" stop-color="' + W + '" stop-opacity="0.09"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hoFogL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + G + '" stop-opacity="0.94"/><stop offset="0.6" stop-color="' + G + '" stop-opacity="0.7"/><stop offset="1" stop-color="' + G + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="hoFogB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + G + '" stop-opacity="0"/><stop offset="1" stop-color="' + G + '" stop-opacity="0.92"/></linearGradient>' +
      '<filter id="hoBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>' +
      "</defs>");
  }
  // Where a point of a tilted object lands on screen (CSS: perspective, then
  // rotateX · rotateY · rotateZ about the object's centre ox, oy).
  function proj(t, ox, oy, x, y) {
    var r = Math.PI / 180, X = x - ox, Y = y - oy, a;
    a = t.rz * r; var x1 = X * Math.cos(a) - Y * Math.sin(a), y1 = X * Math.sin(a) + Y * Math.cos(a);
    a = t.ry * r; var x2 = x1 * Math.cos(a), z2 = -x1 * Math.sin(a);
    a = t.rx * r; var y3 = y1 * Math.cos(a) - z2 * Math.sin(a), z3 = y1 * Math.sin(a) + z2 * Math.cos(a);
    var k = t.persp / (t.persp - z3);
    return [ox + x2 * k, oy + y3 * k];
  }
  // A drawing context that collects into strings instead of the frame, so
  // an object can be drawn flat in its own coordinates. Logs stay shared.
  function capture(c) {
    var k = Object.create(c);
    k._svg = []; k._html = []; k._uiSvg = []; k._uiHtml = [];
    return k;
  }
  // Draw fn(k) in local coordinates (0..w, 0..h), then stand the result in
  // space: tilted in 3D about its centre. Returns local → screen.
  function lay(c, x, y, w, h, t, fn) {
    t = Object.assign({ rx: 0, ry: 0, rz: 0, persp: 1600 }, t || {});
    var k = capture(c);
    fn(k);
    var tf = "perspective(" + t.persp + "px) rotateX(" + t.rx + "deg) rotateY(" + t.ry + "deg) rotateZ(" + t.rz + "deg)";
    c.div(x, y, w,
      '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" style="position:absolute;left:0;top:0;overflow:visible">' + k._svg.join("") + "</svg>" + k._html.join(""),
      "height:" + h + "px;transform-origin:50% 50%;transform:" + tf);
    var ox = x + w / 2, oy = y + h / 2;
    return function (lx, ly) { return proj(t, ox, oy, x + lx, y + ly); };
  }
  function bbox(pts) {
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    var x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
    return { x: Math.round(x), y: Math.round(y), w: Math.round(Math.max.apply(null, xs) - x), h: Math.round(Math.max.apply(null, ys) - y) };
  }
  function corners(P, r) { return bbox([P(r.x, r.y), P(r.x + r.w, r.y), P(r.x + r.w, r.y + r.h), P(r.x, r.y + r.h)]); }
  // light falling across a sheet from above, and its top edge catching it
  function lit(x, y, w, h, o) {
    o = o || {};
    return S.rect(x, y, w, h, { fill: "url(#hoLit)", opacity: o.opacity }) +
      S.line(x + 1, y + 0.75, x + w - 1, y + 0.75, { stroke: "rgba(255,255,255," + (o.edge || 0.5) + ")", "stroke-width": 1.2 });
  }
  // a beam from the top of the frame down to y1 (fixed, behind the world)
  function beam(c, cx, topW, y1, botW, op) {
    c.bgSvg('<path d="M' + (cx - topW / 2) + " 0 L" + (cx + topW / 2) + " 0 L" + (cx + botW / 2) + " " + y1 + " L" + (cx - botW / 2) + " " + y1 + ' Z" fill="url(#hoBeam)" opacity="' + (op || 1) + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + y1 + '" rx="' + botW * 0.62 + '" ry="' + botW * 0.12 + '" fill="url(#hoPool)"/>');
  }
  // FIG chip: the label of a boxed inset
  function chip(c, x, y, txt) {
    c.div(x, y, null, txt, TX.labelW + ";font-size:10px;line-height:12px;background:" + T.ground + ";padding:3px 6px;border:1px solid rgba(255,255,255,0.7);white-space:nowrap");
  }
  // numbered callout disc
  function callout(c, x, y, n) {
    c.svg(S.circle(x, y, 9, { fill: T.ground, stroke: T.white, "stroke-width": 1 }));
    c.div(x - 9, y - 7, 18, c.label(String(n), "callout number"), TX.labelW + ";font-size:10px;line-height:14px;text-align:center;letter-spacing:0");
  }
  // a short registration cross
  function reg(x, y, n, op) {
    return S.path("M" + (x - n) + " " + y + " H" + (x + n) + " M" + x + " " + (y - n) + " V" + (y + n), { stroke: "rgba(255,255,255," + (op || 0.45) + ")" });
  }

  /* ── controls ────────────────────────────────────────────────── */
  var BTN = "box-sizing:border-box;display:flex;align-items:center;justify-content:center;text-align:center;font-family:" + F.sans + ";font-weight:600;letter-spacing:0.01em;line-height:1.2;";
  // kind: primary (blue fill, ground text) | blueline | outline | quiet | off
  function button(c, x, y, w, h, html, kind, size) {
    var st = BTN + "height:" + h + "px;font-size:" + (size || 15) + "px;padding:0 10px;";
    if (kind === "primary") st += "background:" + T.blue + ";color:" + T.ground + ";";
    else if (kind === "blueline") st += "border:2px solid " + T.blue + ";color:" + T.white + ";";
    else if (kind === "outline") st += "border:1px solid rgba(255,255,255,0.45);color:" + T.white + ";";
    else if (kind === "quiet") st += "border:1px solid " + T.rule + ";color:" + T.soft + ";font-weight:500;";
    else st += "border:1px solid " + T.rule + ";color:" + T.grey + ";opacity:0.55;font-weight:500;";
    c.div(x, y, w, html, st);
  }
  // visible keyboard focus: a white ring, 2px, offset 4px
  function focusRing(c, x, y, w, h) {
    c.svg(S.rect(x - 4, y - 4, w + 8, h + 8, { fill: "none", stroke: T.white, "stroke-width": 2 }));
  }
  function field(c, x, y, w, h, html, o) {
    o = o || {};
    c.svg(S.rect(x + 0.5, y + 0.5, w - 1, h - 1, { fill: T.sheet, stroke: o.stroke || "rgba(255,255,255,0.3)" }));
    c.svg(S.line(x + 1, y + h - 0.5, x + w - 1, y + h - 0.5, { stroke: "rgba(255,255,255,0.55)" }));
    if (o.wrap) // a long placeholder shown in full, on two lines
      c.div(x + 14, y + (h - 40) / 2, w - 28, html, "font-family:" + F.sans + ";font-size:" + (o.size || 15) + "px;line-height:20px;color:" + T.grey);
    else c.div(x + 14, y + (h - 22) / 2, w - (o.caret ? 44 : 28), html,
      "font-family:" + F.sans + ";font-size:" + (o.size || 15) + "px;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:" + (o.value ? T.white : T.grey));
    if (o.caret) c.div(x + w - 30, y + (h - 22) / 2, 18, "▾", "font-family:" + F.sans + ";font-size:15px;line-height:22px;color:" + T.white);
  }
  function checkbox(c, x, y, on, size) {
    var s = size || 20;
    if (on) {
      c.svg(S.rect(x, y, s, s, { fill: T.blue }));
      c.svg(S.path("M" + (x + s * 0.24) + " " + (y + s * 0.52) + " L" + (x + s * 0.43) + " " + (y + s * 0.7) + " L" + (x + s * 0.78) + " " + (y + s * 0.3), { stroke: T.ground, "stroke-width": 2.5 }));
    } else c.svg(S.rect(x + 0.75, y + 0.75, s - 1.5, s - 1.5, { fill: "none", stroke: "rgba(255,255,255,0.6)", "stroke-width": 1.5 }));
  }
  // rank badge; style for alt B cycles blue / deep / grey hatch
  function badge(c, x, y, n, s, alt) {
    var k = (n - 1) % 3, txt = T.ground;
    if (alt === "B" && k === 1) { c.svg(S.rect(x, y, s, s, { fill: T.deep })); c.svg(S.rect(x + 0.5, y + 0.5, s - 1, s - 1, { fill: "none", stroke: "rgba(255,255,255,0.35)" })); txt = T.white; }
    else if (alt === "B" && k === 2) { c.svg(S.rect(x, y, s, s, { fill: T.sheet })); c.svg(S.rect(x, y, s, s, { fill: "url(#hatch-grey)" })); c.svg(S.rect(x + 0.5, y + 0.5, s - 1, s - 1, { fill: "none", stroke: T.grey })); txt = T.white; }
    else c.svg(S.rect(x, y, s, s, { fill: T.blue }));
    c.div(x, y + (s - 16) / 2, s, String(n), "font-family:" + F.mono + ";font-size:" + (s < 22 ? 11 : 12) + "px;font-weight:600;line-height:16px;text-align:center;color:" + txt);
  }
  // an allocated cause sheet at true area: paper, cut out and laid aside
  function causeSheet(c, x, y, w, h, n, alt) {
    var k = (n - 1) % 3;
    if (alt === "B" && k === 1) c.svg(S.sheet(x, y, w, h, { tone: "deep", mode: "solid" }));
    else if (alt === "B" && k === 2) c.svg(S.sheet(x, y, w, h, { tone: "grey", mode: "hatch", sw: 1 }));
    else c.svg(S.sheet(x, y, w, h, { tone: "blue", mode: "edge", sw: 1.5 }));
    c.svg(lit(x + 1.5, y + 1.5, w - 3, h - 3, { edge: 0.35 }));
  }
  function logRung(c, path, value, r, box, fit) {
    var trueArea = (box.w * box.h * value) / fit;
    c.log.rungs.push({ path: path, value: value, w: r.w, h: r.h, err: (r.w * r.h) / trueArea - 1 });
  }
  // a seeded PRNG for the Archive's sample sheets (stable between renders)
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ════════════════════════════════════════════════════════════════
     H1 · REDISTRIBUTE
     ════════════════════════════════════════════════════════════════ */
  function h1Title(c) {
    return c.copy("Spend the ", "index.html:827") + defWords(c, "index.html:827") + c.copy(" on the world instead", "index.html:827");
  }
  function h1Sub(c) {
    return (
      c.copy("Tap the causes you'd fund, ", "index.html:829") +
      '<b style="color:' + T.white + ';font-weight:600">' + c.copy("in order of priority — your most urgent first", "index.html:829-830") + "</b>" +
      c.copy(". The order you choose them in is your ranking. Watch the military budget in the centre drain as you go.", "index.html:830-831")
    );
  }
  function h1Prompt(c, rank) {
    if (!rank.length) return c.fig("DEFENCE", "T") + c.copy(" to redistribute", "index.html:837");
    return c.copy("✓ ", "js/main.js:613") + allocFig(c, rank) + c.copy(" redirected · ", "js/main.js:613") +
      c.sample(String(rank.length), "ranking.length") + " " + c.copy("priorities", "js/main.js:613");
  }
  function h1Count(c, rank) {
    if (!rank.length) return c.copy("0 · select issues to begin", "index.html:820");
    return c.sample(String(rank.length), "sel.size") + c.copy(" issue", "js/main.js:578") + c.copy("s", "js/main.js:578 (plural)") + c.copy(" funded", "js/main.js:578");
  }
  // The Sheet, drawn flat in its own coordinates: the ghost of the full
  // budget (dashed), the drained band hatched away, and what remains as lit
  // paper, anchored bottom-left inside the ghost. The giant figure sits low.
  function h1Sheet(c, box, rank) {
    var ph = c.phone;
    var full = c.rung("DEFENCE", D(), box, "bl");
    var rem = D() - allocB(rank);
    var r = SB.rungAt(rem, D(), box, "bl");
    if (rank.length) {
      logRung(c, "DEFENCE − chosen causes (remaining)", rem, r, box, D());
      c.svg('<path d="M' + full.x + " " + full.y + " h" + full.w + " v" + full.h + " h" + -full.w + " Z M" + r.x + " " + r.y + " v" + r.h + " h" + r.w + " v" + -r.h + ' Z" fill="url(#hatch-grey)" fill-rule="evenodd" opacity="0.7"/>');
      c.svg(S.rect(full.x + 0.5, full.y + 0.5, full.w - 1, full.h - 1, { fill: "none", stroke: "rgba(255,255,255,0.5)", "stroke-dasharray": "5 5" }));
      // the ghost keeps its figure: the earlier reference stays labelled. It
      // ends over the remaining sheet's right edge, so the drained band to its
      // right stays clear for the leader to ALLOCATED.
      var gl = (r.y - full.y) >= 30 ? 12 : 10;
      c.div(r.x + r.w - 150, full.y + Math.max(3, (r.y - full.y - gl * 1.35) / 2), 140,
        '<span style="background:' + T.ground + ';padding:0 4px">' + c.fig("DEFENCE", "T") + "</span>",
        TX.labelW + ";font-size:" + gl + "px;text-align:right");
    }
    c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
    c.svg(lit(r.x + 2, r.y + 2, r.w - 4, r.h - 4));
    var pad = ph ? 14 : 30, gs = ph ? 60 : 128;
    c.div(r.x + pad, r.y + (ph ? 18 : 32), r.w - pad * 2, c.copy("budget remaining", "index.html:806"), TX.label + ";font-size:" + (ph ? 10 : 12) + "px;color:" + T.soft);
    c.div(r.x + pad - (ph ? 2 : 5), r.y + r.h - gs * 0.9 - (ph ? 12 : 26), r.w - pad, rank.length ? remFig(c, rank) : c.fig("DEFENCE", "T"),
      TX.giant + ";font-size:" + gs + "px;white-space:nowrap");
    return { full: full, rem: r };
  }
  function sheetState(c, rect, rank) {
    c.state({
      form: rank.length ? "budget sheet, drained" : "budget sheet, full",
      x: rect.x, y: rect.y, w: rect.w, h: rect.h,
      tone: "red edge, neutral lit paper" + (rank.length ? "; dashed ghost at the full budget, drained band hatched" : ""),
      note: (rank.length ? "remaining = DEFENCE − chosen, true area, anchored bottom-left inside the ghost" : "area = DEFENCE; the reader has chosen nothing") +
        ". Lies on the desk, tipped back a few degrees; rect is where it sits on screen.",
    });
  }
  // one cause in the ledger: a 44px line, hairline above; a hollow mark, or
  // the blue rank square once chosen
  function ledgerRow(c, i, x, y, w, h, pos, alt, focus) {
    var on = pos > -1, ph = c.phone;
    c.svg(S.line(x, y + 0.5, x + w, y + 0.5, { stroke: on ? "rgba(255,255,255,0.34)" : T.rule }));
    if (on) badge(c, x, y + (h - 22) / 2, pos + 1, 22, alt);
    else c.svg(S.rect(x + 5.5, y + h / 2 - 5.5, 11, 11, { fill: "none", stroke: "rgba(255,255,255,0.45)" }));
    c.div(x + 32, y + (h - 14) / 2, 52, isdg(c, i), TX.label + ";font-size:10px;line-height:14px;white-space:nowrap");
    var nx = x + 86, cw = ph ? 96 : 100;
    c.div(nx, y + (h - 22) / 2, w - (nx - x) - cw, iname(c, i),
      "font-family:" + F.sans + ";font-size:" + (ph ? 15 : 16) + "px;font-weight:" + (on ? 600 : 400) + ";line-height:22px;white-space:nowrap;color:" + (on ? T.white : T.soft));
    c.div(x + w - cw, y + (h - 22) / 2, cw, cost(c, i) + '<span style="' + TX.src + ';font-size:10px;font-weight:400"> ' + c.copy("/yr", "js/main.js:489") + "</span>",
      TX.value + ";font-size:" + (ph ? 15 : 16) + "px;line-height:22px;text-align:right;color:" + (on ? T.white : T.soft));
    if (focus) focusRing(c, x, y + 3, w, h - 6);
  }
  // the summary's second sentence (main.js:601), a tool output
  function h1Stmt(c, rank) {
    var rem = D() - allocB(rank), n = rank.length;
    return c.copy("After funding ", "js/main.js:601") + c.sample(String(n), "sel.size") +
      c.copy(" global cris", "js/main.js:601") + c.copy("es", "js/main.js:601 (plural)") + c.copy(", ", "js/main.js:601") +
      remFig(c, rank) + ", " + c.sample(((rem / D()) * 100).toFixed(0) + "%", "tool output: updateSummary(), main.js:600-601") +
      c.copy(" of the military budget, remains. It continues to flow into weapons. This is the geometry of our current priorities.", "js/main.js:601");
  }
  // the summary under the ranking (main.js updateSummary), a tool output
  function h1Summary(c, rank, x, y, w) {
    var n = rank.length;
    c.div(x, y, w,
      '<b style="color:' + T.white + ';font-weight:600">' + allocFig(c, rank) + "</b>" + c.copy(" redirected to ", "js/main.js:600") +
      c.sample(String(n), "sel.size") + c.copy(" issue", "js/main.js:600") + c.copy("s", "js/main.js:600 (plural)") + c.copy(".", "js/main.js:600") + "<br>" +
      '<b style="color:' + T.white + ';font-weight:600">' + remFig(c, rank) + "</b>" + c.copy(" still goes to weapons.", "js/main.js:600"),
      TX.bodySm + ";font-size:18px;line-height:1.4;color:" + T.soft);
    c.div(x, y + 62, w, h1Stmt(c, rank), TX.bodySm + ";font-size:18px;line-height:1.45;color:" + T.grey);
  }
  // the journey gate, still locked: Step 01 sits blurred behind its message
  function h1Gate(c, x, y, w) {
    c.svg(S.line(x, y, x + w, y, { stroke: T.rule, "stroke-dasharray": "4 4" }));
    c.div(x, y + 16, w, c.copy("Step 01", "index.html:895"), TX.label + ";opacity:0.35");
    c.div(x, y + 36, w, c.copy("Your country", "index.html:896"), TX.title + ";font-size:40px;opacity:0.12;filter:blur(3px)");
    c.div(x, y + 22, w,
      c.copy("Your letter writes itself from your choices.", "index.html:880") + "<br>" + c.copy("Make one above to continue.", "index.html:880-881"),
      TX.bodySm + ";font-size:18px;text-align:center;color:" + T.white);
    button(c, x + (w - 280) / 2, y + 96, 280, 44, c.copy("▲ Choose what you'd fund", "index.html:887"), "outline", 15);
  }
  function h1Desk(c, rank, alt) {
    lightDefs(c);
    var on = rank.length > 0;
    // the ledger: every cause on one 44px line
    var LX = 64, LW = 344, LY = 96, RH = 44, n = SB.get("issueData").length;
    c.div(LX, 66, LW, h1Count(c, rank), (on ? TX.labelW : TX.label) + ";font-size:12px");
    for (var i = 0; i < n; i++) ledgerRow(c, i, LX, LY + i * RH, LW, RH, rank.indexOf(i), alt, !on && i === 0);
    c.svg(S.line(LX, LY + n * RH + 0.5, LX + LW, LY + n * RH + 0.5, { stroke: T.rule }));
    var cy = LY + n * RH + 18;
    button(c, LX, cy, LW, 48, c.copy("Continue → Your country", "index.html:869") + ' <span style="margin-left:6px">▾</span>', on ? "primary" : "off", 16);
    if (on) {
      button(c, LX, cy + 58, 166, 44, c.copy("↺ Reset", "index.html:858"), "quiet", 15);
      button(c, LX + 178, cy + 58, 166, 44, c.copy("↗ Share this", "index.html:859"), "quiet", 15);
    }
    // the title and the lead
    c.div(456, 62, 920, h1Title(c), TX.title + ";font-size:30px;white-space:nowrap");
    c.div(456, 104, 590, h1Sub(c), TX.bodySm + ";font-size:18px");
    // the Sheet: lit paper on the desk, tipped back
    var box = { x: 456, y: 248, w: 590, h: 364 }, m = 28;
    beam(c, box.x + box.w * 0.42, 70, box.y + box.h + 30, box.w * 1.15, 0.9);
    c.div(box.x, 216, 590, h1Prompt(c, rank), TX.labelW + ";font-size:12px");
    var res, t = { rx: 7, rz: -0.6, persp: 1900 };
    var P = lay(c, box.x - m, box.y - m, box.w + m * 2, box.h + m * 2, t, function (k) {
      res = h1Sheet(k, { x: m, y: m, w: box.w, h: box.h }, rank);
    });
    sheetState(c, corners(P, res.rem), rank);
    var f = res.full, r = res.rem;
    // registration marks at the ghost's corners
    [[f.x, f.y], [f.x + f.w, f.y], [f.x + f.w, f.y + f.h], [f.x, f.y + f.h]].forEach(function (q) { var s = P(q[0], q[1]); c.svg(reg(s[0] + (q[0] > f.x ? 12 : -12), s[1] + (q[1] > f.y ? 12 : -12), 5, 0.4)); });

    if (!on) {
      h1Gate(c, box.x, 648, box.w);
      return;
    }
    // drained → allocated: a leader from the hatched band to the figure
    var a = P((r.x + r.w + f.x + f.w) / 2, f.y + 46);
    c.svg(S.leader([a, [a[0] + 24, 214], [1078, 214]], {}));
    callout(c, 1090, 214, 1);
    c.div(1108, 192, 268, c.copy("allocated", "index.html:815"), TX.label);
    c.div(1108, 210, 268, allocFig(c, rank), TX.value + ";font-size:30px");
    // the chosen causes, cut out at true area and laid in the margin, in rank order
    var CX = 1082;
    c.div(CX, 274, 294, c.copy("Your priorities, in order", "index.html:846"), TX.labelW + ";font-size:12px");
    c.div(CX, 294, 294, c.copy("use ↑ ↓ to reorder · your top priority first", "index.html:847"), TX.src + ";font-size:11px");
    var ey = 344, rot = [-1.4, 1.2, -0.7];
    rank.forEach(function (idx, p) {
      var cr = c.rung("issueData[" + idx + "].cost", D(), box, "bl");
      c.svg('<g transform="rotate(' + rot[p] + " " + (CX + cr.w / 2) + " " + (ey + cr.h / 2) + ')">');
      causeSheet(c, CX, ey, cr.w, cr.h, p + 1, alt);
      c.svg("</g>");
      var ry = ey + cr.h + 10;
      badge(c, CX, ry + 11, p + 1, 22, alt);
      c.div(CX + 30, ry + 2, 118, iname(c, idx), "font-family:" + F.sans + ";font-size:15px;font-weight:600;line-height:20px;white-space:nowrap;color:" + T.white);
      c.div(CX + 30, ry + 23, 118, cost(c, idx) + c.copy("/yr", "js/main.js:941"), TX.src + ";font-size:11px");
      // reorder controls (live: ↑ ↓ ✕), 44px
      ["↑", "↓", "✕"].forEach(function (g, k) {
        var off = (g === "↑" && p === 0) || (g === "↓" && p === rank.length - 1);
        button(c, 1232 + k * 50, ry, 44, 44, g, off ? "off" : "quiet", 15);
      });
      ey = ry + 44 + 20;
    });
    h1Summary(c, rank, box.x, 646, box.w);
  }
  // phone: the Sheet fills the stage; the causes follow as a ledger
  function h1PhoneSheet(c, rank, box) {
    var res, m = 8;
    var P = lay(c, box.x - m, box.y - m, box.w + m * 2, box.h + m * 2, { rx: 6, rz: -0.5, persp: 1100 }, function (k) {
      res = h1Sheet(k, { x: m, y: m, w: box.w, h: box.h }, rank);
    });
    sheetState(c, corners(P, res.rem), rank);
    return res;
  }
  function h1Phone(c, rank, alt) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    c.div(st.x, 44, st.w, h1Prompt(c, rank), TX.labelW + ";font-size:11px");
    beam(c, 160, 40, 300, 360, 0.8);
    if (!rank.length) {
      h1PhoneSheet(c, rank, { x: st.x, y: 76, w: st.w, h: 206 });
      [0, 1, 2, 3].forEach(function (i) { ledgerRow(c, i, st.x, 300 + i * 50, st.w, 50, -1, alt, i === 0); });
      c.div(st.x, 506, st.w, "", "height:40px;background:linear-gradient(to bottom, rgba(10,10,10,0), " + T.ground + ")");
      c.div(tb.x, tb.y, tb.w, h1Title(c), TX.title + ";font-size:22px;line-height:1");
      c.div(tb.x, tb.y + 54, tb.w,
        c.copy("Tap the causes you'd fund, ", "index.html:829") +
        '<b style="color:' + T.white + ';font-weight:600">' + c.copy("in order of priority — your most urgent first", "index.html:829-830") + "</b>" +
        c.copy(".", "index.html:830"),
        TX.bodySm + ";font-size:15px;line-height:1.45");
      c.div(tb.x, tb.y + 112, tb.w, h1Count(c, rank), TX.label + ";font-size:11px");
      button(c, tb.x, tb.y + 140, tb.w, 48, c.copy("Continue → Your country", "index.html:869") + " ▾", "off");
      c.flag("copy", "Phone keeps the first sentence of the redistribute lead only; ‘Watch the military budget in the centre drain’ is dropped there (audit RED-1).");
      return;
    }
    var box = { x: st.x, y: 76, w: st.w, h: 196 };
    h1PhoneSheet(c, rank, box);
    var hy = 288;
    c.div(st.x, hy, 200, c.copy("Your priorities, in order", "index.html:846"), TX.labelW + ";font-size:10px");
    c.div(st.x + st.w - 150, hy - 2, 150, c.copy("allocated", "index.html:815") + " " +
      '<span style="' + TX.value + ';font-size:16px;letter-spacing:0;text-transform:none">' + allocFig(c, rank) + "</span>", TX.label + ";font-size:10px;text-align:right");
    // sheets at true area, in rank order, on one baseline: cut out and laid down
    var rs = rank.map(function (idx) { return c.rung("issueData[" + idx + "].cost", D(), box, "bl"); });
    var base = hy + 26 + Math.max.apply(null, rs.map(function (r) { return r.h; })), xs = st.x, rot = [-2, 1.5, -0.8];
    rs.forEach(function (r, p) {
      c.svg('<g transform="rotate(' + rot[p] + " " + (xs + r.w / 2) + " " + (base - r.h / 2) + ')">');
      causeSheet(c, xs, base - r.h, r.w, r.h, p + 1, alt);
      c.svg("</g>");
      c.div(xs + 5, base - r.h + 4, 20, String(p + 1), TX.labelW + ";font-size:10px;line-height:12px");
      xs += r.w + 18;
    });
    // stacked label rail with 44px reorder controls
    rank.forEach(function (idx, p) {
      var y = base + 12 + p * 48;
      c.svg(S.line(st.x, y, st.x + st.w, y, { stroke: T.rule }));
      badge(c, st.x, y + 12, p + 1, 22, alt);
      c.div(st.x + 32, y + 5, 150, iname(c, idx), "font-family:" + F.sans + ";font-size:15px;font-weight:600;line-height:20px;white-space:nowrap;color:" + T.white);
      c.div(st.x + 32, y + 25, 150, cost(c, idx) + c.copy("/yr", "js/main.js:941"), TX.src + ";font-size:11px");
      ["↑", "↓", "✕"].forEach(function (g, k) {
        var off = (g === "↑" && p === 0) || (g === "↓" && p === rank.length - 1);
        button(c, st.x + st.w - 140 + k * 48, y + 2, 44, 44, g, off ? "off" : "quiet", 15);
      });
    });
    c.div(tb.x, tb.y, tb.w, h1Count(c, rank), TX.value + ";font-size:20px");
    c.div(tb.x, tb.y + 30, tb.w, c.copy("The order you choose them in is your ranking.", "index.html:830"), TX.bodySm + ";font-size:14px");
    button(c, tb.x, tb.y + 66, tb.w, 48, c.copy("Continue → Your country", "index.html:869") + " ▾", "blueline");
    button(c, tb.x, tb.y + 126, 166, 44, c.copy("↺ Reset", "index.html:858"), "quiet", 14);
    button(c, tb.x + 177, tb.y + 126, 166, 44, c.copy("↗ Share this", "index.html:859"), "quiet", 14);
  }
  // phone plate: every figure of the step, still. The drained sheet, all
  // fourteen causes with their costs (chosen ones ranked), the summary.
  function h1PhonePlate(c, rank, alt) {
    lightDefs(c);
    c.div(16, 44, 343, h1Prompt(c, rank), TX.labelW + ";font-size:11px");
    var box = { x: 16, y: 68, w: 343, h: 170 }, res;
    var P = lay(c, box.x - 6, box.y - 6, box.w + 12, box.h + 12, {}, function (k) { res = h1Sheet(k, { x: 6, y: 6, w: box.w, h: box.h }, rank); });
    sheetState(c, corners(P, res.rem), rank);
    var n = SB.get("issueData").length, y0 = 252, rh = 31;
    for (var i = 0; i < n; i++) {
      var y = y0 + i * rh, pos = rank.indexOf(i), on = pos > -1;
      c.svg(S.line(16, y, 359, y, { stroke: on ? "rgba(255,255,255,0.34)" : T.rule }));
      if (on) badge(c, 16, y + 5, pos + 1, 20, alt);
      else c.svg(S.rect(20.5, y + 10.5, 10, 10, { fill: "none", stroke: "rgba(255,255,255,0.4)" }));
      c.div(44, y + 5, 200, iname(c, i),
        "font-family:" + F.sans + ";font-size:14px;font-weight:" + (on ? 600 : 400) + ";line-height:20px;white-space:nowrap;color:" + (on ? T.white : T.soft));
      c.div(239, y + 5, 120, cost(c, i) + '<span style="' + TX.src + ';font-size:10px;font-weight:400"> ' + c.copy("/yr", "js/main.js:489") + "</span>",
        TX.value + ";font-size:14px;line-height:20px;text-align:right;color:" + (on ? T.white : T.soft));
    }
    c.svg(S.line(16, y0 + n * rh, 359, y0 + n * rh, { stroke: T.rule }));
    c.div(16, y0 + n * rh + 10, 343, h1Stmt(c, rank), TX.bodySm + ";font-size:14px;line-height:1.4;color:" + T.grey);
  }

  SB.scene({
    order: 14,
    id: "H1",
    name: "Redistribute",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: "#redistribute",
    trigger: "The reader taps (or presses Enter on) a cause. Each choice adds it to the ranking; scroll position changes nothing.",
    camera: "None. The Sheet redraws on each choice.",
    reason:
      "Choosing a cause takes its cost out of the military budget sheet at true area, so the reader sees what their ranking moves. The first choice also opens the journey gate, and the country step shows how much of this same budget their own country puts in.",
    frames: [
      { k: "start", p: 0, cap: "Before any choice: the full military budget sheet, red-edged. Keyboard focus sits on the first cause." },
      { k: "state", p: 1, cap: "Three causes chosen. The budget sheet drains to what remains (dashed ghost = the full budget). The chosen sheets sit beside it at true area, in rank order 1 to 3." },
    ],
    alts: [
      {
        k: "B",
        label: "Quieter cause scheme",
        frames: ["state"],
        note:
          "Causes cycle blue edge / deep blue fill / grey hatch, and keep the rank number. Easier to tell neighbours apart, but deep blue would carry a live allocation, which §5 keeps for support only.",
      },
    ],
    draw: function (c) {
      var k = c.plate ? "state" : c.k;
      var rank = k === "state" ? RANK : [];
      if (c.phone && c.plate) h1PhonePlate(c, rank, c.alt);
      else if (c.phone) h1Phone(c, rank, c.alt);
      else h1Desk(c, rank, c.alt);
      if (k === "state") {
        c.flag("decision",
          "How the tools tell 14 causes apart (audit BR-04). Main: one blue for every cause, told apart by rank number, label and position. Alt B: blue edge / deep blue fill / grey hatch, still with rank numbers.");
        c.flag("decision",
          "The tool allows up to 13 causes; the database accepts 1 to 5, and a longer ranking is lost silently (audit MOD-2). Cap at 5, send the top 5, or widen the limit?");
      } else {
        c.flag("decision", "Cause cards are click-only divs today (audit KEY-1). Drawn here as buttons with a visible focus ring.");
      }
      c.flag("decision", "Chrome (top labels, progress scale) is off in every tool frame. Whether any of it returns after S13 is open: see S13 alt B (audit SCR-2).");
      c.flag("copy", "“Watch the military budget in the centre drain” describes the old canvas; with the Sheet it no longer sits in the centre on phone (audit RED-1).");
    },
  });

  /* ════════════════════════════════════════════════════════════════
     H2 · YOUR COUNTRY (+ tax slider)
     ════════════════════════════════════════════════════════════════ */
  var TAX_START = 430, TAX_KEY = 250; // default slider value (main.js:1087); after the reader moves it

  function h2Head(c, x, y, w, sz) {
    c.div(x, y, 200, c.copy("Step 01", "index.html:895"), TX.label + ";font-size:" + (sz < 40 ? 11 : 12) + "px");
    c.div(x, y + 22, w, c.copy("Your country", "index.html:896"), TX.title + ";font-size:" + sz + "px");
  }
  function h2Desc(c) {
    return c.copy("Every nation feeds the ", "index.html:898") + defWords(c, "index.html:898") +
      c.copy(" total. See what yours spends, and what that money could fund instead.", "index.html:898-899");
  }
  function h2Meta(c) {
    return c.fig(CP + "[3]", "pct") + c.copy(" of GDP · SIPRI 2025 · Population ~", "js/main.js:1075") +
      c.fig(CP + "[4]", "raw") + c.copy("M", "js/main.js:1075") + " · " +
      '<span style="color:' + T.white + ';text-decoration:underline">' + c.copy("Contact your representative ↗", "js/main.js:1046") + "</span>";
  }
  function h2Spend(c) { return c.copy("$", "js/main.js:1074") + c.fig(CP + "[2]", "raw") + c.copy("B", "js/main.js:1074"); }
  function h2Note(c, full) {
    var pct = c.sample(((SB.get(CP + "[2]") / D()) * 100).toFixed(2) + "%", "tool output: countryData spend ÷ DEFENCE × 100, 2 dp (main.js:1077)");
    return c.copy("Your country contributes ", "js/main.js:1077") + pct + c.copy(" of the ", "js/main.js:1077") +
      c.fig("DEFENCE", "T") + c.copy(" global military total.", "js/main.js:1077") +
      (full === false ? "" : c.copy(" This is the scale of your nation's stake in how the world chooses to spend its resources.", "js/main.js:1077"));
  }
  // what the country's spend could cover: the first six causes (main.js:1031-1043).
  // Bars in brand blue (BR-04); the % is the live tool's own output.
  function h2Compare(c, x, y, w, rowH, size) {
    var spend = SB.get(CP + "[2]");
    var nameW = Math.round(w * 0.42), pctW = 48, trX = x + nameW + 8, trW = w - nameW - 8 - pctW - 8;
    for (var i = 0; i < 6; i++) {
      var cst = costOf(i), ry = y + i * rowH;
      var fill = Math.min(spend / cst, 1), canFund = spend >= cst;
      c.div(x, ry, nameW, iname(c, i), "font-family:" + F.sans + ";font-size:" + size + "px;line-height:" + rowH + "px;white-space:nowrap;color:" + T.soft);
      c.svg(S.line(trX, ry + rowH / 2, trX + trW, ry + rowH / 2, { stroke: "rgba(255,255,255,0.16)" }));
      c.svg(S.line(trX + trW, ry + rowH / 2 - 4, trX + trW, ry + rowH / 2 + 4, { stroke: "rgba(255,255,255,0.3)" }));
      c.svg(S.rect(trX, ry + rowH / 2 - 2.5, trW * fill, 5, { fill: T.blue }));
      c.div(trX + trW + 8, ry, pctW, c.sample(((spend / cst) * 100).toFixed(0) + "%", "tool output: country spend ÷ " + "issueData[" + i + "].cost × 100, 0 dp (main.js:1036)"),
        TX.value + ";font-size:" + size + "px;line-height:" + rowH + "px;text-align:right;color:" + (canFund ? T.white : T.grey));
    }
  }
  // trend indicator (main.js:1049-1059); arrow kept white, the screen's one red mark is the rung
  function h2Trend(c, x, y, w, big, small) {
    var nm = SB.get(CP + "[0]"), tv = SB.get("countryTrend." + nm), up = tv >= 0;
    c.div(x, y, w, c.copy("Where ", "js/main.js:1079") + c.fig(CP + "[0]", "raw") + c.copy(" is heading", "js/main.js:1079"), TX.label + ";font-size:" + (small < 12 ? 10 : 11) + "px");
    c.div(x, y + 20, w, (up ? "▲ +" : "▼ ") + c.fig("countryTrend." + nm, "pct"), TX.value + ";font-size:" + big + "px");
    c.div(x, y + 24 + big, w,
      c.copy("change in ", "js/main.js:1058") + c.fig(CP + "[0]", "raw") + c.copy("'s military spend, 2024 to 2025", "js/main.js:1058") + ". " +
      (up ? c.copy("Spending is climbing.", "js/main.js:1058") : c.copy("Spending is falling.", "js/main.js:1058")),
      TX.src + ";font-size:" + small + "px");
  }
  function cur(c) { return c.fig("CURRENCY." + SB.get(CP + "[0]"), "raw"); }
  // The world total as a plane receding into the dark (dashed ghost on a
  // cross grid), the country's sheet lit in its near corner at true area:
  // its spend is part of the world total, so nesting is honest here.
  function h2Plane(c, X, Y, W, H, t, o) {
    o = o || {};
    var ph = c.phone, res;
    var P = lay(c, X, Y, W, H, t, function (k) {
      var box = { x: 0, y: 0, w: W, h: H };
      var full = k.rung("DEFENCE", D(), box, "bl");
      k.svg(S.grid(0, 0, W, H, ph ? 34 : 50, { color: "rgba(255,255,255,0.045)", ticks: !ph }));
      k.svg(S.rect(full.x + 0.5, full.y + 0.5, full.w - 1, full.h - 1, { fill: "none", stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "5 5" }));
      var r = k.rung(CP + "[2]", D(), box, "bl");
      k.svg('<ellipse cx="' + (r.x + r.w / 2) + '" cy="' + (r.y + r.h / 2) + '" rx="' + r.w * 1.6 + '" ry="' + r.h * 2.2 + '" fill="url(#hoPool)"/>');
      k.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 6 : 10 }));
      k.svg(lit(r.x + 2, r.y + 2, r.w - 4, r.h - 4, { edge: 0.6 }));
      var small = W < 240, tipped = !!(t && t.rx);
      // set a size up on a tipped plane, which foreshortens it; o.labelRight
      // keeps it clear of a leader rising from the country's sheet
      if (o.label !== false)
        k.div(full.x + (ph ? (small ? 8 : 12) : 22), full.y + (ph ? (small ? 8 : 12) : 18), o.labelRight ? full.w - 24 : Math.min(400, full.w - 24),
          c.fig("DEFENCE", "T") + " · " + c.copy("global military total", "js/main.js:1077"),
          TX.label + ";font-size:" + ((ph ? 10 : 12) + (tipped ? 1 : 0)) + "px;text-transform:uppercase;letter-spacing:" + (small ? "0.06em" : "0.14em") + (o.labelRight ? ";text-align:right" : ""));
      res = { r: r, full: full };
    });
    var rr = corners(P, res.r);
    c.state({ form: "budget sheet as a frame, country rung inside", x: rr.x, y: rr.y, w: rr.w, h: rr.h, tone: "country rung red edge, lit; world total dashed ghost on a grid, receding", note: "true area: the country's spend is part of the world total, so nesting is honest here. The plane tips back like a map on a table; rect is where the rung sits on screen." });
    return { P: P, r: res.r, full: res.full, rr: rr };
  }
  // the slider as an instrument: a ruled track
  function slider(c, x, y, w, pos, focused) {
    var t = pos / 1000, tx = x + w * t;
    for (var i = 0; i <= 30; i++) {
      var gx = x + (w * i) / 30, major = i % 10 === 0;
      c.svg(S.line(gx, y + 9, gx, y + (major ? 19 : 13), { stroke: "rgba(255,255,255," + (major ? 0.5 : 0.22) + ")" }));
    }
    c.svg(S.line(x, y, x + w, y, { stroke: "rgba(255,255,255,0.25)", "stroke-width": 4 }));
    c.svg(S.line(x, y, tx, y, { stroke: T.white, "stroke-width": 4 }));
    c.svg(S.circle(tx, y, 11, { fill: T.white }));
    c.svg(S.circle(tx, y, 4, { fill: T.ground }));
    if (focused) {
      c.svg(S.circle(tx, y, 18, { fill: "none", stroke: T.white, "stroke-width": 2 }));
      c.svg(S.rect(x - 10, y - 26, w + 20, 52, { fill: "none", stroke: T.white, "stroke-width": 1, "stroke-dasharray": "2 3", opacity: 0.6 }));
    }
  }
  function sliderScale(c, x, y, w, size) {
    var cu = cur(c), st = TX.src + ";font-size:" + size + "px;";
    var labs = [c.copy("0", "js/main.js:1088"), cu + c.copy("100k", "js/main.js:1088"), cu + c.copy("1M", "js/main.js:1088"), cu + c.copy("6M", "js/main.js:1088")];
    c.div(x, y, w, labs.map(function (l) { return "<span>" + l + "</span>"; }).join(""), st + "display:flex;justify-content:space-between");
  }
  function taxResult(c, t) {
    var cu = cur(c);
    var how = "tool output at slider " + t.pos + " (main.js:1126-1149, rates hard-coded in main.js)";
    return {
      amt: cu + c.sample(fmtMoney(t.toWar), how),
      lbl: c.copy("of your income tax goes to ", "js/main.js:1148") + c.fig(CP + "[0]", "raw") +
        c.copy("'s military each year, about ", "js/main.js:1148") +
        "<b style='color:" + T.white + "'>" + cu + c.sample(t.perDay, how) + c.copy(" a day", "js/main.js:1148") + "</b>" +
        c.copy(". That's ", "js/main.js:1148") + c.sample((t.share * 100).toFixed(1) + "%", how) +
        c.copy(" of the roughly ", "js/main.js:1148") + cu + c.sample(fmtMoney(t.annual), how) +
        c.copy(" you'd pay in income tax.", "js/main.js:1148"),
      note: c.copy("Indicative estimate. Assumes government spending ≈ ", "js/main.js:1149") +
        c.sample(String(Math.round(SB.get("GOV_SPEND_GDP") * 100)), "Math.round(GOV_SPEND_GDP × 100)") +
        c.copy("% of GDP and a representative progressive tax rate; not tax advice. Built to wire into real national tax data later.", "js/main.js:1149"),
    };
  }
  function income(c, t, size) {
    return '<span style="color:' + T.grey + '">' + cur(c) + "</span>" +
      c.sample(fmtMoney(t.income), "sliderToIncome(" + t.pos + "), main.js:1110") +
      '<span style="' + TX.src + ";font-size:" + Math.max(10, Math.round(size * 0.5)) + 'px"> ' + c.copy("/yr income", "js/main.js:1086") + "</span>";
  }
  function h2Desk(c, focused) {
    lightDefs(c);
    var t = tax(focused ? TAX_KEY : TAX_START);
    // the step, on the left
    h2Head(c, 96, 62, 440, 48);
    c.div(96, 140, 424, h2Desc(c), TX.bodySm + ";font-size:18px");
    field(c, 96, 232, 424, 48, c.fig(CP + "[0]", "raw"), { value: true, caret: true, size: 17 });
    c.div(96, 298, 424, h2Meta(c), TX.src + ";font-size:11px;line-height:1.7");
    c.div(96, 352, 424, h2Note(c), TX.bodySm + ";font-size:18px");
    // the world total as a plane receding into the dark; the country's sheet lit in its near corner
    beam(c, 640, 60, 330, 360, 0.9);
    var pl = h2Plane(c, 584, 40, 792, 300, { rx: 36, persp: 1500 });
    // the country's spend, set giant in front of the plane, with a leader down to its sheet
    var tip = pl.P(pl.r.x + pl.r.w, pl.r.y);
    c.svg(S.leader([[tip[0] - 4, tip[1] + 4], [770, 214]], {}));
    c.div(780, 190, 420, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:12px");
    c.div(772, 206, 600, h2Spend(c), TX.giant + ";font-size:150px;white-space:nowrap");
    // what that spend could cover, and the trend, as marginalia under the plane
    h2Compare(c, 584, 380, 380, 21, 14);
    h2Trend(c, 1024, 380, 352, 30, 11);
    // the tax instrument
    c.svg(S.line(96, 520, 1376, 520, { stroke: T.rule }));
    c.div(96, 540, 600, c.copy("Where does your tax money go?", "js/main.js:1083"), TX.title + ";font-size:28px");
    c.div(96, 582, 540, c.copy("Slide to your income and see how much of your tax funds the military each year.", "js/main.js:1084"), TX.bodySm + ";font-size:18px");
    c.div(96, 652, 540, income(c, t, 32), TX.value + ";font-size:32px");
    slider(c, 106, 724, 520, t.pos, focused);
    sliderScale(c, 96, 762, 540, 12);
    var r = taxResult(c, t);
    c.div(700, 532, 676, r.amt + '<span style="' + TX.src + ';font-size:15px;letter-spacing:0.06em"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.giant + ";font-size:76px;color:" + (focused ? T.white : T.soft));
    c.div(704, 626, 640, r.lbl, TX.bodySm + ";font-size:18px");
    c.div(704, 696, 620, r.note, TX.src + ";font-size:12px");
    button(c, 704, 778, 320, 48, c.copy("Continue → Write the letter", "index.html:925"), "primary", 16);
  }
  function h2Phone(c, k) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    if (k === "state") {
      h2Head(c, st.x, 44, st.w, 30);
      field(c, st.x, 106, st.w, 48, c.fig(CP + "[0]", "raw"), { value: true, caret: true, size: 16 });
      c.div(st.x, 172, 300, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:10px");
      c.div(st.x - 4, 186, 360, h2Spend(c), TX.giant + ";font-size:100px;white-space:nowrap");
      beam(c, 50, 30, 540, 220, 0.9);
      var pl = h2Plane(c, st.x + 12, 330, st.w - 24, 210, { rx: 38, persp: 900 }, { labelRight: true });
      var tip = pl.P(pl.r.x + pl.r.w * 0.6, pl.r.y);
      c.svg(S.leader([[tip[0], tip[1] - 2], [tip[0], 290]], {}));
      c.div(tb.x, tb.y, tb.w, h2Meta(c), TX.src + ";font-size:11px;line-height:1.6");
      c.div(tb.x, tb.y + 44, tb.w, h2Note(c, false), TX.bodySm + ";font-size:15px");
      button(c, tb.x, tb.y + 116, tb.w, 48, c.copy("Continue → Write the letter", "index.html:925"), "blueline");
      return;
    }
    if (k === "plate") {
      // every figure of the step, still, in reading order
      var t0 = tax(TAX_KEY), r0 = taxResult(c, t0); // the reader's own reading, as the letter quotes it
      c.div(16, 44, 200, c.copy("Step 01", "index.html:895"), TX.label + ";font-size:10px");
      c.div(16, 60, 343, c.copy("Your country", "index.html:896"), TX.title + ";font-size:24px");
      c.div(16, 94, 160, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:10px");
      c.div(14, 108, 180, h2Spend(c), TX.giant + ";font-size:44px");
      h2Plane(c, 200, 92, 159, 74, {});
      c.div(16, 176, 343, h2Meta(c), TX.src + ";font-size:10px");
      c.div(16, 210, 343, h2Note(c), TX.bodySm + ";font-size:14px;line-height:1.4");
      h2Compare(c, 16, 298, 343, 20, 12);
      h2Trend(c, 16, 424, 343, 18, 10);
      c.svg(S.line(16, 506, 359, 506, { stroke: T.rule }));
      c.div(16, 516, 343, income(c, t0, 18), TX.value + ";font-size:18px");
      slider(c, 26, 554, 323, t0.pos, false);
      c.div(16, 582, 343, r0.amt + '<span style="' + TX.src + ';font-size:12px"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.giant + ";font-size:28px");
      c.div(16, 618, 343, r0.lbl, TX.bodySm + ";font-size:14px;line-height:1.4");
      c.div(16, 704, 343, r0.note, TX.src + ";font-size:10px");
      return;
    }
    var t = tax(TAX_KEY), r = taxResult(c, t);
    c.div(st.x, 44, 200, c.fig(CP + "[0]", "raw"), TX.label + ";font-size:11px");
    c.div(st.x, 64, st.w, c.copy("Where does your tax money go?", "js/main.js:1083"), TX.title + ";font-size:28px");
    c.div(st.x, 130, st.w, c.copy("Slide to your income and see how much of your tax funds the military each year.", "js/main.js:1084"), TX.bodySm + ";font-size:15px");
    c.div(st.x, 204, st.w, income(c, t, 30), TX.value + ";font-size:30px");
    slider(c, st.x + 18, 282, st.w - 36, t.pos, true);
    sliderScale(c, st.x, 318, st.w, 11);
    c.div(st.x, 352, st.w, r.amt + '<span style="' + TX.src + ';font-size:13px;letter-spacing:0.06em"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.giant + ";font-size:72px");
    c.div(st.x, 436, st.w, r.lbl, TX.bodySm + ";font-size:14px;line-height:1.45");
    c.div(tb.x, tb.y, tb.w, r.note, TX.src + ";font-size:10px");
    button(c, tb.x, tb.y + 82, tb.w, 48, c.copy("Continue → Write the letter", "index.html:925"), "blueline");
    c.state({ form: "slider (no sheet on screen)", x: st.x, y: 282, w: st.w, h: 0, tone: "neutral", note: "phone shows the tax step on its own screen; the sheet with the country rung is one swipe up" });
  }

  SB.scene({
    order: 15,
    id: "H2",
    name: "Your country",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: "#countrySection",
    trigger: "Unlocked by the first cause choice (journey gate). The reader picks a country in the select; the time zone may preselect one.",
    camera: "None.",
    reason:
      "Seeing their own country's spend as a small sheet inside the world total, and then their own tax share, makes the letter that follows personal: the next step writes these choices into it.",
    frames: [
      { k: "state", p: 0, cap: "Country picked. Its spend appears as a sheet at true area inside the dashed world total (the screen's one red mark). Beside it, what that spend could cover of the first six causes (blue bars, the live tool's own %), and the trend. The tax slider rests at its default. Phone: the spend and its sheet only; the rest follows on scroll (all of it is on the plate)." },
      { k: "focus", p: 1, cap: "The slider has keyboard focus (white ring on the thumb, dashed outline on the track) and has been moved with the keyboard; the tax result updates (this reading is the one the letter quotes). Nothing here reads the scroll. Phone: the tax step on its own screen." },
    ],
    draw: function (c) {
      var k = c.plate ? "plate" : c.k;
      if (c.phone) h2Phone(c, k);
      else {
        h2Desk(c, k === "focus" || k === "plate");
      }
      c.flag("decision", "Tax rates are hard-coded in main.js and differ from data.js taxBrackets (audit F06). Frames use the main.js curve, as the live tool does.");
      c.flag("decision", "The country card's ‘What people in [country] would fund first’ panel is built from seeded weights (audit COA-2). Not drawn here; decision 4 (remove seeds) would remove or rebuild it.");
      c.flag("decision", "Comparison bars and the trend arrow drop their per-cause colours and green/red: bars in brand blue, values white when the spend covers the cause, grey when not; the arrow stays white so the country sheet is the one red mark (audit BR-04, BR-05).");
      if (k !== "state") c.flag("decision", "The tax slider has no focus style today (audit KEY-2). Drawn with a white ring on the thumb and a dashed outline on the track.");
    },
    plate: function (c) { this.draw(c); },
  });

  /* ════════════════════════════════════════════════════════════════
     H3 · LETTER (the editable letter is the Sheet)
     ════════════════════════════════════════════════════════════════ */
  var NAME_DEFAULT = "A concerned citizen";
  var CARET = '<span style="display:inline-block;width:2px;height:1.15em;margin-left:2px;vertical-align:-0.2em;background:' + T.white + '"></span>';
  // part: 'full' / 'top' (the letter from its start), 'end' (scrolled to its
  // end), 'plate' (no-motion plate: every figure of the letter, with the
  // figure-free passages elided as […])
  function letterParas(c, part, editing) {
    var cname = c.fig(CP + "[0]", "raw");
    var leader = c.copy("Prime Minister / President of ", "js/main.js:1174") + cname;
    var name = c.copy(NAME_DEFAULT, "js/main.js:1169");
    var mark = function (html) {
      return '<span style="outline:1px dashed rgba(255,255,255,0.7);outline-offset:1px;margin-right:3px">' + html + "</span>";
    };
    var P = [];
    if (part !== "end") {
      P.push(c.copy("Dear ", "js/main.js:1206") + leader + ",");
      if (part !== "plate") P.push(mark(c.copy("My name is ", "js/main.js:1208") + name + ".") +
        c.copy(" I am writing to you not as a partisan voice, not as an ideologue, and not from a place of anger, but as a human being who has sat with some uncomfortable numbers and can no longer stay quiet about what they mean.", "js/main.js:1208"));
      var contrib = cname + c.copy(" contributed $", "js/main.js:1178") + c.fig(CP + "[2]", "raw") +
        c.copy(" billion to that total, ", "js/main.js:1178") + c.fig(CP + "[3]", "pct") + c.copy(" of our national GDP.", "js/main.js:1178");
      P.push((part === "plate" ? "[…] " : "") + c.copy("In ", "js/main.js:1210") + c.prose("2025", "machineData[0].sum") + c.copy(", the world spent ", "js/main.js:1210") +
        defWords(c, "js/main.js:1210") + c.copy(" on its militaries, the eleventh consecutive annual record. ", "js/main.js:1210") + contrib +
        (part === "plate" ? " […]" :
          c.copy(" I do not write to question the sincerity of those who serve, or to pretend that the threats governments face are not real. I understand that the world is not safe.", "js/main.js:1210")));
      if (part !== "plate") P.push("[…]");
      P.push(c.copy("This year, ", "js/main.js:1214") + c.prose("673 million", "issueData[0].sum") + c.copy(" people went hungry. ", "js/main.js:1214") +
        c.prose("272 million", "issueData[2].sum") + c.copy(" children could not go to school. ", "js/main.js:1214") +
        c.fig("displacedStats.displaced", "Mword") + c.copy(" people remain displaced from their homes. The UN's humanitarian appeal received barely a third of what it asked for, while spending on nuclear weapons alone rose ", "js/main.js:1214") +
        c.prose("19%", "machineData[1].sum") + c.copy(" to a record $", "js/main.js:1214") + c.fig("machineData[1].amtB", "raw") + c.copy(" billion.", "js/main.js:1214") + " […]");
      if (part === "top") return P; // clipped and faded: the letter runs on below
    } else P.push("[…]");
    if (part === "plate") P.push(c.copy("My priorities are:", "js/main.js:1216"));
    else P.push(c.copy("I have thought carefully about where I believe the world must focus its resources. My priorities are:", "js/main.js:1216"));
    P.push(RANK.map(function (idx, i) {
      return "&nbsp;&nbsp;" + (i + 1) + ". " + iname(c, idx) + " (" + cost(c, idx) + c.copy(" per year)", "js/main.js:1185");
    }).join("<br>"));
    var tot = allocB(RANK);
    P.push(c.copy("To fund ", "js/main.js:1195") + c.copy("all ", "js/main.js:1195 (n > 1)") + c.sample(String(RANK.length), "ranking.length") +
      c.copy(" at the levels needed would cost ", "js/main.js:1195") + allocFig(c, RANK) + c.copy(" per year, about ", "js/main.js:1195") +
      pctOfDefence(c, tot, "tool output: round(chosen total ÷ DEFENCE × 100), main.js:1195") +
      c.copy("% of one year of global military spending. Not a utopian fantasy. A budget question.", "js/main.js:1195"));
    // the personal line: present because the reader moved the tax slider in H2
    var tw = tax(TAX_KEY);
    P.push(c.copy("This is not abstract to me. By my own estimate, roughly ", "js/main.js:1203") + cur(c) +
      c.sample(Math.round(tw.toWar).toLocaleString("en-US"), "userTax.toWar after the H2 slider move (slider " + TAX_KEY + "), main.js:1203") +
      c.copy(" of the income tax I pay each year goes toward military spending. I would rather it built something.", "js/main.js:1203") +
      (editing ? CARET : ""));
    P.push("[…]");
    P.push(c.copy("Yours sincerely,", "js/main.js:1228") + "<br><br>" + mark(name) + "<br>" + cname);
    return P;
  }
  // The letter as a sheet of paper lying on the desk, drawn flat in its own
  // box (w × h). o.paper: [top, bottom] of the paper in local y (it may run
  // past the box: the paper bleeds off the frame, the text fades before it).
  // o.text: [top, bottom] of the text block.
  function letterPaper(k, w, part, editing, size, o) {
    var ph = k.phone, pad = ph ? 16 : 44;
    var p0 = o.paper[0], p1 = o.paper[1];
    k.svg(S.sheet(0, p0, w, p1 - p0, { tone: "white", mode: "edge", sw: 1 }));
    k.svg(lit(1, p0 + 1, w - 2, Math.min(p1 - p0, 700) - 2));
    k.svg(S.rect(0, p0, 10, 10, { fill: T.blue }));
    if (editing) k.svg(S.rect(-5, p0 - 5, w + 10, p1 - p0 + 10, { fill: "none", stroke: T.white, "stroke-width": 2 }));
    var ty = o.text[0];
    if (o.toolbar) {
      var by = p0 + (ph ? 12 : 14);
      k.div(pad, p0 + (ph ? 16 : 28), 240, k.copy("Your letter · editable", "index.html:963"), TX.label + ";font-size:" + (ph ? 10 : 11) + "px");
      var tools = [["Copy", "index.html:965"], ["Email", "index.html:966"], ["Post to X", "index.html:968"]];
      if (ph) tools.forEach(function (t, i) { button(k, pad + i * 106, p0 + 38, 98, 44, k.copy(t[0], t[1]), "quiet", 14); });
      else tools.forEach(function (t, i) { button(k, w - pad - 3 * 96 + 8 + i * 96, by, 88, 44, k.copy(t[0], t[1]), "quiet", 14); });
      k.svg(S.line(pad, ty - 14, w - pad, ty - 14, { stroke: T.rule }));
    } else if (o.header) {
      k.div(pad, p0 + 16, 260, k.copy("Your letter · editable", "index.html:963"), TX.label + ";font-size:10px");
      k.svg(S.line(pad, ty - 10, w - pad, ty - 10, { stroke: T.rule }));
    }
    var body = letterParas(k, part, editing).map(function (p) { return '<p style="margin:0 0 ' + (o.gap || (ph ? 9 : 12)) + 'px">' + p + "</p>"; }).join("");
    var mask = o.fade === "bottom" ? "-webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0));mask-image:linear-gradient(to bottom, rgba(0,0,0,1) 78%, rgba(0,0,0,0));" :
      o.fade === "top" ? "-webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 56px);mask-image:linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1) 56px);" : "";
    k.div(pad, ty, w - pad * 2, body, "font-family:" + F.sans + ";font-size:" + size + "px;line-height:" + (o.lh || 1.5) + ";color:" + T.soft + ";height:" + (o.text[1] - ty) + "px;overflow:hidden;" + mask);
  }
  function letterState(c, rect, part, editing) {
    c.state({
      form: "letter (the Sheet as paper)", x: rect.x, y: rect.y, w: rect.w, h: rect.h, tone: "neutral paper, white hairline, blue tab; lit from above, lying on the desk",
      note: (editing ? "contenteditable has focus: white ring and caret. " : "generated from the reader's choices; editable in full. ") +
        (part === "top" || part === "full" ? "The top of the letter; it runs on below the frame." : part === "end" ? "Scrolled to the end of the letter." : part === "plate" ? "Plate: every figure in the letter, figure-free passages elided." : ""),
    });
  }
  function letterConsent(c, x, y, w, size, on, focus) {
    checkbox(c, x, y + 3, on, 20);
    if (focus) focusRing(c, x, y + 3, 20, 20);
    c.div(x + 32, y, w - 32,
      c.copy("Add my letter to ", "index.html:1073") + "<b style='color:" + T.white + "'>" + c.copy("The Archive", "index.html:1073") + "</b>" +
      c.copy(", the shared artwork of every message written here. Published without your name or email, and only after review. Leave unticked and your letter is never stored.", "index.html:1073-1076"),
      TX.bodySm + ";font-size:" + size + "px;line-height:1.45");
  }
  function contactNote(c, x, y, w, size) {
    c.div(x, y, w, c.copy("Find your representative: ", "js/main.js:1102") +
      '<span style="color:' + T.white + ';text-decoration:underline">' + c.fig(CP + "[0]", "raw") + c.copy(" government contact page ↗", "js/main.js:1102") + "</span>", TX.src + ";font-size:" + size + "px");
  }
  function h3Left(c) {
    c.div(72, 62, 380, c.copy("Step 02", "index.html:934"), TX.label);
    c.div(72, 84, 380, c.copy("Write the letter", "index.html:935"), TX.title + ";font-size:52px");
    c.div(72, 196, 372, c.copy("A personal letter, pre-written from your choices and editable in full. Address it to your head of state. Send it, post it, or screenshot it.", "index.html:937-939"), TX.bodySm + ";font-size:18px");
    field(c, 72, 298, 372, 56, c.copy("Your name (optional, defaults to 'A concerned citizen')", "index.html:950"), { size: 15, wrap: true });
    field(c, 72, 364, 372, 56, c.copy("Your leader's name / title (e.g. Prime Minister Starmer)", "index.html:957"), { size: 15, wrap: true });
    c.svg(S.line(72, 438, 444, 438, { stroke: T.rule }));
    letterConsent(c, 72, 454, 372, 18, false, false);
    // the one primary action, the contact note, two quiet links
    button(c, 72, 608, 372, 56, c.copy("✉ Send this letter to your representative", "index.html:983"), "primary", 16);
    contactNote(c, 72, 676, 372, 12);
    button(c, 72, 732, 180, 44, c.copy("Generate shareable card", "index.html:988"), "quiet", 14);
    button(c, 264, 732, 180, 44, c.copy("Skip to the coalition", "index.html:992"), "quiet", 14);
  }
  function h3Right(c) {
    // storyboard key (not page UI): what the dashed marks in the letter are
    c.svg(S.rect(1214.5, 66.5, 22, 13, { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-dasharray": "2 2" }));
    c.div(1246, 64, 130, c.label("TYPED NAME · AUDIT CON-1", "storyboard key for the dashed marks"), TX.label + ";font-size:10px");
  }
  var LET_D = { x: 500, w: 684 };
  function h3Desk(c, editing) {
    lightDefs(c);
    h3Left(c);
    beam(c, LET_D.x + LET_D.w * 0.45, 80, 300, 760, 0.45);
    var P, part, rect;
    if (!editing) {
      // the top of the letter; the paper runs off the bottom of the frame
      part = "full";
      P = lay(c, LET_D.x, 62, LET_D.w, 772, { rx: 5, rz: -1.1, persp: 2200 }, function (k) {
        letterPaper(k, LET_D.w, "full", false, 18, { paper: [0, 1180], text: [88, 772], toolbar: true, fade: "bottom" });
      });
      rect = corners(P, { x: 0, y: 0, w: LET_D.w, h: 1180 });
    } else {
      // scrolled to the end: the paper runs off the top, its foot rests on the desk
      part = "end";
      P = lay(c, LET_D.x, 56, LET_D.w, 640, { rx: 5, rz: -1.1, persp: 2200 }, function (k) {
        letterPaper(k, LET_D.w, "end", true, 18, { paper: [-520, 640], text: [8, 628], fade: "top" });
      });
      rect = corners(P, { x: 0, y: -520, w: LET_D.w, h: 1160 });
    }
    letterState(c, rect, part, editing);
    h3Right(c);
  }
  function h3DeskPlate(c) {
    lightDefs(c);
    h3Left(c);
    var P = lay(c, LET_D.x, 58, LET_D.w, 780, {}, function (k) {
      letterPaper(k, LET_D.w, "plate", false, 18, { paper: [0, 780], text: [50, 772], header: true, lh: 1.42, gap: 9 });
    });
    letterState(c, corners(P, { x: 0, y: 0, w: LET_D.w, h: 780 }), "plate", false);
    h3Right(c);
  }
  function h3Phone(c, editing) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox, P;
    beam(c, 190, 40, 200, 300, 0.7);
    if (!editing) {
      c.div(st.x, 44, st.w, c.copy("Step 02", "index.html:934") + " · " + c.copy("Write the letter", "index.html:935"), TX.label + ";font-size:10px");
      P = lay(c, st.x, 64, st.w, 494, { rx: 4, rz: -0.8, persp: 1200 }, function (k) {
        letterPaper(k, st.w, "top", false, 14, { paper: [0, 560], text: [100, 494], toolbar: true, fade: "bottom", lh: 1.48 });
      });
      letterState(c, corners(P, { x: 0, y: 0, w: st.w, h: 560 }), "top", false);
      // sticky action bar while the letter is on screen: the paper runs on under it
      c.div(0, 552, 375, "", "height:260px;background:linear-gradient(to bottom, rgba(10,10,10,0), " + T.ground + " 22px)");
      c.svg(S.line(0, 566.5, 375, 566.5, { stroke: T.rule }));
      button(c, tb.x, tb.y + 4, tb.w, 56, c.copy("✉ Send this letter to your representative", "index.html:983"), "blueline", 15);
      button(c, tb.x, tb.y + 72, 166, 44, c.copy("Generate shareable card", "index.html:988"), "quiet", 14);
      button(c, tb.x + 177, tb.y + 72, 166, 44, c.copy("Skip to the coalition", "index.html:992"), "quiet", 14);
      contactNote(c, tb.x, tb.y + 130, tb.w, 11);
      return;
    }
    P = lay(c, st.x, 40, st.w, 512, { rx: 4, rz: -0.8, persp: 1200 }, function (k) {
      letterPaper(k, st.w, "end", true, 14, { paper: [-300, 512], text: [10, 500], fade: "top", lh: 1.48 });
    });
    letterState(c, corners(P, { x: 0, y: -300, w: st.w, h: 812 }), "end", true);
    letterConsent(c, tb.x, tb.y + 6, tb.w, 14, false, false);
    // the one primary action stays in reach below the letter
    button(c, tb.x, tb.y + 128, tb.w, 56, c.copy("✉ Send this letter to your representative", "index.html:983"), "blueline", 15);
  }
  // phone plate: one still sheet with every figure the letter carries
  function h3PhonePlate(c) {
    lightDefs(c);
    c.div(16, 44, 343, c.copy("Step 02", "index.html:934") + " · " + c.copy("Write the letter", "index.html:935"), TX.label + ";font-size:10px");
    var P = lay(c, 16, 62, 343, 726, {}, function (k) {
      letterPaper(k, 343, "plate", false, 14, { paper: [0, 726], text: [44, 718], header: true, lh: 1.42 });
    });
    letterState(c, corners(P, { x: 0, y: 0, w: 343, h: 726 }), "plate", false);
  }

  SB.scene({
    order: 16,
    id: "H3",
    name: "Letter",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: "#letterSection",
    trigger: "Reached from ‘Continue → Write the letter’. The letter rewrites itself whenever a choice, the name or the leader field changes.",
    camera: "None.",
    reason:
      "The Sheet becomes the reader's own letter, built from their ranking and country, so the paper that carried the budget now carries their answer. Sending it, or adding it to the coalition next, is what lets that sheet join the Archive.",
    frames: [
      { k: "state", p: 0, cap: "The letter IS the Sheet: neutral paper, blue tab. Toolbar: Copy, Email, Post to X. One primary action: send it to your representative. Dashed marks show where the typed name appears (CON-1). Phone: the top of the letter, with the send actions held in a bar below it." },
      { k: "edit", p: 1, cap: "The reader edits the letter: white focus ring on the sheet, caret after their own tax line (it appears because they moved the H2 slider). Phone: scrolled to the end of the letter, the second place the name appears; the letter consent sits below it." },
    ],
    draw: function (c) {
      var k = c.plate ? "state" : c.k;
      if (c.phone && c.plate) h3PhonePlate(c);
      else if (c.phone) h3Phone(c, k === "edit");
      else if (c.plate) h3DeskPlate(c);
      else h3Desk(c, k === "edit");
      c.flag("decision", "Consent says ‘Published without your name’ but the letter body writes the typed name twice (dashed). Strip the name line before storing, or redact at moderation? (audit CON-1)");
      c.flag("decision", "The letter consent lives in the coalition form on the live page (index.html:1070-1077). Shown beside the letter here for review. Keep it in the coalition form, or move it to the letter?");
      c.flag("copy", "Letter text drifts from data.js: ‘eleventh consecutive annual record’ (data says 11th year of growth), ‘This year, 673 million’ (data dates it 2024), ‘272 million children’ (data says children and youth), ‘barely a third’ sets 2025 receipts against the 2026 ask (audit FIG-1, 15.5b). Rewording needs approval.");
      if (k === "edit") c.flag("decision", "Any later choice change rewrites the whole letter and loses the reader's edits (audit LET-1). Keep edits once the reader has typed?");
    },
  });

  /* ════════════════════════════════════════════════════════════════
     H4 · COALITION (globe + consent)
     ════════════════════════════════════════════════════════════════ */
  // A lit sphere: paper-dark base, graticule, shading from the upper left,
  // a rim of light, and the blue bar(s) on top. Returns the svg and the
  // bars' screen points.
  function globeSvg(cx, cy, R, lat0, lon0, bars) {
    var rad = Math.PI / 180, p0 = lat0 * rad;
    function proj3(lat, lon) {
      var phi = lat * rad, lam = (lon - lon0) * rad;
      return [
        R * Math.cos(phi) * Math.sin(lam),
        R * (Math.cos(p0) * Math.sin(phi) - Math.sin(p0) * Math.cos(phi) * Math.cos(lam)),
        Math.sin(p0) * Math.sin(phi) + Math.cos(p0) * Math.cos(phi) * Math.cos(lam),
      ];
    }
    function line(pts) {
      var d = "", on = false;
      pts.forEach(function (q) {
        var v = proj3(q[0], q[1]);
        if (v[2] > 0) { d += (on ? " L" : " M") + (cx + v[0]).toFixed(1) + " " + (cy - v[1]).toFixed(1); on = true; }
        else on = false;
      });
      return d ? S.path(d, { stroke: "rgba(255,255,255,0.34)", "stroke-width": 1 }) : "";
    }
    var s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R * 1.35 + '" fill="url(#hoPool)"/>';
    s += S.circle(cx, cy, R, { fill: T.sheet });
    var lat, lon, pts, q;
    for (lon = -180; lon < 180; lon += 20) { pts = []; for (lat = -90; lat <= 90; lat += 3) pts.push([lat, lon]); s += line(pts); }
    for (lat = -60; lat <= 60; lat += 20) { pts = []; for (q = -180; q <= 180; q += 3) pts.push([lat, q]); s += line(pts); }
    s += S.circle(cx, cy, R, { fill: "url(#hoSpec)" });
    s += S.circle(cx, cy, R, { fill: "url(#hoShade)" });
    // rim light on the upper-left limb
    var a0 = 196 * rad, a1 = 292 * rad;
    s += S.path("M" + (cx + R * Math.cos(a0)).toFixed(1) + " " + (cy + R * Math.sin(a0)).toFixed(1) + " A" + R + " " + R + " 0 0 1 " + (cx + R * Math.cos(a1)).toFixed(1) + " " + (cy + R * Math.sin(a1)).toFixed(1), { stroke: "rgba(255,255,255,0.7)", "stroke-width": 1.5 });
    s += S.circle(cx, cy, R, { fill: "none", stroke: "rgba(255,255,255,0.14)", "stroke-width": 1 });
    var tips = [];
    (bars || []).forEach(function (b) {
      var v = proj3(b.lat, b.lon);
      if (v[2] <= 0) return;
      // a radial bar of height h·R, projected: its tip is the surface point scaled by (1 + h)
      var x0 = cx + v[0], y0 = cy - v[1], x1 = cx + v[0] * (1 + b.h), y1 = cy - v[1] * (1 + b.h);
      s += S.circle(x0, y0, b.ring, { fill: "none", stroke: T.blue, "stroke-width": 1.5, opacity: 0.8 });
      s += S.line(x0, y0, x1, y1, { stroke: T.blue, "stroke-width": 4 });
      tips.push({ x: x1, y: y1, bx: x0, by: y0 });
    });
    return { s: s, tips: tips };
  }
  function globe(c, cx, cy, R, lat0, lon0, bars) {
    var g = globeSvg(cx, cy, R, lat0, lon0, bars);
    c.svg(g.s);
    return g.tips;
  }
  // a boxed inset: the globe again at k×, centred on point q, in a 1px box
  var INSET_N = 0;
  function globeInset(c, box, cx, cy, R, lat0, lon0, bars, q, k, fig) {
    var id = "hoInset" + INSET_N++;
    var g = globeSvg(cx, cy, R, lat0, lon0, bars);
    c.svg('<defs><clipPath id="' + id + '"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>' +
      S.rect(box.x, box.y, box.w, box.h, { fill: T.ground }) +
      '<g clip-path="url(#' + id + ')"><g transform="translate(' + (box.x + box.w / 2) + " " + (box.y + box.h / 2) + ") scale(" + k + ") translate(" + -q[0] + " " + -q[1] + ')">' + g.s + "</g></g>" +
      S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: T.white }));
    chip(c, box.x - 1, box.y - 19, fig);
  }
  function coalitionWords(c, x, y, w, big, small) {
    c.div(x, y, w, c.copy("A growing coalition", "js/main.js:1659"), TX.title + ";font-size:" + big + "px;text-transform:none;letter-spacing:-0.01em");
    c.div(x, y + big + 8, w, c.copy("of people choosing where the money should go — add your voice.", "js/main.js:1662"), TX.bodySm + ";font-size:" + small + "px");
  }
  function coalitionForm(c, x, y, w, o) {
    o = o || {};
    var ph = c.phone, fs = ph ? 14 : 15, gap = 10, eh = ph ? 56 : 48, bs = ph ? 14 : 18;
    field(c, x, y, w, eh, c.copy("Your email (optional, for Six Degrees waitlist & Blueprint updates)", "index.html:1046"), { size: fs, wrap: ph });
    field(c, x, y + eh + gap, w, 48, c.copy("Your age range (optional)", "index.html:1050"), { size: fs, caret: true });
    var cy = y + eh + gap + 48 + 16;
    checkbox(c, x, cy + 3, false, 20);
    c.div(x + 32, cy, w - 32,
      c.copy("Email me Blueprint & Six Degrees updates. I agree to the ", "index.html:1061") +
      '<span style="color:' + T.white + ';text-decoration:underline">' + c.copy("privacy policy", "index.html:1063") + "</span>" +
      c.copy(". (Leave the box and email blank to take part anonymously.)", "index.html:1063-1065"),
      TX.bodySm + ";font-size:" + bs + "px;line-height:1.45");
    var cy2 = cy + (ph ? 86 : 96);
    letterConsent(c, x, cy2, w, bs, !!o.letterOn, !!o.focus);
    var by = cy2 + (ph ? 122 : 132);
    button(c, x, by, w, 52, c.copy("Submit my priorities + generate shareable card", "index.html:1085"), o.sent ? "off" : (ph ? "blueline" : "primary"), ph ? 15 : 16);
    return by + 52;
  }
  function thanks(c, x, y, w, size) {
    c.div(x, y, w, c.copy("✓ Added to the coalition. Your card is ready, scroll down to download it.", "index.html:1092-1093"),
      "font-family:" + F.sans + ";font-size:" + size + "px;font-weight:500;line-height:1.45;color:" + T.white);
  }
  function ukBar() {
    var ll = SB.get("countryCoords." + SB.get(CP + "[0]"));
    return { lat: ll[0], lon: ll[1], h: 0.24, ring: 8 };
  }
  var G_LAT = 22, G_LON = 22; // view: Europe and Africa toward the viewer, the reader's country off-centre so its bar reads
  function h4Desk(c, sent) {
    lightDefs(c);
    c.div(96, 62, 300, c.copy("Step 03", "index.html:1005"), TX.label);
    c.div(96, 84, 560, c.copy("Join the coalition", "index.html:1007"), TX.title + ";font-size:40px");
    c.div(96, 140, 540, '<span style="display:inline-block;width:8px;height:8px;background:' + T.blue + ';margin-right:10px;vertical-align:2px"></span>' +
      c.copy("People choosing to fund the planet, from around the world. Add your voice to the global tally.", "index.html:1010-1011"), TX.bodySm + ";font-size:18px");
    coalitionWords(c, 96, 216, 540, 30, 18);
    var end = coalitionForm(c, 96, 330, 540, { letterOn: true, focus: !sent, sent: sent });
    if (sent) thanks(c, 96, end + 14, 540, 18);
    // the globe: a lit sphere, cropped by the right edge of the frame
    var GX = 1132, GY = 478, GR = 350;
    c.div(940, 62, 436, c.copy("The coalition, lighting up the map", "index.html:1016"), TX.labelW + ";text-align:right");
    c.div(940, 82, 436, c.copy("Each bar is a country's sign-ups. Drag to spin · scroll to zoom.", "index.html:1018"), TX.src + ";font-size:12px;text-align:right");
    var tips = globe(c, GX, GY, GR, G_LAT, G_LON, sent ? [ukBar()] : []);
    if (sent && tips[0]) {
      var tp = tips[0], ib = { x: 676, y: 168, w: 216, h: 150 };
      c.svg(S.leader([[tp.x, tp.y], [ib.x + ib.w + 18, tp.y], [ib.x + ib.w, ib.y + ib.h / 2]], {}));
      globeInset(c, ib, GX, GY, GR, G_LAT, G_LON, [ukBar()], [tp.bx, (tp.by + tp.y) / 2], 3, c.label("FIG. 1 · ×3", "storyboard marginalia: inset scale"));
      c.div(ib.x, ib.y + ib.h + 10, ib.w, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:11px;white-space:nowrap");
    }
    c.state({ form: "globe (no sheet)", x: GX - GR, y: GY - GR, w: 1440 - (GX - GR), h: GR * 2, tone: "neutral lit sphere; blue only for the reader's own sign-up", note: (sent ? "one bar: the reader's country, after submit, with a 3× inset" : "no bars: seeded sign-ups removed (decision 4)") + ". Sphere cropped by the frame's right edge." });
  }
  function h4Phone(c, sent) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    if (!sent) {
      c.div(st.x, 44, 300, c.copy("Step 03", "index.html:1005"), TX.label + ";font-size:11px");
      c.div(st.x, 62, st.w, c.copy("Join the coalition", "index.html:1007"), TX.title + ";font-size:26px");
      coalitionForm(c, st.x, 106, st.w, { letterOn: true, focus: true, sent: false });
      coalitionWords(c, tb.x, tb.y, tb.w, 24, 14);
      c.div(tb.x, tb.y + 76, tb.w, c.copy("People choosing to fund the planet, from around the world. Add your voice to the global tally.", "index.html:1010-1011"), TX.bodySm + ";font-size:14px;color:" + T.grey);
      // the globe is one swipe down: its lit limb rises at the foot of the frame
      c.svg(globeSvg(250, 1050, 320, G_LAT, G_LON, []).s);
      c.state({ form: "form (no sheet)", x: st.x, y: st.y, w: st.w, h: st.h, tone: "neutral", note: "letter opt-in ticked, keyboard focus on it; the globe is one swipe down (its limb shows at the foot)" });
      return;
    }
    c.div(st.x, 44, st.w, c.copy("The coalition, lighting up the map", "index.html:1016"), TX.labelW + ";font-size:10px");
    var GX = 214, GY = 334, GR = 172;
    var tips = globe(c, GX, GY, GR, G_LAT, G_LON, [ukBar()]);
    if (tips[0]) {
      var tp = tips[0], ib = { x: 16, y: 86, w: 120, h: 90 };
      c.svg(S.leader([[tp.x, tp.y], [ib.x + ib.w + 10, ib.y + ib.h / 2], [ib.x + ib.w, ib.y + ib.h / 2]], {}));
      globeInset(c, ib, GX, GY, GR, G_LAT, G_LON, [ukBar()], [tp.bx, (tp.by + tp.y) / 2], 2.5, c.label("FIG. 1 · ×2.5", "storyboard marginalia: inset scale"));
      c.div(ib.x + ib.w + 12, ib.y + 2, 120, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:10px;white-space:nowrap");
    }
    c.div(st.x, 528, st.w, c.copy("Each bar is a country's sign-ups. Drag to spin · scroll to zoom.", "index.html:1018"), TX.src + ";font-size:11px");
    coalitionWords(c, tb.x, tb.y + 6, tb.w, 24, 14);
    thanks(c, tb.x, tb.y + 92, tb.w, 15);
    c.state({ form: "globe (no sheet)", x: GX - GR, y: GY - GR, w: 375 - (GX - GR), h: GR * 2, tone: "neutral lit sphere; blue only for the reader's own sign-up", note: "after submit: one bar for the reader's country, with an inset; no seeded bars or count" });
  }

  SB.scene({
    order: 17,
    id: "H4",
    name: "Coalition",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: "#coalitionSection",
    trigger: "Reached from the letter (‘Skip to the coalition’ or by reading on). The globe loads when near the viewport; its state never reads the scroll.",
    camera: "Globe: drag to spin. No page camera.",
    reason:
      "Submitting adds the reader to the shared tally and lights their own country on the globe, so one private choice visibly joins a public one. The same submit opens the shareable card next.",
    frames: [
      { k: "state", p: 0, cap: "Globe with lines of latitude and longitude only: no seeded bars, no seeded count. Words, not numbers: ‘A growing coalition’. The letter opt-in is ticked and has keyboard focus. Phone: the form first; the globe is one swipe down." },
      { k: "submitted", p: 1, cap: "After submit: one blue bar and ring for the reader's own country; the button switches off; the thank-you line shows. Phone: the globe with the reader's bar, the thank-you line below." },
    ],
    draw: function (c) {
      var k = c.plate ? "submitted" : c.k;
      if (c.phone) h4Phone(c, k === "submitted");
      else h4Desk(c, k === "submitted");
      c.flag("decision", "Decision 4: all seeded coalition numbers are removed in these frames (SEED_COUNT, seededCountrySignups, seededPriorityWeights, the count/10,000 bar and the ‘fund first · globally’ bars). Approve removal before launch (audit 15.4, COA-1).");
      c.flag("decision", "Globe bar colour (audit BR-04): drawn in brand blue, one colour for every country, instead of the teal-to-red volume ramp.");
      c.flag("copy", "‘Drag to spin · scroll to zoom’: wheel zoom over the globe traps page scroll (audit GLB-1). Turn zoom off or need a modifier key, then fix this line.");
      if (k === "submitted") c.flag("copy", "‘Your card is ready, scroll down to download it’: the card opens as an overlay, not further down, and the line shows even if the backend rejected the submission (audit SCR-3).");
    },
  });

  /* ════════════════════════════════════════════════════════════════
     H5 · CARD (download + share)
     ════════════════════════════════════════════════════════════════ */
  // the card's height for scale s (headline set on three lines)
  function cardH(s, ph) { return Math.round((ph ? 570 : 558) * s); }
  function card(c, b, s) {
    var pad = Math.round(28 * s), ph = c.phone;
    b.h = cardH(s, ph);
    c.svg(S.sheet(b.x, b.y, b.w, b.h, { tone: "white", mode: "edge", sw: 1 }));
    c.svg(lit(b.x + 1, b.y + 1, b.w - 2, b.h - 2));
    c.svg(S.rect(b.x, b.y, 10, 10, { fill: T.blue }));
    var y = b.y + pad, ls = ph ? ";letter-spacing:0.05em" : "";
    var lab = Math.max(10, Math.round(11 * s));
    c.div(b.x + pad, y, b.w / 2, c.copy("The Cost of War · 2026", "index.html:1254"), TX.label + ";font-size:" + lab + "px" + ls);
    c.div(b.x + b.w / 2, y, b.w / 2 - pad, c.copy("Blueprint × StudioEX", "index.html:1255"), TX.labelW + ";font-size:" + lab + "px;text-align:right" + ls);
    y += Math.round(40 * s);
    var hs = Math.round(40 * s);
    c.div(b.x + pad, y, b.w - pad * 2, c.copy("I choose to fund the planet.", "js/main.js:1782"), TX.title + ";font-size:" + hs + "px");
    y += Math.round(2.76 * hs + 24 * s);
    var rs = Math.max(14, Math.round(18 * s));
    RANK.forEach(function (idx, p) {
      var ry = y + p * Math.round(44 * s);
      c.div(b.x + pad, ry, 30, String(p + 1), "font-family:" + F.display + ";font-size:" + Math.round(22 * s) + "px;line-height:1;color:" + T.white);
      c.svg(S.rect(b.x + pad + Math.round(32 * s), ry + Math.round(5 * s), Math.round(12 * s), Math.round(12 * s), { fill: T.blue }));
      c.div(b.x + pad + Math.round(56 * s), ry, b.w - pad * 2 - 160 * s, iname(c, idx), "font-family:" + F.sans + ";font-size:" + rs + "px;font-weight:500;line-height:1.2;white-space:nowrap;color:" + T.white);
      c.div(b.x + b.w - pad - 120, ry, 120, cost(c, idx) + c.copy("/yr", "js/main.js:1791"), TX.value + ";font-size:" + rs + "px;text-align:right");
    });
    y += RANK.length * Math.round(44 * s) + Math.round(8 * s);
    c.svg(S.line(b.x + pad, y, b.x + b.w - pad, y, { stroke: T.rule }));
    y += Math.round(20 * s);
    var tot = allocB(RANK);
    c.div(b.x + pad, y, (b.w - pad * 2) * 0.56,
      c.copy("Total annual cost:", "js/main.js:1798") + "<br>" + '<b style="' + TX.value + ";font-size:" + Math.round(28 * s) + 'px;display:inline-block;margin:6px 0">' + allocFig(c, RANK) + "</b><br>" +
      pctOfDefence(c, tot, "tool output: round(chosen total ÷ DEFENCE × 100), main.js:1798") + c.copy("% of the global military budget", "js/main.js:1798"),
      TX.bodySm + ";font-size:" + Math.max(14, Math.round(15 * s)) + "px;line-height:1.4");
    c.div(b.x + b.w * 0.56, y, b.w * 0.44 - pad, c.copy("join a", "js/main.js:1805") + "<br>" + c.copy("growing", "js/main.js:1805") + "<br>" + c.copy("coalition", "js/main.js:1805"),
      TX.title + ";font-size:" + Math.round(26 * s) + "px;text-align:right;line-height:1");
    y += Math.round((ph ? 130 : 118) * s);
    c.svg(S.line(b.x + pad, y, b.x + b.w - pad, y, { stroke: T.rule }));
    y += Math.round(18 * s);
    c.div(b.x + pad, y, b.w * 0.62, c.copy("From ", "js/main.js:1809") + c.fig(CP + "[0]", "raw") + c.copy(" · ", "js/main.js:1809") + c.copy("$", "js/main.js:1776") + c.fig(CP + "[2]", "raw") + c.copy("B", "js/main.js:1776") + c.copy(" annual military spend", "js/main.js:1809"),
      TX.src + ";font-size:" + lab + "px");
    c.div(b.x + b.w * 0.62, y, b.w * 0.38 - pad, c.copy("studioex.co", "index.html:1269") + "<br>" + c.copy("@404blueprint", "index.html:1269"),
      TX.src + ";font-size:" + lab + "px;text-align:right");
  }
  // the card as a printed object: a second print under it, trim marks at its corners
  function printed(c, x, y, w, s, t) {
    var h = cardH(s, c.phone), res = {};
    var P = lay(c, x, y, w, h, t, function (k) {
      k.svg('<g transform="rotate(-4 ' + w / 2 + " " + h / 2 + ')">' + S.sheet(c.phone ? 10 : 18, c.phone ? 8 : 14, w, h, { tone: "white", mode: "edge", sw: 1, opacity: 0.55 }) + "</g>");
      card(k, { x: 0, y: 0, w: w }, s);
      var g = c.phone ? 8 : 14, n = c.phone ? 8 : 14, tm = "";
      [[0, 0, -1, -1], [w, 0, 1, -1], [w, h, 1, 1], [0, h, -1, 1]].forEach(function (q) {
        tm += S.line(q[0], q[1] + q[3] * g, q[0], q[1] + q[3] * (g + n), { stroke: "rgba(255,255,255,0.6)" }) +
          S.line(q[0] + q[2] * g, q[1], q[0] + q[2] * (g + n), q[1], { stroke: "rgba(255,255,255,0.6)" });
      });
      k.svg(tm);
    });
    var r = corners(P, { x: 0, y: 0, w: w, h: h });
    c.state({ form: "share card (the reader's sheet, portable)", x: r.x, y: r.y, w: r.w, h: r.h, tone: "neutral lit paper, blue tab; blue squares mark the ranked causes; a second print beneath, trim marks", note: "not true area: the card lists, it does not measure. Drawn as a print lying on the desk; rect is where it sits on screen." });
    return P;
  }
  function h5Desk(c) {
    lightDefs(c);
    c.bgSvg(S.rect(0, 0, c.W, c.H, { fill: "rgba(255,255,255,0.02)" }));
    beam(c, 560, 90, 760, 760, 1);
    printed(c, 292, 92, 520, 1.12, { rx: 9, ry: -9, rz: 1.6, persp: 2000 });
    // the actions, as a column in the margin
    var ax = 944, aw = 300, y = 300;
    button(c, ax, y, aw, 52, c.copy("↓ Download PNG", "index.html:1274"), "primary", 16);
    focusRing(c, ax, y, aw, 52);
    button(c, ax, y + 70, aw, 48, c.copy("Post to X", "index.html:1277"), "outline", 15);
    button(c, ax, y + 128, aw, 48, c.copy("LinkedIn", "index.html:1280"), "outline", 15);
    button(c, ax, y + 186, aw, 48, c.copy("Copy for Instagram", "index.html:1283"), "outline", 15);
    c.svg(S.line(ax, y + 256, ax + aw, y + 256, { stroke: T.rule }));
    button(c, ax, y + 274, 120, 44, c.copy("Close", "index.html:1291"), "quiet", 15);
  }
  function h5Phone(c) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    beam(c, 180, 40, 520, 340, 0.9);
    printed(c, st.x + 4, 68, 335, 0.8, { rx: 6, ry: -4, rz: 1.2, persp: 1200 });
    button(c, tb.x, tb.y, 166, 48, c.copy("↓ Download PNG", "index.html:1274"), "primary", 15);
    focusRing(c, tb.x, tb.y, 166, 48);
    button(c, tb.x + 177, tb.y, 166, 48, c.copy("Post to X", "index.html:1277"), "outline", 14);
    button(c, tb.x, tb.y + 58, 166, 48, c.copy("LinkedIn", "index.html:1280"), "outline", 14);
    button(c, tb.x + 177, tb.y + 58, 166, 48, c.copy("Copy for Instagram", "index.html:1283"), "outline", 14);
    button(c, tb.x, tb.y + 116, tb.w, 44, c.copy("Close", "index.html:1291"), "quiet", 14);
  }

  SB.scene({
    order: 18,
    id: "H5",
    name: "Card",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: null,
    trigger: "Opens as an overlay after submit (main.js waits 1.6 s), or from ‘Generate shareable card’ under the letter.",
    camera: "None.",
    reason:
      "The card is the reader's sheet made portable: their ranking on paper they can take away. Closing it returns them to the page, where the Archive holds the sheets of everyone who took part.",
    frames: [
      { k: "state", p: 1, cap: "The card: header, ‘I choose to fund the planet.’, the three ranked causes, total, ‘join a growing coalition’, country line. Download PNG has keyboard focus." },
    ],
    draw: function (c) {
      if (c.phone) h5Phone(c);
      else h5Desk(c);
      c.flag("decision", "Card rows use each cause's own colour today (amber, cyan, purple…). Drawn here with one blue square plus the rank number (same decision as H1, audit BR-04).");
      c.flag("decision", "‘Close’ is a span today, not a button, and Escape does nothing (audit KEY-1). Drawn as a 44px button.");
    },
  });

  /* ════════════════════════════════════════════════════════════════
     H6 · ARCHIVE (+ the small link near the top)
     ════════════════════════════════════════════════════════════════ */
  // The room: paper hanging in space on threads, far sheets small and dim,
  // a few near ones out of focus; the reader's sheet in a beam of light.
  function room(c, R, mine, avoid) {
    var rnd = rng(c.phone ? 11 : 7);
    var n = c.phone ? 110 : 240, list = [];
    for (var i = 0; i < n; i++) list.push({ d: rnd(), x: rnd(), y: rnd(), r: rnd() });
    list.sort(function (a, b) { return b.d - a.d; }); // far first
    var base = c.phone ? 44 : 70;
    var s = '<defs><clipPath id="roomClip"><rect x="' + R.x + '" y="' + R.y + '" width="' + R.w + '" height="' + R.h + '"/></clipPath></defs><g clip-path="url(#roomClip)">';
    list.forEach(function (q) {
      var k = 0.2 + 0.8 * Math.pow(1 - q.d, 1.8);
      var w = base * 0.71 * k, h = base * k;
      var x = R.x + q.x * (R.w + w) - w;
      var top = R.y + R.h * (0.04 + 0.78 * q.y * (0.35 + 0.65 * (1 - q.d)));
      if (mine && Math.abs(x + w / 2 - (mine.x + mine.w / 2)) < mine.w * 0.9 && top < mine.y + mine.h + 20 && top + h > mine.y - 30) return; // keep the reader's sheet clear
      var op = 0.16 + 0.62 * (1 - q.d);
      var rot = (q.r - 0.5) * 10 * (1 - q.d * 0.6);
      s += S.line(x + w / 2, R.y, x + w / 2, top, { stroke: "rgba(255,255,255," + (0.03 + 0.07 * (1 - q.d)).toFixed(3) + ")" });
      s += '<g opacity="' + op.toFixed(3) + '" transform="rotate(' + rot.toFixed(2) + " " + (x + w / 2).toFixed(1) + " " + top.toFixed(1) + ')">' +
        S.rect(x, top, w, h, { fill: "url(#paper)", stroke: "rgba(255,255,255,0.4)", "stroke-width": 0.75 }) +
        S.line(x + 0.5, top + 0.5, x + w - 0.5, top + 0.5, { stroke: "rgba(255,255,255,0.55)" }) + "</g>";
    });
    // two near sheets, out of focus, framing the room
    (c.phone ? [[R.x - 30, R.y + R.h * 0.5, 120, -6]] : [[R.x + R.w - 150, R.y + R.h * 0.42, 210, 7], [R.x + R.w * 0.34, R.y + R.h * 0.78, 170, -4]]).forEach(function (f) {
      s += S.line(f[0] + f[2] * 0.35, R.y, f[0] + f[2] * 0.35, f[1], { stroke: "rgba(255,255,255,0.05)" });
      s += '<g filter="url(#hoBlur)" opacity="0.45" transform="rotate(' + f[3] + " " + f[0] + " " + f[1] + ')">' + S.rect(f[0], f[1], f[2], f[2] * 1.41, { fill: "url(#paper)", stroke: "rgba(255,255,255,0.3)" }) + "</g>";
    });
    if (mine) {
      // a beam from above, the thread, then the sheet catching the light
      var mx = mine.x + mine.w / 2;
      s += '<path d="M' + (mx - 18) + " " + R.y + " L" + (mx + 18) + " " + R.y + " L" + (mx + mine.w * 1.5) + " " + (mine.y + mine.h + 60) + " L" + (mx - mine.w * 1.5) + " " + (mine.y + mine.h + 60) + ' Z" fill="url(#hoBeam)"/>';
      s += S.line(mx, R.y, mx, mine.y, { stroke: "rgba(255,255,255,0.4)" });
      s += S.sheet(mine.x, mine.y, mine.w, mine.h, { tone: "white", mode: "edge", sw: 1.5 });
      s += S.rect(mine.x + 1, mine.y + 1, mine.w - 2, mine.h - 2, { fill: "url(#hoLit)" }) + S.rect(mine.x + 1, mine.y + 1, mine.w - 2, mine.h - 2, { fill: "url(#hoLit)" }) +
        S.rect(mine.x + 1, mine.y + 1, mine.w - 2, mine.h - 2, { fill: "rgba(255,255,255,0.04)" });
      s += '<ellipse cx="' + mx + '" cy="' + (mine.y + mine.h + 70) + '" rx="' + mine.w * 1.6 + '" ry="' + mine.w * 0.3 + '" fill="url(#hoPool)"/>';
      s += S.line(mine.x + 1, mine.y + 0.75, mine.x + mine.w - 1, mine.y + 0.75, { stroke: T.white, "stroke-width": 1.5 });
      s += S.rect(mine.x, mine.y, 8, 8, { fill: T.blue });
    }
    s += "</g>";
    c.svg(s);
  }
  // the reader's sheet again at k×: its top-left corner, tab and blank paper
  function sheetInset(c, box, mine, k, fig) {
    var id = "hoSheetInset" + INSET_N++;
    var ns = "non-scaling-stroke";
    var g = S.rect(mine.x, mine.y, mine.w, mine.h, { fill: "url(#paper)" }) +
      S.rect(mine.x, mine.y, mine.w, mine.h, { fill: "url(#hoLit)" }) + S.rect(mine.x, mine.y, mine.w, mine.h, { fill: "url(#hoLit)" }) +
      S.rect(mine.x, mine.y, mine.w, mine.h, { fill: "none", stroke: T.white, "stroke-width": 1.5, "vector-effect": ns }) +
      S.line(mine.x + 2, mine.y + 2, mine.x + mine.w - 2, mine.y + 2, { stroke: "rgba(255,255,255,0.35)", "vector-effect": ns }) +
      S.rect(mine.x, mine.y, 8, 8, { fill: T.blue });
    var q = [mine.x + box.w / (2 * k) - 10, mine.y + box.h / (2 * k) - 10];
    c.svg('<defs><clipPath id="' + id + '"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>' +
      S.rect(box.x, box.y, box.w, box.h, { fill: T.ground }) +
      '<g clip-path="url(#' + id + ')"><g transform="translate(' + (box.x + box.w / 2) + " " + (box.y + box.h / 2) + ") scale(" + k + ") translate(" + -q[0] + " " + -q[1] + ')">' + g + "</g></g>" +
      S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: T.white }));
    chip(c, box.x - 1, box.y - 19, fig);
  }
  function badgeTxt(c) {
    return c.copy("PREVIEW · these are sample sheets, not real participants", "js/room.js:470");
  }
  function h6Desk(c) {
    lightDefs(c);
    var R = { x: 0, y: 0, w: c.W, h: c.H };
    var mine = { x: 862, y: 318, w: 112, h: 158 };
    room(c, R, mine);
    // fog behind the words, so they read over the room
    c.svg(S.rect(0, 0, 760, c.H, { fill: "url(#hoFogL)" }) + S.rect(0, 640, c.W, 260, { fill: "url(#hoFogB)" }));
    c.div(72, 62, 600, c.copy("The artwork · Everyone who has written", "index.html:103"), TX.label);
    c.div(72, 84, 700, c.copy("The Archive", "index.html:105"), TX.title + ";font-size:84px");
    c.div(72, 184, 540, c.copy("Every letter written on this page is kept here, one sheet for one person — a single record made by everybody who has taken part. Move through it. Open any sheet to read what a stranger told their government.", "index.html:107-110"), TX.bodySm + ";font-size:18px");
    c.div(72, 336, null, badgeTxt(c), TX.labelW + ";font-size:11px;background:" + T.ground + ";padding:6px 10px;border:1px solid rgba(255,255,255,0.45);white-space:nowrap");
    // the reader's own sheet: blank, unnamed, awaiting review
    c.svg(S.leader([[mine.x + mine.w + 4, mine.y + 34], [mine.x + mine.w + 64, mine.y + 34]], {}));
    callout(c, mine.x + mine.w + 76, mine.y + 34, 1);
    c.div(mine.x + mine.w + 94, mine.y + 24, null, c.newCopy("Awaiting review", "audit ARC-5: the reader's sheet in the same session, blank and unnamed; never the unapproved text"),
      TX.labelW + ";font-size:11px;white-space:nowrap;background:" + T.ground + ";padding:4px 8px;border:1px solid " + T.rule);
    // an inset: its corner at 2.5×, blank paper and the blue tab
    var ib = { x: 1090, y: 520, w: 230, h: 150 };
    c.svg(S.leader([[mine.x + mine.w - 6, mine.y + mine.h - 6], [ib.x - 20, ib.y + 40], [ib.x, ib.y + 40]], { color: "rgba(255,255,255,0.4)" }));
    sheetInset(c, ib, mine, 2.5, c.label("FIG. 1 · ×2.5", "storyboard marginalia: inset scale"));
    c.div(1376 - 420, 820, 420, c.copy("drag to look around · click a sheet to read it", "index.html:119"), TX.label + ";font-size:11px;text-align:right");
    var figs = [["people have written", "index.html:133"], ["countries represented", "index.html:137"], ["letters in the archive", "index.html:141"]];
    figs.forEach(function (f, i) {
      var x = 72 + i * 236;
      c.svg(S.line(x, 744, x + 200, 744, { stroke: T.rule }));
      c.div(x, 756, 220, c.copy("—", "index.html:132"), TX.value + ";font-size:34px;color:" + T.grey);
      c.div(x, 800, 220, c.copy(f[0], f[1]), TX.label + ";font-size:11px");
    });
    c.state({ form: "hanging sheet in the Archive", x: mine.x, y: mine.y, w: mine.w, h: mine.h, tone: "neutral paper, white edge, blue tab (the reader's), caught in a beam of light", note: "blank and unnamed until a moderator approves the letter; joins only if the reader ticked the letter opt-in" });
  }
  function h6Phone(c) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    var R = { x: 0, y: 0, w: 375, h: 566 };
    var mine = { x: 204, y: 228, w: 62, h: 88 };
    room(c, R, mine);
    c.svg(S.rect(0, 440, 375, 372, { fill: "url(#hoFogB)" }) + S.rect(0, 566, 375, 246, { fill: T.ground, opacity: 0.6 }));
    c.div(st.x, 44, st.w, badgeTxt(c), TX.labelW + ";font-size:10px;line-height:1.5;background:" + T.ground + ";padding:4px 8px;border:1px solid rgba(255,255,255,0.45);box-sizing:border-box");
    c.svg(S.leader([[mine.x + mine.w / 2, mine.y + mine.h + 4], [mine.x + mine.w / 2, mine.y + mine.h + 40]], {}));
    c.div(mine.x + mine.w / 2 - 66, mine.y + mine.h + 42, 132, c.newCopy("Awaiting review", "audit ARC-5: the reader's sheet in the same session, blank and unnamed; never the unapproved text"),
      TX.labelW + ";font-size:10px;text-align:center;box-sizing:border-box;background:" + T.ground + ";padding:4px 8px;border:1px solid " + T.rule);
    var ib = { x: 16, y: 380, w: 130, h: 92 };
    // elbowed, so it passes left of the "Awaiting review" tag instead of under it
    var lx = ib.x + ib.w + 14;
    c.svg(S.leader([[mine.x + 2, mine.y + mine.h - 4], [lx, mine.y + mine.h - 4], [lx, ib.y + 30], [ib.x + ib.w, ib.y + 30]], { color: "rgba(255,255,255,0.4)" }));
    sheetInset(c, ib, mine, 2.5, c.label("FIG. 1 · ×2.5", "storyboard marginalia: inset scale"));
    c.div(tb.x, tb.y, tb.w, c.copy("The artwork · Everyone who has written", "index.html:103"), TX.label + ";font-size:10px");
    c.div(tb.x, tb.y + 20, tb.w, c.copy("The Archive", "index.html:105"), TX.title + ";font-size:40px");
    c.div(tb.x, tb.y + 72, tb.w, c.copy("drag to look around · click a sheet to read it", "index.html:119"), TX.bodySm + ";font-size:14px");
    c.state({ form: "hanging sheet in the Archive", x: mine.x, y: mine.y, w: mine.w, h: mine.h, tone: "neutral paper, white edge, blue tab, caught in a beam of light", note: "blank and unnamed, awaiting review" });
  }
  // the small link near the top: in the contents nav
  var NAV = [
    ["01", "The Machine", "what the world spends", "index.html:161-162"],
    ["02", "The Impact", "what it truly costs", "index.html:165-166"],
    ["▾", "Then it's your turn", "redistribute · your country · your letter", "index.html:169-170"],
  ];
  // A storyboard device (not page UI): the page from top to end, so the
  // reader can see where the link sits and where it jumps to.
  // CONTENTS and ARCHIVE are named above the bar in white; the rest below in grey.
  function pageMap(c, x, y, w, size) {
    var segs = [["HERO", 1], ["CONTENTS", 0.35], ["STORY · S01–S12", 6], ["S13 + TOOLS", 2.4], ["ARCHIVE", 1.1], ["END", 0.6]];
    var tot = segs.reduce(function (s, g) { return s + g[1]; }, 0), at = x, out = {};
    var cw = size < 11 ? 7.4 : 8.1; // mono label character width at this size
    segs.forEach(function (g) {
      var sw = (w * g[1]) / tot;
      var hi = g[0] === "CONTENTS" || g[0] === "ARCHIVE";
      c.svg(S.rect(at + 1, y, sw - 2, 10, { fill: hi ? T.white : "rgba(255,255,255,0.18)" }));
      out[g[0]] = { x: at, w: sw };
      if (!hi && g[0] !== "END")
        c.div(at, y + 18, Math.ceil(g[0].length * cw) + 4, c.label(g[0], "storyboard page map"), TX.label + ";font-size:" + size + "px;white-space:nowrap");
      at += sw;
    });
    // CONTENTS: tick and label above, left-aligned to its segment
    var cc = out.CONTENTS;
    c.svg(S.line(cc.x + cc.w / 2, y - 12, cc.x + cc.w / 2, y - 2, { stroke: T.white }));
    c.div(cc.x + cc.w / 2 - 4, y - 32, Math.ceil(8 * cw) + 4, c.label("CONTENTS", "storyboard page map"), TX.labelW + ";font-size:" + size + "px;white-space:nowrap");
    // ARCHIVE: label above, ending just left of where the leader lands
    var a = out.ARCHIVE, aw = Math.ceil(7 * cw) + 4;
    out.land = { x: a.x + Math.min(10, a.w / 2), y: y };
    c.div(out.land.x - aw - 8, y - 32, aw, c.label("ARCHIVE", "storyboard page map"), TX.labelW + ";font-size:" + size + "px;white-space:nowrap;text-align:right");
    c.div(x, y - 64, w, c.label("PAGE ORDER · TOP TO END", "storyboard page map"), TX.label + ";font-size:" + size + "px");
    return out;
  }
  var LINK_ST = "box-sizing:border-box;height:44px;display:flex;align-items:center;font-family:" + F.mono + ";font-size:13px;letter-spacing:0.04em;color:" + T.white + ";text-decoration:underline;text-underline-offset:4px";
  function h6LinkDesk(c) {
    lightDefs(c);
    // bottom of the hero file, for place: lit paper running off the top
    c.svg(S.sheet(210, -60, 1020, 180, { tone: "white", mode: "edge", sw: 1 }) + lit(211, -59, 1018, 178, { edge: 0 }));
    c.div(210, 142, 1020, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";text-align:center;font-size:11px");
    // the contents, set as a typographic index: giant numerals, names beside them
    var y = 262, x = 120, w = 380;
    c.svg(S.line(120, y - 26, 1320, y - 26, { stroke: T.rule }));
    NAV.forEach(function (n, i) {
      var nx = x + i * (w + 30);
      c.div(nx - 4, y - 6, 124, c.copy(n[0], n[3]), TX.giant + ";font-size:" + (n[0] === "▾" ? 64 : 88) + "px;line-height:1");
      c.div(nx + 126, y + 6, w - 126, c.copy(n[1], n[3]), "font-family:" + F.sans + ";font-size:20px;font-weight:600;color:" + T.white);
      c.div(nx + 126, y + 38, w - 126, c.copy(n[2], n[3]), TX.label + ";font-size:11px");
    });
    // the small link, at the end of the nav
    var ly = 394, lw = 196, lx = 1320 - lw;
    c.svg(S.line(120, ly - 20, 1320, ly - 20, { stroke: T.rule }));
    c.div(lx, ly, lw, c.copy("▸ Enter the archive", "index.html:1107"), LINK_ST + ";justify-content:center");
    focusRing(c, lx, ly, lw, 44);
    var m = pageMap(c, 120, 700, 1200, 11);
    var mx = lx + lw / 2;
    c.svg(S.leader([[m.land.x, 700], [m.land.x, 580], [mx, 580], [mx, ly + 52]], {}));
    callout(c, mx, 580, 1);
    c.svg(reg(196, 134, 6) + reg(1244, 134, 6));
    c.state({ form: "none (page top)", x: null, y: null, w: 0, h: 0, tone: "none", note: "the link jumps to the Archive at the end; the Sheet is not on this screen" });
  }
  function h6LinkPhone(c) {
    lightDefs(c);
    var st = c.stage, tb = c.textBox;
    c.svg(S.sheet(st.x, -60, st.w, 140, { tone: "white", mode: "edge", sw: 1 }) + lit(st.x + 1, -59, st.w - 2, 138, { edge: 0 }));
    c.div(st.x, 100, st.w, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";text-align:center;font-size:10px");
    var y = st.y + 100;
    NAV.forEach(function (n, i) {
      var ny = y + i * 76;
      c.svg(S.line(st.x, ny - 10, st.x + st.w, ny - 10, { stroke: T.rule }));
      c.div(st.x - 2, ny - 2, 60, c.copy(n[0], n[3]), TX.giant + ";font-size:" + (n[0] === "▾" ? 30 : 44) + "px;line-height:1");
      c.div(st.x + 66, ny, st.w - 66, c.copy(n[1], n[3]), "font-family:" + F.sans + ";font-size:17px;font-weight:600;color:" + T.white);
      c.div(st.x + 66, ny + 26, st.w - 66, c.copy(n[2], n[3]), TX.label + ";font-size:10px");
    });
    var ly = y + 3 * 76;
    c.svg(S.line(st.x, ly - 10, st.x + st.w, ly - 10, { stroke: T.rule }));
    c.div(st.x + 66, ly + 4, 190, c.copy("▸ Enter the archive", "index.html:1107"), LINK_ST + ";justify-content:center");
    focusRing(c, st.x + 66, ly + 4, 190, 44);
    var m = pageMap(c, tb.x, tb.y + 120, tb.w, 10);
    var mx = st.x + 66 + 95;
    c.svg(S.leader([[m.land.x, tb.y + 120], [m.land.x, ly + 90], [mx, ly + 90], [mx, ly + 56]], {}));
    c.state({ form: "none (page top)", x: null, y: null, w: 0, h: 0, tone: "none", note: "link in the contents nav, 44px tall" });
  }

  SB.scene({
    order: 19,
    id: "H6",
    name: "Archive",
    move: "TOOL · NOT SCROLL-DRIVEN",
    screens: null,
    restrained: false,
    anchor: "#roomSection",
    trigger: "After the coalition (default for decision 1), or from the small ‘Enter the archive’ link in the contents nav near the top. Three.js loads when the room nears the viewport.",
    camera: "Room: drag to look around. No page camera.",
    reason:
      "The story ends where the Sheet began: as paper, now hanging among everyone else's. The reader's own sheet is there only because they opted in, and stays blank until a person has reviewed it, which keeps the Archive's honesty rules visible.",
    frames: [
      { k: "state", p: 0, cap: "The room in preview mode, badge on. Among the sample sheets, the reader's own sheet (blue tab) hangs blank and unnamed, marked ‘Awaiting review’. It is there only because they ticked the letter opt-in." },
      { k: "link", p: 1, cap: "The small link near the top: ‘▸ Enter the archive’ at the end of the contents nav, keyboard focus shown. It jumps to the Archive at the end of the page." },
    ],
    draw: function (c) {
      var k = c.plate ? "state" : c.k;
      if (k === "link") {
        if (c.phone) h6LinkPhone(c);
        else h6LinkDesk(c);
        c.flag("decision", "Decision 1: the Archive moves after the coalition (or to the very end) with a small link near the top. The link reuses ‘▸ Enter the archive’ (index.html:1107) inside the contents nav (audit ARC-1, ARC-2, 15.1).");
        return;
      }
      if (c.phone) h6Phone(c);
      else h6Desk(c);
      c.flag("decision", "Which rule hangs a sheet (audit ARC-3)? Brief: the reader's sheet joins only with opt-in and moderation. Code today (150+ people): every submission hangs a blank sheet; only the words need opt-in and approval. Main frames follow the brief.");
      c.flag("decision", "Preview mode lasts until 150 people take part, so the reader's real sheet would hang among sample sheets under a ‘PREVIEW’ badge (audit ARC-4). Confirm that is acceptable, or end preview once real letters exist. The badge also appends ‘ — N real so far’ from the database (js/room.js:471); not drawn, so no count is invented.");
      c.flag("decision", "Moderation can be bypassed in Phase 0: an anonymous insert can set letter_approved (audit MOD-1). Backend fix needed before ‘passes moderation’ holds.");
      c.flag("copy", "‘Every letter written on this page is kept here’ overpromises: letters are kept only with opt-in and approval (audit CON-2). Correction needs approval.");
      c.flag("decision", "Look-around and opening a sheet are pointer-only (audit KEY-1). A keyboard path to the letters is needed, for example a list.");
      c.flag("data", "The three Archive figures (people, countries, letters) come from the database at run time. Drawn as the page's own loading dash (index.html:132), so no count is invented.");
    },
  });
})();
