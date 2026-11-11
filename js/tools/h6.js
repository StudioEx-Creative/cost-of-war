/* H6 Archive · view code. js/room.js owns the room, its data and its reading rules; this file
   only lists what room.js says can be read. Region in index.html: between the "H6 ARCHIVE"
   markers. Styles: the H6 section of css/tools.css.
   The list is the keyboard's way to the letters (audit KEY-1). In preview mode room.js opens every
   sheet as a sample, so there is nothing to list until preview ends (audit ARC-4). */
(function () {
  "use strict";
  var PER_PAGE = 10;
  function $(id) {
    return document.getElementById(id);
  }
  var box = $("roomLetters"),
    list = $("roomLettersList"),
    prev = $("roomLettersPrev"),
    next = $("roomLettersNext"),
    label = $("roomLettersPage");
  if (!box) return;
  var state = null,
    page = 0;

  function total() {
    return state && !state.sample && state.letters ? state.letters.length : 0;
  }
  function draw() {
    var n = total(),
      from = page * PER_PAGE,
      to = Math.min(n, from + PER_PAGE);
    list.textContent = "";
    for (var i = from; i < to; i++) list.appendChild(row(i));
    label.textContent = from + 1 + "–" + to + " of " + n;
    prev.disabled = page === 0;
    next.disabled = to >= n;
    box.querySelector(".rl-nav").hidden = n <= PER_PAGE;
  }
  function row(i) {
    var li = document.createElement("li"),
      b = document.createElement("button"),
      num = document.createElement("span"),
      who = document.createElement("span");
    b.type = "button";
    b.className = "rl-row";
    num.className = "rl-n";
    num.textContent = String(i + 1).padStart(3, "0");
    who.textContent = state.letterMeta(i);
    b.appendChild(num);
    b.appendChild(who);
    b.addEventListener("click", function () {
      state.openLetter(i);
    });
    li.appendChild(b);
    return li;
  }
  function go(step) {
    page += step;
    draw();
    var first = list.querySelector("button");
    if (first) first.focus();
  }
  prev.addEventListener("click", function () {
    go(-1);
  });
  next.addEventListener("click", function () {
    go(1);
  });

  ToolView.on("archive", function (s) {
    state = s;
    page = 0;
    document.querySelector(".room-hall").classList.add("is-ready");
    box.hidden = !total();
    if (!box.hidden) draw();
  });
})();
