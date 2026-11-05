/* S00 · HERO · LOCK · 1.0 screen
   The title sits on a classified file. Brackets hunt the file and lock on
   one line: the live military counter. That line is the budget line S01
   pushes into. */
SB.scene({
  order: 0,
  id: "S00",
  name: "Hero",
  move: "LOCK",
  screens: 1.0,
  restrained: false,
  anchor: "#hero",
  trigger: "Load, then #hero top.",
  camera: "Still, then a push into one line.",
  reason:
    "Locking on the live military counter says which number this story follows. The hard cut lands on that same line as Chapter 01 opens.",
  frames: [
    { k: "in", p: 0, cap: "At rest on load. Brackets sit wide on the whole file." },
    { k: "mid", p: 0.5, cap: "Scroll hunts: the brackets jump to the violence rate in the copy, then on." },
    { k: "out", p: 1, cap: "Lock snaps on the live counter line. Camera pushes in. Hard cut to S01 next." },
  ],
  draw: function (c) {
    var T = c.T, TX = c.TX, S = SB.SVG, esc = SB.esc;
    var p = c.p;
    var ph = c.phone;
    // ── the file (the Sheet's first form)
    var f = ph ? { x: 16, y: 84, w: 343, h: 640 } : { x: 210, y: 128, w: 1020, h: 650 };
    var pad = ph ? 18 : 44;
    // camera: push into the counter line at the end
    var lineY = ph ? f.y + 470 : f.y + 478; // counter label top
    if (p >= 1 && !c.plate) {
      // phone: no push (the file already fills the width); lock only
      if (!ph) c.camera(1.32, f.x + f.w / 2, lineY + 52, c.W / 2, c.H * 0.46);
    }
    c.bgSvg(S.grid(0, 0, c.W, c.H, ph ? 47 : 60, { ticks: false })); // fixed to the screen, not the file
    // file tab + sheet
    c.svg(S.rect(f.x, f.y - (ph ? 22 : 28), ph ? 150 : 250, ph ? 22 : 28, { fill: T.sheet, stroke: T.sheetLine }));
    c.svg(S.sheet(f.x, f.y, f.w, f.h, { tone: "white", mode: "edge", sw: 1, opacity: 1 }));
    c.svg(S.rect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1, { fill: "none", stroke: T.sheetLine }));
    c.div(f.x + 12, f.y - (ph ? 18 : 22), null, "FILE · THE COST OF WAR", TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px");
    // header row
    c.div(f.x + pad, f.y + (ph ? 16 : 26), ph ? f.w - pad * 2 : 560,
      "<span>▚</span> " + c.copy("ACQUIRING TARGET… PATTERN RECOGNITION ONLINE", "index.html:71"),
      TX.label + ";font-size:" + (ph ? 10 : 12) + "px");
    if (!ph) c.div(f.x + f.w - pad - 300, f.y + 26, 300,
      c.label("BLUEPRINT × STUDIOEX", "credit lockup, white"),
      TX.labelW + ";text-align:right");
    c.svg(S.line(f.x + pad, f.y + (ph ? 40 : 58), f.x + f.w - pad, f.y + (ph ? 40 : 58), { stroke: T.rule }));
    // title
    var tY = f.y + (ph ? 64 : 92);
    c.div(f.x + pad, tY, f.w - pad * 2,
      c.copy("THE", "index.html:76") + "<br>" + c.copy("COST OF WAR", "index.html:77"),
      TX.title + ";font-size:" + (ph ? 46 : 104) + "px");
    // copy with the violence rate, labelled as violence
    var subY = f.y + (ph ? 186 : 330);
    var rate = c.fig("VIOLENCE_PER_SECOND", "usd");
    c.div(f.x + pad, subY, ph ? f.w - pad * 2 : 600,
      c.copy("Every second, violence costs humanity ", "index.html:80") +
        '<b style="color:#fff;font-weight:600">' + rate + "</b>" +
        c.copy(". This page cross-references what we spend on destruction against what that same money could build.", "index.html:80-82"),
      TX.body + ";font-size:" + (ph ? 16 : 20) + "px");
    c.div(f.x + pad, subY + (ph ? 128 : 96), null, c.label("VIOLENCE · PER SECOND · IEP GPI 2026", "source label"),
      TX.src + ";font-size:" + (ph ? 10 : 11) + "px");
    // the live counter line: the one red mark
    var cy = lineY;
    var live = c.sample(SB.FMT.usd(SB.get("MIL_PER_SECOND") * 10), "sample reading 10 s after opening = MIL_PER_SECOND × 10");
    c.svg(S.line(f.x + pad, cy - 14, f.x + f.w - pad, cy - 14, { stroke: T.rule }));
    c.div(f.x + pad, cy, ph ? f.w - pad * 2 : 640,
      c.copy("Since you opened this file, the world has spent", "index.html:86"),
      TX.labelW + ";font-size:" + (ph ? 10 : 12) + "px");
    c.div(f.x + pad, cy + (ph ? 34 : 28), null, live,
      TX.value + ";font-size:" + (ph ? 40 : 72) + "px;color:" + T.red);
    c.div(f.x + pad, cy + (ph ? 84 : 112), null,
      c.copy("on its militaries", "index.html:89") + ' &nbsp;<span style="' + TX.src + '">· SIPRI 2026 · RUNNING</span>',
      TX.bodySm + ";font-size:" + (ph ? 14 : 16) + "px");
    // scroll cue
    c.div(f.x, f.y + f.h + (ph ? 14 : 22), f.w, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";text-align:center;font-size:" + (ph ? 10 : 11) + "px");
    if (ph) c.div(16, 20, 343, c.label("BLUEPRINT × STUDIOEX", "credit lockup, white"), TX.labelW + ";font-size:10px");

    // ── brackets: hunt (scroll-driven), then lock
    if (!c.plate) {
      var bx;
      if (p < 0.34) bx = { x: f.x - 10, y: f.y - 10, w: f.w + 20, h: f.h + 20, tag: "SCANNING" };
      else if (p < 0.9)
        bx = ph ? { x: f.x + pad - 8, y: subY - 6, w: f.w - pad * 2 + 16, h: 60, tag: "SCANNING" }
                : { x: f.x + pad - 10, y: subY - 8, w: 620, h: 40, tag: "SCANNING" };
      else
        bx = ph ? { x: f.x + pad - 8, y: cy - 8, w: f.w - pad * 2 + 16, h: 116, tag: "LOCKED · MILITARY SPENDING" }
                : { x: f.x + pad - 12, y: cy - 10, w: 560, h: 150, tag: "LOCKED · MILITARY SPENDING" };
      c.svg(S.brackets(bx.x, bx.y, bx.w, bx.h, { len: ph ? 14 : 22, sw: p >= 0.9 ? 2 : 1.5 }));
      var tagY = p >= 0.34 && p < 0.9 ? bx.y - 24 : bx.y + bx.h + 6; // scanning tag sits above, clear of the copy
      c.div(bx.x, tagY, null, c.label(bx.tag, "bracket tag"), TX.labelW + ";font-size:10px;background:#0A0A0A;padding:2px 6px");
      if (p >= 0.9) c.flag("decision", "Lock target: the live military counter. Print $91,546/s beside it? It is in data.js (MIL_PER_SECOND) but not yet on the page.");
    }
    c.chrome({ labels: false });
    c.state({ form: "file", x: f.x, y: f.y, w: f.w, h: f.h, tone: "neutral", note: p >= 1 ? "camera pushed onto the counter line" : "file at rest" });
  },
});
