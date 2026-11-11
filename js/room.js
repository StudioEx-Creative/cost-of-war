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

   Three.js is lazy-loaded only when the room nears the viewport (never in a
   browser without 3D, and given up after 15 s), kept private to the room
   (see loadThree), and the render loop is stopped whenever the room is off screen.
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
    mine: $("#roomMine"),
    mineLead: $("#roomMineLead"),
    aim: $("#roomAim"),
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
        : '<li class="rd-empty">The archive is still empty. These findings are ' +
          "written from real submissions only, so they appear as people take part.</li>";
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  //  PAPER TEXTURE — a page of type, never real words at this size
  // ─────────────────────────────────────────────────────────────────────
  function paperCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    var x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, w * 0.3, h);
    g.addColorStop(0, "#3c3c3c");
    g.addColorStop(1, "#1e1e1e");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    return { c: c, x: x };
  }
  function toTexture(THREE, c) {
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
    t.anisotropy = 4;
    return t;
  }
  // blank paper with a thin lit edge. No marks: legibility comes from the HTML reader, not here
  function makePaperTexture(THREE) {
    var p = paperCanvas(256, 346);
    p.x.strokeStyle = "rgba(255,255,255,0.5)";
    p.x.lineWidth = 5;
    p.x.strokeRect(2.5, 2.5, 251, 341);
    p.x.fillStyle = "rgba(255,255,255,0.6)";
    p.x.fillRect(0, 0, 256, 5);
    return toTexture(THREE, p.c);
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
    R.scene.background = new THREE.Color(0x0a0a0a);
    R.scene.fog = new THREE.FogExp2(0x0a0a0a, isMobile ? 0.058 : 0.075);

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
      new THREE.MeshBasicMaterial({ color: 0x0c0c0c }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.2;
    R.scene.add(floor);

    // ── the sheets ──
    var count = R.count;
    var geo = new THREE.PlaneGeometry(0.62, 0.84);
    var mat = new THREE.MeshLambertMaterial({
      map: makePaperTexture(THREE),
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
        ++guard < 14 &&
        px * px + (py - 1.6) * (py - 1.6) + (pz - 17) * (pz - 17) < 70
      );
      var p = {
        x: px,
        y: py,
        z: pz,
        rx: (Math.random() - 0.5) * 0.5,
        ry: (Math.random() - 0.5) * 0.9, // hung facing the room, so each still reads as a sheet
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

    // every sheet hangs on a thread from above: one draw call
    var seg = new Float32Array(count * 6);
    R.data.forEach(function (p, i) {
      seg.set([p.x, p.y + 0.42, p.z, p.x, 16, p.z], i * 6);
    });
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(seg, 3));
    R.scene.add(
      new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, depthWrite: false }),
      ),
    );

    R.raycaster = new THREE.Raycaster();
    R.pointer = new THREE.Vector2();
    R.THREE = THREE;
    R.dummy = dummy;
    R.yaw = 0;
    R.pitch = 0;
    R.dolly = 0;
    R.v = new THREE.Vector3();
    R.t0 = performance.now();
  }

  function resize() {
    if (!R.renderer) return;
    var w = el.stage.clientWidth || 900;
    var h = el.stage.clientHeight || 600;
    R.camera.aspect = w / h;
    R.camera.updateProjectionMatrix();
    R.renderer.setSize(w, h, false);
    layoutMine();
    if (el.aim) el.aim.hidden = true;
    if (document.activeElement === el.stage && el.stage.matches(":focus-visible")) aim();
  }

  function pointCamera() {
    R.camera.rotation.order = "YXZ";
    R.camera.rotation.y = R.yaw;
    R.camera.rotation.x = R.pitch;
    R.camera.position.z = 17 - R.dolly;
    R.camera.updateMatrixWorld();
  }

  // one picture, for reduced motion and for a change made while the loop is not running
  function still() {
    if (!R.renderer || running) return;
    pointCamera();
    R.renderer.render(R.scene, R.camera);
    placeMine();
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
    pointCamera();
    R.renderer.render(R.scene, R.camera);
    placeMine();
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
  //  THE READER'S OWN SHEET
  //  Hangs only for someone who ticked the letter opt-in and sent the form, in
  //  this visit only. It stays blank and unnamed: their words are not here and
  //  never can be until a moderator clears them (see HONESTY RULES above). It is
  //  not one of the counted sheets.
  // ─────────────────────────────────────────────────────────────────────
  var wantMine = false;
  if (window.ToolView)
    window.ToolView.on("coalition", function (s) {
      if (s && s.submitted && s.letterOptIn) {
        wantMine = true;
        hangMine();
      }
    });

  function hangMine() {
    if (!wantMine || R.mine || !R.scene) return;
    var THREE = R.THREE;
    // where the storyboard hangs it, as a share of the stage: clear of the words at any width
    var wide = el.stage.clientWidth / (el.stage.clientHeight || 1);
    var at = isMobile ? [0.4, 1.72, 12.2] : [(wide < 1.5 ? 0.24 : 0.1375) * wide * 4.767, 1.88, 12.7];
    var p = paperCanvas(256, 346);
    var lit = p.x.createLinearGradient(0, 0, 0, 346);
    lit.addColorStop(0, "rgba(255,255,255,0.08)");
    lit.addColorStop(1, "rgba(255,255,255,0)");
    p.x.fillStyle = lit;
    p.x.fillRect(0, 0, 256, 346);
    p.x.strokeStyle = "#ffffff";
    p.x.lineWidth = 4;
    p.x.strokeRect(2, 2, 252, 342);
    p.x.fillStyle = "#3c8fde";
    p.x.fillRect(0, 0, 20, 20);
    R.mine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.84),
      new THREE.MeshBasicMaterial({ map: toTexture(THREE, p.c), fog: false, side: THREE.DoubleSide }),
    );
    R.mine.position.set(at[0], at[1], at[2]);
    R.scene.add(R.mine);

    // a beam from above, then the thread it hangs on
    var b = document.createElement("canvas");
    b.width = 128;
    b.height = 256;
    var x = b.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(255,255,255,0.26)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(56, 0);
    x.lineTo(72, 0);
    x.lineTo(128, 256);
    x.lineTo(0, 256);
    x.fill();
    var beam = new THREE.Mesh(
      new THREE.PlaneGeometry(isMobile ? 1.7 : 2.6, 7),
      new THREE.MeshBasicMaterial({ map: toTexture(THREE, b), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    beam.position.set(at[0], at[1] + 2.35, at[2] - 0.05);
    R.scene.add(beam);
    var tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array([at[0], at[1] + 0.42, at[2], at[0], 16, at[2]]), 3));
    R.scene.add(new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, fog: false })));
    el.stage.setAttribute("aria-label", "The Archive, a room of hanging sheets. Yours is here, blank, awaiting review");

    layoutMine();
    still();
  }

  // where a point in the room falls on the stage, in px
  function onStage(x, y, z) {
    var v = R.v.set(x, y, z).project(R.camera);
    return { x: ((v.x + 1) / 2) * el.stage.clientWidth, y: ((1 - v.y) / 2) * el.stage.clientHeight, z: v.z };
  }

  // the tag, leader and inset are drawn once for the sheet's size; after that they move as one, by transform
  function layoutMine() {
    if (!R.mine || !el.mine) return;
    pointCamera();
    var m = R.mine.position;
    var a = onStage(m.x - 0.31, m.y + 0.42, m.z);
    var b = onStage(m.x + 0.31, m.y - 0.42, m.z);
    var mw = b.x - a.x,
      mh = b.y - a.y,
      W = el.stage.clientWidth;
    el.mine.hidden = false;
    el.mine.style.setProperty("--mw", mw + "px");
    el.mine.style.setProperty("--mh", mh + "px");
    var phone = W < 768,
      iw = phone ? 130 : 230,
      ix = phone ? 16 - a.x : Math.min(mw + 116, W - 56 - iw - a.x),
      iy = mh + (phone ? 64 : 44),
      roomy = phone ? W >= 360 : ix > mw + 24,
      pts = phone
        ? [[2, mh - 4], [ix + iw + 14, mh - 4], [ix + iw + 14, iy + 30], [ix + iw, iy + 30]]
        : [[mw - 6, mh - 6], [ix - 20, iy + 40], [ix, iy + 40]];
    el.mine.style.setProperty("--ix", ix + "px");
    el.mine.style.setProperty("--iy", iy + "px");
    el.mine.classList.toggle("no-fig", !roomy);
    if (el.mineLead) el.mineLead.setAttribute("points", pts.join(" "));
    placeMine();
  }
  function placeMine() {
    if (!R.mine || !el.mine) return;
    var m = R.mine.position;
    var a = onStage(m.x - 0.31, m.y + 0.42, m.z);
    var seen = a.z < 1 && a.x > -200 && a.x < el.stage.clientWidth + 40 && a.y > -300 && a.y < el.stage.clientHeight + 40;
    el.mine.style.opacity = seen ? 1 : 0;
    el.mine.style.transform = "translate3d(" + a.x.toFixed(1) + "px," + a.y.toFixed(1) + "px,0)";
  }

  // ─────────────────────────────────────────────────────────────────────
  //  KEYBOARD: the arrow keys look around, Enter opens the ringed sheet.
  //  The ring is the focus ring of the room: it sits on the sheet nearest the centre.
  // ─────────────────────────────────────────────────────────────────────
  var aimed = null;
  function aim() {
    if (!R.renderer || !el.aim) return;
    pointCamera();
    var best = null,
      bestScore = 1e9,
      W = el.stage.clientWidth,
      H = el.stage.clientHeight;
    function consider(p, x, y, z) {
      var q = onStage(x, y, z);
      if (q.z >= 1 || q.x < 0 || q.x > W || q.y < 0 || q.y > H) return;
      var d = R.v.set(x, y, z).distanceTo(R.camera.position);
      var score = Math.hypot(q.x - W / 2, q.y - H / 2) + d * 9; // near the centre, and near the viewer
      if (score < bestScore) {
        bestScore = score;
        best = { p: p, x: x, y: y, z: z };
      }
    }
    R.data.forEach(function (p) {
      consider(p, p.x, p.y, p.z);
    });
    if (R.mine) consider({ mine: true }, R.mine.position.x, R.mine.position.y, R.mine.position.z);
    aimed = best;
    if (!best) {
      el.aim.hidden = true;
      return;
    }
    var a = onStage(best.x - 0.31, best.y + 0.42, best.z);
    var b = onStage(best.x + 0.31, best.y - 0.42, best.z);
    el.aim.style.width = Math.max(14, b.x - a.x) + 8 + "px";
    el.aim.style.height = Math.max(20, b.y - a.y) + 8 + "px";
    el.aim.style.transform = "translate3d(" + (a.x - 4).toFixed(1) + "px," + (a.y - 4).toFixed(1) + "px,0)";
    el.aim.hidden = false;
  }
  function bindKeys() {
    var stage = el.stage;
    stage.addEventListener("keydown", function (e) {
      if (!R.renderer || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        if (!aimed) aim();
        if (aimed) openReader(aimed.p);
        return;
      }
      if (k === "ArrowLeft") R.yaw += 0.07;
      else if (k === "ArrowRight") R.yaw -= 0.07;
      else if (k === "ArrowUp") R.pitch = Math.min(0.9, R.pitch + 0.05);
      else if (k === "ArrowDown") R.pitch = Math.max(-0.9, R.pitch - 0.05);
      else return;
      e.preventDefault();
      aim();
      still();
    });
    stage.addEventListener("focus", function () {
      if (stage.matches(":focus-visible")) aim();
    });
    stage.addEventListener("blur", function () {
      if (el.aim) el.aim.hidden = true;
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  //  INTERACTION
  // ─────────────────────────────────────────────────────────────────────
  function letterMeta(L) {
    var when = L.created_at
      ? new Date(L.created_at).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";
    return [L.country || "Somewhere", AGE_LABEL[L.age_band] || "", when]
      .filter(Boolean)
      .join(" · ");
  }

  // the reader is a dialog: focus goes in, stays in, and comes back to what opened it
  var openedFrom = null;
  function showReader() {
    openedFrom = document.activeElement;
    el.reader.hidden = false;
    var scroller = el.reader.querySelector(".room-reader-scroll");
    if (scroller) scroller.scrollTop = 0;
    if (el.readerX) el.readerX.focus();
  }
  function closeReader() {
    el.reader.hidden = true;
    if (openedFrom && openedFrom.focus) openedFrom.focus({ preventScroll: true });
    openedFrom = null;
  }

  function openReader(p) {
    if (!el.reader) return;
    if (p && p.mine) {
      // the reader's own sheet: never their words, only what is true of it now
      el.readerMeta.textContent = "Your sheet · awaiting review";
      el.readerBody.innerHTML =
        "<p>Nothing is written on it yet. A person reads every letter first. " +
        "Your words appear here only if they are cleared, and without your name or email.</p>";
      showReader();
      return;
    }
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
      el.readerMeta.textContent = letterMeta(L);
      el.readerBody.textContent = L.letter || "";
    }
    showReader();
  }
  if (el.readerX) el.readerX.addEventListener("click", closeReader);
  if (el.reader) {
    el.reader.addEventListener("click", function (e) {
      if (e.target === el.reader) closeReader();
    });
    el.reader.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeReader();
      } else if (e.key === "Tab") {
        // the close button is the one control inside
        e.preventDefault();
        el.readerX.focus();
      }
    });
  }

  function bindControls() {
    var stage = el.stage;
    var dragging = false,
      lx = 0,
      ly = 0,
      moved = 0;

    stage.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = 0;
      if (el.aim) el.aim.hidden = true;
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
      still(); // reduced motion has no loop, and must still be able to look around
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
    if (R.mine) {
      var own = R.raycaster.intersectObject(R.mine);
      var rest = R.raycaster.intersectObject(R.mesh);
      if (own.length && (!rest.length || own[0].distance <= rest[0].distance)) return openReader({ mine: true });
    }
    var hits = R.raycaster.intersectObject(R.mesh);
    if (hits.length && hits[0].instanceId != null)
      openReader(R.data[hits[0].instanceId]);
  }

  // ─────────────────────────────────────────────────────────────────────
  //  BOOT
  // ─────────────────────────────────────────────────────────────────────
  // three.js stays private to the room. Its file puts itself on window.THREE, and globe.gl (the
  // coalition globe) takes any window.THREE it finds over its own built-in copy: with this older
  // one it failed ('s3.Timer is not a constructor') and the globe lost its 3D whenever the Archive
  // was opened first. So the room keeps its copy here and puts window.THREE back as it was the
  // moment the file has run (nothing can run in between: 'load' fires straight after the file).
  var three = null;
  var LIMIT = 15000; // a download that never ends gets the no-3D room, not a wait with no end
  // the same test the globe makes (hasWebGL in js/main.js): no 3D, no 670 KB download
  function webgl() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }
  function loadThree() {
    return new Promise(function (res, rej) {
      if (three) return res(three);
      if (!webgl()) return rej(new Error("no WebGL in this browser"));
      var had = "THREE" in window,
        prev = window.THREE;
      var s = document.createElement("script");
      var late = setTimeout(function () {
        rej(new Error("three.js did not arrive within " + LIMIT / 1000 + " s"));
      }, LIMIT);
      s.src = THREE_URL;
      s.onload = function () {
        clearTimeout(late);
        if (window.THREE && window.THREE !== prev) three = window.THREE;
        // a late arrival is still taken off window.THREE, and changes nothing else
        if (had) window.THREE = prev;
        else
          try {
            delete window.THREE;
          } catch (e) {
            window.THREE = undefined;
          }
        three ? res(three) : rej(new Error("three unavailable"));
      };
      s.onerror = function () {
        clearTimeout(late);
        rej(new Error("three.js did not load"));
      };
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
        // for js/tools/h6.js. letters holds approved letters only (see the honesty rules above).
        if (window.ToolView)
          window.ToolView.update("archive", {
            ready: true,
            sample: room.sample,
            stats: room.stats,
            ages: room.ages,
            letters: room.letters,
            openLetter: function (i) {
              openReader({ letter: room.letters[i] });
            },
            letterMeta: function (i) {
              return letterMeta(room.letters[i]);
            },
          });
        return loadThree();
      })
      .then(function (THREE) {
        if (!THREE) throw new Error("three unavailable");
        build(THREE);
        bindControls();
        bindKeys();
        hangMine();
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
            // no margin: at the foot of the page the room sits 96 px above a desktop screen and
            // must not keep drawing there (it did with a 120 px margin)
            { rootMargin: "0px" },
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
        // nothing to look around in: not a stop on the Tab key, no "drag to look around", and a
        // screen reader hears only the message, not an interactive room with keys that do nothing.
        // A reader who Tabbed onto the room (which starts it) is moved to the message first, so
        // focus is never dropped onto the page itself.
        var onRoom = document.activeElement === el.stage;
        if (el.loading) el.loading.tabIndex = -1;
        if (onRoom && el.loading) el.loading.focus();
        if (el.stage) {
          ["tabindex", "role", "aria-label", "aria-describedby"].forEach(function (a) {
            el.stage.removeAttribute(a);
          });
        }
        if (el.hint) el.hint.hidden = true;
        var keys = document.getElementById("roomKeys");
        if (keys) keys.hidden = true;
        // no empty screen-high room: the hall shrinks to its words, the message and the figures
        var hall = section.querySelector(".room-hall");
        if (hall) hall.classList.add("no-3d");
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
  function bootOnce() {
    if (booted) return;
    booted = true;
    window.removeEventListener("scroll", maybeBoot);
    boot();
  }
  function maybeBoot() {
    if (section.getBoundingClientRect().top < window.innerHeight * 0.82) bootOnce();
  }
  window.addEventListener("scroll", maybeBoot, { passive: true });
  // a Tab onto the room starts it too, even when focusing it scrolls nothing
  if (el.stage) el.stage.addEventListener("focus", bootOnce);
  maybeBoot(); // covers a refresh that lands already scrolled down the page
})();
