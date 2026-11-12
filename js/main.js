/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — APP LOGIC  (2026 revision)
   ═══════════════════════════════════════════════════════════════════ */

// ═══ STATE ══════════════════════════════════════════════════════
const sel = new Set();
let allocated = 0;
let ranking = [];
let selectedCountry = null;
let rankPrompted = false; // auto-open rank modal once the budget is full
let userTax = { used: false, income: 0, toWar: 0, currency: "$" }; // tax slider

// ═══ FORMAT ═════════════════════════════════════════════════════
function fmt(b) {
  return b >= 1000
    ? "$" + (b / 1000).toFixed(2) + "T"
    : "$" + Math.round(b) + "B";
}

// ═══ TOOL VIEWS ═════════════════════════════════════════════════
// main.js owns the state and the logic of every tool. The views (js/tools/h1.js … h6.js) only
// draw it: ToolView.on(name, fn) calls fn(state) now (with the latest state, if there is one) and
// after every change. main.js calls ToolView.update(name, state). A view that throws is logged
// and never stops the tool. The states:
//   "redistribute"  ranking chosen[{i,rank,name,cost,costText}] blocked[i] defence allocated remaining
//                   remainingPct allocatedText remainingText count gateOpen
//   "country"       null (nothing to show) or name spend spendText pctGdp population contact
//                   shareOfDefence comparisons[{i,name,cost,pct,covers,canFund}] trend{value,known,rising}
//   "tax"           country currency position income incomeText rate annualTax annualTaxText
//                   milShareOfTax milSharePct toWar toWarText perDay perDayText used
//   "letter"        rankDone countryDone complete text
//   "coalition"     count tally showSeeded revealed submitted country letterOptIn
//                   globalPriorities[{i,name,w,barPct,pct}] globe[{country,count,lat,lng,alt,color}]
//   "globe"         mode ("webgl" or "flat") instance (the globe.gl object) landsIn (ms until a turn ends)
//   "card"          open and, while open: country spendText totalB totalText pctOfBudget count revealed
//                   top5[{rank,i,name,costText}]
//   "share"         open
//   "archive"       (from js/room.js) ready sample stats ages letters openLetter(i) letterMeta(i)
window.ToolView = (function () {
  const subs = {},
    last = {};
  function send(fn, state) {
    try {
      fn(state);
    } catch (e) {
      console.error("[ToolView]", e);
    }
  }
  return {
    on(name, fn) {
      (subs[name] = subs[name] || []).push(fn);
      if (name in last) send(fn, last[name]);
    },
    update(name, state) {
      last[name] = state;
      (subs[name] || []).forEach((fn) => send(fn, state));
    },
  };
})();

// Has the reader changed anything in the tools? The story engine reads this: a resize must never
// reload them away. A plain flag: nothing the reader did is stored by it.
window.__toolDirty = false;
["input", "change", "click"].forEach((type) =>
  document.addEventListener(
    type,
    (e) => {
      const t = e.target;
      if (t.closest && !t.closest("#story") && t.closest("input, select, textarea, button, [contenteditable], .ix"))
        window.__toolDirty = true;
    },
    true,
  ),
);

// Keep a reader's place in the tools when the window changes size (a zoom, a half-screen window, a
// turned phone or tablet). The tools reflow at a new width, so the same distance below the story
// lands in a different tool. While the reader is below the story this notes what they are on: the
// control they are in, if it is on screen, otherwise what sits in the middle of the screen (never
// something stuck to the screen, whose place there says nothing; a canvas counts as its box, since
// it can give way to a still picture). The story engine calls window.__keepPlace() once it has laid
// itself out at the new size, and that puts the noted element back at the same height on screen.
// Typing in the letter, which is often taller than the screen, the caret's line is noted instead of
// the letter's top, and comes back on screen at the new size (a turned phone is much shorter).
(function () {
  const story = document.getElementById("story");
  let mark = null,
    markTop = 0,
    caretTop = null,
    hold = 0;
  const after = (a) => !!(a && a.nodeType === 1 && story && (story.compareDocumentPosition(a) & 20) === 4);
  const free = (a) => {
    for (let e = a; e && e.nodeType === 1; e = e.parentElement)
      if (/sticky|fixed/.test(getComputedStyle(e).position)) return null;
    return a.tagName === "CANVAS" ? a.parentElement : a;
  };
  // the line the caret is on in an editable element, on screen now (null if it cannot be read)
  const caretOf = (a) => {
    const s = getSelection();
    if (!a.isContentEditable || !s.rangeCount || !a.contains(s.focusNode)) return null;
    const r = document.createRange();
    r.setStart(s.focusNode, s.focusOffset);
    let q = r.getClientRects()[0];
    if (!q) {
      // at a line break the caret has no box of its own: take the node it sits beside
      const n = s.focusNode.nodeType === 1 ? s.focusNode.childNodes[s.focusOffset] || s.focusNode.childNodes[s.focusOffset - 1] : s.focusNode;
      if (n && n.nodeType === 1) q = n.getBoundingClientRect();
      else if (n) {
        r.selectNodeContents(n);
        q = r.getClientRects()[0];
      }
    }
    return q && q.height ? q : null;
  };
  function note() {
    if (hold) return;
    // in the story (or at its very end) the engine keeps the place itself: nothing to note
    if (!story || story.getBoundingClientRect().bottom >= innerHeight - 1) return void (mark = null);
    let a = document.activeElement,
      r = after(a) && a.getBoundingClientRect(),
      c = r && caretOf(a);
    // a caret scrolled out of sight: the reader is reading elsewhere, not typing here
    if (c && !(c.bottom > 0 && c.top < innerHeight)) r = c = null;
    if (!(r && r.bottom > 0 && r.top < innerHeight)) {
      a = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      a = after(a) ? free(a) : null;
    }
    mark = a;
    caretTop = c ? c.top : null;
    if (a) markTop = a.getBoundingClientRect().top;
  }
  window.addEventListener("scroll", note, { passive: true });
  document.addEventListener("focusin", note);
  // typing moves the caret without scrolling
  document.addEventListener("selectionchange", note);
  // between a resize and the engine's new layout the browser may scroll on its own: not a place
  window.addEventListener("resize", () => {
    clearTimeout(hold);
    hold = setTimeout(() => {
      hold = 0;
      note(); // where the reader is now, at rest
    }, 400);
  });
  window.__keepPlace = () => {
    if (!mark || !mark.isConnected || !mark.getClientRects().length) return false;
    const c = caretTop !== null && caretOf(mark);
    if (c) {
      // the caret's line at the same height if that is still on screen, else as near as it fits
      const v = window.visualViewport,
        top = v ? v.offsetTop : 0,
        h = v ? v.height : innerHeight,
        want = Math.max(top + 16, Math.min(caretTop, top + h - c.height - 16));
      window.scrollBy({ top: c.top - want, behavior: "instant" });
    } else window.scrollBy({ top: mark.getBoundingClientRect().top - markTop, behavior: "instant" });
    return true;
  };
})();

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
    const moreLabel = (open) =>
      `<span class="ix-chev" aria-hidden="true">${open ? "▴" : "▾"}</span><span class="ix-more-t"> ${open ? "Show less" : "Read more &amp; sources"} · <span class="ix-pct">${pct}% of the budget</span></span>`;
    // what a screen reader says: the same words, and which cause they belong to
    const moreName = (open) =>
      `${open ? "Show less" : "Read more & sources"} · ${pct}% of the budget · ${iss.name}`;
    card.innerHTML = `
      <button type="button" class="ix-pick">
        <span class="ix-sdg">${iss.sdg}</span>
        <span class="ix-chk"></span>
        <span class="ix-name">${iss.name}</span>
        <span class="ix-cost">${fmt(iss.cost)}<span class="yr">/yr</span></span>
      </button>
      <div class="ix-sum">${iss.sum}</div>
      <div class="ix-detail">${iss.detail}</div>
      <div class="ix-foot">
        <button type="button" class="ix-more" aria-expanded="false" aria-label="${moreName(false)}">${moreLabel(false)}</button>
        <span class="ix-src"><a href="${iss.url}" target="_blank" rel="noopener"><span>${iss.src.split(" ")[0]} <span aria-hidden="true">↗</span></span></a></span>
      </div>`;
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      if (e.target.closest(".ix-more")) {
        const open = card.classList.toggle("ix-exp");
        const m = card.querySelector(".ix-more");
        m.innerHTML = moreLabel(open);
        m.setAttribute("aria-expanded", open);
        m.setAttribute("aria-label", moreName(open));
        return;
      }
      if (e.target !== card && !e.target.closest(".ix-pick")) return; // only the cause's own button chooses it
      toggleIssue(i);
    });
    (i < half ? colL : colR).appendChild(card);
  });
}

