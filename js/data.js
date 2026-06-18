/* ═══════════════════════════════════════════════════════════════════
   THE COST OF WAR — DATA LAYER
   Every figure is sourced. Last full verification: June 2026.
   See DATA-SOURCES.md for the audit trail.
   ═══════════════════════════════════════════════════════════════════ */

// The redistribution pot: world military expenditure 2025 (SIPRI, April 2026)
const DEFENCE = 2887; // $B

// Live-rate constants (derived)
const MIL_PER_SECOND = 91546; // $2,887B / 31,536,000 s
const VIOLENCE_PER_SECOND = 691590; // $21.81T / 31,536,000 s
const NUKE_PER_SECOND = 3768; // ICAN 2026
const DEATHS_PER_YEAR = 244700; // ACLED, Dec 2024–Nov 2025
const SECONDS_PER_DEATH = 31536000 / DEATHS_PER_YEAR; // ≈ 129 s

/* ── GLOBAL CONTEXT (for GDP-share visualisations) ──────────────── */
const globalContext = {
  worldGDP: 110000, // $B, approx world GDP 2025 (IMF, ~$110T)
  milPctGDP: 2.5, // % of global GDP spent on militaries (SIPRI 2026)
  violencePctGDP: 10.5, // % of global GDP consumed by violence (IEP GPI 2026)
  violencePerPerson: 2650, // $ per person alive (IEP GPI 2026)
  armsTradeGrowth: 9.2, // % growth in major-arms transfers 2021-25 (SIPRI)
};

/* ── MILITARY SPEND BY CATEGORY ($2,887B) ──────────────────────────
   The total and the nuclear figure are precise (SIPRI / ICAN). The
   category split is indicative, modelled on typical national
   defence-budget compositions (personnel / operations / procurement /
   R&D), since SIPRI does not publish one global category breakdown. */
const spendBreakdown = [
  { label: "Personnel & pay", amtB: 1010, color: "#ff2d2d" },
  { label: "Operations & upkeep", amtB: 780, color: "#ff5a36" },
  { label: "Arms & equipment", amtB: 578, color: "#f5852a" },
  { label: "Research & development", amtB: 260, color: "#f5a623" },
  { label: "Bases & infrastructure", amtB: 140, color: "#9c4a1a" },
  { label: "Nuclear forces", amtB: 119, color: "#ffd23f" },
];

/* ── CHAPTER 01 · THE MACHINE — direct military spending ─────────── */
const machineData = [
  {
    tag: "Direct Military",
    amt: "$2.89T",
    amtB: 2887,
    name: "Global Military Spending",
    sum: "World military expenditure in 2025, the 11th consecutive year of growth, now 2.5% of global GDP, the highest burden since 2009.",
    detail:
      "The US spent $954B (down 7.5%, yet still a third of the world total). Europe surged 14% to $864B as rearmament accelerated: Germany hit $114B, up 24%, crossing 2% of GDP for the first time since 1990. China spent $336B, up 7.4%. Russia spent $190B, 7.5% of its GDP. Ukraine spent $84B: 40% of everything its economy produces.",
    pct: 100,
    src: "SIPRI Trends in World Military Expenditure 2025 (April 2026)",
    url: "https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-world-military-expenditure-2025",
  },
  {
    tag: "Weapons of Mass Destruction",
    amt: "$119B",
    amtB: 119,
    name: "Nuclear Arsenals",
    sum: "The nine nuclear states spent a record $119B in 2025, $3,768 every second, up 19% in a single year, the largest rise ever recorded.",
    detail:
      "The United States spent $69.2B, more than all eight other nuclear-armed states combined. China spent $13.5B; the UK ($12.6B) overtook Russia ($9.5B). Roughly 12,200 warheads remain in existence. Every nuclear-armed state is currently modernising or expanding its arsenal.",
    pct: 90,
    src: "ICAN · Premeditated: 2025 Global Nuclear Weapons Spending (June 2026)",
    url: "https://www.icanw.org/premeditated_2025_global_nuclear_weapons_spending",
  },
  {
    tag: "Arms Trade",
    amt: "+9.2%",
    amtB: 120,
    name: "The Global Arms Trade",
    sum: "International transfers of major arms grew 9.2% in 2021–25, the biggest jump in a decade. European imports more than trebled.",
    detail:
      "The United States now supplies 42% of all global arms exports, up 27% on the previous period. Ukraine became the world's largest arms importer, taking 9.7% of all global imports. The trade remains one of the least regulated global industries, with pervasive corruption and minimal end-use accountability.",
    pct: 9.2,
    src: "SIPRI Trends in International Arms Transfers 2025 (March 2026)",
    url: "https://www.sipri.org/publications/2026/sipri-fact-sheets/trends-international-arms-transfers-2025",
  },
  {
    tag: "Full Economic Cost",
    amt: "$21.8T",
    amtB: 21810,
    name: "Total Impact of Violence",
    sum: "The full global economic impact of violence reached $21.81 trillion in 2025, 10.5% of global GDP, about $2,650 for every person alive.",
    detail:
      "The Institute for Economics & Peace model covers conflict containment (military, police, courts, prisons), direct losses from conflict, and the opportunity cost of misallocated resources. Military expenditure alone accounts for $9.5T of the model, its largest single-year increase since the Index began. In the ten countries most affected by violence, the economic cost averages 23.4% of GDP.",
    pct: 100,
    src: "IEP Global Peace Index 2026",
    url: "https://www.visionofhumanity.org/economic-impact-of-violence/",
  },
];

