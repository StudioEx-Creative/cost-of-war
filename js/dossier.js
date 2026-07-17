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
  var NUKE_B = 119; // ICAN 2026

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
    // every mirror rests at its final, readable figure
    [
      ["#odo01", fmtMoney(DEF)],
      ["#odo02", "$" + NUKE_B + "B"],
      ["#odo03", "$21.8T"],
      ["#odo04", "$588B"],
    ].forEach(function (p) {
      var el = $(p[0]);
      if (el) el.textContent = p[1];
    });
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

  var asB = function (v) {
    return "$" + Math.round(v) + "B";
  };

  buildMirror({
    scene: "#mirror02",
    stage: "#mirror02Stage",
    mirror: "#mirror02Mirror",
    odo: "#odo02",
    seal: "#seal02",
    value: NUKE_B,
    fmt: asB,
    odoEnd: 0.38,
    splitEnd: 22,
    end: px(0.9),
  });

  // MIRROR 3 · $21.8T total cost of violence ↔ $2,650 taken from every person
  buildMirror({
    scene: "#mirror03",
    stage: "#mirror03Stage",
    mirror: "#mirror03Mirror",
    odo: "#odo03",
    seal: "#seal03",
    value: 21800, // $B — IEP GPI 2026
    fmt: function (v) {
      return "$" + (v / 1000).toFixed(1) + "T"; // the site says $21.8T, not $21.80T
    },
    odoEnd: 0.4,
    splitEnd: 20,
    end: px(0.9),
  });

  // MIRROR 4 · $588B to rebuild one war ↔ $114B/yr of clean water for everyone
  buildMirror({
    scene: "#mirror04",
    stage: "#mirror04Stage",
    mirror: "#mirror04Mirror",
    odo: "#odo04",
    seal: "#seal04",
    value: 588, // World Bank RDNA5 2026
    fmt: asB,
    odoEnd: 0.38,
    splitEnd: 22,
    end: px(0.9),
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

  // the page grows as canvases/globe lazy-build — keep triggers honest
  window.addEventListener("load", function () {
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