// ═══ SELECT = RANK ══════════════════════════════════════════════
// Selection order IS the priority ranking. `ranking` stays the ordered
// array of issue indices the letter / share card / submission depend on;
// `sel` is its Set mirror, used by the pie + tracker.
function toggleIssue(i) {
  const card = document.getElementById("ix" + i);
  if (card && card.classList.contains("ix-cant") && !sel.has(i)) return;
  if (sel.has(i)) {
    sel.delete(i);
    ranking = ranking.filter((x) => x !== i);
  } else {
    sel.add(i);
    ranking.push(i); // selection order = priority order
  }
  allocated = 0;
  sel.forEach((x) => (allocated += issueData[x].cost));
  updateTracker();
  updateCant();
  updateSummary();
  updateGate();
  renderPriorities();
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
    sb.innerHTML = "";
    ss.textContent =
      "The money to solve these crises already exists in the world's annual military budgets. This is not a question of financial capacity. It is a question of political will.";
  } else if (pct <= 0) {
    sb.innerHTML = `<span class="g">${sel.size} global crises</span><br>fully funded from one year of military spending.`;
    ss.textContent = `You allocated ${fmt(allocated)}. The military budget is exhausted, and ${sel.size} of humanity's greatest challenges are addressed from a single year of weapons spending. The money was always there.`;
  } else {
    sb.innerHTML = `<span class="g">${fmt(allocated)}</span> redirected to ${sel.size} issue${sel.size !== 1 ? "s" : ""}.<br><span class="r">${fmt(rem)}</span> still goes to weapons.`;
    ss.textContent = `After funding ${sel.size} global cris${sel.size !== 1 ? "es" : "is"}, ${fmt(rem)}, ${pct.toFixed(0)}% of the military budget, remains. It continues to flow into weapons. This is the geometry of our current priorities.`;
  }
}

// ═══ GATE (unlock journey once user engages) ════════════════════
function updateGate() {
  const gate = document.getElementById("journeyGate");
  const prompt = document.getElementById("redistPrompt");
  if (!gate) return;
  const content = gate.querySelector(".gated-content");
  if (content) content.inert = sel.size < 1;
  if (sel.size >= 1) {
    gate.classList.remove("locked");
    if (prompt) {
      prompt.textContent = `✓ ${fmt(allocated)} redirected · ${ranking.length} ${ranking.length === 1 ? "priority" : "priorities"}`;
      prompt.classList.add("go");
    }
  } else {
    gate.classList.add("locked");
    if (prompt) {
      prompt.textContent = "$2.89T to redistribute";
      prompt.classList.remove("go");
    }
  }
}

// ═══ RESET ══════════════════════════════════════════════════════
function resetAll() {
  sel.clear();
  allocated = 0;
  ranking = [];
  document.querySelectorAll(".ix").forEach((c) => {
    c.classList.remove("ix-sel", "ix-cant", "ix-top5");
    c.querySelector(".ix-cant-tag")?.remove();
    c.querySelector(".ix-rank")?.remove();
  });
  updateTracker();
  updateSummary();
  updateGate();
  renderPriorities();
}