/* ── TOP MILITARY SPENDERS 2025 (SIPRI, April 2026) ──────────────── */
const topSpenders = [
  { name: "United States", amt: 954, gdp: 3.2, change: "−7.5%" },
  { name: "China", amt: 336, gdp: 1.7, change: "+7.4%" },
  { name: "Russia", amt: 190, gdp: 7.5, change: "+5.9%" },
  { name: "Germany", amt: 114, gdp: 2.3, change: "+24%" },
  { name: "India", amt: 92.1, gdp: 2.3, change: "+8.9%" },
  { name: "United Kingdom", amt: 89, gdp: 2.3, change: "−2.0%" },
  { name: "Ukraine", amt: 84.1, gdp: 40.0, change: "+20%" },
  { name: "Saudi Arabia", amt: 83.2, gdp: 6.5, change: "+1.4%" },
  { name: "France", amt: 68, gdp: 2.1, change: "+1.5%" },
  { name: "Japan", amt: 62.2, gdp: 1.4, change: "+9.7%" },
];

/* ── CHAPTER 02 · THE DESTRUCTION — what war breaks ──────────────── */
const destructionData = [
  {
    tag: "Ukraine",
    amt: "$588B",
    amtB: 588,
    name: "Rebuilding Ukraine",
    sum: "The bill to rebuild Ukraine reached $588 billion, nearly three times the country's entire annual GDP.",
    detail:
      "The Fifth Rapid Damage and Needs Assessment (World Bank / UN / EU / Ukraine, February 2026) records over $195B in direct physical damage. Reconstruction needs: transport $96B, energy $91B, housing $90B, commerce and industry $63B, agriculture $55B. Ukraine was also the world's deadliest conflict in 2025, with almost 78,000 fatalities recorded.",
    pct: 20,
    src: "Ukraine RDNA5 · World Bank / UN / EU (February 2026)",
    url: "https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released",
  },
  {
    tag: "Gaza",
    amt: "$71.4B",
    amtB: 71.4,
    name: "Rebuilding Gaza",
    sum: "Recovery and reconstruction in Gaza is estimated at $71.4 billion. The UN calculates human development has been set back 77 years.",
    detail:
      "The final Gaza Rapid Damage and Needs Assessment (EU / UN / World Bank, April 2026): 371,888 housing units destroyed or damaged, more than half of hospitals non-functional, nearly every school destroyed or damaged, the economy contracted by 84%. $26.3B is needed in the first 18 months alone to restore essential services.",
    pct: 2.5,
    src: "Gaza RDNA · EU / UN / World Bank (April 2026)",
    url: "https://news.un.org/en/story/2026/04/1167336",
  },
  {
    tag: "Post-9/11 Legacy",
    amt: "$8T+",
    amtB: 8000,
    name: "The War on Terror",
    sum: "Total US post-9/11 war spending exceeds $8 trillion, before counting $2.2 trillion in future care for veterans.",
    detail:
      "Brown University's Costs of War project estimates 4.5–4.7 million deaths attributable to post-9/11 wars, including indirect deaths from disease and destroyed infrastructure. The conflicts produced the largest refugee flows since WWII and contributed directly to the rise of new armed groups. The bills continue decades after the wars end.",
    pct: 100,
    src: "Brown University Costs of War Project",
    url: "https://watson.brown.edu/costsofwar",
  },
  {
    tag: "Military Emissions",
    amt: "~5.5%",
    amtB: 500,
    name: "The Climate Cost",
    sum: "The world's militaries produce an estimated 5.5% of global greenhouse gas emissions, more than civil aviation and shipping combined.",
    detail:
      "If the global military were a country, it would have the fourth-largest carbon footprint on Earth. Military emissions remain systematically excluded from international climate agreements. Wars also destroy ecosystems, contaminate water sources, and push displaced communities into environmental vulnerability for generations.",
    pct: 17,
    src: "Scientists for Global Responsibility / CEOBS",
    url: "https://www.sgr.org.uk/resources/hidden-carbon-cost-military",
  },
];

/* ── CHAPTER 03 · THE DISPLACED — flight and abandonment ─────────── */
const displacedStats = {
  displaced: 117.8, // million, end of 2025 (UNHCR Global Trends, June 2026)
  ratio: 70, // 1 in every 70 people on Earth
  refugees: 41.6, // million
  internal: 68.7, // million IDPs
  returns: 14.7, // million returned in 2025 — first decline in a decade
  inNeed: 240, // million needing humanitarian assistance (OCHA GHO 2026)
  appeal: 33, // $B asked for 2026
  received2025: 12, // $B actually received in 2025 — lowest in a decade
  targetPeople: 135, // million people the 2026 appeal aims to reach
};

