#!/usr/bin/env node
// Story check: the test harness for the scroll story (phase 2 spec, "Test harness").
//
// It serves the repo on a local port, drives headless Chrome over the DevTools
// protocol, and checks the story page against the hard rules: screenshots per
// storyboard frame, every number traced to data.js, scroll-back reverses exactly,
// deep links and reloads land on the right state, still mode works, it runs fast
// enough, it fits the size budget, and the code avoids banned patterns.
//
//   node tools/story-check.mjs                        # everything, desktop + phone
//   node tools/story-check.mjs --scenes S00,S12       # only these scenes
//   node tools/story-check.mjs --views phone          # only the phone view
//   node tools/story-check.mjs --only reverse,lint    # only these checks
//   node tools/story-check.mjs --quick                # coarser sweeps, shorter perf run
//   node tools/story-check.mjs --url tools/fixtures/mock-story.html?break=reverse
//
// Checks (names for --only): shots (also runs trace and colour), reverse, deeplink,
// static, fit, flash, perf, length, size, lint. "trace" is accepted as another name for shots.
// shots also fails a scene that leaves out a frame its storyboard has (storyboard/frames).
// trace accepts Story.missing() figures as tagged and lists them as "needs a data.js field".
// fit: real screen sizes (a phone with its browser bars, small and narrow phones, iPads held
// upright, a phone turned sideways, 200% zoom, a large desktop): every storyboard frame keeps its text on
// screen (nothing cut that is not also cut at the reference size), taps stay 44 px, and a
// stage under 560 px tall shows the still plates instead. Phones (320 × 568 and up) also get
// the short-phone text rule: no visible stage text smaller than its size at 375 × 812 × W/375
// (0.5 px allowed for rounding). length: S00–S12 last at most 18 screens on desktop, and the
// phone story is never longer than the desktop one. flash: scrolls the whole story at a
// steady speed and counts where a quarter or more of a 10° field (341 × 256 px) changes
// in a pair of opposing changes (a flash) of 10% or more; more than 3 flashes in any one
// second fails (WCAG 2.3.1). It scrolls at 1 screen a second (2 with --quick), and at 2 a second at 1920 × 1080.
// Every page load also checks console errors, sideways overflow and rung areas, and on
// the phone view tap targets (every visible link or button at least 44 × 44 px).
// reverse also scrolls a few positions for real (no goto) and compares with goto(), and
// records every style write in the stage while it sweeps: per frame only transform,
// opacity, visibility and pointer-events may change. deeplink also resizes mid-story
// (desktop window; phone width and a real 100svh change): the story must keep its s and
// every scene must then match a fresh load at the new size.
//
// Extra options (not in the spec, for testing the harness itself):
//   --url <path>   page to test, relative to the repo root (default prototype.html). May carry a query.
//   --out <dir>    where results go (default tools/out/story)
//   --code <dir>   folder whose js/story and css/story* the size and lint checks read (default repo root)
//
// --quick: reverse sweep every 0.25 screens instead of 0.05, two reload positions
// instead of four, 180 perf frames instead of 360.
//
// How perf is measured: headless Chrome normally caps animation frames at 30 fps, so the
// harness turns the cap off. Frames then run as fast as the page allows, and each frame
// time is the work that frame took. fps is shown capped at 60, what a real screen shows.
// Pass: median ≥ 55 fps desktop, ≥ 30 fps phone (CPU slowed 4×). 360 frames = 6 s at 60 fps.
// Correctness checks run in a second Chrome that draws canvas in software, because the GPU
// canvas changes its pixels slightly after a few getImageData() calls (see startChrome).
//
// Output: <out>/<ID>-<frame>-<view>.png, static-<view>.png, static-reduced-<view>.png,
//         report.json, compare.html. Exit code 1 if any check fails.
//
// Needs Node 20 or newer (global fetch and WebSocket) and Google Chrome. No npm packages.

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const STORYBOARD_FRAMES = path.join(ROOT, "storyboard", "frames");

// The two views from the spec. Phone uses mobile emulation with touch and DPR 2.
const VIEWS = {
  desktop: { w: 1440, h: 900, dpr: 1, mobile: false },
  phone: { w: 375, h: 812, dpr: 2, mobile: true },
};
const PAGE_CHECKS = ["shots", "reverse", "deeplink", "static", "fit", "flash", "perf", "length"];
const CODE_CHECKS = ["size", "lint"];
const SIZE_BUDGET = 60 * 1024; // the brief's limit for all story code (js/story/**, css/story*.css, css/story/**)
// Each scene's share of it, script + style gzipped (phase 3 spec, "Size and length"): noted, not failed.
const SHARES = { engine: 16.5, s00: 4.1, s01: 3.8, s02: 4.0, s03: 2.6, s04: 2.8, s05: 3.4, s06: 2.6, s07: 3.6, s08: 2.4, s09: 3.5, s10: 2.8, s11: 2.2, s12: 3.7, s13: 1.5 };
const STORY_SCREENS = 18; // brief §7: hero to handover (S00–S12) at most 18 screens on desktop
const RUNG_LIMIT_PCT = 2; // rung area may be off by at most 2%
const OFF_BRAND_LIMIT = 0.2; // % of a frame, same threshold as storyboard/tools/render.mjs

/* ══ Command line ═══════════════════════════════════════════════════ */

function parseArgs(argv) {
  const o = { scenes: null, views: ["desktop", "phone"], only: new Set([...PAGE_CHECKS, ...CODE_CHECKS]), quick: false, url: "prototype.html", out: path.join(ROOT, "tools", "out", "story"), code: ROOT };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i], v = null;
    if (a.includes("=")) [a, v] = [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)];
    const val = () => (v !== null ? v : argv[++i]);
    if (a === "--scenes") o.scenes = val().split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    else if (a === "--views") o.views = val().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--only") o.only = new Set(val().split(",").map((s) => s.trim()).filter(Boolean).map((s) => (s === "trace" ? "shots" : s)));
    else if (a === "--quick") o.quick = true;
    else if (a === "--url") o.url = val().replace(/^\/+/, "");
    else if (a === "--out") o.out = path.resolve(ROOT, val());
    else if (a === "--code") o.code = path.resolve(ROOT, val());
    else if (a === "--help" || a === "-h") {
      // Print the comment block at the top of this file.
      const lines = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1);
      console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith("//"))).map((l) => l.slice(3)).join("\n"));
      process.exit(0);
    }
    else { console.error("Unknown option: " + a + " (try --help)"); process.exit(2); }
  }
  for (const v of o.views) if (!VIEWS[v]) { console.error("Unknown view: " + v + " (desktop or phone)"); process.exit(2); }
  for (const c of o.only) if (!PAGE_CHECKS.includes(c) && !CODE_CHECKS.includes(c)) { console.error("Unknown check: " + c); process.exit(2); }
  return o;
}
const opts = parseArgs(process.argv.slice(2));
const OUT = opts.out;
fs.mkdirSync(OUT, { recursive: true });
const rel = (p) => path.relative(ROOT, p) || ".";

/* ══ Results ════════════════════════════════════════════════════════ */

// Every check ends in one record: pass, fail or skip, a one-line summary,
// optional note lines (printed under the check) and details (report.json only).
const results = [];
function record(check, view, status, summary, notes = [], details = null) {
  const r = { check, view, status, summary, notes, details };
  results.push(r);
  const mark = status === "pass" ? "✓" : status === "fail" ? "✗" : "-";
  console.log(`  ${mark} ${check.padEnd(9)} ${summary}`);
  for (const n of notes.slice(0, 8)) console.log(`              ${n}`);
  if (notes.length > 8) console.log(`              … ${notes.length - 8} more in report.json`);
  return r;
}
const report = { shots: [], flags: [], perf: {}, sizes: null, lint: null, health: {} };

/* ══ PNG decode and colour shares (same classifier as storyboard/tools/render.mjs) ══ */

// 8-bit RGB/RGBA, non-interlaced: what Chrome's screenshots produce.
function decodePNG(buf) {
  let p = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString("ascii", p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    else if (type === "IDAT") idat.push(data);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, px };
}
// Share of the frame (in %) in each brand colour family, plus anything off-brand.
function colourShares(buf) {
  const { w, h, bpp, px } = decodePNG(buf);
  const n = w * h;
  const k = { red: 0, ember: 0, blue: 0, deep: 0, off: 0 };
  for (let i = 0; i < n; i++) {
    const r = px[i * bpp], g = px[i * bpp + 1], b = px[i * bpp + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (r >= 150 && r - g >= 80 && r - b >= 80) k.red++;
    else if (r >= 80 && r - g >= 45 && r - b >= 45) k.ember++;
    else if (b >= 150 && b - r >= 80) k.blue++;
    else if (b >= 45 && b - r >= 30 && b - g >= 12) k.deep++;
    else if (mx - mn >= 60) k.off++;
  }
  const pct = (v) => Math.round((v / n) * 10000) / 100;
  return { red: pct(k.red), ember: pct(k.ember), blue: pct(k.blue), deep: pct(k.deep), off: pct(k.off), w, h };
}
// Colour shares of the matching storyboard still, or null if there is none.
function storyboardShares(id, k, view) {
  const f = path.join(STORYBOARD_FRAMES, `${id}-${k}-${view}.png`);
  if (!fs.existsSync(f)) return null;
  try { return colourShares(fs.readFileSync(f)); } catch { return null; }
}

/* ══ Static file server (serves the repo root) ══════════════════════ */

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".webp": "image/webp" };
function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    // No favicon in the repo: answer with nothing so Chrome does not log a 404 as a console error.
    if (urlPath === "/favicon.ico") { res.writeHead(204); return res.end(); }
    const file = path.join(ROOT, urlPath);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); } // never serve outside the repo
    let target = file;
    try { if (fs.statSync(target).isDirectory()) target = path.join(target, "index.html"); } catch {}
    fs.readFile(target, (err, data) => {
      if (err) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
      res.writeHead(200, { "content-type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/* ══ Chrome over the DevTools protocol (plumbing from storyboard/tools/render.mjs) ══ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// STORY_CHECK_PATIENCE=4 waits four times longer before calling a step stuck, for a computer short of
// memory. It only changes how long a step may take: no check gets easier to pass.
const PATIENCE = Number(process.env.STORY_CHECK_PATIENCE) || 1;
// Two browsers are used:
//  - the check browser draws 2D canvas in software. On the GPU, Chrome moves a canvas to
//    software after a few getImageData() calls, and the pixels shift slightly when it does,
//    so the first snapshots would never match later ones. Software from the start is stable.
//  - the perf browser keeps the normal GPU canvas, so frame times are realistic.
// Both drop headless Chrome's default 30 fps cap so animation frames run at about 60 fps.
async function startChrome({ softwareCanvas }) {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "story-check-"));
  // Port 0 lets Chrome pick a free port; it writes the number to DevToolsActivePort.
  const flags = ["--headless=new", "--remote-debugging-port=0", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--mute-audio", `--user-data-dir=${userDir}`, "--force-color-profile=srgb", "--font-render-hinting=none", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--disable-frame-rate-limit"];
  if (softwareCanvas) flags.push("--disable-accelerated-2d-canvas");
  const proc = spawn(CHROME, [...flags, "about:blank"], { stdio: "ignore" });
  const close = () => { try { proc.kill("SIGKILL"); } catch {} try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {} };
  process.on("exit", close);
  let port = 0;
  for (let i = 0; i < 200 && !port; i++) {
    try { port = parseInt(fs.readFileSync(path.join(userDir, "DevToolsActivePort"), "utf8").split("\n")[0], 10) || 0; } catch {}
    if (!port) await sleep(100);
  }
  if (!port) throw new Error("Chrome did not start (no DevTools port). Is it installed at " + CHROME + "?");
  let target = null;
  for (let i = 0; i < 100 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page"); } catch {}
    if (!target) await sleep(100);
  }
  if (!target) throw new Error("Chrome started but has no page to drive.");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) for (const l of listeners) l(m);
  };
  // Every command has a time limit so a stuck page fails a check instead of hanging the run.
  const send = (method, params = {}, ms = 60000) => new Promise((res, rej) => {
    ms *= PATIENCE;
    const id = ++seq;
    const t = setTimeout(() => { pending.delete(id); rej(new Error(`${method} took longer than ${ms / 1000} s`)); }, ms);
    pending.set(id, { res: (v) => { clearTimeout(t); res(v); }, rej: (e) => { clearTimeout(t); rej(e); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const waitEvent = (name, ms = 45000) => new Promise((res, rej) => {
    ms *= PATIENCE;
    const t = setTimeout(() => { listeners.delete(l); rej(new Error(`no ${name} within ${ms / 1000} s`)); }, ms);
    const l = (m) => { if (m.method === name) { clearTimeout(t); listeners.delete(l); res(m.params); } };
    listeners.add(l);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  return { send, waitEvent, listeners, close: () => { try { ws.close(); } catch {} close(); } };
}

/* ══ Page helpers ════════════════════════════════════════════════════ */

let cdp = null;
let baseURL = "";
let currentView = null;
let currentLoad = "";
// Page health, per view: console errors, sideways overflow, rung area errors, load count.
const health = {};
function healthFor(view) { return (health[view] ||= { loads: 0, errors: [], warnings: [], overflow: [], rungs: new Map(), taps: new Map() }); }

// Collect console errors, uncaught exceptions and failed requests as they happen.
function listenConsole(browser) {
  browser.listeners.add((m) => {
    if (!currentView) return;
    const h = healthFor(currentView);
    let text = null, warn = false;
    if (m.method === "Runtime.exceptionThrown") text = m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text;
    else if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "assert")) text = m.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
    else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "warning") { text = m.params.args.map((a) => a.value ?? a.description ?? "").join(" "); warn = true; }
    else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") text = m.params.entry.text + (m.params.entry.url ? " " + m.params.entry.url : "");
    if (!text || /favicon\.ico/.test(text)) return;
    (warn ? h.warnings : h.errors).push({ load: currentLoad, text: String(text).split("\n")[0].slice(0, 300) });
  });
}

// Build the page URL: --url plus optional extra query text and a #hash.
// Query text is appended as a string so values like ?break=a,b keep their commas.
function pageURL(hash = "", extraQuery = "") {
  const u = new URL(opts.url, baseURL);
  if (extraQuery) u.search = (u.search ? u.search + "&" : "?") + extraQuery;
  u.hash = hash ? "#" + hash : "";
  return u.href;
}

// Size the window for a view. dpr can be overridden (the DPR 3 canvas check), and so can
// the size (the resize check).
async function setView(view, dpr, size) {
  const v = { ...VIEWS[view], ...(size || {}) };
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: v.w, height: v.h, deviceScaleFactor: dpr || v.dpr, mobile: v.mobile, screenWidth: v.w, screenHeight: v.h });
  await cdp.send("Emulation.setTouchEmulationEnabled", v.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
}
async function setReducedMotion(on) {
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "" }] });
}

