/* H3 Letter · view code. js/main.js owns the letter and every send option; this file only stages it.
   Region in index.html: between the "H3 LETTER" markers. Styles: the H3 section of css/tools.css. */
(function () {
  "use strict";
  var section = document.getElementById("letterSection");
  var body = document.getElementById("letterOutput");
  if (!section || !body) return;
  var sheet = section.querySelector(".letter-wrap");
  var head = section.querySelector(".letter-head");
  var actions = section.querySelector(".letter-actions");

  // While the reader is in the letter the white ring goes round the whole sheet (css), and on a
  // phone the send bar stands aside for the keyboard.
  function editing(on) {
    sheet.classList.toggle("is-editing", on);
    section.classList.toggle("is-editing", on);
  }
  body.addEventListener("focus", function () { editing(true); });
  body.addEventListener("blur", function () { editing(false); });

  // An input cannot wrap its placeholder and both are too long for one line. The words still come
  // from the placeholder attribute: the hint only draws them on two lines.
  section.querySelectorAll(".letter-field").forEach(function (f) {
    var input = f.querySelector("input"), hint = f.querySelector(".letter-field-hint");
    if (!input || !hint) return;
    hint.setAttribute("data-hint", input.getAttribute("placeholder") || "");
    f.classList.add("has-hint");
  });

  // On desktop the head and the actions are two separate things that stay beside the letter
  // together. Each needs the other's height, which changes with the note and the country link.
  // The paper tilts back from 386 px down, so its foot swings past the words, and on a long letter
  // (or a narrow column) into the coalition below. It flattens until the foot overhangs 56 px at
  // most, and the section makes room for that.
  function sink(deg) {
    var a = (deg * Math.PI) / 180, y = Math.max(0, sheet.offsetHeight - 386);
    return (y * Math.cos(a) * 2200) / (2200 - y * Math.sin(a)) - y;
  }
  function measure() {
    section.style.setProperty("--letter-head-h", head.offsetHeight + "px");
    section.style.setProperty("--letter-actions-h", actions.offsetHeight + "px");
    for (var deg = 5; deg > 0 && sink(deg) > 56; deg -= 0.5);
    section.style.setProperty("--letter-tilt", deg + "deg");
    section.style.setProperty("--letter-sink", Math.ceil(sink(deg)) + "px");
  }
  measure();
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(measure);
    ro.observe(head);
    ro.observe(actions);
    ro.observe(sheet);
  }
})();
