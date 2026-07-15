/* ═══════════════════════════════════════════════════════════════════════
   THE COST OF WAR · DOSSIER — scroll choreography
   ───────────────────────────────────────────────────────────────────────
   Engine: GSAP + ScrollTrigger, smoothed by Lenis. All figures come from
   js/data.js (MIL_PER_SECOND, DEFENCE, DEATHS_PER_YEAR …) — never re-typed.

   MOTION SPEC (trigger · scrub behaviour · what a designer tunes)
   ───────────────────────────────────────────────────────────────────────
   HERO      trigger #hero  start top top  end bottom top  scrub
             · reticle scales 1→0.05 + fades, contracting to a point
             · title/live-feed drift up & fade  ·  live counter runs on rAF
             tune: RETICLE_MIN, hero fade curve.
   FILE 01   trigger #file01  pin .stage  end +=170%  scrub
             0.00–0.42 odometer $0→$2.89T (war, centred)
             0.42–1.00 cyan half wipes in (SPLIT 100→18), divider slides left,
                       72× seal scales 0→1, readout fades in.        [MIRROR #1]
             tune: ODO_END (0.42), SPLIT_END (18), SEAL_IN window.
   MATCHCUT  trigger #matchcut  pin .stage  end +=140%  scrub
             circle(red) shrinks/rotates → reticle(cyan) fades+scales →
             coord grid pushes out → caption fades. [pattern-recognition cut]
   FILE 02   trigger #file02  pin .stage  end +=150%  scrub
             $119B counts, cyan $12B wipes in (SPLIT 100→22), 10× seal. [MIRROR #2]
             background warms (amber) — the machine softening.
   HUMAN     trigger #human  pin .stage  end +=260%  scrub
             0.00–0.14 intro "…what follows cannot" holds
             0.14       CHROME DIES: .fx + .hud fade to 0 (never returns till close)
             0.16–0.86 244,700 lights ignite row-by-row; count → 244,700;
                       faint rules every 50,000. No accent colour — white on black.
             0.86–1.00 "Every number… a person who wanted to live" fades in.
             tune: DISSOLVE_AT (0.14), light IGNITE window, MOBILE density cap.

   prefers-reduced-motion: Lenis + all ScrollTriggers are skipped; every scene
   renders as a static, legible reveal (both mirror halves side by side, counters
   at final value, full light field drawn once). See the reduce block in CSS.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var fmtMoney = function (n) {
    // matches the site's convention: $B under 1000, else $#.##T
    return n >= 1000 ? "$" + (n / 1000).toFixed(2) + "T" : "$" + Math.round(n) + "B";
  };
  var fmtUSD = function (n) {
    return "$" + Math.floor(n).toLocaleString();
  };

  // real figures (js/data.js). Fallbacks keep the prototype standalone-safe.
  var VPS = typeof VIOLENCE_PER_SECOND !== "undefined" ? VIOLENCE_PER_SECOND : 691590;
  var DEF = typeof DEFENCE !== "undefined" ? DEFENCE : 2887; // $B → $2.89T
  var DEATHS = typeof DEATHS_PER_YEAR !== "undefined" ? DEATHS_PER_YEAR : 244700;

  var reduce =
    (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    location.search.indexOf("static") > -1; // ?static=1 forces the static path
  var isMobile = window.matchMedia("(max-width: 760px)").matches;

  // ─────────────────────────────────────────────────────────────────────
  //  HERO live feed — cost of violence since the file was opened (always on,
  //  a real clock, not a scroll effect). Reduced-motion shows a static rate.
  // ─────────────────────────────────────────────────────────────────────
  var liveEl = $("#liveViolence");
  var opened = Date.now();
  if (reduce) {
    if (liveEl) liveEl.textContent = fmtUSD(VPS); // per-second snapshot
  } else if (liveEl) {
    (function runFeed() {
      liveEl.textContent = fmtUSD(((Date.now() - opened) / 1000) * VPS);
      requestAnimationFrame(runFeed);
    })();
  }

  // ─────────────────────────────────────────────────────────────────────
  //  Glyph assembly — title resolves out of monospace noise.
  // ─────────────────────────────────────────────────────────────────────
  var GLYPHS = "▚▞█▓▒░#@%&/\\<>*+=—0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // time-based (not frame-based) so it settles correctly even if the tab
  // throttles requestAnimationFrame. tune SCRAMBLE_MS for speed.
  var SCRAMBLE_MS = 620;
  function scramble(el, done) {
    var final = el.getAttribute("data-final") || el.textContent;
    var start = performance.now();
    (function step() {
      var p = Math.min((performance.now() - start) / SCRAMBLE_MS, 1);
      var out = "";
      for (var i = 0; i < final.length; i++) {
        if (final[i] === " ") {
          out += " ";
          continue;
        }
        // characters lock left-to-right as progress passes their position
        var settled = i / final.length <= p;
        out += settled
          ? final[i]
          : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = final;
        if (done) done();
      }
    })();
  }
  function runTitle() {
    var parts = document.querySelectorAll(".hero-title .scramble");
    parts.forEach(function (p, i) {
      setTimeout(function () {
        scramble(p);
      }, 260 + i * 220);
    });
    document.body.classList.remove("is-booting");
  }

  // ─────────────────────────────────────────────────────────────────────
  //  244,700 lights — deterministic row-major field so ignition sweeps down
  //  and the "every 50,000" rules land on real band boundaries.
  // ─────────────────────────────────────────────────────────────────────
  var lightsCv = $("#lights");
  var lightsCtx = lightsCv ? lightsCv.getContext("2d") : null;
  var lightField = null; // {cols, rows, cell, cap, unit, w, h}
  function buildLightField() {
    if (!lightsCv) return;
    var w = (lightsCv.width = lightsCv.offsetWidth * (window.devicePixelRatio || 1));
    var h = (lightsCv.height = lightsCv.offsetHeight * (window.devicePixelRatio || 1));
    var cap = isMobile ? 70000 : DEATHS; // draw-count cap; label stays 244,700
    var aspect = w / h;
    var cols = Math.round(Math.sqrt(cap * aspect));
    var rows = Math.ceil(cap / cols);
    lightField = {
      w: w,
      h: h,
      cols: cols,
      rows: rows,
      cap: cap,
      unit: DEATHS / cap, // each drawn point = this many lives
      cellW: w / cols,
      cellH: h / rows,
      drawn: 0,
    };
    lightsCtx.clearRect(0, 0, w, h);
  }
  function drawLightsUpTo(target) {
    if (!lightField) buildLightField();
    var f = lightField;
    target = Math.max(0, Math.min(f.cap, Math.floor(target)));
    if (target < f.drawn) {
      // scrubbed back — clear and redraw from zero (cheap enough, occasional)
      lightsCtx.clearRect(0, 0, f.w, f.h);
      f.drawn = 0;
    }
    var dpr = window.devicePixelRatio || 1;
    var r = Math.max(0.9 * dpr, f.cellW * 0.36);
    lightsCtx.fillStyle = "rgba(255,255,255,0.9)";
    for (var i = f.drawn; i < target; i++) {
      var c = i % f.cols;
      var row = (i / f.cols) | 0;
      var x = c * f.cellW + f.cellW * 0.5;
      var y = row * f.cellH + f.cellH * 0.5;
      // slight deterministic jitter so the grid reads as a field, not a table
      var j = ((i * 9301 + 49297) % 233280) / 233280;
      x += (j - 0.5) * f.cellW * 0.7;
      y += (((i * 4021 + 7) % 997) / 997 - 0.5) * f.cellH * 0.7;
      lightsCtx.globalAlpha = 0.5 + j * 0.5;
      lightsCtx.beginPath();
      lightsCtx.arc(x, y, r, 0, 6.2832);
      lightsCtx.fill();
    }
    lightsCtx.globalAlpha = 1;
    // rules every 50,000 lives
    if (target > 0) {
      lightsCtx.strokeStyle = "rgba(255,255,255,0.14)";
      lightsCtx.lineWidth = dpr;
      for (var m = 50000; m < DEATHS; m += 50000) {
        var rowAt = Math.floor(m / f.unit / f.cols);
        var yy = rowAt * f.cellH;
        lightsCtx.beginPath();
        lightsCtx.moveTo(0, yy);
        lightsCtx.lineTo(f.w, yy);
        lightsCtx.stroke();
      }
    }
    f.drawn = target;
  }

  // ─────────────────────────────────────────────────────────────────────
  //  REDUCED MOTION — set every scene to its resting, legible end-state.
  // ─────────────────────────────────────────────────────────────────────
  if (reduce) {
    document.body.classList.add("no-motion"); // drives the static CSS layout
    var t = $("#odo01");
    if (t) t.textContent = fmtMoney(DEF);
    var n = $("#lightsNum");
    if (n) n.textContent = DEATHS.toLocaleString();
    // title without the scramble animation
    document.querySelectorAll(".hero-title .scramble").forEach(function (p) {
      p.textContent = p.getAttribute("data-final");
    });
    document.body.classList.remove("is-booting");
    // draw the full field once (no scrub)
    if (lightsCv) {
      requestAnimationFrame(function () {
        buildLightField();
        drawLightsUpTo(lightField ? lightField.cap : 0);
      });
    }
    return; // no Lenis, no ScrollTrigger
  }

  // ─────────────────────────────────────────────────────────────────────
  //  MOTION PATH — Lenis smooth scroll drives ScrollTrigger.
  // ─────────────────────────────────────────────────────────────────────
  var LenisCtor = window.Lenis || window.lenis;
  var lenis = null;
  if (LenisCtor) {
    lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", function () {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  gsap.registerPlugin(ScrollTrigger);
  runTitle();

  // ── persistent HUD: file id, coords, progress ──
  var hudFile = $("#hudFile"),
    hudCoord = $("#hudCoord"),
    hudProg = $("#hudProg");
  var scenes = [
    ["#hero", "FILE 00 · BOOT"],
    ["#file01", "FILE 01 · THE MACHINE"],
    ["#matchcut", "FILE 01 → 02 · PATTERN MATCH"],
    ["#file02", "FILE 02 · THE IMPACT"],
    ["#human", "— · THE HUMAN COST"],
  ];
  scenes.forEach(function (s) {
    var el = $(s[0]);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onToggle: function (self) {
        if (self.isActive && hudFile) hudFile.textContent = s[1];
      },
    });
  });
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      if (hudProg) hudProg.style.width = (self.progress * 100).toFixed(1) + "%";
      if (hudCoord) {
        var a = (18 + self.progress * 44).toFixed(4);
        var b = (12 + self.progress * 90).toFixed(4);
        hudCoord.textContent = a + "° / " + b + "°";
      }
    },
  });

  // grid parallax (transform only)
  var grid = $("#fxGrid");
  if (grid) {
    gsap.to(grid, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });
  }

  // ── HERO: reticle contracts to a point as the hero scrolls away ──
  var RETICLE_MIN = 0.04;
  gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  })
    .to("#reticle", { scale: RETICLE_MIN, opacity: 0.9, ease: "power2.in" }, 0)
    .to(".hero-content", { yPercent: -18, opacity: 0, ease: "power1.in" }, 0)
    .to("#scrollCue", { opacity: 0, duration: 0.2 }, 0);

  // ── FILE 01 · THE MIRROR #1 ──
  var m01 = $("#mirror01");
  var odo01 = $("#odo01");
  gsap.set(m01, { "--split": 100 });
  var proxy01 = { v: 0 };
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#file01",
        start: "top top",
        end: "+=170%",
        pin: "#file01Stage",
        scrub: true,
      },
    })
    // 0.00–0.42 — odometer counts the military budget up
    .to(
      proxy01,
      {
        v: DEF,
        ease: "none",
        duration: 0.42,
        onUpdate: function () {
          if (odo01) odo01.textContent = fmtMoney(proxy01.v);
        },
      },
      0,
    )
    // 0.42–1.00 — the mirror opens: cyan overtakes, divider slides left
    .fromTo(
      m01,
      { "--split": 100 },
      { "--split": 18, ease: "power2.inOut", duration: 0.58 },
      0.42,
    )
    .fromTo("#seal01", { scale: 0, rotate: -18 }, { scale: 1, rotate: 0, ease: "back.out(1.7)", duration: 0.3 }, 0.62)
    .to("#readout01", { opacity: 1, duration: 0.2 }, 0.8);

  // ── MATCH-CUT · circle → reticle → coord grid ──
  // build the coordinate grid lines once
  var mcGrid = $("#mcGrid");
  if (mcGrid) {
    var gg = "";
    for (var i = 1; i < 10; i++) {
      var p = i * 10;
      gg += '<line x1="' + p + '" y1="0" x2="' + p + '" y2="100"/>';
      gg += '<line x1="0" y1="' + p + '" x2="100" y2="' + p + '"/>';
    }
    mcGrid.innerHTML = gg;
  }
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#matchcut",
        start: "top top",
        end: "+=140%",
        pin: "#matchcutStage",
        scrub: true,
      },
    })
    .to(".mc-circle", { scale: 0.05, rotate: 90, opacity: 0, ease: "power2.in", duration: 0.4 }, 0)
    .fromTo(".mc-reticle", { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.4 }, 0.3)
    .to(".mc-reticle", { scale: 6, opacity: 0, ease: "power2.in", duration: 0.4 }, 0.66)
    .fromTo("#mcGrid", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", duration: 0.4 }, 0.62)
    .fromTo("#mcCaption", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.4)
    .to("#mcCaption", { opacity: 0, duration: 0.2 }, 0.82);

  // ── FILE 02 · THE MIRROR #2 (nukes ↔ humanitarian) ──
  var m02 = $("#mirror02");
  var odo02 = $("#odo02");
  var proxy02 = { v: 0 };
  gsap.set(m02, { "--split": 100 });
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#file02",
        start: "top top",
        end: "+=150%",
        pin: "#file02Stage",
        scrub: true,
      },
    })
    .to(
      proxy02,
      {
        v: 119,
        ease: "none",
        duration: 0.38,
        onUpdate: function () {
          if (odo02) odo02.textContent = "$" + Math.round(proxy02.v) + "B";
        },
      },
      0,
    )
    .fromTo(m02, { "--split": 100 }, { "--split": 22, ease: "power2.inOut", duration: 0.6 }, 0.38)
    .fromTo("#seal02", { scale: 0, rotate: 18 }, { scale: 1, rotate: 0, ease: "back.out(1.7)", duration: 0.3 }, 0.6);

  // ── HUMAN · the dissolve ──
  var DISSOLVE_AT = 0.14;
  buildLightField();
  var lightsProxy = { n: 0 };
  var lightsNum = $("#lightsNum");
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#human",
        start: "top top",
        end: "+=260%",
        pin: "#humanStage",
        scrub: true,
      },
    })
    // hold the pivot line, then let it go
    .to("#humanIntro", { opacity: 0, duration: 0.1, ease: "power1.in" }, DISSOLVE_AT)
    // CHROME DIES — the machine falls away and does not come back
    .to(".fx", { opacity: 0, duration: 0.12 }, DISSOLVE_AT)
    .to(".hud", { opacity: 0, duration: 0.12 }, DISSOLVE_AT)
    // the light field ignites
    .to("#lights", { opacity: 1, duration: 0.12 }, 0.16)
    .to("#humanCount", { opacity: 1, duration: 0.12 }, 0.2)
    .to(
      lightsProxy,
      {
        n: DEATHS,
        ease: "none",
        duration: 0.7,
        onUpdate: function () {
          if (lightsNum) lightsNum.textContent = Math.floor(lightsProxy.n).toLocaleString();
          drawLightsUpTo((lightsProxy.n / DEATHS) * (lightField ? lightField.cap : 0));
        },
      },
      0.16,
    )
    // the last word
    .to("#humanCount", { opacity: 0.25, duration: 0.15 }, 0.86)
    .fromTo("#humanFinal", { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.86);

  // keep the light field crisp on resize
  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      buildLightField();
      ScrollTrigger.refresh();
    }, 200);
  });

  // recalc once fonts/images settle
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