/* Categories for the multi-colour displacement field (UNHCR, end 2025).
   Splits the 117.8M total into who fled abroad vs who is trapped at home. */
const displacementBreakdown = [
  {
    label: "Fled their country (refugees & asylum-seekers)",
    millions: 49.1,
    color: "#00e5ff",
  },
  {
    label: "Displaced inside their own country",
    millions: 68.7,
    color: "#4f7cff",
  },
];

/* ── CHAPTER 04 · THE HUMAN COST — what no budget can hold ───────── */
const humanData = [
  {
    num: "244,700",
    unit: "people killed in armed conflict in the last year",
    body: "ACLED recorded over 205,400 violent events between November 2024 and November 2025, the deadliest year in its records. Deaths from conflict have risen six-fold since 2008. That is one life ended by war roughly every two minutes.",
    src: "ACLED Conflict Index 2025",
    url: "https://acleddata.com/series/acled-conflict-index",
  },
  {
    num: "1 in 6",
    unit: "people on Earth were exposed to conflict in 2025",
    body: "Seventeen percent of humanity lived within reach of armed violence this year. For more than a billion people, war is not a news story. It is the sound outside.",
    src: "ACLED Conflict Index 2025",
    url: "https://acleddata.com/series/acled-conflict-index",
  },
  {
    num: "11,967",
    unit: "children killed or maimed in a single year",
    body: "The UN verified 41,370 grave violations against children in 2024, a 25% increase, the third consecutive record year. Recruitment as soldiers, sexual violence, attacks on their schools and hospitals. These are only the cases the UN could verify. The real numbers are higher.",
    src: "UN Children and Armed Conflict Report 2025",
    url: "https://news.un.org/en/story/2025/06/1164646",
  },
  {
    num: "117.8M",
    unit: "people forcibly displaced from their homes",
    body: "One in every 70 human beings is displaced by persecution, conflict, or violence. 2025 brought the first decline in ten years as 14.7 million people finally went home, many to rubble. Displacement does not end when the moving stops; it echoes through generations.",
    src: "UNHCR Global Trends 2026",
    url: "https://www.unhcr.org/global-trends",
  },
  {
    num: "4.5M+",
    unit: "deaths attributable to the post-9/11 wars alone",
    body: "Beyond those killed in combat: deaths from destroyed hospitals, contaminated water, broken food systems, and disease. Children raised in conflict zones carry measurably higher rates of PTSD, anxiety, and developmental delay for the rest of their lives. The full psychological cost of war propagates across generations. It has no line in any budget.",
    src: "Brown University Costs of War Project",
    url: "https://watson.brown.edu/costsofwar",
  },
];

