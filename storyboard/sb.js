/* ═══════════════════════════════════════════════════════════════════
   STORYBOARD FRAMEWORK · Phase 1 stills for the scroll rebuild.
   Not part of the live site. Nothing here is loaded by index.html.

   Rules this file enforces:
   - Every figure comes from js/data.js through c.fig(path, fmt).
     A figure that is not in data.js can only be shown with c.missing(),
     which flags it on the review page.
   - Every line of copy is logged with its source (c.copy) or flagged as
     new copy (c.newCopy).
   - Only brand colours (SB.T). Only the three brand faces (SB.F).
   - Sheet sizes that mean money use true area: SB.area().
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Brand tokens ─────────────────────────────────────────────── */
  var T = {
    ground: "#0A0A0A",
    white: "#FFFFFF",
    soft: "#C4C9CF", // body copy on ground, 11.9:1
    grey: "#8A9099", // labels, units, second readings, 6.2:1
    rule: "rgba(255,255,255,0.16)",
    faint: "rgba(255,255,255,0.07)",
    sheet: "#121315", // paper on black: neutral, never tinted
    sheetLine: "rgba(255,255,255,0.28)",
    red: "#E8362B", // Cost red: what war takes
    blue: "#3C8FDE", // Alternative blue: what the money could build
    ember: "#8F1B14", // support only, never a live figure
    deep: "#0E2A44", // support only, never a live figure
  };
  var F = {
    display: "'Archivo Black', Arial, sans-serif",
    sans: "'IBM Plex Sans', Arial, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  };
  var SIZES = { desktop: { W: 1440, H: 900 }, phone: { W: 375, H: 812 } };
  // Phone: visual about 60% of the screen, text below (brief §11).
  var PHONE_STAGE = { x: 16, y: 56, w: 343, h: 500 };
  var PHONE_TEXT = { x: 16, y: 572, w: 343, h: 220 };
  var DESK_STAGE = { x: 0, y: 0, w: 1440, h: 900 };

  /* ── Data access ──────────────────────────────────────────────── */
  // 'DEFENCE', 'displacedStats.appeal', 'topSpenders[0].amt', 'machineData[3].amt'
  function get(path) {
    var parts = String(path).replace(/\[(\d+)\]/g, ".$1").split(".");
    var v;
    try {
      v = (0, eval)(parts[0]); // top-level const in js/data.js is not on window
    } catch (e) {
      throw new Error("SB.get: " + parts[0] + " is not defined in js/data.js");
    }
    for (var i = 1; i < parts.length; i++) {
      if (v == null || !(parts[i] in Object(v)))
        throw new Error("SB.get: no field " + path);
      v = v[parts[i]];
    }
    return v;
  }
  // Formats that reproduce the strings the live page prints.
  var FMT = {
    T: function (v) { return "$" + +(v / 1000).toFixed(2) + "T"; }, // 2887 → $2.89T
    B: function (v) { return "$" + v + "B"; }, // 954 → $954B
    M: function (v) { return v + "M"; }, // 117.8 → 117.8M
    Mword: function (v) { return v + " million"; },
    pct: function (v) { return v + "%"; },
    ppct: function (v) { return "+" + v + "%"; },
    int: function (v) { return Number(v).toLocaleString("en-US"); },
    usd: function (v) { return "$" + Number(v).toLocaleString("en-US"); },
    oneIn: function (v) { return "1 in " + v; },
    minsec: function (s) {
      var m = Math.floor(s / 60), r = Math.round(s - m * 60);
      return m + " min " + r + " sec";
    },
    raw: function (v) { return String(v); },
  };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function css(o) {
    if (typeof o === "string") return o;
    var out = [];
    for (var k in o) out.push(k.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); }) + ":" + o[k]);
    return out.join(";");
  }

  /* ── Text presets (brand type roles) ──────────────────────────── */
  var TX = {
    // IBM Plex Mono: labels, units, sources, second readings
    label: "font-family:" + F.mono + ";font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:" + T.grey + ";line-height:1.35",
    labelW: "font-family:" + F.mono + ";font-size:12px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:" + T.white + ";line-height:1.35",
    src: "font-family:" + F.mono + ";font-size:11px;font-weight:400;letter-spacing:0.06em;color:" + T.grey + ";line-height:1.4",
    // IBM Plex Sans: body and values
    body: "font-family:" + F.sans + ";font-size:19px;font-weight:400;line-height:1.5;color:" + T.soft,
    bodySm: "font-family:" + F.sans + ";font-size:16px;font-weight:400;line-height:1.5;color:" + T.soft,
    value: "font-family:" + F.sans + ";font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-0.01em;line-height:1;color:" + T.white,
    // Archivo Black: giant numbers and titles
    title: "font-family:" + F.display + ";font-weight:400;text-transform:uppercase;letter-spacing:-0.01em;line-height:0.92;color:" + T.white,
    giant: "font-family:" + F.display + ";font-weight:400;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;line-height:0.9;color:" + T.white,
  };

  /* ── SVG helpers (return strings) ─────────────────────────────── */
  function attrs(o) {
    var s = "";
    for (var k in o) if (o[k] != null) s += " " + k + '="' + esc(o[k]) + '"';
    return s;
  }
  var DEFS =
    "<defs>" +
    // Paper: a sheet has weight. Slight falloff across the face, a soft shadow under it.
    '<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1B1D20"/><stop offset="0.55" stop-color="#121315"/><stop offset="1" stop-color="#0D0E10"/></linearGradient>' +
    '<filter id="sheetShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.75"/></filter>' +
    '<radialGradient id="poolDeep"><stop offset="0" stop-color="#0E2A44" stop-opacity="0.5"/><stop offset="0.55" stop-color="#0E2A44" stop-opacity="0.14"/><stop offset="1" stop-color="#0E2A44" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="poolEmber"><stop offset="0" stop-color="#8F1B14" stop-opacity="0.38"/><stop offset="0.5" stop-color="#8F1B14" stop-opacity="0.1"/><stop offset="1" stop-color="#8F1B14" stop-opacity="0"/></radialGradient>' +
    ["red", "blue", "grey", "white"].map(function (t) {
      var col = t === "grey" ? T.grey : t === "white" ? T.white : T[t];
      return '<pattern id="hatch-' + t + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="' + col + '" stroke-width="1" stroke-opacity="0.55"/></pattern>';
    }).join("") +
    "</defs>";

  function tone(t) {
    return t === "red" ? T.red : t === "blue" ? T.blue : t === "white" ? T.white : t === "ember" ? T.ember : t === "deep" ? T.deep : T.grey;
  }

  var SVG = {
    rect: function (x, y, w, h, o) {
      return "<rect" + attrs(Object.assign({ x: x, y: y, width: Math.max(0, w), height: Math.max(0, h) }, o || {})) + "/>";
    },
    line: function (x1, y1, x2, y2, o) {
      return "<line" + attrs(Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2, stroke: T.rule, "stroke-width": 1 }, o || {})) + "/>";
    },
    path: function (d, o) {
      return "<path" + attrs(Object.assign({ d: d, fill: "none", stroke: T.rule, "stroke-width": 1 }, o || {})) + "/>";
    },
    circle: function (cx, cy, r, o) {
      return "<circle" + attrs(Object.assign({ cx: cx, cy: cy, r: r, fill: T.white }, o || {})) + "/>";
    },
    text: function (x, y, s, o) {
      o = o || {};
      return "<text" + attrs({ x: x, y: y, fill: o.fill || T.grey, "font-family": o.family || F.mono, "font-size": o.size || 11, "font-weight": o.weight || 500, "letter-spacing": o.ls || "0.1em", "text-anchor": o.anchor || "start", opacity: o.opacity }) + ">" + esc(s) + "</text>";
    },
    // The Sheet. mode: 'edge' (neutral paper, coloured edge) | 'outline' | 'solid' | 'hatch'
    sheet: function (x, y, w, h, o) {
      o = o || {};
      var col = tone(o.tone || "grey");
      var mode = o.mode || "edge";
      var sw = o.sw != null ? o.sw : 1.5;
      var op = o.opacity != null ? o.opacity : 1;
      var s = '<g opacity="' + op + '">';
      if (mode === "solid") s += SVG.rect(x, y, w, h, { fill: col });
      else if (mode === "hatch") s += SVG.rect(x, y, w, h, { fill: T.sheet }) + SVG.rect(x, y, w, h, { fill: "url(#hatch-" + (o.tone || "grey") + ")" });
      else if (mode === "edge") {
        s += SVG.rect(x, y, w, h, { fill: "url(#paper)", filter: o.flat ? null : "url(#sheetShadow)" });
        s += SVG.line(x + 1, y + 1, x + w - 1, y + 1, { stroke: "rgba(255,255,255,0.14)" }); // light catching the top edge
      }
      if (mode !== "solid") s += SVG.rect(x + sw / 2, y + sw / 2, w - sw, h - sw, { fill: "none", stroke: col, "stroke-width": sw, "stroke-dasharray": o.dash || null });
      if (o.tab) {
        var ts = o.tabSize || 10;
        s += SVG.rect(x, y, ts, ts, { fill: col });
      }
      return s + "</g>";
    },
    // Cross grid with tick (brand device)
    grid: function (x, y, w, h, step, o) {
      o = o || {};
      var s = "<g>";
      var c = o.color || T.faint;
      for (var gx = x; gx <= x + w + 0.1; gx += step) s += SVG.line(gx, y, gx, y + h, { stroke: c });
      for (var gy = y; gy <= y + h + 0.1; gy += step) s += SVG.line(x, gy, x + w, gy, { stroke: c });
      if (o.ticks !== false)
        for (gx = x; gx <= x + w + 0.1; gx += step)
          for (gy = y; gy <= y + h + 0.1; gy += step)
            s += SVG.path("M" + (gx - 3) + " " + gy + " H" + (gx + 3) + " M" + gx + " " + (gy - 3) + " V" + (gy + 3), { stroke: "rgba(255,255,255,0.22)" });
      return s + "</g>";
    },
    // Pattern recognition: four corner brackets. locked → solid, snapped.
    brackets: function (x, y, w, h, o) {
      o = o || {};
      var L = o.len || Math.min(24, w / 4, h / 3);
      var col = o.color || T.white;
      var sw = o.sw || 1.5;
      var d =
        "M" + x + " " + (y + L) + " V" + y + " H" + (x + L) +
        " M" + (x + w - L) + " " + y + " H" + (x + w) + " V" + (y + L) +
        " M" + (x + w) + " " + (y + h - L) + " V" + (y + h) + " H" + (x + w - L) +
        " M" + (x + L) + " " + (y + h) + " H" + x + " V" + (y + h - L);
      return SVG.path(d, { stroke: col, "stroke-width": sw, opacity: o.opacity });
    },
    // Thin leader line with a small square anchor where it lands.
    leader: function (pts, o) {
      o = o || {};
      var d = "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L");
      var a = pts[0];
      return SVG.path(d, { stroke: o.color || "rgba(255,255,255,0.55)", "stroke-width": 1 }) +
        SVG.rect(a[0] - 2.5, a[1] - 2.5, 5, 5, { fill: o.anchor || T.white });
    },
    // Red progress tick: grey scale with a fill.
    tick: function (x, y, w, frac, o) {
      o = o || {};
      var n = o.n || 12;
      var s = SVG.line(x, y, x + w, y, { stroke: "rgba(255,255,255,0.18)", "stroke-width": 2 });
      for (var i = 0; i <= n; i++) s += SVG.line(x + (w * i) / n, y - 4, x + (w * i) / n, y + 4, { stroke: "#2A2E33" });
      s += SVG.rect(x, y - 2, w * Math.max(0, Math.min(1, frac)), 4, { fill: o.color || T.white });
      return s;
    },
  };

  /* ── Scale: true area ─────────────────────────────────────────── */
  // A rung of `value` drawn at the frame's aspect, where `fit` fills `box`.
  function area(value, fit, box) {
    var k = Math.sqrt(value / fit);
    return { w: box.w * k, h: box.h * k };
  }
  // Anchored rect. anchor: 'bl' | 'br' | 'tl' | 'tr'
  function rungAt(value, fit, box, anchor) {
    var a = area(value, fit, box);
    anchor = anchor || "bl";
    var x = anchor[1] === "l" ? box.x : box.x + box.w - a.w;
    var y = anchor[0] === "t" ? box.y : box.y + box.h - a.h;
    return { x: x, y: y, w: a.w, h: a.h, value: value };
  }
  // Continuous camera between two fit values (log-linear, so each doubling
  // of scale takes the same scroll).
  function fitBetween(a, b, p) {
    return a * Math.pow(b / a, Math.max(0, Math.min(1, p)));
  }

  /* ── Scenes ───────────────────────────────────────────────────── */
  var scenes = [];
  var byId = {};
  function scene(def) {
    if (byId[def.id]) throw new Error("duplicate scene " + def.id);
    def.frames = def.frames || [
      { k: "in", p: 0 },
      { k: "mid", p: 0.5 },
      { k: "out", p: 1 },
    ];
    def.alts = def.alts || [];
    scenes.push(def);
    byId[def.id] = def;
    scenes.sort(function (a, b) { return a.order - b.order; });
  }
  // Story position in screens (desktop). Handover scenes have no length.
  function positions() {
    var at = 0, out = {};
    scenes.forEach(function (s) {
      if (s.screens == null) return;
      out[s.id] = { start: at, end: at + s.screens };
      at += s.screens;
    });
    out.total = at;
    return out;
  }

  /* ── Draw context ─────────────────────────────────────────────── */
  function Ctx(sc, frame, variant, opts) {
    var S = SIZES[variant];
    this.scene = sc;
    this.W = S.W;
    this.H = S.H;
    this.variant = variant;
    this.phone = variant === "phone";
    this.desk = !this.phone;
    this.k = frame.k;
    this.p = frame.p;
    this.frame = frame;
    this.alt = opts.alt || null;
    this.plate = !!opts.plate;
    this.stage = Object.assign({}, this.phone ? PHONE_STAGE : DESK_STAGE);
    this.textBox = this.phone ? Object.assign({}, PHONE_TEXT) : null;
    this.T = T;
    this.F = F;
    this.TX = TX;
    // Two layers: 'world' (moved by the camera) and 'ui' (fixed to the screen).
    this._svg = [];
    this._html = [];
    this._uiSvg = [];
    this._uiHtml = [];
    this._bgSvg = [];
    this._cam = null;
    this.log = { figs: [], copy: [], flags: [], state: [], rungs: [] };
  }
  Ctx.prototype.svg = function (s) { this._svg.push(s); return this; };
  Ctx.prototype.html = function (s) { this._html.push(s); return this; };
  Ctx.prototype.uiSvg = function (s) { this._uiSvg.push(s); return this; };
  // Fixed to the screen and drawn behind the world (e.g. a grid the camera does not move).
  Ctx.prototype.bgSvg = function (s) { this._bgSvg.push(s); return this; };
  // Absolutely positioned text block. w may be null (auto).
  // extra: raw attribute string, or { ui: true } to place it on the fixed layer.
  Ctx.prototype.div = function (x, y, w, content, style, extra) {
    var ui = extra && typeof extra === "object" && extra.ui;
    var attr = typeof extra === "string" ? extra : "";
    var st = "position:absolute;left:" + x + "px;top:" + y + "px;" + (w != null ? "width:" + w + "px;" : "") + css(style || "");
    (ui ? this._uiHtml : this._html).push("<div" + attr + ' style="' + st + '">' + content + "</div>");
    return this;
  };
  Ctx.prototype.uiDiv = function (x, y, w, content, style) {
    return this.div(x, y, w, content, style, { ui: true });
  };
  // Camera: draw the world at scale s so that world point (fx, fy) lands on
  // screen point (sx, sy). Only the world layer moves; UI stays put.
  // Tilt the world in 3D (degrees), about the frame centre, like a camera
  // looking at paper on a table. o: { rx, ry, rz, persp }
  Ctx.prototype.tilt = function (o) {
    this._tilt = Object.assign({ rx: 0, ry: 0, rz: 0, persp: 1600 }, o || {});
    return this;
  };
  Ctx.prototype.camera = function (s, fx, fy, sx, sy) {
    if (sx == null) { sx = fx; sy = fy; }
    this._cam = { s: s, tx: sx - s * fx, ty: sy - s * fy };
    return this;
  };
  // A figure from js/data.js. Returns the display string.
  Ctx.prototype.fig = function (path, fmt, note) {
    var v = get(path);
    var f = FMT[fmt || "raw"];
    if (!f) throw new Error("unknown format " + fmt);
    var shown = f(v);
    this.log.figs.push({ path: path, value: v, shown: shown, note: note || "" });
    return esc(shown);
  };
  // A figure that data.js holds only inside a sentence (no numeric field).
  // Checked: `shown` must appear in that field's text. Flagged on the page.
  Ctx.prototype.prose = function (shown, path, note) {
    var txt = String(get(path));
    if (txt.indexOf(shown) < 0) throw new Error("SB.prose: '" + shown + "' not found in " + path);
    this.log.figs.push({ path: path + " (prose only)", value: null, shown: shown, note: note || "" });
    this.log.flags.push({ kind: "prose-only", text: shown + " is only inside a sentence in " + path + "; needs a number field" });
    return esc(shown);
  };
  // Same as fig, but with a sample value derived from data.js (e.g. a live
  // counter reading). The derivation is shown on the review page.
  Ctx.prototype.sample = function (shown, how) {
    this.log.figs.push({ path: "sample", value: null, shown: shown, note: how });
    return esc(shown);
  };
  // A figure that is NOT in js/data.js. Always flagged.
  Ctx.prototype.missing = function (shown, why) {
    this.log.figs.push({ path: "NOT IN data.js", value: null, shown: shown, note: why });
    this.log.flags.push({ kind: "not-in-data", text: shown + " — " + why });
    return esc(shown);
  };
  Ctx.prototype.copy = function (text, src) {
    this.log.copy.push({ src: src, text: text });
    return esc(text);
  };
  // Short mono labels and source codes (brand device). Logged, not flagged.
  Ctx.prototype.label = function (text, why) {
    this.log.copy.push({ src: "label", text: text, why: why || "" });
    return esc(text);
  };
  Ctx.prototype.newCopy = function (text, why) {
    this.log.copy.push({ src: "NEW", text: text, why: why || "" });
    this.log.flags.push({ kind: "new-copy", text: "“" + text + "”" + (why ? " — " + why : "") });
    return esc(text);
  };
  Ctx.prototype.flag = function (kind, text) {
    this.log.flags.push({ kind: kind, text: text });
    return this;
  };
  Ctx.prototype.state = function (o) {
    this.log.state.push(o);
    return this;
  };
  // Draw a money rung at true area and log its accuracy.
  Ctx.prototype.rung = function (path, fit, box, anchor) {
    var v = get(path);
    var r = rungAt(v, fit, box, anchor);
    var trueArea = (box.w * box.h * v) / fit;
    this.log.rungs.push({ path: path, value: v, w: r.w, h: r.h, err: (r.w * r.h) / trueArea - 1 });
    return r;
  };
  // Dossier overlay for the energetic scenes (S00–S08). Off in restrained
  // scenes and plates. Drawn after the scene so it can track the Sheet.
  // o.labels === false: hero mode (no file labels, no tracking box).
  Ctx.prototype.chrome = function (o) {
    if (this.scene.restrained || this.plate) return this;
    this._chrome = o || {};
    return this;
  };

  function overlay(c, o) {
    var W = c.W, H = c.H, ph = c.phone, sc = c.scene;
    var pos = positions();
    var at = pos[sc.id];
    var here = at ? at.start + c.p * (at.end - at.start) : 0;
    var frac = at ? here / pos.total : 1;
    var ins = ph ? 8 : 20, L = ph ? 16 : 28;
    var ink = "rgba(255,255,255,0.85)";
    // crop marks
    c.uiSvg(SVG.path("M" + ins + " " + (ins + L) + " V" + ins + " H" + (ins + L) + " M" + (W - ins - L) + " " + ins + " H" + (W - ins) + " V" + (ins + L) + " M" + (W - ins) + " " + (H - ins - L) + " V" + (H - ins) + " H" + (W - ins - L) + " M" + (ins + L) + " " + (H - ins) + " H" + ins + " V" + (H - ins - L), { stroke: ink, "stroke-width": 1.5 }));
    // scan line: a hairline that travels down the frame with scroll
    var sy = (ph ? 60 : 70) + c.p * (H - (ph ? 120 : 150));
    c.uiSvg(SVG.line(0, sy, W, sy, { stroke: "rgba(255,255,255,0.16)" }));
    c.uiSvg(SVG.line(W - (ph ? 70 : 120), sy, W - ins, sy, { stroke: "rgba(255,255,255,0.6)" }));
    c.uiDiv(W - (ph ? 70 : 120), sy - 15, null, "SCAN", TX.label + ";font-size:9px;color:rgba(255,255,255,0.7)");
    var pad = ph ? 16 : 40, y = ph ? 18 : 30;
    if (o.labels !== false) {
      c.uiDiv(pad, y - 8, null, "THE COST OF WAR", TX.labelW + ";font-size:11px");
      c.uiDiv(pad, y + 8, null, esc("FILE " + sc.id.replace("S", "") + " · " + sc.name), TX.label + ";font-size:10px");
    }
    // readouts, top right
    var r1 = '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#fff;margin-right:7px;vertical-align:0"></span>REC';
    var r2 = esc((ph ? "" : "SCROLL ") + here.toFixed(1) + " / " + pos.total.toFixed(1));
    var r3 = esc("MOVE · " + sc.move);
    c.uiDiv(W - pad - 260, y - 8, 260, r1 + (ph ? "" : " &nbsp;&nbsp;" + r2), TX.labelW + ";font-size:" + (ph ? 10 : 11) + "px;text-align:right");
    c.uiDiv(W - pad - 260, y + 8, 260, ph ? r2 + " · " + esc(sc.move) : r3, TX.label + ";font-size:10px;text-align:right");
    // left rail with a position marker (desktop)
    if (!ph) {
      var top = 140, bot = H - 140;
      var rail = SVG.line(26, top, 26, bot, { stroke: "rgba(255,255,255,0.18)" });
      for (var ty = top; ty <= bot; ty += 24) rail += SVG.line(26, ty, ty % 120 === top % 120 ? 36 : 31, ty, { stroke: "rgba(255,255,255,0.28)" });
      var my = top + c.p * (bot - top);
      rail += SVG.path("M22 " + (my - 5) + " L30 " + my + " L22 " + (my + 5) + " Z", { fill: "#fff", stroke: "none" });
      c.uiSvg(rail);
    }
    // the red progress tick: the one moving red mark, with scene markers
    var bx = pad, bw = W - pad * 2, byy = H - (ph ? 14 : 26);
    c.uiSvg(SVG.tick(bx, byy, bw, frac, { n: ph ? 8 : 18, color: T.red }));
    if (!ph) scenes.forEach(function (s2) {
      var a = pos[s2.id];
      if (!a) return;
      var x = bx + (bw * a.start) / pos.total;
      c.uiSvg(SVG.line(x, byy - 8, x, byy + 8, { stroke: s2.id === sc.id ? "#fff" : "rgba(255,255,255,0.35)" }));
      if (s2.id === sc.id) c.uiDiv(x + 4, byy - 22, null, esc(s2.id), TX.labelW + ";font-size:9px");
    });
    // tracking box on the Sheet (not on the hero, not on places where people live: S07)
    var st = null;
    for (var i = c.log.state.length - 1; i >= 0; i--) if (c.log.state[i].w > 0 && c.log.state[i].h > 0) { st = c.log.state[i]; break; }
    if (o.labels !== false && st && sc.id !== "S07" && !sc.noLock) {
      var cam = c._cam || { s: 1, tx: 0, ty: 0 };
      var bxx = st.x * cam.s + cam.tx, byx = st.y * cam.s + cam.ty, bww = st.w * cam.s, bhh = st.h * cam.s;
      var full = bww >= W * 0.9 && bhh >= (ph ? 450 : H * 0.9);
      if (!full && bww > 8 && bhh > 8) {
        var lock = c.p >= 0.5;
        var g = lock ? 6 : 18;
        c.uiSvg(SVG.brackets(bxx - g, byx - g, bww + g * 2, bhh + g * 2, { len: ph ? 10 : 14, sw: lock ? 1.5 : 1, opacity: lock ? 0.95 : 0.6 }));
        var form = String(st.form || "sheet").split(/[(+:,;]/)[0].trim().toUpperCase();
        if (form.length > 22) form = form.slice(0, 21).trim() + "…";
        var tag = (lock ? "LOCKED · " : "ACQUIRING · ") + form;
        var tagW = tag.length * 6.6 + 14;
        var tx = Math.max(ins + 4, Math.min(bxx - g, W - ins - 4 - tagW)), tyy = Math.max(ins + 40, byx - g - 20);
        c.uiDiv(tx, tyy, null, esc(tag), TX.labelW + ";font-size:9px;background:#0A0A0A;padding:2px 6px;white-space:nowrap");
      }
    }
  }

  // Atmosphere: cold light behind the Sheet, film grain, vignette.
  // Restrained scenes get the vignette only.
  var GRAIN = null;
  function grain() {
    if (GRAIN !== null) return GRAIN;
    try {
      var cv = document.createElement("canvas");
      cv.width = cv.height = 160;
      var x = cv.getContext("2d"), d = x.createImageData(160, 160), seed = 7;
      for (var i = 0; i < d.data.length; i += 4) {
        seed = (seed * 16807) % 2147483647;
        var v = seed % 256;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      GRAIN = cv.toDataURL("image/png");
    } catch (e) { GRAIN = ""; }
    return GRAIN;
  }
  function atmosphere(c) {
    var sc = c.scene;
    var st0 = null;
    for (var j = c.log.state.length - 1; j >= 0; j--) if (c.log.state[j].w > 0 && c.log.state[j].h > 0) { st0 = c.log.state[j]; break; }
    if (!sc.restrained && sc.screens != null && st0) {
      var st = null;
      for (var i = c.log.state.length - 1; i >= 0; i--) if (c.log.state[i].w > 0 && c.log.state[i].h > 0) { st = c.log.state[i]; break; }
      var cam = c._cam || { s: 1, tx: 0, ty: 0 };
      var cx, cy, r;
      if (st) { cx = (st.x + st.w / 2) * cam.s + cam.tx; cy = (st.y + st.h / 2) * cam.s + cam.ty; r = Math.max(st.w, st.h) * cam.s * 0.8; }
      else { cx = c.W / 2; cy = c.H / 2; r = c.W * 0.6; }
      r = Math.max(r, c.phone ? 260 : 520);
      var warm = st && /^\s*red/i.test(String(st.tone || "")); // only sheets that ARE war figures
      c._bgSvg.unshift('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + r * 0.8 + '" fill="url(#' + (warm ? "poolEmber" : "poolDeep") + ')"/>');
    }
    var g = sc.restrained ? "" : grain();
    // a soft key light falling across the frame, upper left, so sheets read as lit objects
    var key = sc.restrained ? "" : '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 30% 22%, rgba(255,255,255,0.05), rgba(255,255,255,0) 70%)"></div>';
    return key + (g ? '<div style="position:absolute;inset:0;pointer-events:none;background-image:url(' + g + ');background-size:160px;opacity:0.06"></div>' : "") +
      '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 100%)"></div>';
  }

  function build(sceneId, frameKey, variant, opts) {
    opts = opts || {};
    var sc = byId[sceneId];
    if (!sc) throw new Error("no scene " + sceneId);
    var frame;
    if (opts.plate) frame = { k: "plate", p: 1 };
    else frame = sc.frames.filter(function (f) { return f.k === frameKey; })[0];
    if (!frame) throw new Error("no frame " + sceneId + "/" + frameKey);
    var c = new Ctx(sc, frame, variant, opts);
    if (opts.plate && sc.plate) sc.plate(c);
    else sc.draw(c);
    if (c._chrome) overlay(c, c._chrome);
    var fx = atmosphere(c);
    var node = document.createElement("div");
    node.className = "sb-frame";
    node.style.cssText = "position:relative;overflow:hidden;width:" + c.W + "px;height:" + c.H + "px;background:" + T.ground + ";color:" + T.white;
    var cam = c._cam, tl = c._tilt;
    var camCss = cam ? "transform-origin:0 0;transform:translate(" + cam.tx + "px," + cam.ty + "px) scale(" + cam.s + ");" : "";
    var tiltCss = tl ? "transform-origin:50% 50%;transform:perspective(" + tl.persp + "px) rotateX(" + tl.rx + "deg) rotateY(" + tl.ry + "deg) rotateZ(" + tl.rz + "deg);" : "";
    var box = "position:absolute;left:0;top:0;width:" + c.W + "px;height:" + c.H + "px;";
    var svgOpen = '<svg width="' + c.W + '" height="' + c.H + '" viewBox="0 0 ' + c.W + " " + c.H + '" style="position:absolute;left:0;top:0;overflow:visible" xmlns="http://www.w3.org/2000/svg">' + DEFS;
    node.innerHTML =
      // fixed background (grid, light pool)
      svgOpen + c._bgSvg.join("") + "</svg>" +
      // the world: tilted in 3D, then moved by the camera
      '<div class="sb-tilt" style="' + box + tiltCss + '"><div class="sb-camwrap" style="' + box + camCss + '">' +
      svgOpen + c._svg.join("") + "</svg>" +
      '<div class="sb-html sb-world' + (cam || tl ? " sb-cam" : "") + '" style="' + box + '">' + c._html.join("") + "</div>" +
      "</div></div>" +
      // atmosphere, then fixed UI on top
      fx + svgOpen + c._uiSvg.join("") + "</svg>" +
      '<div class="sb-html sb-ui" style="position:absolute;inset:0">' + c._uiHtml.join("") + "</div>";
    return { node: node, log: c.log, ctx: c };
  }

  window.SB = {
    T: T, F: F, TX: TX, SVG: SVG, FMT: FMT, SIZES: SIZES,
    PHONE_STAGE: PHONE_STAGE, PHONE_TEXT: PHONE_TEXT,
    get: get, esc: esc, area: area, rungAt: rungAt, fitBetween: fitBetween,
    scene: scene, scenes: scenes, byId: byId, positions: positions, build: build,
  };
})();