// Run a function (written below as normal JS) inside the page and return its result.
async function inPage(fn, ...args) {
  const expression = `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, 180000);
  if (r.exceptionDetails) throw new Error("in page: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split("\n")[0]);
  return r.result.value;
}

async function navigate(url) {
  const ev = cdp.waitEvent("Page.loadEventFired");
  const r = await cdp.send("Page.navigate", { url });
  if (r.errorText) throw new Error(`could not open ${url}: ${r.errorText}`);
  await ev;
}
// Open a page fresh (via about:blank, so a #hash is a real new load), wait for
// Story.debug and the fonts, let it settle, then run the page-health checks.
async function load(url, { needStory = true } = {}) {
  currentLoad = url.replace(baseURL, "");
  await navigate("about:blank");
  await navigate(url);
  return afterLoad(needStory);
}
async function reload() {
  const ev = cdp.waitEvent("Page.loadEventFired");
  await cdp.send("Page.reload", {});
  await ev;
  return afterLoad(true);
}
async function afterLoad(needStory) {
  const ready = await inPage(pageReady, needStory ? 15000 : 3000);
  await sleep(250); // ScrollTrigger refresh and the first coalesced render
  // The spec allows one load reveal on S00 (≤ 800 ms, only when the page opens at the top).
  // Let it finish so no check photographs it half way.
  if (ready.mode === "motion" && ready.atTop) await sleep(900);
  await inPage(twoFrames);
  await checkHealth("after load");
  return ready;
}
// Overflow and rung areas, recorded against the current view.
async function checkHealth(when) {
  const h = healthFor(currentView);
  if (when === "after load") h.loads++;
  const f = await inPage(pageHealth);
  if (f.sw > f.cw) h.overflow.push({ load: currentLoad, when, scrollWidth: f.sw, clientWidth: f.cw, offenders: f.offenders });
  // Tap targets (phone only): every link or button a finger can reach is at least 44 px.
  if (VIEWS[currentView] && VIEWS[currentView].mobile) for (const t of f.taps) if (!h.taps.has(t.text)) h.taps.set(t.text, { ...t, load: currentLoad, when });
  for (const r of f.rungs) {
    const key = r.path;
    const prev = h.rungs.get(key);
    if (!prev || Math.abs(r.areaErrorPct) > Math.abs(prev.areaErrorPct)) h.rungs.set(key, r);
  }
}
// Scroll the story to s (via Story.debug.goto) and take a snapshot there.
async function gotoSnap(s) {
  const r = await inPage(pageGoto, s, 5000);
  if (r.timedOut) throw new Error(`Story.debug.goto(${s}) did not resolve within 5 s`);
  return r;
}

// Press Tab once (a real key press) and report which plate's element has focus.
async function pressTab() {
  for (const type of ["rawKeyDown", "keyUp"]) await cdp.send("Input.dispatchKeyEvent", { type, key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await sleep(150);
  return inPage(() => {
    const e = document.activeElement, pl = e && e.closest && e.closest(".plate");
    return { scene: pl ? pl.getAttribute("data-scene") : null, what: e ? (e.textContent || e.tagName).trim().slice(0, 40) : "nothing" };
  });
}

// Screenshot of the viewport, at DPR 1 for both views (the spec allows that for phone).
async function screenshot(view) {
  const v = VIEWS[view];
  const pos = await inPage(() => ({ x: window.scrollX, y: window.scrollY }));
  const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: pos.x, y: pos.y, width: v.w, height: v.h, scale: 1 / v.dpr } });
  return Buffer.from(r.data, "base64");
}
async function fullPageShot(view) {
  const v = VIEWS[view];
  const h = await inPage(() => document.documentElement.scrollHeight);
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: v.w, height: Math.min(h, 16000), scale: 1 / v.dpr } });
  return Buffer.from(r.data, "base64");
}

/* ══ Functions that run inside the page ══════════════════════════════
   These are serialised with toString(), so each one must stand alone:
   no references to anything outside its own body. */

async function pageReady(ms) {
  const has = () => !!(window.Story && window.Story.debug && Array.isArray(window.Story.debug.scenes) && window.Story.debug.scenes.length);
  const t0 = Date.now();
  while (!has() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 50));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const d = has() ? window.Story.debug : null;
  const story = document.getElementById("story"), stage = document.querySelector(".story-stage");
  const H = stage ? stage.getBoundingClientRect().height : innerHeight;
  const atTop = !story || scrollY <= story.getBoundingClientRect().top + scrollY + 0.05 * H;
  return { story: !!d, mode: d ? d.mode : null, goto: !!d && typeof d.goto === "function", snapshot: !!d && typeof d.snapshot === "function", atTop };
}
function twoFrames() {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}
// Story layout facts the harness needs: scenes, total, screen height, anchors.
function pageInfo() {
  const d = window.Story.debug;
  const story = document.getElementById("story");
  const stage = document.querySelector(".story-stage");
  const H = stage ? stage.getBoundingClientRect().height : innerHeight;
  const top = story ? story.getBoundingClientRect().top + scrollY : 0;
  const anchors = Array.from(document.querySelectorAll(".story-anchors [id]")).map((a) => ({ id: a.id, s: (a.getBoundingClientRect().top + scrollY - top) / H }));
  return { total: d.total, scenes: JSON.parse(JSON.stringify(d.scenes)), mode: d.mode, H, top, anchors, flags: JSON.parse(JSON.stringify(d.flags || [])), figs: JSON.parse(JSON.stringify(d.figs || [])) };
}
// goto(s), then a snapshot. State is turned into a JSON string so comparing is exact.
async function pageGoto(s, ms) {
  const d = window.Story.debug;
  let timedOut = false;
  await Promise.race([Promise.resolve(d.goto(s)), new Promise((r) => setTimeout(() => { timedOut = true; r(); }, ms))]);
  const snap = await d.snapshot();
  return { timedOut, scrollY, snap: { s: snap.s, scene: snap.scene, p: snap.p, state: JSON.stringify(snap.state), dom: String(snap.dom), canvas: String(snap.canvas) } };
}
// A whole sweep in one round trip: goto + snapshot at each s in the list.
async function pageSweep(list, ms) {
  const d = window.Story.debug;
  const out = [];
  for (const s of list) {
    let timedOut = false;
    await Promise.race([Promise.resolve(d.goto(s)), new Promise((r) => setTimeout(() => { timedOut = true; r(); }, ms))]);
    const snap = await d.snapshot();
    out.push({ at: s, timedOut, s: snap.s, scene: snap.scene, p: snap.p, state: JSON.stringify(snap.state), dom: String(snap.dom), canvas: String(snap.canvas) });
  }
  return out;
}
// Watch style writes in the stage (on = start, off = stop and return what was wrong).
// The spec allows transform and opacity per frame (plus the engine's visibility toggle and
// pointer-events, which do not move layout). Anything else is a layout write in the loop.
function pageWatchWrites(on) {
  const parse = (t) => Object.fromEntries((t || "").split(";").map((x) => x.split(":")).filter((x) => x[0].trim()).map((x) => [x[0].trim(), x.slice(1).join(":").trim()]));
  const take = (ms) => { for (const m of ms) {
    const a = parse(m.oldValue), b = parse(m.target.getAttribute("style"));
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[k] !== b[k] && !/^(transform|opacity|visibility|pointer-events)$/.test(k)) {
      const c = m.target.className, cls = typeof c === "string" ? c : c && c.baseVal;
      window.__storyWrites.add(`${k} on ${m.target.tagName.toLowerCase()}${cls ? "." + cls.split(" ")[0] : ""}`);
    }
  } };
  if (on) {
    window.__storyWrites = new Set();
    window.__storyMO = new MutationObserver(take);
    window.__storyMO.observe(document.querySelector(".story-stage"), { attributes: true, attributeOldValue: true, attributeFilter: ["style"], subtree: true });
    return true;
  }
  take(window.__storyMO.takeRecords());
  window.__storyMO.disconnect();
  return [...window.__storyWrites];
}
// Scroll the window itself (no goto), let the engine's own path render, and compare
// with goto() at the same s.
async function pageNative(list) {
  const d = window.Story.debug, vp = { H: document.querySelector(".story-stage").getBoundingClientRect().height }, top = document.getElementById("story").getBoundingClientRect().top + scrollY;
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
  const pick = (x) => ({ s: Math.round(x.s * 1e5) / 1e5, scene: x.scene, state: JSON.stringify(x.state), dom: String(x.dom), canvas: String(x.canvas) });
  const out = [];
  for (const s of list) {
    await d.goto(Math.max(0, s - 0.4)); // start somewhere else
    window.scrollTo(0, top + s * vp.H);
    await frames();
    const a = pick(d.snapshot());
    await d.goto(a.s);
    const b = pick(d.snapshot());
    const parts = [];
    for (const k of ["scene", "state", "dom", "canvas"]) if (a[k] !== b[k]) parts.push(k);
    if (Math.abs(a.s - s) > 2 / vp.H) parts.push(`landed at s=${a.s}`);
    out.push({ s, parts });
  }
  return out;
}
// Snapshot where the page is now, without moving, plus where the scroll really is.
async function pageNow() {
  const d = window.Story.debug;
  const story = document.getElementById("story");
  const stage = document.querySelector(".story-stage");
  const H = stage.getBoundingClientRect().height;
  const top = story.getBoundingClientRect().top + scrollY;
  const snap = await d.snapshot();
  return { scrollY, sFromScroll: (scrollY - top) / H, debugS: d.s, snap: { s: snap.s, scene: snap.scene, p: snap.p, state: JSON.stringify(snap.state), dom: String(snap.dom), canvas: String(snap.canvas) } };
}
// Trace: every visible text node in the stage that contains a digit must sit
// inside an element with data-src. Hidden layers, opacity 0 and off-screen text are skipped.
function pageTrace() {
  const stage = document.querySelector(".story-stage");
  if (!stage) return { missing: true, bad: [], tagged: 0 };
  const describe = (el) => {
    const parts = [];
    for (let e = el, i = 0; e && e !== stage && i < 3; e = e.parentElement, i++) {
      const cls = typeof e.className === "string" ? e.className.trim().split(/\s+/)[0] : e.getAttribute("class") || "";
      parts.unshift(e.tagName.toLowerCase() + (cls ? "." + cls : "") + (e.dataset && e.dataset.scene ? `[data-scene=${e.dataset.scene}]` : ""));
    }
    return parts.join(" > ");
  };
  const W = innerWidth, H = innerHeight;
  const bad = [];
  let tagged = 0;
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.replace(/\s+/g, " ").trim();
    if (!/\d/.test(text)) continue;
    const el = n.parentElement;
    if (!el || el.closest("script, style, defs, title, desc")) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) continue;
    const src = el.closest("[data-src]");
    if (src && stage.contains(src)) tagged++;
    else bad.push({ text: text.slice(0, 80), where: describe(el) });
  }
  return { bad, tagged };
}
// The figures (data-src="fig") currently visible in one scene's layer and SVG group.
function pageStageFigs(id) {
  const roots = [...document.querySelectorAll(`.scene-layer[data-scene="${id}"]`), document.querySelector(`.story-svg [data-scene="${id}"]`)].filter(Boolean);
  const out = new Set();
  for (const root of roots) {
    root.querySelectorAll('[data-src="fig"]').forEach((e) => {
      if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || !e.getBoundingClientRect().width) return; // SVG in a hidden <g> passes checkVisibility but has no box
      const t = e.textContent.replace(/\s+/g, " ").trim();
      if (t) out.add(t);
    });
  }
  return Array.from(out);
}
// Still-mode facts: stage hidden, #story not tall, plates visible with their figures.
function pageStaticFacts(required) {
  const norm = (t) => t.replace(/[\s  ]+/g, " ").trim();
  const stage = document.querySelector(".story-stage");
  const story = document.getElementById("story");
  const text = document.querySelector(".story-text");
  const isClipped = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (/inset\(\s*50%/.test(cs.clipPath) || /rect\(\s*0(px)?[\s,]+0/.test(cs.clip)) return true;
      const r = e.getBoundingClientRect();
      if (r.width <= 2 || r.height <= 2) return true;
    }
    return false;
  };
  const plates = Array.from(new Set(document.querySelectorAll("section.plate[data-scene], .story-text .plate"))).map((el) => {
    const r = el.getBoundingClientRect();
    const t = norm(el.textContent);
    const id = el.getAttribute("data-scene");
    const visible = el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && r.width >= 40 && r.height >= 20 && !isClipped(el);
    const alt = !!el.querySelector('[role="img"][aria-label], svg[aria-label], canvas[aria-label], img[alt]:not([alt=""]), figcaption, .sr-only, .visually-hidden');
    return { id, visible, w: Math.round(r.width), h: Math.round(r.height), alt, missing: (required[id] || []).filter((f) => !t.includes(norm(f))) };
  });
  const liveInLive = document.querySelectorAll('[aria-live] [data-src="live"], [aria-live][data-src="live"]').length;
  return {
    stage: stage ? { display: getComputedStyle(stage).display, shown: stage.checkVisibility() && stage.getBoundingClientRect().height > 0 } : null,
    storyH: story ? Math.round(story.getBoundingClientRect().height) : null,
    textH: text ? Math.round(text.getBoundingClientRect().height) : null,
    viewH: innerHeight,
    plates,
    liveInLive,
    mode: window.Story && window.Story.debug ? window.Story.debug.mode : null,
  };
}
// Scroll the whole story at a constant step per frame and record frame times.
async function pagePerf(frames) {
  const story = document.getElementById("story");
  const top = story.getBoundingClientRect().top + scrollY;
  const end = top + story.offsetHeight - innerHeight;
  scrollTo(0, top);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const step = (end - top) / frames;
  const dts = [];
  await new Promise((done) => {
    let last = null, y = top;
    function tick(t) {
      if (last !== null) dts.push(t - last);
      last = t;
      if (y >= end) return done();
      y = Math.min(end, y + step);
      scrollTo(0, y);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  return dts;
}
// Canvases that are actually shown (hidden ones, e.g. plate canvases at 1×1 px in motion mode, are skipped).
function pageCanvasSizes() {
  return Array.from(document.querySelectorAll("#story canvas")).map((c) => {
    const r = c.getBoundingClientRect();
    return { cls: (c.className || "canvas").split(" ")[0], w: c.width, h: c.height, cw: r.width, ch: r.height, shown: c.checkVisibility() && r.width > 2 && r.height > 2 };
  }).filter((c) => c.shown);
}
function pageHealth() {
  const de = document.documentElement;
  const out = { sw: de.scrollWidth, cw: de.clientWidth, offenders: [], rungs: [] };
  if (out.sw > out.cw) {
    // Name a few elements that stick out past the right edge (a hint for a human).
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest(".story-stage")) continue; // the stage clips its own overflow
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > out.cw + 1) out.offenders.push(el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : "") + " right edge " + Math.round(r.right) + "px");
      if (out.offenders.length >= 5) break;
    }
  }
  // Links and buttons on screen that take taps, smaller than 44 × 44 px.
  out.taps = [];
  for (const el of document.querySelectorAll("a[href], button, [role=button], input, select, textarea")) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || getComputedStyle(el).pointerEvents === "none") continue;
    if (r.width < 44 - 0.5 || r.height < 44 - 0.5) out.taps.push({ text: (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
  }
  const d = window.Story && window.Story.debug;
  if (d && Array.isArray(d.rungs)) out.rungs = d.rungs.map((r) => ({ path: r.path, value: r.value, fit: r.fit, areaErrorPct: r.areaErrorPct }));
  return out;
}

/* ══ Helpers for comparing snapshots ════════════════════════════════ */

const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
// Which parts of two snapshots differ, in words.
function diffSnap(a, b) {
  const parts = [];
  if (a.scene !== b.scene) parts.push(`scene ${a.scene} vs ${b.scene}`);
  if (Math.abs((a.p || 0) - (b.p || 0)) > 1e-6) parts.push(`p ${round(a.p, 4)} vs ${round(b.p, 4)}`);
  if (a.state !== b.state) parts.push("state (" + stateDiff(a.state, b.state).join(", ") + ")");
  if (a.dom !== b.dom) parts.push("dom");
  if (a.canvas !== b.canvas) parts.push("canvas");
  return parts;
}
// Paths of the state values that differ, e.g. "lock" or "sheet.w".
function stateDiff(ja, jb) {
  let a, b;
  try { a = JSON.parse(ja); b = JSON.parse(jb); } catch { return ["unreadable"]; }
  const out = [];
  (function walk(x, y, p) {
    if (out.length >= 6) return;
    if (x && y && typeof x === "object" && typeof y === "object") {
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], p ? p + "." + k : k);
    } else if (JSON.stringify(x) !== JSON.stringify(y)) out.push((p || "state") + " " + show(x) + "→" + show(y));
  })(a, b, "");
  return out;
  // Short, readable values: numbers to 2 places, objects cut at 60 characters.
  function show(v) {
    if (typeof v === "number") return String(round(v, 2));
    const s = JSON.stringify(v);
    return s === undefined ? "missing" : s.length > 60 ? s.slice(0, 57) + "…" : s;
  }
}
// The s where a storyboard frame is shot. p = 1 sits just inside the scene (1.5 px
// before its end, so the browser's pixel rounding cannot land on the next scene),
// unless this is the last scene (where s = TOTAL is valid).
function frameS(sc, f, total, H = 900) {
  const last = Math.abs(sc.start + sc.screens - total) < 1e-9;
  if (f.p >= 1 && !last) return round(sc.start + sc.screens - Math.max(0.001, 1.5 / H), 6);
  return round(sc.start + f.p * sc.screens, 6);
}
const inSelected = (scenes, s) => scenes.some((sc) => s >= sc.start - 1e-9 && s <= sc.start + sc.screens + 1e-9);
const pickScenes = (all) => (opts.scenes ? all.filter((sc) => opts.scenes.includes(sc.id)) : all);

/* ══ Check: shots (+ trace, colour) ═════════════════════════════════ */

// For each storyboard frame: go there, screenshot, measure colours, and trace
// every visible number back to a data-src tag.
async function checkShots(view) {
  await load(pageURL());
  const info = await inPage(pageInfo);
  const scenes = pickScenes(info.scenes);
  if (!scenes.length) return record("shots", view, "fail", "no scenes match --scenes " + opts.scenes.join(","));
  const untagged = new Map();
  const colourNotes = [], colourFails = [];
  let count = 0;
  for (const sc of scenes) {
    if (!(sc.frames || []).length) colourNotes.push(`${sc.id} lists no frames in Story.debug.scenes, so it has no shots`);
    for (const f of sc.frames || []) {
      const s = frameS(sc, f, info.total, info.H);
      const g = await gotoSnap(s);
      const buf = await screenshot(view);
      const file = `${sc.id}-${f.k}-${view}.png`;
      fs.writeFileSync(path.join(OUT, file), buf);
      const shares = colourShares(buf);
      const sb = storyboardShares(sc.id, f.k, view);
      const tr = await inPage(pageTrace);
      await checkHealth(`${sc.id}-${f.k}`);
      for (const b of tr.bad) {
        const key = b.text + " @ " + b.where;
        if (!untagged.has(key)) untagged.set(key, { ...b, frames: [] });
        untagged.get(key).frames.push(`${sc.id}-${f.k}`);
      }
      // Colour rules: nothing off-brand; restrained scenes carry no red. At p = 0 a restrained
      // scene may still show the scene before it (scenes hand over by matching end/start
      // states), so red there is only noted.
      const name = `${sc.id}-${f.k}`;
      if (shares.off > OFF_BRAND_LIMIT) colourFails.push(`${name}: off-brand ${shares.off}% (limit ${OFF_BRAND_LIMIT}%)`);
      if (sc.restrained && shares.red > 0.05) {
        if (f.p > 0) colourFails.push(`${name}: red ${shares.red}% in a restrained scene (should be none)`);
        else colourNotes.push(`${name}: red ${shares.red}% at p 0 of a restrained scene (the hand-over frame; check it fades out)`);
      }
      if (!sc.restrained && shares.red > 5) colourNotes.push(`${name}: red ${shares.red}% is over the ≈5% budget`);
      if (shares.blue > 3) colourNotes.push(`${name}: blue ${shares.blue}% is over the ≈3% budget`);
      report.shots.push({ view, id: sc.id, k: f.k, p: f.p, s, scene: g.snap.scene, file, shares, storyboard: sb, restrained: !!sc.restrained, untagged: tr.bad.length });
      count++;
    }
  }
  // Every frame the storyboard drew (storyboard/frames/<ID>-<k>-<view>.png, not the plate or the
  // alternatives) must be one of the scene's frames, so each one is shot and compared.
  const sbFiles = fs.existsSync(STORYBOARD_FRAMES) ? fs.readdirSync(STORYBOARD_FRAMES) : [];
  const lacking = [];
  for (const sc of scenes) {
    const want = sbFiles.map((f) => new RegExp(`^${sc.id}-([a-z]+)-${view}\\.png$`).exec(f)).filter(Boolean).map((m) => m[1]).filter((k) => k !== "plate");
    for (const k of want) if (!(sc.frames || []).some((f) => f.k === k)) lacking.push(`${sc.id} has no "${k}" frame (storyboard/frames/${sc.id}-${k}-${view}.png)`);
  }
  record("shots", view, lacking.length ? "fail" : "pass", lacking.length ? `${lacking.length} storyboard frame(s) missing from the scenes` : `${count} frames saved to ${rel(OUT)} · every storyboard frame covered`, lacking);
  const worstOff = Math.max(0, ...report.shots.filter((x) => x.view === view).map((x) => x.shares.off));
  record("colour", view, colourFails.length ? "fail" : "pass", colourFails.length ? `${colourFails.length} frame(s) off the colour rules` : `on brand (worst off-brand ${worstOff}%)`, [...colourFails, ...colourNotes.map((n) => "note: " + n)]);
  const bad = [...untagged.values()];
  // The review notes (js/story-debug/flags.js): readers never load them, the harness does, so the report lists them.
  await inPage(() => window.__reviewNotes || (window.__reviewNotes = new Promise((r) => { const s = document.createElement("script"); s.src = "js/story-debug/flags.js"; s.onload = () => r(1); s.onerror = () => r(0); document.head.appendChild(s); })));
  // Read the flags again now: some are raised only while a frame renders (S09's derived years).
  const flags = await inPage(() => JSON.parse(JSON.stringify(window.Story.debug.flags || [])));
  const flagNotes = flags.map((f) => "flag: " + (f.kind ? f.kind + ": " : "") + (f.text || f.why || JSON.stringify(f)));
  report.flags = flags;
  // Story.missing(): a figure the live site prints that js/data.js lacks. Tagged (data-src
  // "missing"), so trace accepts it, and always listed: each one needs a data.js field.
  const missing = flags.filter((f) => f.kind === "missing");
  record("trace", view, bad.length ? "fail" : "pass",
    (bad.length ? `${bad.length} visible number(s) without data-src` : `every visible number is tagged · ${flags.length} flag(s) for approval`) + (missing.length ? ` · ${missing.length} figure(s) need a data.js field` : ""),
    [...bad.map((b) => `untagged "${b.text}" in ${b.where} (${b.frames.join(", ")})`), ...flagNotes], { untagged: bad, flags });
}

/* ══ Check: reverse ═════════════════════════════════════════════════ */

// Sweep down the story and back up in small steps. Every position must look
// identical both ways: scroll position alone sets the state.
async function checkReverse(view) {
  await load(pageURL());
  const info = await inPage(pageInfo);
  const scenes = pickScenes(info.scenes);
  const step = opts.quick ? 0.25 : 0.05;
  const list = [];
  for (let i = 0; i * step <= info.total + 1e-9; i++) { const s = round(i * step, 6); if (inSelected(scenes, s)) list.push(s); }
  if (list[list.length - 1] !== info.total && inSelected(scenes, info.total)) list.push(info.total);
  const perStep = 4000;
  await inPage(pageWatchWrites, true); // record every style write in the stage during both sweeps
  const down = await inPage(pageSweep, list, perStep);
  const up = (await inPage(pageSweep, [...list].reverse(), perStep)).reverse();
  const writes = await inPage(pageWatchWrites, false);
  // goto() renders at once; readers scroll. A few positions reached by plain scrolling
  // (ScrollTrigger → requestAnimationFrame → render) must match goto() exactly.
  const natList = [0.37, 0.63, 0.81].flatMap((f) => scenes.map((sc) => round(sc.start + sc.screens * f, 4)));
  const native = await inPage(pageNative, natList);
  const mismatches = [];
  const stuck = down.concat(up).filter((x) => x.timedOut).map((x) => x.at);
  for (let i = 0; i < list.length; i++) {
    const parts = diffSnap(down[i], up[i]);
    if (parts.length) mismatches.push({ s: list[i], parts });
  }
  const notes = mismatches.map((m) => `s=${m.s}: ${m.parts.join("; ")}`);
  if (stuck.length) notes.unshift(`goto() did not resolve within ${perStep / 1000} s at s=${stuck.slice(0, 5).join(", ")}`);
  const natBad = native.filter((n) => n.parts.length);
  for (const n of natBad) notes.push(`plain scroll to s=${n.s}: ${n.parts.join("; ")} (goto() and a real scroll disagree)`);
  for (const w of writes) notes.push(`layout write while scrolling: ${w} (per frame only transform, opacity, visibility, pointer-events)`);
  const fail = mismatches.length || stuck.length || natBad.length || writes.length;
  record("reverse", view, fail ? "fail" : "pass",
    fail ? `${mismatches.length} of ${list.length} positions differ when scrolling back · ${natBad.length} plain-scroll mismatch(es) · ${writes.length} layout write(s)`
      : `${list.length} positions, every step ${step} screens, identical both ways · ${native.length} plain scrolls match goto() · only transform/opacity written`,
    notes, { step, positions: list.length, mismatches, native, writes });
}

/* ══ Check: deeplink ════════════════════════════════════════════════ */

// Each anchor opened fresh must land at its scene start and show exactly the
// state you get by scrolling there. Then reload at a few positions: same rule.
async function checkDeeplink(view) {
  await load(pageURL());
  const info = await inPage(pageInfo);
  const scenes = pickScenes(info.scenes);
  const problems = [];
  // Nothing in the stage may take keyboard focus (hard rule): plates carry the real links.
  const tabbable = await inPage(() => Array.from(document.querySelectorAll(".story-stage *")).filter((e) => e.tabIndex >= 0).map((e) => (e.textContent || e.tagName).trim().slice(0, 40)));
  for (const t of tabbable) problems.push(`tabbable element inside the stage: "${t}"`);
  // Every scene needs its own anchor (#s00, #s01 …).
  for (const sc of scenes) if (!info.anchors.some((a) => a.id === sc.id.toLowerCase())) problems.push(`no #${sc.id.toLowerCase()} anchor for ${sc.id}`);
  const anchors = info.anchors.filter((a) => inSelected(scenes, a.s));
  // Reference snapshots: the same page, scrolled to each anchor by goto().
  const refs = {};
  for (const a of anchors) refs[a.id] = await gotoSnap(a.s);
  let checked = 0;
  for (const a of anchors) {
    await load(pageURL(a.id));
    const fresh = await inPage(pageNow);
    checked++;
    if (Math.abs(fresh.sFromScroll - a.s) > 0.01) { problems.push(`#${a.id}: landed at s=${round(fresh.sFromScroll)}, expected s=${round(a.s)}`); continue; }
    if (Math.abs((fresh.debugS ?? -1) - fresh.sFromScroll) > 0.005) problems.push(`#${a.id}: engine says s=${round(fresh.debugS)} but the page is at s=${round(fresh.sFromScroll)}`);
    let ref = refs[a.id];
    if (Math.abs(ref.scrollY - fresh.scrollY) > 0.5) {
      // The browser parked one pixel away from goto(): take the reference at that exact spot.
      await load(pageURL());
      ref = await gotoSnap(fresh.sFromScroll);
    }
    const parts = diffSnap(fresh.snap, ref.snap);
    if (parts.length) problems.push(`#${a.id} (s=${round(a.s)}): ${parts.join("; ")}`);
    // Keyboard: the first Tab after a deep link stays at or after the linked scene (never back to S01).
    if (ref !== refs[a.id]) await load(pageURL(a.id));
    const tab = await pressTab();
    const sc = info.scenes.find((x) => x.id === tab.scene);
    if (!sc) problems.push(`#${a.id}: the first Tab focused something outside the plates (${tab.what})`);
    else if (sc.start < info.scenes.filter((x) => x.start <= a.s + 1e-6).pop().start - 1e-6) problems.push(`#${a.id}: the first Tab jumped back to ${sc.id} ("${tab.what}")`);
  }
  // Reload at a few positions away from scene edges.
  const picks = (opts.quick ? [0.38, 0.87] : [0.13, 0.38, 0.62, 0.87]).map((f) => round(info.total * f, 3)).filter((s) => inSelected(scenes, s));
  if (!picks.length) for (const sc of scenes) picks.push(round(sc.start + sc.screens * 0.37, 3));
  await load(pageURL());
  for (const s of picks) {
    const before = await gotoSnap(s);
    await reload();
    const after = await inPage(pageNow);
    checked++;
    let ref = before;
    if (Math.abs(after.scrollY - before.scrollY) > 1) {
      // Chrome restored a different scroll position: compare with a scroll to where it is now.
      problems.push(`note: reload at s=${s} came back at s=${round(after.sFromScroll)} (browser scroll restore)`);
      await gotoSnap(Math.min(info.total, after.sFromScroll + 0.3));
      ref = await gotoSnap(after.sFromScroll);
    }
    if (Math.abs((after.debugS ?? -1) - after.sFromScroll) > 0.005) problems.push(`reload at s=${s}: engine says s=${round(after.debugS)} but the page is at s=${round(after.sFromScroll)}`);
    const parts = diffSnap(after.snap, ref.snap);
    if (parts.length) problems.push(`reload at s=${s}: ${parts.join("; ")}`);
  }
  // Resize mid-story. A width change (and on a phone a real change of 100svh, e.g. split
  // screen) re-lays out and keeps the reader's place; the frame must then equal a fresh load
  // at the new size. (A toolbar or keyboard never changes 100svh.) Late positions, the very
  // end and a reader below the story (at #haveyoursay) keep their place too. A stage shorter
  // than 560 px (a phone turned sideways, 200% zoom) reloads into the still plates, on the
  // scene that was on screen.
  const sizes = VIEWS[view].mobile
    ? [{ w: 414, h: 812, at: 0.31, why: "width 375 → 414" }, { w: 375, h: 700, at: 0.31, why: "100svh 812 → 700" }, { w: 390, h: 664, at: 1, why: "at the end, 812 → 664" },
      { w: 768, h: 1024, at: 0.31, why: "phone → iPad held upright" }, { w: 1024, h: 768, at: 0.31, why: "phone → iPad on its side (desktop layout)" },
      { w: 812, h: 375, at: 0.62, still: true, why: "turned sideways" }]
    : [{ w: 1200, h: 800, at: 0.31, why: "window 1440×900 → 1200×800" }, { w: 1280, h: 720, at: 0.9, why: "late, 1440×900 → 1280×720" }, { w: 1440, h: 1000, at: 1, why: "at the end, taller" },
      { w: 1440, h: 1000, at: "below", why: "at #haveyoursay, taller" }, { w: 720, h: 450, at: 0.62, still: true, why: "200% zoom" }];
  for (const z of sizes) {
    try {
      await load(pageURL());
      const rs = typeof z.at === "number" ? round(info.total * z.at, 3) : null;
      const before = rs != null ? await gotoSnap(rs) : await inPage(() => { scrollTo(0, document.getElementById("haveyoursay").offsetTop); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
      if (z.still) {
        const ev = cdp.waitEvent("Page.loadEventFired", 20000);
        await setView(view, null, z);
        await ev;
        await inPage(pageReady, 15000);
        await sleep(300);
        const f = await inPage((id) => ({ mode: window.Story.debug.mode, reason: window.Story.debug.reason, top: Math.round(document.getElementById("plate-" + id.toLowerCase()).getBoundingClientRect().top), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }), before.snap.scene);
        checked++;
        if (f.mode !== "static") problems.push(`resize (${z.why}): still in "${f.mode}" mode; a stage under 560 px should show the still plates`);
        else if (Math.abs(f.top) > 60) problems.push(`resize (${z.why}) at s=${rs}: the still plates opened ${f.top}px away from ${before.snap.scene}'s plate`);
        if (f.sw > f.cw) problems.push(`resize (${z.why}): the still page scrolls sideways (${f.sw} > ${f.cw})`);
        await navigate("about:blank"); // so restoring the size does not reload this page again
        continue;
      }
      await setView(view, null, z);
      await sleep(500);
      await inPage(twoFrames);
      const after = await inPage(pageNow);
      checked++;
      if (rs == null) {
        const top = await inPage(() => Math.round(document.getElementById("haveyoursay").getBoundingClientRect().top));
        if (Math.abs(top) > 2) problems.push(`resize (${z.why}): "Have your say" moved to ${top}px from the top of the screen`);
        continue;
      }
      const H = after.scrollY / Math.max(after.sFromScroll, 1e-9);
      if (Math.abs(after.debugS - rs) > 2 / H) problems.push(`resize (${z.why}) at s=${rs}: the story jumped to s=${round(after.debugS)}`);
      if (Math.abs((after.debugS ?? -1) - after.sFromScroll) > 0.005) problems.push(`resize (${z.why}): engine says s=${round(after.debugS)} but the page is at s=${round(after.sFromScroll)}`);
      // every scene re-laid out: its middle frame, in the resized page and in a fresh one
      const list = [after.snap.s, ...scenes.map((sc) => round(sc.start + sc.screens * 0.5, 4))];
      const resized = await inPage(pageSweep, list, 4000);
      await load(pageURL()); // fresh, at the new size
      const fresh = await inPage(pageSweep, list, 4000);
      list.forEach((x, i) => {
        const parts = diffSnap(resized[i], fresh[i]);
        if (parts.length) problems.push(`resize (${z.why}) then s=${x}: ${parts.join("; ")} (differs from a fresh load at that size)`);
      });
    } finally { await setView(view); }
  }
  const fails = problems.filter((p) => !p.startsWith("note:"));
  record("deeplink", view, fails.length ? "fail" : "pass",
    fails.length ? `${fails.length} problem(s) in ${checked} deep links, reloads and resizes` : `${anchors.length} anchors (${anchors.map((a) => "#" + a.id).join(" ")}), ${picks.length} reloads and ${sizes.length} resize(s) match`,
    problems, { anchors, picks, resizes: sizes });
}

/* ══ Check: static ══════════════════════════════════════════════════ */

// ?static=1 and prefers-reduced-motion: no stage, normal height, every plate
// visible with all the figures its scene shows, and no console errors.
async function checkStatic(view, motionOK) {
  // First learn which figures each scene shows in motion mode (union over its frames,
  // limited to strings Story.debug.figs logged, so counting-up values do not count).
  const required = {};
  let scenes = null;
  if (motionOK) {
    await load(pageURL());
    const info = await inPage(pageInfo);
    scenes = pickScenes(info.scenes);
    const logged = new Set();
    for (const f of info.figs) for (const v of Object.values(f)) if (typeof v === "string") logged.add(v.replace(/\s+/g, " ").trim());
    for (const sc of scenes) {
      const seen = new Set();
      for (const f of sc.frames || []) { await gotoSnap(frameS(sc, f, info.total, info.H)); for (const t of await inPage(pageStageFigs, sc.id)) seen.add(t); }
      required[sc.id] = [...seen].filter((t) => !logged.size || logged.has(t));
    }
  }
  const variants = [
    { name: "?static=1", url: pageURL("", "static=1"), reduced: false, shot: `static-${view}.png` },
    { name: "reduced motion", url: pageURL(), reduced: true, shot: `static-reduced-${view}.png` },
  ];
  const problems = [];
  const h = healthFor(view);
  for (const v of variants) {
    if (v.reduced) await setReducedMotion(true);
    const errorsBefore = h.errors.length;
    try {
      await load(v.url, { needStory: false });
      const f = await inPage(pageStaticFacts, required);
      fs.writeFileSync(path.join(OUT, v.shot), await fullPageShot(view));
      const tag = v.name + ": ";
      if (!f.stage) problems.push(tag + "no .story-stage element");
      else if (f.stage.shown) problems.push(tag + `the stage is still displayed (display: ${f.stage.display})`);
      if (f.storyH === null) problems.push(tag + "no #story element");
      else if (f.textH !== null && f.storyH > f.textH + f.viewH * 0.5) problems.push(tag + `#story is ${f.storyH}px tall but its plates take ${f.textH}px (still has the scroll height)`);
      const ids = scenes ? scenes.map((s) => s.id) : [...new Set(f.plates.map((p) => p.id))];
      for (const id of ids) if (!f.plates.some((p) => p.id === id)) problems.push(tag + `no plate for ${id}`);
      for (const p of f.plates.filter((p) => !scenes || ids.includes(p.id))) {
        if (!p.visible) problems.push(tag + `plate ${p.id} is not visible (${p.w}×${p.h}px or clipped)`);
        for (const m of p.missing) problems.push(tag + `plate ${p.id} is missing the figure "${m}"`);
        if (!p.alt) problems.push(`note: ${tag}plate ${p.id} has no obvious text alternative (role="img" + aria-label, or a visually hidden sentence)`);
      }
      if (f.liveInLive) problems.push(tag + "a live counter sits inside aria-live");
      if (f.mode && f.mode !== "static") problems.push(`note: ${tag}Story.debug.mode is "${f.mode}", expected "static"`);
      for (const e of h.errors.slice(errorsBefore)) problems.push(tag + "console error: " + e.text);
    } finally {
      if (v.reduced) await setReducedMotion(false);
    }
  }
  const fails = problems.filter((p) => !p.startsWith("note:"));
  record("static", view, fails.length ? "fail" : "pass",
    fails.length ? `${fails.length} problem(s) in still mode` : `?static=1 and reduced motion: stage hidden, plates visible with their figures`,
    problems, { required });
}

/* ══ Check: fit (real screen sizes) ═════════════════════════════════ */

// Stage text that is less than 90% on screen (visible layers, opacity ≥ 0.5). Text that a scene's
// own window crops (an inset clip-path on an ancestor, e.g. S00's paper inside the phone's visual
// band) is cropped by design, not by the screen edge: it is skipped.
function pageCut() {
  const out = [], vw = innerWidth, vh = innerHeight, stage = document.querySelector(".story-stage");
  if (!stage) return out;
  const clipped = (n, b) => {
    for (let e = n.parentElement; e && e !== stage; e = e.parentElement) {
      const m = /^inset\(([^)]*)\)/.exec(getComputedStyle(e).clipPath);
      if (!m) continue;
      const [t, r = t, bo = t, l = r] = m[1].trim().split(/\s+/).map(parseFloat), R = e.getBoundingClientRect();
      if (b.top < R.top + t - 0.5 || b.bottom > R.bottom - bo + 0.5 || b.left < R.left + l - 0.5 || b.right > R.right - r + 0.5) return true;
    }
    return false;
  };
  for (const layer of stage.querySelectorAll(".scene-layer")) {
    if (layer.style.visibility !== "visible") continue;
    const w = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) {
      const t = n.nodeValue.replace(/\s+/g, " ").trim();
      if (!t) continue;
      let o = 1;
      for (let e = n.parentElement; e && e !== stage; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none") { o = 0; break; } o *= +cs.opacity; }
      if (o < 0.5) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      if (b.width < 1 || b.height < 1 || clipped(n, b)) continue;
      const vis = (Math.max(0, Math.min(vw, b.right) - Math.max(0, b.left)) * Math.max(0, Math.min(vh, b.bottom) - Math.max(0, b.top))) / (b.width * b.height);
      if (vis < 0.9) out.push(t.slice(0, 40));
    }
  }
  return out;
}
// Effective size (px on screen) of every stage text with a box: computed font size × the local
// scale of everything that transforms it (CSS transforms, the 3D paper, SVG groups). The scale is
// read from three zero-size probes put in the text's element (its static position, then 100 px
// right and 100 px down in its own coordinates). Key: layer, text, occurrence. Live counters skipped.
function pageTextSizes() {
  const stage = document.querySelector(".story-stage"), out = {}, seen = {}, items = [];
  if (!stage) return out;
  const W = innerWidth, H = innerHeight;
  const w = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const t = n.nodeValue.replace(/\s+/g, " ").trim(), el = n.parentElement;
    if (!t || !el || el.closest("defs, title, desc, [data-src=live]")) continue;
    let o = 1;
    for (let e = el; e && e !== stage; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none") { o = 0; break; } o *= +cs.opacity; }
    if (getComputedStyle(el).visibility === "hidden") o = 0;
    const r = document.createRange();
    r.selectNodeContents(n);
    const b = r.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) continue;
    let on = o >= 0.05 && b.right > 0 && b.bottom > 0 && b.left < W && b.top < H;
    for (let e = el; on && e !== stage; e = e.parentElement) { // hidden by a scene's own window (inset clip-path)
      const m = /^inset\(([^)]*)\)/.exec(getComputedStyle(e).clipPath);
      if (!m) continue;
      const [ct, cr = ct, cb = ct, cl = cr] = m[1].trim().split(/\s+/).map(parseFloat), R = e.getBoundingClientRect();
      if (b.bottom <= R.top + ct || b.top >= R.bottom - cb || b.right <= R.left + cl || b.left >= R.right - cr) on = false;
    }
    const layer = el.closest("[data-scene]"), key0 = (layer ? layer.getAttribute("data-scene") : el.closest(".story-chrome") ? "chrome" : "stage") + "|" + t;
    seen[key0] = (seen[key0] || 0) + 1;
    items.push({ key: key0 + "|" + seen[key0], el, t, on, fs: parseFloat(getComputedStyle(el).fontSize) });
  }
  const P = [];
  for (const it of items) {
    if (it.el instanceof SVGElement) { const m = it.el.getScreenCTM(); it.s = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1; continue; }
    if (!it.el._pr) {
      it.el._pr = ["", "translate(100px,0)", "translate(0,100px)"].map((tf) => {
        const i = document.createElement("i");
        i.style.cssText = "position:absolute;width:0;height:0;margin:0;padding:0;border:0;transform:" + (tf || "none");
        it.el.appendChild(i);
        P.push(i);
        return i;
      });
    }
    it.pr = it.el._pr;
  }
  for (const it of items) if (it.pr) {
    const q = it.pr.map((i) => i.getBoundingClientRect()), ax = (q[1].left - q[0].left) / 100, ay = (q[1].top - q[0].top) / 100, bx = (q[2].left - q[0].left) / 100, by = (q[2].top - q[0].top) / 100;
    it.s = Math.sqrt(Math.abs(ax * by - ay * bx));
  }
  for (const i of P) { delete i.parentNode._pr; i.remove(); }
  for (const it of items) out[it.key] = { t: it.t.slice(0, 40), on: it.on, px: Math.round(it.fs * it.s * 100) / 100 };
  return out;
}
const FIT = {
  phone: [{ w: 375, h: 812, ref: true }, { w: 390, h: 664, why: "iPhone with Safari's bars" }, { w: 375, h: 667, why: "iPhone SE" }, { w: 360, h: 640, why: "Android" }, { w: 320, h: 568, why: "small phone" }, { w: 414, h: 896, why: "large phone" }, { w: 360, h: 740, why: "common Android" }, { w: 390, h: 600, why: "short, wide phone window" }, { w: 414, h: 622, why: "iPhone Plus with Safari's bars" }, { w: 540, h: 810, tablet: true, why: "iPad in half-screen" }, { w: 500, h: 700, tablet: true, why: "narrow desktop window" }, { w: 768, h: 1024, tablet: true, why: "iPad held upright" }, { w: 820, h: 1180, tablet: true, why: "larger iPad held upright" },
    { w: 375, h: 548, still: true, why: "iPhone SE with Safari's bars" }, { w: 667, h: 375, still: true, why: "phone turned sideways" }],
  desktop: [{ w: 1440, h: 900, ref: true }, { w: 1920, h: 1080, why: "large desktop" }, { w: 1024, h: 640, why: "small laptop window" },
    { w: 720, h: 450, still: true, why: "200% zoom" }, { w: 844, h: 390, still: true, why: "phone turned sideways (wide)" }],
};
async function checkFit(view) {
  const problems = [], notes = [], refSizes = {}, small = new Map(), unmatched = new Set();
  let ref = null, frames = 0, textChecked = 0;
  try {
    for (const z of FIT[view]) {
      await setView(view, null, z);
      await load(pageURL(), { needStory: false });
      const mode = await inPage(() => window.Story && window.Story.debug ? window.Story.debug.mode : null);
      const tag = `${z.w}×${z.h}${z.why ? " (" + z.why + ")" : ""}`;
      if (z.still) {
        if (mode !== "static") problems.push(`${tag}: "${mode}" mode; a stage under 560 px tall should show the still plates`);
        const f = await inPage(pageHealth);
        if (f.sw > f.cw) problems.push(`${tag}: the still page scrolls sideways (${f.sw} > ${f.cw})`);
        continue;
      }
      if (mode !== "motion") { problems.push(`${tag}: "${mode}" mode, expected the moving story`); continue; }
      const info = await inPage(pageInfo), kt = await inPage(() => window.Story.debug.vp().kt); // W/375 on a phone; an upright tablet draws a narrower column
      const cut = new Map(), taps = new Map();
      for (const sc of pickScenes(info.scenes)) for (const f of sc.frames || []) {
        await gotoSnap(frameS(sc, f, info.total, info.H));
        frames++;
        for (const t of await inPage(pageCut)) if (!cut.has(`${sc.id}-${f.k}|${t}`)) cut.set(`${sc.id}-${f.k}|${t}`, `${sc.id}-${f.k}: "${t}"`);
        // phones: the short-phone text rule against the same frame at 375 × 812
        if (VIEWS[view].mobile) {
          const sz = await inPage(pageTextSizes), name = `${sc.id}-${f.k}`;
          if (z.ref) refSizes[name] = sz;
          else if (refSizes[name]) for (const [k, x] of Object.entries(sz)) {
            const r = refSizes[name][k];
            if (!x.on) continue;
            textChecked++;
            if (!r) { unmatched.add(`${name} "${x.t}"`); continue; }
            if (z.tablet && r.px * kt > 60) continue; // the rule guards small text; S09's year is capped at 180 px for the flash rule
            const need = r.px * kt - 0.5;
            if (x.px < need) small.set(`${tag}|${name}|${k}`, `${tag} ${name}: "${x.t}" is ${x.px} px, needs ${round(need + 0.5, 2)} (${r.px} px at 375 × 812 × ${round(kt, 3)})`);
          }
        }
        const h = await inPage(pageHealth);
        if (VIEWS[view].mobile) for (const t of h.taps) taps.set(t.text, `${sc.id}-${f.k}: "${t.text}" is ${t.w}×${t.h} px`);
        if (h.sw > h.cw) problems.push(`${tag} ${sc.id}-${f.k}: the page scrolls sideways`);
      }
      if (z.ref) { ref = new Set(cut.keys()); notes.push(`note: ${cut.size} deliberate crop(s) at the reference size ${tag}`); continue; }
      for (const [k, v] of cut) if (!ref || !ref.has(k)) problems.push(`${tag} ${v} is cut off by the screen edge`);
      for (const v of taps.values()) problems.push(`${tag} ${v} (under 44 px)`);
    }
  } finally { await navigate("about:blank"); await setView(view); }
  problems.push(...small.values());
  if (VIEWS[view].mobile) notes.push(`note: short-phone text rule: ${textChecked} visible texts compared with 375 × 812, ${small.size} too small` + (unmatched.size ? `, ${unmatched.size} with no match at 375 × 812 (not judged): ${[...unmatched].slice(0, 6).join(", ")}` : ""));
  record("fit", view, problems.length ? "fail" : "pass",
    problems.length ? `${problems.length} problem(s) at real screen sizes` : `${FIT[view].length - 1} other sizes: text on screen, taps ≥ 44 px, still plates under 560 px tall` + (VIEWS[view].mobile ? ", no text under its 375 × 812 size × W/375" : "") + ` (${frames} frames)`,
    [...problems, ...notes]);
}

