/* GAP · prototype scaffolding for S03–S08 (complete; phase 3 deletes this pair).
   Holds S02's last frame, whatever S02 becomes (st.hold), fades it to black, then
   shows a note. Restrained: fades only, and the two never overlap. */
(function () {
  "use strict";
  var note;
  var WHY = "prototype scaffolding: marks the scenes this prototype leaves out (removed in phase 3)";

  Story.scene({
    id: "GAP",
    order: 2.5, // between S02 and S09
    name: "Not in this prototype",
    move: "FADE",
    screens: 0.5,
    restrained: true, // fades only; chrome, pool and grain fade away
    chrome: false,
    file: "--",
    anchors: ["impact"], // prototype only: S07 in phase 3
    frames: [{ k: "in", p: 0 }, { k: "mid", p: 0.5 }, { k: "out", p: 1 }],
    alt: "The ladder fades to black. A note says scenes S03 to S08 are not in this prototype.",
    plateVisual: false, // a fade to black has no still: the plate gets the alt sentence

    build: function (api) {
      var text = Story.newCopy("Scenes S03–S08 are not in this prototype", WHY);
      note = api.el("div", "gap-note t-label", text, null, api.layer);
      api.el("p", "gap-plate t-label", text, null, api.plate);
    },

    state: function (p, vp) {
      var prev = Story.stateOf("S02", 1, vp); // S02's last frame, exactly as S02 shows it
      var keep = 1 - Story.smooth(0, 0.4, p); // that frame fades to black by p 0.4
      var at = prev.pool || prev.sheet;
      return {
        sheet: null, // the Sheet is in the held frame
        hold: { id: "S02", st: prev, opacity: keep },
        pool: at ? { x: at.x, y: at.y, w: at.w, h: at.h, tilt: at.tilt, tone: at.tone, opacity: keep } : null,
        // then the note, on black, gone before S09's line arrives
        note: Story.smooth(0.4, 0.55, p) * (1 - Story.smooth(0.85, 1, p)),
      };
    },

    render: function (st, api) {
      api.set(note, "opacity", st.note);
    },
  });
})();