// ═══ SHARE ══════════════════════════════════════════════════════
function openShare() {
  document.getElementById("shareOv").classList.add("open");
  ToolView.update("share", { open: true });
}
function closeShare() {
  document.getElementById("shareOv").classList.remove("open");
  ToolView.update("share", { open: false });
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

// ═══ PRIORITIES (live ranking = selection order) ════════════════
// Renders rank badges on the cards + the ordered "your priorities" list
// with reorder controls. `ranking` is the single source of truth.
function renderPriorities() {
  // rank-number badge + green highlight on each selected card, in order
  issueData.forEach((_, i) => {
    const card = document.getElementById("ix" + i);
    if (!card) return;
    const pos = ranking.indexOf(i);
    card.classList.toggle("ix-sel", pos > -1);
    card.classList.toggle("ix-top5", pos > -1);
    card.querySelector(".ix-rank")?.remove();
    if (pos > -1) {
      const rk = document.createElement("div");
      rk.className = "ix-rank";
      rk.textContent = pos + 1;
      card.querySelector(".ix-pick").prepend(rk);
    }
  });

  // the ordered list + reorder controls
  const list = document.getElementById("prioList");
  const panel = document.getElementById("prioPanel");
  const cont = document.getElementById("toCountryBtn");
  if (panel) panel.classList.toggle("show", ranking.length > 0);
  if (cont) cont.disabled = ranking.length === 0;
  if (list) {
    list.innerHTML = ranking
      .map(
        (idx, p) =>
          `<div class="prio-item" data-i="${idx}">
             <span class="prio-rank">${p + 1}</span>
             <span class="prio-dot" style="--s:${Math.sqrt(issueData[idx].cost / DEFENCE).toFixed(4)}"></span>
             <span class="prio-name">${issueData[idx].name}</span>
             <span class="prio-cost">${fmt(issueData[idx].cost)}/yr</span>
             <span class="prio-moves">
               <button class="prio-mv" title="Move up" aria-label="Move ${issueData[idx].name} up" onclick="moveRank(${idx},-1)" ${p === 0 ? "disabled" : ""}>↑</button>
               <button class="prio-mv" title="Move down" aria-label="Move ${issueData[idx].name} down" onclick="moveRank(${idx},1)" ${p === ranking.length - 1 ? "disabled" : ""}>↓</button>
               <button class="prio-rm" title="Remove" aria-label="Remove ${issueData[idx].name}" onclick="toggleIssue(${idx})">✕</button>
             </span>
           </div>`,
      )
      .join("");
  }
  generateLetter();
  buildGlobalPriorities();
  viewRedistribute();
}

function viewRedistribute() {
  const rem = Math.max(0, DEFENCE - allocated);
  ToolView.update("redistribute", {
    ranking: [...ranking],
    chosen: ranking.map((i, p) => ({
      i,
      rank: p + 1,
      name: issueData[i].name,
      cost: issueData[i].cost,
      costText: fmt(issueData[i].cost),
    })),
    blocked: issueData
      .map((iss, i) => (!sel.has(i) && allocated + iss.cost > DEFENCE ? i : -1))
      .filter((i) => i > -1),
    defence: DEFENCE,
    allocated,
    remaining: rem,
    remainingPct: (rem / DEFENCE) * 100,
    allocatedText: fmt(allocated),
    remainingText: fmt(rem),
    count: sel.size,
    gateOpen: sel.size >= 1,
  });
}

function moveRank(idx, dir) {
  const p = ranking.indexOf(idx);
  const q = p + dir;
  if (p < 0 || q < 0 || q >= ranking.length) return;
  [ranking[p], ranking[q]] = [ranking[q], ranking[p]];
  renderPriorities();
}

// the page moves only when the reader asks it to, and never smoothly under reduced motion
function goTo(id) {
  const still =
    location.search.includes("static") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
}

// continue: confirm the ordered list, then flow to the country step
function goToCountryFromRedist() {
  goTo(ranking.length === 0 ? "redistribute" : "countrySection");
}
function goToRedistribute() {
  goTo("redistribute");
  // the keyboard goes where the page went: the first cause, not back to the gate's button
  document.querySelector("#ix0 .ix-pick")?.focus({ preventScroll: true });
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
    ToolView.update("country", null);
    return;
  }
  selectedCountry = c;
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = "1";
  }
  box.style.display = "block";
  const spend = c[2];
  const compared = issueData.slice(0, 6).map((iss, i) => ({
    i,
    name: iss.name,
    cost: iss.cost,
    pct: Math.min((spend / iss.cost) * 100, 100),
    covers: ((spend / iss.cost) * 100).toFixed(0),
    canFund: spend >= iss.cost,
  }));
  const comparisons = compared
    .map(
      (m) => `<div class="cc-bar-row">
      <div class="cc-bar-lbl">${m.name}</div>
      <div class="cc-bar-track"><div class="cc-bar-fill" style="width:${m.pct.toFixed(1)}%" data-w="${m.pct.toFixed(1)}"></div></div>
      <div class="cc-bar-val${m.canFund ? " can" : ""}">${m.covers}%</div>
    </div>`,
    )
    .join("");
  const contactHTML = c[5]
    ? `<a href="${c[5]}" target="_blank" rel="noopener"><span>Contact your representative <span aria-hidden="true">↗</span></span></a>`
    : "";

  // ── spending trend indicator ──
  const trendVal = countryTrend[c[0]];
  const tv = trendVal === undefined ? GLOBAL_TREND : trendVal;
  const known = trendVal !== undefined;
  const rising = tv >= 0;
  const trendHTML = `<div class="trend-ind">
      <div class="trend-arrow ${rising ? "up" : "down"}" aria-hidden="true">${rising ? "▲" : "▼"}</div>
      <div>
        <div class="trend-val ${rising ? "up" : "down"}">${rising ? "+" : ""}${tv}%</div>
        <div class="trend-cap">${known ? "change in " + c[0] + "'s military spend, 2024 to 2025" : "no national figure; shown is the world average (ex-US), which rose " + GLOBAL_TREND + "%"}. ${rising ? "Spending is climbing." : "Spending is falling."}</div>
      </div>
    </div>`;

  // ── most-chosen priorities among people in this country (seeded + live) ──
  const cTally = SHOW_SEEDED ? countryPriorityTally(c[0]) : [];
  const cMax = Math.max(...cTally.map((t) => t.w));
  const prioHTML = cTally
    .slice(0, 6)
    .map(
      (t) =>
        `<div class="prio-bar-row"><div class="prio-bar-name">${issueData[t.i].name}</div><div class="prio-bar-track"><div class="prio-bar-fill" style="width:${((t.w / cMax) * 100).toFixed(0)}%" data-w="${((t.w / cMax) * 100).toFixed(0)}"></div></div><div class="prio-bar-pct">${Math.round((t.w / cTally.reduce((s, x) => s + x.w, 0)) * 100)}%</div></div>`,
    )
    .join("");

  box.innerHTML = `<div class="cc-name">${c[0]}</div>
<div class="cc-spend">$${spend}B</div>
<div class="cc-meta">${c[3]}% of GDP · SIPRI 2025 · Population ~${c[4]}M${contactHTML ? " · " + contactHTML : ""}</div>
<div class="cc-bars">${comparisons}</div>
<div class="cc-note">Your country contributes ${((spend / DEFENCE) * 100).toFixed(2)}% of the $2.89T global military total. This is the scale of your nation's stake in how the world chooses to spend its resources.</div>
<div class="cc-extra">
  <div><div class="cc-extra-h">Where ${c[0]} is heading</div>${trendHTML}</div>
  ${SHOW_SEEDED ? `<div><div class="cc-extra-h">What people in ${c[0]} would fund first</div>${prioHTML}</div>` : ""}
</div>
<div class="tax-box">
  <div class="tax-box-h big">Where does your tax money go?</div>
  <div class="tax-intro">Slide to your income and see how much of your tax funds the military each year.</div>
  <div class="tax-slider-wrap">
    <div class="tax-income"><span class="tax-income-cur">${currencyFor(c[0])}</span><span id="taxIncomeVal">45,000</span><span class="tax-income-yr">/yr income</span></div>
    <input type="range" class="tax-slider" id="taxSlider" min="0" max="1000" value="430" oninput="updateTaxSlider(true)" />
    <div class="tax-slider-scale"><span>0</span><span>${currencyFor(c[0])}100k</span><span>${currencyFor(c[0])}1M</span><span>${currencyFor(c[0])}6M</span></div>
  </div>
  <div class="tax-result show" id="taxResult"></div>
</div>`;
  updateTaxSlider(false);
  generateLetter();
  const note = document.getElementById("letterContactNote");
  if (note && c[5])
    note.innerHTML = `Find your representative: <a href="${c[5]}" target="_blank">${c[0]} government contact page <span aria-hidden="true">↗</span></a>`;
  ToolView.update("country", {
    name: c[0],
    spend,
    spendText: "$" + spend + "B",
    pctGdp: c[3],
    population: c[4],
    contact: c[5] || null,
    shareOfDefence: ((spend / DEFENCE) * 100).toFixed(2),
    comparisons: compared,
    trend: { value: tv, known, rising },
  });
}