/* ══ Check: flash (WCAG 2.3.1, three flashes) ═══════════════════════ */

// Relative luminance per pixel of a screenshot (sRGB, as WCAG defines it).
const LIN = new Float32Array(256).map((_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
function lumaOf(buf) {
  const { w, h, bpp, px } = decodePNG(buf), L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = 0.2126 * LIN[px[i * bpp]] + 0.7152 * LIN[px[i * bpp + 1]] + 0.0722 * LIN[px[i * bpp + 2]];
  return { w, h, L };
}
// WCAG 2.3.1 general flash: a flash is a pair of opposing brightness changes (10% or more of
// full brightness, the darker side under 0.8) over a quarter or more of a 10° field (341 × 256
// px). Each window on a 16 px grid keeps its own run of changes: up after down (or down after
// up) is a transition, two transitions are a flash. A fade (all down) or a single cut is never
// more than one; a year changing in place is many.
function flashTracker(w, h, sc) {
  const ww = Math.round(341 * sc), wh = Math.round(256 * sc), st = Math.max(1, Math.round(16 * sc)), wins = [];
  for (let y = 0; y + wh <= h; y += st) for (let x = 0; x + ww <= w; x += st) wins.push({ x, y, last: 0, t: [] });
  const Iu = new Int32Array((w + 1) * (h + 1)), Id = new Int32Array((w + 1) * (h + 1));
  return function step(A, B, n) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, d = B.L[i] - A.L[i], dark = Math.min(A.L[i], B.L[i]) < 0.8, j = (y + 1) * (w + 1) + x + 1;
      Iu[j] = (d >= 0.1 && dark ? 1 : 0) + Iu[j - 1] + Iu[j - w - 1] - Iu[j - w - 2];
      Id[j] = (d <= -0.1 && dark ? 1 : 0) + Id[j - 1] + Id[j - w - 1] - Id[j - w - 2];
    }
    const area = (I, x, y) => (I[(y + wh) * (w + 1) + x + ww] - I[y * (w + 1) + x + ww] - I[(y + wh) * (w + 1) + x] + I[y * (w + 1) + x]) / (ww * wh);
    let worst = 0;
    for (const W of wins) {
      for (const d of [area(Iu, W.x, W.y) >= 0.25 ? 1 : 0, area(Id, W.x, W.y) >= 0.25 ? -1 : 0]) if (d && d !== W.last) { W.t.push(n); W.last = d; }
      while (W.t.length && W.t[0] <= n - 60) W.t.shift(); // the last second (60 frames)
      worst = Math.max(worst, Math.floor(W.t.length / 2));
    }
    return worst;
  };
}
async function checkFlash(view) {
  // 1 screen a second everywhere, plus an ordinary flick (2 a second) on the biggest screen, where type is largest.
  const sizes = view === "desktop" ? [{ w: 1440, h: 900 }, { w: 1920, h: 1080 }, { w: 1920, h: 1080, speed: 2 }] : [{ w: 375, h: 812 }];
  const BASE = opts.quick ? 2 : 1, FPS = 60, SC = 0.5, problems = [], notes = [];
  try {
    for (const z of sizes) {
      await setView(view, null, z);
      await load(pageURL());
      const info = await inPage(pageInfo);
      const v = { ...VIEWS[view], ...z };
      const SPEED = z.speed || BASE;
      let prev = null, step = null, worst = 0, at = null, n = 0;
      for (let s = 0; s <= info.total + 1e-9; s += SPEED / FPS, n++) {
        await inPage(pageGoto, Math.min(s, info.total), 5000);
        const pos = await inPage(() => scrollY);
        const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: pos, width: v.w, height: v.h, scale: SC / v.dpr } });
        const cur = lumaOf(Buffer.from(r.data, "base64"));
        if (prev) {
          step = step || flashTracker(cur.w, cur.h, SC);
          const f = step(prev, cur, n);
          if (f > worst) { worst = f; at = { s: round(s, 3), scene: await inPage(() => window.Story.debug.active) }; }
        }
        prev = cur;
      }
      const tag = `${z.w}×${z.h} at ${SPEED} screen(s) a second`;
      notes.push(`note: ${tag}: at most ${worst} flash(es) in any one second` + (at ? ` (around s ${at.s}, ${at.scene})` : ""));
      if (worst > 3) problems.push(`${tag}: ${worst} flashes within one second around s ${at.s} (${at.scene}); at most 3`);
    }
  } finally { await setView(view); }
  record("flash", view, problems.length ? "fail" : "pass",
    problems.length ? `${problems.length} size(s) flash more than 3 times a second` : `steady scrolls at ${sizes.map((z) => `${z.w}×${z.h} (${z.speed || BASE}/s)`).join(", ")}: never more than 3 flashes in one second`, [...problems, ...notes]);
}

