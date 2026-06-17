/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — APP LOGIC  (2026 revision)
   ═══════════════════════════════════════════════════════════════════ */

// ═══ STATE ══════════════════════════════════════════════════════
const sel = new Set();
let allocated = 0;
let ranking = [];
let selectedCountry = null;

// ═══ FORMAT ═════════════════════════════════════════════════════
function fmt(b) {
  return b >= 1000
    ? "$" + (b / 1000).toFixed(2) + "T"
    : "$" + Math.round(b) + "B";
}

// ═══ BG CANVAS ══════════════════════════════════════════════════
const bgEl = document.getElementById("bg"),
  bgX = bgEl.getContext("2d");
let bgPs = [];
function rsz() {
  bgEl.width = innerWidth;
  bgEl.height = innerHeight;
}
rsz();
window.addEventListener("resize", () => {
  rsz();
  rszFlow();
  drawDotField();
  drawLives();
});
for (let i = 0; i < 90; i++)
  bgPs.push({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.1 + 0.2,
    sx: (Math.random() - 0.5) * 0.22,
    sy: (Math.random() - 0.5) * 0.22,
    c:
      Math.random() > 0.7
        ? "255,45,45"
        : Math.random() > 0.5
          ? "0,229,255"
          : "120,80,200",
    a: Math.random() * 0.1 + 0.02,
  });
(function bgL() {
  bgX.clearRect(0, 0, bgEl.width, bgEl.height);
  bgPs.forEach((p) => {
    p.x += p.sx;
    p.y += p.sy;
    if (p.x < 0 || p.x > bgEl.width || p.y < 0 || p.y > bgEl.height) {
      p.x = Math.random() * bgEl.width;
      p.y = Math.random() * bgEl.height;
    }
    bgX.beginPath();
    bgX.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgX.fillStyle = `rgba(${p.c},${p.a})`;
    bgX.fill();
  });
  requestAnimationFrame(bgL);
})();

// ═══ LIVE SPEND TICKER ══════════════════════════════════════════
const pageOpened = Date.now();
function tickLiveSpend() {
  const el = document.getElementById("liveSpend");
  if (el) {
    const spent = ((Date.now() - pageOpened) / 1000) * MIL_PER_SECOND;
    el.textContent = "$" + Math.floor(spent).toLocaleString();
  }
  requestAnimationFrame(tickLiveSpend);
}

// ═══ HERO COUNTERS ══════════════════════════════════════════════
function cntTo(el, target, dur) {
  const s = performance.now();
  (function f(now) {
    const p = Math.min((now - s) / dur, 1),
      v = target * (1 - Math.pow(1 - p, 4));
    el.textContent =
      "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "T" : v.toFixed(0) + "B");
    if (p < 1) requestAnimationFrame(f);
  })(performance.now());
}

// ═══ SCROLL REVEAL ══════════════════════════════════════════════
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          e.target.querySelectorAll?.("[data-w]").forEach((b) => {
            b.style.width = b.dataset.w + "%";
          });
          if (e.target.dataset.w) e.target.style.width = e.target.dataset.w + "%";
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
  const io2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll("[data-w]").forEach((b) => {
            b.style.width = b.dataset.w + "%";
          });
          io2.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  document.querySelectorAll(".gap-box").forEach((el) => io2.observe(el));
}

// ═══ SPEND DONUT (SVG) ══════════════════════════════════════════
function buildSpendDonut() {
  const svg = document.getElementById("spendDonut");
  const legend = document.getElementById("spendLegend");
  if (!svg || !legend) return;
  const total = spendBreakdown.reduce((s, x) => s + x.amtB, 0);
  const cx = 50,
    cy = 50,
    r = 37,
    sw = 15;
  const C = 2 * Math.PI * r;
  const NS = "http://www.w3.org/2000/svg";

  // track
  const track = document.createElementNS(NS, "circle");
  track.setAttribute("cx", cx);
  track.setAttribute("cy", cy);
  track.setAttribute("r", r);
  track.setAttribute("fill", "none");
  track.setAttribute("stroke", "#0d0d12");
  track.setAttribute("stroke-width", sw);
  svg.appendChild(track);

  // rotating group so segments start at 12 o'clock (avoids CSS transform bug)
  const g = document.createElementNS(NS, "g");
  g.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
  svg.appendChild(g);

  let offset = 0;
  spendBreakdown.forEach((s, i) => {
    const frac = s.amtB / total;
    const seg = document.createElementNS(NS, "circle");
    seg.setAttribute("class", "donut-seg");
    seg.setAttribute("data-i", i);
    seg.setAttribute("cx", cx);
    seg.setAttribute("cy", cy);
    seg.setAttribute("r", r);
    seg.setAttribute("fill", "none");
    seg.setAttribute("stroke", s.color);
    seg.setAttribute("stroke-width", sw);
    seg.setAttribute("stroke-dasharray", `0 ${C}`);
    seg.style.strokeDashoffset = -offset * C;
    g.appendChild(seg);
    // animate dash in
    setTimeout(() => {
      seg.style.transition = "stroke-dasharray 1.1s cubic-bezier(.16,1,.3,1)";
      seg.setAttribute(
        "stroke-dasharray",
        `${frac * C - 0.6} ${C - frac * C + 0.6}`,
      );
    }, 300 + i * 110);
    offset += frac;

    // legend row
    const row = document.createElement("div");
    row.className = "dleg";
    row.dataset.i = i;
    row.innerHTML = `<span class="dleg-sw" style="background:${s.color}"></span>${s.label}<span class="dleg-amt">${fmt(s.amtB)}</span>`;
    const dim = () =>
      svg
        .querySelectorAll(".donut-seg")
        .forEach((e) =>
          e.classList.toggle("dim", e.getAttribute("data-i") !== String(i)),
        );
    const undim = () =>
      svg.querySelectorAll(".donut-seg").forEach((e) => e.classList.remove("dim"));
    row.addEventListener("mouseenter", dim);
    row.addEventListener("mouseleave", undim);
    seg.addEventListener("mouseenter", dim);
    seg.addEventListener("mouseleave", undim);
    legend.appendChild(row);
  });

  // centre label
  const v = document.createElementNS(NS, "text");
  v.setAttribute("class", "donut-center-v");
  v.setAttribute("x", cx);
  v.setAttribute("y", cy - 1);
  v.setAttribute("text-anchor", "middle");
  v.setAttribute("font-size", "13");
  v.textContent = "$2.89T";
  svg.appendChild(v);
  const l = document.createElementNS(NS, "text");
  l.setAttribute("class", "donut-center-l");
  l.setAttribute("x", cx);
  l.setAttribute("y", cy + 8);
  l.setAttribute("text-anchor", "middle");
  l.setAttribute("font-size", "4.4");
  l.textContent = "MILITARY · 2025";
  svg.appendChild(l);
}

