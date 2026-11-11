/* STORY ENGINE · API and rules: js/story/README.md */
(function () {
  "use strict";
  var Story = (window.Story = window.Story || {});
  var OPENED = Date.now();
  var BASE = ((document.currentScript || {}).src || "").replace(/[^/]*$/, "");
  var NS = "http://www.w3.org/2000/svg";
  var C = { ground: "#0A0A0A", white: "#FFFFFF", red: "#E8362B", blue: "#3C8FDE" };
  var PAPER = ["#1B1D20", "#121315", "#0D0E10"];
  var TONE = { neutral: "rgba(255,255,255,0.62)", red: C.red, blue: C.blue };
  var FADE = 0.2, SHORT = 560;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  function get(path) {
    var parts = String(path).replace(/\[(\d+)\]/g, ".$1").split("."), v, no = new Error("Story.get: " + parts[0] + " is not in js/data.js");
    if (!/^[A-Za-z_$][\w$]*$/.test(parts[0]) || parts[0] in window) throw no;
    try { v = (0, eval)(parts[0]); }
    catch (e) { throw no; }
    for (var i = 1; i < parts.length; i++) {
      if (v == null || !(parts[i] in Object(v))) throw new Error("Story.get: no field " + path);
      v = v[parts[i]];
    }
    return v;
  }
  var FMT = {
    T: function (v) { return "$" + +(v / 1000).toFixed(2) + "T"; },
    B: function (v) { return "$" + v + "B"; },
    M: function (v) { return v + "M"; },
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

  var prov = new Map(), seen = {};
  var log = { figs: [], copies: [], flags: [], rungs: [] };
  function once(key) { return seen[key] ? false : (seen[key] = 1); }
  function remember(str, kind, ref) { prov.set(str = String(str), { kind: kind, ref: ref || "" }); return str; }
  function flag(kind, text) { if (once("f" + kind + text)) log.flags.push({ kind: kind, text: text }); }
  function copyLog(kind, text, ref) { if (once(kind + ref + text)) log.copies.push({ kind: kind, text: text, ref: ref }); }

  Story.get = get;
  Story.FMT = FMT;
  Story.clamp = clamp;
  Story.lerp = function (a, b, t) { return a + (b - a) * t; };
  Story.smooth = function (e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  Story.fig = function (path, fmt) {
    var v, shown;
    fmt = fmt || "raw";
    try {
      v = get(path);
      if (!FMT[fmt]) throw new Error("Story.fig: unknown format " + fmt);
      shown = FMT[fmt](v);
    } catch (e) { console.error(e.message); flag("data", e.message); return "?"; }
    if (once("g" + path + fmt)) log.figs.push({ path: path, fmt: fmt, value: v, shown: shown });
    return remember(shown, "fig", path);
  };
  Story.prose = function (text, path) {
    var src = "";
    try { src = String(get(path)); } catch (e) {}
    if (src.indexOf(text) < 0) { console.warn("Story.prose: '" + text + "' is not in " + path); flag("prose-missing", text + " · " + path); }
    if (once("p" + path + text)) log.figs.push({ path: path, fmt: "prose", value: null, shown: text });
    return remember(text, "prose", path);
  };
  Story.copy = function (text, ref) { copyLog("copy", text, ref); return remember(text, "copy", ref); };
  Story.label = function (text) { copyLog("label", text, ""); return remember(text, "label", ""); };
  Story.newCopy = function (text, why) {
    copyLog("newCopy", text, why || "");
    flag("new-copy", "“" + text + "”" + (why ? " — " + why : ""));
    return remember(text, "newCopy", why);
  };
  Story.derived = function (text, how) {
    flag("derived", how);
    if (once("d" + how)) log.figs.push({ path: "derived", fmt: how, value: null, shown: String(text) });
    return remember(text, "derived", how);
  };
  Story.flag = flag;
  Story.missing = function (shown, why) {
    flag("missing", "“" + shown + "” needs a data.js field — " + why);
    if (once("m" + shown)) log.figs.push({ path: "missing", fmt: why, value: null, shown: String(shown) });
    return remember(shown, "missing", why);
  };

  function stable(v) { return typeof v === "number" ? String(Math.round(v * 1e4) / 1e4) : String(v); }
  function setStyle(el, prop, val) {
    var c = el._sc || (el._sc = {});
    if (c[prop] !== (val = stable(val))) el.style[prop] = c[prop] = val;
  }
  function setAttr(el, name, val) {
    var c = el._ac || (el._ac = {});
    if (c[name] !== (val = stable(val))) el.setAttribute(name, (c[name] = val));
  }
  function tagEl(el, str, src) {
    var t = typeof src === "string" ? { kind: src.split(":")[0], ref: src.split(":").slice(1).join(":") } : src || prov.get(str);
    if (t) {
      setAttr(el, "data-src", t.kind);
      if (t.ref) setAttr(el, "data-ref", t.ref);
    } else if (/\d/.test(str)) { console.warn("Story: untagged digits: " + str); flag("untagged", str); }
  }
  function setText(el, str, src) {
    str = str == null ? "" : String(str);
    if (el._tx === str) return;
    el.textContent = el._tx = str;
    tagEl(el, str, src);
  }
  function el(tag, cls, text, src, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (Array.isArray(text)) text.forEach(function (t) { var s = e.appendChild(document.createElement("span")); Array.isArray(t) ? setText(s, t[0], t[1]) : setText(s, t); });
    else if (text != null) setText(e, text, src);
    if (parent) parent.appendChild(e);
    return e;
  }
  function link(href, text, src, parent, cls) {
    var a = el("a", cls, text, src, parent);
    a.href = href;
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function place(e, a, m, c) {
    var s = e.style, z = 1, r = 1, dx = 0, dy = 0;
    s.display = a ? "" : "none";
    if (!a) return;
    if (m) { c = c || m; z = m.k / c.k; r = (m.k * m.r) / c.k; dx = (m.x - c.x) / c.k; dy = (m.y - c.y) / c.k; }
    s.left = dx + a[0] * z + "px";
    s.top = dy + a[1] * z + "px";
    s.fontSize = a[2] ? a[2] * r + "px" : "";
    s.width = a[3] ? a[3] * r + "px" : "";
    s.whiteSpace = a[3] ? "normal" : "";
  }
  function rows(T, p) { return T.map(function (r) { return (r.e = el("div", r[0], r[1] || null, null, p)); }); }
  function map(v, k, x, y) { return { k: k, x: x, y: y, r: v.kt / k, t: "translate(" + x + "px," + y + "px) scale(" + k + ")" }; }
  Story.fit = function (v, a, b) {
    b = b || v.stage;
    var k = Math.min(v.kt, b.w / a[2], b.h / a[3]);
    return map(v, k, b.x + (b.w - a[2] * k) / 2 - a[0] * k, b.y + (b.h - a[3] * k) / 2 - a[1] * k);
  };
  Story.sb = function (v, f) {
    var k = v.kt, s = v.stage;
    if (!v.phone) return map(v, v.k, (v.W - 1440 * v.k) / 2, (v.H - 900 * v.k) / 2);
    if (f == null) return Story.fit(v, [16, 56, 343, 500]);
    return map(v, k, (v.W - 375 * k) / 2, f === "t" ? v.H - 812 * k : s.y - 56 * k - f * (500 * k - s.h));
  };

  var scenes = [], byId = {}, TOTAL = 0, started = false, building = null;
  Story.scene = function (d) {
    if (!d || !d.id || typeof d.state !== "function" || !(d.screens > 0)) throw new Error("Story.scene: needs id, screens > 0, state()");
    if (byId[d.id] || started) throw new Error("Story.scene: " + d.id + " is a duplicate or came after Story.start()");
    d.restrained = !!d.restrained;
    d.chrome = !d.restrained && (d.chrome == null ? true : d.chrome);
    d.anchors = d.anchors || [];
    d.frames = d.frames || [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }];
    d.file = d.file || ("0" + (d.order | 0)).slice(-2);
    d.plateP = d.plateP == null ? 1 : d.plateP;
    if (!d.alt) console.warn("Story.scene: " + d.id + " has no alt text");
    scenes.push((byId[d.id] = d));
    d.pv = prov;
    prov = new Map();
    return d;
  };
  Story.stateOf = function (id, p, v) { return byId[id].state(clamp(p, 0, 1), v || vp); };

  var lives = [], liveRaf = 0, platesInView = new Set();
  Story.live = function (kind, node, fmt) {
    if (kind !== "military" && kind !== "deaths") throw new Error("Story.live: unknown kind " + kind);
    node.setAttribute("data-src", "live");
    node.setAttribute("data-ref", kind);
    node.removeAttribute("aria-live");
    var it = { kind: kind, el: node, fmt: fmt, scene: building, last: 0 };
    lives.push(it);
    writeLive(it, Date.now());
    return node;
  };
  function writeLive(it, now) {
    var secs = (now - OPENED) / 1000, s;
    if (it.kind === "military") { var v = secs * get("MIL_PER_SECOND"); s = it.fmt ? it.fmt(v) : FMT.usd(Math.floor(v)); }
    else { var n = Math.floor(secs * (get("DEATHS_PER_YEAR") / 31536000)); s = it.fmt ? it.fmt(n) : String(n); }
    if (it.el._tx !== s) it.el.textContent = it.el._tx = s;
    it.last = now;
  }
  function liveOn(it) {
    if (!it.el.isConnected) return false;
    if (it.plate === undefined) it.plate = it.el.closest(".plate");
    return mode === "static" ? platesInView.has(it.plate) : onScreen && (!it.scene || it.scene === active);
  }
  function tickLive() {
    var now = Date.now(), any = false;
    liveRaf = 0;
    lives.forEach(function (it) {
      if (!liveOn(it)) return;
      any = true;
      if (it.kind === "military" || now - it.last >= 1000) writeLive(it, now);
    });
    if (any) liveRaf = requestAnimationFrame(tickLive);
  }
  function wakeLive() { if (!liveRaf && started) liveRaf = requestAnimationFrame(tickLive); }

  function poly(g, q) {
    g.beginPath();
    q.forEach(function (p, i) { g[i ? "lineTo" : "moveTo"](p.x, p.y); });
    g.closePath();
  }
  function inset(r, d) { return { x: r.x + d, y: r.y + d, w: Math.max(0, r.w - 2 * d), h: Math.max(0, r.h - 2 * d) }; }
  function drawSheet(g, sh) {
    var op = sh && sh.opacity != null ? sh.opacity : 1;
    if (!sh || !(sh.w > 0 && sh.h > 0) || op <= 0) return;
    var cam = Story.cam, t = cam.resolve(sh.tilt, sh);
    var mode = sh.mode || "paper", col = TONE[sh.tone] || TONE.neutral, e = sh.edge != null ? sh.edge : 1.5;
    var q = cam.quad(sh, t), px = g.getTransform().a;
    g.save();
    g.globalAlpha *= op;
    g.strokeStyle = col;
    g.lineWidth = e;
    if (mode === "line") {
      var a = cam.project(sh.x, sh.y + sh.h / 2, 0, t), b = cam.project(sh.x + sh.w, sh.y + sh.h / 2, 0, t);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    } else {
      if (mode !== "outline") {
        var gr = g.createLinearGradient(q[0].x, q[0].y, q[2].x, q[2].y);
        gr.addColorStop(0, PAPER[0]); gr.addColorStop(0.55, PAPER[1]); gr.addColorStop(1, PAPER[2]);
        g.save();
        if (mode === "paper" && sh.shadow !== false) { g.shadowColor = "rgba(0,0,0,0.75)"; g.shadowBlur = 44 * px; g.shadowOffsetY = 18 * px; }
        g.fillStyle = gr;
        poly(g, q);
        g.fill();
        g.restore();
        var h = cam.quad(inset(sh, 1), t);
        g.strokeStyle = "rgba(255,255,255,0.14)";
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(h[0].x, h[0].y); g.lineTo(h[1].x, h[1].y); g.stroke();
        g.strokeStyle = col;
        g.lineWidth = e;
      }
      var qi = cam.quad(inset(sh, e / 2), t);
      if (mode === "band") {
        g.beginPath(); g.moveTo(qi[0].x, qi[0].y); g.lineTo(qi[1].x, qi[1].y); g.moveTo(qi[3].x, qi[3].y); g.lineTo(qi[2].x, qi[2].y);
      } else poly(g, qi);
      g.stroke();
      if (sh.tab) {
        g.fillStyle = col;
        poly(g, cam.quad({ x: sh.x, y: sh.y, w: sh.tabSize || 10, h: sh.tabSize || 10 }, t));
        g.fill();
      }
    }
    g.restore();
    if (sh.rung) logRung(sh, q, !!t);
  }
  var rungAt = {};
  function logRung(sh, q, tilted) {
    var area = sh.w * sh.h, i;
    if (!tilted) for (area = 0, i = 0; i < 4; i++) area += (q[i].x * q[(i + 1) % 4].y - q[(i + 1) % 4].x * q[i].y) / 2;
    var id = current ? current.id : "?", key = id + "|" + sh.rung.path, r = rungAt[key];
    if (!r) log.rungs.push((r = rungAt[key] = { scene: id, path: sh.rung.path }));
    r.value = sh.rung.value;
    r.fit = Math.round(sh.rung.fit * 1000) / 1000;
    r.tilted = tilted;
    r.areaErrorPct = Math.round((Math.abs(area) / sh.rung.area - 1) * 1e6) / 1e4;
  }
  function sheets(g, list, c) {
    g.save();
    if (c) { g.beginPath(); g.rect(c[0], c[1], c[2], c[3]); g.clip(); }
    list.forEach(function (s) { drawSheet(g, s); });
    g.restore();
  }
  function insetView(g, d, list) {
    var a = g.globalAlpha, w = d.w / d.z, h = d.h / d.z, x = d.ax - w * (d.f || [])[0], y = d.ay - h * (d.f || [])[1];
    g.save();
    g.fillStyle = C.ground;
    g.fillRect(d.x, d.y, d.w, d.h);
    g.beginPath();
    g.rect(d.x, d.y, d.w, d.h);
    g.clip();
    g.translate(d.cx, d.cy);
    g.scale(d.z, d.z);
    g.translate(-d.ax, -d.ay);
    list.forEach(function (s) { drawSheet(g, Object.assign({}, s, { edge: 1.5 / d.z, tab: 0, shadow: false })); });
    g.restore();
    g.save();
    g.strokeStyle = C.white;
    g.lineWidth = 1;
    g.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1);
    if (d.f) {
      g.globalAlpha = a * 0.7;
      g.setLineDash([3, 3]);
      g.strokeRect(x, y, w, h);
      g.setLineDash([]);
      g.globalAlpha = a * 0.4;
      g.beginPath();
      g.moveTo(x + w, y);
      g.lineTo(d.x, d.y + d.h);
      g.stroke();
    }
    g.restore();
  }
  function drawScene(g, id, st) {
    var d = byId[id], was = current;
    if (!d || !st) return;
    current = d;
    drawSheet(g, st.sheet);
    if (d.draw) d.draw(g, st, d.api);
    current = was;
  }

  function brackets(d, rect, o) {
    o = o || {};
    if (d.restrained) return flag("brackets", d.id + " is restrained: brackets refused");
    if (!rect) return;
    var b = d._br[o.id || "main"];
    if (!b) {
      b = d._br[o.id || "main"] = { g: svgEl("g", { "class": "st-brackets" }, d.g) };
      b.path = svgEl("path", { fill: "none", stroke: C.white }, b.g);
      b.tag = svgEl("g", {}, b.g);
      b.bg = svgEl("rect", { fill: C.ground }, b.tag);
      b.text = svgEl("text", { fill: C.white, x: 6 }, b.tag);
    }
    b.used = true;
    setAttr(b.g, "display", "inline");
    var r1 = function (v) { return Math.round(v * 10) / 10; }, d2 = function (a, c) { return Math.hypot(c.x - a.x, c.y - a.y) || 1; };
    var q = rect.q || [{ x: rect.x, y: rect.y }, { x: rect.x + rect.w, y: rect.y }, { x: rect.x + rect.w, y: rect.y + rect.h }, { x: rect.x, y: rect.y + rect.h }], k = o.clip;
    if (k) q = q.map(function (c) { return { x: clamp(c.x, k.x, k.x + k.w), y: clamp(c.y, k.y, k.y + k.h) }; });
    var L = o.len || Math.max(8, Math.min(vp.phone ? 12 : 24, d2(q[0], q[1]) / 4, d2(q[0], q[3]) / 3)), dp = "";
    q.forEach(function (c, i) {
      var a = q[(i + 3) % 4], e = q[(i + 1) % 4], u = L / d2(c, a), v = L / d2(c, e);
      dp += "M" + r1(c.x + (a.x - c.x) * u) + " " + r1(c.y + (a.y - c.y) * u) + "L" + r1(c.x) + " " + r1(c.y) + "L" + r1(c.x + (e.x - c.x) * v) + " " + r1(c.y + (e.y - c.y) * v);
    });
    setAttr(b.path, "d", dp);
    setAttr(b.path, "stroke-width", o.lock ? 2 : 1.25);
    setAttr(b.path, "opacity", o.opacity || (o.lock ? 1 : 0.7));
    setAttr(b.tag, "display", o.label ? "inline" : "none");
    if (!o.label) return;
    var label = Story.label(String(o.label).toUpperCase()), fs = r1(o.fs || (vp.phone ? 9 * Math.max(1, vp.kt) : 10));
    var tw = Math.round(label.length * 0.74 * fs + 12), th = fs + 7;
    var at = o.tagAt || (o.lock ? "bl" : "tl"), c = q[{ tl: 0, tr: 1, br: 2, bl: 3 }[at]];
    var tx = clamp((at.charAt(1) === "r" ? c.x - tw : c.x) + (o.dx || 0), 8, vp.W - tw - 8);
    var ty = clamp(at.charAt(0) === "b" ? c.y + 8 : c.y - th - 6, 8, vp.H - th - 8);
    setText(b.text, label);
    setAttr(b.text, "font-size", fs);
    setAttr(b.text, "y", Math.round(fs * 0.8 + 3.5));
    setAttr(b.bg, "width", tw);
    setAttr(b.bg, "height", th);
    setAttr(b.tag, "transform", "translate(" + r1(tx) + " " + r1(ty) + ")");
  }

  var mode = "motion", reason = "";
  function detectMode() {
    var q = location.search;
    if (q.indexOf("static") > -1) return "static";
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced-motion";
    if (/[?&]lowpower=1/.test(q) || navigator.deviceMemory < 2 || (navigator.connection && navigator.connection.saveData)) return "lowpower";
    return "";
  }

  var root, stage, canvas, g2d, world, svg, uiEl, chromeEl, anchorsEl, textEl, dock, probe;
  function buildDom() {
    var div = function (cls, parent) { return el("div", cls, null, null, parent); };
    root.textContent = "";
    stage = div("story-stage", root);
    stage.setAttribute("aria-hidden", "true");
    var pool = div("story-pool", stage);
    g2d = (canvas = el("canvas", "story-canvas", null, null, stage)).getContext("2d");
    world = div("story-world", stage);
    svg = svgEl("svg", { "class": "story-svg", focusable: "false" }, stage);
    var key = div("story-key", stage), grain = div("story-grain", stage);
    div("story-vignette", stage);
    uiEl = div("story-ui", stage);
    chromeEl = div("story-chrome", stage);
    anchorsEl = div("story-anchors", root);
    textEl = div("story-text", root);
    dock = div("story-dock", root);
    dock.setAttribute("aria-hidden", "true");
    probe = div("story-probe", document.body);
    Story._chrome.build({ pool: pool, key: key, grain: grain, chrome: chromeEl });
  }
  function buildScene(d) {
    d.layer = el("div", "scene-layer", null, null, world);
    d.ui = el("div", "scene-layer scene-ui", null, null, uiEl);
    d.g = svgEl("g", { display: "none" }, svg);
    d.plate = el("section", "plate", null, null, textEl);
    [d.layer, d.ui, d.g, d.plate].forEach(function (n) { n.setAttribute("data-scene", d.id); });
    d.plate.id = "plate-" + d.id.toLowerCase();
    d.plate.tabIndex = -1;
    d.plate.setAttribute("data-p", d.focusP == null ? 1 : d.focusP);
    d._br = {};
    var alt = d.alt ? Story.newCopy(d.alt, d.id + " text alternative") : "";
    if (d.plateVisual !== false) {
      d.plateCanvas = el("canvas", "plate-visual", null, null, d.plate);
      d.plateCanvas.setAttribute("role", "img");
      d.plateCanvas.setAttribute("aria-label", alt);
    } else if (alt) el("p", "sr-only", alt, null, d.plate);
    d.api = {
      id: d.id, def: d, layer: d.layer, ui: d.ui, svg: d.g, plate: d.plate,
      el: el, link: link, svgEl: svgEl, text: setText, set: setStyle, attr: setAttr, place: place, rows: rows,
      lay: function (T, m, c) { T.forEach(function (r) { place(r.e, r[vp.phone ? 4 : 3], m, c); }); },
      map: function (e, m) { setStyle(e, "transform", m.t); e.style.setProperty("--s", m.k); },
      fade: function (e, o) { setStyle(e, "opacity", o); setStyle(e, "pointerEvents", o > 0.5 ? "auto" : "none"); },
      leader: function (p) {
        var g = svgEl("g", { stroke: "rgba(255,255,255,.55)", fill: "none" }, p || d.g);
        g.p = svgEl("path", {}, g);
        g.r = svgEl("rect", { width: 5, height: 5, fill: C.white, stroke: "none" }, g);
        return g;
      },
      lead: function (g, s) { var m = /M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(s); setAttr(g.p, "d", s); setAttr(g.r, "x", m[1] - 2.5); setAttr(g.r, "y", m[2] - 2.5); },
      brackets: function (r, o) { brackets(d, r, o); },
      rung: Story.rung, drawSheet: drawSheet, drawScene: drawScene, live: Story.live, sheets: sheets, inset: insetView,
    };
    Object.defineProperty(d.api, "vp", { get: function () { return vp; } });
    building = d;
    prov = d.pv;
    if (d.build) d.build(d.api);
    building = null;
    setStyle(d.layer, "visibility", "hidden");
    setStyle(d.ui, "visibility", "hidden");
    [d.id.toLowerCase()].concat(d.anchors).forEach(function (id) {
      var a = el("div", "story-anchor", null, null, anchorsEl);
      a.id = id;
      a.s = d.start + ((d.anchorP || {})[id] || 0) * d.screens;
      a.style.top = "calc(" + a.s + " * var(--svh))";
      a.setAttribute("data-scene", d.id);
    });
  }

  var vp = null, storyTop = 0;
  function layoutAll() {
    var box = mode === "motion" ? stage : probe, W = (mode === "motion" ? root : probe).clientWidth, H = box.clientHeight, ph = W < 768 || (W <= 1024 && H > W), c = W, kt;
    if (mode === "motion") {
      if (ph && (W >= 430 || H * 375 < 620 * W)) { c = Math.min(W, Math.ceil((H * 375) / 638)); c += (W - c) % 2; if (W - c < 12) c = W; }
      stage.style.width = c + "px";
      stage.style.marginLeft = (W - c) / 2 + "px";
      document.documentElement.style.setProperty("--mx", (W - c) / 2 + "px");
    }
    W = c;
    kt = ph ? W / 375 : Math.min(W / 1440, H / 900);
    if (ph && mode === "static") H = Math.max(H, 812 * kt);
    vp = {
      W: W, H: H, phone: ph, dpr: Math.min(window.devicePixelRatio || 1, 2), kt: kt,
      k: ph ? Math.min(kt, (H - 312 * kt) / 500) : kt,
      stage: ph ? { x: 16 * kt, y: 56 * kt, w: W - 32 * kt, h: H - 312 * kt } : { x: 0, y: 0, w: W, h: H },
      text: ph ? { x: 16 * kt, y: H - 240 * kt, w: W - 32 * kt, h: 220 * kt } : null,
      short: ph && H - 312 * kt < 480 * kt,
    };
    document.documentElement.classList.toggle("story-phone", ph);
    document.documentElement.classList.toggle("story-short", vp.short);
    if (mode === "motion") {
      canvas.width = Math.round(W * vp.dpr);
      canvas.height = Math.round(H * vp.dpr);
      stage.style.setProperty("--k", vp.k);
      stage.style.setProperty("--kt", kt);
      stage.style.setProperty("--kc", ph ? Math.max(1, kt) : 1);
      stage.style.setProperty("--W", W + "px");
      stage.style.setProperty("--H", H + "px");
      Story._chrome.layout(vp, scenes, TOTAL);
    }
    storyTop = root.getBoundingClientRect().top + window.scrollY;
    scenes.forEach(function (d) {
      if (d.layout) d.layout(d.api);
      [d.layer, d.ui].forEach(function (l) { l.querySelectorAll("a,button,input,select,textarea,[tabindex]").forEach(function (n) { n.tabIndex = -1; }); });
    });
    if (mode === "static") drawPlates();
  }

  var raf = 0, onScreen = true, active = null, current = null, last = { s: 0, p: 0, st: null };
  function readS() { return clamp((window.scrollY - storyTop) / vp.H, 0, TOTAL); }
  function request() { if (!raf && mode === "motion" && started) raf = requestAnimationFrame(function () { raf = 0; if (onScreen) renderAt(readS()); }); }
  // ScrollTrigger's endless empty frame loop rests off screen and in still mode
  var raf0 = requestAnimationFrame, rest = 0;
  window.requestAnimationFrame = function (f) { return started && (mode != "motion" || !onScreen) && f.name == "_rafBugFix" ? (rest = f, 0) : raf0.call(window, f); };
  function nap() { if (rest && onScreen && mode == "motion") raf0.call(window, rest), rest = 0; request(); }
  function chromeOn(d) { return !!d.chrome; }
  function atmOn(d) { return !d.restrained; }
  function ramp(s, i, on) {
    var d = scenes[i], n = scenes[i + 1], to = on(d) ? 1 : 0, from = i && on(scenes[i - 1]) ? 1 : 0, t = (s - d.start) / Math.min(FADE, d.screens);
    if (to && n && n.restrained) return Math.min(1, (d.start + d.screens - s) / FADE);
    return i && from !== to && !d.restrained && t < 1 ? from + (to - from) * Math.max(0, t) : to;
  }
  function show(d, on) {
    setStyle(d.layer, "visibility", on ? "visible" : "hidden");
    setStyle(d.ui, "visibility", on ? "visible" : "hidden");
    setAttr(d.g, "display", on ? "inline" : "none");
  }
  function paint(d, st, op) {
    var k;
    prov = d.pv;
    setStyle(d.layer, "opacity", op);
    setStyle(d.ui, "opacity", op);
    setAttr(d.g, "opacity", op);
    for (k in d._br) d._br[k].used = false;
    if (d.render) d.render(st, d.api);
    for (k in d._br) if (!d._br[k].used) setAttr(d._br[k].g, "display", "none");
  }
  var held = null;
  function renderAt(s) {
    var i = 0, j;
    for (j = 1; j < scenes.length; j++) if (s + 1e-7 >= scenes[j].start) i = j;
    var d = (current = scenes[i]), p = clamp((s - d.start) / d.screens, 0, 1), st = d.state(p, vp) || {};
    if (active !== d) {
      if (active) show(active, 0);
      show(d, 1);
      active = d;
      lives.forEach(function (it) { if (it.scene === d) writeLive(it, Date.now()); });
    }
    var hd = st.hold, h = hd && hd.opacity > 0 ? byId[hd.id] : null;
    if (held !== h) {
      if (held && held !== d) show(held, 0);
      if (h) show(h, 1);
      held = h;
    }
    if (h) paint(h, hd.st, hd.opacity * (hd.st.layerOpacity == null ? 1 : hd.st.layerOpacity));
    paint(d, st, st.layerOpacity == null ? 1 : st.layerOpacity);
    var g = g2d;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(vp.dpr, 0, 0, vp.dpr, 0, 0);
    if (h) { g.save(); g.globalAlpha = hd.opacity; drawScene(g, h.id, hd.st); g.restore(); }
    drawSheet(g, st.sheet);
    if (d.draw) { g.save(); d.draw(g, st, d.api); g.restore(); }
    for (j = i; j > 0 && !chromeOn(scenes[j]); j--);
    if (!chromeOn(scenes[j])) for (j = i; j < scenes.length - 1 && !chromeOn(scenes[j]); j++);
    Story._chrome.frame({
      s: s, total: TOTAL, vp: vp, st: st, labels: scenes[j], labelsP: j === i ? p : j < i ? 1 : 0,
      chrome: ramp(s, i, chromeOn), atmos: ramp(s, i, atmOn),
    });
    last = { s: s, p: p, st: st };
    Story.debug.s = s;
    Story.debug.active = d.id;
    wakeLive();
  }
  function drawPlates() {
    scenes.forEach(function (d) {
      var cv = d.plateCanvas, c = vp.phone ? vp.stage : { x: 0, y: 0, w: vp.W, h: vp.H };
      if (!cv) return;
      var r = ((cv.clientWidth || c.w) * vp.dpr) / c.w;
      cv.width = Math.round(c.w * r);
      cv.height = Math.round(c.h * r);
      var g = cv.getContext("2d"), st = d.state(d.plateP, vp) || {};
      g.setTransform(r, 0, 0, r, -c.x * r, -c.y * r);
      g.fillStyle = C.ground;
      g.fillRect(c.x, c.y, c.w, c.h);
      current = d;
      drawSheet(g, st.sheet);
      if (d.draw) d.draw(g, st, d.api);
    });
  }
  function scrollToS(s) {
    window.scrollTo({ top: storyTop + s * vp.H, left: 0, behavior: "instant" });
    if (mode === "motion") renderAt(readS());
  }
  var linkedY = null, land = [], KEY = "story-at";
  function hashEl() {
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return null; }
  }
  function followHash(go) {
    var a = hashEl(), d = a && byId[a.getAttribute("data-scene")];
    if (mode !== "motion" || !a) return;
    if (go !== false) d ? scrollToS(land[0] === d.id ? +land[1] : a.s) : a.scrollIntoView();
    linkedY = window.scrollY;
    if (d) d.plate.focus({ preventScroll: true });
  }
  function remode(id, at) {
    if (at != null) try { sessionStorage.setItem(KEY, id + " " + at); } catch (e) {}
    history.replaceState(null, "", "#" + id.toLowerCase());
    history.scrollRestoration = "manual";
    location.reload();
  }

  // Never reload a reader who is below the story, in a tool or has changed anything there (README, Phase 4).
  var due = null;
  function under() { return root.getBoundingClientRect().bottom < vp.H - 1; }
  function busy(below) { var a = document.activeElement; return below || window.__toolDirty || (a && (root.compareDocumentPosition(a) & 20) == 4); } // after the story, not in it
  window.addEventListener("scroll", function () { if (due && !under() && !busy()) { var f = due; due = null; f(); } }, { passive: true });

  var readyResolve, revealDone = Promise.resolve(), ready = new Promise(function (r) { readyResolve = r; });
  Story.start = function () {
    if (started || !(root = document.getElementById("story"))) return console.error("Story: #story missing or started twice");
    scenes.sort(function (a, b) { return a.order - b.order; });
    scenes.forEach(function (d) { d.start = TOTAL; TOTAL = Math.round((TOTAL + d.screens) * 1000) / 1000; });
    buildDom();
    reason = detectMode() || (probe.clientHeight < SHORT ? "short" : "");
    mode = reason ? "static" : "motion";
    document.documentElement.classList.add("story-" + mode);
    scenes.forEach(buildScene);
    started = true;
    root.style.height = mode === "motion" ? "calc(" + (TOTAL + 1) + " * var(--svh))" : "auto";
    scenes.forEach(function (d) { d.plate.style.setProperty("--ps", d.start + clamp(+d.plate.getAttribute("data-p"), 0, 1) * d.screens); });
    Story.debug.total = TOTAL;
    Story.debug.mode = mode;
    Story.debug.reason = reason;
    Story.debug.scenes = scenes.map(function (d) {
      return { id: d.id, name: d.name, start: d.start, screens: d.screens, restrained: d.restrained, frames: d.frames, anchors: [d.id.toLowerCase()].concat(d.anchors) };
    });
    layoutAll();
    (mode === "motion" ? initMotion : initStatic)();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
      layoutAll();
      if (mode === "motion") { refreshST(); renderAt(readS()); }
      return revealDone;
    }).then(function () { requestAnimationFrame(function () { requestAnimationFrame(readyResolve); }); });
  };
  function refreshST() { if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  function initMotion() {
    try { land = (sessionStorage.getItem(KEY) || "").split(" "); sessionStorage.removeItem(KEY); } catch (e) {}
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: function () { return "+=" + TOTAL * vp.H; },
        onUpdate: request,
        onRefresh: request,
      });
    } else window.addEventListener("scroll", request, { passive: true });
    if (window.IntersectionObserver) new IntersectionObserver(function (es) {
      onScreen = es[es.length - 1].isIntersecting;
      nap();
    }, { rootMargin: "-1px 0px" }).observe(root);
    var lastW = root.clientWidth, lastH = vp.H, rz = 0, Y = window.scrollY, at, dy;
    window.addEventListener("scroll", function () { if (!rz) Y = window.scrollY; }, { passive: true });
    window.addEventListener("resize", function () {
      if (!rz) { at = (Y - storyTop) / vp.H; dy = Y - storyTop - (TOTAL + 1) * vp.H; }
      rz = rz || requestAnimationFrame(function () {
        var W = root.clientWidth, H = stage.clientHeight;
        rz = 0;
        if (W !== lastW || H !== lastH) {
          due = H < SHORT ? function (s) { remode(active.id, s == null ? readS() : s); } : null;
          if (due && !busy(at > TOTAL)) return due(at);
          lastW = W; lastH = H;
          layoutAll();
          refreshST();
          if (at <= TOTAL) scrollToS(Math.max(0, at));
          else (window.__keepPlace && __keepPlace()) || window.scrollTo(0, storyTop + (TOTAL + 1) * vp.H + dy);
        }
        Y = window.scrollY;
        renderAt(readS());
      });
    });
    window.addEventListener("load", function () {
      refreshST();
      if (location.hash && (linkedY == null || window.scrollY === linkedY)) followHash();
      renderAt(readS());
    });
    window.addEventListener("hashchange", function () { followHash(false); });
    stage.addEventListener("click", function () { if (active) active.plate.focus({ preventScroll: true }); });
    textEl.addEventListener("focusin", function (e) {
      var pl = e.target.closest(".plate"), d = pl && byId[pl.getAttribute("data-scene")];
      if (!d || e.target === pl) return;
      var pp = clamp(+e.target.closest("[data-p]").getAttribute("data-p"), 0, 1);
      var s = d.start + pp * d.screens - (pp >= 1 && d !== scenes[scenes.length - 1] ? 1.5 / vp.H : 0);
      setText(dock, e.target.getAttribute("aria-label") || e.target.textContent.trim(), "chrome");
      dock.classList.add("on");
      requestAnimationFrame(function () { scrollToS(s); });
    });
    textEl.addEventListener("focusout", function () { dock.classList.remove("on"); });
    followHash();
    renderAt(readS());
    var nav = performance.getEntriesByType("navigation")[0];
    if (scenes[0].reveal && window.gsap && (!nav || nav.type === "navigate") && !location.hash && readS() < 0.01)
      revealDone = new Promise(function (res) { gsap.fromTo(stage, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power2.out", clearProps: "opacity", onComplete: res }); });
  }
  function initStatic() {
    scenes.forEach(function (d) {
      [d.id.toLowerCase()].concat(d.anchors).forEach(function (id) { d.plate.insertBefore(document.getElementById(id), d.plate.firstChild); });
    });
    var io = window.IntersectionObserver && new IntersectionObserver(function (es) {
      es.forEach(function (e) { platesInView[e.isIntersecting ? "add" : "delete"](e.target); });
      wakeLive();
    });
    scenes.forEach(function (d) { io ? io.observe(d.plate) : platesInView.add(d.plate); });
    wakeLive();
    var lastW = vp.W, below = under();
    window.addEventListener("scroll", function () { below = under(); }, { passive: true });
    window.addEventListener("resize", function () {
      if (reason === "short") {
        due = probe.clientHeight >= SHORT ? function () { remode((scenes.filter(function (d) { return d.plate.getBoundingClientRect().bottom > 2; })[0] || { id: "haveyoursay" }).id); } : null;
        if (due && !busy(below)) return due();
      }
      if (probe.clientWidth !== lastW) { lastW = probe.clientWidth; layoutAll(); if (below && window.__keepPlace) __keepPlace(); }
    });
    var t = hashEl(), pl = t && t.closest(".plate");
    if (t) t.scrollIntoView();
    if (pl) pl.focus({ preventScroll: true });
  }

  function fnv(h, s) { for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h; }
  function hashDom() {
    var h = 2166136261;
    function walk(n, live) {
      if (n.nodeType === 3) { if (!live) h = fnv(h, "#" + n.nodeValue); return; }
      var st = n.style, at = function (k) { return n.getAttribute(k); }, s = "<" + n.tagName + "|" + st.transform + "|" + st.opacity;
      if (st.visibility === "hidden" || st.display === "none" || st.opacity === "0" || at("visibility") === "hidden" || at("display") === "none" || at("opacity") === "0") return;
      live = live || n.getAttribute("data-src") === "live";
      if (n.namespaceURI === NS) for (var i = 0; i < n.attributes.length; i++) s += " " + n.attributes[i].name + "=" + n.attributes[i].value;
      else if (!live && (st.width || !n.querySelector('[data-src="live"]'))) s += "|" + n.offsetWidth + "x" + n.offsetHeight;
      h = fnv(h, s);
      for (var c = n.firstChild; c; c = c.nextSibling) if (c.nodeType < 4) walk(c, live);
    }
    walk(stage);
    return (h >>> 0).toString(16);
  }
  var copy;
  function hashCanvas() {
    copy = copy || document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    copy.canvas.width = canvas.width;
    copy.canvas.height = canvas.height;
    copy.drawImage(canvas, 0, 0);
    var px = copy.getImageData(0, 0, canvas.width, canvas.height).data, h = 2166136261;
    for (var i = 0; i < px.length; i += 16) for (var c = 0; c < 4; c++) h = Math.imul(h ^ px[i + c], 16777619);
    return (h >>> 0).toString(16);
  }
  Story.debug = {
    total: 0, scenes: [], s: 0, active: null, mode: "motion", reason: "",
    figs: log.figs, copies: log.copies, flags: log.flags, rungs: log.rungs,
    ready: ready,
    vp: function () { return vp; },
    goto: function (s) {
      return ready.then(function () {
        return new Promise(function (res) {
          if (mode === "motion") scrollToS(clamp(s, 0, TOTAL));
          requestAnimationFrame(function () { requestAnimationFrame(function () { res(Story.debug.s); }); });
        });
      });
    },
    snapshot: function () {
      if (mode !== "motion" || !active) return { s: 0, scene: null, p: 0, state: null, dom: "", canvas: "" };
      var r = function (v) { return Math.round(v * 1e5) / 1e5; };
      return { s: r(last.s), scene: active.id, p: r(last.p), state: JSON.parse(JSON.stringify(last.st)), dom: hashDom(), canvas: hashCanvas() };
    },
    selfTest: function () {
      return Story.debug._selfTest ? Promise.resolve(Story.debug._selfTest()) : new Promise(function (res, rej) {
        var sc = document.createElement("script");
        sc.src = BASE + "../story-debug/selftest.js";
        sc.onload = function () { res(Story.debug._selfTest()); };
        sc.onerror = rej;
        document.head.appendChild(sc);
      });
    },
  };
  Story._ = { el: el, svgEl: svgEl, setStyle: setStyle, setAttr: setAttr, setText: setText };
})();