// ═══ PERSONAL TAX → WAR (income slider) ═════════════════════════
function currencyFor(country) {
  return CURRENCY[country] || "$";
}
// non-linear slider 0..1000 → income: fine 0–200k (pos 0–700), coarse to 6M
function sliderToIncome(pos) {
  if (pos <= 700) return Math.round((pos / 700) * 200000);
  return Math.round(200000 + ((pos - 700) / 300) * (6000000 - 200000));
}
// indicative progressive effective income-tax rate
function effectiveTaxRate(income) {
  if (income < 15000) return 0.08;
  if (income < 50000) return 0.08 + ((income - 15000) / 35000) * 0.12; // →0.20
  if (income < 150000) return 0.2 + ((income - 50000) / 100000) * 0.12; // →0.32
  if (income < 500000) return 0.32 + ((income - 150000) / 350000) * 0.08; // →0.40
  return 0.42;
}
function fmtMoney(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n >= 10000000 ? 0 : 1) + "M";
  return Math.round(n).toLocaleString();
}
function updateTaxSlider(fromUser) {
  const slider = document.getElementById("taxSlider");
  const out = document.getElementById("taxResult");
  const incEl = document.getElementById("taxIncomeVal");
  if (!slider || !out || !selectedCountry) return;
  const cur = currencyFor(selectedCountry[0]);
  const income = sliderToIncome(+slider.value);
  if (incEl) incEl.textContent = fmtMoney(income);
  const milShareOfTax = selectedCountry[3] / 100 / GOV_SPEND_GDP;
  const annualTax = income * effectiveTaxRate(income);
  const toWar = annualTax * milShareOfTax;
  const perDay = toWar / 365;
  // capture for submission + letter (only flag 'used' on real interaction)
  userTax = {
    used: fromUser ? true : userTax.used,
    income,
    toWar: Math.round(toWar),
    currency: cur,
  };
  if (fromUser) generateLetter();
  out.innerHTML = `
    <div class="tax-amt">${cur}${fmtMoney(toWar)}<span class="tax-yr"> /yr</span></div>
    <div class="tax-lbl">of your income tax goes to ${selectedCountry[0]}'s military each year, about <b>${cur}${perDay < 10 ? perDay.toFixed(2) : Math.round(perDay).toLocaleString()} a day</b>. That's ${(milShareOfTax * 100).toFixed(1)}% of the roughly ${cur}${fmtMoney(annualTax)} you'd pay in income tax.</div>
    <div class="tax-note">Indicative estimate. Assumes government spending ≈ ${Math.round(GOV_SPEND_GDP * 100)}% of GDP and a representative progressive tax rate; not tax advice. Built to wire into real national tax data later.</div>`;
  out.classList.add("show");
  ToolView.update("tax", {
    country: selectedCountry[0],
    currency: cur,
    position: +slider.value,
    income,
    incomeText: fmtMoney(income),
    rate: effectiveTaxRate(income),
    annualTax,
    annualTaxText: fmtMoney(annualTax),
    milShareOfTax,
    milSharePct: (milShareOfTax * 100).toFixed(1),
    toWar,
    toWarText: fmtMoney(toWar),
    perDay,
    perDayText: perDay < 10 ? perDay.toFixed(2) : Math.round(perDay).toLocaleString(),
    used: userTax.used,
  });
}

