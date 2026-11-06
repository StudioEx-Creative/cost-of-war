/* Test fixture for tools/story-check.mjs: story code that breaks every lint rule once.
   Run: node tools/story-check.mjs --only lint,size --code tools/fixtures/lint-bad
   Comments are ignored by the lint, so this comment can say Lenis, bounce and #123456 freely. */
(function () {
  "use strict";
  // Allowed things that must NOT be reported:
  var ok = { color: "#0A0A0A", soft: "rgba(196,201,207,0.5)", font: "font-family:'IBM Plex Mono', monospace", url: "https://example.com/a#b" };
  var MONO = "'IBM Plex Mono', monospace";

  // 1. bouncy and back easing
  gsap.to(".x", { y: 10, ease: "elastic.out(1, 0.3)" });
  gsap.to(".x", { y: 10, ease: "back.out(1.7)" });
  // 2. smooth-scroll library and scroll snapping
  var lenis = new Lenis();
  document.body.style.scrollSnapType = "y mandatory";
  // 3. scrub with a smoothing number
  ScrollTrigger.create({ trigger: "#story", scrub: 0.5 });
  // 4. aria-live on a counter
  el.setAttribute("aria-live", "polite");
  // 5. off-brand colours (hex and rgb)
  var amber = "#FFB000", cyan = "rgba(0, 200, 255, 0.4)";
  // 6. off-brand fonts
  var title = "font-family: Anton, sans-serif";
  el.style.fontFamily = "'Bebas Neue', sans-serif";
  ctx.font = "600 14px 'Roboto', sans-serif";

  Story.scene({
    id: "S99",
    // 7. state() must be pure
    state(p, vp) {
      var jitter = Math.random();
      var t = Date.now();
      return { sheet: null, jitter: jitter, t: t };
    },
    // 8. layout writes inside render (reported for a human to check)
    render(st, api) {
      api.layer.style.top = st.y + "px";
      api.layer.style.width = st.w + "px";
      api.layer.style.transform = "translateY(" + st.y + "px)"; // fine: transform
    },
  });
})();
