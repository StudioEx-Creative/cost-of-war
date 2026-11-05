# Scroll-rebuild brief vs code — full audit

Read-only audit of `main` at commit a434636 (the live site), 5 November 2026.
Each finding was checked a second time by a separate sceptical reviewer.
Verdict: *confirmed* = held as written; *corrected* = held, with the wording fixed by the reviewer.
Web-sourced points (IEP, OCHA, SIPRI) were checked once more; re-confirm them before they change any copy.

## Figures and data

### F01 · §3 CHANGE / S05 / §2 · blocker · corrected
$679B is printed on the page but has no entry in js/data.js or DATA-SOURCES.md. Its only source is the SIPRI link at index.html:489. To 'read it from data.js', someone must first add a new data.js field and a DATA-SOURCES row, and the brief does not say so. 'Both cannot be done' is too strong. Moving a figure the page already shows into data.js adds no figure to the page. The real gap is the undeclared data.js and DATA-SOURCES addition.

Evidence:
- `brief.md:51 — Hard-coded figures in js/dossier.js ($679B, 9.2, 77, 117.8, 45): read them from js/data.js.`
- `brief.md:24 — Do not add, round differently or change any figure.`
- `brief.md:165 — Data: $679B and +9.2%.`
- `js/dossier.js:94 — ["#mfRevenue", "$679B"],`
- `js/dossier.js:447 — v: 679,`
- `index.html:486 — record revenue of the 100 largest arms makers, 2024`
- `index.html:489 — sipri-top-100-arms-producers-see-combined-revenues-surge`
- `grep '679' js/data.js DATA-SOURCES.md — no matches`

**Suggested:** Approve one explicit exception: add the figure (679, $B, 2024, SIPRI Top 100 URL from index.html:489) to data.js and DATA-SOURCES.md. Otherwise drop $679B from S05.

### F02 · §3 CHANGE / S09 · decision · confirmed
77, 2025 and 1948 have no numeric field in data.js. 77 appears only inside text strings. 1948 is not in data.js at all. Reading them from data.js means adding a field or deriving 1948 = 2025 − 77.

Evidence:
- `js/data.js:125 — human development has been set back 77 years`
- `js/data.js:582 — development set back 77 yrs`
- `js/dossier.js:494-495 — var NOW_YEAR = 2025, BACK_YEARS = 77; // 2025 → 1948`
- `js/dossier.js:135 — if (sy) sy.textContent = "1948";`
- `index.html:611 — <b>77 years</b> — to 1948`
- `brief.md:194 — Scroll runs the year from 2025 back to 1948.`

**Suggested:** Decide whether adding numeric fields (for example gazaYearsLost: 77 and baseYear: 2025) counts as adding a figure. Derive 1948 instead of storing it.

### F03 · §3 CHANGE · decision · confirmed
The brief's list of hard-coded figures in dossier.js is incomplete. Each listed figure appears twice (once on the still path, once on the scrub path). The list also misses 2025, 1948, the 344/246 mark counts, the 0.38 child share, the 2887 and 244700 fallbacks, and 31536000. The file's own header wrongly says nothing is re-typed.

Evidence:
- `js/dossier.js:6-7 — Figures come from js/data.js (DEFENCE …) — nothing is re-typed here.`
- `js/dossier.js:48 — var DEF = typeof DEFENCE !== "undefined" ? DEFENCE : 2887;`
- `js/dossier.js:95 — ["#mfGrowth", "+9.2%"],`
- `js/dossier.js:481 — v: 9.2,`
- `js/dossier.js:121 — DEATHS_PER_YEAR : 244700;`
- `js/dossier.js:677 — var LIVES = typeof DEATHS_PER_YEAR !== "undefined" ? DEATHS_PER_YEAR : 244700;`
- `js/dossier.js:137 — if (sl) sl.textContent = "77";`
- `js/dossier.js:139 — if (bc) bc.textContent = "117.8M";`
- `js/dossier.js:141 — if (bch) bch.textContent = "45M";`
- `js/dossier.js:170-171 — place(344, ... place(246,`
- `js/dossier.js:538-539 — var HOME = 344, // 68.7M ÷ 200k / FLED = 246; // 49.1M ÷ 200k`
- `js/dossier.js:558 — child: rnd(i + 7) < 0.38,`
- `js/dossier.js:565 — child: rnd(j + 313) < 0.38,`
- `js/dossier.js:617-618 — (117.8 * bP.n).toFixed(1) + "M" ... Math.round(45 * bP.n) + "M"`
- `js/dossier.js:787 — Math.floor(secs * (LIVES / 31536000));`

**Suggested:** List every instance. Derive 344/246 from displacementBreakdown and childrenPct. Drop the literal fallbacks, or take them from data.js.

### F04 · §2 / §3 CHANGE / §14 Data · decision · corrected
The scoping gap is real. The CHANGE list names only dossier.js, but index.html types most story figures, and the data.js fields that hold them are never read. Most of these HTML values do match a data.js value, though: 691590, 2.5, 954, 2650, 10.5, 117.8, 70, 14.7, 68.7, 49.1, 38, 33, 12 and 119. So they 'trace' by value, though they are not read from data.js. The ones with no data.js home are the derived or invented ones: the 200,000-per-mark scale (:732), the bar widths 27.7 and 10.1 (33/119 and 12/119, at :672 and :685), and 'about four months' (:706).

Evidence:
- `index.html:80 — Every second, violence costs humanity $691,590.`
- `index.html:180-181 — 2025 was the eleventh straight record year. The world now spends 2.5% of`
- `index.html:197 — The US alone spent $954B; Europe surged 14%.`
- `index.html:210-213 — $21.8T ... 10.5% of world GDP, about <b>$2,650 taken from every person alive</b>`
- `index.html:225 — <span class="seal-x">10.5%</span>`
- `index.html:631-635 — 117.8M ... one in every 70 human beings ... 14.7 million people went home`
- `index.html:640-646 — 45M ... 38% of everyone displaced ... data-w="38"`
- `index.html:667 — $33B asked`
- `index.html:672 — data-w="27.7"`
- `index.html:685 — data-w="10.1"`
- `index.html:704-706 — <b>$12 billion</b> ... <b>$119 billion</b> ... 240 million`
- `index.html:720 — <b>68.7M</b>`
- `index.html:723 — <b>49.1M</b>`
- `index.html:732 — 1 mark ≈ 200,000 people.`
- `index.html:761 — one every 2 min 9 sec`
- `index.html:807 — <div class="ti-val g" id="tiRem">$2.89T</div>`
- `index.html:9 — violence cost humanity $21.8 trillion: 10.5% of everything we produce`
- `brief.md:129 — Text: existing hero copy.`
- `brief.md:351 — Every figure traces to js/data.js.`

**Suggested:** Widen the CHANGE item to index.html. Bind every figure in kept copy to a data.js field at render time, including the gap-bar widths (27.7 = 33/119, 10.1 = 12/119).

### F05 · §2 / S12 / §9 · decision · confirmed
main.js types figures that data.js already holds. hiPies and humanStrip retype 244,700, 11,967, 1 in 6, 4.5M+, 117.8 and 45 instead of reading humanData, which is unused. The letter, share text, tracker, card and country note also type figures. S12 keeps hiPies and humanStrip, and §9 keeps the tools.

Evidence:
- `js/main.js:309 — 38% of the 117.8 million people displaced by war and persecution are children: about 45 million.`
- `js/main.js:398 — num: "244,700",`
- `js/main.js:403 — num: "11,967",`
- `js/main.js:408 — num: "1 in 6",`
- `js/main.js:413 — num: "4.5M+",`
- `js/main.js:193 — "$2.89T",`
- `js/main.js:215 — "$21.8T",`
- `js/main.js:619 — prompt.textContent = "$2.89T to redistribute";`
- `js/main.js:866 — In 2025, violence cost the world $21.8 trillion.`
- `js/main.js:1077 — of the $2.89T global military total`
- `js/main.js:1210 — the world spent $2.89 trillion on its militaries, the eleventh consecutive annual record.`
- `js/main.js:1214 — 673 million people went hungry. 272 million children ... 117.8 million ... rose 19% to a record $119 billion`
- `js/main.js:1776 — : "$2.89T";`
- `js/main.js:1839 — the world's $2.89T military budget`
- `js/data.js:187-189 — const humanData = [ { num: "244,700",`

**Suggested:** Read humanData, displacedStats and machineData in main.js. Format $2.89T from DEFENCE with fmt().

### F06 · §9 Your country / §2 · decision · confirmed
'Keep all logic and the tax slider' keeps tax rates hard-coded in main.js. They differ from data.js taxBrackets, which is never used. For example, the top rate is 0.42 in code and 0.4 in data.js. The lowest rate is 0.08 in code and 0.1 in data.js.

Evidence:
- `brief.md:261 — Your country: keep all logic and the tax slider.`
- `js/main.js:1116 — if (income < 15000) return 0.08;`
- `js/main.js:1120 — return 0.42;`
- `js/data.js:632 — { label: "Lower income", income: 18000, rate: 0.1 },`
- `js/data.js:635 — { label: "Top earners", income: 250000, rate: 0.4 },`

**Suggested:** Either move the main.js rate curve into data.js and delete taxBrackets, or record an exemption for the indicative tax model.

### F07 · S10 · decision · confirmed
The brief says 589 marks. The code draws 590 (344 + 246). 68.7M/200k = 343.5 and 49.1M/200k = 245.5. Both are rounded up. Only 117.8M/200k = 589 exactly. The 200,000-per-mark scale is not in data.js. It is typed into the HTML.

Evidence:
- `brief.md:202 — Visual: 589 still marks. Each is about 200,000 people.`
- `js/dossier.js:538-539 — var HOME = 344, // 68.7M ÷ 200k / FLED = 246; // 49.1M ÷ 200k`
- `index.html:732 — 1 mark ≈ 200,000 people.`
- `js/data.js:176 — millions: 49.1,`
- `js/data.js:181 — millions: 68.7,`

**Suggested:** Choose 590 (each side rounded up, as now) or 589 (one side rounded down). Store the 200,000 scale as a display constant.

### F08 · S06 / §8 · decision · confirmed
The brief uses both $21.81T and $21.8T. The page only ever prints $21.8T or $21.8 trillion. data.js holds amt "$21.8T", but its own sum text says $21.81 trillion. The site's fmt() turns 21810 into "$21.81T". So the label depends on which field the build uses. Printing $21.81T would round differently from the live page.

Evidence:
- `brief.md:171 — Visual: the $21.81T sheet fills the frame.`
- `brief.md:172 — Data: $21.8T, 10.5% of world GDP`
- `brief.md:244 — $21.81T | violence | 1440×900 | 343×500`
- `js/data.js:80 — amt: "$21.8T",`
- `js/data.js:81 — amtB: 21810,`
- `js/data.js:83 — reached $21.81 trillion in 2025`
- `js/main.js:15-16 — b >= 1000 ? "$" + (b / 1000).toFixed(2) + "T"`
- `index.html:233 — $21.8T it actually costs`
- `grep '21.81' index.html js/main.js js/dossier.js — no matches`

**Suggested:** Pick one on-screen string. To keep the diff clean, use machineData[3].amt ("$21.8T") for labels and amtB only for area.

### F09 · §15.2 · decision · corrected
data.js holds two different military figures for the IEP model: 45% of $21,810B ($9,814.5B) and a stated $9.5T (43.6%). §15.2 names only the first. Neither dollar amount is printed. But the 45% share itself is already printed in the violence pie legend, around a '$21.8T' centre. 'Because machineData is unused' explains only the $9.5T. The $9.8T is simply never computed.

Evidence:
- `brief.md:378 — data.js shows military expenditure as 45% of $21.8T, which is about $9.8T.`
- `js/data.js:567 — { label: "Military expenditure", pct: 45,`
- `js/data.js:85 — Military expenditure alone accounts for $9.5T of the model`
- `DATA-SOURCES.md:75 — Military 45% · internal security 29%`

**Suggested:** Add the $9.5T vs 45% mismatch to open decision 2 for the IEP check.

### F10 · S01 / S06 / §4 · decision · confirmed
The two 'share of world output' figures use different GDP bases. $2,887B / 2.5% = $115.5T. $21,810B / 10.5% = $207.7T. data.js worldGDP is $110T. Drawn at true area against worldGDP, they would read 2.6% and 19.8%, not 2.5% and 10.5%. That contradicts 'let true scale do the work' if a world-output sheet is ever shown.

Evidence:
- `js/data.js:19 — worldGDP: 110000, // $B, approx world GDP 2025 (IMF, ~$110T)`
- `js/data.js:20 — milPctGDP: 2.5,`
- `js/data.js:21 — violencePctGDP: 10.5,`
- `brief.md:25 — Do not print any new ratio or comparison. Let true scale do the work.`

**Suggested:** Never draw world GDP as a sheet. Show 2.5% and 10.5% only as printed figures. Mention this base mismatch alongside open decision 2.

### F11 · §8 / S06 vs §15.2 · decision · confirmed
§8 anchors every rung at one corner, and S06 keeps all references inside the $21.81T sheet. That nests the $2.89T rung inside $21.81T, which reads as 'part of'. §15.2 says never show one as part of the other. The same nesting puts world nuclear spending ($119B, nine states) inside the US $954B rung. data.js gives US nuclear as $69.2B.

Evidence:
- `brief.md:231 — Use true area. Anchor all rungs at one corner.`
- `brief.md:171 — the $21.81T sheet fills the frame. All references stay.`
- `brief.md:378 — Until then, never show one as part of the other.`
- `js/data.js:59 — The nine nuclear states spent a record $119B in 2025`
- `js/data.js:61 — The United States spent $69.2B`

**Suggested:** Decide whether nesting is allowed as a scale-only device with a clear 'for scale' label, or whether rungs sit side by side on a shared baseline.

### F12 · S03 → S04 / §4 · decision · confirmed
spendBreakdown sums exactly to $2,887B, so the treemap can fill the sheet. The ten topSpenders sum to $2,072.6B (71.8%). The S03 'slices restack into ten bars' step cannot keep area equal to money unless a $814.4B remainder appears. That remainder is not in data.js.

Evidence:
- `brief.md:153 — Transition: the slices restack into ten bars.`
- `brief.md:69 — Its area always means money while it is showing money.`
- `js/data.js:31-38 — spendBreakdown 1010+780+578+260+140+119 = 2887`
- `js/data.js:93-104 — topSpenders 954+336+190+114+92.1+89+84.1+83.2+68+62.2 = 2072.6`

**Suggested:** Either show an unlabelled 'rest of world' remainder, which needs approval as a derived figure, or treat the restack as a hard cut where area stops meaning money.

### F13 · S11 / §8 · decision · corrected
The year mix holds: $33B is the 2026 ask and $12B is what the 2025 appeal received. But the live page already pairs them as 'asked' and 'arrived' on one shared scale (index.html:663), and the letter already says 'a third'. So the 12-of-33 comparison is not new. Filling the $33B outline with $12B would turn that existing mismatched-year pairing into an explicit part-of-whole. §8's 'received' field is displacedStats.received2025.

Evidence:
- `brief.md:210 — An outline for $33B fills to $12B.`
- `js/data.js:166 — appeal: 33, // $B asked for 2026`
- `js/data.js:167 — received2025: 12, // $B actually received in 2025`
- `index.html:667 — UN humanitarian appeal 2026 <span>$33B asked</span>`
- `index.html:679-680 — What 2025's appeal received <span>$12B · lowest in a decade</span>`
- `js/main.js:1214 — The UN's humanitarian appeal received barely a third of what it asked for`

**Suggested:** Show $33B (2026 ask) and $12B (2025 received) as separate sheets with year labels. Add this to open decision 5. Check the letter line too.

### F14 · S07 · decision · confirmed
'Keep the wording that these are mixed estimates' points at wording that does not exist in the UI. It exists only in a data.js code comment and in DATA-SOURCES.md. The UI heading calls every bar '$bn needed', although Yemen is a cumulative loss and Sudan is damage.

Evidence:
- `brief.md:181 — Keep the wording that these are mixed estimates.`
- `js/data.js:576-577 — Mix of damage and reconstruction needs, framed clearly in the UI.`
- `DATA-SOURCES.md:76 — (mix of reconstruction-need and cumulative-loss estimates; framed in UI)`
- `index.html:579 — Rebuilding what war destroys · $bn needed`
- `js/data.js:583 — note: "Cumulative economic loss from a decade of war"`
- `js/data.js:584 — note: "Estimated damage since the 2023 war`

**Suggested:** Treat it as new copy that needs sign-off. Keep the per-row notes. Replace '$bn needed' with neutral wording.

### F15 · S10 / S12 vs §2 · decision · confirmed
Copy the brief keeps describes 38% in two other ways: 'Nearly half' in the displacement copy, and 'A third' in hiPies. data.js says 38%. Keeping both breaks 'do not round differently'.

Evidence:
- `js/data.js:598 — childrenPct: 38,`
- `index.html:649 — Nearly half of the displaced have not finished growing up.`
- `js/main.js:308 — big: "A third of the displaced are children",`
- `brief.md:204 — Text: existing copy.`
- `brief.md:222 — Keep hiPies and humanStrip as plain, quiet content.`
- `brief.md:24 — Do not add, round differently or change any figure.`

**Suggested:** Replace both phrases with '38%' or '45 million', or get approval to keep them.

### F21 · §3 CHANGE donuts / §7 · decision · confirmed
The scene map has no place for violenceBreakdown (the $21.8T donut). S06 forbids morphing into its 45% slice. The Chapter 02 copy refers the reader to that pie. If the donuts are rebuilt or removed, this data and that sentence lose their target.

Evidence:
- `js/main.js:209-213 — function buildViolencePie() { buildDonut( "violencePie", "violenceLegend", violenceBreakdown,`
- `index.html:271 — What the $21.8T is made of · by component`
- `index.html:568-569 — The pie in Chapter 01 shows its make-up.`
- `brief.md:175 — Warning: do not morph $2.89T into the 45% slice.`

**Suggested:** Decide whether violenceBreakdown is shown (as a separate still in S06) or dropped. Then fix the 'pie in Chapter 01' sentence.

### F25 · §8 table / §14 Scale · decision · confirmed
One table cell is more than 2% off in area. The $33B phone rung of 13×19 = 247 px² should be 13.34×19.45 = 259.5 px² (−4.8%). All other cells are within 2%. $12B on phone (8×12, +1.7%) and $40B on desktop (62×39, +1.7%) are close to the limit.