/* ── CHAPTER 05 · THE CHOICE — annual investment gaps (SDGs) ─────── */
const issueData = [
  {
    sdg: "SDG 2",
    name: "Zero Hunger",
    cost: 40,
    color: "#f5a623",
    sum: "673 million people faced hunger in 2024. Around $40 billion a year would end it by 2030.",
    detail:
      "The FAO's SOFI report estimates 638 to 720 million people undernourished. UN/FAO and Ceres2030 research puts the additional investment needed to end hunger by 2030 at roughly $37 to 50 billion a year, covering agricultural support, social protection and emergency aid. Former WFP head David Beasley named $40 billion. Hunger is rising sharply across Africa and western Asia.",
    src: "FAO SOFI + Ceres2030 + UN WFP",
    url: "https://www.fao.org/publications/fao-flagship-publications/the-state-of-food-security-and-nutrition-in-the-world/en",
  },
  {
    sdg: "SDG 3",
    name: "Global Health",
    cost: 371,
    color: "#00e5ff",
    sum: "4.5 billion people lack full access to essential health services. 2 billion face financial hardship paying for care.",
    detail:
      "WHO's universal health coverage scenario requires 23 million new health workers and 415,000 new facilities. 85% of costs can be met domestically, but the poorest nations face a combined external financing gap of $54B+/year.",
    src: "WHO SDG 3 Financing Study (Stenberg et al.)",
    url: "https://www.who.int/publications/i/item/9789241513326",
  },
  {
    sdg: "SDG 4",
    name: "Quality Education",
    cost: 100,
    color: "#b967ff",
    sum: "272 million children and youth are out of school, rising for the seventh year in a row.",
    detail:
      "UNESCO's 2025 dashboard counts 272 million out-of-school children, up 21 million on the previous estimate. Low-income countries spend $55 per learner per year; high-income countries spend $8,543. UNESCO estimates educational gaps cost the global economy $10 trillion a year, and a ~$100B/year investment gap to deliver quality education for all.",
    src: "UNESCO Global Education Monitoring 2025",
    url: "https://www.unesco.org/en/articles/more-children-out-school-7th-year-row-273-million",
  },
  {
    sdg: "SDG 5",
    name: "Gender Equality",
    cost: 360,
    color: "#ff67b9",
    sum: "At the current pace, full legal gender parity will not arrive until the 2070s.",
    detail:
      "UN Women estimates $360B/year for meaningful gender equality, legal reform, education access, economic inclusion, reproductive health, and ending gender-based violence. Women and girls bear a disproportionate and largely invisible share of every war's costs.",
    src: "UN Women Beijing+30 Financing Report",
    url: "https://www.unwomen.org/en",
  },
  {
    sdg: "SDG 6",
    name: "Clean Water",
    cost: 114,
    color: "#4488ff",
    sum: "2.2 billion people lack safe drinking water. 3.5 billion lack safely managed sanitation.",
    detail:
      "OECD and WHO estimate $114B/year in additional investment closes the global water and sanitation gap by 2030. Waterborne disease kills more children annually than armed conflict. Water stress is among the most reliable predictors of future conflict.",
    src: "OECD / WHO GLAAS Water Financing Report",
    url: "https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health",
  },
  {
    sdg: "SDG 7",
    name: "Clean Energy",
    cost: 35,
    color: "#f5d623",
    sum: "~675 million people have no electricity. Renewables are now the cheapest new power source in most of the world.",
    detail:
      "The IEA estimates just $35B/year in targeted additional investment achieves universal energy access by 2030. The barrier is not technology, it is finance. Countries without reliable electricity cannot build the economic base to invest in any other goal.",
    src: "IEA World Energy Outlook",
    url: "https://www.iea.org/reports/world-energy-outlook-2024",
  },
  {
    sdg: "SDG 8",
    name: "Decent Work",
    cost: 50,
    color: "#00ff88",
    sum: "160 million children remain in child labour. 21 million people in forced labour.",
    detail:
      "The ILO estimates $50B/year in social protection and labour reform would end child labour and forced labour by 2030. Youth unemployment is highest in conflict-affected regions, a direct structural pathway to radicalisation. Decent work is the most effective long-term conflict prevention.",
    src: "ILO World Employment and Social Outlook",
    url: "https://www.ilo.org/global/research/global-reports/weso/en/",
  },
  {
    sdg: "SDG 9",
    name: "Infrastructure",
    cost: 150,
    color: "#88aaff",
    sum: "2.6 billion people lack reliable internet. Billions lack basic transport, energy, and industrial infrastructure.",
    detail:
      "UNCTAD estimates $150B+/year in infrastructure investment for developing nations bridges the connectivity gap and enables growth. Without infrastructure, no other development goal is achievable at scale.",
    src: "UNCTAD Technology and Innovation Report",
    url: "https://unctad.org/publication/technology-and-innovation-report-2023",
  },
  {
    sdg: "SDG 10",
    name: "Reduce Inequality",
    cost: 150,
    color: "#a0ff00",
    sum: "The richest 1% own more wealth than the bottom 50% of humanity combined.",
    detail:
      "World Bank and Oxfam models indicate $150B/year in social protection floors, progressive redistribution mechanisms, and tax-reform support can materially reduce extreme inequality in developing nations, and the conditions that make conflict inevitable.",
    src: "Oxfam Inequality Report + World Bank",
    url: "https://www.worldbank.org/en/topic/poverty/overview",
  },
  {
    sdg: "SDG 11",
    name: "End Homelessness",
    cost: 200,
    color: "#00ffcc",
    sum: "300 million people have no stable shelter. 1.1 billion live in slums or informal settlements.",
    detail:
      "UN-Habitat estimates $200B/year for a serious global push on affordable housing, building 100,000 new homes every day. Housing precarity is heavily concentrated in post-conflict zones. Stable shelter is the foundation of every other human development indicator.",
    src: "UN-Habitat World Cities Report",
    url: "https://unhabitat.org/wcr",
  },
  {
    sdg: "SDG 13",
    name: "Climate Action",
    cost: 1000,
    color: "#ff6b35",
    sum: "The 1.5°C threshold has been breached. Developing nations need $1.3T/year in external climate finance by 2035, they received $116B.",
    detail:
      "At COP29, nations agreed developed countries should mobilise $300B/year by 2035, less than a quarter of what developing countries say they need. The public-finance gap governments must fill is approximately $1T/year. Climate change is a threat multiplier for every other crisis on this list, hunger, conflict, and displacement most of all.",
    src: "IPCC AR6 + COP29 NCQG + WRI",
    url: "https://www.wri.org/insights/ncqg-climate-finance-goals-explained",
  },
  {
    sdg: "SDG 14",
    name: "Ocean Health",
    cost: 50,
    color: "#0088ff",
    sum: "Over a third of fish stocks are at unsustainable levels. Oceans absorb 90% of excess planetary heat.",
    detail:
      "A $50B/year global ocean fund establishes meaningful marine protected areas, ends destructive fishing subsidies, addresses plastic pollution, and funds coral restoration. The ocean generates $2.5T/year in economic value and produces half the oxygen we breathe.",
    src: "High Level Panel for a Sustainable Ocean Economy",
    url: "https://oceanpanel.org",
  },
  {
    sdg: "SDG 15",
    name: "Biodiversity",
    cost: 200,
    color: "#44ff88",
    sum: "1 million species face extinction. Species are being lost up to 1,000× faster than natural rates.",
    detail:
      "IUCN and IPBES estimate $200B/year halts and begins to reverse biodiversity collapse. Meanwhile, harmful subsidies to nature-destructive industries total $1.8T/year, nine times what conservation receives. Biodiversity collapse undermines every food and water system on Earth.",
    src: "IPBES Global Assessment + IUCN",
    url: "https://ipbes.net/global-assessment",
  },
  {
    sdg: "SDG 16",
    name: "Peace & Justice",
    cost: 80,
    color: "#cc88ff",
    sum: "Conflict drives every other crisis on this list. Preventing it is 16× cheaper than responding to it.",
    detail:
      "$80B/year in targeted peacebuilding, institutional reform, anti-corruption, and access to justice would materially reduce new conflicts starting. The cruel irony: money spent here reduces the need for every other investment on this page. The IEP estimates successful diplomacy preventing a single major war is worth trillions.",
    src: "IEP Economics of Peace + UN Peacebuilding Fund",
    url: "https://www.visionofhumanity.org",
  },
];