/* CAMERA: a tilt is CSS origin ox oy + perspective rotateX rotateY rotateZ */
(function () {
  "use strict";
  var Story = (window.Story = window.Story || {}), RAD = Math.PI / 180;

  function resolve(t, rect) {
    if (!t) return null;
    return {
      rx: +t.rx || 0, ry: +t.ry || 0, rz: +t.rz || 0, persp: t.persp > 0 ? +t.persp : 1600,
      ox: t.ox != null ? +t.ox : rect ? rect.x + rect.w / 2 : 0,
      oy: t.oy != null ? +t.oy : rect ? rect.y + rect.h / 2 : 0,
    };
  }
  function rot(t) {
    var cx = Math.cos(t.rx * RAD), sx = Math.sin(t.rx * RAD), cy = Math.cos(t.ry * RAD), sy = Math.sin(t.ry * RAD), cz = Math.cos(t.rz * RAD), sz = Math.sin(t.rz * RAD);
    return [cy * cz, -cy * sz, sy, cx * sz + sx * sy * cz, cx * cz - sx * sy * sz, -sx * cy, sx * sz - cx * sy * cz, sx * cz + cx * sy * sz, cx * cy];
  }
  function projector(t) {
    if (!t) return function (x, y) { return { x: x, y: y }; };
    var m = rot(t);
    return function (x, y, z) {
      var X = x - t.ox, Y = y - t.oy, Z = z || 0;
      var w = Math.max(0.05, 1 - (m[6] * X + m[7] * Y + m[8] * Z) / t.persp);
      return { x: t.ox + (m[0] * X + m[1] * Y + m[2] * Z) / w, y: t.oy + (m[3] * X + m[4] * Y + m[5] * Z) / w };
    };
  }
  function project(x, y, z, tilt) { return projector(resolve(tilt))(x, y, z); }
  function quad(r, tilt) {
    var f = projector(resolve(tilt, r));
    return [f(r.x, r.y), f(r.x + r.w, r.y), f(r.x + r.w, r.y + r.h), f(r.x, r.y + r.h)];
  }
  function bbox(r, tilt) {
    var q = quad(r, tilt), xs = q.map(function (p) { return p.x; }), ys = q.map(function (p) { return p.y; });
    var x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
    return { x: x, y: y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y };
  }

  function mul(a, b) {
    var r = [], i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) r.push(a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j]);
    return r;
  }
  function T(x, y) { return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, 0, 0, 0, 0, 1]; }
  function matrix3d(rect, tilt, at) {
    at = at || rect;
    var ax = at.x || 0, ay = at.y || 0, s = at.s > 0 ? at.s : 1, t = resolve(tilt, rect), M = T(rect.x - ax, rect.y - ay), out = [], i, c;
    if (t) {
      var m = rot(t);
      M = mul(T(t.ox - ax, t.oy - ay), mul([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / t.persp, 1],
        mul([m[0], m[1], m[2], 0, m[3], m[4], m[5], 0, m[6], m[7], m[8], 0, 0, 0, 0, 1], T(rect.x - t.ox, rect.y - t.oy))));
    }
    for (i = 0; i < 4; i++) { M[i * 4] *= s; M[i * 4 + 1] *= s; }
    for (c = 0; c < 4; c++) for (i = 0; i < 4; i++) { var v = M[i * 4 + c]; out.push(Math.abs(v) < 1e-12 ? "0" : v.toFixed(Math.abs(v) < 0.01 ? 12 : 6)); }
    return "matrix3d(" + out + ")";
  }

  function area(valueB, fitValueB, box) {
    var k = Math.sqrt(valueB / fitValueB);
    return { w: box.w * k, h: box.h * k };
  }
  function rung(path, fitValueB, box, anchor) {
    var v = Story.get(path), a = area(v, fitValueB, box);
    anchor = anchor || "bl";
    return {
      x: anchor.charAt(1) === "r" ? box.x + box.w - a.w : box.x,
      y: anchor.charAt(0) === "t" ? box.y : box.y + box.h - a.h,
      w: a.w, h: a.h,
      rung: { path: path, value: v, fit: fitValueB, area: (box.w * box.h * v) / fitValueB },
    };
  }
  function fitBetween(a, b, p) { return a * Math.pow(b / a, Math.max(0, Math.min(1, p))); }
  function ladder(paths, fit, box, tones, o, an) {
    var a = 0, rs = paths.map(function (p, i) {
      var q = rung(p, fit, box, an);
      q.tone = tones[i];
      Object.assign(q, o);
      if (q.rung.value <= fit * 1.0001) a = i;
      return q;
    });
    rs.a = a;
    return rs;
  }
  function at(m, x, y, s, t) { return matrix3d({ x: m.x + m.k * x, y: m.y + m.k * y, w: 1, h: 1 }, t, { s: m.k * (s || 1) }); }

  Story.cam = { project: project, quad: quad, bbox: bbox, matrix3d: matrix3d, resolve: resolve, at: at };
  Story.area = area;
  Story.rung = rung;
  Story.ladder = ladder;
  Story.fitBetween = fitBetween;
})();

