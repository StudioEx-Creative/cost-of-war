/* S05 · the drawings. An asset, reported apart from story code (phase 3 spec, "Size and length"):
   the SVG for js/story/scenes/s05.js, the styles it draws with, and the labels printed on it, in
   storyboard px (desktop 1440 × 900, phone 375 × 812). Load it before s05.js.
   Geometry adapted from the live drawings: the turbine and the munition (index.html:303-377) and
   FIG. 2 (index.html:399-480). Every invented number on them is a letter (A, B, Ø C) or
   "SCALE · NTS" (storyboard S05). The plate is S04's ten bars, read from js/data.js.
   Opacity groups (data-g, and a label's group) are the scene's: see its table O. */
window.S05_ART = (function () {
  "use strict";
  // [desktop, phone]: tilt origin (the frame centre), drafting sheet, crease, under-sheet turn, plate box, FIG. 2 paper and
  // border; drawing origin + scale: turbine, munition, FIG. 2; S06's parked drawing [x, y, w]; loupe; detail D and E [x, y, r, balloon r]
  var V = [
    { o: [720, 450], sh: [240, 168, 960, 620], cr: 720, un: 1.8, pb: [364, 250, 712, 454], pp: [-240, -180, 1920, 1260], bx: [48, 56, 1344, 788],
      t: [270, 226, 2.1], m: [750, 226, 2.1], k: [170.8, 27.6, 3.6], pk: [1150, 78, 220], lp: [1040, 188, 264, 284], D: [968.4, 373, 50.4, 11], E: [480, 461.2, 46.2, 11] },
    { o: [187.5, 406], sh: [20, 64, 335, 484], cr: 306, un: 1.6, pb: [22, 136, 200, 340], pp: [16, 56, 343, 500], bx: [22, 62, 331, 488],
      t: [97.5, 90, 0.84], m: [97.5, 332, 0.84], k: [26, 70, 1], pk: [231, 224, 108], lp: [24, 380, 104, 112], D: [184.9, 390.8, 20.2, 8], E: [181.5, 184.1, 18.5, 8] },
  ];
  V.forEach(function (d, i) {
    var s = d.sh, p = d.pk, z = (0.81 * p[2]) / 254; // FIG. 2's body (x 48–302) onto S06's parked drawing
    d.us = [s[0] + (i ? 8 : 16), s[1] + (i ? 10 : 22), s[2], s[3]]; // the sheet under the sheet
    d.a = [d.D, d.E].map(function (e) { return [e[0] + 0.72 * e[2] + 0.7 * e[3], e[1] - 0.72 * e[2] - 0.7 * e[3]]; }); // detail balloons, where the leader starts
    d.kp = [p[0] + 0.16 * p[2] - 48 * z, p[1] + 0.21 * p[2] - 96 * z, z];
  });

  // Styles: the drawing's classes. Hairlines keep their width at any scale (the loupe is 3×).
  var CSS = "<style>.s05w>svg{overflow:visible}.s05w *{vector-effect:non-scaling-stroke;stroke-linejoin:round}" +
    ".s05w .b{stroke:#3C8FDE;stroke-width:1.75;fill:#121315}.s05w .c{stroke:#3C8FDE;opacity:.7}" +
    ".s05w .w{stroke:#FFFFFF;stroke-width:1.5;fill:#121315}.s05w .v{stroke:#FFFFFF;stroke-width:1.5}.s05w .t{stroke-width:1}" +
    ".s05w .g{stroke:#8A9099}.s05w .r{stroke:#E8362B;stroke-width:2}.s05w .a{fill:#8A9099}" +
    ".s05w .n{stroke:rgba(255,255,255,.28)}.s05w .q{stroke:rgba(255,255,255,.4);stroke-dasharray:4 6}.s05w .u{stroke:rgba(255,255,255,.55);stroke-dasharray:3 5}" +
    ".s05w .d{stroke-dasharray:5 4}.s05w .d2{stroke-dasharray:2 4}.s05w .dd{stroke-dasharray:14 4 2 4}" +
    // the labels printed on the drawings (grey on the lit paper is soft, for AA), balloons, chips, the loupe's box
    ".s05w .t-label{color:#C4C9CF}.s05-e{text-align:right}.s05-c{text-align:center}" +
    ".s05-o{display:flex;align-items:center;justify-content:center;box-sizing:border-box;aspect-ratio:1;border:1px solid rgba(255,255,255,.7);border-radius:50%;background:#121315;letter-spacing:0}" +
    ".s05-k{padding:0 .7em;line-height:1.8;background:#FFFFFF;color:#0A0A0A}.story-phone .s05-k span:not(:last-child){display:none}" +
    ".s05z{position:absolute;box-sizing:border-box;border:1px solid #FFFFFF;background:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px) #121315;background-size:29.33px 29.33px}.story-phone .s05z{background-size:11.56px 11.56px}</style>";

  function P(d, c, a) { return '<path d="' + d + '"' + (c ? ' class="' + c + '"' : "") + (a || "") + "/>"; }
  function E(x, y, rx, ry, c) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" class="' + c + '"/>'; }
  function G(g, s, a) { return "<g" + (g != null ? ' data-g="' + g + '"' : "") + (a || "") + ">" + s + "</g>"; }
  function R(a, c, x) { return '<rect x="' + a[0] + '" y="' + a[1] + '" width="' + a[2] + '" height="' + a[3] + '"' + (c ? ' class="' + c + '"' : "") + (x || "") + "/>"; }
  function at(m) { return ' transform="translate(' + m[0] + " " + m[1] + ") scale(" + m[2] + ')"'; }
  function pat(id, n, x, y, d, a, b) {
    return '<pattern id="s05' + id + '" x="' + x + '" y="' + y + '" width="' + n + '" height="' + n + '" patternUnits="userSpaceOnUse"' + (b || "") + ">" + P(d, "", a) + "</pattern>";
  }
  function grid(id, n, x, y) { return pat(id, n, x, y, "M" + n + " 0H0V" + n, ' stroke="#FFFFFF" stroke-opacity=".07"'); }
  // section hatch, 8 screen px apart in a drawing scaled s
  function hat(id, col, s) { return pat(id, (s = 8 / s), 0, 0, "M0 0V" + s, ' stroke="' + col + '" stroke-opacity=".6"', ' patternTransform="rotate(45)"'); }
  function lin(id, a, s) {
    return '<linearGradient id="s05' + id + '"' + a + ">" + s.map(function (q) { return '<stop offset="' + q[0] + '" stop-color="' + q[1] + '" stop-opacity="' + q[2] + '"/>'; }).join("") + "</linearGradient>";
  }

  /* FIG. 1b · the munition (index.html:345-377); gh: the dashed outline the turbine folds into */
  var WH = "M87 124V78Q100 42 113 78V124Z", MB = "M87 230V78Q100 42 113 78V230ZM87 202L62 240L87 221ZM113 202L138 240L113 221Z";
  function mun(gh) {
    var r = [82, 124, 168, 206, 230].map(function (y) { return E(100, y, 13, 3.8, gh ? "v d2" : "g"); }).join("");
    return gh ? P(MB, "v d", ' opacity=".75"') + r + P(WH, "r d")
      : P(MB, "w") + P("M87 128H113V202H87Z", "", ' fill="url(#s05h)" opacity=".7"') + r + P("M100 206V228M100 46V18", "g") +
        G(12, P(WH, "", ' fill="url(#s05r)"') + P(WH, "r")) +
        P("M115 78H134M115 230H134M130 80V228M87 232V250M113 232V250M89 246H111M113 96L150 84H163M113 150L150 158H163", "g") +
        P("M130 80l-3 7h6zM130 228l-3-7h6zM89 246l7-3v6zM111 246l-7-3v6z", "a");
  }
  /* FIG. 1a · the turbine (index.html:303-343): mast and nacelle, three blades (the scene turns and folds them), hub */
  function tur() {
    return G(11, P("M93.5 240L97.6 126H102.4L106.5 240ZM92 115.5L110 112.5L113 120L95 123.5Z", "b") + E(100, 240, 10, 2.8, "b") +
      ["M96.5 118L95.4 38Q100 27 104.4 39L103 119.5Z", "M102.6 123L171 160Q179.5 165.5 170 167.6L100.4 127Z", "M97.4 123L29 160Q20.5 165.5 30 167.6L99.6 127Z"]
        .map(function (q) { return P(q, "b", ' data-b="1"'); }).join("") + E(100, 120, 4.6, 5.4, "b"));
  }
  /* S04's fused plate, half h: five bars each, in order of share of GDP, length = dollars (js/data.js topSpenders) */
  var SP = Story.get("topSpenders"), MX = Math.max.apply(null, SP.map(function (s) { return s.amt; })),
    AM = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].gdp - SP[a].gdp || a - b; }).map(function (i) { return SP[i].amt / MX; });
  function plate(ph, h) {
    var a = AM;
    for (var d = "", j = h * 5; j < h * 5 + 5; j++)
      d += ph ? (d ? "" : "M22 " + (166 + j * 28)) + "H" + (22 + a[j] * 200) + "V" + (194 + j * 28)
        : (d ? "" : "M" + (410 + j * 62) + " 690") + "V" + (690 - a[j] * 440) + "H" + (472 + j * 62);
    d += ph ? "H22Z" : "V690Z";
    return G(null, (ph ? "" : P("M" + (410 + h * 310) + " 690h310v14h-310Z", "n", ' fill="#0A0A0A"')) + P(d, "", ' fill="url(#s05p)"') + P(d, "v", ' fill="url(#s05H)"'), ' data-h="1"');
  }
  /* section A–A (index.html:430-441) */
  function sec(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.84 + '" stroke="url(#s05H)" stroke-width="' + r * 0.32 + '"/>' +
      [1, 0.68, 0.26].map(function (q, i) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r * q + '" class="' + (i ? "g" : "v") + '"/>'; }).join("") +
      P("M" + (x - r - 10) + " " + y + "h" + (2 * r + 20) + "M" + x + " " + (y - r - 10) + "v" + (2 * r + 20), "g dd");
  }

  // The world the camera looks at: table, split plate, drafting sheet with both drawings, FIG. 2 and its sheet.
  function sheet(ph) {
    var d = V[+ph], sh = d.sh, x = sh[0], y = sh[1], w = sh[2], h = sh[3], cr = d.cr, b = d.bx, D = d.D, F = d.E,
      A = ph ? [x, y, w, cr - y] : [x, y, cr - x, h], B = ph ? [x, cr, w, y + h - cr] : [cr, y, x + w - cr, h];
    function dash(q) { return R([q[0] + 0.5, q[1] + 0.5, q[2] - 1, q[3] - 1], "q"); }
    return CSS + "<defs>" + grid("g", ph ? 34 : 60, 0, 0) + grid("q", ph ? 30 : 46, x + 6, y + 6) + grid("k", ph ? 27 : 36, b[0], b[1]) +
      hat("r", "#E8362B", d.m[2]) + hat("h", "#8A9099", d.m[2]) + hat("R", "#E8362B", d.k[2]) + hat("H", "#8A9099", 1) +
      lin("c", ph ? ' x2="0" y2="1"' : "", [[0, "#0A0A0A", 0.5], [1, "#0A0A0A", 0]]) +
      lin("s", ' x2="1" y2="1"', [[0, "#FFFFFF", 0.12], [0.5, "#FFFFFF", 0.02], [1, "#FFFFFF", 0]]) +
      lin("p", ' x2="1" y2="1"', [[0, "#1B1D20", 1], [0.55, "#121315", 1], [1, "#0D0E10", 1]]) +
      '<clipPath id="s05w">' + R(ph ? [0, 56, 375, 500] : [200, 140, 1040, 680], "", ' data-w="1"') + "</clipPath></defs>" +
      R(ph ? [-300, -300, 1000, 1400] : [-600, -400, 2600, 1800], "", ' fill="url(#s05g)"') +
      // the split: the two sheets dashed on the table, construction lines, the plate in two halves, the cut, arrows
      G(0, dash(A) + dash(B) + G(null, P("M100 30V242", "c d") + E(100, 120, 86, 86, "c d2"), at(d.t)) +
        G(null, P("M100 14V250", "g dd") + P("M87 78V230M113 78V230", "g d2"), at(d.m)) + plate(ph, 0) + plate(ph, 1) +
        P(ph ? "M10 306H365" : "M720 128V828", "v") + P(ph ? "M315 290V210M315 322V402" : "M690 760H500M750 760H940", "u") +
        P(ph ? "M309 218L315 210L321 218M309 394L315 402L321 394" : "M508 754L500 760L508 766M932 754L940 760L932 766", "v")) +
      // the drafting sheet (its paper is the engine's Sheet): grid, the far half in shade, the crease, sheen; title marks
      G(1, R([x + 6, y + 6, w - 12, h - 12], "", ' fill="url(#s05q)"') + R(B, "", ' fill="#0A0A0A" opacity=".22"') +
        R(ph ? [x, cr, w, 24] : [cr, y, 40, h], "", ' fill="url(#s05c)"') + R(sh, "", ' fill="url(#s05s)"')) +
      G(2, R(ph ? [32, 77, 8, 8] : [270, 190, 9, 9], "", ' fill="#3C8FDE"') + (ph ? "" : P("M270 210H690M750 210H1170", "n"))) +
      // the drawings, plotted in under the scan line (the clip)
      G(null,
        G(null, G(9, mun(1)) +
          G(10, P("M31 234L34.2 179H35.8L39 234ZM35 179L33.2 152L36.6 153.4ZM35 179L58 193L56.4 195.6ZM35 179L12 194L13.6 196.6ZM164 236L166.4 190H167.6L170 236ZM167 190L165.6 168L168.4 169.2ZM167 190L186 201L184.6 203.2ZM167 190L148 202L149.4 204.2Z", "g") +
            E(35, 234, 6, 1.7, "g") + E(35, 179, 2.2, 2.6, "g") + E(167, 236, 5, 1.5, "g") + E(167, 190, 1.8, 2.1, "g"), ' opacity=".6"') +
          tur() + G(5, P("M108 240H130M108 121H130M126 123V238M110 117L150 100H163", "g") + P("M126 123l-3 7h6zM126 238l-3-7h6z", "a")) +
          // the fold: blades swing down the mast (motion arcs), the new warhead's callout
          G(9, P("M174.6 162.7A86 86 0 0 1 109 205.5M25.4 162.7A86 86 0 0 0 91 205.5M104 32C132 40 136 84 114 104", "u") + P("M87 96L76 72H72", "g") +
            P("M113.3 201.7L109 205.5L113.6 208.5M86.7 201.7L91 205.5L86.4 208.5M110.1 105.4L114 104L114.8 99.5", "v")), at(d.t)) +
        G(13, mun(), at(d.m)), ' clip-path="url(#s05w)"') +
      G(7, E(D[0], D[1], D[2], D[2], "v d")) + G(8, E(F[0], F[1], F[2], F[2], "v d")) +
      G(9, P(ph ? "M12 306H363" : "M720 138V818", "v d") + P(ph ? "M320 288L325 294L330 288M320 324L325 318L330 324" : "M699 471L708 478L699 485M741 471L732 478L741 485", "v")) +
      G(15, P(ph ? "M10 0H365" : "M230 0H1210", "v", ' data-l="1"')) +
      // FIG. 2's sheet: grid, border, title block (desktop), section A–A boxed
      G(17, R(b, "", ' fill="url(#s05k)"') + R([b[0] - 7.5, b[1] - 7.5, b[2] + 15, b[3] + 15], "n") +
        (ph ? R([238.5, 256.5, 103, 95], "v t") + sec(290, 304, 30)
          : R([b[0] + 0.5, b[1] + 0.5, b[2] - 1, b[3] - 1], "n") + R([1132.5, 56.5, 259, 65], "n", ' fill="#121315"') + P("M1132 78H1392M1132 100H1392", "n") +
            R([650.5, 668.5, 179, 149], "v t") + sec(739.6, 734, 46))) +
      // FIG. 2 · side elevation (index.html:399-480): body, warhead section (the one red mark), sections, dimensions, balloon leaders
      G(18, P("M60 76H272L302 96L272 116H60L48 110V82ZM60 76L40 52L86 76ZM60 116L40 140L86 116Z", "w") + G(19, P("M120 76H186V116H120Z", "", ' fill="url(#s05R)"')) +
        P("M30 96H322", "g dd") +
        P("M48 82A5 14 0 0 0 48 110M104 76A5 20 0 0 0 104 116M158 76A5 20 0 0 0 158 116M212 76A5 20 0 0 0 212 116M240 76V116M186 76V116M120 76V116M48 74V52M302 92V52M48 56H302M46 76H30M46 116H30M34 76V116M287 88V46M240 116V144M158 126V156M100 116V144", "g") +
        P("M48 56l7-3v6zM302 56l-7-3v6zM34 76l-3 6h6zM34 116l-3-6h6z", "a") + P("M158 66V126", "v t dd") + G(19, P("M120 76H186V116H120Z", "r")), ' data-k="1"');
  }
  // The two loupes: 3× the drawing around detail D (the warhead) and E (the hub, as it folds), boxed (opacity groups 7, 8)
  function loupe(ph) {
    var d = V[+ph], l = d.lp, n = ph ? 104 / 3 : 88, h = (n * l[3]) / l[2];
    return [d.D, d.E].map(function (c, i) {
      return '<svg class="s05z" fill="none" data-g="' + (7 + i) + '" viewBox="' + [c[0] - n / 2, c[1] - h / 2, n, h].join(" ") + '" style="left:' + l[0] + "px;top:" + l[1] +
        "px;width:" + l[2] + "px;height:" + l[3] + 'px">' + G(null, i ? G(9, mun(1)) + tur() : mun(), at(d[i ? "t" : "m"])) + "</svg>";
    }).join("");
  }

  // The labels printed on the drawings: [class, text, source (null: a label), opacity group, desktop, phone, box (0: drafting sheet, 1: FIG. 2, 4: loupe)]
  var L = [
    ["t-labelW", "CLEAN ENERGY", "index.html:381", 2, [286, 186, 12], [46, 74, 10]],
    ["t-labelW", "MUNITIONS", "index.html:382", 3, [750, 186, 12], [32, 316, 10]],
    ["t-labelW", "FIG. 1a — TURBINE", "index.html:343", 4, [287, 248, 12]],
    ["t-label", "NACELLE", "index.html:342", 5, [617, 430, 12], [236, 167, 10]],
    ["t-labelW", "A", null, 5, [547, 603, 14], [208, 234, 12]],
    ["t-labelW", "FIG. 1b — MUNITION", "index.html:377", 6, [767, 248, 12]],
    ["t-label", "WARHEAD", "index.html:374", 6, [1097, 397, 12], [236, 395, 10]],
    ["t-label", "PROPELLANT", "index.html:376", 6, [1097, 552, 12], [236, 457, 10]],
    ["t-labelW", "B", null, 6, [1029, 464, 14], [209, 421, 12]],
    ["t-labelW", "Ø C", null, 6, [996, 744, 13], [196, 534, 11]],
    ["t-labelW s05-e", "WARHEAD", "index.html:374", 9, [337, 374, 12, 80], [86, 144, 10, 70]],
    ["t-labelW s05-o", "D", null, 7, [994, 326, 11, 22], [191, 368, 10, 16]],
    ["t-labelW s05-o", "E", null, 8, [502, 417, 11, 22], [187, 163, 10, 16]],
    ["t-labelW", "FIG. 2 — MUNITION", "index.html:475", 17, [1142, 61, 11], [30, 70, 10], 1],
    ["t-label", "SCALE · NTS", 0, 17, [1142, 83, 11], 0, 1], // new words: the scene logs them (Story.newCopy)
    ["t-labelW", "STATUS: IN PRODUCTION", "index.html:479", 17, [1142, 105, 11], [30, 86, 10], 1],
    ["t-labelW s05-c", "B", null, 17, [786, 194, 14, 30], [186, 108, 12, 30], 1],
    ["t-labelW s05-c", "Ø C", null, 17, [224, 375, 13, 44], [38, 193, 11], 1],
    ["t-labelW s05-c", "A", "index.html:461", 17, [730, 242, 12, 20], [174, 123, 10, 20], 1],
    ["t-labelW s05-c", "A", "index.html:462", 17, [730, 502, 12, 20], [174, 195, 10, 20], 1],
    ["t-labelW s05-k", "SECTION A–A", "index.html:463 (scale '2:1' dropped)", 17, [650, 648, 11], [238, 239, 10], 1],
    ["t-labelW s05-k", ["FIG. 1b — MUNITION", "index.html:377", "DETAIL D"], null, 7, [1040, 168, 10], [24, 363, 10], 4],
    ["t-labelW s05-k", ["FIG. 1a — TURBINE", "index.html:343", "DETAIL E"], null, 8, [1040, 168, 10], [24, 363, 10], 4],
    ["t-label", "WARHEAD", "index.html:374", 7, [1040, 482, 11], 0, 4],
    ["t-label", "NACELLE", "index.html:342", 8, [1040, 482, 11], 0, 4],
  ];
  // FIG. 2's numbered balloons (index.html:449-460) and the key beside them (desktop) or under the drawing (phone)
  [[1185, 154, 304, 101], [1017, 550, 257, 211], [722, 593, 175, 223], [513, 550, 117, 211]].forEach(function (b, i) {
    L.push(["t-labelW s05-o", "" + (i + 1), null, 17, [b[0], b[1], 12, 36], [b[2], b[3], 10, 18], 1],
      ["t-label", ["1 · NOSE / SEEKER", "2 · GUIDANCE", "3 · WARHEAD", "4 · PROPELLANT"][i], "index.html:" + (466 + i), 17, [b[0] + 44, b[1] + 10, 12], [30, 268 + 16 * i, 10], 1]);
  });

  return { V: V, sheet: sheet, loupe: loupe, labels: L };
})();