/* ── COUNTRY MILITARY SPENDING ────────────────────────────────────
   Top 10 verified against SIPRI April 2026 (2025 figures).
   Others: SIPRI Military Expenditure Database estimates.
   Format: [name, ISO, $B spend, % GDP, population M, contact URL] */
const countryData = [
  [
    "United States",
    "US",
    954,
    3.2,
    340,
    "https://www.contactingthecongress.org",
  ],
  ["China", "CN", 336, 1.7, 1410, "https://www.npc.gov.cn/"],
  ["Russia", "RU", 190, 7.5, 144, "https://government.ru/en/"],
  ["Germany", "DE", 114, 2.3, 84, "https://www.bundestag.de/en/members"],
  ["India", "IN", 92, 2.3, 1428, "https://www.mygov.in/"],
  ["United Kingdom", "GB", 89, 2.3, 68, "https://writetothem.com"],
  ["Ukraine", "UA", 84, 40.0, 38, "https://www.president.gov.ua/"],
  ["Saudi Arabia", "SA", 83, 6.5, 37, "https://www.my.gov.sa/"],
  ["France", "FR", 68, 2.1, 68, "https://www.assemblee-nationale.fr/"],
  ["Japan", "JP", 62, 1.4, 124, "https://www.shugiin.go.jp/"],
  ["South Korea", "KR", 47, 2.6, 52, "https://www.assembly.go.kr/"],
  ["Poland", "PL", 38, 4.2, 38, "https://www.sejm.gov.pl/"],
  ["Italy", "IT", 38, 1.7, 59, "https://www.camera.it/"],
  [
    "Australia",
    "AU",
    34,
    2.0,
    26,
    "https://www.aph.gov.au/senators_and_members",
  ],
  ["Canada", "CA", 30, 1.4, 40, "https://www.ourcommons.ca/"],
  ["Israel", "IL", 30, 5.2, 10, "https://www.knesset.gov.il/"],
  ["Netherlands", "NL", 24, 1.9, 18, "https://www.tweedekamer.nl/"],
  ["Turkey", "TR", 23, 1.9, 85, "https://www.tbmm.gov.tr/"],
  ["Spain", "ES", 21, 1.4, 48, "https://www.congreso.es/"],
  ["Brazil", "BR", 20, 1.0, 216, "https://www.camara.leg.br/"],
  ["Taiwan", "TW", 18.2, 2.5, 23, "https://www.ly.gov.tw/"],
  ["UAE", "AE", 19, 4.5, 10, "https://www.uaecabinet.ae/"],
  ["Algeria", "DZ", 18, 5.6, 45, "https://www.apn.dz/"],
  ["Singapore", "SG", 13, 2.8, 6, "https://www.parliament.gov.sg/"],
  ["Sweden", "SE", 13, 1.7, 11, "https://www.riksdagen.se/"],
  ["Pakistan", "PK", 11, 2.7, 240, "https://www.na.gov.pk/"],
  ["Norway", "NO", 11, 1.9, 6, "https://www.stortinget.no/"],
  ["Indonesia", "ID", 10, 0.7, 278, "https://www.dpr.go.id/"],
  ["Iran", "IR", 10, 2.1, 89, "https://en.parliran.ir/"],
  ["Mexico", "MX", 9, 0.6, 128, "https://www.diputados.gob.mx/"],
  ["Vietnam", "VN", 8, 2.3, 99, "https://quochoi.vn/"],
  ["Greece", "GR", 8, 2.5, 10, "https://www.hellenicparliament.gr/"],
  ["Denmark", "DK", 8, 2.0, 6, "https://www.ft.dk/"],
  ["Finland", "FI", 7, 2.3, 6, "https://www.eduskunta.fi/"],
  ["Thailand", "TH", 7, 1.3, 72, "https://www.parliament.go.th/"],
  ["Belgium", "BE", 7, 1.3, 12, "https://www.dekamer.be/"],
  ["Romania", "RO", 7, 2.0, 19, "https://www.cdep.ro/"],
  ["Switzerland", "CH", 6, 0.8, 9, "https://www.parlament.ch/"],
  ["Kuwait", "KW", 6, 5.0, 4, "https://www.kna.kw/"],
  ["Qatar", "QA", 5, 3.7, 3, "https://www.shura.qa/"],
  ["Oman", "OM", 5, 5.2, 5, "https://www.majlisalshura.om/"],
  ["Chile", "CL", 5, 1.8, 20, "https://www.congreso.cl/"],
  ["Morocco", "MA", 5, 3.7, 38, "https://www.chambredesrepresentants.ma/"],
  ["Czech Republic", "CZ", 5, 1.6, 11, "https://www.psp.cz/"],
  ["Portugal", "PT", 4, 1.5, 10, "https://www.parlamento.pt/"],
  ["Iraq", "IQ", 4, 1.8, 44, "https://parliament.iq/"],
  ["Philippines", "PH", 4, 1.0, 116, "https://www.congress.gov.ph/"],
  ["Malaysia", "MY", 4, 1.1, 34, "https://www.parlimen.gov.my/"],
  ["Bangladesh", "BD", 4, 1.0, 172, "https://www.parliament.gov.bd/"],
  ["Argentina", "AR", 4, 0.6, 46, "https://www.congreso.gob.ar/"],
  ["Colombia", "CO", 4, 1.0, 52, "https://www.congreso.gov.co/"],
  ["New Zealand", "NZ", 4, 1.3, 5, "https://www.parliament.nz/en/"],
  ["Austria", "AT", 4, 0.9, 9, "https://www.parlament.gv.at/"],
  ["Hungary", "HU", 3, 1.7, 10, "https://www.parlament.hu/"],
  ["Peru", "PE", 3, 1.2, 34, "https://www.congreso.gob.pe/"],
  ["Nigeria", "NG", 3, 0.6, 223, "https://www.nassnig.org/"],
  ["South Africa", "ZA", 3, 0.8, 60, "https://www.parliament.gov.za/"],
  ["Azerbaijan", "AZ", 3, 5.0, 10, "https://www.meclis.gov.az/"],
  ["North Korea", "KP", 3, 20.0, 26, ""],
  ["Kazakhstan", "KZ", 2, 0.9, 20, "https://www.parlam.kz/"],
  ["Bulgaria", "BG", 2, 2.0, 7, "https://www.parliament.bg/"],
  ["Serbia", "RS", 2, 3.5, 7, "https://www.parlament.rs/"],
  ["Lithuania", "LT", 2, 2.8, 3, "https://www.lrs.lt/"],
  ["Slovakia", "SK", 2, 1.7, 5, "https://www.nrsr.sk/"],
  ["Ireland", "IE", 2, 0.4, 5, "https://www.oireachtas.ie/"],
  ["Jordan", "JO", 2, 4.5, 11, "https://parliament.jo/"],
  ["Myanmar", "MM", 2, 3.5, 54, ""],
  ["Tunisia", "TN", 1, 2.5, 12, "https://www.arp.tn/"],
  ["Kenya", "KE", 1, 1.2, 55, "https://www.parliament.go.ke/"],
  ["Ethiopia", "ET", 1, 0.7, 127, "https://www.parlam.gov.et/"],
  ["Sri Lanka", "LK", 1, 1.7, 22, "https://www.parliament.lk/"],
  ["Croatia", "HR", 1, 1.8, 4, "https://www.sabor.hr/"],
  ["Latvia", "LV", 1, 3.2, 2, "https://www.saeima.lv/"],
  ["Estonia", "EE", 1, 3.4, 1.4, "https://www.riigikogu.ee/"],
  ["Georgia", "GE", 1, 2.5, 4, "https://parliament.ge/"],
  ["Bahrain", "BH", 1, 4.0, 1.5, ""],
  ["Uruguay", "UY", 1, 2.0, 3.4, "https://parlamento.gub.uy/"],
  ["Ecuador", "EC", 1, 0.9, 18, "https://www.asambleanacional.gob.ec/"],
  ["Angola", "AO", 1, 1.6, 36, ""],
  ["Uzbekistan", "UZ", 1, 1.2, 36, ""],
  ["Belarus", "BY", 1, 2.5, 9, ""],
  ["Syria", "SY", 1, 6.5, 23, ""],
  ["Armenia", "AM", 0.8, 4.0, 3, "https://www.parliament.am/"],
  ["Bolivia", "BO", 0.7, 1.0, 12, "https://www.asamblea.gob.bo/"],
  ["Ivory Coast", "CI", 0.7, 1.5, 28, ""],
  ["Venezuela", "VE", 0.8, 0.5, 28, ""],
  ["Yemen", "YE", 0.6, 8.5, 34, ""],
  ["Cambodia", "KH", 0.6, 2.0, 17, ""],
  ["Mali", "ML", 0.6, 4.0, 23, ""],
  ["Tanzania", "TZ", 0.6, 1.2, 67, "https://www.parliament.go.tz/"],
  ["Libya", "LY", 0.6, 2.5, 7, ""],
  ["Dominican Republic", "DO", 0.6, 0.7, 11, ""],
  ["Lebanon", "LB", 0.5, 3.2, 5, ""],
  ["Uganda", "UG", 0.5, 1.5, 49, "https://www.parliament.go.ug/"],
  ["Cameroon", "CM", 0.5, 1.5, 28, ""],
  ["Namibia", "NA", 0.5, 3.0, 3, "https://www.parliament.gov.na/"],
  ["Nepal", "NP", 0.5, 1.0, 31, "https://www.parliament.gov.np/"],
  ["Luxembourg", "LU", 0.5, 0.8, 0.7, "https://www.chd.lu/"],
  ["South Sudan", "SS", 0.4, 8.0, 11, ""],
  ["Burkina Faso", "BF", 0.4, 3.5, 23, ""],
  ["Sudan", "SD", 0.4, 1.2, 49, ""],
  ["Guatemala", "GT", 0.4, 0.5, 18, "https://www.congreso.gob.gt/"],
  ["Botswana", "BW", 0.4, 2.0, 2.6, "https://www.parliament.gov.bw/"],
  ["Brunei", "BN", 0.4, 3.5, 0.5, ""],
  ["Cyprus", "CY", 0.4, 1.6, 1.3, ""],
  ["Gabon", "GA", 0.3, 2.0, 2.4, ""],
  ["Senegal", "SN", 0.3, 1.0, 18, "https://www.assemblee-nationale.sn/"],
  ["Rwanda", "RW", 0.3, 1.5, 14, "https://www.parliament.gov.rw/"],
  ["Zimbabwe", "ZW", 0.3, 1.5, 16, "https://www.parlzim.gov.zw/"],
  ["Niger", "NE", 0.3, 2.5, 27, ""],
  ["Chad", "TD", 0.3, 2.5, 18, ""],
  ["Honduras", "HN", 0.3, 0.9, 10, ""],
  ["DR Congo", "CD", 0.3, 0.6, 102, ""],
  ["Ghana", "GH", 0.3, 0.8, 34, "https://parliament.gh/"],
  ["Mozambique", "MZ", 0.2, 1.0, 34, ""],
  ["Zambia", "ZM", 0.2, 1.0, 20, "https://www.parliament.gov.zm/"],
  ["Mauritania", "MR", 0.2, 2.5, 5, ""],
  ["El Salvador", "SV", 0.2, 0.6, 6, ""],
  ["Tajikistan", "TJ", 0.2, 2.0, 10, ""],
  ["Eritrea", "ER", 0.2, 10.0, 3.7, ""],
  ["Laos", "LA", 0.2, 1.0, 8, ""],
  ["Papua New Guinea", "PG", 0.2, 0.5, 10, "https://www.parliament.gov.pg/"],
  ["Cuba", "CU", 0.2, 0.5, 11, ""],
  ["Nicaragua", "NI", 0.1, 0.4, 7, ""],
  ["Somalia", "SO", 0.1, 2.0, 18, ""],
  ["Afghanistan", "AF", 0.1, 0.5, 42, ""],
  ["Madagascar", "MG", 0.1, 0.7, 30, ""],
  ["Malawi", "MW", 0.1, 0.9, 21, "https://www.parliament.gov.mw/"],
  ["Mongolia", "MN", 0.1, 0.8, 3.4, "https://www.parliament.mn/"],
  ["Moldova", "MD", 0.1, 0.7, 2.5, "https://www.parlament.md/"],
  ["Kyrgyzstan", "KG", 0.1, 1.5, 7, ""],
  ["Jamaica", "JM", 0.1, 0.5, 2.8, "https://japarliament.gov.jm/"],
  ["Palestine", "PS", 0.1, 1.5, 5.5, ""],
  ["Benin", "BJ", 0.1, 1.2, 14, ""],
  ["Togo", "TG", 0.08, 1.5, 9, ""],
  ["Burundi", "BI", 0.07, 2.0, 13, ""],
  ["Guyana", "GY", 0.07, 0.8, 0.8, ""],
  ["Maldives", "MV", 0.06, 1.5, 0.5, ""],
  ["Haiti", "HT", 0.05, 0.3, 12, ""],
  ["Fiji", "FJ", 0.05, 1.0, 0.9, "https://www.parliament.gov.fj/"],
  ["Djibouti", "DJ", 0.05, 3.5, 1.1, ""],
  ["Iceland", "IS", 0.04, 0.1, 0.4, "https://www.althingi.is/"],
  ["Central African Rep.", "CF", 0.04, 2.0, 5.7, ""],
  ["Mauritius", "MU", 0.04, 0.4, 1.3, ""],
  ["Liberia", "LR", 0.03, 0.6, 5.4, ""],
  ["Sierra Leone", "SL", 0.03, 0.5, 8.6, ""],
  ["Timor-Leste", "TL", 0.03, 1.0, 1.3, ""],
  ["Gambia", "GM", 0.02, 0.8, 2.7, ""],
  ["Suriname", "SR", 0.02, 0.5, 0.6, ""],
  ["Seychelles", "SC", 0.02, 1.2, 0.1, ""],
  ["Bhutan", "BT", 0.02, 0.5, 0.8, ""],
  ["Vanuatu", "VU", 0.01, 1.0, 0.3, ""],
  ["Malta", "MT", 0.1, 0.6, 0.5, ""],
  ["Samoa", "WS", 0.005, 0.5, 0.2, ""],
];

