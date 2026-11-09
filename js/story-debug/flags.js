/* Review notes for the story: every open decision and every data, copy and design question, one
   line each, with its scene. This is the single list for Greg, Daniel and Blueprint.
   Not story code: readers never load this file. The harness (tools/story-check.mjs) loads it after the
   page is ready, so its report lists these beside the flags the scenes raise themselves (new copy,
   figures data.js lacks, derived values). In a browser console:
     var s = document.createElement("script"); s.src = "js/story-debug/flags.js"; document.head.appendChild(s);
   then Story.debug.flags. Kinds: decision, data, copy, design, brand, a11y. */
(function () {
  "use strict";
  [
    // Carried from phase 2 (still open)
    ["S00 S01 S02 S09 S12", "design", "Short phones (about 390 × 664, an iPhone in Safari) have new art direction the storyboards do not draw: S00 slides down the file before the lock; S01's US and Europe figures move under the paragraph; S02's ladder sits at about half size under the big figure, with no bracket tag; S12's list of figures starts nearer the top. Review on a real phone."],
    ["S12", "decision", "The lives scene keeps the bloom and drops the flood and the rising counter (brief §7). Removing the flood changes Blueprint's artwork: Blueprint to approve (brief §15.7)."],
    ["All", "decision", "Still mode for low-power phones starts at navigator.deviceMemory < 2 (the spec said <= 2, which would drop 2 GB phones to still plates). Open decision."],
    ["All", "copy", "Every scene's text alternative for screen readers (its alt) is new copy and needs approval."],

    // Carried from the storyboards of S00, S01, S02, S09 and S12 (still open)
    ["S00", "decision", "Lock target: the live military counter. Print $91,546/s (MIL_PER_SECOND) beside it? It is in data.js but not yet on the page."],
    ["S00", "design", "New in phase 3: the title dims to about a quarter as the camera pushes into the counter (the storyboard keeps it bright), and S01's last push is spread over a little more scroll. At 1920 × 1080 a brisk scroll made the giant white letters flash 4 times a second; the rule is 3. The counter now carries the end of the scene. Alternative: keep the title bright and give the hero more scroll."],
    ["S01", "copy", "'eleventh straight record year' (index.html:180) and data.js:47 ('11th consecutive year of growth') do not say the same thing. A copy fix needs approval."],
    ["S02 S06 S11", "decision", "Nested or side by side (audit F11). Brief §8 nests every rung on one corner, which reads as 'part of': world nuclear spending ($119B) sits inside the US rung ($954B), and Zero Hunger inside nuclear. The same nesting returns in the ladders in S06 and S11. Alt B sets the rungs side by side on one baseline. Choose."],
    ["S02", "copy", "The Zero Hunger and nuclear rung lines are data.js text (issueData[0].sum, machineData[1].sum), not yet page copy. The nuclear line is also shortened. 'DETAIL · ENLARGED' prints no ratio until decided (phase 2 default). Approve as copy."],
    ["S02", "brand", "Brief §8 makes every war rung red, so the end frame holds more than one red outline (only the newest has the 2 px edge and the tab), against the brand's 'normally one red mark'. Confirm, or turn earlier war rungs grey once they leave the frame."],
    ["S09", "data", "No Gaza field holds 2025: it is read from the story year in machineData[0].sum (audit F02). Add numeric fields for the 77 and its base year and derive 1948 from them."],
    ["S09", "decision", "The live '0 → 77 YEARS ERASED' counter (index.html:603) is left out: the year is the one number that moves, and 77 is said once, in the UN sentence. Confirm."],
    ["S09 S10 S11", "decision", "Everything fades slowly except the line, which stays put and becomes S10's border and S11's floor. The brief says only 'a slow fade'. Confirm the line may carry over."],
    ["S12", "decision", "The hiPies headlines are dropped ('Most of those killed are civilians' / 'Up to 90%' and 'A third of the displaced are children'): a third contradicts data.js's 38% (audit F06, F08, F15). Shown with the data.js values, as plain figures with no ring. Approve the wording."],
    ["S12", "copy", "The humanStrip labels and sources come from humanData[].unit / .src in data.js, not main.js:398-414. That drops 'one every two minutes' (audit F16), 'the highest ever recorded' and 'including disease and collapse'. Sources are named instead of 'source ↗'. Approve."],
    ["S12", "decision", "Order: the live page runs hiPies and humanStrip before the lives scene (index.html:744-745). Here they come after the field, so 'What follows cannot' leads straight to the one point. The list then repeats 244,700 just after the field states it; suggest dropping that item. Confirm both."],
    ["S12", "data", "'One every 2 min 9 sec' comes from SECONDS_PER_DEATH, which no live script reads (audit F09/F16). The strip's 'one every two minutes' is not shown."],
    ["S12", "data", "ACLED period: index.html:765 and the data.js:14 comment say Dec 2024 – Nov 2025; humanData[0].body and DATA-SOURCES.md say Nov 2024 – Nov 2025 (audit F17). The on-page wording is kept: needs a check."],
    ["S12", "data", "'Up to 90%' (main.js:301) is printed with civilianShare 90: the data.js value is a plain 90. Confirm the 'up to' stays."],
    ["S12", "decision", "The live count since opening runs on the clock, not the scroll (audit F18: the brief should exempt it from rule 9). Plain text, no aria-live."],
    ["S12", "decision", "Phone: at this screen density the field reads as a dense haze, not separate lights, because there are more people than free pixels (brief cap: device pixel ratio 2). The still plate can give the field its own full-screen plate instead. Choose."],

    // S03 The Slice
    ["S03", "decision", "Open decision 3 (brief §15.3): the INDICATIVE stamp and the note 'Indicative split, modelled on typical national defence budgets. SIPRI publishes the world total only. Nuclear: ICAN.' are new copy. Confirm the wording."],
    ["S03", "data", "The six sector values are modelled (js/data.js:26-30); only Nuclear forces is a published figure (ICAN). They print as the live legend prints them ($1.01T, not $1010B)."],
    ["S03", "brand", "Audit BR-07: data.js gives the six sectors six red shades; they are drawn as neutral paper inside the sheet's one red edge. Brand owner to confirm."],
    ["S03", "copy", "The live card's third link, 'SIPRI arms 2026' (index.html:264), is about arms transfers and is not carried in S03; it belongs with +9.2% in S05."],
    ["S03 S04", "decision", "Audit F12: the ten largest budgets add up to less than the $2.89T sheet. Built as the storyboard's main version: each strip keeps its own true size and the uncut outline fades. Option B keeps an unlabelled 'rest of world' outline worked out from data.js figures (not in data.js). Choose one for both scenes."],

    // S04 The Sort
    ["S04", "decision", "The hover / tap detail prints topSpenders.change (for example +20% for Ukraine). It is in data.js but not on the live page. Approve, or limit the detail to $bn and % of GDP."],
    ["S04", "copy", "New words: ' YEAR ON YEAR' (the detail), 'HOVER A BAR' (desktop) and 'TAP A BAR' (phone). The key labels 'HEIGHT' / 'LENGTH' and 'ORDER' are simpler than the storyboard's 'HEIGHT & ORDER' then 'ORDER · CHANGING'."],
    ["S04", "design", "Blueprint: the detail is shown by the giant figure itself (it switches to the bar under the pointer and adds a $bn and change line); the storyboard's boxed 2.5× close-up was dropped. On phones the giant figure is flat in the text area, not tilted with the bars, so it keeps its size on short phones."],
    ["S04", "design", "On a phone the share of GDP sits right after the dollars on each row, as the storyboard draws it. While Ukraine's bar climbs, its name, dollars and the big 40% travel together in a strip of their own down the right-hand side, tied to the bar by a dotted line, so they never print over another country's figures. (The storyboard draws them right beside the bar, where they would collide near the top.) The big figure is 30 px at the phone's reference size."],
    ["S04", "a11y", "Short phones: the ten rows share a shorter picture area, so each tap row is about 30 px (44 px at 375 × 812) and the rank, name and value labels sit close to the bars. Decide: show fewer rows on short phones, or accept."],

    // S05 The Line of Production
    ["S05", "decision", "Audit F20: the drawings carry letters (A, B, Ø C) and 'SCALE · NTS' instead of the live page's invented numbers (H 120 M, Ø 340, SCALE 1:40, DWG No. 679-B…). Or approve those numbers as illustrative."],
    ["S05", "data", "+9.2% is growth in the VOLUME of major-arms transfers, 2021–25 against 2016–20. It is not money: it has its own label and source, stands apart from $679B and is never drawn as an area."],
    ["S05", "data", "Audit F01: $679B (arms makers' revenue, 2024) has no data.js field and is shown through Story.missing. Add it (679, $B, 2024, SIPRI Top 100, index.html:489) or drop it (storyboard alt B: +9.2% alone)."],
    ["S05", "data", "The SIPRI Top 100 press-release address is typed in the scene (copied from index.html:489): data.js has no field for it. Daniel: please add one."],
    ["S05", "data", "The base period '2016–20' is only in DATA-SOURCES.md:15. Shown through Story.missing; needs a field beside globalContext.armsTradeGrowth."],
    ["S05", "copy", "New words: 'growth in the volume of major-arms transfers' replaces the live 'growth in the global arms trade' (index.html:506); also 'vs' between the two periods and 'SCALE · NTS' in the title block."],
    ["S05 S06", "decision", "The drawing parks in the top-right corner of the $2.89T sheet, where S06 starts. It has no area and must not read as a share of $2.89T. The alternative is to park it outside the sheet."],
    ["S05", "decision", "Motion beyond the storyboard: the drawings plot in under a moving scan line, and the turbine turns two thirds of a turn as it is drawn, coming to rest at the storyboard's 'mid' frame."],
    ["S05", "design", "Phone: the scene draws its own top line ('THE COST OF WAR · THE LINE OF PRODUCTION / FILE 05'), as its storyboard does, because the shared label is too long at 375 px. Grey labels printed on the paper use the lighter grey for contrast."],
    ["S05 S06", "brand", "More than one red mark on screen: S05's exit (the warhead, $679B, the sheet's red edge) and S06 (four red edges). Built as the storyboards draw them (phase 1 art decision)."],

    // S06 The Turn
    ["S06", "decision", "Open decision 2 (brief §15.2): every sheet is nested on one corner at true area, as the brief and the main frames draw it. $2.89T is never shown as a share of $21.8T and never turned into the 45% slice, but nesting can still read as 'part of' (audit 15.2b). Alt B sets $21.8T beside the ladder on one baseline with a 'DIFFERENT MEASURE' label. Choose."],
    ["S06", "data", "Audit F08 and F10: the $21.8T sheet is sized from machineData[3].amtB and printed as machineData[3].amt ($21.8T, never $21.81T). 10.5% of world GDP is never shown beside S01's 2.5% (different GDP bases)."],
    ["S06", "design", "Left out to save size: the flat 'FIG 06.1 · PLAN · TRUE AREA' box at the end (about 0.3 KB to add back). At the mid frame label 01 sits on a leader beside its corner (as the phone storyboard draws it). The lock (the $21.8T figure, 'VIOLENCE SHEET', the caption reset) is one hard cut at 86% of the scene: the timing is not storyboarded."],
    ["S06", "copy", "On the stage 'IEP GPI 2026' and 'SIPRI 2026' are plain labels; the links are in the reading-order plate. Bracket tags 'ACQUIRING · SHEET', 'LOCKED · SHEET PULLING WIDE', 'LOCKED · VIOLENCE SHEET' follow the storyboard's wording."],
    ["S06", "design", "Short phones (integrator): the frame grows from the picture area's shape to the storyboard's 343 × 500 during the pull, so the $21.8T sheet lands exactly on S07's map. At the end the far edge of the $21.8T sheet runs above the picture area, as on desktop."],

    // S07 The Map
    ["S05 S06 S07", "decision", "Audit F21 and F28: three pieces of live content are not in the story. Drop or carry each one. (1) What $21.8T counts (index.html:564-570): 'That $21.8 trillion is the Institute for Economics & Peace's full accounting of violence: military and internal-security spending, homicide, and the direct losses of armed conflict…'. Without it the reader never learns what the biggest number measures. Suggested: carry it, minus 'The pie in Chapter 01 shows its make-up', in S06's plate and at the lock (new copy). (2) The violence-breakdown card 'What the $21.8T is made of · by component' (index.html:269-284, js/main.js:209-216). (3) The caption 'A record year. Every line on this schematic is somebody's profit.' (index.html:495-497)."],
    ["S07", "design", "The address #impact now lands a little way into the scene (8%), on the chapter title, not on the bare sheet at the join. #s07 still lands on the join."],
    ["S07", "decision", "Audit F12/F14: 'These are mixed estimates: reconstruction needs, damage and economic loss.' is new copy and replaces the page's '$bn needed' (index.html:579): Yemen is economic loss, Sudan damage. Approve the wording."],
    ["S07", "decision", "Gaza shows $71B as the live bars print it (main.js:229 rounds to whole billions); data.js holds $71.4B. Flagged as derived. Approve either."],
    ["S07", "data", "Land outline: Natural Earth 1:110m, public domain (download approved 2026-11-06), filled quietly under the grid. The plate credits it ('Map: Natural Earth (public domain).', new copy)."],
    ["S07", "data", "Places sit at approximate country centroids (Gaza: the Strip): positions, not figures. The travel order is the brief's list."],
    ["S07", "decision", "FIG 07.1, the flat plan inset at true area, is built as the storyboard draws it (phase 1 art decision)."],
    ["S07", "design", "For Greg: the small crosses where the map's grid lines meet are spread evenly over the map, not on the places. If any reader could take them for targeting marks near towns, they can go."],
    ["S07", "design", "The stop texts change in one frame (a hard cut) so the huge figure stays under 3 flashes a second; the heading sits 6 px lower than drawn to clear the FILE label on small laptops. The plate opens with 'Total Impact of Violence · $21.8T' because the stage prints $21.8T while the sheet tips."],

    // S08 The Air
    ["S08", "design", "The ground turns under the camera by 32°, the turn the storyboard's camera makes (S07 ends at −90°, S08's orbit is at −122°), then fades. Blueprint: confirm it reads as an orbit."],
    ["S08", "copy", "The title 'share of global CO₂' (index.html:586) covers the whole chart, but the militaries' 5.5% is a share of all greenhouse-gas emissions (envFacts[0].lbl). A wording fix needs approval."],
    ["S08", "data", "Audit F28: the facts '4th' and '~0%' and their CEOBS links have no place in S08. Move them elsewhere or drop them?"],
    ["S08", "decision", "Stacking the layers suggests they add up to one whole. They do not: the national figures are carbon dioxide, the militaries' all greenhouse gas, and military emissions already sit inside the national totals. The brief's stacked layers are built; alt B (separate bars, each base labelled) is not."],
    ["S08", "copy", "Bracket tags from the storyboard: 'ACQUIRING · MAP PLANE', 'ACQUIRING · STRATA', 'LOCKED · STRATA'."],

    // S09 Gaza
    ["S09", "design", "Integrator: S09 now opens on S08's thin line already lit (it used to fade its line in from black), so the line carries straight through the join. The year, the light and the words still fade in. Blueprint signs off S09 to S12."],

    // S10 Displacement
    ["S10", "decision", "590 marks are drawn (344 inside + 246 fled, each side rounded up as the live code does); the brief says 589. Storyboard alt B draws 589 by rounding the fled side down. Which?"],
    ["S10", "data", "'200,000 people per mark' (index.html:732) is not in data.js: shown through Story.missing, needs a field."],
    ["S10", "data", "Audit F18: 49.1M is the remainder 117.8 − 68.7, not a sourced UNHCR figure. Check it against UNHCR Global Trends 2026 before it drives the split."],
    ["S10", "copy", "'Nearly half of the displaced have not finished growing up' (index.html:649) is left out: it conflicts with 38% (humanImpactExtra.childrenPct)."],
    ["S10", "decision", "The border runs across the frame (home above, fled below) because it is S09's line kept in place; the live page draws an upright border. Confirm."],

    // S11 The Appeal
    ["S11", "decision", "Open decision 5 (audit F13/F02): the fill sets the 2026 ask ($33B) against what the 2025 appeal received ($12B), so it reads as the 2026 appeal being part-funded, which no source says; the kicker 'what was asked, what arrived' (index.html:663) mixes the same two years. Alt B (recommended by the storyboard): two separate sheets with year labels, no fill. Choose."],
    ["S11", "decision", "Open decision 5 (phase 3 default): 'Reaching all 240 million people in need costs about four months of nuclear-arsenal budgets' (index.html:705-707) is not shown until verified: 'four months' has no data.js field, and the $33B appeal targets 135 million people (displacedStats.targetPeople). The years printed in the labels (2026 ask, 2025 received, 2025 nuclear) are page copy (index.html:667, :679, :692); data.js holds them only in the field name received2025 and in comments."],
    ["S11", "copy", "'The world's entire humanitarian system received $12 billion' overstates: data.js defines $12B as what the 2025 UN appeal received. Suggested: 'the UN's appeal received'."],
    ["S11", "decision", "The old ladder returns all grey ($40B was blue in S02), so blue means only the appeal; $119B gets a firmer grey edge, not red, in a quiet scene. Confirm both."],
    ["S11", "decision", "Phone scale differs from brief §8 (there $33B would be 13 × 19 px, too small to read): on phones $2.89T fills 189 × 276 storyboard px, one scale for all the sheets."],

    // S13 The Handover
    ["S13", "decision", "The top labels and progress bar stay off after the handover. Alt B brings them back, as the live dossier script does (audit SCR-2). Choose."],
    ["S13", "copy", "The paragraph under the title on the live page (index.html:793-798, 'Governments hold the budgets…') is not shown: the brief gives S13 two lines. Keep it under the sheet, move it into the Redistribute tool, or drop it?"],
    ["S13", "copy", "The hint 'Tap the causes you'd fund, in order of priority — your most urgent first.' (index.html:829-830) describes the Redistribute tool, which arrives in phase 4: in this preview there is nothing to tap yet."],

    // Whole story
    ["All", "decision", "Size (Daniel): to meet the brief's 60 KB limit without cutting the art, the fourteen scenes now live in one file (js/story/scenes.js) and their styles in css/story/scenes.css. Same code, about 10 KB smaller to download because one file compresses better than fourteen. It is reversible."],
    ["All", "decision", "Size accounting (Greg / Daniel): the 60 KB counts story code only. js/story-assets/s05-drawings.js is counted as an asset, but besides the drawing geometry it holds S05's layout numbers, the styles the drawings use, the on-screen label list and a little code that reads data.js (about 2.4 KB gzipped of its 6.5 KB). If only geometry counts as an asset, those parts must move into the story code, which then needs that much more room. Rule on it."],
    ["All", "decision", "Tablets held upright (Greg / Blueprint): neither the brief nor the storyboards say what a tablet should get. Built: an upright tablet (up to 1024 px wide) gets the phone design rather than the desktop design shrunk to fit (its small labels printed at about 5 px). The picture stays in phone proportions, in a centred column with black either side (about 602 of 768 px on an iPad), so nothing is packed tighter than on an iPhone in Safari; figures the design runs off the edge are cut at the column's edge. Turned on its side a tablet gets the desktop design. The alternative is a design made for tablets."],
    ["All", "a11y", "Browser zoom (Blueprint / Greg): between 100% and about 160% the moving story refits itself to the window, so its words do not get bigger (WCAG 1.4.4). The still plates only take over when the window is under 560 px tall (about 160% on a typical laptop, more on a larger screen). Option: send a reader who zooms to 125% or more during their visit to the still plates. That is not built because readers who keep their browser at 125% would lose the moving art. 'Read as text' (hero only) is the alternative that exists today."],
  ].forEach(function (f) { Story.flag(f[1], f[0] + " · " + f[2]); });
})();