Evidence:
- `brief.md:239 — $33B | appeal | 56×35 | 13×19`
- `brief.md:343 — Rung areas match their values within 2%.`
- `js/data.js:166 — appeal: 33,`
- `js/data.js:81 — amtB: 21810,`

**Suggested:** Change the cell to 13×20 (+0.2%) or 13.3×19.5. Draw rungs at fractional size on canvas, not rounded CSS pixels.

### F16 · S12 vs §2 · note · confirmed
The death rate is rounded two ways in kept content. The lives scene says 'one every 2 min 9 sec'. humanStrip, which S12 keeps, says 'one every two minutes'. The exact rate is 31,536,000 / 244,700 = 128.88 s = 2 min 8.88 s, so '2 min 9 sec' is correct. SECONDS_PER_DEATH holds this value but is never used.

Evidence:
- `index.html:761 — one every 2 min 9 sec`
- `js/main.js:399 — people killed in armed conflict in the last year, one every two minutes`
- `js/data.js:191 — one life ended by war roughly every two minutes.`
- `js/data.js:15 — const SECONDS_PER_DEATH = 31536000 / DEATHS_PER_YEAR; // ≈ 129 s`

**Suggested:** Format both from SECONDS_PER_DEATH, or drop the clause from humanStrip.

### F17 · S12 / §2 sources · note · confirmed
The ACLED period for 244,700 disagrees between files. The code comment and the on-page source say Dec 2024 – Nov 2025. data.js body text and DATA-SOURCES.md say Nov 2024 – Nov 2025.

Evidence:
- `js/data.js:14 — // ACLED, Dec 2024–Nov 2025`
- `index.html:765 — ACLED · Dec 2024 – Nov 2025`
- `js/data.js:191 — between November 2024 and November 2025`
- `DATA-SOURCES.md:46 — Nov 2024–Nov 2025`

**Suggested:** Confirm the period against ACLED and use one string from data.js.

### F18 · S10 · note · confirmed
49.1M is the remainder 117.8 − 68.7. It is not a sourced figure in DATA-SOURCES.md. DATA-SOURCES.md lists 41.6M refugees and 9M asylum-seekers, which make 50.6M. With 68.7M IDPs that totals 119.3M, not 117.8M. displacedStats.refugees is 41.6.

Evidence:
- `js/data.js:162 — refugees: 41.6, // million`
- `js/data.js:175-176 — Fled their country (refugees & asylum-seekers) / millions: 49.1,`
- `DATA-SOURCES.md:37 — 117.8M end-2025 (1 in 70 people); 41.6M refugees; 9M asylum-seekers; 68.7M IDPs`
- `index.html:723 — FLED ACROSS<br />A BORDER<br /><b>49.1M</b>`

**Suggested:** Get 49.1M confirmed against UNHCR Global Trends 2026 before it drives the S10 split.

### F19 · S04 / §9 country · note · confirmed
data.js rounds the same countries two ways. S04 uses topSpenders, and the country step uses countryData. If one sheet carries both, labels would change between scenes.

Evidence:
- `js/data.js:98 — { name: "India", amt: 92.1,`
- `js/data.js:399 — ["India", "IN", 92, 2.3,`
- `js/data.js:100 — { name: "Ukraine", amt: 84.1,`
- `js/data.js:401 — ["Ukraine", "UA", 84, 40.0,`
- `js/data.js:101 — amt: 83.2 (Saudi Arabia) vs js/data.js:402 — 83`
- `js/data.js:103 — amt: 62.2 (Japan) vs js/data.js:404 — 62`

**Suggested:** Keep S04 on topSpenders and the tools on countryData. Do not carry labels across.

### F20 · §3 KEEP drawings vs §14 Data · note · confirmed
The engineering drawings the brief keeps contain numbers that are not in data.js. One of them encodes $679B. The disclaimer says no figure was invented. 'Every figure traces to js/data.js' needs an explicit exemption for illustrative dimensions.

Evidence:
- `brief.md:41 — The turbine-to-munition morph and engineering drawings.`
- `index.html:340 — H 120 M`
- `index.html:365 — 4.1 M`
- `index.html:371 — Ø 340`
- `index.html:459 — 4 100 MM`
- `index.html:476 — SCALE 1:40`
- `index.html:478 — DWG No. 679-B`
- `index.html:1121 — We have not invented or inflated any figure`

**Suggested:** Mark the drawing dimensions as illustrative and exempt them in the acceptance test.

### F22 · S00 · note · corrected
The hero shows one rate (violence, $691,590/s, already labelled correctly) and one running total of military spend. It does not show two rates. 'Label the two rates clearly' is ambiguous. It can be met by clearly labelling the military counter, without printing $91,546/s. Printing it would put a new figure on the page, though that figure does exist in data.js and DATA-SOURCES.md:12.

Evidence:
- `brief.md:128 — Label the two rates clearly.`
- `js/data.js:11 — const MIL_PER_SECOND = 91546;`
- `js/main.js:45 — const spent = ((Date.now() - pageOpened) / 1000) * MIL_PER_SECOND;`
- `index.html:86-89 — Since you opened this file, the world has spent ... on its militaries`
- `index.html:80 — Every second, violence costs humanity $691,590.`

**Suggested:** Confirm whether printing $91,546/s is allowed. It is in data.js, but it is a new on-page figure.

### F23 · S11 / §15.5 · note · corrected
It holds that 'about four months' is a derived figure with no data.js home: four months of $119B is $39.7B, and the $33B appeal is 3.3 months. But the brief already raises this line as open decision 5 (brief.md:381, which notes 240M against 135M), and S11 points to it. What the auditor adds is the arithmetic and the missing data.js home, not a new conflict.

Evidence:
- `index.html:705-707 — Reaching all 240 million people in need costs about four months of nuclear-arsenal budgets.`
- `brief.md:212 — Text: existing copy. See open decision 5.`
- `js/data.js:165 — inNeed: 240,`
- `js/data.js:168 — targetPeople: 135,`

**Suggested:** Add 'four months is not in data.js' to open decision 5.

### F24 · §2 / §15.4 · note · confirmed
SEED_COUNT 2847 lives in js/config.js, with a fallback in main.js. It is not in data.js. DATA-SOURCES.md flags only seededPriorityWeights as placeholder.

Evidence:
- `js/config.js:22 — SEED_COUNT: 2847, // base number shown before/under real submissions`
- `js/main.js:1328 — const SEED_COUNT = (window.COW_CONFIG && window.COW_CONFIG.SEED_COUNT) || 2847;`
- `DATA-SOURCES.md:82 — use `seededPriorityWeights` in `js/data.js` plus any live localStorage votes`
- `brief.md:23 — js/data.js stays the only home for figures.`

**Suggested:** Fold this into open decision 4. If seeds stay, label them and list them in DATA-SOURCES.md.

### F26 · §8 Source field · note · confirmed
Some §8 source-field names do not match data.js. 'received' is displacedStats.received2025. No field is called 'violence'. The $21.81T value is machineData[3].amtB, and VIOLENCE_PER_SECOND is a rate. 'military' is DEFENCE (2887), and 'nuclear' is machineData[1].amtB or spendBreakdown[5].amtB.

Evidence:
- `brief.md:238 — $12B | received |`
- `brief.md:244 — $21.81T | violence |`
- `js/data.js:167 — received2025: 12,`
- `js/data.js:81 — amtB: 21810,`
- `js/data.js:8 — const DEFENCE = 2887; // $B`
- `js/data.js:57 — amtB: 119,`

**Suggested:** Name the exact field paths in the table.

### F27 · §15.10 · note · corrected
The date and staleness points hold. But the $40B Zero Hunger rung comes from Ceres2030 and WFP, not SOFI. SOFI supplies the 673M hunger count. Also, brief §15.10 already raises whether to refresh before launch.

Evidence:
- `DATA-SOURCES.md:3 — Last full verification: **12 June 2026**.`
- `js/data.js:3 — Every figure is sourced. Last full verification: June 2026.`
- `index.html:1121-1122 — all data was verified against primary sources in June 2026.`
- `DATA-SOURCES.md:88-89 — **June** — ... UN Children & Armed Conflict / **July** — FAO SOFI (hunger)`
- `DATA-SOURCES.md:49 — 11,967 in 2024 ... (Jun 2025)`
- `js/data.js:232 — 673 million people faced hunger in 2024. Around $40 billion a year`

**Suggested:** Use this when answering open decision 10. Any refresh changes rung sizes, so decide before phase 1 storyboards.

### F28 · Preamble (read README) / §2 methodology · note · confirmed
README is out of date. It describes 5 chapters and a 4-step journey. The page has Chapters 01–02 and Steps 01–03. Its structure list omits dossier.js, room.js, backend.js, config.js and dossier.css. It says figures are edited only in data.js, which the code does not follow. README and DATA-SOURCES.md have no methodology section and do not say spendBreakdown is indicative. Only the data.js comment says so.

Evidence:
- `README.md:13 — index.html — page structure (5 chapters + 4-step user journey)`
- `README.md:15 — js/data.js — ALL data and sources live here (edit figures here only)`
- `index.html:562 — Chapter 02 · The Impact of War`
- `index.html:1005 — <div class="journey-label">Step 03</div>`
- `js/data.js:27-30 — The category split is indicative, modelled on typical national defence-budget compositions`
- `grep -i 'indicative|spendBreakdown|personnel' DATA-SOURCES.md README.md — no matches`
- `index.html:1114 — Methodology &amp; disclaimer ▾`

**Suggested:** The kept 'methodology' is the disclaimer at index.html:1112-1125. Add a spendBreakdown row to DATA-SOURCES.md when open decision 3 is settled.

### Found by the reviewer (not in the first pass)
- js/data.js:614-624, index.html:586 and js/data.js:149 and :589: emittersCompare mixes national CO₂ shares (Global Carbon Project) with the militaries' 5.5% share of all greenhouse gas. index.html:586 labels the whole chart 'share of global CO₂'. Military emissions are also already inside national totals. S08 (brief.md:188) stacks these as bands, which implies one shared base and a part-of reading that the data does not support.
- js/main.js:1214: the letter says 'This year, 673 million people went hungry', but data.js:232 says '673 million people faced hunger in 2024'. It also says '272 million children', where data.js:254 says 'children and youth'. The letter is kept (§9), so it keeps a mis-dated figure.
- index.html:703-704: 'The world's entire humanitarian system received $12 billion last year'. data.js:167 and DATA-SOURCES.md:40 define $12B as what the 2025 UN appeal received, not the whole system. S11 keeps the existing copy (brief.md:212).
- brief.md:165 and index.html:484-507: S05 pairs $679B (arms revenue of the Top 100 companies, 2024) with +9.2%. The +9.2% is growth in the volume of major-arms transfers, 2021–25 against 2016–20 (DATA-SOURCES.md:15). It is not money and not revenue growth; SIPRI's $679B release gives 5.9% revenue growth (checked on the web). Fusing them into one drawing risks reading 9.2% as revenue growth, and 'area means money' (brief.md:69) cannot apply to a volume index.
- js/data.js colours: issueData uses amber #f5a623 (:231), cyan #00e5ff (:242) and purple #b967ff (:253), plus 11 more distinct colours. displacementBreakdown uses #00e5ff (:177). violenceBreakdown uses yellow and amber (:567-572). Brief §14 says no amber, cyan or purple may remain, and §5 allows only two live brand colours. But §9 keeps the tools, which colour the 14 issues from issueData. So data.js must change, and a 14-way palette cannot be made from two brand colours.
- js/main.js:1349: SEED_COUNT (2,847) is added to the live Supabase count, not only in demo mode. Brief §2 (brief.md:28) keeps the Supabase flow unchanged, while §15.4 asks whether to remove or label the seed. Removing it changes getTally's live path.
- js/main.js:301: hiPies says 'Up to 90%' of explosive-weapon casualties in towns are civilians. data.js:596 has civilianShare 90 with no hedge, and DATA-SOURCES.md:78 says '~90%'. Kept content describes the same figure differently, which conflicts with 'do not round differently' (brief.md:24).

## Story structure and motion

### F02 · S11 · blocker · corrected
S11's fill shows the 2026 ask ($33B) filled by the 2025 receipt ($12B), which mixes two years. That makes the 2026 appeal look about 36% funded. But this is not a new comparison. The existing gap-box (index.html:663-688) already sets 2026-asked against 2025-received under 'what was asked, what arrived'. The fill makes an existing year mismatch explicit. It should be raised alongside open decision 5.

Evidence:
- `brief.md:211 — An outline for $33B fills to $12B.`
- `js/data.js:166-167 — appeal: 33, // $B asked for 2026 / received2025: 12, // $B actually received in 2025`
- `index.html:667 — UN humanitarian appeal 2026 <span>$33B asked</span>`
- `index.html:679-680 — What 2025's appeal received <span>$12B · lowest in a decade</span>`
- `brief.md:24 — Do not print any new ratio or comparison.`

**Suggested:** Show $33B (2026 ask) and $12B (2025 received) as two separate true-area blocks, or get sign-off on the year mix.

### F01 · S10 · decision · confirmed
The brief asks for 589 marks that divide at the border. The code draws 590 marks (344 inside + 246 across). 68.7M and 49.1M at 200,000 per mark are 343.5 and 245.5, so 589 whole marks cannot split exactly by side. 589 is not in js/data.js.

Evidence:
- `brief.md:202 — Visual: 589 still marks. Each is about 200,000 people.`
- `js/dossier.js:538-539 — var HOME = 344, // 68.7M ÷ 200k  FLED = 246; // 49.1M ÷ 200k`
- `js/dossier.js:170-171 — place(344, …) / place(246, …)`
- `js/data.js:176,181 — millions: 49.1 / millions: 68.7`
- `index.html:732 — 1 mark ≈ 200,000 people.`

**Suggested:** Decide 589 (one side rounds down) or 590 (each side rounds), and derive the count from data.js in code.

### F03 · §3 CHANGE (hard-coded figures) · decision · corrected
Two of the five listed figures have no data.js field: $679B is absent, and 77 is only in prose strings. Reading them from data.js means adding fields. That is not really against 'Do not add … any figure' (brief.md:24), because both figures are already on the page. §2's 'js/data.js stays the only home for figures' (brief.md:23) in fact requires it. The real gap is that the brief assumes these fields already exist.

Evidence:
- `brief.md:51 — Hard-coded figures in js/dossier.js ($679B, 9.2, 77, 117.8, 45): read them from js/data.js.`
- `js/dossier.js:447 — v: 679,`
- `js/dossier.js:95 — ["#mfRevenue", "$679B"],`
- `js/data.js:125 — The UN calculates human development has been set back 77 years.`
- `js/data.js:582 — note: "Recovery & reconstruction · development set back 77 yrs"`
- `grep '679' js/data.js — no match`

**Suggested:** Approve adding numeric fields for figures already on the page (arms revenue 679, Gaza setback 77) as moves, not new figures.

### F05 · §2 / §14 Data · decision · corrected
Many story figures are typed into index.html and main.js: the hero rate, the mirror's $954B, 14%, 10.5% and $2,650, the displacement totals, the border labels, the human strip and the 2 min 9 sec rate. They are not read from data.js. Seven or more data.js objects and constants are never read. 'Only humanImpactExtra is used' overstates this: the charts do read data.js. The brief's CHANGE item names only dossier.js, but §14 requires every figure to trace to data.js.

Evidence:
- `grep machineData|destructionData|humanData|displacedStats|globalContext js/*.js — only js/main.js:298,306 humanImpactExtra`
- `index.html:80 — Every second, violence costs humanity $691,590.`
- `index.html:197 — The US alone spent $954B; Europe surged 14%.`
- `index.html:212-213 — 10.5% of world GDP, about <b>$2,650 taken from every person alive</b>`
- `index.html:631 — <div class="disp-big" id="dispNum">117.8M</div>`
- `index.html:720-723 — <b>68.7M</b> / <b>49.1M</b>`
- `index.html:761 — one every 2 min 9 sec`
- `js/main.js:398-413 — num: "244,700" / "11,967" / "1 in 6" / "4.5M+"`
- `js/main.js:193,215 — "$2.89T" / "$21.8T"`

**Suggested:** Scope the 'every figure traces to data.js' test to index.html and main.js too.

### F06 · §3 CHANGE vs S12 · decision · confirmed
CHANGE says donuts are rebuilt as forms of the sheet. S12 says keep hiPies as plain, quiet content. hiPies are donut charts.

Evidence:
- `brief.md:50 — Donuts and separate bars: rebuild them as forms of the one sheet.`
- `brief.md:222 — Keep hiPies and humanStrip as plain, quiet content.`
- `js/main.js:286-289 — <circle … stroke-dasharray="${on.toFixed(1)} ${(C - on).toFixed(1)}"`
- `index.html:744 — <div class="hi-pies rv" id="hiPies"></div>`

**Suggested:** Decide if hiPies stay as donuts or become plain figures (90%, 38%) with their sources.

### F08 · S10 / S12 · decision · corrected
The same 38% child share is described two ways in kept copy: 'Nearly half' (index.html:649, S10) and 'A third' (main.js:308, hiPies in S12). Neither matches 38%. This conflicts with brief.md:24 ('Do not add, round differently or change any figure') and brief.md:96 ('Say the figure').

Evidence:
- `index.html:649 — Nearly half of the displaced have not finished growing up.`
- `js/main.js:308 — big: "A third of the displaced are children",`
- `js/data.js:598 — childrenPct: 38,`
- `brief.md:23 — Do not add, round differently or change any figure.`
- `brief.md:204 — Text: existing copy.`

**Suggested:** Replace both phrases with '38%' or get copy approval.

### F12 · S07 · decision · confirmed
The brief says to keep the wording that these are mixed estimates. No such wording is on the page. It exists only as a code comment. The visible heading calls all six 'rebuilding … needed', but Yemen is economic loss and Sudan is damage.

Evidence:
- `brief.md:181 — Keep the wording that these are mixed estimates.`
- `js/data.js:576-577 — Mix of damage and reconstruction needs, framed clearly in the UI.`
- `index.html:579 — Rebuilding what war destroys · $bn needed`
- `js/data.js:583 — note: "Cumulative economic loss from a decade of war"`
- `js/data.js:584 — note: "Estimated damage since the 2023 war …"`