/* ══ Check: length (brief §7, §11) ═════════════════════════════════ */

// Hero to handover (S00–S12) at most 18 screens on desktop; the phone story never longer.
async function checkLength(view) {
  await load(pageURL());
  const info = await inPage(pageInfo);
  const upTo = info.scenes.filter((sc) => /^S(0\d|1[0-2])$/.test(sc.id));
  const story = round(upTo.reduce((a, sc) => a + sc.screens, 0), 3);
  (report.length ||= {})[view] = { s00ToS12: story, total: info.total, scenes: info.scenes.map((sc) => `${sc.id} ${sc.screens}`) };
  const problems = [];
  if (story > STORY_SCREENS + 1e-9) problems.push(`S00–S12 last ${story} screens; at most ${STORY_SCREENS}`);
  const desk = report.length.desktop;
  if (view !== "desktop" && desk && info.total > desk.total + 1e-9) problems.push(`the ${view} story is ${info.total} screens, longer than desktop (${desk.total})`);
  record("length", view, problems.length ? "fail" : "pass", problems.length ? problems.join("; ") : `S00–S12 ${story} of ${STORY_SCREENS} screens · whole story ${info.total}` + (desk && view !== "desktop" ? ` (desktop ${desk.total})` : ""),
    [`note: ${upTo.map((sc) => `${sc.id} ${sc.screens}`).join(" · ")}`]);
}