// ═══ EMISSIONS MINI GRID ════════════════════════════════════════
function buildEmissions() {
  const g = document.getElementById("emGrid");
  if (!g) return;
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div");
    c.className = "em-cell" + (i < 6 ? " on" : "");
    g.appendChild(c);
  }
}

// ═══ DUAL SPENDER BARS ══════════════════════════════════════════
function buildDualSpenders() {
  const abs = document.getElementById("spendersAbs");
  const gdp = document.getElementById("spendersGdp");
  if (!abs || !gdp) return;
  const maxAbs = Math.max(...topSpenders.map((s) => s.amt));
  const maxGdp = Math.max(...topSpenders.map((s) => s.gdp));
  topSpenders.forEach((s) => {
    const a = document.createElement("div");
    a.className = "b2-row";
    a.innerHTML = `<div class="b2-name">${s.name}</div><div class="b2-track"><div class="b2-fill red" data-w="${((s.amt / maxAbs) * 100).toFixed(1)}"></div></div><div class="b2-val">$${s.amt >= 100 ? Math.round(s.amt) : s.amt}B</div>`;
    abs.appendChild(a);
  });
  // GDP sorted descending for a different shape
  [...topSpenders]
    .sort((x, y) => y.gdp - x.gdp)
    .forEach((s) => {
      const peak = s.gdp === maxGdp;
      const g = document.createElement("div");
      g.className = "b2-row" + (peak ? " peak" : "");
      g.innerHTML = `<div class="b2-name">${s.name}</div><div class="b2-track"><div class="b2-fill amber" data-w="${((s.gdp / maxGdp) * 100).toFixed(1)}"></div></div><div class="b2-val">${s.gdp}%</div>`;
      gdp.appendChild(g);
    });
}

// ═══ DISPLACEMENT DOT FIELD (multi-colour) ══════════════════════
function drawDotField() {
  const c = document.getElementById("dotField");
  if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const w = c.parentElement.getBoundingClientRect().width;
  if (w <= 0) return;
  // build ordered colour list, 1 dot = 100k people
  const dots = [];
  displacementBreakdown.forEach((cat) => {
    const n = Math.round(cat.millions * 10);
    for (let i = 0; i < n; i++) dots.push(cat.color);
  });
  const cols = Math.floor(w / 8);
  const rows = Math.ceil(dots.length / cols);
  const h = rows * 8 + 4;
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.width = w + "px";
  c.style.height = h + "px";
  const x = c.getContext("2d");
  x.scale(dpr, dpr);
  dots.forEach((col, i) => {
    const cx = (i % cols) * 8 + 4,
      cy = Math.floor(i / cols) * 8 + 4;
    x.beginPath();
    x.arc(cx, cy, 1.7, 0, Math.PI * 2);
    x.fillStyle = col;
    x.globalAlpha = 0.8;
    x.fill();
  });
  x.globalAlpha = 1;
}

function buildDotLegend() {
  const el = document.getElementById("dotLegend");
  if (!el) return;
  el.innerHTML = displacementBreakdown
    .map(
      (c) =>
        `<span class="dot-leg"><i style="background:${c.color}"></i>${c.label} · ${c.millions}M</span>`,
    )
    .join("");
}

// ═══ HUMAN STAT STRIP (condensed) ═══════════════════════════════
function buildHumanStrip() {
  const wrap = document.getElementById("humanStrip");
  if (!wrap) return;
  const strip = [
    {
      num: "244,700",
      lbl: "people killed in armed conflict in the last year, one every two minutes",
      url: "https://acleddata.com/series/acled-conflict-index",
    },
    {
      num: "11,967",
      lbl: "children killed or maimed in a single year, the highest ever recorded",
      url: "https://news.un.org/en/story/2025/06/1164646",
    },
    {
      num: "1 in 6",
      lbl: "people on Earth were exposed to conflict in 2025",
      url: "https://acleddata.com/series/acled-conflict-index",
    },
    {
      num: "4.5M+",
      lbl: "deaths from the post-9/11 wars alone, including disease and collapse",
      url: "https://watson.brown.edu/costsofwar",
    },
  ];
  wrap.innerHTML = strip
    .map(
      (s) =>
        `<div class="hsc"><div class="hsc-num">${s.num}</div><div class="hsc-lbl">${s.lbl}</div><div class="hsc-src"><a href="${s.url}" target="_blank" rel="noopener">source ↗</a></div></div>`,
    )
    .join("");
}

// ═══ LIVES PIXEL FIELD ══════════════════════════════════════════
function drawLives() {
  const c = document.getElementById("livesCanvas");
  if (!c) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w =
    c.parentElement.getBoundingClientRect().width -
    (window.innerWidth <= 620 ? 40 : 64);
  if (w <= 0) return;
  const total = DEATHS_PER_YEAR;
  const spacing = 2;
  const cols = Math.floor(w / spacing);
  const rows = Math.ceil(total / cols);
  const h = rows * spacing + 2;
  c.width = w * dpr;
  c.height = h * dpr;
  c.style.width = w + "px";
  c.style.height = h + "px";
  const x = c.getContext("2d");
  x.scale(dpr, dpr);
  for (let i = 0; i < total; i++) {
    const col = i % cols,
      row = Math.floor(i / cols);
    const a = 0.25 + Math.random() * 0.55;
    x.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
    x.fillRect(col * spacing, row * spacing, 1, 1);
  }
}

