/* S01 · THE LINE · PUSH · 1.0 screen
   The locked counter line becomes the year's budget line. The camera
   pushes until that line becomes the Sheet: $2.89T at full frame. */
SB.scene({
  order: 1,
  id: "S01",
  name: "The Line",
  move: "PUSH",
  screens: 1.0,
  restrained: false,
  anchor: "#machine",
  trigger: "#machine top.",
  camera: "Push until one budget line fills the screen.",
  reason:
    "The per-second counter becomes the year's total, so the reader sees one number grow into the object the story follows. Next, a hard cut drops to the smallest rung so scale can be rebuilt from the bottom.",
  frames: [
    { k: "in", p: 0, cap: "Hard cut lands on the locked line, now the year's budget line." },
    { k: "mid", p: 0.5, cap: "The camera pushes. The red rule thickens into a band: the line becoming a sheet." },
    { k: "out", p: 1, cap: "The Sheet fills the frame: $2.89T. Hard cut to the smallest rung next." },
  ],
  draw: function (c) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var p = c.plate ? 1 : c.p;
    var ph = c.phone;
    var st = c.stage; // desktop: full frame; phone: 343 × 500 visual
    var defence = c.fig("DEFENCE", "T");
    var label = c.fig("machineData[0].name", "raw").toUpperCase();

    // Band height grows from a 2px rule to the full stage (log-ish ease by scroll, no time).
    var lineY = st.y + st.h * (ph ? 0.5 : 0.52);
    var t = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
    var bandH = 2 + (st.h - 2) * t * t;
    var bandY = lineY - (lineY - st.y) * t * t;
    if (p === 0 || bandH <= 3) {
      // the ledger line
      var lx = st.x + (ph ? 0 : 120), lw = st.w - (ph ? 0 : 240);
      c.svg(S.line(lx, lineY, lx + lw, lineY, { stroke: T.red, "stroke-width": 2 }));
      c.div(lx, lineY - (ph ? 36 : 44), ph ? 200 : 520, label + " · " + c.prose("2025", "machineData[0].sum"), TX.labelW + ";font-size:" + (ph ? 10 : 13) + "px");
      c.div(lx + lw - (ph ? 160 : 400), lineY - (ph ? 52 : 84), ph ? 160 : 400, defence, TX.value + ";text-align:right;font-size:" + (ph ? 40 : 76) + "px");
      c.div(lx, lineY + 14, null, c.label("SIPRI 2026"), TX.src);
      c.state({ form: "line", x: lx, y: lineY, w: lw, h: 2, tone: "red", note: "budget line, 2px red rule" });
    } else {
      c.svg(S.sheet(st.x, bandY, st.w, bandH, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
      c.state({ form: p >= 1 ? "sheet (full frame)" : "band", x: st.x, y: Math.round(bandY), w: st.w, h: Math.round(bandH), tone: "red edge, neutral paper", note: "area = DEFENCE at the frame's fit" });
      // spec figure inside the sheet
      var sx = st.x + (ph ? 20 : 120), sy = bandY + (ph ? 24 : 110);
      if (bandH > (ph ? 160 : 260)) {
        c.svg(S.line(sx, sy, sx + (ph ? 300 : 620), sy, { stroke: "rgba(255,255,255,0.3)" }));
        c.div(sx, sy + 12, ph ? 300 : 620, label + " · " + c.prose("2025", "machineData[0].sum"), TX.label + ";font-size:" + (ph ? 10 : 13) + "px");
        c.div(sx - (ph ? 2 : 6), sy + (ph ? 36 : 44), null, defence, TX.giant + ";font-size:" + (ph ? 76 : 188) + "px");
        c.div(sx, sy + (ph ? 116 : 236), ph ? 300 : 700,
          c.fig("globalContext.milPctGDP", "pct") + " " + c.copy("of everything it produces", "index.html:181"),
          TX.value + ";font-weight:400;color:" + T.grey + ";font-size:" + (ph ? 18 : 34) + "px");
      } else {
        c.div(sx, bandY + bandH / 2 - (ph ? 22 : 40), null, defence, TX.value + ";font-size:" + (ph ? 40 : 76) + "px");
      }
      // numbered callouts (desktop column / phone rows), only once the sheet is up
      if (p >= 1 && !ph) {
        var us = c.fig("topSpenders[0].amt", "B");
        var eu = c.prose("14%", "machineData[0].detail", "Europe's rise");
        {
          var cx = st.x + st.w - 470, cy0 = st.y + 470;
          [["01", c.label("UNITED STATES"), us], ["02", c.label("EUROPE"), "+" + eu]].forEach(function (r, i) {
            var y = cy0 + i * 110;
            c.svg(S.line(cx, y, cx + 350, y, { stroke: "rgba(255,255,255,0.3)" }));
            c.div(cx, y + 10, 40, r[0], TX.labelW + ";font-size:12px");
            c.div(cx + 44, y + 10, 300, r[1], TX.label + ";font-size:12px");
            c.div(cx + 44, y + 32, 300, r[2], TX.value + ";font-size:48px");
          });
          c.div(cx, cy0 + 220, 350, c.label("SIPRI 2026 ↗"), TX.src);
        }
      }
    }

    // ── text: Chapter 01 intro
    if (!ph) {
      var tx = 120, ty = p >= 1 ? 52 : 92;
      if (p < 1) {
        c.div(tx, ty, 600, c.copy("Chapter 01 · The Machine", "index.html:177").toUpperCase(), TX.labelW);
        c.div(tx, ty + 30, 900, c.copy("What we spend on war", "index.html:178").toUpperCase(), TX.title + ";font-size:64px");
      }
      if (p >= 0.5) {
        var intro =
          c.copy("2025 was the eleventh straight record year.", "index.html:180") + " " +
          c.copy("The world now spends ", "index.html:180") + c.fig("globalContext.milPctGDP", "pct") +
          c.copy(" of everything it produces on its militaries, the highest share since ", "index.html:181") +
          c.prose("2009", "machineData[0].sum") + ".";
        var iy = p >= 1 ? st.y + st.h - 210 : st.y + st.h - 180;
        c.div(tx + (p >= 1 ? 0 : 0), iy, 640, intro, TX.body + (p >= 1 ? ";font-size:18px" : ""));
        c.flag("copy", "“eleventh straight record year”: data.js:47 says “11th consecutive year of growth”. Copy fix needs approval.");
      }
    } else {
      var tb = c.textBox;
      if (p < 0.5) {
        c.div(tb.x, tb.y, tb.w, c.copy("Chapter 01 · The Machine", "index.html:177").toUpperCase(), TX.labelW + ";font-size:11px");
        c.div(tb.x, tb.y + 24, tb.w, c.copy("What we spend on war", "index.html:178").toUpperCase(), TX.title + ";font-size:32px");
      } else if (p < 1) {
        c.div(tb.x, tb.y, tb.w,
          c.copy("2025 was the eleventh straight record year.", "index.html:180") + " " +
          c.copy("The world now spends ", "index.html:180") + c.fig("globalContext.milPctGDP", "pct") +
          c.copy(" of everything it produces on its militaries.", "index.html:181"),
          TX.bodySm);
        c.flag("copy", "“eleventh straight record year”: data.js:47 says “11th consecutive year of growth”. Copy fix needs approval.");
      } else {
        var us2 = c.fig("topSpenders[0].amt", "B");
        var eu2 = c.prose("14%", "machineData[0].detail", "Europe's rise");
        c.div(tb.x, tb.y, tb.w,
          c.copy("The US alone spent ", "index.html:197") + '<b style="color:#fff">' + us2 + "</b>" +
          c.copy("; Europe surged ", "index.html:197") + '<b style="color:#fff">' + eu2 + "</b>.",
          TX.bodySm);
        c.div(tb.x, tb.y + 62, tb.w, c.label("SIPRI 2026 ↗"), TX.src);
      }
    }
    c.chrome();
  },
  // No-motion plate: the end state with every figure of the scene shown.
  plate: function (c) {
    this.draw(c);
    if (c.phone) {
      // the intro is not in the phone end frame; the plate adds it below the stage text
      c.div(c.textBox.x, c.textBox.y + 96, c.textBox.w,
        c.copy("2025 was the eleventh straight record year.", "index.html:180"), c.TX.bodySm + ";font-size:14px;color:" + c.T.grey);
    }
  },
});