**Suggested:** Write and approve a 'mixed estimates' line as new copy. Do not call every S07 block reconstruction.

### F16 · §3 KEEP no-motion / §12 · decision · confirmed
The kept no-motion mode is not complete. The S06 captions are hidden. #livesSince stays at '0' because its interval never starts. Gaza's year ticks are never built. The morph shows only the missile. ?static=1 does not stop .rv reveals or the donut and bar transitions. Blink, pulse and nudge loops keep running. Any query containing 'static' triggers it, including ?static=0. If GSAP fails to load, the page shows $0, +0.0% and 2025.

Evidence:
- `js/dossier.js:53 — location.search.indexOf("static") > -1;`
- `css/dossier.css:549-550 — body.no-motion .matchcut { display: none;`
- `js/dossier.js:782-790 — var sinceEl = $("#livesSince"); … setInterval(tickSince, 5000); (after the return at :174)`
- `js/dossier.js:496-505 — ticks built only in the motion path`
- `css/dossier.css:882-884 — body.no-motion .mo-turbine { opacity: 0;`
- `css/style.css:2075-2082 — @media (prefers-reduced-motion: reduce) { … .rv { transition: none; (no body.no-motion rule)`
- `js/main.js:139-140 — setTimeout(() => { seg.style.transition = "stroke-dasharray 1.1s …`
- `css/style.css:2215 — animation: nudge 1.6s ease-in-out infinite;`
- `js/dossier.js:177 — if (!window.gsap || !window.ScrollTrigger) return; // fail soft to a static page`

**Suggested:** Rebuild no-motion as explicit end-state plates. Parse ?static=1 exactly. Gate main.js transitions and CSS loops on the same flag.