/* ═══════════════════════════════════════════════════════════════════
   REVISION 3 DATASETS
   ═══════════════════════════════════════════════════════════════════ */

/* ── WHERE THE $21.8T COMES FROM — IEP model components ────────────
   Percentages from the IEP Global Peace Index economic-impact model
   (military 45%, internal security 29%, etc.), applied to the $21.81T
   total. This is what the figure is actually made of. */
const violenceBreakdown = [
  { label: "Military expenditure", pct: 45, color: "#ff2d2d" },
  { label: "Internal security (police, justice, prisons)", pct: 29, color: "#ff6b35" },
  { label: "Private security", pct: 8, color: "#f5852a" },
  { label: "Homicide", pct: 6, color: "#f5a623" },
  { label: "Suicide", pct: 4, color: "#b9606a" },
  { label: "Armed conflict, terrorism & losses", pct: 8, color: "#8b0000" },
];

/* ── CONFLICT COSTS — reconstruction / damage estimates ($B) ───────
   Strongest available sourced figures. Mix of damage and reconstruction
   needs, framed clearly in the UI. */
const conflictCosts = [
  { name: "Ukraine", amtB: 588, note: "10-yr reconstruction need · ~3× its GDP", src: "World Bank RDNA5 2026", url: "https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released" },
  { name: "Syria", amtB: 400, note: "Reconstruction estimate after 14 years of war", src: "UN / ESCWA", url: "https://www.unescwa.org/" },
  { name: "Iraq", amtB: 88, note: "Post-ISIS reconstruction need (2018)", src: "World Bank", url: "https://www.worldbank.org/en/country/iraq" },
  { name: "Gaza", amtB: 71.4, note: "Recovery & reconstruction · development set back 77 yrs", src: "EU / UN / World Bank RDNA 2026", url: "https://news.un.org/en/story/2026/04/1167336" },
  { name: "Yemen", amtB: 90, note: "Cumulative economic loss from a decade of war", src: "UNDP", url: "https://www.undp.org/yemen" },
  { name: "Sudan", amtB: 100, note: "Estimated damage since the 2023 war · world's largest displacement crisis", src: "UN / World Bank", url: "https://www.unocha.org/sudan" },
];

