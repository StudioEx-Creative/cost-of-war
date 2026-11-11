#!/usr/bin/env node
// Tool check: the test harness for the tools half of the page (phase 4 spec, "Tests").
//
// It serves the repo on a local port, drives headless Chrome over the DevTools protocol
// and plays a long list of reader choices through the tools. What the tools print, what
// they would send and what they store is compared with a recording of the old page.
//
//   node tools/tool-check.mjs                      # compare with the recording, every view
//   node tools/tool-check.mjs --record             # make the recording (old page only)
//   node tools/tool-check.mjs --views desktop      # only this view (desktop, phone, short)
//   node tools/tool-check.mjs --scenarios tax,causes-3   # only scenarios whose name holds one of these
//   node tools/tool-check.mjs --only golden        # only these checks (see "The checks" below)
//   node tools/tool-check.mjs --quick              # only the core scenarios, in every view
//   node tools/tool-check.mjs --out tools/out/x    # where results go (default tools/out/tool)
//   node tools/tool-check.mjs --url index.html     # page to test, relative to the repo root
//   node tools/tool-check.mjs --fixtures <dir>     # where the recording lives (default tools/fixtures)
//
// The checks (spec, "Tests"), in the order they run:
//   golden    item 1: the tools print, send and store exactly what the old page did (SHOW_SEEDED on)
//   seeded    SHOW_SEEDED off: nothing invented shows
//   noreload  a resize across 560 px never reloads a reader below the story or with work in the tools
//   keyboard  item 2: every tool by keyboard alone, skip link to footer, every focus stop visible and
//             no ring under a bar that stays on screen; also once at 320 × 180 (a laptop at 400% zoom),
//             once with reduced motion and once in still mode (?static=1)
//   pointer   item 2: every tool by mouse (desktop) or finger (phones), nothing covered, taps ≥ 44 px
//             (keyboard runs SHOW_SEEDED off in every view and on on desktop; pointer the reverse;
//             pointer also once with reduced motion and once in still mode)
//   scroll    item 2: the tools read the same at any scroll position
//   overlays  item 2: card and share panel keep and return focus; Escape; the download
//   consent   item 3: letter null when unticked, nothing stored, no email without its box, same words
//   globe     item 2: real globe.gl (WebGL) and the still fallback, SHOW_SEEDED off and on; one
//             drawing loop (about 60 frames a second) while the 3D globe turns on screen
//   archive   item 2: real three.js (WebGL) and the no-3D fallback; keyboard path; preview; own sheet
//   together  the 3D globe and the 3D room on one page, both orders, real libraries, no console error
//   no3d      a browser with 3D switched off (nothing 3D downloaded) and an empty three.js: Tab onto the
//             room lands on its message, ring whole, then on to the letters; both libraries stalled:
//             the no-3D layouts after 15 s, and a late arrival changes nothing
//   page      item 4: deep links (and a reload after one: never pulled back to the link's target),
//             no sideways scroll (9 widths), brand, taps, every old link, no new
//             figure, a phone turned on its side, the caret's line on screen after a turn, every line
//             of the letter's contact link a 44 px tap
//   code      item 4: no Anton, plain Archivo, amber, cyan, purple or off-brand colour code in shipped
//             files (js/data.js is read only: its old chart colours are listed as present, not used)
//   answers   item 4: which of the old page's links do not answer (asked once each from Node;
//             reported, never failed)
//   console   no console errors in the whole run;   network   every request was a stub
//
// Each check runs in a fresh browser (each journey too). On a machine short of memory a browser
// can stall for minutes; a check (or a recorded scenario) cut off by such a stall is run once more
// and says so in its notes. TC_TRACE=1 prints every call into the page and, if the page has not
// answered in 30 s, where its script was.
//
// Views: desktop 1440 × 900, phone 375 × 812, short 390 × 664. Every scenario runs on
// desktop; the ones marked core also run on the two phone views. The answer must be the same
// everywhere, so there is one recording.
//
// SAFETY. js/config.js holds the REAL Supabase address, and submitting also emails Greg
// through formsubmit.co. So no request leaves this machine:
//  1. Every request goes through DevTools Fetch interception, set up before the page loads.
//     Only this harness's own local server is let through. Everything else gets a stub.
//  2. Chrome also runs with every host name except 127.0.0.1 mapped to "not found", so
//     anything that slipped past step 1 could not go anywhere.
//  3. A second listener (Network domain) writes down every request the page tries. The
//     "network" check fails if one of them was not stubbed, or came from a real address.
// Test emails use @example.test. Test letters hold only the generated text or the word TEST.
//
// What is faked, and how:
//  - *.supabase.co, formsubmit.co, challenges.cloudflare.com: stubs that record the body.
//  - supabase-js is not loaded from its CDN. A stand-in of a few lines (SUPABASE_STANDIN)
//    sends the same two kinds of request: rpc and insert. Without it the test would depend
//    on an unpinned "@2" CDN file. js/backend.js itself runs unchanged.
//  - gsap, globe.gl, three.js and fonts: empty files. The page falls back without them. The 3D and
//    turning checks get the real libraries (fetched once by Node, see REAL_LIBS); a scenario can hold
//    one back for a while (delay), as a stalled line would.
//  - html2canvas: a stand-in that records what it was asked to draw.
//  - js/config.js is served with SHOW_SEEDED: true added. The file on disk is not touched.
//  - window.alert, window.open, clipboard and download clicks are recorded, not performed.
//
// Elements are found ONLY by these ids. The foundation step must keep every one:
//   tracker       tiRem tiAlloc tiCount tiBar
//   redistribute  redistribute haveyoursay ix0 … ix13 redistPrompt prioPanel prioList sumBig sumStmt toCountryBtn
//                 (ixN = the element whose click chooses cause N)
//   gate          journeyGate (class "locked" while no cause is chosen)
//   country       countrySection countrySelect countryData countryNextBtn taxSlider taxIncomeVal taxResult
//   letter        letterSection letterNote letterName letterTitle letterOutput letterContactNote
//   coalition     coalitionSection coalitionNum coalitionBarFill coalitionTopIssues coalitionEmail coalitionAge
//                 coalitionConsent letterConsent coalitionThanks globalPrio
//   card          scOverlay (class "open" while showing) shareCard
//   share         shareOv (class "open" while showing) emailIn sThanks
// Buttons that have no id are reached through the main.js function they call. The new page
// must keep these names: resetAll moveRank openShare closeShare submitEmail doShare copyLetter
// emailLetter tweetLetter sendToRepresentative generateShareCard submitCoalition downloadCard
// shareCardTo globeData. Also read: window.__cowLive and window.__cowConfigured (js/backend.js).
//
// What was made steady, so that two runs give the same answer (nothing else needed it):
//  - ts in the stored submission (a clock reading) is written as "{TS}".
//  - the local server's port is written as "{ORIGIN}".
//  - Chrome is told the language (en-US) and the time zone (UTC, unless a scenario sets one),
//    because the page reads both.
//  - requests are sorted, because their order on the wire is not part of the behaviour.
//  - the running counters are not recorded; #coalitionNum is read after it stops moving.
// Random numbers in the page only touch canvas drawing, which is not recorded.
//
// Adding a check: write async function checkX(ctx) and add it to CHECKS below. ctx gives the
// browser, the views and record(). Open the page with openScenario() so the network stays faked.
//
// Output: <out>/report.json, <out>/actual.json (what this run saw), <out>/network.json
// (every request attempted). Exit code 1 if any check fails.
// Needs Node 20 or newer (global fetch and WebSocket) and Google Chrome. No npm packages.

import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OLD_COMMIT = "e17c27c"; // the commit whose index.html is the old live page

const VIEWS = {
  desktop: { w: 1440, h: 900, dpr: 1, mobile: false },
  phone: { w: 375, h: 812, dpr: 2, mobile: true },
  short: { w: 390, h: 664, dpr: 2, mobile: true },
};

// Differences the spec approves, each with its reason. One is forgiven only when applying
// from → to on the recorded text gives exactly what the page shows; it is then listed.
const APPROVED = [
  { path: /^wording\.sections\.coalitionSection$/, from: "Drag to spin · scroll to zoom.", to: "Drag to spin.", why: "spec H4: wheel zoom is off because it traps page scroll (audit GLB-1)" },
  { path: /^wording\.sections\.redistribute$/, from: "↺ Reset ↗ Share this Continue → Your country ▾", to: "Continue → Your country ▾ ↺ Reset ↗ Share this", why: "fixer round 1 (accessibility): Continue now comes before Reset and Share in the page code, as it always did on screen, so Tab meets it where the eye does. Same words, same look" },
  // An "added" entry forgives only a setting the old page did not have at all (recorded as nothing).
  { path: /^final\.effects\.canvas\.\d+\.options\.ignoreElements$/, added: true, why: "lead, phase 4: Download PNG now tells html2canvas to skip every canvas outside the card. Copying the page used to claim the Archive's unused canvas for 2D, so the 3D room could never start after a download. The card and its picture are unchanged" },
];

/* ══ Command line ═══════════════════════════════════════════════════ */

function parseArgs(argv) {
  const o = { record: false, views: Object.keys(VIEWS), only: null, scenarios: null, quick: false, url: "index.html", out: path.join(ROOT, "tools", "out", "tool"), fixtures: path.join(ROOT, "tools", "fixtures") };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i], v = null;
    if (a.includes("=")) [a, v] = [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)];
    const val = () => (v !== null ? v : argv[++i]);
    const list = () => val().split(",").map((s) => s.trim()).filter(Boolean);
    if (a === "--record") o.record = true;
    else if (a === "--views") o.views = list();
    else if (a === "--only") o.only = new Set(list());
    else if (a === "--scenarios") o.scenarios = list();
    else if (a === "--quick") o.quick = true;
    else if (a === "--url") o.url = val().replace(/^\/+/, "");
    else if (a === "--out") o.out = path.resolve(ROOT, val());
    else if (a === "--fixtures") o.fixtures = path.resolve(ROOT, val());
    else if (a === "--help" || a === "-h") {
      const lines = fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1);
      console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith("//"))).map((l) => l.slice(3)).join("\n"));
      process.exit(0);
    }
    else { console.error("Unknown option: " + a + " (try --help)"); process.exit(2); }
  }
  for (const v of o.views) if (!VIEWS[v]) { console.error("Unknown view: " + v + " (desktop, phone or short)"); process.exit(2); }
  return o;
}
const opts = parseArgs(process.argv.slice(2));
const OUT = opts.out;
fs.mkdirSync(OUT, { recursive: true });
const GOLDEN = path.join(opts.fixtures, "tool-golden.json");
const OLD_LINKS = path.join(opts.fixtures, "old-links.json");
const rel = (p) => path.relative(ROOT, p) || ".";

/* ══ Results ════════════════════════════════════════════════════════ */

// Every check ends in one record: pass, fail or skip, a one-line summary and note lines.
const results = [];
function record(check, view, status, summary, notes = [], details = null) {
  results.push({ check, view, status, summary, notes, details });
  const mark = status === "pass" ? "✓" : status === "fail" ? "✗" : "-";
  console.log(`  ${mark} ${check.padEnd(9)} ${summary}`);
  for (const n of notes.slice(0, 12)) console.log(`              ${n}`);
  if (notes.length > 12) console.log(`              … ${notes.length - 12} more in report.json`);
}

/* ══ The reader's choices ═══════════════════════════════════════════ */

// One scenario = one fresh page and a list of steps. Options:
//   core: also run on the phone views · tz: time zone · config: added to js/config.js
//   backend: what the fake Supabase answers (see BACKENDS)
const UK = "United Kingdom", US = "United States";
const A3 = [0, 4, 1]; // the storyboard's example reader
const sc = (name, o, steps) => ({ name, core: false, tz: "UTC", config: {}, backend: "empty", ...o, steps });
const coalition = (o) => [["email", o.email || ""], ["age", o.age || ""], ["consentEmail", !!o.ce], ["consentLetter", !!o.cl], ["submit"]];
const TAX_POSITIONS = [0, 30, 52, 100, 175, 300, 430, 525, 699, 700, 701, 720, 800, 900, 1000];

