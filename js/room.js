/* ═══════════════════════════════════════════════════════════════════════
   THE COST OF WAR · THE ROOM
   ───────────────────────────────────────────────────────────────────────
   A navigable space hung with every letter written on this page — one sheet
   for one person. After the installation reference: thousands of suspended
   pages filling the volume floor to ceiling, the viewer small inside it.

   HONESTY RULES (these are load-bearing, do not quietly relax them):
   · A sheet is only READABLE if that letter was opted in by its author AND
     cleared by a moderator. approved_letters() is the only source; there is
     no client path to an unapproved letter.
   · When there is not yet enough real participation to make an artwork, the
     room fills with SAMPLE sheets that are labelled as such on screen. They
     are never presented as real people and they disappear the moment real
     letters exist.
   · Nothing here invents a message. Sample sheets carry no invented words —
     they are blank paper.

   Three.js is lazy-loaded only when the room nears the viewport, and the
   render loop is stopped whenever the room is off screen.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var $ = function (s) {
    return document.querySelector(s);
  };
  var section = $("#roomSection");
  if (!section) return;

  var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";
  var reduce =
    (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    location.search.indexOf("static") > -1;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;

  // ── how many sheets can hang before it costs more than it says ──
  var MAX_SHEETS = isMobile ? 500 : 2200;
  // below this much real participation the room cannot yet be an artwork
  var SAMPLE_THRESHOLD = 150;

  var el = {
    stage: $("#roomStage"),
    canvas: $("#roomCanvas"),
    loading: $("#roomLoading"),
    badge: $("#roomBadge"),
    hint: $("#roomHint"),
    reader: $("#roomReader"),
    readerX: $("#roomReaderX"),
    readerMeta: $("#roomReaderMeta"),
    readerBody: $("#roomReaderBody"),
    people: $("#rdPeople"),
    countries: $("#rdCountries"),
    letters: $("#rdLetters"),
    ages: $("#rdAges"),
    findings: $("#rdFindings"),
  };

  var AGE_LABEL = {
    "under-18": "Under 18",
    "18-24": "18 – 24",
    "25-34": "25 – 34",
    "35-49": "35 – 49",
    "50-64": "50 – 64",
    "65-plus": "65 or over",
  };

  // ─────────────────────────────────────────────────────────────────────
  //  DATA
  // ─────────────────────────────────────────────────────────────────────
  var room = { letters: [], stats: null, ages: [], sample: false };

  function loadData() {
    if (typeof window.__cowRoom === "function") return window.__cowRoom(600);
    return Promise.resolve({ letters: [], stats: null, ages: [] });
  }

  function fmt(n) {
    return (n || 0).toLocaleString();
  }

  function paintData() {
    var s = room.stats || {};
    var people = s.people || 0;
    var letters = room.letters.length;
    if (el.people) el.people.textContent = people ? fmt(people) : "0";
    if (el.countries) el.countries.textContent = fmt(s.countries || 0);
    if (el.letters) el.letters.textContent = fmt(letters);

    // ── who is writing ──
    if (el.ages) {
      var total = room.ages.reduce(function (a, r) {
        return a + Number(r.people || 0);
      }, 0);
      if (!total) {
        el.ages.innerHTML =
          '<div class="rd-empty">No age data yet — it is optional, and ' +
          "shown here only once people have given it.</div>";
      } else {
        el.ages.innerHTML = room.ages
          .map(function (r) {
            var pct = Math.round((100 * Number(r.people)) / total);
            return (
              '<div class="rd-age"><span class="rd-age-l">' +
              (AGE_LABEL[r.band] || r.band) +
              '</span><span class="rd-age-bar"><i style="width:' +
              pct +
              '%"></i></span><span class="rd-age-n">' +
              pct +
              "%</span></div>"
            );
          })
          .join("");
      }
    }

    // ── what the room says — derived only from real submissions ──
    if (el.findings) {
      var out = [];
      var names = typeof issueData !== "undefined" ? issueData : null;
      if (s.top_first_choice != null && names && names[s.top_first_choice]) {
        out.push(
          "<b>" +
            (s.top_first_share || 0) +
            "%</b> put <b>" +
            names[s.top_first_choice].name +
            "</b> first — the most common opening priority.",
        );
      }
      if (s.tax_to_war_total > 0) {
        out.push(
          "Together, the people here pay <b>$" +
            fmt(Math.round(s.tax_to_war_total)) +
            "</b> a year toward militaries, from " +
            fmt(s.tax_people) +
            " who checked.",
        );
      }
      if (s.countries > 1) {
        out.push(
          "Letters have come from <b>" +
            fmt(s.countries) +
            "</b> countries. Every one of them spends more on its military than on this.",
        );
      }
      if (people > 0 && s.first_at) {
        out.push(
          "The first letter was written on <b>" +
            new Date(s.first_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }) +
            "</b>.",
        );
      }
      el.findings.innerHTML = out.length
        ? out
            .map(function (t) {
              return "<li>" + t + "</li>";
            })
            .join("")
        : '<li class="rd-empty">The room is still empty. These findings are ' +
          "written from real submissions only, so they appear as people take part.</li>";
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  //  PAPER TEXTURE — a page of type, never real words at this size
  // ─────────────────────────────────────────────────────────────────────
  function makePaperTexture(THREE, variant) {
    var c = document.createElement("canvas");
    c.width = 256;
    c.height = 340;
    var x = c.getContext("2d");
    x.fillStyle = "#f3f1ea";
    x.fillRect(0, 0, c.width, c.height);
    // faint ruled body copy — legibility comes from the HTML reader, not here
    var y = 46 + (variant % 3) * 6;
    x.fillStyle = "rgba(20,22,26,0.44)";
    while (y < c.height - 40) {
      var w = 150 + Math.random() * 70;
      x.fillRect(34, y, w, 3.2);
      y += 13;
    }
    // a heavier line near the top reads as a salutation
    x.fillStyle = "rgba(20,22,26,0.7)";
    x.fillRect(34, 28, 96, 5);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
    t.anisotropy = 4;
    return t;
  }

  // ─────────────────────────────────────────────────────────────────────
  //  THE SCENE
  // ─────────────────────────────────────────────────────────────────────
  var R = {}; // three-related state
  var running = false;

  function build(THREE) {
    var stage = el.stage;
    var w = stage.clientWidth || 900;
    var h = stage.clientHeight || 600;

    R.scene = new THREE.Scene();
    R.scene.background = new THREE.Color(0x06070a);
    R.scene.fog = new THREE.FogExp2(0x06070a, 0.055);

    R.camera = new THREE.PerspectiveCamera(58, w / h, 0.35, 120);
    R.camera.position.set(0, 1.6, 17);

    R.renderer = new THREE.WebGLRenderer({
      canvas: el.canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    R.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    R.renderer.setSize(w, h, false);

    R.scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 8, 6);
    R.scene.add(key);

    // floor: just enough to ground the space
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshBasicMaterial({ color: 0x0b0d11 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.2;
    R.scene.add(floor);

    // ── the sheets ──
    var count = R.count;
    var geo = new THREE.PlaneGeometry(0.62, 0.84);
    var mat = new THREE.MeshLambertMaterial({
      map: makePaperTexture(THREE, 1),
      side: THREE.DoubleSide,
      transparent: false,
    });
    R.mesh = new THREE.InstancedMesh(geo, mat, count);
    R.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // per-instance tint: sheets carrying a real, cleared letter sit brighter
    var colors = new Float32Array(count * 3);
    R.data = [];
    var dummy = new THREE.Object3D();
    for (var i = 0; i < count; i++) {
      // fill a volume, denser overhead like the reference
      // keep a clear bubble around the entry point, otherwise a sheet spawns
      // on the lens and reads as a grey wall instead of a room
      var a, rad, px, py, pz, guard = 0;
      do {
        a = Math.random() * Math.PI * 2;
        rad = 1.2 + Math.sqrt(Math.random()) * 16;
        px = Math.cos(a) * rad;
        py = -2.6 + Math.pow(Math.random(), 0.75) * 11;
        pz = Math.sin(a) * rad;
      } while (
        ++guard < 8 &&
        px * px + (py - 1.6) * (py - 1.6) + (pz - 17) * (pz - 17) < 30
      );
      var p = {
        x: px,
        y: py,
        z: pz,
        rx: (Math.random() - 0.5) * 0.5,
        ry: Math.random() * Math.PI * 2,
        rz: (Math.random() - 0.5) * 0.35,
        ph: Math.random() * Math.PI * 2, // drift phase
        letter: null,
      };
      R.data.push(p);
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.updateMatrix();
      R.mesh.setMatrixAt(i, dummy.matrix);
      var lit = 0.62;
      colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = lit;
    }
    // attach real letters to the nearest sheets so they are findable
    room.letters.forEach(function (L, k) {
      if (k >= count) return;
      R.data[k].letter = L;
      colors[k * 3] = 1;
      colors[k * 3 + 1] = 1;
      colors[k * 3 + 2] = 1;
    });
    R.mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    R.scene.add(R.mesh);

    R.raycaster = new THREE.Raycaster();
    R.pointer = new THREE.Vector2();
    R.THREE = THREE;
    R.dummy = dummy;
    R.yaw = 0;
    R.pitch = 0;
    R.dolly = 0;
    R.t0 = performance.now();
  }

  function resize() {
    if (!R.renderer) return;
    var w = el.stage.clientWidth || 900;
    var h = el.stage.clientHeight || 600;
    R.camera.aspect = w / h;
    R.camera.updateProjectionMatrix();
    R.renderer.setSize(w, h, false);
  }

  function frame() {
    if (!running) return;
    var t = (performance.now() - R.t0) / 1000;
    // a slow breath through the paper — the sheets are hung, not static
    if (!reduce) {
      var d = R.dummy;
      for (var i = 0; i < R.count; i++) {
        var p = R.data[i];
        d.position.set(
          p.x + Math.sin(t * 0.22 + p.ph) * 0.05,
          p.y + Math.sin(t * 0.3 + p.ph) * 0.045,
          p.z + Math.cos(t * 0.19 + p.ph) * 0.05,
        );
        d.rotation.set(p.rx, p.ry + Math.sin(t * 0.16 + p.ph) * 0.09, p.rz);
        d.updateMatrix();
        R.mesh.setMatrixAt(i, d.matrix);
      }
      R.mesh.instanceMatrix.needsUpdate = true;
    }
    R.camera.rotation.order = "YXZ";
    R.camera.rotation.y = R.yaw;
    R.camera.rotation.x = R.pitch;
    R.camera.position.z = 17 - R.dolly;
    R.renderer.render(R.scene, R.camera);
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !R.renderer) return;
    running = true;
    R.t0 = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
  }

  // ─────────────────────────────────────────────────────────────────────
  //  INTERACTION
  // ─────────────────────────────────────────────────────────────────────
  function openReader(p) {
    if (!el.reader) return;
    if (room.sample || !p || !p.letter) {
      el.readerMeta.textContent = room.sample
        ? "Sample sheet · preview"
        : "A blank sheet";
      el.readerBody.innerHTML = room.sample
        ? "<p>This sheet is part of a preview of the artwork, not a real " +
          "participant. Nothing has been written on it. Real letters appear " +
          "here as people take part and their words are cleared for sharing.</p>"
        : "<p>This person took part but chose not to share their letter. " +
          "Their sheet still hangs here.</p>";
    } else {
      var L = p.letter;
      var when = L.created_at
        ? new Date(L.created_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
      el.readerMeta.textContent =
        [L.country || "Somewhere", AGE_LABEL[L.age_band] || "", when]
          .filter(Boolean)
          .join(" · ");
      el.readerBody.textContent = L.letter || "";
    }
    el.reader.hidden = false;
  }
  if (el.readerX)
    el.readerX.addEventListener("click", function () {
      el.reader.hidden = true;
    });

  function bindControls() {
    var stage = el.stage;
    var dragging = false,
      lx = 0,
      ly = 0,
      moved = 0;

    stage.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = 0;
      lx = e.clientX;
      ly = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx,
        dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      R.yaw -= dx * 0.0032;
      R.pitch = Math.max(-0.9, Math.min(0.9, R.pitch - dy * 0.0026));
    });
    stage.addEventListener("pointerup", function (e) {
      dragging = false;
      // a click, not a drag → try to open the sheet under the cursor
      if (moved < 6) pick(e);
    });

    // No wheel capture. The room now sits directly under the title, so it must
    // never trap the page scroll; you drag to look, and the page scrolls past
    // it normally. (Dolly stays 0.)
  }

  function pick(e) {
    if (!R.raycaster) return;
    var r = el.stage.getBoundingClientRect();
    R.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    R.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    R.raycaster.setFromCamera(R.pointer, R.camera);
    var hits = R.raycaster.intersectObject(R.mesh);
    if (hits.length && hits[0].instanceId != null)
      openReader(R.data[hits[0].instanceId]);
  }

  // ─────────────────────────────────────────────────────────────────────
  //  BOOT
  // ─────────────────────────────────────────────────────────────────────
  function loadThree() {
    return new Promise(function (res, rej) {
      if (window.THREE) return res(window.THREE);
      var s = document.createElement("script");
      s.src = THREE_URL;
      s.onload = function () {
        res(window.THREE);
      };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function boot() {
    loadData()
      .then(function (d) {
        room.letters = d.letters || [];
        room.stats = d.stats || null;
        room.ages = d.ages || [];
        var real = (room.stats && room.stats.people) || 0;
        room.sample = real < SAMPLE_THRESHOLD;
        paintData();

        // the room is only ever as big as the participation it represents,
        // unless we are openly previewing it
        R.count = room.sample
          ? Math.min(MAX_SHEETS, isMobile ? 400 : 1200)
          : Math.max(1, Math.min(MAX_SHEETS, real));

        if (room.sample && el.badge) {
          el.badge.hidden = false;
          el.badge.innerHTML =
            "PREVIEW · these are sample sheets, not real participants" +
            (real ? " — " + fmt(real) + " real so far" : "");
        }
        return loadThree();
      })
      .then(function (THREE) {
        if (!THREE) throw new Error("three unavailable");
        build(THREE);
        bindControls();
        if (el.loading) el.loading.hidden = true;
        R.renderer.render(R.scene, R.camera);
        if (!reduce) {
          // Start rendering straight away — boot only happens once the room is
          // in view, so it IS visible now. The observer is used ONLY to pause
          // when it scrolls off and resume when it returns. (Previously the
          // loop's start depended on the observer firing, so if the observer
          // never delivered a callback the room stayed a black canvas.)
          start();
          var io = new IntersectionObserver(
            function (es) {
              es.forEach(function (en) {
                en.isIntersecting ? start() : stop();
              });
            },
            { rootMargin: "120px" },
          );
          io.observe(el.stage);
        }
        window.addEventListener("resize", function () {
          resize();
          if (reduce && R.renderer) R.renderer.render(R.scene, R.camera);
        });
      })
      .catch(function (err) {
        // no WebGL / no network: say so plainly, keep the numbers
        if (el.loading)
          el.loading.textContent =
            "The room needs 3D graphics, which this browser did not provide. The figures below still apply.";
        console.warn("[room]", err && err.message);
      });
  }

  // Boot when the reader scrolls the room up into view — never at first paint.
  // The room now sits right at the fold, so a margin-based observer would fire
  // on load and pull Three.js into the critical path. Requiring the section top
  // to cross meaningfully into the viewport guarantees it waits for a real
  // scroll, and it is trivially testable (unlike IntersectionObserver, which
  // some embedded contexts never deliver).
  var booted = false;
  function maybeBoot() {
    if (booted) return;
    if (section.getBoundingClientRect().top < window.innerHeight * 0.82) {
      booted = true;
      window.removeEventListener("scroll", maybeBoot);
      boot();
    }
  }
  window.addEventListener("scroll", maybeBoot, { passive: true });
  maybeBoot(); // covers a refresh that lands already scrolled down the page
})();
