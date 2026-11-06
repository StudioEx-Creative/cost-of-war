/* S13 · THE HANDOVER · HAND OVER · 0.5 screen
   From the black pause that closes S12, one blank sheet appears. It is the
   Sheet again, now plain paper: no figure, so its area means nothing here.
   The title lands, the sheet takes its tab, one hint sits below. Scrubbing
   ends with this scene: from here the reader's choices change the visuals,
   not the scroll position.

   Art direction: one sheet in black, lit from directly above, lying back
   slightly toward the reader like paper on a lectern. The title is set
   large and in front of it, so the blue word crosses the paper's lower edge.
   No camera: the tilt is staging, not a move. */
(function () {
  "use strict";
  var S = SB.SVG;

  // The sheet's tilt (degrees), about its own centre.
  var TILT_D = { rx: 16, ry: -4, rz: -2.5, persp: 1700 };
  var TILT_P = { rx: 14, ry: -3, rz: -2.5, persp: 1100 };

  // Sheet geometry: portrait paper (1 : √2), the blank letter to come.
  function sheetBox(c) {
    if (c.phone) {
      var h = 316, w = Math.round(h / Math.SQRT2);
      return { x: 84, y: 112, w: w, h: h };
    }
    var H = 580, W = Math.round(H / Math.SQRT2);
    return { x: 760, y: 146, w: W, h: H };
  }

  // Where a point on the tilted sheet lands on screen (CSS: perspective,
  // then rotateX · rotateY · rotateZ about the sheet's centre).
  function proj(t, ox, oy, x, y) {
    var r = Math.PI / 180, X = x - ox, Y = y - oy, a;
    a = t.rz * r; var x1 = X * Math.cos(a) - Y * Math.sin(a), y1 = X * Math.sin(a) + Y * Math.cos(a);
    a = t.ry * r; var x2 = x1 * Math.cos(a), z2 = -x1 * Math.sin(a);
    a = t.rx * r; var y3 = y1 * Math.cos(a) - z2 * Math.sin(a), z3 = y1 * Math.sin(a) + z2 * Math.cos(a);
    var k = t.persp / (t.persp - z3);
    return [ox + x2 * k, oy + y3 * k];
  }

  function title(c, sz1, sz2) {
    return (
      '<div style="font-size:' + sz1 + 'px">' + c.copy("What if we chose ", "index.html:792") + "</div>" +
      '<div style="font-size:' + sz2 + "px;color:" + c.T.blue + ';margin-top:2px">' + c.copy("differently?", "index.html:792") + "</div>"
    );
  }

  function hint(c) {
    return (
      c.copy("Tap the causes you'd fund, ", "index.html:829") +
      '<b style="color:' + c.T.white + ';font-weight:600">' +
      c.copy("in order of priority — your most urgent first", "index.html:829-830") +
      "</b>" + c.copy(".", "index.html:830")
    );
  }

  // Light from directly above: a soft beam down to the paper and a pool on
  // the floor below it. White only, low opacity.
  function lightDefs() {
    var W = SB.T.white;
    return "<defs>" +
      '<linearGradient id="s13Beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + W + '" stop-opacity="0.10"/><stop offset="0.7" stop-color="' + W + '" stop-opacity="0.035"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="s13Floor"><stop offset="0" stop-color="' + W + '" stop-opacity="0.06"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="s13Lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + W + '" stop-opacity="0.22"/><stop offset="0.4" stop-color="' + W + '" stop-opacity="0.05"/><stop offset="1" stop-color="' + W + '" stop-opacity="0"/></linearGradient>' +
      "</defs>";
  }

  // The sheet as a physical object: paper, a lit top edge, a tab, drawn
  // flat in its own box and tilted in 3D about its centre.
  function paper(c, b, t, op, withTab) {
    var T = c.T, TX = c.TX, ph = c.phone;
    var tabH = ph ? 26 : 32, tabW = ph ? 150 : 214, pad = ph ? 2 : 24;
    var W = b.w + pad * 2, H = b.h + tabH + pad * 2;
    var ox = pad, oy = pad + tabH; // sheet's top-left inside the box
    var s = "";
    if (withTab) {
      s += S.rect(ox, oy - tabH, tabW, tabH, { fill: "url(#paper)", stroke: T.sheetLine });
      s += S.rect(ox + 12, oy - tabH / 2 - 4, 8, 8, { fill: T.blue }); // blue returns: one small live mark
    }
    s += S.sheet(ox, oy, b.w, b.h, { tone: "white", mode: "edge", sw: 1 });
    s += S.rect(ox, oy, b.w, b.h, { fill: "url(#s13Lit)" });
    s += S.line(ox, oy + 0.5, ox + b.w, oy + 0.5, { stroke: "rgba(255,255,255,0.75)", "stroke-width": 1.2 });
    s += S.rect(ox + 0.5, oy + 0.5, b.w - 1, b.h - 1, { fill: "none", stroke: T.sheetLine });
    var html = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" style="position:absolute;left:0;top:0;overflow:visible">' + s + "</svg>";
    if (withTab)
      html += '<div style="position:absolute;left:' + (ox + 28) + "px;top:" + (oy - tabH + (ph ? 7 : 9)) + "px;width:" + (tabW - 36) + "px;" +
        TX.labelW + ";font-size:" + (ph ? 10 : 11) + 'px">' + c.copy("Have your say", "index.html:791") + "</div>";
    var tf = "perspective(" + t.persp + "px) rotateX(" + t.rx + "deg) rotateY(" + t.ry + "deg) rotateZ(" + t.rz + "deg)";
    var X0 = b.x - ox, Y0 = b.y - oy;
    c.div(X0, Y0, W, html, "height:" + H + "px;opacity:" + op + ";transform-origin:50% 50%;transform:" + tf);
    // screen positions of the sheet's corners; with the tab on, the top-left
    // corner of the object is the tab's (so marks and the tracking box clear it)
    var cx = X0 + W / 2, cy = Y0 + H / 2;
    var pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]];
    if (withTab) pts.push([b.x, b.y - tabH], [b.x + tabW, b.y - tabH]);
    return pts.map(function (q) { return proj(t, cx, cy, q[0], q[1]); });
  }

  // registration marks just outside each corner of the tilted sheet (the
  // top-left one outside the tab's corner when the tab is on)
  function regMarks(c, k, len, op) {
    var s = "", cx = (k[0][0] + k[2][0]) / 2, cy = (k[0][1] + k[2][1]) / 2;
    var q4 = [k.length > 4 ? k[4] : k[0], k[1], k[2], k[3]];
    q4.forEach(function (q) {
      var dx = q[0] - cx, dy = q[1] - cy, d = Math.sqrt(dx * dx + dy * dy);
      var x = q[0] + (dx / d) * 16, y = q[1] + (dy / d) * 16;
      s += S.path("M" + (x - len) + " " + y + " H" + (x + len) + " M" + x + " " + (y - len) + " V" + (y + len), { stroke: "rgba(255,255,255," + op + ")" });
    });
    return s;
  }

  SB.scene({
    order: 13,
    id: "S13",
    name: "The Handover",
    move: "HAND OVER",
    screens: 0.5,
    restrained: false,
    anchor: "#haveyoursay",
    trigger: "#haveyoursay top, straight after the long black pause and “When you're ready” that close S12.",
    camera: "None. A still frame: the blank sheet fades in from black. Scrubbing ends with this scene.",
    reason:
      "The Sheet returns blank, so the counting is over and the paper now belongs to the reader. Nothing after this is scrubbed. In Redistribute the same paper carries the year's military budget once more, and only the reader's choices drain it.",
    frames: [
      { k: "in", p: 0, cap: "Black, held over from the S12 pause. Nothing on screen yet." },
      { k: "mid", p: 0.5, cap: "One blank sheet fades in. Neutral paper with no figure on it, so its size means no money." },
      { k: "out", p: 1, cap: "The title lands, the sheet takes its tab (Have your say), one hint sits below. Scroll stops driving anything from here." },
    ],
    alts: [
      {
        k: "B",
        label: "Chrome returns at the handover",
        frames: ["out"],
        note:
          "Same end frame with the top labels and the progress scale back on. Today dossier.js scrubs the chrome back in at #haveyoursay (audit SCR-2). The main frames keep it off through the tools.",
      },
    ],
    draw: function (c) {
      var T = c.T, TX = c.TX;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone;
      var b = sheetBox(c);
      var t = ph ? TILT_P : TILT_D;

      if (p <= 0) {
        // black: nothing drawn
        c.state({ form: "none (black)", x: null, y: null, w: 0, h: 0, tone: "none", note: "held black from the S12 pause" });
        return;
      }

      var on = p >= 1;
      var op = on ? 1 : 0.42;

      // the light, from directly above (fixed, behind the paper)
      var bx = b.x + b.w / 2, top = b.y - 30;
      var beam = ph
        ? "M" + (bx - 34) + " 0 L" + (bx + 34) + " 0 L" + (bx + b.w * 0.86) + " " + (b.y + b.h) + " L" + (bx - b.w * 0.86) + " " + (b.y + b.h) + " Z"
        : "M" + (bx - 60) + " 0 L" + (bx + 60) + " 0 L" + (bx + b.w * 0.84) + " " + (b.y + b.h + 40) + " L" + (bx - b.w * 0.84) + " " + (b.y + b.h + 40) + " Z";
      c.bgSvg(lightDefs() + '<g opacity="' + (on ? 1 : 0.55) + '">' +
        S.path(beam, { fill: "url(#s13Beam)", stroke: "none" }) +
        '<ellipse cx="' + bx + '" cy="' + (b.y + b.h + (ph ? 24 : 40)) + '" rx="' + b.w * (ph ? 0.95 : 1.1) + '" ry="' + (ph ? 26 : 46) + '" fill="url(#s13Floor)"/>' +
        "</g>");
      // a hairline from the top of the frame: where the light hangs
      c.svg(S.line(bx, 0, bx, top - (ph ? 34 : 50), { stroke: "rgba(255,255,255," + (on ? 0.22 : 0.12) + ")" }));

      var k = paper(c, b, t, op, on);
      c.svg(regMarks(c, k, ph ? 5 : 7, on ? 0.5 : 0.25));

      // the Sheet's rect as it sits on screen (tilted), for notes and the overlay
      var xs = k.map(function (q) { return q[0]; }), ys = k.map(function (q) { return q[1]; });
      var sx = Math.min.apply(null, xs), sy = Math.min.apply(null, ys);
      var sw = Math.max.apply(null, xs) - sx, sh = Math.max.apply(null, ys) - sy;

      if (on) {
        if (ph) {
          // title set large under the stage, crossing the paper's foot
          c.div(16, 462, 343, title(c, 31, 41), TX.title + ";line-height:0.95");
          var tb = c.textBox;
          c.svg(S.line(tb.x, tb.y + 20, tb.x + 24, tb.y + 20, { stroke: T.white }));
          c.div(tb.x, tb.y + 34, 300, hint(c), TX.bodySm + ";font-size:15px;line-height:1.5");
          c.div(tb.x, tb.y + 106, 40, "▾", TX.label + ";font-size:14px;color:" + T.white);
        } else {
          // the title, set large, in front of the paper: the blue word crosses its lower edge
          c.div(96, 548, 1100, title(c, 58, 106), TX.title + ";line-height:0.92");
          c.svg(S.line(1208, 230, 1236, 230, { stroke: T.white }));
          c.div(1208, 246, 200, hint(c), TX.body + ";font-size:19px;line-height:1.45");
          c.div(1208, 386, 40, "▾", TX.label + ";font-size:14px;color:" + T.white);
          c.div(1208, 196, 200, c.label("FIG. 13 · BLANK", "storyboard marginalia: the sheet carries no figure"), TX.label + ";font-size:10px");
        }
        if (c.alt === "B") c.chrome();
        c.flag("decision",
          "Does any chrome (top labels, progress scale) return after S13? Main frames: off through every tool. Alt B: back on from here. Today dossier.js scrubs it back in at #haveyoursay (audit SCR-2).");
        c.flag("copy",
          "The lead paragraph under the title today (index.html:793-798, ‘Governments hold the budgets…’) is not drawn: the brief gives S13 two lines only. Keep it under the sheet, move it into Redistribute, or drop it?");
      }

      c.state({
        form: on ? "blank sheet with tab" : "blank sheet (fading in)",
        x: Math.round(sx), y: Math.round(sy), w: Math.round(sw), h: Math.round(sh),
        tone: "neutral paper, white hairline, lit from above; blue only on the tab mark and one word",
        note: "not money: no figure, so area means nothing. Rect is the tilted sheet (with its tab, once it has one) as it sits on screen. Next it becomes the year's military budget sheet in Redistribute.",
      });
    },
  });
})();