/* ── ENVIRONMENTAL & SYSTEMIC FACTS OF WAR ─────────────────────────── */
const envFacts = [
  { fig: "5.5%", lbl: "of all global greenhouse-gas emissions come from the world's militaries, more than civil aviation and shipping combined.", src: "SGR / CEOBS", url: "https://www.sgr.org.uk/resources/hidden-carbon-cost-military" },
  { fig: "4th", lbl: "if the world's militaries were a single country, they would be the fourth-largest carbon emitter on Earth.", src: "CEOBS", url: "https://ceobs.org/" },
  { fig: "~0%", lbl: "of military emissions are subject to mandatory reporting under the Paris Agreement. They are largely exempt.", src: "CEOBS / UNFCCC", url: "https://ceobs.org/" },
];

/* ── EXTRA HUMAN-IMPACT FIGURES (visualised) ───────────────────────── */
const humanImpactExtra = {
  civilianShare: 90, // % of casualties from explosive weapons in populated areas that are civilians (AOAV/UN)
  childrenDisplaced: 45, // million children among the 117.8M displaced (UNHCR, 38%)
  childrenPct: 38,
};

/* ── PER-COUNTRY MILITARY-SPENDING TREND (YoY % change, 2025) ───────
   Sourced for major spenders (SIPRI 2026). Used for the country trend
   indicator; countries without an entry show the global trend (rising). */