// ═══ ISSUE CARDS (two columns, compact) ═════════════════════════
function buildIssues() {
  const colL = document.getElementById("issueColL");
  const colR = document.getElementById("issueColR");
  if (!colL || !colR) return;
  const half = Math.ceil(issueData.length / 2);
  issueData.forEach((iss, i) => {
    const pct = ((iss.cost / DEFENCE) * 100).toFixed(1);
    const card = document.createElement("div");
    card.className = "ix";
    card.id = "ix" + i;
    card.innerHTML = `
      <div class="ix-top">
        <div class="ix-chk"></div>
        <div class="ix-name">${iss.name}</div>
        <div class="ix-cost" style="color:${iss.color}">${fmt(iss.cost)}/yr</div>
      </div>
      <div class="ix-sum">${iss.sum}</div>
      <div class="ix-detail">${iss.detail}</div>
      <div class="ix-foot">
        <span class="ix-more">▾ detail · ${pct}% of budget</span>
        <span class="ix-src"><a href="${iss.url}" target="_blank" rel="noopener">${iss.src.split(" ")[0]} ↗</a></span>
      </div>`;
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      if (e.target.closest(".ix-more")) {
        card.classList.toggle("ix-exp");
        const m = card.querySelector(".ix-more");
        m.textContent = card.classList.contains("ix-exp")
          ? `▴ less · ${pct}% of budget`
          : `▾ detail · ${pct}% of budget`;
        return;
      }
      toggleIssue(i);
    });
    (i < half ? colL : colR).appendChild(card);
  });
}

// ═══ TOGGLE ═════════════════════════════════════════════════════
function toggleIssue(i) {
  const card = document.getElementById("ix" + i);
  if (card && card.classList.contains("ix-cant") && !sel.has(i)) return;
  if (sel.has(i)) {
    sel.delete(i);
    if (card) {
      card.classList.remove("ix-sel");
      burst(card, "-" + fmt(issueData[i].cost), "#ff2d2d");
    }
  } else {
    sel.add(i);
    if (card) {
      card.classList.add("ix-sel");
      burst(card, "+" + fmt(issueData[i].cost), "#f5c542");
    }
  }
  allocated = 0;
  sel.forEach((x) => (allocated += issueData[x].cost));
  updateTracker();
  updateCant();
  updateSummary();
  updateGate();
}

function updateCant() {
  issueData.forEach((_, i) => {
    const card = document.getElementById("ix" + i);
    if (!card) return;
    if (sel.has(i)) {
      card.classList.remove("ix-cant");
      const t = card.querySelector(".ix-cant-tag");
      if (t) t.remove();
      return;
    }
    const over = allocated + issueData[i].cost > DEFENCE;
    if (over) {
      card.classList.add("ix-cant");
      if (!card.querySelector(".ix-cant-tag")) {
        const t = document.createElement("div");
        t.className = "ix-cant-tag";
        t.textContent = "exceeds remaining budget";
        card.appendChild(t);
      }
    } else {
      card.classList.remove("ix-cant");
      const t = card.querySelector(".ix-cant-tag");
      if (t) t.remove();
    }
  });
}

function updateTracker() {
  const rem = Math.max(0, DEFENCE - allocated);
  const pct = Math.max(0, (rem / DEFENCE) * 100);
  document.getElementById("tiRem").textContent = fmt(rem);
  document.getElementById("tiAlloc").textContent = fmt(allocated);
  document.getElementById("tiCount").textContent =
    sel.size === 0
      ? "0 · select issues to begin"
      : `${sel.size} issue${sel.size !== 1 ? "s" : ""} funded`;
  const bar = document.getElementById("tiBar");
  bar.style.width = pct + "%";
  const remEl = document.getElementById("tiRem");
  if (pct > 60) remEl.className = "ti-val g";
  else if (pct > 25) remEl.className = "ti-val a";
  else remEl.className = "ti-val r";
}

function updateSummary() {
  const rem = Math.max(0, DEFENCE - allocated);
  const pct = (rem / DEFENCE) * 100;
  const sb = document.getElementById("sumBig"),
    ss = document.getElementById("sumStmt");
  if (sel.size === 0) {
    sb.innerHTML = "Select issues to begin<br>redistributing the budget";
    ss.textContent =
      "The money to solve these crises already exists in the world's annual military budgets. This is not a question of financial capacity. It is a question of political will.";
  } else if (pct <= 0) {
    sb.innerHTML = `<span class="g">${sel.size} global crises</span><br>fully funded from one year of military spending.`;
    ss.textContent = `You allocated ${fmt(allocated)}. The military budget is exhausted, and ${sel.size} of humanity's greatest challenges are addressed from a single year of weapons spending. The money was always there.`;
  } else {
    sb.innerHTML = `<span class="g">${fmt(allocated)}</span> redirected to ${sel.size} issue${sel.size !== 1 ? "s" : ""}.<br><span class="r">${fmt(rem)}</span> still goes to weapons.`;
    ss.textContent = `After funding ${sel.size} global crisis${sel.size !== 1 ? "es" : ""}, ${fmt(rem)}, ${pct.toFixed(0)}% of the military budget, remains. It continues to flow into weapons. This is the geometry of our current priorities.`;
  }
}

// ═══ GATE (unlock journey once user engages) ════════════════════
function updateGate() {
  const gate = document.getElementById("journeyGate");
  const prompt = document.getElementById("redistPrompt");
  if (!gate) return;
  if (sel.size >= 1) {
    gate.classList.remove("locked");
    if (prompt) {
      prompt.textContent = "✓ Unlocked. Now rank your priorities below ▾";
      prompt.classList.add("go");
    }
  } else {
    gate.classList.add("locked");
    if (prompt) {
      prompt.textContent = "Select issues on either side to fund them";
      prompt.classList.remove("go");
    }
  }
}

