// Phase 1 audit baselines, measured on the live site with headless Chrome.
//   node storyboard/tools/baseline.mjs [url]
// Writes storyboard/baseline.js (read by the review page) and prints a summary.
// - page and story length in screens at 1440×900 and 375×812
// - pinned scenes (GSAP pin spacers)
// - every figure printed on the page, matched to js/data.js values (the "before" list)
// - largest contentful paint under a fast-4G profile with 4× CPU slowdown (an estimate)
// - transfer size of first-party CSS/JS
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SB = path.resolve(HERE, "..");
const URL_ = process.argv[2] || "https://studioex-creative.github.io/cost-of-war/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const port = 9900 + Math.floor(Math.random() * 90);
const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-base-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", `--user-data-dir=${userDir}`, "about:blank"], { stdio: "ignore" });
const cleanup = () => { try { chrome.kill("SIGKILL"); } catch {} try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {} };
process.on("exit", cleanup);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 150; i++) {
    try { const j = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = j.find((t) => t.type === "page"); if (pg) return pg; } catch {}
    await sleep(100);
  }
  throw new Error("Chrome did not start");
}
const target = await connect();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map(), listeners = new Set();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } else if (m.method) for (const l of listeners) l(m); };
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const waitEvent = (name, ms = 60000) => new Promise((res, rej) => { const t = setTimeout(() => { listeners.delete(l); rej(new Error("timeout " + name)); }, ms); const l = (m) => { if (m.method === name) { clearTimeout(t); listeners.delete(l); res(m.params); } }; listeners.add(l); });
const evalJS = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");

const transfers = [];
listeners.add((m) => { if (m.method === "Network.loadingFinished") transfers.push(m.params); });
const responses = new Map();
listeners.add((m) => { if (m.method === "Network.responseReceived") responses.set(m.params.requestId, m.params.response.url); });

async function open(w, h, mobile, throttle) {
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  if (throttle) {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 60, downloadThroughput: (9000 * 1024) / 8, uploadThroughput: (1500 * 1024) / 8 });
    await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  } else {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await send("Emulation.setCPUThrottlingRate", { rate: 1 });
  }
  await send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__lcp=0;new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__lcp=Math.max(window.__lcp,e.startTime)})}).observe({type:'largest-contentful-paint',buffered:true});" });
  const ev = waitEvent("Page.loadEventFired");
  await send("Page.navigate", { url: URL_ });
  await ev;
  await sleep(throttle ? 6000 : 3500); // let ScrollTrigger build pin spacers
}

const out = { url: URL_, measuredAt: null, desktop: null, phone: null, lcp: null, figures: null, sizes: null };

// Length in screens
const lengthJS = `(function(){
  var H = window.innerHeight, top = function(sel){var el=document.querySelector(sel);return el?el.getBoundingClientRect().top+scrollY:null};
  var pins = Array.prototype.map.call(document.querySelectorAll('.pin-spacer'), function(s){var c=s.firstElementChild;return {id:(c&&(c.id||c.className))||'?', screens:+(s.offsetHeight/H).toFixed(2)}});
  var hero=top('#hero'), hys=top('#haveyoursay');
  return { innerHeight:H, page: +(document.documentElement.scrollHeight/H).toFixed(1), heroToHandover: hero!=null&&hys!=null ? +((hys-hero)/H).toFixed(1) : null, pins: pins };
})()`;
await open(1440, 900, false, false);
out.desktop = await evalJS(lengthJS);
// Figures printed on the page, matched to data.js values
out.figures = await evalJS(`(function(){
  var vals = [];
  function walk(v, path, depth){ if(depth>4||v==null) return; if(typeof v==='number'){vals.push({p:path,v:v});return}
    if(typeof v==='string'){ (v.match(/[0-9][0-9,.]*/g)||[]).forEach(function(n){var x=parseFloat(n.replace(/,/g,'')); if(!isNaN(x)) vals.push({p:path+' (text)',v:x})}); return }
    if(Array.isArray(v)) v.forEach(function(x,i){walk(x,path+'['+i+']',depth+1)}); else if(typeof v==='object') for(var k in v) walk(v[k],path+'.'+k,depth+1) }
  ['DEFENCE','MIL_PER_SECOND','VIOLENCE_PER_SECOND','NUKE_PER_SECOND','DEATHS_PER_YEAR','SECONDS_PER_DEATH','globalContext','spendBreakdown','machineData','topSpenders','destructionData','displacedStats','displacementBreakdown','humanData','issueData','violenceBreakdown','conflictCosts','envFacts','humanImpactExtra','emittersCompare'].forEach(function(n){ try{ walk((0,eval)(n), n, 0) }catch(e){} });
  function match(x, unit){ var cands=[x]; if(unit==='T') cands.push(x*1000); if(unit==='B'||unit==='bn') cands.push(x); if(unit==='trillion') cands.push(x*1000);
    var hits=[]; vals.forEach(function(e){ cands.forEach(function(c){ var tol = Math.abs(c)>=100 ? Math.abs(c)*0.006 : 0.051; if(Math.abs(e.v-c)<=tol && hits.indexOf(e.p)<0) hits.push(e.p) }) }); return hits.slice(0,4) }
  var seen = {}, rows = [];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var skip = /^(SCRIPT|STYLE|NOSCRIPT)$/;
  while (walker.nextNode()) {
    var n = walker.currentNode, el = n.parentElement; if(!el||skip.test(el.tagName)) continue;
    var t = n.textContent.replace(/\\s+/g,' '); var re = /(\\$?[0-9][0-9,]*\\.?[0-9]*)\\s*(T|B|M|%|trillion|billion|million|bn)?/g, m;
    while ((m = re.exec(t))) {
      var raw = m[0].trim(); var x = parseFloat(m[1].replace(/[$,]/g,'')); if (isNaN(x)) continue;
      var sec = el.closest('section,[id]'); var where = sec ? (sec.id||sec.className.split(' ')[0]) : '?';
      var key = raw+'|'+where; if (seen[key]) continue; seen[key]=1;
      rows.push({ shown: raw, where: where, context: t.slice(Math.max(0,m.index-40), m.index+raw.length+30).trim(), dataJs: match(x, m[2]) });
    }
  }
  return rows;
})()`);
// Phone
await open(375, 812, true, false);
out.phone = await evalJS(lengthJS);
// LCP under fast 4G + 4× CPU
transfers.length = 0; responses.clear();
await open(1440, 900, false, true);
out.lcp = { desktopFast4G_ms: Math.round(await evalJS("window.__lcp")) };
out.sizes = transfers.map((t) => ({ url: responses.get(t.requestId) || "", kb: Math.round(t.encodedDataLength / 102.4) / 10 })).filter((r) => /\.(js|css)(\?|$)/.test(r.url)).sort((a, b) => b.kb - a.kb);
out.measuredAt = new Date().toISOString();
fs.writeFileSync(path.join(SB, "baseline.js"), "/* generated by tools/baseline.mjs */\nwindow.SB_BASELINE = " + JSON.stringify(out) + ";\n");
const unmatched = out.figures.filter((f) => !f.dataJs.length);
console.log(JSON.stringify({ desktop: out.desktop, phone: out.phone, lcp: out.lcp, figures: out.figures.length, unmatched: unmatched.length, sizes: out.sizes.slice(0, 12) }, null, 1));
cleanup();
process.exit(0);