/* ══ Check: perf ════════════════════════════════════════════════════ */

// Scroll the whole story at a steady speed and time every frame. Phone runs with
// the CPU slowed 4×. Then check the canvas backing store at DPR 3 stays ≤ 2×.
async function checkPerf(view) {
  const checkBrowser = cdp;
  cdp = await perfBrowser(); // the GPU-canvas browser (see startChrome)
  try { await measurePerf(view); }
  finally { cdp = checkBrowser; }
}
let perfChrome = null;
async function perfBrowser() {
  if (!perfChrome) { perfChrome = await startChrome({ softwareCanvas: false }); listenConsole(perfChrome); }
  return perfChrome;
}
async function measurePerf(view) {
  const v = VIEWS[view];
  const throttle = v.mobile ? 4 : 1;
  const target = v.mobile ? 30 : 55; // fps: spec targets 60 desktop (55 allows vsync jitter), ≥30 phone
  await setView(view);
  await setReducedMotion(false);
  await load(pageURL());
  if (throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
  let dts;
  try { dts = await inPage(pagePerf, opts.quick ? 180 : 360); }
  finally { if (throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 }); }
  // Frames are not capped at 60 here (see startChrome), so each frame time is the work that
  // frame took. fps is that turned round and capped at 60, the most a real screen shows.
  const sorted = [...dts].sort((a, b) => a - b);
  const q = (f) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * f))] || 0;
  const fps = (ms) => Math.min(60, 1000 / Math.max(ms, 0.001));
  const median = fps(q(0.5)), p95 = fps(q(0.95));
  const long = dts.filter((d) => d > 50).length;
  const stats = { frames: dts.length, throttle, medianMs: round(q(0.5), 2), p95Ms: round(q(0.95), 2), medianFps: round(median, 1), p95Fps: round(p95, 1), longFrames: long, worstMs: round(sorted[sorted.length - 1] || 0, 1) };
  // DPR 3: canvas backing size must stay within 2× its CSS size. Motion mode (the stage)
  // and ?static=1 (still plates may draw a canvas once).
  await setView(view, 3);
  let canvases = [];
  try {
    await load(pageURL());
    canvases.push(...(await inPage(pageCanvasSizes)).map((c) => ({ ...c, mode: "motion" })));
    await load(pageURL("", "static=1"), { needStory: false });
    canvases.push(...(await inPage(pageCanvasSizes)).map((c) => ({ ...c, mode: "static" })));
  } finally { await setView(view); }
  const big = canvases.filter((c) => c.cw > 0 && (c.w > 2 * c.cw + 2 || c.h > 2 * c.ch + 2));
  stats.canvasAtDpr3 = canvases;
  report.perf[view] = stats;
  const notes = [];
  if (p95 < target) notes.push(`note: p95 ${round(p95, 1)} fps is under the ${target} fps target`);
  for (const c of big) notes.push(`canvas .${c.cls} (${c.mode}) is ${c.w}×${c.h} for ${round(c.cw, 0)}×${round(c.ch, 0)} CSS px at DPR 3 (cap is 2×)`);
  if (!canvases.some((c) => c.mode === "motion")) notes.push("note: no visible canvas in motion mode");
  const fail = median < target || big.length;
  record("perf", view, fail ? "fail" : "pass",
    `median ${stats.medianFps} fps (${stats.medianMs} ms a frame), p95 ${stats.p95Fps} fps (${stats.p95Ms} ms), ${long} long frame(s) over 50 ms` + (throttle > 1 ? `, CPU ${throttle}× slower` : "") + (median < target ? ` (needs ${target})` : ""),
    notes, stats);
}