/* CHROME + ATMOSPHERE */
(function () {
  "use strict";
  var Story = window.Story, _ = Story._, P = {};
  var DESK = { ins: 20, len: 28, pad: 40, top: 30, bar: 26, ticks: 18 }, PHONE = { ins: 8, len: 16, pad: 16, top: 18, bar: 14, ticks: 8 };
  var POOL = 500;
  function r1(v) { return Math.round(v * 10) / 10; }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function div(cls, parent, text) { return _.el("div", cls, text, text && "chrome", parent); }
  function path(parent, stroke, width) { return _.svgEl("path", { fill: "none", stroke: stroke, "stroke-width": width }, parent); }

  function build(o) {
    P.pool = o.pool; P.key = o.key; P.grain = o.grain; P.chrome = o.chrome;
    P.deep = div("pool-deep", o.pool);
    P.ember = div("pool-ember", o.pool);
    try {
      var cv = document.createElement("canvas"), x = cv.getContext("2d"), d, seed = 7;
      cv.width = cv.height = 160;
      d = x.createImageData(160, 160);
      for (var i = 0; i < d.data.length; i += 4) {
        seed = (seed * 16807) % 2147483647;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = seed % 256;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      o.grain.style.backgroundImage = "url(" + cv.toDataURL() + ")";
    } catch (e) {}
    var ch = o.chrome;
    P.svg = _.svgEl("svg", { "class": "ch-svg" }, ch);
    P.crop = path(P.svg, "rgba(255,255,255,0.85)", 1.5);
    P.rail = path(P.svg, "rgba(255,255,255,0.28)", 1);
    P.bar = path(P.svg, "rgba(255,255,255,0.18)", 2);
    P.ticks = path(P.svg, "rgba(255,255,255,0.14)", 1);
    P.marks = _.svgEl("g", {}, P.svg);
    P.tl = div("ch-tl", ch);
    div("ch-l1", P.tl, "THE COST OF WAR");
    P.file = div("ch-l2", P.tl);
    P.tr = div("ch-tr", ch);
    var rec = div("ch-l1", P.tr);
    _.el("i", "ch-dot", null, null, rec);
    _.el("span", null, "REC", "chrome", rec);
    P.scroll = _.el("span", "ch-scroll", null, null, rec);
    P.move = div("ch-l2", P.tr);
    P.scan = div("ch-scan", ch);
    div("ch-scan-line", P.scan);
    div("ch-scan-seg", P.scan);
    P.lbl = div("ch-scan-lbl", P.scan, "SCAN");
    P.mark = div("ch-railmark", ch);
    P.fill = div("ch-fill", ch);
    P.sid = div("ch-sid", ch);
  }

  function layout(vp, scenes, total) {
    var W = vp.W, H = vp.H, ph = vp.phone, L = ph ? PHONE : DESK, i = L.ins, n = L.len;
    _.setAttr(P.svg, "width", W);
    _.setAttr(P.svg, "height", H);
    _.setAttr(P.crop, "d", "M" + i + " " + (i + n) + "V" + i + "H" + (i + n) + "M" + (W - i - n) + " " + i + "H" + (W - i) + "V" + (i + n) +
      "M" + (W - i) + " " + (H - i - n) + "V" + (H - i) + "H" + (W - i - n) + "M" + (i + n) + " " + (H - i) + "H" + i + "V" + (H - i - n));
    P.railTop = 140;
    P.railBot = H - 140;
    var rail = ph ? "" : "M26 140V" + P.railBot, k, t;
    for (t = 0; !ph && 140 + t * 24 <= P.railBot; t++) rail += "M26 " + (140 + t * 24) + "H" + (t % 5 ? 31 : 36);
    _.setAttr(P.rail, "d", rail);
    var bx = L.pad, bw = W - L.pad * 2, by = H - L.bar, tk = "";
    _.setAttr(P.bar, "d", "M" + bx + " " + by + "H" + (bx + bw));
    for (k = 0; k <= L.ticks; k++) tk += "M" + r1(bx + (bw * k) / L.ticks) + " " + (by - 4) + "V" + (by + 4);
    _.setAttr(P.ticks, "d", tk);
    P.marks.textContent = "";
    P.markEls = {};
    P.markX = {};
    P.lastMark = null;
    if (!ph) scenes.forEach(function (d) {
      var x = (P.markX[d.id] = r1(bx + (bw * d.start) / total));
      P.markEls[d.id] = _.svgEl("line", { x1: x, x2: x, y1: by - 8, y2: by + 8, stroke: "#FFFFFF", opacity: 0.35 }, P.marks);
    });
    P.mark.style.display = P.sid.style.display = ph ? "none" : "";
    P.sid.style.top = by - 22 + "px";
    P.fill.style.cssText = "left:" + bx + "px;top:" + (by - 2) + "px;width:" + bw + "px";
    P.tl.style.cssText = "left:" + L.pad + "px;top:" + (L.top - 8) + "px";
    P.tr.style.cssText = "right:" + L.pad + "px;top:" + (L.top - 8) + "px";
    P.scan.style.width = W + "px";
    P.scanY0 = ph ? 60 : 70;
    P.scanSpan = H - (ph ? 120 : 150);
    P.tl._sc = P.fill._sc = P.scan._sc = P.sid._sc = null;
  }

  function frame(o) {
    var vp = o.vp, st = o.st, src = st.pool || st.sheet, cx = vp.W / 2, cy = vp.H / 2, r = vp.W * 0.6, warm = false, op = 1;
    if (src && src.w > 0 && src.h > 0) {
      var b = Story.cam.bbox(src, src.tilt);
      cx = b.x + b.w / 2; cy = b.y + b.h / 2;
      r = Math.max(b.w, b.h) * 0.8;
      warm = src.tone === "red";
      op = src.opacity == null ? 1 : src.opacity;
    }
    r = Story.clamp(r, vp.phone ? 260 : 520, Math.max(vp.W, vp.H) * 1.5);
    _.setStyle(P.pool, "transform", "translate(" + r1(cx - POOL) + "px," + r1(cy - POOL) + "px) scale(" + r3(r / POOL) + "," + r3((r * 0.8) / POOL) + ")");
    _.setStyle(P.deep, "opacity", warm ? 0 : r3(o.atmos * op));
    _.setStyle(P.ember, "opacity", warm ? r3(o.atmos * op) : 0);
    _.setStyle(P.key, "opacity", r3(o.atmos));
    _.setStyle(P.grain, "opacity", r3(o.atmos * 0.06));
    _.setStyle(P.chrome, "opacity", r3(o.chrome));
    if (o.chrome <= 0) return;
    var d = o.labels, ph = vp.phone, pos = o.s.toFixed(1) + " / " + o.total.toFixed(1), p = o.labelsP;
    _.setStyle(P.tl, "opacity", d.chrome.labels === false || (ph && d.chrome.labels === "desktop") ? 0 : 1);
    _.setText(P.file, "FILE " + d.file + " · " + String(d.name).toUpperCase(), "chrome");
    _.setText(P.scroll, ph ? "" : "SCROLL " + pos, "chrome");
    _.setText(P.move, ph ? pos + " · " + d.move : "MOVE · " + d.move, "chrome");
    _.setStyle(P.scan, "transform", "translateY(" + r1(P.scanY0 + p * P.scanSpan) + "px)");
    _.setStyle(P.lbl, "opacity", st.noScan ? 0 : 1);
    _.setStyle(P.mark, "transform", "translateY(" + r1(P.railTop + p * (P.railBot - P.railTop)) + "px)");
    _.setStyle(P.fill, "transform", "scaleX(" + r3(Story.clamp(o.s / o.total, 0, 1)) + ")");
    if (!ph && P.lastMark !== d.id) {
      if (P.lastMark) _.setAttr(P.markEls[P.lastMark], "opacity", 0.35);
      _.setAttr(P.markEls[d.id], "opacity", 1);
      P.lastMark = d.id;
      _.setText(P.sid, d.id, "chrome");
      _.setStyle(P.sid, "transform", "translateX(" + r1(P.markX[d.id] + 4) + "px)");
    }
  }

  Story._chrome = { build: build, layout: layout, frame: frame };
})();