// ═══ BURST ══════════════════════════════════════════════════════
function burst(card, txt, col) {
  const r = card.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "burst";
  el.style.cssText = `left:${r.left + r.width / 2 - 40}px;top:${r.top + 8}px;color:${col};text-shadow:0 0 10px ${col}`;
  el.textContent = txt;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

// ═══ FLOW CANVAS ════════════════════════════════════════════════
const fC = document.getElementById("flowC"),
  fX = fC.getContext("2d");
let fW,
  fH,
  fParts = [];
const dpr = window.devicePixelRatio || 1;

function rszFlow() {
  const panel = fC.parentElement;
  const availW = panel
    ? panel.getBoundingClientRect().width
    : window.innerWidth * 0.5;
  const sz = Math.round(Math.min(availW, window.innerHeight * 0.7, 520));
  fW = fC.width = sz * dpr;
  fH = fC.height = sz * dpr;
  fC.style.width = sz + "px";
  fC.style.height = sz + "px";
}

function getNodes() {
  const cx = fW / 2,
    cy = fH / 2;
  const n = sel.size;
  const bigR = Math.min(fW, fH) * 0.15;
  const arr = [...sel];
  const nodes = [];
  if (n === 0) return { cx, cy, bigR, nodes };
  const scale = Math.min(fW, fH) * 0.22;
  const rawRs = arr.map((idx) => Math.sqrt(issueData[idx].cost / DEFENCE) * scale);
  const maxRaw = Math.max(...rawRs);
  const margin = Math.min(fW, fH) * 0.04;
  const minRing = bigR + maxRaw * 1.1 + margin;
  const maxRing = Math.min(fW, fH) / 2 - maxRaw - margin;
  const packRing = n > 1 ? (n * maxRaw * 1.15) / Math.PI : minRing;
  const ringDist = Math.max(minRing, Math.min(maxRing, packRing));
  arr.forEach((idx, k) => {
    const iss = issueData[idx];
    const angle = (k / n) * Math.PI * 2 - Math.PI / 2;
    const r = Math.sqrt(iss.cost / DEFENCE) * scale;
    nodes.push({
      x: cx + Math.cos(angle) * ringDist,
      y: cy + Math.sin(angle) * ringDist,
      r,
      color: iss.color,
      idx,
    });
  });
  return { cx, cy, bigR, nodes };
}

function spawnP(cx, cy, tx, ty, col) {
  fParts.push({
    x: cx,
    y: cy,
    tx,
    ty,
    col,
    life: 1,
    spd: 0.005 + Math.random() * 0.009,
    ox: cx + (Math.random() - 0.5) * 50 * dpr,
    oy: cy + (Math.random() - 0.5) * 50 * dpr,
  });
}

function drawFlow() {
  fX.clearRect(0, 0, fW, fH);
  const { cx, cy, bigR, nodes } = getNodes();
  const rem = Math.max(0, DEFENCE - allocated);
  const warPct = rem / DEFENCE;
  const baseF = Math.round(Math.min(fW, fH) * 0.013);

  const grd = fX.createRadialGradient(cx, cy, 0, cx, cy, bigR * 2.5);
  grd.addColorStop(0, "rgba(255,45,45,0.07)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  fX.fillStyle = grd;
  fX.beginPath();
  fX.arc(cx, cy, bigR * 2.5, 0, Math.PI * 2);
  fX.fill();

  fX.beginPath();
  fX.arc(cx, cy, bigR, 0, Math.PI * 2);
  fX.fillStyle = "rgba(40,0,0,0.6)";
  fX.fill();
  if (warPct > 0) {
    fX.beginPath();
    fX.moveTo(cx, cy);
    fX.arc(cx, cy, bigR, -Math.PI / 2, -Math.PI / 2 + warPct * Math.PI * 2);
    fX.closePath();
    fX.fillStyle = "rgba(255,45,45,0.55)";
    fX.fill();
  }
  const rim = fX.createRadialGradient(cx, cy, bigR * 0.86, cx, cy, bigR * 1.14);
  rim.addColorStop(0, "rgba(255,45,45,0.38)");
  rim.addColorStop(1, "rgba(255,45,45,0)");
  fX.fillStyle = rim;
  fX.beginPath();
  fX.arc(cx, cy, bigR * 1.14, 0, Math.PI * 2);
  fX.fill();

  fX.textAlign = "center";
  fX.textBaseline = "middle";
  fX.fillStyle = "rgba(255,255,255,0.45)";
  fX.font = `${Math.round(baseF * 0.85)}px 'IBM Plex Mono',monospace`;
  fX.fillText("GLOBAL MILITARY BUDGET", cx, cy - bigR * 0.24);
  const lcol = warPct < 0.3 ? "#ff2d2d" : warPct < 0.6 ? "#f5a623" : "#00ff88";
  fX.fillStyle = lcol;
  fX.font = `${Math.round(baseF * 1.9)}px 'Bebas Neue',sans-serif`;
  fX.fillText(fmt(rem), cx, cy + bigR * 0.06);
  fX.fillStyle = "rgba(255,255,255,0.28)";
  fX.font = `${Math.round(baseF * 0.75)}px 'IBM Plex Mono',monospace`;
  fX.fillText("remaining", cx, cy + bigR * 0.3);

  nodes.forEach((n) => {
    fX.save();
    fX.setLineDash([2 * dpr, 4 * dpr]);
    const lg = fX.createLinearGradient(cx, cy, n.x, n.y);
    lg.addColorStop(0, "rgba(255,45,45,0.25)");
    lg.addColorStop(1, n.color + "33");
    fX.strokeStyle = lg;
    fX.lineWidth = dpr * 0.7;
    fX.beginPath();
    fX.moveTo(cx, cy);
    fX.lineTo(n.x, n.y);
    fX.stroke();
    fX.restore();

    const ng = fX.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 2.2);
    ng.addColorStop(0, n.color + "22");
    ng.addColorStop(0.6, n.color + "0a");
    ng.addColorStop(1, "transparent");
    fX.fillStyle = ng;
    fX.beginPath();
    fX.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2);
    fX.fill();

    fX.beginPath();
    fX.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    fX.fillStyle = n.color + "65";
    fX.fill();
    fX.beginPath();
    fX.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    fX.fillStyle = "rgba(0,0,0,0.28)";
    fX.fill();

    fX.textAlign = "center";
    fX.textBaseline = "middle";
    const fs = Math.max(baseF * 0.6, Math.min(baseF * 1.15, n.r * 0.34));
    fX.fillStyle = "rgba(255,255,255,0.92)";
    fX.font = `${Math.round(fs)}px 'Bebas Neue',sans-serif`;
    fX.fillText(issueData[n.idx].name.toUpperCase(), n.x, n.y - fs * 0.7);
    fX.fillStyle = n.color;
    fX.font = `${Math.round(fs * 1.2)}px 'Bebas Neue',sans-serif`;
    fX.fillText(fmt(issueData[n.idx].cost), n.x, n.y + fs * 0.7);

    if (Math.random() < 0.03) spawnP(cx, cy, n.x, n.y, n.color);
  });

  fParts = fParts.filter((p) => {
    p.life -= p.spd;
    const t = 1 - p.life;
    p.x = p.ox + (p.tx - p.ox) * t;
    p.y = p.oy + (p.ty - p.oy) * t;
    const alpha = Math.round(p.life * 130)
      .toString(16)
      .padStart(2, "0");
    fX.beginPath();
    fX.arc(p.x, p.y, 1.4 * dpr, 0, Math.PI * 2);
    fX.fillStyle = p.col + alpha;
    fX.fill();
    return p.life > 0;
  });

  if (sel.size === 0) {
    fX.textAlign = "center";
    fX.textBaseline = "middle";
    fX.fillStyle = "rgba(112,128,144,0.7)";
    fX.font = `${baseF * 1.1}px 'IBM Plex Mono',monospace`;
    fX.fillText("Select issues to fund", fW / 2, fH * 0.9);
  }
  requestAnimationFrame(drawFlow);
}

