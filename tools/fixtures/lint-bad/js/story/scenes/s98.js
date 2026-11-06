/* Test fixture for tools/story-check.mjs: a scene that uses the clock, timers and tweens.
   Scene state must come from scroll alone, so each of these is a lint failure. */
(function () {
  "use strict";
  var el;
  Story.scene({
    id: "S98",
    state: function (p) { return { sheet: null, p: p }; },
    render: function (st, api) {
      api.set(el, "width", st.p * 100 + "px");       // layout write per frame (for a human to check)
      api.set(el, "opacity", st.p);                   // fine: opacity
      var t = performance.now();                      // clock in a scene
      setTimeout(function () { el.textContent = t; }, 100); // timer
      requestAnimationFrame(function () {});          // own animation loop
      gsap.to(el, { x: 10 });                         // a tween
    },
  });
})();