const SCENARIOS = [
  // ── Causes: how many, and in what order ──
  sc("causes-0", { core: true }, [["wording"], ["globe"], ["snap", "empty"], ["call", "generateShareCard"], ["call", "tweetLetter"], ["submit"], ["call", "doShare", "twitter"], ["call", "doShare", "linkedin"]]),
  sc("causes-1-small", { core: true }, [["causes", [0]]]),
  sc("causes-1-largest", {}, [["causes", [10]]]),
  sc("causes-3-storyboard", { core: true }, [["causes", A3], ["country", UK], ["cards"]]),
  sc("causes-3-reversed", {}, [["causes", [1, 4, 0]], ["country", UK]]),
  sc("causes-5", { core: true }, [["causes", [10, 1, 3, 9, 12]], ["country", "France"]]),
  sc("causes-5-other-order", {}, [["causes", [12, 9, 3, 1, 10]], ["country", "France"]]),
  sc("causes-6", { core: true }, [["causes", [0, 1, 2, 3, 4, 5]], ["country", UK], ["call", "tweetLetter"], ["call", "generateShareCard"], ["call", "shareCardTo", "twitter"]]),
  sc("causes-13", {}, [["causes", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], ["country", US], ["call", "generateShareCard"], ["cards"]]),
  sc("causes-all-in-order", { core: true }, [["causes", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], ["country", US]]),
  sc("causes-all-reversed", {}, [["causes", [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], ["country", US]]),
  sc("causes-untick", {}, [["causes", A3], ["causes", [4]], ["snap", "without-clean-water"], ["causes", [4]]]),
  sc("causes-untick-all", {}, [["causes", [2]], ["snap", "one"], ["causes", [2]]]),
  sc("causes-blocked-then-released", {}, [["causes", [10, 1, 3, 9, 12, 7, 8, 13, 2, 4, 0, 6, 11]], ["snap", "full"], ["causes", [5]], ["causes", [10]], ["causes", [5]]]),
  sc("reorder", { core: true }, [["causes", A3], ["call", "moveRank", 1, -1], ["snap", "health-up"], ["call", "moveRank", 0, 1], ["snap", "hunger-down"], ["call", "moveRank", 1, -1], ["call", "moveRank", 4, 1], ["call", "moveRank", 5, 1]]),
  sc("reset", {}, [["causes", A3], ["country", UK], ["call", "resetAll"], ["snap", "after-reset"], ["causes", [2]]]),

  // ── Your country ──
  sc("country-before-causes", {}, [["country", US], ["snap", "chosen"]]),
  sc("country-uk", { core: true }, [["causes", A3], ["country", UK]]),
  sc("country-us", {}, [["causes", A3], ["country", US]]),
  sc("country-japan-yen", {}, [["causes", A3], ["country", "Japan"]]),
  sc("country-india-rupee", {}, [["causes", A3], ["country", "India"]]),
  sc("country-switzerland-chf", {}, [["causes", A3], ["country", "Switzerland"]]),
  sc("country-brazil-real", {}, [["causes", A3], ["country", "Brazil"]]),
  sc("country-no-contact-no-trend", {}, [["causes", A3], ["country", "North Korea"]]),
  sc("country-smallest", {}, [["causes", A3], ["country", "Samoa"]]),
  sc("country-ukraine", {}, [["causes", A3], ["country", "Ukraine"]]),
  sc("country-change", {}, [["causes", A3], ["country", UK], ["country", "Germany"]]),
  sc("country-blank-again", {}, [["causes", A3], ["country", UK], ["country", ""]]),
  sc("country-every-one", {}, [["countrySweep"]]),

  // ── The tax slider ──
  sc("tax-uk", { core: true }, [["causes", A3], ["country", UK], ["taxSweep", TAX_POSITIONS]]),
  sc("tax-us", {}, [["causes", A3], ["country", US], ["taxSweep", TAX_POSITIONS]]),
  sc("tax-japan", {}, [["causes", A3], ["country", "Japan"], ["taxSweep", TAX_POSITIONS]]),
  sc("tax-smallest-country", {}, [["causes", A3], ["country", "Samoa"], ["taxSweep", TAX_POSITIONS]]),
  sc("tax-then-change-country", {}, [["causes", A3], ["country", UK], ["tax", 700], ["country", "Germany"]]),
  sc("tax-then-submit", { core: true }, [["causes", A3], ["country", UK], ["tax", 700], ...coalition({ cl: true })]),

  // ── Names and titles ──
  sc("name-only", {}, [["causes", A3], ["country", UK], ["name", "TEST"]]),
  sc("title-only", {}, [["causes", A3], ["country", UK], ["title", "TEST"]]),
  sc("name-and-title", { core: true }, [["causes", A3], ["country", UK], ["name", "TEST"], ["title", "TEST TEST"]]),
  sc("name-spaces-only", {}, [["causes", A3], ["country", UK], ["name", "   "], ["title", "   "]]),
  sc("name-with-markup", {}, [["causes", A3], ["country", UK], ["name", "TEST & TEST <TEST>"], ["title", "TEST's \"TEST\""]]),
  sc("name-no-country", {}, [["causes", A3], ["name", "TEST"]]),
  sc("name-no-causes", {}, [["country", UK], ["name", "TEST"]]),

  // ── Letter text ──
  sc("letter-edited", { core: true }, [["causes", A3], ["country", UK], ["editLetter", "TEST"], ...coalition({ cl: true })]),
  sc("letter-too-long", {}, [["causes", A3], ["country", UK], ["editLetter", "TEST ".repeat(1000)], ...coalition({ cl: true })]),
  sc("letter-emptied", {}, [["causes", A3], ["country", UK], ["editLetter", ""], ...coalition({ cl: true })]),
  sc("letter-edited-then-cause", {}, [["causes", A3], ["country", UK], ["editLetter", "TEST"], ["causes", [2]]]),
  sc("letter-edited-then-name", {}, [["causes", A3], ["country", UK], ["editLetter", "TEST"], ["name", "TEST"]]),
  sc("letter-edited-not-consented", { core: true }, [["causes", A3], ["country", UK], ["editLetter", "TEST"], ...coalition({})]),

  // ── Coalition: email on/off × email consent on/off × letter consent on/off, with age bands ──
  sc("submit-noemail-noconsent-noletter", { core: true }, [["causes", A3], ["country", UK], ["globe"], ...coalition({}), ["globe"]]),
  sc("submit-noemail-noconsent-letter", { core: true }, [["causes", A3], ["country", UK], ...coalition({ age: "18-24", cl: true })]),
  sc("submit-noemail-consent-noletter", {}, [["causes", A3], ["country", UK], ...coalition({ age: "25-34", ce: true })]),
  sc("submit-noemail-consent-letter", {}, [["causes", A3], ["country", UK], ...coalition({ age: "35-49", ce: true, cl: true })]),
  sc("submit-email-noconsent-noletter", { core: true }, [["causes", A3], ["country", UK], ...coalition({ email: "tool-check@example.test", age: "50-64" })]),
  sc("submit-email-noconsent-letter", {}, [["causes", A3], ["country", UK], ...coalition({ email: "tool-check@example.test", cl: true })]),
  sc("submit-email-consent-noletter", { core: true }, [["causes", A3], ["country", UK], ...coalition({ email: "tool-check@example.test", age: "65-plus", ce: true })]),
  sc("submit-email-consent-letter", { core: true }, [["causes", A3], ["country", UK], ...coalition({ email: "tool-check@example.test", age: "under-18", ce: true, cl: true })]),
  sc("submit-email-spaces-trimmed", {}, [["causes", A3], ["country", UK], ...coalition({ email: "  tool-check@example.test  ", ce: true })]),
  sc("submit-no-country", {}, [["causes", A3], ...coalition({ cl: true })]),
  sc("submit-six-causes", {}, [["causes", [0, 1, 2, 3, 4, 5]], ["country", UK], ...coalition({ cl: true })]),
  sc("submit-no-causes", {}, [["country", UK], ...coalition({ email: "tool-check@example.test", ce: true, cl: true })]),

  // ── Share panel and letter send options ──
  sc("share-panel", { core: true }, [["causes", A3], ["country", UK], ["call", "openShare"], ["snap", "open"], ["call", "doShare", "twitter"], ["call", "doShare", "linkedin"], ["call", "doShare", "copy"], ["call", "closeShare"]]),
  sc("share-email-blank", {}, [["shareEmail", ""]]),
  sc("share-email-invalid", {}, [["shareEmail", "TEST"]]),
  sc("share-email-valid", { core: true }, [["shareEmail", "tool-check@example.test"]]),
  sc("letter-send-options", { core: true }, [["causes", A3], ["country", UK], ["call", "copyLetter"], ["call", "emailLetter"], ["call", "tweetLetter"], ["call", "sendToRepresentative"]]),
  sc("letter-send-no-contact", {}, [["causes", A3], ["country", "North Korea"], ["call", "sendToRepresentative"]]),
  sc("letter-send-no-country", {}, [["causes", A3], ["call", "sendToRepresentative"]]),

  // ── Shareable card ──
  sc("card-no-country", {}, [["causes", A3], ["call", "generateShareCard"]]),
  sc("card-full", { core: true }, [["causes", [10, 1, 3, 9, 12]], ["country", "Japan"], ["call", "generateShareCard"], ["call", "shareCardTo", "twitter"], ["call", "shareCardTo", "linkedin"], ["call", "shareCardTo", "instagram"], ["download"]]),

  // ── What the backend answers ──
  sc("backend-just-below-reveal", { backend: "below" }, [["causes", A3], ["country", UK], ["call", "generateShareCard"]]),
  sc("backend-at-reveal", { backend: "at" }, [["causes", A3], ["country", UK], ["call", "generateShareCard"]]),
  sc("backend-large", { backend: "large", core: true }, [["globe"], ["causes", A3], ["country", UK], ["call", "generateShareCard"]]),
  sc("backend-large-submit", { backend: "large" }, [["causes", A3], ["country", UK], ["globe"], ...coalition({ cl: true }), ["globe"]]),
  sc("backend-error", { backend: "error" }, [["causes", A3], ["country", UK], ...coalition({})]),
  sc("backend-unavailable", { backend: "none", core: true }, [["globe"], ["causes", A3], ["country", UK], ...coalition({ email: "tool-check@example.test", age: "18-24", ce: true, cl: true }), ["globe"]]),
  sc("backend-unavailable-return-visit", { backend: "none" }, [["causes", A3], ["country", UK], ...coalition({ cl: true }), ["reload"], ["globe"], ["country", UK], ["causes", [2]]]),

  // ── The optional validated route, with Turnstile ──
  sc("edge-route-with-token", { config: { SUBMIT_URL: "https://stub.supabase.co/functions/v1/submit", TURNSTILE_SITE_KEY: "TESTKEY" } }, [["causes", A3], ["country", UK], ["turnstileToken", "TESTTOKEN"], ...coalition({ email: "tool-check@example.test", age: "25-34", ce: true, cl: true })]),
  sc("edge-route-no-token", { config: { SUBMIT_URL: "https://stub.supabase.co/functions/v1/submit", TURNSTILE_SITE_KEY: "TESTKEY" } }, [["causes", A3], ["country", UK], ...coalition({ cl: true })]),
  sc("edge-route-rejected", { backend: "reject", config: { SUBMIT_URL: "https://stub.supabase.co/functions/v1/submit", TURNSTILE_SITE_KEY: "TESTKEY" } }, [["causes", A3], ["country", UK], ["turnstileToken", "TESTTOKEN"], ...coalition({ cl: true })]),

  // ── The country guessed from the reader's time zone ──
  sc("timezone-london", { tz: "Europe/London", core: true }, [["snap", "opened"], ["causes", A3]]),
  sc("timezone-new-york", { tz: "America/New_York" }, [["snap", "opened"]]),
  sc("timezone-tokyo", { tz: "Asia/Tokyo" }, [["snap", "opened"]]),
  sc("timezone-melbourne", { tz: "Australia/Melbourne" }, [["snap", "opened"]]),
  sc("timezone-not-listed", { tz: "Africa/Nairobi" }, [["snap", "opened"]]),
];

// What the fake Supabase answers to the three read-only calls made when the page opens.
const TALLY = [{ issue: 5, votes: 999 }, { issue: 2, votes: 1 }];
const SIGNUPS = [{ country: UK, signups: 5000 }, { country: "Iceland", signups: 3 }];
const BACKENDS = {
  empty: { count: 0, tally: [], byCountry: [] },
  below: { count: 7152, tally: [], byCountry: [] }, // 7152 + the 2847 seed = 9999: one under the reveal
  at: { count: 7153, tally: [], byCountry: [] }, // 7153 + the 2847 seed = 10000: exactly the reveal
  large: { count: 9000, tally: TALLY, byCountry: SIGNUPS },
  error: { fail: true },
  none: { noLibrary: true },
  reject: { count: 0, tally: [], byCountry: [], rejectSubmit: true },
  // the Archive past its preview: 420 people, 23 approved letters (TEST words only)
  room: { count: 0, tally: [], byCountry: [], room: { stats: { people: 420, countries: 23, first_at: "2026-01-02T00:00:00Z" }, letters: testLetters(23), ages: [{ band: "18-24", people: 40 }, { band: "25-34", people: 25 }] } },
};
function testLetters(n) {
  return Array.from({ length: n }, (_, i) => ({ letter: "TEST letter number " + (i + 1) + ".\n\n" + "TEST ".repeat(i === 0 ? 300 : 3), country: i % 2 ? "France" : UK, age_band: ["18-24", "25-34", "35-49"][i % 3], created_at: "2026-0" + ((i % 8) + 1) + "-14T10:00:00Z" }));
}

/* ══ The fake network ═══════════════════════════════════════════════ */

// The 3D checks need the real three.js and globe.gl. This script (Node, not the page) fetches the
// exact addresses the page asks for, once, into a cache folder, and the fake network hands them
// over. The page itself still reaches nothing. If they cannot be fetched, those checks are skipped.
const REAL_LIBS = [
  { name: "three", url: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js", match: /^https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/build\/three\.min\.js$/ },
  { name: "globe", url: "https://cdn.jsdelivr.net/npm/globe.gl", match: /^https:\/\/cdn\.jsdelivr\.net\/npm\/globe\.gl$/ },
  { name: "gsap", url: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js", match: /^https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.12\.5\/dist\/gsap\.min\.js$/ },
  { name: "gsap", url: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js", match: /^https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.12\.5\/dist\/ScrollTrigger\.min\.js$/ },
];
async function loadRealLibs() {
  const dir = path.join(os.tmpdir(), "tool-check-libs");
  fs.mkdirSync(dir, { recursive: true });
  for (const l of REAL_LIBS) {
    const file = path.join(dir, crypto.createHash("sha256").update(l.url).digest("hex").slice(0, 16) + ".js");
    try {
      if (!fs.existsSync(file) || Date.now() - fs.statSync(file).mtimeMs > 7 * 864e5) {
        const r = await fetch(l.url, { signal: AbortSignal.timeout(30000) });
        if (!r.ok) throw new Error("HTTP " + r.status);
        fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      }
      l.body = fs.readFileSync(file, "utf8");
    } catch (e) { l.error = e.message; }
  }
}

const net = { attempted: [], stubbed: [], local: 0, real: [] };
let scene = null; // the scenario now running: { name, backend, requests[] }
let baseURL = "";

// Stands in for supabase-js: the same two calls js/backend.js uses, sent as the same requests.
const SUPABASE_STANDIN = `window.supabase={createClient:function(url,key){
  function call(p,b){return fetch(url+p,{method:"POST",headers:{"content-type":"application/json",apikey:key,Authorization:"Bearer "+key},body:JSON.stringify(b)}).then(function(r){return r.text().then(function(t){var d=null;try{d=JSON.parse(t)}catch(e){}return r.ok?{data:d,error:null}:{data:null,error:{message:String(r.status)}}})})}
  return{rpc:function(n,a){return call("/rest/v1/rpc/"+n,a||{})},from:function(t){return{insert:function(o){return call("/rest/v1/"+t,o)}}}}}};`;
const TURNSTILE_STANDIN = `window.turnstile={render:function(box,o){window.__tc.turnstile.push({box:box.id,sitekey:o.sitekey,theme:o.theme});return "widget"},getResponse:function(id){window.__tc.turnstile.push({getResponse:id});return window.__tc.token}};`;
const HTML2CANVAS_STANDIN = `window.html2canvas=function(el,o){window.__tc.canvas.push({id:el.id,options:o});return Promise.resolve({toDataURL:function(t){return "data:"+t+";base64,AAAA"}})};`;

const CORS = [["access-control-allow-origin", "*"], ["access-control-allow-methods", "GET,POST,OPTIONS"], ["access-control-allow-headers", "authorization,apikey,content-type,accept,x-client-info,prefer"]];
function stub(kind, status, type, body) { return { kind, status, headers: [...CORS, ["content-type", type]], body }; }
const js = (kind, body = "") => stub(kind, 200, "text/javascript", body);
const json = (kind, v, status = 200) => stub(kind, status, "application/json", JSON.stringify(v));

// Decide the answer to anything that is not our own server. Anything unknown gets a 404:
// this list can only ever fail closed.
function fakeFor(u, method) {
  const host = u.hostname, b = BACKENDS[scene ? scene.backend : "empty"];
  if (method === "OPTIONS") return { kind: "preflight", status: 204, headers: CORS, body: "" };
  if (host.endsWith(".supabase.co")) return fakeSupabase(u, b);
  if (host === "formsubmit.co" || host.endsWith(".formsubmit.co")) return json("formsubmit", { success: "true" });
  if (host === "challenges.cloudflare.com") return js("turnstile", TURNSTILE_STANDIN);
  if (u.pathname.includes("@supabase/supabase-js")) return js("library", b.noLibrary ? "" : SUPABASE_STANDIN);
  if (u.pathname.includes("html2canvas")) return js("library", HTML2CANVAS_STANDIN);
  const real = scene && scene.libs && REAL_LIBS.find((l) => scene.libs.includes(l.name) && l.match.test(u.href));
  if (real && real.body) return { ...js("real-library", real.body), lib: real.name };
  if (host === "fonts.googleapis.com") return stub("font", 200, "text/css", "");
  if (host === "fonts.gstatic.com") return stub("font", 404, "text/plain", "");
  if (/\.js$|\/globe\.gl$/.test(u.pathname)) return js("library");
  return stub("blocked", 404, "text/plain", "blocked by tool-check");
}
function fakeSupabase(u, b) {
  const rpc = u.pathname.startsWith("/rest/v1/rpc/") ? u.pathname.slice(13) : null;
  if (rpc) {
    if (b.fail) return json("supabase", { message: "stub error" }, 500);
    if (rpc === "coalition_count") return json("supabase", b.count || 0);
    if (rpc === "priority_tally") return json("supabase", b.tally || []);
    if (rpc === "signups_by_country") return json("supabase", b.byCountry || []);
    if (rpc === "room_stats") return json("supabase", b.room ? b.room.stats : null);
    if (rpc === "approved_letters") return json("supabase", b.room ? b.room.letters : []);
    if (rpc === "age_tally") return json("supabase", b.room ? b.room.ages : []);
    return json("supabase", []);
  }
  if (u.pathname === "/functions/v1/submit") return b.rejectSubmit ? json("supabase", { error: "stub rejected" }, 400) : json("supabase", { ok: true });
  return b.fail ? json("supabase", { message: "stub error" }, 500) : stub("supabase", 201, "application/json", "");
}

// A multipart form body, as a plain list of [name, value] pairs (the boundary is random).
function parseForm(body) {
  return [...body.matchAll(/name="([^"]*)"\r\n\r\n([\s\S]*?)\r\n--/g)].map((m) => [m[1], m[2]]);
}
async function bodyOf(browser, requestId, request) {
  if (request.postData) return request.postData;
  if (request.postDataEntries) return request.postDataEntries.map((e) => Buffer.from(e.bytes || "", "base64").toString("utf8")).join("");
  if (!request.hasPostData) return null;
  try { return (await browser.send("Fetch.getRequestPostData", { requestId })).postData; } catch { return null; }
}
async function onPaused(browser, p) {
  const { requestId, request } = p;
  try {
    if (request.url.startsWith(baseURL)) { net.local++; await browser.send("Fetch.continueRequest", { requestId }); return; }
    const u = new URL(request.url);
    const fake = fakeFor(u, request.method);
    // a scenario can hold a real library back (scene.delay: { three: ms }), as a slow or stalled line would
    const hold = fake.lib && scene && scene.delay && scene.delay[fake.lib];
    if (hold) { const s = scene; await sleep(hold); if (s.delivered) s.delivered.push(fake.lib); }
    const body = await bodyOf(browser, requestId, request);
    net.stubbed.push({ scenario: scene && scene.name, method: request.method, url: request.url, kind: fake.kind, body });
    if (scene && ["supabase", "formsubmit", "turnstile"].includes(fake.kind) && request.method !== "OPTIONS") scene.requests.push({ fake, u, method: request.method, body });
    await browser.send("Fetch.fulfillRequest", { requestId, responseCode: fake.status, responseHeaders: fake.headers.map(([name, value]) => ({ name, value })), body: Buffer.from(fake.body).toString("base64") });
  } catch (e) {
    // Never let a request through because the stub failed.
    try { await browser.send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }); } catch {}
  }
}
async function watchNetwork(browser) {
  browser.listeners.add((m) => {
    if (m.method === "Fetch.requestPaused") onPaused(browser, m.params);
    else if (m.method === "Network.requestWillBeSent") {
      const url = m.params.request.url;
      if (/^https?:|^wss?:/.test(url) && !url.startsWith(baseURL)) net.attempted.push({ scenario: scene && scene.name, method: m.params.request.method, url, type: m.params.type });
    }
    else if (m.method === "Network.webSocketCreated") net.attempted.push({ scenario: scene && scene.name, method: "WEBSOCKET", url: m.params.url, type: "WebSocket" });
    else if (m.method === "Network.responseReceived") {
      const r = m.params.response;
      if (r.remoteIPAddress && !r.url.startsWith(baseURL) && /^https?:/.test(r.url)) net.real.push({ url: r.url, ip: r.remoteIPAddress });
    }
  });
  await browser.send("Network.enable");
  await browser.send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
}
// The golden record of what the page asked the backend to do. Room reads are left out:
// they happen when the Archive comes near the screen, and the Archive moves.
function requestsFor(s) {
  const out = s.requests
    .filter((r) => !/\/rpc\/(approved_letters|room_stats|age_tally)$/.test(r.u.pathname))
    .map((r) => {
      const e = { to: r.fake.kind, method: r.method, path: r.u.pathname };
      if (r.fake.kind === "formsubmit") e.form = parseForm(r.body || "");
      else if (r.body) { try { e.json = JSON.parse(r.body); } catch { e.raw = r.body; } }
      return e;
    });
  return out.sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));
}

/* ══ Static file server (serves the repo root) ══════════════════════ */

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp" };
function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/favicon.ico") { res.writeHead(204); return res.end(); }
    const file = path.join(ROOT, urlPath);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); } // never serve outside the repo
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("not found"); }
      // js/config.js gets SHOW_SEEDED: true (and any scenario settings) added on the way out.
      if (urlPath === "/js/config.js") data = Buffer.concat([data, Buffer.from(`\nObject.assign(window.COW_CONFIG, ${JSON.stringify({ SHOW_SEEDED: true, ...(scene ? scene.config : {}) })});\n`)]);
      res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

/* ══ Chrome over the DevTools protocol (the same plumbing as story-check) ══ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// STORY_CHECK_PATIENCE=2 waits twice as long before calling a step stuck. No check gets easier.
const PATIENCE = Number(process.env.STORY_CHECK_PATIENCE) || 1;

// extra: more Chrome flags, e.g. ["--disable-3d-apis", "--disable-webgl"] for a browser with no 3D
async function startChrome(extra = []) {
  const userDir = fs.mkdtempSync(path.join(os.tmpdir(), "tool-check-"));
  const flags = ["--headless=new", "--remote-debugging-port=0", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--mute-audio", `--user-data-dir=${userDir}`, "--force-color-profile=srgb", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--disable-background-networking", "--disable-component-update", "--disable-sync", "--no-pings", "--disable-features=IntensiveWakeUpThrottling", "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1", ...extra];
  const proc = spawn(CHROME, [...flags, "about:blank"], { stdio: "ignore" });
  const close = () => { try { proc.kill("SIGKILL"); } catch {} try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {} };
  process.on("exit", close);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => process.exit(130));
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

let cdp = null;
const consoleErrors = [];
function listenConsole(browser) {
  browser.listeners.add((m) => {
    let text = null;
    if (m.method === "Runtime.exceptionThrown") text = m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text;
    else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") text = m.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
    if (text) consoleErrors.push({ scenario: scene && scene.name, text: String(text).split("\n")[0].slice(0, 200) });
  });
}
async function inPage(fn, ...args) {
  if (process.env.TC_TRACE) console.log("    · " + (fn.name || String(fn).slice(0, 60).replace(/\s+/g, " ")));
  const expression = `(${fn.toString()})(${args.map((a) => JSON.stringify(a)).join(",")})`;
  // TC_TRACE: if the page has not answered in 30 s, pause its script and print where it is
  let watch = null;
  if (process.env.TC_TRACE) watch = setTimeout(async () => {
    const l = (m) => { if (m.method === "Debugger.paused") { cdp.listeners.delete(l); console.log("    PAGE STUCK IN: " + m.params.callFrames.slice(0, 10).map((f) => `${f.functionName || "?"}@${f.url.split("/").pop()}:${f.location.lineNumber + 1}`).join(" < ")); cdp.send("Debugger.resume").catch(() => {}); } };
    cdp.listeners.add(l);
    try { await cdp.send("Debugger.enable", {}, 5000); await cdp.send("Debugger.pause", {}, 5000); } catch (e) { console.log("    could not pause the page: " + e.message); }
  }, 30000);
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, 90000).finally(() => clearTimeout(watch));
  if (r.exceptionDetails) throw new Error("in page: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split("\n")[0]);
  return r.result.value;
}
async function navigate(url) {
  const ev = cdp.waitEvent("Page.loadEventFired");
  ev.catch(() => {}); // if Page.navigate itself fails, this must not also end the whole run
  const r = await cdp.send("Page.navigate", { url });
  if (r.errorText) throw new Error(`could not open ${url}: ${r.errorText}`);
  await ev;
}
async function setView(view) {
  const v = VIEWS[view];
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: v.w, height: v.h, deviceScaleFactor: v.dpr, mobile: v.mobile, screenWidth: v.w, screenHeight: v.h });
  await cdp.send("Emulation.setTouchEmulationEnabled", v.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
}

/* ══ Functions that run inside the page ══════════════════════════════
   These are serialised with toString(), so each one must stand alone. */

// Runs before any page script: side effects are written down instead of happening.
function installProbes() {
  const tc = (window.__tc = { alerts: [], opened: [], clipboard: [], downloads: [], canvas: [], turnstile: [], token: "" });
  window.alert = (m) => { tc.alerts.push(String(m)); };
  window.open = (...a) => { tc.opened.push(a.map(String)); return null; };
  try { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t) => { tc.clipboard.push(String(t)); return Promise.resolve(); } } }); } catch (e) {}
  const realClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.hasAttribute("download")) { tc.downloads.push({ name: this.download, href: this.href.slice(0, 22) }); return; }
    return realClick.call(this);
  };
}

// Wait for the tools to exist, the backend to answer, and the page's own short timers.
async function pageSettle() {
  const until = async (f, ms) => { const t0 = Date.now(); while (!f() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 25)); return f(); };
  const built = await until(() => document.getElementById("ix0"), 15000);
  if (!built) throw new Error("the tools were not built within 15 s (#ix0 is missing)");
  await until(() => !window.__cowConfigured || (window.__cowLive && window.__cowLive.ready), 5000);
  await new Promise((r) => setTimeout(r, 950)); // main.js fills the coalition bar after 700 ms
  // #coalitionNum runs up over 1.8 s when the count is large: read it only once it has stopped.
  let last = null, same = 0;
  for (let i = 0; i < 120 && same < 4; i++) {
    const v = document.getElementById("coalitionNum").textContent;
    same = v === last ? same + 1 : 0;
    last = v;
    await new Promise((r) => setTimeout(r, 50));
  }
}