// ═══ RESET ══════════════════════════════════════════════════════
function resetAll() {
  sel.clear();
  allocated = 0;
  document.querySelectorAll(".ix").forEach((c) => {
    c.classList.remove("ix-sel", "ix-cant");
    const t = c.querySelector(".ix-cant-tag");
    if (t) t.remove();
  });
  updateTracker();
  updateSummary();
  updateGate();
}

// ═══ SHARE ══════════════════════════════════════════════════════
function openShare() {
  document.getElementById("shareOv").classList.add("open");
}
function closeShare() {
  document.getElementById("shareOv").classList.remove("open");
}
function submitEmail() {
  const v = document.getElementById("emailIn").value.trim();
  if (!v || !v.includes("@")) return;
  const formData = new FormData();
  formData.append("email", v);
  formData.append("source", "cost-of-war");
  fetch("https://formsubmit.co/ajax/greg@studioex.co", {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  }).catch(() => {});
  document.getElementById("sThanks").style.display = "block";
  document.getElementById("emailIn").disabled = true;
}
function doShare(type) {
  const txt = sel.size
    ? `I just found out that ${sel.size} of humanity's biggest crises could be funded for less than the world's annual military budget. See for yourself: `
    : "In 2025, violence cost the world $21.8 trillion. Here is what else that money could do: ";
  if (type === "twitter")
    window.open(
      "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(txt + location.href),
      "_blank",
    );
  else if (type === "linkedin")
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(location.href),
      "_blank",
    );
  else if (type === "copy") {
    navigator.clipboard.writeText(location.href).then(() => {
      const b = document.querySelectorAll(".s-lbtn")[2];
      b.textContent = "✓ Copied";
      setTimeout(() => (b.textContent = "Copy Link"), 2000);
    });
  }
}

// ═══ SCROLL PROGRESS ════════════════════════════════════════════
function initScrollProgress() {
  const bar = document.getElementById("scrollBar");
  const dot = document.getElementById("scrollDot");
  window.addEventListener(
    "scroll",
    () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      if (bar) bar.style.height = pct * 100 + "%";
      if (dot) dot.style.top = pct * 100 + "vh";
    },
    { passive: true },
  );
}

// ═══ RANKING ════════════════════════════════════════════════════
function buildRanking() {
  const pool = document.getElementById("rankPool");
  const top = document.getElementById("rankTop");
  if (!pool || !top) return;
  top.innerHTML =
    '<div class="rank-empty-msg">Select issues from the list to add them here, in order of priority.</div>';
  pool.innerHTML = "";
  issueData.forEach((iss, i) => {
    const d = document.createElement("div");
    d.className = "rank-pill";
    d.id = "rpool" + i;
    d.innerHTML = `<div class="rp-num">${i + 1}</div><div class="rp-dot" style="background:${iss.color}"></div><div class="rp-name">${iss.name}</div><div class="rp-cost">${fmt(iss.cost)}</div>`;
    d.addEventListener("click", () => addRank(i));
    pool.appendChild(d);
  });
}

function addRank(i) {
  if (ranking.includes(i)) {
    removeRank(i);
    return;
  }
  if (ranking.length >= 5) return;
  ranking.push(i);
  renderRanking();
}

function removeRank(i) {
  ranking = ranking.filter((x) => x !== i);
  renderRanking();
}

