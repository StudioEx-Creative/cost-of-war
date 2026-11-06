/* S04 · THE SORT · RE-RANK · 1.0 screen
   The $2.89T treemap has restacked into ten bars: the ten largest
   military budgets. Bar length is dollars and never changes. Only the
   order changes: first by dollars, then by share of GDP. Ukraine glides
   from seventh to first, the camera trucks with it, and the other nine
   snap into the new order the moment it lands. Then the bars close up
   and fuse into one steel plate, which S05 cuts into drawing stock.

   Art direction: the bars are steel slabs standing on a black, polished
   floor (thickness, lit top edge, a faint reflection). Desktop: the camera
   starts low (looking up at the slabs) and yaws a little as it trucks with
   Ukraine, then settles square-on for the read. The yaw stays small (≤ 14°)
   so heights stay comparable; the lean (rotateX) moves every height by the
   same rule, so the order never lies. The leader's figure is the giant
   numeral of each state: $954B (first by dollars), then 40% (first by
   share), cropped at the right edge. Motion ghosts show where things were.
   Phone: horizontal slabs, one fixed 3/4 view (the camera holds still). */
(function () {
  "use strict";

  var N = 10;
  var SP = SB.get("topSpenders");
  // Order by dollars is the data order; order by GDP share is a stable sort,
  // exactly as js/main.js:336-337 sorts the live page's second column.
  var BY_USD = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].amt - SP[a].amt; });
  var BY_GDP = SP.map(function (_, i) { return i; }).sort(function (a, b) { return SP[b].gdp - SP[a].gdp; });
  var MOVER = BY_GDP[0]; // the bar that travels furthest (Ukraine)
  var MAXAMT = Math.max.apply(null, SP.map(function (s) { return s.amt; }));

  function slotOf(order, i) { return order.indexOf(i); }
  function pad2(n) { return (n < 9 ? "0" : "") + (n + 1); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Timeline (scroll progress inside the scene)
  //   0.00–0.25  ranked by dollars; GDP readings fade in from 0.12
  //   0.25–0.60  the mover glides from its dollar slot to slot 01 (lifted, in front)
  //   0.60       the other nine hard-snap into GDP order (one state change)
  //   0.85–1.00  the bars close up and fuse into one steel plate, which tips back onto the table
  function phase(p) {
    return {
      read: clamp((p - 0.12) / 0.16), // GDP reading opacity
      glide: clamp((p - 0.25) / 0.35), // mover travel 0..1
      snapped: p >= 0.6,
      fuse: clamp((p - 0.85) / 0.15),
    };
  }

  /* ── Projection: where a world point lands on screen after the camera and c.tilt ── */
  function projector(c) {
    var t = c._tilt || { rx: 0, ry: 0, rz: 0, persp: 1600 };
    var cam = c._cam || { s: 1, tx: 0, ty: 0 };
    var R = Math.PI / 180, ox = c.W / 2, oy = c.H / 2;
    var cX = Math.cos(t.rx * R), sX = Math.sin(t.rx * R), cY = Math.cos(t.ry * R), sY = Math.sin(t.ry * R), cZ = Math.cos(t.rz * R), sZ = Math.sin(t.rz * R);
    return function (x, y) {
      var X = x * cam.s + cam.tx - ox, Y = y * cam.s + cam.ty - oy;
      var x1 = X * cZ - Y * sZ, y1 = X * sZ + Y * cZ;
      var x2 = x1 * cY, z2 = -x1 * sY;
      var y3 = y1 * cX - z2 * sX, z3 = y1 * sX + z2 * cX;
      var w = 1 - z3 / t.persp;
      return [ox + x2 / w, oy + y3 / w];
    };
  }
  // The Sheet's state, recorded as its on-screen footprint (after the tilt), in camera space,
  // so the overlay's tracking box and the light pool land on what the reader sees.
  function stateOn(c, o, r) {
    var pr = projector(c), cam = c._cam || { s: 1, tx: 0, ty: 0 };
    var pts = [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].map(function (q) { return pr(q[0], q[1]); });
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys), x1 = Math.max.apply(null, xs), y1 = Math.max.apply(null, ys);
    o.x = Math.round((x0 - cam.tx) / cam.s);
    o.y = Math.round((y0 - cam.ty) / cam.s);
    o.w = Math.round((x1 - x0) / cam.s);
    o.h = Math.round((y1 - y0) / cam.s);
    o.note = (o.note ? o.note + "; " : "") + "rect = on-screen footprint after the tilt";
    c.state(o);
  }

  SB.scene({
    order: 4,
    id: "S04",
    name: "The Sort",
    move: "RE-RANK",
    screens: 1.0,
    restrained: false,
    anchor: null,
    trigger: "S03's treemap has restacked into ten bars (end of S03).",
    camera: "Slow lateral truck: the camera drifts left with the bar that moves furthest, then settles. Desktop only; phone holds still.",
    reason:
      "Fusing the ten bars into one plate turns the money into material: the same steel that becomes the drawing in S05. Bar length never changed, so the plate is still the same money until S05 cuts it in two on the dashed line and it becomes drawing stock.",
    frames: [
      { k: "in", p: 0, cap: "The treemap's slices land as ten steel slabs, ranked by dollars (drop tracks above: where they fell from). Low camera, looking up. Length = $bn. The top-ranked slab carries the one red edge; its figure is the giant numeral, cropped at the right edge." },
      { k: "mid", p: 0.45, cap: "GDP share arrives as a grey second reading. Ukraine leaves seventh place and glides to first, lifted and in front, trailing motion ghosts; the camera trucks with it and yaws a few degrees. Lengths never change." },
      { k: "out", p: 0.8, cap: "Ukraine lands. The other nine hard-snap into GDP order at one exact point (reverses exactly); faint outlines hold the dollar order a moment. The camera settles square-on. The giant numeral is now Ukraine's share of GDP. Length still = dollars; only the order changed." },
      { k: "detail", p: 0.8, cap: "Hover (desktop) or tap (phone) on a bar opens its detail: a boxed inset of the slab at 2.5× with its figures in the margin. Shown on Ukraine." },
      { k: "fuse", p: 1, cap: "Exit: labels go, gaps close, the ten slabs fuse into one steel plate, outline unchanged, and the plate tips back onto the table S05 draws on. A cut line appears for S05's split." },
    ],
    alts: [
      {
        k: "B",
        label: "Rest of world kept as an outline",
        frames: ["in"],
        note: "The ten budgets sum to less than the $2.89T sheet. An unlabelled grey outline holds the rest so area still means money through the restack. That remainder is derived (DEFENCE minus the ten) and is not in data.js.",
      },
    ],
    draw: function (c) {
      if (c.phone) drawPhone(c);
      else drawDesk(c);
    },
    // No-motion plate: GDP order, every bar with its dollar value and its GDP reading.
    plate: function (c) {
      if (c.phone) drawPhone(c, { plate: true });
      else drawDesk(c, { plate: true });
    },
  });

  /* ── shared bits ──────────────────────────────────────────────── */
  function names(c) {
    return SP.map(function (_, i) { return c.fig("topSpenders[" + i + "].name", "raw").toUpperCase(); });
  }
  function remainderB() {
    var sum = SP.reduce(function (a, s) { return a + s.amt; }, 0);
    return { sum: sum, rest: SB.get("DEFENCE") - sum };
  }
  // Light on steel: white at low opacity only (brand white, no other colour).
  var W = SB.T.white;
  function stop(o, a) { return '<stop offset="' + o + '" stop-color="' + W + '" stop-opacity="' + a + '"/>'; }
  var DEFS =
    '<defs><linearGradient id="s04refl" x1="0" y1="0" x2="0" y2="1">' + stop(0, 0.075) + stop(1, 0) + '</linearGradient>' +
    '<linearGradient id="s04floor" x1="0" y1="0" x2="0" y2="1">' + stop(0, 0.05) + stop(1, 0) + '</linearGradient>' +
    '<linearGradient id="s04side" x1="0" y1="0" x2="0" y2="1">' + stop(0, 0.07) + stop(1, 0.01) + '</linearGradient>' +
    '<radialGradient id="s04spot">' + stop(0, 0.16) + stop(0.6, 0.04) + stop(1, 0) + '</radialGradient>' +
    '<linearGradient id="s04beam" x1="0" y1="0" x2="0" y2="1">' + stop(0, 0) + stop(1, 0.07) + '</linearGradient>' +
    '<linearGradient id="s04sheen" x1="0" y1="0" x2="1" y2="1">' + stop(0, 0.12) + stop(0.5, 0.02) + stop(1, 0) + '</linearGradient></defs>';
  // A key light on the subject: a soft beam from above and a pool on the floor (desktop).
  function spot(x, base, w, top) {
    var cx = x + w / 2;
    return SB.SVG.path("M" + (cx - 26) + " " + (top - 260) + " L" + (cx + 26) + " " + (top - 260) + " L" + (x + w + 46) + " " + base + " L" + (x - 46) + " " + base + " Z", { fill: "url(#s04beam)", stroke: "none" }) +
      '<ellipse cx="' + cx + '" cy="' + (base + 6) + '" rx="' + (w / 2 + 80) + '" ry="22" fill="url(#s04spot)"/>';
  }

  // A steel slab standing on the floor at `base`: lit front face, a thin side and top
  // (thickness), a bright top edge. Front face is the measure (height = $).
  // o: { red, ghost, op, depth, horiz }
  function slab(x, y, w, h, o) {
    o = o || {};
    var S = SB.SVG, T = SB.T, s = "";
    var op = o.op != null ? o.op : 1;
    if (o.ghost) {
      // a motion ghost: dashed outline; a trail ghost also keeps a breath of the lit face
      return (o.trail ? S.rect(x, y, w, h, { fill: "rgba(255,255,255," + (0.05 * op).toFixed(3) + ")" }) : "") +
        S.rect(x + 0.5, y + 0.5, w - 1, h - 1, { fill: "none", stroke: "rgba(255,255,255," + ((o.trail ? 0.7 : 0.5) * op).toFixed(3) + ")", "stroke-dasharray": "3 4" });
    }
    var d = o.depth != null ? o.depth : 9, dy = d * 0.6;
    s += '<g opacity="' + op + '">';
    if (!o.horiz) {
      // side face (right) and top face (light catching it)
      s += S.path("M" + (x + w) + " " + y + " L" + (x + w + d) + " " + (y - dy) + " V" + (y + h - dy) + " L" + (x + w) + " " + (y + h) + " Z", { fill: T.ground, stroke: T.sheetLine });
      s += S.path("M" + (x + w) + " " + y + " L" + (x + w + d) + " " + (y - dy) + " V" + (y + h - dy) + " L" + (x + w) + " " + (y + h) + " Z", { fill: "url(#s04side)", stroke: "none" });
      s += S.path("M" + x + " " + y + " L" + (x + d) + " " + (y - dy) + " H" + (x + w + d) + " L" + (x + w) + " " + y + " Z", { fill: "rgba(255,255,255,0.2)", stroke: "rgba(255,255,255,0.35)" });
    } else {
      // horizontal slab (phone): top face along its length, end face at the far end
      s += S.path("M" + x + " " + y + " L" + (x + d) + " " + (y - dy) + " H" + (x + w + d) + " L" + (x + w) + " " + y + " Z", { fill: "rgba(255,255,255,0.16)", stroke: "rgba(255,255,255,0.3)" });
      s += S.path("M" + (x + w) + " " + y + " L" + (x + w + d) + " " + (y - dy) + " V" + (y + h - dy) + " L" + (x + w) + " " + (y + h) + " Z", { fill: T.ground, stroke: T.sheetLine });
    }
    s += S.rect(x, y, w, h, { fill: "url(#paper)" });
    if (o.red) {
      s += S.rect(x + 1, y + 1, w - 2, h - 2, { fill: "none", stroke: T.red, "stroke-width": 2 });
      s += S.rect(x, y, o.horiz ? 5 : 8, o.horiz ? 5 : 8, { fill: T.red });
    } else {
      s += S.rect(x + 0.5, y + 0.5, w - 1, h - 1, { fill: "none", stroke: "rgba(255,255,255,0.3)" });
      if (o.horiz) s += S.line(x + w - 1, y, x + w - 1, y + h, { stroke: T.white, "stroke-width": 2 });
      else s += S.line(x, y + 1, x + w, y + 1, { stroke: T.white, "stroke-width": 2 });
    }
    // a soft vertical sheen down the lit side
    if (!o.horiz && h > 24) s += S.rect(x + 3, y + 4, 2, h - 8, { fill: "rgba(255,255,255,0.06)" });
    return s + "</g>";
  }
  function reflection(x, base, w, h) {
    var rh = Math.min(h * 0.55, 74);
    return SB.SVG.rect(x, base + 2, w, rh, { fill: "url(#s04refl)" });
  }

  /* ═══ DESKTOP · vertical slabs on one floor line ═══════════════════ */
  var D = { base: 690, HMAX: 440, cw: 62, pitch: 98, x0: 120 };

  // Camera: a slow lateral truck with the mover (dx), plus a low camera that lifts and
  // a small yaw that comes and goes with the truck. The fuse tips the plate back onto the table.
  function deskCam(p, plate) {
    if (plate) return { dx: 0, rx: -4, ry: 3, rz: 0 };
    var ph = phase(p), dx, rx, ry, rz = 0;
    if (p < 0.25) dx = 0;
    else if (p < 0.6) dx = 130 * Math.sin(Math.PI * 0.5 * ph.glide);
    else dx = 130 - 110 * clamp((p - 0.6) / 0.25);
    if (p < 0.85) {
      rx = lerp(-11, -4, clamp(p / 0.8));
      ry = p < 0.6 ? 6 + 8 * Math.sin(Math.PI * 0.5 * ph.glide) : lerp(14, 3, clamp((p - 0.6) / 0.2));
    } else {
      rx = lerp(-4, 44, ph.fuse);
      ry = lerp(3, 0, ph.fuse);
      rz = lerp(0, -4, ph.fuse);
    }
    return { dx: dx, rx: rx, ry: ry, rz: rz };
  }

  function drawDesk(c, o) {
    o = o || {};
    var T = c.T, TX = c.TX, S = SB.SVG;
    var p = o.plate ? 0.8 : c.p;
    var ph = phase(p);
    var altB = c.alt === "B";
    var detail = c.k === "detail" && !o.plate;
    var base = D.base, HMAX = D.HMAX, cw = D.cw, pitch = D.pitch, x0 = D.x0;
    var k = HMAX / MAXAMT; // px per $B (length = money; same width, so area = money too)
    var nCols = altB ? N + 1 : N;
    var NM = names(c);

    var cam = deskCam(p, o.plate);
    c.camera(1, c.W / 2, c.H / 2, c.W / 2 + cam.dx, c.H / 2);
    c.tilt({ rx: cam.rx, ry: cam.ry, rz: cam.rz, persp: 1250 });

    // the floor: a wide world grid (moves with the camera, so the truck reads in a still) and a lit floor line
    c.svg(DEFS);
    c.svg(S.grid(-500, -300, c.W + 1000, 1500, 60, { ticks: false }));
    if (ph.fuse > 0) return deskFuse(c, o, { base: base, k: k, cw: cw, pitch: pitch, x0: x0, f: ph.fuse, NM: NM });

    var rowR = x0 + (nCols - 1) * pitch + cw;
    c.svg(S.rect(-500, base, c.W + 1000, 170, { fill: "url(#s04floor)" }));
    c.svg(S.line(-500, base, c.W + 500, base, { stroke: "rgba(255,255,255,0.4)" }));
    c.svg(S.line(x0 - 40, base, rowR + 40, base, { stroke: "rgba(255,255,255,0.7)" }));

    // slot of each bar at this progress
    var useGdp = ph.snapped || o.plate;
    var order = useGdp ? BY_GDP : BY_USD;
    var leader = order[0];
    var redOn = useGdp ? MOVER : ph.glide > 0 ? MOVER : leader; // the one red edge
    var cols = [];
    SP.forEach(function (s, i) {
      var slot = slotOf(order, i), lift = 0, moving = false;
      if (!useGdp && i === MOVER && ph.glide > 0) {
        var from = slotOf(BY_USD, i);
        slot = from + (0 - from) * ph.glide;
        lift = 150 * Math.min(1, ph.glide * 6) * (ph.glide < 1 ? 1 : 0);
        moving = true;
      }
      cols.push({ i: i, slot: slot, x: x0 + slot * pitch, h: s.amt * k, lift: lift, moving: moving });
    });

    // the key light follows the subject: the leader, then the mover
    var subj = cols[useGdp || ph.glide > 0 ? MOVER : leader];
    c.svg(spot(subj.x, base, cw, base - subj.lift - subj.h));
    // reflections on the polished floor
    cols.forEach(function (cl) { if (!cl.moving) c.svg(reflection(cl.x, base, cw, cl.h)); });

    // 'in': the slabs have just dropped out of S03's treemap; faint drop tracks above each
    if (!o.plate && p < 0.05 && !useGdp) {
      cols.forEach(function (cl) {
        var top = base - cl.h - 46;
        [cl.x + 6, cl.x + cw - 6].forEach(function (lx) {
          c.svg(S.line(lx, 120, lx, top, { stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 7" }));
        });
        c.svg(S.path("M" + (cl.x + cw / 2 - 5) + " " + (top - 8) + " L" + (cl.x + cw / 2) + " " + (top - 2) + " L" + (cl.x + cw / 2 + 5) + " " + (top - 8), { stroke: "rgba(255,255,255,0.55)" }));
      });
      c.svg(S.line(x0 - 30, 120, x0 + (nCols - 1) * pitch + cw + 30, 120, { stroke: "rgba(255,255,255,0.2)", "stroke-dasharray": "2 7" }));
    }

    // motion ghosts: where the mover was (stroboscopic trail) and its old slot
    var mv = cols[MOVER];
    if (mv.moving) {
      var fromSlot = slotOf(BY_USD, MOVER), gx = x0 + fromSlot * pitch;
      c.svg(slab(gx, base - mv.h, cw, mv.h, { ghost: true, op: 0.9 }));
      var steps = 5;
      for (var g = 1; g <= steps; g++) {
        var sl = fromSlot + (mv.slot - fromSlot) * (g / (steps + 1));
        var lf = 150 * Math.min(1, (g / (steps + 1)) * 6 * ph.glide);
        c.svg(slab(x0 + sl * pitch, base - lf - mv.h, cw, mv.h, { ghost: true, trail: true, op: 0.15 + 0.6 * (g / steps) }));
      }
      var ty = base - mv.lift - mv.h - 26;
      c.svg(S.path("M" + (gx + cw / 2) + " " + (base - mv.h - 6) + " V" + ty + " H" + (mv.x + cw + 18), { stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "3 5" }));
    }
    // 'out': the dollar order a moment ago, as faint outlines in each slot
    if (useGdp && !o.plate && !detail) {
      BY_USD.forEach(function (i, slot) {
        if (slotOf(BY_GDP, i) === slot) return;
        c.svg(slab(x0 + slot * pitch, base - SP[i].amt * k, cw, SP[i].amt * k, { ghost: true, op: 0.32 }));
      });
    }

    // slabs (the mover last, so it passes in front)
    cols.slice().sort(function (a, b) { return (a.moving ? 1 : 0) - (b.moving ? 1 : 0); }).forEach(function (cl) {
      var y = base - cl.lift - cl.h;
      if (cl.moving) c.svg(S.rect(cl.x + 10, base + 6, cw, 6, { fill: "rgba(255,255,255,0.06)" })); // its shadow left on the floor
      c.svg(slab(cl.x, y, cw, cl.h, { red: cl.i === redOn }));
    });

    // labels: values on the slabs, rank + name on the floor
    var giantI = useGdp ? MOVER : leader;
    cols.forEach(function (cl) {
      var i = cl.i, y = base - cl.lift - cl.h;
      var val = c.fig("topSpenders[" + i + "].amt", "B");
      if (!(i === giantI && !useGdp && !mv.moving)) c.div(cl.x - 26, y - 36, cw + 52, val, TX.value + ";font-size:20px;text-align:center");
      if (cl.moving) {
        // the travelling slab carries its name and its reading, growing toward the giant numeral
        c.div(cl.x - 4, y - 148, null, NM[i] + " · " + c.label("% OF GDP"), TX.labelW + ";font-size:12px;white-space:nowrap");
        c.div(cl.x - 10, y - 128, null, c.fig("topSpenders[" + i + "].gdp", "pct"), TX.giant + ";font-size:84px;white-space:nowrap");
        var gx2 = x0 + slotOf(BY_USD, i) * pitch;
        c.div(gx2, base + 14, 92, pad2(slotOf(BY_USD, i)), TX.label + ";font-size:11px;opacity:0.55");
        c.div(gx2, base + 30, 92, NM[i], TX.label + ";font-size:11px;opacity:0.55");
        return;
      }
      var rank = Math.round(cl.slot);
      c.div(cl.x, base + 14, 92, pad2(rank), TX.label + ";font-size:11px");
      c.div(cl.x, base + 30, 92, NM[i], TX.labelW + ";font-size:11px");
      if ((ph.read > 0 || o.plate) && !(useGdp && i === MOVER))
        c.div(cl.x, base + 70, 92, c.fig("topSpenders[" + i + "].gdp", "pct"),
          TX.label + ";letter-spacing:0.06em;font-size:" + (useGdp ? 15 : 13) + "px;opacity:" + (o.plate ? 1 : ph.read));
    });

    // The tracking box's top: when the 01 callout is drawn, the box takes it in, so the
    // overlay's tag sits above the callout instead of across its leader.
    var HY = 150; // the callout row (world y)
    // (acquiring, before p 0.5, the brackets stand 18 px off, so the box starts 8 px lower to keep
    // its top-right bracket off the key's first line)
    var rectTop = !mv.moving ? HY - (c.p >= 0.5 ? 20 : 12) : altB ? base - HMAX : base - HMAX - 44;

    // the giant numeral: the leader's figure, cropped at the right edge of the frame
    if (!mv.moving) {
      var gtop = useGdp ? 214 : altB ? 170 : 158;
      var gx3 = useGdp ? 872 : altB ? 330 : 700;
      var gtxt = useGdp ? c.fig("topSpenders[" + MOVER + "].gdp", "pct") : c.fig("topSpenders[" + leader + "].amt", "B");
      var gsize = useGdp ? 300 : altB ? 190 : 236;
      c.div(gx3, gtop, null, gtxt, TX.giant + ";font-size:" + gsize + "px;white-space:nowrap");
      // a thin leader from the slab to its figure, with a numbered callout
      var lc = cols[giantI], ly = base - lc.h;
      var hy = HY;
      c.svg(S.leader([[lc.x + cw / 2, ly - (useGdp ? 46 : 8)], [lc.x + cw / 2, hy], [gx3 - 18, hy]], { color: "rgba(255,255,255,0.5)" }));
      c.svg(S.circle(lc.x + cw / 2, hy, 11, { fill: T.ground, stroke: T.white, "stroke-width": 1 }));
      c.div(lc.x + cw / 2 - 11, hy - 8, 22, pad2(0), TX.labelW + ";font-size:10px;letter-spacing:0;text-align:center");
      if (altB) c.div(gx3 + 8, hy - 22, null, NM[giantI] + " · " + c.label("$BN"), TX.labelW + ";font-size:12px;white-space:nowrap");
      else c.div(gx3 - 330, hy - 22, 300, NM[giantI] + " · " + c.label(useGdp ? "% OF GDP" : "$BN"), TX.labelW + ";font-size:12px;white-space:nowrap;text-align:right");
    }

    if (altB) {
      // the unlabelled remainder: area = DEFENCE minus the ten (derived, flagged)
      var R = remainderB();
      var rx = x0 + N * pitch, rh = R.rest * k;
      c.svg(S.rect(rx + 0.5, base - rh + 0.5, cw - 1, rh - 1, { fill: "none", stroke: T.grey, "stroke-dasharray": "5 5" }));
      c.svg(S.rect(rx + 0.5, base - rh + 0.5, cw - 1, rh - 1, { fill: "url(#hatch-grey)", opacity: 0.25 }));
      c.flag("decision", "ALT B keeps an unlabelled 'rest of world' outline so area still equals the $2.89T sheet through the restack. It is derived (DEFENCE − Σ topSpenders = " + R.rest.toFixed(1) + " $B) and not in data.js. Approve the derived outline, or accept that area stops summing to $2.89T at the restack (main frames).");
      stateOn(c, { form: "ten bars + remainder outline", tone: "neutral, one red edge", note: "bar heights ∝ $B; remainder outline ∝ derived rest; together they equal DEFENCE at this scale" }, { x: x0, y: rectTop, w: N * pitch + cw, h: base - rectTop });
    }

    // ── marginalia (fixed): the key, top right, set flush right against a short rule
    var kx = c.W - 72, ky = 84;
    var key = function (y, main, sub, mainStyle) {
      c.uiSvg(S.line(kx - 30, y + 8, kx, y + 8, { stroke: "rgba(255,255,255,0.5)" }));
      c.uiDiv(kx - 800, y, 760, main, mainStyle + ";font-size:13px;text-align:right");
      c.uiDiv(kx - 800, y + 20, 760, sub, TX.label + ";font-size:11px;text-align:right");
    };
    key(ky, c.copy("10 largest military budgets · 2025 · $bn", "index.html:523").toUpperCase(), c.label(!useGdp && ph.read === 0 ? "HEIGHT & ORDER" : "HEIGHT"), TX.labelW);
    if (useGdp || ph.read > 0)
      key(ky + 46, c.copy("…and what that costs them · % of GDP", "index.html:527").toUpperCase(), c.label(useGdp ? "ORDER" : "ORDER · CHANGING"),
        (useGdp ? TX.labelW : TX.label) + ";opacity:" + (o.plate ? 1 : Math.max(0.6, ph.read)));
    c.uiDiv(72, 806, 200, c.label("SIPRI 2026 ↗"), TX.src);

    if (detail) deskDetail(c, cols[MOVER], base, cw, k);

    if (!altB) {
      if (c.k === "in") c.flag("decision", "Restack from S03: the ten bars sum to less than the $2.89T treemap (see ALT B). Main frames let area stop summing to $2.89T at the restack; each bar's length still equals its own budget.");
      stateOn(c, {
        form: "ten bars",
        tone: "neutral paper, one red edge (" + SP[redOn].name + ")",
        note: (useGdp ? "ordered by % of GDP" : ph.glide > 0 ? "re-rank in progress" : "ordered by $") + "; height ∝ $B, width fixed, so area ∝ money; camera dx " + Math.round(cam.dx) + ", tilt rx " + cam.rx.toFixed(1) + "° ry " + cam.ry.toFixed(1) + "°",
      }, { x: x0, y: rectTop, w: (N - 1) * pitch + cw + 9, h: base - rectTop });
    }
    if (!o.plate) c.chrome();
  }

  // Detail: a boxed inset of the slab at 2.5× (flat, like a loupe held over the scene),
  // its figures as marginalia beside it, a leader back to the slab.
  function deskDetail(c, cl, base, cw, k) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var i = cl.i, h = cl.h, top = base - h;
    var pr = projector(c);
    var a = pr(cl.x + cw / 2, top + h / 2);
    var Z = 2.5, box = { x: 236, y: 282, w: 206, h: 132 }; // right edge clear of the US slab
    // world point at the inset's centre: the slab, a little right of its middle
    var fx = cl.x + cw / 2 + 10, fy = base - 22;
    var tx = box.x + box.w / 2 - fx * Z, ty = box.y + box.h / 2 - fy * Z;
    var inner = S.line(cl.x - 60, base, cl.x + cw + 80, base, { stroke: "rgba(255,255,255,0.45)" }) +
      S.rect(cl.x - 60, base, cw + 140, 40, { fill: "url(#s04floor)" }) +
      reflection(cl.x, base, cw, h) + slab(cl.x, top, cw, h, { red: true });
    // dimension line along the slab's height (the figure is the dimension)
    var dxl = cl.x + cw + 17;
    inner += S.line(cl.x + cw + 12, top, dxl + 6, top, { stroke: T.grey }) + S.line(cl.x + cw + 2, base, dxl + 6, base, { stroke: T.grey }) +
      S.line(dxl, top + 1, dxl, base - 1, { stroke: T.grey }) +
      S.path("M" + (dxl - 2.5) + " " + (top + 5) + " L" + dxl + " " + top + " L" + (dxl + 2.5) + " " + (top + 5) + " M" + (dxl - 2.5) + " " + (base - 5) + " L" + dxl + " " + base + " L" + (dxl + 2.5) + " " + (base - 5), { stroke: T.grey });
    var u = '<defs><clipPath id="s04clip"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>';
    u += S.rect(box.x, box.y, box.w, box.h, { fill: T.ground });
    u += S.grid(box.x, box.y, box.w, box.h, 25, { ticks: false });
    u += '<g clip-path="url(#s04clip)"><g transform="translate(' + tx + " " + ty + ") scale(" + Z + ')">' + inner + "</g></g>";
    u += S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: T.white, "stroke-width": 1 });
    // the loupe's footprint on the slab, and one drop leader from its near corner up to the
    // inset's corner (a two-line cone would cross $190B and the figures under the inset)
    var fw = box.w / Z, fh = box.h / Z;
    var c0 = pr(fx - fw / 2, fy - fh / 2), c1 = pr(fx + fw / 2, fy + fh / 2);
    u += S.rect(c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1], { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-dasharray": "2 3" });
    u += S.leader([[c1[0], c0[1]], [box.x, box.y + box.h]], { color: "rgba(255,255,255,0.45)" });
    // hover cursor
    u += S.path("M" + (a[0] + 6) + " " + (a[1] - 2) + " l0 18 l5 -5 l4 9 l3 -1.5 l-4 -9 l7 0 Z", { fill: T.white, stroke: T.ground, "stroke-width": 1 });
    c.uiSvg(u);
    // FIG chip
    var chip = c.label("FIG. 01") + " · " + c.fig("topSpenders[" + i + "].name", "raw").toUpperCase();
    c.uiSvg(S.rect(box.x, box.y - 20, 154, 20, { fill: T.white }));
    c.uiDiv(box.x + 8, box.y - 17, null, chip, TX.labelW + ";font-size:10px;color:" + T.ground + ";white-space:nowrap");
    // figures as marginalia, under the inset (the figure is the slab's height), set just
    // right of the drop leader
    var mx = box.x + 18, my = box.y + box.h + 12;
    c.uiDiv(mx - 2, my, null, c.fig("topSpenders[" + i + "].amt", "B"), TX.value + ";font-size:44px");
    c.uiDiv(mx, my + 52, 230, c.fig("topSpenders[" + i + "].gdp", "pct") + " " + c.label("OF GDP"), TX.label + ";font-size:13px;letter-spacing:0.08em");
    c.uiDiv(mx, my + 72, 230, c.fig("topSpenders[" + i + "].change", "raw") + " " + c.newCopy("YEAR ON YEAR", "hover-detail label for topSpenders.change (no year typed; the change is 2025 on the year before, SIPRI)"), TX.label + ";font-size:13px;letter-spacing:0.08em");
    c.uiDiv(mx, my + 98, 230, c.label("SIPRI 2026 ↗"), TX.src);
    c.flag("decision", "Hover/tap detail prints topSpenders.change (" + SB.get("topSpenders[" + i + "].change") + " for " + SB.get("topSpenders[" + i + "].name") + "). It is in data.js but not on the live page. Approve, or keep the detail to $bn and % of GDP only.");
  }

  // Exit: the slabs close up into one plate (outline unchanged) and the plate tips back onto the table.
  function deskFuse(c, o, g) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var f = g.f;
    var w = g.cw * N;
    var px0 = (c.W - w) / 2;
    var pts = [];
    BY_GDP.forEach(function (i, slot) {
      var from = g.x0 + slot * g.pitch, to = px0 + slot * g.cw;
      pts.push({ x: from + (to - from) * f, h: SP[i].amt * g.k, i: i });
    });
    var top = g.base - g.k * MAXAMT;
    // the stepped skyline, as one path
    var path = "M" + pts[0].x + " " + g.base;
    pts.forEach(function (pt) { path += " V" + (g.base - pt.h) + " H" + (pt.x + g.cw); });
    path += " V" + g.base + " Z";
    // its thickness: now it lies on the table, the near edge shows (lit along its top), and each step's riser
    var tops = S.path("M" + pts[0].x + " " + g.base + " H" + (pts[N - 1].x + g.cw) + " v14 H" + pts[0].x + " Z", { fill: T.ground, stroke: T.sheetLine }) +
      S.line(pts[0].x, g.base + 1, pts[N - 1].x + g.cw, g.base + 1, { stroke: "rgba(255,255,255,0.55)" });
    pts.forEach(function (pt, j) {
      var nx = pts[j + 1];
      if (nx && nx.h < pt.h) tops += S.path("M" + (pt.x + g.cw) + " " + (g.base - pt.h) + " V" + (g.base - nx.h) + " l5 4 V" + (g.base - pt.h + 4) + " Z", { fill: T.ground, stroke: T.sheetLine });
    });
    // where the slabs stood a moment ago (dashed): the close-up's ghosts
    BY_GDP.forEach(function (i, slot) {
      var gx = g.x0 + slot * g.pitch, h = SP[i].amt * g.k;
      c.svg(S.rect(gx + 0.5, g.base - h + 0.5, g.cw - 1, h - 1, { fill: "none", stroke: "rgba(255,255,255,0.18)", "stroke-dasharray": "3 5" }));
    });
    [[g.x0 + 20, px0 - 24, 1], [g.x0 + (N - 1) * g.pitch + g.cw - 20, px0 + w + 24, -1]].forEach(function (a) {
      if ((a[1] - a[0]) * a[2] < 40) return; // that end barely moves: no arrow (a stub read as a glitch)
      var ay = g.base + 64;
      c.svg(S.line(a[0], ay, a[1], ay, { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 5" }));
      c.svg(S.path("M" + (a[1] - 8 * a[2]) + " " + (ay - 6) + " L" + a[1] + " " + ay + " L" + (a[1] - 8 * a[2]) + " " + (ay + 6), { stroke: T.white, "stroke-width": 1.5 }));
    });
    c.svg(tops);
    c.svg('<path d="' + path + '" fill="url(#paper)" filter="url(#sheetShadow)"/>');
    c.svg('<path d="' + path + '" fill="url(#hatch-grey)"/>');
    c.svg('<path d="' + path + '" fill="url(#s04sheen)"/>');
    c.svg(S.path(path, { stroke: T.white, "stroke-width": 1.5 }));
    // faint welds where the slabs met
    pts.slice(1).forEach(function (pt, j) {
      var hh = Math.min(pt.h, pts[j].h);
      c.svg(S.line(pt.x, g.base - hh, pt.x, g.base, { stroke: "rgba(255,255,255,0.22)" }));
    });
    // the cut line S05 opens
    var mid = c.W / 2;
    c.svg(S.line(mid, top - 60, mid, g.base + 40, { stroke: T.white, "stroke-dasharray": "8 6", opacity: 0.85 }));
    c.svg(S.path("M" + (mid - 8) + " " + (g.base + 40) + " L" + mid + " " + (g.base + 52) + " L" + (mid + 8) + " " + (g.base + 40), { stroke: T.white, "stroke-width": 1.5 }));
    c.uiSvg(S.line(c.W - 102, 78, c.W - 72, 78, { stroke: "rgba(255,255,255,0.5)" }));
    c.uiDiv(c.W - 712, 70, 600, c.copy("THE PRODUCTION LINE", "index.html:293"), TX.labelW + ";font-size:13px;text-align:right");
    c.uiDiv(72, 806, 200, c.label("SIPRI 2026 ↗"), TX.src + ";opacity:0.5");
    stateOn(c, { form: "steel plate (fused bars)", tone: "neutral, grey steel hatch, no red", note: "gaps closed, stepped outline kept: area still = the ten budgets; the plate tips back onto the table (tilt rx " + Math.round(c._tilt.rx) + "°). S05 cuts it in two on the dashed line; area stops meaning money there." },
      { x: Math.round(px0), y: Math.round(top), w: w, h: Math.round(g.k * MAXAMT) });
    c.chrome();
  }

  /* ═══ PHONE · horizontal slabs, one row per budget ═══════════════ */
  // One fixed 3/4 view: the camera holds still on phone. Rows run left to right, so the yaw
  // foreshortens every length by the same rule and the comparison stays honest. Rows are
  // 44 px apart (tap targets, brief §11). The leader's giant numeral sits in the text zone,
  // set into the scene (it tilts with it) and cropped at the right edge.
  var PTILT = { rx: 8, ry: 22, rz: -2, persp: 1000 };
  var PH = { y0: 102, rowH: 44, LMAX: 200, bh: 12 };

  function drawPhone(c, o) {
    o = o || {};
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage, tb = c.textBox;
    var p = o.plate ? 0.8 : c.p;
    var ph = phase(p);
    var altB = c.alt === "B";
    var detail = c.k === "detail" && !o.plate;
    var NM = names(c);
    var LMAX = PH.LMAX;
    var k = LMAX / MAXAMT;
    var rowH = PH.rowH;
    var y0 = altB ? 80 : PH.y0;
    var bx = st.x + 6;
    var useGdp = ph.snapped || o.plate;
    var order = useGdp ? BY_GDP : BY_USD;
    var leader = order[0];
    var redOn = useGdp ? MOVER : ph.glide > 0 ? MOVER : order[0];

    c.svg(DEFS);
    if (ph.fuse > 0) return phoneFuse(c, { k: k, rowH: rowH, y0: y0, bx: bx });
    c.tilt(PTILT);
    c.svg(S.grid(-300, -200, 1000, 1200, 34, { ticks: false }));

    var rows = [];
    SP.forEach(function (s, i) {
      var slot = slotOf(order, i), moving = false, off = 0;
      if (!useGdp && i === MOVER && ph.glide > 0) {
        var from = slotOf(BY_USD, i);
        slot = from + (0 - from) * ph.glide;
        moving = true;
        off = 150; // pulled out to the right while it travels up
      }
      rows.push({ i: i, slot: slot, y: y0 + slot * rowH, off: off, moving: moving, len: s.amt * k });
    });
    var nRows = altB ? N + 1 : N;

    // the wall the slabs start from, lit, with a faint floor sheen
    c.svg(S.rect(bx - 40, y0 - 10, 40, nRows * rowH + 10, { fill: "url(#s04floor)", transform: "rotate(-90 " + bx + " " + (y0 - 10) + ")" }));
    c.svg(S.line(bx - 1, y0 - 14, bx - 1, y0 + nRows * rowH, { stroke: "rgba(255,255,255,0.6)" }));

    var subj = useGdp ? MOVER : mvIdx(ph) ? MOVER : leader;
    var sr = rows[subj];
    c.svg(spotH(bx + sr.off, sr.y + 20, sr.len, PH.bh));

    var mv = rows[MOVER];
    if (mv.moving) {
      var fromSlot = slotOf(BY_USD, MOVER), gy = y0 + fromSlot * rowH;
      c.svg(slab(bx, gy + 20, mv.len, PH.bh, { ghost: true, op: 0.9 }));
      c.div(bx + 4, gy + 4, 200, pad2(fromSlot) + "&nbsp;&nbsp;" + NM[MOVER], TX.label + ";font-size:10px;opacity:0.55");
      for (var g = 1; g <= 4; g++) {
        var sl = fromSlot + (mv.slot - fromSlot) * (g / 5);
        c.svg(slab(bx + mv.off * Math.min(1, g / 2), y0 + sl * rowH + 20, mv.len, PH.bh, { ghost: true, trail: true, op: 0.2 + 0.55 * (g / 4) }));
      }
      c.svg(S.path("M" + (bx + mv.len + 6) + " " + (gy + 26) + " H" + (bx + mv.off - 10) + " V" + (mv.y + 40), { stroke: "rgba(255,255,255,0.4)", "stroke-dasharray": "3 4" }));
    }
    // 'out': the dollar order a moment ago, as faint outlines
    if (useGdp && !o.plate && !detail) {
      BY_USD.forEach(function (i, slot) {
        if (slotOf(BY_GDP, i) === slot) return;
        c.svg(slab(bx, y0 + slot * rowH + 20, SP[i].amt * k, PH.bh, { ghost: true, op: 0.28 }));
      });
    }

    rows.forEach(function (r) { if (!r.moving) phoneRow(c, r, NM, ph, o, useGdp, redOn, detail, bx); });
    if (mv.moving) phoneRow(c, mv, NM, ph, o, useGdp, redOn, detail, bx);

    if (altB) {
      var R = remainderB();
      var ry = y0 + N * rowH;
      c.svg(S.rect(bx + 0.5, ry + 20.5, R.rest * k - 1, PH.bh - 1, { fill: "none", stroke: T.grey, "stroke-dasharray": "4 4" }));
      c.svg(S.rect(bx + 0.5, ry + 20.5, R.rest * k - 1, PH.bh - 1, { fill: "url(#hatch-grey)", opacity: 0.25 }));
      c.flag("decision", "ALT B keeps an unlabelled 'rest of world' outline so area still equals the $2.89T sheet through the restack. It is derived (DEFENCE − Σ topSpenders = " + R.rest.toFixed(1) + " $B) and not in data.js. Approve the derived outline, or accept that area stops summing to $2.89T at the restack (main frames).");
    }

    // the giant numeral: the leader's figure, set into the scene below the stage, cropped at the right edge
    var giant = !mv.moving && !detail;
    if (giant) {
      var gi = useGdp ? MOVER : leader;
      var gtxt = useGdp ? c.fig("topSpenders[" + MOVER + "].gdp", "pct") : c.fig("topSpenders[" + leader + "].amt", "B");
      // GDP state sits 12 px lower: at 'out' the overlay's scan line runs at y 614 and its
      // SCAN tag would sit on the top of the 40%
      var gs = useGdp ? 150 : 112, gx = useGdp ? 70 : 14, gy0 = altB ? 588 : useGdp ? 592 : 580;
      c.div(gx + 4, gy0, null, NM[gi] + " · " + c.label(useGdp ? "% OF GDP" : "$BN"), TX.labelW + ";font-size:10px;white-space:nowrap");
      c.div(gx, gy0 + 10, null, gtxt, TX.giant + ";font-size:" + gs + "px;white-space:nowrap");
      // leader from the subject row down the wall to its figure
      var ly = rows[gi].y + 26;
      c.svg(S.leader([[bx + rows[gi].len + 2, ly], [bx - 10, ly], [bx - 10, gy0 + 6], [gx, gy0 + 6]], { color: "rgba(255,255,255,0.45)" }));
    }

    // ── text (fixed): one idea, two short lines
    var ty = giant ? tb.y + (useGdp ? 166 : 128) : tb.y;
    if (detail) phoneDetail(c, rows[MOVER], NM, bx);
    else if (!useGdp && ph.read === 0) {
      c.uiDiv(tb.x, ty, tb.w, c.copy("10 largest military budgets · 2025 · $bn", "index.html:523"), TX.bodySm + ";color:" + T.white);
      c.uiDiv(tb.x, ty + 30, tb.w, c.label("LENGTH AND ORDER · $BN") + "&nbsp;&nbsp;&nbsp;" + c.label("SIPRI 2026 ↗"), TX.label + ";font-size:10px");
    } else if (!useGdp) {
      c.uiDiv(tb.x, ty, tb.w, c.copy("…and what that costs them · % of GDP", "index.html:527"), TX.bodySm + ";color:" + T.white);
      c.uiDiv(tb.x, ty + 30, tb.w, c.label("LENGTH · $BN") + "&nbsp;&nbsp;&nbsp;" + c.label("ORDER · CHANGING"), TX.label + ";font-size:10px");
      c.uiDiv(tb.x, ty + 54, tb.w, c.label("SIPRI 2026 ↗"), TX.src);
    } else {
      c.uiDiv(tb.x, ty, tb.w, c.copy("…and what that costs them · % of GDP", "index.html:527"), TX.bodySm + ";color:" + T.white);
      if (!o.plate) c.uiDiv(tb.x, ty + 28, 120, c.newCopy("TAP A BAR", "phone hint: no hover on touch (brief §11)"), TX.label + ";font-size:10px;color:" + T.white);
      c.uiDiv(tb.x + (o.plate ? 0 : 110), ty + 28, 240, c.label("ORDER · % OF GDP") + "&nbsp;&nbsp;" + c.label("SIPRI 2026 ↗"), TX.label + ";font-size:10px");
    }

    if (!altB) {
      if (c.k === "in") c.flag("decision", "Restack from S03: the ten bars sum to less than the $2.89T treemap (see ALT B). Main frames let area stop summing to $2.89T at the restack; each bar's length still equals its own budget.");
      stateOn(c, { form: "ten bars (rows)", tone: "neutral paper, one red edge (" + SP[redOn].name + ")", note: (useGdp ? "ordered by % of GDP" : ph.glide > 0 ? "re-rank in progress" : "ordered by $") + "; length ∝ $B, fixed thickness; rows 44 px apart (tap targets); fixed 3/4 view" }, { x: bx, y: y0, w: LMAX + 60, h: N * rowH });
    } else stateOn(c, { form: "ten rows + remainder outline", tone: "neutral, one red edge", note: "remainder outline ∝ derived rest" }, { x: bx, y: y0, w: LMAX + 60, h: (N + 1) * rowH });
    if (!o.plate) c.chrome();
  }
  function mvIdx(ph) { return ph.glide > 0; }
  // A pool of light along a horizontal slab (phone)
  function spotH(x, y, len, bh) {
    return '<ellipse cx="' + (x + Math.max(len, 40) / 2) + '" cy="' + (y + bh / 2) + '" rx="' + (Math.max(len, 40) / 2 + 60) + '" ry="26" fill="url(#s04spot)"/>';
  }

  function phoneRow(c, r, NM, ph, o, useGdp, redOn, detail, bx) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var i = r.i, x = bx + r.off, y = r.y;
    var rank = r.moving ? null : Math.round(r.slot);
    var nm = (rank != null ? pad2(rank) + "&nbsp;&nbsp;" : "") + NM[i];
    c.div(x + 2, y + 4, r.moving ? 190 : 230, nm, TX.labelW + ";font-size:10px");
    c.svg(slab(x, y + 20, r.len, PH.bh, { red: i === redOn, horiz: true, depth: 5 }));
    // value, then the grey second reading (% of GDP) when it has arrived
    var val = c.fig("topSpenders[" + i + "].amt", "B");
    var second = "";
    if ((ph.read > 0 || o.plate) && !r.moving && !(useGdp && i === MOVER))
      second = '&nbsp;&nbsp;<span style="' + TX.label + ";font-size:12px;letter-spacing:0.06em;opacity:" + (o.plate ? 1 : ph.read) + '">' + c.fig("topSpenders[" + i + "].gdp", "pct") + "</span>";
    c.div(x + r.len + 12, y + 17, 160, val + second, TX.value + ";font-size:14px;white-space:nowrap");
    if (r.moving) {
      c.div(x + r.len + 70, y + 8, null, c.fig("topSpenders[" + i + "].gdp", "pct"), TX.giant + ";font-size:34px;white-space:nowrap");
      c.div(x + r.len + 72, y - 6, null, c.label("% OF GDP"), TX.label + ";font-size:10px;white-space:nowrap");
    }
    if (detail && i === MOVER) {
      // the tap mark sits on the slab itself, clear of its value
      var tx = x + r.len / 2;
      c.svg(S.circle(tx, y + 26, 11, { fill: "none", stroke: T.white, "stroke-width": 1.5 }));
      c.svg(S.circle(tx, y + 26, 3, { fill: T.white }));
    }
  }

  // Phone detail: a boxed inset of Ukraine's slab at 2.5× in the stage, figures in the text zone.
  function phoneDetail(c, r, NM, bx0) {
    var T = c.T, TX = c.TX, S = SB.SVG, tb = c.textBox;
    var i = MOVER, pr = projector(c);
    // The inset sits beside the subject (rows 01–03 end well left of x 196), so its one
    // leader runs along the gap under row 01 and crosses no other row's labels.
    var Z = 2.5, box = { x: 196, y: 128, w: 152, h: 100 };
    var bx = bx0, by = r.y + 20;
    var fx = bx + r.len / 2 + 6, fy = by + PH.bh / 2 + 2;
    var tx = box.x + box.w / 2 - fx * Z, ty = box.y + box.h / 2 - fy * Z;
    var inner = S.line(bx - 1, by - 24, bx - 1, by + 30, { stroke: "rgba(255,255,255,0.6)" }) + slab(bx, by, r.len, PH.bh, { red: true, horiz: true, depth: 5 });
    var dyl = by + PH.bh + 7;
    inner += S.line(bx, by + PH.bh + 2, bx, dyl + 3, { stroke: T.grey }) + S.line(bx + r.len, by + PH.bh + 2, bx + r.len, dyl + 3, { stroke: T.grey }) + S.line(bx + 1, dyl, bx + r.len - 1, dyl, { stroke: T.grey });
    var u = '<defs><clipPath id="s04clipP"><rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '"/></clipPath></defs>';
    u += S.rect(box.x, box.y, box.w, box.h, { fill: T.ground });
    u += S.grid(box.x, box.y, box.w, box.h, 19, { ticks: false });
    u += '<g clip-path="url(#s04clipP)"><g transform="translate(' + tx + " " + ty + ") scale(" + Z + ')">' + inner + "</g></g>";
    u += S.rect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1, { fill: "none", stroke: T.white, "stroke-width": 1 });
    var c0 = pr(fx - box.w / Z / 2, fy - box.h / Z / 2), c1 = pr(fx + box.w / Z / 2, fy + box.h / Z / 2);
    u += S.rect(c0[0], c0[1], c1[0] - c0[0], c1[1] - c0[1], { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-dasharray": "2 3" });
    // leader: from the footprint's right edge, along the gap between row 01 and row 02, to the inset
    var gy = r.y + 40, xr = fx + box.w / Z / 2;
    var a0 = pr(xr, gy), a1 = pr(xr + 200, gy), t = (box.x - a0[0]) / (a1[0] - a0[0]);
    u += S.leader([[a0[0], a0[1]], [box.x, a0[1] + t * (a1[1] - a0[1])]], { color: "rgba(255,255,255,0.45)" });
    c.uiSvg(u);
    c.uiSvg(S.rect(box.x, box.y - 18, 140, 18, { fill: T.white }));
    c.uiDiv(box.x + 6, box.y - 15, null, c.label("FIG. 01") + " · " + NM[i], TX.labelW + ";font-size:10px;color:" + T.ground + ";white-space:nowrap");
    c.uiSvg(S.line(tb.x, tb.y, tb.x + tb.w, tb.y, { stroke: "rgba(255,255,255,0.3)" }));
    c.uiDiv(tb.x, tb.y + 10, tb.w, pad2(slotOf(BY_GDP, i)) + " · " + NM[i], TX.labelW + ";font-size:11px");
    c.uiDiv(tb.x - 1, tb.y + 30, null, c.fig("topSpenders[" + i + "].amt", "B"), TX.value + ";font-size:40px");
    c.uiDiv(tb.x, tb.y + 82, tb.w, c.fig("topSpenders[" + i + "].gdp", "pct") + " " + c.label("OF GDP") + " · " +
      c.fig("topSpenders[" + i + "].change", "raw") + " " + c.newCopy("YEAR ON YEAR", "tap-detail label for topSpenders.change (no year typed; the change is 2025 on the year before, SIPRI)"), TX.label + ";font-size:12px;letter-spacing:0.08em");
    c.uiDiv(tb.x, tb.y + 110, tb.w, c.label("SIPRI 2026 ↗"), TX.src);
    c.flag("decision", "Hover/tap detail prints topSpenders.change (" + SB.get("topSpenders[" + i + "].change") + " for " + SB.get("topSpenders[" + i + "].name") + "). It is in data.js but not on the live page. Approve, or keep the detail to $bn and % of GDP only.");
  }

  // Phone exit: rows close up into one plate (ragged edge = the ten lengths), tipped back onto the table.
  var PFUSE = { rx: 34, ry: 4, rz: -4, persp: 900 };
  var PPLATE = { bh: 28 }; // S05 phone splits this plate: keep its bh in step
  function phoneFuse(c, g) {
    var T = c.T, TX = c.TX, S = SB.SVG;
    var st = c.stage, tb = c.textBox;
    c.tilt(PFUSE);
    c.svg(S.grid(-300, -300, 1000, 1400, 34, { ticks: false }));
    var bh = PPLATE.bh, x0 = g.bx;
    var plateH = bh * N;
    var py = st.y + (st.h - plateH) / 2; // cut line at y 306: S05's phone sheet folds there
    var d = "M" + x0 + " " + py;
    BY_GDP.forEach(function (i, slot) {
      d += " H" + (x0 + SP[i].amt * g.k) + " V" + (py + (slot + 1) * bh);
    });
    d += " H" + x0 + " Z";
    // ghosts of the rows a moment ago, faint
    BY_GDP.forEach(function (i, slot) {
      var len = SP[i].amt * g.k, gy = g.y0 + slot * g.rowH + 20;
      c.svg(S.rect(x0 + 0.5, gy + 0.5, len - 1, PH.bh - 1, { fill: "none", stroke: "rgba(255,255,255,0.14)", "stroke-dasharray": "2 4" }));
    });
    // the near edge of the plate (its thickness), lit along the top
    c.svg(S.path("M" + x0 + " " + (py + plateH) + " H" + (x0 + SP[BY_GDP[N - 1]].amt * g.k) + " v8 H" + x0 + " Z", { fill: T.ground, stroke: T.sheetLine }));
    c.svg('<path d="' + d + '" fill="url(#paper)" filter="url(#sheetShadow)"/>');
    c.svg('<path d="' + d + '" fill="url(#hatch-grey)"/>');
    c.svg('<path d="' + d + '" fill="url(#s04sheen)"/>');
    c.svg(S.path(d, { stroke: T.white, "stroke-width": 1.5 }));
    [[st.y + 40, py - 18, 1], [st.y + st.h + 20, py + plateH + 22, -1]].forEach(function (a) {
      var ax = st.x + st.w - 30;
      c.svg(S.line(ax, a[0], ax, a[1], { stroke: "rgba(255,255,255,0.45)", "stroke-dasharray": "3 4" }));
      c.svg(S.path("M" + (ax - 6) + " " + (a[1] - 8 * a[2]) + " L" + ax + " " + a[1] + " L" + (ax + 6) + " " + (a[1] - 8 * a[2]), { stroke: T.white, "stroke-width": 1.5 }));
    });
    // cut line (S05 stacks its split top / bottom)
    var cy = py + plateH / 2;
    c.svg(S.line(x0 - 14, cy, st.x + st.w - 46, cy, { stroke: T.white, "stroke-dasharray": "6 5", opacity: 0.85 }));
    c.uiDiv(tb.x, tb.y, tb.w, c.copy("THE PRODUCTION LINE", "index.html:293"), TX.labelW + ";font-size:11px");
    stateOn(c, { form: "steel plate (fused rows)", tone: "neutral, grey steel hatch, no red", note: "gaps closed, ragged edge kept: area still = the ten budgets; tipped back onto the table; S05 cuts it on the dashed line" }, { x: x0, y: Math.round(py), w: Math.round(MAXAMT * g.k), h: plateH });
    c.chrome();
  }
})();
