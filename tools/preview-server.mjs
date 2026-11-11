#!/usr/bin/env node
// Safe preview: serves this folder so the page can be looked at on this computer, with the
// real backend out of reach. The "cost-of-war" preview in .claude/launch.json runs this.
//
//   node tools/preview-server.mjs              # http://localhost:4174
//   node tools/preview-server.mjs --port 5000
//
// Why it exists. js/config.js holds the REAL Supabase address and key, and "Submit my
// priorities" also emails Greg through formsubmit.co (js/main.js calls it directly). A plain
// static server (python3 -m http.server, npx serve ...) hands all of that to the browser:
// opening the page asks the real database for its counts, and one Submit saves a real entry
// and sends a real email. This server stops both, in two independent ways:
//  1. js/config.js goes out with SUPABASE_URL, SUPABASE_ANON_KEY, SUBMIT_URL and
//     TURNSTILE_SITE_KEY blank, so js/backend.js stays in its local demo mode (counts live only
//     in this browser). Of the rest, only the two settings known to be safe go out, and only
//     with the right type: SHOW_SEEDED (true or false) and SEED_COUNT (a number). Any other
//     setting is left out, so a backend address stored later under a new name never reaches
//     the page; and any value that still names supabase.co or formsubmit is blanked. If the
//     file cannot be read that way, a config holding only the blanks goes out: never the file
//     itself.
//  2. Every answer carries a Content-Security-Policy: the browser may fetch only from this
//     server, load scripts only from here, cdn.jsdelivr.net and cdnjs.cloudflare.com, and
//     styles and fonts only from here and Google Fonts. So the browser itself refuses to
//     contact *.supabase.co, formsubmit.co and challenges.cloudflare.com, whatever the config.
// The files on disk are never changed. Folders starting with a dot (.git, .claude) are not
// served, and neither is any file whose real place on disk (after following links) is outside
// this folder or inside one of those. Nothing is cached, so a reload always shows the latest edit.
// The test harnesses (tools/story-check.mjs, tools/tool-check.mjs) run their own servers and
// fake the network themselves; this one is only for looking. Needs Node 18 or newer.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portArg = process.argv.indexOf("--port");
const PORT = Number(portArg > 0 ? process.argv[portArg + 1] : process.env.PORT) || 4174;

// The settings that reach the backend. All four go out blank.
const BLANK = { SUPABASE_URL: "", SUPABASE_ANON_KEY: "", SUBMIT_URL: "", TURNSTILE_SITE_KEY: "" };
// The only other settings that go out, each with the one type it may have.
const SAFE = { SHOW_SEEDED: (v) => typeof v === "boolean", SEED_COUNT: (v) => typeof v === "number" && Number.isFinite(v) };
const BACKEND = /supabase\.co|formsubmit/i;
// the folder itself, after links: every file served must really live inside it
const REAL_ROOT = fs.realpathSync(ROOT);

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "connect-src 'self' data: blob: https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "frame-src 'self' blob: data:",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".map": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm",
};

// js/config.js, read the way the page reads it: the two safe settings, and the four backend
// settings blanked. Nothing else from the file goes out.
function safeConfig() {
  const head = "/* Served by tools/preview-server.mjs: the backend settings are blank, so the page runs in local demo mode. */\n";
  const out = {};
  try {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8"), sandbox, { timeout: 1000 });
    const read = sandbox.window.COW_CONFIG;
    const cfg = read && typeof read === "object" ? JSON.parse(JSON.stringify(read)) : {};
    for (const [name, ok] of Object.entries(SAFE)) if (Object.hasOwn(cfg, name) && ok(cfg[name])) out[name] = cfg[name];
  } catch (err) {
    for (const name of Object.keys(out)) delete out[name];
    console.error("js/config.js could not be read (" + err.message + "); serving the blank backend settings only.");
  }
  Object.assign(out, BLANK);
  // belt and braces: nothing that names the backend, whatever the setting is called
  for (const [name, v] of Object.entries(out)) if (BACKEND.test(String(v))) out[name] = "";
  return head + "window.COW_CONFIG = " + JSON.stringify(out, null, 2) + ";\n";
}

// Inside this folder, after following links, and not in a folder whose name starts with a dot.
function inside(file) {
  let real;
  try { real = fs.realpathSync(file); } catch { return false; }
  if (real === REAL_ROOT) return true;
  if (!real.startsWith(REAL_ROOT + path.sep)) return false;
  return !path.relative(REAL_ROOT, real).split(path.sep).some((p) => p.startsWith("."));
}

function isConfig(stat) {
  let cfg;
  try { cfg = fs.statSync(path.join(ROOT, "js/config.js")); } catch { return false; }
  return stat.ino === cfg.ino && stat.dev === cfg.dev;
}

function send(res, status, headers, body, head) {
  res.writeHead(status, { "Content-Security-Policy": CSP, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers });
  res.end(head ? undefined : body);
}

function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { Allow: "GET, HEAD" }, "");
  const head = req.method === "HEAD";
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname); } catch { return send(res, 400, {}, "", head); }
  const parts = urlPath.split("/").filter(Boolean);
  if (parts.some((p) => p.startsWith(".") || p.includes("\0"))) return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head);
  let file = path.join(ROOT, ...parts);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head);
  let stat;
  try { stat = fs.statSync(file); } catch { return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head); }
  if (!inside(file)) return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head); // a link out of the folder
  if (stat.isDirectory()) {
    if (!urlPath.endsWith("/")) return send(res, 301, { Location: new URL(req.url, "http://localhost").pathname + "/" }, "", head);
    file = path.join(file, "index.html");
    try { stat = fs.statSync(file); } catch { return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head); }
    if (!inside(file)) return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head);
  }
  // js/config.js by any spelling (this Mac ignores letter case; // and links lead there too):
  // matched by the file itself, not its name.
  if (isConfig(stat)) return send(res, 200, { "Content-Type": TYPES[".js"] }, safeConfig(), head);
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { "Content-Type": "text/plain" }, "Not found\n", head);
    send(res, 200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": data.length }, data, head);
  });
}

// Only this computer can reach it: both loopback addresses, never the local network.
let listening = 0;
for (const host of ["127.0.0.1", "::1"]) {
  const server = http.createServer(handle);
  server.on("error", (err) => {
    if (host === "::1" && err.code !== "EADDRINUSE") return; // no IPv6 loopback here: 127.0.0.1 is enough
    console.error(`Could not listen on ${host}:${PORT}: ${err.message}`);
    process.exit(1);
  });
  server.listen(PORT, host, () => {
    if (!listening++) {
      console.log(`Safe preview of The Cost of War: http://localhost:${PORT}/`);
      console.log("js/config.js is served with the Supabase address and key blank (local demo mode), and the browser");
      console.log("is told not to contact *.supabase.co, formsubmit.co or challenges.cloudflare.com.");
    }
  });
}
