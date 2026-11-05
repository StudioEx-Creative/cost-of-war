/* S09 · GAZA · REVERSE · 1.5 screens · RESTRAINED
   One line. Scroll runs the year from 2025 back to 1948. The years already
   run back go faint on the line. No HUD, no brackets, no hard cuts, no red.
   The year is a reading of the line, not a money count-up.

   THE LINE. S08 ends on one thin line. Here it is a time line. It stays at
   the same place through S10 (the border) and S11 (the floor the old ladder
   stands on). Shared geometry, kept in step by hand with s10.js and s11.js:
     desktop: y 530, x 120 → 1320   ·   phone: y 344, x 16 → 359 */
(function () {
  "use strict";

  var LINE = { desk: { y: 530, x0: 120, x1: 1320 }, phone: { y: 344, x0: 16, x1: 359 } };
  // Scroll plan (p): 0 → 0.08 the year, words and end marks fade in on
  // S08's line (no pop-in) · 0.08 → 0.75 the year runs back · 0.75 → 0.86
  // 1948 holds with the UN line · 0.86 → 1 the slow fade to black (the
  // line stays).
  var IN = 0.08, RUN = 0.75, HOLD = 0.86;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  // The two numbers the clock is built from. Neither has a numeric field:
  // 77 lives only inside destructionData[1].sum; 2025 is the story year
  // (dossier.js NOW_YEAR) and has no Gaza field, so it is read from the
  // year in machineData[0].sum. 1948 is derived from them, never typed.
  function clock(c) {
    var y0s = c.prose("2025", "machineData[0].sum", "clock start: the story year (dossier.js NOW_YEAR = 2025)");
    var ns = c.prose("77", "destructionData[1].sum", "years of human development set back (UN)");
    var Y0 = +y0s, N = +ns;
    return { Y0: Y0, N: N, y0s: y0s, ns: ns, Yend: Y0 - N };
  }
  // Whole years, as dossier.js does (2025 − round(77 × p)).
  function yearAt(k, frac) { return k.Y0 - Math.round(k.N * frac); }
  function yearText(c, k, yr, frac) {
    if (yr === k.Y0) return k.y0s;
    if (yr === k.Yend) return endYear(c, k);
    c.flag("data", "The in-between year " + yr + " shown here is only a sample reading of the line, derived as 2025 − round(77 × " + frac.toFixed(2) + "). It is not a data.js figure; any year between 2025 and 1948 can show at this point of the scroll.");
    return c.sample(String(yr), "derived: 2025 − round(77 × " + frac.toFixed(2) + ")");
  }
  function endYear(c, k) {
    return c.missing(String(k.Yend), "derived: 2025 − 77. No data.js field (dossier.js:135 types it). Suggest a numeric field for 77 and derive 1948");
  }

  function draw(c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone;
    var p = c.plate ? HOLD : c.p;
    var k = clock(c);
    var frac = clamp((p - IN) / (RUN - IN)); // 0 at 2025, 1 at 1948
    var yr = yearAt(k, frac);
    var yearStr = yearText(c, k, yr, frac);
    var done = frac >= 1;
    var arrive = c.plate ? 1 : clamp(p / IN); // the fade in from S08's line
    var fade = c.plate ? 0 : clamp((p - HOLD) / (1 - HOLD)); // the slow fade out
    var keep = arrive * (1 - fade); // year, words, ticks: in from black, out to black
    var L = ph ? LINE.phone : LINE.desk;
    var x0 = L.x0, x1 = L.x1, ly = L.y;
    var xAt = function (y) { return x1 - ((k.Y0 - y) / k.N) * (x1 - x0); };
    var xm = xAt(yr);

    // ── copy
    var kicker = c.copy("GAZA · HUMAN DEVELOPMENT INDEX", "index.html:601");
    var lead = c.copy("Money can rebuild a building. It cannot rebuild time.", "index.html:609-610");
    var src = c.copy("UN 2026 ↗", "index.html:617");
    function unLine() {
      return c.copy("The UN estimates one war set human development in Gaza back ", "index.html:609-611") +
        '<b style="color:' + T.white + ';font-weight:600">' + k.ns + c.copy(" years", "index.html:611") + "</b>" +
        c.copy(" — to ", "index.html:611") + (done ? yearStr : endYear(c, k)) +
        c.copy(", before almost anyone alive today was born.", "index.html:611-612");
    }

    // ── the line
    var s = "";
    // decade ticks, unlabelled (positions derived from the same two numbers)
    for (var d = Math.ceil(k.Yend / 10) * 10; d < k.Y0; d += 10) {
      var tx = xAt(d), passed = tx > xm;
      s += S.line(tx, ly - (ph ? 4 : 5), tx, ly + (ph ? 4 : 5), { stroke: T.white, opacity: ((passed ? 0.16 : 0.34) * keep).toFixed(2) });
    }
    // still to run back: lit. Already run back: faint, dashed (erased years).
    if (xm > x0 + 0.5) s += S.line(x0, ly, xm, ly, { stroke: T.white, "stroke-width": 1.5, opacity: 0.78 });
    if (xm < x1 - 0.5) s += S.line(xm, ly, x1, ly, { stroke: T.white, "stroke-dasharray": "3 5", opacity: 0.42 });
    // end caps
    s += S.line(x0, ly - 9, x0, ly + 9, { stroke: T.white, opacity: (0.4 * keep).toFixed(2) });
    s += S.line(x1, ly - 9, x1, ly + 9, { stroke: T.white, opacity: (0.4 * keep).toFixed(2) });
    // the marker: where the year now stands
    s += S.line(xm, ly - (ph ? 16 : 24), xm, ly + (ph ? 16 : 24), { stroke: T.white, "stroke-width": 1.5, opacity: keep.toFixed(2) });
    c.svg(s);

    var op = ";opacity:" + keep.toFixed(2);
    if (!ph) {
      c.div(120, 120, 600, kicker, TX.label + op);
      c.div(110, 222, 900, yearStr, TX.giant + ";font-size:232px" + op);
      // end labels under the line
      c.div(x1 - 120, ly + 20, 120, k.y0s, TX.src + ";text-align:right" + op);
      if (done) c.div(x0, ly + 20, 120, yearStr, TX.src + op);
      if (!done) c.div(120, ly + 74, 700, lead, TX.body + op);
      else {
        c.div(120, ly + 74, 720, lead + " " + unLine(), TX.body + op);
        c.div(120, ly + 196, 300, src, TX.src + op);
      }
    } else {
      var tb = c.textBox;
      c.div(16, 64, 343, kicker, TX.label + ";font-size:10px" + op);
      c.div(11, 186, 348, yearStr, TX.giant + ";font-size:128px" + op);
      c.div(x1 - 60, ly + 14, 60, k.y0s, TX.src + ";font-size:10px;text-align:right" + op);
      if (done) c.div(x0, ly + 14, 60, yearStr, TX.src + ";font-size:10px" + op);
      if (!done) c.div(tb.x, tb.y, tb.w, lead, TX.bodySm + op);
      else if (c.plate) {
        // the plate carries both lines of copy
        c.div(tb.x, tb.y, tb.w, lead, TX.bodySm);
        c.div(tb.x, tb.y + 56, tb.w, unLine(), TX.bodySm);
        c.div(tb.x, tb.y + 160, tb.w, src, TX.src);
      } else {
        c.div(tb.x, tb.y, tb.w, unLine(), TX.bodySm + op);
        c.div(tb.x, tb.y + 104, tb.w, src, TX.src + op);
      }
    }

    c.state({
      form: "time line",
      x: x0, y: ly, w: x1 - x0, h: 1.5,
      tone: "white; faint and dashed where run back",
      note: fade > 0 ? "slow fade: year, words and ticks go; the faint dashed line stays where it is and becomes S10's border"
        : done ? "marker at the 1948 end; the whole line faint (77 years erased)"
        : frac > 0 ? "marker part-way; the right part (years run back) is faint"
        : "S08's thin line, lit end to end; marker at the 2025 end",
    });
    if (!frac) c.flag("data", "No Gaza field holds 2025. It is read from the story year in machineData[0].sum (dossier.js NOW_YEAR = 2025). Audit F02: add numeric fields (e.g. the 77 and its base year) and derive 1948.");
    if (done && !fade) c.flag("decision", "The live ‘0 → 77 YEARS ERASED’ counter (index.html:603) is left out: the year is the one number that moves, and 77 is said once, in the UN sentence. Confirm.");
    if (fade > 0) c.flag("decision", "Transition: everything fades slowly except the line, which stays put and becomes S10's border (and then S11's floor). Brief says only ‘a slow fade’. Confirm the line may carry over.");
  }

  SB.scene({
    order: 9,
    id: "S09",
    name: "Gaza",
    move: "REVERSE",
    screens: 1.5,
    restrained: true,
    anchor: "#setback",
    trigger: "S08's bands have fallen away to one thin line (end of S08). The live #setback id stays as an in-page anchor; it is not one of the four required deep links.",
    camera: "None. The frame holds still; only the year and the marker change.",
    reason:
      "A slow fade, not a cut. The year and the words go; the faint line stays exactly where it is. The 77 years run back have left a line, and in S10 that same line is the border people cross: lost time becomes lost home.",
    frames: [
      { k: "in", p: 0.08, cap: "S08's thin line, now a time line, lit end to end. The year, one line of copy and the end marks have faded in on it (p 0 to 0.08, no pop-in). The year reads 2025." },
      { k: "mid", p: 0.415, cap: "Scrolling down runs the year back in whole years. The marker walks left; the years already run back go faint and dashed. (The year shown is a sample reading, half way along.)" },
      { k: "out", p: 0.8, cap: "1948. The line is faint end to end. The UN sentence and source appear and hold." },
      { k: "fade", p: 0.93, cap: "The slow fade, half way (p 0.86 to 1): year, words and ticks dim towards black; the faint dashed line keeps its strength. At p 1 only that line is left, in place, for S10." },
    ],
    draw: draw,
    // No-motion plate: 1948 at rest, 2025 at the far end, both lines of copy, the source.
    plate: draw,
  });
})();