### F18 · §3 KEEP live counters / §6.9 / S12 · decision · corrected
The kept live counters run on time, not scroll position, which clashes with rule 9 (brief.md:119). The brief should exempt them. The S12 'rising counter' is clear in context (the scrubbed #livesCount). That the live military counter 'uses up' the one money count-up is speculation.

Evidence:
- `js/main.js:42-48 — function tickLiveSpend() … requestAnimationFrame(tickLiveSpend);`
- `js/dossier.js:790 — setInterval(tickSince, 5000);`
- `brief.md:119 — Scroll position alone sets the story state.`
- `brief.md:221 — Remove the flood and the rising counter.`
- `brief.md:223 — the live count since opening`
- `brief.md:49 — Keep at most one money count-up.`

**Suggested:** State that the live counters are exempt from rule 9, and whether #liveSpend counts toward the one money count-up.

### F21 · §3 KEEP drawings vs §5 colour budget · decision · corrected
The drawing is not all red. Dimension, centre, cut and leader lines, balloons and the title block are grey. But the munition outline, hatching, status line and the $679B figure are red, and so is the morph's missile. That gives several red marks on one screen, against 'normally one red mark per screen' (brief.md:80). Keeping the drawings means recolouring most of that red.

Evidence:
- `css/dossier.css:772-774 — .bp-line { fill: none; stroke: var(--red);`
- `css/dossier.css:1557-1558 — .bp-hatch line { stroke: var(--red);`
- `css/dossier.css:1625-1626 — .bp-tb-r { fill: var(--red);`
- `css/dossier.css:816-817 — .mf-fig.red { color: var(--red);`
- `css/dossier.css:690-693 — .mo-missile path … { stroke: var(--red);`
- `brief.md:79-80 — Budget: 92% black, white and grey, 5% red, 3% blue. / Normally one red mark per screen.`

**Suggested:** Draw the line-work in white/grey and keep one red mark, for example the warhead or the figure.

### F22 · S00 / §12 flashes / §6.9 · decision · corrected
The title scramble runs on time, not scroll: per-frame random block glyphs at up to 11rem for about 620 ms each, starting at 240 and 440 ms. The brief keeps the hero copy but never says whether to keep the scramble. Whether it breaks rule 9 is arguable given S00's load trigger. It is a possible flash risk under brief.md:320 that should be measured, partly reduced by the fade-in.

Evidence:
- `js/dossier.js:56 — var GLYPHS = "▚▞█▓▒░#@%&/\\<>*+=—0123456789…";`
- `js/dossier.js:57 — var SCRAMBLE_MS = 620;`
- `js/dossier.js:73,76 — GLYPHS[(Math.random() * GLYPHS.length) | 0] … requestAnimationFrame(step);`
- `js/dossier.js:188-191 — setTimeout(function () { scramble(t); }, 240 + i * 200);`
- `css/style.css:122-124 — .hero-title { font-size: clamp(4rem, 14vw, 11rem);`
- `brief.md:320 — No more than three flashes per second.`

**Suggested:** Remove the scramble or drive it from hero scroll progress with no random per-frame glyphs.

### F26 · §2 deep links / S00→S01 / §3 Archive · decision · corrected
The current order is hero → Archive → nav → #machine. #impact holds S07–S12 except the closing line and the button, which sit outside it. No script handles hashes, and pins may shift the native anchor targets. The brief does map #machine (S01), #roomSection (end) and #haveyoursay (S13). Only #impact has no scene, and the brief does not say how anchors resolve inside one sticky stage (needed for brief.md:340).

Evidence:
- `index.html:52,100,158,176 — #hero, #roomSection, nav.itin, #machine in that order`
- `index.html:538,560 — #matchcut then #impact`
- `index.html:160,164,168 — href="#machine" / "#impact" / "#haveyoursay"`
- `index.html:1107 — <a class="room-cta-btn" href="#roomSection">▸ Enter the archive</a>`
- `index.html:779 — onclick="document.getElementById('haveyoursay').scrollIntoView({behavior:'smooth'})"`
- `grep location.hash|hashchange js/*.js — no match`

**Suggested:** Map #machine to S01 and #impact to S06 or S07 as real anchors in the track. Add hash-to-progress restore. Put the 'small link near the top' in the itin nav.

### F28 · §2 'Keep every source link' / §7 · decision · corrected
Blocks with no scene: the violence pie, envFacts ('4th' and '~0%' are not in S08's Data), the Chapter 02 intro (which points to the pie) and the blueprint caption. The source links at real risk are envFacts' SGR and CEOBS links. The pie's IEP link duplicates the one kept with $21.8T at index.html:215.

Evidence:
- `index.html:270-282 — id="violencePie" … IEP Global Peace Index 2026 · economic impact model ↗`
- `index.html:583-584 — <div class="viz-h">War and the planet</div> <div class="env-grid" id="envGrid">`
- `js/main.js:243 — <a href="${f.url}" …>${f.src} ↗</a>`
- `index.html:568-569 — The pie in Chapter 01 shows its make-up.`
- `index.html:495-497 — A record year. Every line on this schematic is somebody's profit.`

**Suggested:** Choose a home for each, or approve dropping them, and keep their links in a sources panel.

### F04 · §3 CHANGE (hard-coded figures) · note · corrected
dossier.js holds more instances than the brief lists. Some are extra copies of the listed figures (77, 117.8 and 45 in the no-motion path). Some are new: the years 2025 and 1948, the 0.38 child share, and the 344/246 mark counts derived from 68.7M and 49.1M. 2887 and 244700 are only fallbacks behind the data.js constants.

Evidence:
- `js/dossier.js:48 — var DEF = typeof DEFENCE !== "undefined" ? DEFENCE : 2887;`
- `js/dossier.js:121,677 — : 244700;`
- `js/dossier.js:135 — sy.textContent = "1948";`
- `js/dossier.js:137-141 — "77" / "117.8M" / "45M"`
- `js/dossier.js:494-495 — var NOW_YEAR = 2025, BACK_YEARS = 77;`
- `js/dossier.js:558,565 — child: rnd(i + 7) < 0.38,`
- `js/dossier.js:617-618 — (117.8 * bP.n) / Math.round(45 * bP.n)`
- `js/dossier.js:787 — (LIVES / 31536000)`

**Suggested:** Treat every literal above as in scope for the read-from-data.js change.

### F07 · S12 · note · corrected
As coded, the kept hiPies use red (#ff2d2d) and cyan (#00e5ff), and Bebas Neue, which is not loaded. That conflicts with 'No red emphasis' in S12. The cyan and font problems are already covered by the brief's colour, font and REMOVE rules, so they are not a gap. What remains is that the brief should say hiPies get restyled, not kept as is.

Evidence:
- `js/main.js:299 — color: "#ff2d2d",`
- `js/main.js:307 — color: "#00e5ff",`
- `js/main.js:290 — font-family="'Bebas Neue',sans-serif"`
- `brief.md:226 — No sound. No red emphasis.`
- `brief.md:48 — Colours: live uses #ff3b30, cyan #31d0d6 and amber #ffb020.`
- `index.html:21 — family=Anton&family=Archivo…&family=IBM+Plex+Mono…&family=IBM+Plex+Sans`

**Suggested:** Restyle hiPies in white/grey only. Add #00e5ff, #4f7cff and #ff2d2d to the colour-removal list.

### F09 · S12 · note · confirmed
The death rate appears two ways: 'one every 2 min 9 sec' and 'one every two minutes'. '2 min 9 sec' is not in data.js. It comes from SECONDS_PER_DEATH (about 128.9 s), which no script reads.

Evidence:
- `index.html:761 — <span class="lv-rate">one every 2 min 9 sec</span>`
- `js/main.js:399 — one every two minutes`
- `js/data.js:15 — const SECONDS_PER_DEATH = 31536000 / DEATHS_PER_YEAR; // ≈ 129 s`
- `brief.md:223 — one every 2 min 9 sec`

**Suggested:** Format the rate from SECONDS_PER_DEATH and use one wording.

### F10 · S06 / §8 · note · confirmed
The brief labels the violence sheet both '$21.81T' and '$21.8T'. The page prints '$21.8T' everywhere. data.js has amt "$21.8T" and amtB 21810. A '$21.81T' label would round differently from the live page.

Evidence:
- `brief.md:171 — Visual: the $21.81T sheet fills the frame.`
- `brief.md:172 — Data: $21.8T, 10.5% of world GDP`
- `index.html:210 — <div class="mh-fig build">$21.8T</div>`
- `js/data.js:80-81 — amt: "$21.8T", amtB: 21810,`

**Suggested:** Pick one display form (data.js amt is "$21.8T").

### F11 · §8 table vs §14 Scale · note · confirmed
The phone size for $33B (13×19 = 247 px²) is 4.8% under its true area (259.5 px² at 343×500). The acceptance test allows 2%. Every other rung is within 2%.

Evidence:
- `brief.md:240 — $33B | appeal | 56×35 | 13×19`
- `brief.md:343 — Rung areas match their values within 2%.`
- `computed: 33/21810 × 343×500 = 259.5; 13×19 = 247 (−4.8%)`

**Suggested:** Compute sizes in code from area. Do not use the table's integers.

### F13 · S06 / §12 · note · corrected
The S06 caption lines exist only inside an aria-hidden section that is display:none in no-motion mode. The border's 68.7M and 49.1M exist only in aria-hidden labels. Carried over as-is, both break brief.md:314. The mirror readout is aria-hidden too, but it repeats figures that are already in readable text, so it loses nothing unique.

Evidence:
- `index.html:538 — <section class="scene matchcut" id="matchcut" aria-hidden="true">`
- `css/dossier.css:549-550 — body.no-motion .matchcut { display: none;`
- `index.html:230 — <div class="mirror-readout" id="readout01" aria-hidden="true">`
- `index.html:718-723 — <div class="bd-labels" aria-hidden="true"> … <b>68.7M</b> … <b>49.1M</b>`

**Suggested:** Make these real, readable text in the new story layer.

### F14 · §3 REMOVE (chrome) · note · corrected
The fixed progress bar and dot sit outside .fx and .hud. The chrome dissolve never touches them, so they stay visible through Gaza, displacement, Human Impact and the lives scene. The brief never names them. S12's 'Chrome: all off' (brief.md:216) arguably covers S12, and the amber/teal colours are banned anyway. But nothing removes them from S09 and S10.

Evidence:
- `index.html:786-787 — <div id="scrollBar"></div> <div id="scrollDot"></div>`
- `css/style.css:2016 — background: linear-gradient(180deg, var(--red), var(--amber), var(--teal));`
- `css/style.css:2032 — box-shadow: 0 0 8px var(--teal);`
- `js/main.js:889-899 — function initScrollProgress() … bar.style.height = pct * 100 + "%"`
- `js/dossier.js:634 — var chrome = ".fx, .hud";`

**Suggested:** Add #scrollBar/#scrollDot to the chrome removal list.

### F15 · §3 REMOVE (chrome) / S09 · note · corrected
The facts hold. In no-motion the HUD, grid and vignette never fade, the label is frozen at 'FILE 00 · BOOT', and Gaza has a red dossier tick. But brief.md:60 (REMOVE chrome in Gaza, displacement and Human Impact) and :216 already apply in every mode. So this is a clash between keeping no-motion mode as it is (brief.md:39) and that REMOVE line, not a missed instance.

Evidence:
- `js/dossier.js:174 — return; // no ScrollTrigger at all`
- `js/dossier.js:635-643 — gsap.timeline({ scrollTrigger: { trigger: "#humanPivot" … .to(chrome, { opacity: 0`
- `css/dossier.css:514-516 — body.no-motion .fx-scan, body.no-motion .fx-grain { display: none;`
- `index.html:42 — <span class="hud-file" id="hudFile">FILE 00 · BOOT</span>`
- `index.html:601 — <span class="tick">▚</span> GAZA · HUMAN DEVELOPMENT INDEX`
- `css/dossier.css:939-941 — .sb-kicker .tick { color: var(--red);`

**Suggested:** Turn chrome off by section in both modes, not by a scrubbed tween only.

### F19 · §3 CHANGE (count-ups) · note · corrected
Six scrubbed count-up timelines drive eight numbers. They fall in five of the brief's scenes (S01, S05 twice, S09, S10, S12). Only two are money ($2.89T and $679B), and one is the Gaza year the brief keeps. So 'keep at most one money count-up' in effect means dropping one of two.

Evidence:
- `js/dossier.js:285-292 — #odo01 $0→$2.89T (money)`
- `js/dossier.js:446-451 — #mfRevenue $0→$679B (money)`
- `js/dossier.js:480-485 — #mfGrowth +0.0%→+9.2%`
- `js/dossier.js:520-528 — #sbYear 2025→1948, #sbLost 0→77`
- `js/dossier.js:611-618 — #bdCount 0→117.8M, #bdChildren 0→45M`
- `js/dossier.js:765-776 — #livesCount 0→244,700`

**Suggested:** Restate the CHANGE as 'six counters in five scenes, two of them money'.

### F23 · S12 'When you're ready' · note · confirmed
The existing 'When you're ready' button is a cyan CTA with a glow and an arrow that nudges forever on a 1.6 s cycle. It sits in the S12 pause, after S11 says all colour drains and before S13 says 'Blue may return here'. The brief also says nothing bounces.

Evidence:
- `index.html:778-781 — class="continue-btn say" … When you're ready <span class="ar">▾</span>`
- `css/style.css:3022 — --cta: #31d0d6;`
- `css/style.css:2215 — animation: nudge 1.6s ease-in-out infinite;`
- `brief.md:105 — Cut hard. Let locks snap. Nothing bounces.`
- `brief.md:213 — Transition: all colour drains.`

**Suggested:** Keep the words only. Make it a still, white link to #haveyoursay.

### F24 · §5 easing · note · confirmed
There is one forbidden ease in the code: back.out(1.7) on the 10.5% seal, which overshoots past scale 1. No CSS cubic-bezier overshoots: every one is (0.16, 1, 0.3, 1). There is no elastic or bounce ease.

Evidence:
- `js/dossier.js:307 — { scale: 1, rotate: 0, ease: "back.out(1.7)", duration: 0.3 },`
- `css/style.css:83 — opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),`
- `js/main.js:140 — "stroke-dasharray 1.1s cubic-bezier(.16,1,.3,1)"`

### F25 · §6.9 / §14 'Scrolling back reverses' · note · confirmed
Several story effects never reverse. .rv reveals and bar fills fire once on an IntersectionObserver and then unobserve. Emitter bars stagger on 80 ms timers. Donuts animate on load timers. The HUD file label uses onToggle, so in the gap between #hero and #machine (the Archive and the nav) the label depends on scroll direction.

Evidence:
- `js/main.js:68-74 — e.target.classList.add("on"); … io.unobserve(e.target);`
- `js/main.js:266-267 — setTimeout(() => (b.style.width = b.dataset.w + "%"), k * 80),`
- `js/main.js:139-145 — setTimeout(() => { … }, 300 + i * 110);`
- `js/dossier.js:220-226 — start: "top 60%", end: "bottom 40%", onToggle: function (self) { if (self.isActive && hudFile) hudFile.textContent = s[1];`

**Suggested:** The new scene state model must replace all of these, not wrap them.

### F27 · §7 scene order · note · confirmed
The current order differs from the scene map. The $21.8T, 10.5% and $2,650 reveal is in #mirror01 at the S01 position, not S06. The bars (S04) come after the production line (S05). The appeal (S11) comes before the border (S10).

Evidence:
- `index.html:209-213 — The full bill … $21.8T … 10.5% of world GDP … $2,650 (inside #mirror01)`
- `index.html:291 then 521 — <div class="manufacture"> … <div class="dual-bars rv">`
- `index.html:661 then 716 — <div class="gap-box"> … <div class="border-viz" id="borderViz">`

### F29 · §15.2 · note · confirmed
data.js also states military spend as $9.5T of the IEP model, which differs from 45% × $21.81T ≈ $9.81T. The brief cites only the 45%. machineData, which holds the $9.5T, is not rendered. The live page already pairs the two donuts and says the $21.8T pie 'shows its make-up'.

Evidence:
- `js/data.js:85 — Military expenditure alone accounts for $9.5T of the model`
- `js/data.js:567 — { label: "Military expenditure", pct: 45,`
- `index.html:238 — <!-- two matching donuts: where the spend goes / what the full bill is -->`

### F31 · S12 / §12 contrast · note · confirmed
The lives-scene footer (rate, live count, ACLED source) uses var(--ink-faint, #565b61). --ink-faint is defined nowhere, so #565b61 applies, about 3.1:1 on #000. The brief warns only about #5C636C.

Evidence:
- `css/dossier.css:1176 — color: var(--ink-faint, #565b61);`
- `grep '--ink-faint:' css/ — no match`
- `css/dossier.css:148 — .hud-src { color: #565b61;`

### F32 · §10 performance · note · confirmed
The border canvas does not cap device pixel ratio. The lives canvas caps it at 2. The redistribution canvas and the live counter run rAF loops forever, even off screen.

Evidence:
- `js/dossier.js:542 — var dpr = window.devicePixelRatio || 1;`
- `js/dossier.js:145 — dpr = window.devicePixelRatio || 1,`
- `js/dossier.js:686 — var dpr = Math.min(window.devicePixelRatio || 1, 2);`
- `js/main.js:823 — requestAnimationFrame(drawFlow);`

### F33 · §3 CHANGE fonts · note · confirmed
Archivo is loaded but no CSS or JS uses it. 'Bebas Neue' is used (as the --fd fallback, in hiPies and in the flow canvas) but is not loaded.

Evidence:
- `index.html:21 — family=Anton&family=Archivo:wght@600;700;800`
- `css/style.css:35 — --fd: "Anton", "Bebas Neue", sans-serif;`
- `js/main.js:290,745,791,794 — 'Bebas Neue',sans-serif`
- `grep Archivo css/*.css js/*.js — no match`

**Suggested:** Fix the brand acceptance test wording to 'No Anton, Archivo or Bebas Neue remains'.

### Found by the reviewer (not in the first pass)
- brief.md:357 vs brief.md:47,84. The brand test says 'No Anton, Archivo, amber, cyan or purple remains', but the brief requires Archivo Black for giant numbers and titles. A literal check for 'Archivo' fails on the font the brief requires. It should say 'Archivo (non-Black)', or name the unused Archivo load at index.html:21.
- js/main.js:300-301 (kept by brief.md:222). The hiPies headline says 'Most of those killed are civilians', but the figure only covers casualties from explosive weapons in populated areas (data.js:596). The label says 'Up to 90%', while the donut prints a bare '90%' (main.js:290). Kept as-is, this breaks 'Say the figure' (brief.md:96) and the no-rounding rule (brief.md:24).
- index.html:180 ('2025 was the eleventh straight record year') and brief.md:136 ('eleventh record year') vs js/data.js:47 ('the 11th consecutive year of growth'). 'Record' does not trace to data.js, so it fails brief.md:351 ('Every figure traces to js/data.js').

### Thrown out by the reviewer
- F17: S00 says brackets hunt and lock on load, then at #hero top. Section 12 says bracket hunting is driven by scroll. At load the scroll position is 0, so scroll cannot drive a hunt then. No bracket hunting exists in the code. The hero reticle is a scrubbed contraction, and the 120 ms hop comes from the deck, not the code. — *Why:* brief.md:125-127 says 'Trigger: load, then #hero top' and 'Brackets hunt and lock'. It never says the hunt runs at load. Reading the load trigger as the opening state and #hero top as the scroll-driven hunt agrees with brief.md:321. The code facts are right: no hunting exists, and dossier.js:251-262 is a scrubbed reticle contraction. But that is new work, not a conflict. brief.md:321 itself says the 120 ms hop comes from the deck. At most this is an ambiguity worth clarifying.
- F20: The brief defines a hard cut as a state change at one exact progress point. The kept Gaza year steps in whole years: 77 discrete changes. S09 and the tone test say S09 has no hard cuts. — *Why:* brief.md:107 defines a hard cut as part of the motion language ('Cut hard. Let locks snap.'), meaning a cut between visual states. S09's own Visual line (brief.md:194) asks for 'Scroll runs the year from 2025 back to 1948', so whole-year steps are what the brief asks for. In code the sb-fill bar moves continuously (dossier.js:527, width = p×100%), and only the readout changes in whole years (:525-526). The arithmetic is right (2025→1948 is 77 steps), but treating a number readout as 77 hard cuts misreads the brief.
- F30: Section 9 says nothing in the tools may depend on scroll position. Section 10 keeps the globe and Archive lazy-loaded, and today that loading is triggered by scroll position. — *Why:* The code facts hold. main.js:1889-1902 builds the globe through an IntersectionObserver with rootMargin 300px. room.js:517-527 boots when section.top < 0.82×innerHeight on scroll. But brief.md:267 sits under 'Stop scrubbing. From here, the reader's choices change the visuals, not scroll' (brief.md:257). It is about tool state and visuals, not when resources load. brief.md:276 explicitly asks for lazy loading. Loading when a tool comes near the viewport changes no tool state, so this misreads the brief.

## Brand, type, colour and accessibility

### BR-03 · §3 CHANGE Colours / REMOVE / §14 Brand · decision · confirmed
The brief names only #ff3b30, #31d0d6 and #ffb020. The code has many more non-brand colours, and most of them sit in JS and data.js rather than CSS. The acceptance test does not cover green, pink, orange, yellow, other reds or other blues. Cyan also hides under five token names.

Evidence:
- `brief.md:48 — "Colours: live uses #ff3b30, cyan #31d0d6 and amber #ffb020."`
- `js/main.js:299 — color: "#ff2d2d", (also 528, 743; rgba(255,45,45) at 711, 727, 731, 732, 755)`
- `js/main.js:307 — color: "#00e5ff", (also 1543 atmosphereColor("#00e5ff"))`
- `js/main.js:743 — const lcol = warPct < 0.3 ? "#ff2d2d" : warPct < 0.6 ? "#f5a623" : "#00ff88";`
- `js/main.js:1450-1454 — volColor stops [0,229,255], [0,255,136], [245,166,35], [255,45,45]`
- `js/main.js:1592 — .ringColor(() => (t) => `rgba(0,255,136,${1 - t})`)`
- `js/dossier.js:592 — bctx.fillStyle = p.home ? "#4f7cff" : "#31d0d6";`
- `js/data.js:264 — color: "#ff67b9", (pink); data.js:319 "#a0ff00" (lime); data.js:341 "#ff6b35" (orange); data.js:286 "#f5d623" (yellow)`
- `css/style.css:3752 — .envc-fig color: #e8893a; (also 3755, 3944, 3960)`
- `css/style.css:3086 — linear-gradient(90deg, var(--say), #8affc4);`
- `css/style.css:3208 — .bigsub.blue color: #4f7cff;`
- `css/style.css:26,28,2091,3022 — --green / --teal / --say / --cta all #31d0d6; css/dossier.css:14 — --build: var(--say);`
- `brief.md:357 — "No Anton, Archivo, amber, cyan or purple remains."`

**Suggested:** Make the acceptance test positive: every colour literal in css/*, js/* and data.js must be a brand token or grey. Keep a full inventory (see facts) as the checklist.

### BR-04 · §9 Handover tools / §5 Colours · decision · confirmed
The tools the brief keeps depend on many hues. Redistribution uses 14 distinct category colours (about 8 hue families), plus a red centre and a red/amber/green remaining figure. The coalition globe uses a cyan-green-amber-red ramp. The share card uses the top five category colours. The brand allows two live hues, because ember and deep blue may never carry a live figure. A 3% blue budget and one red mark per screen leave no room to tell 14 causes apart by colour. The brief does not say how the causes are told apart.

Evidence:
- `js/data.js:231 — color: "#f5a623", (Zero Hunger; the 14 issueData colours are at 231, 242, 253, 264, 275, 286, 297, 308, 319, 330, 341, 352, 363, 374)`
- `js/main.js:489 — <div class="ix-cost" style="color:${iss.color}">`
- `js/main.js:776 — fX.fillStyle = n.color + "65"; (flow-canvas nodes; labels at 793)`
- `js/main.js:939 — <span class="prio-dot" style="background:${issueData[idx].color}">`
- `js/main.js:1040 — cc-bar-fill ... background:${iss.color}`
- `js/main.js:1069 — prio-bar-fill" style="background:${issueData[t.i].color} (also 1410)`
- `js/main.js:1791 — <div class="sc-dot" style="background:${iss.color}">...<div class="sc-ic" style="color:${iss.color}">`
- `js/main.js:1484 — color: volColor(t), (globe bars)`
- `brief.md:78 — "Ember #8F1B14 and deep blue #0E2A44: support only, never a live figure."`
- `brief.md:79 — "Budget: 92% black, white and grey, 5% red, 3% blue."`
- `brief.md:260 — "Redistribute: the $2.89T sheet drains as causes are chosen. Keep the ranking order."`
- `brief.md:263-264 — "Coalition: keep the globe ... Card: keep download and share."`

**Suggested:** Add an open decision. For example: show all causes in one blue, told apart by rank number, label and position. Or let the tools use a separate categorical scale outside the story colour budget. Decide what colour globe bars use.

### BR-05 · §9 Redistribute / §5 Colours · decision · confirmed
Both budget-remaining displays use a three-state traffic light, and the middle state is amber. Their meaning is also inverted. The remaining military money shows cyan or green while it is large, but brand red means what war takes.

Evidence:
- `js/main.js:582-584 — if (pct > 60) remEl.className = "ti-val g"; else if (pct > 25) ... "ti-val a"; else ... "ti-val r";`
- `css/style.css:2729-2730 — .tracker.say .ti-val.g { color: var(--say);`
- `css/style.css:757 — .ti-val.a color: var(--amber);`
- `js/main.js:743 — const lcol = warPct < 0.3 ? "#ff2d2d" : warPct < 0.6 ? "#f5a623" : "#00ff88";`
- `brief.md:76 — "Cost red #E8362B: what war takes."`

**Suggested:** Make the remaining sheet red and the allocated sheet blue, with no middle state.

### BR-06 · §7 S02/S06, §8 vs §5 · decision · corrected
brief.md:232 says each rung starts full frame. brief.md:171 says the $21.81T sheet fills the frame. Lines 247-248 make war rungs red and $40B blue. A solid colour sheet at full frame would act as a red or blue page background and would break the budgets at lines 79-81. The brief does not say whether sheets are filled or outlined, so it should state that full-frame rungs are outlines or neutral, or state how the colour budget applies.

Evidence:
- `brief.md:233 — "Each rung starts full frame, then the camera pulls out to reveal the next."`
- `brief.md:244 — "$21.81T | violence | 1440×900 | 343×500"`
- `brief.md:170 — "Visual: the $21.81T sheet fills the frame."`
- `brief.md:247-248 — "Red for war figures." / "Blue for $40B."`
- `brief.md:69 — "Its area always means money while it is showing money."`
- `brief.md:79-81 — "5% red, 3% blue." / "Normally one red mark per screen." / "Never use red or blue as a page background."`

**Suggested:** Define how a full-frame sheet is drawn: an outline, a hatch, or a grey fill with a red edge. State whether the colour budget is waived during the scale sequence.

### BR-07 · §7 S03 · decision · confirmed
The S03 treemap splits the $2.89T into 6 sectors. Every sector is war money, and data.js gives them 6 red shades. The brand allows one live red, and its darker support red may not carry a live figure. A sheet-sized red treemap also goes past the 5% red budget.

Evidence:
- `js/data.js:32-37 — spendBreakdown colours #ff4d4d, #e23030, #c21f1f, #9c1414, #741010, #4d0a0a`
- `brief.md:150 — "Visual: the sheet cuts into a sector treemap. This replaces the donut."`
- `brief.md:78 — "support only, never a live figure."`

**Suggested:** Draw the sectors in one red or in grey, told apart by rules and labels. Confirm this with the brand owner.

### BR-11 · §9 'Keep focus states' / §12 · decision · confirmed
There are almost no focus states to keep. There is no :focus-visible rule anywhere. Only form fields have a custom focus, and it is a border change to cyan, which the brand change removes. The editable letter turns its outline off and its focus colour equals its normal colour, so it shows no focus. The tax slider turns its outline off and has no replacement. Buttons and links rely on the browser default ring.

Evidence:
- `brief.md:267 — "Keep the journey gate. Keep focus states."`
- `css/style.css:3100-3104 — .field-inp:focus, .country-select:focus, .share-inp:focus { border-color: var(--say);`
- `css/style.css:4052-4054 — .tax-select:focus { border-color: var(--say);`
- `css/style.css:1730 — outline: none; (.letter-body)`
- `css/style.css:4090 — color: #1c1a17;  css/style.css:4093-4094 — .letter-body:focus { color: #1c1a17;`
- `css/style.css:4333 — outline: none; (.tax-slider, no :focus rule)`
- `css/style.css:4492 — .globe-wrap canvas { outline: none;`

**Suggested:** Change the wording to 'add visible focus states'. Specify one :focus-visible style in a brand colour that passes 3:1 against its surroundings.

### BR-20 · §10 'Pin any new library' · decision · confirmed
The pin rule covers only new libraries. Some kept dependencies are not pinned to an exact version: supabase-js is pinned to its major version only, and globe.gl and the three-globe earth texture have no version at all.

Evidence:
- `index.html:1296 — https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- `js/main.js:1518 — s.src = "https://cdn.jsdelivr.net/npm/globe.gl";`
- `js/main.js:1540 — "https://unpkg.com/three-globe/example/img/earth-night.jpg",`
- `brief.md:277 — "Pin any new library to an exact version."`

**Suggested:** Decide whether to pin the existing libraries too. That touches the Supabase flow, which the brief says to keep unchanged.

### BR-01 · §3 CHANGE Fonts · note · confirmed
The brief says live uses Anton and Archivo. Archivo is loaded but never used. No CSS or JS names it, and the browser never fetches it on the live site. Bebas Neue is the font the brief misses. It is the --fd fallback, it is hard-coded in the redistribution canvas and the hiPies SVG, and privacy.html loads it. Bebas Neue is not loaded on index.html, so that canvas and SVG text falls back to plain sans-serif today. Archivo Black is loaded nowhere.

Evidence:
- `brief.md:47 — "Fonts: live uses Anton and Archivo."`
- `index.html:21 — "family=Anton&family=Archivo:wght@600;700;800&family=IBM+Plex+Mono..."`
- `css/style.css:35 — --fd: "Anton", "Bebas Neue", sans-serif;`
- `js/main.js:745 — fX.font = `${Math.round(baseF * 1.9)}px 'Bebas Neue',sans-serif`;`
- `js/main.js:791 — fX.font = `${Math.round(fs)}px 'Bebas Neue',sans-serif`;`
- `js/main.js:794 — fX.font = `${Math.round(fs * 1.25)}px 'Bebas Neue',sans-serif`;`
- `js/main.js:290 — font-family="'Bebas Neue',sans-serif" font-size="22" fill="#fff">${pct}%`
- `privacy.html:9 — "family=Bebas+Neue&family=IBM+Plex+Mono..." (Anton is not loaded here, so the privacy h1 at css/style.css:4557-4558 var(--fd) renders in Bebas Neue)`
- `archive-original.html:9 — family=Bebas+Neue (tracked file in the repo root)`

**Suggested:** Rewrite the CHANGE line as: live loads Anton and an unused Archivo, and uses Bebas Neue in canvas, SVG and privacy.html. Load Archivo Black and set the canvas ctx.font strings explicitly.

### BR-02 · §14 Brand acceptance vs §3/§5 Type · note · confirmed
The acceptance test says no Archivo may remain. The brief also requires Archivo Black. A literal check for "Archivo" would fail the required font. The test also leaves out Bebas Neue.

Evidence:
- `brief.md:357 — "No Anton, Archivo, amber, cyan or purple remains."`
- `brief.md:47 — "Use Archivo Black, IBM Plex Sans and IBM Plex Mono."`
- `brief.md:84 — "Archivo Black: giant numbers and titles."`

**Suggested:** Reword it as: no Anton, no Bebas Neue, and no Archivo except Archivo Black.

### BR-08 · §7 S12 · note · confirmed
S12 keeps hiPies as plain, quiet content with no red emphasis. Today hiPies draw a red ring (#ff2d2d) and a cyan ring (#00e5ff), and the % label uses Bebas Neue, which is not loaded.

Evidence:
- `brief.md:222 — "Keep hiPies and humanStrip as plain, quiet content."`
- `brief.md:226 — "No sound. No red emphasis."`
- `js/main.js:299 — color: "#ff2d2d",`
- `js/main.js:307 — color: "#00e5ff",`
- `js/main.js:290 — font-family="'Bebas Neue',sans-serif"`

**Suggested:** Recolour both rings white or grey on a dark track.

### BR-09 · §12 contrast · note · corrected
The brief warns about #5C636C, a brand-deck grey, but misses the grey already in the code. That grey is #565b61, at 2.89:1 on #0A0A0A and 3.07:1 on today's #000 ground, and it is used for small text in kept items: the S12 live-count footer, the Archive hint, empty and CTA text, and the morph drawing figure labels. #6b7076 on #f3f1ea (dossier.css:1334) is 4.42:1. The brief's #0A0A0A is the target ground, not the live one.

Evidence:
- `brief.md:322 — "#5C636C is only 3.3:1 on #0A0A0A"`
- `css/style.css:20 — --black: #000;  css/style.css:49 — background: var(--black);`
- `css/dossier.css:148 — .hud-src color: #565b61; (8.8px)`
- `css/dossier.css:1176 — .lv-foot color: var(--ink-faint, #565b61); (9.28px)`
- `css/dossier.css:1293 — .room-hint color: var(--ink-faint, #565b61);`
- `css/dossier.css:1456 — .rd-empty color: var(--ink-faint, #565b61);`
- `css/dossier.css:1505 — .room-cta-sub color: var(--ink-faint, #565b61);`
- `css/dossier.css:1657 — .mo-fig fill: var(--ink-faint, #565b61); (about 12.6px rendered at 1440)`
- `css/dossier.css:1334 — .room-reader-meta color: #6b7076; (4.42:1 on the #f3f1ea paper at dossier.css:1312)`

**Suggested:** Name #565b61 and #6b7076 in the rule. Measure contrast on #000 and on each panel colour.

### BR-10 · §7 S12, §9, §3 KEEP vs §12 AA · note · corrected
Same items, with corrected canvas figures. 'GLOBAL MILITARY BUDGET' is about 2.2:1 and 'remaining' about 1.6:1 over the full red centre, both failing AA. Everything else holds as stated.

Evidence:
- `index.html:761-765 — <span class="lv-rate">one every 2 min 9 sec</span> ... <span class="lv-src">ACLED · Dec 2024 – Nov 2025</span>`
- `css/style.css:1913 — .sc-rn color: #333;`
- `css/style.css:1963 — .sc-footer-left color: #333; (8px)`
- `css/style.css:1969 — .sc-footer-right color: #1a1a1a; (7.36px)`
- `css/style.css:1867 — #shareCard background: #000;  js/main.js:1817 — backgroundColor: "#000",`
- `css/style.css:4097-4098 — .letter-redfill color: #c0392b; background: #fbe3df;`
- `js/main.js:740-742 — fillStyle = "rgba(255,255,255,0.45)" ... "GLOBAL MILITARY BUDGET" (drawn over the rgba(255,45,45,0.55) wedge)`
- `js/main.js:747-749 — fillStyle = "rgba(255,255,255,0.28)" ... "remaining"`
- `js/main.js:819-821 — fillStyle = "rgba(112,128,144,0.7)" ... "Select issues to fund" (about 3.0:1 on #000)`
- `brief.md:322 — "Text must pass WCAG AA."`

**Suggested:** List these kept items in the AA pass so they are recoloured, not carried over.

### BR-12 · §9 / §12 Full keyboard use · note · corrected
Keyboard users cannot choose a cause, so they can never unlock the journey gate. Tab still reaches the country, letter and coalition controls, which stay blurred and dimmed with no visible focus. Both close controls are spans, and opening a letter in the Archive works by pointer only.

Evidence:
- `js/main.js:480-481 — const card = document.createElement("div"); card.className = "ix";`
- `js/main.js:497 — card.addEventListener("click", (e) => {`
- `js/main.js:610-611 — if (sel.size >= 1) { gate.classList.remove("locked");`
- `css/style.css:2938-2942 — .gated.locked .gated-content { filter: blur(8px) ...; pointer-events: none;`
- `index.html:1245 — <span class="share-close" onclick="closeShare()">Close</span>`
- `index.html:1286-1288 — <span class="sc-close" onclick=...`
- `js/room.js:396-413 — stage.addEventListener("pointerdown" ... "pointermove" ... "pointerup"`
- `brief.md:317 — "Full keyboard use across all tools."`

**Suggested:** Name these in the phase 4 scope. Make the cards buttons or checkboxes, make the gate inert while locked, and make the close controls buttons.

### BR-13 · §3 KEEP no-motion / §12 / §14 'Live counters still run' · note · confirmed
The current no-motion mode breaks rules the brief sets. In ?static=1 and in reduced motion, dossier.js stops before the lives counter starts, so #livesSince stays at 0. The S06 caption is hidden in no-motion and is aria-hidden in every mode. The S10 figures 68.7M and 49.1M exist only inside an aria-hidden block.

Evidence:
- `js/dossier.js:88 — if (reduce) {`
- `js/dossier.js:175 — return; // no ScrollTrigger at all`
- `js/dossier.js:782-790 — var sinceEl = $("#livesSince"); ... setInterval(tickSince, 5000);`
- `css/dossier.css:549-551 — body.no-motion .matchcut { display: none; /* a pure transition device — nothing to read statically */`
- `index.html:538 — <section class="scene matchcut" id="matchcut" aria-hidden="true">`
- `index.html:718-724 — <div class="bd-labels" aria-hidden="true"> ... <b>68.7M</b> ... <b>49.1M</b>`
- `brief.md:313 — "Each scene is a still end-state plate with all figures shown."`
- `brief.md:363 — "Live counters still run."`

**Suggested:** Start the live counters before the reduced-motion branch. Keep S06 text and S10 figures as real, visible text in every mode.

### BR-14 · §12 flashing / reduced motion; §5 easing · note · confirmed
The hero title scramble swaps random glyphs every animation frame for 620 ms. The glyphs include full blocks and are drawn at 128px. That is far more than three changes per second. The brief neither keeps nor removes it. The 120 ms hop the brief mentions is from the brand deck. No 120 ms timer exists in the code, and the reticle is driven by scroll. Under reduced motion, livePulse, blinkLight and nudge keep looping. The mirror seal uses back easing, which the brief bans. The REC blink, at about 0.9 Hz, is within the limit.

Evidence:
- `js/dossier.js:56-57 — var GLYPHS = "▚▞█▓▒░#@%&/\\<>*+=—0123..."; var SCRAMBLE_MS = 620;`
- `js/dossier.js:66-69 — i / final.length <= p ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];`
- `js/dossier.js:307 — { scale: 1, rotate: 0, ease: "back.out(1.7)", duration: 0.3 },`
- `css/dossier.css:120 — animation: recBlink 1.1s steps(1) infinite;`
- `css/style.css:1782 — animation: livePulse 1.2s ease infinite;`
- `css/style.css:3839 — animation: blinkLight 2s infinite; (also 4501, 1.6s)`
- `css/style.css:2215 — animation: nudge 1.6s ease-in-out infinite;`
- `css/style.css:2075-2084 and 4930-4934 — the reduced-motion blocks cover only .rv and .ix-pulse`
- `brief.md:320-321 — "No more than three flashes per second." / "The deck's 120 ms hop is too fast."`
- `brief.md:106 — "Use no elastic, back or bounce easing."`

**Suggested:** Add the scramble and the back.out seal to REMOVE. Stop all looping animations under no-motion.

### BR-15 · §5 'Never use red or blue as a page background' · note · corrected
The clear conflict with 'never use red or blue as a page background' is the full-half radial washes in the mirror scenes. .half-war uses --war-deep #2a0806 (dossier.css:252-256), and .half-build uses --build-deep #04211f (dossier.css:260-266, missed). The green card and panel fills (#0b2a1a at style.css:4418, #04140c at 4764) are off-brand fills the brief does not name. The amber and cyan washes fall under the existing REMOVE and CHANGE items, and the remaining items are effectively black.

Evidence:
- `css/dossier.css:252-256 — .half-war { background: radial-gradient(... var(--war-deep), var(--near-black) 70%) (--war-deep #2a0806 at dossier.css:15; full-bleed 100vw)`
- `css/dossier.css:323-327 — .mirror-scene.cost .half-build ... #241a05 (amber)`
- `css/dossier.css:464-469 — .mc-warm ... rgba(255, 176, 32, 0.16) (full-screen amber wash)`
- `css/style.css:2677-2681 — .hys-divider background: radial-gradient(... rgba(49, 208, 214, 0.05)`
- `css/style.css:187-188 — .live-spend border: 1px solid #1a0505; background: rgba(10, 0, 0, 0.5);`
- `js/main.js:711 — grd.addColorStop(0, "rgba(255,45,45,0.07)"); (also 720 "rgba(40,0,0,0.6)")`
- `css/style.css:4418 — .ix.ix-top5 background: #0b2a1a; css/style.css:4764 — .prio-panel background: #04140c; css/style.css:2829 — .ix.ix-sel background: #14110a;`
- `css/style.css:3314-3315 — .children-wrap border #101820; background: #03070b;`

**Suggested:** List these under REMOVE so no tinted wash survives.

### BR-16 · §5 Type / §3 CHANGE · note · confirmed
Most body copy is set in IBM Plex Mono, but the brand puts body copy in IBM Plex Sans. On the live page, 584 text elements use Mono and 32 use Sans. The editable letter and the share card set Mono directly in the CSS. The CHANGE list mentions only the display faces.

Evidence:
- `brief.md:85 — "IBM Plex Sans: body and values."`
- `css/style.css:136 — .hero-sub font-family: var(--fm);`
- `css/dossier.css:309 — .mh-desc font-family: var(--fm);`
- `css/style.css:4091 — .letter-body font-family: "IBM Plex Mono", monospace;`
- `css/style.css:1870 — #shareCard font-family: "IBM Plex Mono", monospace;`
- `var(--fm) is used 144× in css/style.css and 36× in css/dossier.css; var(--fb) 18× and 1×`

**Suggested:** Add to CHANGE: move body copy from Mono to Plex Sans, and keep Mono for labels, units and sources.

### BR-17 · §3 CHANGE Fonts / §11 'No sideways page scroll' · note · corrected
In Archivo Black, the hero counter at its 3.4rem minimum would be about 375px wide after 10 minutes, including letter-spacing. That is wider than both the 311px hero content box and the 375px screen. body overflow-x:hidden would clip it, or on some mobile browsers allow sideways panning. The display sizes need retuning for the wider face.

Evidence:
- `css/style.css:4632 — .live-spend.hero-centre b font-size: clamp(3.4rem, 12vw, 7rem);`
- `css/dossier.css:944 — .sb-year font-size: clamp(5rem, 20vw, 15rem);`
- `css/style.css:124 — .hero-title font-size: clamp(4rem, 14vw, 11rem);`
- `Measured at 100px: 'COST OF WAR' Anton 483px vs Archivo Black 778px; '$2.89T' 257 vs 372; '244,700' 320 vs 433`
- `Measured at 54.4px: '$54,927,600' Anton 266px vs Archivo Black 363px`
- `brief.md:307 — "No sideways page scroll."`

**Suggested:** Re-set every display clamp() for Archivo Black. Test the live counter at its widest value on a 343px column.

### BR-18 · §2 Keep credits vs §5 red meaning · note · confirmed
The StudioEX wordmark is set in cost red in the hero, the credits and the share card. Red is meant to mark what war takes, and it counts toward one red mark per screen.

Evidence:
- `css/style.css:4389-4391 — .hero-logo-wm b { color: var(--red);`
- `css/style.css:4409-4412 — .st-wordmark { ... color: var(--red);`
- `css/style.css:1888 — .sc-logo color: var(--red);`
- `brief.md:27 — "Keep the Blueprint × StudioEX credits."`
- `brief.md:76 — "Cost red #E8362B: what war takes."`

**Suggested:** Set the credit wordmarks in white.

### BR-19 · §14 Brand / scope · note · corrected
privacy.html and archive-original.html are both out of the brief's scope. privacy.html loads Bebas Neue and inherits cyan headings and links and an amber draft flag from style.css. archive-original.html is a tracked copy that loads Bebas Neue and contains about 20 distinct off-brand colours (9 in its :root alone).

Evidence:
- `privacy.html:9 — family=Bebas+Neue&family=IBM+Plex+Mono...`
- `css/style.css:4576 — .legal-wrap h2 color: var(--say);`
- `css/style.css:4590-4591 — .legal-wrap a { color: var(--say);`
- `css/style.css:4593-4594 — .legal-wrap .legal-flag { color: var(--amber);`
- `archive-original.html:9 — family=Bebas+Neue`

**Suggested:** Put privacy.html in scope, and say whether archive-original.html is excluded from the brand test.

### BR-21 · §3 CHANGE colours / §14 'diff shows no changed figures' · note · corrected
For the 12 spendBreakdown and violenceBreakdown rows, the colour sits on the same line as the figure, so a line diff will flag those figure lines when they are recoloured. issueData and displacementBreakdown colours are on their own lines. Colours are also hard-coded in main.js and dossier.js, and the flow canvas appends alpha hex, so issue colours must stay 6-digit hex literals, not CSS tokens.

Evidence:
- `js/data.js:32 — { label: "Personnel & pay", amtB: 1010, color: "#ff4d4d" },`
- `js/data.js:567 — { label: "Military expenditure", pct: 45, color: "#ffe14d" },`
- `js/main.js:756 — lg.addColorStop(1, n.color + "33");`
- `js/main.js:811 — fX.fillStyle = p.col + alpha;`
- `js/dossier.js:170-171 — place(344, ..., "#4f7cff"); place(246, ..., "#31d0d6");`
- `brief.md:352 — "A before-and-after diff shows no changed figures."`

**Suggested:** Check the figures by comparing values with a script, not lines. Or move colours into a separate palette map, since data.js only has to hold the figures.

### BR-22 · §5 Colours / §9 'Blue may return' · note · corrected
The ratios are correct. The filled CTAs (.btn-t and .continue-btn) use dark text on cyan, forced with !important, and the outline CTA uses cyan text. Filled brand-blue buttons would need dark (#0A0A0A) text. Red on #15151c (4.32:1) matters only if red text sits on that track. As a pie stroke it passes 3:1.

Evidence:
- `css/style.css:3027-3034 — .btn-t, .continue-btn ... { color: #00171c !important; background: var(--cta) !important;`
- `css/style.css:3045 — background: #6df3ff !important; (hover)`
- `js/main.js:286 — stroke="#15151c" (pie track)`
- `brief.md:77 — "Alternative blue #3C8FDE"`

**Suggested:** Specify #0A0A0A text on blue buttons and keep red off dark-grey panels for small text.

### BR-23 · §7 S10 · note · corrected
brief.md:202 asks for 589 marks (117.8M ÷ 200k). The code rounds each side separately (344 + 246) and draws 590.

Evidence:
- `brief.md:201 — "Visual: 589 still marks. Each is about 200,000 people."`
- `js/dossier.js:538-539 — var HOME = 344, // 68.7M ÷ 200k  FLED = 246; // 49.1M ÷ 200k`
- `js/dossier.js:170-171 — place(344, ...); place(246, ...);`

**Suggested:** Choose 589 with the remainder assigned to one side, or 590. State which in the brief.

### Found by the reviewer (not in the first pass)
- js/data.js:567-572 — violenceBreakdown gives the IEP $21.8T split a six-step yellow/amber ramp (#ffe14d to #6e4b05), drawn in violencePie (main.js:211-213). BR-03's colour list leaves it out, yet it is the largest amber use in the data.
- js/data.js:177 and :182 — displacementBreakdown colours: #00e5ff (cyan) for refugees and #4f7cff for internally displaced people. BR-03 cites only the dossier.js:592 copy.
- css/style.css:2094 — --gold: #ffb020 is amber under a second token name. It is used for the selected cause card (style.css:2826-2827) and at 2755 and 2800. A check by token name for --amber would miss it, just as cyan hides under five names.
- index.html:816 with css/style.css:756-758 — the 'allocated' tracker figure (#tiAlloc, class 'ti-val a') is always amber. It is a live figure in a colour the brief removes, separate from BR-05's remaining-budget traffic light.
- index.html:41, 46, 67, 77, 82, 84 — the hero screen alone shows about six red marks. They are the HUD 'CLASSIFIED' stamp and REC (dossier.css:96-110 var(--war)), two blinking rec-dots, the red StudioEX wordmark, the red 'COST OF WAR' title (dossier.css:211-212, with a red glow at style.css:133) and the red live counter (style.css:4634). That breaks 'Normally one red mark per screen' (brief.md:80) on the screen the brief keeps.
- css/dossier.css:260-266 (with :16) — .half-build fills a full mirror half with a teal radial wash (--build-deep #04211f). It is the cyan twin of .half-war's red wash and is missed from BR-15.

## Tools, Archive and backend

### MOD-1 · §2 letter moderation / §9 Archive · blocker · confirmed
Moderation can be bypassed today. The site runs in Phase 0, which is a direct anon insert because SUBMIT_URL is blank. The Phase 0 RLS policy accepts any row. Nothing stops an anon request from setting letter_approved = true. approved_letters() would then publish it. The 'moderator only' rule exists only in client comments and in the edge function, which is not used. Keeping this 'unchanged' keeps the hole, which breaks §9's 'only if ... it passes moderation'. This holds if the live database matches supabase-schema.sql.

Evidence:
- `js/config.js:28 — SUBMIT_URL: "",`
- `js/backend.js:88-90 — // Phase 0: direct insert with the anon key / await sb.from("submissions").insert({`
- `js/backend.js:99-100 — letter_approved intentionally omitted — it defaults to false and only a moderator may set it`
- `supabase-schema.sql:31-34 — create policy "anon can insert" ... to anon with check (true);`
- `supabase-schema.sql:129-130 — and letter_consent / and letter_approved`
- `supabase/functions/submit/index.ts:120 — letter_approved: false, // moderator-only; never set from a request`

**Suggested:** Raise this with the backend developer before launch. Options: switch to Phase 1, or make the insert policy check letter_approved = false, or revoke column insert. This is a backend change outside 'keep unchanged'.

### MOD-2 · §2 Supabase flow / §9 Redistribute 'Keep the ranking order' · blocker · confirmed
The redistribution tool allows up to 13 causes. The database and edge function accept only 1 to 5. In Phase 0 the insert error is never checked, so any submission with 6 or more causes is silently lost, opt-in letter included. The UI still says 'Added to the coalition' and adds 1 to the local count. The letter note asks for a 'top 5', but nothing caps the selection.

Evidence:
- `supabase-schema.sql:18 — constraint ranking_len   check (array_length(ranking, 1) between 1 and 5),`
- `supabase/functions/submit/index.ts:51-52 — if (!Array.isArray(ranking) || ranking.length < 1 || ranking.length > 5) return fail(400, "ranking-length");`
- `js/main.js:1727 — ranking: [...ranking],`
- `js/main.js:531 — ranking.push(i); // selection order = priority order`
- `js/backend.js:90 — await sb.from("submissions").insert({ (result not checked)`
- `js/backend.js:103 — live.count += 1;`
- `index.html:942-943 — Go back and rank your top / 5 priorities`
- `js/data.js issueData costs sum to 2900 vs DEFENCE 2887, so 13 of 14 causes fit`

**Suggested:** Decide: cap the selection at 5, or submit ranking.slice(0,5), or widen the constraint. Each one changes the 'unchanged' Supabase flow, so it needs approval.

### KEY-1 · §12 Full keyboard use / §9 Keep journey gate · blocker · confirmed
Most tools cannot be used by keyboard. The cause cards are divs with click handlers and no tabindex or key handling, so a keyboard user cannot pick a cause or unlock the gate. 'Read more' is a span. Both overlay 'Close' controls are spans, and there is no Escape key handling. The Archive's look-around and sheet opening are pointer only. Per-country globe counts are only in hover tooltips. The locked gate uses pointer-events only, so its blurred controls can still be reached by Tab.

Evidence:
- `js/main.js:481-483 — const card = document.createElement("div"); card.className = "ix";`
- `js/main.js:497 — card.addEventListener("click", (e) => {`
- `js/main.js:494 — <span class="ix-more">▾ Read more &amp; sources`
- `index.html:1245 — <span class="share-close" onclick="closeShare()">Close</span>`
- `index.html:1286-1288 — <span class="sc-close" onclick=`
- `js/room.js:396-417 — pointerdown / pointermove / pointerup only`
- `js/main.js:1553-1556 — .pointerLabel((d) => `<div class="globe-tip">...`
- `css/style.css:2938-2942 — .gated.locked .gated-content { ... pointer-events: none; user-select: none;`
- `grep: no keydown/keyup handlers in js/*.js`

**Suggested:** Make the cards buttons. Make the close controls buttons and add Escape. Use inert on locked content. Give the Archive a keyboard path to the letters, for example a list.

### ARC-2 · §3 / §15.1 / §2 deep links · decision · confirmed
'After the coalition' (§3) and 'move it to the end' (§15.1) are not the same spot. The disclaimer, closing line, credits and footer sit between them. Also, the coalition sits inside the locked journey gate. If the Archive goes inside the gate, it is blurred and unclickable until a cause is chosen. It must go after the gate closes at index.html:1102. Today #roomSection is above every pinned scene. After the move, its deep link lands below content that changes height after load.

Evidence:
- `index.html:1001 — id="coalitionSection"`
- `index.html:1100-1102 — three closing </div> for coalitionSection, gated-content, journeyGate`
- `css/style.css:2938-2942 — .gated.locked .gated-content { filter: blur(8px) ... pointer-events: none;`
- `js/dossier.js:794 — // the page grows as canvases/globe lazy-build — keep triggers honest`
- `js/room.js:419-420 — The room now sits directly under the title, so it must`
- `js/room.js:513 — The room now sits right at the fold`

**Suggested:** Name the exact slot: after #journeyGate and before the .disclaimer, or after the footer. Retest the #roomSection deep link after the move.

### SCR-1 · §9 vs §10 · decision · corrected
The code facts hold, but this is a wording ambiguity, not a real contradiction. Today the Archive and globe load, and the Archive pauses, on viewport triggers. That is what §10 asks for. §9's 'nothing may depend on scroll position' should say it means visual state, not lazy-loading or pausing off screen.

Evidence:
- `js/room.js:521 — if (section.getBoundingClientRect().top < window.innerHeight * 0.82) {`
- `js/room.js:527 — window.addEventListener("scroll", maybeBoot, { passive: true });`
- `js/room.js:491 — en.isIntersecting ? start() : stop();`
- `js/main.js:1891-1902 — new IntersectionObserver(... buildGlobe(); ... { rootMargin: "300px" }`

**Suggested:** Say that loading and pausing may use visibility, but tool state and content may not.

### SCR-2 · §9 / S13 'Stop scrubbing' · decision · confirmed
Several tool visuals still depend on scroll. The brief does not list them under CHANGE or REMOVE. (1) The global priority bars stay at 0 width until scrolled into view. (2) The Archive heading uses .rv, so it is invisible until revealed. (3) dossier.js changes the HUD file label per tool section on scroll. (4) dossier.js scrubs the chrome back in at #haveyoursay, which is the handover point where the brief says scrubbing stops. (5) The grid parallax, HUD progress and coords, and main.js's scroll bar run through the tools.

Evidence:
- `js/main.js:1410 — style="background:${issueData[t.i].color};width:0%"`
- `js/main.js:1414-1427 — const io = new IntersectionObserver(... b.style.width = b.dataset.w + "%"`
- `index.html:102 — <div class="chapter-num rv" style="color: var(--say)">`
- `css/style.css:79-81 — .rv { opacity: 0; transform: translateY(28px);`
- `js/dossier.js:213-216 — ["#haveyoursay", "FILE 03 · YOUR FILE"], ... ["#coalitionSection", "FILE 06 · THE COALITION"]`
- `js/dossier.js:650-653 — trigger: "#haveyoursay", start: "top 85%", end: "top 45%", scrub: true,`
- `js/dossier.js:248 — scrollTrigger: { start: 0, end: "max", scrub: true },`
- `js/main.js:892-899 — window.addEventListener("scroll", ... bar.style.height = pct * 100 + "%";`

**Suggested:** Add these to CHANGE. Render the priority bars at full width. Drop .rv from the Archive. Decide whether any HUD chrome returns after S13.

### CON-1 · §2 consent wording / §9 Letter · decision · confirmed
The letter consent promises 'Published without your name'. The generated letter writes the name the reader types into the body twice. The stored text is the letter's innerText. approved_letters() returns that text unchanged. Only a human moderator could keep the promise, and no editing step exists in code or docs. privacy.html also says 'We do not collect names'.

Evidence:
- `index.html:1073-1075 — Add my letter to <b>The Archive</b>, ... Published without your name or / email, and only after review.`
- `js/main.js:1208 — My name is ${name}.`
- `js/main.js:1228-1230 — Yours sincerely, ... ${name}`
- `js/main.js:1721-1723 — letterText = (document.getElementById("letterOutput")?.innerText || "")`
- `supabase-schema.sql:126 — select letter, country, age_band, created_at`
- `privacy.html:67 — We do not collect names, accounts, or precise location.`

**Suggested:** Decide whether the stored letter strips the name line, or whether the moderation step must redact it. Changing the wording is not allowed under §2.

### CON-2 · §2 Archive honesty rules / consent wording · decision · confirmed
The Archive copy says every letter written on the page is kept there. The consent says an unticked letter is never stored. The Archive CTA tells every reader 'yours among them', even if they did not opt in or are still awaiting review. Both lines break the honesty rules the brief says to keep.

Evidence:
- `index.html:106-108 — Every letter written on this page is kept here, one sheet for one / person`
- `index.html:1075-1076 — Leave unticked and your / letter is never stored.`
- `index.html:1108 — every letter written here, yours among them`
- `js/room.js:9-11 — A sheet is only READABLE if that letter was opted in by its author AND cleared by a moderator.`

**Suggested:** Get approval to correct this copy. As it stands, 'existing copy' and the honesty rules contradict each other.

### ARC-3 · §9 Archive 'reader's sheet can join the room, only if they opted in and it passes moderation' · decision · corrected
Once there are 150 or more participants, the room hangs one sheet per submission whether or not the person opted in. Only readable words need opt-in plus approval. Every sheet without an approved letter says 'chose not to share their letter', including pending and rejected ones. Below 150, the room shows a fixed number of sample sheets. The under-20-character drop applies only through the Phase 1 edge function, which is not active. Letters attach to sheets by index, not to a particular person.

Evidence:
- `js/room.js:463-465 — R.count = room.sample ? ... : Math.max(1, Math.min(MAX_SHEETS, real));`
- `supabase-schema.sql:148 — 'people',           (select count(*) from submissions),`
- `js/room.js:365-366 — This person took part but chose not to share their letter.`
- `supabase/functions/submit/index.ts:83 — if (text.length < 20) text = null; // ignore empty/stub letters`
- `index.html:133 — <div class="rd-l">people have written</div>`

**Suggested:** Confirm which rule is meant. The sheet joins for everyone. The words join only with opt-in and moderation. Fix the blank-sheet text to cover pending letters.

### ARC-4 · §2 Archive honesty rules · decision · confirmed
room.js has two honesty rules that disagree. Its header says sample sheets disappear the moment real letters exist. The code keeps sample mode until 150 people have taken part, whatever the letter count. In sample mode, a sheet carrying a real approved letter opens as 'Sample sheet · preview ... not a real participant'. The brief says keep the rules 'unchanged' without saying which version wins.

Evidence:
- `js/room.js:14-15 — They / are never presented as real people and they disappear the moment real letters exist.`
- `js/room.js:41 — var SAMPLE_THRESHOLD = 150;`
- `js/room.js:458 — room.sample = real < SAMPLE_THRESHOLD;`
- `js/room.js:286-292 — room.letters.forEach(function (L, k) { ... R.data[k].letter = L;`
- `js/room.js:357-364 — if (room.sample || !p || !p.letter) { ... not a real " + "participant.`

**Suggested:** Decide the rule. One fix: let sheets with approved letters open as real even in preview mode.

### ARC-5 · §4 sheet chain end / §9 Archive · decision · confirmed
The story ends on the reader's sheet hanging in the Archive. Under the honesty rules, the reader's own letter cannot appear there in the same session. The only source is approved_letters(), and approval is a later human step. The room also loads its data once at boot and is never refreshed after a submission.

Evidence:
- `js/room.js:10-11 — approved_letters() is the only source; there / is no client path to an unapproved letter.`
- `js/room.js:452-459 — loadData() ... room.letters = d.letters || []; (called once from boot)`
- `js/main.js:1760-1765 — submitCoalition refreshes coalition and globe only, not the room`
- `supabase-schema.sql:93-96 — MODERATION GATE. Nothing is publishable until a human approves it.`

**Suggested:** Define what the final 'hanging sheet' shows: for example a blank, unnamed sheet marked 'awaiting review', never the unapproved text.

### BE-1 · §2 Supabase flow / §9 Archive · decision · confirmed
The client assumes the 'THE ROOM' SQL block is deployed. It uses the letter, letter_consent and age_band columns and the approved_letters, room_stats and age_tally RPCs. If that block is missing, every Phase 0 insert fails silently and the room falls back to preview. The repo cannot show whether it is deployed. BACKEND.md does not mention the room block, letters or how to moderate. It still says the SQL creates 'three aggregate functions'. It also says the country graphs call priority_tally_by_country, but main.js never calls it.

Evidence:
- `supabase-schema.sql:85-86 — Run this block on an existing project; it is additive and safe to / re-run.`
- `js/backend.js:96-98 — age_band: d.age_band ?? null, letter: d.letter ?? null, letter_consent: !!d.letter_consent,`
- `js/backend.js:121-123 — sb.rpc("approved_letters", ...), sb.rpc("room_stats"), sb.rpc("age_tally")`
- `BACKEND.md:19 — creates the three aggregate functions the site reads.`
- `BACKEND.md:50-51 — Country / global priority graphs call `priority_tally` and `priority_tally_by_country`.`
- `js/backend.js:132 — window.__cowCountryTally = async function (country) { (no caller in main.js)`

**Suggested:** Ask the backend developer to confirm the live schema and the moderation process before phase 4.

### COA-1 · §15.4 / §2 data.js only home for figures · decision · confirmed
Open decision 4 misses some seeded instances. The seeded numbers are added on top of live data, not replaced by it, even though the backend is wired. data.js says they get replaced. Instances the brief misses: (a) a per-country hash 'nudge' that invents a different priority mix for each country; (b) the coalition progress bar, which fills from count/10000 with no label; (c) the globe tooltip, which calls seeded counts 'sign-ups'. No seeded number is labelled anywhere. SEED_COUNT lives in config.js and main.js, not data.js.

Evidence:
- `js/main.js:1328 — const SEED_COUNT = (window.COW_CONFIG && window.COW_CONFIG.SEED_COUNT) || 2847;`
- `js/config.js:22 — SEED_COUNT: 2847, // base number shown before/under real submissions`
- `js/main.js:1349 — count: SEED_COUNT + window.__cowLive.count,`
- `js/main.js:1392 — const nudge = ((h >> (i % 12)) & 7) * 4 - 12; // -12..+16, stable per country`
- `js/main.js:1646 — if (f) f.style.width = Math.min((count / 10000) * 100, 100) + "%";`
- `js/main.js:1435 — const out = Object.assign({}, seededCountrySignups);`
- `js/main.js:1555 — ${d.count.toLocaleString()} sign-ups`
- `js/main.js:1405 — What the coalition would fund first · globally`
- `js/main.js:1080 — What people in ${c[0]} would fund first`
- `js/data.js:729-731 — SEEDED PER-COUNTRY SIGN-UPS (placeholder until backend) ... Replaced by / live per-country counts once the backend is wired`

**Suggested:** Add the hash nudge, the bar fill and the globe tooltip to decision 4. Decide where SEED_COUNT lives.

### COA-2 · §9 'Your country: keep all logic' vs §15.4 · decision · confirmed
The country step's 'What people in [country] would fund first' panel is built only from seededPriorityWeights, the hash nudge and this browser's local submissions. It never reads live data. So 'keep all logic' in the country step conflicts with removing or labelling the seeded weights under decision 4.

Evidence:
- `js/main.js:1063 — const cTally = countryPriorityTally(c[0]);`
- `js/main.js:1384 — const local = getLocalSubs().filter((s) => s.country === name);`
- `js/main.js:1390 — return seededPriorityWeights`

**Suggested:** State that decision 4 overrides 'keep all logic' for this panel.

### COA-3 · §3 Archive move / §15.4 · decision · corrected
The coalition hides its number below 10,000 (seed included), while the Archive prints the exact real count. That already undercuts COALITION_REVEAL today. Moving the Archive straight after the coalition makes the clash obvious, but the move does not cause it.

Evidence:
- `js/main.js:1650 — const COALITION_REVEAL = 10000; // below this, a raw count reads as "few care"`
- `js/main.js:1659 — el.textContent = "A growing coalition";`
- `js/room.js:87 — if (el.people) el.people.textContent = people ? fmt(people) : "0";`
- `js/room.js:470-471 — PREVIEW · these are sample sheets, not real participants ... real so far`

**Suggested:** Settle decision 4 and decision 1 together.

### RED-1 · §9 Redistribute / §10 main.js owns tools · decision · confirmed
The current visual is a canvas (#flowC). A fixed-size red 'GLOBAL MILITARY BUDGET' disc drains as a pie wedge as causes are picked. Cause circles orbit it, with particles. The total is DEFENCE = 2887, so $2.89T. The sticky tracker bar also drains. Problems: (1) the circles are not true area against the disc, since each one is drawn at about 2.15 times its real share; (2) the canvas orders circles by the selection Set, so reorders with the up and down arrows do not show; (3) main.js calls fC.getContext at top level, so removing #flowC throws and stops all of main.js; (4) updateTracker and updateSummary have no null checks; (5) the canvas text is not DOM and uses 'Bebas Neue', which is never loaded and is not in the brief's font list.

Evidence:
- `js/data.js:8 — const DEFENCE = 2887; // $B`
- `js/main.js:662 — const bigR = Math.min(fW, fH) * 0.15;`
- `js/main.js:666-667 — const scale = Math.min(fW, fH) * 0.22; ... Math.sqrt(issueData[idx].cost / DEFENCE) * scale`
- `js/main.js:725 — fX.arc(cx, cy, bigR, -Math.PI / 2, -Math.PI / 2 + warPct * Math.PI * 2);`
- `js/main.js:663 — const arr = [...sel];`
- `js/main.js:959 — [ranking[p], ranking[q]] = [ranking[q], ranking[p]]; (sel untouched)`
- `js/main.js:637-638 — const fC = document.getElementById("flowC"), fX = fC.getContext("2d");`
- `js/main.js:573 — document.getElementById("tiRem").textContent = fmt(rem);`
- `js/main.js:745 — fX.font = `${Math.round(baseF * 1.9)}px 'Bebas Neue',sans-serif`;`
- `index.html:21 — family=Anton&family=Archivo...&family=IBM+Plex+Mono...&family=IBM+Plex+Sans`
- `index.html:831 — Watch the military budget in the centre drain as you go.`

**Suggested:** The sheet replaces #flowC, getNodes, drawFlow, spawnP and rszFlow, plus the tracker bar. Drive it from `ranking`, not `sel`. Guard main.js's top-level canvas lookup. Update the 'in the centre' copy.

### RND-1 · §10 Stop rendering when off screen / DPR cap 2 · decision · confirmed
Three main.js loops never stop. tickLiveSpend writes the DOM every frame forever. drawFlow redraws the whole flow canvas every frame from page load, even before the tools are near. The globe auto-rotates and is never paused. Only room.js pauses off screen. The flow canvas DPR is uncapped. The globe caps DPR only on mobile.

Evidence:
- `js/main.js:48 — requestAnimationFrame(tickLiveSpend);`
- `js/main.js:823 — requestAnimationFrame(drawFlow);`
- `js/main.js:1883 — drawFlow(); (called at load)`
- `js/main.js:1558 — controls.autoRotate = true;`
- `js/main.js:642 — const dpr = window.devicePixelRatio || 1;`
- `js/main.js:1564-1567 — if (mobile && globeInstance.renderer) ... setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));`
- `js/room.js:488-496 — IntersectionObserver ... start() : stop()`

**Suggested:** Keeping main.js as tool owner keeps these. Add visibility pauses (globe.gl has pause and resume calls). Cap DPR at 2.

### LET-1 · §9 Letter 'the editable letter is the sheet' · decision · confirmed
The letter is a contenteditable div. generateLetter() rewrites its whole innerHTML on any choice change: priorities, reorder, country, tax slider, name and title fields. Reader edits are lost without warning. A sheet that is both driven by state and freely editable conflicts with this model.

Evidence:
- `index.html:972-976 — class="letter-body" id="letterOutput" contenteditable="true"`
- `js/main.js:1234 — out.innerHTML = letter.replace(/\n/g, "<br>");`
- `js/main.js:951 — generateLetter(); (in renderPriorities)`
- `js/main.js:1099 — generateLetter(); (in showCountry)`
- `js/main.js:1145 — if (fromUser) generateLetter();`
- `index.html:951 — oninput="generateLetter()"`

**Suggested:** Decide if edits survive later choice changes. If they must, the letter needs a 'dirty' state.

### FIG-1 · §2 data.js only home for figures / §3 hard-coded figures · decision · confirmed
§3 lists hard-coded figures only in dossier.js. main.js and the interactive half of index.html also type figures directly. The letter's wording also drifts from data.js. It says 'This year, 673 million people went hungry', but data.js dates that figure to 2024. It says '272 million children', but data.js says 'children and youth'.

Evidence:
- `js/main.js:1210 — In 2025, the world spent $2.89 trillion on its militaries, the eleventh consecutive annual record.`
- `js/main.js:1214 — This year, 673 million people went hungry. 272 million children could not go to school. 117.8 million ... rose 19% to a record $119 billion.`
- `js/data.js:232 — 673 million people faced hunger in 2024.`
- `js/data.js:254 — 272 million children and youth are out of school`
- `js/main.js:398-414 — num: "244,700" ... "11,967" ... "1 in 6" ... "4.5M+" (duplicates humanData)`
- `js/main.js:309 — 38% of the 117.8 million people displaced ... about 45 million.`
- `js/main.js:619 — prompt.textContent = "$2.89T to redistribute";`
- `js/main.js:1269 — vs the world's $2.89T military budget`
- `js/main.js:1776 — const spend = selectedCountry ? `$${selectedCountry[2]}B` : "$2.89T";`
- `js/main.js:1839 — redirected the world's $2.89T military budget`
- `js/main.js:1077 — of the $2.89T global military total`
- `js/main.js:866 — In 2025, violence cost the world $21.8 trillion.`
- `index.html:807 — <div class="ti-val g" id="tiRem">$2.89T</div>`
- `index.html:827 — Spend the $2.89 trillion on the world instead`
- `index.html:898 — Every nation feeds the $2.89 trillion total.`

**Suggested:** Add these to the §3 list. The letter text is kept by §9, so rewording its dates needs approval.

### GLB-1 · §10 lazy / pin exact versions; §2 no scroll hijacking · decision · confirmed
globe.gl is lazy-loaded but not version-pinned, so it resolves to the latest release on every load. Its earth texture is also unversioned. Three.js is pinned at 0.160.0 in room.js. supabase-js is a @2 range. The globe also has wheel zoom on and on-page copy says 'scroll to zoom', so the wheel over a 56vh globe zooms instead of scrolling the page. room.js removed wheel capture for exactly this reason.

Evidence:
- `js/main.js:1518 — s.src = "https://cdn.jsdelivr.net/npm/globe.gl";`
- `js/main.js:1540 — "https://unpkg.com/three-globe/example/img/earth-night.jpg",`
- `js/room.js:31 — var THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";`
- `index.html:1296 — <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
- `js/main.js:1560 — controls.enableZoom = true;`
- `index.html:1018 — Each bar is a country's sign-ups. Drag to spin · scroll to zoom.`
- `js/room.js:419-421 — No wheel capture. ... it must / never trap the page scroll`

**Suggested:** Pin globe.gl and the texture to exact versions. Turn off wheel zoom or require a modifier key. Both change 'keep the globe' slightly.

### KEY-2 · §9 'Keep focus states' / §12 Visible focus states · decision · corrected
Four controls, not three, change only their border colour on focus: .field-inp, .country-select, .share-inp and .tax-select. Each also has outline:none. The rest holds. The letter body, tax slider and globe canvas have no visible focus indicator, there is no :focus-visible rule, and buttons rely on the browser default.

Evidence:
- `css/style.css:3100-3103 — .field-inp:focus, .country-select:focus, .share-inp:focus { border-color: var(--say);`
- `css/style.css:1730 — outline: none; (.letter-body)`
- `css/style.css:4090 / 4093-4094 — color: #1c1a17; ... .letter-body:focus { color: #1c1a17;`
- `css/style.css:4326-4333 — .tax-slider { ... outline: none;`
- `css/style.css:4491-4492 — .globe-wrap canvas { outline: none;`

**Suggested:** Reword as 'add visible focus states to every tool control'.

### RM-1 · §12 Honour prefers-reduced-motion and ?static=1 · decision · corrected
main.js never checks reduced motion or ?static=1. The flow particles, card bursts, globe auto-rotate and fly-to rings, width transitions and forced smooth scrolling all still run. The coalition count-up runs only at 10,000 or more, so it does not run today. CSS covers .rv and the card pulse for prefers-reduced-motion only, not for ?static=1.

Evidence:
- `js/main.js:798 — if (Math.random() < 0.03) spawnP(cx, cy, n.x, n.y, n.color);`
- `js/main.js:1667-1675 — count-up from SEED_COUNT over 1800 ms`
- `js/main.js:1558 — controls.autoRotate = true;`
- `js/main.js:1589 — globeInstance.pointOfView({ lat: c[0], lng: c[1], altitude: 1.7 }, 1400);`
- `js/main.js:968 — ?.scrollIntoView({ behavior: "smooth", block: "start" });`
- `index.html:779 — onclick="document.getElementById('haveyoursay').scrollIntoView({behavior:'smooth'})"`
- `js/room.js:32-35 — var reduce = ... prefers-reduced-motion ... || location.search.indexOf("static") > -1;`

**Suggested:** Add one shared reduce flag that main.js reads too.

### CON-3 · §2 consent wording · decision · confirmed
The share overlay collects an email and posts it to formsubmit.co with no consent box. privacy.html says email is taken only if the reader ticks the consent box. The coalition form also sends the email to formsubmit.co as well as Supabase. That is part of the 'Supabase flow' the brief says to keep.

Evidence:
- `index.html:1219-1227 — id="emailIn" ... onclick="submitEmail()" ... Keep me informed`
- `js/main.js:855 — fetch("https://formsubmit.co/ajax/greg@studioex.co", {`
- `js/main.js:1748 — fetch("https://formsubmit.co/ajax/greg@studioex.co", {`
- `privacy.html:47-48 — Your email address — <strong>only if you provide it and tick the / consent box</strong>`

**Suggested:** Confirm whether the share-overlay email capture stays as it is.

### ARC-1 · §3 CHANGE Archive / §15.1 · note · confirmed
The brief says 'Keep a small link near the top'. No such link exists. Today the Archive itself sits at the top, directly after the hero. The only Archive link is the 'Enter the archive' button at the bottom, after the coalition. The move is a swap: the Archive goes down, and a new top link must be added. The existing bottom CTA would end up next to the Archive.

Evidence:
- `index.html:100 — <div class="room-section" id="roomSection">`
- `index.html:158-173 — <nav class="itin rv"> links only #machine, #impact, #haveyoursay`
- `index.html:1104 — a way to (re)enter the artwork, which now lives`
- `index.html:1107 — <a class="room-cta-btn" href="#roomSection">▸ Enter the archive</a>`
- `index.html:1108 — every letter written here, yours among them`

**Suggested:** Reword as 'add a small link near the top (for example in the .itin nav)'. Remove or reword the bottom CTA when the Archive moves under it.

### SCR-3 · §9 Card / Nothing may depend on scroll · note · confirmed
The coalition thank-you copy tells the reader to scroll down for the card. The card is actually a modal overlay that opens by itself after 1.6 s. The thank-you also shows even if the backend rejected the submission.

Evidence:
- `index.html:1092-1093 — ✓ Added to the coalition. Your card is ready, scroll down to`
- `js/main.js:1766 — setTimeout(() => generateShareCard(), 1600);`
- `js/main.js:1811 — document.getElementById("scOverlay")?.classList.add("open");`
- `js/main.js:1739-1741 — if (window.__cowSubmit) { window.__cowSubmit(data, token); }`

**Suggested:** Fix the copy when connecting the handover. Await the submit result before confirming.

### MOB-1 · §11 Tap targets ≥ 44 px · note · confirmed
Several kept tool controls are much smaller than 44 px. The reorder and remove buttons are 1.55rem square, about 25 px. The letter toolbar buttons use 0.5rem text with 0.3rem padding. The link buttons and both overlay Close spans are small text.

Evidence:
- `css/style.css:4834-4836 — .prio-mv, .prio-rm { width: 1.55rem; height: 1.55rem;`
- `css/style.css:1707-1714 — .tool-btn { ... font-size: 0.5rem; ... padding: 0.3rem 0.75rem;`
- `css/style.css:4875-4885 — .link-btn { ... padding: 0.2rem 0.35rem;`

**Suggested:** Resize these during phase 4.

### PERF-1 · §10 Animate DOM with transform and opacity only · note · confirmed
Kept tools animate width and filter. This covers the tracker bar, country bars, priority bars, coalition bar and reveal bars, plus the gate's blur.

Evidence:
- `js/main.js:1094-1095 — el.style.transition = "width 1.3s cubic-bezier(.16,1,.3,1)"; el.style.width = el.dataset.w + "%";`
- `js/main.js:580 — bar.style.width = pct + "%";`
- `css/style.css:2933-2936 — .gated-content { transition: filter 0.7s, opacity 0.7s;`

**Suggested:** Say whether the rule covers kept tools or only new story code.

### PIN-1 · §2 Keep the interactive half unpinned · note · corrected
No GSAP pins exist in the interactive half. On desktop, three elements are CSS sticky: the tracker, the flow canvas column and the gate message. On phones the tracker is static, which leaves two. The brief does not say whether CSS sticky counts as 'pinned', and §10 treats sticky as a form of pinning.

Evidence:
- `js/dossier.js:31 — The interactive half is never pinned — the tools must stay usable.`
- `css/style.css:717-719 — .tracker { position: sticky; top: 0;`
- `css/style.css:2780-2782 — .redist-canvas-col { position: sticky; top: 70px;`
- `css/style.css:3993-3995 — .redist-canvas-col { position: sticky !important; top: 0 !important;`
- `css/style.css:2944-2946 — .gate-msg { position: sticky; top: 38vh;`

**Suggested:** Clarify that CSS sticky in the tools is allowed, or not.

### MOB-2 · §11 svh units, no address-bar jumps · note · corrected
The flow canvas formula includes innerHeight, but on portrait phones the 230 px cap always wins, so the address bar does not resize it. Address-bar jumps come from vh: the globe (56vh), the Archive (68vh) and the gate message top (38vh). Each resize also re-runs drawDotField and drawLives.

Evidence:
- `js/main.js:33-35 — window.addEventListener("resize", () => { rsz(); rszFlow();`
- `js/main.js:651 — const sz = Math.round(Math.min(availW, window.innerHeight * 0.82, cap));`
- `css/dossier.css:1232 — height: clamp(420px, 68vh, 720px);`
- `css/style.css:2946 — top: 38vh;`

**Suggested:** Use svh when the redistribution visual is replaced.

### Found by the reviewer (not in the first pass)
- js/data.js:231-374 holds 14 cause colours, including amber #f5a623, cyan #00e5ff, purple #b967ff and neon greens and pinks. They colour the cause cards (main.js:489), flow circles (main.js:681), priority bars (main.js:1069, 1410) and share-card rows (main.js:1793). §5's palette (red, blue and greys, 92/5/3) leaves no way to tell 14 causes apart, and §3 CHANGE names only #ff3b30, #31d0d6 and #ffb020. Other tool colours outside the palette: amber and green on the remaining figure (main.js:743), a green burst (main.js:532), a cyan globe atmosphere (main.js:1543) and green reward rings (main.js:1592).
- The Archive's findings call submissions letters. room.js:142-144 says 'Letters have come from N countries', but room_stats.countries counts every submission (supabase-schema.sql:149). room.js:149 says 'The first letter was written on', but first_at is the earliest submission (supabase-schema.sql:164). The default country 'Unknown' (main.js:1714) counts as a country in 'countries represented'. room.js:144 also prints an unsourced comparison, 'Every one of them spends more on its military than on this'. This clashes with §5 'Name the source' and §14 'Every figure traces to js/data.js'.
- room.js:86 shows 'letters in the archive' as room.letters.length. The request at room.js:75 limits that list to 600, so the figure under-reports once more than 600 letters are approved. room_stats.letters (supabase-schema.sql:150-151) has the true count but is not used.
- The privacy page the consent rows link to is unfinished. privacy.html:80-82 still has the placeholders '[SUPABASE — region, e.g. EU]' and '[MAILING TOOL]'. privacy.html:68 says Cloudflare Turnstile is in use, but TURNSTILE_SITE_KEY is blank (js/config.js:29). The page never names formsubmit.co, which receives emails (main.js:855, 1748). 'Keep consent wording unchanged' would keep all of this.
- More letter drift from data.js. main.js:1210 says 'the eleventh consecutive annual record', but data.js:47 says '11th consecutive year of growth'.

## Section 15 open decisions

### 15.2b · §15.2 / §8 / S06 · blocker · confirmed
§8 anchors every rung at one corner. It draws $2.89T at 524×327 inside the 1440×900 $21.81T frame, and S06 says all references stay. A smaller sheet anchored inside a bigger one reads as 'part of'. That breaks §15.2: 'never show one as part of the other'. The true-area comparison also sets PPP dollars with a multiplier against market-rate dollars, which implies a 7.55× ratio.

Evidence:
- `brief.md:231 — Use true area. Anchor all rungs at one corner.`
- `brief.md:243-244 — $2.89T | military | 524×327 ... / $21.81T | violence | 1440×900`
- `brief.md:170-171 — Camera: pull until the $2.89T sheet is small. / Visual: the $21.81T sheet fills the frame. All references stay.`
- `brief.md:378 — Until then, never show one as part of the other.`

**Suggested:** Decide before phase 3. Recommend showing $21.81T as a separate sheet beside the ladder, not around it, with a different-measure label. Otherwise the client must accept the nesting and approve a note.

### 15.4 · §15.4 · blocker · corrected
Point 5 should read: the per-country 'would fund first' list is built from the seed, a country-name hash and this browser's own localStorage votes. It never uses backend data, because __cowCountryTally is never called. Point 1 is not something the brief got wrong. The relevant issue is that SEED_COUNT sits in config.js, which conflicts with §2 ('js/data.js stays the only home for figures'). All other points hold.

Evidence:
- `js/config.js:20-22 — SUPABASE_URL: "https://hvxcttvulzfnlbnlqjml.supabase.co" ... SEED_COUNT: 2847,`
- `js/main.js:1328 — const SEED_COUNT = (window.COW_CONFIG && window.COW_CONFIG.SEED_COUNT) || 2847;`
- `js/main.js:1349 — count: SEED_COUNT + window.__cowLive.count,`
- `js/main.js:1646 — f.style.width = Math.min((count / 10000) * 100, 100) + "%";`
- `js/main.js:1650 — const COALITION_REVEAL = 10000;`
- `js/data.js:732-742 — seededCountrySignups (42 entries, sum 3,160)`
- `index.html:1018 — Each bar is a country's sign-ups.`
- `js/main.js:1390-1392 — return seededPriorityWeights .map((w, i) => { const nudge = ((h >> (i % 12)) & 7) * 4 - 12;`
- `js/main.js:1080 — What people in ${c[0]} would fund first`
- `js/main.js:1405 — What the coalition would fund first · globally`
- `js/backend.js:132 — window.__cowCountryTally = async function (country) {  (no caller in js/main.js)`
- `js/main.js:1803-1806 — count < COALITION_REVEAL ? `join a\ngrowing\ncoalition` : `${count.toLocaleString()}\npeople\nhave chosen``
- `js/room.js:85-87 — var people = s.people || 0; ... el.people.textContent = people ? fmt(people) : "0";`

**Suggested:** Recommend removing them before launch. Set SEED_COUNT to 0, which BACKEND.md:43-45 already allows. Drop seededCountrySignups and seededPriorityWeights. Keep 'A growing coalition' until real numbers reach the threshold. Wire __cowCountryTally for the per-country list. Ask: 'May we remove all seeded coalition numbers before launch?'

### 15.4b · §15.4 / §2 · blocker · confirmed
§2 keeps the disclaimer unchanged. The disclaimer says no figure was invented. The seeded coalition values are invented numbers shown as participation. Keeping both makes the disclaimer false. Only removing the seeds fixes this. A label does not.

Evidence:
- `index.html:1121-1122 — We have not invented or inflated any figure; all data was verified against primary sources in June 2026.`
- `brief.md:26 — Keep every source link, the methodology and the disclaimer.`
- `js/data.js:745-747 — A plausible global distribution of how people prioritise the 14 issues ... Replaced by live data once the backend is wired`

**Suggested:** Remove the seeds, as in 15.4. The disclaimer can then stay word for word.

### 15.1 · §15.1 · decision · corrected
The brief already moves the Archive (§3 CHANGE, §15.1), so the scene-map clash is handled for the Archive. Two gaps remain. The brief does not say this reverses the 21 Jul 2026 'per direction' choice to make the Archive the hook (commit 3c2783f). And the contents nav (index.html:158) also sits between #hero and #machine, which the brief never mentions, so the S00→S01 hard cut still has an element in the way.

Evidence:
- `index.html:52 — <section class="hero" id="hero">`
- `index.html:100 — <div class="room-section" id="roomSection">`
- `index.html:158 — <nav class="itin rv">`
- `index.html:176 — <div class="section" id="machine">`
- `git 3c2783f (21 Jul 2026) — "Moved the full Room section up ... directly under the title, before the itinerary and the whole argument, as the hook."`
- `index.html:1104-1107 — <!-- ... the artwork, which now lives at the top of the page --> ... <a class="room-cta-btn" href="#roomSection">▸ Enter the archive</a>`
- `js/room.js:521 — if (section.getBoundingClientRect().top < window.innerHeight * 0.82) {`
- `brief.md:127-130 — S00 ... Transition: hard cut into the locked line. / S01 ... Trigger: #machine top.`

**Suggested:** Recommend the move. Ask the client: 'In July you moved the Archive under the title as the hook. The new story needs the title to cut straight into Chapter 01. Do you approve moving the Archive after the coalition, with a small link near the top?'

### 15.2 · §15.2 · decision · confirmed
The brief is right that violenceBreakdown gives military 45% of $21.81T, about $9.81T. But it misses that data.js contradicts itself. Line 85 says military is $9.5T of the model. IEP's current report (GPI 2026) gives military $9,452B, 43.3% of the total. The 45% share comes from GPI 2025 (2024 data: $9T of $19.97T). The IEP model explains the gap with SIPRI. It uses constant 2025 PPP dollars, and it adds a multiplier of 1 to direct costs. Military is $4,726B direct plus a $4,726B multiplier. SIPRI's $2,887B uses market exchange rates and has no multiplier. These are different measures, not an error. Related point: the 10.5% (S06) and 2.5% (S01) are shares of different GDP bases. 21.81/0.105 is about $208T of PPP GDP. 2,887/0.025 is about $115T of market GDP. data.js worldGDP 110000 would make $21.81T 19.8% of GDP.

Evidence:
- `js/data.js:566-567 — const violenceBreakdown = [ { label: "Military expenditure", pct: 45,`
- `js/data.js:85 — Military expenditure alone accounts for $9.5T of the model`
- `js/data.js:19-21 — worldGDP: 110000, // $B ... violencePctGDP: 10.5`
- `DATA-SOURCES.md:75 — Military 45% · internal security 29% · private security 8% · homicide 6% · suicide 4%`
- `GPI 2026 report p.50 (PDF p.52), Fig 3.1 — Military expenditure 43.3% · Internal security expenditure 29.1% · Private security 7% · Homicide 5.3% · Suicide 3.6% · Veteran affairs 3.4% · Other 8.3% — https://www.visionofhumanity.org/wp-content/uploads/2026/06/Global-Peace-Index-2026-Report.pdf`
- `GPI 2026 Table 3.1 (PDF p.53) — Military expenditure  4,726  0  4,726  9,452`
- `GPI 2026 p.58 (PDF p.60) — The methodology uses constant prices purchasing power parity (PPP) international dollars`
- `GPI 2026 p.59 (PDF p.61) — This study assumes that the multiplier is one`
- `https://www.visionofhumanity.org/economic-impact-of-violence/ (GPI 2025 page) — military expenditure $9 trillion, 45% of the total; $19.97T PPP`

**Suggested:** Answer: IEP and SIPRI measure different things. Never nest, subtract or divide one by the other. Label $21.81T as 'PPP, includes IEP multiplier'. Do not set 2.5% and 10.5% side by side as if they share a base. For violenceBreakdown, either drop it from the story or update it to the GPI 2026 shares. An update changes figures, so it needs client sign-off.

### 15.2c · §15.2 · decision · corrected
The 8% 'Armed conflict, terrorism & losses' slice is the GPI 2025 residual after the five named components. Matching it to GPI 2026's 'Other 8.3%' mixes two editions. In GPI 2026 that residual would be 11.7% (veteran affairs 3.4% plus other 8.3%). The core point holds: conflict deaths, GDP losses, refugees/IDPs and terrorism total about $813B (about 3.7%), so the label misdescribes the slice.

Evidence:
- `index.html:271 — What the $21.8T is made of · by component`
- `js/main.js:209-216 — buildDonut("violencePie", "violenceLegend", violenceBreakdown, "pct", "$21.8T",`
- `index.html:566-569 — military and internal-security spending, homicide, and the direct losses of armed conflict. The pie in Chapter 01 shows its make-up.`
- `index.html:231-233 — $2.89T we choose to spend ... ↔ ... $21.8T it actually costs`
- `js/data.js:572 — { label: "Armed conflict, terrorism & losses", pct: 8,`
- `GPI 2026 Table 3.1 — GDP losses 368 · Refugees and IDPs 379 · Conflict deaths 60.4 · Terrorism 5.2 (of ~21,805 total)`

**Suggested:** Ask: does violenceBreakdown appear in the new story at all? If not, the Chapter 02 intro line at index.html:568-569 must change, and that copy change needs approval. If it stays, relabel the 8% slice (needs approval).

### 15.3 · §15.3 · decision · confirmed
The brief is accurate. data.js calls the split indicative and modelled. The page heads it 'Where the $2.89T goes · by sector' and links SIPRI 2026, ICAN and SIPRI arms transfers. The word 'indicative' appears nowhere on the page. Missed points: DATA-SOURCES.md has no row for this split, though it claims to list every figure on the site. The legend prints the modelled values as exact money ($1.01T, $780B, $578B, $260B, $140B, $119B). Only $119B nuclear and the $2,887B total are sourced.

Evidence:
- `js/data.js:27-30 — The category split is indicative, modelled on typical national defence-budget compositions ... since SIPRI does not publish one global category breakdown.`
- `index.html:242 — <div class="viz-h">Where the $2.89T goes · by sector</div>`
- `index.html:247-265 — SIPRI 2026 ↗ ... ICAN nuclear 2026 ↗ ... SIPRI arms 2026 ↗`
- `js/main.js:148-149 — const amtTxt = valueKey === "pct" ? ... : fmt(s[valueKey]);`
- `DATA-SOURCES.md:3 — Every figure on the site, with its primary source.`
- `grep 'indicative' index.html js/main.js — only the tax note (main.js:1149) on the page`

**Suggested:** Proposed label: 'Indicative split, modelled on typical national defence budgets. SIPRI publishes the world total only. Nuclear: ICAN.' Keep the SIPRI link for the total. Drop the arms-transfers link from this graphic. Add a DATA-SOURCES row. Ask the client to confirm the wording.

### 15.5 · §15.5 · decision · confirmed
The brief is accurate, and the sentence is not supportable. From data.js, nuclear spending is 3,768 × 31,536,000 = $118.83B a year, or $119B stored. Four months is $39.6B to $39.7B. OCHA's 2026 numbers: 239M people in need, 135M targeted for $33B, and 87M prioritised for $23B. OCHA gives no cost for reaching all 239M. Scaling $33B up to 240M gives about $58.7B, roughly 5.9 months of nuclear spending. 'Four months' is more than the $33B ask, yet that ask covers only 135M. Related points: UN News says the 2025 appeal got $12B. It does not say that was the whole humanitarian system, so 'entire humanitarian system' overstates. I did not verify total system funding. data.js and the page use 240 where OCHA says 239, and DATA-SOURCES says '240M+'. 135M is in data.js but never shown. The bar widths 27.7 and 10.1 are ratios hard-coded in HTML, not stored in data.js.

Evidence:
- `index.html:703-707 — The world's entire humanitarian system received $12 billion last year ... Reaching all 240 million people in need costs about four months of nuclear-arsenal budgets.`
- `js/data.js:13 — const NUKE_PER_SECOND = 3768; // ICAN 2026`
- `js/data.js:165-168 — inNeed: 240 ... appeal: 33 ... received2025: 12 ... targetPeople: 135,`
- `DATA-SOURCES.md:38 — People needing humanitarian aid | 240M+`
- `index.html:672 — data-w="27.7"; index.html:685 — data-w="10.1"`
- `UN News 8 Dec 2025 — $33B for 135 million people; $23B for 87 million; 2025 appeal 'received only $12 billion – the lowest funding in a decade' — https://news.un.org/en/story/2025/12/1166526`
- `Concern 8 Dec 2025 — '239 million people were in need'; 'target 135 million people at a cost of $33 billion' — https://www.concern.net/press-releases/un-humanitarian-overview-reveals-millions-people-risk-being-left-behind-2026`

**Suggested:** Cut the 'four months' sentence. If a line is needed, use only data.js figures and no ratio, for example 'The 2026 appeal asks $33B to reach 135 million of the 240 million people in need.' Also soften 'entire humanitarian system' to 'the UN appeal'. Both are copy changes and need approval.

### 15.5b · §15.5 / S11 · decision · corrected
The S11 fill (a $33B 2026 outline filled to $12B of 2025 receipts) suggests about 36% funding, which is false. But the site already makes this conflation. The gap title at index.html:663 reads 'what was asked, what arrived', and the letter at main.js:1214 prints 'received barely a third of what it asked for'. S11 would inherit the ratio rather than print a new one. The fix should cover all three places.

Evidence:
- `brief.md:210 — Visual: the old ladder returns small. An outline for $33B fills to $12B.`
- `brief.md:25 — Do not print any new ratio or comparison.`
- `index.html:667 — UN humanitarian appeal 2026 <span>$33B asked</span>`
- `index.html:679-680 — What 2025's appeal received <span>$12B · lowest in a decade</span>`
- `GHO 2025 asked $47.4B for ~190M people (search results, e.g. https://nairametrics.com/2024/12/05/un-seeks-47-billion-in-aid-for-2025-as-funding-challenges-persist-amid-growing-crises/)`

**Suggested:** Show $33B (2026 ask) and $12B (2025 received) as two separate sheets, each labelled with its year, with no fill.

### 15.7 · §15.7 · decision · confirmed
The brief is accurate. The lives scene pins for 1.6 screens. It shows 0 points at first. One glowing point appears at 4% progress. That single point holds only until about 9.6% progress, under a tenth of a screen. Then points flood in on a power-5 curve to 244,700. Each point shrinks from 5.5px to 1px, and the code says this shrinking is the argument. A counter rises with the points. Its label changes from 'one person killed...' to 'still countable', 'you have already stopped counting', 'every point is one person who wanted to live', and finally 'in a single year'. The since-opening counter ticks every 5 seconds. The no-motion mode already shows the full field at rest with 244,700 and 'in a single year'. The brief's change removes the shrinking points and the four labels too, not only the flood.

Evidence:
- `js/dossier.js:664-669 — It opens on a SINGLE point of light and holds there ... then the field floods ... so a person visibly degrades into a pixel`
- `js/dossier.js:760-763 — if (p < 0.04) return 0; return Math.max(1, Math.floor(LIVES * Math.pow(p, 5)));`
- `js/dossier.js:768 — end: px(1.6),`
- `js/dossier.js:721 — var r = Math.max(0.5, 5.5 * (1 - Math.min(i / 2200, 1)));`
- `js/dossier.js:741-746 — "still countable" ... "you have already stopped counting" ... "every point is one person who wanted to live"`
- `js/dossier.js:775 — countEl.textContent = n.toLocaleString();`
- `js/dossier.js:790 — setInterval(tickSince, 5000);`
- `js/dossier.js:126-131 — fillRect(...) ... lcnt.textContent = lt.toLocaleString(); ... "in a single year"`
- `index.html:755 — <div class="lv-count" id="livesCount">1</div>`

**Suggested:** Ask Blueprint: 'Today one point holds briefly, then 244,700 flood in while a counter rises, the labels change, and each point shrinks to a pixel. We propose one point held longer, then the full field at rest in one slow fade, with no counter, no shrinking and no changing labels. Do you approve?'

### 15.8 · §15.8 · decision · confirmed
The brief is accurate that the scans are missing. There are no photos in the repo at all. assets/ holds one file, the Blueprint logo, used twice. The only photo-like image is the globe's night-earth texture. It loads from unpkg with no version pinned, and I did not check its licence. The grain effect is an SVG noise data URI. The 'nine documentary photos' are not in the repo, and the brief does not say where they are. The motion language asks for photo collage, but §10 says the story must work without photos.

Evidence:
- `ls assets/ — blueprint-logo-white.png (49,218 bytes), the only image file in the repo`
- `index.html:66 — <img src="assets/blueprint-logo-white.png" alt="Blueprint" />`
- `index.html:1138 — src="assets/blueprint-logo-white.png"`
- `js/main.js:1539-1541 — .globeImageUrl( "https://unpkg.com/three-globe/example/img/earth-night.jpg",`
- `css/dossier.css:56 — background-image: url("data:image/svg+xml,...feTurbulence...`
- `brief.md:102-103 — Collage: photo, data and type layered. / Grounded: real imagery only.`
- `brief.md:293 — The story must still work with no photos.`

**Suggested:** Build photo-free first. Ask the client: 'Please send the nine photos and the Blueprint scans, with who holds each licence.' Also pin and check the licence of the globe texture.

### 15.10 · §15.10 · decision · confirmed
'12 June 2026' matches DATA-SOURCES.md. data.js and the disclaimer say only 'June 2026', and the README gives no date. Data was added after 12 June, though. On 17 June came the hunger fix and spendBreakdown. On 18 June came violenceBreakdown and seededPriorityWeights. On 20 June came seededCountrySignups. So the '12 June' date does not cover them. SIPRI matches data.js in full. That includes $2,887B, +2.9% real, the 11th consecutive rise, 2.5% of GDP (highest since 2009), US $954B −7.5% and Europe $864B +14%. All top-10 countries match too. IEP figures $21.81T and 10.5% match GPI 2026, which came out by 11 June 2026. The per-person figure is $2,657, not $2,650. The breakdown shares are from GPI 2025. The cited IEP link now shows GPI 2025 numbers ($19.97T, 11.6%, $2,455). OCHA says 239M in need, not 240M+. Newer than the data: the UN children and armed conflict report dated 16 June 2026 covers 2025, while the site cites the 2025 report on 2024. I did not verify FAO SOFI 2026. The next OCHA overview (GHO 2027) is due in December 2026.

Evidence:
- `DATA-SOURCES.md:3 — Last full verification: **12 June 2026**.`
- `js/data.js:3 — Last full verification: June 2026.`
- `index.html:1122 — verified against primary sources in June 2026.`
- `git log — 028bca3 2026-06-17; c3fc31d 2026-06-18 (adds violenceBreakdown, seededPriorityWeights); 4e5db8f 2026-06-20 (adds seededCountrySignups)`
- `js/data.js:8 — const DEFENCE = 2887;`
- `SIPRI press release 27 Apr 2026 — $2887 billion, +2.9%, 11th year of consecutive rises, 2.5% highest since 2009, USA $954B −7.5%, Europe $864B +14% — https://www.sipri.org/media/press-release/2026/global-military-spending-rise-continues-european-and-asian-expenditures-surge`
- `SIPRI fact sheet Apr 2026 — 'the 11th consecutive year of growth' — https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025`
- `index.html:218 — IEP GPI 2026 ↗ (links to visionofhumanity.org/economic-impact-of-violence/, which shows GPI 2025: $19.97T, 11.6%, $2,455)`
- `The Star, 11 Jun 2026, reports GPI 2026 released — https://the-star.co.ke/news/2026-06-11-report-flags-debt-security-risks-as-kenya-enters-election-period`
- `js/data.js:207 — url: "https://news.un.org/en/story/2025/06/1164646" (2025 report); newer A/80/723–S/2026/357 dated 16 Jun 2026 — https://childrenandarmedconflict.un.org/sites/default/files/2026-06/A_80_723--S_2026_357-EN.pdf`

**Suggested:** Recommend a targeted refresh before launch. Update violenceBreakdown to GPI 2026, or drop it. Point the IEP link to the GPI 2026 report. Check the children-and-armed-conflict figures against the 2026 report and check FAO SOFI 2026. Fix 240M+ to 239M. Re-date DATA-SOURCES. If launch is after early December, add GHO 2027. Every change needs client sign-off under §2.

### 15.10b · §15.10 / S01 · decision · confirmed
The Chapter 01 intro, which S01 keeps, says 'eleventh straight record year'. The brief's S01 data and DATA-SOURCES say the same. SIPRI says '11th consecutive year of growth', and calls only 2025 'the highest spending level ever recorded'. A rise is not always a record. SIPRI called 2017 the highest since the Cold War ended, so 2017 was not an all-time record. data.js:47 has the accurate wording.

Evidence:
- `index.html:180 — 2025 was the eleventh straight record year.`
- `DATA-SOURCES.md:10 — 2.5% of GDP; 11th record year`
- `brief.md:136 — Data: $2.89T, 2.5% of world output, eleventh record year, US $954B, Europe +14%.`
- `js/data.js:47 — World military expenditure in 2025, the 11th consecutive year of growth`
- `SIPRI 2017 data (2018 release): '$1739 billion in 2017 ... highest level since the end of the cold war' — https://sipri.org/publications/2018/sipri-fact-sheets/trends-world-military-expenditure-2017 ; https://www.aljazeera.com/news/2018/05/china-saudi-arabia-top-list-military-spending-180502060524362.html`

**Suggested:** Use the data.js:47 wording, '11th consecutive year of growth', in the intro and in the S01 data line. This is a copy change and needs approval.

### 15.1b · §15.1 / §3 · note · corrected
The two wordings are compatible, but neither is precise. Neither says whether the Archive goes straight after the coalition or after the methodology, disclaimer, closing line, credits and sources footer. They are not strictly contradictory.

Evidence:
- `brief.md:53 — Archive: move it after the coalition. Keep a small link near the top.`
- `brief.md:377 — 1. Archive position. Default: move it to the end, with a small link near the top.`
- `index.html:1106 — <div class="room-cta">`
- `index.html:1114 — <summary class="disc-title">Methodology &amp; disclaimer ▾</summary>`
- `index.html:1128 — <div class="closing-line">`

**Suggested:** Put it straight after the coalition, where the 'Enter the archive' link is now (index.html:1106), and before the methodology. Confirm with the client.

### 15.6 · §15.6 · note · corrected
All points hold except one. data.js:22 stores violencePerPerson: 2650 with no 'about'. The 'about' qualifier appears only in the prose strings at data.js:83 (unused machineData) and index.html:213.

Evidence:
- `index.html:80 — Every second, violence costs humanity $691,590.`
- `index.html:86-89 — Since you opened this file, the world has spent ... <b id="liveSpend">$0</b> ... on its militaries`
- `js/main.js:45 — const spent = ((Date.now() - pageOpened) / 1000) * MIL_PER_SECOND;`
- `index.html:210-213 — <div class="mh-fig build">$21.8T</div> ... about <b>$2,650 taken from every person alive</b>.`
- `js/data.js:12 — const VIOLENCE_PER_SECOND = 691590; (no use in js/*.js or index.html)`
- `js/data.js:22 — violencePerPerson: 2650, // $ per person alive (IEP GPI 2026)`
- `GPI 2026 p.3 (PDF p.5) — or US$2,657 per person`

**Suggested:** Fix the brand deck only. In the rebuild, read both values from data.js. Ask if 'about $2,650' stays, since IEP says $2,657. Changing it is a figure change.

### 15.9 · §15.9 · note · confirmed
There is no sound in the code. There are no audio files, no <audio> or <video> tags, and no AudioContext. The only match for 'sound' is a line of copy.

Evidence:
- `grep 'audio|sound|AudioContext|.mp3|<video' index.html js css — only js/data.js:198 — It is the sound outside.`
- `find (excluding .git) — no .mp3/.wav/.ogg/.m4a/.mp4/.webm files`

**Suggested:** Confirm: no sound.

### Found by the reviewer (not in the first pass)
- js/main.js:1210: the letter template the reader sends says 'In 2025, the world spent $2.89 trillion on its militaries, the eleventh consecutive annual record'. This is the same 'record' vs 'consecutive growth' error as 15.10b, inside a tool the brief keeps unchanged.
- js/main.js:1214 and index.html:663: the letter says 'The UN's humanitarian appeal received barely a third of what it asked for'. The gap title reads 'what was asked, what arrived'. Both already set 2025 receipts ($12B) against the 2026 ask ($33B), which is about 36%. This is the 15.5b conflation, and it is already printed as a ratio on the live site.
- index.html:106-107 ('Every letter written on this page is kept here') and index.html:1108 ('every letter written here, yours among them') contradict the opt-in plus moderation rule. That rule is in index.html:97-98 and brief §9 ('only if they opted in and it passes moderation'). The copy overpromises, and it matters when the Archive moves after the coalition (open decision 1).
- js/dossier.js:742 with :761 and :776-777: for scroll progress below 4%, the lives counter shows '0' while the label reads 'one person killed in armed conflict', because livesLabel returns that for n<=1, including 0. The HTML's initial '1' (index.html:755) is reset to '0' at dossier.js:750. This affects S12's 'Hold one point of light' and open decision 7.
- js/data.js:41-90: machineData is never referenced by any script. The '$9.5T' line (data.js:85) and the '$2,650' sum (data.js:83) never reach the page. The 15.2 self-contradiction lives only in dead data, while the donut (45%) is the version readers see.