function pageStep(op, a) {
  const $ = (id) => document.getElementById(id);
  const need = (id) => { const e = $(id); if (!e) throw new Error("#" + id + " is missing"); return e; };
  const fire = (e, type) => e.dispatchEvent(new Event(type, { bubbles: true }));
  const setVal = (id, v) => { const e = need(id); e.value = v; fire(e, "input"); fire(e, "change"); };
  const tick = (id, v) => { const e = need(id); if (e.checked !== v) e.click(); };
  if (op === "cause") need("ix" + a).click();
  else if (op === "country") { const e = need("countrySelect"); e.value = a; fire(e, "change"); }
  else if (op === "tax") setVal("taxSlider", String(a));
  else if (op === "name") setVal("letterName", a);
  else if (op === "title") setVal("letterTitle", a);
  else if (op === "editLetter") need("letterOutput").innerText = a;
  else if (op === "email") setVal("coalitionEmail", a);
  else if (op === "age") { const e = need("coalitionAge"); e.value = a; fire(e, "change"); }
  else if (op === "consentEmail") tick("coalitionConsent", a);
  else if (op === "consentLetter") tick("letterConsent", a);
  else if (op === "turnstileToken") window.__tc.token = a;
  else if (op === "call") window[a[0]](...a.slice(1));
  else if (op === "shareEmail") { need("emailIn").value = a; window.submitEmail(); }
  else throw new Error("unknown step " + op);
}

// The small reading taken after every single cause is chosen or un-chosen.
function pageMini() {
  const $ = (id) => document.getElementById(id);
  const t = (id) => ($(id) ? $(id).textContent.replace(/\s+/g, " ").trim() : null);
  return { remaining: t("tiRem"), allocated: t("tiAlloc"), count: t("tiCount"), bar: $("tiBar") ? $("tiBar").style.width : null, locked: $("journeyGate") ? $("journeyGate").classList.contains("locked") : null, prompt: t("redistPrompt") };
}

function pageSnap() {
  const $ = (id) => document.getElementById(id);
  const clean = (s) => s.replace(/\s+/g, " ").trim();
  const t = (id) => ($(id) ? clean($(id).textContent) : null);
  const shown = (id) => ($(id) ? getComputedStyle($(id)).display !== "none" : null);
  const has = (id, c) => ($(id) ? $(id).classList.contains(c) : null);
  const attr = (id) => ($(id) ? $(id).disabled : null);
  const widths = (id) => ($(id) ? [...$(id).innerHTML.matchAll(/data-w="([\d.]+)"/g)].map((m) => m[1]) : null);
  // the letter as the reader sees it: line breaks kept, independent of how the page lays it out
  const letter = () => {
    if (!$("letterOutput")) return null;
    const c = $("letterOutput").cloneNode(true);
    c.querySelectorAll("br").forEach((b) => b.replaceWith("\n"));
    return c.textContent;
  };
  const cant = [];
  for (let i = 0; $("ix" + i); i++) if ($("ix" + i).textContent.includes("exceeds remaining budget")) cant.push(i);
  const store = {};
  for (let i = 0; i < localStorage.length; i++) store[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
  const session = {};
  for (let i = 0; i < sessionStorage.length; i++) session[sessionStorage.key(i)] = sessionStorage.getItem(sessionStorage.key(i));
  const num = $("coalitionNum");
  return {
    tracker: { remaining: t("tiRem"), allocated: t("tiAlloc"), count: t("tiCount"), bar: $("tiBar") ? $("tiBar").style.width : null },
    gate: { locked: has("journeyGate", "locked"), prompt: t("redistPrompt"), continueDisabled: attr("toCountryBtn") },
    summary: { big: t("sumBig"), statement: t("sumStmt"), panelShown: has("prioPanel", "show"), priorities: t("prioList"), blocked: cant },
    country: { selected: $("countrySelect") ? $("countrySelect").value : null, cardShown: shown("countryData"), card: shown("countryData") ? t("countryData") : "", barPercents: widths("countryData"), nextDisabled: attr("countryNextBtn") },
    tax: { income: t("taxIncomeVal"), slider: $("taxSlider") ? $("taxSlider").value : null, result: t("taxResult") },
    letter: { text: letter(), missingNoteShown: has("letterNote", "show"), contactNote: t("letterContactNote"), contactLinks: $("letterContactNote") ? [...$("letterContactNote").querySelectorAll("a")].map((a) => a.getAttribute("href")) : null },
    coalition: {
      display: num ? clean(num.parentElement.textContent) : null,
      soft: has("coalitionNum", "soft"),
      bar: $("coalitionBarFill") ? $("coalitionBarFill").style.width : null,
      topIssues: $("coalitionTopIssues") ? [...$("coalitionTopIssues").children].map((c) => [clean(c.textContent), c.classList.contains("hot")]) : null,
      globalPriorities: t("globalPrio"),
      globalBarPercents: widths("globalPrio"),
      thanksShown: shown("coalitionThanks"),
      thanks: t("coalitionThanks"),
      emailDisabled: attr("coalitionEmail"),
    },
    card: { open: has("scOverlay", "open"), text: t("shareCard") },
    sharePanel: { open: has("shareOv", "open"), thanksShown: shown("sThanks"), emailDisabled: attr("emailIn") },
    storage: { local: store, session },
    effects: { alerts: window.__tc.alerts, opened: window.__tc.opened, clipboard: window.__tc.clipboard, downloads: window.__tc.downloads, canvas: window.__tc.canvas, turnstile: window.__tc.turnstile },
  };
}

// Every word of the tools, read once with nothing chosen.
function pageWording() {
  const $ = (id) => document.getElementById(id);
  const clean = (s) => s.replace(/\s+/g, " ").trim();
  const t = (id) => ($(id) ? clean($(id).textContent) : null);
  const ph = (id) => ($(id) ? $(id).getAttribute("placeholder") : null);
  const label = (id) => {
    const l = $(id) && $(id).closest("label");
    if (!l) return null;
    return {
      text: clean(l.textContent),
      links: [...l.querySelectorAll("a")].map((a) => ({ text: clean(a.textContent), href: a.getAttribute("href"), target: a.getAttribute("target"), rel: a.getAttribute("rel") })),
      bold: [...l.querySelectorAll("b")].map((b) => clean(b.textContent)),
    };
  };
  const common = (a, b) => { let e = $(a); while (e && $(b) && !e.contains($(b))) e = e.parentElement; return e; };
  const sectionIds = ["haveyoursay", "redistribute", "countrySection", "letterSection", "coalitionSection", "shareOv", "scOverlay"];
  const sections = {};
  sectionIds.forEach((id) => { sections[id] = t(id); });
  let gate = t("journeyGate");
  if (gate !== null) ["countrySection", "letterSection", "coalitionSection"].forEach((id) => { if (sections[id]) gate = gate.replace(sections[id], ""); });
  const tracker = common("tiRem", "tiCount");
  return {
    consent: { email: label("coalitionConsent"), letter: label("letterConsent") },
    placeholders: { letterName: ph("letterName"), letterTitle: ph("letterTitle"), coalitionEmail: ph("coalitionEmail"), emailIn: ph("emailIn") },
    ageOptions: $("coalitionAge") ? [...$("coalitionAge").options].map((o) => [o.value, clean(o.textContent)]) : null,
    countryOptions: $("countrySelect") ? [...$("countrySelect").options].map((o) => clean(o.textContent)) : null,
    sections,
    trackerLabels: tracker ? clean(tracker.textContent) : null,
    gateMessage: gate === null ? null : clean(gate),
  };
}

function pageCards() {
  const out = [];
  for (let i = 0; document.getElementById("ix" + i); i++) out.push(document.getElementById("ix" + i).textContent.replace(/\s+/g, " ").trim());
  return out;
}
function pageGlobe() {
  return window.globeData().map((p) => ({ country: p.country, count: p.count, alt: p.alt, lat: p.lat, lng: p.lng }));
}

function pageTaxSweep(positions) {
  const $ = (id) => document.getElementById(id);
  return positions.map((p) => {
    const s = $("taxSlider");
    s.value = String(p);
    s.dispatchEvent(new Event("input", { bubbles: true }));
    // The letter's personal line carries the rounded figure that is also sent with a submission.
    const said = $("letterOutput").textContent.match(/roughly [^.]*? of the income tax/);
    return { position: p, income: $("taxIncomeVal").textContent, result: $("taxResult").textContent.replace(/\s+/g, " ").trim(), letterSays: said ? said[0] : null };
  });
}
function pageCountrySweep() {
  const $ = (id) => document.getElementById(id);
  const sel = $("countrySelect");
  return [...sel.options].filter((o) => o.value).map((o) => {
    sel.value = o.value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    return {
      country: o.value,
      card: $("countryData").textContent.replace(/\s+/g, " ").trim(),
      barPercents: [...$("countryData").innerHTML.matchAll(/data-w="([\d.]+)"/g)].map((m) => m[1]),
      contactNote: $("letterContactNote").textContent.replace(/\s+/g, " ").trim(),
    };
  });
}

// After a submit: if it was accepted, wait for the card that opens 1.6 s later.
async function pageAfterSubmit() {
  const $ = (id) => document.getElementById(id);
  const thanks = $("coalitionThanks");
  if (!thanks || getComputedStyle(thanks).display === "none") return false;
  const t0 = Date.now();
  while (!$("scOverlay").classList.contains("open") && Date.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 25));
  await new Promise((r) => setTimeout(r, 150));
  return true;
}
async function pageSettleAgain() {
  let last = null, same = 0;
  for (let i = 0; i < 120 && same < 4; i++) {
    const v = document.getElementById("coalitionNum").textContent;
    same = v === last ? same + 1 : 0;
    last = v;
    await new Promise((r) => setTimeout(r, 50));
  }
}
async function pageWaitDownload() {
  const t0 = Date.now();
  window.downloadCard();
  while (!window.__tc.downloads.length && Date.now() - t0 < 5000) await new Promise((r) => setTimeout(r, 25));
}

// Every link anywhere on the page, with the nearest id above it.
function pageLinks() {
  const near = (e) => { for (let n = e; n; n = n.parentElement) if (n.id) return n.id; return "page"; };
  return [...document.querySelectorAll("a[href]")].map((a) => ({ raw: a.getAttribute("href"), url: a.href, text: a.textContent.replace(/\s+/g, " ").trim(), where: near(a) }));
}
function pageSweepLinks() {
  const $ = (id) => document.getElementById(id);
  const sel = $("countrySelect");
  const out = [];
  [...sel.options].filter((o) => o.value).forEach((o) => {
    sel.value = o.value;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    ["countryData", "letterContactNote"].forEach((id) => $(id).querySelectorAll("a[href]").forEach((a) => out.push({ raw: a.getAttribute("href"), url: a.href, text: a.textContent.replace(/\s+/g, " ").trim(), where: id, country: o.value })));
  });
  return out;
}

/* ══ Running a scenario ══════════════════════════════════════════════ */

// Open a fresh page for a scenario: clean storage, fake network already on.
async function openScenario(s, view) {
  await navigate("about:blank");
  await cdp.send("Storage.clearDataForOrigin", { origin: baseURL.replace(/\/$/, ""), storageTypes: "all" });
  scene = { name: s.name, backend: s.backend, config: s.config, libs: s.libs || [], delay: s.delay || null, delivered: [], requests: [] };
  await setView(view);
  await cdp.send("Emulation.setTimezoneOverride", { timezoneId: s.tz });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: s.reduced ? "reduce" : "no-preference" }] });
  const u = new URL(opts.url, baseURL);
  if (s.query) for (const [k, v] of new URLSearchParams(s.query)) u.searchParams.set(k, v);
  if (s.hash) u.hash = s.hash;
  await navigate(u.href);
  await inPage(pageSettle);
}
async function closeScenario() {
  // sessionStorage belongs to the tab, so it has to be cleared from inside the page.
  try { await inPage(() => { localStorage.clear(); sessionStorage.clear(); }); } catch {}
}

function normalise(v, origin) {
  const encoded = encodeURIComponent(origin);
  const text = JSON.stringify(v).split(origin).join("{ORIGIN}").split(encoded).join("{ORIGIN}");
  return JSON.parse(text);
}
function tidySnap(s) {
  s.effects.opened = s.effects.opened.map(([url, ...rest]) => { let d = url; try { d = decodeURIComponent(url); } catch {} return [d, ...rest]; });
  if (s.storage.local.cow_subs) {
    const subs = JSON.parse(s.storage.local.cow_subs);
    subs.forEach((x) => { if (typeof x.ts === "number") x.ts = "{TS}"; });
    s.storage.local.cow_subs = subs;
  }
  return s;
}

async function runScenario(s, view) {
  await openScenario(s, view);
  const out = { trail: [], snaps: {} };
  const snap = async () => tidySnap(await inPage(pageSnap));
  for (const [op, ...a] of s.steps) {
    if (op === "causes") for (const i of a[0]) { await inPage(pageStep, "cause", i); out.trail.push({ cause: i, ...(await inPage(pageMini)) }); }
    else if (op === "snap") out.snaps[a[0]] = await snap();
    else if (op === "wording") out.wording = await inPage(pageWording);
    else if (op === "cards") out.cards = await inPage(pageCards);
    else if (op === "globe") (out.globe ||= []).push(await inPage(pageGlobe));
    else if (op === "taxSweep") out.taxSweep = await inPage(pageTaxSweep, a[0]);
    else if (op === "countrySweep") out.countrySweep = await inPage(pageCountrySweep);
    else if (op === "download") await inPage(pageWaitDownload);
    else if (op === "submit") {
      await inPage(pageStep, "call", ["submitCoalition"]);
      if (await inPage(pageAfterSubmit)) await inPage(pageSettleAgain);
      await sleep(250);
    }
    else if (op === "reload") {
      const ev = cdp.waitEvent("Page.loadEventFired");
      ev.catch(() => {});
      await cdp.send("Page.reload", {});
      await ev;
      await inPage(pageSettle);
    }
    else if (op === "call") await inPage(pageStep, "call", a);
    else await inPage(pageStep, op, a[0]);
  }
  await sleep(60); // let a copy promise (clipboard, then alert) finish
  out.final = await snap();
  await closeScenario();
  out.requests = requestsFor(scene);
  scene = null;
  return normalise(out, baseURL.replace(/\/$/, ""));
}

/* ══ Comparing ═══════════════════════════════════════════════════════ */

function diff(a, b, at = "", out = []) {
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") {
    if (a !== b) out.push({ path: at, expected: a, actual: b });
    return out;
  }
  if (Array.isArray(a) !== Array.isArray(b)) { out.push({ path: at, expected: a, actual: b }); return out; }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], at ? `${at}.${k}` : k, out);
  return out;
}
function isApproved(d) {
  return APPROVED.find((p) => p.path.test(d.path) && (p.added ? d.expected === undefined && d.actual !== undefined : typeof d.expected === "string" && d.expected.includes(p.from) && d.expected.split(p.from).join(p.to) === d.actual));
}
// One line showing where two values part, not the whole of a long letter.
function showDiff(d) {
  const clip = (v) => { const s = typeof v === "string" ? v : JSON.stringify(v); return s === undefined ? "nothing" : s; };
  const x = clip(d.expected), y = clip(d.actual);
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  const from = Math.max(0, i - 30);
  return `${d.path}: was “${x.slice(from, i + 50)}” now “${y.slice(from, i + 50)}”`;
}

/* ══ Checks ══════════════════════════════════════════════════════════ */

function chosenScenarios(view) {
  return SCENARIOS.filter((s) => (!opts.scenarios || opts.scenarios.some((p) => s.name.includes(p))) && (view === "desktop" ? !opts.quick || s.core : s.core));
}

// Spec Tests item 1: the tools must behave exactly as the old page did.
async function checkGolden(ctx) {
  const actual = {};
  const expected = opts.record ? null : JSON.parse(fs.readFileSync(GOLDEN, "utf8")).scenarios;
  for (const view of opts.views) {
    const list = chosenScenarios(view);
    console.log(`\n${view} (${VIEWS[view].w} × ${VIEWS[view].h}): ${list.length} scenarios`);
    let same = 0;
    const bad = [], everyDifference = [], approved = [], stopped = [];
    const t0 = Date.now();
    for (const [k, s] of list.entries()) {
      // a fresh browser every 15 scenarios: on a machine short of memory one long-lived browser stalls
      if (k && k % 15 === 0 && ctx.fresh) await ctx.fresh();
      let got;
      try { got = await runScenario(s, view); }
      catch (e) {
        scene = null;
        // a stall of this machine: once more, in a fresh browser
        if (!/took longer than|no Page\.loadEventFired within/.test(e.message) || !ctx.fresh) { stopped.push(`${s.name}: ${e.message}`); continue; }
        try { await ctx.fresh(); got = await runScenario(s, view); approved.push(`${s.name}: second try, the first was interrupted by a stall of this machine`); }
        catch (e2) { stopped.push(`${s.name}: ${e2.message}`); scene = null; continue; }
      }
      actual[view] ||= {};
      actual[view][s.name] = got;
      // When recording, the phone views are compared with what desktop just recorded.
      const want = opts.record ? (view === opts.views[0] ? got : actual[opts.views[0]]?.[s.name]) : expected[s.name];
      if (!want) { bad.push(`${s.name}: nothing recorded for this scenario`); continue; }
      const found = diff(want, got);
      const real = found.filter((d) => { const p = isApproved(d); if (p) approved.push(`${s.name} · ${d.path}: ${p.why}`); return !p; });
      everyDifference.push(...real.map((d) => `${s.name} · ${showDiff(d)}`));
      if (real.length) bad.push(...real.slice(0, 6).map((d) => `${s.name} · ${showDiff(d)}`), ...(real.length > 6 ? [`${s.name}: ${real.length - 6} more differences`] : []));
      else same++;
    }
    const secs = Math.round((Date.now() - t0) / 1000);
    const verb = opts.record ? "recorded" : "match the old page";
    if (stopped.length) record("golden", view, "fail", `the check itself stopped in ${stopped.length} scenario(s); ${same} ${verb}`, stopped);
    if (bad.length) record("golden", view, "fail", `${list.length - same - stopped.length} of ${list.length} scenarios differ`, bad, everyDifference);
    else if (!stopped.length) record("golden", view, "pass", `${same} of ${list.length} scenarios ${verb} (${secs} s)`, [...new Set(approved)]);
  }
  fs.writeFileSync(path.join(OUT, "actual.json"), JSON.stringify(actual, null, 1));
  ctx.actual = actual;
}

// Every external link and every figure printed in the old tools (spec Tests item 4). Recording only.
async function recordOldLinks(ctx) {
  const s = sc("links", {}, []);
  await openScenario(s, "desktop");
  const seen = await inPage(pageLinks);
  const swept = await inPage(pageSweepLinks);
  await closeScenario();
  scene = null;
  const origin = baseURL.replace(/\/$/, "");
  const all = [...seen, ...swept];
  const groups = { sources: new Map(), contacts: new Map(), credits: new Map(), internal: new Map(), hash: new Map(), mailto: new Map() };
  const CREDIT = /^https:\/\/www\.(thesixdegrees|studioex)\.co\/?$/;
  for (const l of all) {
    const add = (g, key) => { const e = g.get(key) || { url: key, text: new Set(), where: new Set() }; if (l.text) e.text.add(l.text); e.where.add(l.where); g.set(key, e); };
    if (l.raw.startsWith("#")) add(groups.hash, l.raw);
    else if (l.url.startsWith("mailto:")) add(groups.mailto, l.raw);
    else if (l.url.startsWith(origin)) add(groups.internal, l.raw);
    else if (l.where === "countryData" || l.where === "letterContactNote") add(groups.contacts, l.raw);
    else if (CREDIT.test(l.raw)) add(groups.credits, l.raw);
    else add(groups.sources, l.raw);
  }
  const flat = (g) => [...g.values()].map((e) => ({ url: e.url, text: [...e.text].sort(), where: [...e.where].sort() })).sort((a, b) => (a.url < b.url ? -1 : 1));
  // A cross-check: every link written in index.html itself must be in what the page showed.
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const inHtml = [...html.matchAll(/href="(https?:[^"]+|mailto:[^"]+)"/g)].map((m) => m[1]).filter((h) => !/fonts\.g/.test(h));
  const known = new Set(all.map((l) => l.raw));
  const unseen = [...new Set(inHtml)].filter((h) => !known.has(h));
  const figures = toolFigures(ctx.actual[opts.views[0]]);
  const links = { from: `index.html at ${OLD_COMMIT}`, sources: flat(groups.sources), contacts: flat(groups.contacts), credits: flat(groups.credits), internal: flat(groups.internal), deepLinks: flat(groups.hash), mailto: flat(groups.mailto), toolFigures: figures };
  fs.mkdirSync(opts.fixtures, { recursive: true });
  fs.writeFileSync(OLD_LINKS, JSON.stringify(links, null, 1) + "\n");
  record("links", "desktop", unseen.length ? "fail" : "pass", `${links.sources.length} source links, ${links.contacts.length} government contact links, ${links.credits.length} credit links, ${links.internal.length} own pages, ${links.mailto.length} mail link, ${links.deepLinks.length} deep links; ${figures.printedBeforeAnyChoice.length} figures before any choice, ${figures.printedAfterChoices.length} more after choices (${rel(OLD_LINKS)})`, unseen.map((u) => "written in index.html but not on the page: " + u));
}

