/* ═══════════════════════════════════════════════════════════════════════
   THE COST OF WAR · DOSSIER CHOREOGRAPHY  (rev 10)
   ───────────────────────────────────────────────────────────────────────
   Loads AFTER js/main.js and only adds the experience layer. It never owns
   data or interaction: main.js still drives the live counter, the charts,
   the redistribution game, the letter, the globe and the coalition. Figures
   come from js/data.js (DEFENCE …) — nothing is re-typed here.

   MOTION SPEC (trigger · scrub · what a designer tunes)
   ───────────────────────────────────────────────────────────────────────
   HERO      #hero  start top top  end bottom top  scrub
             · reticle scales 1 → RETICLE_MIN and fades: contracts to a point
             · hero content drifts up and out
             · title assembles glyph-by-glyph on load (SCRAMBLE_MS)
   Engine: GSAP ScrollTrigger on NATIVE scroll. No smooth-scroll library.
   MIRROR 1  #mirror01  pin .stage  end +=1.0vh  scrub               [2.89T↔40B]
             0.00–0.42  odometer $0 → $2.89T (red, alone)
             0.42–1.00  cyan half wipes in (SPLIT 100→18), divider slides left,
                        72× seal scales in, readout fades up
             tune: ODO_END, SPLIT_END, seal window
   MATCHCUT  #matchcut  pin .stage  end +=0.8vh  scrub
             dial circle shrinks/rotates → reticle → coordinate grid pushes out
   MIRROR 2/3/4  pin .stage  end +=0.9vh  scrub   [119B↔12B · 21.8T↔2650 · 588B↔114B]
             Pins are deliberately short: a pinned scene is a stretch where the
             page looks frozen, so each resolves in about one screen of scroll.
             odometer $0 → $119B, then SPLIT 100→22, 10× seal. Machine warms.
   DISSOLVE  #humanPivot → .lives-breath
             chrome (.fx + .hud) fades to 0 and stays gone through the lives
             artwork — "everything above can be counted in dollars…"
   RE-ARM    #haveyoursay  chrome fades back in: the file is now YOURS.
             The interactive half is never pinned — the tools must stay usable.

   prefers-reduced-motion (or ?static=1) → body.no-motion: no pins,
   no scrub. Mirrors rest open side by side, odometers show final values.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var $ = function (s) {
    return document.querySelector(s);
  };
  // matches the site's money convention ($B under 1000, else $#.##T)
  var fmtMoney = function (n) {
    return n >= 1000
      ? "$" + (n / 1000).toFixed(2) + "T"
      : "$" + Math.round(n) + "B";
  };
  var DEF = typeof DEFENCE !== "undefined" ? DEFENCE : 2887; // $B → $2.89T

  var reduce =
    (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    location.search.indexOf("static") > -1;

  // ── title: assembles out of monospace noise (time-based, throttle-proof) ──
  var GLYPHS = "▚▞█▓▒░#@%&/\\<>*+=—0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var SCRAMBLE_MS = 620; // tune for speed
  function scramble(el) {
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
        out +=
          i / final.length <= p
            ? final[i]
            : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final;
    })();
  }

  var titles = document.querySelectorAll(".hero-title .scramble");

  // ─────────────────────────────────────────────────────────────────────
  //  NO-MOTION — rest state: everything legible, nothing moves.
  // ─────────────────────────────────────────────────────────────────────
  if (reduce) {
    document.body.classList.add("no-motion");
    titles.forEach(function (t) {
      t.textContent = t.getAttribute("data-final");
    });
    // the mirror + manufacturing figures rest at their final, readable values
    [
      ["#odo01", fmtMoney(DEF)],
      ["#mfRevenue", "$679B"],
      ["#mfGrowth", "+9.2%"],
    ].forEach(function (p) {
      var el = $(p[0]);
      if (el) el.textContent = p[1];
    });
    // populate the (static) conveyor so it isn't empty
    var convR = $("#mfConveyor");
    if (convR)
      for (var u = 0; u < 48; u++) {
        var d = document.createElement("div");
        d.className = "mf-unit";
        convR.appendChild(d);
      }
    // the lives field rests complete. main.js's drawLives sets inline pixel
    // sizes for the OLD tall-grid artwork, which would fight the new
    // full-bleed stage — so take it over and paint one static field.
    window.drawLives = function () {};
    var lcv = $("#livesCanvas");
    if (lcv) {
      lcv.style.width = "";
      lcv.style.height = "";
      var lc = lcv.getContext("2d"),
        ldpr = Math.min(window.devicePixelRatio || 1, 2),
        lst = lcv.parentElement.getBoundingClientRect(),
        lw = lst.width > 0 ? lst.width : window.innerWidth || 900,
        lh = lst.height > 0 ? lst.height : window.innerHeight || 700,
        lt = typeof DEATHS_PER_YEAR !== "undefined" ? DEATHS_PER_YEAR : 244700;
      lcv.width = Math.round(lw * ldpr);
      lcv.height = Math.round(lh * ldpr);
      lc.setTransform(ldpr, 0, 0, ldpr, 0, 0);
      lc.fillStyle = "rgba(255,255,255,0.6)";
      for (var q = 0; q < lt; q++)
        lc.fillRect(Math.random() * lw, Math.random() * lh, 1, 1);
      var lcnt = $("#livesCount");
      if (lcnt) lcnt.textContent = lt.toLocaleString();
      var llbl = $("#livesLabel");
      if (llbl) llbl.textContent = "in a single year";
    }
    // setback clock + border rest at their end figures
    var sy = $("#sbYear");
    if (sy) sy.textContent = "1948";
    var sl = $("#sbLost");
    if (sl) sl.textContent = "77";
    var bc = $("#bdCount");
    if (bc) bc.textContent = "117.8M";
    var bch = $("#bdChildren");
    if (bch) bch.textContent = "45M";
    var bcv = $("#borderCanvas");
    if (bcv) {
      var cx = bcv.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        w = (bcv.width = bcv.offsetWidth * dpr),
        h = (bcv.height = bcv.offsetHeight * dpr),
        bx = w * 0.56;
      cx.strokeStyle = "rgba(232,230,224,0.5)";
      cx.lineWidth = dpr;
      cx.beginPath();
      cx.moveTo(bx, 0);
      cx.lineTo(bx, h);
      cx.stroke();
      var place = function (n, x0, x1, col) {
        for (var i = 0; i < n; i++) {
          cx.fillStyle = col;
          cx.globalAlpha = 0.75;
          cx.beginPath();
          cx.arc(
            x0 + Math.random() * (x1 - x0),
            10 * dpr + Math.random() * (h - 20 * dpr),
            1.7 * dpr,
            0,
            6.2832,
          );
          cx.fill();
        }
      };
      place(344, 12 * dpr, bx - 20 * dpr, "#4f7cff");
      place(246, bx + 24 * dpr, w - 12 * dpr, "#31d0d6");
      cx.globalAlpha = 1;
    }
    return; // no ScrollTrigger at all
  }

  if (!window.gsap || !window.ScrollTrigger) return; // fail soft to a static page

  // Pin distances are stated in real pixels off a GUARDED viewport height.
  // Some embedded/headless contexts report innerHeight as 0; percentage-based
  // ScrollTrigger ends then resolve to nonsense and the pin spacers can blow
  // the document out to millions of px. A floor keeps the page sane anywhere.
  var VH = Math.max(window.innerHeight || 0, 600);
  var px = function (mult) {
    return "+=" + Math.round(VH * mult);
  };

  titles.forEach(function (t, i) {
    setTimeout(function () {
      scramble(t);
    }, 240 + i * 200);
  });

  // ── NATIVE SCROLL. No smooth-scroll library. ──
  // We used Lenis here and it was wrong. It replaces the browser's scrolling
  // with a JS simulation that then has to stay in sync with five pinned
  // scenes — it fought the pins, threw away real trackpad momentum, and felt
  // broken no matter how the lerp was tuned. The browser's own scrolling is
  // smooth, momentum-correct, interruptible and free. ScrollTrigger is happy
  // on native scroll and pins behave. Keep it this way.
  gsap.registerPlugin(ScrollTrigger);

  // ── HUD: file id per chapter, coords, progress ──
  var hudFile = $("#hudFile"),
    hudCoord = $("#hudCoord"),
    hudProg = $("#hudProg");
  [
    ["#hero", "FILE 00 · BOOT"],
    ["#machine", "FILE 01 · THE MACHINE"],
    ["#matchcut", "FILE 01 → 02 · PATTERN MATCH"],
    ["#impact", "FILE 02 · THE IMPACT"],
    ["#humanPivot", "— · THE HUMAN COST"],
    ["#haveyoursay", "FILE 03 · YOUR FILE"],
    ["#countrySection", "FILE 04 · YOUR COUNTRY"],
    ["#letterSection", "FILE 05 · YOUR LETTER"],
    ["#coalitionSection", "FILE 06 · THE COALITION"],
  ].forEach(function (s) {
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
      if (hudCoord)
        hudCoord.textContent =
          (18 + self.progress * 44).toFixed(4) +
          "° / " +
          (12 + self.progress * 90).toFixed(4) +
          "°";
    },
  });

  // grid parallax (transform only)
  if ($("#fxGrid"))
    gsap.to("#fxGrid", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });

  // ── HERO · the reticle contracts to a point ──
  var RETICLE_MIN = 0.04;
  gsap
    .timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
    .to("#reticle", { scale: RETICLE_MIN, opacity: 0.9, ease: "power2.in" }, 0)
    .to(".hero-content", { yPercent: -14, opacity: 0, ease: "power1.in" }, 0)
    .to("#scrollCue", { opacity: 0, duration: 0.2 }, 0);

  // ── THE MIRROR (shared builder) ──
  // stateless: --split is the single driver; CSS decides the axis.
  function buildMirror(cfg) {
    var scene = $(cfg.scene);
    if (!scene) return;
    var mirror = $(cfg.mirror);
    var odo = $(cfg.odo);
    var proxy = { v: 0 };
    gsap.set(mirror, { "--split": 100 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: cfg.scene,
        start: "top top",
        end: cfg.end,
        pin: cfg.stage,
        scrub: true,
      },
    });
    // 1 · the war figure counts up, alone
    tl.to(
      proxy,
      {
        v: cfg.value,
        ease: "none",
        duration: cfg.odoEnd,
        onUpdate: function () {
          if (odo) odo.textContent = cfg.fmt(proxy.v);
        },
      },
      0,
    )
      // 2 · the mirror opens — the build twin overtakes the frame
      .fromTo(
        mirror,
        { "--split": 100 },
        { "--split": cfg.splitEnd, ease: "power2.inOut", duration: 1 - cfg.odoEnd },
        cfg.odoEnd,
      )
      .fromTo(
        cfg.seal,
        { scale: 0, rotate: -18 },
        { scale: 1, rotate: 0, ease: "back.out(1.7)", duration: 0.3 },
        cfg.odoEnd + 0.2,
      );
    if (cfg.readout)
      tl.to(cfg.readout, { opacity: 1, duration: 0.2 }, 0.82);
  }

  // THE ONE MIRROR · what we CHOOSE to spend ($2.89T) ↔ what violence COSTS
  // ($21.8T). The odometer counts the military budget; the far bigger full
  // bill wipes in over it. (The old nuclear/hunger/Ukraine mirrors are gone —
  // three near-identical split-screens read as repetition, not rhythm.)
  buildMirror({
    scene: "#mirror01",
    stage: "#mirror01Stage",
    mirror: "#mirror01Mirror",
    odo: "#odo01",
    seal: "#seal01",
    readout: "#readout01",
    value: DEF,
    fmt: fmtMoney,
    odoEnd: 0.42,
    splitEnd: 18,
    end: px(1.0),
  });

  // ── MATCH-CUT · dial → reticle → ground ──
  var mcGrid = $("#mcGrid");
  if (mcGrid) {
    var gg = "";
    for (var i = 1; i < 10; i++) {
      var p = i * 10;
      gg +=
        '<line x1="' + p + '" y1="0" x2="' + p + '" y2="100"/>' +
        '<line x1="0" y1="' + p + '" x2="100" y2="' + p + '"/>';
    }
    mcGrid.innerHTML = gg;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#matchcut",
          start: "top top",
          end: px(0.8),
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
  }

  // ══ THE PRODUCTION LINE ══ three different devices (not the mirror).

  // 1 · CIVILIAN → WEAPON morph (short pin). Same line, different output:
  // the turbine's blades fold and it becomes a missile; cyan → red.
  if ($("#mfMorph"))
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#mfMorph",
          start: "top top",
          end: px(0.9),
          pin: "#mfMorphStage",
          scrub: true,
        },
      })
      // blades rotate as if spinning down, then fold flat
      .fromTo("#moBlades", { rotate: 0 }, { rotate: 200, transformOrigin: "100px 120px", ease: "power1.in", duration: 0.6 }, 0)
      .to("#moTurbine", { opacity: 0, ease: "none", duration: 0.2 }, 0.42)
      .fromTo("#moMissile", { opacity: 0, y: 14 }, { opacity: 1, y: 0, ease: "none", duration: 0.24 }, 0.44)
      .to("#mfLabBuild", { opacity: 0, duration: 0.15 }, 0.42)
      .to("#mfLabWar", { opacity: 1, duration: 0.15 }, 0.52)
      // a slight launch-lift at the end
      .to("#moMissile", { y: -18, ease: "power1.out", duration: 0.3 }, 0.7);

  // 2 · SELF-DRAWING BLUEPRINT (inline, no pin). The schematic draws itself and
  // the record revenue counts up as it passes through the viewport.
  if ($("#mfBlueprint")) {
    var rev = { v: 0 };
    var revEl = $("#mfRevenue");
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#mfBlueprint",
          start: "top 82%",
          end: "bottom 65%",
          scrub: true,
        },
      })
      .to(".bp-line", { strokeDashoffset: 0, ease: "none", duration: 0.8, stagger: 0.04 }, 0)
      .to(rev, {
        v: 679,
        ease: "none",
        duration: 0.8,
        onUpdate: function () {
          if (revEl) revEl.textContent = "$" + Math.round(rev.v) + "B";
        },
      }, 0)
      .to(".bp-tag", { opacity: 1, duration: 0.15 }, 0.7);
  }

  // 3 · PRODUCTION SCALE (inline). Units accumulate and the trade-growth
  // figure climbs — industrial momentum, not one object.
  if ($("#mfScale")) {
    var conv = $("#mfConveyor");
    var UNITS = 48;
    for (var u = 0; u < UNITS; u++) {
      var d = document.createElement("div");
      d.className = "mf-unit";
      conv.appendChild(d);
    }
    var g = { v: 0 };
    var gEl = $("#mfGrowth");
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#mfScale",
          start: "top 82%",
          end: "bottom 70%",
          scrub: true,
        },
      })
      .to(".mf-unit", { opacity: 1, y: 0, ease: "none", duration: 0.7, stagger: 0.012 }, 0)
      .to(g, {
        v: 9.2,
        ease: "none",
        duration: 0.7,
        onUpdate: function () {
          if (gEl) gEl.textContent = "+" + g.v.toFixed(1) + "%";
        },
      }, 0);
  }

  // ══ THE SETBACK CLOCK (destruction) ══ scroll DOWN → the year runs
  // BACKWARDS. Money rebuilds buildings; it can't rebuy the 77 years of human
  // development a war erased.
  if ($("#setback")) {
    var NOW_YEAR = 2025,
      BACK_YEARS = 77; // 2025 → 1948, UN estimate for Gaza
    var ticksEl = $("#sbTicks");
    if (ticksEl)
      for (var yr = 1950; yr <= 2020; yr += 10) {
        var frac = (NOW_YEAR - yr) / BACK_YEARS; // 0 at 2025 (right) → 1 at 1948
        var tk = document.createElement("div");
        tk.className = "sb-tick";
        tk.style.right = frac * 100 + "%";
        tk.innerHTML = "<span>" + yr + "</span>";
        ticksEl.appendChild(tk);
      }
    var yEl = $("#sbYear"),
      lEl = $("#sbLost"),
      fEl = $("#sbFill"),
      sbP = { p: 0 };
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#setback",
          start: "top top",
          end: px(0.9),
          pin: "#setbackStage",
          scrub: true,
        },
      })
      .to(sbP, {
        p: 1,
        ease: "none",
        duration: 1,
        onUpdate: function () {
          var lost = Math.round(BACK_YEARS * sbP.p);
          if (yEl) yEl.textContent = NOW_YEAR - lost;
          if (lEl) lEl.textContent = lost;
          if (fEl) fEl.style.width = sbP.p * 100 + "%";
        },
      });
  }

  // ══ THE BORDER (displacement) ══ the 68.7M displaced INSIDE their own country
  // pile against a line only the 49.1M refugees cross. Most never escape.
  var bCanvas = $("#borderCanvas");
  if (bCanvas) {
    var bctx = bCanvas.getContext("2d");
    var HOME = 344, // 68.7M ÷ 200k
      FLED = 246; // 49.1M ÷ 200k
    var bMarks = null;
    var buildBorder = function () {
      var dpr = window.devicePixelRatio || 1;
      var w = (bCanvas.width = bCanvas.offsetWidth * dpr);
      var h = (bCanvas.height = bCanvas.offsetHeight * dpr);
      var bx = w * 0.56,
        pad = 10 * dpr;
      bMarks = { w: w, h: h, bx: bx, dpr: dpr, list: [], drawn: 0 };
      var rnd = function (s) {
        // deterministic scatter so redraws are stable
        var x = Math.sin(s * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      for (var i = 0; i < HOME; i++)
        bMarks.list.push({
          x: pad + rnd(i + 1) * (bx - pad * 2.4),
          y: pad + rnd(i + 99) * (h - pad * 2),
          home: true,
          child: rnd(i + 7) < 0.38,
        });
      for (var j = 0; j < FLED; j++)
        bMarks.list.push({
          x: bx + pad * 2.4 + rnd(j + 500) * (w - bx - pad * 3),
          y: pad + rnd(j + 777) * (h - pad * 2),
          home: false,
          child: rnd(j + 313) < 0.38,
        });
    };
    var drawBorder = function (reveal) {
      if (!bMarks) buildBorder();
      var m = bMarks;
      reveal = Math.max(0, Math.min(m.list.length, Math.floor(reveal)));
      if (reveal < m.drawn) {
        bctx.clearRect(0, 0, m.w, m.h);
        m.drawn = 0;
      }
      if (m.drawn === 0) {
        bctx.strokeStyle = "rgba(232,230,224,0.5)";
        bctx.lineWidth = m.dpr;
        bctx.setLineDash([4 * m.dpr, 4 * m.dpr]);
        bctx.beginPath();
        bctx.moveTo(m.bx, 0);
        bctx.lineTo(m.bx, m.h);
        bctx.stroke();
        bctx.setLineDash([]);
      }
      // colour by SIDE only — the trapped(blue)/fled(cyan) split is the story;
      // the 45M children figure lives in the count line, not as a third colour.
      var r = 1.7 * m.dpr;
      for (var i = m.drawn; i < reveal; i++) {
        var p = m.list[i];
        bctx.beginPath();
        bctx.fillStyle = p.home ? "#4f7cff" : "#31d0d6";
        bctx.globalAlpha = 0.8;
        bctx.arc(p.x, p.y, r, 0, 6.2832);
        bctx.fill();
      }
      bctx.globalAlpha = 1;
      m.drawn = reveal;
    };
    buildBorder();
    var bP = { n: 0 },
      bcEl = $("#bdCount"),
      bchEl = $("#bdChildren");
    gsap.timeline({
      scrollTrigger: {
        trigger: "#borderViz",
        start: "top 80%",
        end: "bottom 62%",
        scrub: true,
      },
    }).to(bP, {
      n: 1,
      ease: "none",
      duration: 1,
      onUpdate: function () {
        drawBorder(bP.n * bMarks.list.length);
        if (bcEl) bcEl.textContent = (117.8 * bP.n).toFixed(1) + "M";
        if (bchEl) bchEl.textContent = Math.round(45 * bP.n) + "M";
      },
    });
    var bz;
    window.addEventListener("resize", function () {
      clearTimeout(bz);
      bz = setTimeout(function () {
        buildBorder();
        drawBorder(bMarks.list.length);
      }, 200);
    });
  }

  // ── THE DISSOLVE · the machine falls away for the human cost ──
  // Scrubbed, not snapped: the chrome degrades as the reader descends, so the
  // 244,700 lives land in silence with no dossier furniture around them.
  var chrome = ".fx, .hud";
  if ($("#humanPivot"))
    gsap.timeline({
      scrollTrigger: {
        trigger: "#humanPivot",
        start: "top 85%",
        end: "top 35%",
        scrub: true,
      },
    }).to(chrome, { opacity: 0, ease: "power1.inOut" });

  // ── RE-ARM · the file becomes the viewer's own ──
  // A little chrome returns for the interactive half — now it's THEIR file.
  if ($("#haveyoursay"))
    gsap.timeline({
      scrollTrigger: {
        trigger: "#haveyoursay",
        start: "top 85%",
        end: "top 45%",
        scrub: true,
      },
      // immediateRender:false — otherwise the "from" state stomps the chrome
      // to invisible at page load, before the reader has scrolled anywhere.
    }).fromTo(
      chrome,
      { opacity: 0 },
      { opacity: 1, ease: "power1.inOut", immediateRender: false },
    );

  // ══ 244,700 · ONE, THEN ALL ══
  // The climax, and the one scene that must not feel designed. It opens on a
  // SINGLE point of light and holds there — one person — then a second, then a
  // handful you can still count, and then the field floods faster than anyone
  // can follow. Every point after the first is drawn slightly smaller than the
  // last, so a person visibly degrades into a pixel: the reader feels the exact
  // moment a human being becomes a statistic, which is the argument.
  var livesCv = $("#livesCanvas");
  if (livesCv) {
    var lctx = livesCv.getContext("2d");
    var lcfg = null;
    var livesProg = 0;
    var countEl = $("#livesCount"),
      labelEl = $("#livesLabel");
    var LIVES = typeof DEATHS_PER_YEAR !== "undefined" ? DEATHS_PER_YEAR : 244700;

    // deterministic scatter — a redraw must be pixel-identical
    var hash = function (n) {
      var x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    function livesSetup() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var st = livesCv.parentElement.getBoundingClientRect();
      // guarded: a zero/nonsense measurement must never leave a blank canvas
      var w = st.width > 0 ? st.width : window.innerWidth || 900;
      var h = st.height > 0 ? st.height : window.innerHeight || 700;
      livesCv.width = Math.round(w * dpr);
      livesCv.height = Math.round(h * dpr);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, w, h);
      lcfg = { w: w, h: h, drawn: 0 };
    }

    // the field grows OUTWARD from the first light rather than filling a grid
    function pointAt(i, c) {
      var spread = 0.06 + 0.94 * Math.min(i / 500, 1); // first ones cluster
      var ang = hash(i + 1) * 6.2832;
      var rad = Math.sqrt(hash(i + 91)) * spread;
      return {
        x: c.w * 0.5 + Math.cos(ang) * rad * c.w * 0.62,
        y: c.h * 0.5 + Math.sin(ang) * rad * c.h * 0.62,
      };
    }

    function livesDraw(reveal) {
      if (!lcfg) livesSetup();
      if (!lcfg) return;
      var c = lcfg;
      reveal = Math.max(0, Math.min(LIVES, Math.floor(reveal)));
      if (reveal < c.drawn) {
        lctx.clearRect(0, 0, c.w, c.h);
        c.drawn = 0;
      }
      for (var i = c.drawn; i < reveal; i++) {
        var p = pointAt(i, c);
        // a person becomes a pixel: radius decays from 5.5px to a 1px speck
        var r = Math.max(0.5, 5.5 * (1 - Math.min(i / 2200, 1)));
        var a = i < 60 ? 1 : 0.3 + hash(i + 7) * 0.55;
        lctx.fillStyle = "rgba(255,255,255," + a.toFixed(2) + ")";
        if (r <= 0.75) {
          lctx.fillRect(p.x, p.y, 1, 1); // specks: cheap, and there are many
        } else {
          if (i < 40) {
            lctx.shadowColor = "rgba(255,255,255,0.9)"; // the first few glow
            lctx.shadowBlur = 14;
          }
          lctx.beginPath();
          lctx.arc(p.x, p.y, r, 0, 6.2832);
          lctx.fill();
          lctx.shadowBlur = 0;
        }
      }
      c.drawn = reveal;
    }

    // what the reader is told, at the moment they can still bear to be told it
    function livesLabel(n) {
      if (n <= 1) return "one person killed in armed conflict";
      if (n < 12) return "still countable";
      if (n < 2000) return "you have already stopped counting";
      if (n < 120000) return "every point is one person who wanted to live";
      return "in a single year";
    }

    livesSetup();
    if (countEl) countEl.textContent = "0";
    if (labelEl) labelEl.textContent = "";
    // main.js repaints the whole field on resize — hand it ours instead
    window.drawLives = function () {
      livesSetup();
      livesDraw(revealFor(livesProg));
    };

    // steep curve: the first light holds alone for a real beat, then the
    // field outruns comprehension. Tune the exponent to change that pacing.
    function revealFor(p) {
      if (p < 0.04) return 0;
      return Math.max(1, Math.floor(LIVES * Math.pow(p, 5)));
    }

    ScrollTrigger.create({
      trigger: "#livesScene",
      start: "top top",
      end: px(1.6), // the climax earns a longer hold than the other scenes
      pin: "#livesStage",
      scrub: true,
      onUpdate: function (self) {
        livesProg = self.progress;
        var n = revealFor(livesProg);
        livesDraw(n);
        if (countEl) countEl.textContent = n.toLocaleString();
        if (labelEl) labelEl.textContent = livesLabel(n);
      },
    });

    // the rate, live: one death every ~129 seconds, counted from page open.
    // The same device as the hero's money counter, now counting people.
    var sinceEl = $("#livesSince");
    if (sinceEl) {
      var openedAt = Date.now();
      var tickSince = function () {
        var secs = (Date.now() - openedAt) / 1000;
        sinceEl.textContent = Math.floor(secs * (LIVES / 31536000));
      };
      tickSince();
      setInterval(tickSince, 5000); // cheap: the figure moves every ~2 minutes
    }
  }

  // the page grows as canvases/globe lazy-build — keep triggers honest
  window.addEventListener("load", function () {
    if (window.drawLives) window.drawLives(); // re-size the lives field once laid out
    ScrollTrigger.refresh();
  });
  var rz;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      ScrollTrigger.refresh();
    }, 200);
  });
})();
