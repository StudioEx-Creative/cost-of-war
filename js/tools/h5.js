/* H5 Card and share · view code. js/main.js owns the state and the logic; this file only draws it.
   Here: the keyboard side of the two overlays. Focus goes in, Tab stays in, Escape closes, focus
   comes back to where it was. Looks: the H5 section of css/tools.css. Region in index.html: between the
   "H5 CARD AND SHARE OVERLAYS" markers. */
(function () {
  "use strict";
  var CAN_FOCUS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])';
  var OVERLAYS = {
    card: { el: "scOverlay", first: ".sc-actions .btn-t", close: function () { window.closeCard(); } },
    // the share panel takes focus itself: focusing its email box would open a phone's keyboard
    share: { el: "shareOv", first: ".share-box", close: function () { window.closeShare(); } },
  };
  var open = []; // the overlays now showing, the top one last

  function $(id) { return document.getElementById(id); }
  function shows(el) { return !!el && el.getClientRects().length > 0; }
  function canReturnTo(el) { return !!el && el !== document.body && el.isConnected && !el.disabled && shows(el); }

  function enter(o) {
    var box = $(o.el), first = box.querySelector(o.first);
    box.scrollTop = 0;
    if (!first.matches(CAN_FOCUS)) first.tabIndex = -1;
    first.focus({ preventScroll: true });
    // a keyboard reader on a short screen must see where focus went; a tap must not move the card
    if (first.matches(":focus-visible")) first.scrollIntoView({ block: "nearest" });
  }
  // The button that opened the overlay can be gone: submitting the coalition form disables its
  // button, and the card opens 1.6 s later. Then focus goes to the thanks line beside it.
  function leave(from) {
    var to = from;
    if (!canReturnTo(to)) {
      to = $("coalitionThanks");
      if (shows(to)) to.tabIndex = -1;
      else to = document.querySelector('[onclick="generateShareCard()"]');
    }
    if (canReturnTo(to)) to.focus({ preventScroll: true });
  }
  function sync(name) {
    var o = OVERLAYS[name];
    return function (s) {
      var on = !!(s && s.open), i = open.indexOf(o);
      if (on && i < 0) {
        o.from = document.activeElement;
        open.push(o);
        enter(o);
      } else if (!on && i >= 0) {
        open.splice(i, 1);
        leave(o.from);
      }
    };
  }
  function trap(e, o) {
    var list = [].slice.call($(o.el).querySelectorAll(CAN_FOCUS)).filter(shows);
    if (!list.length) return;
    var i = list.indexOf(document.activeElement), last = list.length - 1;
    var to = e.shiftKey ? (i <= 0 ? list[last] : null) : i < 0 || i === last ? list[0] : null;
    if (to) { e.preventDefault(); to.focus(); }
  }
  document.addEventListener("keydown", function (e) {
    var o = open[open.length - 1];
    if (!o) return;
    if (e.key === "Escape") { e.preventDefault(); o.close(); }
    else if (e.key === "Tab") trap(e, o);
  });
  // While an overlay is up the page behind it stays where the reader left it.
  Object.keys(OVERLAYS).forEach(function (name) {
    var el = $(OVERLAYS[name].el);
    function hold(e) { if (el.scrollHeight <= el.clientHeight && e.cancelable) e.preventDefault(); }
    el.addEventListener("wheel", hold, { passive: false });
    el.addEventListener("touchmove", hold, { passive: false });
    ToolView.on(name, sync(name));
  });
})();