function renderRanking() {
  const top = document.getElementById("rankTop");
  const cnt = document.getElementById("rankCount");
  const btn = document.getElementById("rankNextBtn");
  if (!top) return;
  if (cnt) cnt.textContent = `${ranking.length} / 5`;
  top.innerHTML = "";
  if (ranking.length === 0) {
    top.innerHTML =
      '<div class="rank-empty-msg">Select issues from the list to add them here, in order of priority.</div>';
  } else {
    ranking.forEach((idx, pos) => {
      const iss = issueData[idx];
      const d = document.createElement("div");
      d.className = "rank-pill is-ranked";
      d.innerHTML = `<div class="rp-num">${pos + 1}</div><div class="rp-dot" style="background:${iss.color}"></div><div class="rp-name">${iss.name}</div><div class="rp-cost">${fmt(iss.cost)}/yr</div><div class="rp-rm" onclick="event.stopPropagation();removeRank(${idx})">✕</div>`;
      top.appendChild(d);
    });
  }
  issueData.forEach((_, i) => {
    const el = document.getElementById("rpool" + i);
    if (el) {
      el.classList.toggle("in-top", ranking.includes(i));
      el.style.pointerEvents =
        ranking.length >= 5 && !ranking.includes(i) ? "none" : "auto";
    }
  });
  if (btn) {
    btn.disabled = ranking.length !== 5;
    btn.style.opacity = ranking.length === 5 ? "1" : ".3";
  }
  // once 5 ranked, those become the funded set and drive the diagram
  if (ranking.length === 5) {
    sel.clear();
    ranking.forEach((i) => sel.add(i));
    allocated = 0;
    sel.forEach((x) => (allocated += issueData[x].cost));
    updateTracker();
    updateSummary();
    updateCant();
    updateGate();
    issueData.forEach((_, i) => {
      const card = document.getElementById("ix" + i);
      if (card) card.classList.toggle("ix-sel", sel.has(i));
    });
  }
  generateLetter();
}

function resetRanking() {
  ranking = [];
  renderRanking();
}

// ═══ COUNTRY ════════════════════════════════════════════════════
function buildCountrySelect() {
  const csel = document.getElementById("countrySelect");
  if (!csel) return;
  const seen = new Set();
  countryData.forEach((c) => {
    if (seen.has(c[0])) return;
    seen.add(c[0]);
    const o = document.createElement("option");
    o.value = c[0];
    o.textContent = c[0];
    csel.appendChild(o);
  });
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const tzMap = {
      "Europe/London": "United Kingdom",
      "America/New_York": "United States",
      "America/Chicago": "United States",
      "America/Denver": "United States",
      "America/Los_Angeles": "United States",
      "Europe/Berlin": "Germany",
      "Europe/Paris": "France",
      "Asia/Tokyo": "Japan",
      "Australia/Sydney": "Australia",
      "Australia/Melbourne": "Australia",
      "Asia/Shanghai": "China",
      "Europe/Moscow": "Russia",
      "Asia/Kolkata": "India",
      "Asia/Singapore": "Singapore",
    };
    const guess = Object.entries(tzMap).find(
      ([t]) => tz === t || tz.startsWith(t),
    );
    if (guess) {
      csel.value = guess[1];
      showCountry(guess[1]);
    }
  } catch (e) {}
}

function showCountry(name) {
  const c = countryData.find((x) => x[0] === name);
  const box = document.getElementById("countryData");
  const btn = document.getElementById("countryNextBtn");
  if (!c || !box) {
    if (box) box.style.display = "none";
    return;
  }
  selectedCountry = c;
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = "1";
  }
  box.style.display = "block";
  const spend = c[2];
  const comparisons = issueData
    .slice(0, 6)
    .map((iss) => {
      const pct = Math.min((spend / iss.cost) * 100, 100);
      const covers = ((spend / iss.cost) * 100).toFixed(0);
      const canFund = spend >= iss.cost;
      return `<div class="cc-bar-row">
      <div class="cc-bar-lbl">${iss.name}</div>
      <div class="cc-bar-track"><div class="cc-bar-fill" style="width:0%;background:${iss.color}" data-w="${pct.toFixed(1)}"></div></div>
      <div class="cc-bar-val" style="color:${canFund ? "var(--green)" : "var(--muted)"}">${covers}%</div>
    </div>`;
    })
    .join("");
  const contactHTML = c[5]
    ? `<a href="${c[5]}" target="_blank" rel="noopener">Contact your representative ↗</a>`
    : "";
  box.innerHTML = `<div class="cc-name">${c[0]}</div>
<div class="cc-spend">$${spend}B</div>
<div class="cc-meta">${c[3]}% of GDP · SIPRI 2025 · Population ~${c[4]}M${contactHTML ? " · " + contactHTML : ""}</div>
<div class="cc-bars">${comparisons}</div>
<div class="cc-note">Your country contributes ${((spend / DEFENCE) * 100).toFixed(2)}% of the $2.89T global military total. This is the scale of your nation's stake in how the world chooses to spend its resources.</div>`;
  setTimeout(() => {
    box.querySelectorAll(".cc-bar-fill").forEach((el) => {
      el.style.transition = "width 1.3s cubic-bezier(.16,1,.3,1)";
      el.style.width = el.dataset.w + "%";
    });
  }, 100);
  generateLetter();
  const note = document.getElementById("letterContactNote");
  if (note && c[5])
    note.innerHTML = `Find your representative: <a href="${c[5]}" target="_blank">${c[0]} government contact page ↗</a>`;
}