// ═══ LETTER (with red placeholders when incomplete) ═════════════
function generateLetter() {
  const out = document.getElementById("letterOutput");
  const note = document.getElementById("letterNote");
  if (!out) return;

  const rankDone = ranking.length >= 1;
  const countryDone = !!selectedCountry;
  const complete = rankDone && countryDone;
  if (note) note.classList.toggle("show", !complete);

  const RED = (t) => `<span class="letter-redfill">${t}</span>`;
  const n = ranking.length;

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
    : RED("[Pick your country in Step 01 to show what it spends.]");

  const top5 = rankDone
    ? ranking
        .map(
          (idx, i) =>
            `  ${i + 1}. ${issueData[idx].name} (${fmt(issueData[idx].cost)} per year)`,
        )
        .join("\n")
    : RED(
        "[Go back, fund some causes and rank them. Your priorities will appear here.]",
      );
  const totalB = rankDone
    ? ranking.reduce((s, i) => s + issueData[i].cost, 0)
    : 0;
  const totalLine = rankDone
    ? `To fund ${n === 1 ? "this priority" : "all " + n} at the levels needed would cost ${fmt(totalB)} per year, about ${Math.round((totalB / DEFENCE) * 100)}% of one year of global military spending. Not a utopian fantasy. A budget question.`
    : RED(
        "[Once you have ranked your priorities, the total cost of your choices will be calculated here.]",
      );

  // personal line, only if the user actually set their income on the slider
  const personalLine =
    userTax.used && countryDone
      ? `\n\nThis is not abstract to me. By my own estimate, roughly ${userTax.currency}${userTax.toWar.toLocaleString()} of the income tax I pay each year goes toward military spending. I would rather it built something.`
      : "";

  const letter = `Dear ${leader},

My name is ${name}. I am writing to you not as a partisan voice, not as an ideologue, and not from a place of anger, but as a human being who has sat with some uncomfortable numbers and can no longer stay quiet about what they mean.

In 2025, the world spent $2.89 trillion on its militaries, the eleventh consecutive annual record. ${contributionLine} I do not write to question the sincerity of those who serve, or to pretend that the threats governments face are not real. I understand that the world is not safe.

But I have come to believe that the world is also not as safe as it could be, precisely because of how we are choosing to spend.

This year, 673 million people went hungry. 272 million children could not go to school. 117.8 million people remain displaced from their homes. The UN's humanitarian appeal received barely a third of what it asked for, while spending on nuclear weapons alone rose 19% to a record $119 billion. These are the compounding conditions of a planet in genuine distress, one that will produce more conflict the longer we leave them unaddressed.

I have thought carefully about where I believe the world must focus its resources. My priorities are:

${top5}

${totalLine}${personalLine}

I am not naive. I know reallocation at this scale requires political courage that is rarely rewarded in short electoral cycles. But the trajectory we are on, ever-increasing military budgets in a warming, hungering, fractured world, is not making any of us safer. It is buying time, not peace.

We are not separate nations with separate interests. We are one species, sharing one atmosphere, drinking from the same water, feeding from the same soil. The decisions made now about how to allocate this planet's resources will shape whether our children inherit a liveable world.

I am choosing to believe you share that goal. And I am asking you, respectfully but urgently, to act like it.

Yours sincerely,

${name}
${country}`;

  // contenteditable: render HTML so red prompts show; copy uses innerText
  out.innerHTML = letter.replace(/\n/g, "<br>");
  out.dataset.plain = out.innerText;
  ToolView.update("letter", { rankDone, countryDone, complete, text: out.dataset.plain });
}