// Pull the figures out of printed text: a number with its currency sign and its unit.
const FIGURE = /(?:R\$|CHF |kr |[$£€¥₹₽₩₪₺])?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|trillion|billion|million)|[TBMk](?![a-zA-Z]))?(?:\/yr)?/g;
function figuresIn(text, into) {
  for (const m of String(text).matchAll(FIGURE)) into.add(m[0].replace(/,$/, ""));
}
function toolFigures(scenarios) {
  const before = new Set(), after = new Set();
  const w = scenarios["causes-0"].wording;
  for (const v of [...Object.values(w.sections), w.trackerLabels, w.gateMessage, ...w.ageOptions.flat()]) if (v) figuresIn(v, before);
  const snapText = (s) => {
    const out = [s.tracker.remaining, s.tracker.allocated, s.tracker.count, s.gate.prompt, s.summary.big, s.summary.statement, s.summary.priorities, s.country.card, s.tax.income, s.tax.result, s.letter.text, s.letter.contactNote, s.coalition.display, s.coalition.globalPriorities, s.card.text];
    return out.filter(Boolean);
  };
  for (const r of Object.values(scenarios)) {
    const texts = [...(r.final ? snapText(r.final) : []), ...Object.values(r.snaps || {}).flatMap(snapText), ...(r.cards || [])];
    for (const row of r.taxSweep || []) texts.push(row.income, row.result);
    for (const row of r.countrySweep || []) texts.push(row.card);
    for (const row of r.trail || []) texts.push(row.remaining, row.allocated, row.count, row.prompt);
    texts.forEach((t) => figuresIn(t, after));
  }
  const byText = (a, b) => (a < b ? -1 : 1);
  return { note: "Every figure printed by the old tools: before any choice, and additionally across every recorded scenario and all 154 countries.", printedBeforeAnyChoice: [...before].sort(byText), printedAfterChoices: [...after].filter((f) => !before.has(f)).sort(byText) };
}

// Every request the page tried must have been answered by a stub. Runs last.
async function checkNetwork() {
  const stubbedKeys = new Set(net.stubbed.map((r) => `${r.method} ${r.url}`));
  const unfaked = net.attempted.filter((r) => !stubbedKeys.has(`${r.method} ${r.url}`));
  const kinds = {};
  net.stubbed.forEach((r) => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
  fs.writeFileSync(path.join(OUT, "network.json"), JSON.stringify({ attempted: net.attempted, stubbed: net.stubbed, realAddresses: net.real, localServed: net.local }, null, 1));
  const summary = `${net.attempted.length} outside requests tried, ${net.stubbed.length} answered by stubs, ${unfaked.length} not stubbed, ${net.real.length} from a real address (${net.local} local files served)`;
  const notes = [`stubbed: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")}`, ...unfaked.slice(0, 20).map((r) => `not stubbed: ${r.method} ${r.url}`), ...net.real.slice(0, 20).map((r) => `real address: ${r.url} ${r.ip}`)];
  record("network", "all", unfaked.length || net.real.length || !net.attempted.length ? "fail" : "pass", summary, notes);
}

// SHOW_SEEDED off (the default in js/config.js): nothing invented may show (spec, Defaults).
async function checkSeeded() {
  const s = sc("seeded-off", { config: { SHOW_SEEDED: false } }, []);
  await openScenario(s, "desktop");
  await inPage(pageStep, "cause", 0);
  await inPage(pageStep, "country", UK);
  await inPage(pageStep, "call", ["generateShareCard"]);
  const got = await inPage(() => ({
    headline: document.getElementById("coalitionNum").textContent,
    barHidden: !!document.getElementById("coalitionBarFill").closest("[hidden]"),
    bars: document.getElementById("globalPrio").textContent.replace(/\s+/g, " ").trim(),
    globe: window.globeData().length,
    country: document.getElementById("countryData").textContent,
    card: document.getElementById("scStatRight").textContent.replace(/\s+/g, " ").trim(),
  }));
  await closeScenario();
  scene = null;
  const bad = [];
  if (got.headline !== "A growing coalition") bad.push("headline: " + got.headline);
  if (!got.barHidden) bad.push("the coalition bar still shows");
  if (got.bars) bad.push("priority bars still show: " + got.bars.slice(0, 80));
  if (got.globe) bad.push(got.globe + " globe sign-ups still show");
  if (got.country.includes("would fund first")) bad.push("the country card still shows the seeded panel");
  if (got.card !== "join a growing coalition") bad.push("card: " + got.card);
  record("seeded", "desktop", bad.length ? "fail" : "pass", bad.length ? "something invented still shows with SHOW_SEEDED off" : "with SHOW_SEEDED off: no count, bar, tally, panel or globe sign-up is invented", bad);
}

// A resize across the 560 px height never reloads a reader below the story, in a tool, or with
// anything to lose (spec, "Never reload a reader who is below the story").
async function checkNoReload() {
  const size = (width, height) => cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
  const wait = () => sleep(1200 * PATIENCE);
  const tall = () => size(1440, 900), short = () => size(720, 450);
  const mark = () => inPage(() => { window.__notReloaded = true; });
  const look = () => inPage(() => ({ same: !!window.__notReloaded, mode: window.Story.debug.mode, letter: document.getElementById("letterOutput").innerText.trim() }));
  const below = () => inPage(() => { document.getElementById("haveyoursay").scrollIntoView(); });
  const inStory = () => inPage(() => { window.scrollTo(0, innerHeight * 2); });
  // setting the text fires no event by itself; real typing fires "input"
  const typed = async () => { await inPage(pageStep, "editLetter", "TEST"); await inPage(() => { document.getElementById("letterOutput").dispatchEvent(new Event("input", { bubbles: true })); }); };
  const bad = [], fresh = async () => { await openScenario(sc("no-reload", {}, []), "desktop"); await mark(); };
  const expect = (what, got, same, letter) => {
    if (got.same !== same) bad.push(`${what}: ${same ? "the page reloaded" : "the page should have switched to the still plates"}`);
    if (letter && got.letter !== letter) bad.push(`${what}: the typed letter was lost`);
  };
  try {
    await fresh(); await below(); await sleep(150); await short(); await wait();
    expect("below the story, shrink", await look(), true);
    await tall(); await wait();
    expect("below the story, back", await look(), true);

    await short(); await wait();
    await inStory(); await wait(); await wait();
    const later = await look();
    expect("came back into the story with nothing to lose", later, false);
    if (later.mode !== "static") bad.push("came back into the story: mode is " + later.mode);
    await closeScenario(); scene = null; await tall();

    await fresh(); await typed(); await below(); await sleep(150); await short(); await wait();
    expect("typed letter, below the story, shrink", await look(), true, "TEST");
    await inStory(); await wait(); await wait();
    const stayed = await look();
    expect("typed letter, back in the story", stayed, true, "TEST");
    if (stayed.mode !== "motion") bad.push("typed letter, back in the story: mode is " + stayed.mode);
    await closeScenario(); scene = null; await tall();

    await fresh(); await inStory(); await sleep(150); await inPage(() => document.querySelector(".btn-r").focus()); await short(); await wait();
    expect("focus in a tool, shrink", await look(), true);
    await closeScenario(); scene = null; await tall();

    await fresh(); await inStory(); await sleep(150); await short(); await wait(); await wait();
    const plain = await look();
    expect("in the story, nothing to lose", plain, false);
    if (plain.mode !== "static") bad.push("in the story, nothing to lose: mode is " + plain.mode);
    // Now in the still plates at a short height: growing must not reload a reader with work below.
    await mark(); await inPage(pageStep, "cause", 0); await typed(); await below(); await sleep(150); await tall(); await wait();
    expect("still plates, typed letter below the story, grow", await look(), true, "TEST");
  } finally {
    try { await tall(); await closeScenario(); } catch {}
    scene = null;
  }
  record("noreload", "desktop", bad.length ? "fail" : "pass", bad.length ? `${bad.length} resize problem(s)` : "resizes across 560 px keep readers below the story and anyone with work in the tools; the switch waits until they are back with nothing to lose", bad);
}

/* ══ Phase 4: the tools end to end (spec Tests items 2 to 4) ═════════
   Real input only: keys go through Input.dispatchKeyEvent, clicks and taps through
   Input.dispatchMouseEvent / dispatchTouchEvent at the middle of what a reader would hit,
   so focus, covering layers and hit areas are tested as a reader meets them. */

const KEYS = { Tab: [9, "Tab"], Enter: [13, "Enter", "\r"], Space: [32, "Space", " "], Escape: [27, "Escape"], ArrowLeft: [37, "ArrowLeft"], ArrowUp: [38, "ArrowUp"], ArrowRight: [39, "ArrowRight"], ArrowDown: [40, "ArrowDown"], Home: [36, "Home"], End: [35, "End"] };
async function press(name, shift = false) {
  const [vk, code, text] = KEYS[name];
  const k = { key: name === "Space" ? " " : name, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: shift ? 8 : 0 };
  await cdp.send("Input.dispatchKeyEvent", text ? { type: "keyDown", ...k, text, unmodifiedText: text } : { type: "rawKeyDown", ...k });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...k });
  await sleep(40);
}
async function typeText(str) {
  for (const ch of str) {
    const code = /[a-z]/i.test(ch) ? "Key" + ch.toUpperCase() : /\d/.test(ch) ? "Digit" + ch : "";
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, code, text: ch, unmodifiedText: ch });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: ch, code });
  }
  await sleep(80);
}
// Tab (or Shift+Tab) until the page says focus is where we want it. Every stop on the way is
// written down with whether it showed a focus ring.
async function tabTo(test, max, stops, shift = false) {
  for (let i = 0; i < max; i++) {
    await press("Tab", shift);
    const f = await inPage(pageFocus);
    if (stops) stops.push(f);
    if (await inPage(new Function("return (" + test + ")"))) return f;
  }
  throw new Error(`Tab did not reach ${test} in ${max} presses (last: ${stops && stops.length ? stops[stops.length - 1].desc : "?"})`);
}
// Click or tap the middle of an element as a reader would; fail if something else is on top.
async function hit(selector, view) {
  const at = await inPage(pageAim, selector);
  if (!at) throw new Error(`${selector} is not on the page`);
  if (!at.hit) throw new Error(`${selector} is covered by ${at.top}`);
  if (VIEWS[view].mobile) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: at.x, y: at.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: at.x, y: at.y, button: "left", buttons: 1, clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: at.x, y: at.y, button: "left", buttons: 0, clickCount: 1 });
  }
  await sleep(120);
  return at;
}
async function drag(x0, y0, x1, y1) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x0, y: y0 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: x0, y: y0, button: "left", buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x0 + ((x1 - x0) * i) / 8, y: y0 + ((y1 - y0) * i) / 8, button: "left", buttons: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: x1, y: y1, button: "left", buttons: 0, clickCount: 1 });
  await sleep(150);
}
// The card opens 1.6 s after Submit on a page timer. On this machine under memory pressure a page timer
// once took longer than 6 s (round 4: "the card did not open", and the next step found focus in it), so
// the card's waits allow 20 s. They return as soon as the card is open, so a passing run is no slower.
const CARD_WAIT = 20000;
const waitFor = async (fnSrc, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms * PATIENCE) { if (await inPage(new Function("return (" + fnSrc + ")"))) return true; await sleep(80); } return false; };