// ═══ LETTER (with red placeholders when incomplete) ═════════════
function generateLetter() {
  const out = document.getElementById("letterOutput");
  const note = document.getElementById("letterNote");
  if (!out) return;

  const rankDone = ranking.length === 5;
  const countryDone = !!selectedCountry;
  const complete = rankDone && countryDone;
  if (note) note.classList.toggle("show", !complete);

  const RED = (t) => `<span class="letter-redfill">${t}</span>`;

  const name =
    (document.getElementById("letterName")?.value || "").trim() ||
    "A concerned citizen";
  const leaderRaw = (document.getElementById("letterTitle")?.value || "").trim();
  const leader =
    leaderRaw ||
    (countryDone
      ? `Prime Minister / President of ${selectedCountry[0]}`
      : RED("[your head of state]"));
  const country = countryDone ? selectedCountry[0] : RED("[your country]");
  const contributionLine = countryDone
    ? `${selectedCountry[0]} contributed $${selectedCountry[2]} billion to that total, ${selectedCountry[3]}% of our national GDP.`
    : RED("[Step 02: choose your country to show what it spends.]");

  const top5 = rankDone
    ? ranking
        .map(
          (idx, i) =>
            `  ${i + 1}. ${issueData[idx].name} (${fmt(issueData[idx].cost)} per year)`,
        )
        .join("\n")
    : RED(
        "[Go back to Step 01 and rank your top 5 priorities. They will appear here.]",
      );
  const totalB = rankDone
    ? ranking.reduce((s, i) => s + issueData[i].cost, 0)
    : 0;
  const totalLine = rankDone
    ? `To fund all five at the levels needed would cost ${fmt(totalB)} per year, about ${Math.round((totalB / DEFENCE) * 100)}% of one year of global military spending. Not a utopian fantasy. A budget question.`
    : RED(
        "[Once you have ranked your priorities, the total cost of your choices will be calculated here.]",
      );

  const letter = `Dear ${leader},

My name is ${name}. I am writing to you not as a partisan voice, not as an ideologue, and not from a place of anger, but as a human being who has sat with some uncomfortable numbers and can no longer stay quiet about what they mean.

In 2025, the world spent $2.89 trillion on its militaries, the eleventh consecutive annual record. ${contributionLine} I do not write to question the sincerity of those who serve, or to pretend that the threats governments face are not real. I understand that the world is not safe.

But I have come to believe that the world is also not as safe as it could be, precisely because of how we are choosing to spend.

This year, 673 million people went hungry. 272 million children could not go to school. 117.8 million people remain displaced from their homes. The UN's humanitarian appeal received barely a third of what it asked for, while spending on nuclear weapons alone rose 19% to a record $119 billion. These are the compounding conditions of a planet in genuine distress, one that will produce more conflict the longer we leave them unaddressed.

I have thought carefully about where I believe the world must focus its resources. My five priorities are:

${top5}

${totalLine}

I am not naive. I know reallocation at this scale requires political courage that is rarely rewarded in short electoral cycles. But the trajectory we are on, ever-increasing military budgets in a warming, hungering, fractured world, is not making any of us safer. It is buying time, not peace.

We are not separate nations with separate interests. We are one species, sharing one atmosphere, drinking from the same water, feeding from the same soil. The decisions made now about how to allocate this planet's resources will shape whether our children inherit a liveable world.

I am choosing to believe you share that goal. And I am asking you, respectfully but urgently, to act like it.

Yours sincerely,

${name}
${country}`;

  // contenteditable: render HTML so red prompts show; copy uses innerText
  out.innerHTML = letter.replace(/\n/g, "<br>");
  out.dataset.plain = out.innerText;
}

function copyLetter() {
  const out = document.getElementById("letterOutput");
  const txt = out?.innerText || out?.dataset?.plain || "";
  navigator.clipboard.writeText(txt).then(() => {
    const b = document.querySelector(".tool-btn");
    if (b) {
      const o = b.textContent;
      b.textContent = "✓ Copied";
      setTimeout(() => (b.textContent = o), 2000);
    }
  });
}

function emailLetter() {
  const out = document.getElementById("letterOutput");
  const txt = out?.innerText || out?.dataset?.plain || "";
  const sub = encodeURIComponent(
    "On the allocation of our national budget, a citizen's priorities",
  );
  window.open(`mailto:?subject=${sub}&body=${encodeURIComponent(txt)}`, "_blank");
}

function tweetLetter() {
  if (ranking.length < 5) {
    alert("Rank your top 5 priorities first, so your letter is complete.");
    return;
  }
  const r5 = ranking
    .slice(0, 5)
    .map((i) => issueData[i].name)
    .join(", ");
  const txt = `My top 5 priorities for planetary funding:\n${r5}\nCost: ${fmt(ranking.reduce((s, i) => s + issueData[i].cost, 0))}/yr vs the world's $2.89T military budget\nstudioex.co #CostOfWar @404blueprint`;
  window.open(
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(txt),
    "_blank",
  );
}