function copyLetter() {
  const out = document.getElementById("letterOutput");
  const txt = out?.innerText || out?.dataset?.plain || "";
  navigator.clipboard.writeText(txt).then(() => {
    const b = document.querySelector(".tool-btn");
    if (b) {
      // always back to "Copy": reading the label at click time kept "✓ Copied" after a second click within 2 s
      b.textContent = "✓ Copied";
      clearTimeout(b._copied);
      b._copied = setTimeout(() => (b.textContent = "Copy"), 2000);
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
  if (ranking.length < 1) {
    alert("Fund some causes and rank them first, so your letter is complete.");
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

// the single primary action: copy the letter + open the rep's contact page
function sendToRepresentative() {
  const out = document.getElementById("letterOutput");
  const txt = out?.innerText || out?.dataset?.plain || "";
  const open = () => {
    const url = selectedCountry && selectedCountry[5];
    if (url) {
      window.open(url, "_blank", "noopener");
    } else {
      const sub = encodeURIComponent(
        "On the allocation of our national budget, a citizen's priorities",
      );
      window.open(
        `mailto:?subject=${sub}&body=${encodeURIComponent(txt)}`,
        "_blank",
      );
    }
  };
  if (navigator.clipboard && txt) {
    navigator.clipboard.writeText(txt).then(
      () => {
        alert(
          "Your letter is copied to the clipboard. We'll open your representative's contact page — paste it in.",
        );
        open();
      },
      () => open(),
    );
  } else {
    open();
  }
}

function goToLetter() {
  goTo("letterSection");
}
function goToCoalition() {
  goTo("coalitionSection");
}

// ═══ COALITION ══════════════════════════════════════════════════
// Live data comes from Supabase (js/backend.js) when configured;
// otherwise we fall back to this browser's localStorage (demo mode).
const SEED_COUNT = (window.COW_CONFIG && window.COW_CONFIG.SEED_COUNT) || 2847;
// Off (the default): no invented count, tally, nudge, bar or globe sign-up shows, only real
// participation. On: exactly the seeded behaviour. js/data.js keeps the seeds either way.
const SHOW_SEEDED = !!(window.COW_CONFIG && window.COW_CONFIG.SHOW_SEEDED);
const SEED_BASE = SHOW_SEEDED ? SEED_COUNT : 0;

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
  // live backend (shared across all visitors)
  if (window.__cowConfigured && window.__cowLive && window.__cowLive.ready) {
    return {
      count: SEED_BASE + window.__cowLive.count,
      tally: { ...window.__cowLive.tally },
    };
  }
  // demo fallback (this browser only)
  const local = getLocalSubs();
  const tally = {};
  local.forEach((s) => {
    if (s.ranking)
      s.ranking.forEach((i) => {
        tally[i] = (tally[i] || 0) + 1;
      });
  });
  return { count: SEED_BASE + local.length, tally };
}

// simple deterministic hash so a country always gets the same variation
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// global priorities = seeded weights + everyone's live votes, sorted desc
function globalPriorityTally() {
  const { tally } = getTally();
  return seededPriorityWeights
    .map((w, i) => ({ i, w: (SHOW_SEEDED ? w : 0) + (tally[i] || 0) }))
    .filter((t) => SHOW_SEEDED || t.w > 0)
    .sort((a, b) => b.w - a.w);
}

// per-country priorities = seeded weights nudged by a country hash + that
// country's live votes. Placeholder until the backend serves real data.
function countryPriorityTally(name) {
  const { count } = { count: 0 };
  const local = getLocalSubs().filter((s) => s.country === name);
  const live = {};
  local.forEach((s) =>
    (s.ranking || []).forEach((i) => (live[i] = (live[i] || 0) + 3)),
  );
  const h = strHash(name);
  return seededPriorityWeights
    .map((w, i) => {
      const nudge = ((h >> (i % 12)) & 7) * 4 - 12; // -12..+16, stable per country
      return { i, w: Math.max(5, w + nudge + (live[i] || 0)) };
    })
    .sort((a, b) => b.w - a.w);
}

function buildGlobalPriorities() {
  const wrap = document.getElementById("globalPrio");
  if (!wrap) return;
  const tally = globalPriorityTally();
  if (!tally.length) {
    wrap.innerHTML = ""; // SHOW_SEEDED off and no real votes yet: nothing to draw
    return;
  }
  const total = tally.reduce((s, t) => s + t.w, 0);
  const max = tally[0].w;
  wrap.innerHTML =
    `<div class="global-prio-h">What the coalition would fund first · globally</div>` +
    tally
      .slice(0, 8)
      .map(
        (t) =>
          `<div class="prio-bar-row"><div class="prio-bar-name">${issueData[t.i].name}</div><div class="prio-bar-track"><div class="prio-bar-fill" style="width:${((t.w / max) * 100).toFixed(0)}%" data-w="${((t.w / max) * 100).toFixed(0)}"></div></div><div class="prio-bar-pct">${Math.round((t.w / total) * 100)}%</div></div>`,
      )
      .join("");
}

// ═══ INTERACTIVE 3D GLOBE (coalition) ═══════════════════════════
let globeInstance = null;

// merge: seeded base + this browser's local subs + live backend (when wired).
// Once the database has answered it already counts this browser's earlier sign-ups, so with
// SHOW_SEEDED off only this visit's own sign-up is added to it (sent after the count was read):
// a returning reader is counted once. SHOW_SEEDED on keeps the old sum exactly.
function getCountrySignups() {
  const out = Object.assign({}, SHOW_SEEDED ? seededCountrySignups : null);
  const mine =
    SHOW_SEEDED || !window.__cowCountrySignups
      ? getLocalSubs()
      : coalitionSubmission
        ? [coalitionSubmission]
        : [];
  mine.forEach((s) => {
    if (s.country && s.country !== "Unknown")
      out[s.country] = (out[s.country] || 0) + 1;
  });
  if (window.__cowCountrySignups) {
    Object.entries(window.__cowCountrySignups).forEach(([k, v]) => {
      out[k] = (out[k] || 0) + v;
    });
  }
  return out;
}

function globeData() {
  const counts = getCountrySignups();
  const max = Math.max(1, ...Object.values(counts));
  const pts = [];
  Object.entries(counts).forEach(([country, n]) => {
    const c = countryCoords[country];
    if (!c || n <= 0) return;
    const t = n / max;
    pts.push({
      country,
      count: n,
      lat: c[0],
      lng: c[1],
      alt: 0.04 + Math.sqrt(t) * 0.6,
      color: "#3C8FDE",
    });
  });
  return pts;
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

function globeFallback() {
  ToolView.update("globe", { mode: "flat" }); // the view draws the globe as a still sphere
}

// how far the camera stands from the globe, in globe radii: the view (js/tools/h4.js) reads it too
const GLOBE_ALTITUDE = 2.05;
// bars are kept inside the canvas; with no invented sign-ups the tallest is often one person
function globeBarAlt(d) {
  return d.alt * (SHOW_SEEDED ? 0.55 : 0.25);
}
// where the globe turns to for a country: it stands up and to the left of centre, so its bar shows
// its height and clears the inset
function globeTurn(lat, lng) {
  const narrow = window.innerWidth < 1024;
  return [Math.max(-70, Math.min(70, lat - 26)), lng + (narrow ? 15 : 20)];
}
function globeStill() {
  return (
    location.search.includes("static") ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
// The render loop runs only while the globe is on screen and something is moving on it.
let globeOnScreen = false,
  globeRunning = true,
  globeAwakeUntil = 0,
  globeSleepTimer = 0,
  globeLayers = null; // globe.gl's globe layer (three-globe): see globeQuiet
function globeRun() {
  if (!globeInstance) return;
  const moving =
    globeOnScreen &&
    (globeInstance.controls().autoRotate ||
      performance.now() < globeAwakeUntil);
  if (moving !== globeRunning) {
    globeRunning = moving;
    moving ? globeInstance.resumeAnimation() : globeInstance.pauseAnimation();
  }
  globeQuiet();
}
// globe.gl starts (and resumeAnimation restarts) four clocks inside its globe layer (three-globe):
// one for layer transitions and three for arc dashes, path dashes and rings. This globe has none of
// those (every transition is 0, the graticule's dashes do not move, no arcs or rings), so they are
// kept paused and only globe.gl's own drawing loop runs: 1 loop instead of 5 while the globe turns.
// The layer joins the scene a moment after the globe is made, so it is looked for until found.
function globeQuiet() {
  if (!globeInstance) return;
  if (!globeLayers)
    globeInstance.scene().traverse((o) => {
      if (!globeLayers && typeof o.getGlobeRadius === "function" && typeof o.pauseAnimation === "function") globeLayers = o;
    });
  if (globeLayers) globeLayers.pauseAnimation();
}
function globeWake(ms) {
  globeAwakeUntil = Math.max(globeAwakeUntil, performance.now() + ms);
  globeRun();
  clearTimeout(globeSleepTimer);
  globeSleepTimer = setTimeout(
    globeRun,
    globeAwakeUntil - performance.now() + 30,
  );
}

function buildGlobe() {
  const wrap = document.getElementById("globeWrap");
  if (!wrap || globeInstance) return;
  if (!hasWebGL()) {
    globeFallback();
    return;
  }
  if (window.Globe) {
    initGlobe();
  } else {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/globe.gl";
    // While globe.gl's own file runs it builds spare copies of its layers, and their animation
    // loops (four, 60 times a second) would run for the rest of the visit: pauseAnimation cannot
    // reach them. Frames asked for while that file runs are never started. The globe's own
    // loops start later, in initGlobe, and pause off screen as before.
    const raf = window.requestAnimationFrame,
      gate = function (cb) {
        return document.currentScript === s ? 0 : raf.call(window, cb);
      };
    const done = () => {
      if (window.requestAnimationFrame === gate) window.requestAnimationFrame = raf;
    };
    window.requestAnimationFrame = gate;
    // A download that never ends gets the still globe after 15 s, not 'rendering the globe…' for
    // ever. If the file arrives after that, the still globe stays (the gate above still holds its
    // spare loops back while it runs).
    let settled = false;
    const settle = (fn) => {
      clearTimeout(late);
      if (settled) return;
      settled = true;
      fn();
    };
    const late = setTimeout(() => settle(globeFallback), 15000);
    s.onload = () => {
      done();
      settle(initGlobe);
    };
    s.onerror = () => {
      done();
      settle(globeFallback);
    };
    document.head.appendChild(s);
  }
}

function initGlobe() {
  const wrap = document.getElementById("globeWrap");
  if (!wrap || !window.Globe) {
    globeFallback();
    return;
  }
  const loading = document.getElementById("globeLoading");
  if (loading) loading.remove();
  const mobile = window.innerWidth <= 760;
  try {
    globeInstance = Globe({ animateIn: false })(wrap)
      .width(wrap.clientWidth)
      .height(wrap.clientHeight)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(false)
      .pointsData(globeData())
      .pointsTransitionDuration(0)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(globeBarAlt)
      .pointColor("color")
      .pointRadius(mobile ? 0.9 : 0.75) // thick enough to read as a bar standing on the land
      .pointResolution(mobile ? 6 : 12)
      .pointsMerge(false)
      .pointLabel(
        (d) =>
          `<div class="globe-tip"><b>${d.country}</b><br>${d.count.toLocaleString()} sign-ups</div>`,
      );
    setTimeout(globeQuiet, 100);
    const controls = globeInstance.controls();
    controls.autoRotate = !globeStill();
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false; // wheel zoom would trap the page scroll
    globeInstance.pointOfView(
      { lat: 22, lng: 22, altitude: GLOBE_ALTITUDE },
      0,
    );
    if (globeInstance.renderer)
      globeInstance
        .renderer()
        .setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    // no render loop while the globe is off screen, or on screen with nothing moving
    new IntersectionObserver((es) => {
      globeOnScreen = es[es.length - 1].isIntersecting;
      if (globeOnScreen) globeWake(600);
      else globeRun();
    }).observe(wrap);
    ["pointerdown", "pointermove"].forEach((t) =>
      wrap.addEventListener(t, () => globeWake(1600)),
    );
    // once the reader takes hold of it, the slow spin stops for good
    wrap.addEventListener("pointerdown", () => (controls.autoRotate = false));
    window.addEventListener("resize", () => {
      if (!globeInstance) return;
      globeInstance.width(wrap.clientWidth).height(wrap.clientHeight);
      globeWake(400);
    });
    ToolView.update("globe", { mode: "webgl", instance: globeInstance });
    if (coalitionSubmission) rewardGlobe(coalitionSubmission.country); // loaded after a submit
  } catch (e) {
    console.warn("[cow] globe init failed:", e.message);
    globeFallback();
  }
}

function refreshGlobe() {
  if (!globeInstance) return;
  globeInstance.pointsData(globeData());
  globeWake(600);
}

// peak-end reward: turn to the reader's country; the view rings it and draws the inset
function rewardGlobe(country) {
  if (!globeInstance) return;
  const c = countryCoords[country];
  if (!c) return;
  try {
    const dur = globeStill() ? 0 : 900;
    globeInstance.controls().autoRotate = false;
    const v = globeTurn(c[0], c[1]);
    globeInstance.pointOfView({ lat: v[0], lng: v[1], altitude: GLOBE_ALTITUDE }, dur);
    globeWake(dur + 800);
    ToolView.update("globe", {
      mode: "webgl",
      instance: globeInstance,
      landsIn: dur,
    });
  } catch (e) {}
}

// ═══ TURNSTILE (anti-bot, only when a site key is configured) ═══
let turnstileWidgetId = null;
function initTurnstile() {
  const key = window.__cowTurnstileKey;
  const box = document.getElementById("turnstileBox");
  if (!key || !box) return; // not configured → no captcha (Phase 0)
  box.style.display = "block";
  const render = () => {
    if (!window.turnstile) return;
    turnstileWidgetId = window.turnstile.render(box, {
      sitekey: key,
      theme: "dark",
    });
  };
  if (window.turnstile) {
    render();
  } else {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
  }
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
  const f = document.getElementById("coalitionBarFill");
  if (f) {
    // the count against a target of 10,000 is a seeded device: it goes with the seeds
    f.style.width = SHOW_SEEDED ? Math.min((count / 10000) * 100, 100) + "%" : "0%";
    const barWrap = f.closest(".coalition-bar-wrap");
    if (barWrap) barWrap.hidden = !SHOW_SEEDED;
  }
  viewCoalition();
}

let coalitionSubmission = null; // what the view may know of this reader's own sign-up
function viewCoalition() {
  const { count, tally } = getTally();
  const g = globalPriorityTally(),
    total = g.reduce((s, t) => s + t.w, 0),
    max = g.length ? g[0].w : 1;
  ToolView.update("coalition", {
    count,
    tally,
    showSeeded: SHOW_SEEDED,
    revealed: count >= COALITION_REVEAL,
    submitted: !!coalitionSubmission,
    country: coalitionSubmission ? coalitionSubmission.country : null,
    letterOptIn: coalitionSubmission ? coalitionSubmission.letterOptIn : false,
    globalPriorities: g.slice(0, 8).map((t) => ({
      i: t.i,
      name: issueData[t.i].name,
      w: t.w,
      barPct: +((t.w / max) * 100).toFixed(0),
      pct: Math.round((t.w / total) * 100),
    })),
    globe: globeData(),
  });
}

const COALITION_REVEAL = 10000; // below this, a raw count reads as "few care"
function animCoalitionNum(target) {
  const el = document.getElementById("coalitionNum");
  if (!el) return;
  const suffix = el.parentElement?.querySelector(".coalition-suffix");
  // Keep the headline qualitative until the coalition is large enough that the
  // number itself is persuasive — a low count works against the cause.
  if (target < COALITION_REVEAL) {
    el.classList.add("soft");
    el.textContent = "A growing coalition";
    if (suffix)
      suffix.textContent =
        "of people choosing where the money should go — add your voice.";
    return;
  }
  el.classList.remove("soft");
  if (suffix) suffix.textContent = "people have made their choice";
  const s = performance.now(),
    from = SEED_BASE,
    dur = 1800;
  (function f(now) {
    const p = Math.min((now - s) / dur, 1),
      v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 4)));
    el.textContent = v.toLocaleString();
    if (p < 1) requestAnimationFrame(f);
  })(s);
}

function submitCoalition() {
  if (ranking.length < 1) {
    alert("Fund some causes and rank them first, then add your voice.");
    return;
  }
  let email = (document.getElementById("coalitionEmail")?.value || "").trim();
  const consent = document.getElementById("coalitionConsent");
  // email is personal data → only store it with explicit consent
  if (email && consent && !consent.checked) {
    alert(
      "To share your email, tick the consent box — or leave the email blank to take part anonymously.",
    );
    return;
  }
  // captcha (only when configured)
  let token = null;
  if (window.__cowTurnstileKey && window.turnstile) {
    token = window.turnstile.getResponse(turnstileWidgetId);
    if (!token) {
      alert("Please complete the quick verification below the email box.");
      return;
    }
  }
  const country = selectedCountry ? selectedCountry[0] : "Unknown";
  const ageBand = (document.getElementById("coalitionAge")?.value || "").trim();
  // The letter is only ever sent when they explicitly opt in to the artwork.
  // Unticked means it is never stored anywhere — not held back, not stored.
  const letterOptIn = !!document.getElementById("letterConsent")?.checked;
  let letterText = "";
  if (letterOptIn) {
    letterText = (
      document.getElementById("letterOutput")?.innerText || ""
    ).trim();
    if (letterText.length > 4000) letterText = letterText.slice(0, 4000);
  }
  const data = {
    ranking: [...ranking],
    country,
    email,
    income: userTax.used ? userTax.income : null,
    tax_to_war: userTax.used ? userTax.toWar : null,
    age_band: ageBand || null,
    letter: letterText || null,
    letter_consent: letterOptIn,
    ts: Date.now(),
  };
  saveLocalSub(data);
  // live backend (shared) if configured; otherwise localStorage above
  if (window.__cowSubmit) {
    window.__cowSubmit(data, token);
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
  coalitionSubmission = { country, letterOptIn };
  const { count } = getTally();
  animCoalitionNum(count);
  initCoalition();
  buildGlobalPriorities();
  refreshGlobe();
  rewardGlobe(country);
  setTimeout(() => generateShareCard(), 1600);
}

// ═══ SHARE CARD ═════════════════════════════════════════════════
function generateShareCard() {
  if (ranking.length < 1) {
    alert("Fund some causes and rank them first to generate your card.");
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
      row.innerHTML = `<div class="sc-rn">${pos + 1}</div><div class="sc-dot"></div><div class="sc-in">${iss.name}</div><div class="sc-ic">${fmt(iss.cost)}/yr</div>`;
      issDiv.appendChild(row);
    });
  }

  const statL = document.getElementById("scStatLeft");
  if (statL)
    statL.innerHTML = `Total annual cost:<br><b>${total}</b><br>${Math.round((totalB / DEFENCE) * 100)}% of the global military budget`;
  const statR = document.getElementById("scStatRight");
  // keep the share card qualitative until the coalition is large enough that
  // the number itself helps the cause (see COALITION_REVEAL)
  if (statR)
    statR.textContent =
      count < COALITION_REVEAL
        ? `join a\ngrowing\ncoalition`
        : `${count.toLocaleString()}\npeople\nhave chosen`;

  const cl = document.getElementById("scCountryLine");
  if (cl) cl.textContent = `From ${country} · ${spend} annual military spend`;

  document.getElementById("scOverlay")?.classList.add("open");
  ToolView.update("card", {
    open: true,
    country,
    spendText: spend,
    totalB,
    totalText: total,
    pctOfBudget: Math.round((totalB / DEFENCE) * 100),
    count,
    revealed: count >= COALITION_REVEAL,
    top5: ranking.slice(0, 5).map((i, p) => ({ rank: p + 1, i, name: issueData[i].name, costText: fmt(issueData[i].cost) })),
  });
}

function closeCard() {
  document.getElementById("scOverlay")?.classList.remove("open");
  ToolView.update("card", { open: false });
}

function downloadCard() {
  if (window.html2canvas) {
    // the picture is the card flat on: it squares up on the desk while it is taken
    const overlay = document.getElementById("scOverlay");
    overlay.classList.add("sc-flat");
    const card = document.getElementById("shareCard");
    html2canvas(card, {
      backgroundColor: "#000",
      scale: 2,
      // html2canvas copies the whole page and asks every canvas it copies for a 2D drawing
      // context. On a canvas not yet in use (the Archive's room, before it is built) that
      // claims it for 2D for good, and the 3D room can then never start. So skip every
      // canvas outside the card: the picture is of the card only.
      ignoreElements: (el) => el.tagName === "CANVAS" && !card.contains(el),
    }).then((c) => {
      const a = document.createElement("a");
      a.download = "cost-of-war-my-priorities.png";
      a.href = c.toDataURL("image/png");
      a.click();
    }).finally(() => overlay.classList.remove("sc-flat"));
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
// Runs at once (this script sits at the end of the page), so the tools have their full height
// before the story engine follows a deep link to them.
(function initTools() {
  buildIssues();
  buildCountrySelect();
  initCoalition();
  buildGlobalPriorities();
  initTurnstile();
  updateTracker();
  updateSummary();
  updateGate();
  generateLetter();
  viewRedistribute();
  // lazy-build the 3D globe when the coalition section nears the viewport
  const gblock = document.querySelector(".globe-block");
  if (gblock) {
    const gio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            buildGlobe();
            gio.disconnect();
          }
        });
      },
      { rootMargin: "300px" },
    );
    gio.observe(gblock);
  }
  // when live coalition data arrives from Supabase, refresh those views
  window.onCowHydrated = function () {
    const { count } = getTally();
    animCoalitionNum(count);
    initCoalition();
    buildGlobalPriorities();
    refreshGlobe();
  };
})();