// What has focus, and whether a reader can see it. The page's rule is a 2 px white outline
// 4 px out; four controls draw their own ring (the slider's thumb, the letter's sheet, the
// globe's ring, the room's frame).
function pageFocus() {
  const a = document.activeElement;
  if (!a || a === document.body || a === document.documentElement) return { desc: "nothing", ring: false, style: "" };
  const cs = getComputedStyle(a);
  const line = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 1;
  let own = null;
  if (a.id === "letterOutput") own = !!a.closest(".letter-wrap.is-editing");
  else if (a.id === "roomStage") own = getComputedStyle(document.querySelector(".room-fog")).outlineStyle !== "none";
  else if (a.classList.contains("globe-wrap")) { const r = a.querySelector(".globe-ring"); own = !!r && getComputedStyle(r).opacity === "1"; }
  else if (a.id === "taxSlider") own = line;
  const label = (a.getAttribute("aria-label") || a.getAttribute("placeholder") || a.textContent || a.value || "").replace(/\s+/g, " ").trim().slice(0, 32);
  const cls = typeof a.className === "string" && a.className ? "." + a.className.trim().split(/\s+/)[0] : "";
  const standard = line && cs.outlineStyle === "solid" && cs.outlineWidth === "2px" && cs.outlineOffset === "4px" && /rgb\(255, 255, 255\)/.test(cs.outlineColor);
  // The ring runs 4 to 6 px outside the control. Points along its middle must not land on a layer
  // that stays on screen (a sticky bar such as the letter's Send, or a fixed one) and is drawn over
  // the control: a ring under such a bar cannot be seen. Drawn over = higher in the stacking order
  // below the two's nearest common ancestor (or level with it and later in the page, or the control
  // not positioned at all).
  const branch = (el, stop) => {
    let z = 0, pos = false;
    for (let n = el; n && n !== stop; n = n.parentElement) {
      const c = getComputedStyle(n), placed = c.position !== "static";
      if ((placed && c.zIndex !== "auto") || c.position === "fixed" || c.position === "sticky" || c.transform !== "none" || c.isolation === "isolate" || +c.opacity < 1) { z = c.zIndex === "auto" ? 0 : +c.zIndex; pos = true; }
      else if (placed) pos = true;
    }
    return { z, pos };
  };
  const over = (l) => {
    let common = l.parentElement; while (common && !common.contains(a)) common = common.parentElement;
    const A = branch(a, common), L = branch(l, common);
    return L.z > A.z || (L.z === A.z && (!A.pos || !!(a.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING)));
  };
  const layer = (t) => { for (let n = t; n && n !== document.body && n !== document.documentElement; n = n.parentElement) { if (n.contains(a)) return null; const p = getComputedStyle(n).position; if ((p === "sticky" || p === "fixed") && over(n)) return n; } return null; };
  const under = new Set();
  for (const r of (a.id === "letterOutput" ? a.closest(".letter-wrap") || a : a).getClientRects()) {
    const L = r.left - 5, R = r.right + 5, T = r.top - 5, B = r.bottom + 5, pts = [];
    for (let i = 1; i <= 7; i++) { const x = L + ((R - L) * i) / 8; pts.push([x, T], [x, B]); }
    for (let i = 1; i <= 3; i++) { const y = T + ((B - T) * i) / 4; pts.push([L, y], [R, y]); }
    for (const [x, y] of pts) {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const c = layer(document.elementFromPoint(x, y));
      if (c) under.add(c.id ? "#" + c.id : c.tagName.toLowerCase() + (typeof c.className === "string" && c.className ? "." + c.className.trim().split(/\s+/)[0] : ""));
    }
  }
  return { desc: (a.id ? "#" + a.id : a.tagName.toLowerCase() + cls) + (label ? " “" + label + "”" : ""), ring: own !== null ? own : line, standard: own !== null ? "own" : standard, style: line ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} +${cs.outlineOffset}` : own ? "its own ring" : "none", inStory: !!a.closest("#story"), under: [...under] };
}
// Scroll the element to the middle of the screen and say what a click there would land on.
function pageAim(selector) {
  const e = document.querySelector(selector);
  if (!e || !e.getClientRects().length) return null;
  e.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
  const r = e.getBoundingClientRect();
  const x = Math.round(r.left + Math.min(r.width / 2, 40)), y = Math.round(r.top + r.height / 2);
  const t = document.elementFromPoint(x, y);
  const name = (n) => (n ? (n.id ? "#" + n.id : n.tagName.toLowerCase() + (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\s+/)[0] : "")) : "nothing");
  return { x, y, w: Math.round(r.width), h: Math.round(r.height), hit: !!t && (t === e || e.contains(t) || (e.labels && [...e.labels].some((l) => l.contains(t)))), top: name(t) };
}
// What the tools show, read as text and state, to compare one moment with another.
function pageToolState() {
  const story = document.getElementById("story");
  const skip = (e) => e.closest("#globeWrap, #roomStage, .room-hall, .room-data, script, style, svg") ;
  const out = [];
  let n = story.nextElementSibling;
  const walk = (e) => {
    if (skip(e)) return;
    const cs = getComputedStyle(e);
    out.push([e.id || e.tagName, e.className && typeof e.className === "string" ? e.className : "", e.hidden, cs.display, cs.visibility, cs.opacity, e.children.length ? "" : e.textContent.replace(/\s+/g, " ").trim().slice(0, 80)].join("|"));
    for (const c of e.children) walk(c);
  };
  for (; n; n = n.nextElementSibling) walk(n);
  return out;
}

// The golden recording says what the old page showed for the same choices: the journeys
// below are held to it.
let goldenCache = null;
const golden = () => (goldenCache ||= JSON.parse(fs.readFileSync(GOLDEN, "utf8")).scenarios);
const submitted = (sc) => sc.requests.filter((r) => r.fake.kind === "supabase" && r.u.pathname === "/rest/v1/submissions").map((r) => JSON.parse(r.body || "null"));
const formsent = (sc) => sc.requests.filter((r) => r.fake.kind === "formsubmit");
const tcEffects = () => inPage(() => ({ opened: window.__tc.opened.length, clip: window.__tc.clipboard.length, alerts: window.__tc.alerts.slice(), downloads: window.__tc.downloads.length }));
const ranking = () => inPage(() => JSON.stringify(ranking)); // a "let" in main.js, so not on window

// Backwards first, then forwards: for a control near where focus already is.
async function tabEither(test, stops) {
  try { return await tabTo(test, 8, stops, true); } catch { return tabTo(test, 20, stops); }
}

// Spec Tests item 2: every tool by keyboard alone. Starts at the top of the page with the skip
// link, as a keyboard reader would, and ends in the footer.
async function keyboardJourney(view, seeded, still = null) {
  const s = sc(`keyboard-${seeded ? "seeded" : "plain"}${still ? "-" + still : ""}`, { config: { SHOW_SEEDED: seeded }, reduced: still === "reduced", query: still === "static" ? "static=1" : undefined }, []);
  await openScenario(s, view);
  const stops = [], bad = [];
  const want = (ok, what) => { if (!ok) bad.push(what); };
  const g = golden();
  try {
    await inPage(() => window.scrollTo(0, 0));
    await press("Tab"); stops.push(await inPage(pageFocus));
    want(/skip-link/.test(stops[0].desc), "the first Tab is not the skip link: " + stops[0].desc);
    await press("Enter"); await sleep(400);
    // H1: choose three causes, open one's details, move one up and back
    await tabTo(`document.activeElement.matches('#ix0 .ix-pick')`, 30, stops);
    await press("Enter");
    await tabTo(`document.activeElement.matches('#ix4 .ix-pick')`, 20, stops);
    await press("Space");
    await tabTo(`document.activeElement.matches('#ix1 .ix-pick')`, 20, stops, true);
    await press("Enter");
    want((await ranking()) === "[0,4,1]", "causes chosen by Enter and Space: ranking is " + (await ranking()));
    const t = await inPage(pageMini), gt = g["causes-3-storyboard"].trail[2];
    want(t.remaining === gt.remaining && t.allocated === gt.allocated && t.count === gt.count && t.locked === false, `tracker after three causes: ${t.remaining} / ${t.allocated} / ${t.count}, the old page said ${gt.remaining} / ${gt.allocated} / ${gt.count}`);
    await press("Tab"); stops.push(await inPage(pageFocus));
    if (await inPage(() => document.activeElement.matches("#ix1 .ix-more"))) {
      await press("Enter");
      want(await inPage(() => document.getElementById("ix1").classList.contains("ix-exp")), "Enter on ▾ does not open the cause's details");
      await press("Enter");
    } else bad.push("Tab after a cause does not reach its ▾ (got " + stops[stops.length - 1].desc + ")");
    await tabTo(`(document.querySelectorAll('#prioList .prio-item')[1]||{}).contains && document.querySelectorAll('#prioList .prio-item')[1].querySelector('.prio-mv') === document.activeElement`, 60, stops);
    await press("Enter");
    want((await ranking()) === "[4,0,1]", "move up by keyboard: ranking is " + (await ranking()));
    want(await inPage(() => !!document.activeElement.closest("#prioList")), "focus left the priorities after a move");
    await tabEither(`document.activeElement === document.querySelectorAll('#prioList .prio-item')[0].querySelectorAll('.prio-mv')[1]`, stops);
    await press("Enter");
    want((await ranking()) === "[0,4,1]", "move down by keyboard: ranking is " + (await ranking()));
    // to the country step
    await tabTo(`document.activeElement.id === 'toCountryBtn'`, 60, stops);
    await press("Enter"); await sleep(600);
    await tabTo(`document.activeElement.id === 'countrySelect'`, 40, stops);
    // typed, not opened: a space (or an arrow) on a Mac opens the menu's own popup, which a
    // headless browser cannot close. Japan needs no space and is in the recording.
    await typeText("Japan"); await sleep(300);
    const country = await inPage(() => ({ v: document.getElementById("countrySelect").value, card: document.getElementById("countryData").textContent.replace(/\s+/g, " ").trim() }));
    want(country.v === "Japan", "typing a country's name in the menu chose " + JSON.stringify(country.v));
    // with SHOW_SEEDED off the seeded "What people in … would fund first" panel is the one thing left out
    const oldCard = g["country-japan-yen"].final.country.card;
    want(country.card === (seeded ? oldCard : oldCard.replace(/ What people in Japan would fund first.*?(?= Where does your tax)/, "")), "the country card differs from the old page's for the same choices");
    await tabTo(`document.activeElement.id === 'taxSlider'`, 10, stops);
    const sweep = g["tax-japan"].taxSweep;
    for (const [key, pos] of [["Home", 0], ["End", 1000]]) {
      await press(key);
      const tx = await inPage(() => ({ v: document.getElementById("taxSlider").value, income: document.getElementById("taxIncomeVal").textContent, result: document.getElementById("taxResult").textContent.replace(/\s+/g, " ").trim() }));
      const old = sweep.find((r) => r.position === pos);
      want(tx.v === String(pos) && tx.income === old.income && tx.result === old.result, `slider ${key}: ${tx.v} → ${tx.income}, the old page showed ${old.income} at ${pos}`);
    }
    await press("ArrowLeft");
    want((await inPage(() => document.getElementById("taxSlider").value)) !== "1000", "the arrow keys do not move the slider");
    await tabTo(`document.activeElement.id === 'countryNextBtn'`, 10, stops);
    await press("Enter"); await sleep(600);
    // H3: fields, the three send options on the sheet, the letter itself, Send
    await tabTo(`document.activeElement.id === 'letterName'`, 20, stops);
    await typeText("TEST");
    await press("Tab"); stops.push(await inPage(pageFocus));
    await typeText("TEST");
    const fx0 = await tcEffects();
    for (const [i, what] of [[0, "Copy"], [1, "Email"], [2, "Post to X"]]) {
      await tabTo(`document.activeElement === document.querySelectorAll('#letterSection .letter-toolbar-actions .tool-btn')[${i}]`, 6, stops);
      await press("Enter"); await sleep(150);
    }
    const fx1 = await tcEffects();
    want(fx1.clip === fx0.clip + 1 && fx1.opened === fx0.opened + 2, `Copy, Email and Post to X by keyboard: ${fx1.clip - fx0.clip} copied, ${fx1.opened - fx0.opened} opened (want 1 and 2)`);
    await tabTo(`document.activeElement.id === 'letterOutput'`, 6, stops);
    await typeText("TEST ");
    const letter = await inPage(() => document.getElementById("letterOutput").innerText);
    want(letter.startsWith("TEST ") && letter.includes("My name is TEST."), "typing into the letter: it does not start with the typed word or lost the name");
    await tabTo(`document.activeElement.matches('#letterSection .letter-primary .continue-btn')`, 6, stops);
    await press("Enter"); await sleep(150);
    want((await tcEffects()).opened === fx1.opened + 1, "Send by keyboard did not open the representative's page");
    await tabTo(`document.activeElement.matches('#letterSection .letter-secondary .link-btn:last-child')`, 8, stops);
    await press("Enter"); await sleep(600);
    // H4: the form, both consents, submit; then H5's card opens
    await tabTo(`document.activeElement.id === 'coalitionEmail'`, 8, stops);
    await typeText("tool-check@example.test");
    await tabTo(`document.activeElement.id === 'coalitionAge'`, 3, stops);
    await typeText("1"); await sleep(200);
    await tabTo(`document.activeElement.id === 'coalitionConsent'`, 3, stops);
    await press("Space");
    await tabTo(`document.activeElement.id === 'letterConsent'`, 4, stops);
    await press("Space");
    await tabTo(`document.activeElement.matches('.coalition-form .btn-t')`, 4, stops);
    await press("Enter");
    want(await waitFor(`document.getElementById('scOverlay').classList.contains('open')`, CARD_WAIT), "the card did not open after submitting");
    await sleep(300);
    const inCard = await inPage(() => !!document.activeElement.closest("#scOverlay"));
    want(inCard, "focus did not move into the card");
    stops.push(await inPage(pageFocus));
    for (let i = 0; i < 7; i++) { await press("Tab"); stops.push(await inPage(pageFocus)); if (!(await inPage(() => !!document.activeElement.closest("#scOverlay")))) { bad.push("Tab left the open card"); break; } }
    await press("Escape"); await sleep(200);
    const after = await inPage(() => ({ open: document.getElementById("scOverlay").classList.contains("open"), at: document.activeElement.id }));
    want(!after.open && after.at === "coalitionThanks", `Escape: card ${after.open ? "still open" : "closed"}, focus on ${after.at || "nothing with an id"} (want the thanks line, the button is off)`);
    const sent = submitted(scene)[0];
    want(sent && JSON.stringify(sent.ranking) === "[0,4,1]" && sent.country === "Japan" && sent.email === "tool-check@example.test" && sent.age_band === "18-24" && sent.letter_consent === true && typeof sent.letter === "string" && sent.letter.startsWith("TEST ") && sent.income !== null, "what was sent: " + JSON.stringify(sent && { ranking: sent.ranking, country: sent.country, email: sent.email, age: sent.age_band, consent: sent.letter_consent, letterStart: sent.letter && sent.letter.slice(0, 20), income: sent.income }));
    want(formsent(scene).length === 1, `${formsent(scene).length} email form(s) sent, want 1`);
    // H6 and the end of the page: no trap between the coalition and the footer
    await tabTo(`document.activeElement.matches('.room-cta-btn')`, 12, stops);
    await press("Enter"); await sleep(400);
    await tabTo(`document.activeElement.matches('.st-links a[href^="mailto:"]')`, 60, stops);
  } catch (e) { bad.push("stopped: " + e.message); }
  const noRing = [...new Set(stops.filter((f) => !f.inStory && f.desc !== "nothing" && !f.ring).map((f) => f.desc))];
  const odd = [...new Set(stops.filter((f) => !f.inStory && f.ring && f.standard === false).map((f) => `${f.desc}: ${f.style}`))];
  const hidden = [...new Set(stops.filter((f) => !f.inStory && f.under && f.under.length).map((f) => `${f.desc} under ${f.under.join(", ")}`))];
  if (noRing.length) bad.push(...noRing.map((d) => "no visible focus: " + d));
  if (hidden.length) bad.push(...hidden.map((d) => "focus ring partly hidden: " + d));
  await closeScenario(); scene = null;
  const size = `${VIEWS[view].w} × ${VIEWS[view].h}${view === "zoom400" ? " (a laptop at 400% zoom)" : ""}`;
  const how = still === "reduced" ? ", reduced motion" : still === "static" ? ", ?static=1" : "";
  record("keyboard", view, bad.length ? "fail" : "pass", bad.length ? `${size}${how}: ${bad.length} problem(s), SHOW_SEEDED ${seeded ? "on" : "off"}` : `${size}${how}: every tool by keyboard alone, skip link to footer, SHOW_SEEDED ${seeded ? "on" : "off"}: ${stops.length} focus stops, all visible, no ring under a bar that stays on screen`, [...bad, ...odd.map((o) => "focus drawn another way: " + o)]);
}

// Spec Tests item 2: every tool by pointer (mouse on desktop, finger on the phones). The country
// menu is the one control set by script: a native menu cannot be opened in a headless browser.
async function pointerJourney(view, seeded, still = null) {
  const s = sc(`pointer-${seeded ? "seeded" : "plain"}${still ? "-" + still : ""}`, { config: { SHOW_SEEDED: seeded }, reduced: still === "reduced", query: still === "static" ? "static=1" : undefined }, []);
  await openScenario(s, view);
  const bad = [], small = [];
  const want = (ok, what) => { if (!ok) bad.push(what); };
  const tap = async (sel) => { const a = await hit(sel, view); if (a.h < 44 || a.w < 44) small.push(`${sel} ${a.w} × ${a.h}`); return a; };
  const g = golden();
  try {
    for (const i of A3) await tap(`#ix${i} .ix-pick`);
    want((await ranking()) === "[0,4,1]", "causes chosen by pointer: ranking is " + (await ranking()));
    const t = await inPage(pageMini), gt = g["causes-3-storyboard"].trail[2];
    want(t.remaining === gt.remaining && t.allocated === gt.allocated && t.locked === false, `tracker after three causes: ${t.remaining} / ${t.allocated}, the old page said ${gt.remaining} / ${gt.allocated}`);
    await tap("#ix2 .ix-more");
    want(await inPage(() => document.getElementById("ix2").classList.contains("ix-exp")), "▾ does not open the cause's details");
    await tap("#ix2 .ix-more");
    await tap("#prioList .prio-item:nth-child(2) .prio-mv");
    want((await ranking()) === "[4,0,1]", "move up by pointer: ranking is " + (await ranking()));
    await tap("#prioList .prio-item:nth-child(1) .prio-mv:nth-of-type(2)");
    want((await ranking()) === "[0,4,1]", "move down by pointer: ranking is " + (await ranking()));
    await tap("#prioList .prio-item:nth-child(3) .prio-rm");
    want((await ranking()) === "[0,4]", "remove by pointer: ranking is " + (await ranking()));
    await tap("#ix1 .ix-pick");
    await tap("#toCountryBtn"); await sleep(700);
    await inPage(pageStep, "country", UK);
    const oldCard = g["country-uk"].final.country.card;
    want((await inPage(() => document.getElementById("countryData").textContent.replace(/\s+/g, " ").trim())) === (seeded ? oldCard : oldCard.replace(/ What people in United Kingdom would fund first.*?(?= Where does your tax)/, "")), "the country card differs from the old page's for the same choices");
    // the slider: press on the thumb and drag it most of the way along
    const sl = await inPage(() => { const e = document.getElementById("taxSlider"); e.scrollIntoView({ block: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return { l: r.left, w: r.width, y: r.top + r.height / 2, v: +e.value, max: +e.max || 1000, h: r.height }; });
    const x0 = sl.l + 10 + ((sl.w - 20) * sl.v) / sl.max;
    if (VIEWS[view].mobile) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: sl.y }] });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((sl.l + sl.w * 0.7 - x0) * i) / 8, y: sl.y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else await drag(x0, sl.y, sl.l + sl.w * 0.7, sl.y);
    await sleep(150);
    const tx = await inPage(() => ({ v: document.getElementById("taxSlider").value, income: document.getElementById("taxIncomeVal").textContent }));
    want(tx.v !== String(sl.v), `dragging the slider did not move it (still ${tx.v})`);
    if (sl.h < 44) small.push(`#taxSlider ${Math.round(sl.w)} × ${Math.round(sl.h)}`);
    await tap("#countryNextBtn"); await sleep(700);
    await tap("#letterName"); await cdp.send("Input.insertText", { text: "TEST" }); await sleep(100);
    const fx0 = await tcEffects();
    await tap("#letterSection .letter-toolbar-actions .tool-btn:nth-child(1)");
    await tap("#letterSection .letter-toolbar-actions .tool-btn:nth-child(2)");
    await tap("#letterSection .letter-toolbar-actions .tool-btn:nth-child(3)");
    await tap("#letterSection .letter-primary .continue-btn");
    const fx1 = await tcEffects(), ge = g["letter-send-options"].final.effects;
    want(fx1.clip - fx0.clip === ge.clipboard.length && fx1.opened - fx0.opened === ge.opened.length, `Copy, Email, Post to X and Send by pointer: ${fx1.clip - fx0.clip} copied, ${fx1.opened - fx0.opened} opened (the old page: ${ge.clipboard.length} and ${ge.opened.length})`);
    await tap("#letterOutput"); await cdp.send("Input.insertText", { text: "TEST " }); await sleep(100);
    want((await inPage(() => document.getElementById("letterOutput").innerText)).includes("TEST "), "typing into the letter after a tap did nothing");
    await tap("#letterSection .letter-secondary .link-btn:first-child"); // Generate shareable card
    want(await waitFor(`document.getElementById('scOverlay').classList.contains('open')`, CARD_WAIT), "the card did not open from the letter step");
    await tap("#scOverlay .sc-close");
    want(!(await inPage(() => document.getElementById("scOverlay").classList.contains("open"))), "Close did not close the card");
    await tap("#letterSection .letter-secondary .link-btn:last-child"); await sleep(700);
    await tap("#coalitionEmail"); await cdp.send("Input.insertText", { text: "tool-check@example.test" });
    await inPage(pageStep, "age", "25-34");
    // the box itself is 20 px; its row (the label) is the tap target a reader gets
    for (const id of ["coalitionConsent", "letterConsent"]) {
      await hit("#" + id, view);
      const row = await inPage((id) => { const r = document.getElementById(id).closest("label").getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }, id);
      if (row[0] < 44 || row[1] < 44) small.push(`#${id}'s row ${row[0]} × ${row[1]}`);
    }
    want(await inPage(() => document.getElementById("coalitionConsent").checked && document.getElementById("letterConsent").checked), "tapping the two consent boxes did not tick them");
    await tap(".coalition-form .btn-t");
    want(await waitFor(`document.getElementById('scOverlay').classList.contains('open')`, CARD_WAIT), "the card did not open after submitting");
    await tap("#scOverlay .sc-actions .btn-t"); // Download PNG
    want(await waitFor(`window.__tc.downloads.length > 0`), "Download PNG made no file");
    await tap("#scOverlay .sc-close");
    const sent = submitted(scene)[0];
    want(sent && JSON.stringify(sent.ranking) === "[0,4,1]" && sent.email === "tool-check@example.test" && sent.age_band === "25-34" && sent.letter_consent === true && typeof sent.letter === "string" && sent.letter.includes("TEST "), "what was sent: " + JSON.stringify(sent && { ranking: sent.ranking, email: sent.email, age: sent.age_band, consent: sent.letter_consent }));
    // the share panel from Redistribute, and the Archive link
    await tap(".h1-actions .btn-cta-out");
    want(await inPage(() => document.getElementById("shareOv").classList.contains("open")), "Share this did not open the share panel");
    await tap("#shareOv .share-close");
    want(!(await inPage(() => document.getElementById("shareOv").classList.contains("open"))), "Close did not close the share panel");
    await tap(".room-cta-btn"); await sleep(600);
    want(Math.abs(await inPage(() => document.getElementById("roomSection").getBoundingClientRect().top)) < 140, "'Enter the archive' did not bring the Archive to the top");
  } catch (e) { bad.push("stopped: " + e.message); }
  await closeScenario(); scene = null;
  const how = still === "reduced" ? ", reduced motion" : still === "static" ? ", ?static=1" : "";
  record("pointer", view, bad.length || small.length ? "fail" : "pass", bad.length || small.length ? `${bad.length + small.length} problem(s), SHOW_SEEDED ${seeded ? "on" : "off"}${how}` : `every tool by ${VIEWS[view].mobile ? "finger" : "mouse"}, nothing covered, every tap at least 44 px, SHOW_SEEDED ${seeded ? "on" : "off"}${how}`, [...bad, ...small.map((x) => "under 44 px: " + x)]);
}

