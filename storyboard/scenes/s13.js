/* S13 · THE HANDOVER · HAND OVER · 0.5 screen
   From the black pause that closes S12, one blank sheet appears. It is the
   Sheet again, now plain paper: no figure, so its area means nothing here.
   The title lands, the sheet takes its tab, one hint sits below. Scrubbing
   ends with this scene: from here the reader's choices change the visuals,
   not the scroll position. */
(function () {
  "use strict";
  var S = SB.SVG;

  // Sheet geometry: portrait paper (1 : √2), the blank letter to come.
  function sheetBox(c) {
    if (c.phone) {
      var h = 352, w = Math.round(h / Math.SQRT2);
      return { x: Math.round((c.W - w) / 2), y: 178, w: w, h: h };
    }
    var H = 520, W = Math.round(H / Math.SQRT2);
    return { x: Math.round((c.W - W) / 2), y: 248, w: W, h: H };
  }

  function title(c) {
    return (
      c.copy("What if we chose ", "index.html:792") +
      '<span style="color:' + c.T.blue + '">' + c.copy("differently?", "index.html:792") + "</span>"
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

      if (p <= 0) {
        // black: nothing drawn
        c.state({ form: "none (black)", x: null, y: null, w: 0, h: 0, tone: "none", note: "held black from the S12 pause" });
        return;
      }

      var op = p >= 1 ? 1 : 0.42;
      var tabH = ph ? 24 : 30, tabW = ph ? 150 : 210;

      // the sheet: neutral paper, white hairline edge
      if (p >= 1) {
        c.svg(S.rect(b.x, b.y - tabH, tabW, tabH, { fill: T.sheet, stroke: T.sheetLine }));
        // blue returns: one small live mark on the tab
        c.svg(S.rect(b.x + 12, b.y - tabH / 2 - 4, 8, 8, { fill: T.blue }));
        c.div(b.x + 28, b.y - tabH + (ph ? 5 : 8), tabW - 36, c.copy("Have your say", "index.html:791"),
          TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px");
      }
      c.svg(S.sheet(b.x, b.y, b.w, b.h, { tone: "white", mode: "edge", sw: 1, opacity: op }));
      c.svg(S.rect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, { fill: "none", stroke: T.sheetLine, opacity: op }));

      if (p >= 1) {
        // title above the sheet
        if (ph) {
          c.div(16, 64, 343, title(c), TX.title + ";font-size:28px;text-align:center");
        } else {
          c.div(120, 64, 1200, title(c), TX.title + ";font-size:64px;text-align:center");
        }
        // one control hint
        if (ph) {
          var tb = c.textBox;
          c.div(tb.x, tb.y + 4, tb.w, hint(c), TX.bodySm + ";font-size:16px;text-align:center");
          c.div(tb.x, tb.y + 64, tb.w, "▾", TX.label + ";text-align:center;font-size:14px;color:" + T.white);
        } else {
          c.div(370, b.y + b.h + 30, 700, hint(c), TX.bodySm + ";font-size:17px;text-align:center");
          c.div(370, b.y + b.h + 64, 700, "▾", TX.label + ";text-align:center;font-size:14px;color:" + T.white);
        }
        if (c.alt === "B") c.chrome();
        c.flag("decision",
          "Does any chrome (top labels, progress scale) return after S13? Main frames: off through every tool. Alt B: back on from here. Today dossier.js scrubs it back in at #haveyoursay (audit SCR-2).");
        c.flag("copy",
          "The lead paragraph under the title today (index.html:793-798, ‘Governments hold the budgets…’) is not drawn: the brief gives S13 two lines only. Keep it under the sheet, move it into Redistribute, or drop it?");
      }

      c.state({
        form: p >= 1 ? "blank sheet with tab" : "blank sheet (fading in)",
        x: b.x, y: b.y, w: b.w, h: b.h,
        tone: "neutral paper, white hairline; blue only on the tab mark and one word",
        note: "not money: no figure, so area means nothing. Next it becomes the year's military budget sheet in Redistribute.",
      });
    },
  });
})();
