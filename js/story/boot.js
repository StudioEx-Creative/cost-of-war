/* STORY · BOOT: loaded last, so the story never starts with a scene missing. */
(function () {
  "use strict";
  if (window.Story && window.Story.start) window.Story.start();
  else console.error("Story: engine.js did not load");
})();