// Spec Tests item 2: nothing in the tools depends on the scroll position. The same choices are
// read at five scroll positions in one page, and made from two different positions in two
// pages. The globe and the Archive may load and pause by visibility, so they are left out.
async function checkScroll() {
  for (const view of opts.views) {
    const bad = [];
    const at = async (y) => { await inPage((y) => window.scrollTo({ top: y === "end" ? document.documentElement.scrollHeight : y === "tools" ? document.getElementById("haveyoursay").offsetTop : y === "letter" ? document.getElementById("letterSection").offsetTop : y, behavior: "instant" }), y); await sleep(500 * PATIENCE); return inPage(pageToolState); };
    const choose = async () => { for (const i of A3) await inPage(pageStep, "cause", i); await inPage(pageStep, "country", UK); await inPage(pageStep, "tax", 430); await inPage(pageStep, "name", "TEST"); };
    try {
      await openScenario(sc("scroll-a", {}, []), view);
      const rv = await inPage(() => document.querySelectorAll("#story ~ * .rv, #story ~ .rv").length);
      if (rv) bad.push(`${rv} element(s) still carry the old scroll reveal (.rv)`);
      await inPage(() => window.scrollTo(0, 0));
      await choose();
      const ref = await at(0);
      for (const y of ["tools", "letter", "end", 0]) {
        const now = await at(y);
        const d = ref.map((r, i) => (r !== now[i] ? r + "  →  " + now[i] : null)).filter(Boolean);
        if (d.length || ref.length !== now.length) bad.push(`at ${y}: ${d.length || "a different number of"} difference(s)`, ...d.slice(0, 4));
      }
      await closeScenario(); scene = null;
      await openScenario(sc("scroll-b", {}, []), view);
      await inPage(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await sleep(400);
      await choose();
      const other = await at(0);
      const d = ref.map((r, i) => (r !== other[i] ? r + "  →  " + other[i] : null)).filter(Boolean);
      if (d.length || ref.length !== other.length) bad.push(`choices made at the bottom of the page instead of the top: ${d.length} difference(s)`, ...d.slice(0, 4));
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("scroll", view, bad.length ? "fail" : "pass", bad.length ? "the tools change with the scroll position" : "the tools read the same at five scroll positions, and whether the choices were made at the top or the bottom of the page", bad);
  }
}

// Spec Tests item 2: the card and the share panel. Focus goes in, Tab and Shift+Tab stay in,
// Escape closes, focus comes back to the button that opened it, the page does not move.
async function checkOverlays() {
  for (const view of opts.views) {
    const bad = [];
    try {
      await openScenario(sc("overlays", {}, []), view);
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "country", UK);
      for (const o of [{ name: "card", el: "scOverlay", opener: "#letterSection .letter-secondary .link-btn:first-child" }, { name: "share panel", el: "shareOv", opener: ".h1-actions .btn-cta-out" }]) {
        await inPage((sel) => { const e = document.querySelector(sel); e.scrollIntoView({ block: "center", behavior: "instant" }); e.focus(); }, o.opener);
        const y0 = await inPage(() => scrollY);
        await press("Enter"); await sleep(500);
        const st = await inPage((id) => ({ open: document.getElementById(id).classList.contains("open"), inside: !!document.activeElement.closest("#" + id) }), o.el);
        if (!st.open || !st.inside) { bad.push(`${o.name}: Enter on its button ${st.open ? "opened it but focus stayed outside" : "did not open it"}`); continue; }
        for (const shift of [false, true]) for (let i = 0; i < 9; i++) { await press("Tab", shift); if (!(await inPage((id) => !!document.activeElement.closest("#" + id), o.el))) { bad.push(`${o.name}: ${shift ? "Shift+" : ""}Tab left it`); break; } }
        const close = await inPage((id) => { const b = document.querySelector("#" + id + " .sc-close, #" + id + " .share-close"); const r = b.getBoundingClientRect(); return { tag: b.tagName, w: r.width, h: r.height }; }, o.el);
        if (close.tag !== "BUTTON" || close.w < 44 || close.h < 44) bad.push(`${o.name}: Close is a ${close.tag} of ${Math.round(close.w)} × ${Math.round(close.h)} px`);
        await press("Escape"); await sleep(300);
        const back = await inPage((a) => ({ open: document.getElementById(a.el).classList.contains("open"), back: document.activeElement === document.querySelector(a.opener), y: scrollY }), o);
        if (back.open) bad.push(`${o.name}: Escape did not close it`);
        if (!back.back) bad.push(`${o.name}: focus did not come back to its button`);
        if (Math.abs(back.y - y0) > 2) bad.push(`${o.name}: the page moved ${Math.round(back.y - y0)} px behind it`);
      }
      // the download: the stand-in is asked to draw the card, flat, and the flat pose clears after
      await inPage(pageStep, "call", ["generateShareCard"]);
      await sleep(400);
      await inPage(pageWaitDownload);
      await sleep(300);
      const dl = await inPage(() => ({ files: window.__tc.downloads.map((d) => d.name), drew: window.__tc.canvas.map((c) => c.id), flat: document.getElementById("scOverlay").classList.contains("sc-flat") }));
      if (!dl.files.length) bad.push("Download PNG made no file");
      if (!dl.drew.includes("shareCard")) bad.push("the picture was not made from the card");
      if (dl.flat) bad.push("the card stayed flat after the picture was taken");
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("overlays", view, bad.length ? "fail" : "pass", bad.length ? `${bad.length} overlay problem(s)` : "card and share panel: focus in, Tab kept in, Escape closes, focus returns, page stays put; Download PNG makes the picture from the flat card", bad);
  }
}

// Spec Tests item 3: consent, on desktop. Unticked sends letter: null and keeps no letter
// anywhere; ticked sends the text the reader sees; an email is never taken without its box;
// the consent words are the old page's, byte for byte.
async function checkConsent() {
  const bad = [];
  const want = (ok, what) => { if (!ok) bad.push(what); };
  try {
    for (const tick of [false, true]) {
      await openScenario(sc("consent-" + tick, {}, []), "desktop");
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "country", UK);
      await inPage(pageStep, "editLetter", "TEST consent check");
      await inPage(pageStep, "consentLetter", tick);
      const shown = await inPage(() => document.getElementById("letterOutput").innerText.trim());
      await inPage(pageStep, "call", ["submitCoalition"]); await sleep(300);
      const sent = submitted(scene)[0];
      const kept = await inPage(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
      if (tick) want(sent && sent.letter === shown && sent.letter_consent === true, "ticked: the letter sent is not the letter shown");
      else {
        want(sent && sent.letter === null && sent.letter_consent === false, "unticked: letter is not null");
        want(!kept.includes("consent check"), "unticked: the letter was kept in the browser's storage");
      }
      await closeScenario(); scene = null;
    }
    for (const box of [false, true]) {
      await openScenario(sc("email-consent-" + box, {}, []), "desktop");
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "email", "tool-check@example.test");
      await inPage(pageStep, "consentEmail", box);
      await inPage(pageStep, "call", ["submitCoalition"]); await sleep(300);
      const sent = submitted(scene), form = formsent(scene), alerts = await inPage(() => window.__tc.alerts.length);
      if (box) want(sent.length === 1 && sent[0].email === "tool-check@example.test" && form.length === 1, "email with its box ticked: not sent as before");
      else want(sent.length === 0 && form.length === 0 && alerts === 1, `email without its box: ${sent.length} submission(s) and ${form.length} email form(s) went out (want none, and the reminder)`);
      await closeScenario(); scene = null;
    }
    // the words, as written in the page's source, old and new
    const oldHtml = execFileSync("git", ["show", `${OLD_COMMIT}:index.html`], { cwd: ROOT, maxBuffer: 1 << 26 }).toString();
    const newHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const label = (html, id) => { const i = html.indexOf(`id="${id}"`); const a = html.lastIndexOf("<label", i), b = html.indexOf("</label>", i); return a < 0 || b < 0 ? null : html.slice(a, b).replace(/\s+/g, " "); };
    for (const id of ["coalitionConsent", "letterConsent"]) want(label(oldHtml, id) && label(oldHtml, id) === label(newHtml, id), `the words of the ${id} label differ from the old page`);
    const ph = (html) => [...html.matchAll(/placeholder="([^"]*)"/g)].map((m) => m[1]).sort();
    want(JSON.stringify(ph(oldHtml)) === JSON.stringify(ph(newHtml)), "the placeholders differ from the old page");
  } catch (e) { bad.push("stopped: " + e.message); }
  await closeScenario(); scene = null;
  record("consent", "desktop", bad.length ? "fail" : "pass", bad.length ? `${bad.length} consent problem(s)` : "unticked sends letter: null and stores no letter; ticked sends the letter shown; no email without its box; consent words and placeholders are the old page's, character for character (line breaks and indents aside)", bad);
}

// Spec Tests item 2: the globe with WebGL (the real globe.gl) and with its still fallback,
// SHOW_SEEDED off and on.
async function checkGlobe(ctx) {
  const lib = REAL_LIBS.find((l) => l.name === "globe");
  for (const view of opts.views.filter((v) => v !== "short")) {
    for (const mode of lib.body ? ["webgl", "fallback"] : ["fallback"]) {
      for (const seeded of [false, true]) {
        await ctx.fresh();
        const bad = [], notes = [];
        const s = sc(`globe-${mode}`, { libs: mode === "webgl" ? ["globe"] : [], config: { SHOW_SEEDED: seeded } }, []);
        try {
          await openScenario(s, view);
          for (const i of A3) await inPage(pageStep, "cause", i);
          await inPage(pageStep, "country", UK);
          await inPage(() => document.getElementById("globeWrap").scrollIntoView({ block: "center", behavior: "instant" }));
          const ready = await waitFor(mode === "webgl" ? `!!document.querySelector('#globeWrap canvas')` : `!!document.querySelector('#globeWrap svg')`, 15000);
          if (!ready) { bad.push(mode === "webgl" ? "the 3D globe did not draw" : "the still globe did not draw"); throw new Error("no globe"); }
          await sleep(800);
          const st = await inPage(() => ({ drag: getComputedStyle(document.querySelector(".globe-drag")).display, bars: window.globeData().length, tab: document.getElementById("globeWrap").tabIndex }));
          if (seeded && !st.bars) bad.push("SHOW_SEEDED on, but no seeded globe sign-ups");
          if (!seeded && st.bars) bad.push(`SHOW_SEEDED off, but ${st.bars} invented globe sign-up(s)`);
          if (mode === "webgl") {
            if (st.drag === "none") bad.push("'Drag to spin.' is hidden on the 3D globe");
            // one drawing loop while it turns on screen (globe.gl's own, about 60 a second), not five:
            // the four clocks of its globe layer have nothing to animate here and stay paused (main.js globeQuiet)
            const fps = await inPage(async () => { const raf = window.requestAnimationFrame; let n = 0; window.requestAnimationFrame = function (f) { n++; return raf.call(window, f); }; await new Promise((r) => setTimeout(r, 1000)); if (window.requestAnimationFrame !== raf) window.requestAnimationFrame = raf; return n; });
            if (fps > 90) bad.push(`while it turns on screen the page asks for ${fps} frames a second (one loop is about 60)`);
            else notes.push(`turning on screen: ${fps} frame requests in a second (one loop)`);
            // the wheel over the globe scrolls the page (audit GLB-1), and a drag still spins it
            const c = await inPage(() => { const r = document.getElementById("globeWrap").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, sy: scrollY }; });
            await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: c.x, y: c.y, deltaX: 0, deltaY: 300 });
            await sleep(500);
            if ((await inPage(() => scrollY)) - c.sy < 100) bad.push("the mouse wheel over the globe does not scroll the page");
            const pov0 = await inPage(() => JSON.stringify(ToolView && globeInstance && globeInstance.pointOfView()));
            const c2 = await inPage(() => { const r = document.getElementById("globeWrap").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
            await drag(c2.x - 80, c2.y, c2.x + 80, c2.y);
            if ((await inPage(() => JSON.stringify(globeInstance.pointOfView()))) === pov0) bad.push("dragging does not spin the globe");
            // no drawing loop while it is off screen (audit: globe)
            await inPage(() => window.scrollTo({ top: 0, behavior: "instant" }));
            await sleep(1500);
            if (await inPage(() => globeRunning)) bad.push("the globe keeps drawing while off screen");
          } else if (st.drag !== "none") bad.push("'Drag to spin.' shows on the still globe, which cannot spin");
          // submit: the thanks line, and the reader's own bar
          await inPage(() => document.getElementById("globeWrap").scrollIntoView({ block: "center", behavior: "instant" }));
          await inPage(pageStep, "call", ["submitCoalition"]);
          await sleep(2200);
          const after = await inPage(() => ({ thanks: getComputedStyle(document.getElementById("coalitionThanks")).display !== "none", mine: window.globeData().some((p) => p.country === "United Kingdom") }));
          if (!after.thanks) bad.push("no thanks line after submitting");
          if (!after.mine) bad.push("the reader's country has no bar after submitting");
        } catch (e) { if (e.message !== "no globe") bad.push("stopped: " + e.message); }
        await closeScenario(); scene = null;
        record("globe", view, bad.length ? "fail" : "pass", `${mode === "webgl" ? "3D globe (real globe.gl)" : "still globe (no globe.gl)"}, SHOW_SEEDED ${seeded ? "on" : "off"}: ${bad.length ? bad.length + " problem(s)" : "draws, " + (mode === "webgl" ? "wheel scrolls the page, drag spins, stops off screen, " : "") + "the reader's bar after submitting"}`, [...bad, ...notes]);
      }
    }
    if (!lib.body) record("globe", view, "skip", `the 3D globe was not tested: globe.gl could not be fetched (${lib.error})`);
  }
}

// Spec Tests item 2: the Archive with WebGL (the real three.js) and without; past its preview
// (420 people, 23 approved letters) and in preview. The reader's sheet only with the opt-in.
async function checkArchive(ctx) {
  const lib = REAL_LIBS.find((l) => l.name === "three");
  const toRoom = async () => {
    await inPage(() => { document.getElementById("roomSection").scrollIntoView({ behavior: "instant" }); window.dispatchEvent(new Event("scroll")); });
    await waitFor(`document.getElementById('roomLoading').hidden || /3D graphics/.test(document.getElementById('roomLoading').textContent)`, 20000);
    await sleep(500);
  };
  const reader = () => inPage(() => ({ open: !document.getElementById("roomReader").hidden, at: document.activeElement.id || document.activeElement.className, meta: document.getElementById("roomReaderMeta").textContent, body: document.getElementById("roomReaderBody").textContent.slice(0, 80) }));
  for (const view of opts.views.filter((v) => v !== "short")) {
    for (const mode of lib.body ? ["webgl", "fallback"] : ["fallback"]) {
      await ctx.fresh();
      const bad = [];
      const want = (ok, what) => { if (!ok) bad.push(what); };
      try {
        // past the preview: the list of letters, by keyboard, and the reader dialog
        await openScenario(sc("archive-real-" + mode, { backend: "room", libs: mode === "webgl" ? ["three"] : [] }, []), view);
        await toRoom();
        const st = await inPage(() => ({ tab: document.getElementById("roomStage").getAttribute("tabindex"), msg: document.getElementById("roomLoading").textContent, people: document.getElementById("rdPeople").textContent, letters: document.getElementById("rdLetters").textContent, rows: document.querySelectorAll(".rl-row").length, badge: document.getElementById("roomBadge").hidden, hint: document.getElementById("roomHint").hidden }));
        want(st.people === "420" && st.letters === "23", `the Archive's figures are not the database's: ${st.people} people, ${st.letters} letters`);
        want(st.rows === 10 && st.badge, `past the preview: ${st.rows} letters listed (want 10 a page), badge ${st.badge ? "off" : "on"}`);
        if (mode === "webgl") {
          want(st.tab === "0", "the room is not a Tab stop");
          await inPage(() => document.querySelector(".room-cta-btn").focus());
          await tabTo(`document.activeElement.id === 'roomStage'`, 4);
          for (let i = 0; i < 4; i++) await press("ArrowRight");
          await press("Enter"); await sleep(300);
          const r = await reader();
          want(r.open && r.at === "roomReaderX", "Enter on the room did not open a sheet with focus on Close");
          await press("Tab"); want((await reader()).at === "roomReaderX", "Tab left the open letter");
          await press("Escape"); await sleep(200);
          const back = await reader();
          want(!back.open && back.at === "roomStage", "Escape did not close the letter and return focus to the room");
        } else {
          want(/3D graphics/.test(st.msg) && st.tab === null, "without 3D: no plain message, or the empty room is still a Tab stop");
          want(st.hint, "without 3D: 'drag to look around' still shows");
        }
        await inPage(() => document.querySelector(".rl-row").focus());
        await press("Enter"); await sleep(300);
        const r2 = await reader();
        want(r2.open && /^TEST letter number 1/.test(r2.body), "the first listed letter does not open with its own words");
        await press("Escape"); await sleep(200);
        want((await reader()).at === "rl-row", "focus did not return to the letter that was opened");
        await closeScenario(); scene = null;
        // preview: every sheet a sample, no list, the badge on; nothing invented
        await openScenario(sc("archive-preview-" + mode, { libs: mode === "webgl" ? ["three"] : [] }, []), view);
        await toRoom();
        const pv = await inPage(() => ({ list: document.getElementById("roomLetters").hidden, badge: document.getElementById("roomBadge").hidden ? "" : document.getElementById("roomBadge").textContent, people: document.getElementById("rdPeople").textContent }));
        want(pv.list && /PREVIEW/.test(pv.badge), "preview: the letters list shows, or the PREVIEW badge is missing");
        want(pv.people === "0", "preview: a count was invented: " + pv.people);
        await closeScenario(); scene = null;
        // the reader's own sheet: only with the letter opt-in, never with their words
        for (const tick of [false, true]) {
          await openScenario(sc("archive-mine-" + tick, { backend: "room", libs: mode === "webgl" ? ["three"] : [] }, []), view);
          for (const i of A3) await inPage(pageStep, "cause", i);
          await inPage(pageStep, "country", UK);
          await inPage(pageStep, "consentLetter", tick);
          await inPage(pageStep, "call", ["submitCoalition"]);
          await sleep(2200);
          await inPage(() => { if (document.getElementById("scOverlay").classList.contains("open")) window.closeCard(); });
          await toRoom();
          const mine = await inPage(() => ({ shown: !document.getElementById("roomMine").hidden, people: document.getElementById("rdPeople").textContent }));
          if (mode === "webgl") want(mine.shown === tick, `letter opt-in ${tick ? "ticked" : "unticked"}: the reader's sheet ${mine.shown ? "hangs" : "does not hang"}`);
          else want(!mine.shown, "without 3D the reader's sheet shows anyway");
          want(mine.people === "420", "the reader was added to the Archive's count: " + mine.people);
          await closeScenario(); scene = null;
        }
      } catch (e) { bad.push("stopped: " + e.message); }
      await closeScenario(); scene = null;
      record("archive", view, bad.length ? "fail" : "pass", `${mode === "webgl" ? "3D room (real three.js)" : "no 3D"}: ${bad.length ? bad.length + " problem(s)" : "keyboard path to the letters, reader dialog, preview honest, the reader's sheet only with the opt-in"}`, bad);
    }
    if (!lib.body) record("archive", view, "skip", `the 3D room was not tested: three.js could not be fetched (${lib.error})`);
  }
}

// The 3D globe and the 3D room on one page, in both orders, with the real libraries. The room's
// three.js (r160) used to sit on window.THREE, and globe.gl takes any window.THREE over its own copy:
// opened first, the Archive left the globe a still picture and logged 's3.Timer is not a constructor'.
async function checkTogether(ctx) {
  const libs = REAL_LIBS.filter((l) => l.name === "three" || l.name === "globe");
  for (const view of opts.views.filter((v) => v !== "short")) {
    if (libs.some((l) => !l.body)) { record("together", view, "skip", "three.js or globe.gl could not be fetched: not tested"); continue; }
    for (const order of ["archive-first", "globe-first"]) {
      await ctx.fresh();
      const bad = [], name = "together-" + order;
      const room = async () => {
        await inPage(() => { document.getElementById("roomSection").scrollIntoView({ behavior: "instant" }); window.dispatchEvent(new Event("scroll")); });
        if (!(await waitFor(`document.getElementById('roomLoading').hidden || /3D graphics/.test(document.getElementById('roomLoading').textContent)`, 25000))) bad.push("the room did not finish loading");
      };
      const globe = async () => {
        for (const i of A3) await inPage(pageStep, "cause", i);
        await inPage(pageStep, "country", UK);
        await inPage(() => document.getElementById("globeWrap").scrollIntoView({ block: "center", behavior: "instant" }));
        if (!(await waitFor(`!!document.querySelector('#globeWrap canvas') || document.getElementById('coalitionSection').classList.contains('is-flat')`, 25000))) bad.push("the globe did not finish loading");
      };
      try {
        await openScenario(sc(name, { libs: ["three", "globe"] }, []), view);
        if (order === "archive-first") { await room(); await globe(); } else { await globe(); await room(); }
        await sleep(1500);
        const st = await inPage(() => ({ globe3d: !!document.querySelector("#globeWrap canvas") && !document.getElementById("coalitionSection").classList.contains("is-flat"), room3d: document.getElementById("roomLoading").hidden && !document.querySelector(".room-hall").classList.contains("no-3d"), THREE: typeof window.THREE }));
        if (!st.globe3d) bad.push("no 3D globe (the still picture instead)");
        if (!st.room3d) bad.push("no 3D room (the no-3D layout instead)");
        if (st.THREE !== "undefined") bad.push("the room's three.js is left on window.THREE, where globe.gl would take it");
        const errs = consoleErrors.filter((e) => e.scenario === name).map((e) => e.text);
        if (errs.length) bad.push("console errors: " + [...new Set(errs)].join(" | "));
      } catch (e) { bad.push("stopped: " + e.message); }
      await closeScenario(); scene = null;
      record("together", view, bad.length ? "fail" : "pass", `${order === "archive-first" ? "Archive first, then the globe" : "globe first, then the Archive"} (real three.js and globe.gl): ${bad.length ? bad.length + " problem(s)" : "3D globe and 3D room, no console error"}`, bad);
    }
  }
}

// Does the ring of the focused element show whole, or does a box around it cut it off?
function pageRingClipped() {
  const a = document.activeElement, cs = getComputedStyle(a), o = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth), r = a.getBoundingClientRect();
  for (let p = a.parentElement; p && p !== document.body; p = p.parentElement) {
    const s = getComputedStyle(p);
    if (s.overflowX === "visible" && s.overflowY === "visible") continue;
    const q = p.getBoundingClientRect();
    if (r.left - o < q.left - 0.5 || r.right + o > q.right + 0.5 || r.top - o < q.top - 0.5 || r.bottom + o > q.bottom + 0.5) return p.id ? "#" + p.id : p.className.split(" ")[0];
  }
  return null;
}

