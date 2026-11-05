/* S12 · THE HUMAN IMPACT · STILLNESS · 2.0 screens · RESTRAINED
   No chrome, no brackets, no hard cuts, no red, no sound. Fades only.
   The Sheet is at its smallest here: one point of light, one person.
   Then every person killed in a year, all at once, in one slow fade:
   exactly DEATHS_PER_YEAR points, drawn by a seeded scatter so a redraw
   is identical. Then the kept figures as plain text, then a black pause.

   Alt B draws the CURRENT artwork (the flood, js/dossier.js:663-792)
   for comparison. Open decision 7: Blueprint must approve the change. */
(function () {
  "use strict";

  /* ── helpers (local to this scene) ─────────────────────────────── */
  // Seeded PRNG (mulberry32). Same seed, same field, every frame.
  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // 0 at e0, 1 at e1 (either direction), smooth in between.
  function smooth(e0, e1, x) {
    var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }
  // The single point of light, as the live scene draws it (r 5.5, blur 14).
  function light(g, T, x, y, r, blur) {
    g.save();
    g.globalAlpha = 1;
    g.fillStyle = T.white;
    g.shadowColor = T.white;
    g.shadowBlur = blur;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // The field at rest: exactly o.n people. Each is ONE distinct device pixel
  // (an occupancy grid rejects a pixel already lit, so no point hides another),
  // white or grey, most dim and a few bright, so it reads as lights, not grain.
  // o.held = the first point of light. It is one of the o.n (so the scatter is
  // o.n - 1), its glow is kept clear of scatter, and it is drawn here only when
  // o.drawHeld is true (the fade frames draw it on its own layer at full strength).
  // mask(x, y) in 0..1 thins the field to clear space for text.
  // The count is checked by reading the canvas back: lit pixels must equal the
  // scatter count, or the frame throws. Returns { url, scatter, fill }.
  function restField(T, o) {
    var cv = document.createElement("canvas");
    var W = Math.round(o.w * o.dpr), H = Math.round(o.h * o.dpr);
    cv.width = W;
    cv.height = H;
    var g = cv.getContext("2d");
    var rnd = prng(o.seed || 1);
    var occ = new Uint8Array(W * H);
    var held = o.held || null;
    var scatter = Math.max(0, o.n - (held ? 1 : 0));
    if (held) {
      // keep the held point's glow clear (radius 10 css px)
      var hr = 10 * o.dpr, hx = held.x * o.dpr, hy = held.y * o.dpr;
      for (var yy = Math.max(0, Math.floor(hy - hr)); yy <= Math.min(H - 1, Math.ceil(hy + hr)); yy++)
        for (var xx = Math.max(0, Math.floor(hx - hr)); xx <= Math.min(W - 1, Math.ceil(hx + hr)); xx++)
          if ((xx - hx) * (xx - hx) + (yy - hy) * (yy - hy) <= hr * hr) occ[yy * W + xx] = 1;
    }
    // capacity (mask-weighted free device pixels), for the density note
    var capacity = 0;
    for (var cy = 0; cy < H; cy++)
      for (var cx = 0; cx < W; cx++)
        if (!occ[cy * W + cx]) capacity += o.mask ? o.mask((cx + 0.5) / o.dpr, (cy + 0.5) / o.dpr) : 1;
    if (scatter > capacity * 0.9) throw new Error("S12 field: " + scatter + " points will not fit in " + Math.round(capacity) + " pixels");
    var placed = 0, tries = 0;
    while (placed < scatter) {
      if (++tries > scatter * 60) throw new Error("S12 field: gave up at " + placed + " of " + scatter);
      var x = rnd() * o.w, y = rnd() * o.h;
      if (o.mask && rnd() >= o.mask(x, y)) continue;
      var px = Math.floor(x * o.dpr), py = Math.floor(y * o.dpr), i = py * W + px;
      if (occ[i]) continue;
      occ[i] = 1;
      g.globalAlpha = 0.1 + 0.8 * Math.pow(rnd(), 2.4);
      g.fillStyle = rnd() < 0.35 ? T.grey : T.white;
      g.fillRect(px, py, 1, 1);
      placed++;
    }
    if (scatter > 0) {
      var d = g.getImageData(0, 0, W, H).data, lit = 0;
      for (var j = 3; j < d.length; j += 4) if (d[j]) lit++;
      if (lit !== scatter) throw new Error("S12 field: " + lit + " lit pixels, expected " + scatter);
    }
    if (held && o.drawHeld) light(g, T, held.x * o.dpr, held.y * o.dpr, 5.5 * o.dpr, 14);
    return { url: cv.toDataURL("image/png"), scatter: scatter, fill: capacity ? scatter / capacity : 0 };
  }
  // The held point alone (one person), on its own layer.
  function heldOnly(T, w, h, dpr, at) {
    return restField(T, { w: w, h: h, dpr: dpr, n: 1, held: at, drawHeld: true }).url;
  }
  function pctOf(f) { return Math.round(f * 100) + "%"; }
  // The CURRENT flood (js/dossier.js:697-735), reproduced for comparison:
  // grows outward from the centre, radius decays 5.5px → speck, first 40 glow.
  function floodField(T, o) {
    var cv = document.createElement("canvas");
    cv.width = Math.round(o.w * o.dpr);
    cv.height = Math.round(o.h * o.dpr);
    var g = cv.getContext("2d");
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    var hash = function (n) {
      var x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    g.fillStyle = T.white;
    for (var i = 0; i < o.n; i++) {
      var spread = 0.06 + 0.94 * Math.min(i / 500, 1);
      var ang = hash(i + 1) * 6.2832;
      var rad = Math.sqrt(hash(i + 91)) * spread;
      var px = o.w * 0.5 + Math.cos(ang) * rad * o.w * 0.62;
      var py = o.h * 0.5 + Math.sin(ang) * rad * o.h * 0.62;
      var r = Math.max(0.5, 5.5 * (1 - Math.min(i / 2200, 1)));
      g.globalAlpha = i < 60 ? 1 : 0.3 + hash(i + 7) * 0.55;
      if (r <= 0.75) g.fillRect(px, py, 1, 1);
      else {
        if (i < 40) { g.shadowColor = T.white; g.shadowBlur = 14; }
        g.beginPath();
        g.arc(px, py, r, 0, 6.2832);
        g.fill();
        g.shadowBlur = 0;
      }
    }
    return cv.toDataURL("image/png");
  }
  function image(url, x, y, w, h, op) {
    return '<image href="' + url + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" preserveAspectRatio="none"' + (op != null && op < 1 ? ' opacity="' + op + '"' : "") + "/>";
  }
  // Live count since opening: time-based, not scroll. Sample at 12 minutes.
  function since(c) {
    var secs = 12 * 60, year = 365 * 24 * 3600;
    var n = Math.floor((SB.get("DEATHS_PER_YEAR") / year) * secs);
    return c.sample(String(n),
      "live count since opening. Sample 12 min after opening = floor(DEATHS_PER_YEAR ÷ 31,536,000 s × 720 s), as dossier.js:786 computes it. Runs on time, not scroll; plain text, no aria-live.");
  }

  /* ── shared text blocks ────────────────────────────────────────── */
  function openLine(c) {
    return c.copy("Everything above can be counted in dollars.", "index.html:742") + "<br>" +
      c.copy("What follows cannot.", "index.html:742");
  }
  function closeLine(c) {
    return c.copy("Every number on this page was a person", "index.html:774") + "<br>" +
      c.copy("who wanted to live.", "index.html:774");
  }
  // "When you're ready": words only. A still white link, no cyan, no arrow.
  // Padding keeps the tap target at 44px or more.
  function readyLink(c, fs) {
    return '<span style="' + c.TX.bodySm + ";display:inline-block;padding:12px 2px 9px;border-bottom:1px solid " + c.T.white +
      ";font-weight:500;font-size:" + fs + "px;line-height:1.3;color:" + c.T.white + '">' +
      c.copy("When you're ready", "index.html:781") + "</span>";
  }
  // The figure block for the field: value, unit, rate, live count, source.
  function figure(c) {
    return {
      value: c.fig("DEATHS_PER_YEAR", "int"),
      unit: c.fig("humanData[0].unit", "raw"),
      rate: c.copy("one every ", "index.html:761") + c.fig("SECONDS_PER_DEATH", "minsec"),
      live: '<span style="color:' + c.T.white + '">' + c.label("LIVE COUNT", "names the running counter as live (time-based)") +
        "&nbsp; " + since(c) + "</span> " + c.copy("since you opened this page", "index.html:763"),
      src: c.copy("ACLED · Dec 2024 – Nov 2025", "index.html:765"),
    };
  }
  // The kept content as plain figures: hiPies (2) then humanStrip (4), live order.
  function contentItems(c) {
    var it = [];
    it.push({
      value: c.fig("humanImpactExtra.civilianShare", "pct"),
      text: c.copy("of those killed and wounded by explosive weapons in towns and cities are civilians, not combatants.", "js/main.js:301"),
      src: c.label("AOAV / UN", "js/main.js:302") + "&nbsp;↗",
    });
    it.push({
      value: c.fig("humanImpactExtra.childrenPct", "pct"),
      text: c.copy("of the ", "js/main.js:309") + c.fig("displacedStats.displaced", "raw") +
        c.copy(" million people displaced by war and persecution are children: about ", "js/main.js:309") +
        c.fig("humanImpactExtra.childrenDisplaced", "raw") + c.copy(" million.", "js/main.js:309"),
      src: c.fig("humanData[3].src", "raw", "same source string as main.js:310") + "&nbsp;↗",
    });
    [0, 2, 1, 4].forEach(function (i) {
      it.push({
        value: c.fig("humanData[" + i + "].num", "raw"),
        text: c.fig("humanData[" + i + "].unit", "raw"),
        src: c.fig("humanData[" + i + "].src", "raw") + "&nbsp;↗",
      });
    });
    return it;
  }
  // One cell: rule, value, text, source. Flows, so nothing can collide.
  function cell(c, d, o) {
    var T = c.T, TX = c.TX;
    return '<div style="border-top:1px solid ' + T.rule + ";padding-top:" + o.pad + 'px">' +
      '<div style="' + TX.value + ";font-size:" + o.vfs + 'px">' + d.value + "</div>" +
      '<div style="' + TX.bodySm + ";font-size:" + o.tfs + "px;line-height:" + (o.lh || 1.45) + ";margin-top:" + o.gap + 'px">' + d.text + "</div>" +
      '<div style="' + TX.src + ";font-size:" + o.sfs + "px;margin-top:" + (o.sgap != null ? o.sgap : 6) + 'px">' + d.src + "</div></div>";
  }
  // One row of a list: value column beside text and source.
  function row(c, d, o) {
    var T = c.T, TX = c.TX;
    return '<div style="display:flex;gap:' + o.colGap + "px;border-top:1px solid " + T.rule + ";padding:" + o.pad + "px 0 " + (o.pad + 2) + 'px">' +
      '<div style="flex:0 0 ' + o.valW + "px;" + TX.value + ";font-size:" + o.vfs + 'px;padding-top:1px">' + d.value + "</div>" +
      '<div style="flex:1 1 auto;min-width:0"><div style="' + TX.bodySm + ";font-size:" + o.tfs + 'px;line-height:1.4">' + d.text + "</div>" +
      '<div style="' + TX.src + ";font-size:" + o.sfs + 'px;margin-top:4px">' + d.src + "</div></div></div>";
  }
  function contentFlags(c) {
    c.flag("decision", "hiPies today read 'Most of those killed are civilians' / 'Up to 90%' and 'A third of the displaced are children'. data.js holds civilianShare 90 and childrenPct 38. Drawn with the data.js values and no headlines (audit F06, F08, F15, reviewer note on main.js:300-301). Approve the wording.");
    c.flag("decision", "hiPies donuts become plain figures with no ring (audit F06: brief §3 rebuilds donuts, §7 keeps hiPies as plain content).");
    c.flag("copy", "humanStrip labels and sources taken from humanData[].unit / .src in data.js, not main.js:398-414. Drops 'one every two minutes' (audit F16), 'the highest ever recorded' and 'including disease and collapse'. Sources named instead of 'source ↗'. Approve.");
  }
  function orderFlag(c) {
    c.flag("decision", "Order: the live page runs hiPies and humanStrip before the lives scene (index.html:744-745). These frames put them after the field, so 'What follows cannot' leads straight to the one point. humanStrip then repeats 244,700 just after the field states it; suggest the strip drops that item. Confirm both.");
  }

  /* ── the scene ─────────────────────────────────────────────────── */
  SB.scene({
    order: 12,
    id: "S12",
    name: "The Human Impact",
    move: "STILLNESS",
    screens: 2.0,
    restrained: true,
    anchor: "#humanPivot",
    trigger: "#humanPivot top (inside #impact), once S11's drained grey ladder has faded to black.",
    camera: "None. A fixed frame. Fades only.",
    reason:
      "The long black pause after the closing line shows that the story has stopped telling and now waits. 'When you're ready' hands the pace to the reader, so S13's blank sheet arrives only when they choose to move on.",
    frames: [
      { k: "in", p: 0, cap: "Black after S11's drain. One line: what follows cannot be counted in dollars. No chrome from here to the end of the scene." },
      { k: "one", p: 0.16, cap: "One point of light, held still from p 0.06 to 0.30 (about half a screen; today it holds for under a tenth). One line names it. No counter." },
      { k: "fade", p: 0.36, cap: "One slow fade, p 0.30 to 0.44: every point arrives at once, faint, already in place. Nothing grows, floods or shrinks. The first point holds." },
      { k: "field", p: 0.52, cap: "The field at rest: exactly 244,700 points, one per person, the held point among them; each is its own device pixel, none drawn over another. Below it, on black: the figure, the rate, the live count since opening and the source." },
      { k: "content", p: 0.74, cap: "The field fades out. hiPies and humanStrip follow as plain figures with sources: no donuts, no rings, no colour. (The live page has them before the field.)" },
      { k: "out", p: 1, cap: "A long black pause, p 0.84 to 1. The closing line, then 'When you're ready' as a still white link to #haveyoursay. S13's blank sheet appears from this black." },
    ],
    alts: [
      {
        k: "B",
        label: "CURRENT (for comparison)",
        frames: ["one", "field"],
        note:
          "The artwork as it is today (js/dossier.js:663-792), drawn on the 'one' and 'field' keys so each sits beside the brief's frame of the same key. 'one' = the flood under way: one point held for under a tenth of a screen, then points pour outward on a power-5 curve, each smaller than the last (5.5px to a speck), with a rising counter and a changing label. 'field' = the end: 244,700 and 'in a single year'. Removing this changes Blueprint's artwork: open decision 7.",
      },
    ],
    draw: function (c) {
      if (c.alt === "B") return drawCurrent(c);
      return c.phone ? drawPhone(c) : drawDesk(c);
    },
    // No-motion plate: the field at rest with every figure of the scene, still.
    plate: function (c) {
      return c.phone ? platePhone(c) : plateDesk(c);
    },
  });

  /* ── desktop ───────────────────────────────────────────────────── */
  var D_LIGHT = { x: 720, y: 330 };
  var D_SEED = 2447;
  // The one slow fade runs p 0.30 → 0.44 (see the 'fade' caption).
  function FADE(p) { return smooth(0.30, 0.44, p); }
  // The field fills the frame. A soft clearing at the foot holds the text.
  function dMask(x, y) {
    var dx = (x - 720) / 640, dy = (y - 740) / 205;
    return smooth(0.55, 1.05, dx * dx + dy * dy);
  }

  function drawDesk(c) {
    var T = c.T, TX = c.TX, k = c.k;
    var N = SB.get("DEATHS_PER_YEAR");

    if (k === "in") {
      c.div(120, 362, 1200, c.copy("The Human Impact", "index.html:739"), TX.label + ";text-align:center");
      c.div(120, 394, 1200, openLine(c), TX.body + ";font-size:38px;line-height:1.32;color:" + T.white + ";text-align:center");
      c.state({ form: "none (black)", tone: "neutral", note: "S11 ended with the ladder drained to grey; it fades to black here. Only the line." });
      return;
    }

    if (k === "one") {
      c.svg(image(heldOnly(T, c.W, c.H, 1, D_LIGHT), 0, 0, c.W, c.H));
      c.div(120, 732, 1200, c.copy("one person killed in armed conflict", "index.html:757"), TX.body + ";font-size:22px;text-align:center");
      c.state({ form: "one point of light", x: D_LIGHT.x, y: D_LIGHT.y, w: 11, h: 11, tone: "white", note: "the Sheet at its smallest: one person. Held still; no counter beside it." });
      return;
    }

    if (k === "fade" || k === "field") {
      var fade = k === "fade";
      var op = fade ? Math.round(FADE(c.p) * 100) / 100 : 1;
      var fld = restField(T, { w: c.W, h: c.H, dpr: 1, n: N, held: D_LIGHT, seed: D_SEED, mask: dMask });
      c.svg(image(fld.url, 0, 0, c.W, c.H, op));
      // the first point (one of the N) holds at full strength through the fade
      c.svg(image(heldOnly(T, c.W, c.H, 1, D_LIGHT), 0, 0, c.W, c.H));
      var f = figure(c);
      var fo = fade ? ";opacity:" + op : "";
      c.div(120, 628, 1200, f.value, TX.giant + ";font-size:104px;text-align:center" + fo);
      c.div(120, 732, 1200, f.unit, TX.body + ";font-size:22px;text-align:center" + fo);
      var sp = '<span style="display:inline-block;width:36px"></span>';
      c.div(120, 790, 1200, f.rate + sp + f.live + sp + f.src, TX.label + ";text-align:center" + fo);
      c.state({ form: fade ? "point + field fading in (opacity " + op + ")" : "field at rest", x: 0, y: 0, w: c.W, h: c.H, tone: "white / grey points", note: "exactly " + SB.FMT.int(N) + " points: the held point + " + SB.FMT.int(fld.scatter) + " distinct device pixels (DPR 1, checked by reading the canvas back), seeded scatter, " + pctOf(fld.fill) + " of the free pixels lit; soft clearing for the text" });
      if (!fade) {
        c.flag("decision", "Open decision 7: removing the flood changes Blueprint's artwork. Main frames show the brief's version (one point held longer, the whole field at rest in one slow fade, no counter, no shrinking, no changing labels). Alt B shows today's flood. Blueprint must approve.");
        c.flag("data", "Rate shown as 'one every 2 min 9 sec' from SECONDS_PER_DEATH (minsec), which no script reads today (audit F09/F16). humanStrip's 'one every two minutes' is not shown.");
        c.flag("data", "ACLED period: index.html:765 and the data.js:14 comment say Dec 2024 – Nov 2025; humanData[0].body and DATA-SOURCES.md say Nov 2024 – Nov 2025 (audit F17). Kept the on-page wording; needs a check.");
        c.flag("decision", "Live count since opening runs on time, not scroll (audit F18: the brief should exempt it from rule 9). Plain text, no aria-live. Labelled 'LIVE COUNT'. Footer type is brand grey, not today's #565b61 (audit F31).");
      }
      return;
    }

    if (k === "content") {
      var it = contentItems(c);
      c.div(120, 232, 1200,
        '<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:80px">' +
          it.slice(0, 2).map(function (d) { return cell(c, d, { pad: 20, vfs: 48, tfs: 17, sfs: 11, gap: 14 }); }).join("") + "</div>",
        "");
      c.div(120, 508, 1200,
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);column-gap:40px">' +
          it.slice(2).map(function (d) { return cell(c, d, { pad: 20, vfs: 40, tfs: 16, sfs: 11, gap: 12 }); }).join("") + "</div>",
        "");
      c.state({ form: "none", tone: "neutral", note: "the field has faded out; plain text on black" });
      contentFlags(c);
      orderFlag(c);
      return;
    }

    // out: the long black pause
    c.div(120, 330, 1200, closeLine(c), TX.body + ";font-size:46px;line-height:1.3;color:" + T.white + ";text-align:center");
    c.div(120, 560, 1200, readyLink(c, 18), "text-align:center");
    c.state({ form: "none (black)", tone: "neutral", note: "long black pause; S13 brings one blank sheet up from this black" });
  }

  /* ── phone: a separate design ──────────────────────────────────── */
  // The phone field is drawn at DPR 2 (the brief's cap). At DPR 1 the
  // phone stage (343 × 500) has fewer pixels than there are people.
  var P_DPR = 2;
  var P_SEED = 2448;
  // The field sits in the stage, feathered at every edge so it reads as
  // light, not as a sheet (its area means no money here). At DPR 2 the stage
  // holds about 462,000 mask-weighted pixels, so 244,700 distinct points light
  // about half of them: a squarer, tighter feather would read as a slab.
  function pMask(x, y) {
    var dx = (x - 171.5) / 171.5, dy = (y - 250) / 250;
    var d = Math.pow(Math.pow(Math.abs(dx), 4) + Math.pow(Math.abs(dy), 4), 0.25); // soft rounded field
    return smooth(1.0, 0.7, d);
  }

  function drawPhone(c) {
    var T = c.T, TX = c.TX, k = c.k, st = c.stage, tb = c.textBox;
    var N = SB.get("DEATHS_PER_YEAR");
    var LP = { x: st.w / 2, y: st.h / 2 - 20 }; // stage coordinates

    if (k === "in") {
      c.div(tb.x, tb.y, tb.w, c.copy("The Human Impact", "index.html:739"), TX.label + ";font-size:11px");
      c.div(tb.x, tb.y + 26, tb.w, openLine(c), TX.body + ";font-size:23px;line-height:1.36;color:" + T.white);
      c.state({ form: "none (black)", tone: "neutral", note: "S11's grey ladder has faded to black; the stage waits for the point" });
      return;
    }
    if (k === "one") {
      c.svg(image(heldOnly(T, st.w, st.h, P_DPR, LP), st.x, st.y, st.w, st.h));
      c.div(tb.x, tb.y, tb.w, c.copy("one person killed in armed conflict", "index.html:757"), TX.body + ";font-size:19px");
      c.state({ form: "one point of light", x: st.x + LP.x, y: st.y + LP.y, w: 11, h: 11, tone: "white", note: "the Sheet at its smallest: one person, held" });
      return;
    }
    if (k === "fade" || k === "field") {
      var fade = k === "fade";
      var op = fade ? Math.round(FADE(c.p) * 100) / 100 : 1;
      var fld = restField(T, { w: st.w, h: st.h, dpr: P_DPR, n: N, held: LP, seed: P_SEED, mask: pMask });
      c.svg(image(fld.url, st.x, st.y, st.w, st.h, op));
      c.svg(image(heldOnly(T, st.w, st.h, P_DPR, LP), st.x, st.y, st.w, st.h));
      var f = figure(c);
      var fo = fade ? ";opacity:" + op : "";
      c.div(tb.x, tb.y, tb.w, f.value, TX.giant + ";font-size:54px" + fo);
      c.div(tb.x, tb.y + 58, tb.w, f.unit, TX.bodySm + ";font-size:16px" + fo);
      c.div(tb.x, tb.y + 112, tb.w, f.rate + "<br>" + f.live + "<br>" + f.src, TX.label + ";font-size:10px;line-height:1.8" + fo);
      c.state({ form: fade ? "point + field fading in (opacity " + op + ")" : "field at rest", x: st.x, y: st.y, w: st.w, h: st.h, tone: "white / grey points", note: "exactly " + SB.FMT.int(N) + " points: the held point + " + SB.FMT.int(fld.scatter) + " distinct device pixels at DPR 2 inside the stage (checked by reading the canvas back), " + pctOf(fld.fill) + " of the free pixels lit, feathered at the edges" });
      if (!fade) c.flag("decision", "Open decision 7 (see desktop). Phone field drawn at DPR 2, the brief's cap: at DPR 1 the 343×500 stage has fewer pixels than there are people, so the points cannot all show. At DPR 2 they light " + pctOf(fld.fill) + " of the stage's free pixels, so on a phone the field reads as a dense haze, not separate lights.");
      return;
    }
    if (k === "content") {
      // No visual here: the kept figures run as one reading column.
      var it = contentItems(c);
      var o = { colGap: 12, valW: 88, vfs: 22, tfs: 14, sfs: 10, pad: 13 };
      c.div(16, 84, 343, it.slice(0, 2).map(function (d) { return row(c, d, o); }).join(""), "");
      c.div(16, 314, 343, it.slice(2).map(function (d) { return row(c, d, o); }).join(""), "");
      c.state({ form: "none", tone: "neutral", note: "field faded out; plain reading column that scrolls as normal text" });
      contentFlags(c);
      orderFlag(c);
      return;
    }
    // out
    c.div(16, 300, 343, closeLine(c), TX.body + ";font-size:26px;line-height:1.32;color:" + T.white + ";text-align:center");
    c.div(16, 520, 343, readyLink(c, 17), "text-align:center");
    c.state({ form: "none (black)", tone: "neutral", note: "long black pause; S13's blank sheet appears from black" });
  }

  /* ── no-motion plates ──────────────────────────────────────────── */
  // A soft pool of dark around the held point and its one line (1 person).
  // It thins the field (points are moved, not hidden), so the count holds.
  function underLight(at, rx, ry, dy) {
    return function (x, y) {
      var ex = (x - at.x) / rx, ey = (y - at.y - dy) / ry;
      return smooth(0.3, 1.0, ex * ex + ey * ey);
    };
  }
  function plateDesk(c) {
    var T = c.T, TX = c.TX;
    var N = SB.get("DEATHS_PER_YEAR");
    // the field on the left, feathered toward the text column
    var fw = 740, at = { x: 330, y: 430 };
    var clear = underLight(at, 235, 76, 22);
    var fld = restField(T, { w: fw, h: c.H, dpr: 1, n: N, held: at, drawHeld: true, seed: D_SEED, mask: function (x, y) { return smooth(fw, fw - 160, x) * clear(x, y); } });
    c.svg(image(fld.url, 0, 0, fw, c.H));
    c.div(at.x - 200, at.y + 28, 400, c.copy("one person killed in armed conflict", "index.html:757"), TX.bodySm + ";text-align:center;color:" + T.white);
    var f = figure(c);
    var it = contentItems(c).filter(function (d, i) { return i !== 2; }); // 244,700 is the figure above
    var html =
      '<div style="' + TX.label + '">' + c.copy("The Human Impact", "index.html:739") + "</div>" +
      '<div style="' + TX.bodySm + ";font-size:17px;color:" + T.white + ';margin-top:8px">' + openLine(c) + "</div>" +
      '<div style="' + TX.giant + ';font-size:66px;margin:22px 0 0 -3px">' + f.value + "</div>" +
      '<div style="' + TX.bodySm + ';font-size:17px;margin-top:8px">' + f.unit + "</div>" +
      '<div style="' + TX.label + ';font-size:11px;margin-top:8px;line-height:1.7">' + f.rate + "&nbsp;&nbsp;·&nbsp;&nbsp;" + f.live + "<br>" + f.src + "</div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:36px;row-gap:16px;margin-top:22px">' +
        it.map(function (d) { return cell(c, d, { pad: 10, vfs: 26, tfs: 14, sfs: 10, gap: 4 }); }).join("") + "</div>" +
      '<div style="' + TX.body + ";font-size:21px;line-height:1.3;color:" + T.white + ';margin-top:26px">' + closeLine(c) + "</div>" +
      '<div style="margin-top:6px">' + readyLink(c, 15) + "</div>";
    c.div(790, 44, 570, html, "");
    contentFlags(c);
    c.state({ form: "field at rest (static)", x: 0, y: 0, w: fw, h: c.H, tone: "white / grey points", note: "no fade, no hold: the end state with every figure. Exactly " + SB.FMT.int(N) + " points (the labelled held point + " + SB.FMT.int(fld.scatter) + " distinct pixels, " + pctOf(fld.fill) + " of the free pixels lit). The live count still runs" });
  }

  // Phone plate: the field is a band across the top, as tall as the figures
  // allow. 244,700 distinct points need room: at DPR 2 a 375-wide band must be
  // close to 300 px tall to keep the field under two-thirds lit. To make that
  // room, the kept figures sit in two short grids (2 + 3) instead of a list.
  function platePhone(c) {
    var T = c.T, TX = c.TX;
    var N = SB.get("DEATHS_PER_YEAR");
    var bh = 312, at = { x: c.W / 2, y: 114 };
    var clear = underLight(at, 172, 26, 16);
    var fld = restField(T, { w: c.W, h: bh, dpr: P_DPR, n: N, held: at, drawHeld: true, seed: P_SEED, mask: function (x, y) { return smooth(bh, bh - 62, y) * clear(x, y); } });
    c.svg(image(fld.url, 0, 0, c.W, bh));
    c.div(16, at.y + 19, 343, c.copy("one person killed in armed conflict", "index.html:757"), TX.bodySm + ";font-size:14px;line-height:1.3;text-align:center;color:" + T.white);
    var f = figure(c);
    var it = contentItems(c).filter(function (d, i) { return i !== 2; }); // 244,700 is the figure above
    var co = { pad: 7, vfs: 17, tfs: 14, lh: 1.36, sfs: 10, gap: 3, sgap: 3 };
    var html =
      '<div style="' + TX.giant + ';font-size:38px">' + f.value + "</div>" +
      '<div style="' + TX.bodySm + ';font-size:14px;line-height:1.35;margin-top:4px">' + f.unit + "</div>" +
      '<div style="' + TX.label + ';font-size:10px;line-height:1.6;margin:4px 0 10px">' + f.rate + "<br>" + f.live + "<br>" + f.src + "</div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:16px">' +
        it.slice(0, 2).map(function (d) { return cell(c, d, co); }).join("") + "</div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;column-gap:12px;margin-top:10px">' +
        it.slice(2).map(function (d) { return cell(c, d, co); }).join("") + "</div>" +
      '<div style="' + TX.bodySm + ";font-size:15px;line-height:1.35;color:" + T.white + ';margin-top:10px">' + closeLine(c) + "</div>" +
      "<div>" + readyLink(c, 14) + "</div>";
    c.div(16, bh - 40, 343, html, "");
    contentFlags(c);
    c.flag("decision", "Phone no-motion plate: to fit every figure on one screen the field gets a " + bh + " px band, where the points light " + pctOf(fld.fill) + " of the free pixels (near-solid static). Alternative for the no-motion page: give the field its own full-stage plate, as in the 'field' frame, and let the figures follow below it. Choose one.");
    c.state({ form: "field at rest (static)", x: 0, y: 0, w: c.W, h: bh, tone: "white / grey points", note: "all figures still; exactly " + SB.FMT.int(N) + " points (the labelled held point + " + SB.FMT.int(fld.scatter) + " distinct pixels at DPR 2, " + pctOf(fld.fill) + " of the free pixels lit: dense at phone size). The live count still runs" });
  }

  /* ── Alt B: the current artwork, for comparison ────────────────── */
  function drawCurrent(c) {
    var T = c.T, TX = c.TX, S = SB.SVG, ph = c.phone;
    var N = SB.get("DEATHS_PER_YEAR");
    var end = c.k !== "one";
    var P = 0.6; // pin progress shown for the mid-flood still
    var n = end ? N : Math.floor(N * Math.pow(P, 5));
    // today's stage is full-bleed, 100vh, on both desktop and phone
    var dpr = ph ? 2 : 1;
    c.svg(image(floodField(T, { w: c.W, h: c.H, dpr: dpr, n: n }), 0, 0, c.W, c.H));
    // the soft pool of dark behind the counter (dossier.css:1121-1136)
    var oy = c.H * 0.84; // overlay bottom = 16% from the bottom
    var cs = ph ? 48 : 128; // clamp(3rem, 11vw, 8rem)
    var ls = ph ? 11 : 14.7;
    var lh = ph ? 2 : 1;
    var cTop = oy - ls * 1.4 * lh - 11 - cs;
    c.svg('<defs><radialGradient id="s12pool"><stop offset="0" stop-color="' + T.ground + '" stop-opacity="0.92"/><stop offset="0.59" stop-color="' + T.ground + '" stop-opacity="0.72"/><stop offset="1" stop-color="' + T.ground + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="s12foot" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + T.ground + '" stop-opacity="0.95"/><stop offset="0.45" stop-color="' + T.ground + '" stop-opacity="0.8"/><stop offset="1" stop-color="' + T.ground + '" stop-opacity="0"/></linearGradient></defs>');
    var pw = ph ? 380 : 820, phh = ph ? 300 : 420;
    c.svg('<ellipse cx="' + c.W / 2 + '" cy="' + (cTop + (oy - cTop) / 2) + '" rx="' + pw / 2 + '" ry="' + phh / 2 + '" fill="url(#s12pool)"/>');
    c.svg(S.rect(0, c.H - 112, c.W, 112, { fill: "url(#s12foot)" }));
    var count = end ? c.fig("DEATHS_PER_YEAR", "int")
      : c.sample(SB.FMT.int(n), "CURRENT version: dossier.js:761 floor(DEATHS_PER_YEAR × p^5) at pin progress p = 0.6");
    var label = end ? c.copy("in a single year", "js/dossier.js:746")
      : c.copy("every point is one person who wanted to live", "js/dossier.js:745");
    c.div(0, cTop, c.W, count, TX.giant + ";font-size:" + cs + "px;line-height:1;text-align:center");
    c.div(ph ? 40 : 420, cTop + cs + 11, ph ? c.W - 80 : 600, label, TX.label + ";font-weight:400;font-size:" + ls + "px;color:" + T.soft + ";text-align:center;text-transform:none");
    // footer: rate · since · source (live: 9.3px in #565b61; drawn at 10px grey here)
    var br = ph ? "<br>" : '<span style="display:inline-block;width:22px"></span>';
    var foot = c.copy("one every ", "index.html:761") + c.fig("SECONDS_PER_DEATH", "minsec") + br +
      '<span style="color:' + T.white + '">' + since(c) + "</span> " + c.copy("since you opened this page", "index.html:763") + br +
      c.copy("ACLED · Dec 2024 – Nov 2025", "index.html:765");
    c.div(16, c.H - (ph ? 92 : 50), c.W - 32, foot, TX.label + ";font-size:10px;letter-spacing:0.16em;text-align:center;line-height:1.7");
    // storyboard annotation (not site copy)
    var tag = c.label("CURRENT (FOR COMPARISON)", "storyboard annotation, not site copy") + " · " +
      (end ? c.label("END OF FLOOD", "storyboard annotation") : c.label("MID-FLOOD", "storyboard annotation"));
    c.div(ph ? 16 : 40, ph ? 16 : 30, null, tag, TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px;padding:6px 10px;border:1px solid " + T.sheetLine + ";background:" + T.ground);
    c.state({ form: end ? "flooded field (current)" : "field flooding (current)", x: 0, y: 0, w: c.W, h: c.H, tone: "white points", note: end ? SB.FMT.int(N) + " drawn (DEATHS_PER_YEAR), counter at the total, label 'in a single year'" : "pin at p = " + P + ": " + SB.FMT.int(n) + " of " + SB.FMT.int(N) + " drawn on the power-5 curve; points shrink from 5.5px to a speck as they come" });
    c.flag("decision", "Open decision 7: this is today's flood, drawn for comparison. The brief removes the flood, the rising counter, the shrinking points and the changing labels ('still countable', 'you have already stopped counting', 'every point is one person who wanted to live', 'in a single year'). Blueprint must approve.");
    if (!end) c.flag("data", "Today the counter reads '0' under the label 'one person killed in armed conflict' for the first 4% of the pin (audit, dossier.js:742/761). The brief version shows no counter.");
  }
})();