const countryTrend = {
  "United States": -7.5, China: 7.4, Russia: 5.9, Germany: 24, India: 8.9,
  "United Kingdom": -2.0, Ukraine: 20, "Saudi Arabia": 1.4, France: 1.5,
  Japan: 9.7, Poland: 31, Taiwan: 14, "South Korea": 4, Italy: 8,
  Australia: 6, Israel: 9, Netherlands: 18, Sweden: 12, Spain: 12,
  Canada: 9, Belgium: 11, Romania: 15, Lithuania: 20, Estonia: 18,
  Latvia: 19, Finland: 10, Denmark: 15, Norway: 10, Greece: 5,
};
const GLOBAL_TREND = 9.4; // world ex-US grew 9.2-9.4% (SIPRI 2026)

/* ── SEEDED COALITION PRIORITY DATA (placeholder until backend) ─────
   A plausible global distribution of how people prioritise the 14 issues,
   as share of votes. Replaced by live data once the backend is wired
   (see README). issueData index → weight. */
const seededPriorityWeights = [
  82, 74, 88, 41, 69, 47, 35, 38, 44, 52, 95, 33, 58, 71,
]; // by issueData index: hunger, health, education, gender, water, energy, work, infra, inequality, homeless, climate, ocean, biodiversity, peace