// A link straight into the tools (#haveyoursay, #roomSection, ?static=1#roomSection) lands where it
// points in any browser. The story follows it as soon as it starts, before this file has built the
// tools above the target (390 × 664 phone, still mode: the Archive then sits 3,577 px lower). Chrome puts the
// reader back by itself (scroll anchoring, and the link followed again at load); Safari has no scroll
// anchoring. So, until the reader moves the page themselves, the target goes back to the top of the
// screen now, at load and once the fonts are in.
// Not after a reload, or Back to a page the browser no longer holds in memory: the browser then puts
// the reader back where they were (scroll restoration), and that place wins over the link. (The story
// turns restoration off only for its own reload when the screen changes mode; then the link lands.)
(function landDeepLink() {
  const story = document.getElementById("story");
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && /^(reload|back_forward)$/.test(nav.type) && history.scrollRestoration !== "manual") return;
  let t = null;
  try {
    t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch (e) {}
  if (!t || !story || (story.compareDocumentPosition(t) & 20) !== 4) return; // the story lands its own
  const hash = location.hash;
  let moved = false;
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) =>
    window.addEventListener(type, () => (moved = true), { capture: true, passive: true, once: true }),
  );
  const land = () => {
    if (!moved && location.hash === hash && t.getClientRects().length) t.scrollIntoView({ block: "start", behavior: "instant" });
  };
  land();
  window.addEventListener("load", land);
  if (document.fonts) document.fonts.ready.then(land);
})();
