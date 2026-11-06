/* STORY · MATRIX3D SELF-TEST (js/story-debug/selftest.js)
   Debug only. Not part of the story and not counted in its size budget:
   the page never loads it. Story.debug.selfTest() loads it on demand.

   What it proves: DOM text printed on a tilted sheet (Story.cam.matrix3d)
   lands on the same pixels as the canvas polygon of that sheet
   (Story.cam.quad), to well under 1 px.

   How: for each tilt, it places real DOM elements with each transform and
   reads where Chrome actually puts their four corners (zero-size children
   at the corners, read with getBoundingClientRect), then compares them with
   the corners the canvas draws.
   - m3d:  the spec's form: an element of the rect's size at rect.x/rect.y.
   - at00: the per-frame form scenes use: an element fixed at left 0 / top 0,
           laid out smaller and scaled 1.25× onto the same quad.
   - css:  Chrome's own perspective() rotateX() rotateY() rotateZ() with the
           same tilt. This checks the projection maths itself, not only that
           matrix3d agrees with our own quad.
   Returns { maxErrorPx, pass, cases: [{ tilt, m3d, at00, css }] }. */
(function () {
  "use strict";
  var Story = window.Story;

  function make(tag, parent, css) {
    var e = document.createElement(tag);
    e.style.cssText = css;
    parent.appendChild(e);
    return e;
  }

  // Where Chrome puts the four corners of a w × h element with this placement and transform.
  function corners(host, placement, transform, w, h) {
    var e = make("div", host, "position:absolute;" + placement + ";width:" + w + "px;height:" + h + "px;transform:" + transform);
    return [[0, 0], [w, 0], [w, h], [0, h]].map(function (c) {
      var b = make("i", e, "position:absolute;left:" + c[0] + "px;top:" + c[1] + "px").getBoundingClientRect();
      return { x: b.left, y: b.top };
    });
  }

  function selfTest() {
    // a fixed host at the viewport origin, so measured points are in stage px
    var host = make("div", document.body, "position:fixed;left:0;top:0;visibility:hidden;pointer-events:none");
    var R = { x: 150, y: 124, w: 1060, h: 680 }; // the S00 file, desktop
    var tilts = [
      null, // flat
      { rx: 13, ry: -5, rz: -2.2, persp: 1500 }, // S00 at rest
      { rx: 30, ry: -4, rz: -5, persp: 1500 }, // S02 lying back
      { rx: 14, ry: -26, rz: -3, persp: 760 }, // S01 phone, steep
      { rx: -24, ry: 38, rz: 12, persp: 900 }, // an extreme case, far beyond the story
    ];
    var max = 0;
    var cases = tilts.map(function (t) {
      var want = Story.cam.quad(R, t); // what the canvas draws
      var r = Story.cam.resolve(t, R);
      var at = "left:" + R.x + "px;top:" + R.y + "px;transform-origin:";
      var got = {
        m3d: corners(host, at + "0 0", Story.cam.matrix3d(R, t), R.w, R.h),
        at00: corners(host, "left:0;top:0;transform-origin:0 0", Story.cam.matrix3d(R, r, { x: 0, y: 0, s: 1.25 }), R.w / 1.25, R.h / 1.25),
        css: corners(host, at + (r ? r.ox - R.x + "px " + (r.oy - R.y) + "px" : "0 0"),
          r ? "perspective(" + r.persp + "px) rotateX(" + r.rx + "deg) rotateY(" + r.ry + "deg) rotateZ(" + r.rz + "deg)" : "none", R.w, R.h),
      };
      var row = { tilt: t };
      Object.keys(got).forEach(function (k) {
        var worst = 0;
        got[k].forEach(function (p, i) { worst = Math.max(worst, Math.hypot(p.x - want[i].x, p.y - want[i].y)); });
        row[k] = Math.round(worst * 1000) / 1000;
        max = Math.max(max, row[k]);
      });
      return row;
    });
    host.remove();
    return { maxErrorPx: max, pass: max < 1, cases: cases };
  }

  Story.debug._selfTest = selfTest;
})();
