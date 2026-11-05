/* HANDOVER TOOLS · H1–H6 · not scroll-driven
   One scene per tool. Each frame is a state the reader reaches by choosing,
   never by scrolling. Chrome is off (whether it returns is decision SCR-2,
   raised in S13).

   The example reader used in every frame (sample state, not data):
   - picks three causes, in this order: Zero Hunger, Clean Water, Global Health
   - picks United Kingdom in the country step
   All costs, names and country figures are read from js/data.js. Anything the
   tool computes from them (remaining, allocated, tax) is shown with
   c.sample() and the formula it comes from. */
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
  function cost(c, i) {
    var p = "issueData[" + i + "].cost", v = SB.get(p);
    if (v >= 1000) {
      if (!c._fmtFlag) {
        c._fmtFlag = true;
        c.flag("data", "Climate Action prints as $1.00T in the live tool (main.js fmt). SB format T would print $1T. Frames keep the live $1.00T.");
      }
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
    if (o.wrap) // a long placeholder shown in full, on two lines
      c.div(x + 14, y + (h - 36) / 2, w - 28, html, "font-family:" + F.sans + ";font-size:" + (o.size || 15) + "px;line-height:18px;color:" + T.grey);
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
  // an allocated cause sheet at true area
  function causeSheet(c, x, y, w, h, n, alt) {
    var k = (n - 1) % 3;
    if (alt === "B" && k === 1) c.svg(S.sheet(x, y, w, h, { tone: "deep", mode: "solid" }));
    else if (alt === "B" && k === 2) c.svg(S.sheet(x, y, w, h, { tone: "grey", mode: "hatch", sw: 1 }));
    else c.svg(S.sheet(x, y, w, h, { tone: "blue", mode: "edge", sw: 1.5 }));
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
  // the Sheet: ghost of the full budget, remaining sheet anchored bottom-left
  function h1Sheet(c, box, rank, o) {
    o = o || {};
    var full = c.rung("DEFENCE", D(), box, "bl");
    var rem = D() - allocB(rank);
    var r = SB.rungAt(rem, D(), box, "bl");
    if (rank.length) {
      logRung(c, "DEFENCE − chosen causes (remaining)", rem, r, box, D());
      c.svg(S.rect(full.x + 0.5, full.y + 0.5, full.w - 1, full.h - 1, { fill: "none", stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "5 5" }));
      // the ghost keeps its figure: the earlier reference stays labelled
      var gl = (r.y - full.y) >= 30 ? 12 : 10;
      c.div(full.x + full.w - 152, full.y + Math.max(3, (r.y - full.y - gl * 1.35) / 2), 140, c.fig("DEFENCE", "T"),
        TX.label + ";font-size:" + gl + "px;text-align:right");
    }
    c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: c.phone ? 8 : 12 }));
    var ph = c.phone, pad = ph ? 14 : 28;
    c.div(r.x + pad, r.y + (ph ? 16 : 30), r.w - pad * 2, c.copy("budget remaining", "index.html:806"), TX.label + ";font-size:" + (ph ? 10 : 12) + "px");
    c.div(r.x + pad - 2, r.y + (ph ? 34 : 56), null, rank.length ? remFig(c, rank) : c.fig("DEFENCE", "T"),
      TX.value + ";font-size:" + (ph ? 40 : 72) + "px");
    c.state({
      form: rank.length ? "budget sheet, drained" : "budget sheet, full",
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h),
      tone: "red edge, neutral paper" + (rank.length ? "; dashed ghost at the full budget" : ""),
      note: rank.length ? "remaining = DEFENCE − chosen, true area, anchored bottom-left inside the ghost" : "area = DEFENCE; the reader has chosen nothing",
    });
    return { full: full, rem: r };
  }
  function h1Card(c, i, x, y, w, h, pos, alt, focus) {
    var on = pos > -1;
    if (on && alt !== "B") c.svg(S.rect(x + 0.75, y + 0.75, w - 1.5, h - 1.5, { fill: T.sheet, stroke: T.blue, "stroke-width": 1.5 }));
    else c.svg(S.rect(x + 0.5, y + 0.5, w - 1, h - 1, { fill: on ? T.sheet : "none", stroke: on ? "rgba(255,255,255,0.6)" : T.rule }));
    var ix = x + 12;
    if (on) { badge(c, x + 10, y + (h - 24) / 2, pos + 1, 24, alt); ix = x + 46; }
    c.div(ix, y + (c.phone ? 7 : 9), 120, isdg(c, i), TX.label + ";font-size:10px");
    c.div(ix, y + (c.phone ? 23 : 25), w - (ix - x) - 76, iname(c, i),
      "font-family:" + F.sans + ";font-size:" + (c.phone ? 15 : 16) + "px;font-weight:500;line-height:1.3;white-space:nowrap;color:" + (on ? T.white : T.soft));
    c.div(x + w - 112, y + (h - 22) / 2, 100, cost(c, i) + '<span style="' + TX.src + ';font-size:11px;font-weight:400"> ' + c.copy("/yr", "js/main.js:489") + "</span>",
      TX.value + ";font-size:18px;line-height:22px;text-align:right;color:" + (on ? T.white : T.soft));
    if (focus) focusRing(c, x, y, w, h);
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
      TX.bodySm + ";font-size:17px;line-height:1.4;color:" + T.soft);
    c.div(x, y + 62, w, h1Stmt(c, rank), TX.bodySm + ";font-size:14px;line-height:1.45;color:" + T.grey);
  }
  // phone plate: every figure of the step, still. The drained sheet, all
  // fourteen causes with their costs (chosen ones ranked), the summary.
  function h1PhonePlate(c, rank, alt) {
    c.div(16, 16, 343, h1Prompt(c, rank), TX.labelW + ";font-size:11px");
    var box = { x: 16, y: 40, w: 343, h: 190 };
    h1Sheet(c, box, rank);
    var n = SB.get("issueData").length, y0 = 244, rh = 32;
    for (var i = 0; i < n; i++) {
      var y = y0 + i * rh, pos = rank.indexOf(i), on = pos > -1;
      c.svg(S.line(16, y, 359, y, { stroke: T.rule }));
      if (on) badge(c, 16, y + 6, pos + 1, 20, alt);
      c.div(on ? 44 : 16, y + 6, 220, iname(c, i),
        "font-family:" + F.sans + ";font-size:14px;font-weight:" + (on ? 600 : 400) + ";line-height:20px;white-space:nowrap;color:" + (on ? T.white : T.soft));
      c.div(239, y + 6, 120, cost(c, i) + '<span style="' + TX.src + ';font-size:10px;font-weight:400"> ' + c.copy("/yr", "js/main.js:489") + "</span>",
        TX.value + ";font-size:14px;line-height:20px;text-align:right;color:" + (on ? T.white : T.soft));
    }
    c.svg(S.line(16, y0 + n * rh, 359, y0 + n * rh, { stroke: T.rule }));
    c.div(16, y0 + n * rh + 10, 343, h1Stmt(c, rank), TX.bodySm + ";font-size:14px;line-height:1.4;color:" + T.grey);
  }
  // the journey gate, still locked: Step 01 sits blurred behind its message
  function h1Gate(c, x, y, w, h) {
    c.svg(S.line(x, y, x + w, y, { stroke: T.rule, "stroke-dasharray": "4 4" }));
    c.div(x, y + 20, w, c.copy("Step 01", "index.html:895"), TX.label + ";opacity:0.35");
    c.div(x, y + 40, w, c.copy("Your country", "index.html:896"), TX.title + ";font-size:40px;opacity:0.12;filter:blur(3px)");
    c.div(x, y + 30, w,
      c.copy("Your letter writes itself from your choices.", "index.html:880") + "<br>" + c.copy("Make one above to continue.", "index.html:880-881"),
      TX.bodySm + ";font-size:15px;text-align:center;color:" + T.white);
    button(c, x + (w - 260) / 2, y + 92, 260, 44, c.copy("▲ Choose what you'd fund", "index.html:887"), "outline", 14);
  }
  function h1Desk(c, rank, alt) {
    c.div(56, 36, 1328, h1Title(c), TX.title + ";font-size:34px;text-align:center");
    c.div(300, 84, 840, h1Sub(c), TX.bodySm + ";font-size:16px;text-align:center");
    // causes: two columns, as the live layout (7 left, 7 right)
    var n = SB.get("issueData").length, half = Math.ceil(n / 2);
    for (var i = 0; i < n; i++) {
      var x = i < half ? 56 : 1064, y = 172 + (i % half) * 70;
      h1Card(c, i, x, y, 320, 60, rank.indexOf(i), alt, !rank.length && i === 0);
    }
    var box = { x: 440, y: 192, w: 560, h: 350 };
    c.div(box.x, 158, box.w, h1Prompt(c, rank), TX.labelW + ";font-size:12px;text-align:center");
    h1Sheet(c, box, rank);

    if (!rank.length) {
      c.div(box.x, box.y + box.h + 24, box.w, h1Count(c, rank), TX.label + ";text-align:center");
      button(c, 1064, 700, 320, 48, c.copy("Continue → Your country", "index.html:869") + ' <span style="margin-left:6px">▾</span>', "off");
      h1Gate(c, box.x, 700, box.w, 170);
      return;
    }
    // drained → allocated: one leader from the emptied band to the ranked row
    var bandX = box.x + box.w - 14;
    var hy = box.y + box.h + 22;
    c.svg(S.leader([[bandX, box.y + 40], [bandX, hy - 6]], { color: "rgba(255,255,255,0.45)" }));
    // the ranked row (live: "Your priorities, in order")
    c.div(box.x, hy, 400, c.copy("Your priorities, in order", "index.html:846"), TX.labelW + ";font-size:12px");
    c.div(box.x, hy + 20, 420, c.copy("use ↑ ↓ to reorder · your top priority first", "index.html:847"), TX.src);
    c.div(box.x + box.w - 170, hy, 156, c.copy("allocated", "index.html:815"), TX.label + ";text-align:right");
    c.div(box.x + box.w - 170, hy + 18, 156, allocFig(c, rank), TX.value + ";font-size:26px;text-align:right");
    c.svg(S.line(box.x, hy + 52, box.x + box.w - 22, hy + 52, { stroke: T.rule }));
    var base = hy + 196, xs = box.x;
    rank.forEach(function (idx, p) {
      var r = c.rung("issueData[" + idx + "].cost", D(), box, "bl");
      var x = xs, y = base - r.h;
      causeSheet(c, x, y, r.w, r.h, p + 1, alt);
      var lx = x, lw = Math.max(r.w, 120);
      badge(c, lx, base + 12, p + 1, 22, alt);
      c.div(lx + 30, base + 13, lw, iname(c, idx), "font-family:" + F.sans + ";font-size:14px;font-weight:600;line-height:20px;white-space:nowrap;color:" + T.white);
      c.div(lx + 30, base + 33, lw, cost(c, idx) + c.copy("/yr", "js/main.js:941"), TX.src + ";font-size:12px");
      // reorder controls (live: ↑ ↓ ✕), 28px on desktop
      ["↑", "↓", "✕"].forEach(function (g, k) {
        var off = (g === "↑" && p === 0) || (g === "↓" && p === rank.length - 1);
        button(c, lx + 30 + k * 34, base + 58, 28, 28, g, off ? "off" : "quiet", 14);
      });
      xs += lw + 34;
    });
    c.div(56, 690, 320, h1Count(c, rank), TX.labelW);
    h1Summary(c, rank, 56, 718, 320);
    button(c, 1064, 700, 320, 48, c.copy("Continue → Your country", "index.html:869") + ' <span style="margin-left:6px">▾</span>', "primary");
    button(c, 1064, 762, 154, 44, c.copy("↺ Reset", "index.html:858"), "quiet", 14);
    button(c, 1230, 762, 154, 44, c.copy("↗ Share this", "index.html:859"), "quiet", 14);
  }
  function h1Phone(c, rank, alt) {
    var st = c.stage, tb = c.textBox;
    c.div(st.x, st.y, st.w, h1Prompt(c, rank), TX.labelW + ";font-size:11px");
    var box = { x: st.x, y: st.y + 24, w: st.w, h: 214 };
    h1Sheet(c, box, rank);
    if (!rank.length) {
      [0, 1, 2, 3].forEach(function (i) { h1Card(c, i, st.x, box.y + box.h + 18 + i * 60, st.w, 52, -1, alt, i === 0); });
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
    var hy = box.y + box.h + 14;
    c.div(st.x, hy, 200, c.copy("Your priorities, in order", "index.html:846"), TX.labelW + ";font-size:10px");
    c.div(st.x + st.w - 150, hy - 2, 150, c.copy("allocated", "index.html:815") + " " +
      '<span style="' + TX.value + ';font-size:16px;letter-spacing:0;text-transform:none">' + allocFig(c, rank) + "</span>", TX.label + ";font-size:10px;text-align:right");
    // sheets at true area, in rank order, on one baseline
    var rs = rank.map(function (idx) { return c.rung("issueData[" + idx + "].cost", D(), box, "bl"); });
    var base = hy + 24 + Math.max.apply(null, rs.map(function (r) { return r.h; })), xs = st.x;
    rs.forEach(function (r, p) {
      causeSheet(c, xs, base - r.h, r.w, r.h, p + 1, alt);
      c.div(xs + 5, base - r.h + 4, 20, String(p + 1), TX.labelW + ";font-size:10px;line-height:12px");
      xs += r.w + 16;
    });
    // stacked label rail with 44px reorder controls
    rank.forEach(function (idx, p) {
      var y = base + 10 + p * 46;
      c.svg(S.line(st.x, y, st.x + st.w, y, { stroke: T.rule }));
      badge(c, st.x, y + 11, p + 1, 22, alt);
      c.div(st.x + 32, y + 4, 150, iname(c, idx), "font-family:" + F.sans + ";font-size:14px;font-weight:600;line-height:20px;white-space:nowrap;color:" + T.white);
      c.div(st.x + 32, y + 24, 150, cost(c, idx) + c.copy("/yr", "js/main.js:941"), TX.src + ";font-size:11px");
      ["↑", "↓", "✕"].forEach(function (g, k) {
        var off = (g === "↑" && p === 0) || (g === "↓" && p === rank.length - 1);
        button(c, st.x + st.w - 132 + k * 44, y + 1, 44, 44, g, off ? "off" : "quiet", 15);
      });
    });
    c.div(tb.x, tb.y, tb.w, h1Count(c, rank), TX.value + ";font-size:20px");
    c.div(tb.x, tb.y + 30, tb.w, c.copy("The order you choose them in is your ranking.", "index.html:830"), TX.bodySm + ";font-size:14px");
    button(c, tb.x, tb.y + 72, tb.w, 48, c.copy("Continue → Your country", "index.html:869") + " ▾", "blueline");
    button(c, tb.x, tb.y + 132, 166, 44, c.copy("↺ Reset", "index.html:858"), "quiet", 14);
    button(c, tb.x + 177, tb.y + 132, 166, 44, c.copy("↗ Share this", "index.html:859"), "quiet", 14);
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
      c.svg(S.rect(trX, ry + rowH / 2 - 3, trW, 6, { fill: "rgba(255,255,255,0.12)" }));
      c.svg(S.rect(trX, ry + rowH / 2 - 3, trW * fill, 6, { fill: T.blue }));
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
  // UK rung inside the ghost of the world total (it is part of that total)
  function h2Sheet(c, box) {
    var full = c.rung("DEFENCE", D(), box, "bl");
    c.svg(S.rect(full.x + 0.5, full.y + 0.5, full.w - 1, full.h - 1, { fill: "none", stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "5 5" }));
    var r = c.rung(CP + "[2]", D(), box, "bl");
    c.svg(S.sheet(r.x, r.y, r.w, r.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: c.phone ? 6 : 10 }));
    var ph = c.phone;
    var small = full.w < 240;
    c.div(full.x + (ph ? (small ? 8 : 12) : 22), full.y + (ph ? (small ? 8 : 12) : 20), Math.min(400, full.w - 24), c.fig("DEFENCE", "T") + " · " + c.copy("global military total", "js/main.js:1077"),
      TX.label + ";font-size:" + (ph ? 10 : 12) + "px;text-transform:uppercase;letter-spacing:" + (small ? "0.06em" : "0.14em"));
    var lx = r.x + r.w + (ph ? (small ? 22 : 30) : 60), ly = r.y - (ph ? (small ? 30 : 34) : 60);
    c.svg(S.leader([[r.x + r.w - 6, r.y + 6], [lx - 8, ly + 10]], {}));
    var lw = Math.min(260, c.W - lx - 8);
    if (!small) c.div(lx, ly, lw, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:" + (ph ? 10 : 12) + "px");
    c.div(lx, ly + (small ? 2 : ph ? 16 : 20), lw, h2Spend(c), TX.value + ";font-size:" + (small ? 14 : ph ? 18 : 26) + "px");
    c.state({ form: "budget sheet as a frame, country rung inside", x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h), tone: "country rung red edge; world total dashed ghost", note: "true area: the country's spend is part of the world total, so nesting is honest here" });
  }
  function slider(c, x, y, w, pos, focused) {
    var t = pos / 1000, tx = x + w * t;
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
      '<span style="' + TX.src + ";font-size:" + Math.round(size * 0.5) + 'px"> ' + c.copy("/yr income", "js/main.js:1086") + "</span>";
  }
  function h2Desk(c, focused) {
    var t = tax(focused ? TAX_KEY : TAX_START);
    // the country card
    h2Head(c, 96, 48, 560, 52);
    c.div(96, 132, 520, h2Desc(c), TX.bodySm + ";font-size:16px");
    field(c, 96, 196, 420, 48, c.fig(CP + "[0]", "raw"), { value: true, caret: true, size: 17 });
    c.svg(S.line(96, 264, 616, 264, { stroke: "rgba(255,255,255,0.3)" }));
    c.div(96, 276, 400, c.fig(CP + "[0]", "raw"), TX.labelW);
    c.div(92, 296, 400, h2Spend(c), TX.giant + ";font-size:80px");
    c.div(96, 382, 580, h2Meta(c), TX.src + ";font-size:11px;white-space:nowrap");
    c.div(96, 408, 540, h2Note(c), TX.bodySm + ";font-size:15px;line-height:1.45");
    h2Sheet(c, { x: 704, y: 56, w: 640, h: 252 });
    h2Compare(c, 704, 334, 330, 24, 13);
    h2Trend(c, 1074, 334, 270, 30, 11);
    // tax box
    c.svg(S.line(96, 498, 1344, 498, { stroke: T.rule }));
    c.div(96, 522, 600, c.copy("Where does your tax money go?", "js/main.js:1083"), TX.title + ";font-size:26px");
    c.div(96, 560, 580, c.copy("Slide to your income and see how much of your tax funds the military each year.", "js/main.js:1084"), TX.bodySm + ";font-size:15px");
    c.div(96, 622, 540, income(c, t, 30), TX.value + ";font-size:30px");
    slider(c, 106, 692, 520, t.pos, focused);
    sliderScale(c, 96, 726, 540, 12);
    var r = taxResult(c, t);
    c.div(704, 522, 640, r.amt + '<span style="' + TX.src + ';font-size:15px"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.value + ";font-size:52px;color:" + (focused ? T.white : T.soft));
    c.div(704, 590, 640, r.lbl, TX.bodySm + ";font-size:16px");
    c.div(704, 652, 620, r.note, TX.src + ";font-size:11px");
    button(c, 704, 740, 300, 48, c.copy("Continue → Write the letter", "index.html:925"), "primary");
  }
  function h2Phone(c, k) {
    var st = c.stage, tb = c.textBox;
    if (k === "state") {
      h2Head(c, st.x, st.y, st.w, 30);
      field(c, st.x, st.y + 66, st.w, 48, c.fig(CP + "[0]", "raw"), { value: true, caret: true, size: 16 });
      c.div(st.x, st.y + 130, 300, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:10px");
      c.div(st.x - 2, st.y + 146, 300, h2Spend(c), TX.giant + ";font-size:60px");
      c.div(st.x, st.y + 206, st.w, h2Meta(c), TX.src + ";font-size:11px");
      h2Sheet(c, { x: st.x, y: st.y + 262, w: st.w, h: 214 });
      c.div(tb.x, tb.y, tb.w, h2Note(c, false), TX.bodySm + ";font-size:15px");
      button(c, tb.x, tb.y + 74, tb.w, 48, c.copy("Continue → Write the letter", "index.html:925"), "blueline");
      return;
    }
    if (k === "plate") {
      // every figure of the step, still, in reading order
      var t0 = tax(TAX_KEY), r0 = taxResult(c, t0); // the reader's own reading, as the letter quotes it
      c.div(16, 20, 200, c.copy("Step 01", "index.html:895"), TX.label + ";font-size:10px");
      c.div(16, 36, 343, c.copy("Your country", "index.html:896"), TX.title + ";font-size:24px");
      c.div(16, 70, 160, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:10px");
      c.div(14, 84, 180, h2Spend(c), TX.giant + ";font-size:40px");
      h2Sheet(c, { x: 200, y: 64, w: 159, h: 92 });
      c.div(16, 164, 343, h2Meta(c), TX.src + ";font-size:10px");
      c.div(16, 200, 343, h2Note(c), TX.bodySm + ";font-size:14px;line-height:1.4");
      h2Compare(c, 16, 290, 343, 20, 12);
      h2Trend(c, 16, 420, 343, 18, 10);
      c.svg(S.line(16, 504, 359, 504, { stroke: T.rule }));
      c.div(16, 514, 343, income(c, t0, 18), TX.value + ";font-size:18px");
      slider(c, 26, 554, 323, t0.pos, false);
      c.div(16, 574, 343, r0.amt + '<span style="' + TX.src + ';font-size:12px"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.value + ";font-size:28px");
      c.div(16, 610, 343, r0.lbl, TX.bodySm + ";font-size:14px;line-height:1.4");
      c.div(16, 676, 343, r0.note, TX.src + ";font-size:10px");
      return;
    }
    var t = tax(TAX_KEY), r = taxResult(c, t);
    c.div(st.x, st.y, 200, c.fig(CP + "[0]", "raw"), TX.label + ";font-size:11px");
    c.div(st.x, st.y + 22, st.w, c.copy("Where does your tax money go?", "js/main.js:1083"), TX.title + ";font-size:28px");
    c.div(st.x, st.y + 100, st.w, c.copy("Slide to your income and see how much of your tax funds the military each year.", "js/main.js:1084"), TX.bodySm + ";font-size:15px");
    c.div(st.x, st.y + 170, st.w, income(c, t, 30), TX.value + ";font-size:30px");
    slider(c, st.x + 18, st.y + 248, st.w - 36, t.pos, true);
    sliderScale(c, st.x, st.y + 286, st.w, 11);
    c.div(st.x, st.y + 330, st.w, r.amt + '<span style="' + TX.src + ';font-size:13px"> ' + c.copy("/yr", "js/main.js:1147") + "</span>", TX.value + ";font-size:40px");
    c.div(st.x, st.y + 382, st.w, r.lbl, TX.bodySm + ";font-size:14px;line-height:1.45");
    c.div(tb.x, tb.y, tb.w, r.note, TX.src + ";font-size:10px");
    button(c, tb.x, tb.y + 74, tb.w, 48, c.copy("Continue → Write the letter", "index.html:925"), "blueline");
    c.state({ form: "slider (no sheet on screen)", x: st.x, y: st.y + 248, w: st.w, h: 0, tone: "neutral", note: "phone shows the tax step on its own screen; the sheet with the country rung is one swipe up" });
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
  // part: 'full' (desktop), 'top' / 'end' (phone, the two ends of the same letter),
  // 'plate' (phone no-motion plate: every figure of the letter, with the
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
  function letterSheet(c, b, part, editing, size) {
    // the Sheet as paper: neutral, white hairline, blue tab (the alternative)
    var ph = c.phone, pad = ph ? 14 : 36;
    c.svg(S.sheet(b.x, b.y, b.w, b.h, { tone: "white", mode: "edge", sw: 1 }));
    c.svg(S.rect(b.x, b.y, 10, 10, { fill: T.blue }));
    if (editing) focusRing(c, b.x, b.y, b.w, b.h);
    var ty;
    if (part === "plate") {
      c.div(b.x + pad, b.y + 14, 260, c.copy("Your letter · editable", "index.html:963"), TX.label + ";font-size:10px");
      ty = b.y + 42;
      c.svg(S.line(b.x + pad, ty - 10, b.x + b.w - pad, ty - 10, { stroke: T.rule }));
    } else if (part !== "end") {
      // toolbar
      c.div(b.x + pad, b.y + (ph ? 14 : 22), 260, c.copy("Your letter · editable", "index.html:963"), TX.label + ";font-size:" + (ph ? 10 : 11) + "px");
      var tools = [["Copy", "index.html:965"], ["Email", "index.html:966"], ["Post to X", "index.html:968"]];
      if (ph) {
        tools.forEach(function (t, i) { button(c, b.x + pad + i * 106, b.y + 36, 98, 44, c.copy(t[0], t[1]), "quiet", 14); });
      } else {
        var bx = b.x + b.w - pad - 3 * 96 + 8;
        tools.forEach(function (t, i) { button(c, bx + i * 96, b.y + 14, 88, 32, c.copy(t[0], t[1]), "quiet", 13); });
      }
      ty = b.y + (ph ? 96 : 66);
      c.svg(S.line(b.x + pad, ty - 10, b.x + b.w - pad, ty - 10, { stroke: T.rule }));
    } else ty = Math.max(b.y + 16, 16);
    var body = letterParas(c, part, editing).map(function (p) { return '<p style="margin:0 0 ' + (ph ? 9 : 10) + 'px">' + p + "</p>"; }).join("");
    var hBody = b.y + b.h - ty - (ph ? 12 : 20);
    c.div(b.x + pad, ty, b.w - pad * 2, body, "font-family:" + F.sans + ";font-size:" + size + "px;line-height:1.48;color:" + T.soft + ";height:" + hBody + "px;overflow:hidden");
    if (part === "top") // the letter runs on below
      c.div(b.x + 1, b.y + b.h - 70, b.w - 2, "", "height:69px;background:linear-gradient(to bottom, transparent, " + T.sheet + ")");
    c.state({
      form: "letter (the Sheet as paper)", x: b.x, y: b.y, w: b.w, h: b.h, tone: "neutral paper, white hairline, blue tab",
      note: (editing ? "contenteditable has focus: white ring and caret. " : "generated from the reader's choices; editable in full. ") +
        (part === "top" ? "Phone: top of the letter; it runs on below." : part === "end" ? "Phone: scrolled to the end of the letter." : part === "plate" ? "Phone plate: every figure in the letter, figure-free passages elided." : ""),
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
  function h3Desk(c, editing) {
    c.div(64, 56, 360, c.copy("Step 02", "index.html:934"), TX.label);
    c.div(64, 80, 360, c.copy("Write the letter", "index.html:935"), TX.title + ";font-size:48px");
    c.div(64, 186, 360, c.copy("A personal letter, pre-written from your choices and editable in full. Address it to your head of state. Send it, post it, or screenshot it.", "index.html:937-939"), TX.bodySm + ";font-size:15px");
    field(c, 64, 314, 360, 48, c.copy("Your name (optional, defaults to 'A concerned citizen')", "index.html:950"), { size: 13 });
    field(c, 64, 372, 360, 48, c.copy("Your leader's name / title (e.g. Prime Minister Starmer)", "index.html:957"), { size: 13 });
    c.svg(S.line(64, 448, 424, 448, { stroke: T.rule }));
    letterConsent(c, 64, 466, 360, 14, false, false);
    letterSheet(c, { x: 470, y: 40, w: 600, h: 820 }, "full", editing, 14);
    // storyboard key (not page UI): what the dashed marks in the letter are
    c.svg(S.rect(1110.5, 62.5, 22, 13, { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-dasharray": "2 2" }));
    c.div(1144, 61, 256, c.label("TYPED NAME · AUDIT CON-1", "storyboard key for the dashed marks"), TX.label + ";font-size:11px");
    // after the letter: contact note, the one primary action, two quiet links
    button(c, 1110, 676, 290, 64, c.copy("✉ Send this letter to your representative", "index.html:983"), "primary", 15);
    contactNote(c, 1110, 756, 290, 12);
    button(c, 1110, 816, 140, 44, c.copy("Generate shareable card", "index.html:988"), "quiet", 13);
    button(c, 1260, 816, 140, 44, c.copy("Skip to the coalition", "index.html:992"), "quiet", 13);
  }
  function h3Phone(c, editing) {
    var st = c.stage, tb = c.textBox;
    if (!editing) {
      c.div(st.x, 22, st.w, c.copy("Step 02", "index.html:934") + " · " + c.copy("Write the letter", "index.html:935"), TX.label + ";font-size:10px");
      letterSheet(c, { x: st.x, y: st.y - 12, w: st.w, h: st.h + 12 }, "top", false, 14);
      // sticky action bar while the letter is on screen
      button(c, tb.x, tb.y, tb.w, 56, c.copy("✉ Send this letter to your representative", "index.html:983"), "blueline", 15);
      button(c, tb.x, tb.y + 68, 166, 44, c.copy("Generate shareable card", "index.html:988"), "quiet", 14);
      button(c, tb.x + 177, tb.y + 68, 166, 44, c.copy("Skip to the coalition", "index.html:992"), "quiet", 14);
      contactNote(c, tb.x, tb.y + 126, tb.w, 11);
      return;
    }
    letterSheet(c, { x: st.x, y: -24, w: st.w, h: st.y + st.h + 24 }, "end", true, 14);
    letterConsent(c, tb.x, tb.y + 6, tb.w, 14, false, false);
    // the one primary action stays in reach below the letter
    button(c, tb.x, tb.y + 104, tb.w, 56, c.copy("✉ Send this letter to your representative", "index.html:983"), "blueline", 15);
  }
  // phone plate: one still sheet with every figure the letter carries
  function h3PhonePlate(c) {
    c.div(16, 4, 343, c.copy("Step 02", "index.html:934") + " · " + c.copy("Write the letter", "index.html:935"), TX.label + ";font-size:10px");
    letterSheet(c, { x: 16, y: 24, w: 343, h: 776 }, "plate", false, 14);
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
  function globe(c, cx, cy, R, lat0, lon0, bars) {
    var rad = Math.PI / 180, p0 = lat0 * rad;
    function proj(lat, lon) {
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
        var v = proj(q[0], q[1]);
        if (v[2] > 0) { d += (on ? " L" : " M") + (cx + v[0]).toFixed(1) + " " + (cy - v[1]).toFixed(1); on = true; }
        else on = false;
      });
      return d ? S.path(d, { stroke: "rgba(255,255,255,0.2)", "stroke-width": 1 }) : "";
    }
    var s = S.circle(cx, cy, R, { fill: T.sheet, stroke: "rgba(255,255,255,0.35)", "stroke-width": 1 });
    var lat, lon, pts, q;
    for (lon = -180; lon < 180; lon += 20) { pts = []; for (lat = -90; lat <= 90; lat += 3) pts.push([lat, lon]); s += line(pts); }
    for (lat = -60; lat <= 60; lat += 20) { pts = []; for (q = -180; q <= 180; q += 3) pts.push([lat, q]); s += line(pts); }
    var tips = [];
    (bars || []).forEach(function (b) {
      var v = proj(b.lat, b.lon);
      if (v[2] <= 0) return;
      // a radial bar of height h·R, projected: its tip is the surface point scaled by (1 + h)
      var x0 = cx + v[0], y0 = cy - v[1], x1 = cx + v[0] * (1 + b.h), y1 = cy - v[1] * (1 + b.h);
      s += S.circle(x0, y0, b.ring, { fill: "none", stroke: T.blue, "stroke-width": 1.5, opacity: 0.8 });
      s += S.line(x0, y0, x1, y1, { stroke: T.blue, "stroke-width": 4 });
      tips.push({ x: x1, y: y1, bx: x0, by: y0 });
    });
    c.svg(s);
    return tips;
  }
  function coalitionWords(c, x, y, w, big, small) {
    c.div(x, y, w, c.copy("A growing coalition", "js/main.js:1659"), TX.title + ";font-size:" + big + "px;text-transform:none;letter-spacing:-0.01em");
    c.div(x, y + big + 8, w, c.copy("of people choosing where the money should go — add your voice.", "js/main.js:1662"), TX.bodySm + ";font-size:" + small + "px");
  }
  function coalitionForm(c, x, y, w, o) {
    o = o || {};
    var ph = c.phone, fs = ph ? 14 : 13, gap = 10, eh = ph ? 56 : 48;
    field(c, x, y, w, eh, c.copy("Your email (optional, for Six Degrees waitlist & Blueprint updates)", "index.html:1046"), { size: fs, wrap: ph });
    field(c, x, y + eh + gap, w, 48, c.copy("Your age range (optional)", "index.html:1050"), { size: fs, caret: true });
    var cy = y + eh + gap + 48 + 14;
    checkbox(c, x, cy + 3, false, 20);
    c.div(x + 32, cy, w - 32,
      c.copy("Email me Blueprint & Six Degrees updates. I agree to the ", "index.html:1061") +
      '<span style="color:' + T.white + ';text-decoration:underline">' + c.copy("privacy policy", "index.html:1063") + "</span>" +
      c.copy(". (Leave the box and email blank to take part anonymously.)", "index.html:1063-1065"),
      TX.bodySm + ";font-size:14px;line-height:1.45");
    var cy2 = cy + (ph ? 74 : 58);
    letterConsent(c, x, cy2, w, 14, !!o.letterOn, !!o.focus);
    var by = cy2 + (ph ? 108 : 84);
    button(c, x, by, w, 52, c.copy("Submit my priorities + generate shareable card", "index.html:1085"), o.sent ? "off" : (ph ? "blueline" : "primary"), 15);
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
  // the reader's own country, labelled at the tip of its bar
  // the label sits up and to the left, clear of the sphere; the leader runs from its end to the bar's tip
  function barLabel(c, tip, lx, ly, size) {
    var tw = size < 11 ? 108 : 120;
    c.svg(S.leader([[tip.x, tip.y], [lx + tw + 6, ly + 8]], {}));
    c.div(lx, ly, tw + 4, c.fig(CP + "[0]", "raw"), TX.labelW + ";font-size:" + size + "px;white-space:nowrap");
  }
  var G_LAT = 22, G_LON = 22; // view: Europe and Africa toward the viewer, the reader's country off-centre so its bar reads
  function h4Desk(c, sent) {
    c.div(96, 56, 300, c.copy("Step 03", "index.html:1005"), TX.label);
    c.div(96, 80, 520, c.copy("Join the coalition", "index.html:1007"), TX.title + ";font-size:48px");
    c.div(96, 184, 500, '<span style="display:inline-block;width:8px;height:8px;background:' + T.blue + ';margin-right:10px;vertical-align:1px"></span>' +
      c.copy("People choosing to fund the planet, from around the world. Add your voice to the global tally.", "index.html:1010-1011"), TX.bodySm + ";font-size:16px");
    coalitionWords(c, 96, 258, 520, 34, 15);
    var end = coalitionForm(c, 96, 350, 500, { letterOn: true, focus: !sent, sent: sent });
    if (sent) thanks(c, 96, end + 14, 500, 15);
    c.div(700, 64, 640, c.copy("The coalition, lighting up the map", "index.html:1016"), TX.labelW + ";text-align:center");
    c.div(700, 88, 640, c.copy("Each bar is a country's sign-ups. Drag to spin · scroll to zoom.", "index.html:1018"), TX.src + ";font-size:12px;text-align:center");
    var tips = globe(c, 1020, 486, 300, G_LAT, G_LON, sent ? [ukBar()] : []);
    if (sent && tips[0]) barLabel(c, tips[0], 700, tips[0].y - 120, 11);
    c.state({ form: "globe (no sheet)", x: 720, y: 186, w: 600, h: 600, tone: "neutral sphere; blue only for the reader's own sign-up", note: sent ? "one bar: the reader's country, after submit" : "no bars: seeded sign-ups removed (decision 4)" });
  }
  function h4Phone(c, sent) {
    var st = c.stage, tb = c.textBox;
    if (!sent) {
      c.div(st.x, st.y - 4, 300, c.copy("Step 03", "index.html:1005"), TX.label + ";font-size:11px");
      c.div(st.x, st.y + 16, st.w, c.copy("Join the coalition", "index.html:1007"), TX.title + ";font-size:28px");
      coalitionForm(c, st.x, st.y + 90, st.w, { letterOn: true, focus: true, sent: false });
      coalitionWords(c, tb.x, tb.y + 22, tb.w, 24, 14);
      c.div(tb.x, tb.y + 104, tb.w, c.copy("People choosing to fund the planet, from around the world. Add your voice to the global tally.", "index.html:1010-1011"), TX.bodySm + ";font-size:14px;color:" + T.grey);
      c.state({ form: "form (no sheet)", x: st.x, y: st.y, w: st.w, h: st.h, tone: "neutral", note: "letter opt-in ticked, keyboard focus on it; the globe is one swipe down" });
      return;
    }
    c.div(st.x, st.y, st.w, c.copy("The coalition, lighting up the map", "index.html:1016"), TX.labelW + ";font-size:10px;text-align:center");
    var tips = globe(c, st.x + st.w / 2, st.y + 236, 160, G_LAT, G_LON, [ukBar()]);
    if (tips[0]) barLabel(c, tips[0], st.x, tips[0].y - 64, 10);
    c.div(st.x, st.y + 420, st.w, c.copy("Each bar is a country's sign-ups. Drag to spin · scroll to zoom.", "index.html:1018"), TX.src + ";font-size:11px;text-align:center");
    coalitionWords(c, tb.x, tb.y, tb.w, 24, 14);
    thanks(c, tb.x, tb.y + 90, tb.w, 15);
    c.state({ form: "globe (no sheet)", x: st.x + 11, y: st.y + 76, w: 320, h: 320, tone: "neutral sphere; blue only for the reader's own sign-up", note: "after submit: one bar for the reader's country; no seeded bars or count" });
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
    c.state({ form: "share card (the reader's sheet, portable)", x: b.x, y: b.y, w: b.w, h: b.h, tone: "neutral paper, blue tab; blue squares mark the ranked causes", note: "not true area: the card lists, it does not measure" });
  }
  function h5Desk(c) {
    c.svg(S.rect(0, 0, c.W, c.H, { fill: "rgba(255,255,255,0.03)" }));
    card(c, { x: 450, y: 40, w: 540 }, 1.15);
    var y = 40 + cardH(1.15) + 24;
    button(c, 450, y, 164, 48, c.copy("↓ Download PNG", "index.html:1274"), "primary", 15);
    focusRing(c, 450, y, 164, 48);
    button(c, 622, y, 104, 48, c.copy("Post to X", "index.html:1277"), "outline", 14);
    button(c, 734, y, 104, 48, c.copy("LinkedIn", "index.html:1280"), "outline", 14);
    button(c, 846, y, 144, 48, c.copy("Copy for Instagram", "index.html:1283"), "outline", 13);
    button(c, 670, y + 70, 100, 44, c.copy("Close", "index.html:1291"), "quiet", 14);
  }
  function h5Phone(c) {
    var st = c.stage, tb = c.textBox;
    card(c, { x: st.x, y: st.y + 4, w: st.w }, 0.82);
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
  function room(c, R, mine) {
    var rnd = rng(c.phone ? 11 : 7);
    var n = c.phone ? 90 : 220, list = [];
    for (var i = 0; i < n; i++) {
      var d = rnd();
      list.push({ d: d, x: rnd(), y: rnd() });
    }
    list.sort(function (a, b) { return b.d - a.d; }); // far first
    var base = c.phone ? 40 : 64;
    var s = '<defs><clipPath id="roomClip"><rect x="' + R.x + '" y="' + R.y + '" width="' + R.w + '" height="' + R.h + '"/></clipPath></defs><g clip-path="url(#roomClip)">';
    s += S.rect(R.x, R.y, R.w, R.h, { fill: T.ground });
    list.forEach(function (q) {
      var k = 0.22 + 0.78 * Math.pow(1 - q.d, 1.8);
      var w = base * 0.72 * k, h = base * k;
      var x = R.x + q.x * (R.w + w) - w;
      var top = R.y + R.h * (0.06 + 0.7 * q.y * (0.4 + 0.6 * (1 - q.d)));
      var op = 0.18 + 0.7 * (1 - q.d);
      s += S.line(x + w / 2, R.y, x + w / 2, top, { stroke: "rgba(255,255,255," + (0.04 + 0.08 * (1 - q.d)).toFixed(3) + ")" });
      s += '<g opacity="' + op.toFixed(3) + '">' + S.rect(x, top, w, h, { fill: T.sheet, stroke: "rgba(255,255,255,0.45)", "stroke-width": 0.75 }) + "</g>";
    });
    if (mine) {
      s += S.line(mine.x + mine.w / 2, R.y, mine.x + mine.w / 2, mine.y, { stroke: "rgba(255,255,255,0.35)" });
      s += S.rect(mine.x - 6, mine.y - 6, mine.w + 12, mine.h + 12, { fill: T.ground });
      s += S.sheet(mine.x, mine.y, mine.w, mine.h, { tone: "white", mode: "edge", sw: 1.5 });
      s += S.rect(mine.x, mine.y, 8, 8, { fill: T.blue });
    }
    s += "</g>" + S.rect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, { fill: "none", stroke: T.rule });
    c.svg(s);
  }
  function badgeTxt(c) {
    return c.copy("PREVIEW · these are sample sheets, not real participants", "js/room.js:470");
  }
  function h6Desk(c) {
    c.div(64, 40, 600, c.copy("The artwork · Everyone who has written", "index.html:103"), TX.label);
    c.div(64, 62, 600, c.copy("The Archive", "index.html:105"), TX.title + ";font-size:52px");
    c.div(700, 50, 676, c.copy("Every letter written on this page is kept here, one sheet for one person — a single record made by everybody who has taken part. Move through it. Open any sheet to read what a stranger told their government.", "index.html:107-110"), TX.bodySm + ";font-size:15px");
    var R = { x: 64, y: 150, w: 1312, h: 600 };
    var mine = { x: 800, y: 330, w: 92, h: 130 };
    room(c, R, mine);
    c.div(R.x + 16, R.y + 16, null, badgeTxt(c), TX.labelW + ";font-size:11px;background:" + T.ground + ";padding:6px 10px;border:1px solid " + T.rule);
    // the reader's own sheet: blank, unnamed, awaiting review
    c.svg(S.leader([[mine.x + mine.w + 4, mine.y + 30], [mine.x + mine.w + 70, mine.y + 30]], {}));
    c.div(mine.x + mine.w + 78, mine.y + 20, null, c.newCopy("Awaiting review", "audit ARC-5: the reader's sheet in the same session, blank and unnamed; never the unapproved text"),
      TX.labelW + ";font-size:11px;white-space:nowrap;background:" + T.ground + ";padding:4px 8px;border:1px solid " + T.rule);
    c.div(R.x, R.y + R.h - 34, R.w, c.copy("drag to look around · click a sheet to read it", "index.html:119"), TX.label + ";font-size:11px;text-align:center");
    var figs = [["people have written", "index.html:133"], ["countries represented", "index.html:137"], ["letters in the archive", "index.html:141"]];
    figs.forEach(function (f, i) {
      var x = 64 + i * 240;
      c.div(x, 776, 220, c.copy("—", "index.html:132"), TX.value + ";font-size:34px;color:" + T.grey);
      c.div(x, 818, 220, c.copy(f[0], f[1]), TX.label + ";font-size:11px");
    });
    c.state({ form: "hanging sheet in the Archive", x: mine.x, y: mine.y, w: mine.w, h: mine.h, tone: "neutral paper, white edge, blue tab (the reader's)", note: "blank and unnamed until a moderator approves the letter; joins only if the reader ticked the letter opt-in" });
  }
  function h6Phone(c) {
    var st = c.stage, tb = c.textBox;
    var R = { x: st.x, y: st.y + 52, w: st.w, h: st.h - 52 };
    var mine = { x: st.x + 196, y: st.y + 214, w: 52, h: 74 };
    c.div(st.x, st.y, st.w, badgeTxt(c), TX.labelW + ";font-size:10px;line-height:1.5");
    room(c, R, mine);
    c.svg(S.leader([[mine.x + mine.w / 2, mine.y + mine.h + 4], [mine.x + mine.w / 2, mine.y + mine.h + 40]], {}));
    c.div(mine.x + mine.w / 2 - 66, mine.y + mine.h + 42, 132, c.newCopy("Awaiting review", "audit ARC-5: the reader's sheet in the same session, blank and unnamed; never the unapproved text"),
      TX.labelW + ";font-size:10px;text-align:center;box-sizing:border-box;background:" + T.ground + ";padding:4px 8px;border:1px solid " + T.rule);
    c.div(tb.x, tb.y, tb.w, c.copy("The artwork · Everyone who has written", "index.html:103"), TX.label + ";font-size:10px");
    c.div(tb.x, tb.y + 20, tb.w, c.copy("The Archive", "index.html:105"), TX.title + ";font-size:32px");
    c.div(tb.x, tb.y + 64, tb.w, c.copy("drag to look around · click a sheet to read it", "index.html:119"), TX.bodySm + ";font-size:14px");
    c.state({ form: "hanging sheet in the Archive", x: mine.x, y: mine.y, w: mine.w, h: mine.h, tone: "neutral paper, white edge, blue tab", note: "blank and unnamed, awaiting review" });
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
    // bottom of the hero file, for place
    c.svg(S.rect(210, -40, 1020, 160, { fill: T.sheet, stroke: T.sheetLine }));
    c.div(210, 142, 1020, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";text-align:center;font-size:11px");
    var y = 250, x = 120, w = 360;
    c.svg(S.line(120, y - 20, 1320, y - 20, { stroke: T.rule }));
    NAV.forEach(function (n, i) {
      var nx = x + i * (w + 30);
      c.div(nx, y, 50, c.copy(n[0], n[3]), TX.title + ";font-size:30px");
      c.div(nx + 56, y + 2, w - 56, c.copy(n[1], n[3]), "font-family:" + F.sans + ";font-size:19px;font-weight:600;color:" + T.white);
      c.div(nx + 56, y + 32, w - 56, c.copy(n[2], n[3]), TX.label + ";font-size:11px");
    });
    // the small link, at the end of the nav
    var ly = 352, lw = 196, lx = 1320 - lw;
    c.svg(S.line(120, ly - 18, 1320, ly - 18, { stroke: T.rule }));
    c.div(lx, ly, lw, c.copy("▸ Enter the archive", "index.html:1107"), LINK_ST + ";justify-content:center");
    focusRing(c, lx, ly, lw, 44);
    var m = pageMap(c, 120, 700, 1200, 11);
    var mx = lx + lw / 2;
    c.svg(S.leader([[m.land.x, 700], [m.land.x, 600], [mx, 600], [mx, ly + 52]], {}));
    c.state({ form: "none (page top)", x: null, y: null, w: 0, h: 0, tone: "none", note: "the link jumps to the Archive at the end; the Sheet is not on this screen" });
  }
  function h6LinkPhone(c) {
    var st = c.stage, tb = c.textBox;
    c.svg(S.rect(st.x, st.y - 80, st.w, 120, { fill: T.sheet, stroke: T.sheetLine }));
    c.div(st.x, st.y + 54, st.w, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";text-align:center;font-size:10px");
    var y = st.y + 100;
    NAV.forEach(function (n, i) {
      var ny = y + i * 76;
      c.svg(S.line(st.x, ny - 10, st.x + st.w, ny - 10, { stroke: T.rule }));
      c.div(st.x, ny + 4, 40, c.copy(n[0], n[3]), TX.title + ";font-size:24px");
      c.div(st.x + 44, ny, st.w - 44, c.copy(n[1], n[3]), "font-family:" + F.sans + ";font-size:17px;font-weight:600;color:" + T.white);
      c.div(st.x + 44, ny + 26, st.w - 44, c.copy(n[2], n[3]), TX.label + ";font-size:10px");
    });
    var ly = y + 3 * 76;
    c.svg(S.line(st.x, ly - 10, st.x + st.w, ly - 10, { stroke: T.rule }));
    c.div(st.x + 44, ly + 4, 190, c.copy("▸ Enter the archive", "index.html:1107"), LINK_ST + ";justify-content:center");
    focusRing(c, st.x + 44, ly + 4, 190, 44);
    var m = pageMap(c, tb.x, tb.y + 120, tb.w, 10);
    var mx = st.x + 44 + 95;
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