// No 3D, three ways, desktop and phone. (1) A browser with 3D really switched off: neither three.js
// nor globe.gl is downloaded, the still globe and the no-3D Archive show, nothing logs an error.
// (2) A browser with 3D whose three.js comes back empty. In both, Tab (not Enter) from 'Enter the
// archive' into a room that has not started: focus lands on the room's message, ring whole, never on
// the page itself, and the next Tab goes on to the letters. (3) Both libraries stalled: after 15 s the
// still globe and the no-3D Archive, without their waiting words or drag hints; arriving late, they
// change nothing.
async function checkNo3d(ctx) {
  for (const view of opts.views.filter((v) => v !== "short")) {
    for (const kind of ["3D switched off", "three.js empty"]) {
      await ctx.fresh(kind === "3D switched off" ? ["--disable-3d-apis", "--disable-webgl"] : []);
      const bad = [], name = "no3d-" + kind.split(" ")[0];
      const want = (ok, what) => { if (!ok) bad.push(what); };
      try {
        await openScenario(sc(name, { backend: "room", libs: kind === "3D switched off" ? ["three", "globe"] : ["globe"] }, []), view);
        const gl = await inPage(() => { const c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); });
        if (kind === "3D switched off" && gl) { record("no3d", view, "skip", "this Chrome still offers 3D with it switched off: not tested"); await closeScenario(); scene = null; continue; }
        // Tab, not Enter, from the link into a room that has not started (nothing has scrolled near it yet)
        want(await inPage(() => !document.getElementById("roomLoading").hidden && document.getElementById("roomStage").getAttribute("tabindex") === "0"), "the room started before the reader reached it");
        await inPage(() => { const e = document.querySelector(".room-cta-btn"); e.scrollIntoView({ block: "end", behavior: "instant" }); e.focus({ preventScroll: true }); });
        await sleep(400);
        await press("Tab");
        want(await waitFor(`document.activeElement.id === 'roomLoading'`, 8000), "after Tab onto the room, focus did not move to its message: " + JSON.stringify((await inPage(pageFocus)).desc));
        const f = await inPage(pageFocus), clip = await inPage(pageRingClipped);
        const st = await inPage(() => ({ msg: document.getElementById("roomLoading").textContent, tab: document.getElementById("roomStage").getAttribute("tabindex"), role: document.getElementById("roomStage").getAttribute("role"), hint: getComputedStyle(document.getElementById("roomHint")).display }));
        want(f.ring && f.standard === true, `the message has focus but not the standard ring (${f.style})`);
        want(!clip, "the message's focus ring is cut off by " + clip);
        want(/3D graphics/.test(st.msg) && st.tab === null && st.role === null && st.hint === "none", "without 3D the room is still a Tab stop, an application, or keeps 'drag to look around'");
        // the keyboard path to the letters goes on from there
        const next = await tabTo(`document.activeElement.classList.contains('rl-row')`, 3);
        want(next && /rl-row/.test(next.desc), "Tab from the message does not reach the letters: " + (next ? next.desc : "nothing"));
        await press("Enter"); await sleep(300);
        want(await inPage(() => !document.getElementById("roomReader").hidden && /^TEST letter number 1/.test(document.getElementById("roomReaderBody").textContent)), "Enter on the first letter did not open it");
        await press("Escape"); await sleep(200);
        want(await inPage(() => document.activeElement.classList.contains("rl-row")), "Escape did not return focus to the letter");
        if (kind === "3D switched off") {
          for (const i of A3) await inPage(pageStep, "cause", i);
          await inPage(() => document.getElementById("globeWrap").scrollIntoView({ block: "center", behavior: "instant" }));
          want(await waitFor(`document.getElementById('coalitionSection').classList.contains('is-flat')`, 8000), "no still globe");
          const g = await inPage(() => ({ drag: getComputedStyle(document.querySelector(".globe-drag")).display, waiting: !!document.getElementById("globeLoading") && getComputedStyle(document.getElementById("globeLoading")).display !== "none" }));
          want(g.drag === "none" && !g.waiting, "the still globe keeps 'Drag to spin.' or 'rendering the globe…'");
        }
        const asked = net.stubbed.filter((r) => r.scenario === name && /three@|globe\.gl/.test(r.url)).map((r) => r.url.replace(/^.*\/npm\//, ""));
        if (kind === "3D switched off") want(!asked.length, "with no 3D the page still downloaded " + asked.join(", "));
        const errs = consoleErrors.filter((e) => e.scenario === name).map((e) => e.text);
        want(!errs.length, "console errors: " + [...new Set(errs)].join(" | "));
      } catch (e) { bad.push("stopped: " + e.message); }
      await closeScenario(); scene = null;
      record("no3d", view, bad.length ? "fail" : "pass", `${kind === "3D switched off" ? "a browser with 3D switched off (real libraries offered)" : "three.js arrives empty"}: ${bad.length ? bad.length + " problem(s)" : (kind === "3D switched off" ? "nothing 3D downloaded, still globe, no-3D Archive, " : "") + "Tab onto the room lands on its message with a whole ring, then on to the letters; no console error"}`, bad);
    }
    // (3) stalled downloads, then a late arrival
    await ctx.fresh();
    const bad = [], name = "no3d-stall", t0 = Date.now();
    const want = (ok, what) => { if (!ok) bad.push(what); };
    try {
      await openScenario(sc(name, { libs: ["three", "globe"], delay: { three: 24000, globe: 24000 } }, []), view);
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(() => document.getElementById("globeWrap").scrollIntoView({ block: "center", behavior: "instant" }));
      await sleep(600);
      await inPage(() => { document.getElementById("roomStage").scrollIntoView({ block: "center", behavior: "instant" }); window.dispatchEvent(new Event("scroll")); });
      const asked = Date.now();
      const fell = await waitFor(`document.getElementById('coalitionSection').classList.contains('is-flat') && document.querySelector('.room-hall').classList.contains('no-3d')`, 21000);
      const early = scene.delivered.length;
      const st = await inPage(() => {
        const shown = (e) => !!e && !e.hidden && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden";
        return { globeWords: shown(document.getElementById("globeLoading")), globeHint: shown(document.querySelector(".globe-drag")), roomHint: shown(document.getElementById("roomHint")), roomKeys: shown(document.getElementById("roomKeys")), roomMsg: document.getElementById("roomLoading").textContent, tab: document.getElementById("roomStage").getAttribute("tabindex") };
      });
      want(fell && !early, `the still globe and the no-3D Archive did not take over before the libraries arrived (after ${Math.round((Date.now() - asked) / 1000)} s)`);
      want(!st.globeWords && !st.globeHint, "the still globe keeps 'rendering the globe…' or 'Drag to spin.'");
      want(!st.roomHint && !st.roomKeys && /3D graphics/.test(st.roomMsg) && st.tab === null, "the Archive keeps 'entering the archive…', a drag hint or its Tab stop");
      // the late arrival changes nothing, and the tools answer as ever
      for (let i = 0; i < 60 && scene.delivered.length < 2; i++) await sleep(500);
      await sleep(2500);
      const late = await inPage(() => ({ globe3d: !!document.querySelector("#globeWrap canvas"), flat: document.getElementById("coalitionSection").classList.contains("is-flat"), no3d: document.querySelector(".room-hall").classList.contains("no-3d"), built: document.getElementById("roomLoading").hidden, THREE: typeof window.THREE, cause: (document.getElementById("ix2").click(), document.getElementById("tiCount").textContent) }));
      want(scene.delivered.length === 2, "the late libraries never arrived, so the late arrival was not tested");
      want(!late.globe3d && late.flat && late.no3d && !late.built, "a late arrival changed the still globe or the no-3D Archive");
      want(late.THREE === "undefined", "a late three.js was left on window.THREE");
      want(/^4\b/.test(late.cause), "choosing a fourth cause after the stall did not register: " + late.cause);
      const errs = consoleErrors.filter((e) => e.scenario === name).map((e) => e.text);
      want(!errs.length, "console errors: " + [...new Set(errs)].join(" | "));
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("no3d", view, bad.length ? "fail" : "pass", `three.js and globe.gl stalled: ${bad.length ? bad.length + " problem(s)" : "after 15 s the still globe and the no-3D Archive, waiting words and drag hints gone; arriving after that, they change nothing (" + Math.round((Date.now() - t0) / 1000) + " s)"}`, bad);
  }
}

// Spec Tests item 4, in the page: deep links, no sideways scroll, brand, taps, every old link.
function pageWide() {
  const vw = document.documentElement.clientWidth;
  const clipped = (e) => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) if (/hidden|clip|auto|scroll/.test(getComputedStyle(n).overflowX)) return true; return false; };
  const out = [...document.querySelectorAll("body *")].filter((e) => !e.closest("#story") && e.getClientRects().length && (e.getBoundingClientRect().right > vw + 1 || e.getBoundingClientRect().left < -1) && !clipped(e));
  return { sw: document.documentElement.scrollWidth, vw, out: out.slice(0, 5).map((e) => (e.id ? "#" + e.id : e.tagName.toLowerCase() + "." + String(e.className.baseVal ?? e.className).split(" ")[0]) + " to " + Math.round(e.getBoundingClientRect().right)) };
}
// Brand (brief §5): only the three families; colours only the ground, white, greys and the four
// brand colours (red, blue, ember, deep blue); no red or blue page background.
function pageBrand() {
  const FAM = /^"?(Archivo Black|IBM Plex Sans|IBM Plex Mono)"?$/;
  const BRAND = [[232, 54, 43], [60, 143, 222], [143, 27, 20], [14, 42, 68]];
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const ok = (c) => { const p = parse(c); if (!p || p.a === 0) return true; const sat = Math.max(p.r, p.g, p.b) - Math.min(p.r, p.g, p.b); return sat <= 24 || BRAND.some(([r, g, b]) => Math.abs(r - p.r) + Math.abs(g - p.g) + Math.abs(b - p.b) <= 12); };
  const fonts = new Set(), colours = new Set(), bigBacks = [];
  const vw = innerWidth, vh = innerHeight;
  let n = document.getElementById("story").nextElementSibling;
  for (; n; n = n.nextElementSibling) for (const e of [n, ...n.querySelectorAll("*")]) {
    if (!e.getClientRects().length || e.closest("svg") || e.tagName === "CANVAS" || e.tagName === "SCRIPT") continue;
    const cs = getComputedStyle(e);
    if (cs.visibility === "hidden") continue;
    const fam = cs.fontFamily.split(",")[0].trim();
    if (e.textContent.trim() && !FAM.test(fam)) fonts.add(fam + " on " + (e.id || e.className || e.tagName));
    for (const prop of ["color", "backgroundColor", "borderTopColor", "outlineColor"]) if (!ok(cs[prop]) && (prop !== "borderTopColor" || parseFloat(cs.borderTopWidth) > 0)) colours.add(`${cs[prop]} (${prop}) on ${e.id || String(e.className).split(" ")[0] || e.tagName}`);
    const r = e.getBoundingClientRect(), p = parse(cs.backgroundColor);
    if (p && p.a > 0.5 && r.width > vw * 0.9 && r.height > vh * 0.5 && (Math.abs(p.r - 232) + Math.abs(p.g - 54) + Math.abs(p.b - 43) < 40 || Math.abs(p.r - 60) + Math.abs(p.g - 143) + Math.abs(p.b - 222) < 40)) bigBacks.push(e.id || e.className);
  }
  return { fonts: [...fonts].slice(0, 8), colours: [...colours].slice(0, 12), bigBacks, body: getComputedStyle(document.body).backgroundColor };
}
// Every control in the tools at least 44 px. Links inside running text (a sentence, a source
// list) are exempt, as WCAG 2.5.8 allows; they are counted, not failed.
function pageTaps() {
  const small = [];
  let inline = 0;
  document.querySelectorAll("#story ~ * :is(button, a[href], input, select, summary, [tabindex='0'])").forEach((e) => {
    if (!e.getClientRects().length || getComputedStyle(e).visibility === "hidden" || e.closest(".sc-overlay:not(.open), .share-ov:not(.open), [hidden]")) return;
    const r = e.getBoundingClientRect();
    if (r.width >= 44 && r.height >= 44) return;
    if (e.tagName === "A" && e.closest("p, label, .letter-contact-note, .country-card, footer")) { inline++; return; }
    if (e.type === "checkbox" && e.closest("label") && e.closest("label").getBoundingClientRect().height >= 44) return;
    small.push(`${e.id ? "#" + e.id : e.tagName.toLowerCase() + "." + String(e.className).split(" ")[0]} “${(e.textContent || e.value || "").trim().slice(0, 20)}” ${Math.round(r.width)} × ${Math.round(r.height)}`);
  });
  return { small: [...new Set(small)], inline };
}

async function checkPage(ctx) {
  // deep links, on desktop and the phone
  for (const view of opts.views.filter((v) => v !== "short")) {
    const bad = [];
    for (const [hash, query] of [["#machine"], ["#impact"], ["#haveyoursay"], ["#roomSection"], ["#haveyoursay", "static=1"], ["#roomSection", "static=1"]]) {
      try {
        await openScenario(sc("deep-" + hash, { hash, query }, []), view);
        await sleep(1200 * PATIENCE);
        const t = await inPage((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top) : null; }, hash.slice(1));
        if (t === null || t < -4 || t > 160) bad.push(`${query ? "?" + query : ""}${hash}: the target sits at ${t} px from the top`);
      } catch (e) { bad.push(`${hash}: stopped, ${e.message}`); }
      await closeScenario(); scene = null;
    }
    record("deeplinks", view, bad.length ? "fail" : "pass", bad.length ? "a deep link misses" : "#machine, #impact, #haveyoursay, #roomSection and ?static=1 land where they should", bad);
  }
  // A reader who came by a link into the tools, moved 3,000 px with the wheel and reloads: the browser
  // puts them back (scroll restoration), and the link must not pull them back to its target (round 4
  // regression). Each case runs twice: through the link, and as the same page opened without it and
  // scrolled to the same place. Through the link the reader must come back where they were, or at least
  // where the browser puts them without the link, and never at the link's target. (On the 375 × 812
  // phone with the tools locked, Chrome's own restoring can land 1,000 to 1,600 px away, with or without
  // the link and with or without js/main.js's landing code: measured in round 5. That is the browser's,
  // so it is noted, not failed.) The real GSAP, so the story behaves as on a phone.
  const reloadAt = async (view, hash, query, dy, viaLink) => {
    await openScenario(sc("deep-reload-" + hash + (viaLink ? "" : "-nolink"), { hash: viaLink ? hash : undefined, query, libs: ["gsap"] }, []), view);
    await sleep(1200 * PATIENCE);
    if (!viaLink) { await inPage((id) => document.getElementById(id).scrollIntoView({ behavior: "instant" }), hash.slice(1)); await sleep(1200 * PATIENCE); }
    const y0 = await inPage(() => Math.round(scrollY));
    for (let i = 0; i < 6; i++) { await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: VIEWS[view].w / 2, y: VIEWS[view].h / 2, deltaX: 0, deltaY: dy }); await sleep(150); }
    await sleep(1500 * PATIENCE);
    const y1 = await inPage(() => Math.round(scrollY));
    const ev = cdp.waitEvent("Page.loadEventFired");
    ev.catch(() => {});
    await cdp.send("Page.reload", {});
    await ev;
    await inPage(pageSettle);
    await sleep(2500 * PATIENCE);
    const r = await inPage((id) => ({ y: Math.round(scrollY), target: Math.round(document.getElementById(id).getBoundingClientRect().top) }), hash.slice(1));
    await closeScenario(); scene = null;
    return { moved: y1 - y0, off: r.y - y1, target: r.target };
  };
  for (const view of opts.views.filter((v) => v !== "short")) {
    const bad = [], notes = [];
    await ctx.fresh();
    for (const [hash, query, dy] of [["#haveyoursay", undefined, 500], ["#roomSection", undefined, -500], ["#roomSection", "static=1", -500]]) {
      const name = `${query ? "?" + query : ""}${hash}`;
      try {
        const a = await reloadAt(view, hash, query, dy, true);
        if (Math.abs(a.moved) < 1000) { bad.push(`${name}: the wheel moved the page only ${a.moved} px`); continue; }
        const b = await reloadAt(view, hash, query, dy, false);
        const pulled = Math.abs(a.target) <= 40 && Math.abs(a.off) > 40;
        const twin = b.off ? ` (the same page opened without the link: ${b.off} px, the browser's own restoring)` : "";
        if (pulled || (Math.abs(a.off) > 40 && Math.abs(a.off - b.off) > 40)) bad.push(`${name}: moved ${a.moved} px and reloaded: ${a.off} px from where the reader was${pulled ? ", back at the link's target" : ""}; the same page opened without the link: ${b.off} px`);
        else notes.push(`${name}: moved ${a.moved} px, reloaded, ${Math.abs(a.off) <= 40 ? "still there" : a.off + " px from where the reader was, as without the link"}${twin}`);
      } catch (e) { bad.push(`${name}: stopped, ${e.message}`); await closeScenario(); scene = null; }
    }
    record("deeplinks", view, bad.length ? "fail" : "pass", bad.length ? "a reload after a deep link moves the reader" : "after a deep link into the tools, a move and a reload, the reader is where the browser puts them without the link, never pulled back to its target", [...bad, ...notes]);
  }
  // no sideways scroll: nine widths, five places each, with choices made
  {
    await ctx.fresh();
    const bad = [];
    for (const [w, h, mobile] of [[1920, 1080, false], [1440, 900, false], [1280, 720, false], [1024, 768, false], [820, 1180, true], [800, 600, false], [390, 664, true], [375, 812, true], [320, 568, true]]) {
      try {
        VIEWS.probe = { w, h, dpr: mobile ? 2 : 1, mobile };
        await openScenario(sc("wide", {}, []), "probe");
        for (const i of A3) await inPage(pageStep, "cause", i);
        await inPage(pageStep, "country", UK);
        for (const id of ["haveyoursay", "countrySection", "letterSection", "coalitionSection", "roomSection"]) {
          await inPage((id) => document.getElementById(id).scrollIntoView({ behavior: "instant" }), id);
          await sleep(150);
          const r = await inPage(pageWide);
          if (r.sw > r.vw || r.out.length) bad.push(`${w} × ${h} at #${id}: page ${r.sw} px wide in ${r.vw}; ${r.out.join(", ")}`);
        }
      } catch (e) { bad.push(`${w} × ${h}: stopped, ${e.message}`); }
      await closeScenario(); scene = null;
    }
    delete VIEWS.probe;
    record("sideways", "all", bad.length ? "fail" : "pass", bad.length ? "something reaches past the screen's edge" : "no sideways scroll at 1920, 1440, 1280, 1024, 820, 800, 390, 375 or 320 px wide, at five places down the tools", bad);
  }
  // brand and tap sizes, in every view, before and after choices
  for (const view of opts.views) {
    await ctx.fresh();
    const bad = [], notes = [];
    try {
      await openScenario(sc("brand", {}, []), view);
      for (const phase of ["before", "after"]) {
        if (phase === "after") { for (const i of A3) await inPage(pageStep, "cause", i); await inPage(pageStep, "country", UK); await inPage(pageStep, "call", ["generateShareCard"]); await sleep(500); }
        const b = await inPage(pageBrand);
        b.fonts.forEach((f) => bad.push(`${phase} choices, off-brand font: ${f}`));
        b.colours.forEach((c) => bad.push(`${phase} choices, off-brand colour: ${c}`));
        b.bigBacks.forEach((c) => bad.push(`${phase} choices, red or blue page background on ${c}`));
        if (phase === "after") await inPage(pageStep, "call", ["closeCard"]);
        const t = await inPage(pageTaps);
        t.small.forEach((x) => bad.push(`${phase} choices, under 44 px: ${x}`));
        notes.push(`${phase} choices: ${t.inline} link(s) inside running text, exempt from the 44 px rule`);
      }
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("brand", view, bad.length ? "fail" : "pass", bad.length ? `${bad.length} brand or tap-size problem(s)` : "only Archivo Black, IBM Plex Sans and IBM Plex Mono; only ground, white, greys and the four brand colours; no red or blue page background; every control at least 44 px", [...bad, ...notes]);
  }
  // every link of the old page is still on the new one; no figure in the tools that the old ones lacked
  {
    const old = JSON.parse(fs.readFileSync(OLD_LINKS, "utf8"));
    const bad = [], notes = [];
    await ctx.fresh();
    try {
      await openScenario(sc("links", {}, []), "desktop");
      const seen = new Set([...(await inPage(pageLinks)), ...(await inPage(pageSweepLinks))].map((l) => l.raw));
      const targets = await inPage((ids) => ids.filter((id) => !document.getElementById(id)), old.deepLinks.map((l) => l.url.slice(1)).filter(Boolean));
      if (targets.length) bad.push(...targets.map((t) => `deep link #${t}: nothing on the page has this id`));
      else notes.push(`deep links: all ${old.deepLinks.filter((l) => l.url.length > 1).length} targets present (the old contents nav that linked to #machine and #impact is gone, flagged)`);
      for (const group of ["sources", "contacts", "credits", "internal", "mailto"]) {
        const missing = old[group].filter((l) => !seen.has(l.url));
        if (missing.length) bad.push(...missing.map((l) => `${group}: missing ${l.url} (“${l.text[0] || ""}”)`));
        else notes.push(`${group}: all ${old[group].length} present`);
      }
      await closeScenario(); scene = null;
      await openScenario(sc("figures", {}, []), "desktop");
      const allowed = new Set([...old.toolFigures.printedBeforeAnyChoice, ...old.toolFigures.printedAfterChoices]);
      const shown = new Set();
      // text piece by piece, so the rank badges 1, 2, 3 do not run together into "123"
      const read = async () => figuresIn(await inPage(() => { const t = []; let n = document.getElementById("story").nextElementSibling; for (; n; n = n.nextElementSibling) { const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT, { acceptNode: (x) => (x.parentElement.closest("script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) }); for (let x; (x = w.nextNode()); ) t.push(x.data); } document.querySelectorAll("#story ~ * [data-t]").forEach((e) => t.push(e.getAttribute("data-t"))); return t.join(" "); }), shown);
      await read();
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "country", UK);
      await read();
      // the Archive's page label and the step and rank numbers are counters, not figures
      const isCounter = (f) => /^\d{1,2}$/.test(f) || /^0\d$/.test(f);
      // new words already in the review notes, which carry a number but no figure (none now: the Archive
      // inset's caption is 'FIG. 1' alone, since its '×2.5' was a ratio the close-up did not have)
      const FLAGGED = {};
      const extra = [...shown].filter((f) => !allowed.has(f) && !isCounter(f) && !FLAGGED[f]);
      [...shown].filter((f) => FLAGGED[f]).forEach((f) => notes.push(`not a figure, flagged as new words: ${FLAGGED[f]}`));
      if (extra.length) bad.push(`figures in the tools that the old tools never printed: ${extra.join(", ")}`);
      else notes.push(`${shown.size} figures read in the tools, every one printed by the old tools (or a step or rank number)`);
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("links", "desktop", bad.length ? "fail" : "pass", bad.length ? "a link or a figure differs from the old page" : "every source, contact, credit and own-page link of the old page is still here; no new figure in the tools", [...bad, ...notes]);
  }
  // rotation: a phone turned on its side and back, with a typed letter, below the story
  {
    const bad = [];
    await ctx.fresh();
    try {
      // the real GSAP here, so the story behaves as on a reader's phone
      await openScenario(sc("rotate", { libs: ["gsap"] }, []), "phone");
      await inPage(() => { window.__notReloaded = true; });
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "editLetter", "TEST");
      await inPage(() => document.getElementById("letterOutput").dispatchEvent(new Event("input", { bubbles: true })));
      await inPage(() => document.getElementById("letterSection").scrollIntoView({ behavior: "instant" }));
      for (const [w, h, angle, type] of [[812, 375, 90, "landscapePrimary"], [375, 812, 0, "portraitPrimary"]]) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: { angle, type } });
        await sleep(1500 * PATIENCE);
        const r = await inPage(() => ({ same: !!window.__notReloaded, letter: document.getElementById("letterOutput").innerText.trim() }));
        if (!r.same) bad.push(`turned to ${w} × ${h}: the page reloaded`);
        if (r.letter !== "TEST") bad.push(`turned to ${w} × ${h}: the typed letter was lost`);
      }
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("rotate", "phone", bad.length ? "fail" : "pass", bad.length ? "turning the phone cost the reader something" : "turning a phone to 812 × 375 and back, below the story with a typed letter: no reload, letter kept", bad);
  }
  // the caret: typing at the end of the letter (taller than the screen), then turning the phone or tablet,
  // the line being typed stays on screen (keeping only the letter's top left it below the screen)
  {
    const bad = [];
    await ctx.fresh();
    const caret = () => inPage(() => {
      const s = getSelection(), r = document.createRange();
      r.setStart(s.focusNode, s.focusOffset);
      const q = r.getClientRects()[0] || (s.focusNode.nodeType === 1 ? s.focusNode : s.focusNode.parentElement).getBoundingClientRect();
      return { top: Math.round(q.top), bottom: Math.round(q.bottom), h: innerHeight, inLetter: document.getElementById("letterOutput").contains(s.focusNode), active: document.activeElement.id };
    });
    try {
      for (const [w, h, dpr] of [[430, 932, 3], [820, 1180, 2]]) {
        await openScenario(sc("caret", { libs: ["gsap"] }, []), "phone");
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: { angle: 0, type: "portraitPrimary" } });
        await sleep(1200 * PATIENCE);
        for (const i of A3) await inPage(pageStep, "cause", i);
        await inPage(pageStep, "country", UK);
        await inPage(() => { const e = document.getElementById("letterOutput"), s = getSelection(); e.focus(); s.selectAllChildren(e); s.collapseToEnd(); });
        await cdp.send("Input.insertText", { text: " TEST" });
        await sleep(500);
        const c0 = await caret();
        if (!c0.inLetter || c0.top < 0 || c0.bottom > c0.h) { bad.push(`${w} × ${h}: the caret was not on screen before turning (${JSON.stringify(c0)})`); continue; }
        for (const [W, H, angle, type] of [[h, w, 90, "landscapePrimary"], [w, h, 0, "portraitPrimary"]]) {
          await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: dpr, mobile: true, screenWidth: W, screenHeight: H, screenOrientation: { angle, type } });
          await sleep(1500 * PATIENCE);
          const c = await caret();
          if (c.active !== "letterOutput" || !c.inLetter) bad.push(`${w} × ${h} turned to ${W} × ${H}: the reader is no longer in the letter`);
          else if (c.top < 0 || c.bottom > c.h) bad.push(`${w} × ${h} turned to ${W} × ${H}: the line being typed is off screen (${c.top} to ${c.bottom} px on a ${c.h} px screen)`);
        }
        if (!/ TEST\s*$/.test(await inPage(() => document.getElementById("letterOutput").innerText))) bad.push(`${w} × ${h}: the typed words were lost`);
        await closeScenario();
      }
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("caret", "phone", bad.length ? "fail" : "pass", bad.length ? "turning the device moved the line being typed off screen" : "typing at the end of the letter, then turning a 430 × 932 phone and an 820 × 1180 tablet and back: the line being typed stays on screen", bad);
  }
  // the letter's contact link: every line of it is a tap at least 44 px high (hit-tested), at widths where
  // it sits on one line and where it wraps; a measure of the whole link hid a 42 px line before
  {
    const bad = [], seen = [];
    await ctx.fresh();
    try {
      await openScenario(sc("contact", {}, []), "desktop");
      for (const i of A3) await inPage(pageStep, "cause", i);
      await inPage(pageStep, "country", UK);
      for (const [w, h, m] of [[320, 568, true], [375, 812, true], [430, 932, true], [600, 960, true], [768, 1024, true], [900, 700, false], [1023, 768, false], [1280, 800, false], [1440, 900, false]]) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: m ? 2 : 1, mobile: m, screenWidth: w, screenHeight: h });
        await sleep(500 * PATIENCE);
        const r = await inPage(() => {
          const a = document.querySelector("#letterContactNote a");
          if (!a) return null;
          a.scrollIntoView({ block: "center", behavior: "instant" });
          return [...a.getClientRects()].map((q) => {
            const x = q.left + q.width / 2; let top = null, bot = null;
            for (let y = Math.floor(q.top) - 30; y <= Math.ceil(q.bottom) + 30; y++) { const e = document.elementFromPoint(x, y); if (e && (e === a || a.contains(e))) { if (top === null) top = y; bot = y; } else if (top !== null) break; }
            return top === null ? 0 : bot - top + 1;
          });
        });
        if (!r) { bad.push(`${w} × ${h}: no contact link`); continue; }
        seen.push(`${w}: ${r.join("+")}`);
        if (r.some((x) => x < 44)) bad.push(`${w} × ${h}: a line of the contact link is a tap of ${Math.min(...r)} px`);
      }
    } catch (e) { bad.push("stopped: " + e.message); }
    await closeScenario(); scene = null;
    record("contact", "all", bad.length ? "fail" : "pass", bad.length ? "the contact link has a line under 44 px" : `every line of the contact link is a tap of at least 44 px (px per line, by width: ${seen.join(", ")}; this run has no brand fonts, so a fallback font sets the height)`, bad);
  }
}