/* ══ Page health lines (console, overflow, rungs) ═══════════════════ */

function recordHealth(view) {
  const h = healthFor(view);
  record("console", view, h.errors.length ? "fail" : "pass",
    h.errors.length ? `${h.errors.length} console error(s) across ${h.loads} page loads` : `no console errors on ${h.loads} page loads`,
    [...h.errors.map((e) => `${e.load}: ${e.text}`), ...h.warnings.map((w) => `note: warning on ${w.load}: ${w.text}`)]);
  // The same overflow seen at many frames is one problem: group by page and widths.
  const groups = new Map();
  for (const o of h.overflow) {
    const k = `${o.load}|${o.scrollWidth}|${o.clientWidth}`;
    if (!groups.has(k)) groups.set(k, { ...o, whens: [] });
    groups.get(k).whens.push(o.when);
  }
  record("overflow", view, h.overflow.length ? "fail" : "pass",
    h.overflow.length ? `the page scrolls sideways (seen ${h.overflow.length} time(s))` : "no sideways scroll",
    [...groups.values()].map((o) => `${o.load}: scrollWidth ${o.scrollWidth} > clientWidth ${o.clientWidth} (${o.whens.join(", ")})` + (o.offenders.length ? " · " + o.offenders.join(", ") : "")));
  const rungs = [...h.rungs.values()];
  const badRungs = rungs.filter((r) => typeof r.areaErrorPct !== "number" || Math.abs(r.areaErrorPct) > RUNG_LIMIT_PCT);
  record("rungs", view, badRungs.length ? "fail" : "pass",
    rungs.length ? (badRungs.length ? `${badRungs.length} of ${rungs.length} rung(s) off by more than ${RUNG_LIMIT_PCT}%` : `${rungs.length} rung(s), worst area error ${round(Math.max(...rungs.map((r) => Math.abs(r.areaErrorPct))), 2)}%`) : "no rungs logged",
    badRungs.map((r) => `${r.path}: area off by ${typeof r.areaErrorPct === "number" ? round(r.areaErrorPct, 2) + "%" : "unknown (no areaErrorPct)"}`));
  const taps = [...h.taps.values()];
  if (VIEWS[view].mobile) record("taps", view, taps.length ? "fail" : "pass", taps.length ? `${taps.length} tap target(s) under 44 px` : "every visible link and button is at least 44 × 44 px",
    taps.map((t) => `"${t.text}" is ${t.w}×${t.h} px (${t.load} ${t.when})`));
  report.health[view] = { loads: h.loads, errors: h.errors, warnings: h.warnings, overflow: h.overflow, rungs, taps };
}