function goToRank() {
  if (sel.size === 0) {
    document
      .getElementById("redistribute")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    const p = document.getElementById("redistPrompt");
    if (p) {
      p.textContent = "← Select at least one issue first";
      p.classList.add("go");
    }
    return;
  }
  document
    .getElementById("rankSection")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function goToCountry() {
  document
    .getElementById("countrySection")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function goToLetter() {
  document
    .getElementById("letterSection")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function goToCoalition() {
  document
    .getElementById("coalitionSection")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ═══ COALITION ══════════════════════════════════════════════════
// NOTE FOR BACKEND DEV: replace localStorage with a real store (e.g.
// Supabase table `submissions`, see README). Set SUPABASE_URL/KEY.
const SUPABASE_URL = null;
const SUPABASE_KEY = null;
const SEED_COUNT = 2847;

function getLocalSubs() {
  try {
    return JSON.parse(localStorage.getItem("cow_subs") || "[]");
  } catch (e) {
    return [];
  }
}
function saveLocalSub(d) {
  const a = getLocalSubs();
  a.push(d);
  try {
    localStorage.setItem("cow_subs", JSON.stringify(a.slice(-500)));
  } catch (e) {}
}

function getTally() {
  const local = getLocalSubs();
  const tally = {};
  local.forEach((s) => {
    if (s.ranking)
      s.ranking.forEach((i) => {
        tally[i] = (tally[i] || 0) + 1;
      });
  });
  return { count: SEED_COUNT + local.length, tally };
}

function initCoalition() {
  const { count, tally } = getTally();
  animCoalitionNum(count);
  const topDiv = document.getElementById("coalitionTopIssues");
  if (topDiv) {
    topDiv.innerHTML = "";
    issueData.forEach((_, i) => {
      const div = document.createElement("div");
      div.className = "cti" + (tally[i] ? " hot" : "");
      div.textContent = issueData[i].name;
      topDiv.appendChild(div);
    });
  }
  setTimeout(() => {
    const f = document.getElementById("coalitionBarFill");
    if (f) f.style.width = Math.min((count / 10000) * 100, 100) + "%";
  }, 700);
}

function animCoalitionNum(target) {
  const el = document.getElementById("coalitionNum");
  if (!el) return;
  const s = performance.now(),
    from = SEED_COUNT,
    dur = 1800;
  (function f(now) {
    const p = Math.min((now - s) / dur, 1),
      v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 4)));
    el.textContent = v.toLocaleString();
    if (p < 1) requestAnimationFrame(f);
  })(s);
}

function submitCoalition() {
  if (ranking.length < 5) {
    alert("Please complete your top 5 ranking first (Step 01).");
    return;
  }
  const email = (document.getElementById("coalitionEmail")?.value || "").trim();
  const country = selectedCountry ? selectedCountry[0] : "Unknown";
  const data = { ranking: [...ranking], country, email, ts: Date.now() };
  saveLocalSub(data);
  if (SUPABASE_URL && SUPABASE_KEY) {
    fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(data),
    }).catch(() => {});
  }
  if (email) {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("country", country);
    fd.append("priorities", ranking.map((i) => issueData[i].name).join(", "));
    fd.append("source", "coalition");
    fetch("https://formsubmit.co/ajax/greg@studioex.co", {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    }).catch(() => {});
  }
  const thanks = document.getElementById("coalitionThanks");
  if (thanks) thanks.style.display = "block";
  const btn = document.querySelector(".coalition-form .btn-t");
  if (btn) btn.disabled = true;
  const emailEl = document.getElementById("coalitionEmail");
  if (emailEl) emailEl.disabled = true;
  const { count } = getTally();
  animCoalitionNum(count);
  initCoalition();
  setTimeout(() => generateShareCard(), 500);
}

// ═══ SHARE CARD ═════════════════════════════════════════════════
function generateShareCard() {
  if (ranking.length < 5) {
    alert("Rank your top 5 priorities first to generate your card.");
    return;
  }
  const country = selectedCountry ? selectedCountry[0] : "the world";
  const spend = selectedCountry ? `$${selectedCountry[2]}B` : "$2.89T";
  const totalB = ranking.reduce((s, i) => s + issueData[i].cost, 0);
  const total = fmt(totalB);
  const { count } = getTally();

  const hed = document.getElementById("scHeadline");
  if (hed) hed.textContent = `I choose to fund the planet.`;

  const issDiv = document.getElementById("scIssues");
  if (issDiv) {
    issDiv.innerHTML = "";
    ranking.slice(0, 5).forEach((idx, pos) => {
      const iss = issueData[idx];
      const row = document.createElement("div");
      row.className = "sc-row";
      row.innerHTML = `<div class="sc-rn">${pos + 1}</div><div class="sc-dot" style="background:${iss.color}"></div><div class="sc-in">${iss.name}</div><div class="sc-ic" style="color:${iss.color}">${fmt(iss.cost)}/yr</div>`;
      issDiv.appendChild(row);
    });
  }

  const statL = document.getElementById("scStatLeft");
  if (statL)
    statL.innerHTML = `Total annual cost:<br>${total}<br><br>${Math.round((totalB / DEFENCE) * 100)}% of the global military budget`;
  const statR = document.getElementById("scStatRight");
  if (statR) statR.textContent = `${count.toLocaleString()}\npeople\nhave chosen`;

  const cl = document.getElementById("scCountryLine");
  if (cl) cl.textContent = `From ${country} · ${spend} annual military spend`;

  document.getElementById("scOverlay")?.classList.add("open");
}

function downloadCard() {
  if (window.html2canvas) {
    html2canvas(document.getElementById("shareCard"), {
      backgroundColor: "#000",
      scale: 2,
    }).then((c) => {
      const a = document.createElement("a");
      a.download = "cost-of-war-my-priorities.png";
      a.href = c.toDataURL("image/png");
      a.click();
    });
  } else {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = () => downloadCard();
    document.head.appendChild(s);
  }
}

function shareCardTo(type) {
  const r5 = ranking
    .slice(0, 5)
    .map((i) => issueData[i].name)
    .join(" · ");
  const txt = `My top 5 priorities if we redirected the world's $2.89T military budget:\n${r5}\nTotal: ${fmt(ranking.reduce((s, i) => s + issueData[i].cost, 0))}/yr\nstudioex.co  #CostOfWar @404blueprint`;
  if (type === "twitter")
    window.open(
      "https://twitter.com/intent/tweet?text=" + encodeURIComponent(txt),
      "_blank",
    );
  else if (type === "linkedin")
    window.open(
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(location.href),
      "_blank",
    );
  else if (type === "instagram")
    navigator.clipboard
      .writeText(txt)
      .then(() =>
        alert(
          "Caption copied, paste into Instagram. Screenshot your card first!",
        ),
      );
}

// ═══ INIT ═══════════════════════════════════════════════════════
window.addEventListener("load", () => {
  setTimeout(() => {
    cntTo(document.getElementById("hDef"), 2887, 2200);
    cntTo(document.getElementById("hTotal"), 21810, 3000);
  }, 450);
  tickLiveSpend();
  buildSpendDonut();
  buildEmissions();
  buildDualSpenders();
  drawDotField();
  buildDotLegend();
  buildHumanStrip();
  drawLives();
  buildIssues();
  buildRanking();
  buildCountrySelect();
  initCoalition();
  initScrollProgress();
  initReveal();
  rszFlow();
  drawFlow();
  updateTracker();
  updateSummary();
  updateGate();
  generateLetter();
  // animate impact GDP bar when scrolled into view
  const igf = document.getElementById("impactGdpFill");
  if (igf) {
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            igf.style.width = igf.dataset.w + "%";
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(igf);
  }
});
