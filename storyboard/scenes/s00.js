/* S00 · HERO · LOCK · 1.0 screen
   The title sits on a classified file: a physical object on a dark desk,
   seen at an angle, other sheets stacked under it. Brackets hunt the file
   and lock on one line: the live military counter. As they hunt, the file
   settles flatter. At the end the camera pushes into the counter line,
   which is the budget line S01 opens on. */
(function () {
  "use strict";
  var S = SB.SVG;

  /* ── Depth: world → screen through the camera, then the tilt ─────
     Same maths as sb.js build(): translate+scale, then perspective ·
     rotateX · rotateY · rotateZ about the frame centre. Used to keep the
     overlay's tracking rect and the screen-space marks on the tilted file. */
  function depth(c) {
    var cam = c._cam || { s: 1, tx: 0, ty: 0 }, t = c._tilt, cx = c.W / 2, cy = c.H / 2, R = Math.PI / 180;
    var H = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    if (t) {
      var cz = Math.cos(t.rz * R), sz = Math.sin(t.rz * R), cY = Math.cos(t.ry * R), sY = Math.sin(t.ry * R), cX = Math.cos(t.rx * R), sX = Math.sin(t.rx * R);
      H = [
        [cY * cz, -cY * sz, 0],
        [cX * sz + sX * sY * cz, cX * cz - sX * sY * sz, 0],
        [-(sX * sz - cX * sY * cz) / t.persp, -(sX * cz + cX * sY * sz) / t.persp, 1],
      ];
    }
    function pt(x, y) {
      var X = x * cam.s + cam.tx - cx, Y = y * cam.s + cam.ty - cy, w = H[2][0] * X + H[2][1] * Y + 1;
      return [(H[0][0] * X + H[0][1] * Y) / w + cx, (H[1][0] * X + H[1][1] * Y) / w + cy];
    }
    function box(r) {
      var q = [pt(r.x, r.y), pt(r.x + r.w, r.y), pt(r.x, r.y + r.h), pt(r.x + r.w, r.y + r.h)];
      var xs = q.map(function (p) { return p[0]; }), ys = q.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
      return { x: x0, y: y0, w: Math.max.apply(null, xs) - x0, h: Math.max.apply(null, ys) - y0 };
    }
    // The overlay applies the camera only, so hand it the camera-inverse of the screen box.
    function state(r) {
      var b = box(r);
      return { x: Math.round((b.x - cam.tx) / cam.s), y: Math.round((b.y - cam.ty) / cam.s), w: Math.round(b.w / cam.s), h: Math.round(b.h / cam.s) };
    }
    // screen → world (on the paper plane)
    var a = H, det = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    var I = [
      [(a[1][1] * a[2][2] - a[1][2] * a[2][1]) / det, (a[0][2] * a[2][1] - a[0][1] * a[2][2]) / det, (a[0][1] * a[1][2] - a[0][2] * a[1][1]) / det],
      [(a[1][2] * a[2][0] - a[1][0] * a[2][2]) / det, (a[0][0] * a[2][2] - a[0][2] * a[2][0]) / det, (a[0][2] * a[1][0] - a[0][0] * a[1][2]) / det],
      [(a[1][0] * a[2][1] - a[1][1] * a[2][0]) / det, (a[0][1] * a[2][0] - a[0][0] * a[2][1]) / det, (a[0][0] * a[1][1] - a[0][1] * a[1][0]) / det],
    ];
    function back(sx, sy) {
      var X = sx - cx, Y = sy - cy, w = I[2][0] * X + I[2][1] * Y + I[2][2];
      var qx = (I[0][0] * X + I[0][1] * Y + I[0][2]) / w + cx, qy = (I[1][0] * X + I[1][1] * Y + I[1][2]) / w + cy;
      return [(qx - cam.tx) / cam.s, (qy - cam.ty) / cam.s];
    }
    // A world-space clip polygon that lands exactly on a screen rectangle.
    function clip(id, r) {
      var q = [back(r.x, r.y), back(r.x + r.w, r.y), back(r.x + r.w, r.y + r.h), back(r.x, r.y + r.h)];
      return '<defs><clipPath id="' + id + '"><path d="M' + q.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + ' Z"/></clipPath></defs>';
    }
    // The same window for a world text block whose top-left sits at world (x, y).
    function clipCss(r, x, y) {
      var q = [back(r.x, r.y), back(r.x + r.w, r.y), back(r.x + r.w, r.y + r.h), back(r.x, r.y + r.h)];
      return ";clip-path:polygon(" + q.map(function (p) { return (p[0] - x).toFixed(1) + "px " + (p[1] - y).toFixed(1) + "px"; }).join(",") + ")";
    }
    return { pt: pt, box: box, state: state, back: back, clip: clip, clipCss: clipCss };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Registration mark: a small cross in a circle, printed at the file's corners.
  function reg(x, y, r) {
    return S.circle(x, y, r, { fill: "none", stroke: "rgba(255,255,255,0.32)", "stroke-width": 1 }) +
      S.path("M" + (x - r - 5) + " " + y + " H" + (x + r + 5) + " M" + x + " " + (y - r - 5) + " V" + (y + r + 5), { stroke: "rgba(255,255,255,0.32)" });
  }

  SB.scene({
    order: 0,
    id: "S00",
    name: "Hero",
    move: "LOCK",
    screens: 1.0,
    restrained: false,
    anchor: "#hero",
    trigger: "Load, then #hero top.",
    camera: "The file lies on a dark desk, tilted (rx 13°, rz −2.2°). It settles flatter as the brackets hunt, then the camera pushes into one line.",
    reason:
      "Locking on the live military counter says which number this story follows. The hard cut lands on that same line as Chapter 01 opens.",
    frames: [
      { k: "in", p: 0, cap: "At rest on load. The file lies on a dark desk at an angle, two sheets under it, the title monumental. Brackets sit wide on the whole file." },
      { k: "mid", p: 0.5, cap: "Scroll hunts: the file settles flatter and the brackets jump to the violence rate in the copy (a faint trace of where they were), then on." },
      { k: "out", p: 1, cap: "Lock snaps on the live counter line. The file is almost flat; the camera pushes in until the red counter dominates. Hard cut to S01 next." },
    ],
    draw: function (c) {
      var T = c.T, TX = c.TX;
      var p = c.p;
      var ph = c.phone;
      var plate = c.plate;
      var push = p >= 1 && !plate;

      // ── the file (the Sheet's first form), in world coordinates
      var f = ph ? { x: 34, y: 100, w: 312, h: 446 } : { x: 150, y: 124, w: 1060, h: 680 };
      var pad = ph ? 16 : 70;
      // counter block position inside the file
      var cy = ph ? f.y + 318 : f.y + 512;

      // ── camera and tilt: on the desk at rest, flatter as the brackets hunt, then the push
      var e = plate ? 0.55 : p;
      c.tilt(ph
        ? { rx: lerp(12, 2, e), ry: lerp(-8, -1, e), rz: lerp(-2.5, -0.4, e), persp: 900 }
        : { rx: lerp(13, 2.5, e), ry: lerp(-5, -1, e), rz: lerp(-2.2, -0.4, e), persp: 1500 });
      if (push) {
        if (ph) c.camera(1.3, f.x + 150, cy + 60, 186, 372);
        else c.camera(1.62, f.x + 300, cy + 70, 560, 470);
      } else if (!ph) {
        // at rest the file sits a little back on the desk, off-centre, with room around it
        var k = plate ? 0.92 : lerp(0.88, 0.95, Math.min(1, p / 0.9));
        c.camera(k, f.x + f.w / 2, f.y + f.h / 2, 676, 448);
      }
      var D = depth(c);

      // Phone: the file lives in the 343×500 stage window. SVG and world text are clipped to it
      // (open to the sides, where the screen edge crops), so nothing runs into the chrome or the text below.
      var win = { x: -80, y: c.stage.y - 8, w: c.W + 160, h: c.stage.h + 8 };
      function wdiv(x, y, w, html, style) {
        c.div(x, y, w, html, style + (ph ? D.clipCss(win, x, y) : ""));
      }

      // the desk: a faint grid fixed to the screen (the paper moves, the room does not)
      c.bgSvg(S.grid(0, 0, c.W, c.H, ph ? 47 : 60, { ticks: false }));
      if (ph) c.svg(D.clip("s00-stage", win) + '<g clip-path="url(#s00-stage)">');

      // ── stacked sheets under the file: same paper, slightly turned, edges catching light
      var under = ph
        ? [{ dx: 10, dy: 12, a: 2.2 }, { dx: -6, dy: 20, a: -1.6 }]
        : [{ dx: 26, dy: 18, a: 1.5 }, { dx: -16, dy: 34, a: -1.1 }];
      under.forEach(function (u, i) {
        var ux = f.x + u.dx, uy = f.y + u.dy;
        c.svg('<g transform="rotate(' + u.a + " " + (ux + f.w / 2) + " " + (uy + f.h / 2) + ')">' +
          S.sheet(ux, uy, f.w, f.h, { tone: "grey", mode: "edge", sw: 1, opacity: i ? 0.75 : 0.95 }) + "</g>");
      });

      // ── the file: tab, paper, margin details
      var tabW = ph ? 176 : 280, tabH = ph ? 22 : 30;
      c.svg(S.rect(f.x, f.y - tabH, tabW, tabH + 2, { fill: "url(#paper)", stroke: T.sheetLine }));
      c.svg(S.sheet(f.x, f.y, f.w, f.h, { tone: "white", mode: "edge", sw: 1 }));
      c.svg(S.rect(f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1, { fill: "none", stroke: T.sheetLine }));
      wdiv(f.x + (ph ? 10 : 14), f.y - tabH + (ph ? 5 : 8), null, c.label("FILE · THE COST OF WAR", "file tab"), TX.labelW + ";font-size:" + (ph ? 11 : 12) + "px");
      // punched holes down the binding edge, a ruled margin, registration marks
      var holes = ph ? [f.y + 150, f.y + 290] : [f.y + 190, f.y + 470];
      holes.forEach(function (hy) {
        c.svg(S.circle(f.x + (ph ? 8 : 26), hy, ph ? 4 : 7, { fill: T.ground, stroke: "rgba(255,255,255,0.22)", "stroke-width": 1 }));
      });
      if (!ph) c.svg(S.line(f.x + 48, f.y + 70, f.x + 48, f.y + f.h - 20, { stroke: "rgba(255,255,255,0.08)" }));
      var ri = ph ? 12 : 22, rr = ph ? 3 : 5;
      c.svg(reg(f.x + f.w - ri, f.y + ri, rr) + reg(f.x + f.w - ri, f.y + f.h - ri, rr) + (ph ? "" : reg(f.x + ri + 30, f.y + f.h - ri, rr)));

      // header row
      wdiv(f.x + pad, f.y + (ph ? 14 : 26), ph ? f.w - pad * 2 - 14 : 560,
        "<span>▚</span> " + c.copy("ACQUIRING TARGET… PATTERN RECOGNITION ONLINE", "index.html:71-72"),
        TX.label + ";font-size:" + (ph ? 11 : 12) + "px");
      if (!ph) wdiv(f.x + f.w - pad - 300, f.y + 26, 300 - 20,
        c.label("BLUEPRINT × STUDIOEX", "credit lockup, white"),
        TX.labelW + ";text-align:right");
      c.svg(S.line(f.x + pad, f.y + (ph ? 52 : 60), f.x + f.w - (ph ? 14 : 50), f.y + (ph ? 52 : 60), { stroke: T.rule }));

      // ── title: monumental. 'THE' small above, 'COST OF WAR' set big enough to break onto two lines.
      var tX = f.x + pad - (ph ? 2 : 6);
      wdiv(tX + (ph ? 1 : 4), f.y + (ph ? 66 : 84), null, c.copy("THE", "index.html:76"), TX.title + ";font-size:" + (ph ? 26 : 58) + "px");
      wdiv(tX, f.y + (ph ? 94 : 142), ph ? 290 : 900, c.copy("COST OF WAR", "index.html:77"),
        TX.title + ";font-size:" + (ph ? 58 : 180) + "px;line-height:0.9");

      // copy with the violence rate: beside 'WAR' on desktop; below the stage on phone
      var rate = c.fig("VIOLENCE_PER_SECOND", "usd");
      var copyHtml = c.copy("Every second, violence costs humanity ", "index.html:80") +
        '<b style="color:' + T.white + ';font-weight:600">' + rate + "</b>" +
        c.copy(". This page cross-references what we spend on destruction against what that same money could build.", "index.html:80-82");
      var srcLab = c.label("VIOLENCE · PER SECOND · IEP GPI 2026", "source label");
      var para; // the bracket target, in the layer it is drawn on
      if (!ph) {
        para = { x: f.x + 600, y: f.y + 326, w: 400, h: 172 };
        c.div(para.x, para.y, para.w, copyHtml, TX.body + ";font-size:20px;line-height:1.45");
        c.div(para.x, para.y + 154, null, srcLab, TX.src);
      } else {
        var tb = c.textBox;
        para = { x: tb.x, y: tb.y + 4, w: tb.w, h: 116 };
        c.uiDiv(tb.x, tb.y + 4, tb.w, copyHtml, TX.body + ";font-size:16px;line-height:1.45");
        c.uiDiv(tb.x, tb.y + 104, null, srcLab, TX.src + ";font-size:10px");
      }

      // ── the live counter line: the one red mark
      var live = c.sample(SB.FMT.usd(SB.get("MIL_PER_SECOND") * 10), "sample reading 10 s after opening = MIL_PER_SECOND × 10");
      c.svg(S.line(f.x + pad, cy - (ph ? 12 : 16), f.x + f.w - (ph ? 14 : 50), cy - (ph ? 12 : 16), { stroke: T.rule }));
      wdiv(f.x + pad, cy, ph ? f.w - pad * 2 - 10 : 640,
        c.copy("Since you opened this file, the world has spent", "index.html:86"),
        TX.labelW + ";font-size:" + (ph ? 10 : 12) + "px");
      wdiv(f.x + pad - (ph ? 2 : 4), cy + (ph ? 34 : 26), null, live,
        TX.value + ";font-size:" + (ph ? 50 : 96) + "px;color:" + T.red);
      var mil = c.copy("on its militaries", "index.html:89") + ' &nbsp;<span style="' + TX.src + (ph ? ";font-size:10px" : "") + '">' + c.label("· SIPRI 2026 · RUNNING", "source label") + "</span>";
      if (!ph) wdiv(f.x + pad + 470, cy + 82, 420, mil, TX.bodySm + ";font-size:18px");
      else wdiv(f.x + pad, cy + 92, f.w - pad * 2, mil, TX.bodySm + ";font-size:14px");

      // scroll cue and credit (flat, on the screen; clear of the scan readout at the right)
      if (!ph) {
        c.uiDiv(1050, 814, 220, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";font-size:11px;text-align:right");
      } else {
        c.uiDiv(c.textBox.x, c.textBox.y + 150, c.textBox.w, c.label("BLUEPRINT × STUDIOEX", "credit lockup, white"), TX.labelW + ";font-size:10px");
        c.uiDiv(c.textBox.x, c.textBox.y + 186, c.textBox.w, c.copy("▼   BEGIN DEBRIEF   ▼", "index.html:93"), TX.label + ";font-size:10px;text-align:center");
      }

      // ── brackets: hunt (scroll-driven), then lock. They sit on the paper (world layer),
      //    except on phone mid, where the copy they hunt is flat below the stage.
      var tagSt = TX.labelW + ";font-size:11px;background:" + T.ground + ";padding:2px 6px;white-space:nowrap";
      if (!plate) {
        var fileB = { x: f.x - (ph ? 8 : 16), y: f.y - tabH - (ph ? 8 : 14), w: f.w + (ph ? 16 : 32), h: f.h + tabH + (ph ? 16 : 30) };
        var lockB = ph ? { x: f.x + pad - 8, y: cy - 8, w: f.w - pad * 2 + 4, h: 122 } : { x: f.x + pad - 18, y: cy - 14, w: 458, h: 140 };
        var bx, tag, len = ph ? 12 : 24;
        if (p < 0.34) { bx = fileB; tag = "SCANNING"; }
        else if (p < 0.9) {
          tag = "SCANNING";
          bx = { x: para.x - (ph ? 6 : 14), y: para.y - (ph ? 6 : 12), w: para.w + (ph ? 12 : 28), h: para.h + (ph ? 12 : 24) };
          // where the brackets just were: a faint trace on the whole file
          c.svg(S.brackets(fileB.x, fileB.y, fileB.w, fileB.h, { len: len, sw: 1, opacity: 0.25 }));
        } else { bx = lockB; tag = "LOCKED · MILITARY SPENDING"; }
        var bs = S.brackets(bx.x, bx.y, bx.w, bx.h, { len: len, sw: p >= 0.9 ? 2 : 1.5 });
        var tagHtml = c.label(tag, "bracket tag");
        if (ph && p >= 0.34 && p < 0.9) {
          c.uiSvg(bs);
          c.uiDiv(bx.x, bx.y - 18, null, tagHtml, tagSt); // clear of the file's bottom edge above it
        } else {
          c.svg(bs);
          // the tag sits where it stays clear of the overlay bands: above-right at rest, below-left on the lock
          if (p < 0.34) wdiv(bx.x + bx.w - (ph ? 86 : 104), bx.y - (ph ? 20 : 24), null, tagHtml, tagSt);
          else if (p < 0.9) wdiv(bx.x, bx.y - 24, null, tagHtml, tagSt);
          // desktop: hung off the bracket's arm, clear of the file's bottom-left registration mark
          else wdiv(bx.x + (ph ? 0 : 24), bx.y + bx.h + 8, null, tagHtml, tagSt);
        }
        if (p >= 0.9) c.flag("decision", "Lock target: the live military counter. Print " + SB.FMT.usd(SB.get("MIL_PER_SECOND")) + "/s beside it? It is in data.js (MIL_PER_SECOND) but not yet on the page.");
      }
      if (ph) c.svg("</g>");
      c.chrome({ labels: false });
      var sr = D.state(f);
      c.state({ form: "file", x: sr.x, y: sr.y, w: sr.w, h: sr.h, tone: "neutral", note: push ? "file almost flat; camera pushed onto the counter line" : plate ? "file at rest on the desk, half settled (no push)" : "file at rest on the desk, tilted; stacked sheets under it" });
    },
  });
})();