/* ══ Code checks: which files are story code ════════════════════════ */

function walk(dir, test) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, test));
    else if (test(e.name)) out.push(p);
  }
  return out;
}
// js/story/**/*.js + css/story.css (and any css/story*.css) + css/story/**/*.css
function storyFiles(base) {
  const css = path.join(base, "css");
  const top = fs.existsSync(css) ? fs.readdirSync(css).filter((f) => /^story.*\.css$/.test(f)).map((f) => path.join(css, f)) : [];
  return [...walk(path.join(base, "js", "story"), (n) => n.endsWith(".js")), ...top, ...walk(path.join(css, "story"), (n) => n.endsWith(".css"))].sort();
}

/* ══ Check: size ════════════════════════════════════════════════════ */

function checkSize() {
  const files = storyFiles(opts.code);
  if (!files.length) return record("size", null, "fail", `no story code found under ${rel(opts.code)} (js/story, css/story*)`);
  const gz = (f) => { const buf = fs.readFileSync(f); return { file: rel(f), bytes: buf.length, gzip: zlib.gzipSync(buf).length }; }; // zlib default level, as a server would send it
  const rows = files.map(gz);
  const total = rows.reduce((a, r) => a + r.gzip, 0);
  const kb = (b) => (b / 1024).toFixed(1) + " KB";
  // Per scene (script + style) against its share; the engine, base styles and boot as one.
  const per = {};
  for (const r of rows) { const m = /(?:scenes|story)\/(s\d+)\.(?:js|css)$/.exec(r.file); const id = m ? m[1] : "engine"; per[id] = (per[id] || 0) + r.gzip; }
  // One file for all scenes (js/story/scenes.js, css/story/scenes.css): each section, from its "/* Snn" header to the
  // next, gzipped on its own (an estimate: together they compress better than this sum), the file's own share to "engine".
  for (const r of rows) {
    if (!/\/scenes\.(?:js|css)$/.test(r.file)) continue;
    const src = fs.readFileSync(path.join(ROOT, r.file), "utf8"), cuts = [...src.matchAll(/^\/\* (S\d\d)\b/gm)];
    per.engine -= r.gzip;
    let used = 0;
    cuts.forEach((c, i) => { const id = c[1].toLowerCase(), z = zlib.gzipSync(src.slice(c.index, i + 1 < cuts.length ? cuts[i + 1].index : undefined)).length; per[id] = (per[id] || 0) + z; used += z; });
    per.engine += Math.max(0, r.gzip - used);
  }
  const perNotes = Object.keys(per).sort().map((id) => {
    const share = SHARES[id] != null ? SHARES[id] * 1024 : null;
    return `note: ${id === "engine" ? "engine + base" : id.toUpperCase()} ${kb(per[id])}` + (share ? (per[id] > share ? ` · over its ${kb(share)} share` : ` of its ${kb(share)} share`) : " (no share set)");
  });
  // Data and drawings are assets, reported apart (phase 3 spec): js/map/**, js/story-assets/**.
  const base = opts.code;
  const assets = [...walk(path.join(base, "js", "map"), (n) => n.endsWith(".js")), ...walk(path.join(base, "js", "story-assets"), () => true)].map(gz);
  const assetNotes = assets.map((a) => `note: asset (not story code) ${kb(a.gzip).padStart(8)}  ${a.file}`);
  report.sizes = { files: rows, totalGzip: total, budget: SIZE_BUDGET, scenes: per, shares: SHARES, assets };
  record("size", null, total > SIZE_BUDGET ? "fail" : "pass", `${kb(total)} gzipped of the ${kb(SIZE_BUDGET)} budget (${rows.length} files, ${kb(SIZE_BUDGET - total)} left)`,
    [...perNotes, ...assetNotes, ...rows.sort((a, b) => b.gzip - a.gzip).map((r) => `${kb(r.gzip).padStart(8)}  ${r.file}`)]);
}

/* ══ Check: lint ════════════════════════════════════════════════════ */

// Blank out comments but keep every character's position, so line numbers stay true.
// Strings stay in (copy, colours and fonts live in strings). Regex literals are
// guessed from the character before the slash: good enough for this code.
function stripComments(src, js) {
  let out = "", mode = null, last = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i], d = src[i + 1];
    if (mode === "block") { if (c === "*" && d === "/") { out += "  "; i++; mode = null; } else out += c === "\n" ? "\n" : " "; continue; }
    if (mode === "line") { if (c === "\n") { out += "\n"; mode = null; } else out += " "; continue; }
    if (mode) { // inside a string or regex: copy as is
      out += c;
      if (c === "\\") { out += d ?? ""; i++; continue; }
      if (c === mode || (mode === "/" && c === "/")) { mode = null; last = "x"; }
      else if (c === "\n" && mode !== "`") mode = null;
      continue;
    }
    if (c === "/" && d === "*") { out += "  "; i++; mode = "block"; continue; }
    if (js && c === "/" && d === "/") { out += "  "; i++; mode = "line"; continue; }
    if (c === '"' || c === "'" || (js && c === "`")) { mode = c; out += c; continue; }
    if (js && c === "/" && (last === "" || "(,=:[!&|?{};+-*%<>~^".includes(last))) { mode = "/"; out += c; continue; }
    out += c;
    if (!/\s/.test(c)) last = c;
  }
  return out;
}
const lineOf = (code, idx) => code.slice(0, idx).split("\n").length;
// Find the matching closing bracket ("{" or "("), skipping strings.
function matchBrace(code, open) {
  const o = code[open], cl = o === "(" ? ")" : "}";
  let depth = 0, q = null;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === o) depth++;
    else if (c === cl && --depth === 0) return i;
  }
  return code.length - 1;
}
// Bodies of functions whose name matches `names`: name(…) {, name: function (…) {,
// name = (…) => {, and name: (…) => ( … ) for arrows that return an object.
function functionBodies(code, names) {
  const found = [];
  const pats = [
    new RegExp(`\\b(${names})\\s*\\([^()]*\\)\\s*\\{`, "g"),
    new RegExp(`\\b(${names})\\s*[:=]\\s*function\\b[^(]*\\([^()]*\\)\\s*\\{`, "g"),
    new RegExp(`\\b(${names})\\s*[:=]\\s*(?:\\([^()]*\\)|[\\w$]+)\\s*=>\\s*[{(]`, "g"),
  ];
  for (const re of pats) for (const m of code.matchAll(re)) {
    const open = m.index + m[0].length - 1;
    found.push({ name: m[1], start: open, end: matchBrace(code, open) });
  }
  return found;
}

// Brand colours (spec "Brand"), plus the paper gradient the spec names for the
// Sheet, plus black (the spec's vignette is rgba(0,0,0,.6)).
const BRAND_HEX = new Set(["0A0A0A", "FFFFFF", "C4C9CF", "8A9099", "E8362B", "3C8FDE", "8F1B14", "0E2A44", "1B1D20", "121315", "0D0E10", "000000"]);
const BRAND_RGB = new Set([...BRAND_HEX].map((h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",")));
// Fonts: the brand three, their fallbacks, and generic families.
const FONT_OK = new Set(["archivo black", "ibm plex sans", "ibm plex mono", "arial black", "arial", "helvetica", "helvetica neue", "menlo", "monaco", "consolas", "courier new", "courier", "sfmono-regular", "-apple-system", "blinkmacsystemfont", "segoe ui", "liberation mono", "sans-serif", "monospace", "system-ui", "ui-monospace", "ui-sans-serif", "inherit", "initial", "unset"]);