// Spec Tests item 4, in the files: no Anton, plain Archivo, amber, cyan or purple, and none of the
// old page's colours, in anything index.html ships (its own scripts and styles, and what they load).
function checkCode() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const local = [...html.matchAll(/(?:src|href)="([^"#:]+?\.(?:js|css))(?:\?[^"]*)?"/g)].map((m) => m[1]);
  const files = ["index.html", ...new Set(local)];
  const RULES = [[/\bAnton\b/, "Anton"], [/\bArchivo(?!\s*Black|\+Black)\b/, "plain Archivo"], [/\bamber\b/i, "amber"], [/\bcyan\b/i, "cyan"], [/\bpurple\b/i, "purple"], [/\bteal\b/i, "teal"], [/#ff3b30\b/i, "old red #ff3b30"], [/#31d0d6\b/i, "old cyan #31d0d6"], [/#ffb020\b/i, "old amber #ffb020"]];
  // Every strong colour code too (saturated, neither near black nor near white) that is not a brand
  // token from css/story.css. js/data.js is read only and holds the old page's chart colours: no
  // shipped code reads its colour fields, so there they are listed as present, not used.
  const BRAND = new Set(["e8362b", "3c8fde", "8f1b14", "0e2a44"]);
  const strong = (hex) => { const v = [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255), mx = Math.max(...v), mn = Math.min(...v), l = (mx + mn) / 2, d = mx - mn, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0; return s > 0.3 && l > 0.15 && l < 0.92; };
  const bad = [], unused = [];
  for (const f of files) {
    if (!fs.existsSync(path.join(ROOT, f))) { bad.push(`${f}: index.html loads it, but it does not exist`); continue; }
    fs.readFileSync(path.join(ROOT, f), "utf8").split("\n").forEach((line, i) => {
      for (const [re, what] of RULES) if (re.test(line)) bad.push(`${f}:${i + 1}: ${what}`);
      // #rrggbb, #rrggbbaa, #rgb and rgb()/rgba(), each read as its six-digit colour
      const codes = [
        ...[...line.matchAll(/#([0-9a-f]{6})(?:[0-9a-f]{2})?\b/gi)].map((m) => [m[0], m[1]]),
        ...[...line.matchAll(/#([0-9a-f]{3})\b/gi)].map((m) => [m[0], [...m[1]].map((c) => c + c).join("")]),
        ...[...line.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/gi)].map((m) => [m[0] + ")", [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, "0")).join("")]),
      ];
      for (const [code, six] of codes) {
        const hex = six.toLowerCase();
        if (BRAND.has(hex) || !strong(hex)) continue;
        (f === "js/data.js" ? unused : bad).push(`${f}:${i + 1}: off-brand colour ${code}`);
      }
    });
  }
  record("code", "files", bad.length ? "fail" : "pass", bad.length ? `${bad.length} old font or colour name(s) left` : `no Anton, plain Archivo, amber, cyan, purple or off-brand colour in the ${files.length} files the page ships (js/data.js aside: ${unused.length} old colour codes present, not used)`, [...bad, ...unused.map((u) => "present, not used (data.js is read only; nothing reads these): " + u), "not scanned: css/style.css, which only privacy.html (read only) still loads"]);
}

// Spec Tests item 4: report the old page's links that do not answer. This script asks each one
// once (the page is not involved); a refusal such as 403 still counts as an answer.
async function checkLinkAnswers() {
  const old = JSON.parse(fs.readFileSync(OLD_LINKS, "utf8"));
  const urls = [...new Set([...old.sources, ...old.contacts, ...old.credits].map((l) => l.url))].filter((u) => /^https?:/.test(u) && !/supabase\.co|formsubmit\.co|challenges\.cloudflare\.com/.test(u));
  const silent = [], refused = [];
  let i = 0;
  const ask = async (u) => {
    for (const method of ["HEAD", "GET"]) {
      try {
        const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "user-agent": "Mozilla/5.0 (link check for The Cost of War)" } });
        if (r.status >= 400 && method === "HEAD") continue;
        if (r.status >= 400) refused.push(`${r.status} ${u}`);
        return;
      } catch (e) { if (method === "GET") silent.push(`${u} (${e.cause?.code || e.name})`); }
    }
  };
  await Promise.all(Array.from({ length: 6 }, async () => { while (i < urls.length) await ask(urls[i++]); }));
  record("answers", "links", "pass", `${urls.length} links asked: ${urls.length - silent.length - refused.length} answered, ${refused.length} answered with an error, ${silent.length} did not answer (reported, not failed)`, [...refused.map((x) => "error: " + x), ...silent.map((x) => "no answer: " + x)]);
}

// Spec Tests item 4: no console errors anywhere in this run.
function checkConsole() {
  const kinds = {};
  consoleErrors.forEach((e) => { kinds[e.text] = (kinds[e.text] || 0) + 1; });
  const list = Object.entries(kinds).map(([t, n]) => `${n} × ${t}`);
  record("console", "all", list.length ? "fail" : "pass", list.length ? `${list.length} kind(s) of console error` : "no console errors in any scenario of this run", list.slice(0, 20));
}

// each journey in a fresh browser: on a machine short of memory a long-lived one stalls
async function checkKeyboard(ctx) {
  for (const view of opts.views) { await ctx.fresh(); await keyboardJourney(view, false); }
  if (opts.views.includes("desktop")) { await ctx.fresh(); await keyboardJourney("desktop", true); }
  // a 1280 × 720 laptop at 400% zoom is a 320 × 180 window: the same journey, nothing under a bar
  if (opts.views.includes("desktop")) {
    VIEWS.zoom400 = { w: 320, h: 180, dpr: 1, mobile: false };
    try { await ctx.fresh(); await keyboardJourney("zoom400", false); } finally { delete VIEWS.zoom400; }
  }
  // every tool must work with reduced motion and in still mode (spec, Accessibility): once each
  if (opts.views.includes("desktop")) { await ctx.fresh(); await keyboardJourney("desktop", false, "reduced"); }
  const still = opts.views.find((v) => v !== "desktop") || "desktop";
  await ctx.fresh(); await keyboardJourney(still, false, "static");
}
async function checkPointer(ctx) {
  for (const view of opts.views) { await ctx.fresh(); await pointerJourney(view, true); }
  if (opts.views.includes("desktop")) { await ctx.fresh(); await pointerJourney("desktop", false); }
  // reduced motion and still mode, once each (spec, Accessibility)
  const still = opts.views.find((v) => v !== "desktop") || "desktop";
  await ctx.fresh(); await pointerJourney(still, false, "reduced");
  if (opts.views.includes("desktop")) { await ctx.fresh(); await pointerJourney("desktop", true, "static"); }
}

// The checks, in order (see the note at the top of this file). "answers" asks the internet and
// "console" reads everything before it, so they come last.
const CHECKS = { golden: checkGolden, seeded: checkSeeded, noreload: checkNoReload, keyboard: checkKeyboard, pointer: checkPointer, scroll: checkScroll, overlays: checkOverlays, consent: checkConsent, globe: checkGlobe, archive: checkArchive, together: checkTogether, no3d: checkNo3d, page: checkPage, code: checkCode, answers: checkLinkAnswers };

/* ══ Main ════════════════════════════════════════════════════════════ */

function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, file))).digest("hex").slice(0, 16); }
// The recording is only true of the old page. Refuse to make it from anything else.
function assertOldPage() {
  const old = execFileSync("git", ["show", `${OLD_COMMIT}:index.html`], { cwd: ROOT, maxBuffer: 1 << 26 });
  if (!old.equals(fs.readFileSync(path.join(ROOT, "index.html")))) { console.error(`--record refused: index.html is not the old page from ${OLD_COMMIT}.`); process.exit(2); }
}

async function main() {
  if (opts.record) assertOldPage();
  if (opts.record && (opts.quick || opts.scenarios) && opts.fixtures === path.join(ROOT, "tools", "fixtures")) { console.error("--record refused: a part recording would replace the whole one. Use --fixtures <another folder>."); process.exit(2); }
  const server = await startServer();
  baseURL = `http://127.0.0.1:${server.address().port}/`;
  const ctx = { record, opts };
  let code = 0;
  try {
    // A fresh browser for every check: one browser for the whole run slowed down the longer it
    // ran on a busy machine, until its timers stalled.
    const fresh = async (extra = []) => {
      if (cdp) cdp.close();
      cdp = await startChrome(extra);
      listenConsole(cdp);
      await watchNetwork(cdp);
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: `(${installProbes.toString()})();` });
      await cdp.send("Emulation.setLocaleOverride", { locale: "en-US" });
      await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    };
    if (!opts.record && (!opts.only || ["globe", "archive", "together", "no3d", "page"].some((c) => opts.only.has(c)))) await loadRealLibs();
    for (const [name, fn] of Object.entries(CHECKS)) {
      if (opts.only && !opts.only.has(name)) continue;
      if (opts.record && !["golden"].includes(name)) continue;
      const before = results.length;
      ctx.fresh = fresh;
      try { await fresh(); await fn(ctx); }
      catch (e) { record(name, "all", "fail", `the check itself stopped: ${e.message}`); }
      // A stall of the machine (no answer from the browser for minutes) is not a result: run
      // the check once more in a fresh browser, and say so (the lead's rule: rerun that piece).
      const STALL = /took longer than|no Page\.loadEventFired within/;
      // (golden retries each stalled scenario itself, so it is never run twice whole)
      if (name !== "golden" && results.slice(before).some((r) => STALL.test(r.summary) || r.notes.some((n) => STALL.test(n)))) {
        const first = results.splice(before).filter((r) => STALL.test(r.summary) || r.notes.some((n) => STALL.test(n))).map((r) => `${r.check} ${r.view}`);
        console.log(`  - ${name}: interrupted by a stall (${first.join(", ")}); running it again in a fresh browser`);
        const again = results.length;
        try { await fresh(); await fn(ctx); }
        catch (e) { record(name, "all", "fail", `the check itself stopped: ${e.message}`); }
        results.slice(again).forEach((r) => r.notes.push(`second try: the first was interrupted by a stall of this machine (${first.join(", ")})`));
      }
    }
    if (opts.record && ctx.actual && !results.some((r) => r.status === "fail")) {
      const first = ctx.actual[opts.views[0]];
      const golden = {
        recordedFrom: { commit: OLD_COMMIT, page: "index.html", sha256: { "index.html": sha("index.html"), "js/main.js": sha("js/main.js"), "js/data.js": sha("js/data.js"), "js/backend.js": sha("js/backend.js") } },
        how: "Made by node tools/tool-check.mjs --record. Do not edit by hand. js/config.js was served with SHOW_SEEDED: true.",
        scenarios: first,
      };
      fs.mkdirSync(opts.fixtures, { recursive: true });
      fs.writeFileSync(GOLDEN, JSON.stringify(golden, null, 1) + "\n");
      console.log(`\nRecorded ${Object.keys(first).length} scenarios to ${rel(GOLDEN)} (${Math.round(fs.statSync(GOLDEN).size / 1024)} KB)`);
      if (first["causes-0"]) {
        try { await recordOldLinks(ctx); }
        catch (e) { record("links", "desktop", "fail", `the check itself stopped: ${e.message}`); }
      }
    }
    console.log("");
    if (!opts.record) checkConsole();
    await checkNetwork();
  } finally {
    if (cdp) cdp.close();
    server.close();
  }
  const failed = results.filter((r) => r.status === "fail");
  const seenErrors = {};
  consoleErrors.forEach((e) => { seenErrors[e.text] = (seenErrors[e.text] || 0) + 1; });
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ results, consoleErrors: seenErrors }, null, 1));
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Details: ${rel(path.join(OUT, "report.json"))}`);
  if (Object.keys(seenErrors).length) console.log(`Console errors seen (not failed here): ${Object.keys(seenErrors).length} kinds, in report.json`);
  if (failed.length) code = 1;
  process.exit(code);
}
process.on("unhandledRejection", (e) => console.log("  (a late browser answer was ignored: " + (e && e.message) + ")"));
main().catch((e) => { console.error(e); process.exit(1); });
