/* S06 · THE TURN · PULL WIDE · 1.5 screens
   S05's drawing has shrunk into a corner of the $2.89T sheet. The camera
   pulls wide and rises, so the paper leans back like a sheet on a table:
   the ladder sinks into the near corner and the $21.8T sheet runs away to a
   far edge high in the frame, its figure printed across it. Every earlier
   rung stays, labelled by numbered callouts on leader lines. Area uses
   machineData[3].amtB; the label prints machineData[3].amt ("$21.8T"), as
   the live page does. Every sheet lies in the one tilted plane, so their
   areas stay true to each other in the plane; a small plan inset shows the
   same sheets flat, without perspective.
   Main frames: the brief's version (rungs nested in the corner).
   Alt B: the audit's version ($21.8T beside the ladder, not around it). */
(function () {
  "use strict";

  var RAD = Math.PI / 180;
  // The ladder rungs carried in from S02, largest first. Tones per brief §8.
  var RUNGS = [
    { path: "DEFENCE", fmt: "T", name: "machineData[0].name", tone: "red" },
    { path: "topSpenders[0].amt", fmt: "B", name: "topSpenders[0].name", tone: "red" },
    { path: "machineData[1].amtB", fmt: "B", name: "machineData[1].name", tone: "red" },
    { path: "issueData[0].cost", fmt: "B", name: "issueData[0].name", tone: "blue" },
  ];
  var BIG = "machineData[3].amtB"; // area only
  var BIG_LABEL = "machineData[3].amt"; // "$21.8T", the page's own string
  var ADV = 3.55; // Archivo Black advance of a six-character figure such as "$2.89T", in ems

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { t = clamp(t); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ── The camera: a mirror of sb.js's c.tilt (perspective, rotateX, rotateY,
     rotateZ about the frame centre), so flat marginalia can point into the
     tilted paper and the overlay's tracking box can sit on it. */
  function tiltMap(c, o) {
    o = Object.assign({ rx: 0, ry: 0, rz: 0, persp: 1600 }, o || {});
    var d = o.persp, ox = c.W / 2, oy = c.H / 2;
    var a = o.rx * RAD, b = o.ry * RAD, g = o.rz * RAD;
    var ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cg = Math.cos(g), sg = Math.sin(g);
    var R00 = cb * cg, R01 = -cb * sg;
    var R10 = ca * sg + sa * sb * cg, R11 = ca * cg - sa * sb * sg;
    var R20 = sa * sg - ca * sb * cg, R21 = sa * cg + ca * sb * sg;
    var flat = !o.rx && !o.ry && !o.rz;
    var m = {
      o: o, flat: flat,
      to: function (x, y) {
        var u = x - ox, v = y - oy, w = 1 - (R20 * u + R21 * v) / d;
        return { x: ox + (R00 * u + R01 * v) / w, y: oy + (R10 * u + R11 * v) / w, s: 1 / w };
      },
      from: function (X, Y) {
        var xp = X - ox, yp = Y - oy;
        var a11 = R00 + (xp * R20) / d, a12 = R01 + (xp * R21) / d, a21 = R10 + (yp * R20) / d, a22 = R11 + (yp * R21) / d;
        var det = a11 * a22 - a12 * a21;
        return { x: ox + (xp * a22 - a12 * yp) / det, y: oy + (a11 * yp - a21 * xp) / det };
      },
      quad: function (r) { return [m.to(r.x, r.y), m.to(r.x + r.w, r.y), m.to(r.x + r.w, r.y + r.h), m.to(r.x, r.y + r.h)]; },
      // on-screen length of a world step along x at a world point (the local scale there)
      scaleAt: function (x, y) { var p0 = m.to(x, y), p1 = m.to(x + 100, y); return Math.hypot(p1.x - p0.x, p1.y - p0.y) / 100; },
      apply: function () { if (!flat) c.tilt(o); },
    };
    return m;
  }
  function bounds(pts, v) {
    var xs = pts.map(function (q) { return q.x; }), ys = pts.map(function (q) { return q.y; });
    var x0 = Math.max(v.x, Math.min.apply(null, xs)), x1 = Math.min(v.x + v.w, Math.max.apply(null, xs));
    var y0 = Math.max(v.y, Math.min.apply(null, ys)), y1 = Math.min(v.y + v.h, Math.max.apply(null, ys));
    return { x: Math.round(x0), y: Math.round(y0), w: Math.round(Math.max(0, x1 - x0)), h: Math.round(Math.max(0, y1 - y0)) };
  }
  // Phone: the world is clipped to the stage. Under a tilt the clip is the stage
  // carried back into the world, so on screen it is still the stage rectangle.
  function clipOn(c, id, tm) {
    if (!c.phone) return;
    var s = c.stage;
    var pts = [[s.x, s.y], [s.x + s.w, s.y], [s.x + s.w, s.y + s.h], [s.x, s.y + s.h]].map(function (q) {
      var w = tm.from(q[0], q[1]);
      return w.x.toFixed(1) + "," + w.y.toFixed(1);
    });
    c.svg('<defs><clipPath id="' + id + '"><polygon points="' + pts.join(" ") + '"/></clipPath></defs><g clip-path="url(#' + id + ')">');
  }
  function clipOff(c) { if (c.phone) c.svg("</g>"); }

  // S05's engineering drawing, parked in a corner: grey line art only.
  function drawing(x, y, w, S, T) {
    var h = w * 0.5, cy = y + h * 0.42, st = { stroke: T.grey, "stroke-width": 1, fill: "none" };
    var bx = x + w * 0.16, bw = w * 0.6, bh = h * 0.26;
    var s = "";
    s += S.line(x, cy, x + w, cy, { stroke: T.grey, "stroke-dasharray": "6 3 1 3", opacity: 0.6 });
    s += S.rect(bx, cy - bh / 2, bw, bh, st);
    s += S.path("M" + (bx + bw) + " " + (cy - bh / 2) + " Q" + (x + w * 0.92) + " " + (cy - bh / 2) + " " + (x + w * 0.97) + " " + cy +
      " Q" + (x + w * 0.92) + " " + (cy + bh / 2) + " " + (bx + bw) + " " + (cy + bh / 2), st);
    s += S.path("M" + bx + " " + (cy - bh / 2) + " L" + (x + w * 0.04) + " " + (cy - bh * 1.15) + " L" + (x + w * 0.04) + " " + (cy - bh / 2) +
      " M" + bx + " " + (cy + bh / 2) + " L" + (x + w * 0.04) + " " + (cy + bh * 1.15) + " L" + (x + w * 0.04) + " " + (cy + bh / 2), st);
    for (var i = 1; i < 4; i++) s += S.line(bx + (bw * i) / 4, cy - bh / 2, bx + (bw * i) / 4, cy + bh / 2, { stroke: T.grey, opacity: 0.5 });
    var dy = y + h * 0.9;
    s += S.line(bx, dy, x + w * 0.97, dy, { stroke: T.grey, opacity: 0.7 });
    s += S.line(bx, dy - 4, bx, dy + 4, { stroke: T.grey }) + S.line(x + w * 0.97, dy - 4, x + w * 0.97, dy + 4, { stroke: T.grey });
    return s;
  }
  // Where the parked drawing sits on the $2.89T sheet, scaled with it from its corner anchor.
  function parkedDrawing(c, ax, ay, k) {
    var st = c.stage;
    var d0 = c.phone ? { x: st.x + st.w - 128, y: st.y + 168, w: 108 } : { x: 1150, y: 78, w: 220 };
    c.svg(drawing(ax + (d0.x - st.x) * k, ay - (st.y + st.h - d0.y) * k, d0.w * k, SB.SVG, c.T));
  }

  function toneCol(c, t) { return t === "blue" ? c.T.blue : t === "red" ? c.T.red : c.T.grey; }
  function rungs(c, fit, box) {
    return RUNGS.map(function (R) {
      return { r: c.rung(R.path, fit, box, "bl"), tone: R.tone, value: c.fig(R.path, R.fmt), name: c.fig(R.name, "raw").toUpperCase() };
    });
  }
  // Paper with weight: hairline edges under a sheet's near and right sides, catching the light.
  function ream(c, r, gap) {
    var S = SB.SVG, s = "";
    for (var i = 2; i >= 1; i--) {
      var d = i * gap;
      s += S.path("M" + (r.x + d) + " " + (r.y + r.h + d) + " H" + (r.x + r.w + d) + " V" + (r.y + d), { stroke: "rgba(255,255,255," + (0.18 - i * 0.05).toFixed(2) + ")", fill: "none" });
    }
    c.svg(s);
  }
  function drawRungs(c, list) {
    list.forEach(function (it, i) {
      var r = it.r;
      c.svg(SB.SVG.sheet(r.x, r.y, r.w, r.h, { tone: it.tone, mode: "edge", sw: i === 0 ? 1.5 : 1.25, tab: i === 0, tabSize: c.phone ? 6 : 8, flat: i > 0 }));
    });
  }
  // A figure printed on the paper itself (SVG, so it tilts with the sheet and the phone clip holds it).
  function printed(c, x, y, s, size, o) {
    o = o || {};
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-family="' + c.F.display + '" font-size="' + size.toFixed(1) + '" letter-spacing="-0.02em" fill="' + c.T.white + '"' +
      (o.opacity != null ? ' opacity="' + o.opacity + '"' : "") + ">" + s + "</text>";
  }
  // Size a printed figure so it spans `w` px on screen from world point (x, y).
  function printedSize(tm, x, y, w) { return w / (ADV * tm.scaleAt(x, y)); }
  // Registration mark (paper device): a ring and a cross.
  function reg(x, y, r) {
    var S = SB.SVG, col = "rgba(255,255,255,0.42)";
    return S.circle(x, y, r, { fill: "none", stroke: col }) + S.line(x - r * 1.8, y, x + r * 1.8, y, { stroke: col }) + S.line(x, y - r * 1.8, x, y + r * 1.8, { stroke: col });
  }

  /* ── Marginalia: flat, on the fixed layer, pointing into the tilted plane ── */
  // A numbered callout: boxed number, value, mono name. Returns where its leader lands.
  function callout(c, x, y, n, it, o) {
    var S = SB.SVG, TX = c.TX;
    o = o || {};
    var vs = o.vs || 20, ls = o.ls || 11, nb = c.phone ? 15 : 18;
    c.uiSvg(S.rect(x + 0.5, y + 2.5, nb, nb, { fill: "none", stroke: "rgba(255,255,255,0.7)" }));
    c.uiDiv(x, y + (c.phone ? 4 : 5), nb + 1, c.label(pad2(n), "callout number"), TX.labelW + ";font-size:10px;letter-spacing:0;text-align:center;line-height:1");
    c.uiSvg(S.rect(x + nb + 7, y + 7, 7, 7, { fill: "none", stroke: toneCol(c, it.tone), "stroke-width": 1.5 }));
    c.uiDiv(x + nb + 20, y, o.w || 260, it.value, TX.value + ";font-size:" + vs + "px");
    c.uiDiv(x + nb + 20, y + vs + 4, o.w || 260, it.name, TX.label + ";font-size:" + ls + "px" + (o.tight ? ";letter-spacing:0.06em" : ""));
    return { x: x - 3, y: y + nb / 2 + 2.5 };
  }
  function lead(c, from, to, elbow) {
    c.uiSvg(SB.SVG.leader([[from.x, from.y], [to.x - (elbow == null ? 18 : elbow), to.y], [to.x, to.y]], { color: "rgba(255,255,255,0.5)" }));
  }
  // Callout rows level with their leaders' corners, pushed apart to a minimum gap, kept inside [y0, y1].
  function rows(corners, gap, y0, y1, lift) {
    var ys = corners.map(function (q) { return q.y - (lift || 10); });
    for (var i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + gap);
    var over = ys[ys.length - 1] - y1;
    if (over > 0) ys = ys.map(function (y) { return y - over; });
    if (ys[0] < y0) { var d = y0 - ys[0]; ys = ys.map(function (y) { return y + d; }); }
    return ys;
  }
  // Screen x of a world rect's right edge at screen height sy (the edge is a straight line on screen).
  function edgeX(tm, r, sy) {
    var a = tm.to(r.x + r.w, r.y), b = tm.to(r.x + r.w, r.y + r.h);
    return a.x + ((sy - a.y) * (b.x - a.x)) / (b.y - a.y || 1);
  }
  // Left x for a callout so its widest line stops short of a sheet's right edge (mono label ≈ 0.74em a character).
  function fitLeftOf(c, tm, r, y, it, o, want) {
    var nb = c.phone ? 15 : 18, ls = o.ls || 11, vs = o.vs || 20;
    var wText = Math.max(String(it.name).length * ls * 0.74, String(it.value).length * vs * 0.62);
    var xr = Math.min(edgeX(tm, r, y), edgeX(tm, r, y + vs + 4 + ls * 1.35));
    return Math.min(want, xr - 14 - (nb + 20) - wText);
  }
  // A legend rail (phone, where leaders would cross): numbered rows stacked over the ladder, tied to it by one rule.
  function rail(c, list, x, y, w, gap, toY) {
    var S = SB.SVG;
    list.forEach(function (it, i) { callout(c, x + 8, y + i * gap, i + 1, it, { vs: 14, ls: 10, w: w, tight: true }); });
    c.uiSvg(S.line(x, y + 4, x, toY, { stroke: "rgba(255,255,255,0.45)" }) + S.rect(x - 2.5, toY - 2.5, 5, 5, { fill: c.T.white }));
  }
  // FIG chip: a small white tab on a box's top-left corner.
  function figChip(c, x, y, text) {
    var w = text.length * 7.3 + 12;
    c.uiSvg(SB.SVG.rect(x, y - 15, w, 15, { fill: c.T.white }));
    c.uiDiv(x + 6, y - 13, w, text, c.TX.label + ";font-size:10px;color:" + c.T.ground + ";letter-spacing:0.1em;font-weight:600;white-space:nowrap");
  }
  /* PLAN inset: the same sheets drawn flat, no perspective, so the eye can check
     true area against the tilted view. The big sheet fills the box. */
  function planInset(c, box, sheets, chip) {
    var S = SB.SVG, T = c.T;
    var s = S.rect(box.x, box.y, box.w, box.h, { fill: T.ground, opacity: 0.9 });
    sheets.forEach(function (sh) { s += S.sheet(sh.x, sh.y, sh.w, sh.h, { tone: sh.tone, mode: "outline", sw: 1 }); });
    s += S.rect(box.x - 6.5, box.y - 6.5, box.w + 13, box.h + 13, { fill: "none", stroke: T.white, "stroke-width": 1 });
    c.uiSvg(s);
    figChip(c, box.x - 7, box.y - 7, chip);
  }

  function texts(c) {
    var T = c.T;
    return {
      cA: c.copy("That was the cost to the states that spend it.", "index.html:552"),
      cB: c.copy("This is what it costs everyone.", "index.html:554"),
      bigVal: c.fig(BIG_LABEL, "raw"),
      bigName: c.fig("machineData[3].name", "raw").toUpperCase(),
      pct: c.fig("globalContext.violencePctGDP", "pct") + " " + c.copy("of world GDP", "index.html:212"),
      per: c.copy("about ", "index.html:213") + '<b style="color:' + T.white + ';font-weight:600">' + c.fig("globalContext.violencePerPerson", "usd") + "</b>" + c.copy(" taken from every person alive", "index.html:213"),
      iep: c.label("IEP GPI 2026 ↗"),
    };
  }
  // Lower third: a short white rule, then lines of text, flat on the screen.
  function lowerThird(c, x, y, w, rows) {
    c.uiSvg(SB.SVG.line(x, y, x + 44, y, { stroke: c.T.white, "stroke-width": 1.5 }));
    var at = y + 12;
    rows.forEach(function (r) { c.uiDiv(x, at, w, r.html, r.style); at += r.h; });
  }

  /* Camera keyframes. corner: where the shared bottom-left corner lands on screen.
     Z: the world size of "one frame" at the current fit (how close the camera is). */
  var CAM = {
    desk: [
      { rx: 0, rz: 0, persp: 1000, corner: [0, 900], Z: 1 },
      { rx: 21, rz: -2.5, persp: 1000, corner: [104, 676], Z: 0.96 },
      { rx: 40, rz: -5, persp: 900, corner: [110, 650], Z: 0.9 },
    ],
    phone: [
      { rx: 0, rz: 0, persp: 900, corner: [16, 556], Z: 1 },
      { rx: 18, rz: -2.5, persp: 900, corner: [24, 524], Z: 0.9 },
      { rx: 32, rz: -4, persp: 800, corner: [30, 506], Z: 1.0 },
    ],
  };
  function camAt(c, p) {
    var K = CAM[c.phone ? "phone" : "desk"];
    var a = p <= 0.5 ? K[0] : K[1], b = p <= 0.5 ? K[1] : K[2], t = ease(p <= 0.5 ? p / 0.5 : (p - 0.5) / 0.5);
    return {
      rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t), persp: lerp(a.persp, b.persp, t),
      corner: [lerp(a.corner[0], b.corner[0], t), lerp(a.corner[1], b.corner[1], t)], Z: lerp(a.Z, b.Z, t),
    };
  }

  SB.scene({
    order: 6,
    id: "S06",
    name: "The Turn",
    move: "PULL WIDE",
    screens: 1.5,
    restrained: false,
    anchor: null,
    trigger: "End of S05: the drawing has shrunk into the top-right corner of the $2.89T sheet.",
    camera: "Continuous pull-out, log-linear in scale, from $2.89T at full frame to $21.8T. As it pulls, the camera rises and the paper leans back (to 40°, a slight turn), so the ladder sinks into the near corner and the $21.8T sheet runs away to a far edge high in the frame. Every rung keeps the shared bottom-left corner, in the one plane.",
    reason:
      "Pulling wide past $2.89T moves the story from what states choose to spend to what violence costs everyone: a second, larger measure, with every earlier sheet still in view for scale (never as a share of it: open decision 2). Next the $21.8T sheet tips back into a map, so the story moves from one global total to real places.",
    frames: [
      { k: "in", p: 0, cap: "Entry. $2.89T fills the frame, its figure printed large on the paper. S05's drawing is parked in its top-right corner. $954B, $119B and $40B sit nested at the shared corner, numbered. The first caption sits as a lower third." },
      { k: "mid", p: 0.5, cap: "The camera pulls wide and the paper starts to lean back. Every rung sinks toward the near corner, its label out on a numbered leader. The paper runs on past the frame: a larger sheet. The first caption gives way to the second." },
      { k: "out", p: 1, cap: "$21.8T: a vast sheet leaning back to a far edge, its figure printed across it. $2.89T is the sheet in the near corner, every rung still numbered. A plan inset shows all of them flat, at true area. Next, the sheet tips back into a map." },
    ],
    alts: [
      {
        k: "B",
        label: "Beside, not around (audit recommendation)",
        frames: ["mid", "out"],
        note: "Open decision 2 (audit 15.2b, F11). IEP's $21.8T is a different measure from SIPRI's $2.89T: purchasing-power dollars with a multiplier. Nesting reads as 'part of'. Here the camera pulls the ladder back to one side and the $21.8T sheet arrives beside it on a shared baseline, at the same scale, with a different-measure label; both lean back in one plane. $2.89T never morphs into a 45% slice. 'in' is the same as the main frames.",
      },
    ],

    draw: function (c) {
      var T = c.T, TX = c.TX, S = SB.SVG;
      var p = c.plate ? 1 : c.p;
      var ph = c.phone;
      var st = c.stage;
      c.flag("data", "$21.8T: area uses machineData[3].amtB (21810); the label prints machineData[3].amt ('$21.8T'), never '$21.81T' (audit F08).");
      c.flag("data", "10.5% is shown on its own. Never set it beside S01's 2.5%: they are shares of different GDP bases (audit F10).");
      if (c.alt === "B") return drawAltB(c, p);
      c.flag("decision", "Open decision 2: the brief nests $2.89T inside $21.8T, which reads as 'part of' (audit 15.2b). Alt B sets $21.8T beside the ladder on a shared baseline. Choose before phase 3.");

      var cam = camAt(c, p);
      var tm = tiltMap(c, { rx: cam.rx, rz: cam.rz, persp: cam.persp });
      tm.apply();
      var A = tm.from(cam.corner[0], cam.corner[1]); // the shared corner, in the world
      var box = { x: A.x, y: A.y - st.h * cam.Z, w: st.w * cam.Z, h: st.h * cam.Z };
      var fit = SB.fitBetween(SB.get("DEFENCE"), SB.get(BIG), p);
      var big = c.rung(BIG, fit, box, "bl");
      var list = rungs(c, fit, box);
      var r29 = list[0].r, r9 = list[1].r;
      var x = texts(c);
      var view = ph ? st : { x: 0, y: 0, w: c.W, h: c.H };

      // ── the paper, all in one plane
      clipOn(c, "s06clip", tm);
      if (p > 0) {
        ream(c, big, ph ? 3 : 4);
        c.svg(S.sheet(big.x, big.y, big.w, big.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
        c.svg(reg(big.x + (ph ? 22 : 40), big.y + (ph ? 22 : 40), ph ? 6 : 10));
      } else ream(c, r29, 3);
      drawRungs(c, list);
      parkedDrawing(c, A.x, A.y, r29.w / st.w);
      var pr = null;
      if (p >= 1) {
        // $21.8T printed across the far paper, just beyond the ladder: the monument on the plane
        var sx0 = ph ? st.x + 14 : 236, sy0 = ph ? st.y + 262 : 352;
        var P0 = tm.from(sx0, sy0), size = printedSize(tm, P0.x, P0.y, ph ? 284 : 960);
        c.svg(printed(c, P0.x, P0.y, x.bigVal, size, { opacity: 0.96 }));
        pr = { at: P0, size: size };
      } else if (p > 0) {
        // the $2.89T figure stays printed on its own sheet as it sinks into the corner
        var hTop = r29.h - r9.h; // the strip of $2.89T paper above $954B
        // phone: the figure spans the sheet, so its baseline stays above the parked drawing's top (a third of the way down)
        var base = ph ? Math.min(hTop * 0.88, r29.h * 0.31) : hTop * 0.88;
        c.svg(printed(c, r29.x + r29.w * 0.05, r29.y + base, list[0].value, Math.min(hTop * 0.66, (r29.w * 0.9) / ADV), { opacity: 0.94 }));
      }
      clipOff(c);

      var corners = list.map(function (it) { return tm.to(it.r.x + it.r.w, it.r.y); }); // each rung's top-right corner on screen
      var tag = c.label("SIPRI 2026");

      if (!ph) {
        if (p === 0) {
          // ── in: the sheet is the frame; its figure printed huge on it
          c.svg(S.line(120, 78, 760, 78, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(120, 88, 700, list[0].name + " · " + tag, TX.label + ";font-size:13px");
          c.div(106, 114, null, list[0].value, TX.giant + ";font-size:248px");
          callout(c, 72, r9.y + 26, 2, list[1], { vs: 36, ls: 12 });
          var c3 = callout(c, 372, list[2].r.y - 22, 3, list[2], { vs: 22 });
          var c4 = callout(c, 372, list[3].r.y - 2, 4, list[3], { vs: 22 });
          lead(c, corners[2], c3, 34);
          lead(c, corners[3], c4, 34);
          lowerThird(c, 900, 676, 470, [
            { html: x.cA, style: TX.value + ";font-weight:400;font-size:36px;line-height:1.2;color:" + T.white, h: 100 },
            { html: tag, style: TX.src, h: 20 },
          ]);
        } else if (p < 1) {
          // ── mid: the 'in' layout carried into the tilt: 01's label printed over its figure, 02 inside its
          // own sheet, 03 and 04 on short leaders into 02's open paper. Nothing has left the paper yet.
          var lb = tm.to(r29.x + r29.w * 0.055, r29.y + (r29.h - r9.h) * 0.12);
          c.uiDiv(lb.x, lb.y, 520, c.label(pad2(1), "callout number") + " · " + list[0].name + " · " + tag, TX.label + ";font-size:12px;color:" + T.white);
          var m2 = tm.to(r9.x + r9.w * 0.07, r9.y + r9.h * 0.1);
          callout(c, m2.x, m2.y, 2, list[1], { vs: 28, ls: 11 });
          var ymq = rows([corners[2], corners[3]], 58, 300, 620, 34);
          [2, 3].forEach(function (i, j) {
            // held inside 02's open paper: the widest line stops short of 02's right edge
            var cx = fitLeftOf(c, tm, r9, ymq[j], list[i], { vs: 20 }, corners[2].x + 150 + j * 16);
            var tgt = callout(c, cx, ymq[j], i + 1, list[i], { vs: 20 });
            lead(c, corners[i], tgt, 18);
          });
          // lower thirds crossing: the first caption leaving (grey), the second arriving (white)
          lowerThird(c, 120, 708, 800, [
            { html: x.cA, style: TX.value + ";font-weight:400;font-size:22px;color:" + T.grey, h: 38 },
            { html: x.cB, style: TX.value + ";font-weight:400;font-size:38px;color:" + T.white, h: 50 },
          ]);
        } else {
          // ── out: callouts down the near paper, right of the ladder
          // rows held on the paper, above the near edge, in the corners' order so no leader crosses another
          list.forEach(function (it, i) {
            var tgt = callout(c, 724 + i * 18, Math.min(corners[0].y - 12, 360) + i * 58, i + 1, it, { vs: 19, ls: 11 });
            lead(c, corners[i], tgt, 16);
          });
          // lower third, in the dark under the near edge: spec label, caption, readings
          var rowsLT = [
            { html: x.bigName + " · " + x.iep, style: TX.label + ";font-size:12px;color:" + T.white, h: 22 },
            { html: x.cB, style: TX.value + ";font-weight:400;font-size:38px;color:" + T.white, h: 54 },
            { html: x.pct + ' <span style="color:' + T.grey + '">·</span> ' + x.per, style: TX.body, h: 30 },
          ];
          // the plate keeps both captions in reading order: the first one, small and grey, leads the lower third
          if (c.plate) rowsLT.unshift({ html: x.cA, style: TX.body + ";color:" + T.grey, h: 36 });
          lowerThird(c, 120, c.plate ? 668 : 680, 860, rowsLT);
          // plan inset: every sheet flat at true area, the big one filling the box
          var ib = { x: 1056, y: 664, w: 240, h: 150 };
          var kk = ib.w / big.w, sheets = [{ x: ib.x, y: ib.y, w: ib.w, h: ib.h, tone: "red" }];
          list.forEach(function (it) { sheets.push({ x: ib.x, y: ib.y + ib.h - it.r.h * kk, w: it.r.w * kk, h: it.r.h * kk, tone: it.tone }); });
          planInset(c, ib, sheets, c.label("FIG 06.1 · PLAN · TRUE AREA", "inset tag"));
          c.uiDiv(ib.x + ib.w - 120, ib.y + 8, 112, x.bigVal, TX.value + ";font-size:15px;text-align:right");
          c.uiDiv(ib.x + sheets[1].w + 6, ib.y + ib.h - sheets[1].h - 2, 80, list[0].value, TX.label + ";font-size:10px;color:" + T.white + ";letter-spacing:0.04em");
        }
      } else {
        var tb = c.textBox;
        if (p === 0) {
          c.svg(S.line(st.x + 16, st.y + 22, st.x + st.w - 16, st.y + 22, { stroke: "rgba(255,255,255,0.3)" }));
          c.div(st.x + 16, st.y + 30, 300, list[0].name + " · " + tag, TX.label + ";font-size:10px");
          c.div(st.x + 12, st.y + 50, null, list[0].value, TX.giant + ";font-size:90px");
          callout(c, r9.x + 12, r9.y + 14, 2, list[1], { vs: 22, ls: 10, w: r9.w - 50 });
          var qx = r9.x + r9.w + 14, qw = st.x + st.w - qx - 40;
          var d3 = callout(c, qx, list[2].r.y - 64, 3, list[2], { vs: 16, ls: 10, w: qw });
          var d4 = callout(c, qx, list[3].r.y - 4, 4, list[3], { vs: 16, ls: 10, w: qw });
          lead(c, corners[2], d3, 8);
          lead(c, corners[3], d4, 8);
          lowerThird(c, tb.x, tb.y + 6, tb.w, [
            { html: x.cA, style: TX.value + ";font-weight:400;font-size:24px;line-height:1.25;color:" + T.white, h: 72 },
            { html: tag, style: TX.src + ";font-size:10px", h: 16 },
          ]);
        } else if (p < 1) {
          var c1 = callout(c, corners[0].x + 16, corners[0].y - 12, 1, list[0], { vs: 15, ls: 10, w: st.x + st.w - corners[0].x - 54, tight: true });
          lead(c, corners[0], c1, 6);
          var m2p = tm.to(r9.x + r9.w * 0.08, r9.y + r9.h * 0.06);
          callout(c, m2p.x, m2p.y, 2, list[1], { vs: 15, ls: 10, w: 80, tight: true });
          var ymp = rows([corners[2], corners[3]], 54, st.y + 260, st.y + st.h - 84, 34);
          [2, 3].forEach(function (i, j) {
            var cx = corners[0].x + 16 + j * 3;
            var tgt = callout(c, cx, ymp[j], i + 1, list[i], { vs: 15, ls: 10, w: st.x + st.w - cx - 38, tight: true });
            lead(c, corners[i], tgt, 6);
          });
          lowerThird(c, tb.x, tb.y + 6, tb.w, [
            { html: x.cA, style: TX.value + ";font-weight:400;font-size:17px;line-height:1.3;color:" + T.grey, h: 52 },
            { html: x.cB, style: TX.value + ";font-weight:400;font-size:24px;line-height:1.25;color:" + T.white, h: 40 },
          ]);
        } else {
          // callouts down the near paper, right of the ladder. Each one sits wholly on the paper or wholly
          // under its near edge, never across it (whichever is the smaller move), still in corner order.
          var ypo = rows(corners, 40, st.y + 250, st.y + st.h - 44, 8);
          var nL = tm.to(big.x, big.y + big.h), nR = tm.to(big.x + big.w, big.y + big.h);
          var nearY = function (sx) { return nL.y + ((sx - nL.x) * (nR.y - nL.y)) / (nR.x - nL.x); };
          var hh = list.map(function (it) { return 18 + 13.5 * Math.ceil((it.name.length * 6.6) / 140); });
          list.forEach(function (it, i) {
            var cx = st.x + 166 + i * 6, eHi = Math.min(nearY(cx), nearY(cx + 175)), eLo = Math.max(nearY(cx), nearY(cx + 175));
            if (i) ypo[i] = Math.max(ypo[i], ypo[i - 1] + hh[i - 1] + 4);
            if (ypo[i] + hh[i] > eHi - 5 && ypo[i] < eLo + 7) {
              var upTo = eHi - 5 - hh[i], downTo = eLo + 8;
              var roomUp = !i || upTo >= ypo[i - 1] + hh[i - 1] + 4;
              ypo[i] = roomUp && ypo[i] - upTo <= downTo - ypo[i] ? upTo : downTo;
            }
            var tgt = callout(c, cx, ypo[i], i + 1, it, { vs: 14, ls: 10, w: 140, tight: true });
            lead(c, corners[i], tgt, 6);
          });
          // the plate keeps both captions in reading order: the first one, small and grey, above the second
          var o = c.plate ? 26 : 0;
          if (c.plate) c.uiDiv(tb.x, tb.y - 6, tb.w, x.cA, TX.bodySm + ";font-size:14px;color:" + T.grey);
          lowerThird(c, tb.x, tb.y + 6 + o, tb.w, [
            { html: x.bigName + " · " + x.iep, style: TX.label + ";font-size:10px;color:" + T.white, h: 20 },
            { html: x.cB, style: TX.value + ";font-weight:400;font-size:24px;line-height:1.25;color:" + T.white, h: 40 },
            { html: x.pct + ' <span style="color:' + T.grey + '">·</span> ' + x.per, style: TX.bodySm + ";font-size:15px", h: 52 },
          ]);
        }
      }
      c.chrome();
      // State: the big sheet's on-screen bounds (clipped to the view), so the overlay's box sits on the paper.
      var sb = p === 0 ? { x: st.x, y: st.y, w: st.w, h: st.h } : bounds(tm.quad(big), view);
      c.state({
        form: p === 0 ? "military spending sheet, full frame" : p < 1 ? "sheet pulling wide" : "violence sheet, leaning back",
        x: sb.x, y: sb.y, w: sb.w, h: sb.h,
        tone: "red edge, neutral paper",
        note: p === 0
          ? list[0].value + " is the frame; " + list[1].value + ", " + list[2].value + " (red) and " + list[3].value + " (blue) nested at the bottom-left corner; S05 drawing parked top-right"
          : "fit " + Math.round(fit) + " ($B per frame). Paper leaning back " + Math.round(cam.rx) + "°, turned " + Math.round(-cam.rz) + "°. " + list[0].value + " is " + Math.round(r29.w) + "×" + Math.round(r29.h) + " in the plane at the shared corner; every rung numbered on a leader" + (p >= 1 && !ph ? "; plan inset at true area" : "") + (pr ? "; " + x.bigVal + " printed on the paper" : ""),
      });
    },

    // No-motion plate: the end state plus the first caption, so both lines and every figure show.
    // (draw() puts the first caption, small and grey, ahead of the second when c.plate is set.)
    plate: function (c) {
      this.draw(c);
    },
  });

  // ── ALT B: $21.8T beside the ladder on one baseline, never around it; both lean back in one plane ──
  function drawAltB(c, p) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var ph = c.phone, st = c.stage;
    c.flag("decision", "Open decision 2, alt B (audit recommendation): $21.8T as a separate sheet beside the ladder, same scale, shared baseline, with a different-measure label. The main frames show the brief's nesting.");
    var lab = c.newCopy("DIFFERENT MEASURE · IEP · PURCHASING-POWER DOLLARS · INCLUDES A MULTIPLIER", "open decision 2: IEP's $21.8T uses purchasing-power dollars and a multiplier; SIPRI's $2.89T does not (audit 15.2)");
    var x = texts(c);
    var t = ease(p);
    var tm = tiltMap(c, ph ? { rx: 26 * t, rz: -3 * t, persp: 900 } : { rx: 30 * t, rz: -4 * t, persp: 1100 });
    tm.apply();
    // end layout (screen): the ladder at left, a gap, the $21.8T sheet; one baseline
    var L = ph ? { x: st.x + 4, base: st.y + 430, gap: 12, bigW: 236 } : { x: 120, base: 690, gap: 200, bigW: 820 };
    var baseNow = p >= 1 ? L.base : ph ? st.y + 440 : 676; // mid: the baseline has already risen, leaving room for the lower thirds
    var fitEnd = SB.get(BIG) * (st.w * st.h) / (L.bigW * (L.bigW * st.h / st.w));
    var fit = SB.fitBetween(SB.get("DEFENCE"), fitEnd, p);
    var B0 = tm.from(st.x + (L.x - st.x) * t, p > 0 ? baseNow : st.y + st.h);
    var ax = B0.x, ay = B0.y;
    var list = rungs(c, fit, { x: ax, y: ay - st.h, w: st.w, h: st.h });
    var r29 = list[0].r;
    var bx = r29.x + r29.w + L.gap * t + (ph ? 6 : 40) * (1 - t);
    var big = c.rung(BIG, fit, { x: bx, y: ay - st.h, w: st.w, h: st.h }, "bl");

    clipOn(c, "s06clipB", tm);
    // the shared baseline, run long in both directions so it reads as one ground line
    c.svg(S.line(ax - 3000, ay, big.x + big.w + 3000, ay, { stroke: "rgba(255,255,255,0.32)" }));
    ream(c, big, ph ? 3 : 4);
    c.svg(S.sheet(big.x, big.y, big.w, big.h, { tone: "red", mode: "edge", sw: 2, tab: true, tabSize: ph ? 8 : 12 }));
    ream(c, r29, 3);
    drawRungs(c, list);
    parkedDrawing(c, ax, ay, r29.w / st.w);
    // the big sheet's figure printed on it, sized to what is on screen of it, sitting just above the baseline
    var vis = ph ? st.x + st.w - 10 : c.W - 60;
    var pa = tm.to(big.x, ay), pb = tm.to(big.x + big.w, ay);
    var sx0 = pa.x + (ph ? 10 : p >= 1 ? 60 : 40);
    var spanW = Math.min(pb.x, vis) - sx0;
    var P0 = tm.from(sx0, pa.y - (ph ? (p >= 1 ? 150 : 40) : p >= 1 ? 250 : 60));
    var size = Math.min(printedSize(tm, P0.x, P0.y, spanW * (p >= 1 ? 0.92 : 0.9)), big.h * 0.36);
    if (spanW > 60) c.svg(printed(c, P0.x, P0.y, x.bigVal, size, { opacity: 0.95 }));
    clipOff(c);

    var corners = list.map(function (it) { return tm.to(it.r.x + it.r.w, it.r.y); });
    var baseB = tm.to(big.x, ay), baseL = tm.to(r29.x, ay);
    var view = ph ? st : { x: 0, y: 0, w: c.W, h: c.H };
    // rough wrapped height of a mono name (phone rail rows grow with their names)
    function nameLines(s, w) { return Math.max(1, Math.ceil((String(s).length * 6.8) / w)); }

    if (!ph) {
      if (p >= 1) {
        // spec label above the big sheet's far edge, on a vertical leader
        var top = tm.to(big.x + big.w * 0.36, big.y);
        lowerThird(c, top.x + 6, 92, 500, [
          { html: x.bigName + " · " + x.iep, style: TX.label + ";font-size:12px;color:" + T.white, h: 22 },
          { html: x.pct, style: TX.value + ";font-weight:400;font-size:28px;color:" + T.soft, h: 34 },
        ]);
        c.uiSvg(SB.SVG.leader([[top.x, top.y], [top.x, 92], [top.x + 6, 92]], { color: "rgba(255,255,255,0.5)" }));
        // base labels, hung under the baseline at each sheet's foot
        c.uiDiv(baseB.x + 6, baseB.y + 16, Math.min(640, c.W - baseB.x - 70), lab, TX.label + ";font-size:11px;color:" + T.white);
        c.uiDiv(baseL.x, baseL.y + 16, 200, c.label("SIPRI 2026"), TX.src);
        // ladder callouts in the gap between the two sheets, level with their corners, so no leader crosses another
        var gx = Math.max.apply(null, corners.map(function (q) { return q.x; })) + 34;
        // the last row's name stays above the shared baseline, which climbs to the right on screen
        var baseAt = function (sx) { return baseL.y + ((sx - baseL.x) * (baseB.y - baseL.y)) / (baseB.x - baseL.x); };
        // rows level with their corners where they can be; packed upward from the bottom row only as far as
        // needed, so the upper rows stay level and no leader passes through another's corner
        var wCol = Math.max(120, baseB.x - gx - 52), yMax = Math.min(632, Math.min(baseAt(gx), baseAt(gx + 190)) - 48);
        var hRow = list.map(function (it) { return 23 + 14.85 * Math.ceil((it.name.length * 8.14) / wCol); });
        var yb = corners.map(function (q) { return q.y - 14; });
        for (var k = yb.length - 1; k >= 0; k--) yb[k] = Math.min(yb[k], k === yb.length - 1 ? yMax : yb[k + 1] - hRow[k] - 10);
        list.forEach(function (it, i) {
          var tgt = callout(c, gx, yb[i], i + 1, it, { vs: 19, w: wCol });
          lead(c, corners[i], tgt, 12);
        });
        lowerThird(c, 120, 732, 700, [
          { html: x.cB, style: TX.value + ";font-weight:400;font-size:34px;color:" + T.white, h: 46 },
          { html: x.per, style: TX.body, h: 28 },
        ]);
      } else {
        // the arriving sheet: its name on a leader from its near corner
        var nb = tm.to(big.x + 30, ay - 30);
        c.uiDiv(nb.x + 30, nb.y - 150, 300, x.bigName, TX.label + ";font-size:12px;color:" + T.white);
        c.uiSvg(SB.SVG.leader([[nb.x, nb.y], [nb.x + 20, nb.y - 143], [nb.x + 26, nb.y - 143]], { color: "rgba(255,255,255,0.5)" }));
        // the ladder: 01 and 02 sit inside their own sheets; 03 and 04 on short leaders into 02's open paper
        var in1 = tm.to(r29.x + r29.w * 0.05, r29.y + r29.h * 0.07), r9 = list[1].r, in2 = tm.to(r9.x + r9.w * 0.08, r9.y + r9.h * 0.1);
        callout(c, in1.x, in1.y, 1, list[0], { vs: 30, ls: 12 });
        callout(c, in2.x, in2.y, 2, list[1], { vs: 24, ls: 11 });
        var yq = rows([corners[2], corners[3]], 56, 300, 640, 30);
        [2, 3].forEach(function (i, j) {
          // held inside 02's open paper: the widest line stops short of 02's right edge
          var cx = fitLeftOf(c, tm, r9, yq[j], list[i], { vs: 19 }, corners[2].x + 120 + j * 16);
          var tgt = callout(c, cx, yq[j], i + 1, list[i], { vs: 19 });
          lead(c, corners[i], tgt, 14);
        });
        lowerThird(c, 120, 712, 700, [
          { html: x.cA, style: TX.value + ";font-weight:400;font-size:22px;color:" + T.grey, h: 38 },
          { html: x.cB, style: TX.value + ";font-weight:400;font-size:38px;color:" + T.white, h: 50 },
        ]);
      }
    } else {
      var tb = c.textBox;
      var tl = tm.to(r29.x, r29.y);
      // legend rail stacked over the ladder (leaders would cross on a phone), tied to its corner by one rule
      var rw = p >= 1 ? 56 : 120, ry = [];
      var yy = 0;
      list.forEach(function (it) { ry.push(yy); yy += 14 + 6 + nameLines(it.name, rw) * 12 + 8; });
      var y0r = tl.y - 14 - yy;
      // out: the overlay's lock tag sits just above the big sheet's top-left, beside the rail's first row,
      // so the rail rises until its first row clears the tag
      if (p >= 1) y0r = Math.max(st.y + 6, Math.min(y0r, bounds(tm.quad(big), view).y - 26 + 2 - ry[1]));
      list.forEach(function (it, i) { callout(c, st.x + 4, y0r + ry[i], i + 1, it, { vs: 14, ls: 10, w: rw, tight: true }); });
      c.uiSvg(S.line(st.x + 1, y0r + 6, st.x + 1, tl.y - 4, { stroke: "rgba(255,255,255,0.45)" }) + S.rect(tl.x - 2.5, tl.y - 2.5, 5, 5, { fill: T.white }) +
        S.line(st.x + 1, tl.y - 4, tl.x, tl.y, { stroke: "rgba(255,255,255,0.45)" }));
      if (p >= 1) {
        // base labels hung under the baseline, clear of the lock box's lower corners
        c.uiDiv(baseB.x, baseB.y + 16, Math.min(st.x + st.w - baseB.x - 4, 200), lab, TX.label + ";font-size:10px;color:" + T.white + ";letter-spacing:0.06em");
        c.uiDiv(baseL.x, baseL.y + 16, 90, c.label("SIPRI 2026"), TX.src + ";font-size:10px");
        // the spec label, caption and readings in the text box, as in the main phone frame: on a 375px
        // screen a leader from the far edge would run under the overlay's lock tag
        lowerThird(c, tb.x, tb.y + 6, tb.w, [
          { html: x.bigName + " · " + x.iep, style: TX.label + ";font-size:10px;color:" + T.white, h: 20 },
          { html: x.cB, style: TX.value + ";font-weight:400;font-size:24px;line-height:1.25;color:" + T.white, h: 40 },
          { html: x.pct + ' <span style="color:' + T.grey + '">·</span> ' + x.per, style: TX.bodySm + ";font-size:15px", h: 52 },
        ]);
      } else {
        lowerThird(c, tb.x, tb.y + 6, tb.w, [
          { html: x.cA, style: TX.value + ";font-weight:400;font-size:17px;line-height:1.3;color:" + T.grey, h: 52 },
          { html: x.cB, style: TX.value + ";font-weight:400;font-size:24px;line-height:1.25;color:" + T.white, h: 40 },
        ]);
      }
    }
    c.chrome();
    var sb = bounds(tm.quad(big), view);
    c.state({
      // the overlay's lock tag prints the form up to its first comma, and truncates past 22 characters
      form: p >= 1 ? "IEP sheet, beside the ladder" : "IEP sheet arriving, beside the ladder",
      x: sb.x, y: sb.y, w: sb.w, h: sb.h,
      tone: "red edge, neutral paper; ground between the sheets",
      note: x.bigVal + " beside the ladder at the same fit (" + Math.round(fit) + "), on one baseline, never around it; both lean back " + Math.round(tm.o.rx) + "° in one plane. The ladder's rungs stay nested inside " + list[0].value + " as in S02.",
    });
  }
})();