function checkLint() {
  const files = storyFiles(opts.code);
  if (!files.length) return record("lint", null, "fail", `no story code found under ${rel(opts.code)} (js/story, css/story*)`);
  const findings = []; // {level: "fail"|"check", rule, file, line, text}
  for (const f of files) {
    const js = f.endsWith(".js");
    const src = fs.readFileSync(f, "utf8");
    const code = stripComments(src, js);
    const srcLines = src.split("\n");
    const add = (level, rule, idx, extra = "") => {
      const line = lineOf(code, idx);
      findings.push({ level, rule, file: rel(f), line, token: extra, text: (extra ? extra + " · " : "") + (srcLines[line - 1] || "").trim().slice(0, 120) });
    };
    const scan = (re, level, rule) => { for (const m of code.matchAll(re)) add(level, rule, m.index, m[0]); };

    // Motion rules: no bouncy easing, no smooth-scroll library, no snapping, no scrub smoothing.
    scan(/\b(elastic|bounce)\w*/gi, "fail", "bouncy easing");
    scan(/\bback\s*\.\s*(in|out|inOut)\b|\bBack\.ease\w*|ease\s*:\s*["'`]back\b/gi, "fail", "back easing");
    for (const m of code.matchAll(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/g)) {
      if (+m[2] < 0 || +m[2] > 1 || +m[4] < 0 || +m[4] > 1) add("fail", "overshooting cubic-bezier (bounces)", m.index, m[0]);
    }
    scan(/lenis|ScrollSmoother|locomotive|smooth-scrollbar/gi, "fail", "smooth-scroll library");
    // Story state comes from scroll alone: no CSS motion on story elements, and scenes
    // never use the clock, timers or tweens (live counters go through Story.live, the one
    // load reveal lives in the engine).
    if (!js) scan(/\btransition(?:-[a-z-]+)?\s*:|\banimation(?:-[a-z-]+)?\s*:|@keyframes\b/g, "fail", "CSS transition or animation (time-based motion)");
    if (js && /[\\/]scenes(?:[\\/]|\.js$)/.test(f)) scan(/\b(?:setTimeout|setInterval|requestAnimationFrame|Date\.now|performance\.now)\s*\(|\bgsap\s*\.\s*(?:to|from|fromTo|timeline|set|delayedCall)\b|\.animate\s*\(/g, "fail", "clock, timer or tween in a scene (state must come from scroll)");
    scan(/scroll-snap[\w-]*|scrollSnap\w*/g, "fail", "scroll-snap");
    scan(/scrub\s*:\s*-?\.?\d[\d.]*/g, "fail", "scrub with a number (smoothing)");
    // aria-live anywhere, except removeAttribute("aria-live"), which is the right thing to do.
    for (const m of code.matchAll(/aria-live|ariaLive/g)) if (!/removeAttribute\(\s*["'`]$/.test(code.slice(Math.max(0, m.index - 24), m.index))) add("fail", "aria-live", m.index, m[0]);

    // Colours: hex and rgb()/rgba() must be brand colours.
    for (const m of code.matchAll(/(^|[^\w&#$])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g)) {
      let h = m[2].toUpperCase();
      if (h.length <= 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
      h = h.slice(0, 6);
      if (!BRAND_HEX.has(h)) add("fail", "off-brand colour", m.index + m[1].length, "#" + m[2]);
    }
    for (const m of code.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
      if (!BRAND_RGB.has(`${+m[1]},${+m[2]},${+m[3]}`)) add("fail", "off-brand colour", m.index, m[0] + ")");
    }

    // Fonts: banned names anywhere, and every family named in a font list must be allowed.
    scan(/\b(Anton|Bebas(?:\s*Neue)?|Oswald|Montserrat|Roboto|Inter|Archivo(?![\s+]*Black)(?:\s+Narrow)?)\b/g, "fail", "off-brand font");
    // Font lists: CSS "font-family: a, b", JS "fontFamily = ...", SVG font-family="...".
    // Tokens built from JS expressions (" + F.mono + ") are skipped: only literal names are judged.
    const fontLists = [
      ...code.matchAll(/font-family\s*:\s*([^;}{\n]+)/gi),
      ...code.matchAll(/fontFamily\s*[:=]\s*([^;}\n]+)/g),
      ...code.matchAll(/font-family\\?["']?\s*[=,]\s*\\?["']([^"'\\]+)/g),
    ];
    for (const m of fontLists) {
      for (let tok of m[1].replace(/var\([^)]*\)/g, "").replace(/!important/g, "").split(",")) {
        tok = tok.trim().replace(/^(\\?["'`])+|(\\?["'`])+$/g, "").trim();
        if (!/^[A-Za-z-][A-Za-z0-9 -]*$/.test(tok)) continue; // an expression, not a name
        if (!FONT_OK.has(tok.toLowerCase())) add("fail", "off-brand font", m.index, tok);
      }
    }
    if (js) {
      // Canvas font strings like "600 14px 'IBM Plex Sans', sans-serif": judge the family
      // names inside each string literal (quoted names, a bare name after the size, names after commas).
      for (const m of code.matchAll(/\.font\s*=\s*([^;\n]+)/g)) {
        for (const q of m[1].matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
          const str = q[1] ?? q[2] ?? q[3];
          const names = [
            ...[...str.matchAll(/'([^']+)'|"([^"]+)"/g)].map((n) => n[1] ?? n[2]),
            ...[...str.matchAll(/\d(?:px|pt|em|rem)\s+([A-Za-z][A-Za-z0-9 -]*)/g)].map((n) => n[1]),
            ...[...str.matchAll(/,\s*([A-Za-z][A-Za-z0-9 -]*)/g)].map((n) => n[1]),
          ];
          for (const n of names) if (!FONT_OK.has(n.trim().toLowerCase())) add("fail", "off-brand font", m.index, n.trim());
        }
      }

      // Render functions: layout-affecting style writes (a human checks these).
      for (const b of functionBodies(code, "render\\w*|draw\\w*|tick|loop|frame|onFrame")) {
        const body = code.slice(b.start, b.end);
        // also the engine's cached writer: api.set(el, "width", …) / setStyle(el, "top", …)
        for (const m of body.matchAll(/\.style\.(top|left|right|bottom|width|height|fontSize|inset|margin\w*|padding\w*)\s*=(?!=)|\.style\.setProperty\(\s*["'`](top|left|right|bottom|width|height|font-size|inset|margin[\w-]*|padding[\w-]*)["'`]|\.style\.cssText\s*=(?!=)|\.setAttribute\(\s*["'`]style["'`]|\.style\[[^\]]+\]\s*=(?!=)|\b(?:set|setStyle)\(\s*[^,()]+,\s*["'`](top|left|right|bottom|width|height|fontSize|font-size|inset|margin\w*|padding\w*|display|position)["'`]/g)) {
          add("check", `layout write inside ${b.name}() — check it is not per frame`, b.start + m.index, m[0]);
        }
      }
      // state() must be pure: no randomness, no clock.
      const stateBodies = functionBodies(code, "state");
      for (const m of code.matchAll(/\bstate\s*:\s*([A-Za-z_$][\w$]*)\s*[,}\n]/g)) stateBodies.push(...functionBodies(code, m[1].replace(/\$/g, "\\$")));
      for (const b of stateBodies) {
        const body = code.slice(b.start, b.end);
        for (const m of body.matchAll(/Math\.random\s*\(|Date\.now\s*\(|performance\.now\s*\(|new\s+Date\s*\(/g)) add("fail", `impure ${b.name}(): ${m[0].replace(/\s*\($/, "()")}`, b.start + m.index, m[0]);
      }
    }
  }
  // The same thing on the same line can be found by two patterns (e.g. a banned font name
  // and a font list): keep one. Then sort by file and line.
  const seen = new Set();
  const uniq = findings.filter((x) => { const k = [x.rule, x.file, x.line, String(x.token).toLowerCase()].join("|"); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  report.lint = { files: files.map(rel), findings: uniq };
  const fails = uniq.filter((x) => x.level === "fail"), checks = uniq.filter((x) => x.level === "check");
  record("lint", null, fails.length ? "fail" : "pass",
    `${files.length} files · ${fails.length} problem(s)` + (checks.length ? ` · ${checks.length} for a human to check` : ""),
    [...fails.map((x) => `${x.file}:${x.line} ${x.rule}: ${x.text}`), ...checks.map((x) => `check: ${x.file}:${x.line} ${x.rule}: ${x.text}`)]);
}

/* ══ compare.html: storyboard still beside prototype shot ═══════════ */

function writeCompare() {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sbRel = path.relative(OUT, STORYBOARD_FRAMES).split(path.sep).join("/");
  const shareLine = (x) => x
    ? `red <b>${x.red}%</b> · ember ${x.ember}% · blue <b>${x.blue}%</b> · deep ${x.deep}% · <span class="${x.off > OFF_BRAND_LIMIT ? "warn" : ""}">off-brand ${x.off}%</span>`
    : `<span class="dim">no storyboard still for this frame</span>`;
  let body = "";
  for (const view of opts.views) {
    const rows = report.shots.filter((s) => s.view === view);
    if (!rows.length) continue;
    body += `<h2>${view === "phone" ? "Phone · 375×812" : "Desktop · 1440×900"}</h2>`;
    for (const r of rows) {
      const sbFile = `${sbRel}/${r.id}-${r.k}-${view}.png`;
      body += `<section class="row ${view}">
  <h3>${esc(r.id)} · ${esc(r.k)} <span class="dim">p ${r.p} · s ${r.s}${r.restrained ? " · restrained" : ""}${r.untagged ? ` · <span class="warn">${r.untagged} untagged number(s)</span>` : ""}</span></h3>
  <div class="pair">
    <figure><figcaption>Storyboard</figcaption>${r.storyboard ? `<img loading="lazy" src="${esc(sbFile)}" alt="Storyboard ${esc(r.id)} ${esc(r.k)} ${view}">` : `<div class="none">No storyboard still</div>`}<p>${shareLine(r.storyboard)}</p></figure>
    <figure><figcaption>Prototype</figcaption><img loading="lazy" src="${esc(r.file)}" alt="Prototype ${esc(r.id)} ${esc(r.k)} ${view}"><p>${shareLine(r.shares)}</p></figure>
  </div>
</section>`;
    }
  }
  const failed = results.filter((r) => r.status === "fail");
  const summary = results.map((r) => `<li class="${r.status}">${r.status === "pass" ? "✓" : r.status === "fail" ? "✗" : "-"} ${esc(r.check)}${r.view ? " · " + r.view : ""} — ${esc(r.summary)}</li>`).join("");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Story check · compare</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 24px 16px 64px; background: #0A0A0A; color: #C4C9CF; font: 14px/1.5 'IBM Plex Sans', system-ui, sans-serif; }
  h1 { color: #FFFFFF; font-size: 22px; margin: 0 0 4px; }
  h2 { color: #FFFFFF; font-size: 18px; margin: 40px 0 8px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px; }
  h3 { color: #FFFFFF; font: 500 13px/1.4 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: 0.06em; margin: 24px 0 8px; }
  .dim { color: #8A9099; font-weight: 400; }
  .warn { color: #E8362B; }
  ul.sum { list-style: none; padding: 0; margin: 12px 0 0; font: 12px/1.6 'IBM Plex Mono', ui-monospace, monospace; }
  ul.sum li.fail { color: #E8362B; } ul.sum li.pass { color: #8A9099; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .phone .pair { grid-template-columns: repeat(2, minmax(0, 375px)); }
  figure { margin: 0; min-width: 0; }
  figcaption { font: 500 11px/1 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; color: #8A9099; margin-bottom: 6px; }
  img { display: block; width: 100%; height: auto; border: 1px solid rgba(255,255,255,0.12); }
  .none { aspect-ratio: 16 / 10; display: grid; place-items: center; border: 1px dashed rgba(255,255,255,0.2); color: #8A9099; }
  .phone .none { aspect-ratio: 375 / 812; }
  figure p { margin: 6px 0 0; font: 12px/1.5 'IBM Plex Mono', ui-monospace, monospace; color: #8A9099; }
  figure p b { color: #C4C9CF; font-weight: 500; }
  @media (max-width: 700px) { .pair { grid-template-columns: 1fr; } }
</style></head><body>
<h1>Storyboard vs prototype</h1>
<p class="dim">${esc(opts.url)} · ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC · ${failed.length ? `<span class="warn">${failed.length} check(s) failed</span>` : "all checks passed"}. Colour shares use the storyboard renderer's classifier (budget ≈ 5% red, 3% blue, off-brand ≤ ${OFF_BRAND_LIMIT}%).</p>
<ul class="sum">${summary}</ul>
${body || '<p class="dim">No shots in this run.</p>'}
</body></html>`;
  fs.writeFileSync(path.join(OUT, "compare.html"), html);
}

/* ══ Main ═══════════════════════════════════════════════════════════ */

async function main() {
  console.log(`Story check · ${opts.url} · ${opts.views.join(", ")} · ${[...opts.only].join(", ")}${opts.quick ? " · quick" : ""}${opts.scenes ? " · scenes " + opts.scenes.join(",") : ""}`);
  const pageChecks = PAGE_CHECKS.filter((c) => opts.only.has(c));
  let server = null;
  if (pageChecks.length) {
    const pageFile = path.join(ROOT, opts.url.split(/[?#]/)[0]);
    if (!fs.existsSync(pageFile)) {
      console.log("\npage");
      for (const c of pageChecks) record(c, null, "fail", `page not found: ${opts.url}`);
    } else {
      server = await startServer();
      baseURL = `http://127.0.0.1:${server.address().port}/`;
      cdp = await startChrome({ softwareCanvas: true });
      listenConsole(cdp);
      for (const view of opts.views) {
        console.log(`\n${view}`);
        currentView = view;
        await setView(view);
        await setReducedMotion(false);
        // Is the story there at all?
        let ready = { story: false };
        try { ready = await load(pageURL()); } catch (e) { ready = { story: false, error: e.message }; }
        // The motion checks need Story.debug in motion mode with goto() and snapshot().
        let why = null;
        if (!ready.story) why = "Story.debug never appeared" + (ready.error ? ": " + ready.error : "");
        else if (ready.mode !== "motion") why = `the normal page came up with Story.debug.mode = "${ready.mode}", not "motion"`;
        else if (!ready.goto || !ready.snapshot) why = "Story.debug has no " + (!ready.goto ? "goto()" : "snapshot()");
        const motionOK = !why;
        if (why) record("ready", view, "fail", why + "; only the static check can run");
        const run = { shots: checkShots, reverse: checkReverse, deeplink: checkDeeplink, static: (v) => checkStatic(v, motionOK), fit: checkFit, flash: checkFlash, perf: checkPerf, length: checkLength };
        for (const c of pageChecks) {
          if (!motionOK && c !== "static") { record(c, view, "skip", "skipped: the page is not ready for motion checks"); continue; }
          try { await run[c](view); }
          catch (e) { record(c, view, "fail", "the check itself stopped: " + e.message.split("\n")[0]); }
        }
        recordHealth(view);
      }
      cdp.close();
      if (perfChrome) perfChrome.close();
      server.close();
    }
  }
  const codeChecks = CODE_CHECKS.filter((c) => opts.only.has(c));
  if (codeChecks.length) {
    console.log("\ncode");
    if (opts.only.has("size")) checkSize();
    if (opts.only.has("lint")) checkLint();
  }

  const failed = results.filter((r) => r.status === "fail");
  const out = { generated: new Date().toISOString(), url: opts.url, views: opts.views, scenes: opts.scenes, quick: opts.quick, ok: failed.length === 0, checks: results, ...report };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(out, null, 2));
  if (report.shots.length) writeCompare();
  console.log(`\n${failed.length ? "✗" : "✓"} ${failed.length ? `${failed.length} of ${results.length} checks failed` : `all ${results.length} checks passed`}.`);
  console.log(`Report: ${rel(path.join(OUT, "report.json"))}` + (report.shots.length ? `\nCompare: ${rel(path.join(OUT, "compare.html"))}` : ""));
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error("story-check stopped: " + (e && e.stack || e)); process.exit(1); });
